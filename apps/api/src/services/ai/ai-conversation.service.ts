/**
 * AI Conversation Service
 *
 * Manages persistent storage of AI coaching conversations.
 * Provides CRUD operations for conversation history.
 */

import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../core/db/prisma';

const prisma = getPrismaClient();

// Types
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolsUsed?: string[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  messageCount: number;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDetails {
  id: string;
  playerId: string;
  title: string | null;
  messages: ConversationMessage[];
  context: Record<string, unknown> | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  toolsUsed: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper for safe JSON casting
function parseMessages(json: Prisma.JsonValue): ConversationMessage[] {
  if (!json || !Array.isArray(json)) return [];
  return json as unknown as ConversationMessage[];
}

function parseContext(json: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  return json as unknown as Record<string, unknown>;
}

function messagesToJson(messages: ConversationMessage[]): Prisma.InputJsonValue {
  return messages as unknown as Prisma.InputJsonValue;
}

class AIConversationService {
  /**
   * Get all conversations for a player
   */
  async getPlayerConversations(
    playerId: string,
    options: { limit?: number; includeInactive?: boolean } = {}
  ): Promise<ConversationSummary[]> {
    const { limit = 20, includeInactive = false } = options;

    const conversations = await prisma.aIConversation.findMany({
      where: {
        playerId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return conversations.map(c => {
      const messages = parseMessages(c.messages);
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

      return {
        id: c.id,
        title: c.title,
        messageCount: messages.length,
        lastMessage: lastUserMessage?.content.slice(0, 100) || '',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(
    conversationId: string,
    playerId: string
  ): Promise<ConversationDetails | null> {
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        playerId, // Ensure player owns this conversation
      },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      playerId: conversation.playerId,
      title: conversation.title,
      messages: parseMessages(conversation.messages),
      context: parseContext(conversation.context),
      totalInputTokens: conversation.totalInputTokens,
      totalOutputTokens: conversation.totalOutputTokens,
      toolsUsed: conversation.toolsUsed,
      isActive: conversation.isActive,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    playerId: string,
    initialMessage?: string
  ): Promise<ConversationDetails> {
    const messages: ConversationMessage[] = [];

    if (initialMessage) {
      messages.push({
        role: 'user',
        content: initialMessage,
        timestamp: new Date().toISOString(),
      });
    }

    const conversation = await prisma.aIConversation.create({
      data: {
        playerId,
        messages: messagesToJson(messages),
        title: null, // Will be generated from first messages
      },
    });

    return {
      id: conversation.id,
      playerId: conversation.playerId,
      title: conversation.title,
      messages: parseMessages(conversation.messages),
      context: parseContext(conversation.context),
      totalInputTokens: conversation.totalInputTokens,
      totalOutputTokens: conversation.totalOutputTokens,
      toolsUsed: conversation.toolsUsed,
      isActive: conversation.isActive,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  /**
   * Add a message to an existing conversation
   */
  async addMessage(
    conversationId: string,
    playerId: string,
    message: Omit<ConversationMessage, 'timestamp'>,
    tokenUsage?: { input: number; output: number },
    toolsUsed?: string[]
  ): Promise<ConversationDetails | null> {
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        playerId,
      },
    });

    if (!conversation) return null;

    const messages = parseMessages(conversation.messages);
    messages.push({
      ...message,
      timestamp: new Date().toISOString(),
      toolsUsed,
    });

    // Generate title from first user message if not set
    let title = conversation.title;
    if (!title && messages.length >= 1) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        title = this.generateTitle(firstUserMessage.content);
      }
    }

    // Merge tools used
    const allToolsUsed = new Set([
      ...conversation.toolsUsed,
      ...(toolsUsed || []),
    ]);

    const updated = await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messages: messagesToJson(messages),
        title,
        totalInputTokens: conversation.totalInputTokens + (tokenUsage?.input || 0),
        totalOutputTokens: conversation.totalOutputTokens + (tokenUsage?.output || 0),
        toolsUsed: Array.from(allToolsUsed),
      },
    });

    return {
      id: updated.id,
      playerId: updated.playerId,
      title: updated.title,
      messages: parseMessages(updated.messages),
      context: parseContext(updated.context),
      totalInputTokens: updated.totalInputTokens,
      totalOutputTokens: updated.totalOutputTokens,
      toolsUsed: updated.toolsUsed,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Update conversation title
   */
  async updateTitle(
    conversationId: string,
    playerId: string,
    title: string
  ): Promise<boolean> {
    const result = await prisma.aIConversation.updateMany({
      where: {
        id: conversationId,
        playerId,
      },
      data: { title },
    });

    return result.count > 0;
  }

  /**
   * Archive (soft delete) a conversation
   */
  async archiveConversation(
    conversationId: string,
    playerId: string
  ): Promise<boolean> {
    const result = await prisma.aIConversation.updateMany({
      where: {
        id: conversationId,
        playerId,
      },
      data: { isActive: false },
    });

    return result.count > 0;
  }

  /**
   * Delete a conversation permanently
   */
  async deleteConversation(
    conversationId: string,
    playerId: string
  ): Promise<boolean> {
    const result = await prisma.aIConversation.deleteMany({
      where: {
        id: conversationId,
        playerId,
      },
    });

    return result.count > 0;
  }

  /**
   * Get or create active conversation for a player
   */
  async getOrCreateActiveConversation(
    playerId: string
  ): Promise<ConversationDetails> {
    // Find the most recent active conversation
    const existing = await prisma.aIConversation.findFirst({
      where: {
        playerId,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      return {
        id: existing.id,
        playerId: existing.playerId,
        title: existing.title,
        messages: parseMessages(existing.messages),
        context: parseContext(existing.context),
        totalInputTokens: existing.totalInputTokens,
        totalOutputTokens: existing.totalOutputTokens,
        toolsUsed: existing.toolsUsed,
        isActive: existing.isActive,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      };
    }

    // Create a new conversation
    return this.createConversation(playerId);
  }

  /**
   * Generate a title from message content
   */
  private generateTitle(content: string): string {
    // Take first 50 characters or until first newline
    const firstLine = content.split('\n')[0];
    const truncated = firstLine.slice(0, 50);
    return truncated + (firstLine.length > 50 ? '...' : '');
  }

  /**
   * Get conversation statistics for a player
   */
  async getPlayerStats(playerId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    uniqueToolsUsed: string[];
  }> {
    const conversations = await prisma.aIConversation.findMany({
      where: { playerId },
      select: {
        messages: true,
        totalInputTokens: true,
        totalOutputTokens: true,
        toolsUsed: true,
      },
    });

    const allToolsUsed = new Set<string>();
    let totalMessages = 0;

    conversations.forEach(c => {
      const messages = parseMessages(c.messages);
      totalMessages += messages.length;
      c.toolsUsed.forEach(t => allToolsUsed.add(t));
    });

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalInputTokens: conversations.reduce((sum, c) => sum + c.totalInputTokens, 0),
      totalOutputTokens: conversations.reduce((sum, c) => sum + c.totalOutputTokens, 0),
      uniqueToolsUsed: Array.from(allToolsUsed),
    };
  }
}

// Export singleton
export const aiConversationService = new AIConversationService();
export default aiConversationService;
