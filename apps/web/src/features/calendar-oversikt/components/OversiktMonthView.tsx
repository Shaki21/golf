/**
 * OversiktMonthView Component
 *
 * Read-only month grid view showing unified events.
 * Uses source-based color coding with dots and event titles.
 *
 * Uses semantic tokens only (no raw hex values).
 */

import React, { useMemo } from 'react';
import {
  UnifiedCalendarEvent,
  OversiktMonthViewProps,
  EVENT_SOURCE_COLORS,
  formatDateKey,
} from '../types';

const WEEK_DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

interface DayInfo {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: UnifiedCalendarEvent[];
}

export const OversiktMonthView: React.FC<OversiktMonthViewProps> = ({
  anchorDate,
  events,
  onEventClick,
  onDayClick,
}) => {
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

  const monthGrid = useMemo<DayInfo[][]>(() => {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    const days: DayInfo[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const d = new Date(prevYear, prevMonth, day);
      const dateKey = formatDateKey(d);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        events: eventsByDate[dateKey] || [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = formatDateKey(d);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        events: eventsByDate[dateKey] || [],
      });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalCells - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      const d = new Date(nextYear, nextMonth, day);
      const dateKey = formatDateKey(d);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        dateKey,
        day,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        events: eventsByDate[dateKey] || [],
      });
    }

    const weeks: DayInfo[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [anchorDate, eventsByDate, todayKey]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--calendar-surface-base)' }}
    >
      {/* Week day headers */}
      <div
        className="grid grid-cols-7 border-b"
        style={{ borderColor: 'var(--calendar-border)' }}
      >
        {WEEK_DAYS.map((day, idx) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium"
            style={{
              color:
                idx >= 5
                  ? 'var(--calendar-text-weekend)'
                  : 'var(--calendar-text-tertiary)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-rows-6 h-full">
          {monthGrid.map((week, weekIdx) => (
            <div
              key={weekIdx}
              className="grid grid-cols-7 border-b last:border-b-0"
              style={{ borderColor: 'var(--calendar-grid-line)' }}
            >
              {week.map((dayInfo) => (
                <div
                  key={dayInfo.dateKey}
                  className="min-h-[100px] p-2 border-r last:border-r-0 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: dayInfo.isToday
                      ? 'var(--calendar-surface-today)'
                      : !dayInfo.isCurrentMonth
                      ? 'var(--calendar-surface-weekend)'
                      : dayInfo.isWeekend
                      ? 'var(--calendar-surface-weekend)'
                      : 'transparent',
                    borderColor: 'var(--calendar-grid-line)',
                  }}
                  onClick={() => onDayClick?.(dayInfo.date)}
                  onMouseEnter={(e) => {
                    if (!dayInfo.isToday) {
                      e.currentTarget.style.backgroundColor = 'var(--calendar-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = dayInfo.isToday
                      ? 'var(--calendar-surface-today)'
                      : !dayInfo.isCurrentMonth
                      ? 'var(--calendar-surface-weekend)'
                      : dayInfo.isWeekend
                      ? 'var(--calendar-surface-weekend)'
                      : 'transparent';
                  }}
                >
                  {/* Day number */}
                  <span
                    className={`text-sm font-medium inline-flex items-center justify-center ${
                      dayInfo.isToday ? 'w-7 h-7 rounded-full' : ''
                    }`}
                    style={{
                      backgroundColor: dayInfo.isToday
                        ? 'var(--calendar-today-marker-bg)'
                        : 'transparent',
                      color: dayInfo.isToday
                        ? 'var(--calendar-today-marker-text)'
                        : !dayInfo.isCurrentMonth
                        ? 'var(--calendar-text-muted)'
                        : dayInfo.isWeekend
                        ? 'var(--calendar-text-weekend)'
                        : 'var(--calendar-text-primary)',
                    }}
                  >
                    {dayInfo.day}
                  </span>

                  {/* Events preview */}
                  {dayInfo.events.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {/* Desktop: Show event titles */}
                      <div className="hidden lg:block">
                        {dayInfo.events.slice(0, 2).map((event) => {
                          const colors = EVENT_SOURCE_COLORS[event.source];
                          return (
                            <button
                              key={event.id}
                              className="w-full text-left px-1.5 py-0.5 rounded text-xs truncate mb-0.5"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                borderLeft: `2px solid ${colors.border}`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick?.(event);
                              }}
                            >
                              {event.title}
                            </button>
                          );
                        })}
                        {dayInfo.events.length > 2 && (
                          <div
                            className="text-xs px-1"
                            style={{ color: 'var(--calendar-text-tertiary)' }}
                          >
                            +{dayInfo.events.length - 2} mer
                          </div>
                        )}
                      </div>

                      {/* Mobile: Show dots */}
                      <div className="flex gap-1 lg:hidden flex-wrap">
                        {dayInfo.events.slice(0, 4).map((event) => {
                          const colors = EVENT_SOURCE_COLORS[event.source];
                          return (
                            <span
                              key={event.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: colors.border }}
                            />
                          );
                        })}
                        {dayInfo.events.length > 4 && (
                          <span
                            className="text-[10px]"
                            style={{ color: 'var(--calendar-text-muted)' }}
                          >
                            +{dayInfo.events.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OversiktMonthView;
