/**
 * Plan Dashboard API Routes
 * Decision-first dashboard endpoint
 */

import { FastifyPluginAsync } from 'fastify';
import { PlanDashboardService } from './service';
import { getDashboardSchema } from './schema';

const planDashboardRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new PlanDashboardService(fastify.prisma);

  /**
   * GET /api/v1/plan-dashboard
   * Get decision-first dashboard data for authenticated player
   */
  fastify.get(
    '/',
    {
      schema: getDashboardSchema,
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        // Get player ID from authenticated user
        const user = request.user as { id: string; playerId?: string };
        const playerId = user.playerId || user.id;

        if (!playerId) {
          return reply.code(400).send({
            error: 'bad_request',
            message: 'Player ID not found for user',
          });
        }

        const dashboard = await service.getDashboard(playerId);

        return reply.code(200).send(dashboard);
      } catch (error) {
        fastify.log.error(error, 'Failed to get plan dashboard');
        return reply.code(500).send({
          error: 'internal_error',
          message: 'Failed to load dashboard data',
        });
      }
    }
  );

  /**
   * GET /api/v1/plan-dashboard/attention-count
   * Get just the attention count (for sidebar badge)
   */
  fastify.get(
    '/attention-count',
    {
      schema: {
        tags: ['plan-dashboard'],
        summary: 'Get attention count for sidebar badge',
        response: {
          200: {
            type: 'object',
            properties: {
              count: { type: 'number' },
            },
            required: ['count'],
          },
        },
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = request.user as { id: string; playerId?: string };
        const playerId = user.playerId || user.id;

        if (!playerId) {
          return reply.code(400).send({
            error: 'bad_request',
            message: 'Player ID not found for user',
          });
        }

        const dashboard = await service.getDashboard(playerId);
        const count = dashboard.attentionItems.filter(
          (item) => item.severity === 'warning' || item.severity === 'error'
        ).length;

        return reply.code(200).send({ count });
      } catch (error) {
        fastify.log.error(error, 'Failed to get attention count');
        return reply.code(500).send({
          error: 'internal_error',
          message: 'Failed to load attention count',
        });
      }
    }
  );
};

export default planDashboardRoutes;
