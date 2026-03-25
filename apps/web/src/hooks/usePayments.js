/**
 * Payment & Billing Hooks
 * API integration for payment processing, invoices, subscriptions, and session packages
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export function usePaymentMethods(playerId = null, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = playerId ? { playerId } : {};
      const response = await apiClient.get('/payments/methods', { params });
      setData(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchPaymentMethods();
    }
  }, [fetchPaymentMethods, options.autoLoad]);

  return { paymentMethods: data, loading, error, refetch: fetchPaymentMethods };
}

export function useAddPaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addPaymentMethod = useCallback(async (methodData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/payments/methods', methodData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to add payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addPaymentMethod, loading, error };
}

export function useDeletePaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deletePaymentMethod = useCallback(async (methodId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to delete payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deletePaymentMethod, loading, error };
}

// ============================================================================
// INVOICES
// ============================================================================

export function useInvoices(filters = {}, options = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/payments/invoices', { params: filters });
      setData(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchInvoices();
    }
  }, [fetchInvoices, options.autoLoad]);

  return { invoices: data, total, loading, error, refetch: fetchInvoices };
}

export function useInvoice(invoiceId, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/payments/invoices/${invoiceId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchInvoice();
    }
  }, [fetchInvoice, options.autoLoad]);

  return { invoice: data, loading, error, refetch: fetchInvoice };
}

export function useCreateInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInvoice = useCallback(async (invoiceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/payments/invoices', invoiceData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createInvoice, loading, error };
}

export function usePayInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const payInvoice = useCallback(async (invoiceId, paymentMethodId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/payments/invoices/${invoiceId}/pay`, {
        paymentMethodId,
      });
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to pay invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { payInvoice, loading, error };
}

// ============================================================================
// STRIPE SETUP INTENT
// ============================================================================

export function useCreateSetupIntent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSetupIntent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/payments/setup-intent');
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create setup intent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSetupIntent, loading, error };
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export function useSubscriptions(filters = {}, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/payments/subscriptions', { params: filters });
      setData(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchSubscriptions();
    }
  }, [fetchSubscriptions, options.autoLoad]);

  return { subscriptions: data, loading, error, refetch: fetchSubscriptions };
}

export function useCreateSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSubscription = useCallback(async (subscriptionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/payments/subscriptions', subscriptionData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSubscription, loading, error };
}

export function useCancelSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelSubscription = useCallback(async (subscriptionId, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/payments/subscriptions/${subscriptionId}/cancel`, {
        reason,
      });
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancelSubscription, loading, error };
}

// ============================================================================
// SESSION PACKAGES
// ============================================================================

export function useCreateSessionPackage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSessionPackage = useCallback(async (packageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/payments/session-packages', packageData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to create session package');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSessionPackage, loading, error };
}

export function useSessionFromPackage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const useSession = useCallback(async (packageId, sessionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post(`/payments/session-packages/${packageId}/use`, sessionData);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to use session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { useSession, loading, error };
}
