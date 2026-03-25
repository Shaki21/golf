/**
 * DagbokSessionRow
 *
 * Table-like row for displaying a single training session.
 * Shows pyramid badge, title, duration, planned/free status, and drill summary.
 *
 * Migrated to Tailwind CSS
 */

import React from 'react';
import {
  Clock, ChevronRight, CheckCircle, Circle, Activity,
  Dumbbell, Settings, Target, Flag, Trophy,
  type LucideIcon
} from 'lucide-react';

import type { DagbokSession, DagbokSessionRowProps, Pyramid } from '../types';
import { PYRAMIDS, PYRAMID_COLORS } from '../constants';
import { InfoTooltip } from '../../../../components/InfoTooltip';

// Icon mapping for pyramid types
const PYRAMID_ICON_MAP: Record<string, LucideIcon> = {
  'Dumbbell': Dumbbell,
  'Settings': Settings,
  'Target': Target,
  'Flag': Flag,
  'Trophy': Trophy,
};

// =============================================================================
// HELPERS
// =============================================================================

function formatTime(time?: string): string {
  if (!time) return '';
  return time.slice(0, 5);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

// =============================================================================
// COMPONENT
// =============================================================================

export const DagbokSessionRow: React.FC<DagbokSessionRowProps> = ({
  session,
  onClick,
  isExpanded = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const pyramidConfig = PYRAMIDS[session.pyramid];
  const IconComponent = PYRAMID_ICON_MAP[pyramidConfig.icon];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-white border-b border-tier-border-subtle cursor-pointer transition-colors duration-150 ${isHovered ? 'bg-tier-surface-subtle' : ''} ${className}`}
      onClick={() => onClick?.(session)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      {/* Pyramid badge with tooltip */}
      <div className="flex items-center gap-1">
        <div
          className="flex items-center justify-center w-10 h-10 rounded flex-shrink-0"
          style={{
            backgroundColor: PYRAMID_COLORS[session.pyramid].bg,
            color: PYRAMID_COLORS[session.pyramid].text,
          }}
        >
          {IconComponent && <IconComponent size={20} />}
        </div>
        <InfoTooltip
          content={`${pyramidConfig.label}: ${pyramidConfig.description}`}
          side="right"
          size={12}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-tier-navy overflow-hidden text-ellipsis whitespace-nowrap">
            {session.title}
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-sm ${
                session.isPlanned
                  ? 'bg-tier-gold/15 text-tier-gold'
                  : 'bg-tier-text-tertiary/15 text-tier-text-tertiary'
              }`}
            >
              {session.isPlanned ? (
                <>
                  <CheckCircle size={10} />
                  Planned
                </>
              ) : (
                <>
                  <Circle size={10} />
                  Free
                </>
              )}
            </span>
            <InfoTooltip
              content={
                session.isPlanned
                  ? 'Session is planned according to the training plan'
                  : 'Free session not part of the plan'
              }
              side="top"
              size={10}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-tier-text-secondary">
          <span className="flex items-center gap-1">
            {formatDate(session.date)}
            {session.startTime && (
              <>, {formatTime(session.startTime)}</>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {session.duration} min
          </span>
          {session.formula && (
            <span className="flex items-center gap-1">
              {session.formula}
            </span>
          )}
        </div>

        {/* Drills summary */}
        {session.drills.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-tier-text-tertiary mt-1">
            <Activity size={10} />
            {session.drills.length} exercises
            {session.totalReps > 0 && (
              <> | {session.totalReps} reps</>
            )}
          </div>
        )}
      </div>

      {/* Stats - Only show Reps and Duration */}
      <div className="flex items-center gap-5 flex-shrink-0">
        {session.totalReps > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex flex-col items-end min-w-[60px]">
              <span className="text-sm font-semibold text-tier-navy tabular-nums">{session.totalReps}</span>
              <span className="text-[10px] text-tier-text-tertiary uppercase">Reps</span>
            </div>
            <InfoTooltip
              content="Total repetitions in the session"
              side="left"
              size={12}
            />
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="flex flex-col items-end min-w-[60px]">
            <span className="text-sm font-semibold text-tier-navy tabular-nums">{session.duration}</span>
            <span className="text-[10px] text-tier-text-tertiary uppercase">Min</span>
          </div>
          <InfoTooltip
            content="Session duration in minutes"
            side="left"
            size={12}
          />
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight size={18} className="text-tier-text-tertiary flex-shrink-0" />
    </div>
  );
};

export default DagbokSessionRow;
