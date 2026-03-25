/**
 * useSubscriptions Hook
 * Hook for managing subscriptions
 *
 * Features:
 * - Fetch active subscription
 * - Create/update subscription
 * - Cancel subscription
 * - Get subscription history
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing subscriptions
 *
 * @returns {Object} Subscription state and controls
 */
export function useSubscriptions() {
  // State
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch active subscription from API
   */
  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/payments/subscriptions');

      if (!isMountedRef.current) return;

      // Assume API returns list, get the active one
      const subscriptions = response.data.data || [];
      const activeSubscription = subscriptions.find(s => s.status === 'active');

      setSubscription(activeSubscription || null);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente abonnement');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Create or update subscription
   */
  const createSubscription = useCallback(async (subscriptionData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/subscriptions', subscriptionData);

      if (isMountedRef.current) {
        const newSubscription = response.data.data;
        setSubscription(newSubscription);
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke opprette abonnement');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async (subscriptionId) => {
    if (!subscriptionId) return null;

    setSaving(true);
    setError(null);

    try {
      await apiClient.post(`/payments/subscriptions/${subscriptionId}/cancel`);

      if (isMountedRef.current) {
        // Update subscription to show cancelled status
        setSubscription((prev) =>
          prev && prev.id === subscriptionId
            ? { ...prev, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : prev
        );
      }

      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke kansellere abonnement');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Refresh subscription from API
   */
  const refresh = useCallback(() => {
    return fetchSubscription();
  }, [fetchSubscription]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    subscription,
    loading,
    error,
    saving,
    createSubscription,
    cancelSubscription,
    refresh,
  };
}

export default useSubscriptions;
