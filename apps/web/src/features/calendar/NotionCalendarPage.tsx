/**
 * NotionCalendarPage
 *
 * Full Notion Calendar replica page for player/coach calendar module.
 * Integrates NotionCalendar component with existing data hooks.
 *
 * Features:
 * - Notion-style UI with sidebar, mini calendar, calendar list
 * - Week/Day/Month views
 * - Event creation and viewing
 * - Color-coded calendar categories
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScreenView } from '../../analytics/useScreenView';
import { sessionsAPI } from '../../services/api';
import { useCalendarState } from './hooks/useCalendarState';
import { useCalendarEvents, CalendarEvent } from './hooks/useCalendarEvents';
import { NotionCalendar, type ViewType } from './components/NotionCalendar';
import { EventDetailsPanel } from './components';
import {
  SessionPlannerModal,
  type NewPlannedSession,
} from './components/session-planner';

const NotionCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  useScreenView('NotionKalender');

  // Calendar state from URL
  const {
    view: stateView,
    anchorDate,
    rangeStart,
    rangeEnd,
    setView: setStateView,
    setDate,
    goToToday,
  } = useCalendarState();

  // Map state view to Notion view type
  const [view, setView] = useState<ViewType>(
    stateView === 'year' ? 'month' : (stateView as ViewType)
  );

  // Sync view with URL state
  useEffect(() => {
    const mappedView = stateView === 'year' ? 'month' : (stateView as ViewType);
    setView(mappedView);
  }, [stateView]);

  // Fetch events for current range
  const {
    events,
    isLoading,
    error,
    refetch,
    isSeedData,
  } = useCalendarEvents(rangeStart, rangeEnd);

  // Sync view changes
  useEffect(() => {
    // View changed
  }, [view, anchorDate]);

  // Selected event for detail panel
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailPanelOpen, setDetailPanelOpen] = useState(false);

  // Session planner modal state
  const [isPlannerModalOpen, setPlannerModalOpen] = useState(false);
  const [plannerModalInitialDate, setPlannerModalInitialDate] = useState<Date | undefined>();
  const [plannerModalInitialTime, setPlannerModalInitialTime] = useState<string | undefined>();

  // Handlers
  const handleViewChange = useCallback((newView: ViewType) => {
    setView(newView);
    setStateView(newView);
  }, [setStateView]);

  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate);
  }, [setDate]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailPanelOpen(true);
  }, []);

  const handleCloseDetailPanel = useCallback(() => {
    setDetailPanelOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleAddEvent = useCallback((date: Date, time?: string) => {
    setPlannerModalInitialDate(date);
    setPlannerModalInitialTime(time);
    setPlannerModalOpen(true);
  }, []);

  // Handle planned session creation
  const handleCreatePlannedSession = useCallback(async (session: NewPlannedSession) => {
    try {
      await sessionsAPI.create(session as Parameters<typeof sessionsAPI.create>[0]);
      setPlannerModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create planned session:', error);
    }
  }, [refetch]);

  const handleStartSession = useCallback((event: CalendarEvent) => {
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

  const handleEditEvent = useCallback((event: CalendarEvent) => {
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

  return (
    <div className="h-[calc(100vh-64px)] bg-white">
      {/* Main Notion Calendar */}
      <NotionCalendar
        events={events}
        currentDate={anchorDate}
        view={view}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
        isLoading={isLoading}
      />

      {/* Event Details Panel (slide-over) */}
      {isDetailPanelOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" onClick={handleCloseDetailPanel} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl">
            <EventDetailsPanel
              event={selectedEvent}
              isOpen={isDetailPanelOpen}
              onClose={handleCloseDetailPanel}
              onStart={handleStartSession}
              onComplete={handleCompleteSession}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </div>
        </div>
      )}

      {/* Session Planner Modal */}
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

export default NotionCalendarPage;
