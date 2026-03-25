/**
 * CalendarWeekGrid.tsx
 *
 * Week calendar with hourly time grid.
 * Based on Tailwind UI calendar templates.
 *
 * Features:
 * - 7-day view with time slots
 * - Events positioned by time
 * - Overlap handling
 * - Current time indicator
 * - Click to add events
 * - Dark mode support
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
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

interface CalendarWeekGridProps {
  /** Week dates (7 days starting Monday) */
  weekDates: Date[];
  /** Events to display */
  events: CalendarEvent[];
  /** Click on an event */
  onEventClick: (event: CalendarEvent) => void;
  /** Click on empty time slot to add event */
  onAddEvent?: (date: Date, time: string) => void;
  /** Start hour for grid (default: 6) */
  startHour?: number;
  /** End hour for grid (default: 22) */
  endHour?: number;
}

const HOUR_HEIGHT = 56; // px per hour (3.5rem)
const SLOT_HEIGHT = HOUR_HEIGHT / 2; // 30 min slots

const WEEKDAYS_SHORT = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const WEEKDAYS_FULL = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function getEventColorClasses(event: CalendarEvent): { bg: string; text: string; border: string } {
  const color = event.color || (
    event.status === 'recommended' ? 'blue' :
    event.status === 'completed' ? 'green' :
    event.status === 'in_progress' ? 'amber' :
    event.category === 'testing' ? 'purple' :
    event.category === 'mental' ? 'pink' :
    event.category === 'turnering' ? 'amber' :
    event.category === 'coach' ? 'blue' :
    'gray'
  );

  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/15 dark:hover:bg-blue-600/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-500',
      };
    case 'green':
      return {
        bg: 'bg-green-50 hover:bg-green-100 dark:bg-green-600/15 dark:hover:bg-green-600/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-500',
      };
    case 'pink':
      return {
        bg: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-600/15 dark:hover:bg-pink-600/20',
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-500',
      };
    case 'purple':
      return {
        bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-600/15 dark:hover:bg-purple-600/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-500',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-600/15 dark:hover:bg-amber-600/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500',
      };
    default:
      return {
        bg: 'bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-400 dark:border-gray-500',
      };
  }
}

function getEventStyle(event: CalendarEvent, startHour: number): React.CSSProperties {
  const [eventStartHour, eventStartMin] = event.start.split(':').map(Number);
  const [eventEndHour, eventEndMin] = event.end.split(':').map(Number);

  const startOffset = (eventStartHour - startHour) * 60 + eventStartMin;
  const endOffset = (eventEndHour - startHour) * 60 + eventEndMin;
  const duration = endOffset - startOffset;

  // Grid row calculation (each row = 5 minutes)
  // Row 1 is header, then each hour has 12 slots (5 min each)
  const gridRowStart = Math.floor(startOffset / 5) + 2; // +2 for header offset
  const gridRowSpan = Math.max(Math.floor(duration / 5), 2); // min 2 slots (10 min)

  return {
    gridRow: `${gridRowStart} / span ${gridRowSpan}`,
  };
}

// Group overlapping events
function groupOverlappingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [sorted[0]];
  let currentEnd = sorted[0].end;

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i];
    if (event.start < currentEnd) {
      currentGroup.push(event);
      if (event.end > currentEnd) currentEnd = event.end;
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      currentEnd = event.end;
    }
  }
  groups.push(currentGroup);

  return groups;
}

export const CalendarWeekGrid: React.FC<CalendarWeekGridProps> = ({
  weekDates,
  events,
  onEventClick,
  onAddEvent,
  startHour = 6,
  endHour = 22,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowLineTop, setNowLineTop] = useState<number | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(formatHour(hour));
    }
    return slots;
  }, [startHour, endHour]);

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

  // Update now line position
  useEffect(() => {
    const updateNowLine = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (hours >= startHour && hours <= endHour) {
        const offset = (hours - startHour) * 60 + minutes;
        setNowLineTop((offset / 60) * HOUR_HEIGHT);
      } else {
        setNowLineTop(null);
      }
    };

    updateNowLine();
    const interval = setInterval(updateNowLine, 60000);
    return () => clearInterval(interval);
  }, [startHour, endHour]);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current && nowLineTop !== null) {
      scrollRef.current.scrollTop = Math.max(0, nowLineTop - 200);
    }
  }, [nowLineTop]);

  // Calculate grid row count (each hour = 12 rows of 5 min each)
  const hourCount = endHour - startHour + 1;
  const rowCount = hourCount * 12;

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header with day names */}
      <div className=" flex-none bg-tier-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:pr-8">
        {/* Mobile day header */}
        <div className="grid grid-cols-7 text-sm leading-6 text-tier-text-tertiary sm:hidden">
          {weekDates.map((date, idx) => {
            const dateKey = formatDateKey(date);
            const isToday = dateKey === todayKey;
            const monthAbbr = MONTHS_SHORT[date.getMonth()];
            return (
              <button key={dateKey} type="button" className="flex flex-col items-center pt-2 pb-3">
                <span className="text-xs font-medium mb-0.5">{WEEKDAYS_SHORT[idx].charAt(0)}</span>
                <div className="flex flex-col items-center">
                  <span
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center font-bold text-base',
                      isToday
                        ? 'rounded-full bg-tier-navy text-white'
                        : 'text-tier-navy'
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-[10px] text-tier-text-secondary font-medium mt-0.5">
                    {monthAbbr}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop day header */}
        <div className="-mr-px hidden grid-cols-7 divide-x divide-tier-border-default border-r border-tier-border-default leading-6 sm:grid">
          <div className="col-end-1 w-14" />
          {weekDates.map((date, idx) => {
            const dateKey = formatDateKey(date);
            const isToday = dateKey === todayKey;
            const monthAbbr = MONTHS_SHORT[date.getMonth()];
            return (
              <div key={dateKey} className="flex flex-col items-center justify-center py-3 px-2">
                <span className="text-xs text-tier-text-tertiary font-medium mb-1">
                  {WEEKDAYS_SHORT[idx]}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={clsx(
                      'flex items-center justify-center font-bold text-lg',
                      isToday
                        ? 'h-9 w-9 rounded-full bg-tier-navy text-white'
                        : 'text-tier-navy'
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-xs text-tier-text-secondary font-medium">
                    {monthAbbr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex flex-auto overflow-auto">
        {/* Time column */}
        <div className="sticky left-0 z-10 w-14 flex-none bg-tier-white ring-1 ring-tier-border-default" />

        {/* Grid area */}
        <div className="grid flex-auto grid-cols-1 grid-rows-1">
          {/* Horizontal time lines */}
          <div
            className="col-start-1 col-end-2 row-start-1 grid divide-y divide-tier-border-default"
            style={{ gridTemplateRows: `repeat(${hourCount * 2}, minmax(${SLOT_HEIGHT}px, 1fr))` }}
          >
            <div className="row-end-1 h-7" />
            {timeSlots.map((time, idx) => (
              <React.Fragment key={time}>
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-tier-text-tertiary">
                    {time}
                  </div>
                </div>
                <div />
              </React.Fragment>
            ))}
          </div>

          {/* Vertical day lines */}
          <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-tier-border-default sm:grid">
            {weekDates.map((date) => (
              <div key={formatDateKey(date)} className="col-span-1 row-span-full" />
            ))}
            <div className="col-start-8 row-span-full w-8" />
          </div>

          {/* Events layer */}
          <ol
            className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
            style={{ gridTemplateRows: `1.75rem repeat(${rowCount}, minmax(0, 1fr)) auto` }}
          >
            {weekDates.map((date, dayIdx) => {
              const dateKey = formatDateKey(date);
              const isToday = dateKey === todayKey;
              const dayEvents = eventsByDate[dateKey] || [];
              const overlappingGroups = groupOverlappingEvents(dayEvents);

              return (
                <React.Fragment key={dateKey}>
                  {overlappingGroups.map((group) => {
                    const groupWidth = 100 / group.length;

                    return group.map((event, groupIdx) => {
                      const positionStyle = getEventStyle(event, startHour);
                      const colors = getEventColorClasses(event);

                      return (
                        <li
                          key={event.id}
                          className={clsx('relative mt-px flex', `sm:col-start-${dayIdx + 1}`)}
                          style={{
                            ...positionStyle,
                            gridColumn: dayIdx + 1,
                          }}
                        >
                          {/* Dark mode background overlay */}
                          <div className="hidden dark:block pointer-events-none absolute inset-1 z-0 rounded-lg bg-tier-white" />

                          <button
                            onClick={() => onEventClick(event)}
                            className={clsx(
                              'group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs leading-5 border-l-2',
                              colors.bg,
                              colors.border,
                            )}
                            style={{
                              left: `calc(${groupIdx * groupWidth}% + 4px)`,
                              width: `calc(${groupWidth}% - 8px)`,
                            }}
                          >
                            <p className={clsx('order-1 font-semibold', colors.text)}>
                              {event.title}
                            </p>
                            <p className={clsx(colors.text, 'opacity-70')}>
                              <time dateTime={`${event.date}T${event.start}`}>{event.start}</time>
                            </p>
                            {event.location && (
                              <p className={clsx('order-1 truncate', colors.text, 'opacity-70')}>
                                {event.location}
                              </p>
                            )}
                          </button>
                        </li>
                      );
                    });
                  })}
                </React.Fragment>
              );
            })}
          </ol>

          {/* Now line */}
          {nowLineTop !== null && (
            <div
              className="col-start-1 col-end-2 row-start-1 pointer-events-none"
              style={{ marginTop: `${nowLineTop + 28}px` }} // +28 for header
            >
              <div className="relative h-0.5 bg-red-500">
                <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarWeekGrid;
