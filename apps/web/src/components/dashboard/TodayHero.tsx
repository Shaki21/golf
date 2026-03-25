/**
 * TodayHero - Primary Landing Experience
 *
 * TIER Golf Design System - Action-Centric Dashboard
 *
 * Answers the question: "What should I train right now?"
 *
 * Features:
 * - Shows today's priority session based on goal status
 * - Displays goal connection and urgency reason
 * - One-click action to start training
 * - Secondary sessions shown below
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  Clock,
  ChevronRight,
  Calendar,
  CheckCircle,
  Sparkles,
  Play,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../shadcn/button';
import { StatusIndicator, getStatusFromDeficit } from '../ui/StatusIndicator';
import { TodaySession, TodayState, GoalStatus } from '../../utils/prioritization';
import {
  PAGE_TITLES,
  ACTION_LABELS,
  EMPTY_STATES,
  TIME_LABELS,
} from '../../constants/ui-labels';

// =============================================================================
// TYPES
// =============================================================================

export interface TodayHeroProps {
  /** Today's prioritized state from useTodayData */
  todayState: TodayState;
  /** Callback when user starts a training session */
  onStartTraining?: (sessionId: string) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Compact variant (for use in other pages) */
  variant?: 'full' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getStatusColor(status: GoalStatus): string {
  switch (status) {
    case 'at-risk':
    case 'behind':
      return 'text-status-error';
    case 'on-track':
      return 'text-status-success';
    case 'ahead':
      return 'text-tier-gold';
    case 'completed':
      return 'text-status-info';
    default:
      return 'text-tier-text-secondary';
  }
}

function getPriorityBadge(priority: 1 | 2 | 3): React.ReactNode {
  if (priority === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-error/10 text-status-error text-xs font-medium">
        <Sparkles size={12} />
        Priority
      </span>
    );
  }
  return null;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-tier-gold/10 flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-tier-gold" />
      </div>
      <h3 className="text-lg font-semibold text-tier-navy mb-2">
        All done for today!
      </h3>
      <p className="text-sm text-tier-text-secondary mb-4">
        {EMPTY_STATES.noSessionsToday}
      </p>
      <Link to="/trening/logg">
        <Button variant="outline">{ACTION_LABELS.logSession}</Button>
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
      <div className="h-12 w-full bg-gray-200 rounded" />
    </div>
  );
}

function SecondarySessionsList({
  sessions,
  onViewAll,
}: {
  sessions: TodaySession[];
  onViewAll?: () => void;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/20">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span className="flex items-center gap-2">
          <Calendar size={14} />
          Also planned:
          {sessions.slice(0, 2).map((session, i) => (
            <span key={session.id}>
              {i > 0 && ' | '}
              {session.title} ({session.estimatedDuration} min)
            </span>
          ))}
          {sessions.length > 2 && ` +${sessions.length - 2} more`}
        </span>
        <Link
          to="/plan"
          className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
        >
          {ACTION_LABELS.viewAll}
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TodayHero({
  todayState,
  onStartTraining,
  isLoading = false,
  variant = 'full',
  className,
}: TodayHeroProps) {
  const navigate = useNavigate();
  const { primarySession, secondarySessions, completedToday, plannedToday, isEmpty } =
    todayState;

  // Handle start training
  const handleStartTraining = () => {
    if (primarySession) {
      onStartTraining?.(primarySession.id);
      navigate(primarySession.actionHref);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-2xl bg-gradient-to-br from-tier-navy to-tier-navy/90 p-6 text-white',
          className
        )}
      >
        <LoadingState />
      </div>
    );
  }

  // Empty state
  if (isEmpty || !primarySession) {
    return (
      <div
        className={cn(
          'rounded-2xl bg-gradient-to-br from-tier-navy to-tier-navy/90 p-6 text-white',
          className
        )}
      >
        <EmptyState />
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-xl bg-gradient-to-r from-tier-navy to-tier-navy/95 p-4 text-white',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <h4 className="font-semibold">{primarySession.title}</h4>
              <p className="text-sm text-white/70">
                {primarySession.estimatedDuration} min • {primarySession.reason}
              </p>
            </div>
          </div>
          <Button
            onClick={handleStartTraining}
            className="bg-tier-gold hover:bg-tier-gold/90 text-tier-navy"
          >
            <Play size={16} className="mr-1" />
            Start
          </Button>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-tier-navy via-tier-navy to-tier-navy/95 p-6 text-white shadow-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold tracking-wide text-white/90 uppercase">
          {PAGE_TITLES.todaysFocus}
        </h2>
        <span className="text-sm text-white/60">{formatTime()}</span>
      </div>

      {/* Main Session */}
      <div className="mb-6">
        {/* Priority badge + Status */}
        <div className="flex items-center gap-2 mb-2">
          {getPriorityBadge(primarySession.priority)}
          {primarySession.goalConnection && (
            <StatusIndicator
              status={getStatusFromDeficit(
                primarySession.priority === 1 ? 2 : 0
              )}
              size="sm"
              variant="pill"
              className="bg-white/10 border-none"
            />
          )}
        </div>

        {/* Session Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-tier-gold/20 flex items-center justify-center">
            <Target size={24} className="text-tier-gold" />
          </div>
          <h3 className="text-2xl font-bold">{primarySession.title}</h3>
        </div>

        {/* Reason / Insight */}
        <p className="text-white/80 mb-4">{primarySession.reason}</p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
          <span className="flex items-center gap-1">
            <Clock size={14} />~{primarySession.estimatedDuration}{' '}
            {TIME_LABELS.minutes}
          </span>
          {primarySession.goalConnection && (
            <span className="flex items-center gap-1">
              <Target size={14} />
              Goal: {primarySession.goalConnection.goalName}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleStartTraining}
          size="lg"
          className="w-full bg-tier-gold hover:bg-tier-gold/90 text-tier-navy font-semibold text-base py-6"
        >
          <Play size={20} className="mr-2" />
          {ACTION_LABELS.startTraining}
          <ChevronRight size={20} className="ml-2" />
        </Button>
      </div>

      {/* Progress indicator */}
      {plannedToday > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-white/60 mb-2">
          <span>
            {completedToday} / {plannedToday} {TIME_LABELS.sessions} completed today
          </span>
        </div>
      )}

      {/* Secondary Sessions */}
      <SecondarySessionsList sessions={secondarySessions} />
    </div>
  );
}

export default TodayHero;
