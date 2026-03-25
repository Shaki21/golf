/**
 * PlayerWeekNavigation - Week selector and navigation controls
 * Allows players to navigate between weeks in their training plan
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { Badge } from '../../components/shadcn/badge';

interface PlayerWeekNavigationProps {
  currentWeek: number;
  totalWeeks: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectWeek: (weekNumber: number) => void;
}

export function PlayerWeekNavigation({
  currentWeek,
  totalWeeks,
  onPrevious,
  onNext,
  onSelectWeek,
}: PlayerWeekNavigationProps) {
  const isPreviousDisabled = currentWeek <= 1;
  const isNextDisabled = currentWeek >= totalWeeks;

  // Generate week indicators (limit to 12 for display)
  const displayWeeks = Math.min(totalWeeks, 12);
  const weekIndicators = Array.from({ length: displayWeeks }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="flex items-center gap-2"
          aria-label="Previous week"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        <div className="text-center">
          <div className="text-lg font-semibold text-tier-navy">
            Week {currentWeek} of {totalWeeks}
          </div>
          <div className="text-xs text-tier-navy/60 mt-0.5">
            {getWeekLabel(currentWeek, totalWeeks)}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex items-center gap-2"
          aria-label="Next week"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Week Indicators (dots) */}
      <div className="flex items-center justify-center gap-2">
        {weekIndicators.map(week => (
          <button
            key={week}
            onClick={() => onSelectWeek(week)}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200
              ${
                week === currentWeek
                  ? 'bg-tier-gold text-white font-semibold shadow-md scale-110'
                  : 'bg-tier-navy/10 text-tier-navy/60 hover:bg-tier-navy/20 hover:scale-105'
              }
            `}
            aria-label={`Go to week ${week}`}
            aria-current={week === currentWeek ? 'true' : undefined}
          >
            <span className="text-xs">{week}</span>
          </button>
        ))}
        {totalWeeks > 12 && (
          <Badge variant="secondary" className="text-xs ml-2">
            +{totalWeeks - 12} more
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Get descriptive label for current week position
 */
function getWeekLabel(currentWeek: number, totalWeeks: number): string {
  const progress = (currentWeek / totalWeeks) * 100;

  if (currentWeek === 1) {
    return 'Just getting started';
  } else if (currentWeek === totalWeeks) {
    return 'Final week';
  } else if (progress < 33) {
    return 'Early phase';
  } else if (progress < 67) {
    return 'Mid phase';
  } else {
    return 'Final phase';
  }
}

export default PlayerWeekNavigation;
