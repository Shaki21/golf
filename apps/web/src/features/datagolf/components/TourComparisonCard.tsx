/**
 * Tour Comparison Card
 * Displays player stat vs tour average with visual diff indicator
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  stat: {
    label: string;
    playerValue: number;
    tourAverage: number;
    unit?: string;
    format?: 'number' | 'percentage' | 'decimal';
    inverse?: boolean; // true if lower is better (e.g., scores)
  };
  className?: string;
}

const TourComparisonCard: React.FC<Props> = ({ stat, className = '' }) => {
  const { label, playerValue, tourAverage, unit = '', format = 'number', inverse = false } = stat;

  // Calculate difference
  const diff = playerValue - tourAverage;
  const diffAbs = Math.abs(diff);

  // Determine if player is better
  const isBetter = inverse ? diff < 0 : diff > 0;
  const isNeutral = Math.abs(diff) < 0.01;

  // Format value based on type
  const formatValue = (value: number): string => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      default:
        return value.toFixed(1);
    }
  };

  // Get color classes
  const diffColorClass = isNeutral
    ? 'text-tier-text-secondary bg-tier-surface-secondary'
    : isBetter
    ? 'text-tier-success bg-tier-success-light'
    : 'text-tier-error bg-tier-error-light';

  const iconColorClass = isNeutral
    ? 'text-tier-text-secondary'
    : isBetter
    ? 'text-tier-success'
    : 'text-tier-error';

  // Select icon
  const DiffIcon = isNeutral ? Minus : isBetter ? TrendingUp : TrendingDown;

  return (
    <div
      className={`bg-white rounded-lg border border-tier-border-default p-4 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Stat label */}
      <div className="text-sm font-medium text-tier-text-secondary mb-3">{label}</div>

      {/* Values comparison */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-tier-text-secondary mb-1">Du</div>
          <div className="text-2xl font-bold text-tier-navy">
            {formatValue(playerValue)}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-tier-text-secondary mb-1">Tour snitt</div>
          <div className="text-2xl font-bold text-tier-text-secondary">
            {formatValue(tourAverage)}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </div>
        </div>
      </div>

      {/* Difference indicator */}
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg ${diffColorClass}`}
      >
        <div className="flex items-center gap-2">
          <DiffIcon size={16} className={iconColorClass} />
          <span className="text-sm font-semibold">
            {isNeutral ? 'Lik tour' : isBetter ? 'Over tour' : 'Under tour'}
          </span>
        </div>
        <div className="text-sm font-bold">
          {diff > 0 && '+'}
          {formatValue(diff)}
          {unit && <span className="ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default TourComparisonCard;
