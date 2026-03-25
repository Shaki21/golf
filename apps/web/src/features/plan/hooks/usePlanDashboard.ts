/**
 * usePlanDashboard Hook
 * Fetches and computes decision-first dashboard state from player data
 *
 * Priority logic:
 * 1. Missing log (immediate action needed)
 * 2. Plan not confirmed (blocking progress)
 * 3. Tournament soon (time-sensitive)
 * 4. Session upcoming (default active state)
 * 5. No sessions (needs planning)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiGet } from '../../../data/apiClient';
import type {
  PlanDashboardData,
  PlanState,
  PlanGoal,
  UpcomingSession,
  Tournament,
  LoadStats,
  AttentionItem,
} from '../types';

// API response type from backend
interface ApiPlanDashboardResponse {
  state: PlanState;
  primaryAction: {
    type: string;
    label: string;
    href: string;
    context: string;
  };
  nextSession: {
    id: string;
    title: string;
    date: string;
    time: string;
    duration: number;
    focus: string;
    type: string;
    confirmed: boolean;
  } | null;
  goals: Array<{
    id: string;
    title: string;
    outcome: string;
    leadingIndicator: {
      label: string;
      target: number;
      current: number;
      unit: string;
    };
    status: string;
    statusReason: string;
    drillHref?: string;
  }>;
  loadStats: LoadStats;
  upcomingTournament: {
    id: string;
    name: string;
    date: string;
    daysUntil: number;
    hasPlan: boolean;
    location: string;
  } | null;
  attentionItems: AttentionItem[];
  missingLogs: number;
}

// Fallback/mock data for when API is unavailable
const mockGoals: PlanGoal[] = [
  {
    id: '1',
    title: 'Forbedre putting under 3m',
    outcome: '85% holeprosent fra 3m innen juni',
    leadingIndicator: {
      label: 'Puttøkter denne uka',
      target: 3,
      current: 1,
      unit: 'økter',
    },
    status: 'at_risk',
    statusReason: 'Kun 1 av 3 planlagte puttøkter fullført',
    drillHref: '/trening/ovelser?focus=putting',
  },
  {
    id: '2',
    title: 'Øke carry med driver',
    outcome: '245m gjennomsnittlig carry',
    leadingIndicator: {
      label: 'Driving range økter',
      target: 2,
      current: 2,
      unit: 'økter',
    },
    status: 'on_track',
    statusReason: 'I rute med planlagte økter',
  },
  {
    id: '3',
    title: 'Stabilisere handicap',
    outcome: 'HCP 8.0 innen august',
    leadingIndicator: {
      label: 'Treningsrunder',
      target: 2,
      current: 1,
      unit: 'runder',
    },
    status: 'on_track',
    statusReason: 'God progresjon siste 4 uker',
  },
];

const mockNextSession: UpcomingSession = {
  id: '1',
  title: 'Teknikktrening med trener',
  date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  time: '14:00',
  duration: 60,
  focus: 'Putting & kortspill',
  type: 'coaching',
  confirmed: true,
};

const mockTournament: Tournament = {
  id: '1',
  name: 'NGF Tour #3',
  date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  daysUntil: 10,
  hasPlan: false,
  location: 'Miklagard Golf',
};

const mockLoadStats: LoadStats = {
  planned: 8,
  completed: 5,
  missingPurpose: 2,
};

function createFallbackData(): PlanDashboardData {
  return {
    state: 'session_upcoming',
    primaryAction: {
      type: 'start_session',
      label: 'Se neste økt',
      href: `/trening/okter/${mockNextSession.id}`,
      context: formatSessionContext(mockNextSession),
    },
    nextSession: mockNextSession,
    goals: mockGoals,
    loadStats: mockLoadStats,
    upcomingTournament: mockTournament,
    attentionItems: [
      {
        type: 'at_risk_goal',
        message: 'Forbedre putting under 3m: Kun 1 av 3 planlagte puttøkter fullført',
        severity: 'warning',
      },
    ],
    missingLogs: 0,
  };
}

function mapApiResponse(api: ApiPlanDashboardResponse): PlanDashboardData {
  return {
    state: api.state,
    primaryAction: api.primaryAction as PlanDashboardData['primaryAction'],
    nextSession: api.nextSession
      ? {
          ...api.nextSession,
          date: new Date(api.nextSession.date),
          type: api.nextSession.type as UpcomingSession['type'],
        }
      : null,
    goals: api.goals.map((g) => ({
      ...g,
      status: g.status as PlanGoal['status'],
    })),
    loadStats: api.loadStats,
    upcomingTournament: api.upcomingTournament
      ? {
          ...api.upcomingTournament,
          date: new Date(api.upcomingTournament.date),
        }
      : null,
    attentionItems: api.attentionItems,
    missingLogs: api.missingLogs,
  };
}

function formatSessionContext(session: UpcomingSession): string {
  const daysDiff = Math.ceil((session.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const dayLabel = daysDiff === 0 ? 'I dag' : daysDiff === 1 ? 'I morgen' : `Om ${daysDiff} dager`;
  return `${dayLabel} kl ${session.time} · ${session.focus}`;
}

export interface UsePlanDashboardResult {
  data: PlanDashboardData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Main hook for fetching plan dashboard data
 */
export function usePlanDashboard(): UsePlanDashboardResult {
  const [data, setData] = useState<PlanDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<ApiPlanDashboardResponse>('/plan-dashboard');
      const mappedData = mapApiResponse(response);
      setData(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load dashboard';
      setError(message);
      // Use fallback data on error
      setData(createFallbackData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return fallback data while loading
  const resolvedData = data || createFallbackData();

  return {
    data: resolvedData,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to compute attention badge count for sidebar
 * Uses a lighter endpoint to avoid fetching full dashboard data
 */
export function usePlanAttentionCount(): { count: number; isLoading: boolean } {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await apiGet<{ count: number }>('/plan-dashboard/attention-count');
        setCount(response.count);
      } catch {
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCount();
  }, []);

  return { count, isLoading };
}

/**
 * Legacy hook for backward compatibility
 * @deprecated Use usePlanDashboard() instead
 */
export function usePlanDashboardData(): PlanDashboardData {
  const { data } = usePlanDashboard();
  return data;
}

export default usePlanDashboard;
