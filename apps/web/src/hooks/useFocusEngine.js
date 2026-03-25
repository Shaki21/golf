/**
 * useFocusEngine - Hooks for AI-powered training focus recommendations
 *
 * Provides access to:
 * - Focus recommendations (what to train next)
 * - Priority updates (manual priority adjustment)
 * - Impact scoring
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for fetching focus recommendations
 * @param {string} playerId - Player ID
 */
export function useFocusRecommendations(playerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/focus-engine', {
        params: { playerId },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load focus recommendations');
      console.error('[FocusEngine] Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations: data?.recommendations || [],
    summary: data?.summary || null,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}

/**
 * Hook for updating focus priorities
 * @param {string} playerId - Player ID
 * @param {array} priorities - Array of focus area priorities
 */
export function useUpdateFocusPriorities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePriorities = useCallback(async (playerId, priorities) => {
    if (!playerId || !priorities) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/focus-engine/priorities', {
        playerId,
        priorities,
      });

      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update priorities');
      console.error('[FocusEngine] Error updating priorities:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updatePriorities,
    loading,
    error,
  };
}
