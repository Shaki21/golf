/**
 * CalendarMonthGrid.tsx
 *
 * Full month calendar grid with events displayed on day cells.
 * Based on Tailwind UI calendar templates.
 *
 * Features:
 * - Month navigation
 * - Events displayed on calendar cells
 * - Overflow handling (+N more)
 * - Mobile responsive (dots on mobile, titles on desktop)
 * - Today and selected date highlights
 * - Dark mode support
 */

import React, { useMemo } from 'react';
import clsx from 'clsx';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  location?: string;
  category?: 'trening' | 'testing' | 'mental' | 'turnering' | 'coach';
  status?: 'planned' | 'recommended' | 'in_progress' | 'completed' | 'cancelled';
  color?: 'blue' | 'green' | 'pink' | 'purple' | 'amber' | 'gray';
}

interface CalendarMonthGridProps {
  /** Currently displayed month/year */
  currentDate: Date;
  /** Events to display */
  events: CalendarEvent[];
  /** Click on a day cell */
  onDayClick: (date: Date) => void;
  /** Click on an event */
  onEventClick: (event: CalendarEvent) => void;
  /** Max events to show before "+N more" */
  maxEventsPerDay?: number;
}

interface DayInfo {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const WEEKDAYS_FULL = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getEventColorClasses(event: CalendarEvent): { bg: string; text: string; dot: string } {
  const color = event.color || (
    event.status === 'recommended' ? 'blue' :
    event.status === 'completed' ? 'green' :
    event.status === 'in_progress' ? 'amber' :
    event.category === 'testing' ? 'purple' :
    event.category === 'mental' ? 'pink' :
    event.category === 'turnering' ? 'amber' :
    'gray'
  );

  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500',
      };
    case 'green':
      return {
        bg: 'bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20',
        text: 'text-green-700 dark:text-green-300',
        dot: 'bg-green-500',
      };
    case 'pink':
      return {
        bg: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-500/10 dark:hover:bg-pink-500/20',
        text: 'text-pink-700 dark:text-pink-300',
        dot: 'bg-pink-500',
      };
    case 'purple':
      return {
        bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20',
        text: 'text-purple-700 dark:text-purple-300',
        dot: 'bg-purple-500',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-500',
      };
    default:
      return {
        bg: 'bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10',
        text: 'text-gray-700 dark:text-gray-300',
        dot: 'bg-gray-400 dark:bg-gray-500',
      };
  }
}

export const CalendarMonthGrid: React.FC<CalendarMonthGridProps> = ({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  maxEventsPerDay = 2,
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
    // Sort events by start time within each day
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [events]);

  // Generate the days grid
  const days = useMemo<DayInfo[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Get starting day (Monday = 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    const result: DayInfo[] = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const d = new Date(prevYear, prevMonth, day);
      const dateKey = formatDateKey(d);
      result.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = formatDateKey(d);
      result.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    // Next month days (fill to 6 rows = 42 cells)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const totalCells = 42; // 6 rows * 7 days
    const remainingDays = totalCells - result.length;

    for (let day = 1; day <= remainingDays; day++) {
      const d = new Date(nextYear, nextMonth, day);
      const dateKey = formatDateKey(d);
      result.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        events: eventsByDate[dateKey] || [],
      });
    }

    return result;
  }, [currentDate, todayKey, eventsByDate]);

  return (
    <div className="shadow-sm ring-1 ring-black/5 dark:ring-white/5 lg:flex lg:flex-auto lg:flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-tier-border-default bg-tier-border-default text-center text-xs font-semibold leading-6 text-tier-text-secondary lg:flex-none">
        {WEEKDAYS.map((day, idx) => (
          <div key={day} className={clsx(
            "flex justify-center bg-tier-white py-2 border-r border-tier-border-default",
            idx === 6 && "border-r-0"
          )}>
            <span>{day}</span>
            <span className="sr-only sm:not-sr-only">{WEEKDAYS_FULL[idx].slice(1)}</span>
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="flex bg-tier-border-default text-xs leading-6 text-tier-text-secondary lg:flex-auto">
        {/* Desktop view */}
        <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6">
          {days.map((dayInfo, idx) => (
            <div
              key={dayInfo.dateKey}
              onClick={() => onDayClick(dayInfo.date)}
              className={clsx(
                'group relative min-h-[120px] px-3 py-2 cursor-pointer transition-colors',
                'border-r border-b border-tier-border-default',
                (idx + 1) % 7 === 0 && 'border-r-0', // Remove right border on last column
                dayInfo.isCurrentMonth
                  ? 'bg-tier-white'
                  : 'bg-tier-surface-base/50 text-tier-text-tertiary',
                dayInfo.isToday && 'bg-tier-navy/5',
              )}
            >
              {/* Day number */}
              <time
                dateTime={dayInfo.dateKey}
                className={clsx(
                  dayInfo.isToday
                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tier-navy font-semibold text-white'
                    : dayInfo.isCurrentMonth
                    ? 'text-tier-navy'
                    : 'text-tier-text-tertiary',
                )}
              >
                {dayInfo.day}
              </time>

              {/* Events list */}
              {dayInfo.events.length > 0 && (
                <ol className="mt-2">
                  {dayInfo.events.slice(0, maxEventsPerDay).map((event) => {
                    const colors = getEventColorClasses(event);
                    return (
                      <li key={event.id}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={clsx(
                            'group/event flex w-full rounded px-1 py-0.5 mb-0.5',
                            colors.bg,
                          )}
                        >
                          <p className={clsx('flex-auto truncate font-medium text-left', colors.text)}>
                            {event.title}
                          </p>
                          <time
                            dateTime={`${event.date}T${event.start}`}
                            className={clsx('ml-2 hidden flex-none xl:block', colors.text, 'opacity-70')}
                          >
                            {event.start}
                          </time>
                        </button>
                      </li>
                    );
                  })}
                  {dayInfo.events.length > maxEventsPerDay && (
                    <li className="text-tier-text-tertiary pl-1">
                      + {dayInfo.events.length - maxEventsPerDay} mer
                    </li>
                  )}
                </ol>
              )}
            </div>
          ))}
        </div>

        {/* Mobile view */}
        <div className="isolate grid w-full grid-cols-7 grid-rows-6 lg:hidden">
          {days.map((dayInfo, idx) => (
            <button
              key={dayInfo.dateKey}
              type="button"
              onClick={() => onDayClick(dayInfo.date)}
              className={clsx(
                'group relative flex h-14 flex-col px-3 py-2',
                'border-r border-b border-tier-border-default',
                (idx + 1) % 7 === 0 && 'border-r-0', // Remove right border on last column
                dayInfo.isCurrentMonth
                  ? 'bg-tier-white'
                  : 'bg-tier-surface-base/50',
                dayInfo.isToday && 'bg-tier-navy/5',
              )}
            >
              <time
                dateTime={dayInfo.dateKey}
                className={clsx(
                  'ml-auto',
                  dayInfo.isToday
                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-tier-navy font-semibold text-white'
                    : dayInfo.isCurrentMonth
                    ? 'text-tier-navy'
                    : 'text-tier-text-tertiary',
                )}
              >
                {dayInfo.day}
              </time>
              <span className="sr-only">{dayInfo.events.length} hendelser</span>
              {/* Event dots */}
              {dayInfo.events.length > 0 && (
                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                  {dayInfo.events.slice(0, 3).map((event) => {
                    const colors = getEventColorClasses(event);
                    return (
                      <span
                        key={event.id}
                        className={clsx('mx-0.5 mb-1 h-1.5 w-1.5 rounded-full', colors.dot)}
                      />
                    );
                  })}
                  {dayInfo.events.length > 3 && (
                    <span className="text-[10px] text-tier-text-tertiary mx-0.5">
                      +{dayInfo.events.length - 3}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarMonthGrid;
