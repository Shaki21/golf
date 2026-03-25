/**
 * Peer Comparison API Routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PeerComparisonService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// ============================================================================
// SCHEMAS
// ============================================================================

const getPeerComparisonQuerySchema = z.object({
  playerId: z.string().uuid(),
  testNumber: z.coerce.number().int().min(1).max(20),
  category: z.string().optional(),
  gender: z.string().optional(),
  ageMin: z.coerce.number().optional(),
  ageMax: z.coerce.number().optional(),
  handicapMin: z.coerce.number().optional(),
  handicapMax: z.coerce.number().optional(),
});

const getMultiLevelComparisonQuerySchema = z.object({
  playerId: z.string().uuid(),
  testNumber: z.coerce.number().int().min(1).max(20),
});

const getPeerGroupQuerySchema = z.object({
  playerId: z.string().uuid(),
  category: z.string().optional(),
  gender: z.string().optional(),
  ageMin: z.coerce.number().optional(),
  ageMax: z.coerce.number().optional(),
  handicapMin: z.coerce.number().optional(),
  handicapMax: z.coerce.number().optional(),
});

type GetPeerComparisonQuery = z.infer<typeof getPeerComparisonQuerySchema>;
type GetMultiLevelComparisonQuery = z.infer<typeof getMultiLevelComparisonQuerySchema>;
type GetPeerGroupQuery = z.infer<typeof getPeerGroupQuerySchema>;

// ============================================================================
// ROUTES
// ============================================================================

export async function peerComparisonRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new PeerComparisonService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /api/v1/peer-comparison
   * Get peer comparison for a player's test result
   */
  app.get<{ Querystring: GetPeerComparisonQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: "Get peer comparison for player's latest test result",
        tags: ['peer-comparison'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: GetPeerComparisonQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(getPeerComparisonQuerySchema, request.query);
      const criteria: any = {};

      if (query.category) criteria.category = query.category;
      if (query.gender) criteria.gender = query.gender;

      if (query.ageMin !== undefined || query.ageMax !== undefined) {
        criteria.ageRange = {
          min: query.ageMin || 0,
          max: query.ageMax || 100,
        };
      }

      if (
        query.handicapMin !== undefined ||
        query.handicapMax !== undefined
      ) {
        criteria.handicapRange = {
          min: query.handicapMin || -10,
          max: query.handicapMax || 54,
        };
      }

      const result = await service.getPeerComparison(request.tenant!.id, {
        playerId: query.playerId,
        testNumber: query.testNumber,
        criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
      });

      return reply.send({ success: true, data: result });
    }
  );

  /**
   * GET /api/v1/peer-comparison/multi-level
   * Get multi-level comparison across all categories (coach view)
   */
  app.get<{ Querystring: GetMultiLevelComparisonQuery }>(
    '/multi-level',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get multi-level comparison across all categories',
        tags: ['peer-comparison', 'coach'],
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
      request: FastifyRequest<{ Querystring: GetMultiLevelComparisonQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(getMultiLevelComparisonQuerySchema, request.query);
      const result = await service.getMultiLevelComparison(request.tenant!.id, {
        playerId: query.playerId,
        testNumber: query.testNumber,
      });

      return reply.send({ success: true, data: result });
    }
  );

  /**
   * GET /api/v1/peer-comparison/peer-group
   * Get list of peers matching criteria
   */
  app.get<{ Querystring: GetPeerGroupQuery }>(
    '/peer-group',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get list of peers matching specified criteria',
        tags: ['peer-comparison'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: GetPeerGroupQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(getPeerGroupQuerySchema, request.query);
      const criteria: any = {};

      if (query.category) criteria.category = query.category;
      if (query.gender) criteria.gender = query.gender;

      if (query.ageMin !== undefined || query.ageMax !== undefined) {
        criteria.ageRange = {
          min: query.ageMin || 0,
          max: query.ageMax || 100,
        };
      }

      if (
        query.handicapMin !== undefined ||
        query.handicapMax !== undefined
      ) {
        criteria.handicapRange = {
          min: query.handicapMin || -10,
          max: query.handicapMax || 54,
        };
      }

      const peers = await service.getPeerGroup(
        request.tenant!.id,
        query.playerId,
        criteria
      );

      return reply.send({ success: true, data: peers });
    }
  );
}
