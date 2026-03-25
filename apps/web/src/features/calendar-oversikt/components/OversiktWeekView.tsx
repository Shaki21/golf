/**
 * OversiktWeekView Component
 *
 * Read-only 7-day week view (Man-Søn) showing unified events.
 * Uses source-based color coding instead of status-based.
 *
 * Uses semantic tokens only (no raw hex values).
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  UnifiedCalendarEvent,
  OversiktWeekViewProps,
  EVENT_SOURCE_COLORS,
  formatDateKey,
} from '../types';

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 5;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const HOUR_HEIGHT = 60; // px per hour

function getEventStyle(event: UnifiedCalendarEvent): React.CSSProperties {
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

function groupOverlappingEvents(events: UnifiedCalendarEvent[]): UnifiedCalendarEvent[][] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const groups: UnifiedCalendarEvent[][] = [];
  let currentGroup: UnifiedCalendarEvent[] = [sorted[0]];
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

export const OversiktWeekView: React.FC<OversiktWeekViewProps> = ({
  weekDates,
  events,
  onEventClick,
  onDayClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowLineTop, setNowLineTop] = useState<number | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);

  const eventsByDate = useMemo(() => {
    const map: Record<string, UnifiedCalendarEvent[]> = {};
    for (const event of events) {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    }
    return map;
  }, [events]);

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
    const interval = setInterval(updateNowLine, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current && nowLineTop !== null) {
      scrollRef.current.scrollTop = Math.max(0, nowLineTop - 200);
    }
  }, [nowLineTop]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--calendar-surface-base)' }}
    >
      {/* Header row with day names */}
      <div
        className="flex border-b "
        style={{
          backgroundColor: 'var(--calendar-surface-base)',
          borderColor: 'var(--calendar-border)',
        }}
      >
        <div
          className="w-16 flex-shrink-0 border-r"
          style={{ borderColor: 'var(--calendar-border)' }}
        />

        {weekDates.map((date, idx) => {
          const dateKey = formatDateKey(date);
          const isToday = dateKey === todayKey;
          const isWeekend = idx >= 5;

          return (
            <div
              key={dateKey}
              className="flex-1 min-w-[100px] flex flex-col items-center justify-center py-3 border-r last:border-r-0 cursor-pointer"
              style={{
                backgroundColor: isWeekend
                  ? 'var(--calendar-surface-weekend)'
                  : 'var(--calendar-surface-base)',
                borderColor: 'var(--calendar-border)',
              }}
              onClick={() => onDayClick?.(date)}
            >
              <span
                className="text-xs font-medium"
                style={{
                  color: isWeekend
                    ? 'var(--calendar-text-weekend)'
                    : 'var(--calendar-text-tertiary)',
                }}
              >
                {DAY_NAMES[idx]}
              </span>
              <span
                className={`text-lg font-semibold mt-0.5 ${
                  isToday
                    ? 'w-8 h-8 flex items-center justify-center rounded-full'
                    : ''
                }`}
                style={{
                  backgroundColor: isToday
                    ? 'var(--calendar-today-marker-bg)'
                    : 'transparent',
                  color: isToday
                    ? 'var(--calendar-today-marker-text)'
                    : isWeekend
                    ? 'var(--calendar-text-weekend)'
                    : 'var(--calendar-text-primary)',
                }}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex flex-1 overflow-auto">
        {/* Time column */}
        <div
          className="w-16 flex-shrink-0 border-r sticky left-0 z-10"
          style={{
            backgroundColor: 'var(--calendar-surface-base)',
            borderColor: 'var(--calendar-border)',
          }}
        >
          {TIME_SLOTS.map((time, idx) => (
            <div
              key={time}
              className="flex items-start justify-end pr-2 text-xs"
              style={{
                height: `${HOUR_HEIGHT}px`,
                color: 'var(--calendar-text-muted)',
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
              className="flex-1 min-w-[100px] border-r last:border-r-0 relative"
              style={{
                backgroundColor: isToday
                  ? 'var(--calendar-surface-today)'
                  : isWeekend
                  ? 'var(--calendar-surface-weekend)'
                  : 'transparent',
                borderColor: 'var(--calendar-border)',
              }}
            >
              {/* Hour lines */}
              {TIME_SLOTS.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute w-full border-t"
                  style={{
                    top: `${idx * HOUR_HEIGHT}px`,
                    borderColor: 'var(--calendar-grid-line)',
                  }}
                />
              ))}

              {/* Now line (only for today) */}
              {isToday && nowLineTop !== null && (
                <div
                  className="absolute w-full h-0.5 z-10 pointer-events-none"
                  style={{
                    top: `${nowLineTop}px`,
                    backgroundColor: 'var(--calendar-now-line)',
                  }}
                >
                  <div
                    className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--calendar-now-line)' }}
                  />
                </div>
              )}

              {/* Events */}
              {overlappingGroups.map((group) => {
                const groupWidth = 100 / group.length;

                return group.map((event, groupIdx) => {
                  const positionStyle = getEventStyle(event);
                  const colors = EVENT_SOURCE_COLORS[event.source];

                  return (
                    <div
                      key={event.id}
                      data-event
                      className="px-1.5 py-1 rounded cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                      style={{
                        ...positionStyle,
                        left: `${groupIdx * groupWidth}%`,
                        width: `${groupWidth - 2}%`,
                        marginLeft: '4px',
                        marginRight: '4px',
                        backgroundColor: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                      }}
                      onClick={() => onEventClick?.(event)}
                    >
                      {/* Time */}
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: 'var(--calendar-text-tertiary)' }}
                      >
                        {event.start}
                      </div>

                      {/* Title */}
                      <div
                        className="text-xs font-medium truncate"
                        style={{ color: colors.text }}
                      >
                        {event.title}
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div
                          className="text-[10px] truncate"
                          style={{ color: 'var(--calendar-text-muted)' }}
                        >
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                });
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OversiktWeekView;
