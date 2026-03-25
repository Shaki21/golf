/**
 * useTrainingHubStats - Hook for fetching training hub statistics
 *
 * Fetches:
 * - Sessions count for current month
 * - Total hours trained this month
 * - Exercises completed this month
 * - Tests completed this month
 */

import { useState, useEffect, useCallback } from 'react';
import { sessionsAPI, trainingStatsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface TrainingHubStats {
  sessionsThisMonth: number;
  hoursTrained: number;
  exercisesCompleted: number;
  testsCompleted: number;
}

interface UseTrainingHubStatsReturn {
  stats: TrainingHubStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrainingHubStats(): UseTrainingHubStatsReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<TrainingHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.playerId) {
      setError('No player ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current month for filtering
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startOfMonth = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

      // Fetch monthly stats
      const monthlyStatsResponse = await trainingStatsAPI.getMonthlyStats(user.playerId, {
        year,
        month,
      });

      const monthlyData = monthlyStatsResponse.data?.data?.[0] || {};

      // Fetch sessions for this month to calculate additional metrics
      const sessionsResponse = await sessionsAPI.getMy({
        fromDate: startOfMonth,
        toDate: endOfMonth,
        completionStatus: 'completed',
      });

      const sessions = sessionsResponse.data?.data || [];

      // Calculate hours trained from sessions
      const hoursTrained = sessions.reduce((total: number, session: any) => {
        const duration = session.durationMinutes || session.duration || 0;
        return total + (duration / 60);
      }, 0);

      // Count exercises completed (from session evaluations)
      const exercisesCompleted = sessions.reduce((total: number, session: any) => {
        const blocks = session.evaluation?.blocks || session.blocks || [];
        return total + blocks.length;
      }, 0);

      // Count tests completed
      const testsCompleted = sessions.filter((session: any) =>
        session.sessionType?.toLowerCase().includes('test') ||
        session.sessionType?.toLowerCase().includes('måling')
      ).length;

      setStats({
        sessionsThisMonth: sessions.length,
        hoursTrained: Math.round(hoursTrained * 10) / 10, // Round to 1 decimal
        exercisesCompleted,
        testsCompleted,
      });
    } catch (err: any) {
      console.error('Failed to fetch training hub stats:', err);
      setError(err.response?.data?.message || 'Could not load training statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user?.playerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
