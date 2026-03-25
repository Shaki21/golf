import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CoachService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createCoachSchema,
  updateCoachSchema,
  listCoachesQuerySchema,
  coachIdParamSchema,
  availabilityQuerySchema,
  CreateCoachInput,
  UpdateCoachInput,
  ListCoachesQuery,
  CoachIdParam,
  AvailabilityQuery,
} from './schema';
import { authenticateUser, requireAdmin } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// Convert Zod schemas to JSON Schema once at module level

/**
 * Register coach routes
 */
export async function coachRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const coachService = new CoachService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new coach
   */
  app.post<{ Body: CreateCoachInput }>(
    '/',
    {
      preHandler: [...preHandlers, requireAdmin],
      schema: {
        description: 'Create a new coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          403: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateCoachInput }>, reply: FastifyReply) => {
      const input = validate(createCoachSchema, request.body);
      const coach = await coachService.createCoach(request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: coach });
    }
  );

  /**
   * List coaches with filters and pagination
   */
  app.get<{ Querystring: ListCoachesQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List coaches with filters and pagination',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListCoachesQuery }>, reply: FastifyReply) => {
      const query = validate(listCoachesQuerySchema, request.query);
      const result = await coachService.listCoaches(request.tenant!.id, query);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get coach by ID
   */
  app.get<{ Params: CoachIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get coach by ID',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CoachIdParam }>, reply: FastifyReply) => {
      const params = validate(coachIdParamSchema, request.params);
      const coach = await coachService.getCoachById(request.tenant!.id, params.id);
      return reply.send({ success: true, data: coach });
    }
  );

  /**
   * Update coach
   */
  app.patch<{ Params: CoachIdParam; Body: UpdateCoachInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CoachIdParam; Body: UpdateCoachInput }>, reply: FastifyReply) => {
      const params = validate(coachIdParamSchema, request.params);
      const input = validate(updateCoachSchema, request.body);
      const coach = await coachService.updateCoach(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: coach });
    }
  );

  /**
   * Delete coach
   */
  app.delete<{ Params: CoachIdParam }>(
    '/:id',
    {
      preHandler: [...preHandlers, requireAdmin],
      schema: {
        description: 'Delete coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Coach deleted successfully' },
            },
          },
          403: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CoachIdParam }>, reply: FastifyReply) => {
      const params = validate(coachIdParamSchema, request.params);
      await coachService.deleteCoach(request.tenant!.id, params.id);
      return reply.send({ success: true, message: 'Coach deleted successfully' });
    }
  );

  /**
   * Get coach availability
   */
  app.get<{ Params: CoachIdParam; Querystring: AvailabilityQuery }>(
    '/:id/availability',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get coach availability for a date range',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CoachIdParam; Querystring: AvailabilityQuery }>, reply: FastifyReply) => {
      const params = validate(coachIdParamSchema, request.params);
      const query = validate(availabilityQuerySchema, request.query);
      const availability = await coachService.getAvailability(
        request.tenant!.id,
        params.id,
        query.startDate,
        query.endDate
      );
      return reply.send({ success: true, data: availability });
    }
  );

  /**
   * Get coach statistics
   */
  app.get<{ Params: CoachIdParam }>(
    '/:id/statistics',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get coach statistics (players, sessions)',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CoachIdParam }>, reply: FastifyReply) => {
      const params = validate(coachIdParamSchema, request.params);
      const statistics = await coachService.getStatistics(request.tenant!.id, params.id);
      return reply.send({ success: true, data: statistics });
    }
  );

  /**
   * Get coach's players
   */
  app.get<{ Params: CoachIdParam }>(
    '/:id/players',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all players assigned to this coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CoachIdParam }>, reply: FastifyReply) => {
      const params = validate(coachIdParamSchema, request.params);
      const players = await coachService.getCoachPlayers(request.tenant!.id, params.id);
      return reply.send({ success: true, data: players });
    }
  );

  /**
   * Get current coach's players (uses auth user)
   */
  app.get(
    '/me/players',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all players assigned to the authenticated coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }
      const players = await coachService.getCoachPlayers(request.tenant!.id, coachId);
      return reply.send({ success: true, data: players });
    }
  );

  /**
   * Assign a player to the authenticated coach
   */
  app.post<{ Params: { playerId: string } }>(
    '/me/players/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Assign a player to the authenticated coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          403: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { playerId: string } }>, reply: FastifyReply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }
      const player = await coachService.assignPlayerToCoach(
        request.tenant!.id,
        coachId,
        request.params.playerId
      );
      return reply.send({ success: true, data: player });
    }
  );

  /**
   * Unassign a player from the authenticated coach
   */
  app.delete<{ Params: { playerId: string } }>(
    '/me/players/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Unassign a player from the authenticated coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          403: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { playerId: string } }>, reply: FastifyReply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }
      await coachService.unassignPlayerFromCoach(
        request.tenant!.id,
        coachId,
        request.params.playerId
      );
      return reply.send({ success: true, message: 'Player unassigned successfully' });
    }
  );

  /**
   * Get available players (without a coach) for assignment
   */
  app.get<{ Querystring: { search?: string } }>(
    '/available-players',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get players without a coach, available for assignment',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search by name or email' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { search?: string } }>, reply: FastifyReply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }
      const players = await coachService.getAvailablePlayers(
        request.tenant!.id,
        request.query.search
      );
      return reply.send({ success: true, data: players });
    }
  );

  /**
   * Get current coach's alerts (uses auth user)
   */
  app.get<{ Querystring: { unread?: boolean } }>(
    '/me/alerts',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get alerts for the authenticated coach',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            unread: { type: 'boolean' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { unread?: boolean } }>, reply: FastifyReply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }
      const unreadOnly = request.query.unread === true;
      const alerts = await coachService.getCoachAlerts(request.tenant!.id, coachId, unreadOnly);
      return reply.send({ success: true, data: { alerts } });
    }
  );

  /**
   * Dismiss an alert
   */
  app.put<{ Params: { alertId: string } }>(
    '/alerts/:alertId/dismiss',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Mark an alert as dismissed/read',
        tags: ['coaches'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['alertId'],
          properties: {
            alertId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (_request: FastifyRequest<{ Params: { alertId: string } }>, reply: FastifyReply) => {
      // For now, we just acknowledge - alerts are generated dynamically
      return reply.send({ success: true, message: 'Alert dismissed' });
    }
  );

  // =========================================================================
  // BATCH OPERATIONS
  // =========================================================================

  /**
   * Batch assign training session to multiple players
   */
  app.post<{
    Body: {
      playerIds: string[];
      sessionType: string;
      scheduledDate: string;
      durationMinutes?: number;
      notes?: string;
    };
  }>(
    '/me/batch/assign-session',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Assign a training session to multiple players',
        tags: ['coaches', 'batch'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerIds', 'sessionType', 'scheduledDate'],
          properties: {
            playerIds: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 },
            sessionType: { type: 'string', minLength: 1 },
            scheduledDate: { type: 'string', format: 'date' },
            durationMinutes: { type: 'number', minimum: 1 },
            notes: { type: 'string' },
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
                  success: { type: 'array', items: { type: 'string' } },
                  failed: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        playerId: { type: 'string' },
                        error: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request, reply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }

      const { playerIds, ...session } = request.body;
      const result = await coachService.batchAssignSession(
        request.tenant!.id,
        coachId,
        playerIds,
        session
      );

      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Batch send notes to multiple players
   */
  app.post<{
    Body: {
      playerIds: string[];
      title: string;
      content: string;
      category?: string;
    };
  }>(
    '/me/batch/send-note',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Send a note to multiple players',
        tags: ['coaches', 'batch'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerIds', 'title', 'content'],
          properties: {
            playerIds: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 },
            title: { type: 'string', minLength: 1 },
            content: { type: 'string', minLength: 1 },
            category: { type: 'string' },
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
                  success: { type: 'array', items: { type: 'string' } },
                  failed: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        playerId: { type: 'string' },
                        error: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request, reply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }

      const { playerIds, ...note } = request.body;
      const result = await coachService.batchSendNote(
        request.tenant!.id,
        coachId,
        playerIds,
        note
      );

      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Batch update player status
   */
  app.post<{
    Body: {
      playerIds: string[];
      status: 'active' | 'inactive' | 'on_break';
    };
  }>(
    '/me/batch/update-status',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update status for multiple players',
        tags: ['coaches', 'batch'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerIds', 'status'],
          properties: {
            playerIds: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 },
            status: { type: 'string', enum: ['active', 'inactive', 'on_break'] },
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
                  success: { type: 'array', items: { type: 'string' } },
                  failed: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        playerId: { type: 'string' },
                        error: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request, reply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }

      const { playerIds, status } = request.body;
      const result = await coachService.batchUpdateStatus(
        request.tenant!.id,
        coachId,
        playerIds,
        status
      );

      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Batch create training plan from template
   */
  app.post<{
    Body: {
      playerIds: string[];
      planName: string;
      startDate: string;
      durationWeeks: number;
      focusAreas?: string[];
    };
  }>(
    '/me/batch/create-plan',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create training plans for multiple players',
        tags: ['coaches', 'batch'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerIds', 'planName', 'startDate', 'durationWeeks'],
          properties: {
            playerIds: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 },
            planName: { type: 'string', minLength: 1 },
            startDate: { type: 'string', format: 'date' },
            durationWeeks: { type: 'number', minimum: 1, maximum: 52 },
            focusAreas: { type: 'array', items: { type: 'string' } },
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
                  success: { type: 'array', items: { type: 'string' } },
                  failed: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        playerId: { type: 'string' },
                        error: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (request, reply) => {
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: { message: 'Not a coach' } });
      }

      const { playerIds, ...planOptions } = request.body;
      const result = await coachService.batchCreatePlanFromTemplate(
        request.tenant!.id,
        coachId,
        playerIds,
        planOptions
      );

      return reply.send({ success: true, data: result });
    }
  );
}
