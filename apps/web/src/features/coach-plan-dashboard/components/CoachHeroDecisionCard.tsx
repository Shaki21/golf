/**
 * CoachHeroDecisionCard (Layer 1)
 *
 * The primary decision interface for coaches showing:
 * - "This week" context
 * - Next critical action
 * - ONE primary CTA
 * - Today's sessions preview
 * - Subtle secondary actions
 *
 * Job-to-be-done in <5 seconds:
 * "What is the most important coaching decision/action I should take now?"
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  AlertCircle,
  ArrowRight,
  Trophy,
  ClipboardList,
  CheckCircle,
  UserX,
  CalendarDays,
  Eye,
} from 'lucide-react';
import type { CoachDashboardData, TodaySession, CoachActionType } from '../types';

interface CoachHeroDecisionCardProps {
  data: CoachDashboardData;
  coachName?: string;
}

const ACTION_ICONS: Record<CoachActionType, React.ElementType> = {
  review_session: ClipboardList,
  review_approval: CheckCircle,
  prep_tournament: Trophy,
  view_today_sessions: CalendarDays,
  check_inactive_players: UserX,
  view_dashboard: Eye,
};

export const CoachHeroDecisionCard = memo(function CoachHeroDecisionCard({
  data,
  coachName = 'Coach',
}: CoachHeroDecisionCardProps) {
  const { primaryAction, todaySessions, attentionItems, state } = data;
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
              This Week
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {getGreeting(coachName, state)}
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

        {/* Today's sessions preview */}
        {todaySessions.length > 0 && (
          <TodaySessionsPreview sessions={todaySessions} />
        )}

        {/* Secondary actions */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            to="/coach/athletes"
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline flex items-center gap-1.5"
          >
            <Users size={14} />
            All players
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to="/coach/calendar"
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Calendar
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to="/coach/messages"
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Messages
          </Link>
        </div>
      </div>
    </div>
  );
});

interface TodaySessionsPreviewProps {
  sessions: TodaySession[];
}

function TodaySessionsPreview({ sessions }: TodaySessionsPreviewProps) {
  const displaySessions = sessions.slice(0, 3);
  const remainingCount = sessions.length - displaySessions.length;

  return (
    <div className="mb-6">
      <p className="text-white/70 text-sm mb-3">Today's sessions</p>
      <div className="flex flex-wrap gap-2">
        {displaySessions.map((session) => (
          <Link
            key={session.id}
            to={`/coach/sessions/${session.id}`}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Clock size={14} className="text-tier-gold" />
            <span className="text-white font-medium text-sm">{session.time}</span>
            <span className="text-white/60 text-sm">-</span>
            <span className="text-white/80 text-sm truncate max-w-[120px]">{session.playerName}</span>
          </Link>
        ))}
        {remainingCount > 0 && (
          <Link
            to="/coach/calendar"
            className="flex items-center gap-1 px-3 py-2 text-white/60 hover:text-white text-sm"
          >
            +{remainingCount} more
          </Link>
        )}
      </div>
    </div>
  );
}

function getGreeting(coachName: string, state: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  switch (state) {
    case 'unreviewed_sessions':
      return `${timeGreeting}, ${coachName}! You have sessions to review.`;
    case 'pending_player_approvals':
      return `${timeGreeting}, ${coachName}! Players need your feedback.`;
    case 'tournament_prep':
      return `${timeGreeting}, ${coachName}! Tournament prep is needed.`;
    case 'today_sessions':
      return `${timeGreeting}, ${coachName}! You have sessions today.`;
    case 'players_inactive':
      return `${timeGreeting}, ${coachName}! Some players need attention.`;
    default:
      return `${timeGreeting}, ${coachName}! Your team is on track.`;
  }
}

export default CoachHeroDecisionCard;
