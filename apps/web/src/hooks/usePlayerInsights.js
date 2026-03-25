/**
 * usePlayerInsights Hook
 * Fetches player insights data (SG Journey, Skill DNA, Bounty Board)
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook to fetch all player insights
 * @param {string} playerId - Optional player ID (defaults to current user)
 * @returns {Object} { data, loading, error, refetch }
 */
export function usePlayerInsights(playerId = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.get('/player-insights', { params });

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        // No data available yet
        setData(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Endpoint not yet implemented, use null
        setData(null);
      } else {
        setError(err.message || 'Kunne ikke laste player insights');
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { data, loading, error, refetch: fetchInsights };
}

/**
 * Hook to fetch SG Journey data only
 * @param {string} playerId - Optional player ID
 * @returns {Object} { data, loading, error, refetch }
 */
export function useSGJourney(playerId = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSGJourney = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.get('/player-insights/sg-journey', { params });

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        setData(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setData(null);
      } else {
        setError(err.message || 'Kunne ikke laste SG Journey');
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchSGJourney();
  }, [fetchSGJourney]);

  return { data, loading, error, refetch: fetchSGJourney };
}

/**
 * Hook to fetch Skill DNA data only
 * @param {string} playerId - Optional player ID
 * @returns {Object} { data, loading, error, refetch }
 */
export function useSkillDNA(playerId = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSkillDNA = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.get('/player-insights/skill-dna', { params });

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        setData(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setData(null);
      } else {
        setError(err.message || 'Kunne ikke laste Skill DNA');
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchSkillDNA();
  }, [fetchSkillDNA]);

  return { data, loading, error, refetch: fetchSkillDNA };
}

/**
 * Hook to fetch Bounty Board data only
 * @param {string} playerId - Optional player ID
 * @returns {Object} { data, loading, error, refetch, activateBounty, updateProgress }
 */
export function useBountyBoard(playerId = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBountyBoard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.get('/player-insights/bounty-board', { params });

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        setData(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setData(null);
      } else {
        setError(err.message || 'Kunne ikke laste Bounty Board');
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const activateBounty = useCallback(async (bountyId) => {
    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.post(
        `/player-insights/bounty/${bountyId}/activate`,
        {},
        { params }
      );

      if (response.data?.success) {
        // Refetch to get updated data
        fetchBountyBoard();
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err.message || 'Kunne ikke aktivere bounty');
      return null;
    }
  }, [playerId, fetchBountyBoard]);

  const updateProgress = useCallback(async (bountyId, newValue) => {
    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.put(
        `/player-insights/bounty/${bountyId}/progress`,
        { newValue },
        { params }
      );

      if (response.data?.success) {
        // Refetch to get updated data
        fetchBountyBoard();
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err.message || 'Kunne ikke oppdatere bounty progress');
      return null;
    }
  }, [playerId, fetchBountyBoard]);

  useEffect(() => {
    fetchBountyBoard();
  }, [fetchBountyBoard]);

  return {
    data,
    loading,
    error,
    refetch: fetchBountyBoard,
    activateBounty,
    updateProgress,
  };
}

export default usePlayerInsights;
