/**
 * TIER Golf - Admin Tier Management
 *
 * Archetype: A - List/Index Page
 * Purpose: Manage subscription tiers as billing configuration
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text, Badge, Button } from '../../ui/primitives';
import apiClient from '../../services/apiClient';

// ============================================================================
// TYPES
// ============================================================================

type SubscriptionTier = {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: Record<string, boolean>;
  active: boolean;
};

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_TIERS: SubscriptionTier[] = [
  {
    id: 't1',
    name: 'Standard',
    price: 99,
    interval: 'monthly',
    features: { proof_enabled: true, trajectory_view: true, coach_notes: false },
    active: true,
  },
  {
    id: 't2',
    name: 'Pro',
    price: 199,
    interval: 'monthly',
    features: { proof_enabled: true, trajectory_view: true, coach_notes: true },
    active: true,
  },
  {
    id: 't3',
    name: 'Team',
    price: 1999,
    interval: 'yearly',
    features: { proof_enabled: true, trajectory_view: true, coach_notes: true },
    active: false,
  },
];

const FEATURE_LABELS: Record<string, string> = {
  proof_enabled: 'PROOF-visning',
  trajectory_view: 'Utviklingsvisning',
  coach_notes: 'Trenernotater',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminTierManagement() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadTiers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/tiers');
      setTiers(data.data.tiers || data.data || []);
    } catch {
      setTiers(DEFAULT_TIERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  const toggleActive = async (id: string) => {
    const tier = tiers.find((t) => t.id === id);
    if (!tier) return;

    try {
      await apiClient.patch(`/admin/tiers/${id}`, { active: !tier.active });
    } catch {
      // API not available, just update locally
    }

    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  const formatInterval = (interval: SubscriptionTier['interval']) => {
    return interval === 'monthly' ? '/mnd' : '/år';
  };

  // Determine page state
  const pageState = loading ? 'loading' : tiers.length === 0 ? 'empty' : 'idle';

  return (
    <Page state={pageState} maxWidth="xl">
      <Page.Header
        title="Abonnementsnivåer"
        subtitle="Konfigurasjon av faktureringsnivåer"
        helpText="Administrator-oversikt over abonnementsnivåer og faktureringskonfigurasjon. Se pris, intervall (månedlig/årlig), tilgjengelige funksjoner per nivå, og aktiver/deaktiver tiers. Ekspander rad for fullstendige detaljer."
      />

      <Page.Content>
        <Page.Section title="Nivåer" description="Tilgjengelige abonnementsplaner">
          <div className="divide-y divide-tier-border-default">
            {tiers.map((tier) => (
              <div key={tier.id} className="py-4 first:pt-0 last:pb-0">
                {/* Tier Row */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Text variant="body" color="primary" className="font-medium">
                      {tier.name}
                    </Text>
                    <Text variant="caption1" color="secondary" className="mt-1">
                      {tier.price} kr{formatInterval(tier.interval)}
                    </Text>
                  </div>

                  <Badge variant={tier.active ? 'success' : 'default'} size="sm">
                    <span className="flex items-center gap-1.5">
                      {tier.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {tier.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === tier.id ? null : tier.id)}
                    aria-expanded={expandedId === tier.id}
                  >
                    {expandedId === tier.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>

                  <Button
                    variant={tier.active ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={() => toggleActive(tier.id)}
                  >
                    {tier.active ? 'Deaktiver' : 'Aktiver'}
                  </Button>
                </div>

                {/* Expanded Features */}
                {expandedId === tier.id && (
                  <div className="mt-4 p-4 bg-tier-surface-base rounded-lg">
                    <Text variant="caption1" color="secondary" className="mb-3">
                      Inkluderte funksjoner
                    </Text>
                    <div className="space-y-2">
                      {Object.entries(tier.features).map(([key, enabled]) => (
                        <div key={key} className="flex items-center gap-2">
                          {enabled ? (
                            <CheckCircle size={16} className="text-tier-success" />
                          ) : (
                            <XCircle size={16} className="text-tier-text-tertiary" />
                          )}
                          <Text
                            variant="body"
                            color={enabled ? 'primary' : 'secondary'}
                          >
                            {FEATURE_LABELS[key] || key}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
}
