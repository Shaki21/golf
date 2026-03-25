/**
 * TIER Golf - Admin Escalation / Support
 *
 * Archetype: A - List/Index Page
 * Purpose: Handle operational issues and escalations
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text, Badge, Button } from '../../ui/primitives';
import { useAuth } from '../../contexts/AuthContext';
import { supportAPI } from '../../services/api';

// ============================================================================
// TYPES
// ============================================================================

type SupportCase = {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt?: string;
};

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG = {
  open: {
    icon: AlertCircle,
    variant: 'error' as const,
    label: 'Åpen',
  },
  in_progress: {
    icon: Clock,
    variant: 'warning' as const,
    label: 'Under arbeid',
  },
  closed: {
    icon: CheckCircle,
    variant: 'success' as const,
    label: 'Løst',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface AdminEscalationSupportProps {
  cases?: SupportCase[];
}

export default function AdminEscalationSupport({ cases: propCases }: AdminEscalationSupportProps = {}) {
  const { user } = useAuth();
  const [cases, setCases] = useState<SupportCase[]>(propCases || []);
  const [loading, setLoading] = useState(!propCases);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supportAPI.list();
      const casesData = response.data?.data?.cases || response.data?.data || response.data || [];

      if (Array.isArray(casesData) && casesData.length > 0) {
        setCases(
          casesData.map(
            (c: {
              id: string;
              title?: string;
              subject?: string;
              status?: string;
              createdAt?: string;
              created_at?: string;
            }) => ({
              id: c.id,
              title: c.title || c.subject || 'Ukjent sak',
              status: (c.status as SupportCase['status']) || 'open',
              createdAt: c.createdAt || c.created_at,
            })
          )
        );
      } else {
        setCases([]);
      }
    } catch (err) {
      console.error('Error fetching support cases:', err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!propCases && user) {
      fetchCases();
    }
  }, [propCases, user, fetchCases]);

  const updateStatus = async (id: string, status: SupportCase['status']) => {
    try {
      await supportAPI.update(id, { status });
      setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch (err) {
      console.error('Error updating case status:', err);
    }
  };

  const openCount = cases.filter((c) => c.status !== 'closed').length;

  // Determine page state
  const pageState = loading ? 'loading' : cases.length === 0 ? 'empty' : 'idle';

  return (
    <Page state={pageState} maxWidth="xl">
      <Page.Header
        title="Support & Eskalering"
        subtitle={cases.length > 0 ? `${openCount} aktive saker` : undefined}
      />

      <Page.Content>
        <Page.Section title="Saker" description="Åpne og lukkede støttesaker">
          <div className="divide-y divide-tier-border-default">
            {cases.map((caseItem) => {
              const config = STATUS_CONFIG[caseItem.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={caseItem.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <Text variant="body" color="primary" className="font-medium">
                      {caseItem.title}
                    </Text>
                    {caseItem.createdAt && (
                      <Text variant="caption1" color="secondary" className="mt-1">
                        Opprettet: {caseItem.createdAt}
                      </Text>
                    )}
                  </div>

                  <Badge variant={config.variant} size="sm">
                    <span className="flex items-center gap-1.5">
                      <StatusIcon size={14} />
                      {config.label}
                    </span>
                  </Badge>

                  {caseItem.status !== 'closed' && (
                    <div className="flex gap-2">
                      {caseItem.status === 'open' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(caseItem.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateStatus(caseItem.id, 'closed')}
                      >
                        Lukk sak
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
}
