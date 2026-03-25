/**
 * NotionMonthGrid - Month view grid matching Notion Calendar
 *
 * Features:
 * - 6-week grid display
 * - Events shown as colored bars
 * - Multi-day events span across days
 * - Week numbers
 * - Click on day to navigate
 */

import React, { useMemo } from 'react';
import type { CalendarEvent } from '../../hooks/useCalendarEvents';
import { CALENDAR_COLORS, type CalendarSource, type CalendarColorKey } from './types';

interface NotionMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  calendars: CalendarSource[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

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

const NotionMonthGrid: React.FC<NotionMonthGridProps> = ({
  currentDate,
  events,
  calendars,
  onDateClick,
  onEventClick,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);

  // Generate calendar grid data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);

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
  }, [currentDate]);

  // Group events by date
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

  return (
    <div className="flex flex-col h-full">
      {/* Header - Day names */}
      <div className="flex border-b border-gray-200 bg-white ">
        {/* Week number column */}
        <div className="w-8 flex-shrink-0 border-r border-gray-100" />

        {/* Day name headers */}
        {DAY_NAMES.map((day, idx) => (
          <div
            key={day}
            className={`flex-1 py-2 text-center text-xs font-medium border-r border-gray-100 last:border-r-0 ${
              idx >= 5 ? 'text-gray-400 bg-gray-50' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {calendarData.weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex border-b border-gray-100 min-h-[100px]">
            {/* Week number */}
            <div className="w-8 flex-shrink-0 border-r border-gray-100 text-[10px] text-gray-300 pt-1 text-center">
              {week[0].weekNum}
            </div>

            {/* Days */}
            {week.map(({ date }, dayIdx) => {
              const dateKey = formatDateKey(date);
              const isCurrentMonth = date.getMonth() === calendarData.month;
              const isToday = dateKey === todayKey;
              const isWeekend = dayIdx >= 5;
              const dayEvents = eventsByDate[dateKey] || [];

              return (
                <div
                  key={dateKey}
                  className={`flex-1 min-w-0 border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                    !isCurrentMonth ? 'bg-gray-50/50' : isWeekend ? 'bg-gray-50/30' : ''
                  }`}
                  onClick={() => onDateClick?.(date)}
                >
                  {/* Date number */}
                  <div className="p-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                        isToday
                          ? 'bg-red-500 text-white font-semibold'
                          : !isCurrentMonth
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="px-1 pb-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map(event => {
                      const color = getEventColor(event);

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor: color.bg,
                            color: color.text,
                            borderLeft: `2px solid ${color.border}`,
                          }}
                        >
                          {!event.isAllDay && (
                            <span className="font-medium mr-1">{event.start}</span>
                          )}
                          {event.title}
                        </div>
                      );
                    })}

                    {/* More events indicator */}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1.5">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotionMonthGrid;
