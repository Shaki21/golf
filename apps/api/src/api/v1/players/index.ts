import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PlayerService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createPlayerSchema,
  updatePlayerSchema,
  listPlayersQuerySchema,
  playerIdParamSchema,
  weeklySummaryQuerySchema,
  playerOnboardingSchema,
  CreatePlayerInput,
  UpdatePlayerInput,
  ListPlayersQuery,
  PlayerIdParam,
  WeeklySummaryQuery,
  PlayerOnboardingInput,
} from './schema';
import { authenticateUser, requireAdmin } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import { playerAnnualPlanRoutes } from './annual-plan-routes';

// Convert Zod schemas to JSON Schema once at module level

/**
 * Register player routes
 */
export async function playerRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const playerService = new PlayerService(prisma);

  // All routes require authentication and tenant context
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new player
   */
  app.post<{ Body: CreatePlayerInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new player',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreatePlayerInput }>, reply: FastifyReply) => {
      const input = validate(createPlayerSchema, request.body);
      const player = await playerService.createPlayer(request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: player });
    }
  );

  /**
   * List players with filters and pagination
   */
  app.get<{ Querystring: ListPlayersQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List players with filters and pagination',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  players: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        tenantId: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        category: { type: 'string' },
                        status: { type: 'string' },
                      },
                    },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number' },
                      limit: { type: 'number' },
                      total: { type: 'number' },
                      totalPages: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListPlayersQuery }>, reply: FastifyReply) => {
      const query = validate(listPlayersQuerySchema, request.query);
      const result = await playerService.listPlayers(request.tenant!.id, query);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get current player profile
   */
  app.get(
    '/profile',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get current player profile',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  handicap: { type: 'number', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Get playerId from authenticated user context
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({
          success: false,
          error: 'Player ID not found in user context'
        });
      }
      const player = await playerService.getPlayerById(request.tenant!.id, playerId);
      return reply.send({ success: true, data: player });
    }
  );

  /**
   * Get player by ID
   */
  app.get<{ Params: PlayerIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player by ID',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  handicap: { type: 'number', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);
      const player = await playerService.getPlayerById(request.tenant!.id, params.id);
      return reply.send({ success: true, data: player });
    }
  );

  /**
   * Update player
   */
  app.patch<{ Params: PlayerIdParam; Body: UpdatePlayerInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update player',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam; Body: UpdatePlayerInput }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);
      const input = validate(updatePlayerSchema, request.body);
      const player = await playerService.updatePlayer(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: player });
    }
  );

  /**
   * Delete player
   */
  app.delete<{ Params: PlayerIdParam }>(
    '/:id',
    {
      preHandler: [...preHandlers, requireAdmin],
      schema: {
        description: 'Delete player',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Player deleted successfully' },
            },
          },
          403: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);
      await playerService.deletePlayer(request.tenant!.id, params.id);
      return reply.send({ success: true, message: 'Player deleted successfully' });
    }
  );

  /**
   * Get player's weekly summary
   */
  app.get<{ Params: PlayerIdParam; Querystring: WeeklySummaryQuery }>(
    '/:id/weekly-summary',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player weekly summary (training, tests, breaking points)',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  player: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      category: { type: 'string' },
                    },
                  },
                  week: {
                    type: 'object',
                    properties: {
                      start: { type: 'string' },
                      end: { type: 'string' },
                    },
                  },
                  training: {
                    type: 'object',
                    properties: {
                      totalHours: { type: 'number' },
                      sessionsCompleted: { type: 'number' },
                      plannedHours: { type: 'number' },
                    },
                  },
                  tests: {
                    type: 'object',
                    properties: {
                      completed: { type: 'number' },
                      improvements: { type: 'number' },
                    },
                  },
                  breakingPoints: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      completed: { type: 'number' },
                      inProgress: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam; Querystring: WeeklySummaryQuery }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);
      const query = validate(weeklySummaryQuerySchema, request.query);
      const summary = await playerService.getWeeklySummary(
        request.tenant!.id,
        params.id,
        query.weekStart
      );
      return reply.send({ success: true, data: summary });
    }
  );

  /**
   * Complete player onboarding
   */
  app.post<{ Body: PlayerOnboardingInput }>(
    '/onboarding',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Complete player onboarding with profile information',
        tags: ['players'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  handicap: { type: 'number', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PlayerOnboardingInput }>, reply: FastifyReply) => {
      const input = validate(playerOnboardingSchema, request.body);

      // Get playerId from authenticated user context
      const playerId = request.user?.playerId;
      if (!playerId) {
        return reply.code(401).send({
          success: false,
          error: 'Player ID not found in user context'
        });
      }

      const player = await playerService.completeOnboarding(
        request.tenant!.id,
        playerId,
        input
      );
      return reply.send({ success: true, data: player });
    }
  );

  // Register player annual plan routes
  await playerAnnualPlanRoutes(app);
}
