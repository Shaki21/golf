/**
 * TIER Golf - Stripe Checkout Component
 *
 * Production-ready Stripe payment flow for subscriptions
 *
 * Features:
 * - Stripe Elements integration
 * - Payment Element (card, Apple Pay, Google Pay)
 * - Setup Intent for subscription payments
 * - Error handling and validation
 * - Loading states
 * - Success/failure redirects
 * - 3D Secure (SCA) support
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Button, Text } from '../../ui/primitives';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || ''
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Plan configurations
const PLAN_CONFIG: Record<string, { name: string; role: 'player' | 'coach' }> = {
  premium: { name: 'Premium Player', role: 'player' },
  elite: { name: 'Elite Player', role: 'player' },
  base: { name: 'Base Coach', role: 'coach' },
  pro: { name: 'Pro Coach', role: 'coach' },
  team: { name: 'Team Coach', role: 'coach' },
};

interface CheckoutFormProps {
  clientSecret: string;
  planId: string;
  interval: 'monthly' | 'yearly';
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Checkout Form Component
 * Handles payment submission with Stripe Elements
 */
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  planId,
  interval,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  const planConfig = PLAN_CONFIG[planId];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js has not loaded yet
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || 'Payment submission failed');
        setLoading(false);
        return;
      }

      // Confirm the SetupIntent
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?plan=${planId}&interval=${interval}`,
        },
        redirect: 'if_required', // Only redirect if 3D Secure is required
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed');
        setLoading(false);
        return;
      }

      // If we get here, payment method was attached successfully
      if (setupIntent?.status === 'succeeded') {
        // Create subscription with the payment method
        await createSubscription(setupIntent.payment_method as string);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const createSubscription = async (paymentMethodId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/payments/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          planId,
          interval,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }

      const data = await response.json();

      // Subscription created successfully
      onSuccess();
    } catch (err: any) {
      console.error('Subscription creation error:', err);
      setError(err.message || 'Failed to create subscription');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="bg-tier-white border border-tier-border-default rounded-lg p-6">
        <Text variant="body" color="primary" className="font-semibold mb-4">
          Payment information
        </Text>
        <PaymentElement
          onReady={() => setPaymentElementReady(true)}
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-tier-error-light border border-tier-error rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-tier-error flex-shrink-0 mt-0.5" />
          <div>
            <Text variant="body" className="text-tier-error font-semibold mb-1">
              Payment failed
            </Text>
            <Text variant="footnote" className="text-tier-error">
              {error}
            </Text>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          <ArrowLeft size={18} className="mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!stripe || !paymentElementReady || loading}
          className="flex-1"
        >
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <Check size={18} className="mr-2" />
              Confirm subscription
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-tier-text-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <Text variant="caption1" color="secondary">
          Secure payment with Stripe
        </Text>
      </div>
    </form>
  );
};

/**
 * Main Stripe Checkout Component
 */
const StripeCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planId = searchParams.get('plan') || '';
  const interval = (searchParams.get('interval') || 'monthly') as 'monthly' | 'yearly';

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planConfig = PLAN_CONFIG[planId];

  useEffect(() => {
    // Validate plan
    if (!planId || !planConfig) {
      setError('Invalid plan selected');
      setLoading(false);
      return;
    }

    // Create Setup Intent
    createSetupIntent();
  }, [planId]);

  const createSetupIntent = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate('/login?redirect=/checkout');
        return;
      }

      const response = await fetch(`${API_URL}/payments/setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setLoading(false);
    } catch (err: any) {
      console.error('Setup Intent error:', err);
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate(`/checkout/success?plan=${planId}&interval=${interval}`);
  };

  const handleCancel = () => {
    navigate('/pricing');
  };

  // Stripe Elements options
  const elementsOptions: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret || undefined,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#10456A',
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
          colorDanger: '#df1b41',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          borderRadius: '8px',
        },
      },
    }),
    [clientSecret]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-tier-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy mb-4" />
          <Text variant="body" color="secondary">
            Preparing payment...
          </Text>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !planConfig) {
    return (
      <div className="min-h-screen bg-tier-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-tier-white rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-tier-error mx-auto mb-4" />
          <Text variant="title2" color="primary" className="mb-2">
            Something went wrong
          </Text>
          <Text variant="body" color="secondary" className="mb-6">
            {error || 'Invalid plan selected'}
          </Text>
          <Button variant="primary" onClick={() => navigate('/pricing')} fullWidth>
            Back to pricing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Text variant="title1" color="primary" className="mb-2">
            Complete subscription
          </Text>
          <Text variant="body" color="secondary">
            {planConfig.name} - {interval === 'monthly' ? 'Monthly' : 'Yearly'}
          </Text>
        </div>

        {/* Checkout Form */}
        <div className="bg-tier-white rounded-2xl shadow-lg p-8">
          {clientSecret && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CheckoutForm
                clientSecret={clientSecret}
                planId={planId}
                interval={interval}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </Elements>
          )}
        </div>

        {/* Trial Information */}
        <div className="mt-6 text-center">
          <Text variant="footnote" color="secondary">
            You start with a free 14-day trial period.
            <br />
            You can cancel anytime before the trial period ends.
          </Text>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-tier-text-secondary">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <Text variant="caption1" color="secondary">
              SSL Secured
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <Text variant="caption1" color="secondary">
              PCI Compliant
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Check size={20} />
            <Text variant="caption1" color="secondary">
              Powered by Stripe
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
