/**
 * CalendarWeekView.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 *
 * 7-day week view (Man–Søn) with:
 * - Vertical time axis (05:00–23:00)
 * - Sticky column headers
 * - Today highlight
 * - Event blocks positioned by time
 * - Overlap handling (side-by-side)
 * - Now line
 *
 * Note: Dynamic positioning and calendar theming use inline styles.
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../hooks/useCalendarEvents';
import { SessionHoverPreview } from './SessionHoverPreview';

interface CalendarWeekViewProps {
  weekDates: Date[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddSession: (date: Date, time: string) => void;
}

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 5;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const HOUR_HEIGHT = 60; // px per hour

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getEventStyle(event: CalendarEvent): React.CSSProperties {
  const [startHour, startMin] = event.start.split(':').map(Number);
  const [endHour, endMin] = event.end.split(':').map(Number);

  const startOffset = (startHour - 5) * 60 + startMin;
  const endOffset = (endHour - 5) * 60 + endMin;
  const duration = endOffset - startOffset;

  const top = (startOffset / 60) * HOUR_HEIGHT;
  const height = Math.max((duration / 60) * HOUR_HEIGHT, 24);

  return {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    minHeight: '24px',
  };
}

function getEventColors(event: CalendarEvent): {
  bg: string;
  border: string;
  text: string;
} {
  switch (event.status) {
    case 'recommended':
      return {
        bg: 'var(--calendar-event-recommended-bg)',
        border: 'var(--calendar-event-recommended-border)',
        text: 'var(--calendar-event-recommended-text)',
      };
    case 'in_progress':
      return {
        bg: 'var(--calendar-event-inprogress-bg)',
        border: 'var(--calendar-event-inprogress-border)',
        text: 'var(--calendar-event-inprogress-text)',
      };
    case 'completed':
      return {
        bg: 'var(--calendar-event-completed-bg)',
        border: 'var(--calendar-event-completed-border)',
        text: 'var(--calendar-event-completed-text)',
      };
    case 'ghost':
      return {
        bg: 'var(--calendar-event-ghost-bg)',
        border: 'var(--calendar-event-ghost-border)',
        text: 'var(--calendar-event-ghost-text)',
      };
    case 'external':
      return {
        bg: 'var(--calendar-event-external-bg)',
        border: 'var(--calendar-event-external-border)',
        text: 'var(--calendar-event-external-text)',
      };
    default:
      // Planned or category-specific
      if (event.category === 'mental') {
        return {
          bg: 'var(--calendar-event-mental-bg)',
          border: 'var(--calendar-event-mental-border)',
          text: 'var(--calendar-text-primary)',
        };
      }
      if (event.category === 'testing') {
        return {
          bg: 'var(--calendar-event-testing-bg)',
          border: 'var(--calendar-event-testing-border)',
          text: 'var(--calendar-text-primary)',
        };
      }
      return {
        bg: 'var(--calendar-event-planned-bg)',
        border: 'var(--calendar-event-planned-border)',
        text: 'var(--calendar-event-planned-text)',
      };
  }
}

// Overlap handling: group events by time overlap
function groupOverlappingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [sorted[0]];
  let currentEnd = sorted[0].end;

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i];
    if (event.start < currentEnd) {
      // Overlaps
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

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  weekDates,
  events,
  onEventClick,
  onAddSession,
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

      if (hours >= 5 && hours <= 23) {
        const offset = (hours - 5) * 60 + minutes;
        setNowLineTop((offset / 60) * HOUR_HEIGHT);
      } else {
        setNowLineTop(null);
      }
    };

    updateNowLine();
    const interval = setInterval(updateNowLine, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current && nowLineTop !== null) {
      scrollRef.current.scrollTop = Math.max(0, nowLineTop - 200);
    }
  }, [nowLineTop]);

  return (
    <div className="flex flex-col h-full bg-tier-white">
      {/* Header row with day names - sticky */}
      <div className="flex border-b-2 border-tier-border-default  bg-tier-white shadow-sm">
        {/* Time column header */}
        <div className="w-16 flex-shrink-0 border-r-2 border-tier-border-default" />

        {/* Day headers */}
        {weekDates.map((date, idx) => {
          const dateKey = formatDateKey(date);
          const isToday = dateKey === todayKey;
          const isWeekend = idx >= 5;

          return (
            <div
              key={dateKey}
              className={`flex-1 min-w-[120px] flex flex-col items-center justify-center py-3 border-r-2 border-tier-border-default last:border-r-0 ${
                isWeekend ? 'bg-tier-surface-base' : 'bg-tier-white'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isWeekend ? 'text-tier-text-tertiary' : 'text-tier-text-tertiary'
                }`}
              >
                {DAY_NAMES[idx]}
              </span>
              <span
                className={`text-lg font-semibold mt-0.5 ${
                  isToday
                    ? 'w-8 h-8 flex items-center justify-center rounded-full bg-tier-navy text-white'
                    : isWeekend
                    ? 'text-tier-text-secondary'
                    : 'text-tier-navy'
                }`}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex flex-1 overflow-auto border-l-2 border-tier-border-default">
        {/* Time column */}
        <div className="w-16 flex-shrink-0 border-r-2 border-tier-border-default sticky left-0 z-10 bg-tier-white">
          {TIME_SLOTS.map((time, idx) => (
            <div
              key={time}
              className="flex items-start justify-end pr-2 text-xs text-tier-text-tertiary"
              style={{
                height: `${HOUR_HEIGHT}px`,
                marginTop: idx === 0 ? '-6px' : 0,
              }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date, dayIdx) => {
          const dateKey = formatDateKey(date);
          const isToday = dateKey === todayKey;
          const isWeekend = dayIdx >= 5;
          const dayEvents = eventsByDate[dateKey] || [];
          const overlappingGroups = groupOverlappingEvents(dayEvents);

          return (
            <div
              key={dateKey}
              className={`flex-1 min-w-[120px] border-r-2 border-tier-border-default last:border-r-0 relative ${
                isToday
                  ? 'bg-tier-navy/5'
                  : isWeekend
                  ? 'bg-tier-surface-base'
                  : ''
              }`}
            >
              {/* Hour lines */}
              {TIME_SLOTS.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute w-full border-t border-tier-border-default"
                  style={{ top: `${idx * HOUR_HEIGHT}px` }}
                />
              ))}

              {/* Now line (only for today) */}
              {isToday && nowLineTop !== null && (
                <div
                  className="absolute w-full h-0.5 z-10 pointer-events-none bg-tier-error"
                  style={{ top: `${nowLineTop}px` }}
                >
                  <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-tier-error" />
                </div>
              )}

              {/* Events */}
              {overlappingGroups.map((group) => {
                const groupWidth = 100 / group.length;

                return group.map((event, groupIdx) => {
                  const positionStyle = getEventStyle(event);
                  const colors = getEventColors(event);

                  // Calculate duration in minutes
                  const [startHour, startMin] = event.start.split(':').map(Number);
                  const [endHour, endMin] = event.end.split(':').map(Number);
                  const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                  const isShortSession = durationMinutes < 30;

                  return (
                    <SessionHoverPreview key={event.id} event={event}>
                      <div
                        data-event="true"
                        className="px-1.5 py-1 rounded cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                        style={{
                          ...positionStyle,
                          left: `${groupIdx * groupWidth}%`,
                          width: `${groupWidth - 2}%`,
                          marginLeft: '4px',
                          marginRight: '4px',
                          backgroundColor: colors.bg,
                          borderLeft: `3px solid ${colors.border}`,
                          borderStyle: event.status === 'ghost' ? 'dashed' : 'solid',
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        {/* Time */}
                        <div className={`font-medium text-tier-text-tertiary ${isShortSession ? 'text-[8px]' : 'text-[10px]'}`}>
                          {event.start}
                        </div>

                        {/* Title */}
                        <div
                          className={`font-medium ${isShortSession ? 'text-[8px] line-clamp-1' : 'text-xs truncate'}`}
                          style={{ color: colors.text }}
                        >
                          {event.title}
                        </div>

                        {/* Location - only show for longer sessions */}
                        {!isShortSession && event.location && (
                          <div className="text-[10px] truncate text-tier-text-tertiary">
                            {event.location}
                          </div>
                        )}

                        {/* Badges - only show for longer sessions */}
                        {!isShortSession && event.badges && event.badges.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {event.badges.slice(0, 2).map((badge) => {
                              const badgeClasses =
                                badge === 'Anbefalt' ? 'bg-tier-navy/10 text-tier-navy' :
                                badge === 'Fullført' ? 'bg-tier-success/10 text-tier-success' :
                                badge === 'Pågår' ? 'bg-tier-warning/10 text-tier-warning' :
                                'bg-tier-surface-base text-tier-text-secondary';
                              return (
                                <span
                                  key={badge}
                                  className={`text-[9px] px-1 py-0.5 rounded ${badgeClasses}`}
                                >
                                  {badge}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </SessionHoverPreview>
                  );
                });
              })}

              {/* Click to add overlay */}
              <div
                className="absolute inset-0"
                style={{
                  height: `${TIME_SLOTS.length * HOUR_HEIGHT}px`,
                }}
                onClick={(e) => {
                  // Only trigger if not clicking on an event
                  if ((e.target as HTMLElement).closest('[data-event]')) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const hour = Math.floor(y / HOUR_HEIGHT) + 5;
                  onAddSession(date, `${hour.toString().padStart(2, '0')}:00`);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWeekView;
