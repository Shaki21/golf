/**
 * TIER Golf - AI Chat Widget
 *
 * Floating chat widget for AI Coach interactions.
 * Provides conversational interface to the AI coach.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Loader2,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { aiService, ChatMessage, ChatRequest } from '../../services/aiService';
import { SubSectionTitle } from '../typography/Headings';

// =============================================================================
// Types
// =============================================================================

interface AIChatWidgetProps {
  defaultOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  playerContext?: {
    handicap?: number;
    category?: string;
    currentScreen?: string;
  };
}

// =============================================================================
// Quick Action Suggestions
// =============================================================================

const QUICK_ACTIONS = [
  { label: 'Treningsforslag', message: 'Hva bør jeg fokusere på i treningen min?' },
  { label: 'Teknikk-tips', message: 'Gi meg tips for å forbedre teknikken min' },
  { label: 'Mental styrke', message: 'Hvordan kan jeg bli sterkere mentalt på banen?' },
  { label: 'Mål-setting', message: 'Hjelp meg sette realistiske mål' },
];

// =============================================================================
// Component
// =============================================================================

const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  defaultOpen = false,
  position = 'bottom-right',
  playerContext,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation history on mount
  useEffect(() => {
    const history = aiService.getConversationHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  // Check AI availability
  useEffect(() => {
    aiService.checkStatus().then((status) => {
      setIsAvailable(status.available);
    });
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || inputValue.trim();
      if (!text || isLoading) return;

      setError(null);
      setInputValue('');

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      aiService.addToConversation(userMessage);

      setIsLoading(true);

      try {
        const request: ChatRequest = {
          message: text,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            currentScreen: playerContext?.currentScreen,
          },
        };

        const response = await aiService.chat(request);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        aiService.addToConversation(assistantMessage);
      } catch (err) {
        console.error('[AIChatWidget] Chat error:', err);
        setError('Kunne ikke få svar fra AI-treneren. Prøv igjen.');
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, messages, playerContext]
  );

  const handleClearChat = () => {
    setMessages([]);
    aiService.clearConversation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClass = position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4';

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClass} flex items-center gap-2 px-4 py-3 bg-tier-gold text-white border-none rounded-full cursor-pointer shadow-lg z-[1000] transition-transform duration-200 hover:scale-105`}
        aria-label="Åpne AI Coach chat"
      >
        <Sparkles size={24} />
        <span className="font-semibold text-sm">AI Coach</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed ${positionClass} w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-xl flex flex-col z-[1000] overflow-hidden border border-tier-border-subtle`}
      style={{ height: isMinimized ? 'auto' : '500px' }}
      role="dialog"
      aria-label="AI Coach chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-tier-surface-subtle border-b border-tier-border-subtle">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-tier-gold" />
          <div>
            <div className="font-semibold text-sm text-tier-navy">AI Golf Coach</div>
            <div className="text-[10px] text-tier-text-tertiary">
              {isAvailable ? 'Klar til å hjelpe' : 'Utilgjengelig'}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded cursor-pointer text-tier-text-tertiary hover:bg-tier-surface-subtle transition-colors"
            aria-label={isMinimized ? 'Maksimer' : 'Minimer'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded cursor-pointer text-tier-text-tertiary hover:bg-tier-surface-subtle transition-colors"
            aria-label="Lukk chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <Bot size={48} className="text-tier-gold opacity-50" />
                <SubSectionTitle className="text-base font-semibold text-tier-navy mb-0">
                  Hei! Jeg er din AI Golf Coach
                </SubSectionTitle>
                <p className="text-[11px] text-tier-text-secondary m-0">
                  Spør meg om trening, teknikk, mentale strategier eller målsetting.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSendMessage(action.message)}
                      className="px-3 py-2 bg-tier-surface-subtle border border-tier-border-default rounded-full text-[10px] text-tier-text-secondary cursor-pointer transition-all hover:border-tier-gold hover:text-tier-gold disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 max-w-[85%] ${
                      message.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-tier-surface-subtle flex items-center justify-center text-tier-text-tertiary shrink-0">
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="p-3 rounded-lg bg-tier-surface-subtle text-[11px] text-tier-navy leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 max-w-[85%] self-start">
                    <div className="w-7 h-7 rounded-full bg-tier-surface-subtle flex items-center justify-center text-tier-text-tertiary shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-tier-surface-subtle text-tier-text-tertiary text-[11px]">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Tenker...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-red-100 text-red-600 text-[10px] text-center">
              {error}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-tier-border-subtle bg-white">
            <button
              onClick={handleClearChat}
              className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded cursor-pointer text-tier-text-tertiary shrink-0 hover:bg-tier-surface-subtle"
              aria-label="Tøm chat"
              title="Tøm chat"
            >
              <Trash2 size={16} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Skriv en melding..."
              className="flex-1 px-3 py-2 bg-tier-surface-subtle border border-tier-border-default rounded-lg text-[11px] text-tier-navy outline-none focus:border-tier-gold transition-colors"
              disabled={isLoading || !isAvailable}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center justify-center w-9 h-9 bg-tier-gold border-none rounded-full text-white cursor-pointer shrink-0 transition-opacity disabled:opacity-50"
              aria-label="Send melding"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatWidget;
