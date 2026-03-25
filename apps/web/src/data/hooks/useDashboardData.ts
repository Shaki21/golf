/**
 * useDashboardData Hook
 * Fetches dashboard data: sessions + KPI stats
 * Maps to DashboardPage component
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../apiClient';
import type {
  HookResult,
  DashboardData,
  DashboardSession,
  DashboardStatsItem,
  ApiDashboardResponse,
} from '../types';

// ═══════════════════════════════════════════
// FALLBACK DATA
// ═══════════════════════════════════════════

const fallbackSessions: DashboardSession[] = [
  { id: '1', title: 'Putting-trening', start: '09:00', end: '10:30', status: 'completed' },
  { id: '2', title: 'Driving range', start: '14:00', end: '15:30', status: 'planned' },
  { id: '3', title: 'Kort spill', start: '16:00', end: '17:00', status: 'planned' },
];

const fallbackStats: DashboardStatsItem[] = [
  { id: '1', label: 'Økter i dag', value: '3', sublabel: 'av 3 planlagt' },
  { id: '2', label: 'Treningsminutter', value: '180', sublabel: 'Denne uken', change: { value: '12%', direction: 'up' } },
  { id: '3', label: 'Fullførte økter', value: '8', sublabel: 'Denne uken' },
  { id: '4', label: 'Progresjon', value: '85%', sublabel: 'Mot ukemål', change: { value: '5%', direction: 'up' } },
];

// ═══════════════════════════════════════════
// MAPPER
// ═══════════════════════════════════════════

function mapApiToDashboardData(api: ApiDashboardResponse): DashboardData {
  // Map sessions
  const sessions: DashboardSession[] = api.todaySessions.map((s) => ({
    id: s.id,
    title: s.title,
    start: s.time,
    end: calculateEndTime(s.time, s.duration),
    status: mapSessionStatus(s.status),
  }));

  // Map stats from weeklyStats
  const stats: DashboardStatsItem[] = [];

  if (api.weeklyStats?.stats) {
    const sessionsData = api.weeklyStats.stats.find((s) => s.id === 'sessions');
    const hoursData = api.weeklyStats.stats.find((s) => s.id === 'hours');

    if (sessionsData) {
      stats.push({
        id: '1',
        label: 'Økter i dag',
        value: String(sessions.length),
        sublabel: `av ${sessionsData.value} planlagt`,
      });
    }

    if (hoursData) {
      stats.push({
        id: '2',
        label: 'Treningsminutter',
        value: String(Math.round(Number(hoursData.value) * 60)),
        sublabel: 'Denne uken',
        change: { value: '12%', direction: 'up' },
      });
    }
  }

  // Add streak if available
  if (api.weeklyStats?.streak) {
    stats.push({
      id: '3',
      label: 'Streak',
      value: String(api.weeklyStats.streak),
      sublabel: 'dager på rad',
      change: { value: '1', direction: 'up' },
    });
  }

  // Ensure we have at least some stats
  if (stats.length === 0) {
    return { sessions, stats: fallbackStats };
  }

  return { sessions, stats };
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

function mapSessionStatus(status: string): DashboardSession['status'] {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'completed';
    case 'in_progress':
    case 'active':
      return 'in_progress';
    default:
      return 'planned';
  }
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useDashboardData(date?: Date): HookResult<DashboardData> {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = date ? { date: date.toISOString().split('T')[0] } : {};
      const response = await apiGet<ApiDashboardResponse>('/dashboard', params);
      const mappedData = mapApiToDashboardData(response);
      setData(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste dashboard';
      setError(message);
      // Use fallback data on error
      setData({ sessions: fallbackSessions, stats: fallbackStats });
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export default useDashboardData;
