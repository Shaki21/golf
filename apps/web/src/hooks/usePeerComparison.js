/**
 * Peer Comparison Hooks
 * Hooks for comparing players with their peer groups
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

/**
 * Get peer comparison for a player's test result
 */
export function usePeerComparison(playerId, testNumber, filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparison = useCallback(async () => {
    if (!playerId || !testNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        playerId,
        testNumber,
        ...filters,
      };

      const response = await apiClient.get('/peer-comparison', { params });

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load peer comparison');
    } finally {
      setLoading(false);
    }
  }, [playerId, testNumber, JSON.stringify(filters)]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  return { comparison: data, loading, error, refetch: fetchComparison };
}

/**
 * Get multi-level comparison across all categories
 */
export function useMultiLevelComparison(playerId, testNumber) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMultiLevel = useCallback(async () => {
    if (!playerId || !testNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/peer-comparison/multi-level', {
        params: { playerId, testNumber },
      });

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load multi-level comparison');
    } finally {
      setLoading(false);
    }
  }, [playerId, testNumber]);

  useEffect(() => {
    fetchMultiLevel();
  }, [fetchMultiLevel]);

  return { multiLevel: data, loading, error, refetch: fetchMultiLevel };
}

/**
 * Get list of peers matching criteria
 */
export function usePeerGroup(playerId, filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPeerGroup = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        playerId,
        ...filters,
      };

      const response = await apiClient.get('/peer-comparison/peer-group', { params });

      setData(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load peer group');
    } finally {
      setLoading(false);
    }
  }, [playerId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchPeerGroup();
  }, [fetchPeerGroup]);

  return { peers: data, loading, error, refetch: fetchPeerGroup };
}
