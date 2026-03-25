/**
 * Day View Execution Surface
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * STRATEGIC INTENT (NON-NEGOTIABLE):
 * - The Home screen decides WHAT the athlete should do.
 * - The Day View exists only to help the athlete EXECUTE that decision.
 * - There must always be: One clear priority, One primary action, Secondary info after action.
 *
 * This is NOT a Google Calendar clone.
 * This is a PERFORMANCE EXECUTION SURFACE.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayViewProps, Workout, ExternalEvent, RescheduleOption, ShortenOption } from './types';
import { useDayViewState } from './useDayViewState';
import { DecisionAnchor } from './DecisionAnchor';
import { TimeGrid } from './TimeGrid';
import { EventDetailPanel } from './EventDetailPanel';
import { WorkoutSelectorModal } from './WorkoutSelectorModal';
import { TimePickerModal } from './TimePickerModal';
import { WorkoutContentViewer } from './WorkoutContentViewer';

// Day names in Norwegian
const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const monthNames = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

// Generate mock data for testing (will be replaced with real API data)
const generateMockData = (date: Date): { workouts: Workout[]; externalEvents: ExternalEvent[]; weeklyFocus: string } => {
  const dateStr = date.toISOString().split('T')[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isToday = new Date().toISOString().split('T')[0] === dateStr;

  // Sample workouts - simulating different states
  const workouts: Workout[] = [
    {
      id: 'workout-1',
      name: 'Putting Presisjon',
      category: 'teknikk',
      duration: 45,
      scheduledTime: '10:00',
      scheduledDate: dateStr,
      status: 'scheduled',
      isRecommended: true,
      isAllDay: false,
      location: 'TIER Golf',
      description: 'Fokus på korte putter (1-3 meter) med vekt på linjekontroll og hastighet.',
    },
  ];

  // Only add additional workouts some days
  if (date.getDay() === 3) { // Wednesday
    workouts.push({
      id: 'workout-2',
      name: 'Fysisk Trening',
      category: 'fysisk',
      duration: 30,
      scheduledTime: '16:00',
      scheduledDate: dateStr,
      status: 'scheduled',
      isRecommended: false,
      isAllDay: false,
    });
  }

  // Sample external events
  const externalEvents: ExternalEvent[] = [
    {
      id: 'external-1',
      title: 'Lunsj',
      startTime: '12:00',
      endTime: '13:00',
      isAllDay: false,
      collisionType: 'soft',
    },
  ];

  // Add a meeting on some days to test collision
  if (date.getDay() === 1) { // Monday
    externalEvents.push({
      id: 'external-2',
      title: 'Trener-møte',
      startTime: '09:30',
      endTime: '10:30',
      isAllDay: false,
      collisionType: 'hard',
      source: 'Google Calendar',
    });
  }

  return {
    workouts,
    externalEvents,
    weeklyFocus: 'Putting presisjon',
  };
};

export const DayViewExecution: React.FC<DayViewProps> = ({ date: initialDate, onNavigate, onBack }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('day');

  // Modal states
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [timePickerContext, setTimePickerContext] = useState<{ forReschedule: boolean; hour?: number }>({ forReschedule: false });
  const [selectedWorkoutForContent, setSelectedWorkoutForContent] = useState<Workout | null>(null);

  // Get mock data (will be replaced with real API hook)
  const { workouts, externalEvents, weeklyFocus } = useMemo(
    () => generateMockData(currentDate),
    [currentDate]
  );

  // Use the state machine hook
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    state: _state,
    decisionAnchorData,
    selectedEvent,
    allEvents,
    recommendedWorkout: _recommendedWorkout,
    ghostSlot,
    selectEvent,
    startWorkout,
    rescheduleWorkout,
    shortenWorkout,
    completeWorkout,
    pauseWorkout,
    cancelWorkout,
  } = useDayViewState({
    date: currentDate,
    workouts,
    externalEvents,
    weeklyFocus,
  });

  // Check if current date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  }, [currentDate]);

  // Navigation handlers
  const handleNavigate = useCallback(
    (direction: -1 | 0 | 1, goToToday = false) => {
      if (goToToday || direction === 0) {
        setCurrentDate(new Date());
      } else {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
      }
      onNavigate?.(direction, goToToday);
    },
    [currentDate, onNavigate]
  );

  // Handle reschedule from decision anchor
  const handleReschedule = useCallback(
    (option: RescheduleOption) => {
      rescheduleWorkout(option);
    },
    [rescheduleWorkout]
  );

  // Handle shorten from detail panel
  const handleShorten = useCallback(
    (duration: ShortenOption) => {
      shortenWorkout(duration);
    },
    [shortenWorkout]
  );

  // Handle workout selection from modal
  const handleWorkoutSelect = useCallback((workout: Workout) => {
    // TODO: Add the selected workout to the day
    setShowWorkoutSelector(false);
  }, []);

  // Handle time selection from picker
  const handleTimeSelect = useCallback((time: string) => {
    if (timePickerContext.forReschedule) {
      // Reschedule to specific time
      rescheduleWorkout({ type: 'specific_time', time });
    } else {
      // TODO: Could be used for quick-add at specific time
    }
    setShowTimePicker(false);
  }, [timePickerContext, rescheduleWorkout]);

  // Open time picker for reschedule
  const handleOpenTimePicker = useCallback((forReschedule = true) => {
    setTimePickerContext({ forReschedule });
    setShowTimePicker(true);
  }, []);

  // Open content viewer
  const handleViewContent = useCallback((workout: Workout) => {
    setSelectedWorkoutForContent(workout);
    setShowContentViewer(true);
  }, []);

  return (
    <div className="flex flex-col h-full bg-tier-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tier-border-default flex-shrink-0 bg-tier-white">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-tier-text-tertiary">
          <span
            onClick={onBack}
            className="cursor-pointer transition-colors hover:text-tier-navy"
          >
            Dashboard
          </span>
          <span>→</span>
          <span
            onClick={() => setCurrentView('month')}
            className="cursor-pointer transition-colors hover:text-tier-navy"
          >
            Kalender
          </span>
          <span>→</span>
          <span className="font-medium text-tier-navy">Dag</span>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNavigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all border-tier-border-default text-tier-text-secondary hover:border-tier-navy hover:text-tier-navy"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex flex-col items-center px-3">
            <div className="text-lg font-semibold text-tier-navy">
              {dayNames[currentDate.getDay()]} {currentDate.getDate()}
              {isToday && (
                <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-tier-navy text-white">
                  I dag
                </span>
              )}
            </div>
            <div className="text-xs uppercase tracking-wide text-tier-text-tertiary">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>

          <button
            onClick={() => handleNavigate(1)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all border-tier-border-default text-tier-text-secondary hover:border-tier-navy hover:text-tier-navy"
          >
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button
              onClick={() => handleNavigate(0, true)}
              className="h-9 px-3 rounded-lg text-sm font-medium border transition-all border-tier-border-default text-tier-text-secondary hover:border-tier-navy hover:bg-tier-navy/10 hover:text-tier-navy"
            >
              I dag
            </button>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex gap-0.5 p-0.5 rounded-lg bg-tier-surface-base">
          {(['day', 'week', 'month'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                currentView === view
                  ? 'bg-tier-white text-tier-navy shadow-sm'
                  : 'text-tier-text-secondary'
              }`}
            >
              {view === 'day' ? 'Dag' : view === 'week' ? 'Uke' : 'Måned'}
            </button>
          ))}
        </div>
      </div>

      {/* Decision Anchor (ALWAYS VISIBLE) */}
      <DecisionAnchor
        data={decisionAnchorData}
        onStartWorkout={() => startWorkout('decision_anchor')}
        onReschedule={handleReschedule}
        onComplete={completeWorkout}
        onPause={pauseWorkout}
        onCancel={cancelWorkout}
        onSelectWorkout={() => setShowWorkoutSelector(true)}
        onOpenTimePicker={() => handleOpenTimePicker(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TimeGrid
          date={currentDate}
          events={allEvents}
          recommendedSlot={ghostSlot || undefined}
          onEventClick={selectEvent}
          onTimeSlotClick={(hour) => {
            // Open time picker initialized to this hour
            setTimePickerContext({ forReschedule: false, hour });
            setShowTimePicker(true);
          }}
        />
      </div>

      {/* Event Detail Panel */}
      <EventDetailPanel
        event={selectedEvent}
        isOpen={selectedEvent !== null}
        onClose={() => selectEvent(null)}
        onStart={() => {
          startWorkout('detail_panel');
          selectEvent(null);
        }}
        onReschedule={(option) => {
          handleReschedule(option);
          selectEvent(null);
        }}
        onShorten={(duration) => {
          handleShorten(duration);
        }}
        onComplete={() => {
          completeWorkout();
          selectEvent(null);
        }}
        onOpenTimePicker={() => handleOpenTimePicker(true)}
        onViewContent={(workout) => handleViewContent(workout)}
      />

      {/* Workout Selector Modal */}
      <WorkoutSelectorModal
        isOpen={showWorkoutSelector}
        onClose={() => setShowWorkoutSelector(false)}
        onSelect={handleWorkoutSelect}
        date={currentDate}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={handleTimeSelect}
        initialTime={timePickerContext.hour ? `${timePickerContext.hour.toString().padStart(2, '0')}:00` : undefined}
        title={timePickerContext.forReschedule ? 'Velg nytt tidspunkt' : 'Velg tidspunkt'}
      />

      {/* Workout Content Viewer */}
      <WorkoutContentViewer
        isOpen={showContentViewer}
        onClose={() => setShowContentViewer(false)}
        workout={selectedWorkoutForContent}
      />
    </div>
  );
};

export default DayViewExecution;
