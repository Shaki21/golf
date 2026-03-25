/**
 * Sport Configuration API Routes
 *
 * Provides endpoints for managing sport configurations for multi-sport support.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SportId } from '@prisma/client';
import { SportConfigService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, authorize } from '../../../middleware/auth';

// Schemas
const sportIdEnum = z.enum(['GOLF', 'RUNNING', 'HANDBALL', 'FOOTBALL', 'TENNIS', 'SWIMMING', 'JAVELIN']);

const sportConfigInputSchema = z.object({
  sportId: sportIdEnum,
  trainingAreasOverride: z.record(z.unknown()).optional(),
  environmentsOverride: z.record(z.unknown()).optional(),
  phasesOverride: z.record(z.unknown()).optional(),
  benchmarksOverride: z.record(z.unknown()).optional(),
  terminologyOverride: z.record(z.unknown()).optional(),
  navigationOverride: z.record(z.unknown()).optional(),
  usesHandicap: z.boolean().optional(),
  usesClubSpeed: z.boolean().optional(),
  usesSG: z.boolean().optional(),
  usesAKFormula: z.boolean().optional(),
  usesBenchmarks: z.boolean().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoUrl: z.string().url().optional(),
});

type SportConfigInput = z.infer<typeof sportConfigInputSchema>;

export default async function sportConfigRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient();
  const service = new SportConfigService(prisma);

  const preHandlers = [authenticateUser];
  const adminPreHandlers = [authenticateUser, authorize('admin')];

  /**
   * Get available sports
   * GET /api/v1/sport-config/sports
   */
  app.get(
    '/sports',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get list of available sports',
        tags: ['Sport Config'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const sports = await service.getAvailableSports();
      return reply.send({ success: true, data: sports });
    }
  );

  /**
   * Get current tenant's sport configuration
   * GET /api/v1/sport-config
   */
  app.get(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get current tenant sport configuration',
        tags: ['Sport Config'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const tenantId = (request as unknown as { user: { tenantId: string } }).user.tenantId;

      // Get sport config (may be null if using defaults)
      const config = await service.getByTenantId(tenantId);

      // Get tenant's sport ID
      const sportId = await service.getTenantSportId(tenantId);

      return reply.send({
        success: true,
        data: config,
        sportId,
        hasCustomConfig: !!config,
      });
    }
  );

  /**
   * Update current tenant's sport configuration
   * PUT /api/v1/sport-config
   */
  app.put<{ Body: SportConfigInput }>(
    '/',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Update tenant sport configuration (admin only)',
        tags: ['Sport Config'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            sportId: { type: 'string', enum: ['GOLF', 'RUNNING', 'HANDBALL', 'FOOTBALL', 'TENNIS', 'SWIMMING', 'JAVELIN'] },
            trainingAreasOverride: { type: 'object' },
            environmentsOverride: { type: 'object' },
            phasesOverride: { type: 'object' },
            benchmarksOverride: { type: 'object' },
            terminologyOverride: { type: 'object' },
            navigationOverride: { type: 'object' },
            usesHandicap: { type: 'boolean' },
            usesClubSpeed: { type: 'boolean' },
            usesSG: { type: 'boolean' },
            usesAKFormula: { type: 'boolean' },
            usesBenchmarks: { type: 'boolean' },
            primaryColor: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            secondaryColor: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            logoUrl: { type: 'string', format: 'uri' },
          },
          required: ['sportId'],
        },
      },
    },
    async (request: FastifyRequest<{ Body: SportConfigInput }>, reply: FastifyReply) => {
      const tenantId = (request as unknown as { user: { tenantId: string } }).user.tenantId;
      const input = sportConfigInputSchema.parse(request.body);

      const config = await service.upsert(tenantId, input);

      return reply.send({
        success: true,
        message: 'Sport configuration updated',
        data: config,
      });
    }
  );

  /**
   * Reset tenant's sport configuration to defaults
   * DELETE /api/v1/sport-config
   */
  app.delete(
    '/',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Reset tenant sport configuration to defaults (admin only)',
        tags: ['Sport Config'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const tenantId = (request as unknown as { user: { tenantId: string } }).user.tenantId;

      try {
        await service.delete(tenantId);
        return reply.send({
          success: true,
          message: 'Sport configuration reset to defaults',
        });
      } catch {
        return reply.send({
          success: true,
          message: 'No custom configuration to reset',
        });
      }
    }
  );

  /**
   * Get all sport configurations (super admin only)
   * GET /api/v1/sport-config/all
   */
  app.get(
    '/all',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get all sport configurations (admin only)',
        tags: ['Sport Config'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const configs = await service.getAll();
      return reply.send({
        success: true,
        data: configs,
        total: configs.length,
      });
    }
  );

  /**
   * Get sport configurations by sport type
   * GET /api/v1/sport-config/by-sport/:sportId
   */
  app.get<{ Params: { sportId: string } }>(
    '/by-sport/:sportId',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get configurations for a specific sport (admin only)',
        tags: ['Sport Config'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            sportId: { type: 'string', enum: ['GOLF', 'RUNNING', 'HANDBALL', 'FOOTBALL', 'TENNIS', 'SWIMMING', 'JAVELIN'] },
          },
          required: ['sportId'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { sportId: string } }>, reply: FastifyReply) => {
      const sportId = sportIdEnum.parse(request.params.sportId) as SportId;
      const configs = await service.getBySport(sportId);

      return reply.send({
        success: true,
        data: configs,
        total: configs.length,
      });
    }
  );
}

export { sportConfigRoutes };
