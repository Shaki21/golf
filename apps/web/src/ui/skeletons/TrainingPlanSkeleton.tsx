/**
 * TrainingPlanSkeleton
 *
 * Skeleton loader that matches CoachTrainingPlan layout
 * to prevent layout shift (flickering) during data loading.
 */

import React from 'react';
import { SkeletonPulse, SkeletonCard } from './SkeletonBase';

/**
 * Training block skeleton item
 */
const BlockItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between py-3 px-4 border-b border-ak-border-default last:border-b-0">
    <div className="flex items-center gap-3">
      <SkeletonPulse width="40px" height="40px" style={{ borderRadius: 'var(--radius-md)' }} />
      <div>
        <SkeletonPulse width="140px" height="16px" style={{ marginBottom: 4 }} />
        <SkeletonPulse width="80px" height="12px" />
      </div>
    </div>
    <SkeletonPulse width="60px" height="24px" style={{ borderRadius: 'var(--radius-full)' }} />
  </div>
);

/**
 * Main TrainingPlanSkeleton component
 */
export const TrainingPlanSkeleton: React.FC = () => {
  return (
    <section
      aria-hidden="true"
      role="presentation"
      className="min-h-screen bg-ak-surface-base"
    >
      {/* Header */}
      <div className="bg-ak-surface-subtle border-b border-ak-border-default py-4 px-6">
        {/* Back button */}
        <div className="mb-4">
          <SkeletonPulse width="80px" height="32px" style={{ borderRadius: 'var(--radius-md)' }} />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonPulse width="48px" height="48px" style={{ borderRadius: 'var(--radius-lg)' }} />
            <div>
              <SkeletonPulse width="140px" height="24px" style={{ marginBottom: 8 }} />
              <SkeletonPulse width="100px" height="14px" />
            </div>
          </div>
          <SkeletonPulse width="110px" height="36px" style={{ borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Next Session Highlight Card */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <SkeletonPulse width="18px" height="18px" style={{ borderRadius: '50%' }} />
            <SkeletonPulse width="70px" height="13px" />
          </div>
          <SkeletonPulse width="200px" height="22px" style={{ marginBottom: 12 }} />
          <div className="flex items-center gap-4">
            <SkeletonPulse width="150px" height="16px" />
            <SkeletonPulse width="60px" height="16px" />
          </div>
          <SkeletonPulse width="100%" height="16px" style={{ marginTop: 12 }} />
        </div>

        {/* Upcoming Sessions Card */}
        <div
          className="rounded-xl mb-6 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
          }}
        >
          {/* Card header */}
          <div className="p-5 border-b border-ak-border-default">
            <SkeletonPulse width="140px" height="20px" style={{ marginBottom: 8 }} />
            <SkeletonPulse width="90px" height="13px" />
          </div>

          {/* Block items */}
          <BlockItemSkeleton />
          <BlockItemSkeleton />
          <BlockItemSkeleton />
        </div>

        {/* Completed Sessions Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
          }}
        >
          {/* Card header */}
          <div className="p-5 border-b border-ak-border-default">
            <SkeletonPulse width="160px" height="20px" style={{ marginBottom: 8 }} />
            <SkeletonPulse width="70px" height="13px" />
          </div>

          {/* Block items */}
          <BlockItemSkeleton />
          <BlockItemSkeleton />
        </div>
      </div>
    </section>
  );
};

export default TrainingPlanSkeleton;
