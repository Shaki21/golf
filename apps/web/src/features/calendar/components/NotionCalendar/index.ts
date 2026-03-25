/**
 * NotionCalendar - Full Notion Calendar replica
 *
 * Export all components for the Notion-style calendar
 */

export { default as NotionCalendar } from './NotionCalendar';
export { default as MiniCalendar } from './MiniCalendar';
export { default as CalendarList } from './CalendarList';
export { default as NotionWeekGrid } from './NotionWeekGrid';
export { default as NotionDayGrid } from './NotionDayGrid';
export { default as NotionMonthGrid } from './NotionMonthGrid';

// Export types from types.ts
export type {
  CalendarSource,
  CalendarColorKey,
  ViewType,
} from './types';

export { CALENDAR_COLORS } from './types';
