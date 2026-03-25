/**
 * TeamLoadCard (Layer 2)
 *
 * Shows team-wide statistics and upcoming tournaments:
 * - Total/active players
 * - Sessions this week
 * - Pending reviews
 * - Upcoming tournaments with prep status
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  ClipboardList,
  Trophy,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import type { TeamLoadStats, TournamentItem, CoachAttentionItem } from '../types';

interface TeamLoadCardProps {
  loadStats: TeamLoadStats;
  tournaments: TournamentItem[];
  attentionItems: CoachAttentionItem[];
  className?: string;
}

export const TeamLoadCard = memo(function TeamLoadCard({
  loadStats,
  tournaments,
  attentionItems,
  className = '',
}: TeamLoadCardProps) {
  const upcomingTournaments = tournaments.slice(0, 2);
  const warningCount = attentionItems.filter(
    (i) => i.severity === 'warning' || i.severity === 'error'
  ).length;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-tier-text-primary">
          Team Overview
        </h3>
        {warningCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 bg-status-warning/10 text-status-warning text-sm font-medium rounded-full">
            <AlertCircle size={14} />
            {warningCount}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Active Players"
          value={loadStats.activePlayers}
          subValue={`of ${loadStats.totalPlayers}`}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="Sessions This Week"
          value={loadStats.sessionsThisWeek}
          color="green"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Reviews"
          value={loadStats.pendingReviews}
          color={loadStats.pendingReviews > 0 ? 'amber' : 'gray'}
          isWarning={loadStats.pendingReviews > 0}
        />
        <StatCard
          icon={Trophy}
          label="Upcoming Tournaments"
          value={tournaments.length}
          color="purple"
        />
      </div>

      {/* Upcoming tournaments */}
      {upcomingTournaments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-tier-text-secondary mb-3">
            Upcoming Tournaments
          </h4>
          <div className="space-y-2">
            {upcomingTournaments.map((tournament) => (
              <TournamentRow key={tournament.id} tournament={tournament} />
            ))}
          </div>
          {tournaments.length > 2 && (
            <Link
              to="/coach/tournaments"
              className="flex items-center justify-center gap-1 mt-3 py-2 text-sm text-tier-primary hover:text-tier-primary-dark font-medium"
            >
              View all tournaments
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      )}

      {/* Attention items */}
      {attentionItems.length > 0 && (
        <div className="mt-6 pt-4 border-t border-tier-surface-tertiary">
          <h4 className="text-sm font-medium text-tier-text-secondary mb-3">
            Attention Items
          </h4>
          <div className="space-y-2">
            {attentionItems.slice(0, 3).map((item, idx) => (
              <AttentionRow key={idx} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  subValue?: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'gray';
  isWarning?: boolean;
}

function StatCard({ icon: Icon, label, value, subValue, color, isWarning }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-500',
  };

  return (
    <div className="p-4 bg-tier-surface-secondary rounded-lg">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon size={16} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${isWarning ? 'text-status-warning' : 'text-tier-text-primary'}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-tier-text-tertiary">{subValue}</span>
        )}
      </div>
      <p className="text-sm text-tier-text-secondary mt-0.5">{label}</p>
    </div>
  );
}

interface TournamentRowProps {
  tournament: TournamentItem;
}

function TournamentRow({ tournament }: TournamentRowProps) {
  const unprepared = tournament.playersEntered - tournament.playersPrepared;
  const isUrgent = tournament.daysUntil <= 7 && unprepared > 0;

  return (
    <Link
      to={`/coach/tournaments/${tournament.id}`}
      className="flex items-center gap-3 p-3 bg-tier-surface-secondary rounded-lg hover:bg-tier-surface-tertiary transition-colors"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        isUrgent ? 'bg-status-warning/10' : 'bg-tier-gold/10'
      }`}>
        <Trophy size={20} className={isUrgent ? 'text-status-warning' : 'text-tier-gold'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-tier-text-primary truncate">
          {tournament.name}
        </p>
        <p className="text-sm text-tier-text-secondary">
          {tournament.daysUntil === 0 ? 'Today' :
           tournament.daysUntil === 1 ? 'Tomorrow' :
           `In ${tournament.daysUntil} days`}
          {' · '}
          <span className={unprepared > 0 ? 'text-status-warning font-medium' : ''}>
            {tournament.playersPrepared}/{tournament.playersEntered} prepared
          </span>
        </p>
      </div>
      <ChevronRight size={16} className="text-tier-text-tertiary shrink-0" />
    </Link>
  );
}

interface AttentionRowProps {
  item: CoachAttentionItem;
}

function AttentionRow({ item }: AttentionRowProps) {
  const severityStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-lg border ${severityStyles[item.severity]}`}>
      <AlertCircle size={14} className="mt-0.5 shrink-0" />
      <p className="text-sm">{item.message}</p>
    </div>
  );
}

export default TeamLoadCard;
