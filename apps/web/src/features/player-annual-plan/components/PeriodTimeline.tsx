/**
 * Period Timeline Component
 * Visual representation of periods on a timeline
 */

import React from 'react';
import type { Period } from '../hooks/usePlayerAnnualPlan';
import { PERIOD_LABELS } from '../utils/periodDefaults';

interface PeriodTimelineProps {
  periods: Period[];
  startDate: string;
  endDate: string;
}

export function PeriodTimeline({
  periods,
  startDate,
  endDate,
}: PeriodTimelineProps) {
  const planStart = new Date(startDate);
  const planEnd = new Date(endDate);
  const totalDays =
    (planEnd.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24);

  const getPositionAndWidth = (period: Period) => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    const offsetDays =
      (periodStart.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24);
    const durationDays =
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);

    const left = (offsetDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
        {periods.map((period) => {
          const { left, width } = getPositionAndWidth(period);

          return (
            <div
              key={period.id}
              className="absolute h-full flex items-center justify-center transition-all"
              style={{
                left,
                width,
                backgroundColor: period.color,
                color: period.textColor,
              }}
              title={period.name}
            >
              <span className="text-xs font-bold truncate px-2">
                {PERIOD_LABELS[period.type]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {periods.map((period) => (
          <div key={period.id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: period.color }}
            />
            <span className="text-sm text-tier-navy font-medium">
              {period.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
