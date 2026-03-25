/**
 * CalendarColorLegend.tsx
 *
 * Color legend for calendar events.
 * Shows what each color represents for quick reference.
 */

import React from 'react';
import clsx from 'clsx';

interface LegendItem {
  label: string;
  colorClass: string;
}

const STATUS_LEGEND: LegendItem[] = [
  { label: 'Anbefalt', colorClass: 'bg-blue-500' },
  { label: 'Fullfort', colorClass: 'bg-green-500' },
  { label: 'Pagar', colorClass: 'bg-amber-500' },
];

const CATEGORY_LEGEND: LegendItem[] = [
  { label: 'Trening', colorClass: 'bg-tier-navy' },
  { label: 'Testing', colorClass: 'bg-purple-500' },
  { label: 'Mental', colorClass: 'bg-pink-500' },
  { label: 'Turnering', colorClass: 'bg-amber-500' },
  { label: 'Coach', colorClass: 'bg-blue-500' },
];

interface CalendarColorLegendProps {
  /** Show status-based or category-based legend */
  variant?: 'status' | 'category' | 'all';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional className */
  className?: string;
}

export const CalendarColorLegend: React.FC<CalendarColorLegendProps> = ({
  variant = 'all',
  orientation = 'horizontal',
  className,
}) => {
  const items = variant === 'status'
    ? STATUS_LEGEND
    : variant === 'category'
      ? CATEGORY_LEGEND
      : [...CATEGORY_LEGEND.slice(0, 3), STATUS_LEGEND[1]]; // Show most common

  return (
    <div
      className={clsx(
        'flex gap-4 text-xs text-tier-text-secondary',
        orientation === 'vertical' ? 'flex-col gap-2' : 'flex-wrap items-center',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={clsx('w-2.5 h-2.5 rounded-full', item.colorClass)} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CalendarColorLegend;
