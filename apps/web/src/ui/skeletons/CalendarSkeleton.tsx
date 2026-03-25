/**
 * CalendarSkeleton
 *
 * Skeleton loader that matches CalendarWeekView/DayView layout
 * to prevent layout shift (flickering) during data loading.
 */

import React from 'react';
import { SkeletonPulse } from './SkeletonBase';

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 5;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const DAY_NAMES = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const HOUR_HEIGHT = 60;

interface CalendarSkeletonProps {
  view?: 'week' | 'day' | 'month';
}

/**
 * Week view skeleton - matches CalendarWeekView layout
 */
const WeekViewSkeleton: React.FC = () => (
  <div className="flex flex-col h-full">
    {/* Sticky header row */}
    <div
      className="flex border-b border-ak-border-default bg-ak-surface-base"
      style={{ position: 'sticky', top: 0, zIndex: 10 }}
    >
      {/* Time column spacer */}
      <div className="w-16 flex-shrink-0" />

      {/* Day columns */}
      {DAY_NAMES.map((day, i) => (
        <div
          key={day}
          className="flex-1 min-w-0 p-2 text-center border-l border-ak-border-default"
        >
          <div className="text-xs font-medium text-ak-text-tertiary mb-1">{day}</div>
          <SkeletonPulse width="24px" height="24px" style={{ margin: '0 auto', borderRadius: '50%' }} />
        </div>
      ))}
    </div>

    {/* Scrollable time grid */}
    <div className="flex-1 overflow-auto">
      <div className="flex" style={{ minHeight: TIME_SLOTS.length * HOUR_HEIGHT }}>
        {/* Time labels column */}
        <div className="w-16 flex-shrink-0 border-r border-ak-border-default">
          {TIME_SLOTS.map((time, i) => (
            <div
              key={time}
              className="text-xs text-ak-text-tertiary pr-2 text-right"
              style={{ height: HOUR_HEIGHT, paddingTop: 4 }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Day columns with skeleton events */}
        {DAY_NAMES.map((_, dayIndex) => (
          <div
            key={dayIndex}
            className="flex-1 min-w-0 relative border-l border-ak-border-default"
          >
            {/* Hour grid lines */}
            {TIME_SLOTS.map((_, hourIndex) => (
              <div
                key={hourIndex}
                className="border-b border-ak-border-subtle"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {/* Skeleton events - random placement per day */}
            {dayIndex % 2 === 0 && (
              <div
                className="absolute left-1 right-1"
                style={{
                  top: (2 + dayIndex * 0.5) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT * 1.5,
                }}
              >
                <SkeletonPulse width="100%" height="100%" style={{ borderRadius: 'var(--radius-md)' }} />
              </div>
            )}
            {dayIndex % 3 === 1 && (
              <div
                className="absolute left-1 right-1"
                style={{
                  top: (5 + dayIndex * 0.3) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT,
                }}
              >
                <SkeletonPulse width="100%" height="100%" style={{ borderRadius: 'var(--radius-md)' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Day view skeleton - matches CalendarDayView layout
 */
const DayViewSkeleton: React.FC = () => (
  <div className="flex flex-col h-full">
    {/* Day header */}
    <div className="flex items-center justify-between p-4 border-b border-ak-border-default bg-ak-surface-base">
      <div className="flex items-center gap-3">
        <SkeletonPulse width="48px" height="48px" style={{ borderRadius: '50%' }} />
        <div>
          <SkeletonPulse width="80px" height="14px" style={{ marginBottom: 4 }} />
          <SkeletonPulse width="120px" height="20px" />
        </div>
      </div>
    </div>

    {/* Time grid */}
    <div className="flex-1 overflow-auto">
      <div className="flex" style={{ minHeight: TIME_SLOTS.length * HOUR_HEIGHT }}>
        {/* Time labels */}
        <div className="w-16 flex-shrink-0 border-r border-ak-border-default">
          {TIME_SLOTS.map((time) => (
            <div
              key={time}
              className="text-xs text-ak-text-tertiary pr-2 text-right"
              style={{ height: HOUR_HEIGHT, paddingTop: 4 }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Main content area with skeleton events */}
        <div className="flex-1 relative">
          {TIME_SLOTS.map((_, i) => (
            <div
              key={i}
              className="border-b border-ak-border-subtle"
              style={{ height: HOUR_HEIGHT }}
            />
          ))}

          {/* Skeleton events */}
          <div
            className="absolute left-2 right-2"
            style={{ top: 3 * HOUR_HEIGHT, height: HOUR_HEIGHT * 2 }}
          >
            <SkeletonPulse width="100%" height="100%" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
          <div
            className="absolute left-2 right-2"
            style={{ top: 7 * HOUR_HEIGHT, height: HOUR_HEIGHT }}
          >
            <SkeletonPulse width="100%" height="100%" style={{ borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Month view skeleton - matches CalendarMonthView layout
 */
const MonthViewSkeleton: React.FC = () => (
  <div className="flex flex-col h-full p-4">
    {/* Day name headers */}
    <div className="grid grid-cols-7 gap-1 mb-2">
      {DAY_NAMES.map((day) => (
        <div key={day} className="text-center text-xs font-medium text-ak-text-tertiary py-2">
          {day}
        </div>
      ))}
    </div>

    {/* Calendar grid (6 weeks) */}
    <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1">
      {Array.from({ length: 42 }).map((_, i) => (
        <div
          key={i}
          className="border border-ak-border-subtle rounded-md p-1 min-h-[80px]"
        >
          <SkeletonPulse width="20px" height="20px" style={{ marginBottom: 4 }} />
          {i % 4 === 0 && <SkeletonPulse width="100%" height="16px" style={{ marginTop: 4 }} />}
          {i % 5 === 2 && <SkeletonPulse width="80%" height="16px" style={{ marginTop: 4 }} />}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Main CalendarSkeleton component
 */
export const CalendarSkeleton: React.FC<CalendarSkeletonProps> = ({ view = 'week' }) => {
  return (
    <div className="h-full bg-ak-surface-base" aria-hidden="true" role="presentation">
      {view === 'week' && <WeekViewSkeleton />}
      {view === 'day' && <DayViewSkeleton />}
      {view === 'month' && <MonthViewSkeleton />}
    </div>
  );
};

export default CalendarSkeleton;
