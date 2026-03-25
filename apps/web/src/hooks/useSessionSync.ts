import { useState, useCallback } from 'react';
import { sessionsAPI } from '../services/api';
import { toast } from 'sonner';

interface WeekSession {
  day: string;
  type: string;
  duration: number;
  focus: string;
  completed?: boolean;
}

interface WeekPlan {
  week: number;
  periodId?: string;
  theme?: string;
  sessions: WeekSession[];
}

interface Period {
  id: string;
  name: string;
  phase: string;
  startDate: string;
  endDate: string;
  status?: 'active' | 'upcoming' | 'completed';
  weeklyHours?: {
    technical: number;
    physical: number;
    mental: number;
  };
}

interface UseSessionSyncOptions {
  onSyncComplete?: (syncedCount: number) => void;
  onSyncError?: (error: Error) => void;
}

// Map session type from period plan to API session type
const mapSessionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'Styrke': 'fysisk',
    'Simulator': 'teknikk',
    'Teknikk': 'teknikk',
    'Mental': 'mental',
    'Hvile': 'hvile',
    'Banespill': 'spill',
    'Short game': 'teknikk',
  };
  return typeMap[type] || 'teknikk';
};

// Map category based on session type
const mapCategory = (type: string): string => {
  const categoryMap: Record<string, string> = {
    'Styrke': 'FYS',
    'Simulator': 'TEK',
    'Teknikk': 'TEK',
    'Mental': 'SPILL',
    'Banespill': 'SPILL',
    'Short game': 'SLAG',
  };
  return categoryMap[type] || 'TEK';
};

// Get day offset from day name
const getDayOffset = (dayName: string): number => {
  const days: Record<string, number> = {
    'Mandag': 0,
    'Tirsdag': 1,
    'Onsdag': 2,
    'Torsdag': 3,
    'Fredag': 4,
    'Lordag': 5,
    'Lørdag': 5,
    'Sondag': 6,
    'Søndag': 6,
  };
  return days[dayName] ?? 0;
};

// Get start of current week (Monday)
const getWeekStart = (weekOffset: number = 0): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  monday.setDate(monday.getDate() + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export function useSessionSync(options?: UseSessionSyncOptions) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const syncWeekPlan = useCallback(async (
    weekPlan: WeekPlan,
    activePeriod?: Period
  ): Promise<number> => {
    const weekStart = getWeekStart(0); // Current week
    let syncedCount = 0;

    for (const session of weekPlan.sessions) {
      // Skip rest days
      if (session.type === 'Hvile' || session.duration === 0) {
        continue;
      }

      // Calculate session date
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(sessionDate.getDate() + getDayOffset(session.day));
      sessionDate.setHours(9, 0, 0, 0); // Default to 9 AM

      // Prepare session data
      const sessionData = {
        title: `${session.type}: ${session.focus}`,
        sessionDate: sessionDate.toISOString(),
        sessionType: mapSessionType(session.type),
        category: mapCategory(session.type),
        plannedDuration: session.duration,
        status: session.completed ? 'completed' : 'scheduled',
        notes: weekPlan.theme ? `Uketema: ${weekPlan.theme}` : undefined,
        source: 'period-plan',
        metadata: {
          periodId: activePeriod?.id,
          periodName: activePeriod?.name,
          weekNumber: weekPlan.week,
        },
      };

      try {
        await sessionsAPI.create(sessionData);
        syncedCount++;
      } catch (error) {
        // Log but continue with other sessions
        console.warn(`Failed to sync session: ${session.day} - ${session.type}`, error);
      }
    }

    return syncedCount;
  }, []);

  const syncPeriodSessions = useCallback(async (
    periods: Period[],
    weekPlan: WeekPlan
  ) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const activePeriod = periods.find(p => p.status === 'active');

      // Sync current week plan
      const syncedCount = await syncWeekPlan(weekPlan, activePeriod);

      if (syncedCount > 0) {
        toast.success(`${syncedCount} økter synkronisert til økt-oversikten!`);
        options?.onSyncComplete?.(syncedCount);
      } else {
        toast.info('Ingen nye økter å synkronisere');
      }

      return syncedCount;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Synkronisering feilet');
      setSyncError(err);
      toast.error(`Synkronisering feilet: ${err.message}`);
      options?.onSyncError?.(err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [syncWeekPlan, options]);

  return {
    syncPeriodSessions,
    syncWeekPlan,
    isSyncing,
    syncError,
  };
}

export default useSessionSync;
