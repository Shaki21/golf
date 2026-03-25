/**
 * TIER Golf - AI Coach Service
 *
 * Provides interface to the AI Coach backend API.
 * Handles chat, recommendations, and analysis requests.
 */

import axios, { AxiosInstance } from 'axios';

// =============================================================================
// Types
// =============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context?: {
    currentScreen?: string;
    recentActions?: string[];
  };
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
  relatedTopics?: string[];
  toolsUsed?: string[];
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

export interface StreamCallbacks {
  onText: (text: string) => void;
  onToolUse?: (toolName: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export interface AIStatusResponse {
  available: boolean;
  message: string;
  provider?: string;
}

export interface RecommendationsResponse {
  recommendations: Array<{
    type: 'exercise' | 'focus_area' | 'goal' | 'mental';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable?: {
      type: string;
      id?: string;
    };
  }>;
  summary: string;
}

export interface BreakingPointAnalysis {
  category: string;
  testType: string;
  results: number[];
}

export interface BreakingPointResponse {
  analysis: string;
  recommendations: string[];
  focusAreas: string[];
}

export interface PlanSuggestionRequest {
  playerId: string;
  weeklyHoursTarget?: number;
  focusAreas?: string[];
  goalDescription?: string;
}

export interface PlanSuggestionResponse {
  summary: string;
  suggestedFocus: Array<{
    area: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    suggestedHoursPerWeek: number;
  }>;
  weeklyStructure: {
    recommendedDays: number;
    sessionTypes: Array<{
      type: string;
      frequency: string;
      duration: string;
    }>;
  };
  periodization: {
    baseWeeks: number;
    buildWeeks: number;
    peakWeeks: number;
    rationale: string;
  };
  toolsUsed: string[];
}

// =============================================================================
// Service
// =============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const aiApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/ai`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // AI can take time to respond
});

// Add auth interceptor
aiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================================================================
// API Functions
// =============================================================================

/**
 * Check if AI service is available
 */
export async function checkAIStatus(): Promise<AIStatusResponse> {
  try {
    const response = await aiApi.get<AIStatusResponse>('/status');
    return response.data;
  } catch (error) {
    console.error('[AIService] Status check failed:', error);
    return {
      available: false,
      message: 'AI-tjenesten er midlertidig utilgjengelig',
    };
  }
}

/**
 * Send a chat message to the AI coach
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await aiApi.post<ChatResponse>('/chat', request);
  return response.data;
}

/**
 * Get personalized training recommendations
 */
export async function getRecommendations(): Promise<RecommendationsResponse> {
  const response = await aiApi.get<RecommendationsResponse>('/recommendations');
  return response.data;
}

/**
 * Analyze breaking point data
 */
export async function analyzeBreakingPoint(
  analysis: BreakingPointAnalysis
): Promise<BreakingPointResponse> {
  const response = await aiApi.post<BreakingPointResponse>('/analyze-breaking-point', analysis);
  return response.data;
}

/**
 * Get AI-generated plan suggestions for a player
 */
export async function getPlanSuggestions(
  request: PlanSuggestionRequest
): Promise<PlanSuggestionResponse> {
  const response = await aiApi.post<PlanSuggestionResponse>('/plan-suggestions', request);
  return response.data;
}

/**
 * Send a chat message with streaming response
 * Uses Server-Sent Events (SSE) for real-time text updates
 */
export async function sendChatMessageStream(
  request: ChatRequest,
  callbacks: StreamCallbacks
): Promise<void> {
  const token = localStorage.getItem('auth_token');

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event: StreamEvent = JSON.parse(line.slice(6));

            switch (event.type) {
              case 'text':
                if (event.content) {
                  callbacks.onText(event.content);
                }
                break;
              case 'tool_use_start':
                if (event.toolCall && callbacks.onToolUse) {
                  callbacks.onToolUse(event.toolCall.name);
                }
                break;
              case 'done':
                callbacks.onDone();
                break;
              case 'error':
                callbacks.onError(event.error || 'Unknown streaming error');
                break;
            }
          } catch {
            console.warn('[AIService] Failed to parse SSE event:', line);
          }
        }
      }
    }
  } catch (error) {
    console.error('[AIService] Stream error:', error);
    callbacks.onError(error instanceof Error ? error.message : 'Streaming failed');
  }
}

// =============================================================================
// Conversation Management
// =============================================================================

const CONVERSATION_KEY = 'ai_coach_conversation';
const MAX_CONVERSATION_LENGTH = 20;

/**
 * Get stored conversation history
 */
export function getConversationHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(CONVERSATION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: ChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error('[AIService] Failed to get conversation:', error);
  }
  return [];
}

/**
 * Add message to conversation history
 */
export function addToConversation(message: ChatMessage): void {
  try {
    const history = getConversationHistory();
    history.push(message);

    // Keep only last N messages
    const trimmed = history.slice(-MAX_CONVERSATION_LENGTH);
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('[AIService] Failed to save conversation:', error);
  }
}

/**
 * Clear conversation history
 */
export function clearConversation(): void {
  localStorage.removeItem(CONVERSATION_KEY);
}

// =============================================================================
// Export
// =============================================================================

export const aiService = {
  checkStatus: checkAIStatus,
  chat: sendChatMessage,
  chatStream: sendChatMessageStream,
  getRecommendations,
  analyzeBreakingPoint,
  getPlanSuggestions,
  getConversationHistory,
  addToConversation,
  clearConversation,
};

export default aiService;
