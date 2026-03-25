/**
 * Conversation List Component
 * Displays list of conversations with last message preview and unread count
 */

import React from 'react';
import { MessageCircle, User, Users } from 'lucide-react';
import { SubSectionTitle } from '../../../ui/primitives/typography';
import { Conversation } from '../../../hooks/useConversations';

interface Props {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  className?: string;
}

const ConversationList: React.FC<Props> = ({
  conversations,
  selectedId,
  onSelect,
  className = '',
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getConversationIcon = (type: string, participantCount: number) => {
    if (type === 'group' || participantCount > 2) {
      return <Users size={20} />;
    }
    return <User size={20} />;
  };

  // Get display name for conversation
  const getDisplayName = (conversation: Conversation): string => {
    if (conversation.name) return conversation.name;
    if (conversation.title) return conversation.title;
    // Fallback to first participant name
    const firstParticipant = conversation.participants[0];
    if (firstParticipant) {
      if (firstParticipant.name) return firstParticipant.name;
      if (firstParticipant.firstName) {
        return firstParticipant.lastName
          ? `${firstParticipant.firstName} ${firstParticipant.lastName}`
          : firstParticipant.firstName;
      }
    }
    return 'Conversation';
  };

  if (conversations.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 ${className}`}>
        <div className="bg-tier-surface-secondary rounded-full p-6 mb-4">
          <MessageCircle size={48} className="text-tier-text-tertiary" />
        </div>
        <SubSectionTitle className="text-lg font-semibold text-tier-navy mb-2">No conversations yet</SubSectionTitle>
        <p className="text-sm text-tier-text-secondary text-center">
          Start a new conversation to get started
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col divide-y divide-tier-border-default ${className}`}>
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        const hasUnread = conversation.unreadCount > 0;
        const displayName = getDisplayName(conversation);

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`flex items-start gap-3 p-4 transition-colors text-left hover:bg-tier-surface-base ${
              isSelected ? 'bg-tier-info-light border-l-4 border-tier-info' : ''
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-full bg-tier-surface-secondary flex items-center justify-center text-tier-navy">
                {conversation.participants[0]?.avatar || conversation.participants[0]?.profileImageUrl ? (
                  <img
                    src={conversation.participants[0].avatar || conversation.participants[0].profileImageUrl}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getConversationIcon(conversation.type, conversation.participants.length)
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1">
                <SubSectionTitle
                  className={`text-sm font-semibold truncate ${
                    hasUnread ? 'text-tier-navy' : 'text-tier-text-primary'
                  }`}
                  style={{ marginBottom: 0 }}
                >
                  {displayName}
                </SubSectionTitle>
                {conversation.lastMessage && (
                  <span className="text-xs text-tier-text-secondary ml-2 flex-shrink-0">
                    {formatTime(conversation.lastMessage.createdAt || '')}
                  </span>
                )}
              </div>

              {conversation.lastMessage ? (
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      hasUnread ? 'font-medium text-tier-navy' : 'text-tier-text-secondary'
                    }`}
                  >
                    {conversation.lastMessage.senderName && `${conversation.lastMessage.senderName}: `}
                    {conversation.lastMessage.content}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-tier-text-tertiary italic">No messages yet</p>
              )}
            </div>

            {/* Unread badge */}
            {hasUnread && (
              <div className="flex-shrink-0 mt-1">
                <div className="bg-tier-info text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
