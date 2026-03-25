/**
 * KeyMetricsOverview Component
 * Displays key team metrics in card format
 */

import React from 'react';
import { Card } from '../../../ui/primitives/Card';
import { Users, Activity, Target, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { TeamMetrics } from '../types/analytics.types';

export interface KeyMetricsOverviewProps {
  metrics: TeamMetrics;
  isLoading?: boolean;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'success';
  suffix?: string;
}

function MetricCard({ label, value, icon, variant = 'default', suffix = '' }: MetricCardProps) {
  const variantStyles = {
    default: 'text-tier-navy',
    warning: 'text-tier-warning',
    success: 'text-tier-success',
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-tier-text-secondary mb-1">{label}</p>
          <p className={`text-3xl font-bold ${variantStyles[variant]}`}>
            {value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-tier-navy/5 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

/**
 * Overview of key team metrics
 *
 * @example
 * ```tsx
 * <KeyMetricsOverview
 *   metrics={teamMetrics}
 *   isLoading={false}
 * />
 * ```
 */
export function KeyMetricsOverview({ metrics, isLoading = false }: KeyMetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 h-24 animate-pulse bg-tier-surface-secondary">
            <div className="h-full" />
          </Card>
        ))}
      </div>
    );
  }

  const metrics_data = [
    {
      label: 'Total Players',
      value: metrics.totalPlayers,
      icon: <Users className="text-tier-navy" size={24} />,
      variant: 'default' as const,
    },
    {
      label: 'Active This Week',
      value: metrics.activeThisWeek,
      icon: <Activity className="text-tier-success" size={24} />,
      variant: 'success' as const,
    },
    {
      label: 'Avg Sessions/Week',
      value: metrics.averageSessionsPerWeek.toFixed(1),
      icon: <Calendar className="text-tier-navy" size={24} />,
      variant: 'default' as const,
    },
    {
      label: 'Sessions This Month',
      value: metrics.totalSessionsThisMonth,
      icon: <TrendingUp className="text-tier-navy" size={24} />,
      variant: 'default' as const,
    },
    {
      label: 'Avg Goal Completion',
      value: Math.round(metrics.averageGoalCompletion),
      icon: <Target className="text-tier-gold" size={24} />,
      variant: 'default' as const,
      suffix: '%',
    },
    {
      label: 'Need Attention',
      value: metrics.playersNeedingAttention,
      icon: <AlertCircle className="text-tier-warning" size={24} />,
      variant: (metrics.playersNeedingAttention > 0 ? 'warning' : 'default') as 'warning' | 'default',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-tier-navy">Team Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics_data.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  );
}

export default KeyMetricsOverview;
