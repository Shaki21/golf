/**
 * Hook for fetching HOME screen data
 *
 * Fetches:
 * - Next session from training plan
 * - Time context (days until benchmark/event)
 * - Effort accumulation stats
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface NextSession {
  id: string;
  trainingArea: string;
  name: string;
  time: string;
  location: string;
  durationMinutes: number;
  date: Date;
  inProgress?: boolean;
  currentBlock?: number;
  totalBlocks?: number;
}

interface TimeContext {
  daysUntilBenchmark?: number;
  daysUntilEvent?: number;
  eventName?: string;
}

interface EffortData {
  totalHours: number;
  totalSessions: number;
  byArea: { area: string; hours: number }[];
  isFirstBenchmark: boolean;
}

interface HomeData {
  nextSession?: NextSession;
  timeContext: TimeContext;
  effort: EffortData;
}

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [todayPlan, upcomingEvents, effortStats] = await Promise.all([
        api.trainingPlan.getToday().catch(() => null),
        api.calendar.getUpcoming().catch(() => ({ events: [] })),
        api.player.getEffortStats().catch(() => null),
      ]);

      // Transform today's training plan to next session format
      let nextSession: NextSession | undefined;
      if (todayPlan?.session) {
        const session = todayPlan.session;
        nextSession = {
          id: session.id,
          trainingArea: session.category || session.trainingArea || 'Trening',
          name: session.name || session.title || 'Økt',
          time: session.startTime || session.time || '--:--',
          location: session.location || 'Ikke angitt',
          durationMinutes: session.duration || session.durationMinutes || 60,
          date: new Date(session.date || new Date()),
          inProgress: session.status === 'in_progress',
          currentBlock: session.currentBlock,
          totalBlocks: session.blocks?.length || session.totalBlocks,
        };
      }

      // Calculate time context from upcoming events
      const timeContext: TimeContext = {};
      if (upcomingEvents?.events?.length > 0) {
        const now = new Date();

        // Find next benchmark/test
        const nextBenchmark = upcomingEvents.events.find(
          (e: any) => e.type === 'benchmark' || e.type === 'test'
        );
        if (nextBenchmark) {
          const benchmarkDate = new Date(nextBenchmark.date);
          timeContext.daysUntilBenchmark = Math.ceil(
            (benchmarkDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        // Find next tournament/event
        const nextEvent = upcomingEvents.events.find(
          (e: any) => e.type === 'tournament' || e.type === 'competition'
        );
        if (nextEvent) {
          const eventDate = new Date(nextEvent.date);
          timeContext.daysUntilEvent = Math.ceil(
            (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          timeContext.eventName = nextEvent.name || 'Turnering';
        }
      }

      // Transform effort stats
      const effort: EffortData = {
        totalHours: effortStats?.totalHours || 0,
        totalSessions: effortStats?.totalSessions || 0,
        byArea: effortStats?.byArea || [],
        isFirstBenchmark: effortStats?.isFirstBenchmark ?? true,
      };

      setData({ nextSession, timeContext, effort });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch home data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

export default useHomeData;
