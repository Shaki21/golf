import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Treningsprotokoll from './Treningsprotokoll';
import { PageHeader } from '../../ui/raw-blocks';

// Demo data for when API is not available
const demoSessions = [
  {
    id: '1',
    name: 'Teknikk - Driving',
    type: 'teknikk',
    date: new Date().toISOString(),
    duration: 90,
    status: 'completed',
    level: 'L3',
    notes: 'Fokus på svingteknikk og kontakt'
  },
  {
    id: '2',
    name: 'Putting Green',
    type: 'golfslag',
    date: new Date(Date.now() + 86400000).toISOString(),
    duration: 60,
    status: 'upcoming',
    level: 'L4',
    notes: 'Korte putter under 3 meter'
  },
  {
    id: '3',
    name: 'Spill 9 hull',
    type: 'spill',
    date: new Date(Date.now() + 172800000).toISOString(),
    duration: 150,
    status: 'upcoming',
    level: 'L5',
    notes: 'Simuleringsspill med score'
  }
];

const TreningsprotokollContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setState('loading');
      setError(null);

      // Try to fetch from training-plan API
      const response = await apiClient.get('/training-plan');
      const plans = response.data?.data || response.data || [];

      // Transform plan data to sessions format
      const transformedSessions = Array.isArray(plans) ? plans : [];
      setSessions(transformedSessions.length > 0 ? transformedSessions : demoSessions);
      setState('idle');
    } catch (err) {
      console.error('Error fetching training sessions:', err);
      // Use demo data as fallback
      setSessions(demoSessions);
      setState('idle');
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Laster treningsprotokoll..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste treningsprotokoll'}
        onRetry={fetchSessions}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        title="Ingen treningsøkter"
        message="Du har ingen registrerte treningsøkter ennå."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Treningsprotokoll"
        subtitle="Oversikt over dine treningsøkter"
        helpText="Logg over alle treningsøkter med dato, type (teknikk, golfslag, spill, fysisk, mental), varighet, status (fullført/kommende) og nivå. Se notater for hver økt, filtrer etter kategori og type. Bruk for å spore treningshistorikk og planlegge fremtidige økter."
      />
      <Treningsprotokoll sessions={sessions} onRefresh={fetchSessions} />
    </>
  );
};

export default TreningsprotokollContainer;
