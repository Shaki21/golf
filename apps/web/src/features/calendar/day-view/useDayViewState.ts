/**
 * Day View State Machine Hook
 *
 * Manages state transitions (S0-S6) for the Decision Engine execution surface.
 * This hook determines WHAT state we're in based on workout data.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DayViewState,
  Workout,
  ExternalEvent,
  CalendarEvent,
  DecisionAnchorData,
  RescheduleOption,
  ShortenOption,
  WorkoutStartEvent,
  WorkoutRescheduleEvent,
  WorkoutModifyEvent,
  WorkoutCompleteEvent,
} from './types';

interface UseDayViewStateProps {
  date: Date;
  workouts: Workout[];
  externalEvents: ExternalEvent[];
  weeklyFocus: string;
}

interface UseDayViewStateReturn {
  state: DayViewState;
  decisionAnchorData: DecisionAnchorData;
  selectedEvent: CalendarEvent | null;
  allEvents: CalendarEvent[];
  recommendedWorkout: Workout | null;
  ghostSlot: { time: string; duration: number } | null;
  elapsedTime: number;

  // Actions
  selectEvent: (event: CalendarEvent | null) => void;
  startWorkout: (source: 'decision_anchor' | 'timeline' | 'detail_panel') => void;
  rescheduleWorkout: (option: RescheduleOption) => void;
  shortenWorkout: (duration: ShortenOption) => void;
  completeWorkout: () => void;
  pauseWorkout: () => void;
  cancelWorkout: () => void;
}

// Instrumentation event types
type InstrumentationEvent =
  | WorkoutStartEvent
  | WorkoutRescheduleEvent
  | WorkoutModifyEvent
  | WorkoutCompleteEvent;

// Instrumentation helper (non-blocking)
const logEvent = (_eventName: string, _data: InstrumentationEvent) => {
  // TODO: Send to analytics service in production
  // analyticsService.track(eventName, data);
};

export function useDayViewState({
  date,
  workouts,
  externalEvents,
  weeklyFocus,
}: UseDayViewStateProps): UseDayViewStateReturn {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [localWorkouts, setLocalWorkouts] = useState<Workout[]>(workouts);

  // Update local workouts when prop changes
  useEffect(() => {
    setLocalWorkouts(workouts);
  }, [workouts]);

  // Timer for in-progress workout
  useEffect(() => {
    if (workoutStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [workoutStartTime]);

  // Find recommended workout (first one marked as recommended, or generate one)
  const recommendedWorkout = useMemo(() => {
    // First, check if there's a workout in progress
    const inProgress = localWorkouts.find((w) => w.status === 'in_progress');
    if (inProgress) return inProgress;

    // Then, check for explicitly recommended workout
    const recommended = localWorkouts.find((w) => w.isRecommended && w.status === 'scheduled');
    if (recommended) return recommended;

    // Find first scheduled workout for today
    const todayStr = date.toISOString().split('T')[0];
    const scheduledToday = localWorkouts.find(
      (w) => w.scheduledDate === todayStr && w.status === 'scheduled'
    );
    if (scheduledToday) return scheduledToday;

    return null;
  }, [localWorkouts, date]);

  // Check for hard collisions
  const collision = useMemo(() => {
    if (!recommendedWorkout?.scheduledTime) return null;

    const workoutStart = parseInt(recommendedWorkout.scheduledTime.split(':')[0]) * 60 +
      parseInt(recommendedWorkout.scheduledTime.split(':')[1]);
    const workoutEnd = workoutStart + recommendedWorkout.duration;

    for (const event of externalEvents) {
      if (event.collisionType !== 'hard') continue;

      const eventStart = parseInt(event.startTime.split(':')[0]) * 60 +
        parseInt(event.startTime.split(':')[1]);
      const eventEnd = parseInt(event.endTime.split(':')[0]) * 60 +
        parseInt(event.endTime.split(':')[1]);

      // Check for overlap
      if (workoutStart < eventEnd && workoutEnd > eventStart) {
        return {
          type: event.collisionType,
          conflictingEvent: event,
        };
      }
    }
    return null;
  }, [recommendedWorkout, externalEvents]);

  // Determine current state (S0-S6)
  const state = useMemo((): DayViewState => {
    // S5: Workout in progress
    const inProgressWorkout = localWorkouts.find((w) => w.status === 'in_progress');
    if (inProgressWorkout) return 'S5_IN_PROGRESS';

    // S6: Check if recommended workout was completed today
    const todayStr = date.toISOString().split('T')[0];
    const completedToday = localWorkouts.find(
      (w) => w.isRecommended && w.status === 'completed' && w.completedAt?.startsWith(todayStr)
    );
    if (completedToday) return 'S6_COMPLETED';

    // S3: No recommendation available
    if (!recommendedWorkout) return 'S3_NO_RECOMMENDATION';

    // S4: Hard collision detected
    if (collision) return 'S4_COLLISION';

    // S2: Recommended but not scheduled (no time set)
    if (!recommendedWorkout.scheduledTime) return 'S2_UNSCHEDULED';

    // S1: Recommended and scheduled
    return 'S1_SCHEDULED';
  }, [localWorkouts, recommendedWorkout, collision, date]);

  // Generate ghost slot for S2 state
  const ghostSlot = useMemo(() => {
    if (state !== 'S2_UNSCHEDULED' || !recommendedWorkout) return null;

    // Find best time slot (avoid external events)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Start from current time, rounded up to next 30 min
    let suggestedHour = currentHour;
    let suggestedMinutes = currentMinutes < 30 ? 30 : 0;
    if (suggestedMinutes === 0) suggestedHour += 1;

    // Don't suggest times before 6am or after 9pm
    if (suggestedHour < 6) suggestedHour = 6;
    if (suggestedHour > 21) suggestedHour = 9; // Next day morning

    return {
      time: `${suggestedHour.toString().padStart(2, '0')}:${suggestedMinutes.toString().padStart(2, '0')}`,
      duration: recommendedWorkout.duration,
    };
  }, [state, recommendedWorkout]);

  // Build decision anchor data
  const decisionAnchorData: DecisionAnchorData = useMemo(
    () => ({
      weeklyFocus,
      recommendedWorkout,
      state,
      collision: collision || undefined,
      elapsedTime: state === 'S5_IN_PROGRESS' ? elapsedTime : undefined,
    }),
    [weeklyFocus, recommendedWorkout, state, collision, elapsedTime]
  );

  // Combine all events for display
  const allEvents: CalendarEvent[] = useMemo(() => {
    const workoutEvents: CalendarEvent[] = localWorkouts.map((w) => ({
      id: w.id,
      type: 'ak_workout' as const,
      workout: w,
    }));

    const externalCalEvents: CalendarEvent[] = externalEvents.map((e) => ({
      id: e.id,
      type: 'external' as const,
      external: e,
    }));

    return [...workoutEvents, ...externalCalEvents];
  }, [localWorkouts, externalEvents]);

  // Actions
  const selectEvent = useCallback((event: CalendarEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const startWorkout = useCallback(
    (source: 'decision_anchor' | 'timeline' | 'detail_panel') => {
      // Handle S3: Create fallback workout if no recommendation exists
      if (!recommendedWorkout) {
        const fallbackWorkout: Workout = {
          id: `fallback-${Date.now()}`,
          name: 'Terskeløkt',
          category: 'fysisk',
          duration: 15,
          scheduledTime: undefined,
          scheduledDate: date.toISOString().split('T')[0],
          status: 'in_progress',
          isRecommended: false,
          isAllDay: false,
          startedAt: new Date().toISOString(),
        };

        // Log instrumentation event for fallback workout
        const eventData: WorkoutStartEvent = {
          source,
          recommended: false,
          planned: false,
          duration_selected: 15,
        };
        logEvent('workout_start', eventData);

        // Add fallback workout to local state
        setLocalWorkouts((prev) => [...prev, fallbackWorkout]);
        setWorkoutStartTime(new Date());
        setElapsedTime(0);
        return;
      }

      // Log instrumentation event
      const eventData: WorkoutStartEvent = {
        source,
        recommended: recommendedWorkout.isRecommended,
        planned: !!recommendedWorkout.scheduledTime,
        duration_selected: recommendedWorkout.duration,
      };
      logEvent('workout_start', eventData);

      // Update workout status
      setLocalWorkouts((prev) =>
        prev.map((w) =>
          w.id === recommendedWorkout.id
            ? { ...w, status: 'in_progress' as const, startedAt: new Date().toISOString() }
            : w
        )
      );

      // Start timer
      setWorkoutStartTime(new Date());
      setElapsedTime(0);
    },
    [recommendedWorkout, date]
  );

  const rescheduleWorkout = useCallback(
    (option: RescheduleOption) => {
      if (!recommendedWorkout) return;

      const oldTime = recommendedWorkout.scheduledTime || 'unscheduled';
      let newTime: string;

      if (option.type === 'delay') {
        // Calculate new time based on delay
        const now = new Date();
        now.setMinutes(now.getMinutes() + option.minutes);
        newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      } else {
        newTime = option.time;
      }

      // Log instrumentation event
      const eventData: WorkoutRescheduleEvent = {
        from_time: oldTime,
        to_time: newTime,
        reason: 'user_initiated',
      };
      logEvent('workout_reschedule', eventData);

      // Update workout
      setLocalWorkouts((prev) =>
        prev.map((w) =>
          w.id === recommendedWorkout.id ? { ...w, scheduledTime: newTime } : w
        )
      );
    },
    [recommendedWorkout]
  );

  const shortenWorkout = useCallback(
    (duration: ShortenOption) => {
      if (!recommendedWorkout) return;

      // Log instrumentation event
      const eventData: WorkoutModifyEvent = {
        old_duration: recommendedWorkout.duration,
        new_duration: duration,
      };
      logEvent('workout_modify', eventData);

      // Update workout duration
      setLocalWorkouts((prev) =>
        prev.map((w) => (w.id === recommendedWorkout.id ? { ...w, duration } : w))
      );
    },
    [recommendedWorkout]
  );

  const completeWorkout = useCallback(() => {
    if (!recommendedWorkout) return;

    // Log instrumentation event
    const eventData: WorkoutCompleteEvent = {
      duration_actual: elapsedTime / 60, // Convert to minutes
      recommended: recommendedWorkout.isRecommended,
      planned: !!recommendedWorkout.scheduledTime,
    };
    logEvent('workout_complete', eventData);

    // Update workout status
    setLocalWorkouts((prev) =>
      prev.map((w) =>
        w.id === recommendedWorkout.id
          ? { ...w, status: 'completed' as const, completedAt: new Date().toISOString() }
          : w
      )
    );

    // Reset timer
    setWorkoutStartTime(null);
    setElapsedTime(0);
  }, [recommendedWorkout, elapsedTime]);

  const pauseWorkout = useCallback(() => {
    // For MVP, pause just stops the timer but keeps status
    setWorkoutStartTime(null);
  }, []);

  const cancelWorkout = useCallback(() => {
    if (!recommendedWorkout) return;

    // Reset to scheduled state
    setLocalWorkouts((prev) =>
      prev.map((w) =>
        w.id === recommendedWorkout.id
          ? { ...w, status: 'scheduled' as const, startedAt: undefined }
          : w
      )
    );

    setWorkoutStartTime(null);
    setElapsedTime(0);
  }, [recommendedWorkout]);

  return {
    state,
    decisionAnchorData,
    selectedEvent,
    allEvents,
    recommendedWorkout,
    ghostSlot,
    elapsedTime,
    selectEvent,
    startWorkout,
    rescheduleWorkout,
    shortenWorkout,
    completeWorkout,
    pauseWorkout,
    cancelWorkout,
  };
}
