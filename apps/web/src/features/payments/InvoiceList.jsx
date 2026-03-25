/**
 * InvoiceList
 * List and manage invoices
 *
 * Features:
 * - List all invoices with filters (pending, paid, overdue)
 * - Search invoices
 * - View invoice details
 * - Pay invoice
 * - Download invoice PDF
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import Button from '../../ui/primitives/Button';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import { SubSectionTitle } from '../../ui/components/typography';
import { track } from '../../analytics/track';
import { PageHeader } from '../../ui/raw-blocks';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-4',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  filters: 'flex gap-2 flex-wrap',
  filterButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  filterButtonActive: 'py-2 px-4 bg-primary border-2 border-primary rounded-lg text-white text-sm font-medium cursor-pointer',
  search: 'flex-1 max-w-md',
  searchInput: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  table: 'w-full border border-border rounded-xl overflow-hidden',
  thead: 'bg-surface-elevated',
  th: 'py-3 px-4 text-left text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider border-b border-border',
  tbody: 'bg-surface divide-y divide-border',
  tr: 'hover:bg-surface-elevated transition-colors cursor-pointer',
  td: 'py-4 px-4 text-sm text-[var(--text-inverse)]',
  invoiceNumber: 'font-mono font-semibold text-primary',
  amount: 'font-semibold',
  statusBadge: {
    pending: 'py-1 px-2 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-500 text-xs font-medium',
    paid: 'py-1 px-2 bg-tier-success/20 border border-tier-success rounded-md text-tier-success text-xs font-medium',
    overdue: 'py-1 px-2 bg-tier-error/20 border border-tier-error rounded-md text-tier-error text-xs font-medium',
    cancelled: 'py-1 px-2 bg-gray-500/20 border border-gray-500 rounded-md text-gray-500 text-xs font-medium',
  },
  actions: 'flex gap-2',
  actionButton: 'py-1.5 px-3 bg-primary border-none rounded-md text-white text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function InvoiceList({ className = '' }) {
  const navigate = useNavigate();
  const {
    invoices,
    loading,
    error,
    payInvoice,
    refresh,
  } = useInvoices();

  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, paid, overdue
  const [searchQuery, setSearchQuery] = useState('');

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.playerName?.toLowerCase().includes(query) ||
        invoice.amount.toString().includes(query)
      );
    }

    return true;
  });

  // Calculate invoice status (including overdue)
  const getInvoiceStatus = (invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return invoice.status;
    }

    // Check if overdue
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    if (now > dueDate) {
      return 'overdue';
    }

    return invoice.status;
  };

  // Format currency
  const formatCurrency = (amount, currency = 'NOK') => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Handle view invoice
  const handleViewInvoice = useCallback((invoiceId) => {
    navigate(`/payments/invoices/${invoiceId}`);

    track('invoice_viewed', {
      screen: 'InvoiceList',
      invoiceId,
    });
  }, [navigate]);

  // Handle pay invoice
  const handlePayInvoice = useCallback(async (invoiceId, e) => {
    e.stopPropagation();

    if (!window.confirm('Proceed with payment?')) {
      return;
    }

    try {
      await payInvoice(invoiceId);

      track('invoice_paid', {
        screen: 'InvoiceList',
        invoiceId,
      });

      alert('Payment successful!');
    } catch (err) {
      console.error('Failed to pay invoice:', err);
      alert(err.response?.data?.message || 'Payment failed');
    }
  }, [payInvoice]);

  // Loading state
  if (loading && invoices.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading invoices..." />
      </div>
    );
  }

  // Error state
  if (error && invoices.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Failed to load invoices"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <PageHeader
        title="Invoices"
        subtitle="Manage and pay your invoices"
        helpText="Complete overview of all invoices with status filtering (pending, paid, overdue). Search by invoice number, player name or amount. Pay pending invoices directly, view detailed information and track payment history."
      />

      {/* Filters and Search */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className={tw.filters}>
          <button
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? tw.filterButtonActive : tw.filterButton}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? tw.filterButtonActive : tw.filterButton}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={statusFilter === 'paid' ? tw.filterButtonActive : tw.filterButton}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={statusFilter === 'overdue' ? tw.filterButtonActive : tw.filterButton}
          >
            Overdue
          </button>
        </div>

        <div className={tw.search}>
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={tw.searchInput}
          />
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>📄</div>
          <SubSectionTitle style={{ marginBottom: 0 }} className={tw.emptyTitle}>No Invoices Found</SubSectionTitle>
          <p className={tw.emptyDescription}>
            {searchQuery || statusFilter !== 'all'
              ? 'No invoices match your filters'
              : 'You have no invoices yet'}
          </p>
        </div>
      ) : (
        <table className={tw.table}>
          <thead className={tw.thead}>
            <tr>
              <th className={tw.th}>Invoice #</th>
              <th className={tw.th}>Player</th>
              <th className={tw.th}>Amount</th>
              <th className={tw.th}>Due Date</th>
              <th className={tw.th}>Status</th>
              <th className={tw.th}>Actions</th>
            </tr>
          </thead>
          <tbody className={tw.tbody}>
            {filteredInvoices.map((invoice) => {
              const status = getInvoiceStatus(invoice);
              return (
                <tr
                  key={invoice.id}
                  onClick={() => handleViewInvoice(invoice.id)}
                  className={tw.tr}
                >
                  <td className={tw.td}>
                    <span className={tw.invoiceNumber}>{invoice.invoiceNumber}</span>
                  </td>
                  <td className={tw.td}>{invoice.playerName || 'N/A'}</td>
                  <td className={tw.td}>
                    <span className={tw.amount}>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                  </td>
                  <td className={tw.td}>
                    {new Date(invoice.dueDate).toLocaleDateString('nb-NO')}
                  </td>
                  <td className={tw.td}>
                    <span className={tw.statusBadge[status]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className={tw.td}>
                    <div className={tw.actions}>
                      {status === 'pending' || status === 'overdue' ? (
                        <button
                          onClick={(e) => handlePayInvoice(invoice.id, e)}
                          className={tw.actionButton}
                        >
                          Pay Now
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InvoiceList;
