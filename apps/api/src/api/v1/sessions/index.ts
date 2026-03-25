import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SessionService } from './service';
import {
  UpdateSessionInput,
  SessionEvaluationInput,
  CompleteSessionInput,
  SessionIdParam,
  PREDEFINED_TECHNICAL_CUES,
  listSessionsQuerySchema,
  playerSessionsQuerySchema,
  createSessionSchema,
} from './schema';
import { authenticateUser, requireCoach } from '../../../middleware/auth';
import { getPrismaClient } from '../../../core/db/prisma';
import { authorizationError } from '../../../core/errors';
import { validate } from '../../../utils/validation';

const sessionService = new SessionService(getPrismaClient());

export default async function sessionRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook('preHandler', authenticateUser);

  // ============================================================================
  // SESSION CRUD ENDPOINTS
  // ============================================================================

  /**
   * Create a new training session
   * POST /sessions
   */
  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new training session',
        tags: ['sessions'],
        response: {
          201: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user!;
      const body = request.body as any;

      let playerId: string;
      const coachId: string | null = null;

      if (user.role === 'player') {
        // Player creating their own session
        if (!user.playerId) {
          throw authorizationError('Player ID not found in token');
        }
        playerId = user.playerId;
      } else if (user.role === 'coach' || user.role === 'admin') {
        // Coach/admin must specify playerId in body
        if (!body.playerId) {
          throw authorizationError('playerId is required for coach/admin');
        }
        playerId = body.playerId;
        // Get coach ID from database (would need to look up by userId)
        // For now, we'll leave coachId as null and handle it separately
      } else {
        throw authorizationError('Invalid role for creating sessions');
      }

      // Validate the session data
      const input = validate(createSessionSchema, body);

      const session = await sessionService.createSession(playerId, coachId, input);
      return reply.code(201).send({
        success: true,
        data: session,
      });
    }
  );

  /**
   * List sessions with filters (coach/admin only)
   * GET /sessions
   */
  fastify.get(
    '/',
    {
      preHandler: requireCoach,
      schema: {
        description: 'List training sessions with filters',
        tags: ['sessions'],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = validate(listSessionsQuerySchema, request.query);
      const result = await sessionService.listSessions(query);
      return reply.code(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * Get player's own sessions
   * GET /sessions/my
   */
  fastify.get(
    '/my',
    {
      schema: {
        description: 'Get authenticated player\'s sessions',
        tags: ['sessions'],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user!;

      if (!user.playerId) {
        throw authorizationError('Only players can access this endpoint');
      }

      const query = validate(playerSessionsQuerySchema, request.query);
      const result = await sessionService.getPlayerSessions(user.playerId, query);
      return reply.code(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * Get in-progress sessions for player
   * GET /sessions/in-progress
   */
  fastify.get(
    '/in-progress',
    {
      schema: {
        description: 'Get player\'s in-progress sessions',
        tags: ['sessions'],
        response: {
          200: { type: 'array' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user!;

      if (!user.playerId) {
        throw authorizationError('Only players can access this endpoint');
      }

      const sessions = await sessionService.getInProgressSessions(user.playerId);
      return reply.code(200).send({
        success: true,
        data: sessions,
      });
    }
  );

  /**
   * Get predefined technical cues
   * GET /sessions/technical-cues
   */
  fastify.get(
    '/technical-cues',
    {
      schema: {
        description: 'Get list of predefined technical cues',
        tags: ['sessions'],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({
        success: true,
        data: [...PREDEFINED_TECHNICAL_CUES],
      });
    }
  );

  /**
   * Get session by ID
   * GET /sessions/:id
   */
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get training session by ID',
        tags: ['sessions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as SessionIdParam;
      const session = await sessionService.getSessionById(id);

      // Authorization: Players can only view their own sessions
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== session.playerId) {
        throw authorizationError('You can only view your own sessions');
      }

      return reply.code(200).send({
        success: true,
        data: session,
      });
    }
  );

  /**
   * Update session
   * PATCH /sessions/:id
   */
  fastify.patch(
    '/:id',
    {
      schema: {
        description: 'Update training session',
        tags: ['sessions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as SessionIdParam;
      const input = request.body as UpdateSessionInput;

      // Check ownership
      const session = await sessionService.getSessionById(id);
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== session.playerId) {
        throw authorizationError('You can only update your own sessions');
      }

      const updated = await sessionService.updateSession(id, input);
      return reply.code(200).send({
        success: true,
        data: updated,
      });
    }
  );

  /**
   * Delete session
   * DELETE /sessions/:id
   */
  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete training session',
        tags: ['sessions'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as SessionIdParam;

      // Check ownership
      const session = await sessionService.getSessionById(id);
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== session.playerId) {
        throw authorizationError('You can only delete your own sessions');
      }

      await sessionService.deleteSession(id);
      return reply.code(200).send({ success: true, message: 'Session deleted' });
    }
  );

  // ============================================================================
  // EVALUATION ENDPOINTS
  // ============================================================================

  /**
   * Update session evaluation (save progress)
   * PATCH /sessions/:id/evaluation
   */
  fastify.patch(
    '/:id/evaluation',
    {
      schema: {
        description: 'Update session evaluation (save progress)',
        tags: ['sessions', 'evaluation'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as SessionIdParam;
      const input = request.body as SessionEvaluationInput;

      // Check ownership
      const session = await sessionService.getSessionById(id);
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== session.playerId) {
        throw authorizationError('You can only evaluate your own sessions');
      }

      const updated = await sessionService.updateEvaluation(id, input);
      return reply.code(200).send({
        success: true,
        data: updated,
      });
    }
  );

  /**
   * Complete session with final evaluation
   * POST /sessions/:id/complete
   */
  fastify.post(
    '/:id/complete',
    {
      schema: {
        description: 'Complete session with final evaluation',
        tags: ['sessions', 'evaluation'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as SessionIdParam;
      const input = request.body as CompleteSessionInput;

      // Check ownership
      const session = await sessionService.getSessionById(id);
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== session.playerId) {
        throw authorizationError('You can only complete your own sessions');
      }

      const completed = await sessionService.completeSession(id, input);
      return reply.code(200).send({
        success: true,
        data: completed,
      });
    }
  );

  /**
   * Auto-complete session (timeout)
   * POST /sessions/:id/auto-complete
   */
  fastify.post(
    '/:id/auto-complete',
    {
      schema: {
        description: 'Auto-complete a session (timeout)',
        tags: ['sessions', 'evaluation'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as SessionIdParam;

      // Check ownership
      const session = await sessionService.getSessionById(id);
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== session.playerId) {
        throw authorizationError('You can only auto-complete your own sessions');
      }

      const completed = await sessionService.autoCompleteSession(id);
      return reply.code(200).send({
        success: true,
        data: completed,
      });
    }
  );

  // ============================================================================
  // STATISTICS ENDPOINTS
  // ============================================================================

  /**
   * Get evaluation statistics for player
   * GET /sessions/stats/evaluation
   */
  fastify.get(
    '/stats/evaluation',
    {
      schema: {
        description: 'Get evaluation statistics for authenticated player',
        tags: ['sessions', 'statistics'],
        querystring: {
          type: 'object',
          properties: {
            fromDate: { type: 'string' },
            toDate: { type: 'string' },
            playerId: { type: 'string' }, // For coach/admin
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user!;
      const query = request.query as { fromDate?: string; toDate?: string; playerId?: string };

      let playerId: string;

      if (user.role === 'player') {
        if (!user.playerId) {
          throw authorizationError('Player ID not found');
        }
        playerId = user.playerId;
      } else if (user.role === 'coach' || user.role === 'admin') {
        if (!query.playerId) {
          throw authorizationError('playerId query parameter required for coach/admin');
        }
        playerId = query.playerId;
      } else {
        throw authorizationError('Invalid role');
      }

      const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
      const toDate = query.toDate ? new Date(query.toDate) : undefined;

      const stats = await sessionService.getPlayerEvaluationStats(playerId, fromDate, toDate);
      return reply.code(200).send({
        success: true,
        data: stats,
      });
    }
  );

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * Batch auto-complete stale sessions (admin/cron job)
   * POST /sessions/admin/batch-auto-complete
   */
  fastify.post(
    '/admin/batch-auto-complete',
    {
      preHandler: requireCoach, // Could be admin-only
      schema: {
        description: 'Batch auto-complete stale sessions',
        tags: ['sessions', 'admin'],
        body: {
          type: 'object',
          properties: {
            timeoutMinutes: { type: 'number', default: 15 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              count: { type: 'number' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { timeoutMinutes = 15 } = request.body as { timeoutMinutes?: number };
      const count = await sessionService.batchAutoComplete(timeoutMinutes);
      return reply.code(200).send({
        count,
        message: `Auto-completed ${count} stale sessions`,
      });
    }
  );
}
