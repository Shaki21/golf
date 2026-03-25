/**
 * PaymentMethodsManager
 * Manage payment methods (Stripe, Vipps, Invoice)
 *
 * Features:
 * - List all payment methods
 * - Add new payment method
 * - Set default payment method
 * - Remove payment methods
 * - Support for Stripe, Vipps, and Invoice
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
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
  addButton: 'py-2 px-4 bg-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity',
  methodsList: 'flex flex-col gap-3',
  methodCard: 'p-4 bg-surface rounded-xl border border-border flex items-center gap-4',
  methodCardDefault: 'p-4 bg-surface rounded-xl border-2 border-primary flex items-center gap-4',
  methodIcon: 'text-3xl',
  methodInfo: 'flex-1',
  methodType: 'text-sm font-semibold text-[var(--text-inverse)] mb-1',
  methodDetails: 'text-xs text-[var(--video-text-secondary)]',
  defaultBadge: 'py-1 px-2 bg-primary/20 border border-primary rounded-md text-primary text-xs font-medium',
  methodActions: 'flex gap-2',
  setDefaultButton: 'py-1.5 px-3 bg-surface-elevated border border-border rounded-md text-[var(--text-inverse)] text-xs font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  removeButton: 'py-1.5 px-3 bg-tier-error/10 border border-tier-error rounded-md text-tier-error text-xs font-medium cursor-pointer hover:bg-tier-error/20 transition-colors',
  modal: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
  modalCard: 'w-full max-w-md bg-surface rounded-xl border border-border p-6 flex flex-col gap-4',
  modalTitle: 'text-lg font-semibold text-[var(--text-inverse)] m-0',
  form: 'flex flex-col gap-3',
  label: 'text-sm font-medium text-[var(--text-inverse)] mb-1',
  select: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  input: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  modalActions: 'flex gap-2 justify-end mt-2',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function PaymentMethodsManager({ className = '' }) {
  const {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultMethod,
    refresh,
  } = usePaymentMethods();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [methodType, setMethodType] = useState('stripe');
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState('');
  const [vippsPhoneNumber, setVippsPhoneNumber] = useState('');

  // Get payment method icon
  const getMethodIcon = (type) => {
    switch (type) {
      case 'stripe':
        return '💳';
      case 'vipps':
        return '📱';
      case 'invoice':
        return '📄';
      default:
        return '💰';
    }
  };

  // Get payment method display name
  const getMethodDisplayName = (method) => {
    switch (method.type) {
      case 'stripe':
        return method.brand ? `${method.brand} •••• ${method.last4}` : 'Stripe Card';
      case 'vipps':
        return `Vipps ${method.vippsPhoneNumber || ''}`;
      case 'invoice':
        return 'Invoice Payment';
      default:
        return method.type;
    }
  };

  // Handle add payment method
  const handleAddMethod = useCallback(async () => {
    setAddingMethod(true);

    try {
      const payload = {
        type: methodType,
      };

      if (methodType === 'stripe') {
        if (!stripePaymentMethodId.trim()) {
          alert('Please enter a Stripe payment method ID');
          return;
        }
        payload.stripePaymentMethodId = stripePaymentMethodId.trim();
      } else if (methodType === 'vipps') {
        if (!vippsPhoneNumber.trim()) {
          alert('Please enter a Vipps phone number');
          return;
        }
        payload.vippsPhoneNumber = vippsPhoneNumber.trim();
      }

      await addPaymentMethod(payload);

      // Reset form
      setShowAddModal(false);
      setMethodType('stripe');
      setStripePaymentMethodId('');
      setVippsPhoneNumber('');

      track('payment_method_added', {
        screen: 'PaymentMethodsManager',
        methodType,
      });
    } catch (err) {
      console.error('Failed to add payment method:', err);
      alert(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setAddingMethod(false);
    }
  }, [methodType, stripePaymentMethodId, vippsPhoneNumber, addPaymentMethod]);

  // Handle remove payment method
  const handleRemove = useCallback(async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      await removePaymentMethod(methodId);

      track('payment_method_removed', {
        screen: 'PaymentMethodsManager',
        methodId,
      });
    } catch (err) {
      console.error('Failed to remove payment method:', err);
      alert('Failed to remove payment method');
    }
  }, [removePaymentMethod]);

  // Handle set as default
  const handleSetDefault = useCallback(async (methodId) => {
    try {
      await setDefaultMethod(methodId);

      track('payment_method_set_default', {
        screen: 'PaymentMethodsManager',
        methodId,
      });
    } catch (err) {
      console.error('Failed to set default payment method:', err);
      alert('Failed to set default payment method');
    }
  }, [setDefaultMethod]);

  // Loading state
  if (loading && paymentMethods.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading payment methods..." />
      </div>
    );
  }

  // Error state
  if (error && paymentMethods.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Failed to load payment methods"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <div className={`${tw.container} ${className}`}>
        {/* Header */}
        <div className={tw.header}>
          <SectionTitle style={{ marginBottom: 0 }} className={tw.title}>Payment Methods</SectionTitle>
          <button onClick={() => setShowAddModal(true)} className={tw.addButton}>
            + Add Payment Method
          </button>
        </div>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className={tw.emptyState}>
            <div className={tw.emptyIcon}>💳</div>
            <SubSectionTitle style={{ marginBottom: 0 }} className={tw.emptyTitle}>No Payment Methods</SubSectionTitle>
            <p className={tw.emptyDescription}>
              Add a payment method to enable automatic payments and subscriptions
            </p>
          </div>
        ) : (
          <div className={tw.methodsList}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={method.isDefault ? tw.methodCardDefault : tw.methodCard}
              >
                <div className={tw.methodIcon}>{getMethodIcon(method.type)}</div>
                <div className={tw.methodInfo}>
                  <div className={tw.methodType}>{getMethodDisplayName(method)}</div>
                  <div className={tw.methodDetails}>
                    Added {new Date(method.createdAt).toLocaleDateString('nb-NO')}
                  </div>
                </div>
                {method.isDefault && (
                  <div className={tw.defaultBadge}>Default</div>
                )}
                <div className={tw.methodActions}>
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className={tw.setDefaultButton}
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(method.id)}
                    className={tw.removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className={tw.modal} onClick={() => setShowAddModal(false)}>
          <div className={tw.modalCard} onClick={(e) => e.stopPropagation()}>
            <SubSectionTitle style={{ marginBottom: 0 }} className={tw.modalTitle}>Add Payment Method</SubSectionTitle>

            <div className={tw.form}>
              <div>
                <label className={tw.label}>Payment Type</label>
                <select
                  value={methodType}
                  onChange={(e) => setMethodType(e.target.value)}
                  className={tw.select}
                  disabled={addingMethod}
                >
                  <option value="stripe">Credit/Debit Card (Stripe)</option>
                  <option value="vipps">Vipps</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>

              {methodType === 'stripe' && (
                <div>
                  <label className={tw.label}>Stripe Payment Method ID</label>
                  <input
                    type="text"
                    placeholder="pm_xxxxxxxxxx"
                    value={stripePaymentMethodId}
                    onChange={(e) => setStripePaymentMethodId(e.target.value)}
                    className={tw.input}
                    disabled={addingMethod}
                  />
                  <p className="text-xs text-[var(--video-text-tertiary)] mt-1">
                    You'll be redirected to Stripe to enter your card details
                  </p>
                </div>
              )}

              {methodType === 'vipps' && (
                <div>
                  <label className={tw.label}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+47 123 45 678"
                    value={vippsPhoneNumber}
                    onChange={(e) => setVippsPhoneNumber(e.target.value)}
                    className={tw.input}
                    disabled={addingMethod}
                  />
                </div>
              )}

              {methodType === 'invoice' && (
                <p className="text-sm text-[var(--video-text-secondary)]">
                  Invoice payment method will be added. You'll receive invoices by email.
                </p>
              )}
            </div>

            <div className={tw.modalActions}>
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                disabled={addingMethod}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddMethod}
                disabled={addingMethod}
                loading={addingMethod}
              >
                {addingMethod ? 'Adding...' : 'Add Payment Method'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PaymentMethodsManager;
