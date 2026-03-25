/**
 * DagbokSummarySection
 *
 * Compact stats summary for the training period.
 * Shows totals, averages, and pyramid breakdown.
 *
 * Migrated to Tailwind CSS
 */

import React from 'react';
import { Clock, Activity, Star, Flame } from 'lucide-react';

import type { DagbokSummarySectionProps, Pyramid } from '../types';
import { PYRAMIDS, PYRAMID_COLORS } from '../constants';

// =============================================================================
// COMPONENT
// =============================================================================

export const DagbokSummarySection: React.FC<DagbokSummarySectionProps> = ({
  stats,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-tier-surface-subtle animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-[100px] bg-tier-surface-subtle animate-pulse rounded-lg" />
      </div>
    );
  }

  const pyramidOrder: Pyramid[] = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Top stats row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2.5">
        <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-tier-border-default">
          <Activity size={16} className="mb-1.5 text-tier-text-tertiary" />
          <span className="text-xl font-bold text-tier-navy tabular-nums leading-tight">{stats.totalSessions}</span>
          <span className="text-[11px] text-tier-text-secondary mt-0.5">Sessions</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-tier-border-default">
          <Clock size={16} className="mb-1.5 text-tier-text-tertiary" />
          <span className="text-xl font-bold text-tier-navy tabular-nums leading-tight">{stats.totalMinutes}</span>
          <span className="text-[11px] text-tier-text-secondary mt-0.5">Minutes</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-tier-border-default">
          <Flame size={16} className="mb-1.5 text-tier-text-tertiary" />
          <span className="text-xl font-bold text-tier-navy tabular-nums leading-tight">{stats.totalReps}</span>
          <span className="text-[11px] text-tier-text-secondary mt-0.5">Reps</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-tier-border-default">
          <Star size={16} className="mb-1.5 text-status-warning" />
          <span className="text-xl font-bold text-tier-navy tabular-nums leading-tight">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
          </span>
          <span className="text-[11px] text-tier-text-secondary mt-0.5">Avg Rating</span>
        </div>
      </div>

      {/* Pyramid breakdown */}
      <div className="bg-white rounded-lg border border-tier-border-default p-3">
        <div className="text-xs font-semibold text-tier-text-secondary mb-2.5">Distribution per category</div>
        <div className="flex gap-2">
          {pyramidOrder.map((pyramid) => {
            const data = stats.byPyramid[pyramid];
            return (
              <div
                key={pyramid}
                className="flex-1 flex flex-col items-center py-2 px-1 rounded"
                style={{ backgroundColor: PYRAMID_COLORS[pyramid].bg }}
              >
                <span className="text-sm mb-1">{PYRAMIDS[pyramid].icon}</span>
                <span className="text-[9px] font-semibold text-tier-text-secondary mb-0.5">{pyramid}</span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: PYRAMID_COLORS[pyramid].text }}
                >
                  {data.sessions}
                </span>
                <span className="text-[9px] text-tier-text-tertiary">
                  {data.minutes > 0 ? `${data.minutes}m` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DagbokSummarySection;
