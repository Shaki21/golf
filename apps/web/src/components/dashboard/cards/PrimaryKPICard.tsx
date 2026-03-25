/**
 * PrimaryKPICard
 *
 * Hero-level KPI display for the most important metric.
 * Used for Total Strokes Gained - the single most important number.
 *
 * Features:
 * - Dominant visual presence
 * - Large, high-contrast value
 * - Semantic coloring
 * - Optional trend indicator
 * - Supporting metrics (percentile, delta)
 */

import * as React from 'react';
import { cn } from '../../../lib/utils';
import { formatSG, formatDelta, formatPercentile, getSGColorStyle } from '../../../utils/sgFormatting';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface PrimaryKPICardProps {
  /** Main KPI value (e.g., Strokes Gained) */
  value: number | null | undefined;
  /** Label for the KPI */
  label: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Delta/trend value (e.g., change over 30 days) */
  delta?: number | null;
  /** Period for delta (default: "30d") */
  deltaPeriod?: string;
  /** Percentile ranking (0-100) */
  percentile?: number | null;
  /** Optional benchmark comparison label */
  benchmarkLabel?: string;
  /** Benchmark value for comparison */
  benchmarkValue?: number | null;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use monospace font for values */
  monoValue?: boolean;
}

export function PrimaryKPICard({
  value,
  label,
  subtitle,
  delta,
  deltaPeriod = '30d',
  percentile,
  benchmarkLabel,
  benchmarkValue,
  className,
  monoValue = false,
}: PrimaryKPICardProps) {
  const valueStyle = getSGColorStyle(value);
  const deltaStyle = delta !== undefined && delta !== null ? getSGColorStyle(delta) : undefined;

  // Determine trend icon
  const TrendIcon = React.useMemo(() => {
    if (delta === null || delta === undefined || Math.abs(delta) < 0.01) {
      return Minus;
    }
    return delta > 0 ? TrendingUp : TrendingDown;
  }, [delta]);

  return (
    <div
      className={cn(
        // Base card styling
        'relative overflow-hidden',
        'bg-[var(--card-primary-bg)]',
        'border border-[var(--card-primary-border)]',
        'rounded-[var(--pro-radius-lg)]',
        'shadow-[var(--card-primary-shadow)]',
        'p-[var(--card-primary-padding)]',
        // Responsive
        'transition-shadow duration-150',
        'hover:shadow-[var(--pro-shadow-elevated)]',
        className
      )}
    >
      {/* Label */}
      <div className="mb-2">
        <span
          className={cn(
            'kpi-label',
            'text-[var(--kpi-primary-label-size)]',
            'font-[var(--kpi-primary-label-weight)]',
            'text-[rgb(var(--text-secondary))]'
          )}
        >
          {label}
        </span>
        {subtitle && (
          <span className="block text-xs text-[rgb(var(--text-tertiary))] mt-0.5">
            {subtitle}
          </span>
        )}
      </div>

      {/* Primary Value */}
      <div className="flex items-baseline gap-3 mb-4">
        <span
          className={cn(
            monoValue ? 'kpi-value-mono' : 'kpi-value',
            'text-[var(--kpi-primary-value-size)]',
            'font-[var(--kpi-primary-value-weight)]',
            'leading-none'
          )}
          style={valueStyle}
        >
          {formatSG(value, { decimals: 2 })}
        </span>
        <span className="text-lg text-[rgb(var(--text-tertiary))] font-medium">
          SG
        </span>
      </div>

      {/* Supporting Metrics Row */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--pro-border-subtle)]">
        {/* Delta/Trend */}
        {delta !== undefined && delta !== null && (
          <div className="flex items-center gap-1.5">
            <TrendIcon
              size={14}
              style={deltaStyle}
              className="flex-shrink-0"
            />
            <span
              className="text-sm font-medium"
              style={deltaStyle}
            >
              {formatDelta(delta, deltaPeriod, '/round')}
            </span>
          </div>
        )}

        {/* Percentile */}
        {percentile !== undefined && percentile !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[rgb(var(--text-secondary))]">
              {formatPercentile(percentile)} percentile
            </span>
          </div>
        )}

        {/* Benchmark Comparison */}
        {benchmarkLabel && benchmarkValue !== undefined && benchmarkValue !== null && value !== undefined && value !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[rgb(var(--text-tertiary))]">
              vs {benchmarkLabel}:
            </span>
            <span
              className="text-sm font-medium"
              style={getSGColorStyle(value - benchmarkValue)}
            >
              {formatSG(value - benchmarkValue, { decimals: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrimaryKPICard;
