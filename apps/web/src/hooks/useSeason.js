/**
 * Season Management Hooks
 * API integration for multi-season planning and periodization
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

export function useSeasons(playerId, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeasons = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/season/player/${playerId}`);
      setData(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load seasons');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchSeasons();
    }
  }, [fetchSeasons, options.autoLoad]);

  return { seasons: data, loading, error, refetch: fetchSeasons };
}

export function useCreateSeason() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSeason = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/season', data);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create season');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSeason, loading, error };
}
