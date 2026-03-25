/**
 * Day View Module - Decision Engine Execution Surface
 *
 * This Day View is subordinate to "Alt B: Decision Engine".
 * It is an EXECUTION surface, not a planning calendar.
 *
 * Components:
 * - DayViewExecution: Main container component
 * - DecisionAnchor: Sticky header with today's decision
 * - TimeGrid: Vertical hour grid with events
 * - EventCard: Individual event display
 * - EventDetailPanel: Side panel (desktop) / bottom sheet (mobile)
 *
 * State Machine:
 * - S0: Default state
 * - S1: Recommended workout scheduled
 * - S2: Recommended workout not scheduled (ghost slot)
 * - S3: No recommendation (fallback)
 * - S4: Hard collision detected
 * - S5: Workout in progress
 * - S6: Workout completed
 */

// Main component
export { DayViewExecution, DayViewExecution as default } from './DayViewExecution';

// Sub-components
export { DecisionAnchor } from './DecisionAnchor';
export { TimeGrid } from './TimeGrid';
export { EventCard } from './EventCard';
export { EventDetailPanel } from './EventDetailPanel';

// Modals
export { WorkoutSelectorModal } from './WorkoutSelectorModal';
export { TimePickerModal } from './TimePickerModal';
export { WorkoutContentViewer } from './WorkoutContentViewer';

// State management
export { useDayViewState } from './useDayViewState';

// Types
export type {
  DayViewState,
  DayViewProps,
  Workout,
  WorkoutCategory,
  WorkoutStatus,
  ExternalEvent,
  CalendarEvent,
  EventType,
  CollisionType,
  WeeklyFocus,
  DecisionAnchorData,
  DecisionAnchorProps,
  TimeGridProps,
  EventCardProps,
  EventDetailPanelProps,
  RescheduleOption,
  ShortenOption,
  WorkoutStartEvent,
  WorkoutRescheduleEvent,
  WorkoutModifyEvent,
  WorkoutCompleteEvent,
} from './types';
