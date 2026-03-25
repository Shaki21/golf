import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';

const planRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  /**
   * GET /plan/current - Get player's current active training plan
   */
  fastify.get('/current', {
    onRequest: [fastify.authenticate],
    handler: async (req, reply) => {
      const playerId = req.user!.playerId;

      if (!playerId) {
        return reply.code(403).send({
          success: false,
          error: { message: 'Only players can access training plans' }
        });
      }

      // Get active annual plan for player
      const plan = await prisma.annualTrainingPlan.findFirst({
        where: {
          playerId,
          status: 'active',
        },
        include: {
          periodizations: {
            orderBy: { weekNumber: 'asc' },
          },
          dailyAssignments: {
            where: {
              assignedDate: {
                gte: new Date(),
              },
            },
            orderBy: { assignedDate: 'asc' },
            take: 14, // Next 2 weeks
          },
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: { message: 'No active training plan found' },
        });
      }

      // Calculate current week
      const now = new Date();
      const startDate = new Date(plan.startDate);
      const diffTime = now.getTime() - startDate.getTime();
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      const currentWeek = Math.max(1, Math.min(diffWeeks + 1, plan.periodizations.length));

      // Get completed sessions count for current week
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const completedThisWeek = await prisma.trainingSession.count({
        where: {
          playerId,
          sessionDate: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      });

      const plannedThisWeek = await prisma.dailyTrainingAssignment.count({
        where: {
          playerId,
          weekNumber: currentWeek,
          isRestDay: false,
        },
      });

      // Current period info
      const currentPeriod = plan.periodizations.find((p) => p.weekNumber === currentWeek);

      return {
        success: true,
        data: {
          id: plan.id,
          playerId: plan.playerId,
          name: plan.planName,
          startDate: plan.startDate,
          endDate: plan.endDate,
          currentWeek,
          totalWeeks: plan.periodizations.length,
          focus: currentPeriod?.periodPhase || 'General',
          period: currentPeriod?.period || 'E',
          learningPhase: currentPeriod?.learningPhaseMin,
          weekOverview: {
            completed: completedThisWeek,
            planned: plannedThisWeek,
            upcoming: plan.dailyAssignments.filter(a => !a.isRestDay).length,
          },
        },
      };
    },
  });

  /**
   * GET /plan/month - Get monthly plan breakdown
   */
  fastify.get('/month', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['month'],
        properties: {
          month: { type: 'string', pattern: '^\\d{4}-\\d{2}$' },
        },
      },
    },
    handler: async (req, reply) => {
      const playerId = req.user!.playerId;
      const { month } = req.query as { month: string };

      if (!playerId) {
        return reply.code(403).send({
          success: false,
          error: { message: 'Only players can access training plans' }
        });
      }

      // Parse month
      const [year, monthNum] = month.split('-').map(Number);
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);

      // Get active plan
      const plan = await prisma.annualTrainingPlan.findFirst({
        where: {
          playerId,
          status: 'active',
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: { message: 'No training plan found for this month' },
        });
      }

      // Get weekly periodizations for this month
      const planStart = new Date(plan.startDate);
      const firstWeekOfMonth = Math.ceil((monthStart.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
      const lastWeekOfMonth = Math.ceil((monthEnd.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;

      const periodizations = await prisma.periodization.findMany({
        where: {
          annualPlanId: plan.id,
          weekNumber: {
            gte: Math.max(1, firstWeekOfMonth),
            lte: lastWeekOfMonth,
          },
        },
        orderBy: { weekNumber: 'asc' },
      });

      // Get assignments and sessions for each week
      const weeks = await Promise.all(periodizations.map(async (period) => {
        const weekStart = new Date(planStart);
        weekStart.setDate(weekStart.getDate() + (period.weekNumber - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const [plannedCount, completedCount] = await Promise.all([
          prisma.dailyTrainingAssignment.count({
            where: {
              playerId,
              weekNumber: period.weekNumber,
              isRestDay: false,
            },
          }),
          prisma.trainingSession.count({
            where: {
              playerId,
              sessionDate: {
                gte: weekStart,
                lt: weekEnd,
              },
            },
          }),
        ]);

        return {
          weekNumber: period.weekNumber,
          focus: period.periodPhase || period.period,
          period: period.period,
          learningPhase: period.learningPhaseMin,
          sessions: plannedCount,
          completed: completedCount,
        };
      }));

      return {
        success: true,
        data: {
          month,
          planId: plan.id,
          planName: plan.planName,
          weeks,
        },
      };
    },
  });
};

export default planRoutes;
