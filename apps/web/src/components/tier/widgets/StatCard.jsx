import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TierCard } from '../TierCard';
import { TierBadge } from '../TierBadge';

/**
 * TIER Golf Stat Card Widget
 *
 * Displays a key metric with icon, value, trend, and optional context.
 * Perfect for dashboards and overview pages.
 *
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string|number} props.value - Main stat value
 * @param {string} props.label - Stat label/description
 * @param {number} props.trend - Trend value (positive/negative/zero)
 * @param {string} props.trendLabel - Trend label (e.g., "vs forrige uke")
 * @param {string} props.context - Additional context message
 * @param {string} props.iconColor - Icon background color (hex or CSS var)
 * @param {'success' | 'warning' | 'error' | 'neutral'} props.status - Status badge variant
 * @param {string} props.statusLabel - Custom status label
 * @param {Object} props.progress - Progress bar { current, max, color }
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <StatCard
 *   icon={Target}
 *   value="12/15"
 *   label="Økter denne uken"
 *   trend={+3}
 *   trendLabel="vs forrige uke"
 *   status="success"
 *   progress={{ current: 12, max: 15 }}
 * />
 */

export function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  trendLabel,
  context,
  iconColor = 'rgb(var(--tier-navy))',
  status,
  statusLabel,
  progress,
  className,
  ...props
}) {
  const progressPercent = progress
    ? Math.round((progress.current / progress.max) * 100)
    : null;

  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return '';
    if (trend > 0) return 'text-status-success';
    if (trend < 0) return 'text-status-error';
    return 'text-text-tertiary';
  };

  const getStatusVariant = () => {
    if (status) return status;
    // Auto-determine from progress
    if (progress) {
      const percent = (progress.current / progress.max) * 100;
      if (percent >= 90) return 'success';
      if (percent >= 50) return 'warning';
      return 'neutral';
    }
    return 'neutral';
  };

  return (
    <TierCard className={cn('p-5', className)} {...props}>
      {/* Header row: Icon + Status badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${iconColor}15`,
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: iconColor }}
          />
        </div>

        {(status || statusLabel) && (
          <TierBadge variant={getStatusVariant()} size="sm">
            {statusLabel || (status === 'success' ? '✓ På mål' : status === 'warning' ? 'alert-triangle Henger etter' : 'OK')}
          </TierBadge>
        )}
      </div>

      {/* Main value */}
      <div className="font-display text-3xl font-bold text-tier-navy mb-1">
        {value}
      </div>

      {/* Label */}
      <div className="text-sm text-text-secondary mb-3">
        {label}
      </div>

      {/* Trend */}
      {trend !== undefined && trend !== null && (
        <div className={cn('flex items-center gap-1 text-sm font-medium mb-3', getTrendColor())}>
          {getTrendIcon()}
          <span>
            {trend > 0 && '+'}
            {trend} {trendLabel}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {progress && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: progress.color || 'rgb(var(--status-success))',
              }}
            />
          </div>
          <div className="text-xs text-text-muted">
            {progressPercent}% av mål ({progress.max})
          </div>
        </div>
      )}

      {/* Context message */}
      {context && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-text-tertiary">{context}</p>
        </div>
      )}
    </TierCard>
  );
}

StatCard.displayName = 'StatCard';
