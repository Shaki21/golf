/**
 * Message List Component
 * Displays messages in a conversation with sender info and timestamps
 */

import React, { useEffect, useRef } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { SubSectionTitle } from '../../../ui/primitives/typography';
import { ConversationMessage } from '../../../hooks/useConversations';

interface Props {
  messages: ConversationMessage[];
  currentUserId: string;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

const MessageList: React.FC<Props> = ({
  messages,
  currentUserId,
  onEdit,
  onDelete,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const shouldShowDateDivider = (currentMessage: ConversationMessage, previousMessage?: ConversationMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    return currentDate !== previousDate;
  };

  if (messages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 ${className}`}>
        <div className="text-6xl mb-4">💬</div>
        <SubSectionTitle className="text-lg font-semibold text-tier-navy mb-2">No messages yet</SubSectionTitle>
        <p className="text-sm text-tier-text-secondary text-center">
          Send the first message to start the conversation
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col p-4 space-y-4 overflow-y-auto ${className}`}>
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === currentUserId;
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        const showDateDivider = shouldShowDateDivider(message, previousMessage);
        const isEdited = message.updatedAt && message.updatedAt !== message.createdAt;

        return (
          <React.Fragment key={message.id}>
            {/* Date divider */}
            {showDateDivider && (
              <div className="flex items-center justify-center my-4">
                <div className="px-4 py-1 bg-tier-surface-secondary rounded-full text-xs font-medium text-tier-text-secondary">
                  {formatDate(message.createdAt)}
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] relative group ${
                  isOwnMessage ? 'order-1' : 'order-2'
                }`}
              >
                {/* Sender name for other's messages */}
                {!isOwnMessage && message.senderName && (
                  <div className="text-xs font-medium text-tier-text-secondary mb-1 px-1">
                    {message.senderName}
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-tier-info text-white rounded-br-sm'
                      : 'bg-tier-surface-secondary text-tier-navy rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                  {/* Timestamp and edited indicator */}
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-xs ${
                        isOwnMessage ? 'text-white/70' : 'text-tier-text-tertiary'
                      }`}
                    >
                      {formatTimestamp(message.createdAt)}
                    </span>
                    {isEdited && (
                      <span
                        className={`text-xs italic ${
                          isOwnMessage ? 'text-white/70' : 'text-tier-text-tertiary'
                        }`}
                      >
                        (edited)
                      </span>
                    )}
                  </div>
                </div>

                {/* Action menu for own messages */}
                {isOwnMessage && (onEdit || onDelete) && (
                  <div className="absolute top-0 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActiveMenu(activeMenu === message.id ? null : message.id)}
                      className="p-1 rounded-full hover:bg-tier-surface-secondary text-tier-text-secondary"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === message.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-tier-border-default py-1 min-w-[120px] z-10">
                        {onEdit && (
                          <button
                            onClick={() => {
                              onEdit(message.id, message.content);
                              setActiveMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-tier-surface-base flex items-center gap-2 text-tier-navy"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this message?')) {
                                onDelete(message.id);
                              }
                              setActiveMenu(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-tier-surface-base flex items-center gap-2 text-tier-error"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
