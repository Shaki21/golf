import { useState, useEffect } from 'react';
import { goalsAPI, GoalStreak, GoalStats, GoalBadgesResponse } from '../../../services/api';

export interface UseGoalsDataReturn {
  streak: GoalStreak | null;
  stats: GoalStats | null;
  badges: GoalBadgesResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch goals-related data (streak, stats, badges)
 * Used in Goals page to replace hardcoded data with real API calls
 */
export function useGoalsData(): UseGoalsDataReturn {
  const [streak, setStreak] = useState<GoalStreak | null>(null);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [badges, setBadges] = useState<GoalBadgesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [streakRes, statsRes, badgesRes] = await Promise.all([
        goalsAPI.getStreak(),
        goalsAPI.getStats(),
        goalsAPI.getBadges(),
      ]);

      setStreak(streakRes.data.data);
      setStats(statsRes.data.data);
      setBadges(badgesRes.data.data);
    } catch (err) {
      console.error('Error fetching goals data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch goals data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    streak,
    stats,
    badges,
    isLoading,
    error,
    refetch: fetchData,
  };
}
