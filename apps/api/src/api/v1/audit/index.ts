import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuditService, ListAuditEventsQuery } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, requireAdmin } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

interface ResourceParams {
  resourceType: string;
  resourceId: string;
}

interface ActorParams {
  actorId: string;
}

interface StatsQuery {
  days?: string;
}

interface SearchQuery {
  q: string;
  limit?: string;
}

/**
 * Register audit event routes
 */
export async function auditRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const auditService = new AuditService(prisma);

  const adminPreHandlers = [authenticateUser, injectTenantContext, requireAdmin];

  /**
   * List audit events with filters
   */
  app.get<{ Querystring: ListAuditEventsQuery }>(
    '/',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'List audit events with filters',
        tags: ['audit'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            resourceType: { type: 'string' },
            resourceId: { type: 'string' },
            actorId: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            page: { type: 'string' },
            limit: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListAuditEventsQuery }>, reply: FastifyReply) => {
      const { action, resourceType, resourceId, actorId, startDate, endDate, page, limit } = request.query;
      const result = await auditService.listEvents(request.tenant!.id, {
        action,
        resourceType,
        resourceId,
        actorId,
        startDate,
        endDate,
        page: page ? parseInt(page as unknown as string) : undefined,
        limit: limit ? parseInt(limit as unknown as string) : undefined,
      });
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get audit statistics for dashboard
   */
  app.get<{ Querystring: StatsQuery }>(
    '/stats',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get audit event statistics',
        tags: ['audit'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: StatsQuery }>, reply: FastifyReply) => {
      const days = request.query.days ? parseInt(request.query.days) : 30;
      const stats = await auditService.getStats(request.tenant!.id, days);
      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Search audit events
   */
  app.get<{ Querystring: SearchQuery }>(
    '/search',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Search audit events',
        tags: ['audit'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', minLength: 1 },
            limit: { type: 'string' },
          },
          required: ['q'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
      const { q, limit } = request.query;
      const events = await auditService.searchEvents(request.tenant!.id, q, {
        limit: limit ? parseInt(limit) : undefined,
      });
      return reply.send({ success: true, data: events });
    }
  );

  /**
   * Get audit history for a specific resource
   */
  app.get<{ Params: ResourceParams }>(
    '/resource/:resourceType/:resourceId',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get audit history for a specific resource',
        tags: ['audit'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            resourceType: { type: 'string' },
            resourceId: { type: 'string', format: 'uuid' },
          },
          required: ['resourceType', 'resourceId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ResourceParams }>, reply: FastifyReply) => {
      const { resourceType, resourceId } = request.params;
      const events = await auditService.getResourceHistory(request.tenant!.id, resourceType, resourceId);
      return reply.send({ success: true, data: events });
    }
  );

  /**
   * Get audit history for a specific actor (user)
   */
  app.get<{ Params: ActorParams }>(
    '/actor/:actorId',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get audit history for a specific user',
        tags: ['audit'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            actorId: { type: 'string', format: 'uuid' },
          },
          required: ['actorId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ActorParams }>, reply: FastifyReply) => {
      const { actorId } = request.params;
      const events = await auditService.getActorHistory(request.tenant!.id, actorId);
      return reply.send({ success: true, data: events });
    }
  );
}
