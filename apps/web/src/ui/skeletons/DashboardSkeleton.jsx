import React from 'react';
import StatsCardSkeleton from './StatsCardSkeleton';
import {
  WidgetSkeleton,
  CountdownSkeleton,
  TaskListSkeleton,
  SessionsSkeleton,
} from './WidgetSkeleton';
import { SkeletonPulse, SkeletonCircle } from './SkeletonBase';

/**
 * Dashboard skeleton components - UI Canon compliant
 * Uses semantic CSS variables
 */

/**
 * Complete dashboard loading skeleton
 * Matches the layout of TIERGolfDashboard component
 */
export const DashboardSkeleton = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '16px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <SkeletonCircle size={64} />
          <div style={{ flex: 1 }}>
            <SkeletonPulse height="32px" width="192px" style={{ marginBottom: '8px' }} />
            <SkeletonPulse height="16px" width="128px" />
          </div>
        </div>
        <SkeletonPulse height="24px" width="256px" style={{ marginTop: '16px' }} />
      </div>

      {/* Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
      }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Training Stats */}
          <StatsCardSkeleton />

          {/* Today's Sessions */}
          <SessionsSkeleton />

          {/* Countdown Widgets Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <CountdownSkeleton />
            <CountdownSkeleton />
          </div>
        </div>

        {/* Sidebar Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tasks/Goals */}
          <TaskListSkeleton />

          {/* Messages */}
          <WidgetSkeleton items={3} withIcon />

          {/* Achievements */}
          <WidgetSkeleton items={2} withIcon />
        </div>
      </div>
    </div>
  );
};

/**
 * Compact dashboard skeleton for smaller viewports
 */
export const DashboardSkeletonCompact = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      <SkeletonPulse height="24px" width="192px" style={{ marginBottom: '16px' }} />
      <StatsCardSkeleton />
      <SessionsSkeleton />
      <WidgetSkeleton items={2} />
    </div>
  );
};

export default DashboardSkeleton;
