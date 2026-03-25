/**
 * Coach Service
 * Business logic for coach-specific statistics, dashboard, groups, and tournaments
 */

import { PrismaClient, Prisma } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface CoachStatsOverview {
  totalPlayers: number;
  activePlayers: number;
  averageHandicap: number | null;
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  players: PlayerStatsSummary[];
  recentActivity: {
    testsLastWeek: number;
    sessionsLastWeek: number;
    improvingPlayers: number;
    needsAttentionPlayers: number;
  };
}

export interface PlayerStatsSummary {
  id: string;
  name: string;
  category: string;
  handicap: number | null;
  lastActivity: Date | null;
  testsTaken: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  handicapChange: number | null;
  sessionsThisMonth: number;
  alerts: string[];
}

export interface PlayerProgress {
  playerId: string;
  playerName: string;
  category: string;
  periods: {
    period: string;
    startDate: Date;
    endDate: Date;
    handicap: number | null;
    testsCompleted: number;
    sessionsAttended: number;
    categoryAtStart: string;
    categoryAtEnd: string;
  }[];
  overallTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface PlayerRegression {
  playerId: string;
  playerName: string;
  category: string;
  regressionType: 'handicap' | 'test_scores' | 'attendance' | 'multiple';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  detectedAt: Date;
  metrics: {
    metric: string;
    previousValue: number;
    currentValue: number;
    changePercent: number;
  }[];
  suggestedActions: string[];
}

export interface CoachAlert {
  id: string;
  playerId: string;
  playerName: string;
  type: 'injury' | 'performance_drop' | 'missed_sessions' | 'goal_deadline' | 'category_risk';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  actionUrl?: string;
}

export interface PlayerInjury {
  id: string;
  playerId: string;
  playerName: string;
  injuryType: string;
  bodyPart: string;
  severity: 'minor' | 'moderate' | 'severe';
  startDate: Date;
  expectedRecovery: Date | null;
  status: 'active' | 'recovering' | 'recovered';
  notes: string | null;
  restrictions: string[];
}

export interface CoachTournament {
  id: string;
  name: string;
  date: Date;
  location: string;
  type: 'local' | 'regional' | 'national' | 'international';
  playersRegistered: {
    playerId: string;
    playerName: string;
    category: string;
  }[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface CoachGroup {
  id: string;
  name: string;
  description: string | null;
  color: string;
  playerCount: number;
  players: {
    id: string;
    name: string;
    category: string;
  }[];
  createdAt: Date;
}

export interface BookingSettings {
  coachId: string;
  defaultSessionDuration: number;
  bufferBetweenSessions: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  allowCancellation: boolean;
  cancellationDeadlineHours: number;
  workingHours: {
    [day: string]: { start: string; end: string } | null;
  };
}

// ============================================================================
// SERVICE
// ============================================================================

export class CoachService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get coach stats overview
   */
  async getStatsOverview(tenantId: string, coachId: string): Promise<CoachStatsOverview> {
    // Get all players for this coach
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      include: {
        testResults: {
          orderBy: { testDate: 'desc' },
          take: 10,
          include: { test: true },
        },
      },
    });

    // Get session count for each player this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sessionCounts = await this.prisma.trainingSession.groupBy({
      by: ['playerId'],
      where: {
        playerId: { in: players.map(p => p.id) },
        sessionDate: { gte: startOfMonth },
      },
      _count: { id: true },
    });

    const sessionCountMap = new Map(
      sessionCounts
        .filter(s => s.playerId !== null)
        .map(s => [s.playerId!, s._count.id])
    );

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    players.forEach(p => {
      const cat = p.category || 'Unknown';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / players.length) * 100),
    }));

    // Calculate player summaries
    const playerSummaries: PlayerStatsSummary[] = players.map(player => {
      const handicap = player.handicap ? Number(player.handicap) : null;
      const testResults = player.testResults || [];
      const lastTest = testResults[0];

      // Determine trend based on recent test performance
      let trend: 'improving' | 'stable' | 'declining' | 'unknown' = 'unknown';
      if (testResults.length >= 2) {
        const recentAvg = testResults.slice(0, 3).reduce((sum, t) => sum + (Number(t.value) || 0), 0) / Math.min(3, testResults.length);
        const olderAvg = testResults.slice(3, 6).reduce((sum, t) => sum + (Number(t.value) || 0), 0) / Math.min(3, testResults.length - 3);
        if (olderAvg > 0) {
          const change = (recentAvg - olderAvg) / olderAvg;
          if (change > 0.05) trend = 'improving';
          else if (change < -0.05) trend = 'declining';
          else trend = 'stable';
        }
      }

      // Generate alerts
      const alerts: string[] = [];
      const daysSinceLastTest = lastTest
        ? Math.floor((Date.now() - lastTest.testDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      if (daysSinceLastTest && daysSinceLastTest > 30) {
        alerts.push('Ingen tester siste 30 dager');
      }
      if (trend === 'declining') {
        alerts.push('Nedadgående trend i testresultater');
      }

      return {
        id: player.id,
        name: `${player.firstName} ${player.lastName}`,
        category: player.category || 'Unknown',
        handicap,
        lastActivity: lastTest?.testDate || null,
        testsTaken: testResults.length,
        trend,
        handicapChange: null, // Would need historical handicap data
        sessionsThisMonth: sessionCountMap.get(player.id) || 0,
        alerts,
      };
    });

    // Calculate recent activity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const testsLastWeek = await this.prisma.testResult.count({
      where: {
        player: { tenantId, coachId },
        testDate: { gte: oneWeekAgo },
      },
    });

    const sessionsLastWeek = await this.prisma.trainingSession.count({
      where: {
        playerId: { in: players.map(p => p.id) },
        sessionDate: { gte: oneWeekAgo },
      },
    });

    const improvingPlayers = playerSummaries.filter(p => p.trend === 'improving').length;
    const needsAttentionPlayers = playerSummaries.filter(p => p.alerts.length > 0 || p.trend === 'declining').length;

    // Calculate average handicap
    const handicaps = players.map(p => p.handicap ? Number(p.handicap) : null).filter((h): h is number => h !== null);
    const averageHandicap = handicaps.length > 0
      ? Math.round((handicaps.reduce((a, b) => a + b, 0) / handicaps.length) * 10) / 10
      : null;

    return {
      totalPlayers: players.length,
      activePlayers: playerSummaries.filter(p => p.lastActivity && p.lastActivity > oneWeekAgo).length,
      averageHandicap,
      categoryDistribution,
      players: playerSummaries,
      recentActivity: {
        testsLastWeek,
        sessionsLastWeek,
        improvingPlayers,
        needsAttentionPlayers,
      },
    };
  }

  /**
   * Get player progress over time periods
   */
  async getProgress(tenantId: string, coachId: string, months: number = 6): Promise<PlayerProgress[]> {
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      include: {
        testResults: {
          orderBy: { testDate: 'asc' },
          include: { test: true },
        },
      },
    });

    const progressList: PlayerProgress[] = [];

    for (const player of players) {
      const periods: PlayerProgress['periods'] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const testsInPeriod = player.testResults.filter(
          t => t.testDate >= startDate && t.testDate <= endDate
        );

        const sessionsInPeriod = await this.prisma.trainingSession.count({
          where: {
            playerId: player.id,
            sessionDate: { gte: startDate, lte: endDate },
          },
        });

        periods.push({
          period: startDate.toLocaleDateString('nb-NO', { month: 'short', year: 'numeric' }),
          startDate,
          endDate,
          handicap: player.handicap ? Number(player.handicap) : null,
          testsCompleted: testsInPeriod.length,
          sessionsAttended: sessionsInPeriod,
          categoryAtStart: player.category || 'Unknown',
          categoryAtEnd: player.category || 'Unknown',
        });
      }

      // Determine overall trend
      let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
      const recentTests = player.testResults.slice(-10);
      const olderTests = player.testResults.slice(-20, -10);

      if (recentTests.length >= 3 && olderTests.length >= 3) {
        const recentAvg = recentTests.reduce((sum, t) => sum + (Number(t.value) || 0), 0) / recentTests.length;
        const olderAvg = olderTests.reduce((sum, t) => sum + (Number(t.value) || 0), 0) / olderTests.length;

        if (recentAvg > olderAvg * 1.05) overallTrend = 'improving';
        else if (recentAvg < olderAvg * 0.95) overallTrend = 'declining';
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (overallTrend === 'declining') {
        recommendations.push('Vurder en samtale for å identifisere utfordringer');
      }
      const testsLastMonth = periods[periods.length - 1]?.testsCompleted || 0;
      if (testsLastMonth === 0) {
        recommendations.push('Ingen tester gjennomført siste måned - planlegg testdag');
      }
      const sessionsLastMonth = periods[periods.length - 1]?.sessionsAttended || 0;
      if (sessionsLastMonth < 2) {
        recommendations.push('Lav treningsaktivitet - vurder motivasjonssamtale');
      }

      progressList.push({
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        category: player.category || 'Unknown',
        periods,
        overallTrend,
        recommendations,
      });
    }

    return progressList;
  }

  /**
   * Get players with regression indicators
   */
  async getRegressions(tenantId: string, coachId: string): Promise<PlayerRegression[]> {
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      include: {
        testResults: {
          orderBy: { testDate: 'desc' },
          take: 20,
          include: { test: true },
        },
      },
    });

    const regressions: PlayerRegression[] = [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    for (const player of players) {
      const testResults = player.testResults || [];
      if (testResults.length < 5) continue;

      const recentTests = testResults.slice(0, 5);
      const olderTests = testResults.slice(5, 10);

      if (olderTests.length < 3) continue;

      const recentAvg = recentTests.reduce((sum, t) => sum + (Number(t.value) || 0), 0) / recentTests.length;
      const olderAvg = olderTests.reduce((sum, t) => sum + (Number(t.value) || 0), 0) / olderTests.length;

      // Check for significant decline (>10%)
      if (olderAvg > 0 && recentAvg < olderAvg * 0.9) {
        const changePercent = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);

        let severity: 'mild' | 'moderate' | 'severe' = 'mild';
        if (changePercent < -20) severity = 'severe';
        else if (changePercent < -10) severity = 'moderate';

        regressions.push({
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          category: player.category || 'Unknown',
          regressionType: 'test_scores',
          severity,
          description: `Testresultater har gått ned ${Math.abs(changePercent)}% de siste ukene`,
          detectedAt: new Date(),
          metrics: [{
            metric: 'Gjennomsnittlig testscore',
            previousValue: Math.round(olderAvg * 10) / 10,
            currentValue: Math.round(recentAvg * 10) / 10,
            changePercent,
          }],
          suggestedActions: [
            'Gjennomfør en statussamtale med spilleren',
            'Vurder justering av treningsplan',
            severity === 'severe' ? 'Vurder om det er eksterne faktorer som påvirker' : 'Overvåk utviklingen tett',
          ],
        });
      }
    }

    // Sort by severity
    const severityOrder = { severe: 0, moderate: 1, mild: 2 };
    regressions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return regressions;
  }

  /**
   * Get coach dashboard alerts
   */
  async getAlerts(tenantId: string, coachId: string): Promise<CoachAlert[]> {
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      include: {
        testResults: {
          orderBy: { testDate: 'desc' },
          take: 5,
        },
      },
    });

    const alerts: CoachAlert[] = [];
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const player of players) {
      const lastTest = player.testResults[0];

      // Alert: No recent tests
      if (!lastTest || lastTest.testDate < oneMonthAgo) {
        alerts.push({
          id: `no-tests-${player.id}`,
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          type: 'missed_sessions',
          severity: 'medium',
          title: 'Ingen nylige tester',
          description: `${player.firstName} har ikke gjennomført tester på over 30 dager`,
          createdAt: now,
          isRead: false,
          actionUrl: `/coach/players/${player.id}/tests`,
        });
      }

      // Alert: Performance drop
      if (player.testResults.length >= 5) {
        const recent = player.testResults.slice(0, 3);
        const older = player.testResults.slice(2, 5);
        const recentAvg = recent.reduce((s, t) => s + (Number(t.value) || 0), 0) / recent.length;
        const olderAvg = older.reduce((s, t) => s + (Number(t.value) || 0), 0) / older.length;

        if (olderAvg > 0 && recentAvg < olderAvg * 0.85) {
          alerts.push({
            id: `perf-drop-${player.id}`,
            playerId: player.id,
            playerName: `${player.firstName} ${player.lastName}`,
            type: 'performance_drop',
            severity: 'high',
            title: 'Betydelig nedgang i resultater',
            description: `${player.firstName} sine testresultater har gått ned over 15%`,
            createdAt: now,
            isRead: false,
            actionUrl: `/coach/players/${player.id}/progress`,
          });
        }
      }
    }

    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts;
  }

  /**
   * Get player injuries
   */
  async getInjuries(tenantId: string, coachId: string): Promise<PlayerInjury[]> {
    // Note: This would require an Injury model in the database
    // For now, return empty array - injuries should be tracked via notes or a dedicated table
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      select: { id: true, firstName: true, lastName: true },
    });

    // Check player notes for injury-related content
    const injuries: PlayerInjury[] = [];

    for (const player of players) {
      // Notes linked to player via linkedEntityType/linkedEntityId
      const injuryNotes = await this.prisma.note.findMany({
        where: {
          linkedEntityType: 'player',
          linkedEntityId: player.id,
          OR: [
            { title: { contains: 'skade', mode: 'insensitive' } },
            { title: { contains: 'injury', mode: 'insensitive' } },
            { content: { contains: 'skade', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      for (const note of injuryNotes) {
        injuries.push({
          id: note.id,
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          injuryType: 'Ukjent',
          bodyPart: 'Ukjent',
          severity: 'moderate',
          startDate: note.createdAt,
          expectedRecovery: null,
          status: 'active',
          notes: note.content,
          restrictions: [],
        });
      }
    }

    return injuries;
  }

  /**
   * Get upcoming tournaments for coach's players
   */
  async getTournaments(tenantId: string, coachId: string): Promise<CoachTournament[]> {
    // Note: This would require a Tournament model in the database
    // For now, return mock upcoming tournaments based on calendar events
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      select: { id: true, firstName: true, lastName: true, category: true },
    });

    // Return empty for now - tournaments should be implemented via calendar or dedicated model
    return [];
  }

  /**
   * Get coach groups
   */
  async getGroups(tenantId: string, coachId: string): Promise<CoachGroup[]> {
    // Note: This would require a CoachGroup model in the database
    // For now, return category-based groups
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      select: { id: true, firstName: true, lastName: true, category: true },
    });

    // Group players by category
    const categoryGroups: Record<string, typeof players> = {};
    players.forEach(p => {
      const cat = p.category || 'Ukategorisert';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(p);
    });

    const groups: CoachGroup[] = Object.entries(categoryGroups).map(([category, players], index) => ({
      id: `category-${category}`,
      name: `Kategori ${category}`,
      description: `Automatisk gruppe basert på spillerkategori`,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5],
      playerCount: players.length,
      players: players.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        category: p.category || 'Unknown',
      })),
      createdAt: new Date(),
    }));

    return groups;
  }

  /**
   * Get athletes (players) for group management
   */
  async getAthletes(tenantId: string, coachId: string): Promise<{
    id: string;
    name: string;
    category: string;
    handicap: number | null;
    email: string | null;
  }[]> {
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        category: true,
        handicap: true,
        email: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return players.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      category: p.category || 'Unknown',
      handicap: p.handicap ? Number(p.handicap) : null,
      email: p.email,
    }));
  }

  /**
   * Get booking settings for coach
   */
  async getBookingSettings(tenantId: string, coachId: string): Promise<BookingSettings | null> {
    const coach = await this.prisma.coach.findFirst({
      where: { id: coachId, tenantId },
      select: {
        id: true,
        workingHours: true,
      },
    });

    if (!coach) return null;

    // Return default settings combined with coach working hours
    return {
      coachId: coach.id,
      defaultSessionDuration: 60,
      bufferBetweenSessions: 15,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 24,
      allowCancellation: true,
      cancellationDeadlineHours: 24,
      workingHours: (coach.workingHours as Record<string, { start: string; end: string } | null>) || {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: null,
        sunday: null,
      },
    };
  }

  /**
   * Update booking settings for coach
   */
  async updateBookingSettings(
    tenantId: string,
    coachId: string,
    settings: Partial<BookingSettings>
  ): Promise<BookingSettings> {
    // Update working hours if provided
    if (settings.workingHours) {
      await this.prisma.coach.update({
        where: { id: coachId },
        data: {
          workingHours: settings.workingHours as Prisma.InputJsonValue,
        },
      });
    }

    // Return updated settings
    const updated = await this.getBookingSettings(tenantId, coachId);
    if (!updated) throw new Error('Coach not found');
    return updated;
  }
}
