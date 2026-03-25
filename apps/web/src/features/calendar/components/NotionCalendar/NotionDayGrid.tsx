/**
 * NotionDayGrid - Day view grid matching Notion Calendar
 *
 * Features:
 * - Single day column with full-width events
 * - All-day events section
 * - Time slots (00:00-23:00)
 * - Current time indicator
 * - Click to add event
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { CALENDAR_COLORS, type CalendarSource, type CalendarColorKey } from './types';

interface NotionDayGridProps {
  date: Date;
  events: CalendarEvent[];
  calendars: CalendarSource[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date, time?: string) => void;
}

const HOUR_HEIGHT = 60; // px per hour

// Generate time slots (00:00 to 23:00)
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  return `${i.toString().padStart(2, '0')}:00`;
});

// Get event color based on category
function getEventColor(event: CalendarEvent): { bg: string; border: string; text: string } {
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
  const duration = Math.max(endOffset - startOffset, 15);

  const top = (startOffset / 60) * HOUR_HEIGHT;
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 24);

  return {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    minHeight: '24px',
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

const NotionDayGrid: React.FC<NotionDayGridProps> = ({
  date,
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

  const dateKey = date.toISOString().split('T')[0];
  const todayKey = today.toISOString().split('T')[0];
  const isToday = dateKey === todayKey;

  // Separate all-day and timed events
  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDay: CalendarEvent[] = [];
    const timed: CalendarEvent[] = [];

    for (const event of events) {
      if (event.isAllDay) {
        allDay.push(event);
      } else {
        timed.push(event);
      }
    }

    return { allDayEvents: allDay, timedEvents: timed };
  }, [events]);

  const overlappingGroups = useMemo(() => groupOverlappingEvents(timedEvents), [timedEvents]);

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
      const scrollTo = Math.max(0, nowLineTop - 200);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [nowLineTop]);

  // Format date for header
  const dayName = date.toLocaleDateString('nb-NO', { weekday: 'long' });
  const dateNum = date.getDate();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex border-b border-gray-200 bg-white ">
        <div className="w-14 flex-shrink-0 border-r border-gray-100" />
        <div className="flex-1 flex flex-col items-center justify-center py-3">
          <span className="text-xs text-gray-500 font-medium">{dayName}</span>
          <span
            className={`mt-0.5 w-9 h-9 flex items-center justify-center text-lg font-semibold rounded-full ${
              isToday ? 'bg-red-500 text-white' : 'text-gray-900'
            }`}
          >
            {dateNum}
          </span>
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-gray-200 bg-white">
          <div className="w-14 flex-shrink-0 border-r border-gray-100" />
          <div className="flex-1 p-2 space-y-1">
            {allDayEvents.map(event => {
              const color = getEventColor(event);
              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80"
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
        </div>
      )}

      {/* Time grid */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
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

          {/* Day column */}
          <div
            className="flex-1 relative"
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

            {/* Half-hour lines */}
            {TIME_SLOTS.map((_, idx) => (
              <div
                key={`half-${idx}`}
                className="absolute w-full border-t border-gray-50"
                style={{ top: `${idx * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
              />
            ))}

            {/* Current time indicator */}
            {isToday && nowLineTop !== null && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: `${nowLineTop}px` }}
              >
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
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
                    className="rounded cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
                    style={{
                      ...positionStyle,
                      left: `calc(${groupIdx * groupWidth}% + 4px)`,
                      width: `calc(${groupWidth}% - 8px)`,
                      backgroundColor: color.bg,
                      borderLeft: `4px solid ${color.border}`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="px-2 py-1.5 h-full overflow-hidden">
                      <div
                        className="text-sm font-medium leading-tight"
                        style={{ color: color.text }}
                      >
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {event.start} - {event.end}
                      </div>
                      {event.location && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate">
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionDayGrid;
