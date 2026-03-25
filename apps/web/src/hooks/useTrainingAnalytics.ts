/**
 * useTrainingAnalytics Hook
 * Fetches training analytics data including trends and completion rates
 *
 * Uses the training-plan analytics endpoint for comprehensive data
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { checkFeature } from '../config/featureFlags';

export interface WeeklyTrendItem {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  completed: number;
  planned: number;
  completionRate: number;
  totalHours: number;
}

export interface PeriodBreakdown {
  [periodName: string]: {
    completed: number;
    planned: number;
    completionRate: number;
    totalHours: number;
  };
}

export interface TrainingOverview {
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalSessionsCompleted: number;
  totalSessionsPlanned: number;
  totalHoursCompleted: number;
  averageSessionsPerWeek: number;
}

export interface TrainingAnalytics {
  overview: TrainingOverview;
  weeklyTrend: WeeklyTrendItem[];
  periodBreakdown: PeriodBreakdown;
}

interface UseTrainingAnalyticsResult {
  data: TrainingAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Demo data for development
const getDemoTrainingAnalytics = (): TrainingAnalytics => ({
  overview: {
    completionRate: 78,
    currentStreak: 5,
    longestStreak: 12,
    totalSessionsCompleted: 45,
    totalSessionsPlanned: 58,
    totalHoursCompleted: 67.5,
    averageSessionsPerWeek: 4.2,
  },
  weeklyTrend: [
    { weekStart: '2025-12-02', weekEnd: '2025-12-08', weekNumber: 49, completed: 4, planned: 5, completionRate: 80, totalHours: 6 },
    { weekStart: '2025-12-09', weekEnd: '2025-12-15', weekNumber: 50, completed: 5, planned: 5, completionRate: 100, totalHours: 7.5 },
    { weekStart: '2025-12-16', weekEnd: '2025-12-22', weekNumber: 51, completed: 3, planned: 5, completionRate: 60, totalHours: 4.5 },
    { weekStart: '2025-12-23', weekEnd: '2025-12-29', weekNumber: 52, completed: 4, planned: 4, completionRate: 100, totalHours: 6 },
    { weekStart: '2025-12-30', weekEnd: '2026-01-05', weekNumber: 1, completed: 2, planned: 5, completionRate: 40, totalHours: 3 },
  ],
  periodBreakdown: {
    'Forberedelse': { completed: 12, planned: 15, completionRate: 80, totalHours: 18 },
    'Konkurranseperiode': { completed: 20, planned: 25, completionRate: 80, totalHours: 30 },
    'Hvile': { completed: 5, planned: 5, completionRate: 100, totalHours: 5 },
  },
});

/**
 * Hook for fetching training analytics
 */
export function useTrainingAnalytics(planId?: string): UseTrainingAnalyticsResult {
  const [data, setData] = useState<TrainingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(planId || null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if live API is enabled
    if (!checkFeature('ENABLE_TRAINING_ANALYTICS')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(getDemoTrainingAnalytics());
      setLoading(false);
      return;
    }

    try {
      let currentPlanId = activePlanId;

      // If no planId provided, try to get active plan first
      if (!currentPlanId) {
        try {
          const plansResponse = await apiClient.get('/training-plan');
          const activePlan = plansResponse.data?.data?.find(
            (p: { status: string }) => p.status === 'active'
          );
          if (activePlan) {
            currentPlanId = activePlan.id;
            setActivePlanId(activePlan.id);
          }
        } catch {
          // No active plan found, use demo data
          setData(getDemoTrainingAnalytics());
          setLoading(false);
          return;
        }
      }

      if (!currentPlanId) {
        // No plan available
        setData(getDemoTrainingAnalytics());
        setLoading(false);
        return;
      }

      const response = await apiClient.get(`/training-plan/${currentPlanId}/analytics`);

      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data;
        setData({
          overview: apiData.overview || getDemoTrainingAnalytics().overview,
          weeklyTrend: apiData.weeklyTrend || getDemoTrainingAnalytics().weeklyTrend,
          periodBreakdown: apiData.periodBreakdown || getDemoTrainingAnalytics().periodBreakdown,
        });
      } else {
        setData(getDemoTrainingAnalytics());
      }
    } catch (err) {
      console.warn('[useTrainingAnalytics] API failed, using demo data:', err);
      setError('Kunne ikke laste treningsanalyse');
      setData(getDemoTrainingAnalytics());
    } finally {
      setLoading(false);
    }
  }, [activePlanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useTrainingAnalytics;
