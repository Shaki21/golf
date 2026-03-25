import React from 'react';
import { SkeletonPulse, SkeletonCard, SkeletonCircle } from './SkeletonBase';

/**
 * Widget skeleton components - UI Canon compliant
 * Uses semantic CSS variables
 */

/**
 * Generic widget skeleton with title and content
 */
export const WidgetSkeleton = ({ items = 3, withIcon = false }) => (
  <SkeletonCard>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <SkeletonPulse height="20px" width="112px" />
      <SkeletonPulse height="16px" width="64px" />
    </div>

    {/* Content list */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {withIcon && <SkeletonCircle size={20} />}
          <div style={{ flex: 1 }}>
            <SkeletonPulse height="16px" width="75%" style={{ marginBottom: '4px' }} />
            <SkeletonPulse height="12px" width="64px" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for countdown widgets (tournament/test)
 */
export const CountdownSkeleton = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      {/* Icon */}
      <SkeletonPulse height="40px" width="40px" style={{ borderRadius: 'var(--radius-md)', flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <SkeletonPulse height="12px" width="80px" style={{ marginBottom: '8px' }} />
        <SkeletonPulse height="16px" width="128px" style={{ marginBottom: '4px' }} />
        <SkeletonPulse height="12px" width="96px" />
      </div>

      {/* Countdown */}
      <div style={{ textAlign: 'right' }}>
        <SkeletonPulse height="32px" width="40px" style={{ marginBottom: '4px' }} />
        <SkeletonPulse height="12px" width="32px" />
      </div>
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for task/goal list
 */
export const TaskListSkeleton = () => (
  <SkeletonCard>
    <SkeletonPulse height="20px" width="112px" style={{ marginBottom: '16px' }} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <SkeletonCircle size={20} />
          <div style={{ flex: 1 }}>
            <SkeletonPulse height="16px" width="75%" style={{ marginBottom: '4px' }} />
            <SkeletonPulse height="12px" width="64px" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for calendar/sessions widget
 */
export const SessionsSkeleton = () => (
  <SkeletonCard>
    <SkeletonPulse height="20px" width="128px" style={{ marginBottom: '16px' }} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2].map(i => (
        <div
          key={i}
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
            <SkeletonPulse height="40px" width="40px" style={{ borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <SkeletonPulse height="16px" width="128px" style={{ marginBottom: '4px' }} />
              <SkeletonPulse height="12px" width="80px" />
            </div>
            <SkeletonPulse height="24px" width="64px" style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <SkeletonPulse height="20px" width="64px" style={{ borderRadius: 'var(--radius-sm)' }} />
            <SkeletonPulse height="20px" width="48px" style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
      ))}
    </div>
  </SkeletonCard>
);

export default WidgetSkeleton;
