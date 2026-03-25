import React from 'react';
import Card from '../primitives/Card';

/**
 * StatsGridTemplate
 * Unified template for displaying statistics in a responsive grid
 * Supports both simple stat cards and cards with change indicators
 */

export interface StatsItem {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

interface StatsGridTemplateProps {
  /** Array of statistics to display */
  items: StatsItem[];
  /** Number of columns (auto-responsive if not specified) */
  columns?: 2 | 3 | 4;
  /** Additional CSS class name */
  className?: string;
}

// Trend color configuration
const TREND_CONFIG: Record<'up' | 'down' | 'neutral', { colorClass: string; icon: string }> = {
  up: { colorClass: 'text-green-600', icon: '↑' },
  down: { colorClass: 'text-red-600', icon: '↓' },
  neutral: { colorClass: 'text-tier-text-secondary', icon: '−' },
};

// Column configuration
const COLUMN_CLASSES: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const StatsGridTemplate: React.FC<StatsGridTemplateProps> = ({
  items,
  columns,
  className = '',
}) => {
  const gridClass = columns
    ? `grid ${COLUMN_CLASSES[columns]} gap-3`
    : 'grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3';

  // Guard against undefined items
  const safeItems = items ?? [];

  return (
    <div className={`${gridClass} ${className}`}>
      {safeItems.map((item) => (
        <Card key={item.id} className="flex flex-col gap-2 transition-all duration-150">
          {/* Value and Label */}
          <div className="flex-1">
            <div className="text-xl font-bold text-tier-navy leading-tight mb-1">
              {item.value}
            </div>
            <div className="text-[11px] text-tier-text-secondary font-medium uppercase tracking-wide">
              {item.label}
            </div>
            {item.sublabel && (
              <div className="text-[10px] text-tier-text-tertiary mt-0.5">
                {item.sublabel}
              </div>
            )}
          </div>

          {/* Change Indicator */}
          {item.change && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${TREND_CONFIG[item.change.direction].colorClass}`}>
              <span className="text-[11px]">
                {TREND_CONFIG[item.change.direction].icon}
              </span>
              <span>{item.change.value}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default StatsGridTemplate;
