/**
 * useNotifications Hook
 * Fetches and manages notifications with polling
 * TypeScript version with proper types
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as notificationsApi from '../services/notificationsApi';

// =============================================================================
// Types
// =============================================================================

export interface Notification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
  data?: Record<string, unknown>;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

interface UseNotificationsOptions {
  /** Whether to fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Whether to enable polling (default: true) */
  polling?: boolean;
  /** Polling interval in ms (default: 45000) */
  pollInterval?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

// =============================================================================
// Constants
// =============================================================================

const POLL_INTERVAL = 45000; // 45 seconds

// =============================================================================
// Hook Implementation
// =============================================================================

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    autoFetch = true,
    polling = true,
    pollInterval = POLL_INTERVAL,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await notificationsApi.getNotifications() as NotificationsResponse;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('[useNotifications] Failed to fetch:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not load notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (notificationId: string | number) => {
    try {
      await notificationsApi.markNotificationRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[useNotifications] Failed to mark as read:', err);
      throw err;
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllNotificationsRead();

      // Update local state
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: now }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('[useNotifications] Failed to mark all as read:', err);
      throw err;
    }
  }, []);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    return fetchNotifications(false);
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Set up polling
  useEffect(() => {
    if (polling && pollInterval > 0) {
      pollIntervalRef.current = setInterval(() => {
        fetchNotifications(false); // Silent refresh (no loading state)
      }, pollInterval);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [polling, pollInterval, fetchNotifications]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}

export default useNotifications;
