/**
 * Player Insights API Routes
 * Endpoints for SG Journey, Skill DNA, and Bounty Board
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import { PlayerInsightsService } from './service';

// =============================================================================
// SCHEMAS
// =============================================================================

const playerIdParamSchema = z.object({
  playerId: z.string().uuid().optional(),
});

const bountyIdParamSchema = z.object({
  bountyId: z.string(),
});

const updateProgressSchema = z.object({
  newValue: z.number(),
});

type PlayerIdParam = z.infer<typeof playerIdParamSchema>;
type BountyIdParam = z.infer<typeof bountyIdParamSchema>;
type UpdateProgressBody = z.infer<typeof updateProgressSchema>;

// =============================================================================
// ROUTES
// =============================================================================

export async function playerInsightsRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new PlayerInsightsService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /api/v1/player-insights
   * Get all player insights (SG Journey, Skill DNA, Bounty Board)
   */
  app.get<{ Querystring: PlayerIdParam }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get complete player insights including SG Journey, Skill DNA, and Bounty Board',
        tags: ['player-insights'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: PlayerIdParam }>, reply: FastifyReply) => {
      const query = validate(playerIdParamSchema, request.query);

      // Get playerId from query or current user
      let playerId = query.playerId;
      if (!playerId && request.user) {
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return reply.status(400).send({
          success: false,
          error: 'Player ID required',
        });
      }

      const insights = await service.getPlayerInsights(request.tenant!.id, playerId);

      return reply.send({
        success: true,
        data: insights,
      });
    }
  );

  /**
   * GET /api/v1/player-insights/sg-journey
   * Get SG Journey data only
   */
  app.get<{ Querystring: PlayerIdParam }>(
    '/sg-journey',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get SG Journey - player position on path to PGA Elite',
        tags: ['player-insights'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: PlayerIdParam }>, reply: FastifyReply) => {
      const query = validate(playerIdParamSchema, request.query);

      let playerId = query.playerId;
      if (!playerId && request.user) {
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return reply.status(400).send({
          success: false,
          error: 'Player ID required',
        });
      }

      const sgJourney = await service.getSGJourney(request.tenant!.id, playerId);

      return reply.send({
        success: true,
        data: sgJourney,
      });
    }
  );

  /**
   * GET /api/v1/player-insights/skill-dna
   * Get Skill DNA profile only
   */
  app.get<{ Querystring: PlayerIdParam }>(
    '/skill-dna',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get Skill DNA - unique skill profile fingerprint',
        tags: ['player-insights'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: PlayerIdParam }>, reply: FastifyReply) => {
      const query = validate(playerIdParamSchema, request.query);

      let playerId = query.playerId;
      if (!playerId && request.user) {
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return reply.status(400).send({
          success: false,
          error: 'Player ID required',
        });
      }

      const skillDNA = await service.getSkillDNA(request.tenant!.id, playerId);

      return reply.send({
        success: true,
        data: skillDNA,
      });
    }
  );

  /**
   * GET /api/v1/player-insights/bounty-board
   * Get Bounty Board only
   */
  app.get<{ Querystring: PlayerIdParam }>(
    '/bounty-board',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get Bounty Board - gamified breaking point challenges',
        tags: ['player-insights'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: PlayerIdParam }>, reply: FastifyReply) => {
      const query = validate(playerIdParamSchema, request.query);

      let playerId = query.playerId;
      if (!playerId && request.user) {
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return reply.status(400).send({
          success: false,
          error: 'Player ID required',
        });
      }

      const bountyBoard = await service.getBountyBoard(request.tenant!.id, playerId);

      return reply.send({
        success: true,
        data: bountyBoard,
      });
    }
  );

  /**
   * POST /api/v1/player-insights/bounty/:bountyId/activate
   * Activate a bounty
   */
  app.post<{ Params: BountyIdParam; Querystring: PlayerIdParam }>(
    '/bounty/:bountyId/activate',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Activate a bounty to start working on it',
        tags: ['player-insights'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['bountyId'],
          properties: {
            bountyId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: BountyIdParam; Querystring: PlayerIdParam }>,
      reply: FastifyReply
    ) => {
      const { bountyId } = request.params;
      const query = validate(playerIdParamSchema, request.query);

      let playerId = query.playerId;
      if (!playerId && request.user) {
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return reply.status(400).send({
          success: false,
          error: 'Player ID required',
        });
      }

      const bounty = await service.activateBounty(request.tenant!.id, playerId, bountyId);

      if (!bounty) {
        return reply.status(404).send({
          success: false,
          error: 'Bounty not found',
        });
      }

      return reply.send({
        success: true,
        data: bounty,
      });
    }
  );

  /**
   * PUT /api/v1/player-insights/bounty/:bountyId/progress
   * Update bounty progress
   */
  app.put<{ Params: BountyIdParam; Body: UpdateProgressBody; Querystring: PlayerIdParam }>(
    '/bounty/:bountyId/progress',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update bounty progress with new measurement',
        tags: ['player-insights'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['bountyId'],
          properties: {
            bountyId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['newValue'],
          properties: {
            newValue: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: BountyIdParam; Body: UpdateProgressBody; Querystring: PlayerIdParam }>,
      reply: FastifyReply
    ) => {
      const { bountyId } = request.params;
      const { newValue } = validate(updateProgressSchema, request.body);
      const query = validate(playerIdParamSchema, request.query);

      let playerId = query.playerId;
      if (!playerId && request.user) {
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        return reply.status(400).send({
          success: false,
          error: 'Player ID required',
        });
      }

      const bounty = await service.updateBountyProgress(
        request.tenant!.id,
        playerId,
        bountyId,
        newValue
      );

      if (!bounty) {
        return reply.status(404).send({
          success: false,
          error: 'Bounty not found',
        });
      }

      return reply.send({
        success: true,
        data: bounty,
      });
    }
  );
}
