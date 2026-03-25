/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TIER Golf - Message Center
 * Design System v3.0 - Premium Light
 *
 * Main component for the messaging system.
 * Shows all conversations and provides access to chat.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic avatar background colors which require runtime values)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Users,
  User,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import MembersList, { Member } from '../../ui/composites/MembersList.composite';
import { SubSectionTitle } from "../../ui/components/typography";

// ============================================================================
// TYPES
// ============================================================================

interface ChatGroup {
  id: string;
  name: string;
  groupType: 'direct' | 'team' | 'coach_player';
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  members: Array<{
    id: string;
    name: string;
    type: 'player' | 'coach' | 'parent';
  }>;
}

type MessageFilterType = 'all' | 'coaches' | 'groups' | 'camps' | 'tournaments' | 'people';

interface MessageCenterProps {
  userId?: string;
  filterType?: MessageFilterType;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
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

const getGroupIcon = (type: string) => {
  switch (type) {
    case 'team':
      return <Users size={14} />;
    case 'coach_player':
      return <User size={14} />;
    default:
      return <MessageSquare size={14} />;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MessageCenter({ userId, filterType: initialFilterType }: MessageCenterProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MessageFilterType>(initialFilterType || 'all');
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Member[]>([]);

  // Sync filter when prop changes
  useEffect(() => {
    if (initialFilterType) {
      setFilterType(initialFilterType);
    }
  }, [initialFilterType]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/v1/messages/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        // Mock data for development
        setConversations([
          {
            id: '1',
            name: 'Anders Kristiansen (Coach)',
            groupType: 'coach_player',
            avatarInitials: 'AK',
            avatarColor: '#C9A227', // Gold
            lastMessage: {
              content: 'Remember to focus on putting today!',
              senderName: 'Anders',
              sentAt: '2025-12-21T09:30:00Z',
              isRead: false,
            },
            unreadCount: 2,
            members: [
              { id: '1', name: 'Anders Kristiansen', type: 'coach' },
            ],
          },
          {
            id: '2',
            name: 'WANG Elite Sports',
            groupType: 'team',
            avatarInitials: 'WT',
            avatarColor: '#0A2540', // Navy
            lastMessage: {
              content: 'Camp on Saturday at 10:00',
              senderName: 'Coach',
              sentAt: '2025-12-20T14:00:00Z',
              isRead: true,
            },
            unreadCount: 0,
            members: [
              { id: '1', name: 'Anders', type: 'coach' },
              { id: '2', name: 'Lars', type: 'player' },
              { id: '3', name: 'Erik', type: 'player' },
            ],
          },
          {
            id: '3',
            name: 'Team Norway U18',
            groupType: 'team',
            avatarInitials: 'TN',
            avatarColor: '#EF4444', // Red
            lastMessage: {
              content: 'Training plan for next week is ready',
              senderName: 'National Team Coach',
              sentAt: '2025-12-19T16:45:00Z',
              isRead: true,
            },
            unreadCount: 0,
            members: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/v1/messages/contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        // Mock data for development
        setContacts([
          {
            id: 'c1',
            name: 'Anders Kristiansen',
            email: 'anders@akgolf.no',
            role: 'Head Coach',
            avatarInitials: 'AK',
            avatarColor: '#C9A227', // Gold
            type: 'coach',
            isOnline: true,
          },
          {
            id: 'c2',
            name: 'Erik Johansen',
            email: 'erik@demo.no',
            avatarInitials: 'EJ',
            avatarColor: '#22C55E', // Green
            category: 'Kat. A',
            type: 'player',
            lastSeen: '2h ago',
          },
          {
            id: 'c3',
            name: 'Sofie Andersen',
            email: 'sofie@demo.no',
            avatarInitials: 'SA',
            avatarColor: '#0A2540', // Navy
            category: 'Kat. A',
            type: 'player',
            isOnline: true,
          },
          {
            id: 'c4',
            name: 'Lars Olsen',
            email: 'lars@demo.no',
            avatarInitials: 'LO',
            avatarColor: '#EF4444', // Red
            category: 'Kat. B',
            type: 'player',
            lastSeen: '1d ago',
          },
          {
            id: 'c5',
            name: 'Emma Berg',
            email: 'emma@demo.no',
            avatarInitials: 'EB',
            avatarColor: '#0A2540', // Navy
            category: 'Kat. B',
            type: 'player',
            lastSeen: '3h ago',
          },
        ]);
      }
    };

    fetchContacts();
  }, []);

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!conv.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Type filter
      if (filterType === 'all') {
        return true;
      }
      if (filterType === 'coaches' && conv.groupType !== 'coach_player') {
        return false;
      }
      if (filterType === 'groups' && conv.groupType !== 'team') {
        return false;
      }
      if (filterType === 'camps') {
        // Filter for gathering/camp conversations (would need metadata in real implementation)
        return conv.name.toLowerCase().includes('camp');
      }
      if (filterType === 'tournaments') {
        // Filter for tournament conversations (would need metadata in real implementation)
        return conv.name.toLowerCase().includes('tournament');
      }
      if (filterType === 'people' && conv.groupType !== 'direct') {
        return false;
      }

      return true;
    });
  }, [conversations, searchQuery, filterType]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-10 h-10 border-[3px] border-tier-border-default border-t-tier-navy rounded-full mx-auto mb-4 animate-spin" />
        <p className="text-tier-text-secondary">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Search and filters */}
      <div className="flex gap-3 mb-5">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pr-3 pl-10 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none focus:border-tier-navy"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'coaches', label: 'Coaches' },
            { key: 'groups', label: 'Groups' },
            { key: 'camps', label: 'Camps' },
            { key: 'tournaments', label: 'Tournaments' },
            { key: 'people', label: 'People' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key as MessageFilterType)}
              className={`px-3.5 py-2 text-[13px] font-medium rounded cursor-pointer border transition-colors whitespace-nowrap ${
                filterType === filter.key
                  ? 'bg-tier-navy text-white border-tier-navy'
                  : 'bg-tier-white text-tier-navy border-tier-border-default hover:border-tier-navy'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations list */}
      <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-tier-text-tertiary mb-4" />
            <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-2">
              No messages
            </SubSectionTitle>
            <p className="text-sm text-tier-text-tertiary mb-4 max-w-[320px]">
              {searchQuery
                ? 'No conversations match your search'
                : 'Start a new conversation with your coach'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation, index) => (
            <Link
              key={conversation.id}
              to={`/meldinger/${conversation.id}`}
              className={`flex items-center gap-3.5 p-4 no-underline transition-colors hover:bg-tier-surface-base ${
                index < filteredConversations.length - 1 ? 'border-b border-tier-surface-base' : ''
              } ${conversation.unreadCount > 0 ? 'bg-tier-navy/5' : 'bg-transparent'}`}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ backgroundColor: conversation.avatarColor || 'var(--tier-navy)' }}
              >
                {conversation.avatarInitials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[17px] leading-[22px] text-tier-navy ${conversation.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                    {conversation.name}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-tier-surface-base rounded text-tier-text-secondary text-[11px]">
                    {getGroupIcon(conversation.groupType)}
                    {conversation.groupType === 'team' && 'Group'}
                    {conversation.groupType === 'coach_player' && 'Coach'}
                  </span>
                </div>

                {conversation.lastMessage && (
                  <div className="flex items-center gap-1.5">
                    {conversation.lastMessage.isRead ? (
                      <CheckCheck size={14} className="text-tier-success" />
                    ) : (
                      <Check size={14} className="text-tier-text-secondary" />
                    )}
                    <p className={`text-[13px] leading-[18px] m-0 overflow-hidden text-ellipsis whitespace-nowrap ${
                      conversation.unreadCount > 0 ? 'text-tier-navy font-medium' : 'text-tier-text-secondary'
                    }`}>
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Time and unread badge */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                {conversation.lastMessage && (
                  <span className={`text-xs leading-4 ${conversation.unreadCount > 0 ? 'text-tier-navy' : 'text-tier-text-secondary'}`}>
                    {formatTime(conversation.lastMessage.sentAt)}
                  </span>
                )}
                {conversation.unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 rounded-full bg-tier-navy text-white text-[11px] font-bold flex items-center justify-center px-1.5">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Contacts Section */}
      <div className="mt-6">
        <button
          onClick={() => setShowContacts(!showContacts)}
          className={`flex items-center justify-between w-full p-4 px-5 bg-tier-white border border-tier-border-default cursor-pointer text-left ${
            showContacts ? 'rounded-t-xl' : 'rounded-xl'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tier-navy flex items-center justify-center">
              <Users size={20} color="white" />
            </div>
            <div>
              <SubSectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                Contacts
              </SubSectionTitle>
              <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-0.5 mb-0">
                {contacts.length} people · {contacts.filter(c => c.isOnline).length} online
              </p>
            </div>
          </div>
          {showContacts ? (
            <ChevronUp size={20} className="text-tier-text-secondary" />
          ) : (
            <ChevronDown size={20} className="text-tier-text-secondary" />
          )}
        </button>

        {showContacts && (
          <div className="bg-tier-white border border-tier-border-default border-t-0 rounded-b-xl overflow-hidden">
            <MembersList
              members={contacts}
              onMemberClick={(member) => {
                navigate(`/meldinger/ny?contact=${member.id}`);
              }}
              showEmail={true}
              showStatus={true}
              showRole={true}
              size="md"
              emptyMessage="No contacts available"
            />
          </div>
        )}
      </div>
    </div>
  );
}
