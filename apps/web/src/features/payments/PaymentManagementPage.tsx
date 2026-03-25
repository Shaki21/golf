/**
 * Payment Management Page
 * Comprehensive payment, billing, and subscription management
 */

import React, { useState } from 'react';
import { CreditCard, FileText, RefreshCcw, Package } from 'lucide-react';
import {
  usePaymentMethods,
  useInvoices,
  useSubscriptions,
  useAddPaymentMethod,
  useDeletePaymentMethod,
  usePayInvoice,
  useCancelSubscription,
} from '../../hooks/usePayments';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../components/layout/PageHeader';
import { SubSectionTitle, SectionTitle } from '../../ui/components/typography';

type TabId = 'methods' | 'invoices' | 'subscriptions' | 'packages';

const PaymentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const playerId = user?.playerId || user?.id;
  const [activeTab, setActiveTab] = useState<TabId>('methods');

  const tabs = [
    { id: 'methods', label: 'Betalingsmåter', icon: <CreditCard size={16} /> },
    { id: 'invoices', label: 'Fakturaer', icon: <FileText size={16} /> },
    { id: 'subscriptions', label: 'Abonnementer', icon: <RefreshCcw size={16} /> },
    { id: 'packages', label: 'Time-pakker', icon: <Package size={16} /> },
  ];

  if (!playerId) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="p-8 text-center text-tier-error">Ingen bruker funnet. Vennligst logg inn.</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Betaling & Fakturering"
          subtitle="Administrer betalingsmåter, fakturaer og abonnementer"
          helpText=""
          actions={null}
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-tier-border-default">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-tier-info text-tier-info font-semibold'
                  : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'methods' && <PaymentMethodsTab playerId={playerId} />}
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'packages' && <SessionPackagesTab />}
      </div>
    </div>
  );
};

// ============================================================================
// PAYMENT METHODS TAB
// ============================================================================

interface PaymentMethodsTabProps {
  playerId: string;
}

const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({ playerId }) => {
  const { paymentMethods, loading, error, refetch } = usePaymentMethods();
  const { deletePaymentMethod, loading: deleting } = useDeletePaymentMethod();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = async (methodId: string) => {
    if (!window.confirm('Slett denne betalingsmåten?')) return;

    try {
      await deletePaymentMethod(methodId);
      refetch();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return <Card><div className="p-12 text-center text-tier-text-secondary">Laster betalingsmåter...</div></Card>;
  }

  if (error) {
    return <Card><div className="p-12 text-center text-tier-error">{error}</div></Card>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-tier-text-secondary">
          Du har {paymentMethods.length} registrerte betalingsmåter
        </p>
        <Button variant="primary" leftIcon={<CreditCard size={16} />} onClick={() => setShowAddModal(true)}>
          Legg til betalingsmåte
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <CreditCard size={64} className="mx-auto text-tier-text-tertiary mb-4" />
            <SubSectionTitle style={{ marginBottom: 0 }} className="text-xl font-bold text-tier-navy mb-2">Ingen betalingsmåter</SubSectionTitle>
            <p className="text-tier-text-secondary mb-6">Legg til en betalingsmåte for å komme i gang</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Legg til første betalingsmåte
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method: any) => (
            <Card key={method.id}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-tier-surface-secondary flex items-center justify-center">
                    <CreditCard size={24} className="text-tier-navy" />
                  </div>
                  <div>
                    <SubSectionTitle style={{ marginBottom: 0 }} className="font-semibold text-tier-navy">
                      {method.type === 'card' && `**** **** **** ${method.last4}`}
                      {method.type === 'vipps' && 'Vipps'}
                      {method.type === 'invoice' && 'Faktura'}
                    </SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">
                      {method.brand && `${method.brand} • `}
                      Utløper {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <span className="px-3 py-1 bg-tier-success-light text-tier-success rounded-full text-xs font-semibold">
                      Standard
                    </span>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(method.id)}
                  loading={deleting}
                >
                  Slett
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showAddModal && <AddPaymentMethodModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); refetch(); }} />}
    </>
  );
};

// ============================================================================
// INVOICES TAB
// ============================================================================

const InvoicesTab: React.FC = () => {
  const [status, setStatus] = useState('');
  const { invoices, total, loading, error, refetch } = useInvoices({ status: status || undefined });
  const { payInvoice, loading: paying } = usePayInvoice();

  const handlePay = async (invoiceId: string) => {
    // In real implementation, would show payment method selector
    const paymentMethodId = prompt('Enter payment method ID (demo):');
    if (!paymentMethodId) return;

    try {
      await payInvoice(invoiceId, paymentMethodId);
      refetch();
    } catch (err) {
      console.error('Failed to pay:', err);
    }
  };

  if (loading) {
    return <Card><div className="p-12 text-center text-tier-text-secondary">Laster fakturaer...</div></Card>;
  }

  if (error) {
    return <Card><div className="p-12 text-center text-tier-error">{error}</div></Card>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-tier-border-default rounded-lg"
        >
          <option value="">Alle fakturaer</option>
          <option value="draft">Utkast</option>
          <option value="pending">Ubetalt</option>
          <option value="paid">Betalt</option>
          <option value="overdue">Forfalt</option>
          <option value="cancelled">Kansellert</option>
        </select>
        <p className="text-tier-text-secondary">Totalt: {total} fakturaer</p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <FileText size={64} className="mx-auto text-tier-text-tertiary mb-4" />
            <SubSectionTitle style={{ marginBottom: 0 }} className="text-xl font-bold text-tier-navy mb-2">Ingen fakturaer</SubSectionTitle>
            <p className="text-tier-text-secondary">Du har ingen {status ? status.toLowerCase() : ''} fakturaer</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice: any) => (
            <Card key={invoice.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-1">
                      Faktura #{invoice.invoiceNumber}
                    </SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">
                      {new Date(invoice.issueDate).toLocaleDateString('no-NO')}
                      {invoice.dueDate && ` • Forfaller ${new Date(invoice.dueDate).toLocaleDateString('no-NO')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-tier-navy">{invoice.totalAmount} kr</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      invoice.status === 'paid' ? 'bg-tier-success-light text-tier-success' :
                      invoice.status === 'overdue' ? 'bg-tier-error-light text-tier-error' :
                      invoice.status === 'pending' ? 'bg-tier-warning-light text-tier-warning' :
                      'bg-tier-surface-secondary text-tier-text-secondary'
                    }`}>
                      {invoice.status === 'paid' ? 'Betalt' :
                       invoice.status === 'overdue' ? 'Forfalt' :
                       invoice.status === 'pending' ? 'Ubetalt' :
                       invoice.status === 'cancelled' ? 'Kansellert' : 'Utkast'}
                    </span>
                  </div>
                </div>

                {invoice.lineItems && invoice.lineItems.length > 0 && (
                  <div className="border-t border-tier-border-default pt-4 mb-4">
                    {invoice.lineItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm mb-2">
                        <span className="text-tier-text-secondary">
                          {item.description} {item.quantity > 1 && `x${item.quantity}`}
                        </span>
                        <span className="font-medium text-tier-navy">{item.amount} kr</span>
                      </div>
                    ))}
                  </div>
                )}

                {invoice.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePay(invoice.id)}
                    loading={paying}
                  >
                    Betal nå
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// ============================================================================
// SUBSCRIPTIONS TAB
// ============================================================================

const SubscriptionsTab: React.FC = () => {
  const [status, setStatus] = useState('active');
  const { subscriptions, loading, error, refetch } = useSubscriptions({ status: status || undefined });
  const { cancelSubscription, loading: cancelling } = useCancelSubscription();

  const handleCancel = async (subscriptionId: string) => {
    const reason = prompt('Årsak til oppsigelse (valgfritt):');
    if (reason === null) return; // User cancelled

    try {
      await cancelSubscription(subscriptionId, reason);
      refetch();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  if (loading) {
    return <Card><div className="p-12 text-center text-tier-text-secondary">Laster abonnementer...</div></Card>;
  }

  if (error) {
    return <Card><div className="p-12 text-center text-tier-error">{error}</div></Card>;
  }

  return (
    <>
      <div className="mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-tier-border-default rounded-lg"
        >
          <option value="">Alle abonnementer</option>
          <option value="active">Aktive</option>
          <option value="cancelled">Kansellerte</option>
          <option value="expired">Utløpte</option>
        </select>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <RefreshCcw size={64} className="mx-auto text-tier-text-tertiary mb-4" />
            <SubSectionTitle style={{ marginBottom: 0 }} className="text-xl font-bold text-tier-navy mb-2">Ingen abonnementer</SubSectionTitle>
            <p className="text-tier-text-secondary">Du har ingen {status ? status.toLowerCase() : ''} abonnementer</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub: any) => (
            <Card key={sub.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-1">{sub.planName}</SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">
                      Startet {new Date(sub.startDate).toLocaleDateString('no-NO')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-tier-navy">{sub.amount} kr</div>
                    <div className="text-sm text-tier-text-secondary">per {sub.interval === 'month' ? 'måned' : 'år'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.status === 'active' ? 'bg-tier-success-light text-tier-success' :
                    sub.status === 'cancelled' ? 'bg-tier-error-light text-tier-error' :
                    'bg-tier-surface-secondary text-tier-text-secondary'
                  }`}>
                    {sub.status === 'active' ? 'Aktivt' :
                     sub.status === 'cancelled' ? 'Kansellert' : 'Utløpt'}
                  </span>
                  {sub.currentPeriodEnd && (
                    <span className="text-sm text-tier-text-secondary">
                      Fornyes {new Date(sub.currentPeriodEnd).toLocaleDateString('no-NO')}
                    </span>
                  )}
                </div>

                {sub.status === 'active' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancel(sub.id)}
                    loading={cancelling}
                  >
                    Si opp abonnement
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// ============================================================================
// SESSION PACKAGES TAB
// ============================================================================

const SessionPackagesTab: React.FC = () => {
  return (
    <Card>
      <div className="p-12 text-center">
        <Package size={64} className="mx-auto text-tier-text-tertiary mb-4" />
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-xl font-bold text-tier-navy mb-2">Time-pakker</SubSectionTitle>
        <p className="text-tier-text-secondary mb-6">
          Kjøp pakker med treningstimer til redusert pris
        </p>
        <p className="text-sm text-tier-text-secondary">
          Denne funksjonen kommer snart
        </p>
      </div>
    </Card>
  );
};

// ============================================================================
// ADD PAYMENT METHOD MODAL
// ============================================================================

interface AddPaymentMethodModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onSuccess }) => {
  const { addPaymentMethod, loading } = useAddPaymentMethod();
  const [type, setType] = useState<'card' | 'vipps' | 'invoice'>('card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // In real implementation, would use Stripe Elements or Vipps SDK
      await addPaymentMethod({
        type,
        // Add actual payment details here
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to add payment method:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <SectionTitle style={{ marginBottom: 0 }} className="text-xl font-bold text-tier-navy mb-4">Legg til betalingsmåte</SectionTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tier-navy mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
            >
              <option value="card">Kort</option>
              <option value="vipps">Vipps</option>
              <option value="invoice">Faktura</option>
            </select>
          </div>

          <div className="bg-tier-info-light border border-tier-info rounded-lg p-4">
            <p className="text-sm text-tier-navy">
              <strong>Demo-modus:</strong> I produksjon ville dette integrere med Stripe Elements
              eller Vipps SDK for sikker betalingsinformasjon.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>
              Legg til
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Avbryt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentManagementPage;
