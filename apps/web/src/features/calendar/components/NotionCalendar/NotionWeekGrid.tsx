/**
 * NotionWeekGrid - Week view grid matching Notion Calendar
 *
 * Features:
 * - All-day events section at top
 * - Time slots (00:00-23:00)
 * - Event blocks with color coding
 * - Current time indicator (red line)
 * - Overlap handling
 * - Click to add event
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { CALENDAR_COLORS, type CalendarSource, type CalendarColorKey } from './types';

interface NotionWeekGridProps {
  weekDates: Date[];
  events: CalendarEvent[];
  calendars: CalendarSource[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date, time?: string) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_HEIGHT = 48; // px per hour

// Generate time slots (00:00 to 23:00)
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  return `${i.toString().padStart(2, '0')}:00`;
});

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get event color based on category or use default
function getEventColor(event: CalendarEvent): { bg: string; border: string; text: string } {
  // Map event categories to colors
  const categoryColors: Record<string, CalendarColorKey> = {
    training: 'green',
    tournament: 'orange',
    testing: 'blue',
    mental: 'purple',
    putting: 'teal',
    range: 'green',
    mobility: 'pink',
    threshold: 'red',
  };

  const colorKey = categoryColors[event.category || ''] || 'gray';
  return CALENDAR_COLORS[colorKey];
}

// Calculate event position and size
function getEventStyle(event: CalendarEvent): React.CSSProperties {
  const [startHour, startMin] = event.start.split(':').map(Number);
  const [endHour, endMin] = event.end.split(':').map(Number);

  const startOffset = startHour * 60 + startMin;
  const endOffset = endHour * 60 + endMin;
  const duration = Math.max(endOffset - startOffset, 15); // Minimum 15 min

  const top = (startOffset / 60) * HOUR_HEIGHT;
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 20);

  return {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    minHeight: '20px',
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

const NotionWeekGrid: React.FC<NotionWeekGridProps> = ({
  weekDates,
  events,
  calendars,
  onEventClick,
  onAddEvent,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowLineTop, setNowLineTop] = useState<number | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);

  // Events grouped by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, { allDay: CalendarEvent[]; timed: CalendarEvent[] }> = {};
    for (const event of events) {
      if (!map[event.date]) {
        map[event.date] = { allDay: [], timed: [] };
      }
      if (event.isAllDay) {
        map[event.date].allDay.push(event);
      } else {
        map[event.date].timed.push(event);
      }
    }
    return map;
  }, [events]);

  // Check if any day has all-day events
  const hasAllDayEvents = useMemo(() => {
    return weekDates.some(date => {
      const dateKey = formatDateKey(date);
      return (eventsByDate[dateKey]?.allDay.length || 0) > 0;
    });
  }, [weekDates, eventsByDate]);

  // Update now line position
  useEffect(() => {
    const updateNowLine = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const offset = hours * 60 + minutes;
      setNowLineTop((offset / 60) * HOUR_HEIGHT);
    };

    updateNowLine();
    const interval = setInterval(updateNowLine, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current && nowLineTop !== null) {
      const scrollTo = Math.max(0, nowLineTop - 150);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [nowLineTop]);

  return (
    <div className="flex flex-col h-full">
      {/* Header row - Day names and dates */}
      <div className="flex border-b border-gray-200 bg-white ">
        {/* Time column spacer */}
        <div className="w-14 flex-shrink-0 border-r border-gray-100" />

        {/* Day headers */}
        {weekDates.map((date, idx) => {
          const dateKey = formatDateKey(date);
          const isToday = dateKey === todayKey;
          const isWeekend = idx >= 5;

          return (
            <div
              key={dateKey}
              className={`flex-1 min-w-[100px] flex flex-col items-center justify-center py-2 border-r border-gray-100 last:border-r-0 ${
                isWeekend ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-xs text-gray-500 font-medium">
                {DAY_NAMES[idx]}
              </span>
              <span
                className={`mt-0.5 w-7 h-7 flex items-center justify-center text-sm font-semibold rounded-full ${
                  isToday
                    ? 'bg-red-500 text-white'
                    : 'text-gray-900'
                }`}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day events row (if any) */}
      {hasAllDayEvents && (
        <div className="flex border-b border-gray-200 bg-white">
          <div className="w-14 flex-shrink-0 border-r border-gray-100 text-xs text-gray-400 flex items-center justify-end pr-2">

          </div>
          {weekDates.map((date, idx) => {
            const dateKey = formatDateKey(date);
            const allDayEvents = eventsByDate[dateKey]?.allDay || [];
            const isWeekend = idx >= 5;

            return (
              <div
                key={`allday-${dateKey}`}
                className={`flex-1 min-w-[100px] min-h-[28px] p-1 border-r border-gray-100 last:border-r-0 ${
                  isWeekend ? 'bg-gray-50' : ''
                }`}
              >
                {allDayEvents.map(event => {
                  const color = getEventColor(event);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="text-xs px-2 py-0.5 rounded cursor-pointer truncate hover:opacity-80"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        borderLeft: `3px solid ${color.border}`,
                      }}
                    >
                      {event.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Time labels column */}
          <div className="w-14 flex-shrink-0 border-r border-gray-100 sticky left-0 z-10 bg-white">
            {TIME_SLOTS.map((time, idx) => (
              <div
                key={time}
                className="relative text-right pr-2"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                <span
                  className="text-[11px] text-gray-400 absolute -top-[7px] right-2"
                  style={{ display: idx === 0 ? 'none' : undefined }}
                >
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, dayIdx) => {
            const dateKey = formatDateKey(date);
            const isToday = dateKey === todayKey;
            const isWeekend = dayIdx >= 5;
            const dayEvents = eventsByDate[dateKey]?.timed || [];
            const overlappingGroups = groupOverlappingEvents(dayEvents);

            return (
              <div
                key={dateKey}
                className={`flex-1 min-w-[100px] relative border-r border-gray-100 last:border-r-0 ${
                  isWeekend ? 'bg-gray-50/50' : ''
                }`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-event]')) return;
                  if (!onAddEvent) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top + (scrollRef.current?.scrollTop || 0);
                  const totalMinutes = Math.floor((y / HOUR_HEIGHT) * 60);
                  const hour = Math.floor(totalMinutes / 60);
                  const minutes = Math.round((totalMinutes % 60) / 15) * 15;
                  onAddEvent(date, `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
                }}
              >
                {/* Hour lines */}
                {TIME_SLOTS.map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: `${idx * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Half-hour lines (lighter) */}
                {TIME_SLOTS.map((_, idx) => (
                  <div
                    key={`half-${idx}`}
                    className="absolute w-full border-t border-gray-50"
                    style={{ top: `${idx * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                  />
                ))}

                {/* Current time indicator (only for today) */}
                {isToday && nowLineTop !== null && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: `${nowLineTop}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 h-0.5 bg-red-500" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {overlappingGroups.map((group) => {
                  const groupWidth = 100 / group.length;

                  return group.map((event, groupIdx) => {
                    const positionStyle = getEventStyle(event);
                    const color = getEventColor(event);

                    return (
                      <div
                        key={event.id}
                        data-event
                        className="rounded-[4px] cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
                        style={{
                          ...positionStyle,
                          left: `calc(${groupIdx * groupWidth}% + 2px)`,
                          width: `calc(${groupWidth}% - 4px)`,
                          backgroundColor: color.bg,
                          borderLeft: `3px solid ${color.border}`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="px-1.5 py-1 h-full overflow-hidden">
                          {/* Event title */}
                          <div
                            className="text-xs font-medium leading-tight truncate"
                            style={{ color: color.text }}
                          >
                            {event.title}
                          </div>

                          {/* Event time */}
                          <div className="text-[10px] text-gray-500 truncate">
                            {event.start} - {event.end}
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div className="text-[10px] text-gray-400 truncate">
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotionWeekGrid;
