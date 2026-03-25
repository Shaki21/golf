/**
 * CalendarYearView Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * 12 mini-month grids for fast navigation:
 * - Minimal day grids with density markers
 * - Click month to navigate to month view
 * - Current month highlight
 */

import React, { useMemo } from 'react';
import type { CalendarEvent } from '../hooks/useCalendarEvents';
import { SectionTitle } from '../../../components/typography';

interface CalendarYearViewProps {
  year: number;
  events: CalendarEvent[];
  onMonthClick: (monthIndex: number) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'
];

const WEEK_DAYS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

interface MiniMonthProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  onClick: () => void;
}

const MiniMonth: React.FC<MiniMonthProps> = ({
  year,
  month,
  events,
  isCurrentMonth,
  onClick,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayKey = formatDateKey(today);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const event of events) {
      map[event.date] = (map[event.date] || 0) + 1;
    }
    return map;
  }, [events]);

  // Generate mini calendar
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const cells: Array<{ day: number | null; dateKey: string; isToday: boolean; eventCount: number }> = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ day: null, dateKey: '', isToday: false, eventCount: 0 });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateKey = formatDateKey(date);
      cells.push({
        day: d,
        dateKey,
        isToday: dateKey === todayKey,
        eventCount: eventsByDate[dateKey] || 0,
      });
    }

    return cells;
  }, [year, month, eventsByDate, todayKey]);

  // Calculate stats
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'completed').length;

  return (
    <div
      className={`p-3 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
        isCurrentMonth
          ? 'bg-tier-navy/5 border-2 border-tier-navy'
          : 'bg-tier-white border border-tier-border-default'
      }`}
      onClick={onClick}
    >
      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-semibold ${
            isCurrentMonth ? 'text-tier-navy' : 'text-tier-navy'
          }`}
        >
          {MONTH_NAMES[month]}
        </span>
        {totalEvents > 0 && (
          <span className="text-[10px] text-tier-text-tertiary">
            {completedEvents}/{totalEvents}
          </span>
        )}
      </div>

      {/* Mini week header */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEK_DAYS.map((day, i) => (
          <div
            key={i}
            className="w-4 h-3 flex items-center justify-center text-[8px] text-tier-text-tertiary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Mini calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((cell, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 flex items-center justify-center text-[9px] rounded-sm ${
              cell.isToday
                ? 'font-bold bg-tier-navy text-white'
                : cell.eventCount > 0
                ? 'bg-tier-navy/10 text-tier-navy'
                : cell.day
                ? 'text-tier-navy'
                : 'text-transparent'
            }`}
          >
            {cell.day}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarYearView: React.FC<CalendarYearViewProps> = ({
  year,
  events,
  onMonthClick,
}) => {
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    for (let i = 0; i < 12; i++) {
      map[i] = [];
    }

    for (const event of events) {
      const eventDate = new Date(event.date);
      if (eventDate.getFullYear() === year) {
        const month = eventDate.getMonth();
        map[month].push(event);
      }
    }

    return map;
  }, [events, year]);

  // Calculate year stats
  const yearStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let totalMinutes = 0;

    for (const monthEvents of Object.values(eventsByMonth)) {
      total += monthEvents.length;
      completed += monthEvents.filter(e => e.status === 'completed').length;
      totalMinutes += monthEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
    }

    return {
      total,
      completed,
      hours: Math.round(totalMinutes / 60),
    };
  }, [eventsByMonth]);

  return (
    <div className="flex flex-col h-full bg-tier-white">
      {/* Year header */}
      <div className="text-center py-4 border-b border-tier-border-default">
        <SectionTitle className="text-2xl font-bold text-tier-navy">
          {year}
        </SectionTitle>
      </div>

      {/* Months grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, monthIndex) => (
            <MiniMonth
              key={monthIndex}
              year={year}
              month={monthIndex}
              events={eventsByMonth[monthIndex]}
              isCurrentMonth={year === currentYear && monthIndex === currentMonth}
              onClick={() => onMonthClick(monthIndex)}
            />
          ))}
        </div>
      </div>

      {/* Year stats footer */}
      <div className="border-t border-tier-border-default p-4 bg-tier-surface-base">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {yearStats.total}
            </div>
            <div className="text-xs text-tier-text-tertiary">
              Totalt økter
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tier-success">
              {yearStats.completed}
            </div>
            <div className="text-xs text-tier-text-tertiary">
              Fullført
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {yearStats.hours}t
            </div>
            <div className="text-xs text-tier-text-tertiary">
              Timer trent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarYearView;
