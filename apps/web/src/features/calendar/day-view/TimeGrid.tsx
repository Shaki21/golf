/**
 * Time Grid Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic positioning)
 *
 * Vertical hour grid (00-24) with:
 * - Current time indicator ("now line")
 * - Auto-scroll to "now" on initial load
 * - Event cards positioned based on time
 * - Ghost slot for unscheduled recommendations (S2 state)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { CalendarEvent, TimeGridProps } from './types';
import { EventCard } from './EventCard';

// Configuration
const HOUR_START = 5; // 05:00
const HOUR_END = 23; // 23:00
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_HEIGHT_REM = 4; // Height of each hour in rem

// Helper: Calculate position percentage from time
const getPositionFromTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = (hours - HOUR_START) * 60 + minutes;
  return (totalMinutes / (TOTAL_HOURS * 60)) * 100;
};

// Helper: Calculate height percentage from duration
const getHeightFromDuration = (duration: number): number => {
  return (duration / (TOTAL_HOURS * 60)) * 100;
};

// Helper: Format hour to display
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export const TimeGrid: React.FC<TimeGridProps> = ({
  date,
  events,
  recommendedSlot,
  onEventClick,
  onTimeSlotClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Check if date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [date]);

  // Calculate current time position
  const nowPosition = useMemo(() => {
    if (!isToday) return null;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours < HOUR_START || hours >= HOUR_END) return null;

    return getPositionFromTime(`${hours}:${minutes}`);
  }, [isToday]);

  // Auto-scroll to "now" on initial load
  useEffect(() => {
    if (!containerRef.current || hasScrolled.current) return;

    if (isToday && nowPosition !== null) {
      const container = containerRef.current;
      const gridHeight = container.scrollHeight;
      const scrollPosition = (nowPosition / 100) * gridHeight - container.clientHeight / 3;

      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
      hasScrolled.current = true;
    }
  }, [isToday, nowPosition]);

  // Reset scroll flag when date changes
  useEffect(() => {
    hasScrolled.current = false;
  }, [date]);

  // Separate all-day and timed events
  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDay: CalendarEvent[] = [];
    const timed: CalendarEvent[] = [];

    events.forEach((event) => {
      if (event.type === 'ak_workout' && event.workout?.isAllDay) {
        allDay.push(event);
      } else if (event.type === 'external' && event.external?.isAllDay) {
        allDay.push(event);
      } else {
        timed.push(event);
      }
    });

    return { allDayEvents: allDay, timedEvents: timed };
  }, [events]);

  // Generate hour lines
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);

  // Get event position and size
  const getEventStyle = (event: CalendarEvent) => {
    let startTime: string;
    let duration: number;

    if (event.type === 'ak_workout' && event.workout) {
      startTime = event.workout.scheduledTime || '09:00';
      duration = event.workout.duration;
    } else if (event.type === 'external' && event.external) {
      startTime = event.external.startTime;
      // Calculate duration from start and end time
      const [startH, startM] = event.external.startTime.split(':').map(Number);
      const [endH, endM] = event.external.endTime.split(':').map(Number);
      duration = (endH * 60 + endM) - (startH * 60 + startM);
    } else {
      return { top: '0%', height: '0%' };
    }

    const top = getPositionFromTime(startTime);
    const height = getHeightFromDuration(duration);

    return {
      top: `${top}%`,
      height: `${Math.max(height, 3)}%`, // Minimum height for visibility
      minHeight: '3rem',
    };
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-tier-white"
      role="region"
      aria-label="Dagskalender tidslinje"
    >
      {/* All-Day Lane */}
      {allDayEvents.length > 0 && (
        <div
          className="border-b border-tier-border-default py-3 pr-4 pl-[76px] flex flex-wrap gap-2 min-h-[52px] bg-tier-surface-base"
          role="list"
          aria-label="Heldagshendelser"
        >
          {allDayEvents.map((event) => {
            const isAK = event.type === 'ak_workout';
            const title = isAK ? event.workout?.name : event.external?.title;

            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer transition-opacity border ${
                  isAK
                    ? 'bg-tier-navy/10 text-tier-navy border-tier-navy'
                    : 'bg-tier-white text-tier-text-secondary border-tier-border-default'
                }`}
                role="listitem"
                aria-label={`Heldagshendelse: ${title}`}
              >
                {title}
              </button>
            );
          })}
        </div>
      )}

      {/* Time Grid */}
      <div
        className="flex relative"
        style={{ minHeight: `${TOTAL_HOURS * HOUR_HEIGHT_REM}rem` }}
      >
        {/* Time Labels */}
        <div className="w-[60px] flex-shrink-0 sticky left-0 z-10 bg-tier-white">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute right-3 -translate-y-1/2 text-xs font-medium tabular-nums text-tier-text-tertiary"
              style={{ top: `${((hour - HOUR_START) / TOTAL_HOURS) * 100}%` }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Events Column */}
        <div className="flex-1 relative border-l border-tier-border-default">
          {/* Hour grid lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-tier-border-default cursor-pointer transition-colors hover:bg-black/5"
              style={{
                top: `${((hour - HOUR_START) / TOTAL_HOURS) * 100}%`,
                height: `${(1 / TOTAL_HOURS) * 100}%`,
              }}
              onClick={() => onTimeSlotClick?.(hour)}
              role="button"
              tabIndex={0}
              aria-label={`Legg til hendelse kl ${formatHour(hour)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTimeSlotClick?.(hour);
                }
              }}
            />
          ))}

          {/* Now line */}
          {nowPosition !== null && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: `${nowPosition}%` }}
              aria-label="Nåværende tidspunkt"
              role="presentation"
            >
              <div
                className="w-2.5 h-2.5 rounded-full -ml-[5px] shadow-[0_0_0_2px_white] bg-tier-navy"
                aria-hidden="true"
              />
              <div className="flex-1 h-0.5 bg-tier-navy" aria-hidden="true" />
            </div>
          )}

          {/* Ghost slot for S2 state */}
          {recommendedSlot && (
            <div
              className="absolute left-2 right-2 z-5 opacity-40 border-2 border-dashed border-tier-navy"
              style={{
                top: `${getPositionFromTime(recommendedSlot.time)}%`,
                height: `${getHeightFromDuration(recommendedSlot.duration)}%`,
                minHeight: '3rem',
              }}
            >
              <EventCard
                event={{
                  id: 'ghost-slot',
                  type: 'ak_workout',
                  workout: {
                    id: 'ghost',
                    name: 'Foreslått tid',
                    category: 'teknikk',
                    duration: recommendedSlot.duration,
                    scheduledTime: recommendedSlot.time,
                    status: 'scheduled',
                    isRecommended: true,
                    isAllDay: false,
                  },
                }}
                isGhost={true}
                onClick={() => {}}
              />
            </div>
          )}

          {/* Timed events */}
          {timedEvents.map((event) => {
            const eventStyle = getEventStyle(event);

            return (
              <div
                key={event.id}
                className="absolute left-2 right-2 z-5"
                style={eventStyle}
              >
                <EventCard event={event} onClick={() => onEventClick(event)} />
              </div>
            );
          })}

          {/* Empty state */}
          {timedEvents.length === 0 && allDayEvents.length === 0 && !recommendedSlot && (
            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-center text-sm text-tier-text-tertiary">
              Ingen hendelser denne dagen
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;
