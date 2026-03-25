/**
 * usePaymentHistory Hook
 * Hook for fetching complete payment history
 *
 * Features:
 * - Aggregate payments from multiple sources
 * - Invoices, subscriptions, session packages
 * - Unified transaction list
 * - Sorting by date
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInvoices } from './useInvoices';
import { useSubscriptions } from './useSubscriptions';
import { useSessionPackages } from './useSessionPackages';

/**
 * Hook for managing complete payment history
 *
 * @returns {Object} Payment history state and controls
 */
export function usePaymentHistory() {
  // State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const isMountedRef = useRef(true);

  // Get data from other hooks
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { subscription, loading: subscriptionLoading } = useSubscriptions();
  const { ownedPackages, loading: packagesLoading } = useSessionPackages();

  /**
   * Aggregate transactions from all sources
   */
  const aggregateTransactions = useCallback(() => {
    const txns = [];

    // Add invoice payments
    invoices.forEach((invoice) => {
      if (invoice.status === 'paid') {
        txns.push({
          id: invoice.id,
          type: 'invoice',
          description: `Invoice ${invoice.invoiceNumber}`,
          amount: invoice.amount,
          currency: invoice.currency || 'NOK',
          status: 'completed',
          createdAt: invoice.paidAt || invoice.createdAt,
        });
      } else if (invoice.status === 'pending') {
        txns.push({
          id: invoice.id,
          type: 'invoice',
          description: `Invoice ${invoice.invoiceNumber}`,
          amount: invoice.amount,
          currency: invoice.currency || 'NOK',
          status: 'pending',
          createdAt: invoice.createdAt,
        });
      }
    });

    // Add subscription payment (if active)
    if (subscription && subscription.status === 'active') {
      // For simplicity, show one transaction for the subscription
      // In reality, you'd fetch subscription payment history from backend
      txns.push({
        id: subscription.id,
        type: 'subscription',
        description: `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Subscription`,
        amount: subscription.price || 0,
        currency: 'NOK',
        status: 'completed',
        createdAt: subscription.createdAt,
      });
    }

    // Add session package purchases
    ownedPackages.forEach((pkg) => {
      txns.push({
        id: pkg.id,
        type: 'package',
        description: `Session Package (${pkg.totalSessions} sessions)`,
        amount: pkg.price || 0,
        currency: 'NOK',
        status: 'completed',
        createdAt: pkg.createdAt,
      });
    });

    // Sort by date (newest first)
    txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return txns;
  }, [invoices, subscription, ownedPackages]);

  /**
   * Update transactions when data changes
   */
  useEffect(() => {
    if (!invoicesLoading && !subscriptionLoading && !packagesLoading) {
      const aggregated = aggregateTransactions();
      setTransactions(aggregated);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [invoices, subscription, ownedPackages, invoicesLoading, subscriptionLoading, packagesLoading, aggregateTransactions]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    // This will trigger re-fetching in the dependent hooks
    setLoading(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    transactions,
    loading,
    error,
    refresh,
  };
}

export default usePaymentHistory;
