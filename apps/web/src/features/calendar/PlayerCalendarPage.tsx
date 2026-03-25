/**
 * PlayerCalendarPage.tsx
 *
 * Enhanced calendar page for players using Tailwind UI templates.
 *
 * Features:
 * - Day/Week/Month/Year views
 * - Mini calendar sidebar (desktop)
 * - Session events from API
 * - Event details panel
 * - Create session modal
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScreenView } from '../../analytics/useScreenView';
import { track } from '../../analytics/track';
import { useCalendarState } from './hooks/useCalendarState';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import {
  CalendarHeader,
  CalendarMiniMonth,
  CalendarMonthGrid,
  CalendarWeekGrid,
  type CalendarView,
  type CalendarEvent,
} from './components/enhanced';
import { EventDetailsPanel, CreateSessionModal, NewSession, CalendarColorLegend } from './components';
import { SessionPlannerModal, type NewPlannedSession } from './components/session-planner';
import { sessionsAPI } from '../../services/api';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import { CalendarSkeleton } from '../../ui/skeletons';
import { RefreshCw, Info, Clock } from 'lucide-react';
import clsx from 'clsx';
import { SectionTitle } from '../../components/typography/Headings';

const MONTH_NAMES = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

const PlayerCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  useScreenView('SpillerKalender');

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

  // Mini calendar state (for sidebar)
  const [miniCalendarDate, setMiniCalendarDate] = useState(anchorDate);

  // Fetch events
  const { events, isLoading, error, refetch, isSeedData } = useCalendarEvents(rangeStart, rangeEnd);

  // Map to enhanced event format
  const enhancedEvents = useMemo<CalendarEvent[]>(() => {
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      start: e.start,
      end: e.end,
      location: e.location,
      category: e.category as CalendarEvent['category'],
      status: e.status as CalendarEvent['status'],
      color: (
        e.status === 'recommended' ? 'blue' :
        e.status === 'completed' ? 'green' :
        e.status === 'in_progress' ? 'amber' :
        e.category === 'testing' ? 'purple' :
        e.category === 'mental' ? 'pink' :
        'gray'
      ) as CalendarEvent['color'],
    }));
  }, [events]);

  // Event dates for mini calendar dots
  const eventDates = useMemo(() => {
    return [...new Set(events.map((e) => e.date))];
  }, [events]);

  // Selected event state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailPanelOpen, setDetailPanelOpen] = useState(false);

  // Session planner modal
  const [isPlannerOpen, setPlannerOpen] = useState(false);
  const [plannerInitialDate, setPlannerInitialDate] = useState<Date | undefined>();
  const [plannerInitialTime, setPlannerInitialTime] = useState<string | undefined>();

  // Handlers
  const handleEventClick = useCallback((event: CalendarEvent) => {
    track('calendar_event_open', { event_id: event.id, event_type: event.category });
    // Find the full event from original data
    const fullEvent = events.find((e) => e.id === event.id);
    if (fullEvent) {
      setSelectedEvent(event);
      setDetailPanelOpen(true);
    }
  }, [events]);

  const handleCloseDetailPanel = useCallback(() => {
    setDetailPanelOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setDate(date);
    setView('day');
  }, [setDate, setView]);

  const handleAddEvent = useCallback(() => {
    track('calendar_click_new_session', { source: 'header' });
    setPlannerInitialDate(anchorDate);
    setPlannerInitialTime(undefined);
    setPlannerOpen(true);
  }, [anchorDate]);

  const handleCreatePlannedSession = useCallback(async (session: NewPlannedSession) => {
    try {
      await sessionsAPI.create(session as Parameters<typeof sessionsAPI.create>[0]);
      setPlannerOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, [refetch]);

  // Mini calendar handlers
  const handleMiniPrevMonth = useCallback(() => {
    setMiniCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleMiniNextMonth = useCallback(() => {
    setMiniCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleMiniSelectDate = useCallback((date: Date) => {
    setDate(date);
    if (view === 'month' || view === 'year') {
      setView('day');
    }
  }, [setDate, view, setView]);

  // Get title based on view
  const getTitle = () => {
    switch (view) {
      case 'day':
        return `${anchorDate.getDate()}. ${MONTH_NAMES[anchorDate.getMonth()]} ${year}`;
      case 'week':
        return `${monthName} ${year}`;
      case 'month':
        return `${monthName} ${year}`;
      case 'year':
        return `${year}`;
      default:
        return `${monthName} ${year}`;
    }
  };

  const getSubtitle = () => {
    if (view === 'day') {
      return DAY_NAMES[anchorDate.getDay()];
    }
    if (view === 'week') {
      return `Uke ${weekNumber}`;
    }
    return undefined;
  };

  // Loading state
  if (isLoading && events.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)] bg-tier-white">
        <CalendarHeader
          view={view as CalendarView}
          title={getTitle()}
          subtitle={getSubtitle()}
          helpText="Spiller-kalender med oversikt over dine økter og aktiviteter. Viser alle planlagte treningsøkter, turneringer og golfaktiviteter. Bytt mellom Dag-, Uke-, Måned- og År-visning for ulik detaljgrad. Naviger med forrige/neste eller hopp til i dag. Klikk 'Ny økt' for å legge til ny treningsøkt. Klikk på økt for å se detaljer, notater, øvelser og evaluering. Mini-kalender i sidebar for rask navigasjon og oversikt. Bruk for å holde styr på treningsprogram og kommende aktiviteter."
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          onViewChange={(v) => setView(v)}
          onAddEvent={handleAddEvent}
          addEventLabel="Ny økt"
        />
        <div className="flex-1 overflow-hidden">
          <CalendarSkeleton view={view === 'year' ? 'month' : view} />
        </div>
      </div>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center bg-tier-white">
        <StateCard
          variant="error"
          title="Noe gikk galt"
          description={error}
          action={
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCw size={14} />}
              onClick={refetch}
            >
              Prøv igjen
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-tier-white">
      {/* Seed data banner */}
      {isSeedData && (
        <div className="flex items-center gap-2 py-3 px-4 mx-4 mt-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <Info size={16} />
          <span>Viser demodata. Faktiske økter vil vises når du har lagt dem til.</span>
        </div>
      )}

      {/* Header */}
      <CalendarHeader
        view={view as CalendarView}
        title={getTitle()}
        subtitle={getSubtitle()}
        helpText="Spiller-kalender med oversikt over dine økter og aktiviteter. Viser alle planlagte treningsøkter, turneringer og golfaktiviteter. Bytt mellom Dag-, Uke-, Måned- og År-visning for ulik detaljgrad. Naviger med forrige/neste eller hopp til i dag. Klikk 'Ny økt' for å legge til ny treningsøkt. Klikk på økt for å se detaljer, notater, øvelser og evaluering. Mini-kalender i sidebar for rask navigasjon og oversikt. Bruk for å holde styr på treningsprogram og kommende aktiviteter."
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        onViewChange={(v) => setView(v)}
        onAddEvent={handleAddEvent}
        addEventLabel="Ny økt"
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 overflow-hidden">
          {view === 'week' && (
            <CalendarWeekGrid
              weekDates={weekDates}
              events={enhancedEvents}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'month' && (
            <CalendarMonthGrid
              currentDate={anchorDate}
              events={enhancedEvents}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'day' && (
            <DayView
              date={anchorDate}
              events={enhancedEvents.filter((e) => e.date === anchorDate.toISOString().split('T')[0])}
              onEventClick={handleEventClick}
            />
          )}

          {view === 'year' && (
            <YearView
              year={year}
              events={enhancedEvents}
              onMonthClick={(monthIdx) => goToMonth(monthIdx)}
            />
          )}
        </div>

        {/* Sidebar with mini calendar (desktop only) */}
        <div className="hidden w-80 flex-none border-l border-tier-border-default px-8 py-6 md:block">
          <CalendarMiniMonth
            currentDate={miniCalendarDate}
            selectedDate={anchorDate}
            eventDates={eventDates}
            onPrevMonth={handleMiniPrevMonth}
            onNextMonth={handleMiniNextMonth}
            onSelectDate={handleMiniSelectDate}
          />

          {/* Upcoming events */}
          <section className="mt-10">
            <SectionTitle style={{ marginBottom: 0 }}>
              Kommende økter
            </SectionTitle>
            <ol className="mt-4 space-y-1 text-sm leading-6 text-tier-text-secondary">
              {enhancedEvents
                .filter((e) => e.date >= new Date().toISOString().split('T')[0])
                .slice(0, 5)
                .map((event) => (
                  <li
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="group flex items-center gap-x-4 rounded-xl px-4 py-2 cursor-pointer hover:bg-tier-surface-base transition-colors"
                  >
                    <div className={clsx(
                      'flex-none w-1 h-8 rounded-full',
                      event.color === 'blue' ? 'bg-blue-500' :
                      event.color === 'green' ? 'bg-green-500' :
                      event.color === 'amber' ? 'bg-amber-500' :
                      event.color === 'pink' ? 'bg-pink-500' :
                      event.color === 'purple' ? 'bg-purple-500' :
                      'bg-gray-400'
                    )} />
                    <div className="flex-auto">
                      <p className="text-tier-navy font-medium truncate">{event.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-tier-text-tertiary">
                        <Clock size={12} />
                        {event.start} - {event.end}
                      </p>
                    </div>
                  </li>
                ))}
              {enhancedEvents.filter((e) => e.date >= new Date().toISOString().split('T')[0]).length === 0 && (
                <li className="text-tier-text-tertiary py-2">Ingen kommende økter</li>
              )}
            </ol>
          </section>

          {/* Color legend */}
          <section className="mt-8 pt-6 border-t border-tier-border-default">
            <SectionTitle style={{ marginBottom: '0.75rem' }}>
              Fargekoder
            </SectionTitle>
            <CalendarColorLegend orientation="vertical" />
          </section>
        </div>

        {/* Event details panel */}
        {isDetailPanelOpen && selectedEvent && (
          <EventDetailsPanel
            event={events.find((e) => e.id === selectedEvent.id) || null}
            isOpen={isDetailPanelOpen}
            onClose={handleCloseDetailPanel}
            onStart={() => {
              navigate(`/session/${selectedEvent.id}/start`);
              handleCloseDetailPanel();
            }}
            onComplete={async () => {
              try {
                await sessionsAPI.complete(selectedEvent.id, {});
                handleCloseDetailPanel();
                refetch();
              } catch (e) {
                console.error('Failed to complete session:', e);
              }
            }}
            onEdit={() => {
              navigate(`/session/${selectedEvent.id}/edit`);
              handleCloseDetailPanel();
            }}
            onDelete={async () => {
              try {
                await sessionsAPI.delete(selectedEvent.id);
                handleCloseDetailPanel();
                refetch();
              } catch (e) {
                console.error('Failed to delete session:', e);
              }
            }}
          />
        )}
      </div>

      {/* Session planner modal */}
      <SessionPlannerModal
        isOpen={isPlannerOpen}
        initialDate={plannerInitialDate}
        initialTime={plannerInitialTime}
        onClose={() => setPlannerOpen(false)}
        onSubmit={handleCreatePlannedSession}
      />
    </div>
  );
};

// Simple Day View component
const DayView: React.FC<{
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}> = ({ date, events, onEventClick }) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.start.localeCompare(b.start));
  }, [events]);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-tier-text-tertiary">Ingen økter denne dagen</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {sortedEvents.map((event) => (
              <li
                key={event.id}
                onClick={() => onEventClick(event)}
                className={clsx(
                  'flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors',
                  event.color === 'blue' && 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',
                  event.color === 'green' && 'bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20',
                  event.color === 'amber' && 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
                  event.color === 'pink' && 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-500/10 dark:hover:bg-pink-500/20',
                  event.color === 'purple' && 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20',
                  !event.color && 'bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10',
                )}
              >
                <div className="flex-none w-16 text-sm font-medium text-tier-text-secondary">
                  {event.start}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-tier-navy">{event.title}</p>
                  {event.location && (
                    <p className="text-sm text-tier-text-tertiary">{event.location}</p>
                  )}
                </div>
                <div className="flex-none text-sm text-tier-text-tertiary">
                  {event.start} - {event.end}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

// Simple Year View component
const YearView: React.FC<{
  year: number;
  events: CalendarEvent[];
  onMonthClick: (monthIndex: number) => void;
}> = ({ year, events, onMonthClick }) => {
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      index: i,
      name: MONTH_NAMES[i],
      eventCount: events.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === i;
      }).length,
    }));
  }, [year, events]);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {months.map((month) => (
          <button
            key={month.index}
            onClick={() => onMonthClick(month.index)}
            className="p-4 rounded-lg bg-tier-white border border-tier-border-default hover:border-tier-navy hover:bg-tier-surface-base transition-colors text-left"
          >
            <p className="font-semibold text-tier-navy">{month.name}</p>
            {month.eventCount > 0 && (
              <p className="text-sm text-tier-text-tertiary mt-1">
                {month.eventCount} økt{month.eventCount !== 1 ? 'er' : ''}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerCalendarPage;
