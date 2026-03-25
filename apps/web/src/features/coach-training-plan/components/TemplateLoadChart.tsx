/**
 * TemplateLoadChart Component
 * Visualizes weekly training load distribution with category breakdown
 */

import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { WeeklyMetrics, TemplatePeriod } from '../types/template.types';

interface TemplateLoadChartProps {
  weeklyMetrics: WeeklyMetrics[];
  periods?: TemplatePeriod[];
  height?: number;
  showLoadLine?: boolean;
}

// Category colors matching the session blocks
const CATEGORY_COLORS: Record<string, string> = {
  TEE: '#C9A227', // Gold
  APP: '#0A2540', // Navy
  SGR: '#10B981', // Success/Emerald
  PGR: '#3B82F6', // Blue/Accent
  GBR: '#F59E0B'  // Warning/Orange
};

interface ChartDataPoint {
  week: string;
  weekNumber: number;
  totalMinutes: number;
  loadScore: number;
  sessionCount: number;
  periodColor?: string;
  [key: string]: any; // For dynamic category keys
}

export function TemplateLoadChart({
  weeklyMetrics,
  periods = [],
  height = 400,
  showLoadLine = true
}: TemplateLoadChartProps) {
  // Transform data for chart
  const chartData: ChartDataPoint[] = weeklyMetrics.map(week => {
    // Find period for this week
    const period = periods.find(p => week.weekNumber >= p.startWeek && week.weekNumber <= p.endWeek);

    const dataPoint: ChartDataPoint = {
      week: `W${week.weekNumber}`,
      weekNumber: week.weekNumber,
      totalMinutes: week.totalMinutes,
      loadScore: week.loadScore,
      sessionCount: week.sessionCount,
      periodColor: period?.color
    };

    // Add category breakdown as separate keys
    Object.entries(week.categoryBreakdown).forEach(([category, data]) => {
      dataPoint[category] = data.minutes;
    });

    return dataPoint;
  });

  // Get all unique categories across all weeks
  const allCategories = Array.from(
    new Set(
      weeklyMetrics.flatMap(w => Object.keys(w.categoryBreakdown))
    )
  ).sort(); // Sort for consistent order

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-tier-navy/10">
        <p className="font-semibold text-tier-navy mb-2">{label}</p>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-tier-navy/70">Total:</span>
            <span className="text-sm font-semibold text-tier-navy">
              {data.totalMinutes} min
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-tier-navy/70">Sessions:</span>
            <span className="text-sm font-medium text-tier-navy">
              {data.sessionCount}
            </span>
          </div>

          {showLoadLine && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-tier-navy/70">Load Score:</span>
              <span className="text-sm font-medium text-tier-navy">
                {data.loadScore}/100
              </span>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        {allCategories.length > 0 && (
          <div className="mt-2 pt-2 border-t border-tier-navy/10">
            <p className="text-xs text-tier-navy/70 mb-1">Categories:</p>
            {allCategories.map(cat => {
              const minutes = data[cat] || 0;
              if (minutes === 0) return null;
              return (
                <div key={cat} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] || '#6B7280' }}
                    />
                    <span className="text-xs text-tier-navy/80">{cat}</span>
                  </div>
                  <span className="text-xs font-medium text-tier-navy">
                    {minutes} min
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Calculate max value for Y-axis
  const maxMinutes = Math.max(...weeklyMetrics.map(w => w.totalMinutes), 60);
  const yAxisMax = Math.ceil(maxMinutes / 60) * 60; // Round up to nearest hour

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-tier-navy flex items-center gap-2">
            <TrendingUp size={20} />
            Training Load Distribution
          </h3>
          <div className="flex gap-3 text-xs text-tier-navy/60">
            <div className="flex items-center gap-1">
              <span>Total:</span>
              <span className="font-semibold text-tier-navy">
                {weeklyMetrics.reduce((sum, w) => sum + w.totalMinutes, 0)} min
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Sessions:</span>
              <span className="font-semibold text-tier-navy">
                {weeklyMetrics.reduce((sum, w) => sum + w.sessionCount, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            {/* Period background colors */}
            {periods.map(period => {
              const startIndex = period.startWeek - 1;
              const endIndex = period.endWeek - 1;
              if (startIndex < 0 || endIndex >= chartData.length) return null;

              return (
                <defs key={period.id}>
                  <pattern
                    id={`period-pattern-${period.id}`}
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                    patternUnits="objectBoundingBox"
                  >
                    <rect
                      width="100%"
                      height="100%"
                      fill={period.color}
                      opacity="0.05"
                    />
                  </pattern>
                </defs>
              );
            })}

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="week"
              tick={{ fill: '#0A2540', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              domain={[0, yAxisMax]}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: '#0A2540', fontSize: 12 } }}
              tick={{ fill: '#0A2540', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              iconSize={12}
            />

            {/* Stacked bars for categories */}
            {allCategories.map(category => (
              <Bar
                key={category}
                dataKey={category}
                stackId="a"
                fill={CATEGORY_COLORS[category] || '#6B7280'}
                name={category}
                radius={[0, 0, 0, 0]}
                maxBarSize={60}
              >
                {/* Apply period background color to bars */}
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[category] || '#6B7280'}
                  />
                ))}
              </Bar>
            ))}

            {/* Load score line overlay */}
            {showLoadLine && (
              <Line
                type="monotone"
                dataKey="loadScore"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 4 }}
                activeDot={{ r: 6 }}
                name="Load Score"
                yAxisId="right"
              />
            )}

            {/* Right Y-axis for load score */}
            {showLoadLine && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                label={{ value: 'Load Score', angle: 90, position: 'insideRight', style: { fill: '#EF4444', fontSize: 12 } }}
                tick={{ fill: '#EF4444', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend for categories */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-tier-navy/10">
          {allCategories.map(category => (
            <div key={category} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: CATEGORY_COLORS[category] || '#6B7280' }}
              />
              <span className="text-tier-navy">{category}</span>
              <span className="text-tier-navy/60">
                ({weeklyMetrics.reduce((sum, w) => sum + (w.categoryBreakdown[category]?.minutes || 0), 0)} min)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default TemplateLoadChart;
