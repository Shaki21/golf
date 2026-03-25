/**
 * Plan Dashboard Types
 * Decision-first dashboard type definitions
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

export interface PlanGoal {
  id: string;
  title: string;
  outcome: string;
  leadingIndicator: {
    label: string;
    target: number;
    current: number;
    unit: string;
  };
  status: GoalStatus;
  statusReason: string;
  /** Deep link to recommended exercise */
  drillHref?: string;
  /** Name of recommended exercise for contextual display */
  drillName?: string;
}

export interface UpcomingSession {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  focus: string;
  type: 'training' | 'coaching' | 'testing' | 'tournament';
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
  type: 'at_risk_goal' | 'plan_not_confirmed' | 'missing_log' | 'tournament_soon';
  message: string;
  severity: 'warning' | 'error' | 'info';
}

export interface PlanDashboardData {
  state: PlanState;
  primaryAction: {
    type: ActionType;
    label: string;
    href: string;
    context: string;
  };
  nextSession: UpcomingSession | null;
  goals: PlanGoal[];
  loadStats: LoadStats;
  upcomingTournament: Tournament | null;
  attentionItems: AttentionItem[];
  missingLogs: number;
}

export interface PlanOperationsSection {
  id: string;
  label: string;
  items: {
    href: string;
    label: string;
    icon: string;
    count?: number;
  }[];
}
