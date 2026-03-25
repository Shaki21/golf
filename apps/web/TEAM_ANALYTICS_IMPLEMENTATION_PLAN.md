# Team Analytics Implementation Plan

**Sprint:** 5.11 - Team Analytics
**Date:** 2026-01-12
**Status:** Implementation Ready

---

## Overview

Build comprehensive team analytics for coaches to understand:
- Team performance trends
- Individual vs team comparisons
- Training load distribution
- Progress tracking across multiple players
- Insights and recommendations

---

## Goals

1. **Visual Intelligence** - Clear charts and graphs for quick insights
2. **Comparative Analysis** - Compare players against team averages
3. **Trend Detection** - Identify improvements or declines early
4. **Actionable Insights** - Recommendations based on data
5. **Export Capabilities** - Reports for sharing with stakeholders

---

## Architecture

### Component Structure

```
TeamAnalyticsPage
├── AnalyticsHeader (filters, date range, export)
├── KeyMetricsOverview (4-6 stat cards)
├── PerformanceTrendsChart (line chart over time)
├── PlayerComparisonTable (sortable table)
├── TrainingLoadDistribution (bar chart)
├── InsightsPanel (AI-powered recommendations)
└── ExportButton (PDF/CSV export)
```

### Data Flow

```
useTeamAnalytics Hook
├── Fetches from /coach-analytics/team
├── Aggregates player data
├── Computes team averages
├── Detects trends and anomalies
└── Generates insights
```

---

## Phase 1: Core Analytics (High Priority)

### 1.1 Team Analytics Page

**File:** `src/features/team-analytics/TeamAnalyticsPage.tsx`

```typescript
import React, { useState } from 'react';
import { useTeamAnalytics } from './hooks/useTeamAnalytics';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { KeyMetricsOverview } from './components/KeyMetricsOverview';
import { PerformanceTrendsChart } from './components/PerformanceTrendsChart';
import { PlayerComparisonTable } from './components/PlayerComparisonTable';
import { TrainingLoadChart } from './components/TrainingLoadChart';
import { InsightsPanel } from './components/InsightsPanel';
import { AnalyticsFilters } from './components/AnalyticsFilters';
import { ExportButton } from './components/ExportButton';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

export interface TeamAnalyticsFilters {
  dateRange: { from: Date; to: Date };
  playerIds: string[];
  metric: 'performance' | 'sessions' | 'goals' | 'all';
}

export default function TeamAnalyticsPage() {
  const [filters, setFilters] = useState<TeamAnalyticsFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date(),
    },
    playerIds: [],  // Empty = all players
    metric: 'all',
  });

  const { data, isLoading, error, refetch } = useTeamAnalytics(filters);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader title="Team Analytics" subtitle="Performance insights" />
        <PageContainer paddingY="lg" background="base">
          <LoadingState message="Loading team analytics..." />
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader title="Team Analytics" subtitle="Performance insights" />
        <PageContainer paddingY="lg" background="base">
          <ErrorState message={error} onRetry={refetch} />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Team Analytics"
        subtitle="Performance insights and trends"
        helpText="Analyze your team's performance, track progress, and identify areas for improvement."
        actions={
          <ExportButton
            data={data}
            filename={`team-analytics-${Date.now()}`}
          />
        }
      />

      <PageContainer paddingY="lg" background="base">
        {/* Filters */}
        <AnalyticsFilters
          filters={filters}
          onChange={setFilters}
          playerCount={data.players.length}
        />

        {/* Key Metrics */}
        <section className="mb-8">
          <KeyMetricsOverview metrics={data.keyMetrics} />
        </section>

        {/* Performance Trends */}
        <section className="mb-8">
          <PerformanceTrendsChart
            data={data.trends}
            dateRange={filters.dateRange}
          />
        </section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Training Load Distribution */}
          <section className="lg:col-span-2">
            <TrainingLoadChart data={data.trainingLoad} />
          </section>

          {/* AI Insights */}
          <section>
            <InsightsPanel
              insights={data.insights}
              recommendations={data.recommendations}
            />
          </section>
        </div>

        {/* Player Comparison Table */}
        <section>
          <PlayerComparisonTable
            players={data.players}
            teamAverage={data.teamAverage}
          />
        </section>
      </PageContainer>
    </div>
  );
}
```

### 1.2 Team Analytics Hook

**File:** `src/features/team-analytics/hooks/useTeamAnalytics.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../data/apiClient';
import type {
  TeamAnalyticsData,
  TeamAnalyticsFilters,
  KeyMetric,
  TrendDataPoint,
  PlayerComparison,
  Insight,
} from '../types';

export interface UseTeamAnalyticsResult {
  data: TeamAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching team analytics data
 */
export function useTeamAnalytics(
  filters: TeamAnalyticsFilters
): UseTeamAnalyticsResult {
  const [data, setData] = useState<TeamAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        from: filters.dateRange.from.toISOString(),
        to: filters.dateRange.to.toISOString(),
        metric: filters.metric,
      });

      if (filters.playerIds.length > 0) {
        params.append('players', filters.playerIds.join(','));
      }

      const response = await apiGet<TeamAnalyticsData>(
        `/coach-analytics/team?${params.toString()}`
      );

      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
```

---

## Phase 2: Visualization Components (High Priority)

### 2.1 Key Metrics Overview

**File:** `src/features/team-analytics/components/KeyMetricsOverview.tsx`

```typescript
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KeyMetric } from '../types';

interface KeyMetricsOverviewProps {
  metrics: KeyMetric[];
}

export function KeyMetricsOverview({ metrics }: KeyMetricsOverviewProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-tier-text-secondary" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-tier-text-secondary';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Label */}
          <p className="text-sm text-tier-text-secondary mb-2">
            {metric.label}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-tier-text-primary">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-lg text-tier-text-secondary">
                {metric.unit}
              </span>
            )}
          </div>

          {/* Trend */}
          {metric.change && (
            <div className="flex items-center gap-1">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
              <span className="text-sm text-tier-text-secondary">
                vs last period
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2.2 Performance Trends Chart

**File:** `src/features/team-analytics/components/PerformanceTrendsChart.tsx`

```typescript
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
import { format } from 'date-fns';
import type { TrendDataPoint } from '../types';

interface PerformanceTrendsChartProps {
  data: TrendDataPoint[];
  dateRange: { from: Date; to: Date };
}

export function PerformanceTrendsChart({
  data,
  dateRange,
}: PerformanceTrendsChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-tier-text-primary">
          Performance Trends
        </h3>
        <p className="text-sm text-tier-text-secondary">
          {format(dateRange.from, 'MMM d, yyyy')} -{' '}
          {format(dateRange.to, 'MMM d, yyyy')}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: 12 }}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sessionsCompleted"
            stroke="rgb(var(--tier-navy-rgb))"
            strokeWidth={2}
            name="Sessions"
            dot={{ fill: 'rgb(var(--tier-navy-rgb))' }}
          />
          <Line
            type="monotone"
            dataKey="averagePerformance"
            stroke="rgb(var(--tier-gold-rgb))"
            strokeWidth={2}
            name="Performance"
            dot={{ fill: 'rgb(var(--tier-gold-rgb))' }}
          />
          <Line
            type="monotone"
            dataKey="goalsCompleted"
            stroke="#10b981"
            strokeWidth={2}
            name="Goals"
            dot={{ fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 2.3 Player Comparison Table

**File:** `src/features/team-analytics/components/PlayerComparisonTable.tsx`

```typescript
import React, { useState } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { PlayerComparison, TeamAverage } from '../types';

interface PlayerComparisonTableProps {
  players: PlayerComparison[];
  teamAverage: TeamAverage;
}

type SortField = 'name' | 'sessions' | 'performance' | 'goals' | 'progress';
type SortDirection = 'asc' | 'desc';

export function PlayerComparisonTable({
  players,
  teamAverage,
}: PlayerComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('performance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const aNum = Number(aValue);
    const bNum = Number(bValue);

    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const getComparisonColor = (value: number, average: number) => {
    if (value > average * 1.1) return 'text-green-600';
    if (value < average * 0.9) return 'text-red-600';
    return 'text-tier-text-secondary';
  };

  const getComparisonIcon = (value: number, average: number) => {
    if (value > average * 1.1) return <TrendingUp size={14} className="text-green-600" />;
    if (value < average * 0.9) return <TrendingDown size={14} className="text-red-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-tier-border">
        <h3 className="text-lg font-semibold text-tier-text-primary">
          Player Comparison
        </h3>
        <p className="text-sm text-tier-text-secondary">
          Compare individual performance against team average
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-tier-surface-secondary">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-tier-text-primary uppercase tracking-wider cursor-pointer hover:bg-tier-surface-tertiary"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Player
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-tier-text-primary uppercase tracking-wider cursor-pointer hover:bg-tier-surface-tertiary"
                onClick={() => handleSort('sessions')}
              >
                <div className="flex items-center gap-2">
                  Sessions
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-tier-text-primary uppercase tracking-wider cursor-pointer hover:bg-tier-surface-tertiary"
                onClick={() => handleSort('performance')}
              >
                <div className="flex items-center gap-2">
                  Performance
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-tier-text-primary uppercase tracking-wider cursor-pointer hover:bg-tier-surface-tertiary"
                onClick={() => handleSort('goals')}
              >
                <div className="flex items-center gap-2">
                  Goals
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-tier-text-primary uppercase tracking-wider cursor-pointer hover:bg-tier-surface-tertiary"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center gap-2">
                  Progress
                  <ArrowUpDown size={14} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-tier-border">
            {sortedPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-tier-surface-base">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-tier-text-primary">
                      {player.name}
                    </div>
                    <div className="text-xs text-tier-text-secondary">
                      {player.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getComparisonColor(player.sessions, teamAverage.sessions)}`}>
                      {player.sessions}
                    </span>
                    {getComparisonIcon(player.sessions, teamAverage.sessions)}
                  </div>
                  <div className="text-xs text-tier-text-secondary">
                    Avg: {teamAverage.sessions}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getComparisonColor(player.performance, teamAverage.performance)}`}>
                      {player.performance.toFixed(1)}
                    </span>
                    {getComparisonIcon(player.performance, teamAverage.performance)}
                  </div>
                  <div className="text-xs text-tier-text-secondary">
                    Avg: {teamAverage.performance.toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getComparisonColor(player.goals, teamAverage.goals)}`}>
                      {player.goals}
                    </span>
                    {getComparisonIcon(player.goals, teamAverage.goals)}
                  </div>
                  <div className="text-xs text-tier-text-secondary">
                    Avg: {teamAverage.goals}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-tier-surface-secondary rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-tier-gold h-2 rounded-full"
                        style={{ width: `${Math.min(player.progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-tier-text-primary">
                      {player.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Core Analytics (Week 1)
- [ ] Create `TeamAnalyticsPage` component
- [ ] Create `useTeamAnalytics` hook
- [ ] Define TypeScript types
- [ ] Add route to App.jsx
- [ ] Test basic layout

### Phase 2: Visualizations (Week 1-2)
- [ ] Install recharts and date-fns
- [ ] Create `KeyMetricsOverview` component
- [ ] Create `PerformanceTrendsChart` component
- [ ] Create `PlayerComparisonTable` component
- [ ] Create `TrainingLoadChart` component
- [ ] Test all charts render correctly

### Phase 3: Insights & Export (Week 2)
- [ ] Create `InsightsPanel` component
- [ ] Create `ExportButton` component
- [ ] Implement PDF export
- [ ] Implement CSV export
- [ ] Test export functionality

### Phase 4: Filters & Polish (Week 2)
- [ ] Create `AnalyticsFilters` component
- [ ] Add date range picker
- [ ] Add player selector
- [ ] Test filter combinations
- [ ] Mobile optimization

---

## Dependencies

```bash
# Install required packages
npm install recharts date-fns jspdf
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test analytics hook
test('useTeamAnalytics fetches data correctly')
test('useTeamAnalytics handles errors')

// Test components
test('KeyMetricsOverview displays metrics')
test('PlayerComparisonTable sorts correctly')
test('PerformanceTrendsChart renders chart')
```

### E2E Tests
```typescript
// Test full analytics flow
test('coach can view team analytics')
test('coach can filter by date range')
test('coach can export analytics report')
test('coach can compare players')
```

---

## Success Metrics

- [ ] Analytics page loads < 2s
- [ ] Charts render smoothly (60fps)
- [ ] Export generates PDF/CSV successfully
- [ ] Filters update data correctly
- [ ] Mobile responsive
- [ ] Lighthouse score > 90

---

**Status:** Implementation Ready
**Estimated Effort:** 2 weeks (1 developer)
**Dependencies:** Backend API `/coach-analytics/team`
