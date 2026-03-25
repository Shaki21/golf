/**
 * EvaluationStatsDashboardContainer - Smart component for evaluation stats
 *
 * Handles:
 * - Fetching evaluation statistics from API
 * - Loading/error states
 * - Data transformation for dashboard
 *
 * Design Pattern: Container/Presentational
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sessionsAPI } from '../../services/api';
import EvaluationStatsDashboard from './EvaluationStatsDashboard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';

export default function EvaluationStatsDashboardContainer() {
  const [searchParams] = useSearchParams();

  // Get optional filters from URL
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');
  const period = searchParams.get('period');

  // State
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (period) params.period = period;

      const response = await sessionsAPI.getEvaluationStats(params);

      // Transform API response to dashboard format
      const data = response.data;

      const transformedStats = {
        totalSessions: data.totalSessions || 0,
        averages: {
          focus: data.averages?.evaluationFocus || 0,
          technical: data.averages?.evaluationTechnical || 0,
          energy: data.averages?.evaluationEnergy || 0,
          mental: data.averages?.evaluationMental || 0,
        },
        trends: {
          focus: data.trends?.focusTrend || 0,
          technical: data.trends?.technicalTrend || 0,
          energy: data.trends?.energyTrend || 0,
          mental: data.trends?.mentalTrend || 0,
        },
        preShotRoutine: data.preShotRoutine ? {
          yes: data.preShotRoutine.yes || 0,
          partial: data.preShotRoutine.partial || 0,
          no: data.preShotRoutine.no || 0,
          averageCount: data.preShotRoutine.averageCount || 0,
          averageTotal: data.preShotRoutine.averageTotal || 0,
        } : null,
        topTechnicalCues: data.technicalCues?.map(cue => ({
          name: cue.cue,
          count: cue.count,
        })) || [],
        insights: generateInsights(data),
      };

      setStats(transformedStats);
    } catch (err) {
      console.error('Failed to fetch evaluation stats:', err);
      setError(err.response?.data?.message || 'Kunne ikke laste statistikk');
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, period]);

  // Generate insights based on data
  function generateInsights(data) {
    const insights = [];

    // Focus trend insight
    if (data.trends?.focusTrend > 0.5) {
      insights.push({
        icon: 'TARGET',
        text: `Fokuset ditt har okt med ${data.trends.focusTrend.toFixed(1)} poeng siste periode. Fortsett slik!`,
      });
    } else if (data.trends?.focusTrend < -0.5) {
      insights.push({
        icon: 'alert-triangle️',
        text: `Fokuset ditt har gatt ned med ${Math.abs(data.trends.focusTrend).toFixed(1)} poeng. Vurder a sette mermere mal for neste okt.`,
      });
    }

    // Pre-shot routine insight
    if (data.preShotRoutine) {
      const total = data.preShotRoutine.yes + data.preShotRoutine.partial + data.preShotRoutine.no;
      if (total > 0) {
        const consistency = (data.preShotRoutine.yes / total) * 100;
        if (consistency >= 80) {
          insights.push({
            icon: '✅',
            text: `Utmerket pre-shot rutine konsistens (${consistency.toFixed(0)}%)! Dette er en styrke.`,
          });
        } else if (consistency < 50) {
          insights.push({
            icon: '💡',
            text: `Pre-shot rutine konsistens kan forbedres (${consistency.toFixed(0)}%). Fokuser pa a gjennomfore rutinen for hvert slag.`,
          });
        }
      }
    }

    // Session volume insight
    if (data.totalSessions >= 10) {
      insights.push({
        icon: 'STRONG',
        text: `Du har logget ${data.totalSessions} okter! God dedikasjon til trening.`,
      });
    } else if (data.totalSessions < 3) {
      insights.push({
        icon: 'NOTE',
        text: 'Logg flere okter for a fa mer detaljert statistikk og trender.',
      });
    }

    return insights;
  }

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Loading state
  if (isLoading && !stats) {
    return <LoadingState message="Laster statistikk..." />;
  }

  // Error state
  if (error && !stats) {
    return (
      <ErrorState
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <EvaluationStatsDashboard
      stats={stats}
      isLoading={isLoading}
    />
  );
}
