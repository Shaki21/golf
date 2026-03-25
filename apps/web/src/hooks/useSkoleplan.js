/**
 * useSkoleplan - Hook for managing school schedule data
 *
 * Provides access to:
 * - Fag (subjects)
 * - Skoletimer (class schedule)
 * - Oppgaver (assignments with test integration)
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Main hook for fetching all skoleplan data
 */
export function useSkoleplan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/skoleplan');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load skoleplan');
      console.error('[Skoleplan] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    fag: data?.fag || [],
    timer: data?.timer || [],
    oppgaver: data?.oppgaver || [],
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for creating a new assignment
 */
export function useCreateOppgave() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOppgave = useCallback(async (oppgaveData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/skoleplan/oppgaver', oppgaveData);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
      console.error('[Skoleplan] Error creating oppgave:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOppgave, loading, error };
}

/**
 * Hook for updating an existing assignment
 */
export function useUpdateOppgave() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateOppgave = useCallback(async (oppgaveId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(`/skoleplan/oppgaver/${oppgaveId}`, updates);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update assignment');
      console.error('[Skoleplan] Error updating oppgave:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateOppgave, loading, error };
}

/**
 * Hook for updating assignment status (complete/pending)
 */
export function useUpdateOppgaveStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = useCallback(async (oppgaveId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.patch(`/skoleplan/oppgaver/${oppgaveId}/status`, { status });
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update status');
      console.error('[Skoleplan] Error updating status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
}

/**
 * Hook for deleting an assignment
 */
export function useDeleteOppgave() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteOppgave = useCallback(async (oppgaveId) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/skoleplan/oppgaver/${oppgaveId}`);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
      console.error('[Skoleplan] Error deleting oppgave:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteOppgave, loading, error };
}

/**
 * Hook for creating a new subject
 */
export function useCreateFag() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createFag = useCallback(async (fagData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/skoleplan/fag', fagData);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create subject');
      console.error('[Skoleplan] Error creating fag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createFag, loading, error };
}

export default useSkoleplan;
