/**
 * OversiktDayView Component
 *
 * Read-only day view showing events in a list format.
 * Simplified version without state machine or Decision Anchor.
 *
 * Uses semantic tokens only (no raw hex values).
 */

import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import {
  UnifiedCalendarEvent,
  OversiktDayViewProps,
  EVENT_SOURCE_COLORS,
  formatDateKey,
} from '../types';
import { SubSectionTitle } from '../../../components/typography/Headings';

export const OversiktDayView: React.FC<OversiktDayViewProps> = ({
  date,
  events,
  onEventClick,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);
  const dateKey = formatDateKey(date);
  const isToday = dateKey === todayKey;

  // Sort events by time, all-day events first
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return a.start.localeCompare(b.start);
    });
  }, [events]);

  const dateLabel = date.toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="flex flex-col h-full overflow-auto"
      style={{ backgroundColor: 'var(--calendar-surface-base)' }}
    >
      {/* Date header */}
      <div
        className=" px-4 py-4 border-b"
        style={{
          backgroundColor: isToday
            ? 'var(--calendar-surface-today)'
            : 'var(--calendar-surface-base)',
          borderColor: 'var(--calendar-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar
            size={18}
            style={{ color: 'var(--calendar-text-tertiary)' }}
          />
          <span
            className="text-base font-medium capitalize"
            style={{ color: 'var(--calendar-text-primary)' }}
          >
            {dateLabel}
          </span>
          {isToday && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--calendar-today-marker-bg)',
                color: 'var(--calendar-today-marker-text)',
              }}
            >
              I dag
            </span>
          )}
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1 p-4">
        {sortedEvents.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: 'var(--calendar-text-muted)' }}
          >
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ingen hendelser denne dagen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event) => {
              const colors = EVENT_SOURCE_COLORS[event.source];

              return (
                <div
                  key={event.id}
                  className="p-3 rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: colors.bg,
                    borderLeft: `4px solid ${colors.border}`,
                  }}
                  onClick={() => onEventClick?.(event)}
                >
                  {/* Source badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: colors.border,
                        color: 'white',
                      }}
                    >
                      {colors.label}
                    </span>
                    {event.isAllDay && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--calendar-surface-elevated)',
                          color: 'var(--calendar-text-tertiary)',
                        }}
                      >
                        Hel dag
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <SubSectionTitle
                    style={{ color: colors.text, marginBottom: 0 }}
                  >
                    {event.title}
                  </SubSectionTitle>

                  {/* Time */}
                  {!event.isAllDay && (
                    <div
                      className="flex items-center gap-1 mt-1"
                      style={{ color: 'var(--calendar-text-secondary)' }}
                    >
                      <Clock size={12} />
                      <span className="text-xs">
                        {event.start} – {event.end}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {event.location && (
                    <div
                      className="flex items-center gap-1 mt-1"
                      style={{ color: 'var(--calendar-text-muted)' }}
                    >
                      <MapPin size={12} />
                      <span className="text-xs">{event.location}</span>
                    </div>
                  )}

                  {/* Description */}
                  {event.description && (
                    <p
                      className="text-xs mt-2 line-clamp-2"
                      style={{ color: 'var(--calendar-text-secondary)' }}
                    >
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OversiktDayView;
