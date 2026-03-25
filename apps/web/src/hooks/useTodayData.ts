/**
 * useTodayData Hook
 *
 * Fetches and transforms data for the TodayHero component.
 * Combines goals, planned sessions, and completion data.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/apiClient';
import {
  calculateTodayPriority,
  TodayState,
  Goal,
  PlannedSession,
} from '../utils/prioritization';

// =============================================================================
// TYPES
// =============================================================================

export interface UseTodayDataOptions {
  /** Refresh interval in milliseconds (0 = no auto-refresh) */
  refreshInterval?: number;
  /** Whether to include demo data when API fails */
  useFallbackData?: boolean;
}

export interface UseTodayDataResult {
  /** Today's prioritized state */
  todayState: TodayState;
  /** User's active goals */
  goals: Goal[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Manually refresh data */
  refresh: () => Promise<void>;
  /** Mark a session as completed */
  markCompleted: (sessionId: string) => void;
}

// =============================================================================
// DEMO DATA (Fallback)
// =============================================================================

const demoGoals: Goal[] = [
  {
    id: 'goal-1',
    name: 'Improve putting under 3m',
    status: 'behind',
    currentProgress: 2,
    targetProgress: 5,
    unit: 'sessions',
    sessionsBehind: 2,
    riskScore: 75,
    recommendedExerciseId: 'exercise-putting-1',
    recommendedExerciseName: 'Putting drill: Gate exercise',
  },
  {
    id: 'goal-2',
    name: 'Weekly training goal',
    status: 'on-track',
    currentProgress: 3,
    targetProgress: 5,
    unit: 'sessions',
    sessionsBehind: 0,
    riskScore: 30,
  },
  {
    id: 'goal-3',
    name: 'Improve driving accuracy',
    status: 'on-track',
    currentProgress: 1,
    targetProgress: 3,
    unit: 'sessions',
    sessionsBehind: 0,
    riskScore: 25,
    recommendedExerciseId: 'exercise-driving-1',
    recommendedExerciseName: 'Driver alignment drill',
  },
];

const demoPlannedSessions: PlannedSession[] = [
  {
    id: 'session-1',
    title: 'Putting practice',
    type: 'exercise',
    scheduledDate: new Date(),
    estimatedDuration: 30,
    goalId: 'goal-1',
    category: 'putting',
    description: 'Focus on short putts under 3m',
  },
  {
    id: 'session-2',
    title: 'Driving range',
    type: 'exercise',
    scheduledDate: new Date(),
    estimatedDuration: 45,
    goalId: 'goal-3',
    category: 'driving',
  },
];

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function fetchGoals(): Promise<Goal[]> {
  try {
    const response = await apiClient.get<{ data: Array<{
      id: string;
      name?: string;
      title?: string;
      status?: string;
      currentProgress?: number;
      current?: number;
      targetProgress?: number;
      target?: number;
      unit?: string;
      sessionsBehind?: number;
      riskScore?: number;
      recommendedExerciseId?: string;
      recommendedExerciseName?: string;
    }> }>('/goals', { params: { status: 'active' } });

    const apiGoals = response.data?.data || [];

    return apiGoals.map((goal) => ({
      id: goal.id,
      name: goal.name || goal.title || 'Unnamed goal',
      status: (goal.status === 'at_risk' || goal.status === 'behind') ? 'behind' : 'on-track',
      currentProgress: goal.currentProgress ?? goal.current ?? 0,
      targetProgress: goal.targetProgress ?? goal.target ?? 100,
      unit: goal.unit || 'units',
      sessionsBehind: goal.sessionsBehind ?? 0,
      riskScore: goal.riskScore ?? 0,
      recommendedExerciseId: goal.recommendedExerciseId,
      recommendedExerciseName: goal.recommendedExerciseName,
    }));
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    // Return demo data as fallback
    return demoGoals;
  }
}

async function fetchPlannedSessions(): Promise<PlannedSession[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<{ data: Array<{
      id: string;
      title?: string;
      name?: string;
      type?: string;
      scheduledDate?: string;
      date?: string;
      estimatedDuration?: number;
      durationMinutes?: number;
      goalId?: string;
      category?: string;
      description?: string;
      status?: string;
    }> }>('/sessions', { params: { date: today } });

    const apiSessions = response.data?.data || [];

    return apiSessions.map((session) => {
      // Map API session types to PlannedSession types
      const typeMap: Record<string, 'exercise' | 'test' | 'round'> = {
        exercise: 'exercise',
        test: 'test',
        round: 'round',
        match: 'round',
        competition: 'round',
      };

      return {
        id: session.id,
        title: session.title || session.name || 'Training session',
        type: typeMap[session.type || 'exercise'] || 'exercise',
        scheduledDate: new Date(session.scheduledDate || session.date || today),
        estimatedDuration: session.estimatedDuration || session.durationMinutes || 30,
        goalId: session.goalId,
        category: session.category,
        description: session.description,
      };
    });
  } catch (error) {
    console.error('Failed to fetch planned sessions:', error);
    // Return demo data as fallback
    return demoPlannedSessions;
  }
}

async function fetchCompletedSessionIds(): Promise<string[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<{ data: Array<{ id: string }> }>(
      '/sessions/completed',
      { params: { date: today } }
    );

    return (response.data?.data || []).map((s) => s.id);
  } catch (error) {
    console.error('Failed to fetch completed sessions:', error);
    return [];
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useTodayData(
  options: UseTodayDataOptions = {}
): UseTodayDataResult {
  const { refreshInterval = 0, useFallbackData = true } = options;

  // State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [completedSessionIds, setCompletedSessionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [goalsData, sessionsData, completedData] = await Promise.all([
        fetchGoals(),
        fetchPlannedSessions(),
        fetchCompletedSessionIds(),
      ]);

      setGoals(goalsData);
      setPlannedSessions(sessionsData);
      setCompletedSessionIds(completedData);
    } catch (err) {
      console.error('Failed to fetch today data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));

      // Use fallback data if enabled
      if (useFallbackData) {
        setGoals(demoGoals);
        setPlannedSessions(demoPlannedSessions);
        setCompletedSessionIds([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [useFallbackData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  // Calculate today's state
  const todayState = useMemo(() => {
    return calculateTodayPriority(goals, plannedSessions, completedSessionIds);
  }, [goals, plannedSessions, completedSessionIds]);

  // Mark a session as completed (optimistic update)
  const markCompleted = useCallback((sessionId: string) => {
    setCompletedSessionIds((prev) => {
      if (prev.includes(sessionId)) return prev;
      return [...prev, sessionId];
    });

    // Persist completion to backend
    apiClient.post('/sessions/complete', { sessionId }).catch((error) => {
      console.error('Failed to mark session as completed:', error);
      // Revert optimistic update on failure
      setCompletedSessionIds((prev) => prev.filter((id) => id !== sessionId));
    });
  }, []);

  return {
    todayState,
    goals,
    isLoading,
    error,
    refresh: fetchData,
    markCompleted,
  };
}

export default useTodayData;
