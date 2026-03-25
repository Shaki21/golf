// Main components
export { CalendarOversiktPage } from './CalendarOversiktPage';
export { CalendarOversiktWidget } from './CalendarOversiktWidget';

// Hooks
export { useUnifiedCalendar } from './hooks/useUnifiedCalendar';
export { useOversiktState } from './hooks/useOversiktState';

// UI Components
export {
  EventLegend,
  OversiktHeader,
  OversiktWeekView,
  OversiktMonthView,
  OversiktDayView,
} from './components';

// Types
export type {
  UnifiedEventSource,
  OversiktView,
  UnifiedCalendarEvent,
  EventSourceColors,
  UseUnifiedCalendarOptions,
  UseUnifiedCalendarResult,
  UseOversiktStateResult,
  EventLegendProps,
  OversiktHeaderProps,
  OversiktWeekViewProps,
  OversiktMonthViewProps,
  OversiktDayViewProps,
  CalendarOversiktWidgetProps,
} from './types';

export {
  EVENT_SOURCE_COLORS,
  UKEDAG_MAP,
  getEventSourceColors,
  formatDateKey,
  timeToMinutes,
  getWeekdaysInRange,
  isDateInRange,
} from './types';
