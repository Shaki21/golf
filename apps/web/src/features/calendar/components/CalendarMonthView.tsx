/**
 * CalendarMonthView.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 *
 * Standard month grid with:
 * - Weeks as rows, days as cells
 * - Limited event preview (max 2) with +N overflow
 * - Today highlight
 * - Click to navigate to day view
 *
 * Note: Event colors use dynamic inline styles for theming.
 */

import React, { useMemo } from 'react';
import type { CalendarEvent } from '../hooks/useCalendarEvents';

interface CalendarMonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEK_DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getEventColors(event: CalendarEvent): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (event.status) {
    case 'recommended':
      return {
        bg: 'var(--calendar-event-recommended-bg)',
        text: 'var(--calendar-event-recommended-text)',
        dot: 'var(--calendar-event-recommended-border)',
      };
    case 'in_progress':
      return {
        bg: 'var(--calendar-event-inprogress-bg)',
        text: 'var(--calendar-event-inprogress-text)',
        dot: 'var(--calendar-event-inprogress-border)',
      };
    case 'completed':
      return {
        bg: 'var(--calendar-event-completed-bg)',
        text: 'var(--calendar-event-completed-text)',
        dot: 'var(--calendar-event-completed-border)',
      };
    default:
      return {
        bg: 'var(--calendar-event-planned-bg)',
        text: 'var(--calendar-event-planned-text)',
        dot: 'var(--calendar-event-planned-border)',
      };
  }
}

interface DayInfo {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  date,
  events,
  onDayClick,
  onEventClick,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    }
    return map;
  }, [events]);

  // Generate month grid
  const monthGrid = useMemo<DayInfo[][]>(() => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Get starting day of week (0 = Sunday, we want Monday = 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    const days: DayInfo[] = [];

    // Add previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const d = new Date(prevYear, prevMonth, day);
      const dateKey = formatDateKey(d);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = formatDateKey(d);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Add next month days to fill grid (6 rows)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalCells - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      const d = new Date(nextYear, nextMonth, day);
      const dateKey = formatDateKey(d);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Group into weeks
    const weeks: DayInfo[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [date, eventsByDate, todayKey]);

  return (
    <div className="flex flex-col h-full bg-tier-white">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-tier-border-default">
        {WEEK_DAYS.map((day, idx) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-medium ${
              idx >= 5 ? 'text-tier-text-tertiary' : 'text-tier-text-tertiary'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-rows-6 h-full">
          {monthGrid.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="grid grid-cols-7 border-b border-tier-border-default last:border-b-0"
            >
              {week.map((dayInfo) => (
                <div
                  key={dayInfo.dateKey}
                  className={`min-h-[100px] p-2 border-r border-tier-border-default last:border-r-0 cursor-pointer transition-colors ${
                    dayInfo.isToday
                      ? 'bg-tier-navy/5'
                      : !dayInfo.isCurrentMonth
                      ? 'bg-tier-surface-base hover:bg-tier-surface-base/80'
                      : dayInfo.isWeekend
                      ? 'bg-tier-surface-base hover:bg-tier-surface-base/80'
                      : 'hover:bg-tier-surface-base'
                  }`}
                  onClick={() => onDayClick(dayInfo.date)}
                >
                  {/* Day number */}
                  <span
                    className={`text-sm font-medium inline-flex items-center justify-center ${
                      dayInfo.isToday
                        ? 'w-7 h-7 rounded-full bg-tier-navy text-white'
                        : !dayInfo.isCurrentMonth
                        ? 'text-tier-text-tertiary'
                        : dayInfo.isWeekend
                        ? 'text-tier-text-secondary'
                        : 'text-tier-navy'
                    }`}
                  >
                    {dayInfo.day}
                  </span>

                  {/* Events preview */}
                  {dayInfo.events.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {/* Desktop: Show event titles */}
                      <div className="hidden lg:block">
                        {dayInfo.events.slice(0, 2).map((event) => {
                          const colors = getEventColors(event);
                          return (
                            <button
                              key={event.id}
                              className="w-full text-left px-1.5 py-0.5 rounded text-xs truncate mb-0.5"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event);
                              }}
                            >
                              {event.title}
                            </button>
                          );
                        })}
                        {dayInfo.events.length > 2 && (
                          <div className="text-xs px-1 text-tier-text-tertiary">
                            +{dayInfo.events.length - 2} mer
                          </div>
                        )}
                      </div>

                      {/* Mobile: Show dots */}
                      <div className="flex gap-1 lg:hidden flex-wrap">
                        {dayInfo.events.slice(0, 3).map((event) => {
                          const colors = getEventColors(event);
                          return (
                            <span
                              key={event.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: colors.dot }}
                            />
                          );
                        })}
                        {dayInfo.events.length > 3 && (
                          <span className="text-[10px] text-tier-text-tertiary">
                            +{dayInfo.events.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarMonthView;
