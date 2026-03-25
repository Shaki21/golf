/**
 * useProgressReports Hook
 * Hook for managing progress reports
 *
 * Features:
 * - Fetch progress reports with filters
 * - Create new progress report
 * - Update existing report
 * - Publish report to parents
 * - Auto-generate report from player data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing progress reports
 *
 * @param {Object} options - Configuration options
 * @param {string} options.playerId - Filter by player ID
 * @param {string} options.coachId - Filter by coach ID
 * @param {string} options.status - Filter by status (draft/published)
 * @returns {Object} Progress reports state and controls
 */
export function useProgressReports(options = {}) {
  const { playerId, coachId, status } = options;

  // State
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch progress reports from API
   */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (playerId) params.playerId = playerId;
      if (coachId) params.coachId = coachId;
      if (status) params.status = status;

      const response = await apiClient.get('/progress-reports', { params });

      if (!isMountedRef.current) return;

      setReports(response.data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente rapporter');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [playerId, coachId, status]);

  /**
   * Fetch a single progress report by ID
   */
  const fetchReport = useCallback(async (reportId) => {
    if (!reportId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/progress-reports/${reportId}`);

      if (!isMountedRef.current) return null;

      const report = response.data.data;
      setSelectedReport(report);
      return report;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente rapport');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Create a new progress report
   */
  const createReport = useCallback(async (reportData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/progress-reports', reportData);

      if (isMountedRef.current) {
        const newReport = response.data.data;
        setReports((prev) => [newReport, ...prev]);
        setSelectedReport(newReport);
        return newReport;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke opprette rapport');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Update an existing progress report
   */
  const updateReport = useCallback(async (reportId, updates) => {
    if (!reportId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.patch(`/progress-reports/${reportId}`, updates);

      if (isMountedRef.current) {
        const updatedReport = response.data.data;

        // Update in list
        setReports((prev) =>
          prev.map((report) => (report.id === reportId ? updatedReport : report))
        );

        // Update selected if it's the one being updated
        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport);
        }

        return updatedReport;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke oppdatere rapport');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedReport]);

  /**
   * Publish a report to parents
   */
  const publishReport = useCallback(async (reportId) => {
    if (!reportId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post(`/progress-reports/${reportId}/publish`);

      if (isMountedRef.current) {
        const publishedReport = response.data.data;

        // Update in list
        setReports((prev) =>
          prev.map((report) => (report.id === reportId ? publishedReport : report))
        );

        // Update selected if it's the one being published
        if (selectedReport?.id === reportId) {
          setSelectedReport(publishedReport);
        }

        return publishedReport;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke publisere rapport');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [selectedReport]);

  /**
   * Auto-generate a report from player data
   */
  const generateReport = useCallback(async (playerId, periodStart, periodEnd) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/progress-reports/generate', {
        playerId,
        periodStart,
        periodEnd,
      });

      if (isMountedRef.current) {
        const generatedReport = response.data.data;
        setReports((prev) => [generatedReport, ...prev]);
        setSelectedReport(generatedReport);
        return generatedReport;
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke generere rapport');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Refresh reports from API
   */
  const refresh = useCallback(() => {
    return fetchReports();
  }, [fetchReports]);

  /**
   * Clear selected report
   */
  const clearSelected = useCallback(() => {
    setSelectedReport(null);
  }, []);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    reports,
    selectedReport,
    loading,
    error,
    saving,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    publishReport,
    generateReport,
    refresh,
    clearSelected,
  };
}

export default useProgressReports;
