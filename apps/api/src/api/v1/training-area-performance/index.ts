import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TrainingAreaPerformanceService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createPerformanceSchema,
  updatePerformanceSchema,
  listPerformanceQuerySchema,
  performanceIdParamSchema,
  progressStatsQuerySchema,
  CreatePerformanceInput,
  UpdatePerformanceInput,
  ListPerformanceQuery,
  PerformanceIdParam,
  ProgressStatsQuery,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

/**
 * Register training area performance routes
 */
export async function trainingAreaPerformanceRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new TrainingAreaPerformanceService(prisma);

  // All routes require authentication and tenant context
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new performance entry
   */
  app.post<{ Body: CreatePerformanceInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Log training area performance after a session',
        tags: ['training-area-performance'],
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
                  trainingArea: { type: 'string' },
                  successRate: { type: 'number', nullable: true },
                  consistencyScore: { type: 'number', nullable: true },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreatePerformanceInput }>, reply: FastifyReply) => {
      const input = validate(createPerformanceSchema, request.body);

      // Get player ID from authenticated user
      const playerId = request.user!.playerId!;

      const performance = await service.createPerformance(
        request.tenant!.id,
        playerId,
        input
      );

      return reply.code(201).send({ success: true, data: performance });
    }
  );

  /**
   * List performances for current player
   */
  app.get<{ Querystring: ListPerformanceQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List training area performances with filters',
        tags: ['training-area-performance'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  performances: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        trainingArea: { type: 'string' },
                        performanceDate: { type: 'string' },
                      },
                    },
                  },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListPerformanceQuery }>, reply: FastifyReply) => {
      const query = validate(listPerformanceQuerySchema, request.query);
      const playerId = request.user!.playerId!;

      const result = await service.listPerformances(
        request.tenant!.id,
        playerId,
        query
      );

      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get performance by ID
   */
  app.get<{ Params: PerformanceIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get training area performance by ID',
        tags: ['training-area-performance'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PerformanceIdParam }>, reply: FastifyReply) => {
      const { id } = validate(performanceIdParamSchema, request.params);
      const playerId = request.user!.playerId!;

      const performance = await service.getPerformanceById(
        request.tenant!.id,
        playerId,
        id
      );

      return reply.send({ success: true, data: performance });
    }
  );

  /**
   * Update performance entry
   */
  app.patch<{ Params: PerformanceIdParam; Body: UpdatePerformanceInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update training area performance',
        tags: ['training-area-performance'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PerformanceIdParam; Body: UpdatePerformanceInput }>,
      reply: FastifyReply
    ) => {
      const { id } = validate(performanceIdParamSchema, request.params);
      const input = validate(updatePerformanceSchema, request.body);
      const playerId = request.user!.playerId!;

      const performance = await service.updatePerformance(
        request.tenant!.id,
        playerId,
        id,
        input
      );

      return reply.send({ success: true, data: performance });
    }
  );

  /**
   * Delete performance entry
   */
  app.delete<{ Params: PerformanceIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete training area performance',
        tags: ['training-area-performance'],
        security: [{ bearerAuth: [] }],
        response: {
          204: {
            type: 'null',
            description: 'Performance deleted successfully',
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PerformanceIdParam }>, reply: FastifyReply) => {
      const { id } = validate(performanceIdParamSchema, request.params);
      const playerId = request.user!.playerId!;

      await service.deletePerformance(request.tenant!.id, playerId, id);

      return reply.code(204).send();
    }
  );

  /**
   * Get progress statistics for a training area
   */
  app.get<{ Querystring: ProgressStatsQuery }>(
    '/progress/stats',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get progress statistics for a training area over time',
        tags: ['training-area-performance'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  trainingArea: { type: 'string' },
                  totalSessions: { type: 'number' },
                  averageSuccessRate: { type: 'number', nullable: true },
                  averageConsistencyScore: { type: 'number', nullable: true },
                  improvement: {
                    type: 'object',
                    properties: {
                      successRate: { type: 'number', nullable: true },
                      consistencyScore: { type: 'number', nullable: true },
                    },
                  },
                  recentPerformances: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        successRate: { type: 'number', nullable: true },
                        consistencyScore: { type: 'number', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ProgressStatsQuery }>, reply: FastifyReply) => {
      const query = validate(progressStatsQuerySchema, request.query);
      const playerId = request.user!.playerId!;

      const stats = await service.getProgressStats(
        request.tenant!.id,
        playerId,
        query
      );

      return reply.send({ success: true, data: stats });
    }
  );
}
