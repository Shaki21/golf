/**
 * useCalendarState Hook
 *
 * URL-based state management for the calendar.
 * URL is the single source of truth:
 *   /kalender?view=day&date=YYYY-MM-DD
 *   /kalender?view=week&date=YYYY-MM-DD
 *   /kalender?view=month&date=YYYY-MM-DD
 *   /kalender?view=year&date=YYYY-MM-DD
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export type CalendarView = 'day' | 'week' | 'month' | 'year';

export interface CalendarState {
  view: CalendarView;
  anchorDate: Date;
  // Computed ranges for data fetching
  rangeStart: Date;
  rangeEnd: Date;
  // Week-specific
  weekNumber: number;
  weekDates: Date[];
  // Month-specific
  monthName: string;
  year: number;
}

export interface CalendarActions {
  setView: (view: CalendarView) => void;
  setDate: (date: Date) => void;
  goToToday: () => void;
  goToNext: () => void;
  goToPrev: () => void;
  goToMonth: (monthIndex: number) => void;
}

const VIEW_LABELS: Record<CalendarView, string> = {
  day: 'DAG',
  week: 'UKE',
  month: 'MÅNED',
  year: 'ÅR',
};

const MONTH_NAMES = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDateParam(dateStr: string | null): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseViewParam(viewStr: string | null): CalendarView {
  if (viewStr && ['day', 'week', 'month', 'year'].includes(viewStr)) {
    return viewStr as CalendarView;
  }
  return 'week'; // Default view
}

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

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekDates(date: Date): Date[] {
  const dates: Date[] = [];
  const monday = getWeekStart(date);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getYearStart(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function getYearEnd(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function useCalendarState(): CalendarState & CalendarActions & { viewLabels: typeof VIEW_LABELS } {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL params
  const view = parseViewParam(searchParams.get('view'));
  const anchorDate = parseDateParam(searchParams.get('date'));

  // Computed values
  const state = useMemo<CalendarState>(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    switch (view) {
      case 'day':
        rangeStart = new Date(anchorDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(anchorDate);
        rangeEnd.setHours(23, 59, 59, 999);
        break;
      case 'week':
        rangeStart = getWeekStart(anchorDate);
        rangeEnd = getWeekEnd(anchorDate);
        break;
      case 'month':
        rangeStart = getMonthStart(anchorDate);
        rangeEnd = getMonthEnd(anchorDate);
        break;
      case 'year':
        rangeStart = getYearStart(anchorDate);
        rangeEnd = getYearEnd(anchorDate);
        break;
      default:
        rangeStart = getWeekStart(anchorDate);
        rangeEnd = getWeekEnd(anchorDate);
    }

    return {
      view,
      anchorDate,
      rangeStart,
      rangeEnd,
      weekNumber: getWeekNumber(anchorDate),
      weekDates: getWeekDates(anchorDate),
      monthName: MONTH_NAMES[anchorDate.getMonth()],
      year: anchorDate.getFullYear(),
    };
  }, [view, anchorDate]);

  // Actions
  const updateUrl = useCallback((newView: CalendarView, newDate: Date) => {
    const params = new URLSearchParams();
    params.set('view', newView);
    params.set('date', formatDateParam(newDate));
    navigate(`/kalender?${params.toString()}`, { replace: true });
  }, [navigate]);

  const setView = useCallback((newView: CalendarView) => {
    updateUrl(newView, anchorDate);
  }, [updateUrl, anchorDate]);

  const setDate = useCallback((newDate: Date) => {
    updateUrl(view, newDate);
  }, [updateUrl, view]);

  const goToToday = useCallback(() => {
    updateUrl(view, new Date());
  }, [updateUrl, view]);

  const goToNext = useCallback(() => {
    const newDate = new Date(anchorDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    updateUrl(view, newDate);
  }, [updateUrl, view, anchorDate]);

  const goToPrev = useCallback(() => {
    const newDate = new Date(anchorDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    updateUrl(view, newDate);
  }, [updateUrl, view, anchorDate]);

  const goToMonth = useCallback((monthIndex: number) => {
    const newDate = new Date(anchorDate.getFullYear(), monthIndex, 1);
    updateUrl('month', newDate);
  }, [updateUrl, anchorDate]);

  return {
    ...state,
    setView,
    setDate,
    goToToday,
    goToNext,
    goToPrev,
    goToMonth,
    viewLabels: VIEW_LABELS,
  };
}

export default useCalendarState;
