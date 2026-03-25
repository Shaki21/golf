/**
 * NotionCalendar - Full Notion Calendar replica
 *
 * A comprehensive calendar component inspired by Notion Calendar featuring:
 * - Left sidebar with mini calendar, calendar list, scheduling
 * - Week/Day/Month views with proper event positioning
 * - Color-coded calendars with filtering
 * - All-day events section
 * - Current time indicator
 * - Responsive design
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Settings } from 'lucide-react';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { PageTitle, SubSectionTitle } from '../../../../components/typography/Headings';
import MiniCalendar from './MiniCalendar';
import CalendarList from './CalendarList';
import NotionWeekGrid from './NotionWeekGrid';
import NotionDayGrid from './NotionDayGrid';
import NotionMonthGrid from './NotionMonthGrid';
import {
  CALENDAR_COLORS,
  type CalendarColorKey,
  type CalendarSource,
  type ViewType,
} from './types';

// Re-export types for backwards compatibility
export { CALENDAR_COLORS };
export type { CalendarColorKey, CalendarSource, ViewType };

interface NotionCalendarProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: ViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewType) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date, time?: string) => void;
  calendars?: CalendarSource[];
  onCalendarToggle?: (calendarId: string) => void;
  isLoading?: boolean;
}

const NotionCalendar: React.FC<NotionCalendarProps> = ({
  events,
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onEventClick,
  onAddEvent,
  calendars: externalCalendars,
  onCalendarToggle,
  isLoading,
}) => {
  // Default calendars if not provided
  const defaultCalendars: CalendarSource[] = [
    { id: 'personal', name: 'Personal – Generell', color: 'red', visible: true, isDefault: true },
    { id: 'personal-utvikling', name: 'Personal – Utvikling', color: 'orange', visible: true },
    { id: 'personal-barn', name: 'Personal – Barn', color: 'yellow', visible: true },
    { id: 'work-kjoring', name: 'Work – Kjøring', color: 'blue', visible: true },
    { id: 'work-pause', name: 'Work – Pause', color: 'gray', visible: true },
    { id: 'work-mote', name: 'Work – Møte', color: 'purple', visible: true },
    { id: 'work-tier-golf', name: 'Work – TIER Golf', color: 'green', visible: true },
    { id: 'life-calendar', name: 'Life calendar | Time blocking', color: 'teal', visible: true },
    { id: 'familie', name: 'Familie', color: 'pink', visible: true },
  ];

  const [calendars, setCalendars] = useState<CalendarSource[]>(externalCalendars || defaultCalendars);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle calendar visibility toggle
  const handleCalendarToggle = useCallback((calendarId: string) => {
    if (onCalendarToggle) {
      onCalendarToggle(calendarId);
    } else {
      setCalendars(prev =>
        prev.map(cal =>
          cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal
        )
      );
    }
  }, [onCalendarToggle]);

  // Filter events based on visible calendars
  const filteredEvents = useMemo(() => {
    const visibleCalendarIds = new Set(calendars.filter(c => c.visible).map(c => c.id));
    // For now, show all events since we don't have calendar source on events yet
    return events;
  }, [events, calendars]);

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Get week number
  const weekNumber = useMemo(() => {
    const d = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }, [currentDate]);

  // Navigation
  const navigatePrev = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    onDateChange(newDate);
  }, [currentDate, view, onDateChange]);

  const navigateNext = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    onDateChange(newDate);
  }, [currentDate, view, onDateChange]);

  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  // Format header title
  const headerTitle = useMemo(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    if (view === 'day') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [currentDate, view]);

  const weekLabel = view === 'week' ? `Week ${weekNumber}` : null;

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar */}
      {!sidebarCollapsed && (
        <div className="w-60 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Mini Calendar */}
          <div className="p-3 border-b border-gray-100">
            <MiniCalendar
              currentDate={currentDate}
              selectedDate={currentDate}
              onDateSelect={onDateChange}
              events={filteredEvents}
            />
          </div>

          {/* Scheduling Section */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-2">
              <span>Scheduling</span>
              <ChevronLeft size={14} className="rotate-[-90deg]" />
            </div>
            <div className="text-xs text-gray-400">Meet with...</div>
          </div>

          {/* Calendar List */}
          <div className="flex-1 overflow-y-auto">
            <CalendarList
              calendars={calendars}
              onToggle={handleCalendarToggle}
            />
          </div>

          {/* Add Calendar */}
          <div className="p-3 border-t border-gray-100">
            <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700">
              <Plus size={14} />
              Add calendar account
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          {/* Left: Toggle sidebar + Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={18} className={`text-gray-500 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={navigatePrev}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <button
                onClick={navigateNext}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>

            <PageTitle style={{ marginBottom: 0 }}>
              {headerTitle}
              {weekLabel && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {weekLabel}
                </span>
              )}
            </PageTitle>
          </div>

          {/* Right: View toggle + Today + Search */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {(['day', 'week', 'month'] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => onViewChange(v)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    view === v
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'day' ? 'Day' : v === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>

            {/* Today Button */}
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              I dag
            </button>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Søk i hendelser"
                className="w-40 pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          {view === 'week' && (
            <NotionWeekGrid
              weekDates={weekDates}
              events={filteredEvents}
              calendars={calendars}
              onEventClick={onEventClick}
              onAddEvent={onAddEvent}
            />
          )}

          {view === 'day' && (
            <NotionDayGrid
              date={currentDate}
              events={filteredEvents.filter(e => e.date === currentDate.toISOString().split('T')[0])}
              calendars={calendars}
              onEventClick={onEventClick}
              onAddEvent={onAddEvent}
            />
          )}

          {view === 'month' && (
            <NotionMonthGrid
              currentDate={currentDate}
              events={filteredEvents}
              calendars={calendars}
              onDateClick={(date) => {
                onDateChange(date);
                onViewChange('day');
              }}
              onEventClick={onEventClick}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Useful shortcuts (optional) */}
      <div className="w-52 flex-shrink-0 border-l border-gray-200 p-4 hidden xl:block">
        <SubSectionTitle style={{ marginBottom: '0.75rem' }}>Useful shortcuts</SubSectionTitle>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Command menu</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">⌘ K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Menu bar calendar</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">control B</kbd>
          </div>
          <div className="flex justify-between">
            <span>Toggle sidebar</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">⌘ /</kbd>
          </div>
          <div className="flex justify-between">
            <span>Go to date</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">G</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCalendar;
