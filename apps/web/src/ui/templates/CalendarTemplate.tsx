import React from 'react';
import Card from '../primitives/Card';

/**
 * CalendarTemplate
 * A mobile-first weekly calendar template following TIER Golf design system
 * Based on CalendarWeek.raw.tsx
 */

export interface CalendarSession {
  id: string;
  title: string;
  start: string; // "08:00"
  end: string; // "09:00"
  date: string; // "YYYY-MM-DD"
  meta?: string; // e.g. session type
}

interface CalendarDay {
  date: Date;
  dateKey: string;
  isToday: boolean;
  isSelected: boolean;
  sessions: CalendarSession[];
}

interface CalendarTemplateProps {
  /** Current selected date */
  selectedDate: Date;
  /** Sessions to display */
  sessions: CalendarSession[];
  /** Callback when a day is selected */
  onSelectDate?: (date: Date) => void;
  /** Callback when a session is selected */
  onSelectSession?: (id: string) => void;
  /** Additional className for customization */
  className?: string;
}

// Session type color configuration
const SESSION_TYPE_COLORS: Record<string, string> = {
  training: 'bg-tier-gold',
  tournament: 'bg-purple-500',
  test: 'bg-amber-500',
  session: 'bg-green-500',
  default: 'bg-tier-text-tertiary',
};

const CalendarTemplate: React.FC<CalendarTemplateProps> = ({
  selectedDate,
  sessions,
  onSelectDate,
  onSelectSession,
  className = '',
}) => {
  // Get the week dates based on selected date
  const getWeekDates = (date: Date): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const current = new Date(date);

    // Find the start of the week (Monday)
    const day = current.getDay();
    const diff = day === 0 ? -6 : day - 1;
    current.setDate(current.getDate() - diff);
    current.setHours(0, 0, 0, 0);

    // Generate 7 days
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(current);
      dayDate.setDate(current.getDate() + i);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      const dateKey = dayDate.toISOString().split('T')[0];

      // Filter sessions for this day
      const daySessions = sessions.filter((s) => s.date === dateKey);

      days.push({
        date: dayDate,
        dateKey,
        isToday: dayDate.getTime() === today.getTime(),
        isSelected: dayDate.getTime() === selected.getTime(),
        sessions: daySessions,
      });
    }

    return days;
  };

  // Get week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const weekDates = getWeekDates(selectedDate);
  const weekNumber = getWeekNumber(selectedDate);
  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

  const handleDayClick = (day: CalendarDay) => {
    if (onSelectDate) {
      onSelectDate(day.date);
    }
  };

  const handleSessionClick = (
    e: React.MouseEvent,
    sessionId: string
  ) => {
    e.stopPropagation();
    if (onSelectSession) {
      onSelectSession(sessionId);
    }
  };

  const getSessionTypeColorClass = (meta?: string) => {
    return SESSION_TYPE_COLORS[meta || 'default'] || SESSION_TYPE_COLORS.default;
  };

  const selectedDay = weekDates.find((d) => d.isSelected);

  return (
    <Card className={className}>
      {/* Week Header */}
      <div className="flex justify-center mb-3 pb-2 border-b border-tier-border-subtle">
        <span className="text-[11px] font-semibold text-tier-text-secondary uppercase tracking-wide">
          Uke {weekNumber}
        </span>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName, index) => (
          <div key={index} className="flex justify-center p-1">
            <span className="text-[10px] font-semibold text-tier-text-secondary uppercase">
              {dayName}
            </span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDates.map((day, index) => {
          const hasSessions = day.sessions.length > 0;

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={`aspect-square border-none bg-transparent rounded cursor-pointer transition-all duration-150 p-1 relative min-h-[44px] ${
                day.isToday ? 'bg-tier-gold/10' : ''
              } ${day.isSelected ? 'bg-tier-gold' : ''}`}
              aria-label={`${dayNames[index]} ${day.date.getDate()}`}
              aria-current={day.isToday ? 'date' : undefined}
            >
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <span
                  className={`text-sm font-medium ${
                    day.isSelected
                      ? 'text-white font-bold'
                      : day.isToday
                      ? 'text-tier-gold font-bold'
                      : 'text-tier-navy'
                  }`}
                >
                  {day.date.getDate()}
                </span>

                {hasSessions && (
                  <div className="flex gap-0.5 items-center flex-wrap justify-center">
                    {day.sessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className={`w-1 h-1 rounded-full ${getSessionTypeColorClass(session.meta)}`}
                        title={session.title}
                      />
                    ))}
                    {day.sessions.length > 3 && (
                      <span className="text-[8px] text-tier-text-tertiary ml-0.5">
                        +{day.sessions.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Sessions */}
      <div className="border-t border-tier-border-subtle pt-3 max-h-[200px] overflow-y-auto">
        {selectedDay?.sessions.map((session) => (
          <button
            key={session.id}
            onClick={(e) => handleSessionClick(e, session.id)}
            className={`flex gap-2 p-2 border-l-[3px] bg-tier-surface-subtle rounded mb-2 w-full cursor-pointer text-left border-t-0 border-r-0 border-b-0 ${
              session.meta === 'training'
                ? 'border-l-tier-gold'
                : session.meta === 'tournament'
                ? 'border-l-purple-500'
                : session.meta === 'test'
                ? 'border-l-amber-500'
                : session.meta === 'session'
                ? 'border-l-green-500'
                : 'border-l-tier-text-tertiary'
            }`}
          >
            <div className="text-[10px] text-tier-text-secondary font-semibold min-w-[60px]">
              {session.start} - {session.end}
            </div>
            <div className="text-[11px] text-tier-navy flex-1">
              {session.title}
            </div>
          </button>
        ))}
        {selectedDay?.sessions.length === 0 && (
          <div className="text-center p-4 text-tier-text-secondary text-[11px]">
            No sessions
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalendarTemplate;
