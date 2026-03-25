/**
 * Message Composer Component
 * Input area for composing and sending messages
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import Button from '../../../ui/primitives/Button';

interface Props {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
  placeholder?: string;
  className?: string;
}

const MessageComposer: React.FC<Props> = ({
  onSend,
  disabled = false,
  editingMessage = null,
  onCancelEdit,
  placeholder = 'Skriv en melding...',
  className = '',
}) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Populate textarea when editing
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || sending || disabled) return;

    try {
      setSending(true);
      await onSend(trimmedContent);
      setContent('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Kunne ikke sende melding. Prøv igjen.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCancel = () => {
    setContent('');
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className={`border-t border-tier-border-default bg-white ${className}`}>
      {/* Edit mode indicator */}
      {editingMessage && (
        <div className="px-4 py-2 bg-tier-info-light border-b border-tier-info flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-tier-info">Redigerer melding</span>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-tier-info rounded text-tier-info"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Composer */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2">
          {/* Textarea */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || sending}
              rows={1}
              className="w-full px-4 py-3 border border-tier-border-default rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-tier-info focus:border-transparent text-sm"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
          </div>

          {/* Send button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!content.trim() || disabled || sending}
            loading={sending}
            className="rounded-full px-4 h-12 flex-shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-tier-text-tertiary">
          Trykk Enter for å sende, Shift+Enter for ny linje
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;
