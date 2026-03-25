/**
 * AI Coach Panel
 *
 * Chat interface panel for AI Coach interactions.
 * Features:
 * - Message list with user/assistant differentiation
 * - Input field with send button
 * - Quick action suggestions for empty state
 * - Loading indicator
 * - Minimize/maximize/close controls
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic height which requires runtime value)
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  X,
  Send,
  Loader2,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User,
} from 'lucide-react';
import { useAICoach } from '../context/AICoachContext';
import { DEFAULT_QUICK_ACTIONS } from '../types';
import { SubSectionTitle } from '../../../components/typography/Headings';

// =============================================================================
// Component
// =============================================================================

export function AICoachPanel() {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    isAvailable,
    closePanel,
    minimizePanel,
    maximizePanel,
    sendMessage,
    clearMessages,
    markAsRead,
  } = useAICoach();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input when opening/maximizing
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
      markAsRead();
    }
  }, [isOpen, isMinimized, markAsRead]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading || isStreaming) return;

    setInputValue('');
    await sendMessage(text);
  };

  // Combined loading state for UI
  const isBusy = isLoading || isStreaming;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (message: string) => {
    handleSendMessage(message);
  };

  return (
    <div
      className={`fixed right-4 bottom-4 w-[380px] max-w-[calc(100vw-32px)] bg-tier-white rounded-xl shadow-xl flex flex-col z-[1001] overflow-hidden border border-tier-border-default ${
        isMinimized ? 'h-auto' : 'h-[500px]'
      }`}
      role="dialog"
      aria-label="AI Coach chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-tier-white border-b border-tier-border-default">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-tier-navy" />
          <div>
            <div className="font-semibold text-sm text-tier-navy">AI Golf Coach</div>
            <div className="text-xs text-tier-text-secondary">
              {isAvailable ? 'Klar til å hjelpe' : 'Utilgjengelig'}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={isMinimized ? maximizePanel : minimizePanel}
            className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-sm text-tier-text-secondary cursor-pointer hover:bg-tier-surface-base transition-colors"
            aria-label={isMinimized ? 'Maksimer' : 'Minimer'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={closePanel}
            className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-sm text-tier-text-secondary cursor-pointer hover:bg-tier-surface-base transition-colors"
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
              <div className="flex flex-col items-center justify-center text-center h-full gap-4">
                {/* Hero section */}
                <div className="w-16 h-16 rounded-2xl bg-tier-navy/10 flex items-center justify-center">
                  <Bot size={32} className="text-tier-navy" />
                </div>
                <div className="space-y-2">
                  <SubSectionTitle style={{ marginBottom: 0 }}>
                    AI Golf Coach
                  </SubSectionTitle>
                  <p className="text-sm text-tier-text-secondary m-0 max-w-[260px]">
                    Din personlige treningsassistent for golf
                  </p>
                </div>

                {/* Quick actions with better visual hierarchy */}
                <div className="w-full pt-4">
                  <p className="text-xs text-tier-text-tertiary uppercase tracking-wide mb-3">
                    Hurtigvalg
                  </p>
                  <div className="flex flex-col gap-2">
                    {DEFAULT_QUICK_ACTIONS.slice(0, 4).map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.message)}
                        className="w-full px-4 py-3 bg-tier-surface-base border border-tier-border-subtle rounded-xl text-sm text-tier-navy text-left cursor-pointer transition-all hover:bg-tier-white hover:border-tier-navy hover:shadow-sm disabled:opacity-50"
                        disabled={isBusy}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 max-w-[85%] ${
                      message.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-tier-navy text-white'
                          : 'bg-tier-white text-tier-text-secondary'
                      }`}
                    >
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div
                      className={`p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-tier-navy text-white'
                          : 'bg-tier-white text-tier-navy'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {/* Streaming response in progress */}
                {isStreaming && streamingContent && (
                  <div className="flex gap-2 max-w-[85%] self-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-tier-white text-tier-text-secondary">
                      <Bot size={16} />
                    </div>
                    <div className="p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap bg-tier-white text-tier-navy">
                      {streamingContent}
                      <span className="inline-block ml-0.5 text-tier-navy animate-pulse">
                        ▌
                      </span>
                    </div>
                  </div>
                )}
                {/* Loading indicator (non-streaming fallback) */}
                {isLoading && !isStreaming && (
                  <div className="flex gap-2 max-w-[85%] self-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-tier-white text-tier-text-secondary">
                      <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-tier-white text-tier-text-secondary text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Tenker...</span>
                    </div>
                  </div>
                )}
                {/* Streaming initial state - waiting for first token */}
                {isStreaming && !streamingContent && (
                  <div className="flex gap-2 max-w-[85%] self-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-tier-white text-tier-text-secondary">
                      <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-tier-white text-tier-text-secondary text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Skriver...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-tier-error/10 text-tier-error text-xs text-center">
              {error}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-tier-border-default bg-tier-white">
            <button
              onClick={clearMessages}
              className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-sm text-tier-text-secondary cursor-pointer flex-shrink-0 hover:bg-tier-surface-base"
              aria-label="Tøm chat"
              title="Tøm samtalen"
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
              className="flex-1 px-3 py-2 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none focus:border-tier-navy focus:ring-2 focus:ring-tier-navy/20"
              disabled={isBusy || !isAvailable}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isBusy}
              className={`flex items-center justify-center w-9 h-9 bg-tier-navy border-none rounded-full text-white cursor-pointer flex-shrink-0 transition-opacity ${
                inputValue.trim() && !isBusy ? 'opacity-100' : 'opacity-50'
              }`}
              aria-label="Send melding"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Add responsive styles via CSS
if (typeof document !== 'undefined' && !document.getElementById('ai-coach-panel-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'ai-coach-panel-styles';
  styleSheet.textContent = `
    /* Mobile responsive */
    @media (max-width: 480px) {
      [role="dialog"][aria-label="AI Coach chat"] {
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AICoachPanel;
