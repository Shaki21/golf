/**
 * useDataGolf - Hooks for DataGolf professional comparison
 *
 * Provides access to:
 * - Tour averages (PGA, European, LPGA)
 * - Player-to-tour comparison
 * - Pro player search
 * - Approach skill analysis
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for comparing player to tour averages
 * @param {string} playerId - Player ID
 * @param {string} tour - Tour type ('pga', 'european', 'lpga')
 * @param {string} season - Season year (e.g., '2024')
 */
export function useCompareToTour(playerId, tour = 'pga', season = '2024') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparison = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/datagolf/compare', {
        params: { playerId, tour, season },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load comparison');
      console.error('[DataGolf] Error fetching comparison:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId, tour, season]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  return {
    comparison: data || null,
    loading,
    error,
    refetch: fetchComparison,
  };
}

/**
 * Hook for fetching tour averages
 * @param {string} tour - Tour type ('pga', 'european', 'lpga')
 * @param {string} season - Season year (e.g., '2024')
 */
export function useTourAverages(tour = 'pga', season = '2024') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAverages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/datagolf/tour-averages', {
        params: { tour, season },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load tour averages');
      console.error('[DataGolf] Error fetching tour averages:', err);
    } finally {
      setLoading(false);
    }
  }, [tour, season]);

  useEffect(() => {
    fetchAverages();
  }, [fetchAverages]);

  return {
    averages: data || null,
    loading,
    error,
    refetch: fetchAverages,
  };
}

/**
 * Hook for searching professional players
 * @param {string} query - Search query
 */
export function useProPlayerSearch(query) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPlayers = useCallback(async () => {
    if (!query || query.length < 2) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/datagolf/players/search', {
        params: { query },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to search players');
      console.error('[DataGolf] Error searching players:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlayers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchPlayers]);

  return {
    players: data?.players || [],
    loading,
    error,
  };
}

/**
 * Hook for fetching approach skill breakdown
 * @param {string} playerId - Player ID
 */
export function useApproachSkill(playerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApproachSkill = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/datagolf/approach-skill', {
        params: { playerId },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load approach skill');
      console.error('[DataGolf] Error fetching approach skill:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchApproachSkill();
  }, [fetchApproachSkill]);

  return {
    approachSkill: data || null,
    distanceBuckets: data?.distanceBuckets || [],
    loading,
    error,
    refetch: fetchApproachSkill,
  };
}

/**
 * Hook for fetching specific pro player data
 * @param {string} proPlayerId - Professional player ID
 */
export function useProPlayer(proPlayerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProPlayer = useCallback(async () => {
    if (!proPlayerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/datagolf/players/${proPlayerId}`);

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load pro player');
      console.error('[DataGolf] Error fetching pro player:', err);
    } finally {
      setLoading(false);
    }
  }, [proPlayerId]);

  useEffect(() => {
    fetchProPlayer();
  }, [fetchProPlayer]);

  return {
    player: data || null,
    loading,
    error,
    refetch: fetchProPlayer,
  };
}
