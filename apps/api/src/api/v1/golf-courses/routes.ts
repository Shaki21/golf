/**
 * Golf Courses API Routes
 * Provides endpoints for searching and syncing golf course data
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { GolfCourseService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, authorize } from '../../../middleware/auth';

// Schemas
const searchCoursesSchema = z.object({
  query: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

const syncCountrySchema = z.object({
  country: z.string().min(1),
});

type SearchCoursesQuery = z.infer<typeof searchCoursesSchema>;
type SyncCountryBody = z.infer<typeof syncCountrySchema>;

export default async function golfCourseRoutes(app: FastifyInstance) {
  const prisma = getPrismaClient();
  const service = new GolfCourseService(prisma);

  const preHandlers = [authenticateUser];
  const adminPreHandlers = [authenticateUser, authorize('admin')];

  /**
   * Search courses in database
   * GET /api/v1/golf-courses/search
   */
  app.get<{ Querystring: SearchCoursesQuery }>(
    '/search',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Search golf courses',
        tags: ['Golf Courses'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search by course or club name' },
            country: { type: 'string', description: 'Filter by country' },
            city: { type: 'string', description: 'Filter by city' },
            limit: { type: 'number', default: 50 },
            offset: { type: 'number', default: 0 },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: SearchCoursesQuery }>, reply: FastifyReply) => {
      const params = searchCoursesSchema.parse(request.query);
      const result = await service.searchCourses(params);
      return reply.send({ success: true, ...result });
    }
  );

  /**
   * Get Norwegian courses
   * GET /api/v1/golf-courses/norway
   * NOTE: Must be registered BEFORE /:id to avoid parameter matching
   */
  app.get(
    '/norway',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all Norwegian golf clubs and courses',
        tags: ['Golf Courses'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const clubs = await service.getNorwegianCourses();
      return reply.send({ success: true, clubs, total: clubs.length });
    }
  );

  /**
   * Get course by ID
   * GET /api/v1/golf-courses/:id
   * NOTE: Must be registered AFTER specific routes like /norway
   */
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get golf course details',
        tags: ['Golf Courses'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const course = await service.getCourseById(request.params.id);

      if (!course) {
        return reply.status(404).send({ success: false, error: 'Course not found' });
      }

      return reply.send({ success: true, data: course });
    }
  );

  /**
   * Get clubs by country
   * GET /api/v1/golf-courses/country/:country
   */
  app.get<{ Params: { country: string } }>(
    '/country/:country',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get golf clubs by country',
        tags: ['Golf Courses'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            country: { type: 'string' },
          },
          required: ['country'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { country: string } }>, reply: FastifyReply) => {
      const clubs = await service.getClubsByCountry(request.params.country);
      return reply.send({ success: true, clubs, total: clubs.length });
    }
  );

  /**
   * Get sync status
   * GET /api/v1/golf-courses/sync/status
   */
  app.get(
    '/sync/status',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get golf course sync status',
        tags: ['Golf Courses'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const status = await service.getSyncStatus();
      return reply.send({ success: true, data: status });
    }
  );

  /**
   * Sync courses from API (admin only)
   * POST /api/v1/golf-courses/sync
   */
  app.post<{ Body: SyncCountryBody }>(
    '/sync',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Sync golf courses from external API (admin only)',
        tags: ['Golf Courses'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            country: { type: 'string', description: 'Country to sync (e.g., "Norway")' },
          },
          required: ['country'],
        },
      },
    },
    async (request: FastifyRequest<{ Body: SyncCountryBody }>, reply: FastifyReply) => {
      const { country } = syncCountrySchema.parse(request.body);

      try {
        const result = await service.syncCountry(country);
        return reply.send({
          success: true,
          message: `Synced ${country} courses successfully`,
          ...result,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('not configured')) {
          return reply.status(503).send({
            success: false,
            error: 'GolfCourseAPI not configured',
            message: 'Set GOLFCOURSE_API_KEY environment variable',
          });
        }
        throw error;
      }
    }
  );
}
