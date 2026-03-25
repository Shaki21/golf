/**
 * Plan Dashboard Service
 * Business logic for the decision-first dashboard
 *
 * Computes dashboard state with priority logic:
 * 1. Missing log (immediate action needed)
 * 2. Plan not confirmed (blocking progress)
 * 3. Tournament soon (time-sensitive)
 * 4. Session upcoming (default active state)
 * 5. No sessions (needs planning)
 */

import { PrismaClient } from '@prisma/client';
import {
  PlanDashboardResponse,
  PlanState,
  PlanGoal,
  UpcomingSession,
  Tournament,
  LoadStats,
  AttentionItem,
  GoalStatus,
  PrimaryAction,
} from './types';

export class PlanDashboardService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get complete dashboard data for a player
   */
  async getDashboard(playerId: string): Promise<PlanDashboardResponse> {
    // Fetch all data in parallel for performance
    const [
      nextSession,
      goals,
      loadStats,
      upcomingTournament,
      missingLogs,
      planConfirmed,
    ] = await Promise.all([
      this.getNextSession(playerId),
      this.getActiveGoals(playerId, 3),
      this.getWeeklyLoadStats(playerId),
      this.getUpcomingTournament(playerId, 14),
      this.getMissingLogCount(playerId),
      this.isPlanConfirmed(playerId),
    ]);

    // Sort goals: at-risk first
    const sortedGoals = this.sortGoalsByRisk(goals);

    // Compute attention items
    const attentionItems = this.computeAttentionItems(
      sortedGoals,
      missingLogs,
      planConfirmed,
      upcomingTournament
    );

    // Determine state and primary action
    const { state, primaryAction } = this.computeStateAndAction(
      nextSession,
      missingLogs,
      planConfirmed,
      upcomingTournament
    );

    return {
      state,
      primaryAction,
      nextSession,
      goals: sortedGoals,
      loadStats,
      upcomingTournament,
      attentionItems,
      missingLogs,
    };
  }

  /**
   * Get the next upcoming session for a player
   */
  async getNextSession(playerId: string): Promise<UpcomingSession | null> {
    const now = new Date();

    const session = await this.prisma.trainingSession.findFirst({
      where: {
        playerId,
        sessionDate: { gte: now },
        completionStatus: { not: 'completed' },
      },
      orderBy: { sessionDate: 'asc' },
      select: {
        id: true,
        sessionType: true,
        sessionDate: true,
        duration: true,
        evaluationFocus: true,
        notes: true,
      },
    });

    if (!session) return null;

    const sessionDate = new Date(session.sessionDate);

    return {
      id: session.id,
      title: this.getSessionTitle(session.sessionType),
      date: sessionDate,
      time: sessionDate.toLocaleTimeString('nb-NO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: session.duration || 60,
      focus: session.evaluationFocus || session.notes || 'Generell trening',
      type: this.mapSessionType(session.sessionType),
      confirmed: true, // Sessions in DB are confirmed
    };
  }

  /**
   * Get active goals for a player (limited, sorted by risk)
   */
  async getActiveGoals(playerId: string, limit: number): Promise<PlanGoal[]> {
    const goals = await this.prisma.playerGoal.findMany({
      where: {
        playerId,
        status: 'active',
      },
      orderBy: { targetDate: 'asc' },
      take: limit * 2, // Fetch more for sorting
      select: {
        id: true,
        title: true,
        description: true,
        targetValue: true,
        currentValue: true,
        progressPercent: true,
        targetDate: true,
        goalType: true,
      },
    });

    return goals.map((goal) => this.mapGoalToPlanGoal(goal)).slice(0, limit);
  }

  /**
   * Get weekly load statistics
   */
  async getWeeklyLoadStats(playerId: string): Promise<LoadStats> {
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      select: {
        completionStatus: true,
        evaluationFocus: true,
        notes: true,
      },
    });

    const planned = sessions.length;
    const completed = sessions.filter(
      (s) => s.completionStatus === 'completed'
    ).length;
    const missingPurpose = sessions.filter(
      (s) => !s.evaluationFocus && !s.notes
    ).length;

    return { planned, completed, missingPurpose };
  }

  /**
   * Get upcoming tournament within specified days
   */
  async getUpcomingTournament(
    playerId: string,
    daysAhead: number
  ): Promise<Tournament | null> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // First check TournamentResult for registered tournaments
    const registration = await this.prisma.tournamentResult.findFirst({
      where: {
        playerId,
        tournament: {
          is: {
            startDate: {
              gte: now,
              lte: futureDate,
            },
          },
        },
      },
      orderBy: { tournament: { startDate: 'asc' } },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            startDate: true,
            courseName: true,
          },
        },
      },
    });

    if (!registration?.tournament) return null;

    const tournament = registration.tournament;
    const tournamentDate = new Date(tournament.startDate);
    const daysUntil = Math.ceil(
      (tournamentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if player has a preparation plan
    const hasPlan = await this.hasTournamentPlan(playerId, tournament.id);

    return {
      id: tournament.id,
      name: tournament.name,
      date: tournamentDate,
      daysUntil,
      hasPlan,
      location: tournament.courseName || 'Unknown course',
    };
  }

  /**
   * Get count of sessions missing training logs
   */
  async getMissingLogCount(playerId: string): Promise<number> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const count = await this.prisma.trainingSession.count({
      where: {
        playerId,
        sessionDate: {
          gte: sevenDaysAgo,
          lt: now,
        },
        completionStatus: 'completed',
        // Missing evaluation means no log
        evaluationFocus: null,
        evaluationTechnical: null,
      },
    });

    return count;
  }

  /**
   * Check if player has confirmed their weekly plan
   */
  async isPlanConfirmed(playerId: string): Promise<boolean> {
    const startOfWeek = this.getStartOfWeek(new Date());

    // Check if there are any sessions this week (indicates plan exists)
    const sessionsThisWeek = await this.prisma.trainingSession.count({
      where: {
        playerId,
        sessionDate: {
          gte: startOfWeek,
        },
      },
    });

    // If there are sessions planned, consider plan confirmed
    // In a more complete implementation, check a WeeklyPlanConfirmation table
    return sessionsThisWeek > 0;
  }

  /**
   * Check if player has a preparation plan for a tournament
   */
  private async hasTournamentPlan(
    playerId: string,
    tournamentId: string
  ): Promise<boolean> {
    // Check for sessions tagged with this tournament
    const prepSessions = await this.prisma.trainingSession.count({
      where: {
        playerId,
        notes: { contains: tournamentId },
      },
    });

    return prepSessions > 0;
  }

  /**
   * Compute dashboard state and primary action
   */
  private computeStateAndAction(
    nextSession: UpcomingSession | null,
    missingLogs: number,
    planConfirmed: boolean,
    upcomingTournament: Tournament | null
  ): { state: PlanState; primaryAction: PrimaryAction } {
    // Priority 1: Missing logs
    if (missingLogs > 0) {
      return {
        state: 'missing_log',
        primaryAction: {
          type: 'log_session',
          label: 'Loggfør økt',
          href: '/trening/logg',
          context: `${missingLogs} økt${missingLogs > 1 ? 'er' : ''} mangler logg`,
        },
      };
    }

    // Priority 2: Plan not confirmed
    if (!planConfirmed) {
      return {
        state: 'plan_not_confirmed',
        primaryAction: {
          type: 'confirm_plan',
          label: 'Bekreft ukeplan',
          href: '/plan/kalender',
          context: 'Ukeplanen er ikke bekreftet',
        },
      };
    }

    // Priority 3: Tournament soon without plan
    if (upcomingTournament && !upcomingTournament.hasPlan && upcomingTournament.daysUntil <= 14) {
      return {
        state: 'tournament_soon',
        primaryAction: {
          type: 'view_tournament',
          label: 'Planlegg forberedelse',
          href: `/plan/turneringer/${upcomingTournament.id}`,
          context: `${upcomingTournament.name} om ${upcomingTournament.daysUntil} dager`,
        },
      };
    }

    // Priority 4: Session upcoming
    if (nextSession) {
      return {
        state: 'session_upcoming',
        primaryAction: {
          type: 'start_session',
          label: 'Se neste økt',
          href: `/trening/okter/${nextSession.id}`,
          context: this.formatSessionContext(nextSession),
        },
      };
    }

    // Priority 5: No sessions
    return {
      state: 'no_sessions',
      primaryAction: {
        type: 'adjust_plan',
        label: 'Planlegg trening',
        href: '/plan/kalender',
        context: 'Ingen økter planlagt denne uken',
      },
    };
  }

  /**
   * Compute attention items based on current state
   */
  private computeAttentionItems(
    goals: PlanGoal[],
    missingLogs: number,
    planConfirmed: boolean,
    upcomingTournament: Tournament | null
  ): AttentionItem[] {
    const items: AttentionItem[] = [];

    // Missing logs
    if (missingLogs > 0) {
      items.push({
        type: 'missing_log',
        message: `${missingLogs} økt${missingLogs > 1 ? 'er' : ''} mangler treningslogg`,
        severity: 'warning',
      });
    }

    // Plan not confirmed
    if (!planConfirmed) {
      items.push({
        type: 'plan_not_confirmed',
        message: 'Ukeplanen er ikke bekreftet',
        severity: 'warning',
      });
    }

    // Tournament soon without plan
    if (upcomingTournament && !upcomingTournament.hasPlan && upcomingTournament.daysUntil <= 14) {
      items.push({
        type: 'tournament_soon',
        message: `${upcomingTournament.name} om ${upcomingTournament.daysUntil} dager uten forberedelsesplan`,
        severity: 'info',
      });
    }

    // At-risk goals
    const atRiskGoals = goals.filter((g) => g.status === 'at_risk');
    atRiskGoals.forEach((goal) => {
      items.push({
        type: 'at_risk_goal',
        message: `${goal.title}: ${goal.statusReason}`,
        severity: 'warning',
      });
    });

    return items;
  }

  /**
   * Sort goals by risk status (at_risk first, then on_track, then ahead)
   */
  private sortGoalsByRisk(goals: PlanGoal[]): PlanGoal[] {
    const order: Record<GoalStatus, number> = {
      at_risk: 0,
      on_track: 1,
      ahead: 2,
    };
    return [...goals].sort((a, b) => order[a.status] - order[b.status]);
  }

  /**
   * Map database goal to PlanGoal interface
   */
  private mapGoalToPlanGoal(goal: {
    id: string;
    title: string;
    description: string | null;
    targetValue: number | null;
    currentValue: number | null;
    progressPercent: number | null;
    targetDate: Date | null;
    goalType: string | null;
  }): PlanGoal {
    const progress = goal.progressPercent || 0;
    const target = Number(goal.targetValue) || 100;
    const current = Number(goal.currentValue) || 0;

    // Determine status based on progress
    let status: GoalStatus;
    let statusReason: string;

    if (progress < 50 && goal.targetDate) {
      const daysUntilTarget = Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilTarget < 30) {
        status = 'at_risk';
        statusReason = `Only ${progress}% complete with ${daysUntilTarget} days left`;
      } else {
        status = 'on_track';
        statusReason = 'On track with planned activities';
      }
    } else if (progress >= 100) {
      status = 'ahead';
      statusReason = 'Goal achieved!';
    } else {
      status = 'on_track';
      statusReason = 'Good progress';
    }

    return {
      id: goal.id,
      title: goal.title,
      outcome: goal.description || goal.title,
      leadingIndicator: {
        label: this.getLeadingIndicatorLabel(goal.goalType),
        target: target,
        current: current,
        unit: this.getLeadingIndicatorUnit(goal.goalType),
      },
      status,
      statusReason,
      drillHref: status === 'at_risk' ? `/training/drills?focus=${goal.goalType}` : undefined,
    };
  }

  /**
   * Get session title based on type
   */
  private getSessionTitle(sessionType: string | null): string {
    const titles: Record<string, string> = {
      technical: 'Technical Training',
      physical: 'Physical Training',
      mental: 'Mental Training',
      course: 'Course Practice',
      competition: 'Competition Training',
      coaching: 'Coaching Session',
    };
    return titles[sessionType || ''] || 'Training Session';
  }

  /**
   * Map session type to frontend enum
   */
  private mapSessionType(
    sessionType: string | null
  ): 'training' | 'coaching' | 'testing' | 'tournament' {
    if (sessionType === 'coaching') return 'coaching';
    if (sessionType === 'testing') return 'testing';
    if (sessionType === 'competition') return 'tournament';
    return 'training';
  }

  /**
   * Format session context for display
   */
  private formatSessionContext(session: UpcomingSession): string {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const daysDiff = Math.ceil(
      (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let dayLabel: string;
    if (daysDiff === 0) dayLabel = 'Today';
    else if (daysDiff === 1) dayLabel = 'Tomorrow';
    else dayLabel = `In ${daysDiff} days`;

    return `${dayLabel} at ${session.time} · ${session.focus}`;
  }

  /**
   * Get leading indicator label based on goal type
   */
  private getLeadingIndicatorLabel(goalType: string | null): string {
    const labels: Record<string, string> = {
      putting: 'Putting sessions this week',
      driving: 'Driving range sessions',
      short_game: 'Short game sessions',
      course: 'Practice rounds',
      physical: 'Training sessions',
      mental: 'Mental exercises',
    };
    return labels[goalType || ''] || 'Activities this week';
  }

  /**
   * Get leading indicator unit based on goal type
   */
  private getLeadingIndicatorUnit(goalType: string | null): string {
    const units: Record<string, string> = {
      course: 'rounds',
      physical: 'sessions',
      mental: 'exercises',
    };
    return units[goalType || ''] || 'sessions';
  }

  /**
   * Get start of current week (Monday)
   */
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get end of current week (Sunday)
   */
  private getEndOfWeek(date: Date): Date {
    const d = this.getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}
