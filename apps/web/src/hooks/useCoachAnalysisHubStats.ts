/**
 * useCoachAnalysisHubStats - Hook for fetching coach analysis hub statistics
 *
 * Fetches:
 * - Total exercises in library
 * - Coach's own exercises
 * - Session templates count
 * - Statistics reports count
 */

import { useState, useEffect, useCallback } from 'react';
import { exercisesAPI, sessionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CoachAnalysisHubStats {
  exercisesInLibrary: number;
  myExercises: number;
  sessionTemplates: number;
  statisticsReports: number;
}

interface UseCoachAnalysisHubStatsReturn {
  stats: CoachAnalysisHubStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCoachAnalysisHubStats(): UseCoachAnalysisHubStatsReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<CoachAnalysisHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.coachId && !user?.id) {
      setError('No coach ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const coachId = user.coachId || user.id;

      // Fetch all exercises
      const [allExercisesResponse, myExercisesResponse] = await Promise.all([
        exercisesAPI.getAll(),
        exercisesAPI.list({ createdBy: coachId }),
      ]);

      const allExercises = allExercisesResponse.data?.data || [];
      const myExercises = myExercisesResponse.data?.data || [];

      // Count session templates (exercises marked as templates or favorite)
      const sessionTemplates = allExercises.filter(
        (ex: any) => ex.isTemplate || ex.isFavorite
      ).length;

      // Statistics reports - placeholder for now (can be expanded)
      // Could count: number of athletes, sessions this month, etc.
      const statisticsReports = 0;

      setStats({
        exercisesInLibrary: allExercises.length,
        myExercises: myExercises.length,
        sessionTemplates,
        statisticsReports,
      });
    } catch (err: any) {
      console.error('Failed to fetch coach analysis hub stats:', err);
      setError(err.response?.data?.message || 'Could not load analysis statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user?.coachId, user?.id]);

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
