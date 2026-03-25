/**
 * useCalendarEvents Hook
 *
 * Fetches calendar events for a date range.
 * Falls back to deterministic seed data when:
 * - Backend returns zero events
 * - Dev mode is enabled
 * - API request fails
 *
 * Seed data is stable based on anchor date.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiGet } from '../../../data/apiClient';

export type EventStatus = 'recommended' | 'planned' | 'in_progress' | 'completed' | 'ghost' | 'external';
export type EventCategory = 'training' | 'mental' | 'testing' | 'tournament' | 'putting' | 'range' | 'mobility' | 'threshold';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  status: EventStatus;
  category?: EventCategory;
  location?: string;
  duration?: number; // minutes
  isAllDay?: boolean;
  weeklyFocus?: string; // For recommended sessions
  badges?: string[];
  description?: string; // Session description for hover preview
  focusAreas?: string[]; // Focus areas for hover preview
}

export interface UseCalendarEventsResult {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isSeedData: boolean;
}

// ═══════════════════════════════════════════
// DETERMINISTIC SEED DATA
// Generates stable events based on anchor date
// ═══════════════════════════════════════════

function formatDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function generateSeedEvents(rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Find the week containing the range start
  const weekStart = getWeekStart(rangeStart);

  // Generate events for each week in the range
  let currentWeekStart = new Date(weekStart);

  while (currentWeekStart <= rangeEnd) {
    const weekEvents = generateWeekSeedEvents(currentWeekStart);
    events.push(...weekEvents);
    currentWeekStart = addDays(currentWeekStart, 7);
  }

  // Filter to only include events within the requested range
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= rangeStart && eventDate <= rangeEnd;
  });
}

function generateWeekSeedEvents(weekStart: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Use week number as seed for deterministic variety
  const weekNumber = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();

  // Tuesday (day 1) - Recommended training session
  const tuesday = addDays(weekStart, 1);
  events.push({
    id: `seed-${year}-w${weekNumber}-recommended`,
    title: 'Putting – 100 putts',
    start: '07:00',
    end: '07:45',
    date: formatDateStr(tuesday),
    status: 'recommended',
    category: 'putting',
    duration: 45,
    weeklyFocus: 'Kortsteg fokus',
    badges: ['Anbefalt'],
  });

  // Tuesday evening - Mental session
  events.push({
    id: `seed-${year}-w${weekNumber}-mental`,
    title: 'Mental – Visualisering',
    start: '18:00',
    end: '18:30',
    date: formatDateStr(tuesday),
    status: 'planned',
    category: 'mental',
    duration: 30,
    badges: ['Planlagt', 'Mental'],
  });

  // Thursday (day 3) - Two overlapping sessions
  const thursday = addDays(weekStart, 3);
  events.push({
    id: `seed-${year}-w${weekNumber}-range`,
    title: 'Range – Wedge PEI',
    start: '16:00',
    end: '17:00',
    date: formatDateStr(thursday),
    status: 'planned',
    category: 'range',
    duration: 60,
    location: 'Driving range',
    badges: ['Planlagt'],
  });

  // Overlapping session (starts 30 min after range)
  events.push({
    id: `seed-${year}-w${weekNumber}-mobility`,
    title: 'Mobilitet – Hofter',
    start: '16:30',
    end: '17:00',
    date: formatDateStr(thursday),
    status: 'planned',
    category: 'mobility',
    duration: 30,
    badges: ['Planlagt'],
  });

  // Friday (day 4) - Testing session
  const friday = addDays(weekStart, 4);
  events.push({
    id: `seed-${year}-w${weekNumber}-testing`,
    title: 'Testing – Kategoritest Q1',
    start: '12:00',
    end: '12:30',
    date: formatDateStr(friday),
    status: 'planned',
    category: 'testing',
    duration: 30,
    badges: ['Testing'],
  });

  // All-day threshold session (represented as early-morning block)
  const wednesday = addDays(weekStart, 2);
  events.push({
    id: `seed-${year}-w${weekNumber}-threshold`,
    title: 'Terskel 3x9 min',
    start: '06:00',
    end: '06:45',
    date: formatDateStr(wednesday),
    status: 'planned',
    category: 'threshold',
    duration: 45,
    badges: ['Planlagt', 'Terskel'],
  });

  // Add a completed session for variety
  const monday = weekStart;
  events.push({
    id: `seed-${year}-w${weekNumber}-completed`,
    title: 'Oppmøte – Fellestrening',
    start: '10:00',
    end: '11:30',
    date: formatDateStr(monday),
    status: 'completed',
    category: 'training',
    duration: 90,
    location: 'TIER Golf',
    badges: ['Fullført'],
  });

  return events;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ═══════════════════════════════════════════
// API MAPPER
// ═══════════════════════════════════════════

interface ApiCalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  type?: string;
  sessionType?: string;
  status?: string;
  location?: string;
}

function mapApiToCalendarEvents(apiEvents: ApiCalendarEvent[]): CalendarEvent[] {
  return apiEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    date: event.date,
    status: mapApiStatus(event.status),
    category: mapApiCategory(event.type || event.sessionType),
    location: event.location,
    duration: calculateDuration(event.startTime, event.endTime),
  }));
}

function mapApiStatus(status?: string): EventStatus {
  switch (status) {
    case 'recommended': return 'recommended';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'ghost': return 'ghost';
    case 'external': return 'external';
    default: return 'planned';
  }
}

function mapApiCategory(category?: string): EventCategory | undefined {
  const categoryMap: Record<string, EventCategory> = {
    training: 'training',
    mental: 'mental',
    testing: 'testing',
    tournament: 'tournament',
    putting: 'putting',
    range: 'range',
    mobility: 'mobility',
    threshold: 'threshold',
    teknikk: 'training',
    golfslag: 'training',
    spill: 'training',
    fysisk: 'training',
  };
  return category ? categoryMap[category.toLowerCase()] : undefined;
}

function calculateDuration(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

const IS_DEV = process.env.NODE_ENV === 'development';

export function useCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date
): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeedData, setIsSeedData] = useState(false);

  // Memoize date strings to prevent infinite re-fetching
  // (Date objects create new references on each render)
  const startDateStr = useMemo(() => formatDateStr(rangeStart), [rangeStart.getTime()]);
  const endDateStr = useMemo(() => formatDateStr(rangeEnd), [rangeEnd.getTime()]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Create date objects from the string keys to avoid dependency on rangeStart/rangeEnd objects
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    try {
      const response = await apiGet<{ events: ApiCalendarEvent[] }>('/calendar/events', {
        startDate: startDateStr,
        endDate: endDateStr,
      });

      const apiEvents = mapApiToCalendarEvents(response.events || []);

      // If API returns empty OR we're in dev mode with empty data, use seed data
      if (apiEvents.length === 0 || IS_DEV) {
        const seedEvents = generateSeedEvents(start, end);
        // In dev mode, merge API events with seed events (API takes precedence)
        if (IS_DEV && apiEvents.length > 0) {
          setEvents(apiEvents);
          setIsSeedData(false);
        } else {
          setEvents(seedEvents);
          setIsSeedData(true);
        }
      } else {
        setEvents(apiEvents);
        setIsSeedData(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste kalender';
      setError(message);

      // Fall back to seed data on error
      const seedEvents = generateSeedEvents(start, end);
      setEvents(seedEvents);
      setIsSeedData(true);
    } finally {
      setIsLoading(false);
    }
    // Note: rangeStart/rangeEnd are intentionally excluded - using string keys for stable deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort events by date and start time for stable ordering
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start.localeCompare(b.start);
    });
  }, [events]);

  return {
    events: sortedEvents,
    isLoading,
    error,
    refetch: fetchData,
    isSeedData,
  };
}

export default useCalendarEvents;
