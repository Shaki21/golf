/**
 * ActivityFeed
 * Design System v3.1 - Tailwind CSS
 *
 * Chronological list of recent activities, notifications, and updates.
 * Designed for quick scanning with clear visual hierarchy.
 *
 * Design principles:
 * - Timestamp is secondary (right-aligned)
 * - Activity type indicated by subtle icon/indicator
 * - Unread items have visual distinction
 * - Touch targets are 44px minimum
 */

import React from 'react';
import Card from '../../../../ui/primitives/Card';
import { SubSectionTitle } from '../../../../components/typography';

type ActivityType =
  | 'session_completed'
  | 'badge_earned'
  | 'goal_achieved'
  | 'coach_message'
  | 'test_result'
  | 'streak_update'
  | 'system';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date | string;
  isUnread?: boolean;
  /** Link to related content */
  href?: string;
  /** For badge_earned type - is this a gold/premium achievement? */
  isGoldAchievement?: boolean;
}

interface ActivityFeedProps {
  /** Card title */
  title?: string;
  /** List of activity items */
  activities: ActivityItem[];
  /** Maximum items to show */
  maxItems?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Click handler for activity item */
  onActivityClick?: (activity: ActivityItem) => void;
  /** View all action */
  onViewAll?: () => void;
}

// Type indicator color classes
const TYPE_COLORS: Record<ActivityType, string> = {
  session_completed: 'bg-green-500',
  badge_earned: 'bg-tier-navy',
  goal_achieved: 'bg-green-500',
  coach_message: 'bg-blue-500',
  test_result: 'bg-tier-navy',
  streak_update: 'bg-amber-500',
  system: 'bg-gray-400',
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title = 'Status',
  activities,
  maxItems = 5,
  emptyMessage = 'Ingen ny status',
  onActivityClick,
  onViewAll,
}) => {
  const displayActivities = activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  // Format relative timestamp
  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Nå';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}t`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  };

  // Get type indicator color class
  const getTypeColorClass = (type: ActivityType, isGold?: boolean): string => {
    // Special handling for gold achievements
    if (type === 'badge_earned' && isGold) {
      return 'bg-tier-gold';
    }
    return TYPE_COLORS[type];
  };

  return (
    <Card variant="default" padding="none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-tier-border-subtle">
        <SubSectionTitle className="text-base leading-tight font-semibold text-tier-navy m-0">
          {title}
        </SubSectionTitle>
        {onViewAll && hasMore && (
          <button
            className="text-sm leading-tight font-medium text-tier-gold bg-transparent border-none px-2 py-1 cursor-pointer rounded-md hover:bg-tier-surface-subtle transition-colors"
            onClick={onViewAll}
          >
            Se alt
          </button>
        )}
      </div>

      {/* Activities list */}
      <div>
        {displayActivities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm leading-tight text-tier-text-tertiary m-0">
              {emptyMessage}
            </p>
          </div>
        ) : (
          displayActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors relative min-h-[56px] hover:bg-tier-surface-subtle ${
                activity.isUnread ? 'bg-tier-surface-subtle' : ''
              } ${index < displayActivities.length - 1 ? 'border-b border-tier-border-subtle' : ''}`}
              onClick={() => onActivityClick?.(activity)}
              role={onActivityClick ? 'button' : undefined}
              tabIndex={onActivityClick ? 0 : undefined}
            >
              {/* Type indicator */}
              <div
                className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getTypeColorClass(activity.type, activity.isGoldAchievement)}`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight font-medium text-tier-navy m-0">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs leading-tight text-tier-text-secondary mt-0.5 m-0 overflow-hidden text-ellipsis line-clamp-2">
                    {activity.description}
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs leading-tight text-tier-text-tertiary shrink-0 tabular-nums">
                {formatTimestamp(activity.timestamp)}
              </span>

              {/* Unread indicator */}
              {activity.isUnread && (
                <div className="absolute top-4 right-2 w-1.5 h-1.5 rounded-full bg-tier-navy" />
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;
