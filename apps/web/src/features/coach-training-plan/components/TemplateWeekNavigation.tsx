/**
 * TemplateWeekNavigation Component
 * Week navigation controls for training plan template calendar
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../../../ui/primitives/Button';

interface TemplateWeekNavigationProps {
  currentWeek: number;
  totalWeeks: number;
  weekDates: Date[];
  sessionsPerWeek: Map<number, number>; // weekNumber -> session count
  onPrevious: () => void;
  onNext: () => void;
  onSelectWeek: (weekNumber: number) => void;
}

export function TemplateWeekNavigation({
  currentWeek,
  totalWeeks,
  weekDates,
  sessionsPerWeek,
  onPrevious,
  onNext,
  onSelectWeek
}: TemplateWeekNavigationProps) {
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Format date range
  const dateRangeText = weekStart && weekEnd
    ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    : '';

  // Generate week indicators
  const weekIndicators = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Determine if week has sessions
  const hasSessionsInWeek = (weekNumber: number) => {
    return (sessionsPerWeek.get(weekNumber) || 0) > 0;
  };

  return (
    <div className="space-y-4">
      {/* Main navigation bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onPrevious}
          disabled={currentWeek === 1}
          className="flex-shrink-0"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </Button>

        {/* Week info */}
        <div className="flex-1 text-center">
          <div className="text-lg font-semibold text-tier-navy">
            Week {currentWeek} of {totalWeeks}
          </div>
          <div className="text-sm text-tier-navy/60 mt-0.5">
            {dateRangeText}
          </div>
        </div>

        {/* Next button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onNext}
          disabled={currentWeek === totalWeeks}
          className="flex-shrink-0"
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Week indicators */}
      {totalWeeks > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {weekIndicators.map(weekNumber => {
            const isActive = weekNumber === currentWeek;
            const hasSessions = hasSessionsInWeek(weekNumber);

            return (
              <button
                key={weekNumber}
                onClick={() => onSelectWeek(weekNumber)}
                className={`
                  w-8 h-8 rounded-full transition-all
                  ${isActive
                    ? 'bg-tier-gold text-tier-white ring-2 ring-tier-gold/30'
                    : hasSessions
                    ? 'bg-tier-navy text-tier-white hover:bg-tier-navy/80'
                    : 'border-2 border-tier-navy/30 text-tier-navy/60 hover:border-tier-navy/60'
                  }
                  flex items-center justify-center
                  text-xs font-medium
                  focus:outline-none focus:ring-2 focus:ring-tier-gold focus:ring-offset-2
                `}
                aria-label={`Go to week ${weekNumber}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {weekNumber}
              </button>
            );
          })}
        </div>
      )}

      {/* Keyboard hint */}
      <div className="text-center text-xs text-tier-navy/40">
        Use ← → arrow keys to navigate
      </div>
    </div>
  );
}

export default TemplateWeekNavigation;
