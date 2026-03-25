/**
 * TemplatePeriodTimeline Component
 * Visual timeline showing training periods across the template duration
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { TemplatePeriod, PeriodType } from '../types/template.types';

interface TemplatePeriodTimelineProps {
  totalWeeks: number;
  periods: TemplatePeriod[];
  onPeriodClick?: (period: TemplatePeriod) => void;
  selectedPeriodId?: string;
}

// Period type labels
const PERIOD_LABELS: Record<PeriodType, string> = {
  preparation: 'Preparation',
  base: 'Base Building',
  build: 'Build Phase',
  competition: 'Competition',
  taper: 'Taper',
  recovery: 'Recovery',
  transition: 'Transition'
};

export function TemplatePeriodTimeline({
  totalWeeks,
  periods,
  onPeriodClick,
  selectedPeriodId
}: TemplatePeriodTimelineProps) {
  // Calculate grid for timeline
  const timelineWeeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Find period for each week
  const getPeriodForWeek = (weekNumber: number): TemplatePeriod | undefined => {
    return periods.find(p => weekNumber >= p.startWeek && weekNumber <= p.endWeek);
  };

  // Group consecutive weeks in same period
  const periodBlocks = periods.map(period => {
    const weekCount = period.endWeek - period.startWeek + 1;
    const widthPercentage = (weekCount / totalWeeks) * 100;
    const leftPercentage = ((period.startWeek - 1) / totalWeeks) * 100;

    return {
      period,
      weekCount,
      widthPercentage,
      leftPercentage
    };
  });

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-tier-navy flex items-center gap-2">
            <Calendar size={20} />
            Training Periods
          </h3>
          <span className="text-sm text-tier-navy/60">
            {totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'} total
          </span>
        </div>

        {/* Timeline visualization */}
        <div className="space-y-3">
          {/* Week numbers row */}
          <div className="relative h-8 bg-tier-navy/5 rounded">
            <div className="absolute inset-0 flex">
              {timelineWeeks.map((week, index) => (
                <div
                  key={week}
                  className="flex-1 flex items-center justify-center text-xs text-tier-navy/60 border-r border-tier-navy/10 last:border-r-0"
                  style={{
                    minWidth: `${100 / totalWeeks}%`
                  }}
                >
                  {week % 2 === 1 || totalWeeks <= 12 ? week : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Period blocks */}
          {periods.length === 0 ? (
            <div className="text-center py-8 text-tier-navy/60 text-sm">
              No periods defined. Add periods to organize your training plan.
            </div>
          ) : (
            <div className="relative h-16">
              {periodBlocks.map(({ period, weekCount, widthPercentage, leftPercentage }) => {
                const isSelected = period.id === selectedPeriodId;

                return (
                  <div
                    key={period.id}
                    className={`
                      absolute top-0 h-full rounded-lg
                      cursor-pointer
                      transition-all duration-200
                      ${isSelected ? 'ring-2 ring-tier-navy shadow-lg z-10' : 'hover:shadow-md'}
                    `}
                    style={{
                      left: `${leftPercentage}%`,
                      width: `${widthPercentage}%`,
                      backgroundColor: period.color,
                      opacity: isSelected ? 1 : 0.85
                    }}
                    onClick={() => onPeriodClick?.(period)}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-white px-2">
                      <span className="text-xs font-semibold truncate w-full text-center">
                        {period.name}
                      </span>
                      <span className="text-xs opacity-90">
                        {weekCount}w
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Period legend */}
          {periods.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-tier-navy/10">
              {periods.map(period => {
                const isSelected = period.id === selectedPeriodId;
                return (
                  <button
                    key={period.id}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 rounded text-xs
                      transition-colors
                      ${isSelected ? 'bg-tier-navy/10' : 'hover:bg-tier-navy/5'}
                    `}
                    onClick={() => onPeriodClick?.(period)}
                  >
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: period.color }}
                    />
                    <span className="text-tier-navy font-medium">
                      {period.name}
                    </span>
                    <span className="text-tier-navy/60">
                      ({PERIOD_LABELS[period.type]})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Period details (if selected) */}
          {selectedPeriodId && (() => {
            const selectedPeriod = periods.find(p => p.id === selectedPeriodId);
            if (!selectedPeriod) return null;

            return (
              <div className="mt-3 p-3 bg-tier-navy/5 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-tier-navy">{selectedPeriod.name}</h4>
                    <p className="text-sm text-tier-navy/70 mt-1">
                      {selectedPeriod.description || PERIOD_LABELS[selectedPeriod.type]}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Weeks {selectedPeriod.startWeek}-{selectedPeriod.endWeek}
                  </Badge>
                </div>

                {/* Goals */}
                {selectedPeriod.goals && selectedPeriod.goals.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-tier-navy/80">Goals:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedPeriod.goals.map((goal, index) => (
                        <li key={index} className="text-xs text-tier-navy/70 flex items-start gap-1">
                          <span className="text-tier-gold">•</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Focus areas */}
                {selectedPeriod.focusAreas && selectedPeriod.focusAreas.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-tier-navy/80">Focus:</span>
                    <div className="flex gap-1">
                      {selectedPeriod.focusAreas.map(area => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intensity target */}
                {selectedPeriod.intensityTarget && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-tier-navy/80">Intensity:</span>
                    <Badge
                      variant={
                        selectedPeriod.intensityTarget === 'high'
                          ? 'warning'
                          : selectedPeriod.intensityTarget === 'moderate'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {selectedPeriod.intensityTarget}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </Card>
  );
}

export default TemplatePeriodTimeline;
