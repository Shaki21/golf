/**
 * MobilePlan Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect } from 'react';
import { PageTitle } from '../components/typography';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import apiClient from '../services/apiClient';

// Design token values (inline styles)
const tokenValues = {
  spacing: { md: '16px', lg: '24px' },
  colors: { charcoal: '#1C1C1E', white: 'rgb(var(--tier-white))', steel: '#8E8E93' },
  borderRadius: { md: '12px' },
  shadows: { card: '0 2px 8px rgba(0, 0, 0, 0.08)' },
};

// Typography helper (simplified inline)
const typographyStyle = (variant) => {
  const styles = {
    title1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
    body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
  };
  return styles[variant] || {};
};

export default function MobilePlan() {
  const [state, setState] = useState('loading');
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchPlan(); }, []);

  const fetchPlan = async () => {
    try {
      setState('loading');
      const res = await apiClient.get('/plan/current');
      setPlan(res.data);
      setState('idle');
    } catch (err) {
      if (err.status === 404) setState('empty');
      else { setError(err); setState('error'); }
    }
  };

  if (state === 'loading') return <LoadingState message="Henter plan..." />;
  if (state === 'error') return <ErrorState errorType={error?.type} message={error?.message} onRetry={fetchPlan} />;
  if (state === 'empty') return <EmptyState title="Ingen aktiv plan" message="Du har ikke en treningsplan ennå." />;

  return (
    <div style={{ padding: tokenValues.spacing.md }}>
      <PageTitle style={{ ...typographyStyle('title1'), color: tokenValues.colors.charcoal, margin: `${tokenValues.spacing.lg} 0` }}>
        {plan.name}
      </PageTitle>
      <div style={{ backgroundColor: tokenValues.colors.white, padding: tokenValues.spacing.lg, borderRadius: tokenValues.borderRadius.md, boxShadow: tokenValues.shadows.card }}>
        <p style={{ ...typographyStyle('body'), color: tokenValues.colors.steel, margin: 0 }}>
          Uke {plan.currentWeek} av {plan.totalWeeks} • {plan.focus}
        </p>
        <div style={{ marginTop: tokenValues.spacing.md, display: 'flex', gap: tokenValues.spacing.md }}>
          <div><strong>{plan.weekOverview.completed}</strong> fullført</div>
          <div><strong>{plan.weekOverview.planned}</strong> planlagt</div>
        </div>
      </div>
    </div>
  );
}
