import React from 'react';

/**
 * StatsTrend Raw Block
 * Visual representation of statistical trends with sparkline
 */

interface DataPoint {
  value: number;
  label?: string;
  date?: string;
}

interface StatsTrendProps {
  /** Main metric value */
  value: string | number;
  /** Metric label */
  label: string;
  /** Data points for trend visualization */
  data: DataPoint[];
  /** Change percentage */
  change?: number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Color theme */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'gold';
  /** Show sparkline chart */
  showChart?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// Color configuration for value display
const COLOR_CONFIG: Record<string, string> = {
  primary: 'text-tier-gold',
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  gold: 'text-purple-600',
};

// SVG stroke colors
const STROKE_COLORS: Record<string, string> = {
  primary: '#C9A227',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  gold: '#9333ea',
};

// Trend color configuration
const TREND_CONFIG: Record<'up' | 'down' | 'neutral', { colorClass: string; icon: string }> = {
  up: { colorClass: 'text-green-600', icon: '↗' },
  down: { colorClass: 'text-red-600', icon: '↘' },
  neutral: { colorClass: 'text-tier-text-secondary', icon: '→' },
};

const StatsTrend: React.FC<StatsTrendProps> = ({
  value,
  label,
  data,
  change,
  trend,
  color = 'primary',
  showChart = true,
  compact = false,
}) => {
  const getColorClass = () => COLOR_CONFIG[color] || COLOR_CONFIG.primary;
  const getStrokeColor = () => STROKE_COLORS[color] || STROKE_COLORS.primary;
  const getTrendConfig = () => TREND_CONFIG[trend || 'neutral'];

  // Calculate sparkline path
  const generateSparkline = () => {
    if (data.length < 2) return '';

    const width = 100;
    const height = 40;
    const padding = 4;

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm flex flex-col ${
      compact ? 'p-3 gap-2' : 'p-4 gap-3'
    }`}>
      {/* Header: Value and Change */}
      <div className="flex justify-between items-start">
        <div>
          <div className={`font-bold leading-tight mb-1 ${getColorClass()} ${
            compact ? 'text-lg' : 'text-xl'
          }`}>
            {value}
          </div>
          <div className="text-[11px] text-tier-text-secondary font-medium uppercase tracking-wide">
            {label}
          </div>
        </div>

        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded bg-black/5 ${getTrendConfig().colorClass}`}>
            <span className="text-base">{getTrendConfig().icon}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {/* Sparkline Chart */}
      {showChart && data.length > 1 && (
        <div className="w-full">
          <svg
            width="100%"
            height={compact ? "30" : "40"}
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="block w-full"
          >
            {/* Background grid line */}
            <line
              x1="0"
              y1="20"
              x2="100"
              y2="20"
              stroke="currentColor"
              className="text-tier-border-subtle"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />

            {/* Trend line */}
            <path
              d={generateSparkline()}
              fill="none"
              stroke={getStrokeColor()}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Area fill */}
            <path
              d={`${generateSparkline()} L 100,40 L 0,40 Z`}
              fill={getStrokeColor()}
              fillOpacity="0.1"
            />

            {/* Data points */}
            {!compact && data.map((d, i) => {
              const values = data.map(d => d.value);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              const x = (i / (data.length - 1)) * 96 + 4;
              const y = 36 - ((d.value - min) / range) * 32;

              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={getStrokeColor()}
                />
              );
            })}
          </svg>
        </div>
      )}

      {/* Data Range */}
      {!compact && data.length > 0 && (
        <div className="flex justify-between pt-1">
          <span className="text-[10px] text-tier-text-tertiary">
            {data[0].label || data[0].date || 'Start'}
          </span>
          <span className="text-[10px] text-tier-text-tertiary">
            {data[data.length - 1].label || data[data.length - 1].date || 'End'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsTrend;
