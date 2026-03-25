/**
 * SubscriptionDashboard
 * Manage subscription plans
 *
 * Features:
 * - View current subscription
 * - Upgrade/downgrade plans
 * - Cancel subscription
 * - View billing history
 * - Manage auto-renewal
 */

import React, { useState, useCallback } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../ui/components/typography';
import { track } from '../../analytics/track';
import { PageHeader } from '../../ui/raw-blocks';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  currentPlanCard: 'p-6 bg-surface rounded-xl border-2 border-primary',
  planCard: 'p-6 bg-surface rounded-xl border border-border hover:border-primary transition-all cursor-pointer',
  planHeader: 'flex items-center justify-between mb-4',
  planName: 'text-xl font-bold text-[var(--text-inverse)]',
  planPrice: 'text-2xl font-bold text-primary',
  pricePeriod: 'text-sm text-[var(--video-text-secondary)] ml-1',
  planFeatures: 'flex flex-col gap-2 mb-4',
  feature: 'flex items-center gap-2 text-sm text-[var(--text-inverse)]',
  featureIcon: 'text-tier-success',
  currentBadge: 'py-1 px-3 bg-primary/20 border border-primary rounded-lg text-primary text-xs font-semibold',
  planActions: 'flex gap-2',
  upgradeButton: 'py-2 px-4 bg-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity',
  cancelButton: 'py-2 px-4 bg-tier-error/10 border border-tier-error rounded-lg text-tier-error text-sm font-medium cursor-pointer hover:bg-tier-error/20 transition-colors',
  section: 'flex flex-col gap-4',
  sectionTitle: 'text-lg font-semibold text-[var(--text-inverse)] m-0',
  infoRow: 'flex justify-between items-center py-3 border-b border-border last:border-0',
  infoLabel: 'text-sm text-[var(--video-text-secondary)]',
  infoValue: 'text-sm font-semibold text-[var(--text-inverse)]',
  plansGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  warningBox: 'p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg',
  warningText: 'text-sm text-[var(--text-inverse)]',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
};

// ═══════════════════════════════════════════
// PLAN DEFINITIONS
// ═══════════════════════════════════════════

const PLANS = {
  basic: {
    name: 'Basic',
    price: { monthly: 299, annual: 2990 },
    features: [
      'Up to 10 training sessions/month',
      'Basic video analysis',
      'Progress tracking',
      'Email support',
    ],
  },
  premium: {
    name: 'Premium',
    price: { monthly: 599, annual: 5990 },
    features: [
      'Unlimited training sessions',
      'Advanced video analysis',
      'Progress tracking',
      'Tournament preparation',
      'Priority support',
      'Custom training plans',
    ],
  },
  elite: {
    name: 'Elite',
    price: { monthly: 999, annual: 9990 },
    features: [
      'Everything in Premium',
      'Personal coach access',
      'TrackMan integration',
      'Strokes Gained analytics',
      'Weekly progress reports',
      '24/7 priority support',
    ],
  },
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function SubscriptionDashboard({ className = '' }) {
  const {
    subscription,
    loading,
    error,
    createSubscription,
    cancelSubscription,
    refresh,
  } = useSubscriptions();

  const [changingPlan, setChangingPlan] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get plan price based on interval
  const getPlanPrice = (planTier, interval) => {
    return PLANS[planTier]?.price[interval] || 0;
  };

  // Handle plan change
  const handleChangePlan = useCallback(async (newTier) => {
    if (!subscription) {
      // Create new subscription
      if (!window.confirm(`Subscribe to ${PLANS[newTier].name} plan?`)) {
        return;
      }

      setChangingPlan(true);

      try {
        await createSubscription({
          tier: newTier,
          interval: 'monthly',
        });

        track('subscription_created', {
          screen: 'SubscriptionDashboard',
          tier: newTier,
          interval: 'monthly',
        });

        alert('Subscription activated!');
      } catch (err) {
        console.error('Failed to create subscription:', err);
        alert(err.response?.data?.message || 'Failed to create subscription');
      } finally {
        setChangingPlan(false);
      }
    } else {
      // Change existing subscription
      if (!window.confirm(`Change to ${PLANS[newTier].name} plan?`)) {
        return;
      }

      setChangingPlan(true);

      try {
        await createSubscription({
          tier: newTier,
          interval: subscription.interval,
        });

        track('subscription_changed', {
          screen: 'SubscriptionDashboard',
          oldTier: subscription.tier,
          newTier,
        });

        alert('Subscription updated!');
      } catch (err) {
        console.error('Failed to change subscription:', err);
        alert(err.response?.data?.message || 'Failed to change subscription');
      } finally {
        setChangingPlan(false);
      }
    }
  }, [subscription, createSubscription]);

  // Handle cancel subscription
  const handleCancelSubscription = useCallback(async () => {
    if (!subscription || !window.confirm('Are you sure you want to cancel your subscription? This cannot be undone.')) {
      return;
    }

    try {
      await cancelSubscription(subscription.id);

      track('subscription_cancelled', {
        screen: 'SubscriptionDashboard',
        tier: subscription.tier,
      });

      alert('Subscription cancelled. You will have access until the end of your billing period.');
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    }
  }, [subscription, cancelSubscription]);

  // Loading state
  if (loading) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Loading subscription..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Failed to load subscription"
          description={error}
          action={<Button variant="primary" onClick={refresh}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className}`}>
      <PageHeader
        title="Abonnement"
        subtitle="Administrer ditt abonnement og faktureringsinformasjon"
        helpText="Oversikt over ditt nåværende abonnement (Basic, Premium eller Elite) med priser, funksjoner og fornyelsesdato. Endre plan, se tilgjengelige oppgraderinger eller kanseller abonnement. Sammenlign alle abonnementsplaner og se besparelser ved årlig betaling."
      />

      {/* Current Subscription */}
      {subscription ? (
        <div className={tw.section}>
          <SectionTitle style={{ marginBottom: 0 }} className={tw.sectionTitle}>Current Subscription</SectionTitle>

          <div className={tw.currentPlanCard}>
            <div className={tw.planHeader}>
              <div>
                <div className={tw.planName}>{PLANS[subscription.tier]?.name} Plan</div>
                <div className={tw.planPrice}>
                  {formatCurrency(getPlanPrice(subscription.tier, subscription.interval))}
                  <span className={tw.pricePeriod}>
                    / {subscription.interval === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>
              <div className={tw.currentBadge}>Current Plan</div>
            </div>

            <div className={tw.planFeatures}>
              {PLANS[subscription.tier]?.features.map((feature, index) => (
                <div key={index} className={tw.feature}>
                  <span className={tw.featureIcon}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className={tw.infoRow}>
                <span className={tw.infoLabel}>Status</span>
                <span className={tw.infoValue}>
                  {subscription.status === 'active' ? '✓ Active' : subscription.status}
                </span>
              </div>
              <div className={tw.infoRow}>
                <span className={tw.infoLabel}>Next Billing Date</span>
                <span className={tw.infoValue}>
                  {new Date(subscription.renewalDate).toLocaleDateString('nb-NO')}
                </span>
              </div>
              {subscription.cancelledAt && (
                <div className={tw.warningBox}>
                  <div className={tw.warningText}>
                    Subscription cancelled. Access until {new Date(subscription.renewalDate).toLocaleDateString('nb-NO')}
                  </div>
                </div>
              )}
            </div>

            {!subscription.cancelledAt && (
              <div className={tw.planActions}>
                <button
                  onClick={handleCancelSubscription}
                  className={tw.cancelButton}
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>📋</div>
          <SubSectionTitle style={{ marginBottom: 0 }} className={tw.emptyTitle}>No Active Subscription</SubSectionTitle>
          <p className={tw.emptyDescription}>
            Choose a plan below to get started with your golf training
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div className={tw.section}>
        <SectionTitle style={{ marginBottom: 0 }} className={tw.sectionTitle}>
          {subscription ? 'Change Plan' : 'Choose a Plan'}
        </SectionTitle>

        <div className={tw.plansGrid}>
          {Object.entries(PLANS).map(([tier, plan]) => {
            const isCurrent = subscription?.tier === tier;

            return (
              <div
                key={tier}
                className={isCurrent ? tw.currentPlanCard : tw.planCard}
                onClick={() => !isCurrent && handleChangePlan(tier)}
              >
                <div className={tw.planHeader}>
                  <div className={tw.planName}>{plan.name}</div>
                  {isCurrent && <div className={tw.currentBadge}>Current</div>}
                </div>

                <div className={tw.planPrice}>
                  {formatCurrency(plan.price.monthly)}
                  <span className={tw.pricePeriod}>/ month</span>
                </div>

                <div className="text-xs text-[var(--video-text-secondary)] mb-4">
                  or {formatCurrency(plan.price.annual)}/year (save {Math.round((1 - (plan.price.annual / (plan.price.monthly * 12))) * 100)}%)
                </div>

                <div className={tw.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <div key={index} className={tw.feature}>
                      <span className={tw.featureIcon}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {!isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangePlan(tier);
                    }}
                    disabled={changingPlan}
                    className={tw.upgradeButton}
                  >
                    {changingPlan ? 'Processing...' : subscription ? 'Switch Plan' : 'Subscribe'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionDashboard;
