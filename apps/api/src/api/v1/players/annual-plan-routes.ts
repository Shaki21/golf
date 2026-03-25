/**
 * Player Annual Plan API Routes
 * Self-service endpoints for players to manage their annual plans
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  PlayerAnnualPlanService,
  type CreatePlayerAnnualPlanInput,
  type UpdatePlayerAnnualPlanInput,
} from './annual-plan-service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

// ============================================================================
// SCHEMAS
// ============================================================================

const periodSchema = z.object({
  id: z.string(),
  type: z.enum(['E', 'G', 'S', 'T']),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  weeklyFrequency: z.number().int().min(1).max(7),
  goals: z.array(z.string()),
  color: z.string(),
  textColor: z.string(),
});

const createPlanSchema = z.object({
  name: z.string().min(1).max(255),
  startDate: z.string(),
  endDate: z.string(),
  periods: z.array(periodSchema).min(1),
});

const updatePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  periods: z.array(periodSchema).min(1).optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
});

type CreatePlanBody = z.infer<typeof createPlanSchema>;
type UpdatePlanBody = z.infer<typeof updatePlanSchema>;

// Helper to get playerId from request
function getPlayerId(request: FastifyRequest): string | null {
  const user = request.user as
    | { playerId?: string; role?: string; id?: string }
    | undefined;
  if (user?.playerId) return user.playerId;
  if (user?.role === 'player' && user?.id) return user.id;
  return null;
}

// ============================================================================
// ROUTES
// ============================================================================

export async function playerAnnualPlanRoutes(
  app: FastifyInstance
): Promise<void> {
  const prisma = getPrismaClient();
  const service = new PlayerAnnualPlanService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /api/v1/players/:playerId/annual-plan
   * Get player's current annual plan
   */
  app.get<{ Params: { playerId: string } }>(
    '/:playerId/annual-plan',
    {
      preHandler: preHandlers,
      schema: {
        description: "Get player's annual plan",
        tags: ['players', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId } = request.params;
        const tenantId = (request as any).tenant?.id;

        // Verify user can access this player's data
        const requestPlayerId = getPlayerId(request);
        if (requestPlayerId !== playerId) {
          return reply.code(403).send({
            success: false,
            message: 'You can only access your own annual plan',
          });
        }

        const result = await service.getPlayerPlan(tenantId, playerId);

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch annual plan',
          error: error.message,
        });
      }
    }
  );

  /**
   * POST /api/v1/players/:playerId/annual-plan
   * Create new annual plan
   */
  app.post<{ Params: { playerId: string }; Body: CreatePlanBody }>(
    '/:playerId/annual-plan',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create new annual plan for player',
        tags: ['players', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
        body: {
          type: 'object',
          required: ['name', 'startDate', 'endDate', 'periods'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            periods: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: [
                  'id',
                  'type',
                  'name',
                  'startDate',
                  'endDate',
                  'weeklyFrequency',
                  'goals',
                  'color',
                  'textColor',
                ],
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['E', 'G', 'S', 'T'] },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  startDate: { type: 'string' },
                  endDate: { type: 'string' },
                  weeklyFrequency: { type: 'number', minimum: 1, maximum: 7 },
                  goals: { type: 'array', items: { type: 'string' } },
                  color: { type: 'string' },
                  textColor: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId } = request.params;
        const tenantId = (request as any).tenant?.id;

        // Verify user can create plan for this player
        const requestPlayerId = getPlayerId(request);
        if (requestPlayerId !== playerId) {
          return reply.code(403).send({
            success: false,
            message: 'You can only create your own annual plan',
          });
        }

        // Validate input
        const validatedData = createPlanSchema.parse(request.body);

        const plan = await service.createPlayerPlan(
          tenantId,
          playerId,
          validatedData
        );

        return reply.code(201).send({
          success: true,
          data: { plan },
        });
      } catch (error: any) {
        request.log.error(error);

        if (error.name === 'ZodError') {
          return reply.code(400).send({
            success: false,
            message: 'Invalid input data',
            errors: error.errors,
          });
        }

        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to create annual plan',
        });
      }
    }
  );

  /**
   * PUT /api/v1/players/:playerId/annual-plan
   * Update existing annual plan
   */
  app.put<{ Params: { playerId: string }; Body: UpdatePlanBody }>(
    '/:playerId/annual-plan',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update annual plan',
        tags: ['players', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId } = request.params;
        const tenantId = (request as any).tenant?.id;

        // Verify user can update this player's plan
        const requestPlayerId = getPlayerId(request);
        if (requestPlayerId !== playerId) {
          return reply.code(403).send({
            success: false,
            message: 'You can only update your own annual plan',
          });
        }

        // Validate input
        const validatedData = updatePlanSchema.parse(request.body);

        const plan = await service.updatePlayerPlan(
          tenantId,
          playerId,
          validatedData
        );

        return reply.send({
          success: true,
          data: { plan },
        });
      } catch (error: any) {
        request.log.error(error);

        if (error.name === 'ZodError') {
          return reply.code(400).send({
            success: false,
            message: 'Invalid input data',
            errors: error.errors,
          });
        }

        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to update annual plan',
        });
      }
    }
  );

  /**
   * DELETE /api/v1/players/:playerId/annual-plan
   * Cancel annual plan
   */
  app.delete<{ Params: { playerId: string } }>(
    '/:playerId/annual-plan',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Cancel annual plan',
        tags: ['players', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId } = request.params;
        const tenantId = (request as any).tenant?.id;

        // Verify user can cancel this player's plan
        const requestPlayerId = getPlayerId(request);
        if (requestPlayerId !== playerId) {
          return reply.code(403).send({
            success: false,
            message: 'You can only cancel your own annual plan',
          });
        }

        await service.cancelPlayerPlan(tenantId, playerId);

        return reply.send({
          success: true,
          message: 'Annual plan cancelled successfully',
        });
      } catch (error: any) {
        request.log.error(error);
        return reply.code(400).send({
          success: false,
          message: error.message || 'Failed to cancel annual plan',
        });
      }
    }
  );

  /**
   * GET /api/v1/players/:playerId/annual-plan/templates
   * Get predefined templates
   */
  app.get<{ Params: { playerId: string } }>(
    '/:playerId/annual-plan/templates',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get annual plan templates',
        tags: ['players', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const templates = await service.getTemplates();

        return reply.send({
          success: true,
          data: { templates },
        });
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch templates',
        });
      }
    }
  );
}
