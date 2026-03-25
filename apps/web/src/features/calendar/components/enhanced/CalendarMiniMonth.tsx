/**
 * CalendarMiniMonth.tsx
 *
 * Compact month calendar for sidebars and navigation.
 * Based on Tailwind UI calendar templates.
 *
 * Features:
 * - Month navigation
 * - Today highlight
 * - Selected date highlight
 * - Event dots indicator
 * - Dark mode support
 */

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface CalendarMiniMonthProps {
  /** Currently displayed month/year */
  currentDate: Date;
  /** Currently selected date */
  selectedDate?: Date;
  /** Dates that have events (show dot indicator) */
  eventDates?: string[];
  /** Navigate to previous month */
  onPrevMonth?: () => void;
  /** Navigate to next month */
  onNextMonth?: () => void;
  /** Select a date */
  onSelectDate: (date: Date) => void;
  /** Change month directly (alternative to onPrevMonth/onNextMonth) */
  onMonthChange?: (date: Date) => void;
  /** Custom class name */
  className?: string;
}

interface DayInfo {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
}

const WEEKDAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const CalendarMiniMonth: React.FC<CalendarMiniMonthProps> = ({
  currentDate,
  selectedDate,
  eventDates = [],
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onSelectDate,
  className,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const eventDatesSet = useMemo(() => new Set(eventDates), [eventDates]);

  // Generate the days grid
  const days = useMemo<DayInfo[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Get starting day (Monday = 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    const result: DayInfo[] = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const d = new Date(prevYear, prevMonth, day);
      const dateKey = formatDateKey(d);
      result.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        hasEvents: eventDatesSet.has(dateKey),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = formatDateKey(d);
      result.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        hasEvents: eventDatesSet.has(dateKey),
      });
    }

    // Next month days (fill to complete grid)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const totalCells = Math.ceil(result.length / 7) * 7;
    const remainingDays = totalCells - result.length;

    for (let day = 1; day <= remainingDays; day++) {
      const d = new Date(nextYear, nextMonth, day);
      const dateKey = formatDateKey(d);
      result.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        hasEvents: eventDatesSet.has(dateKey),
      });
    }

    return result;
  }, [currentDate, todayKey, selectedKey, eventDatesSet]);

  const monthLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className={className}>
      {/* Header with navigation */}
      <div className="flex items-center text-center text-tier-navy">
        <button
          type="button"
          onClick={() => {
            if (onMonthChange) {
              const prev = new Date(currentDate);
              prev.setMonth(prev.getMonth() - 1);
              onMonthChange(prev);
            } else if (onPrevMonth) {
              onPrevMonth();
            }
          }}
          className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-tier-text-tertiary hover:text-tier-text-secondary transition-colors"
          aria-label="Forrige måned"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex-auto text-sm font-semibold">{monthLabel}</div>
        <button
          type="button"
          onClick={() => {
            if (onMonthChange) {
              const next = new Date(currentDate);
              next.setMonth(next.getMonth() + 1);
              onMonthChange(next);
            } else if (onNextMonth) {
              onNextMonth();
            }
          }}
          className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-tier-text-tertiary hover:text-tier-text-secondary transition-colors"
          aria-label="Neste måned"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-tier-text-tertiary text-center">
        {WEEKDAYS.map((day, idx) => (
          <div key={idx}>{day}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-tier-border-default text-sm shadow-sm ring-1 ring-tier-border-default overflow-hidden">
        {days.map((dayInfo, idx) => (
          <button
            key={dayInfo.dateKey}
            type="button"
            onClick={() => onSelectDate(dayInfo.date)}
            className={clsx(
              'py-1.5 focus:z-10 relative',
              // Background
              dayInfo.isCurrentMonth
                ? 'bg-tier-white hover:bg-tier-surface-base'
                : 'bg-tier-surface-base/50 hover:bg-tier-surface-base',
              // Corner rounding
              idx === 0 && 'rounded-tl-lg',
              idx === 6 && 'rounded-tr-lg',
              idx === days.length - 7 && 'rounded-bl-lg',
              idx === days.length - 1 && 'rounded-br-lg',
            )}
          >
            <time
              dateTime={dayInfo.dateKey}
              className={clsx(
                'mx-auto flex size-7 items-center justify-center rounded-full transition-colors',
                // Text color
                !dayInfo.isSelected && !dayInfo.isToday && !dayInfo.isCurrentMonth && 'text-tier-text-tertiary',
                !dayInfo.isSelected && !dayInfo.isToday && dayInfo.isCurrentMonth && 'text-tier-navy',
                // Today (not selected)
                dayInfo.isToday && !dayInfo.isSelected && 'text-tier-navy font-semibold',
                // Selected (not today)
                dayInfo.isSelected && !dayInfo.isToday && 'bg-tier-navy text-white font-semibold',
                // Selected and today
                dayInfo.isSelected && dayInfo.isToday && 'bg-tier-navy text-white font-semibold',
              )}
            >
              {dayInfo.day}
            </time>
            {/* Event indicator dot */}
            {dayInfo.hasEvents && !dayInfo.isSelected && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-tier-navy" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarMiniMonth;
