/**
 * ScheduleCard
 * Design System v3.1 - Tailwind CSS
 *
 * Daily training plan/schedule display.
 * Shows time-blocked sessions with type indicators.
 *
 * Design principles:
 * - Time is aligned for quick scanning
 * - Session types use subtle semantic colors
 * - Completed sessions are visually muted
 * - Touch targets meet 44px minimum
 */

import React from 'react';
import Card from '../../../../ui/primitives/Card';
import { SubSectionTitle } from '../../../../components/typography';

type SessionType =
  | 'teknikk'
  | 'golfslag'
  | 'spill'
  | 'kompetanse'
  | 'fysisk'
  | 'funksjonell'
  | 'hjemme'
  | 'test';

type SessionStatus = 'upcoming' | 'in_progress' | 'completed' | 'skipped';

interface ScheduleSession {
  id: string;
  title: string;
  type: SessionType;
  startTime: string; // "09:00"
  endTime?: string;  // "10:30"
  duration?: number; // minutes
  status: SessionStatus;
  location?: string;
}

interface ScheduleCardProps {
  /** Date label (e.g., "Mandag 29. des") */
  dateLabel: string;
  /** List of sessions */
  sessions: ScheduleSession[];
  /** Empty state message */
  emptyMessage?: string;
  /** Click handler for session */
  onSessionClick?: (session: ScheduleSession) => void;
  /** View all action */
  onViewAll?: () => void;
}

// Session type background colors
const TYPE_BG_COLORS: Record<SessionType, string> = {
  teknikk: 'bg-blue-50',
  golfslag: 'bg-green-50',
  spill: 'bg-amber-50',
  kompetanse: 'bg-indigo-50',
  fysisk: 'bg-red-50',
  funksjonell: 'bg-red-50',
  hjemme: 'bg-gray-50',
  test: 'bg-blue-50',
};

// Session type dot colors
const TYPE_DOT_COLORS: Record<SessionType, string> = {
  teknikk: 'bg-blue-500',
  golfslag: 'bg-green-500',
  spill: 'bg-amber-500',
  kompetanse: 'bg-tier-navy',
  fysisk: 'bg-red-500',
  funksjonell: 'bg-red-500',
  hjemme: 'bg-gray-500',
  test: 'bg-blue-500',
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  dateLabel,
  sessions,
  emptyMessage = 'Ingen planlagte økter i dag',
  onSessionClick,
  onViewAll,
}) => {
  const getStatusClasses = (status: SessionStatus): string => {
    switch (status) {
      case 'completed':
        return 'opacity-50';
      case 'skipped':
        return 'opacity-30 line-through';
      case 'in_progress':
        return 'border-l-[3px] border-l-tier-navy pl-[calc(0.75rem-3px)]';
      default:
        return '';
    }
  };

  return (
    <Card variant="default" padding="none">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-tier-border-subtle">
        <div>
          <span className="block text-xs leading-tight font-medium text-tier-text-tertiary uppercase tracking-wide mb-0.5">
            Dagens plan
          </span>
          <SubSectionTitle className="text-base leading-tight font-semibold text-tier-navy m-0">
            {dateLabel}
          </SubSectionTitle>
        </div>
        {onViewAll && (
          <button
            className="text-sm leading-tight font-medium text-tier-gold bg-transparent border-none px-2 py-1 cursor-pointer rounded-md hover:bg-tier-surface-subtle transition-colors"
            onClick={onViewAll}
          >
            Se alt
          </button>
        )}
      </div>

      {/* Sessions list */}
      <div className="p-2">
        {sessions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm leading-tight text-tier-text-tertiary m-0">
              {emptyMessage}
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 cursor-pointer transition-transform min-h-[52px] hover:scale-[1.01] ${TYPE_BG_COLORS[session.type]} ${getStatusClasses(session.status)}`}
              onClick={() => onSessionClick?.(session)}
              role={onSessionClick ? 'button' : undefined}
              tabIndex={onSessionClick ? 0 : undefined}
            >
              {/* Time column */}
              <div className="flex flex-col items-end w-11 shrink-0">
                <span className="text-sm leading-tight font-semibold text-tier-navy tabular-nums">
                  {session.startTime}
                </span>
                {session.endTime && (
                  <span className="text-[10px] leading-tight text-tier-text-tertiary tabular-nums">
                    {session.endTime}
                  </span>
                )}
              </div>

              {/* Content column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT_COLORS[session.type]}`} />
                  <span className="text-sm leading-tight font-medium text-tier-navy overflow-hidden text-ellipsis whitespace-nowrap">
                    {session.title}
                  </span>
                </div>
                {session.location && (
                  <span className="block text-xs leading-tight text-tier-text-secondary mt-0.5 ml-4">
                    {session.location}
                  </span>
                )}
              </div>

              {/* Status indicator */}
              {session.status === 'completed' && (
                <span className="flex items-center justify-center text-green-600 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ScheduleCard;
