import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';

const sessionsRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // In-memory cache for idempotency (short-lived)
  const idempotencyCache = new Map<string, { result: any; expires: number }>();

  // Clean up expired cache entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of idempotencyCache.entries()) {
      if (value.expires < now) {
        idempotencyCache.delete(key);
      }
    }
  }, 60000);

  /**
   * POST /training/sessions - Create a new training session
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['type', 'duration', 'date'],
        properties: {
          type: { type: 'string', enum: ['gym', 'golf', 'cardio', 'flexibility', 'range', 'course', 'mental', 'other'] },
          duration: { type: 'number', minimum: 1 },
          intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
          date: { type: 'string' },
          notes: { type: 'string' },
          focusArea: { type: 'string' },
          dailyAssignmentId: { type: 'string' },
        },
      },
    },
    handler: async (req, reply) => {
      const playerId = req.user!.playerId;

      if (!playerId) {
        return reply.code(403).send({
          success: false,
          error: { message: 'Only players can create training sessions' }
        });
      }

      // Check idempotency
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (idempotencyKey) {
        const cacheKey = `${playerId}:${idempotencyKey}`;
        const cached = idempotencyCache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
          return reply.send(cached.result);
        }
      }

      const session = req.body as {
        type: string;
        duration: number;
        intensity?: string;
        date: string;
        notes?: string;
        focusArea?: string;
        dailyAssignmentId?: string;
      };

      // Map type to sessionType format
      const sessionTypeMap: Record<string, string> = {
        'gym': 'physical',
        'golf': 'course',
        'cardio': 'physical',
        'flexibility': 'physical',
        'range': 'range',
        'course': 'course',
        'mental': 'mental',
        'other': 'other',
      };

      // Map intensity to numeric value
      const intensityMap: Record<string, number> = {
        'low': 2,
        'medium': 3,
        'high': 4,
      };

      // Create session in database
      const createdSession = await prisma.trainingSession.create({
        data: {
          playerId,
          sessionType: sessionTypeMap[session.type] || session.type,
          sessionDate: new Date(session.date),
          duration: session.duration,
          intensity: session.intensity ? intensityMap[session.intensity] : null,
          notes: session.notes,
          focusArea: session.focusArea,
          dailyAssignmentId: session.dailyAssignmentId,
        },
      });

      // If linked to daily assignment, mark it as completed
      if (session.dailyAssignmentId) {
        await prisma.dailyTrainingAssignment.update({
          where: { id: session.dailyAssignmentId },
          data: { status: 'completed' },
        });
      }

      const result = {
        success: true,
        data: {
          id: createdSession.id,
          playerId: createdSession.playerId,
          type: session.type,
          sessionType: createdSession.sessionType,
          duration: createdSession.duration,
          intensity: session.intensity,
          date: createdSession.sessionDate,
          notes: createdSession.notes,
          focusArea: createdSession.focusArea,
          createdAt: createdSession.createdAt,
        },
      };

      // Cache for idempotency (5 minutes)
      if (idempotencyKey) {
        const cacheKey = `${playerId}:${idempotencyKey}`;
        idempotencyCache.set(cacheKey, {
          result,
          expires: Date.now() + 5 * 60 * 1000,
        });
      }

      return reply.code(201).send(result);
    },
  });

  /**
   * GET /training/sessions - List player's sessions
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
    handler: async (req, reply) => {
      const playerId = req.user!.playerId;
      const { limit = 20, offset = 0, startDate, endDate, type } = req.query as any;

      if (!playerId) {
        return reply.code(403).send({
          success: false,
          error: { message: 'Only players can access training sessions' }
        });
      }

      const where: any = { playerId };

      if (startDate || endDate) {
        where.sessionDate = {};
        if (startDate) where.sessionDate.gte = new Date(startDate);
        if (endDate) where.sessionDate.lte = new Date(endDate);
      }

      if (type) {
        where.sessionType = type;
      }

      const [sessions, total] = await Promise.all([
        prisma.trainingSession.findMany({
          where,
          orderBy: { sessionDate: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.trainingSession.count({ where }),
      ]);

      return {
        success: true,
        data: {
          sessions,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + sessions.length < total,
          },
        },
      };
    },
  });

  /**
   * GET /training/sessions/:id - Get specific session
   */
  fastify.get<{ Params: { id: string } }>('/:id', {
    onRequest: [fastify.authenticate],
    handler: async (req, reply) => {
      const playerId = req.user!.playerId;
      const { id } = req.params;

      const session = await prisma.trainingSession.findFirst({
        where: {
          id,
          playerId,
        },
      });

      if (!session) {
        return reply.code(404).send({
          success: false,
          error: { message: 'Session not found' },
        });
      }

      return {
        success: true,
        data: session,
      };
    },
  });

  /**
   * DELETE /training/sessions/:id - Delete a session
   */
  fastify.delete<{ Params: { id: string } }>('/:id', {
    onRequest: [fastify.authenticate],
    handler: async (req, reply) => {
      const playerId = req.user!.playerId;
      const { id } = req.params;

      const session = await prisma.trainingSession.findFirst({
        where: {
          id,
          playerId,
        },
      });

      if (!session) {
        return reply.code(404).send({
          success: false,
          error: { message: 'Session not found' },
        });
      }

      await prisma.trainingSession.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Session deleted',
      };
    },
  });
};

export default sessionsRoutes;
