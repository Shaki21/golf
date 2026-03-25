/**
 * Coach Plan Dashboard Types
 * TypeScript interfaces for the coach decision-first dashboard API
 *
 * Answers: "What is the most important coaching action I should take NOW?"
 */

// State machine priority order
export type CoachDashboardState =
  | 'unreviewed_sessions'    // Sessions need coach review/feedback
  | 'pending_player_approvals' // Players awaiting plan confirmation
  | 'tournament_prep'        // Athletes with tournaments <14 days, no prep
  | 'today_sessions'         // Coaching sessions scheduled today
  | 'players_inactive'       // Athletes with no activity >14 days
  | 'all_clear';             // No immediate actions needed

export type CoachActionType =
  | 'review_session'
  | 'approve_plan'
  | 'create_prep_plan'
  | 'start_session'
  | 'reach_out'
  | 'view_calendar';

export type AttentionSeverity = 'error' | 'warning' | 'info';

export type AttentionType =
  | 'unreviewed_session'
  | 'pending_approval'
  | 'tournament_prep'
  | 'inactive_player';

export interface PrimaryAction {
  type: CoachActionType;
  label: string;
  href: string;
  context: string;
}

export interface PlayerAttentionItem {
  playerId: string;
  playerName: string;
  playerInitials: string;
  reason: string;
  severity: AttentionSeverity;
  actionHref: string;
  daysInactive?: number;
  sessionId?: string;
}

export interface TodaySession {
  id: string;
  playerId: string;
  playerName: string;
  playerInitials: string;
  time: string;
  duration: number;
  focus: string;
  type: 'coaching' | 'evaluation' | 'group';
  status: 'upcoming' | 'in_progress' | 'completed';
}

export interface TeamLoadStats {
  totalPlayers: number;
  activePlayers: number;
  sessionsThisWeek: number;
  pendingReviews: number;
  averageSessionsPerPlayer: number;
}

export interface UpcomingTournament {
  id: string;
  name: string;
  date: Date;
  daysUntil: number;
  playersRegistered: number;
  playersWithPlan: number;
  location: string;
}

export interface AttentionItem {
  type: AttentionType;
  message: string;
  severity: AttentionSeverity;
  count?: number;
}

export interface CoachDashboardResponse {
  state: CoachDashboardState;
  primaryAction: PrimaryAction;

  // Layer 1 - Decision context
  playersNeedingAttention: PlayerAttentionItem[];
  todaySessions: TodaySession[];

  // Layer 2 - Control metrics
  teamLoadStats: TeamLoadStats;
  upcomingTournaments: UpcomingTournament[];

  // Layer 3 - Attention items
  attentionItems: AttentionItem[];
  attentionCount: number;
}

export interface AttentionCountResponse {
  count: number;
}
