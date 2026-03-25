/**
 * useBreakingPoints Hook
 * Fetches breaking points data from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Default empty state
const DEFAULT_DATA = {
  breakingPoints: [],
  resolvedPoints: [],
  stats: {
    active: 0,
    highPriority: 0,
    resolved: 0,
  },
};

export function useBreakingPoints(filter = 'all') {
  const { user } = useAuth();
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBreakingPoints = useCallback(async () => {
    if (!user?.playerId) {
      setData(DEFAULT_DATA);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all breaking points for the current player
      const queryParams = new URLSearchParams({
        playerId: user.playerId,
        ...(filter !== 'all' && { status: filter }),
      });

      const response = await api.get(`/breaking-points?${queryParams.toString()}`);

      if (response.data.success) {
        const allPoints = response.data.data || [];

        // Separate active and resolved points
        const active = allPoints.filter(bp => bp.status !== 'resolved');
        const resolved = allPoints.filter(bp => bp.status === 'resolved');

        // Transform data for frontend
        const breakingPoints = active.map(bp => ({
          id: bp.id,
          area: bp.area || bp.category || 'Generelt',
          title: bp.title || bp.name,
          description: bp.description || '',
          status: bp.status || 'identified',
          priority: bp.priority || 'medium',
          identifiedDate: bp.createdAt || bp.identifiedDate,
          targetDate: bp.targetDate,
          progress: bp.progressPercent || bp.progress || 0,
          drills: bp.drills || bp.exercises || [],
          coachNotes: bp.coachNotes || bp.notes,
          videos: bp.videoCount || 0,
          sessions: bp.sessionCount || 0,
          // Evidence-based fields
          effortPercent: bp.effortPercent || 0,
          progressPercent: bp.progressPercent || 0,
          evidenceConfig: bp.evidenceConfig,
        }));

        const resolvedPoints = resolved.map(bp => ({
          id: bp.id,
          area: bp.area || bp.category || 'Generelt',
          title: bp.title || bp.name,
          resolvedDate: bp.resolvedAt || bp.updatedAt,
          duration: calculateDuration(bp.createdAt, bp.resolvedAt || bp.updatedAt),
        }));

        // Calculate stats
        const stats = {
          active: active.length,
          highPriority: active.filter(bp => bp.priority === 'high').length,
          resolved: resolved.length,
        };

        setData({ breakingPoints, resolvedPoints, stats });
      } else {
        throw new Error(response.data.error || 'Failed to fetch breaking points');
      }
    } catch (err) {
      console.error('Error fetching breaking points:', err);
      setError(err.message || 'Kunne ikke laste breaking points');
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
    }
  }, [user?.playerId, filter]);

  useEffect(() => {
    fetchBreakingPoints();
  }, [fetchBreakingPoints]);

  return { data, loading, error, refetch: fetchBreakingPoints };
}

// Helper to calculate duration between two dates
function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 'Ukjent';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `${diffDays} dager`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'uke' : 'uker'}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'maned' : 'maneder'}`;
  }
}

/**
 * Hook for fetching specific breaking point details
 * @param {string} playerId - Player ID
 * @param {string} breakingPointId - Breaking point ID
 */
export function useBreakingPointDetail(playerId, breakingPointId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!playerId || !breakingPointId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/breaking-points/${breakingPointId}`, {
        params: { playerId },
      });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch breaking point details');
      }
    } catch (err) {
      console.error('[BreakingPoints] Error fetching detail:', err);
      setError(err.message || 'Kunne ikke laste detaljer');
    } finally {
      setLoading(false);
    }
  }, [playerId, breakingPointId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    breakingPoint: data || null,
    loading,
    error,
    refetch: fetchDetail,
  };
}

export default useBreakingPoints;
