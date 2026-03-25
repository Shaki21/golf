/**
 * TIER Golf - Pricing Page
 *
 * Subscription pricing for players and coaches with Stripe checkout integration
 *
 * Features:
 * - Player tiers (Premium, Elite)
 * - Coach tiers (Base, Pro, Team)
 * - Monthly/Yearly billing toggle
 * - Stripe Checkout integration
 * - Apple Pay / Google Pay support
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Users } from 'lucide-react';
import { Button, Text } from '../../ui/primitives';

type BillingInterval = 'monthly' | 'yearly';
type UserRole = 'player' | 'coach';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  icon?: React.ReactNode;
}

const PLAYER_TIERS: PricingTier[] = [
  {
    id: 'premium',
    name: 'Premium',
    description: 'For junior golfers ready to level up',
    monthlyPrice: 149,
    yearlyPrice: 1499,
    features: [
      'Unlimited IUP tracking',
      'Basic training plans',
      'Progress analytics',
      'Coach feedback',
      'Mobile app access',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'For competitive players',
    monthlyPrice: 299,
    yearlyPrice: 2999,
    highlighted: true,
    icon: <Zap size={20} />,
    features: [
      'Everything in Premium',
      'Advanced training ROI predictor',
      'Peer + Pro benchmarking',
      'Video analysis with AI',
      'Goal progression forecasts',
      'Priority coach support',
    ],
  },
];

const COACH_TIERS: PricingTier[] = [
  {
    id: 'base',
    name: 'Base',
    description: 'For individual coaches',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    features: [
      'Up to 10 active players',
      'IUP management',
      'Training plan templates',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For academy coaches',
    monthlyPrice: 499,
    yearlyPrice: 4999,
    highlighted: true,
    icon: <Check size={20} />,
    features: [
      'Everything in Base',
      'Up to 30 active players',
      'Advanced analytics',
      'Team performance tracking',
      'Video analysis tools',
      'Priority support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For golf academies',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    icon: <Users size={20} />,
    features: [
      'Everything in Pro',
      'Unlimited players',
      'Multi-coach collaboration',
      'Performance alerts',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
];

const PricingCard: React.FC<{
  tier: PricingTier;
  billingInterval: BillingInterval;
  onSelect: () => void;
}> = ({ tier, billingInterval, onSelect }) => {
  const price = billingInterval === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
  const monthlySavings =
    billingInterval === 'yearly'
      ? Math.round(((tier.monthlyPrice * 12 - tier.yearlyPrice) / (tier.monthlyPrice * 12)) * 100)
      : 0;

  return (
    <div
      className={`relative rounded-2xl p-8 ${
        tier.highlighted
          ? 'bg-tier-navy text-tier-white border-2 border-tier-navy shadow-xl scale-105'
          : 'bg-tier-white border-2 border-tier-border-default'
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-tier-accent px-4 py-1 rounded-full text-xs font-semibold text-tier-navy">
          BEST VALUE
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        {tier.icon && (
          <div
            className={`p-2 rounded-lg ${
              tier.highlighted
                ? 'bg-tier-white/10'
                : 'bg-tier-navy/5'
            }`}
          >
            {tier.icon}
          </div>
        )}
        <Text
          variant="title3"
          color={tier.highlighted ? 'inverse' : 'primary'}
          className="font-bold"
        >
          {tier.name}
        </Text>
      </div>

      <Text
        variant="footnote"
        color={tier.highlighted ? 'inverse' : 'secondary'}
        className="mb-6"
      >
        {tier.description}
      </Text>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-bold ${
              tier.highlighted ? 'text-tier-white' : 'text-tier-navy'
            }`}
          >
            {price}
          </span>
          <span
            className={`text-sm ${
              tier.highlighted ? 'text-tier-white/70' : 'text-tier-text-secondary'
            }`}
          >
            NOK
          </span>
        </div>
        <Text
          variant="footnote"
          color={tier.highlighted ? 'inverse' : 'secondary'}
        >
          per {billingInterval === 'monthly' ? 'måned' : 'år'}
        </Text>
        {monthlySavings > 0 && (
          <Text
            variant="caption1"
            className="mt-1 text-tier-success font-semibold"
          >
            Spar {monthlySavings}% med årlig betaling
          </Text>
        )}
      </div>

      <Button
        variant="primary"
        onClick={onSelect}
        fullWidth
        className="mb-6"
      >
        Velg {tier.name}
      </Button>

      <div className="space-y-3">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check
              size={18}
              className={`flex-shrink-0 mt-0.5 ${
                tier.highlighted ? 'text-tier-accent' : 'text-tier-success'
              }`}
            />
            <Text
              variant="footnote"
              color={tier.highlighted ? 'inverse' : 'primary'}
            >
              {feature}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingPage: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [userRole, setUserRole] = useState<UserRole>('player');
  const navigate = useNavigate();

  const handleSelectPlan = (tierId: string) => {
    // Navigate to checkout with selected plan
    navigate(`/checkout?plan=${tierId}&interval=${billingInterval}`);
  };

  const tiers = userRole === 'player' ? PLAYER_TIERS : COACH_TIERS;

  return (
    <div className="min-h-screen bg-tier-background">
      {/* Header */}
      <div className="bg-tier-navy text-tier-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Text variant="title1" color="inverse" className="mb-4">
            Velg riktig plan for deg
          </Text>
          <Text variant="body" color="inverse" className="max-w-2xl mx-auto">
            Alle planer inkluderer gratis prøveperiode på 14 dager. Ingen binding.
          </Text>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Role Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={userRole === 'player' ? 'primary' : 'secondary'}
            onClick={() => setUserRole('player')}
          >
            Spiller
          </Button>
          <Button
            variant={userRole === 'coach' ? 'primary' : 'secondary'}
            onClick={() => setUserRole('coach')}
          >
            Trener
          </Button>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <Text
            variant="body"
            color={billingInterval === 'monthly' ? 'primary' : 'secondary'}
            className="font-semibold"
          >
            Månedlig
          </Text>
          <button
            onClick={() =>
              setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')
            }
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              billingInterval === 'yearly' ? 'bg-tier-navy' : 'bg-tier-border-default'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-tier-white transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <Text
            variant="body"
            color={billingInterval === 'yearly' ? 'primary' : 'secondary'}
            className="font-semibold"
          >
            Årlig
          </Text>
          {billingInterval === 'yearly' && (
            <span className="ml-2 px-3 py-1 bg-tier-success-light text-tier-success text-xs font-semibold rounded-full">
              Spar opp til 17%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid gap-8 ${
            tiers.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {tiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              billingInterval={billingInterval}
              onSelect={() => handleSelectPlan(tier.id)}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Text variant="title2" color="primary" className="text-center mb-8">
            Ofte stilte spørsmål
          </Text>
          <div className="space-y-6">
            <div>
              <Text variant="body" color="primary" className="font-semibold mb-2">
                Kan jeg endre plan senere?
              </Text>
              <Text variant="body" color="secondary">
                Ja, du kan oppgradere eller nedgradere når som helst. Endringer trer i kraft ved neste faktureringsperiode.
              </Text>
            </div>
            <div>
              <Text variant="body" color="primary" className="font-semibold mb-2">
                Hvilke betalingsmetoder aksepterer dere?
              </Text>
              <Text variant="body" color="secondary">
                Vi aksepterer alle vanlige kredittkort (Visa, Mastercard, Amex), Apple Pay og Google Pay via Stripe.
              </Text>
            </div>
            <div>
              <Text variant="body" color="primary" className="font-semibold mb-2">
                Hva skjer etter prøveperioden?
              </Text>
              <Text variant="body" color="secondary">
                Etter 14 dagers gratis prøveperiode vil du automatisk bli fakturert for den valgte planen. Du kan kansellere når som helst før prøveperioden utløper.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
