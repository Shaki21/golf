/**
 * DayView Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic positioning)
 */

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Play, Check, Clock, MoreVertical } from 'lucide-react';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../../components/typography';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const DayView = ({
  date,
  sessions = [],
  onSessionClick,
  onTimeSlotClick,
  onNavigate,
  onAddEvent,
  onStartSession,
}) => {
  const container = useRef(null);
  const hours = Array.from({ length: 18 }, (_, i) => i + 5); // 05:00 - 22:00

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  // Scroll to current time on mount
  useEffect(() => {
    if (container.current && isToday) {
      const currentMinute = new Date().getHours() * 60 + new Date().getMinutes();
      container.current.scrollTop =
        ((currentMinute - 5 * 60) / (18 * 60)) * container.current.scrollHeight - 200;
    }
  }, [isToday]);

  const formatHour = (hour) => `${hour.toString().padStart(2, '0')}:00`;

  // Session colors using semantic tokens (see COLOR_USAGE_RULES.md)
  const getSessionColor = (type) => {
    const colors = {
      teknikk: { bg: 'bg-amber-100', border: 'border-tier-gold', text: 'text-tier-navy', accent: 'bg-tier-gold' },
      golfslag: { bg: 'bg-blue-100', border: 'border-tier-navy', text: 'text-tier-navy', accent: 'bg-tier-navy' },
      spill: { bg: 'bg-emerald-100', border: 'border-emerald-600', text: 'text-tier-navy', accent: 'bg-emerald-600' },
      konkurranse: { bg: 'bg-purple-100', border: 'border-purple-600', text: 'text-tier-navy', accent: 'bg-purple-600' },
      fysisk: { bg: 'bg-orange-100', border: 'border-orange-600', text: 'text-tier-navy', accent: 'bg-orange-600' },
      mental: { bg: 'bg-tier-white', border: 'border-tier-border-default', text: 'text-tier-text-secondary', accent: 'bg-tier-text-tertiary' },
    };
    return colors[type] || { bg: 'bg-tier-white', border: 'border-tier-border-default', text: 'text-tier-text-secondary', accent: 'bg-tier-text-tertiary' };
  };

  const getSessionsForHour = (hour) => {
    return sessions.filter(session => {
      const sessionHour = parseInt(session.time?.split(':')[0] || 0);
      return sessionHour === hour;
    });
  };

  // Calculate session position and height for time grid view
  const getSessionStyle = (session) => {
    const [hours, minutes] = (session.time || '09:00').split(':').map(Number);
    const startMinutes = (hours - 5) * 60 + minutes;
    const duration = session.duration || 60;

    return {
      top: `${(startMinutes / (18 * 60)) * 100}%`,
      height: `${(duration / (18 * 60)) * 100}%`,
    };
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentMinutes = (now.getHours() - 5) * 60 + now.getMinutes();
    return `${(currentMinutes / (18 * 60)) * 100}%`;
  };

  return (
    <div className="flex h-full flex-col bg-tier-white rounded-xl shadow-sm ring-1 ring-tier-border-default overflow-hidden">
      {/* Header */}
      <header className="flex flex-none items-center justify-between border-b border-tier-border-default px-6 py-4">
        <div>
          <SectionTitle className="text-base font-semibold leading-6 text-tier-navy">
            {dayNames[date.getDay()]}
          </SectionTitle>
          <p className="mt-1 text-sm text-tier-text-secondary">
            <time dateTime={date.toISOString().split('T')[0]}>
              {date.getDate()}. {monthNames[date.getMonth()]} {date.getFullYear()}
            </time>
          </p>
        </div>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-lg bg-tier-white shadow-sm ring-1 ring-tier-border-default md:items-stretch">
            <button
              type="button"
              onClick={() => onNavigate?.(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-l-lg text-tier-text-secondary hover:text-tier-navy focus:relative md:hover:bg-tier-surface-base"
            >
              <span className="sr-only">Previous day</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                // Navigate to today - parent handles this
                onNavigate?.(0, true);
              }}
              className="hidden px-3.5 text-sm font-semibold text-tier-navy hover:bg-tier-surface-base focus:relative md:block"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.(1)}
              className="flex h-9 w-9 items-center justify-center rounded-r-lg text-tier-text-secondary hover:text-tier-navy focus:relative md:hover:bg-tier-surface-base"
            >
              <span className="sr-only">Next day</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {onAddEvent && (
            <div className="hidden md:ml-4 md:flex md:items-center">
              <div className="ml-6 h-6 w-px bg-tier-border-default" />
              <button
                type="button"
                onClick={onAddEvent}
                className="ml-6 rounded-lg bg-tier-navy px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-tier-navy/90"
              >
                New event
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Today indicator badge */}
      {isToday && (
        <div className="flex-none bg-tier-navy text-white px-6 py-2 text-sm font-medium">
          Today
        </div>
      )}

      {/* Time Grid */}
      <div
        ref={container}
        className="flex flex-auto overflow-auto max-h-[calc(100vh-280px)]"
      >
        <div className="flex flex-auto">
          {/* Time Labels */}
          <div className="sticky left-0 z-10 w-16 flex-none bg-tier-white">
            <div className="relative" style={{ height: `${hours.length * 4}rem` }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full text-right pr-3"
                  style={{ top: `${((hour - 5) / 18) * 100}%` }}
                >
                  <span className="relative -top-2 text-xs font-medium text-tier-text-tertiary">
                    {formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Events Column */}
          <div className="flex-auto border-l border-tier-border-default">
            <div
              className="relative"
              style={{ height: `${hours.length * 4}rem` }}
            >
              {/* Hour grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  onClick={() => onTimeSlotClick?.(hour)}
                  className="absolute w-full border-b border-tier-border-default hover:bg-tier-surface-base/50 cursor-pointer transition-colors"
                  style={{
                    top: `${((hour - 5) / 18) * 100}%`,
                    height: `${(1 / 18) * 100}%`,
                  }}
                />
              ))}

              {/* Current time indicator - uses brand primary for visibility */}
              {isToday && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: getCurrentTimePosition() }}
                >
                  <div className="h-3 w-3 rounded-full bg-tier-navy -ml-1.5" />
                  <div className="flex-auto h-0.5 bg-tier-navy" />
                </div>
              )}

              {/* Sessions */}
              {sessions.map((session) => {
                const colors = getSessionColor(session.type);
                const style = getSessionStyle(session);
                const isCompleted = session.status === 'completed';
                const isRest = session.status === 'rest';

                return (
                  <div
                    key={session.id}
                    className={classNames(
                      'absolute left-2 right-2 rounded-lg overflow-hidden shadow-sm',
                      colors.bg,
                      'border-l-4',
                      colors.border,
                      isCompleted && 'opacity-60',
                      'hover:shadow-md transition-shadow cursor-pointer'
                    )}
                    style={{
                      top: style.top,
                      height: style.height,
                      minHeight: '3.5rem',
                    }}
                    onClick={() => onSessionClick?.(session)}
                  >
                    <div className="flex h-full p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={classNames('text-xs font-medium', colors.text)}>
                            {session.time}
                          </span>
                          {session.duration > 0 && (
                            <span className={classNames('text-xs', colors.text)}>
                              · {session.duration} min
                            </span>
                          )}
                        </div>
                        <CardTitle className={classNames('text-sm font-semibold truncate', colors.text)}>
                          {session.name}
                        </CardTitle>
                        {session.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className={classNames('h-3 w-3', colors.text)} />
                            <span className={classNames('text-xs truncate', colors.text)}>
                              {session.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-start gap-2 ml-2">
                        {isCompleted ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tier-success">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        ) : !isRest && onStartSession && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartSession?.(session);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-tier-navy hover:bg-tier-navy/90 transition-colors"
                          >
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionClick?.(session);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                        >
                          <MoreVertical className={classNames('h-4 w-4', colors.text)} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Session Summary (Mobile) */}
      {sessions.length > 0 && (
        <div className="flex-none border-t border-tier-border-default p-4 sm:hidden">
          <SubSectionTitle className="text-sm font-semibold text-tier-navy mb-3">
            {sessions.length} {sessions.length === 1 ? 'event' : 'events'} today
          </SubSectionTitle>
          <div className="space-y-2">
            {sessions.slice(0, 3).map((session) => {
              const colors = getSessionColor(session.type);
              return (
                <button
                  key={session.id}
                  onClick={() => onSessionClick?.(session)}
                  className={classNames(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left',
                    colors.bg,
                    'hover:opacity-80 transition-opacity'
                  )}
                >
                  <div className={classNames('h-10 w-1 rounded-full', colors.accent)} />
                  <div className="flex-1 min-w-0">
                    <p className={classNames('text-sm font-semibold truncate', colors.text)}>
                      {session.name}
                    </p>
                    <p className={classNames('text-xs', colors.text)}>
                      {session.time} · {session.duration} min
                    </p>
                  </div>
                  {session.status === 'completed' && (
                    <Check className="h-5 w-5 text-tier-success" />
                  )}
                </button>
              );
            })}
            {sessions.length > 3 && (
              <p className="text-xs text-tier-text-tertiary text-center pt-1">
                + {sessions.length - 3} more events
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Clock className="h-12 w-12 text-tier-text-tertiary mb-4" />
          <SubSectionTitle className="text-lg font-semibold text-tier-navy mb-2">
            No events
          </SubSectionTitle>
          <p className="text-sm text-tier-text-secondary mb-4">
            You have no scheduled events this day.
          </p>
          {onAddEvent && (
            <button
              onClick={onAddEvent}
              className="rounded-lg bg-tier-navy px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-tier-navy/90"
            >
              Add event
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DayView;
