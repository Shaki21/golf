import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ComparisonService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createComparisonSchema,
  updateComparisonSchema,
  listComparisonsSchema,
  getComparisonSchema,
  deleteComparisonSchema,
  CreateComparisonInput,
  UpdateComparisonInput,
  ListComparisonsInput,
  GetComparisonInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';

/**
 * Register video comparison routes
 */
export async function comparisonRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const comparisonService = new ComparisonService(prisma);

  /**
   * POST /comparisons
   * Create a new video comparison
   */
  app.post<{ Body: CreateComparisonInput }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Create a new video comparison',
        tags: ['comparisons'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['primaryVideoId', 'comparisonVideoId', 'syncPoint1', 'syncPoint2'],
          properties: {
            primaryVideoId: { type: 'string', format: 'uuid' },
            comparisonVideoId: { type: 'string', format: 'uuid' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            notes: { type: 'string', maxLength: 2000 },
            syncPoint1: { type: 'number', minimum: 0 },
            syncPoint2: { type: 'number', minimum: 0 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: ['string', 'null'] },
                  syncPoint1: { type: 'number' },
                  syncPoint2: { type: 'number' },
                  createdAt: { type: 'string' },
                  primaryVideo: { type: 'object' },
                  comparisonVideo: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateComparisonInput }>, reply: FastifyReply) => {
      const input = validate(createComparisonSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await comparisonService.createComparison(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /comparisons
   * List comparisons
   */
  app.get<{ Querystring: ListComparisonsInput }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List video comparisons',
        tags: ['comparisons'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            videoId: { type: 'string', format: 'uuid' },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'number', minimum: 0, default: 0 },
            sortBy: { type: 'string', enum: ['createdAt', 'title'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
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
                  comparisons: { type: 'array' },
                  total: { type: 'number' },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListComparisonsInput }>, reply: FastifyReply) => {
      const input = validate(listComparisonsSchema, request.query);
      const tenantId = request.user!.tenantId;

      const result = await comparisonService.listComparisons(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /comparisons/video/:videoId
   * Get comparisons for a specific video
   */
  app.get<{ Params: { videoId: string } }>(
    '/video/:videoId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get comparisons for a specific video',
        tags: ['comparisons'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['videoId'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
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
                  comparisons: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { videoId: string } }>, reply: FastifyReply) => {
      const tenantId = request.user!.tenantId;

      const result = await comparisonService.getVideoComparisons(request.params.videoId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /comparisons/:id
   * Get comparison by ID (includes playback URLs)
   */
  app.get<{ Params: GetComparisonInput }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get comparison by ID with playback URLs',
        tags: ['comparisons'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GetComparisonInput }>, reply: FastifyReply) => {
      const input = validate(getComparisonSchema, request.params);
      const tenantId = request.user!.tenantId;

      const comparison = await comparisonService.getComparison(input.id, tenantId);

      return reply.status(200).send({
        success: true,
        data: comparison,
      });
    }
  );

  /**
   * PATCH /comparisons/:id
   * Update comparison
   */
  app.patch<{ Params: { id: string }; Body: Omit<UpdateComparisonInput, 'id'> }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Update comparison',
        tags: ['comparisons'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
            notes: { type: ['string', 'null'], maxLength: 2000 },
            syncPoint1: { type: 'number', minimum: 0 },
            syncPoint2: { type: 'number', minimum: 0 },
          },
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
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<UpdateComparisonInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(updateComparisonSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await comparisonService.updateComparison(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Comparison updated successfully',
      });
    }
  );

  /**
   * DELETE /comparisons/:id
   * Delete comparison
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Delete comparison',
        tags: ['comparisons'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
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
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      validate(deleteComparisonSchema, request.params);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await comparisonService.deleteComparison(request.params.id, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Comparison deleted successfully',
      });
    }
  );
}
