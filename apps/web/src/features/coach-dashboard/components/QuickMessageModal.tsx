/**
 * QuickMessageModal Component
 * Modal for sending quick messages to players from dashboard
 *
 * Enables coaches to send messages without leaving the dashboard
 */

import React, { useState } from 'react';
import Modal from '../../../ui/composites/Modal.composite';
import { Button } from '../../../components/shadcn/button';
import { Textarea } from '../../../components/shadcn/textarea';
import { Label } from '../../../components/shadcn/label';
import { toast } from 'sonner';
import { apiPost } from '../../../data/apiClient';
import { MessageSquare } from 'lucide-react';

export interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
}

/**
 * Modal for sending quick messages to players
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <QuickMessageModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   playerId="player-123"
 *   playerName="John Doe"
 * />
 * ```
 */
export function QuickMessageModal({
  isOpen,
  onClose,
  playerId,
  playerName,
}: QuickMessageModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error('Please enter a message');
      return;
    }

    if (trimmedMessage.length > 1000) {
      toast.error('Message is too long (max 1000 characters)');
      return;
    }

    setSending(true);

    try {
      await apiPost('/messages', {
        recipientId: playerId,
        content: trimmedMessage,
        type: 'coach_message',
      });

      toast.success('Message sent', {
        description: `Your message to ${playerName} was sent successfully.`,
      });

      // Reset and close
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message', {
        description: 'Could not send message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    if (message.trim() && !sending) {
      // Warn if message has content
      if (window.confirm('Discard this message?')) {
        setMessage('');
        onClose();
      }
    } else {
      setMessage('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send with Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !sending) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Message to ${playerName}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Message input */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium text-tier-text-primary">
            Your message
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            rows={6}
            className="w-full resize-none"
            disabled={sending}
            autoFocus
          />
          <div className="flex justify-between text-xs text-tier-text-secondary">
            <span>
              Press <kbd className="px-1 py-0.5 bg-tier-surface-secondary rounded">⌘/Ctrl</kbd> +{' '}
              <kbd className="px-1 py-0.5 bg-tier-surface-secondary rounded">Enter</kbd> to send
            </span>
            <span className={message.length > 900 ? 'text-amber-600 font-medium' : ''}>
              {message.length} / 1000
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-tier-border">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="bg-tier-navy hover:bg-tier-navy/90"
          >
            {sending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              <>
                <MessageSquare size={16} className="mr-2" />
                Send message
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default QuickMessageModal;
