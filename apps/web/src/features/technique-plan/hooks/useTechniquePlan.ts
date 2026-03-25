/**
 * Technique Plan Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { TechniqueTask, TechniqueGoal, TrackmanImport, TechniqueStats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// TASKS
// ============================================================================

export function useTechniqueTasks(playerId?: string) {
  const [tasks, setTasks] = useState<TechniqueTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = playerId ? { playerId } : {};
      const response = await api.get('/technique-plan/tasks', { params });
      setTasks(response.data.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: Partial<TechniqueTask>) => {
    const response = await api.post('/technique-plan/tasks', task);
    await fetchTasks();
    return response.data.data;
  };

  const updateTask = async (taskId: string, updates: Partial<TechniqueTask>) => {
    const response = await api.patch(`/technique-plan/tasks/${taskId}`, updates);
    await fetchTasks();
    return response.data.data;
  };

  const deleteTask = async (taskId: string) => {
    await api.delete(`/technique-plan/tasks/${taskId}`);
    await fetchTasks();
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}

// ============================================================================
// GOALS
// ============================================================================

export function useTechniqueGoals(playerId?: string) {
  const [goals, setGoals] = useState<TechniqueGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const params = playerId ? { playerId } : {};
      const response = await api.get('/technique-plan/goals', { params });
      setGoals(response.data.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goals';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (goal: Partial<TechniqueGoal>) => {
    const response = await api.post('/technique-plan/goals', goal);
    await fetchGoals();
    return response.data.data;
  };

  const updateGoal = async (goalId: string, updates: Partial<TechniqueGoal>) => {
    const response = await api.patch(`/technique-plan/goals/${goalId}`, updates);
    await fetchGoals();
    return response.data.data;
  };

  return { goals, loading, error, fetchGoals, createGoal, updateGoal };
}

// ============================================================================
// IMPORTS
// ============================================================================

export function useTrackmanImports(playerId?: string) {
  const [imports, setImports] = useState<TrackmanImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = useCallback(async () => {
    try {
      setLoading(true);
      const params = playerId ? { playerId } : {};
      const response = await api.get('/technique-plan/imports', { params });
      setImports(response.data.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch imports';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  const uploadCSV = async (file: File, playerId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/technique-plan/import/trackman?playerId=${playerId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchImports();
    return response.data.data;
  };

  return { imports, loading, error, fetchImports, uploadCSV };
}

// ============================================================================
// STATS
// ============================================================================

export function useTechniqueStats(playerId: string) {
  const [stats, setStats] = useState<TechniqueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      const response = await api.get(`/technique-plan/stats/${playerId}`);
      setStats(response.data.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, fetchStats };
}
