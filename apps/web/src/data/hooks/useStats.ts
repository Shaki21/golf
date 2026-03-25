/**
 * useStats Hook
 * Fetches statistics data: KPIs, overview, recent sessions
 * Maps to StatsPageV2 component
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../apiClient';
import type {
  HookResult,
  StatsData,
  StatsKpiItem,
  StatsOverviewItem,
  RecentSession,
  ApiStatsResponse,
} from '../types';

// ═══════════════════════════════════════════
// FALLBACK DATA
// ═══════════════════════════════════════════

const fallbackKpis: StatsKpiItem[] = [
  { id: '1', label: 'Treningsminutter', value: '420', sublabel: 'Denne uken', change: { value: '15%', direction: 'up' } },
  { id: '2', label: 'Økter fullført', value: '6', sublabel: 'Av 8 planlagt' },
  { id: '3', label: 'Putting snitt', value: '29.2', sublabel: 'Putts per runde', change: { value: '0.8', direction: 'down' } },
  { id: '4', label: 'Range snitt', value: '245m', sublabel: 'Driver distance' },
  { id: '5', label: 'Progresjon', value: '78%', sublabel: 'Mot sesongmål', change: { value: '12%', direction: 'up' } },
  { id: '6', label: 'GIR', value: '62%', sublabel: 'Greens in regulation', change: { value: '3%', direction: 'up' } },
];

const fallbackOverview: StatsOverviewItem[] = [
  { id: '1', label: 'Beste runde', value: '72 (+0)', trend: 'positive' },
  { id: '2', label: 'Snitt siste 5 runder', value: '76.4', trend: 'neutral' },
  { id: '3', label: 'Handicap', value: '8.2', trend: 'positive' },
  { id: '4', label: 'Fairway treff', value: '58%', trend: 'neutral' },
  { id: '5', label: 'Sand saves', value: '42%', trend: 'negative' },
];

const fallbackRecentSessions: RecentSession[] = [
  { id: '1', title: 'Putting drill', date: 'I dag', duration: '45 min', type: 'Kort spill' },
  { id: '2', title: 'Driving range', date: 'I går', duration: '60 min', type: 'Langt spill' },
  { id: '3', title: 'Chipping øvelser', date: '2 dager siden', duration: '30 min', type: 'Kort spill' },
];

// ═══════════════════════════════════════════
// MAPPER
// ═══════════════════════════════════════════

function mapApiToStatsData(response: ApiStatsResponse): StatsData {
  const kpis: StatsKpiItem[] = (response.kpis ?? []).map((k) => ({
    id: k.id,
    label: k.label,
    value: k.value,
    sublabel: k.sublabel,
    change: k.changeValue
      ? {
          value: k.changeValue,
          direction: mapChangeDirection(k.changeDirection),
        }
      : undefined,
  }));

  const overview: StatsOverviewItem[] = (response.overview ?? []).map((o) => ({
    id: o.id,
    label: o.label,
    value: o.value,
    trend: mapTrend(o.trend),
  }));

  const recentSessions: RecentSession[] = (response.recentSessions ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    date: formatRelativeDate(s.date),
    duration: `${s.durationMinutes} min`,
    type: mapSessionType(s.sessionType),
  }));

  return { kpis, overview, recentSessions };
}

function mapChangeDirection(direction?: string): 'up' | 'down' | 'neutral' {
  switch (direction?.toLowerCase()) {
    case 'up':
    case 'positive':
      return 'up';
    case 'down':
    case 'negative':
      return 'down';
    default:
      return 'neutral';
  }
}

function mapTrend(trend?: string): StatsOverviewItem['trend'] {
  switch (trend?.toLowerCase()) {
    case 'positive':
    case 'up':
      return 'positive';
    case 'negative':
    case 'down':
      return 'negative';
    default:
      return 'neutral';
  }
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'I dag';
  if (diffDays === 1) return 'I går';
  if (diffDays < 7) return `${diffDays} dager siden`;
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

function mapSessionType(type: string): string {
  const typeMap: Record<string, string> = {
    putting: 'Kort spill',
    chipping: 'Kort spill',
    pitching: 'Kort spill',
    driving: 'Langt spill',
    irons: 'Langt spill',
    mental: 'Mental',
    fitness: 'Fysisk',
  };
  return typeMap[type.toLowerCase()] || type;
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useStats(period: 'week' | 'month' | 'year' = 'week'): HookResult<StatsData> {
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use dashboard endpoint which returns weekly stats, goals, sessions etc.
      const response = await apiGet<ApiStatsResponse>('/dashboard', { period });
      const mappedData = mapApiToStatsData(response);
      setData(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste statistikk';
      setError(message);
      // Use fallback data on error
      setData({
        kpis: fallbackKpis,
        overview: fallbackOverview,
        recentSessions: fallbackRecentSessions,
      });
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export default useStats;
