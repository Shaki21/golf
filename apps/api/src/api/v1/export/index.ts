import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma, DailyTrainingAssignment } from '@prisma/client';
import prisma from '../../../core/db/prisma';
import {
  generatePlayerReportPDF,
  generateTrainingPlanPDF,
  generateTestResultsExcel,
  generateTrainingSessionsExcel,
  generateStatisticsExcel,
  PlayerReport,
  TestResultsExport,
  TrainingSessionExport,
} from '../../../services/export';
import { logger } from '../../../utils/logger';

/**
 * Export API Routes
 * PDF and Excel exports for reports and data
 */

export async function exportRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', app.authenticate);

  /**
   * GET /player/:playerId/report
   * Generate PDF report for a player
   */
  app.get('/player/:playerId/report', {
    schema: {
      description: 'Generate player progress report PDF',
      tags: ['export'],
      params: {
        type: 'object',
        required: ['playerId'],
        properties: {
          playerId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { playerId: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string; role: string; tenantId: string; playerId?: string };
    const { playerId } = request.params;

    // Authorization: player can export own, coach can export their players
    if (user.role === 'player' && user.playerId !== playerId) {
      return reply.status(403).send({ error: 'Kan bare eksportere egen rapport' });
    }

    // Fetch player data
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        user: true,
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { test: true },
        },
        trainingSessions: {
          orderBy: { sessionDate: 'desc' },
          take: 50,
        },
        playerGoals: {
          orderBy: { createdAt: 'desc' },
        },
        badges: {
          where: { earnedAt: { not: null } },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!player) {
      return reply.status(404).send({ error: 'Spiller ikke funnet' });
    }

    // Calculate training stats
    const focusAreaCounts: Record<string, number> = {};
    let totalMinutes = 0;

    player.trainingSessions.forEach((session) => {
      totalMinutes += session.durationMinutes || 0;
      const area = session.focusArea || 'Generelt';
      focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
    });

    const totalSessions = player.trainingSessions.length;
    const focusAreas = Object.entries(focusAreaCounts).map(([area, count]) => ({
      area,
      percentage: Math.round((count / totalSessions) * 100),
    }));

    const report: PlayerReport = {
      player: {
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: player.dateOfBirth || undefined,
        handicap: player.handicap ? Number(player.handicap) : undefined,
        category: player.category || undefined,
      },
      testResults: player.testResults.map((tr) => ({
        date: tr.createdAt,
        testName: tr.test.name,
        score: Number(tr.value),
        maxScore: tr.test.maxScore ? Number(tr.test.maxScore) : 100,
        percentile: tr.percentileRank ? Number(tr.percentileRank) : undefined,
      })),
      trainingStats: {
        totalSessions,
        totalHours: Math.round(totalMinutes / 60),
        focusAreas,
      },
      goals: player.playerGoals.map((g) => ({
        title: g.title,
        status: g.status,
        progress: g.progressPercent || 0,
      })),
      achievements: player.badges
        .filter((pb) => pb.earnedAt)
        .map((pb) => ({
          name: pb.badgeId, // badgeId is the string identifier
          unlockedAt: pb.earnedAt!,
        })),
    };

    try {
      const pdfBuffer = await generatePlayerReportPDF(report);

      reply.header('Content-Type', 'application/pdf');
      reply.header(
        'Content-Disposition',
        `attachment; filename="${player.firstName}_${player.lastName}_rapport.pdf"`
      );

      return reply.send(pdfBuffer);
    } catch (error) {
      logger.error({ error }, 'Failed to generate PDF');
      return reply.status(500).send({ error: 'Kunne ikke generere PDF' });
    }
  });

  /**
   * GET /test-results
   * Export test results to Excel
   */
  app.get('/test-results', {
    schema: {
      description: 'Export test results to Excel',
      tags: ['export'],
      querystring: {
        type: 'object',
        properties: {
          playerId: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          testId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest<{
    Querystring: { playerId?: string; startDate?: string; endDate?: string; testId?: string };
  }>, reply: FastifyReply) => {
    const user = request.user as { role: string; tenantId: string; playerId?: string };
    const { playerId, startDate, endDate, testId } = request.query;

    // Build filter
    const where: Prisma.TestResultWhereInput = {};

    if (user.role === 'player') {
      where.playerId = user.playerId;
    } else if (playerId) {
      where.playerId = playerId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (testId) {
      where.testId = testId;
    }

    const results = await prisma.testResult.findMany({
      where,
      include: {
        player: true,
        test: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const exportData: TestResultsExport[] = results.map((r) => ({
      playerName: `${r.player.firstName} ${r.player.lastName}`,
      testDate: r.createdAt,
      testName: r.test.name,
      category: r.test.category || 'Ukjent',
      score: Number(r.value),
      maxScore: 100,
      percentage: r.percentOfRequirement ? Number(r.percentOfRequirement) : 0,
      percentile: undefined,
      notes: r.coachFeedback || undefined,
    }));

    try {
      const excelBuffer = await generateTestResultsExcel(exportData);

      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', 'attachment; filename="testresultater.xlsx"');

      return reply.send(excelBuffer);
    } catch (error) {
      logger.error({ error }, 'Failed to generate Excel');
      return reply.status(500).send({ error: 'Kunne ikke generere Excel-fil' });
    }
  });

  /**
   * GET /training-sessions
   * Export training sessions to Excel
   */
  app.get('/training-sessions', {
    schema: {
      description: 'Export training sessions to Excel',
      tags: ['export'],
      querystring: {
        type: 'object',
        properties: {
          playerId: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest<{
    Querystring: { playerId?: string; startDate?: string; endDate?: string };
  }>, reply: FastifyReply) => {
    const user = request.user as { role: string; tenantId: string; playerId?: string };
    const { playerId, startDate, endDate } = request.query;

    const where: Prisma.TrainingSessionWhereInput = {};

    if (user.role === 'player') {
      where.playerId = user.playerId;
    } else if (playerId) {
      where.playerId = playerId;
    }

    if (startDate || endDate) {
      where.sessionDate = {};
      if (startDate) where.sessionDate.gte = new Date(startDate);
      if (endDate) where.sessionDate.lte = new Date(endDate);
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        player: true,
      },
      orderBy: { sessionDate: 'desc' },
    });

    const exportData: TrainingSessionExport[] = sessions.map((s) => ({
      date: s.sessionDate,
      playerName: s.player ? `${s.player.firstName} ${s.player.lastName}` : 'Ukjent',
      duration: s.duration || 0,
      focusArea: s.focusArea || 'Generelt',
      exercises: s.sessionType || '',
      coachNotes: s.notes || undefined,
      playerReflection: s.whatWentWell || undefined,
    }));

    try {
      const excelBuffer = await generateTrainingSessionsExcel(exportData);

      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', 'attachment; filename="treningsoekter.xlsx"');

      return reply.send(excelBuffer);
    } catch (error) {
      logger.error({ error }, 'Failed to generate Excel');
      return reply.status(500).send({ error: 'Kunne ikke generere Excel-fil' });
    }
  });

  /**
   * GET /statistics
   * Export academy statistics to Excel (coaches/admins only)
   */
  app.get('/statistics', {
    schema: {
      description: 'Export academy statistics to Excel',
      tags: ['export'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: string; tenantId: string };

    if (!['coach', 'admin'].includes(user.role)) {
      return reply.status(403).send({ error: 'Bare trenere kan eksportere statistikk' });
    }

    // Get all players with stats
    const players = await prisma.player.findMany({
      where: { tenantId: user.tenantId },
      include: {
        _count: {
          select: {
            trainingSessions: true,
            testResults: true,
          },
        },
      },
    });

    // Calculate summary
    const totalPlayers = players.length;
    const totalSessions = players.reduce((sum, p) => sum + p._count.trainingSessions, 0);
    const totalTests = players.reduce((sum, p) => sum + p._count.testResults, 0);
    const playersWithHandicap = players.filter((p) => p.handicap);
    const avgHandicap = playersWithHandicap.length > 0
      ? playersWithHandicap.reduce((sum, p) => sum + Number(p.handicap || 0), 0) / playersWithHandicap.length
      : 0;

    const categoryDistribution: Record<string, number> = {};
    players.forEach((p) => {
      const cat = p.category || 'Ukjent';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    const data = {
      players: players.map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        handicap: p.handicap ? Number(p.handicap) : 0,
        category: p.category || 'Ukjent',
        sessionsCount: p._count.trainingSessions,
        testsCount: p._count.testResults,
      })),
      summary: {
        totalPlayers,
        totalSessions,
        totalTests,
        avgHandicap: isNaN(avgHandicap) ? 0 : avgHandicap,
        categoryDistribution: Object.entries(categoryDistribution).map(([category, count]) => ({
          category,
          count,
        })),
      },
    };

    try {
      const excelBuffer = await generateStatisticsExcel(data);

      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', 'attachment; filename="akademi_statistikk.xlsx"');

      return reply.send(excelBuffer);
    } catch (error) {
      logger.error({ error }, 'Failed to generate Excel');
      return reply.status(500).send({ error: 'Kunne ikke generere Excel-fil' });
    }
  });

  /**
   * GET /training-plan/:playerId
   * Export training plan to PDF
   */
  app.get('/training-plan/:playerId', {
    schema: {
      description: 'Export training plan to PDF',
      tags: ['export'],
      params: {
        type: 'object',
        required: ['playerId'],
        properties: {
          playerId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { playerId: string } }>, reply: FastifyReply) => {
    const user = request.user as { role: string; playerId?: string };
    const { playerId } = request.params;

    if (user.role === 'player' && user.playerId !== playerId) {
      return reply.status(403).send({ error: 'Kan bare eksportere egen treningsplan' });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return reply.status(404).send({ error: 'Spiller ikke funnet' });
    }

    const plan = await prisma.annualTrainingPlan.findFirst({
      where: { playerId, status: 'active' },
      include: {
        dailyAssignments: {
          orderBy: [{ weekNumber: 'asc' }, { dayOfWeek: 'asc' }],
        },
      },
    });

    if (!plan) {
      return reply.status(404).send({ error: 'Ingen aktiv treningsplan funnet' });
    }

    // Group daily assignments by week
    const weekMap = new Map<number, DailyTrainingAssignment[]>();
    plan.dailyAssignments.forEach((assignment) => {
      if (!weekMap.has(assignment.weekNumber)) {
        weekMap.set(assignment.weekNumber, []);
      }
      weekMap.get(assignment.weekNumber)!.push(assignment);
    });

    const planData = {
      playerName: `${player.firstName} ${player.lastName}`,
      startDate: plan.startDate,
      endDate: plan.endDate,
      weeks: Array.from(weekMap.entries()).map(([weekNumber, assignments]) => ({
        weekNumber,
        focus: 'Generell trening',
        sessions: assignments.map((s) => ({
          day: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][s.dayOfWeek] || 'Ukjent',
          type: s.sessionType || 'Trening',
          duration: s.estimatedDuration || 0,
          exercises: [],
        })),
      })),
    };

    try {
      const pdfBuffer = await generateTrainingPlanPDF(planData);

      reply.header('Content-Type', 'application/pdf');
      reply.header(
        'Content-Disposition',
        `attachment; filename="${player.firstName}_${player.lastName}_treningsplan.pdf"`
      );

      return reply.send(pdfBuffer);
    } catch (error) {
      logger.error({ error }, 'Failed to generate PDF');
      return reply.status(500).send({ error: 'Kunne ikke generere PDF' });
    }
  });
}

export default exportRoutes;
