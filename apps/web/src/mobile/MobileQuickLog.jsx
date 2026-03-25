/**
 * MobileQuickLog Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { PageTitle } from '../components/typography';
import SuccessState from '../components/ui/SuccessState';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import apiClient from '../services/apiClient';

// Design token values (inline styles)
const tokenValues = {
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  colors: { charcoal: '#1C1C1E', white: 'rgb(var(--tier-white))', primary: '#10456A', mist: '#E5E7EB' },
  borderRadius: { sm: '8px', md: '12px' },
};

// Typography helper (simplified inline)
const typographyStyle = (variant) => {
  const styles = {
    title1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
    label: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4 },
  };
  return styles[variant] || {};
};

export default function MobileQuickLog() {
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ type: 'golf', duration: 60, intensity: 'medium', date: new Date().toISOString().split('T')[0], notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setState('loading');
      await apiClient.post('/training/sessions', form, { headers: { 'Idempotency-Key': `log_${Date.now()}` } });
      setState('success');
    } catch (err) {
      setError(err); setState('error');
    }
  };

  if (state === 'loading') return <LoadingState message="Lagrer..." />;
  if (state === 'error') return <ErrorState errorType={error?.type} message={error?.message} onRetry={() => setState('idle')} />;
  if (state === 'success') return <SuccessState message="Trening lagret!" onDismiss={() => { setState('idle'); setForm({ type: 'golf', duration: 60, intensity: 'medium', date: new Date().toISOString().split('T')[0], notes: '' }); }} />;

  return (
    <div style={{ padding: tokenValues.spacing.md }}>
      <PageTitle style={{ ...typographyStyle('title1'), color: tokenValues.colors.charcoal, margin: `${tokenValues.spacing.lg} 0` }}>Logg Trening</PageTitle>
      <form onSubmit={handleSubmit} style={{ backgroundColor: tokenValues.colors.white, padding: tokenValues.spacing.lg, borderRadius: tokenValues.borderRadius.md }}>
        <label style={{ ...typographyStyle('label'), display: 'block', marginBottom: tokenValues.spacing.sm }}>Type
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: tokenValues.spacing.sm, marginTop: tokenValues.spacing.xs, borderRadius: tokenValues.borderRadius.sm, border: `1px solid ${tokenValues.colors.mist}` }}>
            <option value="golf">Golf</option><option value="gym">Gym</option><option value="cardio">Cardio</option><option value="flexibility">Flexibility</option>
          </select>
        </label>
        <label style={{ ...typographyStyle('label'), display: 'block', marginTop: tokenValues.spacing.md }}>Varighet (min)
          <input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} style={{ width: '100%', padding: tokenValues.spacing.sm, marginTop: tokenValues.spacing.xs, borderRadius: tokenValues.borderRadius.sm, border: `1px solid ${tokenValues.colors.mist}` }} />
        </label>
        <button type="submit" style={{ ...typographyStyle('label'), marginTop: tokenValues.spacing.lg, width: '100%', padding: tokenValues.spacing.md, backgroundColor: tokenValues.colors.primary, color: tokenValues.colors.white, border: 'none', borderRadius: tokenValues.borderRadius.sm, cursor: 'pointer' }}>
          Lagre
        </button>
      </form>
    </div>
  );
}
