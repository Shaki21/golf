/**
 * CalendarOversiktPage
 *
 * Archetype: C - Dashboard/Calendar Page
 * Purpose: Full calendar overview page at /kalender/oversikt
 *
 * Read-only unified view of all event types:
 * - Golf training (teknikk, golfslag, spill)
 * - Physical training (fysisk)
 * - School schedule (skole, oppgaver)
 * - Tournaments (turnering)
 *
 * Supports day/week/month views with URL-based state.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useCallback } from 'react';

import { useOversiktState } from './hooks/useOversiktState';
import { useUnifiedCalendar } from './hooks/useUnifiedCalendar';
import { OversiktHeader } from './components/OversiktHeader';
import { OversiktWeekView } from './components/OversiktWeekView';
import { OversiktMonthView } from './components/OversiktMonthView';
import { OversiktDayView } from './components/OversiktDayView';
import { EventLegend } from './components/EventLegend';
import { AICoachGuide, GUIDE_PRESETS } from '../ai-coach';
import { CalendarSkeleton } from '../../ui/skeletons';
import type { UnifiedCalendarEvent, OversiktView } from './types';

export const CalendarOversiktPage: React.FC = () => {
  const state = useOversiktState();
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
  } = state;

  const { events, isLoading, error } = useUnifiedCalendar({
    startDate: rangeStart,
    endDate: rangeEnd,
  });

  const handleViewChange = useCallback(
    (newView: OversiktView) => {
      setView(newView);
    },
    [setView]
  );

  const handleDayClick = useCallback(
    (date: Date) => {
      setDate(date);
      setView('day');
    },
    [setDate, setView]
  );

  const handleEventClick = useCallback((_event: UnifiedCalendarEvent) => {
    // TODO: Read-only: show details (tooltip or modal)
  }, []);

  const renderView = () => {
    // Use CalendarSkeleton to prevent layout shift/flickering during loading
    if (isLoading) {
      return <CalendarSkeleton view={view} />;
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-tier-white">
          <div className="text-center">
            <p className="text-sm mb-2 text-tier-error">
              Could not load calendar
            </p>
            <p className="text-xs text-tier-text-tertiary">
              {error}
            </p>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'day':
        return (
          <OversiktDayView
            date={anchorDate}
            events={events.filter((e) => e.date === anchorDate.toISOString().split('T')[0])}
            onEventClick={handleEventClick}
          />
        );
      case 'week':
        return (
          <OversiktWeekView
            weekDates={weekDates}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        );
      case 'month':
        return (
          <OversiktMonthView
            anchorDate={anchorDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-tier-white">
      {/* Header */}
      <OversiktHeader
        view={view}
        anchorDate={anchorDate}
        weekNumber={weekNumber}
        monthName={monthName}
        year={year}
        onViewChange={handleViewChange}
        onToday={goToToday}
        onPrev={goToPrev}
        onNext={goToNext}
      />

      {/* AI Coach contextual guide */}
      <div className="px-4 pt-2">
        <AICoachGuide config={GUIDE_PRESETS.calendar} variant="banner" />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar view */}
        <div className="flex-1 overflow-hidden">{renderView()}</div>

        {/* Sidebar with legend (desktop only) */}
        <div className="hidden lg:block w-56 p-4 border-l border-tier-border-default overflow-auto bg-tier-white">
          <EventLegend />
        </div>
      </div>

      {/* Mobile legend (bottom) */}
      <div className="lg:hidden p-3 border-t border-tier-border-default bg-tier-white">
        <EventLegend compact />
      </div>
    </div>
  );
};

export default CalendarOversiktPage;
