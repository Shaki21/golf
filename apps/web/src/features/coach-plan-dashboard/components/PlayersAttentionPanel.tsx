/**
 * PlayersAttentionPanel (Layer 2)
 *
 * Shows players needing coach attention:
 * - Sorted by urgency (unreviewed first, then pending, then inactive)
 * - Max 5 players shown
 * - Quick action buttons
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle,
  MessageSquare,
  FileText,
  ChevronRight,
  AlertTriangle,
  User,
} from 'lucide-react';
import type { PlayerAttentionItem } from '../types';

interface PlayersAttentionPanelProps {
  players: PlayerAttentionItem[];
  className?: string;
}

const ACTION_ICONS = {
  review: ClipboardList,
  approve: CheckCircle,
  contact: MessageSquare,
  plan: FileText,
};

const ACTION_LABELS = {
  review: 'Review',
  approve: 'Approve',
  contact: 'Contact',
  plan: 'Plan',
};

const CATEGORY_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-purple-100 text-purple-800',
  D: 'bg-yellow-100 text-yellow-800',
  E: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800',
};

export const PlayersAttentionPanel = memo(function PlayersAttentionPanel({
  players,
  className = '',
}: PlayersAttentionPanelProps) {
  if (players.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-tier-text-primary mb-4">
          Players Needing Attention
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center mb-3">
            <CheckCircle size={24} className="text-status-success" />
          </div>
          <p className="text-tier-text-secondary font-medium">All clear!</p>
          <p className="text-tier-text-tertiary text-sm mt-1">
            No players need immediate attention
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-text-primary">
          Players Needing Attention
        </h3>
        <span className="px-2.5 py-1 bg-status-warning/10 text-status-warning text-sm font-medium rounded-full">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {players.map((player) => (
          <PlayerAttentionRow key={player.id} player={player} />
        ))}
      </div>

      {players.length >= 5 && (
        <Link
          to="/coach/athletes?filter=needs_attention"
          className="flex items-center justify-center gap-1 mt-4 py-2 text-sm text-tier-primary hover:text-tier-primary-dark font-medium"
        >
          View all
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
});

interface PlayerAttentionRowProps {
  player: PlayerAttentionItem;
}

function PlayerAttentionRow({ player }: PlayerAttentionRowProps) {
  const ActionIcon = ACTION_ICONS[player.actionType] || ChevronRight;
  const actionLabel = ACTION_LABELS[player.actionType] || 'View';
  const categoryColor = player.category
    ? CATEGORY_COLORS[player.category] || CATEGORY_COLORS.default
    : CATEGORY_COLORS.default;

  return (
    <div className="flex items-center gap-3 p-3 bg-tier-surface-secondary rounded-lg hover:bg-tier-surface-tertiary transition-colors">
      {/* Avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center shrink-0">
        <User size={20} className="text-tier-navy/50" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-tier-text-primary truncate">
            {player.name}
          </span>
          {player.category && (
            <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${categoryColor}`}>
              {player.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-tier-text-secondary">
          {player.daysOverdue && player.daysOverdue > 2 && (
            <AlertTriangle size={12} className="text-status-warning shrink-0" />
          )}
          <span className="truncate">{player.reason}</span>
        </div>
      </div>

      {/* Action button */}
      <Link
        to={player.href}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-tier-navy text-white text-sm font-medium rounded-lg hover:bg-tier-navy-dark transition-colors shrink-0"
      >
        <ActionIcon size={14} />
        {actionLabel}
      </Link>
    </div>
  );
}

export default PlayersAttentionPanel;
