/**
 * usePaymentMethods Hook
 * Hook for managing payment methods
 *
 * Features:
 * - Fetch payment methods
 * - Add, remove payment methods
 * - Set default payment method
 * - Optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing payment methods
 *
 * @returns {Object} Payment methods state and controls
 */
export function usePaymentMethods() {
  // State
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch payment methods from API
   */
  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/payments/methods');

      if (!isMountedRef.current) return;

      setPaymentMethods(response.data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke hente betalingsmetoder');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Add a new payment method
   */
  const addPaymentMethod = useCallback(async (paymentMethodData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/methods', paymentMethodData);

      if (isMountedRef.current) {
        const newMethod = response.data.data;
        setPaymentMethods((prev) => [...prev, newMethod]);
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke legge til betalingsmetode');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Remove a payment method
   */
  const removePaymentMethod = useCallback(async (methodId) => {
    if (!methodId) return null;

    setSaving(true);
    setError(null);

    try {
      await apiClient.delete(`/payments/methods/${methodId}`);

      if (isMountedRef.current) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
      }

      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke fjerne betalingsmetode');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Set a payment method as default
   */
  const setDefaultMethod = useCallback(async (methodId) => {
    if (!methodId) return null;

    setSaving(true);
    setError(null);

    try {
      // Update via API (assumes there's a PATCH endpoint)
      await apiClient.patch(`/payments/methods/${methodId}`, { isDefault: true });

      if (isMountedRef.current) {
        setPaymentMethods((prev) =>
          prev.map((m) => ({
            ...m,
            isDefault: m.id === methodId,
          }))
        );
      }

      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Kunne ikke sette standard betalingsmetode');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Refresh payment methods from API
   */
  const refresh = useCallback(() => {
    return fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    saving,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultMethod,
    refresh,
  };
}

export default usePaymentMethods;
