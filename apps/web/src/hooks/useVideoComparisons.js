/**
 * Video Comparisons Hooks
 * API integration for side-by-side video comparison with sync points
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// ============================================================================
// VIDEO COMPARISONS
// ============================================================================

export function useVideoComparisons(filters = {}, options = {}) {
  const [data, setData] = useState({ comparisons: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparisons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
        ...(filters.videoId && { videoId: filters.videoId }),
      };

      const response = await apiClient.get('/comparisons', { params });
      setData({
        comparisons: response.data.data.comparisons || [],
        total: response.data.data.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load video comparisons');
    } finally {
      setLoading(false);
    }
  }, [filters.limit, filters.offset, filters.sortBy, filters.sortOrder, filters.videoId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchComparisons();
    }
  }, [fetchComparisons, options.autoLoad]);

  return { comparisons: data.comparisons, total: data.total, loading, error, refetch: fetchComparisons };
}

export function useVideoComparison(comparisonId, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparison = useCallback(async () => {
    if (!comparisonId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/comparisons/${comparisonId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load video comparison');
    } finally {
      setLoading(false);
    }
  }, [comparisonId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchComparison();
    }
  }, [fetchComparison, options.autoLoad]);

  return { comparison: data, loading, error, refetch: fetchComparison };
}

export function useVideoComparisonsByVideo(videoId, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparisons = useCallback(async () => {
    if (!videoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/comparisons/video/${videoId}`);
      setData(response.data.data.comparisons || []);
    } catch (err) {
      setError(err.message || 'Failed to load video comparisons');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchComparisons();
    }
  }, [fetchComparisons, options.autoLoad]);

  return { comparisons: data, loading, error, refetch: fetchComparisons };
}

export function useCreateVideoComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createComparison = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/comparisons', data);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create video comparison');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createComparison, loading, error };
}

export function useUpdateVideoComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateComparison = useCallback(async (comparisonId, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.patch(`/comparisons/${comparisonId}`, data);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update video comparison');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateComparison, loading, error };
}

export function useDeleteVideoComparison() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteComparison = useCallback(async (comparisonId) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/comparisons/${comparisonId}`);
    } catch (err) {
      setError(err.message || 'Failed to delete video comparison');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteComparison, loading, error };
}
