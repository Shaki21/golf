/**
 * Training Area Performance Hooks
 * Hooks for tracking performance across 16 training areas
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

/**
 * Get progress stats for a specific training area
 */
export function useTrainingAreaStats(trainingArea, dateRange) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!trainingArea || !dateRange?.startDate || !dateRange?.endDate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/training-area-performance/progress/stats', {
        params: {
          trainingArea,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      });

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load training area stats');
    } finally {
      setLoading(false);
    }
  }, [trainingArea, dateRange?.startDate, dateRange?.endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats: data, loading, error, refetch: fetchStats };
}

/**
 * Get all training area performances (for a list view)
 */
export function useTrainingAreaPerformances(filters = {}) {
  const [data, setData] = useState({ performances: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.trainingArea) params.trainingArea = filters.trainingArea;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.sessionId) params.sessionId = filters.sessionId;
      if (filters.limit) params.limit = filters.limit;
      if (filters.offset) params.offset = filters.offset;

      const response = await apiClient.get('/training-area-performance', { params });

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load performances');
    } finally {
      setLoading(false);
    }
  }, [
    filters.trainingArea,
    filters.startDate,
    filters.endDate,
    filters.sessionId,
    filters.limit,
    filters.offset,
  ]);

  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);

  return { ...data, loading, error, refetch: fetchPerformances };
}

/**
 * Get stats for all training areas (overview)
 */
export function useAllTrainingAreasOverview(dateRange) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TRAINING_AREAS = [
    'TEE',
    'INN200',
    'INN150',
    'INN100',
    'INN50',
    'CHIP',
    'PITCH',
    'LOB',
    'BUNKER',
    'PUTT0-3',
    'PUTT3-8',
    'PUTT8-15',
    'PUTT15-25',
    'PUTT25-40',
    'PUTT40+',
    'SPILL',
  ];

  const fetchAllStats = useCallback(async () => {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch stats for all training areas in parallel
      const promises = TRAINING_AREAS.map((area) =>
        apiClient
          .get('/training-area-performance/progress/stats', {
            params: {
              trainingArea: area,
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
          })
          .then((res) => ({
            area,
            ...res.data.data,
          }))
          .catch(() => ({
            area,
            totalSessions: 0,
            averageSuccessRate: null,
            averageConsistencyScore: null,
            improvement: { successRate: null, consistencyScore: null },
            recentPerformances: [],
          }))
      );

      const results = await Promise.all(promises);
      setData(results);
    } catch (err) {
      setError(err.message || 'Failed to load training area overview');
    } finally {
      setLoading(false);
    }
  }, [dateRange?.startDate, dateRange?.endDate]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  return { areas: data, loading, error, refetch: fetchAllStats };
}

/**
 * Create a new performance entry
 */
export function useCreateTrainingAreaPerformance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPerformance = async (performanceData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/training-area-performance', performanceData);

      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create performance entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPerformance, loading, error };
}

/**
 * Update a performance entry
 */
export function useUpdateTrainingAreaPerformance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePerformance = async (id, performanceData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.patch(`/training-area-performance/${id}`, performanceData);

      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update performance entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updatePerformance, loading, error };
}

/**
 * Delete a performance entry
 */
export function useDeleteTrainingAreaPerformance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deletePerformance = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(`/training-area-performance/${id}`);

      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete performance entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePerformance, loading, error };
}
