/**
 * InsightKPI - Metric Display with Actionable Insight
 *
 * TIER Golf Design System - Implements "Insight-First KPI Pattern"
 *
 * Every metric is paired with:
 * 1. The metric value itself
 * 2. An insight explaining what it means
 * 3. An optional action to take
 *
 * This helps users understand not just "what" but "so what" and "now what".
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Minus, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusIndicator, StatusType } from '../ui/StatusIndicator';
import { Button } from '../shadcn/button';

// =============================================================================
// TYPES
// =============================================================================

export interface InsightKPIMetric {
  /** The metric value (number or string) */
  value: number | string;
  /** Label for the metric */
  label: string;
  /** Trend direction */
  trend?: 'up' | 'down' | 'stable';
  /** Trend value (e.g., "+12%") */
  trendValue?: string;
}

export interface InsightKPIInsight {
  /** Status determines color and icon */
  status: 'positive' | 'warning' | 'critical' | 'neutral';
  /** The insight message explaining the metric */
  message: string;
  /** Optional action button */
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
}

export interface InsightKPIContext {
  /** Target value for comparison */
  target?: number | string;
  /** Comparison text (e.g., "vs. last week") */
  comparison?: string;
}

export interface InsightKPIProps {
  /** The metric to display */
  metric: InsightKPIMetric;
  /** The insight explaining the metric */
  insight: InsightKPIInsight;
  /** Optional context (target, comparison) */
  context?: InsightKPIContext;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout variant */
  variant?: 'card' | 'inline' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const statusToType: Record<InsightKPIInsight['status'], StatusType> = {
  positive: 'success',
  warning: 'warning',
  critical: 'critical',
  neutral: 'neutral',
};

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
};

const sizeStyles = {
  sm: {
    value: 'text-xl font-bold',
    label: 'text-xs',
    insight: 'text-xs',
    padding: 'p-3',
    gap: 'gap-2',
  },
  md: {
    value: 'text-2xl font-bold',
    label: 'text-sm',
    insight: 'text-sm',
    padding: 'p-4',
    gap: 'gap-3',
  },
  lg: {
    value: 'text-3xl font-bold',
    label: 'text-base',
    insight: 'text-base',
    padding: 'p-5',
    gap: 'gap-4',
  },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function TrendIndicator({
  trend,
  value,
  size = 'md',
}: {
  trend: 'up' | 'down' | 'stable';
  value?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const Icon = trendIcons[trend];
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  const colorClass =
    trend === 'up'
      ? 'text-status-success'
      : trend === 'down'
        ? 'text-status-error'
        : 'text-gray-500';

  return (
    <span className={cn('inline-flex items-center gap-0.5', colorClass)}>
      <Icon size={iconSize} />
      {value && <span className="text-xs font-medium">{value}</span>}
    </span>
  );
}

function InsightMessage({
  status,
  message,
  size = 'md',
}: {
  status: InsightKPIInsight['status'];
  message: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const styles = sizeStyles[size];

  const colorClass =
    status === 'positive'
      ? 'text-status-success'
      : status === 'warning'
        ? 'text-status-warning'
        : status === 'critical'
          ? 'text-status-error'
          : 'text-gray-600';

  return (
    <div className={cn('flex items-start gap-1.5', styles.insight, colorClass)}>
      <Lightbulb size={size === 'sm' ? 12 : 14} className="mt-0.5 flex-shrink-0 opacity-70" />
      <span>{message}</span>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InsightKPI({
  metric,
  insight,
  context,
  size = 'md',
  variant = 'card',
  className,
}: InsightKPIProps) {
  const styles = sizeStyles[size];

  // Inline variant - horizontal layout
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center justify-between',
          styles.gap,
          className
        )}
      >
        {/* Left: Metric */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-tier-navy', styles.value)}>
                {metric.value}
              </span>
              {metric.trend && (
                <TrendIndicator
                  trend={metric.trend}
                  value={metric.trendValue}
                  size={size}
                />
              )}
            </div>
            <span className={cn('text-tier-text-secondary', styles.label)}>
              {metric.label}
            </span>
          </div>
        </div>

        {/* Right: Status + Action */}
        <div className="flex items-center gap-2">
          <StatusIndicator
            status={statusToType[insight.status]}
            size={size === 'lg' ? 'md' : 'sm'}
            variant="pill"
            showIcon={false}
          />
          {insight.action && (
            <Link to={insight.action.href}>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <ChevronRight size={16} />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Compact variant - minimal vertical layout
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col', styles.gap, className)}>
        {/* Metric */}
        <div className="flex items-baseline justify-between">
          <span className={cn('text-tier-text-secondary', styles.label)}>
            {metric.label}
          </span>
          {metric.trend && (
            <TrendIndicator
              trend={metric.trend}
              value={metric.trendValue}
              size={size}
            />
          )}
        </div>
        <span className={cn('text-tier-navy', styles.value)}>{metric.value}</span>

        {/* Insight */}
        <InsightMessage status={insight.status} message={insight.message} size={size} />

        {/* Action */}
        {insight.action && (
          <Link to={insight.action.href} onClick={insight.action.onClick}>
            <Button variant="outline" size="sm" className="w-full mt-1">
              {insight.action.label}
            </Button>
          </Link>
        )}
      </div>
    );
  }

  // Card variant (default) - full card layout
  return (
    <div
      className={cn(
        'rounded-lg border border-tier-border-default bg-tier-white',
        styles.padding,
        className
      )}
    >
      {/* Header: Label + Status Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn('text-tier-text-secondary font-medium', styles.label)}>
          {metric.label}
        </span>
        <StatusIndicator
          status={statusToType[insight.status]}
          size={size === 'lg' ? 'md' : 'sm'}
          variant="pill"
        />
      </div>

      {/* Metric Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={cn('text-tier-navy', styles.value)}>{metric.value}</span>
        {metric.trend && (
          <TrendIndicator
            trend={metric.trend}
            value={metric.trendValue}
            size={size}
          />
        )}
      </div>

      {/* Context (target, comparison) */}
      {context && (
        <div className={cn('text-tier-text-tertiary mb-3', styles.label)}>
          {context.target && <span>Target: {context.target}</span>}
          {context.target && context.comparison && <span> • </span>}
          {context.comparison && <span>{context.comparison}</span>}
        </div>
      )}

      {/* Insight Message */}
      <InsightMessage status={insight.status} message={insight.message} size={size} />

      {/* Action Button */}
      {insight.action && (
        <div className="mt-3">
          <Link to={insight.action.href} onClick={insight.action.onClick}>
            <Button
              variant={insight.status === 'critical' ? 'default' : 'outline'}
              size={size === 'sm' ? 'sm' : 'default'}
              className="w-full"
            >
              {insight.action.label}
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// GRID COMPONENT
// =============================================================================

export interface InsightKPIGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function InsightKPIGrid({
  children,
  columns = 2,
  className,
}: InsightKPIGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create an InsightKPI for a goal progress
 */
export function createGoalInsightKPI(
  goalName: string,
  current: number,
  target: number,
  unit: string = 'sessions',
  actionHref?: string
): InsightKPIProps {
  const remaining = target - current;
  const percentage = (current / target) * 100;

  let insight: InsightKPIInsight;

  if (current >= target) {
    insight = {
      status: 'positive',
      message: 'Goal reached! Great work.',
    };
  } else if (percentage >= 70) {
    insight = {
      status: 'positive',
      message: `${remaining} ${unit} remaining. You're on track!`,
      action: actionHref ? { label: 'Continue training', href: actionHref } : undefined,
    };
  } else if (percentage >= 40) {
    insight = {
      status: 'warning',
      message: `Train ${remaining} more ${unit} to reach your goal.`,
      action: actionHref ? { label: 'Start training', href: actionHref } : undefined,
    };
  } else {
    insight = {
      status: 'critical',
      message: `${remaining} ${unit} behind schedule. Train today!`,
      action: actionHref ? { label: 'Start now', href: actionHref } : undefined,
    };
  }

  return {
    metric: {
      value: `${current} / ${target}`,
      label: goalName,
    },
    insight,
    context: {
      target: `${target} ${unit}`,
    },
  };
}

export default InsightKPI;
