/**
 * AI Coach Context
 *
 * Provides shared state for AI Coach components:
 * - AICoachButton (floating trigger)
 * - AICoachPanel (chat interface)
 * - AICoachGuide (contextual help)
 *
 * State is persisted to localStorage for:
 * - Conversation history
 * - Hidden guides preference
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import {
  aiService,
  ChatRequest,
  StreamCallbacks,
} from '../../../services/aiService';
import type { AICoachContextValue, ChatMessage } from '../types';

// =============================================================================
// Storage Keys
// =============================================================================

const STORAGE_KEYS = {
  MESSAGES: 'ai_coach_messages',
  HIDDEN_GUIDES: 'ai_coach_hidden_guides',
  UNREAD_COUNT: 'ai_coach_unread',
} as const;

// =============================================================================
// Context
// =============================================================================

const AICoachContext = createContext<AICoachContextValue | null>(null);

// =============================================================================
// Utility Functions
// =============================================================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`[AICoach] Failed to load ${key}:`, error);
  }
  return defaultValue;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[AICoach] Failed to save ${key}:`, error);
  }
}

// =============================================================================
// Provider Component
// =============================================================================

interface AICoachProviderProps {
  children: ReactNode;
}

export function AICoachProvider({ children }: AICoachProviderProps) {
  // Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadFromStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
    return stored.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [unreadCount, setUnreadCount] = useState(() =>
    loadFromStorage<number>(STORAGE_KEYS.UNREAD_COUNT, 0)
  );

  // Guide state
  const [hiddenGuides, setHiddenGuides] = useState<string[]>(() =>
    loadFromStorage<string[]>(STORAGE_KEYS.HIDDEN_GUIDES, [])
  );

  // Check AI availability on mount
  useEffect(() => {
    aiService.checkStatus().then((status) => {
      setIsAvailable(status.available);
    });
  }, []);

  // Persist messages to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
  }, [messages]);

  // Persist hidden guides to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HIDDEN_GUIDES, hiddenGuides);
  }, [hiddenGuides]);

  // Persist unread count to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.UNREAD_COUNT, unreadCount);
  }, [unreadCount]);

  // =============================================================================
  // Panel Actions
  // =============================================================================

  const openPanel = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    if (isOpen && !isMinimized) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isOpen, isMinimized, openPanel, closePanel]);

  const minimizePanel = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizePanel = useCallback(() => {
    setIsMinimized(false);
  }, []);

  // =============================================================================
  // Chat Actions
  // =============================================================================

  const sendMessage = useCallback(async (content: string, useStreaming = true) => {
    if (!content.trim() || isLoading || isStreaming) return;

    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    const request: ChatRequest = {
      message: content.trim(),
      conversationHistory: messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      })),
      context: {},
    };

    if (useStreaming) {
      // Use streaming for real-time response
      setIsStreaming(true);
      setStreamingContent('');
      let fullContent = '';

      const callbacks: StreamCallbacks = {
        onText: (text: string) => {
          fullContent += text;
          setStreamingContent(fullContent);
        },
        onToolUse: (_toolName: string) => {
          // Tool use callback - could be used for UI feedback
        },
        onDone: () => {
          // Create final assistant message
          const assistantMessage: ChatMessage = {
            id: generateMessageId(),
            role: 'assistant',
            content: fullContent,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingContent('');
          setIsStreaming(false);

          // Increment unread if panel is closed
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        },
        onError: (errorMsg: string) => {
          console.error('[AICoach] Stream error:', errorMsg);
          setError('Kunne ikke få svar fra AI-treneren. Prøv igjen.');
          setStreamingContent('');
          setIsStreaming(false);
        },
      };

      try {
        await aiService.chatStream(request, callbacks);
      } catch (err) {
        console.error('[AICoach] Chat error:', err);
        setError('Kunne ikke få svar fra AI-treneren. Prøv igjen.');
        setIsStreaming(false);
      }
    } else {
      // Fallback to non-streaming
      setIsLoading(true);

      try {
        const response = await aiService.chat(request);

        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Increment unread if panel is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('[AICoach] Chat error:', err);
        setError('Kunne ikke få svar fra AI-treneren. Prøv igjen.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages, isLoading, isStreaming, isOpen]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    aiService.clearConversation();
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // =============================================================================
  // Guide Actions
  // =============================================================================

  const hideGuide = useCallback((guideId: string) => {
    setHiddenGuides(prev => {
      if (prev.includes(guideId)) return prev;
      return [...prev, guideId];
    });
  }, []);

  const isGuideHidden = useCallback((guideId: string) => {
    return hiddenGuides.includes(guideId);
  }, [hiddenGuides]);

  const resetHiddenGuides = useCallback(() => {
    setHiddenGuides([]);
  }, []);

  // =============================================================================
  // Navigation Actions
  // =============================================================================

  const openPanelWithMessage = useCallback((message: string) => {
    openPanel();
    // Send message after a short delay to allow panel to render
    setTimeout(() => {
      sendMessage(message);
    }, 100);
  }, [openPanel, sendMessage]);

  // =============================================================================
  // Context Value
  // =============================================================================

  const contextValue = useMemo<AICoachContextValue>(() => ({
    // State
    isOpen,
    isMinimized,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    isAvailable,
    unreadCount,
    hiddenGuides,

    // Panel actions
    openPanel,
    closePanel,
    togglePanel,
    minimizePanel,
    maximizePanel,

    // Chat actions
    sendMessage,
    clearMessages,
    markAsRead,

    // Guide actions
    hideGuide,
    isGuideHidden,
    resetHiddenGuides,

    // Navigation
    openPanelWithMessage,
  }), [
    isOpen,
    isMinimized,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    isAvailable,
    unreadCount,
    hiddenGuides,
    openPanel,
    closePanel,
    togglePanel,
    minimizePanel,
    maximizePanel,
    sendMessage,
    clearMessages,
    markAsRead,
    hideGuide,
    isGuideHidden,
    resetHiddenGuides,
    openPanelWithMessage,
  ]);

  return (
    <AICoachContext.Provider value={contextValue}>
      {children}
    </AICoachContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useAICoach(): AICoachContextValue {
  const context = useContext(AICoachContext);
  if (!context) {
    throw new Error('useAICoach must be used within an AICoachProvider');
  }
  return context;
}
