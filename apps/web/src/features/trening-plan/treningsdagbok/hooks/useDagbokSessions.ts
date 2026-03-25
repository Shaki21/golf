/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useDagbokSessions Hook
 *
 * Data fetching for training sessions with hierarchy filtering.
 * Computes stats and transforms API response.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../../../services/apiClient';

import type {
  DagbokState,
  DagbokSession,
  DagbokStats,
  DagbokDrill,
  Pyramid,
} from '../types';

// =============================================================================
// TYPES
// =============================================================================

export interface UseDagbokSessionsResult {
  sessions: DagbokSession[];
  stats: DagbokStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// =============================================================================
// MOCK DATA (fallback)
// =============================================================================

function generateMockSessions(state: DagbokState): DagbokSession[] {
  const sessions: DagbokSession[] = [];
  const currentDate = new Date(state.rangeStart);
  const endDate = new Date(state.rangeEnd);

  const pyramids: Pyramid[] = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
  const titles: Record<Pyramid, string[]> = {
    FYS: ['Styrketrening', 'Core-trening', 'Mobilitet', 'Power-trening'],
    TEK: ['Driver-teknikk', 'Jern-posisjoner', 'Wedge-setup', 'Putting-teknikk'],
    SLAG: ['Driver-trening', 'Innspill 150m', 'Chipping', 'Putting-drill'],
    SPILL: ['9 hull', 'Treningsrunde', 'Banestrategi'],
    TURN: ['Klubbmesterskap', 'Seniorturnering', 'Ukentlig turnering'],
  };

  let id = 1;
  while (currentDate <= endDate) {
    // 0-3 sessions per day
    const sessionsToday = Math.floor(Math.random() * 4);

    for (let i = 0; i < sessionsToday; i++) {
      const pyramid = pyramids[Math.floor(Math.random() * pyramids.length)];
      const titleOptions = titles[pyramid];
      const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
      const isPlanned = Math.random() > 0.4;
      const duration = 30 + Math.floor(Math.random() * 90);

      // Generate drills
      const drillCount = Math.floor(Math.random() * 4);
      const drills: DagbokDrill[] = [];
      let totalSets = 0;
      let totalReps = 0;

      for (let d = 0; d < drillCount; d++) {
        const sets = 2 + Math.floor(Math.random() * 4);
        const reps = 5 + Math.floor(Math.random() * 15);
        totalSets += sets;
        totalReps += sets * reps;

        drills.push({
          id: `drill-${id}-${d}`,
          name: `Drill ${d + 1}`,
          sets,
          reps,
        });
      }

      // Apply filters
      if (state.pyramid && state.pyramid !== pyramid) continue;
      if (state.planType === 'planned' && !isPlanned) continue;
      if (state.planType === 'free' && isPlanned) continue;

      sessions.push({
        id: `session-${id}`,
        date: currentDate.toISOString().split('T')[0],
        startTime: `${8 + Math.floor(Math.random() * 10)}:00`,
        pyramid,
        title,
        description: `${title} - fokus pa presisjon og konsistens`,
        duration,
        isPlanned,
        dailyAssignmentId: isPlanned ? `assignment-${id}` : undefined,
        drills,
        totalSets,
        totalReps,
        rating: 3 + Math.floor(Math.random() * 3),
        energyLevel: 3 + Math.floor(Math.random() * 3),
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      });

      id++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Apply search filter
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    return sessions.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    );
  }

  return sessions;
}

function computeStats(sessions: DagbokSession[]): DagbokStats {
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalReps = sessions.reduce((sum, s) => sum + s.totalReps, 0);
  const avgRating = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.filter(s => s.rating).length || 0
    : 0;
  const avgDuration = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;

  const byPyramid: Record<Pyramid, { sessions: number; minutes: number; reps: number }> = {
    FYS: { sessions: 0, minutes: 0, reps: 0 },
    TEK: { sessions: 0, minutes: 0, reps: 0 },
    SLAG: { sessions: 0, minutes: 0, reps: 0 },
    SPILL: { sessions: 0, minutes: 0, reps: 0 },
    TURN: { sessions: 0, minutes: 0, reps: 0 },
  };

  let plannedSessions = 0;
  let completedPlanned = 0;
  let freeSessions = 0;

  sessions.forEach(s => {
    byPyramid[s.pyramid].sessions++;
    byPyramid[s.pyramid].minutes += s.duration;
    byPyramid[s.pyramid].reps += s.totalReps;

    if (s.isPlanned) {
      plannedSessions++;
      completedPlanned++;
    } else {
      freeSessions++;
    }
  });

  // For now, assume planned = completed (would need assignment data for true compliance)
  const complianceRate = plannedSessions > 0
    ? Math.round((completedPlanned / plannedSessions) * 100)
    : 100;

  return {
    totalSessions,
    totalMinutes,
    totalReps,
    avgRating: Math.round(avgRating * 10) / 10,
    avgDuration,
    byPyramid,
    plannedSessions,
    completedPlanned,
    freeSessions,
    complianceRate,
  };
}

// =============================================================================
// HOOK
// =============================================================================

export function useDagbokSessions(state: DagbokState): UseDagbokSessionsResult {
  const [sessions, setSessions] = useState<DagbokSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  // Destructure state to individual values for stable dependencies
  const {
    rangeStart,
    rangeEnd,
    pyramid,
    area,
    lPhase,
    environment,
    pressure,
    csLevel,
    planType,
    searchQuery,
  } = state;

  // Convert dates to strings for stable comparison
  const startDateStr = rangeStart.toISOString().split('T')[0];
  const endDateStr = rangeEnd.toISOString().split('T')[0];

  // Build query params from state
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      startDate: startDateStr,
      endDate: endDateStr,
      includeDrills: 'true',
    };

    if (pyramid) params.pyramid = pyramid;
    if (area) params.area = area;
    if (lPhase) params.lPhase = lPhase;
    if (environment) params.environment = environment;
    if (pressure) params.pressure = pressure;
    if (csLevel !== null) params.csLevel = String(csLevel);
    if (planType !== 'all') params.planType = planType;
    if (searchQuery) params.search = searchQuery;

    return params;
  }, [
    startDateStr,
    endDateStr,
    pyramid,
    area,
    lPhase,
    environment,
    pressure,
    csLevel,
    planType,
    searchQuery,
  ]);

  // Create a stable state reference for mock data generation
  // This reconstructs minimal state from queryParams to avoid stale closures
  const mockState = useMemo<DagbokState>(() => ({
    pyramid: pyramid || null,
    area: area || null,
    lPhase: lPhase || null,
    environment: environment || null,
    pressure: pressure || null,
    csLevel: csLevel,
    position: null,
    tournamentType: null,
    physicalFocus: null,
    playFocus: null,
    puttingFocus: null,
    period: 'week' as const,
    anchorDate: new Date(rangeStart),
    rangeStart: new Date(rangeStart),
    rangeEnd: new Date(rangeEnd),
    weekNumber: 1,
    monthName: '',
    year: new Date(rangeStart).getFullYear(),
    planType: planType as 'all' | 'planned' | 'free',
    searchQuery: searchQuery || '',
  }), [pyramid, area, lPhase, environment, pressure, csLevel, rangeStart, rangeEnd, planType, searchQuery]);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await apiClient.get(`/sessions?${queryString}`);

        // Transform API response to DagbokSession format
        const apiSessions = response.data?.data || response.data || [];

        const transformed: DagbokSession[] = apiSessions.map((s: any) => ({
          id: s.id,
          date: s.date || s.sessionDate?.split('T')[0],
          startTime: s.startTime,
          endTime: s.endTime,
          pyramid: s.pyramid || s.category || 'TEK',
          area: s.area,
          lPhase: s.lPhase || s.learningPhase,
          environment: s.environment,
          pressure: s.pressure,
          csLevel: s.csLevel || s.clubSpeed,
          position: s.position,
          formula: s.formula,
          title: s.title || s.name || 'Treningsokt',
          description: s.description || s.notes,
          duration: s.duration || s.durationMinutes || 60,
          isPlanned: s.dailyAssignmentId != null,
          dailyAssignmentId: s.dailyAssignmentId,
          drills: (s.drills || s.exercises || []).map((d: any) => ({
            id: d.id,
            name: d.name || d.exerciseName,
            description: d.description,
            sets: d.sets,
            reps: d.reps,
            duration: d.duration,
            formula: d.formula,
            notes: d.notes,
          })),
          totalSets: s.totalSets || (s.drills || []).reduce((sum: number, d: any) => sum + (d.sets || 0), 0),
          totalReps: s.totalReps || (s.drills || []).reduce((sum: number, d: any) => sum + ((d.sets || 0) * (d.reps || 0)), 0),
          rating: s.rating,
          energyLevel: s.energyLevel,
          reflection: s.reflection || s.notes,
          coachFeedback: s.coachFeedback,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        }));

        setSessions(transformed);
      } catch (err: any) {
        console.warn('Failed to fetch sessions, using mock data:', err.message);
        setError(err.message);

        // Fall back to mock data using stable mockState
        const mockSessions = generateMockSessions(mockState);
        setSessions(mockSessions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [queryParams, fetchKey, mockState]);

  // Compute stats
  const stats = useMemo(() => computeStats(sessions), [sessions]);

  // Refetch function
  const refetch = useCallback(() => {
    setFetchKey(k => k + 1);
  }, []);

  return {
    sessions,
    stats,
    isLoading,
    error,
    refetch,
  };
}

export default useDagbokSessions;
