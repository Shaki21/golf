/**
 * useVideoHubStats - Hook for fetching video hub statistics
 *
 * Fetches:
 * - Total instructional videos
 * - User's own videos
 * - Comparison count (stored comparisons)
 */

import { useState, useEffect, useCallback } from 'react';
import { videosAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface VideoHubStats {
  instructionalVideos: number;
  myVideos: number;
  comparisons: number;
}

interface UseVideoHubStatsReturn {
  stats: VideoHubStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVideoHubStats(): UseVideoHubStatsReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<VideoHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.playerId && !user?.id) {
      setError('No player ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const playerId = user.playerId || user.id;

      // Fetch instructional videos (category: 'instructional' or similar)
      const [instructionalResponse, myVideosResponse] = await Promise.all([
        videosAPI.list({ category: 'instructional', limit: 1000 }),
        videosAPI.list({ playerId, limit: 1000 }),
      ]);

      const instructionalVideos = instructionalResponse.data?.data?.videos || [];
      const myVideos = myVideosResponse.data?.data?.videos || [];

      // Count comparisons (videos that have been compared - simplified for now)
      // In a real implementation, this might be a separate API endpoint
      const comparisons = 0; // Placeholder - would need comparison tracking

      setStats({
        instructionalVideos: instructionalVideos.length,
        myVideos: myVideos.length,
        comparisons,
      });
    } catch (err: any) {
      console.error('Failed to fetch video hub stats:', err);
      setError(err.response?.data?.message || 'Could not load video statistics');
    } finally {
      setIsLoading(false);
    }
  }, [user?.playerId, user?.id]);

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
