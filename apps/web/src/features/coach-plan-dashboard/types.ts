/**
 * Coach Plan Dashboard Types
 * Decision-first dashboard type definitions for coaches
 */

export type CoachDashboardState =
  | 'unreviewed_sessions'
  | 'pending_player_approvals'
  | 'tournament_prep'
  | 'today_sessions'
  | 'players_inactive'
  | 'all_clear';

export type CoachActionType =
  | 'review_session'
  | 'review_approval'
  | 'prep_tournament'
  | 'view_today_sessions'
  | 'check_inactive_players'
  | 'view_dashboard';

export type AttentionSeverity = 'warning' | 'error' | 'info';

export type CoachAttentionType =
  | 'unreviewed_session'
  | 'pending_approval'
  | 'tournament_prep_needed'
  | 'player_inactive'
  | 'player_at_risk';

export type PlayerCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';

export interface PlayerAttentionItem {
  id: string;
  name: string;
  category: PlayerCategory | null;
  reason: string;
  actionType: 'review' | 'approve' | 'contact' | 'plan';
  href: string;
  daysOverdue?: number;
}

export interface TodaySession {
  id: string;
  title: string;
  time: string;
  duration: number;
  playerName: string;
  playerId: string;
  focus: string | null;
}

export interface TeamLoadStats {
  totalPlayers: number;
  activePlayers: number;
  sessionsThisWeek: number;
  pendingReviews: number;
}

export interface TournamentItem {
  id: string;
  name: string;
  date: Date;
  daysUntil: number;
  playersEntered: number;
  playersPrepared: number;
  location: string;
}

export interface CoachAttentionItem {
  type: CoachAttentionType;
  message: string;
  severity: AttentionSeverity;
  playerId?: string;
  playerName?: string;
}

export interface CoachPrimaryAction {
  type: CoachActionType;
  label: string;
  href: string;
  context: string;
  count?: number;
}

export interface CoachDashboardData {
  state: CoachDashboardState;
  primaryAction: CoachPrimaryAction;
  playersNeedingAttention: PlayerAttentionItem[];
  todaySessions: TodaySession[];
  teamLoadStats: TeamLoadStats;
  upcomingTournaments: TournamentItem[];
  attentionItems: CoachAttentionItem[];
  attentionCount: number;
}
