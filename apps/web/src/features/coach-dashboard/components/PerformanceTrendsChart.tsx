/**
 * PerformanceTrendsChart Component
 * Line chart showing team performance trends over time
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../../ui/primitives/Card';
import { PerformanceTrend } from '../types/analytics.types';

export interface PerformanceTrendsChartProps {
  data: PerformanceTrend[];
  isLoading?: boolean;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Card className="p-3 shadow-lg border border-tier-navy/20">
      <p className="text-sm font-medium text-tier-navy mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-tier-text-secondary">{entry.name}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.value}
          </span>
        </div>
      ))}
    </Card>
  );
}

/**
 * Chart showing performance trends over time
 *
 * @example
 * ```tsx
 * <PerformanceTrendsChart
 *   data={performanceTrends}
 *   isLoading={false}
 * />
 * ```
 */
export function PerformanceTrendsChart({
  data,
  isLoading = false,
}: PerformanceTrendsChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-80 animate-pulse bg-tier-surface-secondary rounded" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Performance Trends</h3>
        <div className="h-80 flex items-center justify-center text-tier-text-secondary">
          <p>No performance data available for the selected period</p>
        </div>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Performance Trends</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(10, 37, 64, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(10, 37, 64, 0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(10, 37, 64, 0.6)" style={{ fontSize: '12px' }} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '16px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="averageScore"
            stroke="#0A2540"
            strokeWidth={2}
            name="Average Score"
            dot={{ fill: '#0A2540', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="sessionCount"
            stroke="#C9A227"
            strokeWidth={2}
            name="Sessions"
            dot={{ fill: '#C9A227', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="activePlayerCount"
            stroke="#10B981"
            strokeWidth={2}
            name="Active Players"
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default PerformanceTrendsChart;
