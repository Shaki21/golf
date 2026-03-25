/**
 * EventCard.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Visual styling based on event intent (from spec):
 * 1. Recommended TIER Golf workout - Primary brand styling, dominant
 * 2. Planned (not recommended) - Elevated surface, neutral
 * 3. Ghost slot - Dashed border, reduced opacity
 * 4. In progress - Success styling with play icon
 * 5. Completed - Muted surface with check icon
 * 6. External events - Neutral, never competes with recommended
 *
 * Badge priority: Pågår > Anbefalt > Fullført > Planlagt > Foreslått
 */

import React from 'react';
import { Play, Check, Clock, MapPin, Calendar } from 'lucide-react';
import { EventCardProps } from './types';

// Format duration
const formatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}t ${mins}m` : `${hrs}t`;
  }
  return `${minutes}m`;
};

// Base card classes
const baseCardClasses = 'h-full rounded-lg overflow-hidden cursor-pointer transition-all flex flex-col';

// Card variant classes based on status/type
const getCardClasses = (
  isGhost: boolean,
  isAKWorkout: boolean,
  status?: string,
  isRecommended?: boolean
): string => {
  if (isGhost) {
    return `${baseCardClasses} border-2 border-dashed border-tier-navy opacity-60`;
  }
  if (!isAKWorkout) {
    return `${baseCardClasses} bg-tier-surface-base border-l-4 border-tier-border-default hover:shadow-md`;
  }

  switch (status) {
    case 'in_progress':
      return `${baseCardClasses} bg-tier-success/10 border-l-4 border-tier-success hover:shadow-lg hover:-translate-y-px`;
    case 'completed':
      return `${baseCardClasses} bg-tier-surface-base border-l-4 border-tier-success opacity-70 hover:shadow-lg hover:-translate-y-px`;
    default:
      if (isRecommended) {
        return `${baseCardClasses} bg-tier-navy/10 border-l-4 border-tier-navy hover:shadow-lg hover:-translate-y-px`;
      }
      return `${baseCardClasses} bg-tier-surface-base border-l-4 border-tier-border-default hover:shadow-lg hover:-translate-y-px`;
  }
};

// Badge classes
const baseBadgeClasses = 'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap';

export const EventCard: React.FC<EventCardProps> = ({ event, isGhost = false, onClick, onStart }) => {
  const isAKWorkout = event.type === 'ak_workout' && event.workout;
  const workout = event.workout;
  const external = event.external;

  // Determine badge to show (priority order)
  const getBadge = () => {
    if (!isAKWorkout) return null;

    if (workout?.status === 'in_progress') {
      return (
        <span className={`${baseBadgeClasses} bg-tier-success text-white`}>
          <Play size={8} />
          Pågår
        </span>
      );
    }

    if (workout?.status === 'completed') {
      return (
        <span className={`${baseBadgeClasses} bg-tier-success/10 text-tier-success`}>
          <Check size={8} />
          Fullført
        </span>
      );
    }

    if (isGhost) {
      return (
        <span className={`${baseBadgeClasses} bg-tier-navy/10 text-tier-navy border border-dashed border-tier-navy`}>
          Foreslått
        </span>
      );
    }

    if (workout?.isRecommended) {
      return (
        <span className={`${baseBadgeClasses} bg-tier-navy text-white`}>
          Anbefalt
        </span>
      );
    }

    return (
      <span className={`${baseBadgeClasses} bg-tier-surface-base text-tier-text-secondary`}>
        Planlagt
      </span>
    );
  };

  // Render TIER Golf workout
  if (isAKWorkout && workout) {
    return (
      <div
        className={getCardClasses(isGhost, true, workout.status, workout.isRecommended)}
        onClick={onClick}
      >
        <div className="flex-1 p-3 flex flex-col gap-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-tier-navy leading-tight truncate">{workout.name}</div>
              <div className="flex items-center gap-2 text-xs text-tier-text-tertiary">
                {workout.scheduledTime && (
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} />
                    {workout.scheduledTime}
                  </span>
                )}
                <span className="flex items-center gap-0.5">{formatDuration(workout.duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getBadge()}
              {workout.status === 'completed' && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-tier-success text-white flex-shrink-0">
                  <Check size={14} />
                </div>
              )}
              {workout.status !== 'completed' && workout.status !== 'in_progress' && onStart && (
                <button
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-tier-navy text-white flex-shrink-0 transition-colors hover:bg-tier-navy/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart();
                  }}
                >
                  <Play size={14} className="ml-0.5" />
                </button>
              )}
            </div>
          </div>
          {workout.location && (
            <div className="flex items-center gap-0.5 text-[10px] text-tier-text-tertiary mt-auto">
              <MapPin size={10} />
              {workout.location}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render external event
  if (external) {
    return (
      <div
        className={getCardClasses(false, false)}
        onClick={onClick}
      >
        <div className="flex-1 p-3 flex flex-col gap-1 min-w-0">
          <div className="text-sm font-medium text-tier-text-secondary leading-tight truncate">{external.title}</div>
          <div className="flex items-center gap-2 text-xs text-tier-text-tertiary">
            <span className="flex items-center gap-0.5">
              <Clock size={10} />
              {external.startTime} - {external.endTime}
            </span>
            {external.source && (
              <span className="flex items-center gap-0.5">
                <Calendar size={10} />
                {external.source}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EventCard;
