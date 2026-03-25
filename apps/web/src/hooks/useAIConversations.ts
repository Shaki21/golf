/**
 * AI Conversations Hooks
 * API integration for AI coach conversations and history
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  inputTokens?: number;
  outputTokens?: number;
  toolsUsed?: string[];
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  totalTokens?: number;
  messages?: AIMessage[];
  _count?: {
    messages: number;
  };
}

export interface AIConversationStats {
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed?: number;
  lastConversationDate?: string;
}

interface ConversationsFilters {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

interface HookOptions {
  autoLoad?: boolean;
}

interface ConversationsResponse {
  conversations: AIConversation[];
  total: number;
}

// ============================================================================
// CONVERSATIONS
// ============================================================================

export function useAIConversations(filters: ConversationsFilters = {}, options: HookOptions = {}) {
  const [data, setData] = useState<ConversationsResponse>({ conversations: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      params.append('limit', (filters.limit || 50).toString());
      params.append('offset', (filters.offset || 0).toString());

      const response = await apiClient.get(`/ai-conversations?${params.toString()}`);
      setData({
        conversations: response.data.data.conversations || [],
        total: response.data.data.total || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load AI conversations');
    } finally {
      setLoading(false);
    }
  }, [filters.isActive, filters.limit, filters.offset]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchConversations();
    }
  }, [fetchConversations, options.autoLoad]);

  return { conversations: data.conversations, total: data.total, loading, error, refetch: fetchConversations };
}

export function useAIConversation(conversationId: string, options: HookOptions = {}) {
  const [data, setData] = useState<AIConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/ai-conversations/${conversationId}`);
      setData(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchConversation();
    }
  }, [fetchConversation, options.autoLoad]);

  return { conversation: data, loading, error, refetch: fetchConversation };
}

export function useActiveAIConversation(options: HookOptions = {}) {
  const [data, setData] = useState<AIConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveConversation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/ai-conversations/active');
      setData(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load active conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchActiveConversation();
    }
  }, [fetchActiveConversation, options.autoLoad]);

  return { conversation: data, loading, error, refetch: fetchActiveConversation };
}

export function useCreateAIConversation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async (data: { title?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/ai-conversations', data);
      return response.data.data as AIConversation;
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createConversation, loading, error };
}

export function useUpdateConversationTitle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.patch(`/ai-conversations/${conversationId}`, { title });
      return response.data.data as AIConversation;
    } catch (err: any) {
      setError(err.message || 'Failed to update conversation title');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateTitle, loading, error };
}

export function useArchiveConversation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.post(`/ai-conversations/${conversationId}/archive`);
    } catch (err: any) {
      setError(err.message || 'Failed to archive conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { archiveConversation, loading, error };
}

export function useDeleteAIConversation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/ai-conversations/${conversationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteConversation, loading, error };
}

export function useAddAIMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback(async (conversationId: string, message: Partial<AIMessage>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/ai-conversations/${conversationId}/messages`, message);
      return response.data.data as AIMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to add message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addMessage, loading, error };
}

// ============================================================================
// STATS
// ============================================================================

export function useAIConversationStats(options: HookOptions = {}) {
  const [data, setData] = useState<AIConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/ai-conversations/stats');
      setData(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchStats();
    }
  }, [fetchStats, options.autoLoad]);

  return { stats: data, loading, error, refetch: fetchStats };
}
