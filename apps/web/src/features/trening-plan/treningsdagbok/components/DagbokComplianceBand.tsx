/**
 * DagbokComplianceBand
 *
 * Visual bar showing planned vs actual training.
 * Shows compliance rate as a percentage.
 *
 * Migrated to Tailwind CSS
 */

import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

import type { DagbokComplianceBandProps } from '../types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get compliance color class based on rate
 */
function getComplianceColorClass(rate: number): string {
  if (rate >= 80) return 'text-status-success';
  if (rate >= 50) return 'text-status-warning';
  return 'text-status-error';
}

/**
 * Get compliance background color for inline styles (dynamic)
 */
function getComplianceColor(rate: number): string {
  if (rate >= 80) return 'var(--status-success)';
  if (rate >= 50) return 'var(--status-warning)';
  return 'var(--status-error)';
}

// =============================================================================
// COMPONENT
// =============================================================================

export const DagbokComplianceBand: React.FC<DagbokComplianceBandProps> = ({
  plannedMinutes,
  actualMinutes,
  plannedSessions,
  actualSessions,
  complianceRate,
  className = '',
}) => {
  // Calculate bar widths based on max of planned/actual
  const maxMinutes = Math.max(plannedMinutes, actualMinutes, 1);
  const plannedWidth = (plannedMinutes / maxMinutes) * 100;
  const actualWidth = (actualMinutes / maxMinutes) * 100;

  return (
    <div className={`p-4 bg-white rounded-lg border border-tier-border-default ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-tier-text-secondary" />
          <span className="text-sm font-semibold text-tier-navy">Compliance</span>
        </div>
        <span className={`text-sm font-bold tabular-nums ${getComplianceColorClass(complianceRate)}`}>
          {complianceRate}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-6 bg-tier-surface-subtle rounded relative overflow-hidden mb-3">
        {/* Planned (background) */}
        <div
          className="absolute top-0 left-0 h-full rounded transition-[width] duration-300"
          style={{
            width: `${Math.min(100, plannedWidth)}%`,
            backgroundColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        />
        {/* Actual (foreground) */}
        <div
          className="absolute top-0 left-0 h-full rounded transition-[width] duration-300 flex items-center justify-end pr-2"
          style={{
            width: `${Math.min(100, actualWidth)}%`,
            backgroundColor: getComplianceColor(complianceRate),
          }}
        >
          {actualWidth > 15 && (
            <span className="text-[11px] font-semibold text-white">{actualMinutes} min</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
          />
          <span className="text-xs text-tier-text-secondary">Planned:</span>
          <span className="text-xs font-semibold text-tier-navy tabular-nums">{plannedMinutes} min</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getComplianceColor(complianceRate) }}
          />
          <span className="text-xs text-tier-text-secondary">Completed:</span>
          <span className="text-xs font-semibold text-tier-navy tabular-nums">{actualMinutes} min</span>
        </div>
      </div>

      {/* Session stats */}
      <div className="flex justify-around mt-3 pt-3 border-t border-tier-border-subtle">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-bold text-tier-navy tabular-nums">{plannedSessions}</span>
          <span className="text-[10px] text-tier-text-tertiary uppercase">Planned sessions</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-bold text-tier-navy tabular-nums">{actualSessions}</span>
          <span className="text-[10px] text-tier-text-tertiary uppercase">Completed</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-base font-bold tabular-nums"
            style={{ color: getComplianceColor(complianceRate) }}
          >
            {complianceRate >= 100 && (
              <TrendingUp size={16} className="inline-block align-middle mr-1" />
            )}
            {complianceRate}%
          </span>
          <span className="text-[10px] text-tier-text-tertiary uppercase">Compliance</span>
        </div>
      </div>
    </div>
  );
};

export default DagbokComplianceBand;
