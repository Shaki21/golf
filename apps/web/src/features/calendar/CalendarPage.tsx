/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CalendarPage
 *
 * Archetype: C - Dashboard/Calendar Page
 * Purpose: Multi-view calendar system
 *
 * Features:
 * - DAG / UKE / MÅNED / ÅR views
 * - URL-based state management
 * - Deterministic seed data fallback
 * - AppShell persistence (renders inside main layout)
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScreenView } from '../../analytics/useScreenView';
import { track } from '../../analytics/track';
import { sessionsAPI } from '../../services/api';
import { useCalendarState } from './hooks/useCalendarState';
import { useCalendarEvents, CalendarEvent } from './hooks/useCalendarEvents';
import {
  CalendarHeader,
  CalendarWeekView,
  CalendarDayView,
  CalendarMonthView,
  CalendarYearView,
  EventDetailsPanel,
  CreateSessionModal,
  NewSession,
} from './components';
import {
  SessionPlannerModal,
  type NewPlannedSession,
} from './components/session-planner';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import { CalendarSkeleton } from '../../ui/skeletons';
import { RefreshCw, Info } from 'lucide-react';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  useScreenView('Kalender');

  // Calendar state from URL
  const {
    view,
    anchorDate,
    rangeStart,
    rangeEnd,
    weekNumber,
    weekDates,
    monthName,
    year,
    setView,
    setDate,
    goToToday,
    goToNext,
    goToPrev,
    goToMonth,
  } = useCalendarState();

  // Fetch events for current range
  const {
    events,
    isLoading,
    error,
    refetch,
    isSeedData,
  } = useCalendarEvents(rangeStart, rangeEnd);

  // Track calendar view opens
  useEffect(() => {
    track('calendar_view_open', {
      view,
      week_start_date: rangeStart.toISOString().split('T')[0],
    });
  }, [view, rangeStart]);

  // Wrapped goToToday with analytics
  const handleGoToToday = useCallback(() => {
    track('calendar_click_today', {
      week_start_date: rangeStart.toISOString().split('T')[0],
    });
    goToToday();
  }, [goToToday, rangeStart]);

  // Selected event for detail panel
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailPanelOpen, setDetailPanelOpen] = useState(false);

  // Create session modal state (simple mode)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [createModalInitialDate, setCreateModalInitialDate] = useState<Date | undefined>();
  const [createModalInitialTime, setCreateModalInitialTime] = useState<string | undefined>();

  // Session planner modal state (advanced mode with TIER training formula)
  const [isPlannerModalOpen, setPlannerModalOpen] = useState(false);
  const [plannerModalInitialDate, setPlannerModalInitialDate] = useState<Date | undefined>();
  const [plannerModalInitialTime, setPlannerModalInitialTime] = useState<string | undefined>();

  // Handlers
  const handleEventClick = useCallback((event: CalendarEvent) => {
    track('calendar_event_open', {
      event_id: event.id,
      event_type: event.category,
      recommended: event.status === 'recommended',
      planned: event.status === 'planned',
    });
    setSelectedEvent(event);
    setDetailPanelOpen(true);
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setDetailPanelOpen(false);
    setSelectedEvent(null);
  }, []);

  // Open session planner (advanced mode - default)
  const handleNewSession = useCallback(() => {
    track('calendar_click_new_session', {
      source: 'calendar_header',
    });
    setPlannerModalInitialDate(anchorDate);
    setPlannerModalInitialTime(undefined);
    setPlannerModalOpen(true);
  }, [anchorDate]);

  // Open from calendar view click (advanced mode)
  const handleAddSessionFromView = useCallback((date: Date, time: string) => {
    setPlannerModalInitialDate(date);
    setPlannerModalInitialTime(time);
    setPlannerModalOpen(true);
  }, []);

  // Handle simple session creation (legacy)
  const handleCreateSession = useCallback(async (session: NewSession) => {
    try {
      await sessionsAPI.create(session);
      setCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, [refetch]);

  // Handle planned session creation (with TIER training formula)
  const handleCreatePlannedSession = useCallback(async (session: NewPlannedSession) => {
    try {
      // Formula is already included in session object
      await sessionsAPI.create(session as Parameters<typeof sessionsAPI.create>[0]);
      setPlannerModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create planned session:', error);
    }
  }, [refetch]);

  const handleStartSession = useCallback((event: CalendarEvent) => {
    track('calendar_event_start_workout', {
      event_id: event.id,
      source: 'calendar_week',
    });
    // Navigate to session logging/tracking page
    navigate(`/session/${event.id}/start`);
    handleCloseDetailPanel();
  }, [handleCloseDetailPanel, navigate]);

  const handleCompleteSession = useCallback(async (event: CalendarEvent) => {
    try {
      await sessionsAPI.complete(event.id, {});
      handleCloseDetailPanel();
      refetch();
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  }, [handleCloseDetailPanel, refetch]);

  const handlePostponeSession = useCallback(async (event: CalendarEvent, minutes: number) => {
    try {
      // Construct datetime from date and start time
      const [hours, mins] = event.start.split(':').map(Number);
      const currentStart = new Date(event.date);
      currentStart.setHours(hours, mins, 0, 0);
      const newStart = new Date(currentStart.getTime() + minutes * 60000);
      await sessionsAPI.update(event.id, {
        sessionDate: newStart.toISOString(),
      });
      refetch();
    } catch (error) {
      console.error('Failed to postpone session:', error);
    }
  }, [refetch]);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    // Navigate to edit page
    navigate(`/session/${event.id}/edit`);
    handleCloseDetailPanel();
  }, [handleCloseDetailPanel, navigate]);

  const handleDeleteEvent = useCallback(async (event: CalendarEvent) => {
    try {
      await sessionsAPI.delete(event.id);
      handleCloseDetailPanel();
      refetch();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, [handleCloseDetailPanel, refetch]);

  const handleDayClick = useCallback((date: Date) => {
    // Navigate to day view
    setDate(date);
    setView('day');
  }, [setDate, setView]);

  const handleMonthClick = useCallback((monthIndex: number) => {
    goToMonth(monthIndex);
  }, [goToMonth]);

  // Loading state (only show when no cached data)
  // Use CalendarSkeleton to prevent layout shift/flickering
  if (isLoading && events.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)] bg-tier-white">
        {/* Skeleton header */}
        <CalendarHeader
          view={view}
          monthName={monthName}
          year={year}
          weekNumber={weekNumber}
          helpText="Calendar with multi-view (Day/Week/Month/Year). Overview of all your scheduled sessions, tournaments and other golf activities. Navigate between periods with previous/next or jump to today. Switch between DAY view (detailed schedule), WEEK view (7-day overview), MONTH view (entire month's activities), and YEAR view (annual overview with training distribution). Click 'New session' to plan a training session with the TIER training formula. Click on a session for details and editing. Use to plan and track your training program."
          onViewChange={setView}
          onToday={handleGoToToday}
          onPrev={goToPrev}
          onNext={goToNext}
          onNewSession={handleNewSession}
        />
        {/* Skeleton content matching actual view */}
        <div className="flex-1 overflow-hidden">
          <CalendarSkeleton view={view === 'year' ? 'month' : view} />
        </div>
      </div>
    );
  }

  // Error state (only show when no cached data)
  if (error && events.length === 0) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center bg-tier-white">
        <StateCard
          variant="error"
          title="Something went wrong"
          description={error}
          action={
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCw size={14} />}
              onClick={refetch}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-tier-white">
      {/* Seed data info banner */}
      {isSeedData && (
        <div className="flex items-center gap-2 py-3 px-4 bg-tier-info-light border border-tier-info/20 rounded-lg mb-4 text-xs text-tier-text-secondary">
          <Info size={16} className="text-tier-info" />
          <span>Showing demo data. Actual sessions will appear when you add them.</span>
        </div>
      )}

      {/* Error banner (when showing stale data) */}
      {error && events.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-tier-warning-light border-b border-tier-border-default">
          <span className="text-sm text-tier-warning">
            Showing previous data
          </span>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RefreshCw size={14} />}
            onClick={refetch}
          >
            Refresh
          </Button>
        </div>
      )}

      {/* Calendar Header */}
      <CalendarHeader
        view={view}
        monthName={monthName}
        year={year}
        weekNumber={weekNumber}
        helpText="Calendar with multi-view (Day/Week/Month/Year). Overview of all your scheduled sessions, tournaments and other golf activities. Navigate between periods with previous/next or jump to today. Switch between DAY view (detailed schedule), WEEK view (7-day overview), MONTH view (entire month's activities), and YEAR view (annual overview with training distribution). Click 'New session' to plan a training session with the TIER training formula. Click on a session for details and editing. Use to plan and track your training program."
        onViewChange={setView}
        onToday={handleGoToToday}
        onPrev={goToPrev}
        onNext={goToNext}
        onNewSession={handleNewSession}
      />

      {/* Calendar Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main calendar view */}
        <div className="flex-1 overflow-hidden">
          {view === 'week' && (
            <CalendarWeekView
              weekDates={weekDates}
              events={events}
              onEventClick={handleEventClick}
              onAddSession={handleAddSessionFromView}
            />
          )}

          {view === 'day' && (
            <CalendarDayView
              date={anchorDate}
              events={events.filter(e => e.date === anchorDate.toISOString().split('T')[0])}
              onEventClick={handleEventClick}
              onStartSession={handleStartSession}
              onCompleteSession={handleCompleteSession}
              onPostponeSession={handlePostponeSession}
              onAddSession={handleAddSessionFromView}
            />
          )}

          {view === 'month' && (
            <CalendarMonthView
              date={anchorDate}
              events={events}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'year' && (
            <CalendarYearView
              year={year}
              events={events}
              onMonthClick={handleMonthClick}
            />
          )}
        </div>

        {/* Event Details Panel (desktop side panel) */}
        {isDetailPanelOpen && (
          <EventDetailsPanel
            event={selectedEvent}
            isOpen={isDetailPanelOpen}
            onClose={handleCloseDetailPanel}
            onStart={handleStartSession}
            onComplete={handleCompleteSession}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>

      {/* Create Session Modal (simple mode - legacy) */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        initialDate={createModalInitialDate}
        initialTime={createModalInitialTime}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSession}
      />

      {/* Session Planner Modal (advanced mode with TIER training formula) */}
      <SessionPlannerModal
        isOpen={isPlannerModalOpen}
        initialDate={plannerModalInitialDate}
        initialTime={plannerModalInitialTime}
        onClose={() => setPlannerModalOpen(false)}
        onSubmit={handleCreatePlannedSession}
      />
    </div>
  );
};

export default CalendarPage;
