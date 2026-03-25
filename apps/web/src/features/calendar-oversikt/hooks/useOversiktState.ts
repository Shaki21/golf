/**
 * useOversiktState Hook
 *
 * URL-based state management for the calendar overview.
 * URL is the single source of truth:
 *   /kalender/oversikt?view=day&date=YYYY-MM-DD
 *   /kalender/oversikt?view=week&date=YYYY-MM-DD
 *   /kalender/oversikt?view=month&date=YYYY-MM-DD
 *
 * Simplified from useCalendarState - no year view, read-only.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { OversiktView, UseOversiktStateResult } from '../types';

const VIEW_LABELS: Record<OversiktView, string> = {
  day: 'DAG',
  week: 'UKE',
  month: 'MÅNED',
};

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'Mars',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0];
}

function parseDateParam(dateStr: string | null): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseViewParam(viewStr: string | null): OversiktView {
  if (viewStr && ['day', 'week', 'month'].includes(viewStr)) {
    return viewStr as OversiktView;
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

export function useOversiktState(): UseOversiktStateResult & { viewLabels: typeof VIEW_LABELS } {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL params
  const view = parseViewParam(searchParams.get('view'));
  const anchorDate = parseDateParam(searchParams.get('date'));

  // Computed values
  const state = useMemo(() => {
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
  const updateUrl = useCallback(
    (newView: OversiktView, newDate: Date) => {
      const params = new URLSearchParams();
      params.set('view', newView);
      params.set('date', formatDateParam(newDate));
      navigate(`/kalender/oversikt?${params.toString()}`, { replace: true });
    },
    [navigate]
  );

  const setView = useCallback(
    (newView: OversiktView) => {
      updateUrl(newView, anchorDate);
    },
    [updateUrl, anchorDate]
  );

  const setDate = useCallback(
    (newDate: Date) => {
      updateUrl(view, newDate);
    },
    [updateUrl, view]
  );

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
    }
    updateUrl(view, newDate);
  }, [updateUrl, view, anchorDate]);

  return {
    ...state,
    setView,
    setDate,
    goToToday,
    goToNext,
    goToPrev,
    viewLabels: VIEW_LABELS,
  };
}

export default useOversiktState;
