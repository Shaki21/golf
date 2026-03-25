// @ts-nocheck
/**
 * TIER Golf - Coach Scheduled Messages
 * Design System v3.0 - Premium Light
 *
 * Timeline view of scheduled messages for coaches.
 * Shows upcoming messages with time indicators and quick actions.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Search,
  Users,
  User,
  Calendar,
  Edit2,
  Trash2,
  Send,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';
import { messagesAPI } from '../../services/api';
import { SubSectionTitle } from "../../ui/components/typography";

interface ScheduledMessage {
  id: string;
  subject: string;
  preview: string;
  recipients: {
    type: 'player' | 'group' | 'all';
    name: string;
    count?: number;
  };
  scheduledFor: string;
  category: 'training' | 'tournament' | 'general' | 'urgent';
  createdAt: string;
  hasAttachment: boolean;
}

const mockScheduledMessages: ScheduledMessage[] = [
  {
    id: '1',
    subject: 'Reminder: Tournament this weekend',
    preview: 'Remember to check in by Friday at 6:00 PM. Bring...',
    recipients: { type: 'group', name: 'Turneringsspillere', count: 15 },
    scheduledFor: '2025-01-24T08:00:00',
    category: 'tournament',
    createdAt: '2025-01-19T10:30:00',
    hasAttachment: true
  },
  {
    id: '2',
    subject: 'Weekly training update',
    preview: 'This week\'s focus areas and exercises...',
    recipients: { type: 'all', name: 'All players', count: 28 },
    scheduledFor: '2025-01-27T07:00:00',
    category: 'training',
    createdAt: '2025-01-18T14:00:00',
    hasAttachment: false
  },
  {
    id: '3',
    subject: 'Birthday greeting',
    preview: 'Happy birthday! Hope you have a fantastic day...',
    recipients: { type: 'player', name: 'Emma Larsen' },
    scheduledFor: '2025-02-15T08:00:00',
    category: 'general',
    createdAt: '2025-01-15T09:00:00',
    hasAttachment: false
  },
  {
    id: '4',
    subject: 'Important: Changes to training program',
    preview: 'Starting February 1st, there will be changes to...',
    recipients: { type: 'group', name: 'WANG Toppidrett', count: 12 },
    scheduledFor: '2025-01-31T09:00:00',
    category: 'urgent',
    createdAt: '2025-01-19T16:45:00',
    hasAttachment: true
  }
];

export const CoachScheduledMessages: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ScheduledMessage[]>(mockScheduledMessages);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch scheduled messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getScheduled();
        setMessages(response.data?.data || response.data || mockScheduledMessages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load scheduled messages');
        setMessages(mockScheduledMessages);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter(m =>
      m.subject.toLowerCase().includes(query) ||
      m.preview.toLowerCase().includes(query) ||
      m.recipients.name.toLowerCase().includes(query)
    );
  }, [searchQuery, messages]);

  // Sort by scheduled date
  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) =>
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );
  }, [filteredMessages]);

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) {
      return `Today at ${time}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${time}`;
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${time}`;
    }
    return `${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} at ${time}`;
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users size={14} />;
      case 'all': return <Users size={14} />;
      default: return <User size={14} />;
    }
  };

  const getCategoryBadgeClasses = (category: string) => {
    switch (category) {
      case 'training':
        return { bg: 'bg-tier-navy/15', text: 'text-tier-navy', label: 'Training' };
      case 'tournament':
        return { bg: 'bg-tier-warning/15', text: 'text-tier-warning', label: 'Tournament' };
      case 'urgent':
        return { bg: 'bg-tier-error/15', text: 'text-tier-error', label: 'Urgent' };
      default:
        return { bg: 'bg-tier-text-secondary/15', text: 'text-tier-text-secondary', label: 'General' };
    }
  };

  const getTimelineClasses = (daysUntil: number) => {
    if (daysUntil <= 1) {
      return {
        circle: 'bg-tier-error/15 border-2 border-tier-error',
        icon: 'text-tier-error',
        badge: 'bg-tier-error/15 text-tier-error'
      };
    } else if (daysUntil <= 7) {
      return {
        circle: 'bg-tier-warning/15 border-2 border-tier-warning',
        icon: 'text-tier-warning',
        badge: 'bg-tier-warning/15 text-tier-warning'
      };
    }
    return {
      circle: 'bg-tier-navy/15 border-2 border-tier-navy',
      icon: 'text-tier-navy',
      badge: 'bg-tier-navy/15 text-tier-navy'
    };
  };

  const handleDelete = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      setActionLoading(messageId);
      await messagesAPI.delete(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete message');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendNow = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to send this message now?')) return;

    try {
      setActionLoading(messageId);
      await messagesAPI.sendNow(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send message');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    navigate(`/coach/messages/compose?edit=${messageId}`);
  };

  return (
    <div className="bg-tier-surface-base min-h-screen">
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="Scheduled messages"
        subtitle={`${mockScheduledMessages.length} messages in queue`}
        helpText="Schedule messages to be sent automatically to players at a specific time."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => navigate('/coach/messages/compose')}
          >
            New scheduled message
          </Button>
        }
      />

      <div className="px-6 pb-6">

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
        />
        <input
          type="text"
          placeholder="Search scheduled messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-[400px] py-3 pr-3 pl-10 rounded-[10px] border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy"
        />
      </div>

      {/* Timeline View */}
      <div className="relative">
        {sortedMessages.map((message, index) => {
          const categoryStyle = getCategoryBadgeClasses(message.category);
          const daysUntil = getDaysUntil(message.scheduledFor);
          const timelineStyle = getTimelineClasses(daysUntil);

          return (
            <div key={message.id} className="flex gap-5 mb-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center w-[60px] flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${timelineStyle.circle}`}>
                  <Clock size={18} className={timelineStyle.icon} />
                </div>
                {index < sortedMessages.length - 1 && (
                  <div className="w-0.5 flex-1 bg-tier-border-default mt-2 min-h-[40px]" />
                )}
              </div>

              {/* Message Card */}
              <div className="flex-1 bg-tier-white rounded-xl p-4 px-5 border border-tier-border-default cursor-pointer transition-colors hover:border-tier-navy/50">
                {/* Scheduled time badge */}
                <div className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md mb-3 ${timelineStyle.badge}`}>
                  <Calendar size={12} />
                  <span className="text-xs font-semibold">
                    {formatScheduledDate(message.scheduledFor)}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
                        {message.subject}
                      </SubSectionTitle>
                      <span className={`text-[10px] font-medium py-0.5 px-1.5 rounded ${categoryStyle.bg} ${categoryStyle.text}`}>
                        {categoryStyle.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-tier-text-secondary m-0 mb-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[500px]">
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

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => handleEdit(e, message.id)}
                      className="w-9 h-9 rounded-lg border border-tier-border-default bg-transparent flex items-center justify-center cursor-pointer hover:bg-tier-surface-base"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-tier-text-secondary" />
                    </button>
                    <button
                      onClick={(e) => handleSendNow(e, message.id)}
                      className="w-9 h-9 rounded-lg border-none bg-tier-success/15 flex items-center justify-center cursor-pointer hover:bg-tier-success/25"
                      title="Send now"
                    >
                      <Send size={16} className="text-tier-success" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, message.id)}
                      className="w-9 h-9 rounded-lg border-none bg-tier-error/15 flex items-center justify-center cursor-pointer hover:bg-tier-error/25"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-tier-error" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedMessages.length === 0 && (
        <div className="text-center py-[60px] px-5 bg-tier-white rounded-2xl border border-tier-border-default">
          <Clock size={48} className="text-tier-text-tertiary mb-4" />
          <p className="text-base text-tier-text-secondary m-0 mb-4">
            {searchQuery ? 'No scheduled messages found' : 'No scheduled messages'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/coach/messages/compose')}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-[10px] border-none bg-tier-navy text-white text-sm font-medium cursor-pointer hover:bg-tier-navy/90"
            >
              <Plus size={16} />
              Schedule first message
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default CoachScheduledMessages;
