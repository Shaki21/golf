/**
 * useConversations - Hooks for managing conversations and messages
 * TypeScript version with proper types
 *
 * Provides access to:
 * - Conversation list
 * - Conversation details with messages
 * - Message sending/editing/deleting
 * - Real-time updates via polling
 * - Unread count tracking
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

// =============================================================================
// Types
// =============================================================================

export interface Participant {
  id: string;
  userId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  profileImageUrl?: string;
  role?: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  readAt?: string | null;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  title?: string;
  name?: string;
  type: 'direct' | 'group' | string;
  lastMessage?: ConversationMessage;
  lastMessageAt?: string;
  unreadCount: number;
  participants: Participant[];
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface ConversationDetailResponse {
  conversation: Conversation | null;
  messages: ConversationMessage[];
  participants: Participant[];
}

export interface CreateConversationData {
  participantIds: string[];
  title?: string;
  type?: 'direct' | 'group';
  initialMessage?: string;
}

export interface SendMessageData {
  content: string;
  attachments?: File[];
}

export interface ConversationQueryOptions {
  limit?: number;
  before?: string;
}

// Return types for hooks
export interface UseConversationsReturn {
  conversations: Conversation[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseConversationReturn {
  conversation: Conversation | null;
  messages: ConversationMessage[];
  participants: Participant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCreateConversationReturn {
  createConversation: (data: CreateConversationData) => Promise<Conversation | undefined>;
  loading: boolean;
  error: string | null;
}

export interface UseSendMessageReturn {
  sendMessage: (conversationId: string, data: SendMessageData) => Promise<ConversationMessage | undefined>;
  loading: boolean;
  error: string | null;
}

export interface UseEditMessageReturn {
  editMessage: (messageId: string, content: string) => Promise<ConversationMessage | undefined>;
  loading: boolean;
  error: string | null;
}

export interface UseDeleteMessageReturn {
  deleteMessage: (messageId: string) => Promise<{ success: boolean } | undefined>;
  loading: boolean;
  error: string | null;
}

export interface UseMarkAsReadReturn {
  markAsRead: (conversationId: string) => Promise<{ success: boolean } | undefined>;
  loading: boolean;
  error: string | null;
}

export interface UseUnreadCountReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// Hook Implementations
// =============================================================================

/**
 * Hook for fetching all conversations
 */
export function useConversations(): UseConversationsReturn {
  const [data, setData] = useState<ConversationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<ConversationsResponse>('/conversations');
      setData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('[Conversations] Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations: data?.conversations || [],
    total: data?.total || 0,
    loading,
    error,
    refetch: fetchConversations,
  };
}

/**
 * Hook for fetching a single conversation with messages
 */
export function useConversation(
  conversationId: string | null | undefined,
  options: ConversationQueryOptions = {}
): UseConversationReturn {
  const [data, setData] = useState<ConversationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<ConversationDetailResponse>(
        `/conversations/${conversationId}`,
        { params: options }
      );

      setData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
      setError(errorMessage);
      console.error('[Conversations] Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, options.limit, options.before]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  return {
    conversation: data?.conversation || null,
    messages: data?.messages || [],
    participants: data?.participants || [],
    loading,
    error,
    refetch: fetchConversation,
  };
}

/**
 * Hook for creating a new conversation
 */
export function useCreateConversation(): UseCreateConversationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async (conversationData: CreateConversationData) => {
    if (!conversationData) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<Conversation>('/conversations', conversationData);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      console.error('[Conversations] Error creating conversation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createConversation,
    loading,
    error,
  };
}

/**
 * Hook for sending a message
 */
export function useSendMessage(): UseSendMessageReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (conversationId: string, messageData: SendMessageData) => {
    if (!conversationId || !messageData) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<ConversationMessage>(
        `/conversations/${conversationId}/messages`,
        messageData
      );

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('[Conversations] Error sending message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendMessage,
    loading,
    error,
  };
}

/**
 * Hook for editing a message
 */
export function useEditMessage(): UseEditMessageReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!messageId || !content) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.patch<ConversationMessage>(`/messages/${messageId}`, {
        content,
      });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit message';
      setError(errorMessage);
      console.error('[Conversations] Error editing message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    editMessage,
    loading,
    error,
  };
}

/**
 * Hook for deleting a message
 */
export function useDeleteMessage(): UseDeleteMessageReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!messageId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.delete<{ success: boolean }>(`/messages/${messageId}`);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      console.error('[Conversations] Error deleting message:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteMessage,
    loading,
    error,
  };
}

/**
 * Hook for marking messages as read
 */
export function useMarkAsRead(): UseMarkAsReadReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{ success: boolean }>(
        `/conversations/${conversationId}/read`
      );

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      console.error('[Conversations] Error marking as read:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markAsRead,
    loading,
    error,
  };
}

/**
 * Hook for getting unread count
 */
export function useUnreadCount(): UseUnreadCountReturn {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ count: number }>('/unread-count');

      setCount(response.data.count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get unread count';
      setError(errorMessage);
      console.error('[Conversations] Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds for unread count
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount: count,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
}
