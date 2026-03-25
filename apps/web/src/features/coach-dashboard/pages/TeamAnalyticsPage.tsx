/**
 * TeamAnalyticsPage
 * Comprehensive team analytics dashboard for coaches
 */

import React, { useState } from 'react';
import { Page } from '../../../ui/components/Page/Page';
import StateCard from '../../../ui/composites/StateCard';
import { Button } from '../../../components/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/shadcn/select';
import { RefreshCw, Download, Filter } from 'lucide-react';
import { useTeamAnalytics } from '../hooks/useTeamAnalytics';
import { TeamAnalyticsFilters } from '../types/analytics.types';
import { KeyMetricsOverview } from '../components/KeyMetricsOverview';
import { PerformanceTrendsChart } from '../components/PerformanceTrendsChart';
import { PlayerComparisonTable } from '../components/PlayerComparisonTable';
import { TrainingLoadChart } from '../components/TrainingLoadChart';
import { toast } from 'sonner';

/**
 * Main team analytics page with comprehensive metrics and visualizations
 */
export function TeamAnalyticsPage() {
  const [filters, setFilters] = useState<TeamAnalyticsFilters>({
    timeRange: '30d',
    includeInactive: false,
  });

  const { data, isLoading, error, refetch } = useTeamAnalytics({
    filters,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const handleTimeRangeChange = (value: TeamAnalyticsFilters['timeRange']) => {
    setFilters({ ...filters, timeRange: value });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      playerCategory: value === 'all' ? undefined : (value as 'A' | 'B' | 'C'),
    });
  };

  const handleRefresh = async () => {
    toast.loading('Refreshing analytics...');
    await refetch();
    toast.dismiss();
    toast.success('Analytics updated');
  };

  const handleExport = () => {
    if (!data) {
      toast.error('No data to export');
      return;
    }

    try {
      const csvData = data.playerComparisons.map((player) => ({
        Name: player.playerName,
        Category: player.category || '-',
        Sessions: player.sessionsThisMonth,
        'Avg Duration (min)': player.averageSessionDuration,
        'Goals Completed': player.goalsCompleted,
        'Goals Total': player.goalsTotal,
        'Performance Score': player.performanceScore,
      }));

      const headers = Object.keys(csvData[0]);
      const csv = [
        headers.join(','),
        ...csvData.map((row) => headers.map((h) => row[h as keyof typeof row]).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Analytics exported');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export analytics');
    }
  };

  // Error state
  if (error && !data) {
    return (
      <Page>
        <Page.Header
          title="Team Analytics"
          subtitle="Comprehensive team performance insights"
        />
        <Page.Content>
          <StateCard
            variant="error"
            icon={Filter}
            title="Failed to load analytics"
            description={error.message}
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        </Page.Content>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Header
        title="Team Analytics"
        subtitle="Comprehensive team performance insights"
      />
      <Page.Content>
        <div className="space-y-6">
        {/* Filters and actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Time range filter */}
            <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select
              value={filters.playerCategory || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="A">Category A</SelectItem>
                <SelectItem value="B">Category B</SelectItem>
                <SelectItem value="C">Category C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!data || isLoading}
            >
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        {data && <KeyMetricsOverview metrics={data.metrics} isLoading={isLoading} />}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data && (
            <>
              <PerformanceTrendsChart
                data={data.performanceTrends}
                isLoading={isLoading}
              />
              <TrainingLoadChart data={data.trainingLoad} isLoading={isLoading} />
            </>
          )}
        </div>

        {/* Player comparison table */}
        {data && (
          <PlayerComparisonTable players={data.playerComparisons} isLoading={isLoading} />
        )}
        </div>
      </Page.Content>
    </Page>
  );
}

export default TeamAnalyticsPage;
