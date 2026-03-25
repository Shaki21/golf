/**
 * Coach Plan Dashboard Service
 * Business logic for the coach decision-first dashboard
 *
 * Computes dashboard state with priority logic:
 * 1. Unreviewed sessions (completed sessions needing coach attention)
 * 2. Pending player approvals (blocking player progress)
 * 3. Tournament prep (time-sensitive)
 * 4. Today's sessions (scheduled work)
 * 5. Inactive players (needs outreach)
 * 6. All clear (no immediate actions)
 */

import { PrismaClient } from '@prisma/client';
import {
  CoachDashboardResponse,
  CoachDashboardState,
  PlayerAttentionItem,
  TodaySession,
  TeamLoadStats,
  UpcomingTournament,
  AttentionItem,
  PrimaryAction,
  AttentionCountResponse,
} from './types';

export class CoachPlanDashboardService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get complete dashboard data for a coach
   */
  async getDashboard(coachId: string): Promise<CoachDashboardResponse> {
    // Fetch all data in parallel for performance
    const [
      unreviewedSessions,
      pendingApprovals,
      todaySessions,
      inactivePlayers,
      teamLoadStats,
      upcomingTournaments,
    ] = await Promise.all([
      this.getUnreviewedSessions(coachId),
      this.getPendingApprovals(coachId),
      this.getTodaySessions(coachId),
      this.getInactivePlayers(coachId, 14),
      this.getTeamLoadStats(coachId),
      this.getUpcomingTournaments(coachId, 30),
    ]);

    // Build players needing attention (max 5)
    const playersNeedingAttention = this.buildAttentionList(
      unreviewedSessions,
      pendingApprovals,
      inactivePlayers
    ).slice(0, 5);

    // Compute attention items
    const attentionItems = this.computeAttentionItems(
      unreviewedSessions.length,
      pendingApprovals.length,
      upcomingTournaments,
      inactivePlayers.length
    );

    // Determine state and primary action
    const { state, primaryAction } = this.computeStateAndAction(
      unreviewedSessions,
      pendingApprovals,
      todaySessions,
      inactivePlayers,
      upcomingTournaments
    );

    return {
      state,
      primaryAction,
      playersNeedingAttention,
      todaySessions: todaySessions.slice(0, 5),
      teamLoadStats,
      upcomingTournaments: upcomingTournaments.slice(0, 3),
      attentionItems,
      attentionCount: attentionItems.reduce((sum, item) => sum + (item.count || 1), 0),
    };
  }

  /**
   * Get lightweight attention count for sidebar badge
   */
  async getAttentionCount(coachId: string): Promise<AttentionCountResponse> {
    const [unreviewedCount, pendingCount, inactiveCount] = await Promise.all([
      this.countUnreviewedSessions(coachId),
      this.countPendingApprovals(coachId),
      this.countInactivePlayers(coachId, 14),
    ]);

    return {
      count: unreviewedCount + pendingCount + inactiveCount,
    };
  }

  /**
   * Get sessions that need coach review/feedback
   * These are completed sessions from the last 7 days where the coach hasn't added notes
   */
  private async getUnreviewedSessions(coachId: string): Promise<PlayerAttentionItem[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        coachId,
        completionStatus: 'completed',
        sessionDate: { gte: sevenDaysAgo },
        // Sessions without nextSessionFocus are considered unreviewed
        nextSessionFocus: null,
      },
      select: {
        id: true,
        playerId: true,
        player: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { sessionDate: 'desc' },
      take: 10,
    });

    return sessions
      .filter((session) => session.player !== null && session.playerId !== null)
      .map((session) => {
        const firstName = session.player?.user?.firstName || 'Unknown';
        const lastName = session.player?.user?.lastName || '';
        const playerName = `${firstName} ${lastName}`.trim();

        return {
          playerId: session.playerId!,
          playerName,
          playerInitials: this.getInitials(firstName, lastName),
          reason: 'Session needs review',
          severity: 'warning' as const,
          actionHref: `/coach/sessions/${session.id}/review`,
          sessionId: session.id,
        };
      });
  }

  /**
   * Count unreviewed sessions
   */
  private async countUnreviewedSessions(coachId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.prisma.trainingSession.count({
      where: {
        coachId,
        completionStatus: 'completed',
        sessionDate: { gte: sevenDaysAgo },
        nextSessionFocus: null,
      },
    });
  }

  /**
   * Get players with pending plan approvals
   * Note: Uses AnnualTrainingPlan with 'draft' status as pending approval
   */
  private async getPendingApprovals(coachId: string): Promise<PlayerAttentionItem[]> {
    // Check for annual training plans that are in draft status
    const pendingPlans = await this.prisma.annualTrainingPlan.findMany({
      where: {
        player: {
          coachId,
        },
        status: 'draft',
      },
      select: {
        playerId: true,
        player: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    return pendingPlans.map((plan) => {
      const firstName = plan.player?.user?.firstName || 'Unknown';
      const lastName = plan.player?.user?.lastName || '';
      const playerName = `${firstName} ${lastName}`.trim();

      return {
        playerId: plan.playerId,
        playerName,
        playerInitials: this.getInitials(firstName, lastName),
        reason: 'Plan awaiting approval',
        severity: 'warning' as const,
        actionHref: `/coach/athletes/${plan.playerId}/plan`,
      };
    });
  }

  /**
   * Count pending approvals
   */
  private async countPendingApprovals(coachId: string): Promise<number> {
    return this.prisma.annualTrainingPlan.count({
      where: {
        player: {
          coachId,
        },
        status: 'draft',
      },
    });
  }

  /**
   * Get today's coaching sessions
   */
  private async getTodaySessions(coachId: string): Promise<TodaySession[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        coachId,
        sessionDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        playerId: true,
        sessionDate: true,
        duration: true,
        notes: true,
        focusArea: true,
        sessionType: true,
        completionStatus: true,
        player: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { sessionDate: 'asc' },
    });

    const now = new Date();

    return sessions
      .filter((session) => session.player !== null && session.playerId !== null)
      .map((session) => {
        const firstName = session.player?.user?.firstName || 'Unknown';
        const lastName = session.player?.user?.lastName || '';
        const playerName = `${firstName} ${lastName}`.trim();
        const sessionDate = new Date(session.sessionDate);

        let status: 'upcoming' | 'in_progress' | 'completed';
        if (session.completionStatus === 'completed') {
          status = 'completed';
        } else if (sessionDate <= now) {
          status = 'in_progress';
        } else {
          status = 'upcoming';
        }

        return {
          id: session.id,
          playerId: session.playerId!,
          playerName,
          playerInitials: this.getInitials(firstName, lastName),
          time: sessionDate.toLocaleTimeString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          duration: session.duration || 60,
          focus: session.notes || session.focusArea || 'General training',
          type: this.mapSessionType(session.sessionType),
          status,
        };
      });
  }

  /**
   * Get inactive players (no sessions in X days)
   */
  private async getInactivePlayers(
    coachId: string,
    daysThreshold: number
  ): Promise<PlayerAttentionItem[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    // Get all players for this coach
    const players = await this.prisma.player.findMany({
      where: {
        coachId,
        status: 'active',
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        trainingSessions: {
          where: {
            sessionDate: { gte: thresholdDate },
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    // Filter to players with no recent sessions
    const inactivePlayers = players.filter(
      (player) => player.trainingSessions.length === 0
    );

    return inactivePlayers.map((player) => {
      const firstName = player.user?.firstName || 'Unknown';
      const lastName = player.user?.lastName || '';
      const playerName = `${firstName} ${lastName}`.trim();

      return {
        playerId: player.id,
        playerName,
        playerInitials: this.getInitials(firstName, lastName),
        reason: `No activity in ${daysThreshold}+ days`,
        severity: 'info' as const,
        actionHref: `/coach/athletes/${player.id}`,
        daysInactive: daysThreshold,
      };
    });
  }

  /**
   * Count inactive players
   */
  private async countInactivePlayers(coachId: string, daysThreshold: number): Promise<number> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const players = await this.prisma.player.findMany({
      where: {
        coachId,
        status: 'active',
      },
      select: {
        id: true,
        trainingSessions: {
          where: {
            sessionDate: { gte: thresholdDate },
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    return players.filter((p) => p.trainingSessions.length === 0).length;
  }

  /**
   * Get team load statistics
   */
  private async getTeamLoadStats(coachId: string): Promise<TeamLoadStats> {
    const startOfWeek = this.getStartOfWeek(new Date());
    const endOfWeek = this.getEndOfWeek(new Date());
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalPlayers, activePlayersCount, sessionsThisWeek, pendingReviews] =
      await Promise.all([
        this.prisma.player.count({
          where: { coachId, status: 'active' },
        }),
        this.prisma.player.count({
          where: {
            coachId,
            status: 'active',
            trainingSessions: {
              some: {
                sessionDate: { gte: fourteenDaysAgo },
              },
            },
          },
        }),
        this.prisma.trainingSession.count({
          where: {
            coachId,
            sessionDate: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        }),
        this.prisma.trainingSession.count({
          where: {
            coachId,
            completionStatus: 'completed',
            sessionDate: { gte: sevenDaysAgo },
            nextSessionFocus: null,
          },
        }),
      ]);

    return {
      totalPlayers,
      activePlayers: activePlayersCount,
      sessionsThisWeek,
      pendingReviews,
      averageSessionsPerPlayer:
        totalPlayers > 0 ? Math.round((sessionsThisWeek / totalPlayers) * 10) / 10 : 0,
    };
  }

  /**
   * Get upcoming tournaments for coach's players
   * Uses TournamentPreparation to find tournaments with coach's players
   */
  private async getUpcomingTournaments(
    coachId: string,
    daysAhead: number
  ): Promise<UpcomingTournament[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Use TournamentPreparation which has startDate and tournamentName directly
    const preps = await this.prisma.tournamentPreparation.findMany({
      where: {
        player: {
          coachId,
        },
        startDate: {
          gte: now,
          lte: futureDate,
        },
      },
      select: {
        id: true,
        tournamentName: true,
        courseName: true,
        startDate: true,
        playerId: true,
        checklistProgress: true,
      },
      orderBy: { startDate: 'asc' },
    });

    // Group by tournament name to aggregate player counts
    const tournamentMap = new Map<
      string,
      {
        id: string;
        name: string;
        date: Date;
        location: string;
        players: Set<string>;
        playersWithPlan: number;
      }
    >();

    for (const prep of preps) {
      const key = `${prep.tournamentName}-${prep.startDate.toISOString().split('T')[0]}`;
      const existing = tournamentMap.get(key);

      if (existing) {
        existing.players.add(prep.playerId);
        if (prep.checklistProgress > 50) {
          existing.playersWithPlan++;
        }
      } else {
        tournamentMap.set(key, {
          id: prep.id,
          name: prep.tournamentName,
          date: prep.startDate,
          location: prep.courseName,
          players: new Set([prep.playerId]),
          playersWithPlan: prep.checklistProgress > 50 ? 1 : 0,
        });
      }
    }

    return Array.from(tournamentMap.values()).map((t) => ({
      id: t.id,
      name: t.name,
      date: t.date,
      daysUntil: Math.ceil((t.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      playersRegistered: t.players.size,
      playersWithPlan: t.playersWithPlan,
      location: t.location,
    }));
  }

  /**
   * Build prioritized attention list
   */
  private buildAttentionList(
    unreviewed: PlayerAttentionItem[],
    pending: PlayerAttentionItem[],
    inactive: PlayerAttentionItem[]
  ): PlayerAttentionItem[] {
    // Priority: unreviewed > pending > inactive
    const seen = new Set<string>();
    const result: PlayerAttentionItem[] = [];

    for (const item of [...unreviewed, ...pending, ...inactive]) {
      if (!seen.has(item.playerId)) {
        seen.add(item.playerId);
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Compute attention items
   */
  private computeAttentionItems(
    unreviewedCount: number,
    pendingCount: number,
    tournaments: UpcomingTournament[],
    inactiveCount: number
  ): AttentionItem[] {
    const items: AttentionItem[] = [];

    if (unreviewedCount > 0) {
      items.push({
        type: 'unreviewed_session',
        message: `${unreviewedCount} session${unreviewedCount > 1 ? 's' : ''} need${unreviewedCount === 1 ? 's' : ''} review`,
        severity: 'warning',
        count: unreviewedCount,
      });
    }

    if (pendingCount > 0) {
      items.push({
        type: 'pending_approval',
        message: `${pendingCount} plan${pendingCount > 1 ? 's' : ''} awaiting approval`,
        severity: 'warning',
        count: pendingCount,
      });
    }

    const tournamentsNeedingPrep = tournaments.filter(
      (t) => t.daysUntil <= 14 && t.playersWithPlan < t.playersRegistered
    );
    if (tournamentsNeedingPrep.length > 0) {
      items.push({
        type: 'tournament_prep',
        message: `${tournamentsNeedingPrep.length} tournament${tournamentsNeedingPrep.length > 1 ? 's' : ''} need prep plans`,
        severity: 'info',
        count: tournamentsNeedingPrep.length,
      });
    }

    if (inactiveCount > 0) {
      items.push({
        type: 'inactive_player',
        message: `${inactiveCount} player${inactiveCount > 1 ? 's' : ''} inactive 14+ days`,
        severity: 'info',
        count: inactiveCount,
      });
    }

    return items;
  }

  /**
   * Compute state and primary action based on priorities
   */
  private computeStateAndAction(
    unreviewed: PlayerAttentionItem[],
    pending: PlayerAttentionItem[],
    today: TodaySession[],
    inactive: PlayerAttentionItem[],
    tournaments: UpcomingTournament[]
  ): { state: CoachDashboardState; primaryAction: PrimaryAction } {
    // Priority 1: Unreviewed sessions
    if (unreviewed.length > 0) {
      const first = unreviewed[0];
      return {
        state: 'unreviewed_sessions',
        primaryAction: {
          type: 'review_session',
          label: 'Review Session',
          href: first.actionHref,
          context: `${unreviewed.length} session${unreviewed.length > 1 ? 's' : ''} need feedback`,
        },
      };
    }

    // Priority 2: Pending approvals
    if (pending.length > 0) {
      const first = pending[0];
      return {
        state: 'pending_player_approvals',
        primaryAction: {
          type: 'approve_plan',
          label: 'Review Plan',
          href: first.actionHref,
          context: `${first.playerName}'s plan needs approval`,
        },
      };
    }

    // Priority 3: Tournament prep needed
    const tournamentsNeedingPrep = tournaments.filter(
      (t) => t.daysUntil <= 14 && t.playersWithPlan < t.playersRegistered
    );
    if (tournamentsNeedingPrep.length > 0) {
      const first = tournamentsNeedingPrep[0];
      return {
        state: 'tournament_prep',
        primaryAction: {
          type: 'create_prep_plan',
          label: 'Create Prep Plan',
          href: `/coach/tournaments/${first.id}/prep`,
          context: `${first.name} in ${first.daysUntil} days`,
        },
      };
    }

    // Priority 4: Today's sessions
    const upcomingSessions = today.filter((s) => s.status !== 'completed');
    if (upcomingSessions.length > 0) {
      const next = upcomingSessions[0];
      return {
        state: 'today_sessions',
        primaryAction: {
          type: 'start_session',
          label: 'View Session',
          href: `/coach/sessions/${next.id}`,
          context: `${next.playerName} at ${next.time}`,
        },
      };
    }

    // Priority 5: Inactive players
    if (inactive.length > 0) {
      const first = inactive[0];
      return {
        state: 'players_inactive',
        primaryAction: {
          type: 'reach_out',
          label: 'Reach Out',
          href: first.actionHref,
          context: `${inactive.length} player${inactive.length > 1 ? 's' : ''} need attention`,
        },
      };
    }

    // Priority 6: All clear
    return {
      state: 'all_clear',
      primaryAction: {
        type: 'view_calendar',
        label: 'View Calendar',
        href: '/coach/calendar',
        context: 'No immediate actions needed',
      },
    };
  }

  /**
   * Map session type to frontend enum
   */
  private mapSessionType(sessionType: string | null): 'coaching' | 'evaluation' | 'group' {
    if (sessionType === 'evaluation' || sessionType === 'testing') return 'evaluation';
    if (sessionType === 'group') return 'group';
    return 'coaching';
  }

  /**
   * Get initials from name
   */
  private getInitials(firstName: string, lastName: string): string {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
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
