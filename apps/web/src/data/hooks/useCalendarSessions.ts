/**
 * useCalendarSessions Hook
 * Fetches calendar sessions for a week
 * Maps to CalendarTemplate component
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../apiClient';
import type { HookResult, CalendarSession, CalendarData } from '../types';

// ═══════════════════════════════════════════
// FALLBACK DATA
// ═══════════════════════════════════════════

function getFallbackSessions(selectedDate: Date): CalendarSession[] {
  const dateStr = selectedDate.toISOString().split('T')[0];
  return [
    { id: '1', title: 'Putting-trening', start: '09:00', end: '10:30', date: dateStr, meta: 'training' },
    { id: '2', title: 'Driving range', start: '14:00', end: '15:30', date: dateStr, meta: 'training' },
  ];
}

// ═══════════════════════════════════════════
// MAPPER
// ═══════════════════════════════════════════

interface ApiCalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  type?: string;
  sessionType?: string;
}

function mapApiToCalendarSessions(events: ApiCalendarEvent[]): CalendarSession[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    date: event.date,
    meta: event.type || event.sessionType || 'training',
  }));
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useCalendarSessions(selectedDate: Date): HookResult<CalendarData> {
  const [data, setData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate week start/end for API request
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = getWeekEnd(selectedDate);

      const response = await apiGet<{ events: ApiCalendarEvent[] }>('/calendar/events', {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
      });

      const sessions = mapApiToCalendarSessions(response.events || []);
      setData({ sessions });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste kalender';
      setError(message);
      // Use fallback data on error
      setData({ sessions: getFallbackSessions(selectedDate) });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday is first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default useCalendarSessions;
