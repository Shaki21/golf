/**
 * Audit Log Hooks
 * API integration for audit event viewing (admin only)
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

export function useAuditEvents(filters = {}, options = {}) {
  const [data, setData] = useState({ events: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 50,
        ...(filters.action && { action: filters.action }),
        ...(filters.resourceType && { resourceType: filters.resourceType }),
        ...(filters.resourceId && { resourceId: filters.resourceId }),
        ...(filters.actorId && { actorId: filters.actorId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      const response = await apiClient.get('/audit', { params });
      setData({
        events: response.data.data.events || [],
        total: response.data.data.total || 0,
        page: response.data.data.page || 1,
        totalPages: response.data.data.totalPages || 1,
      });
    } catch (err) {
      setError(err.message || 'Failed to load audit events');
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.action,
    filters.resourceType,
    filters.resourceId,
    filters.actorId,
    filters.startDate,
    filters.endDate,
  ]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchEvents();
    }
  }, [fetchEvents, options.autoLoad]);

  return { events: data.events, total: data.total, page: data.page, totalPages: data.totalPages, loading, error, refetch: fetchEvents };
}

export function useAuditStats(days = 30, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/audit/stats', { params: { days } });
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load audit statistics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchStats();
    }
  }, [fetchStats, options.autoLoad]);

  return { stats: data, loading, error, refetch: fetchStats };
}
