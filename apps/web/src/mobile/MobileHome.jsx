/**
 * MobileHome Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect } from 'react';
import { PageTitle, SectionTitle } from '../components/typography';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import apiClient from '../services/apiClient';

// Design token values (inline styles)
const tokenValues = {
  spacing: { sm: '8px', md: '16px', lg: '24px' },
  colors: { charcoal: '#1C1C1E', white: 'rgb(var(--tier-white))', steel: '#8E8E93' },
  borderRadius: { md: '12px' },
  shadows: { card: '0 2px 8px rgba(0, 0, 0, 0.08)' },
};

// Typography helper (simplified inline)
const typographyStyle = (variant) => {
  const styles = {
    title1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
    title3: { fontSize: '20px', fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
  };
  return styles[variant] || {};
};

export default function MobileHome() {
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setState('loading');
      const [meRes, dashRes] = await Promise.all([
        apiClient.get('/me'),
        apiClient.get('/dashboard/player').catch(() => ({ data: null })),
      ]);
      setData({ user: meRes.data, dashboard: dashRes.data });
      setState('idle');
    } catch (err) {
      setError(err);
      setState('error');
    }
  };

  if (state === 'loading') return <LoadingState />;
  if (state === 'error') return <ErrorState errorType={error?.type} message={error?.message} onRetry={fetchData} />;
  if (!data?.user) return <EmptyState title="Ingen data" />;

  return (
    <div style={{ padding: tokenValues.spacing.md }}>
      <PageTitle style={{ ...typographyStyle('title1'), color: tokenValues.colors.charcoal, margin: `${tokenValues.spacing.lg} 0` }}>
        Hei, {data.user.firstName}!
      </PageTitle>
      <div style={{
        backgroundColor: tokenValues.colors.white,
        padding: tokenValues.spacing.lg,
        borderRadius: tokenValues.borderRadius.md,
        boxShadow: tokenValues.shadows.card,
      }}>
        <SectionTitle style={{ ...typographyStyle('title3'), color: tokenValues.colors.charcoal, margin: `0 0 ${tokenValues.spacing.sm}` }}>
          Dagens fokus
        </SectionTitle>
        <p style={{ ...typographyStyle('body'), color: tokenValues.colors.steel, margin: 0 }}>
          {data.dashboard?.focus || 'Ingen planlagt aktivitet i dag'}
        </p>
      </div>
    </div>
  );
}
