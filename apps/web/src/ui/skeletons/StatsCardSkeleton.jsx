import React from 'react';
import { SkeletonPulse, SkeletonCard } from './SkeletonBase';

/**
 * Stats card skeleton - UI Canon compliant
 * Uses semantic CSS variables
 */
export const StatsCardSkeleton = () => (
  <SkeletonCard>
    {/* Title */}
    <SkeletonPulse height="20px" width="128px" style={{ marginBottom: '16px' }} />

    {/* Stats grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            textAlign: 'center',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <SkeletonPulse height="32px" width="48px" style={{ margin: '0 auto 8px auto' }} />
          <SkeletonPulse height="12px" width="64px" style={{ margin: '0 auto' }} />
        </div>
      ))}
    </div>

    {/* Progress bars */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <SkeletonPulse height="12px" width="80px" />
          <SkeletonPulse height="12px" width="48px" />
        </div>
        <SkeletonPulse height="8px" width="100%" rounded />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <SkeletonPulse height="12px" width="96px" />
          <SkeletonPulse height="12px" width="48px" />
        </div>
        <SkeletonPulse height="8px" width="100%" rounded />
      </div>
    </div>
  </SkeletonCard>
);

export default StatsCardSkeleton;
