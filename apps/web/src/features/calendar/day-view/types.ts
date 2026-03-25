/**
 * Day View Types - Decision Engine Execution Surface
 *
 * This Day View is subordinate to "Alt B: Decision Engine".
 * It is an EXECUTION surface, not a planning calendar.
 */

// ─────────────────────────────────────────────────────────────
// STATE MACHINE (S0-S6)
// ─────────────────────────────────────────────────────────────

export type DayViewState =
  | 'S0_DEFAULT'           // Default state, no event selected
  | 'S1_SCHEDULED'         // Recommended workout is scheduled
  | 'S2_UNSCHEDULED'       // Recommended workout exists but not scheduled (ghost slot)
  | 'S3_NO_RECOMMENDATION' // No recommendation available (fallback)
  | 'S4_COLLISION'         // Hard collision detected
  | 'S5_IN_PROGRESS'       // Workout in progress
  | 'S6_COMPLETED';        // Workout completed

// ─────────────────────────────────────────────────────────────
// WORKOUT TYPES
// ─────────────────────────────────────────────────────────────

export type WorkoutCategory =
  | 'teknikk'
  | 'golfslag'
  | 'spill'
  | 'konkurranse'
  | 'fysisk'
  | 'mental';

export type WorkoutStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type EventType =
  | 'ak_workout'     // TIER Golf training session
  | 'external';      // External calendar event

export type CollisionType =
  | 'hard'   // meetings, travel, tournaments - must be surfaced
  | 'soft';  // personal events - can be overridden

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  duration: number; // minutes
  scheduledTime?: string; // HH:mm format
  scheduledDate?: string; // YYYY-MM-DD
  status: WorkoutStatus;
  isRecommended: boolean;
  isAllDay: boolean;
  location?: string;
  description?: string;
  exercises?: WorkoutExercise[];
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

export interface WorkoutExercise {
  id: string;
  name: string;
  duration?: number;
  reps?: number;
  notes?: string;
}

export interface ExternalEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAllDay: boolean;
  collisionType: CollisionType;
  source?: string; // 'google', 'outlook', etc.
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  workout?: Workout;
  external?: ExternalEvent;
}

// ─────────────────────────────────────────────────────────────
// WEEKLY FOCUS (from Home screen decision engine)
// ─────────────────────────────────────────────────────────────

export interface WeeklyFocus {
  id: string;
  title: string; // e.g., "Putting presisjon"
  category: WorkoutCategory;
  targetMinutes: number;
  completedMinutes: number;
}

// ─────────────────────────────────────────────────────────────
// DECISION ANCHOR
// ─────────────────────────────────────────────────────────────

export interface DecisionAnchorData {
  weeklyFocus: string;
  recommendedWorkout: Workout | null;
  state: DayViewState;
  collision?: {
    type: CollisionType;
    conflictingEvent: ExternalEvent;
  };
  elapsedTime?: number; // seconds, for S5_IN_PROGRESS
}

// ─────────────────────────────────────────────────────────────
// RESCHEDULE OPTIONS
// ─────────────────────────────────────────────────────────────

export type RescheduleOption =
  | { type: 'delay'; minutes: 15 | 30 | 60 }
  | { type: 'custom'; time: string }
  | { type: 'specific_time'; time: string };

// ─────────────────────────────────────────────────────────────
// SHORTEN OPTIONS (discrete steps only)
// ─────────────────────────────────────────────────────────────

export type ShortenOption = 45 | 30 | 15;

// ─────────────────────────────────────────────────────────────
// INSTRUMENTATION EVENTS
// ─────────────────────────────────────────────────────────────

export interface WorkoutStartEvent {
  source: 'decision_anchor' | 'timeline' | 'detail_panel';
  recommended: boolean;
  planned: boolean;
  duration_selected: number;
}

export interface WorkoutRescheduleEvent {
  from_time: string;
  to_time: string;
  reason: 'user_initiated' | 'collision_resolution';
}

export interface WorkoutModifyEvent {
  old_duration: number;
  new_duration: number;
}

export interface WorkoutCompleteEvent {
  duration_actual: number;
  recommended: boolean;
  planned: boolean;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT PROPS
// ─────────────────────────────────────────────────────────────

export interface DayViewProps {
  date: Date;
  onNavigate?: (direction: -1 | 0 | 1, goToToday?: boolean) => void;
  onBack?: () => void;
}

export interface DecisionAnchorProps {
  data: DecisionAnchorData;
  onStartWorkout: () => void;
  onReschedule: (option: RescheduleOption) => void;
  onComplete: () => void;
  onPause?: () => void;
  onCancel?: () => void;
  onSelectWorkout?: () => void;
  onOpenTimePicker?: () => void;
}

export interface TimeGridProps {
  date: Date;
  events: CalendarEvent[];
  recommendedSlot?: { time: string; duration: number }; // For ghost slot in S2
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick?: (hour: number) => void;
}

export interface EventCardProps {
  event: CalendarEvent;
  isGhost?: boolean;
  onClick: () => void;
  onStart?: () => void;
}

export interface EventDetailPanelProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  onReschedule: (option: RescheduleOption) => void;
  onShorten: (duration: ShortenOption) => void;
  onComplete: () => void;
  onOpenTimePicker?: () => void;
  onViewContent?: (workout: Workout) => void;
}
