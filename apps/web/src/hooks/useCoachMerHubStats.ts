/**
 * useCoachMerHubStats - Hook for fetching Coach More Hub statistics
 *
 * Fetches:
 * - Unread messages count
 * - Number of groups
 * - Pending modification requests
 */

import { useState, useEffect, useCallback } from 'react';
import { coachesAPI, trainingPlanAPI, chatAPI, notificationsAPI } from '../services/api';

interface CoachMerHubStats {
  ulesteMeldinger: number;
  grupper: number;
  endringsforesporsler: number;
}

interface UseCoachMerHubStatsReturn {
  stats: CoachMerHubStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCoachMerHubStats(): UseCoachMerHubStatsReturn {
  const [stats, setStats] = useState<CoachMerHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let ulesteMeldinger = 0;
      let grupper = 0;
      let endringsforesporsler = 0;

      // Fetch unread messages/notifications count
      try {
        const unreadResponse = await notificationsAPI.getUnread();
        const notifications = unreadResponse.data?.data;
        ulesteMeldinger = notifications?.unreadCount || (Array.isArray(notifications?.notifications) ? notifications.notifications.length : 0);
      } catch {
        // Fallback to alerts if notifications API fails
        try {
          const alertsResponse = await coachesAPI.getAlerts(true);
          const alerts = alertsResponse.data?.data || [];
          ulesteMeldinger = alerts.length;
        } catch {
          ulesteMeldinger = 0;
        }
      }

      // Fetch groups count
      try {
        const groupsResponse = await chatAPI.getGroups();
        const groups = groupsResponse.data?.data || [];
        grupper = groups.length;
      } catch {
        grupper = 0;
      }

      // Fetch modification requests
      try {
        const modRequestsResponse = await trainingPlanAPI.getModificationRequests({ status: 'pending' });
        const modRequests = modRequestsResponse.data?.data || [];
        endringsforesporsler = Array.isArray(modRequests) ? modRequests.length : 0;
      } catch {
        endringsforesporsler = 0;
      }

      setStats({
        ulesteMeldinger,
        grupper,
        endringsforesporsler,
      });
    } catch (err: any) {
      console.error('Failed to fetch coach mer hub stats:', err);
      setError(err.response?.data?.message || 'Could not load statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

export default useCoachMerHubStats;
