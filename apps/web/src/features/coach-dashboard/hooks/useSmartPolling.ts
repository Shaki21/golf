/**
 * useSmartPolling Hook
 * Intelligent polling that adapts to user activity
 *
 * Features:
 * - Fast polling when tab is active
 * - Slow polling when tab is hidden
 * - Immediate refresh when tab becomes visible
 * - Automatic cleanup
 */

import { useEffect, useRef } from 'react';

export interface SmartPollingOptions {
  /** Base polling interval when tab is active (default: 30000ms / 30s) */
  interval?: number;

  /** Maximum polling interval when tab is hidden (default: 300000ms / 5min) */
  maxInterval?: number;

  /** Callback when tab becomes visible */
  onForeground?: () => void;

  /** Callback when tab becomes hidden */
  onBackground?: () => void;

  /** Enable/disable polling */
  enabled?: boolean;
}

/**
 * Hook for smart adaptive polling
 *
 * @example
 * ```typescript
 * const { data, refetch } = useCoachPlanDashboard();
 *
 * useSmartPolling(refetch, {
 *   interval: 30000,      // 30s when active
 *   maxInterval: 300000,  // 5min when inactive
 *   onForeground: () => console.log('Tab active'),
 *   onBackground: () => console.log('Tab hidden'),
 * });
 * ```
 */
export function useSmartPolling(
  refetch: () => Promise<void> | void,
  options: SmartPollingOptions = {}
) {
  const {
    interval = 30000,        // 30 seconds default
    maxInterval = 300000,    // 5 minutes default
    onForeground,
    onBackground,
    enabled = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalRef = useRef(interval);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      // Clean up if polling is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    /**
     * Start or restart polling with current interval
     */
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (!isPollingRef.current) {
          isPollingRef.current = true;
          Promise.resolve(refetch()).finally(() => {
            isPollingRef.current = false;
          });
        }
      }, currentIntervalRef.current);
    };

    /**
     * Handle visibility change events
     */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - slow down polling
        currentIntervalRef.current = maxInterval;
        onBackground?.();

        // Restart with slower interval
        startPolling();
      } else {
        // Tab visible - speed up polling and refresh immediately
        currentIntervalRef.current = interval;
        onForeground?.();

        // Refresh immediately when tab becomes visible
        if (!isPollingRef.current) {
          isPollingRef.current = true;
          Promise.resolve(refetch()).finally(() => {
            isPollingRef.current = false;
          });
        }

        // Restart with faster interval
        startPolling();
      }
    };

    // Initial polling
    startPolling();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, interval, maxInterval, onForeground, onBackground, enabled]);

  /**
   * Manual control functions
   */
  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resume = () => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(refetch, currentIntervalRef.current);
    }
  };

  return {
    pause,
    resume,
    isActive: intervalRef.current !== null,
  };
}

export default useSmartPolling;
