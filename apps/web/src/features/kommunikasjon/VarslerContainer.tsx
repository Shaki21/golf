/**
 * VarslerContainer
 *
 * Archetype: A - List/Index Page
 * Purpose: Display user notifications
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  Calendar,
  Trophy,
  Target,
  MessageSquare,
  Award,
  AlertCircle,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import { CardTitle } from '../../components/typography/Headings';
import { notificationsAPI } from '../../services/api';

// ============================================================================
// TYPES
// ============================================================================

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'training',
    title: 'New training plan available',
    message: 'Anders has updated your weekly plan for next week.',
    timestamp: '2025-01-18T14:30:00',
    read: false,
    actionUrl: '/trening/ukens',
  },
  {
    id: 'n2',
    type: 'tournament',
    title: 'Registration confirmed',
    message: 'You are registered for Junior Masters Oslo Jan 25-26.',
    timestamp: '2025-01-18T10:00:00',
    read: false,
    actionUrl: '/turneringskalender',
  },
  {
    id: 'n3',
    type: 'achievement',
    title: 'New achievement!',
    message: 'You have achieved "Driver over 250m"!',
    timestamp: '2025-01-17T16:45:00',
    read: true,
    actionUrl: '/achievements',
  },
  {
    id: 'n4',
    type: 'message',
    title: 'New message from Anders',
    message: 'Great job at training today! Remember to focus on...',
    timestamp: '2025-01-17T14:30:00',
    read: true,
    actionUrl: '/meldinger',
  },
  {
    id: 'n5',
    type: 'reminder',
    title: 'Reminder: Training tomorrow',
    message: 'You have technique training at 10:00 at the range.',
    timestamp: '2025-01-17T08:00:00',
    read: true,
    actionUrl: '/kalender',
  },
  {
    id: 'n6',
    type: 'test',
    title: 'New test result available',
    message: 'Your results from the driving test are ready.',
    timestamp: '2025-01-15T12:00:00',
    read: true,
    actionUrl: '/testresultater',
  },
  {
    id: 'n7',
    type: 'alert',
    title: 'Breaking Point updated',
    message: 'Coach has commented on "Swing tempo".',
    timestamp: '2025-01-14T09:00:00',
    read: true,
    actionUrl: '/utvikling/breaking-points',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const getNotificationConfig = (type: string) => {
  switch (type) {
    case 'training':
      return { icon: Calendar, colorClass: 'text-tier-navy bg-tier-navy/15' };
    case 'tournament':
      return { icon: Trophy, colorClass: 'text-tier-warning bg-tier-warning/15' };
    case 'achievement':
      return { icon: Award, colorClass: 'text-tier-success bg-tier-success/15' };
    case 'message':
      return { icon: MessageSquare, colorClass: 'text-tier-navy bg-tier-navy/15' };
    case 'reminder':
      return { icon: Clock, colorClass: 'text-tier-warning bg-tier-warning/15' };
    case 'test':
      return { icon: Target, colorClass: 'text-tier-success bg-tier-success/15' };
    case 'alert':
      return { icon: AlertCircle, colorClass: 'text-tier-error bg-tier-error/15' };
    default:
      return { icon: Bell, colorClass: 'text-tier-text-secondary bg-tier-surface-base' };
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// ============================================================================
// NOTIFICATION CARD
// ============================================================================

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRead,
  onDelete,
}) => {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3.5 p-3.5 rounded-xl shadow-sm cursor-pointer transition-all
        ${notification.read ? 'bg-tier-white' : 'bg-tier-navy/5 border-l-[3px] border-tier-navy'}
        hover:bg-tier-surface-base
      `}
      onClick={() => {
        if (!notification.read) onRead(notification.id);
      }}
    >
      <div
        className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${config.colorClass}`}
      >
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <CardTitle
            className={`text-sm m-0 text-tier-navy ${notification.read ? 'font-medium' : 'font-semibold'}`}
          >
            {notification.title}
          </CardTitle>
          <span className="text-[11px] text-tier-text-secondary">
            {formatTimestamp(notification.timestamp)}
          </span>
        </div>
        <p className="text-[13px] text-tier-text-secondary m-0 leading-relaxed">
          {notification.message}
        </p>
      </div>

      <div className="flex gap-1">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
            className="p-1.5 rounded-md border-none bg-transparent cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base"
            title="Mark as read"
          >
            <Check size={16} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 rounded-md border-none bg-transparent cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VarslerContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationsAPI.getAll();
        if (
          response?.data?.data?.notifications &&
          Array.isArray(response.data.data.notifications)
        ) {
          const apiNotifications = response.data.data.notifications.map(
            (n: {
              id: string;
              notificationType: string;
              title: string;
              message: string;
              createdAt: string;
              readAt: string | null;
              metadata?: { actionUrl?: string };
            }) => ({
              id: n.id,
              type: mapNotificationType(n.notificationType),
              title: n.title,
              message: n.message,
              timestamp: n.createdAt,
              read: n.readAt !== null,
              actionUrl:
                n.metadata?.actionUrl || getDefaultActionUrl(n.notificationType),
            })
          );
          setNotifications(
            apiNotifications.length > 0 ? apiNotifications : NOTIFICATIONS
          );
        } else {
          setNotifications(NOTIFICATIONS);
        }
      } catch (err) {
        console.warn('Failed to fetch notifications, using mock data:', err);
        setNotifications(NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const mapNotificationType = (type: string) => {
    const typeMap: Record<string, string> = {
      training_plan: 'training',
      session_reminder: 'reminder',
      tournament: 'tournament',
      achievement: 'achievement',
      message: 'message',
      test_result: 'test',
      breaking_point: 'alert',
    };
    return typeMap[type] || 'reminder';
  };

  const getDefaultActionUrl = (type: string) => {
    const urlMap: Record<string, string> = {
      training_plan: '/trening/ukens',
      session_reminder: '/kalender',
      tournament: '/turneringskalender',
      achievement: '/achievements',
      message: '/meldinger',
      test_result: '/testresultater',
      breaking_point: '/utvikling/breaking-points',
    };
    return urlMap[type] || '/';
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'training', label: 'Training' },
    { key: 'tournament', label: 'Tournaments' },
    { key: 'message', label: 'Messages' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRead = async (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await notificationsAPI.markRead(id);
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    const previousState = [...notifications];
    setNotifications(notifications.map((n) => ({ ...n, read: true })));

    try {
      await notificationsAPI.markAllRead();
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
      setNotifications(previousState);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-tier-navy animate-spin mx-auto" />
          <p className="mt-4 text-tier-text-secondary">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notifications`}
        helpText="Overview of all system notifications and important updates. See notifications about new messages, training plan changes, test results and other events."
        actions={null}
      />

      <div className="p-6 w-full">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`
                  px-3.5 py-2 rounded-lg border-none text-[13px] font-medium cursor-pointer whitespace-nowrap
                  ${filter === f.key
                    ? 'bg-tier-navy text-white'
                    : 'bg-tier-white text-tier-navy'
                  }
                `}
              >
                {f.label}
                {f.key === 'unread' && unreadCount > 0 && (
                  <span
                    className={`
                      ml-1.5 px-1.5 py-0.5 rounded-[10px] text-[11px]
                      ${filter === f.key
                        ? 'bg-white/30 text-white'
                        : 'bg-tier-error text-white'
                      }
                    `}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              leftIcon={<Check size={14} />}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-2">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={handleRead}
              onDelete={handleDelete}
            />
          ))}

          {filteredNotifications.length === 0 && (
            <div className="bg-tier-white rounded-[14px] p-10 text-center">
              <Bell size={40} className="text-tier-text-secondary mb-3 mx-auto" />
              <p className="text-sm text-tier-text-secondary m-0">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VarslerContainer;
