/**
 * Real-Time Polling Hook
 *
 * Provides automatic data polling with:
 * - Configurable interval
 * - Last updated timestamp
 * - Manual refresh capability
 * - Pause/resume functionality
 * - Visual loading indicator for background refreshes
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseRealTimePollingOptions<T> {
  /** Function to fetch data */
  fetchFn: () => Promise<T>;
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number;
  /** Whether to start polling immediately (default: true) */
  enabled?: boolean;
  /** Callback when data is successfully fetched */
  onSuccess?: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
  /** Whether to show loading indicator on background refreshes (default: false) */
  showBackgroundLoading?: boolean;
}

export interface UseRealTimePollingResult<T> {
  /** Current data */
  data: T | null;
  /** Whether initial loading is in progress */
  isLoading: boolean;
  /** Whether a background refresh is in progress */
  isRefreshing: boolean;
  /** Last error that occurred */
  error: Error | null;
  /** Timestamp of last successful update */
  lastUpdated: Date | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Pause polling */
  pause: () => void;
  /** Resume polling */
  resume: () => void;
  /** Whether polling is currently paused */
  isPaused: boolean;
}

export function useRealTimePolling<T>({
  fetchFn,
  interval = 30000,
  enabled = true,
  onSuccess,
  onError,
  showBackgroundLoading = false,
}: UseRealTimePollingOptions<T>): UseRealTimePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const isFirstLoad = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (isBackground && showBackgroundLoading) {
        setIsRefreshing(true);
      } else if (!isBackground) {
        setIsLoading(true);
      }

      const result = await fetchFn();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFirstLoad.current = false;
    }
  }, [fetchFn, onSuccess, onError, showBackgroundLoading]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const pause = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled && isFirstLoad.current) {
      fetchData(false);
    }
  }, [enabled, fetchData]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isPaused, interval, fetchData]);

  // Pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else if (enabled && !isPaused) {
        // Resume and immediately refresh when tab becomes visible
        resume();
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isPaused, pause, resume, fetchData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    pause,
    resume,
    isPaused,
  };
}

/**
 * Format "last updated" timestamp for display
 */
export function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Aldri oppdatert';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 10) return 'Nettopp oppdatert';
  if (diffSeconds < 60) return `${diffSeconds} sek siden`;
  if (diffMinutes < 60) return `${diffMinutes} min siden`;

  return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

export default useRealTimePolling;
