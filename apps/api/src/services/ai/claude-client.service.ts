/**
 * Claude Client Service
 *
 * Provides interface to Anthropic Claude API for AI-powered features.
 * Used for:
 * - AI coaching chat
 * - Training plan recommendations
 * - Performance analysis
 * - Breaking point diagnosis
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ChatOptions {
  system?: string;
  tools?: Tool[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  stopReason: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    input: Record<string, unknown>;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface StreamEvent {
  type: 'text' | 'tool_use_start' | 'tool_use_delta' | 'done' | 'error';
  content?: string;
  toolCall?: {
    id: string;
    name: string;
    input?: Record<string, unknown>;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

class ClaudeClientService {
  private client: Anthropic | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = config.anthropic.enabled;

    if (this.isEnabled && config.anthropic.apiKey) {
      this.client = new Anthropic({
        apiKey: config.anthropic.apiKey,
      });
      console.log('Claude AI client initialized');
    } else {
      console.log('Claude AI client disabled (no API key)');
    }
  }

  /**
   * Check if Claude is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Send a chat message to Claude
   */
  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    if (!this.client) {
      throw new Error('Claude AI is not configured. Set ANTHROPIC_API_KEY.');
    }

    try {
      const response = await this.client.messages.create({
        model: config.anthropic.model,
        max_tokens: options.maxTokens || config.anthropic.maxTokens,
        system: options.system,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        tools: options.tools as Anthropic.Tool[] | undefined,
        temperature: options.temperature,
      });

      // Extract text content
      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      // Extract tool use if any
      const toolCalls = response.content
        .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
        .map(block => ({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        }));

      return {
        content: textContent,
        stopReason: response.stop_reason || 'end_turn',
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  /**
   * Simple one-shot completion
   */
  async complete(
    prompt: string,
    system?: string,
    options: Omit<ChatOptions, 'system'> = {}
  ): Promise<string> {
    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      { ...options, system }
    );
    return response.content;
  }

  /**
   * Stream a chat response
   */
  async *chatStream(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): AsyncGenerator<StreamEvent> {
    if (!this.client) {
      yield { type: 'error', error: 'Claude AI is not configured' };
      return;
    }

    try {
      const stream = await this.client.messages.stream({
        model: config.anthropic.model,
        max_tokens: options.maxTokens || config.anthropic.maxTokens,
        system: options.system,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        tools: options.tools as Anthropic.Tool[] | undefined,
        temperature: options.temperature,
      });

      let inputTokens = 0;
      let outputTokens = 0;

      for await (const event of stream) {
        if (event.type === 'message_start') {
          inputTokens = event.message.usage?.input_tokens || 0;
        } else if (event.type === 'content_block_delta') {
          const delta = event.delta;
          if ('text' in delta) {
            yield { type: 'text', content: delta.text };
          } else if ('partial_json' in delta) {
            yield { type: 'tool_use_delta', content: delta.partial_json };
          }
        } else if (event.type === 'content_block_start') {
          const block = event.content_block;
          if (block.type === 'tool_use') {
            yield {
              type: 'tool_use_start',
              toolCall: { id: block.id, name: block.name },
            };
          }
        } else if (event.type === 'message_delta') {
          outputTokens = event.usage?.output_tokens || 0;
        }
      }

      yield {
        type: 'done',
        usage: { inputTokens, outputTokens },
      };
    } catch (error) {
      console.error('Claude stream error:', error);
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get model info
   */
  getModelInfo(): { model: string; maxTokens: number; enabled: boolean } {
    return {
      model: config.anthropic.model,
      maxTokens: config.anthropic.maxTokens,
      enabled: this.isEnabled,
    };
  }
}

// Export singleton instance
export const claudeClient = new ClaudeClientService();
export default claudeClient;
