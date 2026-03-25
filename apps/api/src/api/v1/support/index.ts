import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SupportService, CreateSupportCaseInput, UpdateSupportCaseInput, ListSupportCasesQuery } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, requireAdmin } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

interface CaseParams {
  caseId: string;
}

/**
 * Register support case routes
 */
export async function supportRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const supportService = new SupportService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];
  const adminPreHandlers = [...preHandlers, requireAdmin];

  /**
   * Create a support case (any authenticated user)
   */
  app.post<{ Body: CreateSupportCaseInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new support case',
        tags: ['support'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
            category: { type: 'string' },
          },
          required: ['title'],
        },
        response: {
          201: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateSupportCaseInput }>, reply: FastifyReply) => {
      const tenantId = request.tenant?.id || null;
      const reportedById = request.user?.id || null;
      const supportCase = await supportService.createCase(tenantId, reportedById, request.body);
      return reply.code(201).send({ success: true, data: supportCase });
    }
  );

  /**
   * List support cases (admin only)
   */
  app.get<{ Querystring: ListSupportCasesQuery }>(
    '/',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'List support cases with filters',
        tags: ['support'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            priority: { type: 'string' },
            category: { type: 'string' },
            page: { type: 'string' },
            limit: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListSupportCasesQuery }>, reply: FastifyReply) => {
      const { status, priority, category, page, limit } = request.query;
      const result = await supportService.listCases({
        status,
        priority,
        category,
        page: page ? parseInt(page as unknown as string) : undefined,
        limit: limit ? parseInt(limit as unknown as string) : undefined,
      });
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get support case statistics (admin only)
   */
  app.get(
    '/stats',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get support case statistics',
        tags: ['support'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const stats = await supportService.getStats();
      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Get a specific support case
   */
  app.get<{ Params: CaseParams }>(
    '/:caseId',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get a specific support case',
        tags: ['support'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { caseId: { type: 'string', format: 'uuid' } },
          required: ['caseId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CaseParams }>, reply: FastifyReply) => {
      const supportCase = await supportService.getCase(request.params.caseId);
      return reply.send({ success: true, data: supportCase });
    }
  );

  /**
   * Update a support case (admin only)
   */
  app.patch<{ Params: CaseParams; Body: UpdateSupportCaseInput }>(
    '/:caseId',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Update a support case',
        tags: ['support'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { caseId: { type: 'string', format: 'uuid' } },
          required: ['caseId'],
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'] },
            priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
            category: { type: 'string' },
            resolution: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CaseParams; Body: UpdateSupportCaseInput }>, reply: FastifyReply) => {
      const supportCase = await supportService.updateCase(request.params.caseId, request.body);
      return reply.send({ success: true, data: supportCase });
    }
  );

  /**
   * Delete a support case (admin only)
   */
  app.delete<{ Params: CaseParams }>(
    '/:caseId',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Delete a support case',
        tags: ['support'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { caseId: { type: 'string', format: 'uuid' } },
          required: ['caseId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CaseParams }>, reply: FastifyReply) => {
      await supportService.deleteCase(request.params.caseId);
      return reply.send({ success: true, message: 'Support case deleted' });
    }
  );
}
