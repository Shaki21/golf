/**
 * useCoachPlanDashboard Hook
 * Fetches and computes decision-first dashboard state for coaches
 *
 * Priority logic:
 * 1. Unreviewed sessions (immediate feedback needed)
 * 2. Pending player approvals (blocking player progress)
 * 3. Tournament prep (time-sensitive)
 * 4. Today's sessions (active coaching)
 * 5. Players inactive (need attention)
 * 6. All clear (no immediate actions)
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../data/apiClient';
import type {
  CoachDashboardData,
  CoachDashboardState,
  PlayerAttentionItem,
  TodaySession,
  TeamLoadStats,
  TournamentItem,
  CoachAttentionItem,
  CoachPrimaryAction,
} from '../types';

// API response type from backend
interface ApiCoachDashboardResponse {
  state: CoachDashboardState;
  primaryAction: CoachPrimaryAction;
  playersNeedingAttention: PlayerAttentionItem[];
  todaySessions: TodaySession[];
  teamLoadStats: TeamLoadStats;
  upcomingTournaments: Array<{
    id: string;
    name: string;
    date: string;
    daysUntil: number;
    playersEntered: number;
    playersPrepared: number;
    location: string;
  }>;
  attentionItems: CoachAttentionItem[];
  attentionCount: number;
}

// Fallback/mock data for when API is unavailable
function createFallbackData(): CoachDashboardData {
  return {
    state: 'all_clear',
    primaryAction: {
      type: 'view_dashboard',
      label: 'View Overview',
      href: '/coach/athletes',
      context: 'All clear - view player overview',
    },
    playersNeedingAttention: [],
    todaySessions: [],
    teamLoadStats: {
      totalPlayers: 0,
      activePlayers: 0,
      sessionsThisWeek: 0,
      pendingReviews: 0,
    },
    upcomingTournaments: [],
    attentionItems: [],
    attentionCount: 0,
  };
}

function mapApiResponse(api: ApiCoachDashboardResponse): CoachDashboardData {
  return {
    ...api,
    upcomingTournaments: api.upcomingTournaments.map((t) => ({
      ...t,
      date: new Date(t.date),
    })),
  };
}

export interface UseCoachPlanDashboardResult {
  data: CoachDashboardData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Main hook for fetching coach plan dashboard data
 */
export function useCoachPlanDashboard(): UseCoachPlanDashboardResult {
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<ApiCoachDashboardResponse>('/coach-plan-dashboard');
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
export function useCoachAttentionCount(): { count: number; isLoading: boolean } {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await apiGet<{ count: number }>('/coach-plan-dashboard/attention-count');
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

export default useCoachPlanDashboard;
