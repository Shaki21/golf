import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SamlingService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createSamlingSchema,
  updateSamlingSchema,
  listSamlingerQuerySchema,
  samlingIdParamSchema,
  addParticipantsSchema,
  updateParticipantStatusSchema,
  playerIdParamSchema,
  createSessionSchema,
  updateSessionSchema,
  sessionIdParamSchema,
  recordAttendanceSchema,
  CreateSamlingInput,
  UpdateSamlingInput,
  ListSamlingerQuery,
  SamlingIdParam,
  AddParticipantsInput,
  UpdateParticipantStatusInput,
  PlayerIdParam,
  CreateSessionInput,
  UpdateSessionInput,
  SessionIdParam,
  RecordAttendanceInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

/**
 * Register samling routes
 */
export async function samlingRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const samlingService = new SamlingService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  // ==========================================================================
  // SAMLING CRUD
  // ==========================================================================

  /**
   * Create a new samling
   */
  app.post<{ Body: CreateSamlingInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateSamlingInput }>, reply: FastifyReply) => {
      const input = validate(createSamlingSchema, request.body);

      // Get coach ID from the authenticated user
      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: 'Only coaches can create samlinger' });
      }

      const samling = await samlingService.createSamling(request.tenant!.id, coachId, input);
      return reply.code(201).send({ success: true, data: samling });
    }
  );

  /**
   * List samlinger with filters
   */
  app.get<{ Querystring: ListSamlingerQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List samlinger with filters',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListSamlingerQuery }>, reply: FastifyReply) => {
      const query = validate(listSamlingerQuerySchema, request.query);

      const coachId = request.user?.coachId;
      if (!coachId) {
        return reply.code(403).send({ success: false, error: 'Only coaches can list samlinger' });
      }

      const result = await samlingService.listSamlinger(request.tenant!.id, coachId, query);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get samling by ID
   */
  app.get<{ Params: SamlingIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get samling by ID',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const samling = await samlingService.getSamling(params.id, request.tenant!.id);
      return reply.send({ success: true, data: samling });
    }
  );

  /**
   * Update samling
   */
  app.put<{ Params: SamlingIdParam; Body: UpdateSamlingInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam; Body: UpdateSamlingInput }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const input = validate(updateSamlingSchema, request.body);
      const samling = await samlingService.updateSamling(params.id, request.tenant!.id, input);
      return reply.send({ success: true, data: samling });
    }
  );

  /**
   * Delete samling
   */
  app.delete<{ Params: SamlingIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete samling (only draft)',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Samling deleted successfully' },
            },
          },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      await samlingService.deleteSamling(params.id, request.tenant!.id);
      return reply.send({ success: true, message: 'Samling deleted successfully' });
    }
  );

  // ==========================================================================
  // STATUS TRANSITIONS
  // ==========================================================================

  /**
   * Publish samling and sync to participants
   */
  app.post<{ Params: SamlingIdParam }>(
    '/:id/publish',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Publish samling and sync to participants',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const result = await samlingService.publishSamling(params.id, request.tenant!.id);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Cancel samling
   */
  app.post<{ Params: SamlingIdParam }>(
    '/:id/cancel',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Cancel samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const samling = await samlingService.cancelSamling(params.id, request.tenant!.id);
      return reply.send({ success: true, data: samling });
    }
  );

  /**
   * Complete samling
   */
  app.post<{ Params: SamlingIdParam }>(
    '/:id/complete',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Mark samling as completed',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const samling = await samlingService.completeSamling(params.id, request.tenant!.id);
      return reply.send({ success: true, data: samling });
    }
  );

  // ==========================================================================
  // PARTICIPANTS
  // ==========================================================================

  /**
   * Add participants to samling
   */
  app.post<{ Params: SamlingIdParam; Body: AddParticipantsInput }>(
    '/:id/participants',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Add participants to samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam; Body: AddParticipantsInput }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const input = validate(addParticipantsSchema, request.body);
      const participants = await samlingService.addParticipants(params.id, request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: participants });
    }
  );

  /**
   * Get participants
   */
  app.get<{ Params: SamlingIdParam }>(
    '/:id/participants',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get participants for samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const participants = await samlingService.getParticipants(params.id, request.tenant!.id);
      return reply.send({ success: true, data: participants });
    }
  );

  /**
   * Remove participant
   */
  app.delete<{ Params: SamlingIdParam & PlayerIdParam }>(
    '/:id/participants/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Remove participant from samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Participant removed successfully' },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam & PlayerIdParam }>, reply: FastifyReply) => {
      const samlingParams = validate(samlingIdParamSchema, { id: request.params.id });
      const playerParams = validate(playerIdParamSchema, { playerId: request.params.playerId });
      await samlingService.removeParticipant(samlingParams.id, playerParams.playerId, request.tenant!.id);
      return reply.send({ success: true, message: 'Participant removed successfully' });
    }
  );

  /**
   * Update participant status
   */
  app.put<{ Params: SamlingIdParam & PlayerIdParam; Body: UpdateParticipantStatusInput }>(
    '/:id/participants/:playerId/status',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update participant invitation status',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam & PlayerIdParam; Body: UpdateParticipantStatusInput }>, reply: FastifyReply) => {
      const samlingParams = validate(samlingIdParamSchema, { id: request.params.id });
      const playerParams = validate(playerIdParamSchema, { playerId: request.params.playerId });
      const input = validate(updateParticipantStatusSchema, request.body);
      const participant = await samlingService.updateParticipantStatus(
        samlingParams.id,
        playerParams.playerId,
        request.tenant!.id,
        input
      );
      return reply.send({ success: true, data: participant });
    }
  );

  // ==========================================================================
  // SESSIONS
  // ==========================================================================

  /**
   * Create session
   */
  app.post<{ Params: SamlingIdParam; Body: CreateSessionInput }>(
    '/:id/sessions',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a session in samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam; Body: CreateSessionInput }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const input = validate(createSessionSchema, request.body);
      const session = await samlingService.createSession(params.id, request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: session });
    }
  );

  /**
   * Get sessions
   */
  app.get<{ Params: SamlingIdParam }>(
    '/:id/sessions',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get sessions for samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const sessions = await samlingService.getSessions(params.id, request.tenant!.id);
      return reply.send({ success: true, data: sessions });
    }
  );

  /**
   * Update session
   */
  app.put<{ Params: SamlingIdParam & SessionIdParam; Body: UpdateSessionInput }>(
    '/:id/sessions/:sessionId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update a session',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam & SessionIdParam; Body: UpdateSessionInput }>, reply: FastifyReply) => {
      const samlingParams = validate(samlingIdParamSchema, { id: request.params.id });
      const sessionParams = validate(sessionIdParamSchema, { sessionId: request.params.sessionId });
      const input = validate(updateSessionSchema, request.body);
      const session = await samlingService.updateSession(
        samlingParams.id,
        sessionParams.sessionId,
        request.tenant!.id,
        input
      );
      return reply.send({ success: true, data: session });
    }
  );

  /**
   * Delete session
   */
  app.delete<{ Params: SamlingIdParam & SessionIdParam }>(
    '/:id/sessions/:sessionId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete a session',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Session deleted successfully' },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam & SessionIdParam }>, reply: FastifyReply) => {
      const samlingParams = validate(samlingIdParamSchema, { id: request.params.id });
      const sessionParams = validate(sessionIdParamSchema, { sessionId: request.params.sessionId });
      await samlingService.deleteSession(samlingParams.id, sessionParams.sessionId, request.tenant!.id);
      return reply.send({ success: true, message: 'Session deleted successfully' });
    }
  );

  // ==========================================================================
  // CALENDAR
  // ==========================================================================

  /**
   * Get calendar view
   */
  app.get<{ Params: SamlingIdParam }>(
    '/:id/calendar',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get calendar view of samling sessions',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const calendar = await samlingService.getCalendarView(params.id, request.tenant!.id);
      return reply.send({ success: true, data: calendar });
    }
  );

  /**
   * Manual sync
   */
  app.post<{ Params: SamlingIdParam }>(
    '/:id/sync',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Manually sync samling sessions to participants',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const results = await samlingService.manualSync(params.id, request.tenant!.id);
      return reply.send({ success: true, data: results });
    }
  );

  // ==========================================================================
  // ATTENDANCE
  // ==========================================================================

  /**
   * Record attendance
   */
  app.post<{ Params: SamlingIdParam & SessionIdParam; Body: RecordAttendanceInput }>(
    '/:id/sessions/:sessionId/attendance',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Record attendance for a session',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam & SessionIdParam; Body: RecordAttendanceInput }>, reply: FastifyReply) => {
      const samlingParams = validate(samlingIdParamSchema, { id: request.params.id });
      const sessionParams = validate(sessionIdParamSchema, { sessionId: request.params.sessionId });
      const input = validate(recordAttendanceSchema, request.body);
      const attendance = await samlingService.recordAttendance(
        samlingParams.id,
        sessionParams.sessionId,
        request.tenant!.id,
        input
      );
      return reply.send({ success: true, data: attendance });
    }
  );

  /**
   * Get attendance overview
   */
  app.get<{ Params: SamlingIdParam }>(
    '/:id/attendance',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get attendance overview for samling',
        tags: ['samling'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: SamlingIdParam }>, reply: FastifyReply) => {
      const params = validate(samlingIdParamSchema, request.params);
      const overview = await samlingService.getAttendanceOverview(params.id, request.tenant!.id);
      return reply.send({ success: true, data: overview });
    }
  );
}
