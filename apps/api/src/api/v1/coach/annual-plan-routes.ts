/**
 * Annual Plan API Routes
 * Endpoints for managing annual training plans
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AnnualPlanService, type CreateAnnualPlanInput, type UpdateAnnualPlanInput } from './annual-plan-service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// ============================================================================
// SCHEMAS
// ============================================================================

const periodSchema = z.object({
  id: z.string(),
  type: z.enum(['E', 'G', 'S', 'T']),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  weeklyFrequency: z.number().int().min(0).max(7),
  goals: z.array(z.string()),
  color: z.string(),
  textColor: z.string(),
});

const createAnnualPlanSchema = z.object({
  playerId: z.string().uuid(),
  name: z.string().min(1).max(255),
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
  periods: z.array(periodSchema),
});

const updateAnnualPlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  periods: z.array(periodSchema).optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
});

type CreateAnnualPlanBody = z.infer<typeof createAnnualPlanSchema>;
type UpdateAnnualPlanBody = z.infer<typeof updateAnnualPlanSchema>;

// Helper to get coachId from request
function getCoachId(request: FastifyRequest): string | null {
  const user = request.user as { coachId?: string; role?: string; id?: string } | undefined;
  if (user?.coachId) return user.coachId;
  if (user?.role === 'coach' && user?.id) return user.id;
  return null;
}

// ============================================================================
// ROUTES
// ============================================================================

export async function annualPlanRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new AnnualPlanService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * POST /api/v1/coach/annual-plans
   * Create a new annual plan
   */
  app.post<{ Body: CreateAnnualPlanBody }>(
    '/annual-plans',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new annual training plan',
        tags: ['coach', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerId', 'name', 'startDate', 'endDate', 'periods'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            periods: { type: 'array', items: { type: 'object' } },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateAnnualPlanBody }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      try {
        const input = validate(createAnnualPlanSchema, request.body);
        const plan = await service.createPlan(request.tenant!.id, coachId, input as CreateAnnualPlanInput);
        return reply.send({ success: true, data: plan });
      } catch (error: any) {
        return reply.status(400).send({ success: false, error: error.message });
      }
    }
  );

  /**
   * GET /api/v1/coach/annual-plans
   * List all annual plans for coach's players
   */
  app.get(
    '/annual-plans',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List all annual training plans for coach',
        tags: ['coach', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const plans = await service.listPlans(request.tenant!.id, coachId);
      return reply.send({ success: true, data: plans });
    }
  );

  /**
   * GET /api/v1/coach/annual-plans/:planId
   * Get annual plan by ID
   */
  app.get<{ Params: { planId: string } }>(
    '/annual-plans/:planId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get annual training plan by ID',
        tags: ['coach', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['planId'],
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { planId: string } }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const plan = await service.getPlanById(request.tenant!.id, request.params.planId);
      if (!plan) {
        return reply.status(404).send({ success: false, error: 'Annual plan not found' });
      }

      return reply.send({ success: true, data: plan });
    }
  );

  /**
   * GET /api/v1/coach/annual-plans/player/:playerId
   * Get annual plan by player ID
   */
  app.get<{ Params: { playerId: string } }>(
    '/annual-plans/player/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get annual training plan by player ID',
        tags: ['coach', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { playerId: string } }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const plan = await service.getPlanByPlayerId(request.tenant!.id, request.params.playerId);
      if (!plan) {
        return reply.status(404).send({ success: false, error: 'Annual plan not found for this player' });
      }

      return reply.send({ success: true, data: plan });
    }
  );

  /**
   * PUT /api/v1/coach/annual-plans/:planId
   * Update annual plan
   */
  app.put<{ Params: { planId: string }; Body: UpdateAnnualPlanBody }>(
    '/annual-plans/:planId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update annual training plan',
        tags: ['coach', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['planId'],
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            periods: { type: 'array', items: { type: 'object' } },
            status: { type: 'string', enum: ['active', 'completed', 'paused', 'cancelled'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { planId: string }; Body: UpdateAnnualPlanBody }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      try {
        const input = validate(updateAnnualPlanSchema, request.body);
        const plan = await service.updatePlan(request.tenant!.id, request.params.planId, input as UpdateAnnualPlanInput);
        return reply.send({ success: true, data: plan });
      } catch (error: any) {
        return reply.status(400).send({ success: false, error: error.message });
      }
    }
  );

  /**
   * DELETE /api/v1/coach/annual-plans/:planId
   * Delete annual plan
   */
  app.delete<{ Params: { planId: string } }>(
    '/annual-plans/:planId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete annual training plan',
        tags: ['coach', 'annual-plans'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['planId'],
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { planId: string } }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      try {
        await service.deletePlan(request.tenant!.id, request.params.planId);
        return reply.send({ success: true });
      } catch (error: any) {
        return reply.status(400).send({ success: false, error: error.message });
      }
    }
  );
}
