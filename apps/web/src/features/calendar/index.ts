/**
 * Calendar Feature
 *
 * Exports all calendar components and pages.
 */

// Pages
export { default as PlayerCalendarPage } from './PlayerCalendarPage';
export { default as CoachCalendarPage } from './CoachCalendarPage';

// Enhanced Components
export {
  CalendarMiniMonth,
  CalendarMonthGrid,
  CalendarWeekGrid,
  CalendarHeader,
} from './components/enhanced';

// Types
export type { CalendarEvent, CalendarView } from './components/enhanced';

// Hooks
export { useCalendarEvents } from './hooks/useCalendarEvents';
export { useCalendarState } from './hooks/useCalendarState';
