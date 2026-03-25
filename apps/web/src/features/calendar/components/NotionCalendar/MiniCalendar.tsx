/**
 * MiniCalendar - Compact month calendar for sidebar
 *
 * Features:
 * - Month navigation
 * - Week numbers
 * - Today highlight
 * - Selected date highlight
 * - Event indicators (dots)
 */

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';

interface MiniCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events?: CalendarEvent[];
  onMonthChange?: (date: Date) => void;
}

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  events = [],
  onMonthChange,
}) => {
  const [viewDate, setViewDate] = React.useState(currentDate);

  // Get calendar grid data
  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);

    // Get Monday of first week
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diff);

    // Generate 6 weeks of dates
    const weeks: { date: Date; weekNum: number }[][] = [];
    const current = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDates: { date: Date; weekNum: number }[] = [];
      const weekNum = getWeekNumber(current);

      for (let day = 0; day < 7; day++) {
        weekDates.push({
          date: new Date(current),
          weekNum,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(weekDates);
    }

    return { weeks, month, year };
  }, [viewDate]);

  // Check if date has events
  const dateHasEvents = useMemo(() => {
    const eventDates = new Set(events.map(e => e.date));
    return (date: Date) => eventDates.has(date.toISOString().split('T')[0]);
  }, [events]);

  // Navigation
  const goToPrevMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() - 1);
    setViewDate(newDate);
    onMonthChange?.(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + 1);
    setViewDate(newDate);
    onMonthChange?.(newDate);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedKey = selectedDate.toISOString().split('T')[0];
  const todayKey = today.toISOString().split('T')[0];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goToPrevMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft size={14} className="text-gray-400" />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {monthNames[calendarData.month]} {calendarData.year}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-8 gap-0 text-center mb-1">
        <div className="text-[10px] text-gray-400 py-1" /> {/* Week number column */}
        {DAY_NAMES.map(day => (
          <div key={day} className="text-[10px] text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-0">
        {calendarData.weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-8 gap-0">
            {/* Week number */}
            <div className="text-[10px] text-gray-300 flex items-center justify-center">
              {week[0].weekNum}
            </div>

            {/* Days */}
            {week.map(({ date }, dayIdx) => {
              const dateKey = date.toISOString().split('T')[0];
              const isCurrentMonth = date.getMonth() === calendarData.month;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedKey;
              const hasEvents = dateHasEvents(date);
              const isWeekend = dayIdx >= 5;

              return (
                <button
                  key={dateKey}
                  onClick={() => onDateSelect(date)}
                  className={`
                    relative w-7 h-7 flex items-center justify-center text-xs rounded-full
                    transition-colors
                    ${!isCurrentMonth ? 'text-gray-300' : isWeekend ? 'text-gray-400' : 'text-gray-700'}
                    ${isToday && !isSelected ? 'bg-red-500 text-white' : ''}
                    ${isSelected ? 'bg-blue-500 text-white' : ''}
                    ${!isToday && !isSelected ? 'hover:bg-gray-100' : ''}
                  `}
                >
                  {date.getDate()}
                  {hasEvents && !isToday && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default MiniCalendar;
