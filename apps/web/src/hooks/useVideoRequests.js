/**
 * useVideoRequests Hook
 * Hook for managing video requests with polling for real-time updates
 *
 * Features:
 * - Fetch pending video requests
 * - Polling for new requests
 * - Update request status
 * - Fulfill request with video
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as videoApi from '../services/videoApi';

// Default polling interval (30 seconds)
const DEFAULT_POLL_INTERVAL = 30000;

// Request statuses
export const REQUEST_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

/**
 * useVideoRequests Hook
 *
 * @param {Object} options - Hook options
 * @param {string} [options.playerId] - Filter by player ID (for coaches)
 * @param {string} [options.status] - Filter by status
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @param {boolean} [options.polling=false] - Enable polling for updates
 * @param {number} [options.pollInterval=30000] - Polling interval in ms
 * @returns {Object} Video requests state and actions
 */
export function useVideoRequests(options = {}) {
  const {
    playerId,
    status,
    autoFetch = true,
    polling = false,
    pollInterval = DEFAULT_POLL_INTERVAL,
  } = options;

  // State
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Refs
  const pollIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch video requests
   */
  const fetchRequests = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await videoApi.listVideoRequests({
        playerId,
        status,
      });

      if (isMountedRef.current) {
        setRequests(result.requests || []);
        setTotal(result.total || 0);
        setLastFetched(new Date());
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch video requests');
        console.error('Failed to fetch video requests:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [playerId, status]);

  /**
   * Refresh requests (with loading indicator)
   */
  const refresh = useCallback(() => {
    return fetchRequests(true);
  }, [fetchRequests]);

  /**
   * Silent refresh (no loading indicator, for polling)
   */
  const silentRefresh = useCallback(() => {
    return fetchRequests(false);
  }, [fetchRequests]);

  /**
   * Update request status
   */
  const updateRequest = useCallback(async (requestId, updates) => {
    try {
      await videoApi.updateVideoRequest(requestId, updates);

      // Update local state optimistically
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, ...updates }
            : req
        )
      );

      // If status changed to fulfilled/cancelled/expired, might need to refetch
      if (updates.status && updates.status !== REQUEST_STATUS.PENDING) {
        // Remove from list if filtering by pending
        if (status === REQUEST_STATUS.PENDING) {
          setRequests((prev) => prev.filter((req) => req.id !== requestId));
          setTotal((prev) => Math.max(0, prev - 1));
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to update video request:', err);
      throw err;
    }
  }, [status]);

  /**
   * Fulfill request with a video
   */
  const fulfillRequest = useCallback(async (requestId, videoId) => {
    return updateRequest(requestId, {
      status: REQUEST_STATUS.FULFILLED,
      fulfilledVideoId: videoId,
    });
  }, [updateRequest]);

  /**
   * Cancel a request
   */
  const cancelRequest = useCallback(async (requestId) => {
    return updateRequest(requestId, {
      status: REQUEST_STATUS.CANCELLED,
    });
  }, [updateRequest]);

  /**
   * Get pending count
   */
  const pendingCount = requests.filter(
    (req) => req.status === REQUEST_STATUS.PENDING
  ).length;

  /**
   * Check if there are new requests (based on last fetch)
   */
  const hasNewRequests = useCallback((sinceDate) => {
    if (!sinceDate) return false;
    return requests.some((req) => new Date(req.createdAt) > sinceDate);
  }, [requests]);

  // Auto-fetch on mount
  useEffect(() => {
    isMountedRef.current = true;

    if (autoFetch) {
      fetchRequests(true);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [autoFetch, fetchRequests]);

  // Setup polling
  useEffect(() => {
    if (polling && pollInterval > 0) {
      pollIntervalRef.current = setInterval(() => {
        silentRefresh();
      }, pollInterval);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [polling, pollInterval, silentRefresh]);

  // Refetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchRequests(true);
    }
  }, [playerId, status]);

  return {
    // State
    requests,
    total,
    loading,
    error,
    lastFetched,
    pendingCount,

    // Actions
    refresh,
    silentRefresh,
    updateRequest,
    fulfillRequest,
    cancelRequest,
    hasNewRequests,
  };
}

export default useVideoRequests;
