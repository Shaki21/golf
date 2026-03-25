/**
 * useUnifiedCalendar Hook
 *
 * Aggregates calendar events from multiple sources:
 * - Golf training sessions (teknikk, golfslag, spill)
 * - Physical training (fysisk)
 * - School schedule (skole, oppgaver)
 * - Tournaments (turnering)
 *
 * Normalizes all events to a unified format for display.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiGet } from '../../../data/apiClient';
import {
  UnifiedCalendarEvent,
  UnifiedEventSource,
  UseUnifiedCalendarOptions,
  UseUnifiedCalendarResult,
  UKEDAG_MAP,
  formatDateKey,
  getWeekdaysInRange,
} from '../types';

// ═══════════════════════════════════════════
// API Response Types
// ═══════════════════════════════════════════

interface ApiSession {
  id: string;
  title?: string;
  sessionType?: string;
  category?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  start?: string;
  end?: string;
  location?: string;
  notes?: string;
}

interface ApiFag {
  id: string;
  navn: string;
  larer?: string;
  rom?: string;
}

interface ApiSkoletime {
  id: string;
  fagId: string;
  ukedag: string;
  startTid: string;
  sluttTid: string;
  fag?: ApiFag;
}

interface ApiOppgave {
  id: string;
  fagId: string;
  tittel: string;
  beskrivelse?: string;
  frist: string;
  status: string;
  prioritet: string;
  fag?: ApiFag;
}

interface ApiSkoleplan {
  fag: ApiFag[];
  timer: ApiSkoletime[];
  oppgaver: ApiOppgave[];
}

interface ApiTrainingSession {
  id: string;
  sessionType: string;
  sessionDate: string;
  duration: number;
  intensity?: number;
  notes?: string;
  focusArea?: string;
}

interface ApiTournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  status?: string;
  format?: string;
}

interface ApiMyTournaments {
  upcoming: ApiTournament[];
  past: ApiTournament[];
}

// ═══════════════════════════════════════════
// Mappers
// ═══════════════════════════════════════════

function mapSessionTypeToSource(sessionType?: string, category?: string): UnifiedEventSource {
  const type = (sessionType || category || '').toLowerCase();

  switch (type) {
    case 'teknikk':
    case 'putting':
      return 'golf_teknikk';
    case 'golfslag':
    case 'range':
      return 'golf_slag';
    case 'spill':
    case 'course':
      return 'golf_spill';
    case 'fysisk':
    case 'physical':
    case 'gym':
    case 'cardio':
    case 'flexibility':
    case 'mobility':
    case 'threshold':
      return 'fysisk';
    default:
      return 'golf_teknikk'; // Default to teknikk
  }
}

function mapGolfSession(session: ApiSession): UnifiedCalendarEvent {
  const source = mapSessionTypeToSource(session.sessionType, session.category);
  const sourceLabels: Record<UnifiedEventSource, string> = {
    golf_teknikk: 'Teknikk',
    golf_slag: 'Golfslag',
    golf_spill: 'Spill',
    fysisk: 'Fysisk',
    skole: 'Skole',
    oppgave: 'Oppgave',
    turnering: 'Turnering',
  };

  return {
    id: `session-${session.id}`,
    title: session.title || `Golf – ${sourceLabels[source]}`,
    start: session.startTime || session.start || '09:00',
    end: session.endTime || session.end || '10:00',
    date: session.date,
    source,
    location: session.location,
    description: session.notes,
  };
}

function mapTrainingSession(session: ApiTrainingSession): UnifiedCalendarEvent {
  const source = mapSessionTypeToSource(session.sessionType);
  const date = session.sessionDate.split('T')[0];

  // Estimate time based on duration (default morning)
  const startHour = 7;
  const endHour = startHour + Math.ceil(session.duration / 60);
  const endMinutes = session.duration % 60;

  return {
    id: `training-${session.id}`,
    title: session.focusArea || `Fysisk trening`,
    start: `${String(startHour).padStart(2, '0')}:00`,
    end: `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
    date,
    source,
    description: session.notes,
  };
}

function mapSkoletimerToEvents(
  timer: ApiSkoletime[],
  rangeStart: Date,
  rangeEnd: Date
): UnifiedCalendarEvent[] {
  const events: UnifiedCalendarEvent[] = [];

  for (const time of timer) {
    const weekdayIndex = UKEDAG_MAP[time.ukedag.toLowerCase()];
    if (weekdayIndex === undefined) continue;

    const datesForWeekday = getWeekdaysInRange(rangeStart, rangeEnd, weekdayIndex);

    for (const date of datesForWeekday) {
      events.push({
        id: `skole-${time.id}-${formatDateKey(date)}`,
        title: time.fag?.navn || 'Skoletime',
        start: time.startTid,
        end: time.sluttTid,
        date: formatDateKey(date),
        source: 'skole',
        location: time.fag?.rom,
        description: time.fag?.larer ? `Lærer: ${time.fag.larer}` : undefined,
      });
    }
  }

  return events;
}

function mapOppgaveToEvent(oppgave: ApiOppgave): UnifiedCalendarEvent {
  return {
    id: `oppgave-${oppgave.id}`,
    title: oppgave.tittel,
    start: '23:59',
    end: '23:59',
    date: oppgave.frist,
    source: 'oppgave',
    description: oppgave.beskrivelse || (oppgave.fag ? `Fag: ${oppgave.fag.navn}` : undefined),
    isAllDay: true,
  };
}

function mapTournamentToEvent(tournament: ApiTournament): UnifiedCalendarEvent {
  const startDate = tournament.startDate.split('T')[0];

  return {
    id: `turnering-${tournament.id}`,
    title: tournament.name,
    start: '08:00',
    end: '18:00',
    date: startDate,
    source: 'turnering',
    location: tournament.location,
    description: tournament.format,
    isAllDay: true,
  };
}

// ═══════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════

export function useUnifiedCalendar(
  options: UseUnifiedCalendarOptions
): UseUnifiedCalendarResult {
  const { startDate, endDate, sources } = options;

  const [events, setEvents] = useState<UnifiedCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    const allEvents: UnifiedCalendarEvent[] = [];

    // Determine which sources to fetch
    const activeSources = sources || [
      'golf_teknikk',
      'golf_slag',
      'golf_spill',
      'fysisk',
      'skole',
      'oppgave',
      'turnering',
    ];

    const needsGolfSessions =
      activeSources.includes('golf_teknikk') ||
      activeSources.includes('golf_slag') ||
      activeSources.includes('golf_spill');
    const needsPhysicalSessions = activeSources.includes('fysisk');
    const needsSkoleplan =
      activeSources.includes('skole') || activeSources.includes('oppgave');
    const needsTournaments = activeSources.includes('turnering');

    try {
      // Fetch all data sources in parallel
      const promises: Promise<void>[] = [];

      // 1. Golf sessions (/sessions/my or /calendar/events)
      if (needsGolfSessions) {
        promises.push(
          apiGet<{ events?: ApiSession[] }>('/calendar/events', {
            startDate: startStr,
            endDate: endStr,
          })
            .then((response) => {
              const sessions = response.events || [];
              const golfSources = ['golf_teknikk', 'golf_slag', 'golf_spill'];
              for (const session of sessions) {
                const event = mapGolfSession(session);
                if (activeSources.includes(event.source)) {
                  allEvents.push(event);
                }
              }
            })
            .catch((err) => {
              console.warn('Failed to fetch golf sessions:', err);
            })
        );
      }

      // 2. Physical training sessions
      if (needsPhysicalSessions) {
        promises.push(
          apiGet<{ success: boolean; data: { sessions: ApiTrainingSession[] } }>(
            '/training/sessions',
            {
              startDate: startStr,
              endDate: endStr,
              limit: 100,
            }
          )
            .then((response) => {
              const sessions = response.data?.sessions || [];
              for (const session of sessions) {
                allEvents.push(mapTrainingSession(session));
              }
            })
            .catch((err) => {
              console.warn('Failed to fetch training sessions:', err);
            })
        );
      }

      // 3. School schedule
      if (needsSkoleplan) {
        promises.push(
          apiGet<ApiSkoleplan>('/skoleplan')
            .then((skoleplan) => {
              // Expand weekly classes to actual dates
              if (activeSources.includes('skole')) {
                const skoleEvents = mapSkoletimerToEvents(
                  skoleplan.timer || [],
                  startDate,
                  endDate
                );
                allEvents.push(...skoleEvents);
              }

              // Add assignments (filter by date range)
              if (activeSources.includes('oppgave')) {
                const oppgaver = (skoleplan.oppgaver || []).filter((o) => {
                  const fristDate = new Date(o.frist);
                  return fristDate >= startDate && fristDate <= endDate;
                });
                for (const oppgave of oppgaver) {
                  allEvents.push(mapOppgaveToEvent(oppgave));
                }
              }
            })
            .catch((err) => {
              console.warn('Failed to fetch skoleplan:', err);
            })
        );
      }

      // 4. Tournaments
      if (needsTournaments) {
        promises.push(
          apiGet<ApiMyTournaments>('/calendar/my-tournaments')
            .then((tournaments) => {
              const upcoming = tournaments.upcoming || [];
              for (const tournament of upcoming) {
                const tournamentDate = new Date(tournament.startDate);
                if (tournamentDate >= startDate && tournamentDate <= endDate) {
                  allEvents.push(mapTournamentToEvent(tournament));
                }
              }
            })
            .catch((err) => {
              console.warn('Failed to fetch tournaments:', err);
            })
        );
      }

      await Promise.all(promises);

      // Sort events by date and time
      allEvents.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.start.localeCompare(b.start);
      });

      setEvents(allEvents);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste kalender';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, sources]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, UnifiedCalendarEvent[]> = {};
    for (const event of events) {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    }
    return grouped;
  }, [events]);

  // Count events by source
  const eventCountBySource = useMemo(() => {
    const counts: Record<UnifiedEventSource, number> = {
      golf_teknikk: 0,
      golf_slag: 0,
      golf_spill: 0,
      fysisk: 0,
      skole: 0,
      oppgave: 0,
      turnering: 0,
    };
    for (const event of events) {
      counts[event.source]++;
    }
    return counts;
  }, [events]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchData,
    eventsByDate,
    eventCountBySource,
  };
}

export default useUnifiedCalendar;
