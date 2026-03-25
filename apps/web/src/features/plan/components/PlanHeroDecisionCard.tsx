/**
 * PlanHeroDecisionCard (Layer 1)
 *
 * The primary decision interface showing:
 * - "This week" context
 * - Next critical action
 * - ONE primary CTA
 * - Subtle secondary actions
 *
 * Job-to-be-done in <5 seconds:
 * "What is the most important training decision/action I should take now?"
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Target,
  AlertCircle,
  ArrowRight,
  Trophy,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';
import type { PlanDashboardData, UpcomingSession, ActionType } from '../types';
import { TIME_LABELS, ACTION_LABELS } from '../../../constants/ui-labels';

interface PlanHeroDecisionCardProps {
  data: PlanDashboardData;
  userName?: string;
}

const ACTION_ICONS: Record<ActionType, React.ElementType> = {
  start_session: Calendar,
  confirm_plan: CheckCircle,
  log_session: ClipboardList,
  adjust_plan: Target,
  view_tournament: Trophy,
};

export const PlanHeroDecisionCard = memo(function PlanHeroDecisionCard({
  data,
  userName = 'Player',
}: PlanHeroDecisionCardProps) {
  const { primaryAction, nextSession, attentionItems, state } = data;
  const ActionIcon = ACTION_ICONS[primaryAction.type];
  const hasAttention = attentionItems.length > 0;
  const warningItems = attentionItems.filter(i => i.severity === 'warning' || i.severity === 'error');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tier-navy via-tier-navy to-tier-navy-dark p-6 md:p-8 shadow-lg">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tier-gold rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-tier-gold font-semibold text-sm uppercase tracking-wide mb-1">
              {TIME_LABELS.thisWeek}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {getGreeting(userName, state)}
            </h2>
          </div>

          {/* Attention indicator */}
          {hasAttention && warningItems.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-status-warning/20 rounded-full">
              <AlertCircle size={16} className="text-status-warning" />
              <span className="text-sm font-medium text-status-warning">
                {warningItems.length} need{warningItems.length === 1 ? 's' : ''} attention
              </span>
            </div>
          )}
        </div>

        {/* Main decision area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-tier-gold/20 flex items-center justify-center shrink-0">
              <ActionIcon size={28} className="text-tier-gold" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm mb-1">Next action</p>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate">
                {primaryAction.label}
              </h3>
              <p className="text-white/80 text-sm">
                {primaryAction.context}
              </p>
            </div>

            {/* Primary CTA */}
            <Link
              to={primaryAction.href}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-tier-gold hover:bg-tier-gold-dark text-tier-navy font-bold rounded-xl transition-all shadow-lg hover:shadow-xl shrink-0"
            >
              {primaryAction.label}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Session preview (if applicable) */}
        {nextSession && state === 'session_upcoming' && (
          <SessionPreview session={nextSession} />
        )}

        {/* Secondary actions */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            to="/plan/kalender"
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            View training plan
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to="/plan/maal"
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Manage goals
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to="/trening/logg"
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            {ACTION_LABELS.logSession}
          </Link>
        </div>
      </div>
    </div>
  );
});

interface SessionPreviewProps {
  session: UpcomingSession;
}

function SessionPreview({ session }: SessionPreviewProps) {
  const typeLabels = {
    training: 'Training',
    coaching: 'Coaching',
    testing: 'Testing',
    tournament: 'Tournament',
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
      <div className="flex items-center gap-1.5 text-white/80">
        <Calendar size={14} />
        <span>{formatDate(session.date)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-white/80">
        <Clock size={14} />
        <span>{session.time} ({session.duration} min)</span>
      </div>
      <span className="px-2 py-0.5 bg-white/20 rounded-full text-white/90 text-xs font-medium">
        {typeLabels[session.type]}
      </span>
      {session.confirmed && (
        <span className="flex items-center gap-1 text-status-success text-xs">
          <CheckCircle size={12} />
          Confirmed
        </span>
      )}
    </div>
  );
}

function getGreeting(userName: string, state: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  switch (state) {
    case 'missing_log':
      return `${timeGreeting}, ${userName}! You have sessions to log.`;
    case 'plan_not_confirmed':
      return `${timeGreeting}, ${userName}! Your weekly plan needs confirmation.`;
    case 'tournament_soon':
      return `${timeGreeting}, ${userName}! Tournament is approaching.`;
    case 'session_upcoming':
      return `${timeGreeting}, ${userName}! Your next session is ready.`;
    default:
      return `${timeGreeting}, ${userName}! Let's plan your training.`;
  }
}

function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return TIME_LABELS.today;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return TIME_LABELS.tomorrow;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export default PlanHeroDecisionCard;
