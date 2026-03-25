/**
 * MobileCalibration Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { PageTitle } from '../components/typography';
import LoadingState from '../components/ui/LoadingState';
import SuccessState from '../components/ui/SuccessState';
import ErrorState from '../components/ui/ErrorState';
import apiClient from '../services/apiClient';

// Design token values (inline styles)
const tokenValues = {
  spacing: { sm: '8px', md: '16px', lg: '24px' },
  colors: { charcoal: '#1C1C1E', white: 'rgb(var(--tier-white))', primary: '#10456A', primaryLight: '#2C5F7F', steel: '#8E8E93' },
  borderRadius: { sm: '8px' },
};

// Typography helper (simplified inline)
const typographyStyle = (variant) => {
  const styles = {
    title1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
    label: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4 },
    body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
  };
  return styles[variant] || {};
};

export default function MobileCalibration() {
  const [state, setState] = useState('idle');
  const [sessionId, setSessionId] = useState(null);
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState(null);

  const startSession = async () => {
    try {
      setState('loading');
      const res = await apiClient.post('/calibration/start');
      setSessionId(res.data.sessionId);
      setState('idle');
    } catch (err) {
      setError(err); setState('error');
    }
  };

  const addSample = () => {
    setSamples([...samples, { clubType: 'driver', distance: 250, timestamp: new Date().toISOString() }]);
  };

  const submitCalibration = async () => {
    try {
      setState('loading');
      await apiClient.post('/calibration/submit', { sessionId, samples });
      setState('success');
    } catch (err) {
      setError(err); setState('error');
    }
  };

  if (state === 'loading') return <LoadingState />;
  if (state === 'error') return <ErrorState errorType={error?.type} message={error?.message} onRetry={() => setState('idle')} />;
  if (state === 'success') return <SuccessState message="Kalibrering fullført!" onDismiss={() => { setState('idle'); setSamples([]); setSessionId(null); }} />;

  return (
    <div style={{ padding: tokenValues.spacing.md }}>
      <PageTitle style={{ ...typographyStyle('title1'), color: tokenValues.colors.charcoal, margin: `${tokenValues.spacing.lg} 0` }}>Kalibrering</PageTitle>
      {!sessionId ? (
        <button onClick={startSession} style={{ ...typographyStyle('label'), padding: tokenValues.spacing.md, backgroundColor: tokenValues.colors.primary, color: tokenValues.colors.white, border: 'none', borderRadius: tokenValues.borderRadius.sm, cursor: 'pointer' }}>
          Start Kalibrering
        </button>
      ) : (
        <div>
          <p style={{ ...typographyStyle('body'), color: tokenValues.colors.steel }}>Samples: {samples.length}/5</p>
          <button onClick={addSample} disabled={samples.length >= 5} style={{ ...typographyStyle('label'), padding: tokenValues.spacing.sm, marginRight: tokenValues.spacing.sm, backgroundColor: tokenValues.colors.primaryLight, color: tokenValues.colors.white, border: 'none', borderRadius: tokenValues.borderRadius.sm }}>
            Legg til sample
          </button>
          <button onClick={submitCalibration} disabled={samples.length < 5} style={{ ...typographyStyle('label'), padding: tokenValues.spacing.sm, backgroundColor: tokenValues.colors.primary, color: tokenValues.colors.white, border: 'none', borderRadius: tokenValues.borderRadius.sm, opacity: samples.length < 5 ? 0.5 : 1 }}>
            Send inn
          </button>
        </div>
      )}
    </div>
  );
}
