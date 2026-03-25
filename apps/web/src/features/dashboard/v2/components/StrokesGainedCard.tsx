/**
 * StrokesGainedCard
 * Design System v3.1 - Tailwind CSS
 *
 * Visualization of Strokes Gained metrics with centerline bar chart.
 * Positive values extend right (green), negative extend left (red).
 *
 * Design principles:
 * - Zero line is the visual anchor
 * - Color only used for semantic meaning (pos/neg)
 * - Values use tabular numerals
 * - Minimal decoration
 */

import React from 'react';
import Card from '../../../../ui/primitives/Card';
import { SubSectionTitle } from '../../../../components/typography';

interface StrokesGainedMetric {
  id: string;
  label: string;
  value: number; // Can be positive or negative
  benchmark?: number; // e.g., scratch golfer = 0
}

interface StrokesGainedCardProps {
  /** Card title */
  title?: string;
  /** Subtitle/context (e.g., "Siste 20 runder") */
  subtitle?: string;
  /** Metrics to display */
  metrics: StrokesGainedMetric[];
  /** Total strokes gained */
  total?: number;
  /** Max absolute value for scaling (auto-calculated if not provided) */
  maxValue?: number;
  /** Click handler for details */
  onViewDetails?: () => void;
}

const StrokesGainedCard: React.FC<StrokesGainedCardProps> = ({
  title = 'Strokes Gained',
  subtitle,
  metrics,
  total,
  maxValue: providedMaxValue,
  onViewDetails,
}) => {
  // Calculate max value for scaling
  const maxValue = providedMaxValue || Math.max(
    ...metrics.map(m => Math.abs(m.value)),
    0.5 // Minimum scale
  );

  // Calculate bar width percentage (max 45% on each side)
  const getBarWidth = (value: number): number => {
    return Math.min(Math.abs(value) / maxValue * 45, 45);
  };

  return (
    <Card variant="default" padding="none">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-tier-border-subtle">
        <div>
          <SubSectionTitle className="text-base leading-tight font-semibold text-tier-navy m-0">
            {title}
          </SubSectionTitle>
          {subtitle && (
            <p className="text-xs leading-tight text-tier-text-tertiary mt-0.5 m-0">
              {subtitle}
            </p>
          )}
        </div>
        {onViewDetails && (
          <button
            className="text-sm leading-tight font-medium text-tier-gold bg-transparent border-none px-2 py-1 cursor-pointer rounded-md hover:bg-tier-surface-subtle transition-colors"
            onClick={onViewDetails}
          >
            Detaljer
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="p-4 flex flex-col gap-3">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center gap-3 min-h-[28px]">
            {/* Label */}
            <span className="w-20 text-sm leading-tight font-medium text-tier-text-secondary shrink-0">
              {metric.label}
            </span>

            {/* Bar chart */}
            <div className="flex-1 flex items-center h-5 relative">
              {/* Negative bar (left side) */}
              <div className="flex-1 h-full flex justify-end items-center">
                {metric.value < 0 && (
                  <div
                    className="h-4 rounded-sm bg-red-500/80 mr-0.5 transition-all duration-300"
                    style={{ width: `${getBarWidth(metric.value)}%` }}
                  />
                )}
              </div>

              {/* Center line */}
              <div className="w-0.5 h-6 bg-tier-border-default shrink-0" />

              {/* Positive bar (right side) */}
              <div className="flex-1 h-full flex justify-start items-center">
                {metric.value > 0 && (
                  <div
                    className="h-4 rounded-sm bg-green-500/80 ml-0.5 transition-all duration-300"
                    style={{ width: `${getBarWidth(metric.value)}%` }}
                  />
                )}
              </div>
            </div>

            {/* Value */}
            <span
              className={`w-14 text-sm leading-tight font-semibold tabular-nums text-right shrink-0 ${
                metric.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metric.value >= 0 ? '+' : ''}{metric.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total (if provided) */}
      {typeof total === 'number' && (
        <div className="flex items-center justify-between p-4 border-t border-tier-border-subtle bg-tier-surface-subtle">
          <span className="text-sm leading-tight font-semibold text-tier-navy">
            Total SG
          </span>
          <span
            className={`text-lg leading-tight font-bold tabular-nums ${
              total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {total >= 0 ? '+' : ''}{total.toFixed(2)}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StrokesGainedCard;
