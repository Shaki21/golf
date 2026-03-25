/**
 * Coach Analytics API Routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CoachAnalyticsService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// ============================================================================
// SCHEMAS
// ============================================================================

const playerOverviewParamsSchema = z.object({
  playerId: z.string().uuid(),
});

const categoryProgressionParamsSchema = z.object({
  playerId: z.string().uuid(),
});

const comparePlayersBodySchema = z.object({
  playerIds: z.array(z.string().uuid()).min(2).max(10),
  testNumbers: z.array(z.number().int().min(1).max(20)).min(1),
});

const teamAnalyticsParamsSchema = z.object({
  coachId: z.string().uuid(),
});

const coachDashboardParamsSchema = z.object({
  coachId: z.string().uuid(),
});

type PlayerOverviewParams = z.infer<typeof playerOverviewParamsSchema>;
type CategoryProgressionParams = z.infer<typeof categoryProgressionParamsSchema>;
type ComparePlayersBody = z.infer<typeof comparePlayersBodySchema>;
type TeamAnalyticsParams = z.infer<typeof teamAnalyticsParamsSchema>;
type CoachDashboardParams = z.infer<typeof coachDashboardParamsSchema>;

// ============================================================================
// ROUTES
// ============================================================================

export async function coachAnalyticsRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new CoachAnalyticsService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /api/v1/coach-analytics/players/:playerId/overview
   * Get player overview with test summaries
   */
  app.get<{ Params: PlayerOverviewParams }>(
    '/players/:playerId/overview',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get comprehensive player overview with all test summaries',
        tags: ['coach-analytics'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlayerOverviewParams }>,
      reply: FastifyReply
    ) => {
      const params = validate(playerOverviewParamsSchema, request.params);
      const overview = await service.getPlayerOverview(
        request.tenant!.id,
        params.playerId
      );
      return reply.send({ success: true, data: overview });
    }
  );

  /**
   * GET /api/v1/coach-analytics/players/:playerId/category-progression
   * Get category progression analysis
   */
  app.get<{ Params: CategoryProgressionParams }>(
    '/players/:playerId/category-progression',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get category progression readiness analysis',
        tags: ['coach-analytics'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: CategoryProgressionParams }>,
      reply: FastifyReply
    ) => {
      const params = validate(categoryProgressionParamsSchema, request.params);
      const progression = await service.getCategoryProgression(
        request.tenant!.id,
        params.playerId
      );
      return reply.send({ success: true, data: progression });
    }
  );

  /**
   * POST /api/v1/coach-analytics/compare-players
   * Compare multiple players across selected tests
   */
  app.post<{ Body: ComparePlayersBody }>(
    '/compare-players',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Compare multiple players across selected tests',
        tags: ['coach-analytics'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ComparePlayersBody }>, reply: FastifyReply) => {
      const input = validate(comparePlayersBodySchema, request.body);
      const comparison = await service.compareMultiplePlayers(
        request.tenant!.id,
        input.playerIds,
        input.testNumbers
      );
      return reply.send({ success: true, data: comparison });
    }
  );

  /**
   * GET /api/v1/coach-analytics/team/:coachId
   * Get team analytics for a coach
   */
  app.get<{ Params: TeamAnalyticsParams }>(
    '/team/:coachId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get comprehensive team analytics for a coach',
        tags: ['coach-analytics'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: TeamAnalyticsParams }>,
      reply: FastifyReply
    ) => {
      const params = validate(teamAnalyticsParamsSchema, request.params);
      const analytics = await service.getTeamAnalytics(
        request.tenant!.id,
        params.coachId
      );
      return reply.send({ success: true, data: analytics });
    }
  );

  /**
   * GET /api/v1/coach-analytics/dashboard/:coachId
   * Get complete coach dashboard
   */
  app.get<{ Params: CoachDashboardParams }>(
    '/dashboard/:coachId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get complete coach dashboard with summary, analytics, and alerts',
        tags: ['coach-analytics'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: CoachDashboardParams }>,
      reply: FastifyReply
    ) => {
      const params = validate(coachDashboardParamsSchema, request.params);
      const dashboard = await service.getCoachDashboard(
        request.tenant!.id,
        params.coachId
      );
      return reply.send({ success: true, data: dashboard });
    }
  );
}
