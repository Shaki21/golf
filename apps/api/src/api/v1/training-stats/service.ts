import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';

export interface TrainingStatsFilters {
  playerId?: string;
  year?: number;
  weekNumber?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
}

export class TrainingStatsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get weekly training stats for a player
   */
  async getWeeklyStats(tenantId: string, playerId: string, filters: TrainingStatsFilters = {}) {
    // Verify player belongs to tenant
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    const where: any = { playerId };

    if (filters.year) where.year = filters.year;
    if (filters.weekNumber) where.weekNumber = filters.weekNumber;
    if (filters.startDate) {
      where.weekStartDate = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.weekEndDate = { lte: new Date(filters.endDate) };
    }

    const stats = await this.prisma.weeklyTrainingStats.findMany({
      where,
      orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
      take: filters.year && filters.weekNumber ? 1 : 52,
    });

    return stats;
  }

  /**
   * Get monthly training stats for a player
   */
  async getMonthlyStats(tenantId: string, playerId: string, filters: TrainingStatsFilters = {}) {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    const where: any = { playerId };

    if (filters.year) where.year = filters.year;
    if (filters.month) where.month = filters.month;

    const stats = await this.prisma.monthlyTrainingStats.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 12,
    });

    return stats;
  }

  /**
   * Get daily training stats for a player
   */
  async getDailyStats(tenantId: string, playerId: string, filters: TrainingStatsFilters = {}) {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    const where: any = { playerId };

    if (filters.startDate) {
      where.date = { gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.date = { ...where.date, lte: new Date(filters.endDate) };
    }

    const stats = await this.prisma.dailyTrainingStats.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    return stats;
  }

  /**
   * Calculate and update weekly stats for a player
   */
  async calculateWeeklyStats(tenantId: string, playerId: string, year: number, weekNumber: number) {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Calculate week start and end dates
    const weekStart = this.getWeekStart(year, weekNumber);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Get training sessions for the week
    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    // Get planned sessions from daily assignments
    const assignments = await this.prisma.dailyTrainingAssignment.findMany({
      where: {
        playerId,
        assignedDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const completedSessions = sessions.filter(s => s.completionStatus === 'completed').length;
    const skippedSessions = assignments.filter(a => a.status === 'skipped').length;
    const plannedSessions = assignments.length;
    const completionRate = plannedSessions > 0 ? (completedSessions / plannedSessions) * 100 : 0;

    const actualMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const plannedMinutes = assignments.reduce((sum, a) => sum + (a.estimatedDuration || 0), 0);

    // Calculate session type breakdown
    const sessionTypeBreakdown: Record<string, number> = {};
    for (const session of sessions) {
      const type = session.sessionType || 'other';
      sessionTypeBreakdown[type] = (sessionTypeBreakdown[type] || 0) + (session.duration || 0);
    }

    // Calculate learning phase distribution
    const learningPhaseMinutes: Record<string, number> = {};
    for (const session of sessions) {
      const phase = session.learningPhase || 'unspecified';
      learningPhaseMinutes[phase] = (learningPhaseMinutes[phase] || 0) + (session.duration || 0);
    }

    // Calculate averages
    const avgQuality = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.evaluationTechnical || 0), 0) / sessions.length
      : null;
    const avgFocus = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.evaluationFocus || 0), 0) / sessions.length
      : null;

    // Upsert stats
    const stats = await this.prisma.weeklyTrainingStats.upsert({
      where: {
        playerId_year_weekNumber: { playerId, year, weekNumber },
      },
      update: {
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        plannedSessions,
        completedSessions,
        skippedSessions,
        completionRate,
        plannedMinutes,
        actualMinutes,
        sessionTypeBreakdown,
        learningPhaseMinutes,
        avgQuality,
        avgFocus,
        period: player.currentPeriod,
        calculatedAt: new Date(),
      },
      create: {
        playerId,
        year,
        weekNumber,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        plannedSessions,
        completedSessions,
        skippedSessions,
        completionRate,
        plannedMinutes,
        actualMinutes,
        sessionTypeBreakdown,
        learningPhaseMinutes,
        avgQuality,
        avgFocus,
        period: player.currentPeriod,
      },
    });

    return stats;
  }

  /**
   * Get aggregate stats for a coach's team
   */
  async getTeamStats(tenantId: string, coachId: string, year: number, weekNumber?: number) {
    // Get all players for this coach
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      select: { id: true },
    });

    const playerIds = players.map(p => p.id);

    const where: any = {
      playerId: { in: playerIds },
      year,
    };

    if (weekNumber) where.weekNumber = weekNumber;

    const weeklyStats = await this.prisma.weeklyTrainingStats.findMany({
      where,
      include: {
        player: {
          select: { id: true, firstName: true, lastName: true, category: true },
        },
      },
    });

    // Calculate team aggregates
    const totalSessions = weeklyStats.reduce((sum, s) => sum + s.completedSessions, 0);
    const totalMinutes = weeklyStats.reduce((sum, s) => sum + s.actualMinutes, 0);
    const avgCompletionRate = weeklyStats.length > 0
      ? weeklyStats.reduce((sum, s) => sum + Number(s.completionRate), 0) / weeklyStats.length
      : 0;

    return {
      teamSummary: {
        playerCount: playerIds.length,
        totalSessions,
        totalMinutes,
        avgCompletionRate,
      },
      playerStats: weeklyStats,
    };
  }

  /**
   * Helper to get the Monday of a given ISO week
   */
  private getWeekStart(year: number, weekNumber: number): Date {
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - dayOfWeek + 1);
    monday.setDate(monday.getDate() + (weekNumber - 1) * 7);
    return monday;
  }
}
