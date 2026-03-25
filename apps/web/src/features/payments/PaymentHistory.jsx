/**
 * PaymentHistory
 * View complete payment history
 *
 * Features:
 * - List all payment transactions
 * - Filter by type (invoice, subscription, package)
 * - Filter by date range
 * - Filter by status
 * - Search by transaction ID
 * - Download payment receipts
 * - Export history to CSV
 */

import React, { useState, useCallback } from 'react';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../ui/components/typography';
import { track } from '../../analytics/track';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-4',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  filters: 'flex gap-4 flex-wrap items-center',
  filterGroup: 'flex gap-2',
  filterButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  filterButtonActive: 'py-2 px-4 bg-primary border-2 border-primary rounded-lg text-white text-sm font-medium cursor-pointer',
  search: 'flex-1 max-w-md',
  searchInput: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  exportButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  table: 'w-full border border-border rounded-xl overflow-hidden',
  thead: 'bg-surface-elevated',
  th: 'py-3 px-4 text-left text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider border-b border-border',
  tbody: 'bg-surface divide-y divide-border',
  tr: 'hover:bg-surface-elevated transition-colors',
  td: 'py-4 px-4 text-sm text-[var(--text-inverse)]',
  transactionId: 'font-mono text-xs text-[var(--video-text-secondary)]',
  amount: 'font-semibold',
  statusBadge: {
    completed: 'inline-flex py-1 px-2 bg-tier-success/20 border border-tier-success rounded-md text-tier-success text-xs font-medium',
    pending: 'inline-flex py-1 px-2 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-500 text-xs font-medium',
    failed: 'inline-flex py-1 px-2 bg-tier-error/20 border border-tier-error rounded-md text-tier-error text-xs font-medium',
    refunded: 'inline-flex py-1 px-2 bg-gray-500/20 border border-gray-500 rounded-md text-gray-500 text-xs font-medium',
  },
  typeBadge: {
    invoice: 'inline-flex py-1 px-2 bg-blue-500/20 border border-blue-500 rounded-md text-blue-500 text-xs font-medium',
    subscription: 'inline-flex py-1 px-2 bg-purple-500/20 border border-purple-500 rounded-md text-purple-500 text-xs font-medium',
    package: 'inline-flex py-1 px-2 bg-green-500/20 border border-green-500 rounded-md text-green-500 text-xs font-medium',
  },
  actions: 'flex gap-2',
  actionButton: 'text-primary text-xs font-medium cursor-pointer hover:underline',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
  summary: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6',
  summaryCard: 'p-4 bg-surface rounded-xl border border-border',
  summaryLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  summaryValue: 'text-2xl font-bold text-[var(--text-inverse)]',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function PaymentHistory({ className = '' }) {
  const {
    transactions,
    loading,
    error,
    refresh,
  } = usePaymentHistory();

  const [typeFilter, setTypeFilter] = useState('all'); // all, invoice, subscription, package
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, pending, failed
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    // Type filter
    if (typeFilter !== 'all' && txn.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && txn.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        txn.id.toLowerCase().includes(query) ||
        txn.description?.toLowerCase().includes(query) ||
        txn.amount.toString().includes(query)
      );
    }

    return true;
  });

  // Calculate summary stats
  const summary = {
    total: transactions.reduce((sum, txn) => sum + (txn.status === 'completed' ? txn.amount : 0), 0),
    completed: transactions.filter(txn => txn.status === 'completed').length,
    pending: transactions.filter(txn => txn.status === 'pending').length,
    thisMonth: transactions.filter(txn => {
      const txnDate = new Date(txn.createdAt);
      const now = new Date();
      return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
    }).reduce((sum, txn) => sum + (txn.status === 'completed' ? txn.amount : 0), 0),
  };

  // Format currency
  const formatCurrency = (amount, currency = 'NOK') => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle export to CSV
  const handleExportCSV = useCallback(() => {
    const csvHeaders = ['Date', 'Transaction ID', 'Type', 'Description', 'Amount', 'Status'];
    const csvRows = filteredTransactions.map(txn => [
      new Date(txn.createdAt).toLocaleDateString('nb-NO'),
      txn.id,
      txn.type,
      txn.description || '',
      txn.amount,
      txn.status,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    track('payment_history_exported', {
      screen: 'PaymentHistory',
      count: filteredTransactions.length,
    });
  }, [filteredTransactions]);

  // Loading state
  if (loading && transactions.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading payment history..." />
      </div>
    );
  }

  // Error state
  if (error && transactions.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Failed to load payment history"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SectionTitle style={{ marginBottom: 0 }} className={tw.title}>Payment History</SectionTitle>
      </div>

      {/* Summary Cards */}
      {transactions.length > 0 && (
        <div className={tw.summary}>
          <div className={tw.summaryCard}>
            <div className={tw.summaryLabel}>Total Paid</div>
            <div className={tw.summaryValue}>{formatCurrency(summary.total)}</div>
          </div>
          <div className={tw.summaryCard}>
            <div className={tw.summaryLabel}>Completed</div>
            <div className={tw.summaryValue}>{summary.completed}</div>
          </div>
          <div className={tw.summaryCard}>
            <div className={tw.summaryLabel}>Pending</div>
            <div className={tw.summaryValue}>{summary.pending}</div>
          </div>
          <div className={tw.summaryCard}>
            <div className={tw.summaryLabel}>This Month</div>
            <div className={tw.summaryValue}>{formatCurrency(summary.thisMonth)}</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className={tw.filters}>
        <div className={tw.filterGroup}>
          <button
            onClick={() => setTypeFilter('all')}
            className={typeFilter === 'all' ? tw.filterButtonActive : tw.filterButton}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('invoice')}
            className={typeFilter === 'invoice' ? tw.filterButtonActive : tw.filterButton}
          >
            Invoices
          </button>
          <button
            onClick={() => setTypeFilter('subscription')}
            className={typeFilter === 'subscription' ? tw.filterButtonActive : tw.filterButton}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setTypeFilter('package')}
            className={typeFilter === 'package' ? tw.filterButtonActive : tw.filterButton}
          >
            Packages
          </button>
        </div>

        <div className={tw.filterGroup}>
          <button
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? tw.filterButtonActive : tw.filterButton}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={statusFilter === 'completed' ? tw.filterButtonActive : tw.filterButton}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? tw.filterButtonActive : tw.filterButton}
          >
            Pending
          </button>
        </div>

        <div className={tw.search}>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={tw.searchInput}
          />
        </div>

        <button onClick={handleExportCSV} className={tw.exportButton}>
          Stats Export CSV
        </button>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>💳</div>
          <SubSectionTitle style={{ marginBottom: 0 }} className={tw.emptyTitle}>No Transactions Found</SubSectionTitle>
          <p className={tw.emptyDescription}>
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'No transactions match your filters'
              : 'You have no payment history yet'}
          </p>
        </div>
      ) : (
        <table className={tw.table}>
          <thead className={tw.thead}>
            <tr>
              <th className={tw.th}>Date</th>
              <th className={tw.th}>Transaction ID</th>
              <th className={tw.th}>Type</th>
              <th className={tw.th}>Description</th>
              <th className={tw.th}>Amount</th>
              <th className={tw.th}>Status</th>
              <th className={tw.th}>Actions</th>
            </tr>
          </thead>
          <tbody className={tw.tbody}>
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className={tw.tr}>
                <td className={tw.td}>
                  {new Date(txn.createdAt).toLocaleDateString('nb-NO')}
                </td>
                <td className={tw.td}>
                  <div className={tw.transactionId}>{txn.id.substring(0, 8)}...</div>
                </td>
                <td className={tw.td}>
                  <span className={tw.typeBadge[txn.type]}>
                    {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                  </span>
                </td>
                <td className={tw.td}>{txn.description || 'N/A'}</td>
                <td className={tw.td}>
                  <span className={tw.amount}>
                    {formatCurrency(txn.amount, txn.currency)}
                  </span>
                </td>
                <td className={tw.td}>
                  <span className={tw.statusBadge[txn.status]}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </span>
                </td>
                <td className={tw.td}>
                  <div className={tw.actions}>
                    <button
                      onClick={() => alert('Receipt download coming soon')}
                      className={tw.actionButton}
                    >
                      Download Receipt
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PaymentHistory;
