/**
 * TrainingHeatmap
 *
 * GitHub-style activity heatmap showing training frequency.
 * Displays last 28 days (4 weeks) in a 7x4 grid.
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { SubSectionTitle } from '../typography/Headings';

export interface TrainingDay {
  date: string; // ISO date string (YYYY-MM-DD)
  sessions: number; // Number of training sessions
  level: 0 | 1 | 2 | 3; // Activity level (0 = none, 3 = high)
}

interface TrainingHeatmapProps {
  /** Training data for the last 28 days */
  trainingDays: TrainingDay[];
  /** Title for the heatmap */
  title?: string;
  /** Custom class name */
  className?: string;
}

export function TrainingHeatmap({
  trainingDays,
  title = 'Treningsaktivitet siste 28 dager',
  className = '',
}: TrainingHeatmapProps) {
  // Ensure we have exactly 28 days
  const days = [...trainingDays];
  while (days.length < 28) {
    const lastDate = days.length > 0 ? new Date(days[days.length - 1].date) : new Date();
    const newDate = new Date(lastDate);
    newDate.setDate(newDate.getDate() - 1);
    days.push({
      date: newDate.toISOString().split('T')[0],
      sessions: 0,
      level: 0,
    });
  }

  // Take last 28 days and reverse to show oldest first (left to right)
  const displayDays = days.slice(0, 28).reverse();

  // Split into 4 weeks
  const weeks: TrainingDay[][] = [];
  for (let i = 0; i < 4; i++) {
    weeks.push(displayDays.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <SubSectionTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300" style={{ fontSize: '0.875rem' }}>
          {title}
        </SubSectionTitle>
      )}

      <div className="inline-flex flex-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day, dayIndex) => (
              <HeatmapCell key={`${weekIndex}-${dayIndex}`} day={day} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Mindre</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>Mer</span>
      </div>
    </div>
  );
}

interface HeatmapCellProps {
  day: TrainingDay;
}

function HeatmapCell({ day }: HeatmapCellProps) {
  const levelColors = {
    0: 'bg-gray-200 dark:bg-gray-700',
    1: 'bg-green-200 dark:bg-green-900',
    2: 'bg-green-400 dark:bg-green-700',
    3: 'bg-green-600 dark:bg-green-500',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
  };

  const sessionText =
    day.sessions === 0
      ? 'Ingen økter'
      : day.sessions === 1
      ? '1 økt'
      : `${day.sessions} økter`;

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-sm',
        'transition-all duration-200',
        'hover:scale-150 hover:shadow-md hover:z-10',
        'cursor-pointer',
        'relative group',
        levelColors[day.level]
      )}
      title={`${formatDate(day.date)}: ${sessionText}`}
    >
      {/* Tooltip */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-2 py-1 rounded',
          'bg-gray-900 dark:bg-gray-800',
          'text-xs font-medium text-white whitespace-nowrap',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200',
          'pointer-events-none',
          'shadow-lg z-50'
        )}
      >
        {formatDate(day.date)}: {sessionText}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default TrainingHeatmap;
