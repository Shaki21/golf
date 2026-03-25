/**
 * TIER Golf - Admin System Overview
 *
 * Archetype: A - List/Index Page
 * Purpose: System-level visibility (status, feature flags)
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text, Badge } from '../../ui/primitives';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';

// ============================================================================
// TYPES
// ============================================================================

type SystemStatus = {
  environment: 'production' | 'staging' | 'development';
  version: string;
  uptimeHours: number;
};

type FeatureFlag = {
  key: string;
  enabled: boolean;
};

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_STATUS: SystemStatus = {
  environment: 'production',
  version: '1.0.0',
  uptimeHours: 342,
};

const DEFAULT_FLAGS: FeatureFlag[] = [
  { key: 'proof_enabled', enabled: true },
  { key: 'coach_notes', enabled: true },
  { key: 'trajectory_view', enabled: true },
  { key: 'advanced_analytics', enabled: false },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface AdminSystemOverviewProps {
  systemStatus?: SystemStatus;
  featureFlags?: FeatureFlag[];
}

export default function AdminSystemOverview({
  systemStatus: propSystemStatus,
  featureFlags: propFeatureFlags,
}: AdminSystemOverviewProps = {}) {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(propSystemStatus || DEFAULT_STATUS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(propFeatureFlags || DEFAULT_FLAGS);
  const [loading, setLoading] = useState(!propSystemStatus && !propFeatureFlags);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, flagsRes] = await Promise.all([
        apiClient.get('/admin/system/status').catch(() => ({ data: null })),
        apiClient.get('/admin/feature-flags').catch(() => ({ data: null })),
      ]);

      const statusData = statusRes.data?.data || statusRes.data;
      if (statusData) {
        setSystemStatus({
          environment: statusData.environment || 'production',
          version: statusData.version || '1.0.0',
          uptimeHours: statusData.uptimeHours || statusData.uptime || 0,
        });
      }

      const flagsData = flagsRes.data?.data || flagsRes.data;
      if (Array.isArray(flagsData) && flagsData.length > 0) {
        setFeatureFlags(
          flagsData.map((f: { key?: string; name?: string; enabled?: boolean; active?: boolean }) => ({
            key: f.key || f.name || '',
            enabled: f.enabled ?? f.active ?? false,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError('Kunne ikke laste systemdata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!propSystemStatus && !propFeatureFlags && user) {
      fetchData();
    }
  }, [propSystemStatus, propFeatureFlags, user, fetchData]);

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}t`;
  };

  const getEnvVariant = (env: string): 'success' | 'primary' | 'default' => {
    switch (env) {
      case 'production':
        return 'success';
      case 'staging':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Determine page state
  const pageState = loading ? 'loading' : error ? 'error' : 'idle';

  return (
    <Page state={pageState} maxWidth="xl">
      <Page.Header
        title="Systemoversikt"
        subtitle="Systemhelse og konfigurasjon"
        helpText="Administrator-side for systemoversikt og konfigurasjon. Se systemstatus med miljø (development/production/test), Node/API versjon, database-status, oppetid. Inspiser konfigurasjon (API URL, Stripe keys, S3/Redis status). Overvåk databasetilstand (tilkoblinger, aktive/idle, total størrelse, sist opprettet tabeller). Bruk for systemhelse, debugging og konfigurasjonskontroll."
      />

      <Page.Content>
        {/* System Status Metrics */}
        <Page.Section title="Systemstatus" description="Nåværende miljøinformasjon">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Environment */}
            <div className="p-4 bg-tier-surface-base rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-tier-text-secondary" />
                <Text variant="caption1" color="secondary">Miljø</Text>
              </div>
              <Badge variant={getEnvVariant(systemStatus.environment)} size="md">
                {systemStatus.environment}
              </Badge>
            </div>

            {/* Version */}
            <div className="p-4 bg-tier-surface-base rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-tier-text-secondary" />
                <Text variant="caption1" color="secondary">Versjon</Text>
              </div>
              <Text variant="title2" color="primary">
                v{systemStatus.version}
              </Text>
            </div>

            {/* Uptime */}
            <div className="p-4 bg-tier-surface-base rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-tier-text-secondary" />
                <Text variant="caption1" color="secondary">Oppetid</Text>
              </div>
              <Text variant="title2" color="primary">
                {formatUptime(systemStatus.uptimeHours)}
              </Text>
            </div>
          </div>
        </Page.Section>

        {/* Feature Flags */}
        <Page.Section title="Feature Flags" description="Aktive systemfunksjoner">
          <div className="divide-y divide-tier-border-default">
            {featureFlags.map((flag) => (
              <div
                key={flag.key}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <Text variant="body" color="primary">{flag.key}</Text>
                <Badge
                  variant={flag.enabled ? 'success' : 'default'}
                  size="sm"
                >
                  <span className="flex items-center gap-1.5">
                    {flag.enabled ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {flag.enabled ? 'Aktivert' : 'Deaktivert'}
                  </span>
                </Badge>
              </div>
            ))}
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
}
