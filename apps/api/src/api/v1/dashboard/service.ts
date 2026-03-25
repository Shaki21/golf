/**
 * ================================================================
 * Dashboard Service - AK Golf Academy
 * ================================================================
 */

import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';
import { logger } from '../../../utils/logger';
import {
  DashboardResponse,
  PeriodInfo,
  Session,
  Badge,
  Goal,
  WeeklyStats,
  Message
} from './schema';

/**
 * Dashboard service providing aggregated data for the player dashboard
 *
 * @remarks
 * This service orchestrates multiple database queries to fetch all dashboard data
 * in an optimized manner using Promise.all for parallel execution.
 * Performance is monitored and queries exceeding 200ms trigger warnings.
 */
export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get complete dashboard data for a player
   *
   * @param tenantId - The tenant/organization ID
   * @param playerId - The player's unique identifier
   * @param date - Reference date for dashboard data (defaults to current date)
   * @returns Complete dashboard data including player profile, sessions, goals, stats, etc.
   * @throws {NotFoundError} When player is not found in the specified tenant
   *
   * @remarks
   * Fetches all dashboard components in parallel for optimal performance:
   * - Player profile information
   * - Current training period details
   * - Today's scheduled sessions
   * - Recent badges/achievements (last 7 days)
   * - Active goals
   * - Weekly training statistics
   * - Recent messages from coaches
   * - Next tournament and test
   * - Breaking points requiring attention
   * - Recent test results (last 3)
   *
   * @example
   * ```typescript
   * const dashboard = await dashboardService.getDashboard(
   *   'tenant-uuid',
   *   'player-uuid',
   *   new Date()
   * );
   * console.log(dashboard.weeklyStats.stats);
   * ```
   */
  async getDashboard(
    tenantId: string,
    playerId: string,
    date: Date = new Date()
  ): Promise<DashboardResponse> {
    const startTime = Date.now();

    try {
      // Get player
      const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        category: true,
        averageScore: true,
        profileImageUrl: true,
        currentPeriod: true,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Get all data in parallel
    const [
      periodInfo,
      todaySessions,
      badges,
      goals,
      weeklyStats,
      messages,
      nextTournament,
      nextTest,
      breakingPoints,
      recentTests,
    ] = await Promise.all([
      this.getCurrentPeriod(playerId, date),
      this.getTodaySessions(playerId, date),
      this.getRecentBadges(playerId),
      this.getActiveGoals(playerId),
      this.getWeeklyStats(playerId, date),
      this.getRecentMessages(tenantId, playerId),
      this.getNextTournament(playerId, tenantId, date),
      this.getNextTest(playerId, date),
      this.getBreakingPoints(playerId),
      this.getRecentTests(playerId),
    ]);

    const unreadCount = messages.filter(m => m.unread).length;

    const result = {
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        category: player.category,
        averageScore: player.averageScore ? Number(player.averageScore) : null,
        profileImageUrl: player.profileImageUrl,
      },
      period: periodInfo,
      todaySessions,
      badges,
      goals,
      weeklyStats,
      messages,
      unreadCount,
      nextTournament,
      nextTest,
      breakingPoints,
      recentTests,
    };

    const duration = Date.now() - startTime;
    if (duration > 200) {
      logger.warn({ playerId, duration }, 'Dashboard slow query detected');
    }

    return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ playerId, duration, error }, 'Dashboard query failed');
      throw error;
    }
  }

  /**
   * Get current training period information
   *
   * @param playerId - The player's unique identifier
   * @param date - Reference date to determine the current period
   * @returns Training period information including type, week number, and focus areas
   *
   * @remarks
   * Determines the current periodization phase (E/G/S/T) based on the annual plan:
   * - E: Evalueringsperiode (Evaluation period)
   * - G: Grunnperiode (Base period) - DEFAULT
   * - S: Spesialperiode (Specific period)
   * - T: Turneringsperiode (Competition period)
   *
   * Focus areas are extracted from the annual plan's intensity profile,
   * or default areas are used based on the period type.
   */
  private async getCurrentPeriod(playerId: string, date: Date): Promise<PeriodInfo> {
    const weekNumber = this.getWeekNumber(date);

    const periodization = await this.prisma.periodization.findFirst({
      where: {
        playerId,
        weekNumber,
      },
      orderBy: { createdAt: 'desc' },
    });

    const period = periodization?.period || 'G';
    const periodNumber = periodization?.weekInPeriod || 1;

    const periodNames: Record<string, string> = {
      E: 'Evalueringsperiode',
      G: 'Grunnperiode',
      S: 'Spesialperiode',
      T: 'Turneringsperiode',
    };

    // Get focus areas from annual plan if available
    let focusAreas: string[] = [];
    if (periodization?.annualPlanId) {
      const plan = await this.prisma.annualTrainingPlan.findUnique({
        where: { id: periodization.annualPlanId },
        select: { intensityProfile: true },
      });
      if (plan?.intensityProfile && typeof plan.intensityProfile === 'object') {
        const profile = plan.intensityProfile as Record<string, unknown>;
        focusAreas = (profile.focusAreas as string[]) || [];
      }
    }

    if (focusAreas.length === 0) {
      // Default focus areas based on period
      const defaultFocus: Record<string, string[]> = {
        E: ['Evaluering', 'Testing'],
        G: ['Teknikk', 'Langspill', 'Fysikk'],
        S: ['Shortgame', 'Putting', 'Mental'],
        T: ['Spill', 'Strategi', 'Recovery'],
      };
      focusAreas = defaultFocus[period] || [];
    }

    return {
      type: period as 'E' | 'G' | 'S' | 'T',
      number: periodNumber,
      name: periodNames[period] || 'Grunnperiode',
      focusAreas,
      startDate: this.getWeekStart(date).toISOString(),
      endDate: null,
    };
  }

  /**
   * Get today's training sessions from daily assignments
   *
   * @param playerId - The player's unique identifier
   * @param date - Reference date (defaults to current date)
   * @returns Array of scheduled sessions for the day with status (completed/current/upcoming)
   *
   * @remarks
   * Fetches DailyTrainingAssignments for the specified date and enriches them with:
   * - Status determination (completed/current/upcoming)
   * - Tags from learning phase and club speed
   * - Estimated times (defaults to 2-hour intervals starting at 08:00)
   * - Session template names and durations
   */
  private async getTodaySessions(playerId: string, date: Date): Promise<Session[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get daily assignments for today
    const assignments = await this.prisma.dailyTrainingAssignment.findMany({
      where: {
        playerId,
        assignedDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        sessionTemplate: {
          select: { name: true, sessionType: true, duration: true },
        },
        completedSession: {
          select: { id: true, duration: true },
        },
      },
      orderBy: { assignedDate: 'asc' },
    });

    return assignments.map((assignment, index) => {
      // Determine status
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
      if (assignment.status === 'completed' || assignment.completedSession) {
        status = 'completed';
      } else if (index === assignments.findIndex(a => a.status !== 'completed')) {
        status = 'current';
      }

      // Build tags
      const tags: string[] = [];
      if (assignment.learningPhase) tags.push(assignment.learningPhase);
      if (assignment.clubSpeed) tags.push(assignment.clubSpeed);

      // Format time (use a default if no specific time)
      const baseHour = 8 + (index * 2);
      const time = `${String(baseHour).padStart(2, '0')}:00`;

      return {
        id: assignment.id,
        time,
        title: assignment.sessionTemplate?.name || assignment.sessionType,
        meta: `${assignment.estimatedDuration} min - ${assignment.sessionType}`,
        tags,
        status,
        duration: assignment.estimatedDuration,
        sessionType: assignment.sessionType,
      };
    });
  }

  /**
   * Get recent badges and achievements earned in the last 7 days
   *
   * @param playerId - The player's unique identifier
   * @returns Array of badges with code, name, icon, tier, and earned timestamp (max 10)
   *
   * @remarks
   * Filters PlayerAchievement records to show only badges earned in the past week.
   * Results are ordered by earnedAt descending (newest first) and limited to 10 items.
   * Badge tier can be: bronze, silver, gold, or platinum.
   */
  private async getRecentBadges(playerId: string): Promise<Badge[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const achievements = await this.prisma.playerAchievement.findMany({
      where: {
        playerId,
        earnedAt: { gte: oneWeekAgo },
      },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 10,
    });

    return achievements.map(a => ({
      id: a.id,
      code: a.achievement.code,
      name: a.achievement.name,
      icon: a.achievement.icon,
      tier: a.achievement.tier as 'gold' | 'silver' | 'bronze' | 'platinum',
      earnedAt: a.earnedAt.toISOString(),
    }));
  }

  /**
   * Get active player goals ordered by target date
   *
   * @param playerId - The player's unique identifier
   * @returns Array of active goals with progress indicators (max 4)
   *
   * @remarks
   * Only fetches goals with status='active' and orders them by targetDate ascending
   * (nearest deadlines first). Each goal includes:
   * - Progress percentage (0-100)
   * - Formatted deadline string
   * - Visual variant (success/warning/danger) based on progress and deadline proximity
   * Results are limited to 4 goals to fit the dashboard widget.
   */
  private async getActiveGoals(playerId: string): Promise<Goal[]> {
    const goals = await this.prisma.playerGoal.findMany({
      where: {
        playerId,
        status: 'active',
      },
      orderBy: { targetDate: 'asc' },
      take: 4,
    });

    return goals.map(goal => ({
      id: goal.id,
      icon: goal.icon || '🎯',
      title: goal.title,
      deadline: this.formatDeadline(goal.targetDate),
      progress: goal.progressPercent,
      variant: this.getGoalVariant(goal.progressPercent, goal.targetDate),
    }));
  }

  /**
   * Get weekly training statistics with change indicators
   *
   * @param playerId - The player's unique identifier
   * @param date - Reference date to determine the week
   * @returns Weekly stats object with sessions, hours, and completion rate
   *
   * @remarks
   * First attempts to fetch from WeeklyTrainingStats table (pre-aggregated data).
   * If no aggregated data exists, falls back to calculating from raw TrainingSession records.
   *
   * Returns three key metrics:
   * - Sessions completed (with week-over-week change)
   * - Training hours (with change in hours)
   * - Completion rate % (with percentage point change)
   *
   * @example
   * ```typescript
   * const stats = await getWeeklyStats('player-id', new Date());
   * // { period: 'Uke 52', stats: [{ id: 'sessions', value: 5, change: +2 }, ...] }
   * ```
   */
  private async getWeeklyStats(playerId: string, date: Date): Promise<WeeklyStats> {
    const weekNumber = this.getWeekNumber(date);
    const year = date.getFullYear();

    const stats = await this.prisma.weeklyTrainingStats.findFirst({
      where: {
        playerId,
        year,
        weekNumber,
      },
    });

    if (stats) {
      return {
        period: `Uke ${weekNumber}`,
        weekNumber,
        year,
        stats: [
          {
            id: 'sessions',
            value: stats.completedSessions,
            label: 'Okter',
            change: stats.sessionsChange,
          },
          {
            id: 'hours',
            value: `${(stats.actualMinutes / 60).toFixed(1)}t`,
            label: 'Timer',
            change: Math.round(stats.minutesChange / 60 * 10) / 10,
            changeUnit: 't',
          },
          {
            id: 'completion',
            value: `${Math.round(Number(stats.completionRate))}%`,
            label: 'Fullfort',
            change: Math.round(Number(stats.completionRateChange)),
            changeUnit: '%',
          },
        ],
      };
    }

    // Calculate from raw data if no aggregated stats
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const completedCount = sessions.length;

    return {
      period: `Uke ${weekNumber}`,
      weekNumber,
      year,
      stats: [
        { id: 'sessions', value: completedCount, label: 'Okter' },
        { id: 'hours', value: `${(totalMinutes / 60).toFixed(1)}t`, label: 'Timer' },
        { id: 'completion', value: '-', label: 'Fullfort' },
      ],
    };
  }

  /**
   * Get recent messages for player
   */
  private async getRecentMessages(_tenantId: string, playerId: string): Promise<Message[]> {
    // Find chat groups the player is a member of
    const memberships = await this.prisma.chatGroupMember.findMany({
      where: {
        memberType: 'player',
        memberId: playerId,
        leftAt: null,
      },
      include: {
        group: {
          include: {
            messages: {
              where: { isDeleted: false },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { group: { lastMessageAt: 'desc' } },
      take: 5,
    });

    return memberships
      .filter(m => m.group.messages.length > 0)
      .map(m => {
        const lastMessage = m.group.messages[0];
        const isUnread = m.unreadCount > 0;

        return {
          id: lastMessage.id,
          groupId: m.group.id,
          senderName: m.group.name,
          avatarInitials: m.group.avatarInitials || m.group.name.slice(0, 2).toUpperCase(),
          avatarUrl: m.group.avatarUrl || undefined,
          avatarColor: m.group.avatarColor || undefined,
          isGroup: m.group.groupType !== 'direct',
          preview: lastMessage.content.slice(0, 100),
          time: this.formatMessageTime(lastMessage.createdAt),
          unread: isUnread,
        };
      });
  }

  /**
   * Get next scheduled tournament for player
   */
  private async getNextTournament(playerId: string, _tenantId: string, date: Date) {
    // Get player's annual plan to find scheduled tournaments
    const annualPlan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        endDate: { gte: date },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!annualPlan) return null;

    // Find next scheduled tournament in the plan
    const tournament = await this.prisma.scheduledTournament.findFirst({
      where: {
        annualPlanId: annualPlan.id,
        startDate: { gte: date },
        participated: false,
      },
      orderBy: { startDate: 'asc' },
    });

    if (!tournament) return null;

    return {
      id: tournament.id,
      title: tournament.name,
      date: tournament.startDate.toISOString(),
      location: 'Golf Club', // ScheduledTournament doesn't have location field
      type: 'tournament',
    };
  }

  /**
   * Get next scheduled test for player
   */
  private async getNextTest(playerId: string, date: Date) {
    // Look for upcoming test sessions in daily assignments
    const testAssignment = await this.prisma.dailyTrainingAssignment.findFirst({
      where: {
        playerId,
        sessionType: 'test',
        assignedDate: { gte: date },
        status: { in: ['pending', 'in_progress'] },
      },
      include: {
        sessionTemplate: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { assignedDate: 'asc' },
    });

    if (!testAssignment) return null;

    return {
      id: testAssignment.id,
      title: testAssignment.sessionTemplate?.name || 'Kategoritest',
      date: testAssignment.assignedDate.toISOString(),
      location: 'AK Golf Academy',
    };
  }

  /**
   * Get breaking points summary (top 3 by severity)
   */
  private async getBreakingPoints(playerId: string) {
    const points = await this.prisma.breakingPoint.findMany({
      where: {
        playerId,
        status: { in: ['identified', 'working', 'in_progress'] },
      },
      select: {
        id: true,
        processCategory: true,
        specificArea: true,
        status: true,
        severity: true,
        progressPercent: true,
      },
      orderBy: [
        { severity: 'desc' }, // high severity first
        { identifiedDate: 'desc' },
      ],
      take: 3,
    });

    // Map severity to priority for frontend compatibility
    const severityToPriority = (severity: string): 'high' | 'medium' | 'low' => {
      const s = severity.toLowerCase();
      if (s === 'high' || s === 'critical') return 'high';
      if (s === 'medium' || s === 'moderate') return 'medium';
      return 'low';
    };

    return points.map(bp => ({
      id: bp.id,
      area: bp.processCategory,
      title: bp.specificArea,
      status: bp.status as 'identified' | 'working' | 'resolved',
      priority: severityToPriority(bp.severity),
      progress: bp.progressPercent || 0,
    }));
  }

  /**
   * Get recent test results (last 3 tests)
   */
  private async getRecentTests(playerId: string) {
    const results = await this.prisma.testResult.findMany({
      where: { playerId },
      select: {
        id: true,
        testDate: true,
        pei: true,
        value: true,
        test: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { testDate: 'desc' },
      take: 3,
    });

    return results.map((result, idx) => {
      const score = Number(result.pei || result.value || 0);
      // Calculate improvement vs previous result if available
      const prevResult = results[idx + 1];
      const prevScore = prevResult ? Number(prevResult.pei || prevResult.value || 0) : null;
      const improvement = prevScore !== null ? score - prevScore : 0;

      return {
        id: result.id,
        testId: result.test.id,
        name: result.test.name,
        date: result.testDate.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }),
        score,
        improvement,
      };
    });
  }

  // ============================================================================
  // Helper methods
  // ============================================================================

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatDeadline(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private formatMessageTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'I gar';
    } else {
      return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
    }
  }

  private getGoalVariant(progress: number, targetDate: Date): 'primary' | 'success' | 'warning' | 'error' {
    const now = new Date();
    const daysUntilDeadline = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (progress >= 100) return 'success';
    if (daysUntilDeadline < 30 && progress < 50) return 'error';
    if (daysUntilDeadline < 60 && progress < 30) return 'warning';
    return 'primary';
  }
}
