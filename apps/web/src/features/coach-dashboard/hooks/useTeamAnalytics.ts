/**
 * useTeamAnalytics Hook
 * Fetches and manages team analytics data
 */

import { useState, useEffect } from 'react';
import { apiGet } from '../../../data/apiClient';
import { TeamAnalyticsData, TeamAnalyticsFilters } from '../types/analytics.types';

export interface UseTeamAnalyticsOptions {
  filters?: TeamAnalyticsFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseTeamAnalyticsReturn {
  data: TeamAnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching team analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTeamAnalytics({
 *   filters: { timeRange: '30d' },
 * });
 * ```
 */
export function useTeamAnalytics(
  options: UseTeamAnalyticsOptions = {}
): UseTeamAnalyticsReturn {
  const { filters = { timeRange: '30d' }, enabled = true, refetchInterval } = options;

  const [data, setData] = useState<TeamAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('timeRange', filters.timeRange);
      if (filters.playerCategory) {
        params.append('category', filters.playerCategory);
      }
      if (filters.includeInactive !== undefined) {
        params.append('includeInactive', filters.includeInactive.toString());
      }

      const response = await apiGet<TeamAnalyticsData>(
        `/coach/team-analytics?${params.toString()}`
      );

      setData(response);
    } catch (err) {
      console.error('[useTeamAnalytics] Error fetching analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch team analytics'));

      // Fallback to empty data structure
      setData({
        metrics: {
          totalPlayers: 0,
          activeThisWeek: 0,
          averageSessionsPerWeek: 0,
          totalSessionsThisMonth: 0,
          averageGoalCompletion: 0,
          playersNeedingAttention: 0,
        },
        performanceTrends: [],
        playerComparisons: [],
        trainingLoad: [],
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [filters.timeRange, filters.playerCategory, filters.includeInactive, enabled]);

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const intervalId = setInterval(fetchAnalytics, refetchInterval);
    return () => clearInterval(intervalId);
  }, [refetchInterval, enabled, filters]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

export default useTeamAnalytics;
