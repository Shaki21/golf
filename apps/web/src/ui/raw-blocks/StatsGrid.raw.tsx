import React from 'react';

/**
 * StatsGrid Raw Block
 * Responsive grid layout for displaying statistics
 */

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
}

interface StatsGridProps {
  /** Array of statistics to display */
  stats: StatItem[];
  /** Number of columns (auto-responsive if not specified) */
  columns?: 2 | 3 | 4;
  /** Compact mode for smaller displays */
  compact?: boolean;
  /** Show trend indicators */
  showTrend?: boolean;
  /** Click handler for stat items */
  onStatClick?: (stat: StatItem) => void;
}

// Column configuration
const COLUMN_CLASSES: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

// Trend color configuration
const TREND_CONFIG: Record<'up' | 'down' | 'neutral', { colorClass: string; icon: string }> = {
  up: { colorClass: 'text-green-600', icon: '↑' },
  down: { colorClass: 'text-red-600', icon: '↓' },
  neutral: { colorClass: 'text-tier-text-secondary', icon: '−' },
};

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns,
  compact = false,
  showTrend = true,
  onStatClick,
}) => {
  const gridClass = columns
    ? `grid ${COLUMN_CLASSES[columns]} gap-3`
    : 'grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3';

  const getTrendConfig = (trend?: 'up' | 'down' | 'neutral') => {
    return TREND_CONFIG[trend || 'neutral'];
  };

  return (
    <div className={gridClass}>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`bg-white rounded-lg shadow-sm flex flex-col transition-transform duration-150 ${
            compact ? 'p-3 gap-1' : 'p-4 gap-2'
          } ${onStatClick ? 'cursor-pointer hover:shadow-md' : ''}`}
          onClick={() => onStatClick?.(stat)}
          role={onStatClick ? 'button' : undefined}
          tabIndex={onStatClick ? 0 : undefined}
        >
          {/* Icon */}
          {stat.icon && (
            <div className="w-10 h-10 rounded bg-tier-gold/10 flex items-center justify-center text-tier-gold">
              {stat.icon}
            </div>
          )}

          {/* Value and Label */}
          <div className="flex-1">
            <div className={`font-bold text-tier-navy leading-tight mb-1 ${
              compact ? 'text-lg' : 'text-xl'
            }`}>
              {stat.value}
            </div>
            <div className="text-[11px] text-tier-text-secondary font-medium uppercase tracking-wide">
              {stat.label}
            </div>
            {stat.subtitle && (
              <div className="text-[10px] text-tier-text-tertiary mt-0.5">
                {stat.subtitle}
              </div>
            )}
          </div>

          {/* Trend Indicator */}
          {showTrend && stat.change !== undefined && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${getTrendConfig(stat.trend).colorClass}`}>
              <span className="text-sm">{getTrendConfig(stat.trend).icon}</span>
              <span>{Math.abs(stat.change)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
