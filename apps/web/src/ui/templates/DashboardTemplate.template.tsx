import React from 'react';
import { AppShell, PageHeader, CardSimple, CardHeader } from '../raw-blocks';
import { Button, Text, Avatar } from '../primitives';
import { Tabs } from '../composites';

/**
 * DashboardTemplate
 * Complete dashboard page layout with stats, charts, and activity feed
 */

interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  avatar?: string;
  userName?: string;
}

interface DashboardTab {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: number | string;
}

interface DashboardTemplateProps {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** User info for header */
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  /** Statistics to display */
  stats: DashboardStat[];
  /** Recent activity items */
  activities?: ActivityItem[];
  /** Main content tabs */
  tabs?: DashboardTab[];
  /** Quick actions */
  actions?: React.ReactNode;
  /** Welcome message */
  welcomeMessage?: string;
  /** Show activity feed */
  showActivity?: boolean;
  /** Loading state */
  loading?: boolean;
}

// Activity type color configuration
const ACTIVITY_TYPE_CONFIG: Record<string, { bgClass: string; icon: string }> = {
  success: { bgClass: 'bg-green-500', icon: '✓' },
  warning: { bgClass: 'bg-amber-500', icon: '⚠' },
  error: { bgClass: 'bg-red-500', icon: '✕' },
  info: { bgClass: 'bg-tier-gold', icon: 'i' },
};

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title,
  subtitle,
  user,
  stats,
  activities = [],
  tabs,
  actions,
  welcomeMessage,
  showActivity = true,
  loading = false,
}) => {
  const getActivityConfig = (type?: string) => {
    return ACTIVITY_TYPE_CONFIG[type || 'info'] || ACTIVITY_TYPE_CONFIG.info;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AppShell
      header={
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={actions}
        />
      }
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Welcome Section */}
        {(welcomeMessage || user) && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              {user && (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="lg"
                      status="online"
                    />
                    <div className="flex flex-col gap-0.5">
                      <Text variant="caption1" color="tertiary">
                        Welcome back,
                      </Text>
                      <Text variant="title2" weight={700}>
                        {user.name}
                      </Text>
                      {user.role && (
                        <Text variant="caption1" color="tertiary">
                          {user.role}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.href = '/profile'}
                  >
                    View profile
                  </Button>
                </div>
              )}
              {welcomeMessage && (
                <Text variant="body" color="secondary">
                  {welcomeMessage}
                </Text>
              )}
            </div>
            {/* Profile Stats Row */}
            <div className="grid grid-cols-3 bg-tier-surface-subtle border-t border-tier-border-default">
              {stats.slice(0, 3).map((stat, idx) => (
                <div
                  key={stat.id}
                  className={`flex flex-col items-center justify-center py-5 px-6 text-center ${
                    idx > 0 ? 'border-l border-tier-border-default' : ''
                  }`}
                >
                  <span className="text-lg font-semibold text-tier-navy">{stat.value}</span>
                  <span className="text-[13px] text-tier-text-tertiary mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Column - Main Content */}
          <div className="min-w-0">
            {tabs ? (
              <Tabs
                tabs={tabs}
                variant="underline"
                defaultActiveTab={tabs[0]?.id}
              />
            ) : (
              <CardSimple padding="lg">
                <Text color="secondary">
                  No content configured. Add tabs to display data.
                </Text>
              </CardSimple>
            )}
          </div>

          {/* Right Column - Activity Feed */}
          {showActivity && activities.length > 0 && (
            <div className="flex flex-col">
              <CardSimple padding="none">
                <CardHeader
                  title="Recent Activity"
                  subtitle={`${activities.length} updates`}
                  size="sm"
                />

                <div className="flex flex-col max-h-[600px] overflow-y-auto">
                  {activities.slice(0, 10).map((activity) => {
                    const config = getActivityConfig(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-4 border-b border-tier-border-subtle transition-colors duration-150 hover:bg-tier-surface-subtle"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${config.bgClass}`}
                        >
                          {config.icon}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <Text variant="footnote" weight={600}>
                            {activity.title}
                          </Text>
                          <Text variant="caption1" color="secondary">
                            {activity.description}
                          </Text>
                          <Text variant="caption2" color="tertiary">
                            {formatTimestamp(activity.timestamp)}
                          </Text>
                        </div>

                        {activity.userName && (
                          <Avatar
                            name={activity.userName}
                            src={activity.avatar}
                            size="xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {activities.length > 10 && (
                  <div className="p-3 border-t border-tier-border-subtle">
                    <Button variant="ghost" size="sm" fullWidth>
                      View All Activity
                    </Button>
                  </div>
                )}
              </CardSimple>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardTemplate;
