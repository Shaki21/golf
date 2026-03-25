/**
 * TrainingLoadChart Component
 * Bar chart showing weekly training load distribution
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../../../ui/primitives/Card';
import { TrainingLoad } from '../types/analytics.types';

export interface TrainingLoadChartProps {
  data: TrainingLoad[];
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
            {entry.dataKey === 'totalHours' && 'h'}
            {entry.dataKey === 'averageIntensity' && '/10'}
          </span>
        </div>
      ))}
    </Card>
  );
}

/**
 * Chart showing weekly training load
 *
 * @example
 * ```tsx
 * <TrainingLoadChart
 *   data={trainingLoadData}
 *   isLoading={false}
 * />
 * ```
 */
export function TrainingLoadChart({ data, isLoading = false }: TrainingLoadChartProps) {
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
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Training Load</h3>
        <div className="h-80 flex items-center justify-center text-tier-text-secondary">
          <p>No training load data available for the selected period</p>
        </div>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    weekStart: new Date(item.weekStart).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Training Load</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(10, 37, 64, 0.1)" />
          <XAxis
            dataKey="weekStart"
            stroke="rgba(10, 37, 64, 0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(10, 37, 64, 0.6)" style={{ fontSize: '12px' }} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '16px' }}
            iconType="rect"
          />
          <Bar
            dataKey="totalHours"
            fill="#0A2540"
            name="Total Hours"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="sessionCount"
            fill="#C9A227"
            name="Sessions"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="playerCount"
            fill="#10B981"
            name="Players"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default TrainingLoadChart;
