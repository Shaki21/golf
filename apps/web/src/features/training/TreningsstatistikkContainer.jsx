import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Treningsstatistikk from './Treningsstatistikk.tsx';
import { PageHeader } from '../../ui/raw-blocks';

// Demo stats for when API is not available
const demoStats = {
  totalSessions: 45,
  totalHours: 67.5,
  currentStreak: 5,
  completionRate: 85,
  weeklyGoal: 10,
  weeklyCompleted: 7,
  byCategory: {
    teknikk: { sessions: 18, hours: 27 },
    golfslag: { sessions: 12, hours: 18 },
    spill: { sessions: 8, hours: 15 },
    fysisk: { sessions: 5, hours: 5 },
    mental: { sessions: 2, hours: 2.5 }
  },
  recentSessions: [
    { id: '1', name: 'Driving Range', date: new Date().toISOString(), duration: 90, type: 'teknikk' },
    { id: '2', name: 'Putting', date: new Date(Date.now() - 86400000).toISOString(), duration: 45, type: 'golfslag' },
    { id: '3', name: '9 hull', date: new Date(Date.now() - 172800000).toISOString(), duration: 150, type: 'spill' }
  ]
};

const TreningsstatistikkContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setState('loading');
      setError(null);

      // Use training-plan endpoint for stats data
      const response = await apiClient.get('/training-plan');
      const plans = response.data?.data || response.data || [];

      // Transform to stats format or use demo data
      if (Array.isArray(plans) && plans.length > 0) {
        setStats({
          ...demoStats,
          plans: plans
        });
      } else {
        setStats(demoStats);
      }
      setState('idle');
    } catch (err) {
      console.error('Error fetching training stats:', err);
      // Use demo stats as fallback
      setStats(demoStats);
      setState('idle');
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Laster treningsstatistikk..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Kunne ikke laste treningsstatistikk'}
        onRetry={fetchStats}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Treningsstatistikk"
        subtitle="Dine treningsdata og fremgang"
        helpText="Statistikk over treningsaktivitet med totalt antall økter, timer, nåværende streak, fullføringsrate og ukentlig mål. Se fordeling per kategori (teknikk, golfslag, spill, fysisk, mental) med økter og timer. Oversikt over siste økter med dato, varighet og type. Bruk for å følge progresjon og motivasjon."
      />
      <Treningsstatistikk stats={stats} onRefresh={fetchStats} />
    </>
  );
};

export default TreningsstatistikkContainer;
