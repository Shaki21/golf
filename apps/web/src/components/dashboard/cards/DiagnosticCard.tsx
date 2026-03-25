/**
 * DiagnosticCard
 *
 * Tertiary-level display for category breakdown and diagnostic data.
 * Used for Tee/Approach/Short Game/Putting breakdown.
 *
 * Features:
 * - Subtle visual presence
 * - Clear category identification
 * - Semantic coloring for values
 * - Optional benchmark comparison
 * - Compact layout for grid display
 */

import * as React from 'react';
import { cn } from '../../../lib/utils';
import { formatSG, getSGSemantic, getSGColorStyle } from '../../../utils/sgFormatting';
import { SubSectionTitle } from '../../typography/Headings';

export interface DiagnosticCardProps {
  /** Category/metric name */
  title: string;
  /** Main value */
  value: number | null | undefined;
  /** Optional icon or emoji */
  icon?: React.ReactNode;
  /** Benchmark label (e.g., "PGA Elite") */
  benchmarkLabel?: string;
  /** Benchmark value for comparison */
  benchmarkValue?: number | null;
  /** Number of tests/data points */
  testCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for drill-down */
  onClick?: () => void;
}

export function DiagnosticCard({
  title,
  value,
  icon,
  benchmarkLabel,
  benchmarkValue,
  testCount,
  className,
  onClick,
}: DiagnosticCardProps) {
  const semantic = getSGSemantic(value);
  const valueStyle = getSGColorStyle(value);

  // Calculate vs benchmark
  const vsBenchmark = value !== null && value !== undefined && benchmarkValue !== null && benchmarkValue !== undefined
    ? value - benchmarkValue
    : null;

  return (
    <div
      className={cn(
        // Base card styling - subtle
        'relative',
        'bg-[var(--card-diagnostic-bg)]',
        'border border-[var(--card-diagnostic-border)]',
        'rounded-[var(--pro-radius-sm)]',
        'p-[var(--card-diagnostic-padding)]',
        // Interactive
        onClick && 'cursor-pointer hover:bg-[rgb(var(--surface-tertiary))]',
        'transition-colors duration-150',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-base flex-shrink-0">
              {icon}
            </span>
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              'text-[rgb(var(--text-primary))]'
            )}
          >
            {title}
          </span>
        </div>

        {/* Semantic indicator dot */}
        <span
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            semantic === 'positive' && 'bg-[var(--semantic-positive)]',
            semantic === 'negative' && 'bg-[var(--semantic-negative)]',
            semantic === 'neutral' && 'bg-[var(--semantic-neutral)]'
          )}
        />
      </div>

      {/* Value */}
      <div className="mb-2">
        <span
          className={cn(
            'kpi-value',
            'text-[var(--kpi-tertiary-value-size)]',
            'font-[var(--kpi-tertiary-value-weight)]',
            'leading-tight'
          )}
          style={valueStyle}
        >
          {formatSG(value, { decimals: 2 })}
        </span>
      </div>

      {/* Benchmark Comparison */}
      {benchmarkLabel && benchmarkValue !== undefined && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[var(--kpi-tertiary-label-size)] text-[rgb(var(--text-tertiary))]">
            {benchmarkLabel}:
          </span>
          <span className="text-[var(--kpi-tertiary-label-size)] font-medium text-[rgb(var(--text-secondary))]">
            {formatSG(benchmarkValue)}
          </span>
          {vsBenchmark !== null && (
            <span
              className="text-[var(--kpi-tertiary-label-size)] font-medium ml-1"
              style={getSGColorStyle(vsBenchmark)}
            >
              ({formatSG(vsBenchmark)})
            </span>
          )}
        </div>
      )}

      {/* Test Count */}
      {testCount !== undefined && (
        <div className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
          {testCount} {testCount === 1 ? 'test' : 'tester'}
        </div>
      )}
    </div>
  );
}

/**
 * DiagnosticCardGrid
 *
 * Grid layout for diagnostic cards (category breakdown)
 */
export function DiagnosticCardGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-3',
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * DiagnosticSection
 *
 * Section wrapper for diagnostic cards with title
 */
export function DiagnosticSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <SubSectionTitle className="text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
        {title}
      </SubSectionTitle>
      {children}
    </div>
  );
}

export default DiagnosticCard;
