/**
 * Kalender Oversikt - Types
 *
 * Unified calendar overview types for displaying events from multiple sources:
 * - Golf training (teknikk, golfslag, spill)
 * - Physical training (fysisk)
 * - School schedule (skole, oppgaver)
 * - Tournaments (turnering)
 */

// Event source types
export type UnifiedEventSource =
  | 'golf_teknikk'
  | 'golf_slag'
  | 'golf_spill'
  | 'fysisk'
  | 'skole'
  | 'oppgave'
  | 'turnering';

// View types
export type OversiktView = 'day' | 'week' | 'month';

// Unified calendar event interface
export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  source: UnifiedEventSource;
  location?: string;
  description?: string;
  isAllDay?: boolean;
}

// Color configuration for each event source
export interface EventSourceColors {
  bg: string;
  border: string;
  text: string;
  label: string;
}

// Color mapping using semantic CSS tokens
export const EVENT_SOURCE_COLORS: Record<UnifiedEventSource, EventSourceColors> = {
  golf_teknikk: {
    bg: 'var(--category-tek-muted)',
    border: 'var(--category-tek)',
    text: 'var(--category-tek)',
    label: 'Technique',
  },
  golf_slag: {
    bg: 'var(--category-slag-muted)',
    border: 'var(--category-slag)',
    text: 'var(--category-slag)',
    label: 'Golf shots',
  },
  golf_spill: {
    bg: 'var(--category-spill-muted)',
    border: 'var(--category-spill)',
    text: 'var(--category-spill)',
    label: 'Play',
  },
  fysisk: {
    bg: 'var(--category-fys-muted)',
    border: 'var(--category-fys)',
    text: 'var(--category-fys)',
    label: 'Physical',
  },
  skole: {
    bg: 'rgba(var(--category-j), 0.1)',
    border: 'rgb(var(--category-j))',
    text: 'rgb(var(--category-j))',
    label: 'School',
  },
  oppgave: {
    bg: 'var(--warning-muted)',
    border: 'var(--warning)',
    text: 'var(--warning)',
    label: 'Task',
  },
  turnering: {
    bg: 'var(--category-turn-muted)',
    border: 'var(--category-turn)',
    text: 'var(--category-turn)',
    label: 'Tournament',
  },
};

// Weekday mapping for school schedule expansion
export const UKEDAG_MAP: Record<string, number> = {
  mandag: 1,
  tirsdag: 2,
  onsdag: 3,
  torsdag: 4,
  fredag: 5,
  lordag: 6,
  sondag: 0,
};

// Hook options interface
export interface UseUnifiedCalendarOptions {
  startDate: Date;
  endDate: Date;
  sources?: UnifiedEventSource[];
}

// Hook result interface
export interface UseUnifiedCalendarResult {
  events: UnifiedCalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  eventsByDate: Record<string, UnifiedCalendarEvent[]>;
  eventCountBySource: Record<UnifiedEventSource, number>;
}

// State hook interface
export interface UseOversiktStateResult {
  view: OversiktView;
  anchorDate: Date;
  rangeStart: Date;
  rangeEnd: Date;
  weekNumber: number;
  weekDates: Date[];
  monthName: string;
  year: number;
  setView: (view: OversiktView) => void;
  setDate: (date: Date) => void;
  goToToday: () => void;
  goToNext: () => void;
  goToPrev: () => void;
}

// Component props interfaces
export interface EventLegendProps {
  compact?: boolean;
  className?: string;
  sources?: UnifiedEventSource[];
}

export interface OversiktHeaderProps {
  view: OversiktView;
  anchorDate: Date;
  weekNumber?: number;
  monthName?: string;
  year?: number;
  onViewChange: (view: OversiktView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export interface OversiktWeekViewProps {
  weekDates: Date[];
  events: UnifiedCalendarEvent[];
  onEventClick?: (event: UnifiedCalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export interface OversiktMonthViewProps {
  anchorDate: Date;
  events: UnifiedCalendarEvent[];
  onEventClick?: (event: UnifiedCalendarEvent) => void;
  onDayClick?: (date: Date) => void;
}

export interface OversiktDayViewProps {
  date: Date;
  events: UnifiedCalendarEvent[];
  onEventClick?: (event: UnifiedCalendarEvent) => void;
}

export interface CalendarOversiktWidgetProps {
  onDayClick?: (date: Date) => void;
  className?: string;
}

// Utility function to get colors for an event source
export function getEventSourceColors(source: UnifiedEventSource): EventSourceColors {
  return EVENT_SOURCE_COLORS[source];
}

// Utility function to format date as YYYY-MM-DD
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Utility function to parse time string to minutes
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Utility function to get all dates for a specific weekday in a range
export function getWeekdaysInRange(
  startDate: Date,
  endDate: Date,
  weekday: number
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  // Move to first occurrence of weekday
  while (current.getDay() !== weekday) {
    current.setDate(current.getDate() + 1);
  }

  // Collect all occurrences
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

// Utility function to check if date is in range
export function isDateInRange(date: Date | string, start: Date, end: Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= start && d <= end;
}
