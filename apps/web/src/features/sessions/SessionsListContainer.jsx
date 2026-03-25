/**
 * SessionsListContainer - Smart component for sessions list
 *
 * Handles:
 * - Fetching sessions with filters
 * - Pagination
 * - Search debouncing
 * - Error handling
 *
 * Phase 4 Extended: URL-persisted filters
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sessionsAPI } from '../../services/api';
import SessionsListView from './SessionsListView';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useUrlFilters } from '../../hooks/useUrlFilters';

// Debounce helper
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function SessionsListContainer() {
  // State
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // URL-persisted filters (Phase 4 Extended)
  const { filters, setFilter } = useUrlFilters({
    completionStatus: '',
    sessionType: '',
    period: '',
    fromDate: '',
    toDate: '',
    search: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Build query params (handle URL filter values)
  const queryParams = useMemo(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };

    // Only include filters that have values (not empty strings)
    if (filters.completionStatus && filters.completionStatus !== '') {
      params.completionStatus = filters.completionStatus;
    }
    if (filters.sessionType && filters.sessionType !== '') {
      params.sessionType = filters.sessionType;
    }
    if (filters.period && filters.period !== '') {
      params.period = filters.period;
    }
    if (filters.fromDate && filters.fromDate !== '') {
      params.fromDate = filters.fromDate;
    }
    if (filters.toDate && filters.toDate !== '') {
      params.toDate = filters.toDate;
    }

    return params;
  }, [pagination.page, pagination.limit, filters.completionStatus, filters.sessionType, filters.period, filters.fromDate, filters.toDate]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use /my endpoint for player's own sessions
      const response = await sessionsAPI.getMy(queryParams);

      // API returns { success: true, data: { sessions: [...], pagination: {...} } }
      const result = response.data?.data || {};
      setSessions(result.sessions || []);
      setPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
      }));
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError(err.response?.data?.message || 'Kunne ikke laste økter');
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  // Fetch on mount and when params change
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Handle filter change (URL-persisted)
  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value || ''); // Use URL filter API
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, [setFilter]);

  // Handle search (URL-persisted)
  const handleSearch = useCallback((value) => {
    setFilter('search', value);
  }, [setFilter]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter sessions by search (client-side for now)
  const filteredSessions = useMemo(() => {
    if (!debouncedSearch) return sessions;

    const searchLower = debouncedSearch.toLowerCase();
    return sessions.filter(session =>
      session.sessionType?.toLowerCase().includes(searchLower) ||
      session.focusArea?.toLowerCase().includes(searchLower) ||
      session.notes?.toLowerCase().includes(searchLower)
    );
  }, [sessions, debouncedSearch]);

  // Initial loading
  if (isLoading && sessions.length === 0 && !error) {
    return <LoadingState message="Laster treningsøkter..." />;
  }

  // Error state (only if no sessions loaded)
  if (error && sessions.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <SessionsListView
      sessions={filteredSessions}
      pagination={pagination}
      filters={filters}
      isLoading={isLoading}
      onFilterChange={handleFilterChange}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
    />
  );
}
