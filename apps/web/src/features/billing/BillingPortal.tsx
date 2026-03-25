/**
 * Billing Portal - Complete billing management interface
 *
 * Features:
 * - Current subscription overview
 * - Payment methods management
 * - Invoice history
 * - Billing analytics
 * - Quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  Download,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button, Text } from '../../ui/primitives';
import { PageHeader } from '../../ui/raw-blocks';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

interface Subscription {
  id: string;
  planType: string;
  billingInterval: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

const BillingPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'invoices'>('overview');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubscription(),
      fetchPaymentMethods(),
      fetchInvoices(),
    ]);
    setLoading(false);
  };

  const fetchSubscription = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/subscriptions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setSubscription(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/methods`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      setPaymentMethods(data.data || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/invoices`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      setInvoices(data.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      await fetch(`${API_URL}/payments/methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader
        title="Fakturering og betaling"
        subtitle="Administrer abonnement, betalingsmetoder og fakturahistorikk"
        helpText="Komplett fakturaadministrasjon. Faner for Overview (nåværende abonnement, neste faktura, totalt brukt), Payment Methods (kort, legge til/slette, sett som standard), Invoices (historikk med status paid/pending/failed, last ned PDF). Raskt oppsummering av abonnementsdetaljer, betalingsstatistikk. Bruk for full kontroll over fakturering og betalingsinformasjon."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-tier-border-default">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'payment'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Invoices
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          {subscription && (
            <div className="bg-tier-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Text variant="title2" color="primary" className="mb-2">
                    Current Plan
                  </Text>
                  <Text variant="body" color="secondary">
                    {subscription.planType.toUpperCase()} -{' '}
                    {subscription.billingInterval === 'yearly' ? 'Annual' : 'Monthly'}
                  </Text>
                </div>
                <div className={`px-4 py-2 rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-tier-success-light text-tier-success'
                    : 'bg-tier-warning-light text-tier-warning'
                }`}>
                  <Text variant="footnote" className="font-semibold">
                    {subscription.status.toUpperCase()}
                  </Text>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-tier-background rounded-lg p-4">
                  <Calendar size={20} className="text-tier-text-secondary mb-2" />
                  <Text variant="footnote" color="secondary" className="mb-1">
                    Renews on
                  </Text>
                  <Text variant="body" color="primary" className="font-semibold">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </Text>
                </div>

                <div className="bg-tier-background rounded-lg p-4">
                  <CreditCard size={20} className="text-tier-text-secondary mb-2" />
                  <Text variant="footnote" color="secondary" className="mb-1">
                    Payment methods
                  </Text>
                  <Text variant="body" color="primary" className="font-semibold">
                    {paymentMethods.length} saved
                  </Text>
                </div>

                <div className="bg-tier-background rounded-lg p-4">
                  <FileText size={20} className="text-tier-text-secondary mb-2" />
                  <Text variant="footnote" color="secondary" className="mb-1">
                    Invoices
                  </Text>
                  <Text variant="body" color="primary" className="font-semibold">
                    {invoices.length} total
                  </Text>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => navigate('/pricing')}
                  className="flex-1"
                >
                  <TrendingUp size={18} className="mr-2" />
                  Change Plan
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/subscription')}
                  className="flex-1"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <Text variant="title3" color="primary" className="mb-4">
                Recent Invoices
              </Text>
              {invoices.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-tier-background rounded-lg"
                    >
                      <div>
                        <Text variant="body" color="primary" className="font-semibold">
                          {invoice.invoiceNumber}
                        </Text>
                        <Text variant="footnote" color="secondary">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text variant="body" color="primary" className="font-semibold">
                          {invoice.amount} {invoice.currency.toUpperCase()}
                        </Text>
                        <Text
                          variant="footnote"
                          className={
                            invoice.status === 'paid'
                              ? 'text-tier-success'
                              : 'text-tier-warning'
                          }
                        >
                          {invoice.status.toUpperCase()}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text variant="body" color="secondary">
                  No invoices yet
                </Text>
              )}
              <Button
                variant="ghost"
                onClick={() => setActiveTab('invoices')}
                className="w-full mt-4"
              >
                View All Invoices
              </Button>
            </div>

            {/* Payment Methods */}
            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <Text variant="title3" color="primary" className="mb-4">
                Payment Methods
              </Text>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.slice(0, 2).map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 bg-tier-background rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-tier-text-secondary" />
                        <div>
                          <Text variant="body" color="primary" className="font-semibold">
                            {method.brand} •••• {method.last4}
                          </Text>
                          <Text variant="footnote" color="secondary">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </Text>
                        </div>
                      </div>
                      {method.isDefault && (
                        <div className="px-3 py-1 bg-tier-navy text-white text-xs rounded-full">
                          Default
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text variant="body" color="secondary">
                  No payment methods saved
                </Text>
              )}
              <Button
                variant="ghost"
                onClick={() => setActiveTab('payment')}
                className="w-full mt-4"
              >
                Manage Payment Methods
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Text variant="title2" color="primary">
              Payment Methods
            </Text>
            <Button variant="primary" onClick={() => navigate('/checkout')}>
              <Plus size={18} className="mr-2" />
              Add Payment Method
            </Button>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-tier-white rounded-xl shadow-lg p-6 relative"
                >
                  {method.isDefault && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-tier-navy text-white text-xs rounded-full">
                      Default
                    </div>
                  )}
                  <CreditCard size={32} className="text-tier-navy mb-4" />
                  <Text variant="title3" color="primary" className="mb-2">
                    {method.brand}
                  </Text>
                  <Text variant="body" color="secondary" className="mb-4">
                    •••• •••• •••• {method.last4}
                  </Text>
                  <div className="flex justify-between items-center">
                    <Text variant="footnote" color="secondary">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                    {!method.isDefault && (
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-tier-error hover:text-tier-error-dark"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-tier-white rounded-2xl shadow-lg p-12 text-center">
              <CreditCard size={48} className="text-tier-text-secondary mx-auto mb-4" />
              <Text variant="title3" color="primary" className="mb-2">
                No payment methods
              </Text>
              <Text variant="body" color="secondary" className="mb-6">
                Add a payment method to manage your subscription
              </Text>
              <Button variant="primary" onClick={() => navigate('/checkout')}>
                <Plus size={18} className="mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Text variant="title2" color="primary">
              Invoice History
            </Text>
          </div>

          {invoices.length > 0 ? (
            <div className="bg-tier-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-tier-background">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Invoice Number
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Date
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Amount
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Status
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Actions
                      </Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr
                      key={invoice.id}
                      className={index !== invoices.length - 1 ? 'border-b border-tier-border-default' : ''}
                    >
                      <td className="px-6 py-4">
                        <Text variant="body" color="primary" className="font-semibold">
                          {invoice.invoiceNumber}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body" color="secondary">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body" color="primary" className="font-semibold">
                          {invoice.amount} {invoice.currency.toUpperCase()}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-block px-3 py-1 rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-tier-success-light text-tier-success'
                              : invoice.status === 'pending'
                              ? 'bg-tier-warning-light text-tier-warning'
                              : 'bg-tier-error-light text-tier-error'
                          }`}
                        >
                          <Text variant="footnote" className="font-semibold">
                            {invoice.status.toUpperCase()}
                          </Text>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-tier-navy hover:text-tier-navy-dark">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-tier-white rounded-2xl shadow-lg p-12 text-center">
              <FileText size={48} className="text-tier-text-secondary mx-auto mb-4" />
              <Text variant="title3" color="primary" className="mb-2">
                No invoices yet
              </Text>
              <Text variant="body" color="secondary">
                Your billing history will appear here
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingPortal;
