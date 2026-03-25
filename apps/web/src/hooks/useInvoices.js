/**
 * useInvoices Hook
 * Hook for managing invoices
 *
 * Features:
 * - Fetch invoices with filters
 * - Create, get invoice details
 * - Pay invoice
 * - Send invoice email
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing invoices
 *
 * @param {Object} [options] - Hook options
 * @param {string} [options.playerId] - Filter by player
 * @param {string} [options.status] - Filter by status
 * @returns {Object} Invoices state and controls
 */
export function useInvoices(options = {}) {
  const { playerId, status } = options;

  // State
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch invoices from API
   */
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (playerId) params.playerId = playerId;
      if (status) params.status = status;

      const response = await apiClient.get('/payments/invoices', { params });

      if (!isMountedRef.current) return;

      setInvoices(response.data.data || []);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Could not fetch invoices');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [playerId, status]);

  /**
   * Get invoice by ID
   */
  const getInvoice = useCallback(async (invoiceId) => {
    if (!invoiceId) return null;

    try {
      const response = await apiClient.get(`/payments/invoices/${invoiceId}`);
      return response.data.data;
    } catch (err) {
      console.error('Failed to get invoice:', err);
      throw err;
    }
  }, []);

  /**
   * Create a new invoice
   */
  const createInvoice = useCallback(async (invoiceData) => {
    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post('/payments/invoices', invoiceData);

      if (isMountedRef.current) {
        const newInvoice = response.data.data;
        setInvoices((prev) => [newInvoice, ...prev]);
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Could not create invoice');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Pay an invoice
   */
  const payInvoice = useCallback(async (invoiceId, paymentMethodId = null) => {
    if (!invoiceId) return null;

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post(`/payments/invoices/${invoiceId}/pay`, {
        paymentMethodId,
      });

      if (isMountedRef.current) {
        // Update invoice status in list
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, status: 'paid', paidAt: new Date().toISOString() }
              : inv
          )
        );
      }

      return response.data.data;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Could not pay invoice');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Send invoice email
   */
  const sendInvoiceEmail = useCallback(async (invoiceId) => {
    if (!invoiceId) return null;

    setSaving(true);
    setError(null);

    try {
      await apiClient.post(`/payments/invoices/${invoiceId}/send`);
      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Could not send invoice');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Refresh invoices from API
   */
  const refresh = useCallback(() => {
    return fetchInvoices();
  }, [fetchInvoices]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    invoices,
    loading,
    error,
    saving,
    getInvoice,
    createInvoice,
    payInvoice,
    sendInvoiceEmail,
    refresh,
  };
}

export default useInvoices;
