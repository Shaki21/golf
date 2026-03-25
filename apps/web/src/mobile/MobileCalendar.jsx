/**
 * MobileCalendar Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect } from 'react';
import { PageTitle, SubSectionTitle } from '../components/typography';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import apiClient from '../services/apiClient';

// Design token values (inline styles)
const tokenValues = {
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  colors: { charcoal: '#1C1C1E', white: 'rgb(var(--tier-white))', steel: '#8E8E93' },
  borderRadius: { sm: '8px' },
  shadows: { card: '0 2px 8px rgba(0, 0, 0, 0.08)' },
};

// Typography helper (simplified inline)
const typographyStyle = (variant) => {
  const styles = {
    title1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
    title3: { fontSize: '20px', fontWeight: 600, lineHeight: 1.3 },
    callout: { fontSize: '14px', fontWeight: 500, lineHeight: 1.4 },
  };
  return styles[variant] || {};
};

export default function MobileCalendar() {
  const [state, setState] = useState('loading');
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setState('loading');
      const res = await apiClient.get('/calendar/events');
      setEvents(res.data);
      setState(res.data.length > 0 ? 'idle' : 'empty');
    } catch (err) {
      setError(err); setState('error');
    }
  };

  if (state === 'loading') return <LoadingState message="Henter kalender..." />;
  if (state === 'error') return <ErrorState errorType={error?.type} message={error?.message} onRetry={fetchEvents} />;
  if (state === 'empty') return <EmptyState title="Ingen hendelser" message="Ingen planlagte aktiviteter." />;

  return (
    <div style={{ padding: tokenValues.spacing.md }}>
      <PageTitle style={{ ...typographyStyle('title1'), color: tokenValues.colors.charcoal, margin: `${tokenValues.spacing.lg} 0` }}>Kalender</PageTitle>
      {events.map(evt => (
        <div key={evt.id} style={{ backgroundColor: tokenValues.colors.white, padding: tokenValues.spacing.md, marginBottom: tokenValues.spacing.sm, borderRadius: tokenValues.borderRadius.sm, boxShadow: tokenValues.shadows.card }}>
          <SubSectionTitle style={{ ...typographyStyle('title3'), margin: `0 0 ${tokenValues.spacing.xs}` }}>{evt.title}</SubSectionTitle>
          <p style={{ ...typographyStyle('callout'), color: tokenValues.colors.steel, margin: 0 }}>{new Date(evt.date).toLocaleDateString('no')} • {evt.duration} min</p>
        </div>
      ))}
    </div>
  );
}
