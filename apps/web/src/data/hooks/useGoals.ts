/**
 * useGoals Hook
 * Fetches goals data
 * Maps to GoalsPage component
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../apiClient';
import type { HookResult, GoalsData, Goal, GoalsStatsItem, ApiGoalsResponse } from '../types';

// ═══════════════════════════════════════════
// FALLBACK DATA
// ═══════════════════════════════════════════

const fallbackGoals: Goal[] = [
  { id: '1', title: 'Putting under 30 putts', description: 'Gjennomsnittlig antall putts per runde', current: 35, target: 50, unit: 'runder', status: 'active', type: 'short' },
  { id: '2', title: 'Treningsøkter per uke', description: 'Minimum 4 økter hver uke', current: 3, target: 4, unit: 'økter', status: 'active', type: 'short' },
  { id: '3', title: 'Driving accuracy', description: 'Treff fairway på minst 60%', current: 55, target: 60, unit: '%', status: 'active', type: 'short' },
  { id: '4', title: 'Nå kategori C', description: 'Oppnå alle krav for kategori C innen sesongslutt', current: 0, target: 100, unit: '%', status: 'active', type: 'long' },
  { id: '5', title: 'Handicap under 10', description: 'Reduser handicap fra 12.5 til under 10', current: 12.5, target: 10, unit: 'hcp', status: 'active', type: 'long' },
];

const fallbackStats: GoalsStatsItem[] = [
  { id: '1', label: 'Aktive mål', value: '5' },
  { id: '2', label: 'Fullført', value: '2', sublabel: 'Denne måneden' },
  { id: '3', label: 'Progresjon', value: '68%', sublabel: 'Gjennomsnitt', change: { value: '8%', direction: 'up' } },
];

// ═══════════════════════════════════════════
// MAPPER
// ═══════════════════════════════════════════

function mapApiToGoalsData(response: ApiGoalsResponse): GoalsData {
  const goals: Goal[] = response.goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    current: g.currentValue,
    target: g.targetValue,
    unit: g.unit,
    status: mapGoalStatus(g.status),
    type: g.goalType === 'long_term' ? 'long' : 'short',
  }));

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const avgProgress = response.stats?.averageProgress ?? calculateAvgProgress(activeGoals);

  const stats: GoalsStatsItem[] = [
    { id: '1', label: 'Aktive mål', value: String(activeGoals.length) },
    { id: '2', label: 'Fullført', value: String(completedGoals.length), sublabel: 'Denne måneden' },
    { id: '3', label: 'Progresjon', value: `${Math.round(avgProgress)}%`, sublabel: 'Gjennomsnitt', change: { value: '8%', direction: 'up' } },
  ];

  return { goals, stats };
}

function mapGoalStatus(status: string): Goal['status'] {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'completed';
    case 'paused':
    case 'inactive':
      return 'paused';
    default:
      return 'active';
  }
}

function calculateAvgProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, g) => {
    const progress = (g.current / g.target) * 100;
    return sum + Math.min(progress, 100);
  }, 0);
  return totalProgress / goals.length;
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useGoals(): HookResult<GoalsData> {
  const [data, setData] = useState<GoalsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Verified: /goals endpoint exists in apps/api/src/api/v1/goals/
      const response = await apiGet<ApiGoalsResponse>('/goals');
      const mappedData = mapApiToGoalsData(response);
      setData(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste mål';
      setError(message);
      // Use fallback data on error
      setData({ goals: fallbackGoals, stats: fallbackStats });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export default useGoals;
