/**
 * StatsCard
 * Design System v3.1 - Tailwind CSS
 *
 * Single metric card for displaying key performance indicators.
 * Uses monospace numerals for data legibility.
 *
 * Design principles:
 * - Value is dominant (large, bold)
 * - Change indicator uses semantic status colors
 * - Minimal chrome, maximum data clarity
 * - Touch-friendly (min 44px height)
 */

import React from 'react';
import Card from '../../../../ui/primitives/Card';

type TrendDirection = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  /** Metric label (e.g., "Treningsøkter") */
  label: string;
  /** Primary value (e.g., "12", "67.3") */
  value: string | number;
  /** Unit suffix (e.g., "timer", "%") */
  unit?: string;
  /** Change from previous period */
  change?: {
    value: string | number;
    direction: TrendDirection;
    label?: string; // e.g., "vs. forrige uke"
  };
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Click handler for drill-down */
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  unit,
  change,
  icon,
  onClick,
}) => {
  const getTrendColorClass = (direction: TrendDirection): string => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-tier-text-tertiary';
    }
  };

  const getTrendSymbol = (direction: TrendDirection): string => {
    switch (direction) {
      case 'up':
        return '+';
      case 'down':
        return '−'; // Using proper minus sign (U+2212)
      default:
        return '';
    }
  };

  return (
    <Card
      variant="default"
      padding="md"
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      {/* Header row: Label + Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs leading-tight font-medium text-tier-text-secondary uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span className="flex items-center justify-center text-tier-text-tertiary">
            {icon}
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl leading-tight font-bold text-tier-navy tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm leading-tight font-medium text-tier-text-tertiary">
            {unit}
          </span>
        )}
      </div>

      {/* Change indicator */}
      {change && (
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm leading-tight font-semibold tabular-nums ${getTrendColorClass(change.direction)}`}>
            {getTrendSymbol(change.direction)}{change.value}
          </span>
          {change.label && (
            <span className="text-xs leading-tight text-tier-text-tertiary">
              {change.label}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default StatsCard;

/**
 * StatsGrid
 *
 * 2x2 grid container for StatsCards.
 * Maintains consistent spacing and alignment.
 */
interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {children}
    </div>
  );
};
