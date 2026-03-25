/**
 * Coach Plan Dashboard API Routes
 * Decision-first dashboard endpoint for coaches
 */

import { FastifyPluginAsync } from 'fastify';
import { CoachPlanDashboardService } from './service';
import { getCoachDashboardSchema, getAttentionCountSchema } from './schema';

const coachPlanDashboardRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new CoachPlanDashboardService(fastify.prisma);

  /**
   * GET /api/v1/coach-plan-dashboard
   * Get decision-first dashboard data for authenticated coach
   */
  fastify.get(
    '/',
    {
      schema: getCoachDashboardSchema,
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        // Get coach ID from authenticated user
        const user = request.user as { id: string; coachId?: string };
        const coachId = user.coachId;

        if (!coachId) {
          return reply.code(403).send({
            error: 'forbidden',
            message: 'User is not a coach',
          });
        }

        const dashboard = await service.getDashboard(coachId);

        return reply.code(200).send(dashboard);
      } catch (error) {
        fastify.log.error(error, 'Failed to get coach plan dashboard');
        return reply.code(500).send({
          error: 'internal_error',
          message: 'Failed to load dashboard data',
        });
      }
    }
  );

  /**
   * GET /api/v1/coach-plan-dashboard/attention-count
   * Get just the attention count (for sidebar badge)
   */
  fastify.get(
    '/attention-count',
    {
      schema: getAttentionCountSchema,
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = request.user as { id: string; coachId?: string };
        const coachId = user.coachId;

        if (!coachId) {
          return reply.code(403).send({
            error: 'forbidden',
            message: 'User is not a coach',
          });
        }

        const result = await service.getAttentionCount(coachId);

        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error(error, 'Failed to get coach attention count');
        return reply.code(500).send({
          error: 'internal_error',
          message: 'Failed to load attention count',
        });
      }
    }
  );
};

export default coachPlanDashboardRoutes;
