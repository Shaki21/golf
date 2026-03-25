/**
 * Focus Engine API Routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import {
  IngestionService,
  WeightsService,
  FocusEngineService,
} from '../../../domain/focus-engine';

// ============================================================================
// SCHEMAS
// ============================================================================

const ingestBodySchema = z.object({
  zipPath: z.string().optional(),
  forceReprocess: z.boolean().optional().default(false),
});

const computeWeightsBodySchema = z.object({
  windowSize: z.number().int().min(2).max(10).optional(),
  minPlayers: z.number().int().min(10).optional(),
});

const userIdParamSchema = z.object({
  userId: z.string().uuid(),
});

const teamFocusParamSchema = z.object({
  coachId: z.string().uuid(),
  teamId: z.string().uuid(),
});

const userFocusQuerySchema = z.object({
  includeApproachDetail: z.coerce.boolean().optional().default(false),
});

type IngestBody = z.infer<typeof ingestBodySchema>;
type ComputeWeightsBody = z.infer<typeof computeWeightsBodySchema>;
type UserIdParam = z.infer<typeof userIdParamSchema>;
type TeamFocusParam = z.infer<typeof teamFocusParamSchema>;
type UserFocusQuery = z.infer<typeof userFocusQuerySchema>;

// ============================================================================
// ROUTES
// ============================================================================

export async function focusEngineRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const ingestionService = new IngestionService(prisma);
  const weightsService = new WeightsService(prisma);
  const focusEngine = new FocusEngineService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];
  const adminPreHandlers = [...preHandlers]; // Could add admin role check

  // ============================================================================
  // INTERNAL/ADMIN ENDPOINTS
  // ============================================================================

  /**
   * POST /api/v1/focus-engine/internal/ingest
   * Trigger DataGolf data ingestion from Archive.zip
   * Admin only
   */
  app.post<{ Body: IngestBody }>(
    '/internal/ingest',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Ingest DataGolf data from Archive.zip',
        tags: ['focus-engine', 'admin'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            zipPath: { type: 'string', description: 'Optional custom path to zip file' },
            forceReprocess: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: IngestBody }>, reply: FastifyReply) => {
      // Check admin role
      if (request.user?.role !== 'admin') {
        return reply.status(403).send({ success: false, error: 'Admin access required' });
      }

      const body = validate(ingestBodySchema, request.body);
      const result = await ingestionService.ingest(body.zipPath);

      return reply.send({
        success: result.success,
        data: result,
      });
    }
  );

  /**
   * POST /api/v1/focus-engine/internal/compute-weights
   * Compute component weights from pro data
   * Admin only
   */
  app.post<{ Body: ComputeWeightsBody }>(
    '/internal/compute-weights',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Compute component weights from pro data variance',
        tags: ['focus-engine', 'admin'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            windowSize: { type: 'number', minimum: 2, maximum: 10, default: 3 },
            minPlayers: { type: 'number', minimum: 10, default: 100 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ComputeWeightsBody }>, reply: FastifyReply) => {
      if (request.user?.role !== 'admin') {
        return reply.status(403).send({ success: false, error: 'Admin access required' });
      }

      const body = validate(computeWeightsBodySchema, request.body);
      const weights = await weightsService.computeWeights(body);

      return reply.send({
        success: true,
        data: weights,
      });
    }
  );

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/focus-engine/weights
   * Get current component weights
   */
  app.get(
    '/weights',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get current component weights',
        tags: ['focus-engine'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  windowStartSeason: { type: 'number' },
                  windowEndSeason: { type: 'number' },
                  wOtt: { type: 'number' },
                  wApp: { type: 'number' },
                  wArg: { type: 'number' },
                  wPutt: { type: 'number' },
                  computedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const weights = await weightsService.getCurrentWeights();

      if (!weights) {
        return reply.status(404).send({
          success: false,
          error: 'No weights computed yet. Run ingestion first.',
        });
      }

      return reply.send({
        success: true,
        data: weights,
      });
    }
  );

  /**
   * GET /api/v1/focus-engine/users/:userId/focus
   * Get focus recommendation for a user
   */
  app.get<{ Params: UserIdParam; Querystring: UserFocusQuery }>(
    '/users/:userId/focus',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get focus recommendation for a player',
        tags: ['focus-engine'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            includeApproachDetail: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  playerId: { type: 'string' },
                  playerName: { type: 'string' },
                  focusComponent: { type: 'string', enum: ['OTT', 'APP', 'ARG', 'PUTT'] },
                  focusScores: { type: 'object', additionalProperties: true },
                  recommendedSplit: { type: 'object', additionalProperties: true },
                  reasonCodes: { type: 'array', items: { type: 'string' } },
                  confidence: { type: 'string', enum: ['low', 'med', 'high'] },
                  approachWeakestBucket: { type: 'string', nullable: true },
                  computedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: UserIdParam; Querystring: UserFocusQuery }>,
      reply: FastifyReply
    ) => {
      const params = validate(userIdParamSchema, request.params);
      const query = validate(userFocusQuerySchema, request.query);

      const focus = await focusEngine.calculatePlayerFocus(
        request.tenant!.id,
        params.userId,
        query.includeApproachDetail
      );

      return reply.send({
        success: true,
        data: focus,
      });
    }
  );

  /**
   * GET /api/v1/focus-engine/me/focus
   * Get focus recommendation for current user
   */
  app.get<{ Querystring: UserFocusQuery }>(
    '/me/focus',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get focus recommendation for current user',
        tags: ['focus-engine'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            includeApproachDetail: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                additionalProperties: true,
                properties: {
                  playerId: { type: 'string' },
                  playerName: { type: 'string' },
                  focusComponent: { type: 'string', enum: ['OTT', 'APP', 'ARG', 'PUTT'] },
                  focusScores: { type: 'object', additionalProperties: true },
                  recommendedSplit: { type: 'object', additionalProperties: true },
                  reasonCodes: { type: 'array', items: { type: 'string' } },
                  confidence: { type: 'string', enum: ['low', 'med', 'high'] },
                  computedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: UserFocusQuery }>, reply: FastifyReply) => {
      const query = validate(userFocusQuerySchema, request.query);

      if (!request.user?.id) {
        return reply.status(401).send({ success: false, error: 'Not authenticated' });
      }

      const focus = await focusEngine.calculatePlayerFocus(
        request.tenant!.id,
        request.user.id,
        query.includeApproachDetail
      );

      return reply.send({
        success: true,
        data: focus,
      });
    }
  );

  /**
   * GET /api/v1/focus-engine/coaches/:coachId/teams/:teamId/focus
   * Get team focus heatmap for a coach
   */
  app.get<{ Params: TeamFocusParam }>(
    '/coaches/:coachId/teams/:teamId/focus',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get team focus heatmap for a coach',
        tags: ['focus-engine'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['coachId', 'teamId'],
          properties: {
            coachId: { type: 'string', format: 'uuid' },
            teamId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  teamId: { type: 'string' },
                  coachId: { type: 'string' },
                  playerCount: { type: 'number' },
                  heatmap: { type: 'object', additionalProperties: true },
                  topReasonCodes: { type: 'array', items: { type: 'string' } },
                  atRiskPlayers: { type: 'array', items: { type: 'object', additionalProperties: true } },
                  computedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TeamFocusParam }>, reply: FastifyReply) => {
      const params = validate(teamFocusParamSchema, request.params);

      // Verify user is the coach or admin
      const isCoach = request.user?.role === 'coach';
      const isAdmin = request.user?.role === 'admin';

      if (!isCoach && !isAdmin) {
        return reply.status(403).send({ success: false, error: 'Coach or admin access required' });
      }

      const teamFocus = await focusEngine.calculateTeamFocus(
        request.tenant!.id,
        params.coachId,
        params.teamId
      );

      return reply.send({
        success: true,
        data: teamFocus,
      });
    }
  );

  /**
   * GET /api/v1/focus-engine/stats
   * Get ingestion stats
   */
  app.get(
    '/stats',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get ingestion statistics',
        tags: ['focus-engine'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  playerSeasons: { type: 'number' },
                  approachSkills: { type: 'number' },
                  weightsComputed: { type: 'number' },
                  currentWeights: { type: 'object', additionalProperties: true, nullable: true },
                  latestSeason: { type: 'number', nullable: true },
                },
              },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const [playerSeasonCount, approachSkillCount, weightsCount] = await Promise.all([
        prisma.dgPlayerSeason.count(),
        prisma.dgApproachSkillL24.count(),
        prisma.dgComponentWeight.count(),
      ]);

      const latestWeight = await weightsService.getCurrentWeights();
      const latestSeason = await prisma.dgPlayerSeason.aggregate({
        _max: { season: true },
      });

      return reply.send({
        success: true,
        data: {
          playerSeasons: playerSeasonCount,
          approachSkills: approachSkillCount,
          weightsComputed: weightsCount,
          currentWeights: latestWeight,
          latestSeason: latestSeason._max.season,
        },
      });
    }
  );
}
