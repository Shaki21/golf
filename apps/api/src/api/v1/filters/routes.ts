/**
 * Filter System API Routes
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { FilterService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// ============================================================================
// SCHEMAS
// ============================================================================

const filterCriteriaSchema = z.object({
  categories: z.array(z.string()).optional(),
  gender: z.string().optional(),
  ageRange: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  handicapRange: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  testNumbers: z.array(z.number().int().min(1).max(20)).optional(),
  dateRange: z
    .object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    })
    .optional(),
  testStatus: z.enum(['passed', 'failed', 'all']).optional(),
  minCompletionRate: z.number().min(0).max(100).optional(),
});

const createSavedFilterSchema = z.object({
  coachId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filters: filterCriteriaSchema,
});

const updateSavedFilterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  filters: filterCriteriaSchema.optional(),
});

const applyFilterSchema = z.object({
  filters: filterCriteriaSchema,
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

const filterIdParamSchema = z.object({
  id: z.string().uuid(),
});

const listFiltersQuerySchema = z.object({
  coachId: z.string().uuid(),
});

type CreateSavedFilterInput = z.infer<typeof createSavedFilterSchema>;
type UpdateSavedFilterInput = z.infer<typeof updateSavedFilterSchema>;
type ApplyFilterInput = z.infer<typeof applyFilterSchema>;
type FilterIdParam = z.infer<typeof filterIdParamSchema>;
type ListFiltersQuery = z.infer<typeof listFiltersQuerySchema>;

// ============================================================================
// ROUTES
// ============================================================================

export async function filterRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new FilterService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * POST /api/v1/filters
   * Create a saved filter
   */
  app.post<{ Body: CreateSavedFilterInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a saved filter for quick access',
        tags: ['filters'],
        security: [{ bearerAuth: [] }],
        response: {
          201: {
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
      request: FastifyRequest<{ Body: CreateSavedFilterInput }>,
      reply: FastifyReply
    ) => {
      const input = validate(createSavedFilterSchema, request.body);
      const savedFilter = await service.createSavedFilter(
        request.tenant!.id,
        input
      );
      return reply.code(201).send({ success: true, data: savedFilter });
    }
  );

  /**
   * GET /api/v1/filters
   * List saved filters for a coach
   */
  app.get<{ Querystring: ListFiltersQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List all saved filters for a coach',
        tags: ['filters'],
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
      request: FastifyRequest<{ Querystring: ListFiltersQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(listFiltersQuerySchema, request.query);
      const filters = await service.listSavedFilters(
        request.tenant!.id,
        query.coachId
      );
      return reply.send({ success: true, data: filters });
    }
  );

  /**
   * GET /api/v1/filters/:id
   * Get a saved filter by ID
   */
  app.get<{ Params: FilterIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get a saved filter by ID',
        tags: ['filters'],
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
    async (request: FastifyRequest<{ Params: FilterIdParam }>, reply: FastifyReply) => {
      const params = validate(filterIdParamSchema, request.params);
      const savedFilter = await service.getSavedFilter(
        request.tenant!.id,
        params.id
      );
      return reply.send({ success: true, data: savedFilter });
    }
  );

  /**
   * PUT /api/v1/filters/:id
   * Update a saved filter
   */
  app.put<{ Params: FilterIdParam; Body: UpdateSavedFilterInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update a saved filter',
        tags: ['filters'],
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
      request: FastifyRequest<{ Params: FilterIdParam; Body: UpdateSavedFilterInput }>,
      reply: FastifyReply
    ) => {
      const params = validate(filterIdParamSchema, request.params);
      const input = validate(updateSavedFilterSchema, request.body);
      const updated = await service.updateSavedFilter(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: updated });
    }
  );

  /**
   * DELETE /api/v1/filters/:id
   * Delete a saved filter
   */
  app.delete<{ Params: FilterIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete a saved filter',
        tags: ['filters'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: FilterIdParam }>, reply: FastifyReply) => {
      const params = validate(filterIdParamSchema, request.params);
      await service.deleteSavedFilter(request.tenant!.id, params.id);
      return reply.send({ success: true });
    }
  );

  /**
   * POST /api/v1/filters/apply
   * Apply filter criteria to find players
   */
  app.post<{ Body: ApplyFilterInput }>(
    '/apply',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Apply filter criteria to search and filter players',
        tags: ['filters'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  players: { type: 'array', items: { type: 'object' } },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ApplyFilterInput }>, reply: FastifyReply) => {
      const input = validate(applyFilterSchema, request.body);
      const result = await service.applyFilter(request.tenant!.id, input);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * GET /api/v1/filters/suggestions
   * Get filter suggestions based on current data
   */
  app.get(
    '/suggestions',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get available filter options based on current data',
        tags: ['filters'],
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
    async (request: FastifyRequest, reply: FastifyReply) => {
      const suggestions = await service.getFilterSuggestions(request.tenant!.id);
      return reply.send({ success: true, data: suggestions });
    }
  );
}
