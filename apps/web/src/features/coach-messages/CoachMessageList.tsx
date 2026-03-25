/**
 * CoachMessageList
 *
 * List of sent messages for coaches.
 * Shows message subject, recipients, status, and category.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic icon background colors which require runtime values)
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Send,
  Users,
  User,
  Clock,
  CheckCheck,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from "../../ui/components/typography";

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  subject: string;
  preview: string;
  recipients: {
    type: 'player' | 'group' | 'all';
    name: string;
    count?: number;
  };
  sentAt: string;
  status: 'delivered' | 'read' | 'pending';
  hasAttachment: boolean;
  category: 'training' | 'tournament' | 'general' | 'urgent';
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMessages: Message[] = [
  {
    id: '1',
    subject: 'Training Update - Week 4',
    preview: 'Hi everyone! This week we focus on putting and short game. Meet at 09:00...',
    recipients: { type: 'group', name: 'WANG Elite Sports', count: 12 },
    sentAt: '2025-01-19T14:30:00',
    status: 'read',
    hasAttachment: false,
    category: 'training'
  },
  {
    id: '2',
    subject: 'Tournament Info - National Championship Qualifier',
    preview: 'Important info about the upcoming national championship qualifier. Registration must be submitted by Friday...',
    recipients: { type: 'all', name: 'All players', count: 28 },
    sentAt: '2025-01-18T10:15:00',
    status: 'delivered',
    hasAttachment: true,
    category: 'tournament'
  },
  {
    id: '3',
    subject: 'Personal Training Plan',
    preview: 'Hi Emma! I have reviewed your training results and created a new plan...',
    recipients: { type: 'player', name: 'Emma Larsen' },
    sentAt: '2025-01-17T16:45:00',
    status: 'read',
    hasAttachment: true,
    category: 'training'
  },
  {
    id: '4',
    subject: 'Important: Change of Training Time',
    preview: 'Note! Tomorrow\'s training has been moved to 10:00 due to the weather forecast...',
    recipients: { type: 'group', name: 'Team Junior', count: 8 },
    sentAt: '2025-01-16T20:00:00',
    status: 'read',
    hasAttachment: false,
    category: 'urgent'
  },
  {
    id: '5',
    subject: 'Congratulations on the Result!',
    preview: 'Fantastic effort in this weekend\'s tournament, Thomas! Your development over the last...',
    recipients: { type: 'player', name: 'Thomas Berg' },
    sentAt: '2025-01-15T09:30:00',
    status: 'read',
    hasAttachment: false,
    category: 'general'
  },
  {
    id: '6',
    subject: 'Video Analysis Ready',
    preview: 'Hi Sofie, I have added comments to your swing video. Pay special attention to...',
    recipients: { type: 'player', name: 'Sofie Andersen' },
    sentAt: '2025-01-14T11:20:00',
    status: 'read',
    hasAttachment: true,
    category: 'training'
  }
];

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const getRecipientIcon = (type: string) => {
  switch (type) {
    case 'group':
    case 'all':
      return <Users size={14} />;
    default:
      return <User size={14} />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'read':
      return <CheckCheck size={14} className="text-tier-success" />;
    case 'delivered':
      return <Check size={14} className="text-tier-text-tertiary" />;
    default:
      return <Clock size={14} className="text-tier-text-tertiary" />;
  }
};

const getCategoryConfig = (category: string): { label: string; variant: 'accent' | 'warning' | 'neutral' | 'error' } => {
  switch (category) {
    case 'training':
      return { label: 'Training', variant: 'accent' };
    case 'tournament':
      return { label: 'Tournament', variant: 'warning' };
    case 'urgent':
      return { label: 'Important', variant: 'error' };
    default:
      return { label: 'General', variant: 'neutral' };
  }
};

const getRecipientIconBgClass = (type: string): string => {
  switch (type) {
    case 'player':
      return 'bg-tier-navy/15 text-tier-navy';
    case 'group':
      return 'bg-tier-warning/15 text-tier-warning';
    default:
      return 'bg-tier-success/15 text-tier-success';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CoachMessageList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await messagesAPI.list({ type: 'sent' });
      setMessages((response.data?.data || response.data || mockMessages) as unknown as Message[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not load messages';
      setError(errorMessage);
      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    let filteredList = [...messages];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredList = filteredList.filter(m =>
        m.subject.toLowerCase().includes(query) ||
        m.preview.toLowerCase().includes(query) ||
        m.recipients.name.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filteredList = filteredList.filter(m => m.category === categoryFilter);
    }

    return filteredList;
  }, [searchQuery, categoryFilter, messages]);

  const stats = useMemo(() => ({
    total: messages.length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    read: messages.filter(m => m.status === 'read').length
  }), [messages]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tier-surface-base">
        <StateCard variant="loading" title="Loading messages..." />
      </div>
    );
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tier-surface-base p-6">
        <StateCard
          variant="error"
          title="Could not load messages"
          description={error}
          action={<Button variant="primary" onClick={fetchMessages}>Try again</Button>}
        />
      </div>
    );
  }

  return (
    <div className="bg-tier-surface-base min-h-screen">
      {/* Header */}
      <PageHeader
        title="Sent Messages"
        subtitle={`${stats.total} messages sent • ${stats.read} read`}
        helpText="Overview of all messages to your players. Send new messages and follow up on communication."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate('/coach/messages/compose')}
          >
            New message
          </Button>
        }
      />

      <div className="px-6 pb-6">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-5 flex-wrap">
          <Card variant="default" padding="sm" className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-tier-text-tertiary" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none bg-transparent text-sm text-tier-navy outline-none"
              />
            </div>
          </Card>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'training', label: 'Training' },
              { key: 'tournament', label: 'Tournament' },
              { key: 'urgent', label: 'Important' },
            ].map(cat => (
              <Button
                key={cat.key}
                variant={categoryFilter === cat.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter(cat.key)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Message List */}
        <div className="flex flex-col gap-2">
          {filteredMessages.map((message) => {
            const categoryConfig = getCategoryConfig(message.category);
            return (
              <Card
                key={message.id}
                variant="default"
                padding="md"
                onClick={() => navigate(`/coach/messages/${message.id}`)}
                className="cursor-pointer hover:border-tier-navy/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Left - Icon */}
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${getRecipientIconBgClass(message.recipients.type)}`}
                  >
                    {getRecipientIcon(message.recipients.type)}
                  </div>

                  {/* Center - Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        {message.subject}
                      </SubSectionTitle>
                      <Badge variant={categoryConfig.variant} size="sm">
                        {categoryConfig.label}
                      </Badge>
                    </div>
                    <p className="text-[13px] text-tier-text-secondary m-0 mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                      {message.preview}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-tier-text-tertiary">
                        {getRecipientIcon(message.recipients.type)}
                        <span className="text-xs">
                          {message.recipients.name}
                          {message.recipients.count && ` (${message.recipients.count})`}
                        </span>
                      </div>
                      {message.hasAttachment && (
                        <span className="text-xs text-tier-text-tertiary">
                          📎 Attachment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right - Status and time */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-tier-text-tertiary">
                      {formatDate(message.sentAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(message.status)}
                      <span
                        className={`text-[11px] ${
                          message.status === 'read' ? 'text-tier-success' : 'text-tier-text-tertiary'
                        }`}
                      >
                        {message.status === 'read' ? 'Read' : message.status === 'delivered' ? 'Delivered' : 'Sending...'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-tier-text-tertiary" />
                </div>
              </Card>
            );
          })}
        </div>

        {filteredMessages.length === 0 && (
          <StateCard
            variant="empty"
            icon={Send}
            title="No messages found"
          />
        )}
      </div>
    </div>
  );
};

export default CoachMessageList;
