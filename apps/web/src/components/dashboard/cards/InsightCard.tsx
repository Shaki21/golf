/**
 * InsightCard
 *
 * Secondary-level KPI display for supporting metrics.
 * Used for Delta, Percentile, Category Benchmark comparisons.
 *
 * Features:
 * - Moderate visual presence
 * - Clear hierarchy below Primary KPI
 * - Semantic coloring
 * - Compact but readable
 */

import * as React from 'react';
import { cn } from '../../../lib/utils';
import { getSGColorStyle } from '../../../utils/sgFormatting';

export interface InsightCardProps {
  /** Main value to display (pre-formatted string) */
  value: string;
  /** Label for the metric */
  label: string;
  /** Optional sublabel/description */
  sublabel?: string;
  /** Semantic type for coloring (positive/negative/neutral) */
  semantic?: 'positive' | 'negative' | 'neutral' | 'info';
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export function InsightCard({
  value,
  label,
  sublabel,
  semantic = 'neutral',
  icon,
  className,
  onClick,
}: InsightCardProps) {
  // Semantic color mapping
  const semanticColors: Record<string, string> = {
    positive: 'var(--semantic-positive-text)',
    negative: 'var(--semantic-negative-text)',
    neutral: 'var(--semantic-neutral-text)',
    info: 'rgb(var(--status-info))',
  };

  const valueColor = semanticColors[semantic];

  return (
    <div
      className={cn(
        // Base card styling
        'relative',
        'bg-[var(--card-insight-bg)]',
        'border border-[var(--card-insight-border)]',
        'rounded-[var(--pro-radius-md)]',
        'shadow-[var(--card-insight-shadow)]',
        'p-[var(--card-insight-padding)]',
        // Interactive
        onClick && 'cursor-pointer hover:border-[var(--pro-border-color)]',
        'transition-all duration-150',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header with label and optional icon */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'kpi-label',
            'text-[var(--kpi-secondary-label-size)]',
            'font-[var(--kpi-secondary-label-weight)]',
            'text-[rgb(var(--text-secondary))]'
          )}
        >
          {label}
        </span>
        {icon && (
          <span className="text-[rgb(var(--text-tertiary))]">
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span
          className={cn(
            'kpi-value',
            'text-[var(--kpi-secondary-value-size)]',
            'font-[var(--kpi-secondary-value-weight)]',
            'leading-tight'
          )}
          style={{ color: valueColor }}
        >
          {value}
        </span>
      </div>

      {/* Sublabel */}
      {sublabel && (
        <span className="text-xs text-[rgb(var(--text-tertiary))]">
          {sublabel}
        </span>
      )}
    </div>
  );
}

/**
 * InsightCardGrid
 *
 * Grid layout for multiple InsightCards
 */
export function InsightCardGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-[var(--pro-card-gap)]',
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

export default InsightCard;
