/**
 * Admin Payment Dashboard
 *
 * Comprehensive admin interface for payment and subscription management
 *
 * Features:
 * - Revenue analytics and trends
 * - Subscription metrics (MRR, ARR, churn)
 * - Customer overview and lifetime value
 * - Payment method statistics
 * - Recent transactions monitoring
 * - Webhook event tracking
 * - Failed payment tracking
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Zap,
  Eye,
} from 'lucide-react';
import { Button, Text } from '../../ui/primitives';
import { PageHeader } from '../../ui/raw-blocks';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

interface DashboardStats {
  revenue: {
    mrr: number;
    arr: number;
    totalRevenue: number;
    revenueGrowth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    canceled: number;
    churnRate: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    averageLifetimeValue: number;
  };
  paymentMethods: {
    total: number;
    byType: Record<string, number>;
  };
}

interface RecentTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  planType: string;
  createdAt: string;
}

interface WebhookEvent {
  id: string;
  eventType: string;
  processed: boolean;
  error?: string;
  createdAt: string;
}

interface FailedPayment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  failureReason: string;
  attemptedAt: string;
}

const AdminPaymentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [failedPayments, setFailedPayments] = useState<FailedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'webhooks' | 'failures'>('overview');

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const headers = { Authorization: `Bearer ${accessToken}` };

      const [statsRes, transactionsRes, webhooksRes, failuresRes] = await Promise.all([
        fetch(`${API_URL}/admin/payment-stats`, { headers }),
        fetch(`${API_URL}/admin/recent-transactions?limit=10`, { headers }),
        fetch(`${API_URL}/admin/webhook-events?limit=20`, { headers }),
        fetch(`${API_URL}/admin/failed-payments?limit=10`, { headers }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data);
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setRecentTransactions(data.data || []);
      }

      if (webhooksRes.ok) {
        const data = await webhooksRes.json();
        setWebhookEvents(data.data || []);
      }

      if (failuresRes.ok) {
        const data = await failuresRes.json();
        setFailedPayments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'NOK') => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title="Payment Dashboard"
        subtitle="Real-time analytics and monitoring for subscriptions and payments"
        helpText="Administrator-dashboard for betalinger og abonnementer. Overvåk MRR/ARR, omsetning, vekst og churn-rate. Se total kunder, nylig registrerte, lifetime value, aktive/trialing/kansellerte abonnementer. Spor nylige transaksjoner, webhook-hendelser og mislykkede betalinger. Tabs for Overview (oversikt), Transactions (alle transaksjoner), Webhooks (event log) og Failed Payments (feilet betalinger). Auto-oppdatering hvert 30. sekund."
        actions={null}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-tier-border-default">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeView === 'overview'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeView === 'transactions'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveView('webhooks')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
            activeView === 'webhooks'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Webhooks
        </button>
        <button
          onClick={() => setActiveView('failures')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors relative ${
            activeView === 'failures'
              ? 'border-tier-navy text-tier-navy'
              : 'border-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
        >
          Failed Payments
          {failedPayments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-tier-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {failedPayments.length}
            </span>
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && stats && (
        <div className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-tier-navy-light rounded-lg">
                  <DollarSign size={24} className="text-tier-navy" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  stats.revenue.revenueGrowth >= 0
                    ? 'bg-tier-success-light text-tier-success'
                    : 'bg-tier-error-light text-tier-error'
                }`}>
                  {stats.revenue.revenueGrowth >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <Text variant="footnote" className="font-semibold">
                    {formatPercentage(stats.revenue.revenueGrowth)}
                  </Text>
                </div>
              </div>
              <Text variant="footnote" color="secondary" className="mb-2">
                Monthly Recurring Revenue
              </Text>
              <Text variant="title1" color="primary" className="font-bold">
                {formatCurrency(stats.revenue.mrr)}
              </Text>
              <Text variant="footnote" color="secondary" className="mt-2">
                ARR: {formatCurrency(stats.revenue.arr)}
              </Text>
            </div>

            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-tier-success-light rounded-lg">
                  <Users size={24} className="text-tier-success" />
                </div>
                <div className="px-3 py-1 bg-tier-background rounded-full">
                  <Text variant="footnote" color="secondary" className="font-semibold">
                    +{stats.customers.newThisMonth} this month
                  </Text>
                </div>
              </div>
              <Text variant="footnote" color="secondary" className="mb-2">
                Total Customers
              </Text>
              <Text variant="title1" color="primary" className="font-bold">
                {stats.customers.total}
              </Text>
              <Text variant="footnote" color="secondary" className="mt-2">
                Avg LTV: {formatCurrency(stats.customers.averageLifetimeValue)}
              </Text>
            </div>

            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-tier-warning-light rounded-lg">
                  <Activity size={24} className="text-tier-warning" />
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  stats.subscriptions.churnRate < 5
                    ? 'bg-tier-success-light text-tier-success'
                    : 'bg-tier-error-light text-tier-error'
                }`}>
                  <Text variant="footnote" className="font-semibold">
                    {stats.subscriptions.churnRate.toFixed(2)}% churn
                  </Text>
                </div>
              </div>
              <Text variant="footnote" color="secondary" className="mb-2">
                Active Subscriptions
              </Text>
              <Text variant="title1" color="primary" className="font-bold">
                {stats.subscriptions.active}
              </Text>
              <Text variant="footnote" color="secondary" className="mt-2">
                {stats.subscriptions.trialing} trialing, {stats.subscriptions.canceled} canceled
              </Text>
            </div>
          </div>

          {/* Subscription Breakdown */}
          <div className="bg-tier-white rounded-2xl shadow-lg p-6">
            <Text variant="title2" color="primary" className="mb-6">
              Subscription Overview
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-tier-background rounded-lg">
                <Text variant="title2" color="primary" className="font-bold mb-1">
                  {stats.subscriptions.total}
                </Text>
                <Text variant="footnote" color="secondary">
                  Total
                </Text>
              </div>
              <div className="text-center p-4 bg-tier-success-light rounded-lg">
                <Text variant="title2" className="font-bold mb-1 text-tier-success">
                  {stats.subscriptions.active}
                </Text>
                <Text variant="footnote" className="text-tier-success">
                  Active
                </Text>
              </div>
              <div className="text-center p-4 bg-tier-warning-light rounded-lg">
                <Text variant="title2" className="font-bold mb-1 text-tier-warning">
                  {stats.subscriptions.trialing}
                </Text>
                <Text variant="footnote" className="text-tier-warning">
                  Trialing
                </Text>
              </div>
              <div className="text-center p-4 bg-tier-error-light rounded-lg">
                <Text variant="title2" className="font-bold mb-1 text-tier-error">
                  {stats.subscriptions.canceled}
                </Text>
                <Text variant="footnote" className="text-tier-error">
                  Canceled
                </Text>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Transactions Preview */}
            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="title3" color="primary">
                  Recent Transactions
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('transactions')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-tier-background rounded-lg"
                  >
                    <div className="flex-1">
                      <Text variant="body" color="primary" className="font-semibold">
                        {transaction.customerName}
                      </Text>
                      <Text variant="footnote" color="secondary">
                        {transaction.planType} • {new Date(transaction.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text variant="body" color="primary" className="font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Text>
                      <div className={`inline-block px-2 py-0.5 rounded text-xs ${
                        transaction.status === 'succeeded'
                          ? 'bg-tier-success-light text-tier-success'
                          : transaction.status === 'pending'
                          ? 'bg-tier-warning-light text-tier-warning'
                          : 'bg-tier-error-light text-tier-error'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Events Preview */}
            <div className="bg-tier-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="title3" color="primary">
                  Webhook Events
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('webhooks')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {webhookEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-tier-background rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {event.processed && !event.error ? (
                        <CheckCircle size={20} className="text-tier-success flex-shrink-0" />
                      ) : event.error ? (
                        <XCircle size={20} className="text-tier-error flex-shrink-0" />
                      ) : (
                        <Activity size={20} className="text-tier-warning flex-shrink-0" />
                      )}
                      <div>
                        <Text variant="body" color="primary" className="font-semibold">
                          {event.eventType}
                        </Text>
                        <Text variant="footnote" color="secondary">
                          {new Date(event.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeView === 'transactions' && (
        <div className="bg-tier-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-tier-border-default">
            <Text variant="title2" color="primary">
              All Transactions
            </Text>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tier-background">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Customer
                    </Text>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Plan
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
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Date
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={index !== recentTransactions.length - 1 ? 'border-b border-tier-border-default' : ''}
                  >
                    <td className="px-6 py-4">
                      <Text variant="body" color="primary" className="font-semibold">
                        {transaction.customerName}
                      </Text>
                      <Text variant="footnote" color="secondary">
                        {transaction.customerEmail}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      <Text variant="body" color="primary">
                        {transaction.planType}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      <Text variant="body" color="primary" className="font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-block px-3 py-1 rounded-full ${
                        transaction.status === 'succeeded'
                          ? 'bg-tier-success-light text-tier-success'
                          : transaction.status === 'pending'
                          ? 'bg-tier-warning-light text-tier-warning'
                          : 'bg-tier-error-light text-tier-error'
                      }`}>
                        <Text variant="footnote" className="font-semibold">
                          {transaction.status.toUpperCase()}
                        </Text>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Text variant="body" color="secondary">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeView === 'webhooks' && (
        <div className="bg-tier-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-tier-border-default">
            <Text variant="title2" color="primary">
              Webhook Event Log
            </Text>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tier-background">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Status
                    </Text>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Event Type
                    </Text>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Timestamp
                    </Text>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Text variant="footnote" color="secondary" className="font-semibold">
                      Error
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {webhookEvents.map((event, index) => (
                  <tr
                    key={event.id}
                    className={index !== webhookEvents.length - 1 ? 'border-b border-tier-border-default' : ''}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {event.processed && !event.error ? (
                          <CheckCircle size={20} className="text-tier-success" />
                        ) : event.error ? (
                          <XCircle size={20} className="text-tier-error" />
                        ) : (
                          <Activity size={20} className="text-tier-warning" />
                        )}
                        <Text variant="footnote" color="secondary">
                          {event.processed && !event.error
                            ? 'Processed'
                            : event.error
                            ? 'Failed'
                            : 'Pending'}
                        </Text>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Text variant="body" color="primary" className="font-mono text-sm">
                        {event.eventType}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      <Text variant="body" color="secondary">
                        {new Date(event.createdAt).toLocaleString()}
                      </Text>
                    </td>
                    <td className="px-6 py-4">
                      {event.error ? (
                        <Text variant="footnote" className="text-tier-error">
                          {event.error}
                        </Text>
                      ) : (
                        <Text variant="footnote" color="secondary">
                          -
                        </Text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed Payments Tab */}
      {activeView === 'failures' && (
        <div className="bg-tier-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-tier-border-default">
            <div className="flex items-center justify-between">
              <Text variant="title2" color="primary">
                Failed Payments
              </Text>
              {failedPayments.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-tier-error-light rounded-lg">
                  <AlertCircle size={20} className="text-tier-error" />
                  <Text variant="body" className="text-tier-error font-semibold">
                    {failedPayments.length} Failed Payment{failedPayments.length !== 1 ? 's' : ''}
                  </Text>
                </div>
              )}
            </div>
          </div>
          {failedPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-tier-background">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Customer
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Amount
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Reason
                      </Text>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Text variant="footnote" color="secondary" className="font-semibold">
                        Attempted At
                      </Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {failedPayments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className={index !== failedPayments.length - 1 ? 'border-b border-tier-border-default' : ''}
                    >
                      <td className="px-6 py-4">
                        <Text variant="body" color="primary" className="font-semibold">
                          {payment.customerName}
                        </Text>
                        <Text variant="footnote" color="secondary">
                          {payment.customerEmail}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body" color="primary" className="font-semibold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body" className="text-tier-error">
                          {payment.failureReason}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="body" color="secondary">
                          {new Date(payment.attemptedAt).toLocaleString()}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="text-tier-success mx-auto mb-4" />
              <Text variant="title3" color="primary" className="mb-2">
                No Failed Payments
              </Text>
              <Text variant="body" color="secondary">
                All payment attempts have been successful
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPaymentDashboard;
