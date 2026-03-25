import React from 'react';

/**
 * CalendarWeek Raw Block
 * A mobile-first weekly calendar component following TIER Golf design system
 */

interface CalendarDay {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  events?: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  time?: string;
  type?: 'training' | 'tournament' | 'test' | 'session';
}

interface CalendarWeekProps {
  /** Current selected date */
  selectedDate?: Date;
  /** Callback when a day is selected */
  onDaySelect?: (date: Date) => void;
  /** Events to display */
  events?: Record<string, CalendarEvent[]>;
  /** First day of the week (0 = Sunday, 1 = Monday) */
  firstDayOfWeek?: 0 | 1;
  /** Show week number */
  showWeekNumber?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

// Event type color configuration
const EVENT_TYPE_COLORS: Record<string, string> = {
  training: 'bg-tier-gold',
  tournament: 'bg-purple-500',
  test: 'bg-amber-500',
  session: 'bg-green-500',
  default: 'bg-tier-text-tertiary',
};

// Event border color configuration for event items
const EVENT_BORDER_COLORS: Record<string, string> = {
  training: 'border-l-tier-gold',
  tournament: 'border-l-purple-500',
  test: 'border-l-amber-500',
  session: 'border-l-green-500',
  default: 'border-l-tier-text-tertiary',
};

const CalendarWeek: React.FC<CalendarWeekProps> = ({
  selectedDate = new Date(),
  onDaySelect,
  events = {},
  firstDayOfWeek = 1, // Monday
  showWeekNumber = false,
  compact = false,
}) => {
  // Get the week dates based on selected date
  const getWeekDates = (date: Date): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const current = new Date(date);

    // Find the start of the week
    const day = current.getDay();
    const diff = day === 0 ? (firstDayOfWeek === 1 ? -6 : 0) : day - firstDayOfWeek;
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

      days.push({
        date: dayDate,
        isToday: dayDate.getTime() === today.getTime(),
        isSelected: dayDate.getTime() === selected.getTime(),
        events: events[dateKey] || [],
      });
    }

    return days;
  };

  // Get week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const weekDates = getWeekDates(selectedDate);
  const weekNumber = getWeekNumber(selectedDate);

  const dayNames = firstDayOfWeek === 1
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (day: CalendarDay) => {
    if (onDaySelect) {
      onDaySelect(day.date);
    }
  };

  const getEventDotClass = (type?: CalendarEvent['type']) => {
    return EVENT_TYPE_COLORS[type || 'default'] || EVENT_TYPE_COLORS.default;
  };

  const getEventBorderClass = (type?: CalendarEvent['type']) => {
    return EVENT_BORDER_COLORS[type || 'default'] || EVENT_BORDER_COLORS.default;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Week Header */}
      {showWeekNumber && (
        <div className="flex justify-center mb-3 pb-2 border-b border-tier-border-subtle">
          <span className="text-[11px] font-semibold text-tier-text-secondary uppercase tracking-wide">
            Week {weekNumber}
          </span>
        </div>
      )}

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName, index) => (
          <div key={index} className="flex justify-center p-1">
            <span className="text-[10px] font-semibold text-tier-text-secondary uppercase">
              {compact ? dayName[0] : dayName}
            </span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDates.map((day, index) => {
          const hasEvents = day.events && day.events.length > 0;

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

                {hasEvents && (
                  <div className="flex gap-0.5 items-center flex-wrap justify-center">
                    {day.events!.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`w-1 h-1 rounded-full ${getEventDotClass(event.type)}`}
                        title={event.title}
                      />
                    ))}
                    {day.events!.length > 3 && (
                      <span className="text-[8px] text-tier-text-tertiary ml-0.5">
                        +{day.events!.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Events (if not compact) */}
      {!compact && selectedDate && (
        <div className="border-t border-tier-border-subtle pt-3 max-h-[200px] overflow-y-auto">
          {weekDates.find(d => d.isSelected)?.events?.map((event) => (
            <div
              key={event.id}
              className={`flex gap-2 p-2 border-l-[3px] bg-tier-surface-subtle rounded mb-2 ${getEventBorderClass(event.type)}`}
            >
              <div className="text-[10px] text-tier-text-secondary font-semibold min-w-[60px]">
                {event.time || 'All day'}
              </div>
              <div className="text-[11px] text-tier-navy flex-1">
                {event.title}
              </div>
            </div>
          ))}
          {weekDates.find(d => d.isSelected)?.events?.length === 0 && (
            <div className="text-center p-4 text-tier-text-secondary text-[11px]">
              No events
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarWeek;
