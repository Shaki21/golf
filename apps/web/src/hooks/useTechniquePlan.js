/**
 * Technique Plan Hooks
 * API integration for technique tasks, goals, TrackMan imports, and stats
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// ============================================================================
// TASKS
// ============================================================================

export function useTechniqueTasks(filters = {}, options = {}) {
  const [data, setData] = useState({ tasks: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.playerId) params.append('playerId', filters.playerId);
      if (filters.status) params.append('status', filters.status);
      if (filters.technicalArea) params.append('technicalArea', filters.technicalArea);
      if (filters.creatorType) params.append('creatorType', filters.creatorType);
      params.append('limit', filters.limit || 50);
      params.append('offset', filters.offset || 0);

      const response = await apiClient.get(`/technique-plan/tasks?${params.toString()}`);
      setData({
        tasks: response.data.data || [],
        total: response.data.pagination?.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load technique tasks');
    } finally {
      setLoading(false);
    }
  }, [
    filters.playerId,
    filters.status,
    filters.technicalArea,
    filters.creatorType,
    filters.limit,
    filters.offset,
  ]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchTasks();
    }
  }, [fetchTasks, options.autoLoad]);

  return { tasks: data.tasks, total: data.total, loading, error, refetch: fetchTasks };
}

export function useCreateTechniqueTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/technique-plan/tasks', taskData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create technique task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTask, loading, error };
}

export function useUpdateTechniqueTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.patch(`/technique-plan/tasks/${taskId}`, updates);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update technique task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateTask, loading, error };
}

export function useDeleteTechniqueTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTask = useCallback(async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/technique-plan/tasks/${taskId}`);
    } catch (err) {
      setError(err.message || 'Failed to delete technique task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteTask, loading, error };
}

// ============================================================================
// GOALS
// ============================================================================

export function useTechniqueGoals(filters = {}, options = {}) {
  const [data, setData] = useState({ goals: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.playerId) params.append('playerId', filters.playerId);
      if (filters.metricType) params.append('metricType', filters.metricType);
      if (filters.status) params.append('status', filters.status);
      params.append('limit', filters.limit || 50);
      params.append('offset', filters.offset || 0);

      const response = await apiClient.get(`/technique-plan/goals?${params.toString()}`);
      setData({
        goals: response.data.data || [],
        total: response.data.pagination?.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load technique goals');
    } finally {
      setLoading(false);
    }
  }, [filters.playerId, filters.metricType, filters.status, filters.limit, filters.offset]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchGoals();
    }
  }, [fetchGoals, options.autoLoad]);

  return { goals: data.goals, total: data.total, loading, error, refetch: fetchGoals };
}

export function useCreateTechniqueGoal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createGoal = useCallback(async (goalData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/technique-plan/goals', goalData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create technique goal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGoal, loading, error };
}

export function useUpdateTechniqueGoal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateGoal = useCallback(async (goalId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.patch(`/technique-plan/goals/${goalId}`, updates);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update technique goal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateGoal, loading, error };
}

// ============================================================================
// TRACKMAN IMPORTS
// ============================================================================

export function useTrackManImports(filters = {}, options = {}) {
  const [data, setData] = useState({ imports: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.playerId) params.append('playerId', filters.playerId);
      params.append('limit', filters.limit || 50);
      params.append('offset', filters.offset || 0);

      const response = await apiClient.get(`/technique-plan/imports?${params.toString()}`);
      setData({
        imports: response.data.data || [],
        total: response.data.pagination?.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load TrackMan imports');
    } finally {
      setLoading(false);
    }
  }, [filters.playerId, filters.limit, filters.offset]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchImports();
    }
  }, [fetchImports, options.autoLoad]);

  return { imports: data.imports, total: data.total, loading, error, refetch: fetchImports };
}

export function useImportTrackManCSV() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const importCSV = useCallback(async (file, playerId) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/technique-plan/import/trackman?playerId=${playerId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        }
      );

      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to import TrackMan CSV');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { importCSV, loading, error, progress };
}

export function useImportTrackManPDF() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const importPDF = useCallback(async (file, playerId) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/technique-plan/import/trackman-pdf?playerId=${playerId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        }
      );

      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to import TrackMan PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { importPDF, loading, error, progress };
}

// ============================================================================
// STATS & PROGRESSION
// ============================================================================

export function useTechniqueStats(playerId, filters = {}, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.club) params.append('club', filters.club);

      const response = await apiClient.get(`/technique-plan/stats/${playerId}?${params.toString()}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load technique stats');
    } finally {
      setLoading(false);
    }
  }, [playerId, filters.fromDate, filters.toDate, filters.club]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchStats();
    }
  }, [fetchStats, options.autoLoad]);

  return { stats: data, loading, error, refetch: fetchStats };
}
