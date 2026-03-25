/**
 * Subscription Management Component
 *
 * Allows users to:
 * - View current subscription
 * - Upgrade/downgrade plans
 * - Cancel subscription
 * - Update payment method
 * - View billing history
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, TrendingUp, AlertCircle, Check, X } from 'lucide-react';
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
  stripeSubscriptionId: string;
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

const PLAN_NAMES: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
  elite: 'Elite',
  base: 'Coach Base',
  pro: 'Coach Pro',
  team: 'Coach Team',
};

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  premium: { monthly: 149, yearly: 1499 },
  elite: { monthly: 299, yearly: 2999 },
  base: { monthly: 199, yearly: 1999 },
  pro: { monthly: 499, yearly: 4999 },
  team: { monthly: 999, yearly: 9999 },
};

const SubscriptionManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscription();
    fetchPaymentMethods();
  }, []);

  const fetchSubscription = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/payments/subscriptions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setSubscription(data.data[0]); // Get first active subscription
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch(`${API_URL}/payments/methods`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      setPaymentMethods(data.data || []);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      return;
    }

    setCanceling(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }

      // Refresh subscription data
      await fetchSubscription();
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message);
    } finally {
      setCanceling(false);
    }
  };

  const handleChangePlan = () => {
    navigate('/pricing');
  };

  const handleUpdatePayment = () => {
    navigate('/settings/payment-methods');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-tier-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle size={48} className="text-tier-warning mx-auto mb-4" />
          <Text variant="title2" color="primary" className="mb-2">
            No Active Subscription
          </Text>
          <Text variant="body" color="secondary" className="mb-6">
            You don't have an active subscription. Choose a plan to get started.
          </Text>
          <Button variant="primary" onClick={() => navigate('/pricing')}>
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  const planName = PLAN_NAMES[subscription.planType] || subscription.planType;
  const isYearly = subscription.billingInterval === 'yearly';
  const prices = PLAN_PRICES[subscription.planType];
  const currentPrice = isYearly ? prices?.yearly : prices?.monthly;

  const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
  const defaultPaymentMethod = paymentMethods.find((pm) => pm.isDefault);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title="Abonnementshåndtering"
        subtitle="Administrer ditt abonnement og betalingsinformasjon"
        helpText="Administrer ditt TIER Golf abonnement. Se nåværende plan (Basic, Premium, Elite, Coach Base/Pro/Team) med pris (månedlig/årlig), status og neste fornyelsesdato. Oppgrader eller nedgrader abonnement, kanseller (avsluttes ved periodeslutt), bytt til månedlig/årlig fakturering, oppdater betalingsmetode (kort), se betalingshistorikk. Bruk for full kontroll over abonnement og faktureringsinformasjon."
      />

      {/* Error Message */}
      {error && (
        <div className="bg-tier-error-light border border-tier-error rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-tier-error flex-shrink-0 mt-0.5" />
          <div>
            <Text variant="body" className="text-tier-error font-semibold mb-1">
              Error
            </Text>
            <Text variant="footnote" className="text-tier-error">
              {error}
            </Text>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-tier-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Text variant="title2" color="primary" className="mb-2">
              Current Plan: {planName}
            </Text>
            <Text variant="body" color="secondary">
              {isYearly ? 'Annual' : 'Monthly'} billing
            </Text>
          </div>
          <div className="text-right">
            <Text variant="title2" color="primary" className="font-bold">
              {currentPrice} NOK
            </Text>
            <Text variant="footnote" color="secondary">
              per {isYearly ? 'year' : 'month'}
            </Text>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-6">
          {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
            <>
              <Check size={20} className="text-tier-success" />
              <Text variant="body" className="text-tier-success font-semibold">
                Active
              </Text>
            </>
          )}
          {subscription.cancelAtPeriodEnd && (
            <>
              <AlertCircle size={20} className="text-tier-warning" />
              <Text variant="body" className="text-tier-warning font-semibold">
                Cancels on {currentPeriodEnd.toLocaleDateString()}
              </Text>
            </>
          )}
        </div>

        {/* Renewal Date */}
        <div className="bg-tier-background rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-tier-text-secondary" />
            <div>
              <Text variant="footnote" color="secondary" className="mb-1">
                {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
              </Text>
              <Text variant="body" color="primary" className="font-semibold">
                {currentPeriodEnd.toLocaleDateString()}
              </Text>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        {defaultPaymentMethod && (
          <div className="bg-tier-background rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-tier-text-secondary" />
              <div>
                <Text variant="footnote" color="secondary" className="mb-1">
                  Payment method
                </Text>
                <Text variant="body" color="primary" className="font-semibold">
                  {defaultPaymentMethod.brand} ending in {defaultPaymentMethod.last4}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleChangePlan}
            className="flex-1"
            disabled={subscription.cancelAtPeriodEnd}
          >
            <TrendingUp size={18} className="mr-2" />
            Change Plan
          </Button>
          <Button
            variant="secondary"
            onClick={handleUpdatePayment}
            className="flex-1"
          >
            <CreditCard size={18} className="mr-2" />
            Update Payment
          </Button>
          {!subscription.cancelAtPeriodEnd && (
            <Button
              variant="danger"
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="flex-1"
            >
              <X size={18} className="mr-2" />
              {canceling ? 'Canceling...' : 'Cancel Plan'}
            </Button>
          )}
        </div>
      </div>

      {/* Cancellation Notice */}
      {subscription.cancelAtPeriodEnd && (
        <div className="bg-tier-warning-light border border-tier-warning rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-tier-warning flex-shrink-0" />
            <div>
              <Text variant="body" className="text-tier-warning font-semibold mb-2">
                Your subscription will be cancelled
              </Text>
              <Text variant="body" className="text-tier-warning">
                You'll continue to have access to all features until {currentPeriodEnd.toLocaleDateString()}.
                After that, your account will be downgraded to the free tier.
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
