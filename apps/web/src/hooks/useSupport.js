/**
 * useSupport - Hooks for support ticket management
 *
 * Provides access to:
 * - Support ticket list (for admin)
 * - Ticket creation (for users)
 * - Ticket updates and status changes
 * - Support statistics
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for fetching support tickets (admin only)
 * @param {object} filters - Query filters (status, priority, category, page, limit)
 */
export function useSupportTickets(filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/support', {
        params: filters,
      });

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load support tickets');
      console.error('[Support] Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.category, filters.page, filters.limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets: data?.tickets || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    refetch: fetchTickets,
  };
}

/**
 * Hook for fetching a single support ticket
 * @param {string} caseId - Case ID
 */
export function useSupportTicket(caseId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTicket = useCallback(async () => {
    if (!caseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/support/${caseId}`);

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load support ticket');
      console.error('[Support] Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket: data,
    loading,
    error,
    refetch: fetchTicket,
  };
}

/**
 * Hook for creating a support ticket
 */
export function useCreateSupportTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTicket = useCallback(async (ticketData) => {
    if (!ticketData) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/support', ticketData);

      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create support ticket');
      console.error('[Support] Error creating ticket:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTicket,
    loading,
    error,
  };
}

/**
 * Hook for updating a support ticket
 */
export function useUpdateSupportTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTicket = useCallback(async (caseId, updates) => {
    if (!caseId || !updates) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.patch(`/support/${caseId}`, updates);

      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update support ticket');
      console.error('[Support] Error updating ticket:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateTicket,
    loading,
    error,
  };
}

/**
 * Hook for deleting a support ticket
 */
export function useDeleteSupportTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTicket = useCallback(async (caseId) => {
    if (!caseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.delete(`/support/${caseId}`);

      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to delete support ticket');
      console.error('[Support] Error deleting ticket:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteTicket,
    loading,
    error,
  };
}

/**
 * Hook for fetching support statistics (admin only)
 */
export function useSupportStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/support/stats');

      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load support statistics');
      console.error('[Support] Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats: data,
    loading,
    error,
    refetch: fetchStats,
  };
}
