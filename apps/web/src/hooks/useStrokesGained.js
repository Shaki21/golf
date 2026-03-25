/**
 * useStrokesGained Hook
 * Fetches Strokes Gained data for player dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook to fetch player's Strokes Gained summary
 * @param {string} playerId - Optional player ID (defaults to current user)
 * @returns {Object} { data, loading, error, refetch }
 */
export function useStrokesGained(playerId = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStrokesGained = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = playerId ? { playerId } : {};
      const response = await apiClient.get('/datagolf/player-sg-summary', { params });

      if (response.data?.success && response.data.data?.hasData) {
        setData(response.data.data);
      } else {
        // No data available yet - use demo data
        setData({ ...getDemoData(), isDemo: true });
      }
    } catch (err) {
      // If endpoint doesn't exist or fails, use fallback/demo data
      if (err.response?.status === 404) {
        setData({ ...getDemoData(), isDemo: true });
      } else {
        setError(err.message || 'Kunne ikke laste Strokes Gained data');
        setData({ ...getDemoData(), isDemo: true });
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchStrokesGained();
  }, [fetchStrokesGained]);

  const refetch = () => {
    fetchStrokesGained();
  };

  return { data, loading, error, refetch };
}

/**
 * Hook to convert PEI test values to SG
 * @returns {Object} { convertPei, loading, error }
 */
export function usePeiToSg() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const convertPei = useCallback(async (startDistance, pei, lie = 'fairway') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/datagolf/pei-to-sg', {
        startDistance,
        pei,
        lie,
      });

      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error('Conversion failed');
    } catch (err) {
      setError(err.message || 'Konvertering feilet');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const convertBatch = useCallback(async (shots) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/datagolf/pei-to-sg/batch', { shots });

      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error('Batch conversion failed');
    } catch (err) {
      setError(err.message || 'Konvertering feilet');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const convertIupTest = useCallback(async (testData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/datagolf/pei-to-sg/iup-test', testData);

      if (response.data?.success) {
        return response.data.data;
      }
      throw new Error('IUP test conversion failed');
    } catch (err) {
      setError(err.message || 'Konvertering feilet');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { convertPei, convertBatch, convertIupTest, loading, error };
}

/**
 * Demo/fallback data when API is unavailable
 */
function getDemoData() {
  return {
    hasData: true,
    total: 0.35,
    trend: 0.12,
    percentile: 58,
    byCategory: {
      approach: {
        value: 0.15,
        tourAvg: 0,
        pgaElite: 0.8,
        testCount: 25,
      },
      around_green: {
        value: 0.08,
        tourAvg: 0,
        pgaElite: 0.5,
        testCount: 18,
      },
      putting: {
        value: 0.12,
        tourAvg: 0,
        pgaElite: 0.6,
        testCount: 30,
      },
    },
    recentTests: [
      { date: '2025-12-28', category: 'approach', sg: 0.18, testName: 'Approach 100m' },
      { date: '2025-12-27', category: 'putting', sg: 0.22, testName: 'Putting 3m' },
      { date: '2025-12-26', category: 'around_green', sg: 0.05, testName: 'Chipping' },
    ],
    weeklyTrend: [
      { week: 48, total: 0.18 },
      { week: 49, total: 0.22 },
      { week: 50, total: 0.28 },
      { week: 51, total: 0.32 },
      { week: 52, total: 0.35 },
    ],
  };
}

/**
 * Hook for fetching Strokes Gained historical trends
 * @param {string} playerId - Player ID
 * @param {number} months - Number of months to fetch (default: 6)
 */
export function useStrokesGainedTrends(playerId, months = 6) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrends = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/strokes-gained/trends', {
        params: { playerId, months },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load trends');
      console.error('[StrokesGained] Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId, months]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    trends: data?.trends || [],
    loading,
    error,
    refetch: fetchTrends,
  };
}

/**
 * Hook for fetching Strokes Gained breakdown by category
 * @param {string} playerId - Player ID
 */
export function useStrokesGainedBreakdown(playerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBreakdown = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/strokes-gained/breakdown', {
        params: { playerId },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load breakdown');
      console.error('[StrokesGained] Error fetching breakdown:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  return {
    breakdown: data?.breakdown || {
      putting: 0,
      approach: 0,
      aroundGreen: 0,
      teeToGreen: 0,
    },
    loading,
    error,
    refetch: fetchBreakdown,
  };
}

/**
 * Hook for fetching Strokes Gained peer comparison
 * @param {string} playerId - Player ID
 */
export function useStrokesGainedPeerComparison(playerId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPeerComparison = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/strokes-gained/peer-comparison', {
        params: { playerId },
      });

      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load peer comparison');
      console.error('[StrokesGained] Error fetching peer comparison:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPeerComparison();
  }, [fetchPeerComparison]);

  return {
    percentile: data?.percentile || 50,
    peerAverage: data?.peerAverage || 0,
    playerValue: data?.playerValue || 0,
    loading,
    error,
    refetch: fetchPeerComparison,
  };
}

export default useStrokesGained;
