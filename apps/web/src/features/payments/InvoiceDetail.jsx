/**
 * InvoiceDetail
 * View detailed invoice information
 *
 * Features:
 * - Display invoice details (number, dates, amounts)
 * - Line items breakdown
 * - Payment status
 * - Pay invoice action
 * - Send invoice email
 * - Download invoice PDF
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from '../../ui/components/typography';
import { track } from '../../analytics/track';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6 p-6 max-w-4xl mx-auto',
  card: 'bg-surface rounded-xl border border-border p-6',
  section: 'flex flex-col gap-4',
  sectionTitle: 'text-lg font-semibold text-[var(--text-inverse)] m-0 pb-2 border-b border-border',
  grid: 'grid grid-cols-2 gap-4',
  field: 'flex flex-col gap-1',
  label: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider',
  value: 'text-sm text-[var(--text-inverse)]',
  invoiceNumber: 'text-xl font-mono font-bold text-primary',
  statusBadge: {
    pending: 'inline-flex py-1 px-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-500 text-sm font-semibold',
    paid: 'inline-flex py-1 px-3 bg-tier-success/20 border border-tier-success rounded-lg text-tier-success text-sm font-semibold',
    overdue: 'inline-flex py-1 px-3 bg-tier-error/20 border border-tier-error rounded-lg text-tier-error text-sm font-semibold',
    cancelled: 'inline-flex py-1 px-3 bg-gray-500/20 border border-gray-500 rounded-lg text-gray-500 text-sm font-semibold',
  },
  lineItemsTable: 'w-full',
  thead: 'border-b-2 border-border',
  th: 'py-3 px-4 text-left text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider',
  tbody: 'divide-y divide-border',
  tr: 'hover:bg-surface-elevated transition-colors',
  td: 'py-4 px-4 text-sm text-[var(--text-inverse)]',
  totalRow: 'py-4 px-4 text-base font-bold text-[var(--text-inverse)]',
  actions: 'flex gap-3 flex-wrap',
  actionButton: 'py-2 px-4 bg-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity',
  secondaryButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  warningBox: 'p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg flex items-start gap-3',
  warningIcon: 'text-2xl text-yellow-500',
  warningContent: 'flex-1',
  warningTitle: 'text-sm font-semibold text-yellow-500 mb-1',
  warningText: 'text-sm text-[var(--text-inverse)]',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function InvoiceDetail({ className = '' }) {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const {
    getInvoice,
    payInvoice,
    sendInvoiceEmail,
    saving,
  } = useInvoices();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getInvoice(invoiceId);
        setInvoice(data);

        track('invoice_detail_viewed', {
          screen: 'InvoiceDetail',
          invoiceId,
          status: data.status,
        });
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        setError(err.response?.data?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId, getInvoice]);

  // Calculate invoice status (including overdue)
  const getInvoiceStatus = useCallback(() => {
    if (!invoice) return 'pending';

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
  }, [invoice]);

  // Format currency
  const formatCurrency = (amount, currency = 'NOK') => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Handle pay invoice
  const handlePayInvoice = useCallback(async () => {
    if (!invoice || !window.confirm('Proceed with payment?')) {
      return;
    }

    try {
      await payInvoice(invoice.id);

      // Refresh invoice
      const updatedInvoice = await getInvoice(invoice.id);
      setInvoice(updatedInvoice);

      track('invoice_paid_from_detail', {
        screen: 'InvoiceDetail',
        invoiceId: invoice.id,
      });

      alert('Payment successful!');
    } catch (err) {
      console.error('Failed to pay invoice:', err);
      alert(err.response?.data?.message || 'Payment failed');
    }
  }, [invoice, payInvoice, getInvoice]);

  // Handle send invoice email
  const handleSendEmail = useCallback(async () => {
    if (!invoice) return;

    setSendingEmail(true);

    try {
      await sendInvoiceEmail(invoice.id);

      track('invoice_email_sent', {
        screen: 'InvoiceDetail',
        invoiceId: invoice.id,
      });

      alert('Invoice email sent successfully!');
    } catch (err) {
      console.error('Failed to send invoice email:', err);
      alert(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  }, [invoice, sendInvoiceEmail]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate('/payments/invoices');
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading invoice..." />
      </div>
    );
  }

  // Error state
  if (error || !invoice) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Failed to load invoice"
          description={error || 'Invoice not found'}
          action={<Button variant="primary" onClick={handleBack}>Back to Invoices</Button>}
        />
      </div>
    );
  }

  const status = getInvoiceStatus();
  const isOverdue = status === 'overdue';
  const canPay = status === 'pending' || status === 'overdue';

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <PageHeader
        title="Invoice Details"
        helpText="Detaljert fakturainformasjon med fakturanummer, datoer, linjeartikler og betalingsstatus. Se totalt beløp, betalingsmetode og last ned PDF. Betal ubetal faktura direkte eller send på e-post."
        onBack={handleBack}
        divider={false}
      />

      {/* Overdue Warning */}
      {isOverdue && (
        <div className={tw.warningBox}>
          <div className={tw.warningIcon}>alert-triangle️</div>
          <div className={tw.warningContent}>
            <div className={tw.warningTitle}>Invoice Overdue</div>
            <div className={tw.warningText}>
              This invoice was due on {new Date(invoice.dueDate).toLocaleDateString('nb-NO')}.
              Please process payment as soon as possible.
            </div>
          </div>
        </div>
      )}

      {/* Invoice Summary */}
      <div className={tw.card}>
        <div className={tw.section}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-[var(--video-text-secondary)] mb-1">INVOICE NUMBER</div>
              <div className={tw.invoiceNumber}>{invoice.invoiceNumber}</div>
            </div>
            <div className={tw.statusBadge[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>

          <div className={tw.grid}>
            <div className={tw.field}>
              <div className={tw.label}>Issue Date</div>
              <div className={tw.value}>
                {new Date(invoice.createdAt).toLocaleDateString('nb-NO')}
              </div>
            </div>

            <div className={tw.field}>
              <div className={tw.label}>Due Date</div>
              <div className={tw.value}>
                {new Date(invoice.dueDate).toLocaleDateString('nb-NO')}
              </div>
            </div>

            <div className={tw.field}>
              <div className={tw.label}>Player</div>
              <div className={tw.value}>{invoice.playerName || 'N/A'}</div>
            </div>

            {invoice.paidAt && (
              <div className={tw.field}>
                <div className={tw.label}>Paid Date</div>
                <div className={tw.value}>
                  {new Date(invoice.paidAt).toLocaleDateString('nb-NO')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className={tw.card}>
        <div className={tw.section}>
          <SubSectionTitle style={{ marginBottom: 0 }} className={tw.sectionTitle}>Items</SubSectionTitle>

          <table className={tw.lineItemsTable}>
            <thead className={tw.thead}>
              <tr>
                <th className={tw.th}>Description</th>
                <th className={tw.th}>Quantity</th>
                <th className={tw.th}>Unit Price</th>
                <th className={tw.th}>Amount</th>
              </tr>
            </thead>
            <tbody className={tw.tbody}>
              {invoice.items.map((item, index) => (
                <tr key={index} className={tw.tr}>
                  <td className={tw.td}>{item.description}</td>
                  <td className={tw.td}>{item.quantity}</td>
                  <td className={tw.td}>
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  <td className={tw.td}>
                    {formatCurrency(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className={tw.totalRow}>Total</td>
                <td className={tw.totalRow}>
                  {formatCurrency(invoice.amount, invoice.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className={tw.card}>
        <div className={tw.actions}>
          {canPay && (
            <button
              onClick={handlePayInvoice}
              disabled={saving}
              className={tw.actionButton}
            >
              {saving ? 'Processing...' : '💳 Pay Invoice'}
            </button>
          )}

          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className={tw.secondaryButton}
          >
            {sendingEmail ? 'Sending...' : '📧 Send Email'}
          </button>

          <button
            onClick={() => alert('PDF download functionality coming soon')}
            className={tw.secondaryButton}
          >
            📄 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
