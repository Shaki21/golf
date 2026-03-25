/**
 * Plan Dashboard Types
 * TypeScript interfaces for the decision-first dashboard API
 */

export type PlanState =
  | 'no_sessions'
  | 'session_upcoming'
  | 'plan_not_confirmed'
  | 'missing_log'
  | 'tournament_soon';

export type ActionType =
  | 'start_session'
  | 'confirm_plan'
  | 'log_session'
  | 'adjust_plan'
  | 'view_tournament';

export type GoalStatus = 'on_track' | 'at_risk' | 'ahead';

export type SessionType = 'training' | 'coaching' | 'testing' | 'tournament';

export type AttentionSeverity = 'warning' | 'error' | 'info';

export type AttentionType =
  | 'at_risk_goal'
  | 'plan_not_confirmed'
  | 'missing_log'
  | 'tournament_soon';

export interface LeadingIndicator {
  label: string;
  target: number;
  current: number;
  unit: string;
}

export interface PlanGoal {
  id: string;
  title: string;
  outcome: string;
  leadingIndicator: LeadingIndicator;
  status: GoalStatus;
  statusReason: string;
  drillHref?: string;
}

export interface UpcomingSession {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  focus: string;
  type: SessionType;
  confirmed: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  date: Date;
  daysUntil: number;
  hasPlan: boolean;
  location: string;
}

export interface LoadStats {
  planned: number;
  completed: number;
  missingPurpose: number;
}

export interface AttentionItem {
  type: AttentionType;
  message: string;
  severity: AttentionSeverity;
}

export interface PrimaryAction {
  type: ActionType;
  label: string;
  href: string;
  context: string;
}

export interface PlanDashboardResponse {
  state: PlanState;
  primaryAction: PrimaryAction;
  nextSession: UpcomingSession | null;
  goals: PlanGoal[];
  loadStats: LoadStats;
  upcomingTournament: Tournament | null;
  attentionItems: AttentionItem[];
  missingLogs: number;
}
