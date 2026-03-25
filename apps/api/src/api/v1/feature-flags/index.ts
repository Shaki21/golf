import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FeatureFlagService, CreateFeatureFlagInput, UpdateFeatureFlagInput } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, requireAdmin } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

interface FlagParams {
  key: string;
}

interface CheckFlagQuery {
  key: string;
}

/**
 * Register feature flag routes
 */
export async function featureFlagRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const flagService = new FeatureFlagService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];
  const adminPreHandlers = [...preHandlers, requireAdmin];

  /**
   * Create a feature flag (admin only)
   */
  app.post<{ Body: CreateFeatureFlagInput }>(
    '/',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Create a new feature flag',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            key: { type: 'string', pattern: '^[a-z0-9_]+$', minLength: 1, maxLength: 100 },
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string' },
            enabled: { type: 'boolean' },
            rolloutPercentage: { type: 'number', minimum: 0, maximum: 100 },
          },
          required: ['key', 'name'],
        },
        response: {
          201: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateFeatureFlagInput }>, reply: FastifyReply) => {
      const flag = await flagService.createFlag(request.body);
      return reply.code(201).send({ success: true, data: flag });
    }
  );

  /**
   * List all feature flags (admin only)
   */
  app.get(
    '/',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'List all feature flags',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const flags = await flagService.listFlags();
      return reply.send({ success: true, data: flags });
    }
  );

  /**
   * Get enabled flags for current user
   */
  app.get(
    '/me',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get enabled feature flags for the current user',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.id;
      const enabledFlags = await flagService.getEnabledFlagsForUser(userId);
      return reply.send({ success: true, data: enabledFlags });
    }
  );

  /**
   * Check if a specific flag is enabled for current user
   */
  app.get<{ Querystring: CheckFlagQuery }>(
    '/check',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Check if a feature flag is enabled for the current user',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: { key: { type: 'string' } },
          required: ['key'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: CheckFlagQuery }>, reply: FastifyReply) => {
      const userId = request.user!.id;
      const isEnabled = await flagService.isEnabledForUser(request.query.key, userId);
      return reply.send({ success: true, data: { key: request.query.key, enabled: isEnabled } });
    }
  );

  /**
   * Get a specific feature flag (admin only)
   */
  app.get<{ Params: FlagParams }>(
    '/:key',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Get a specific feature flag',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { key: { type: 'string' } },
          required: ['key'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: FlagParams }>, reply: FastifyReply) => {
      const flag = await flagService.getFlag(request.params.key);
      return reply.send({ success: true, data: flag });
    }
  );

  /**
   * Update a feature flag (admin only)
   */
  app.patch<{ Params: FlagParams; Body: UpdateFeatureFlagInput }>(
    '/:key',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Update a feature flag',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { key: { type: 'string' } },
          required: ['key'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            enabled: { type: 'boolean' },
            rolloutPercentage: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: FlagParams; Body: UpdateFeatureFlagInput }>, reply: FastifyReply) => {
      const flag = await flagService.updateFlag(request.params.key, request.body);
      return reply.send({ success: true, data: flag });
    }
  );

  /**
   * Toggle a feature flag (admin only)
   */
  app.post<{ Params: FlagParams }>(
    '/:key/toggle',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Toggle a feature flag on/off',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { key: { type: 'string' } },
          required: ['key'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: FlagParams }>, reply: FastifyReply) => {
      const flag = await flagService.toggleFlag(request.params.key);
      return reply.send({ success: true, data: flag });
    }
  );

  /**
   * Delete a feature flag (admin only)
   */
  app.delete<{ Params: FlagParams }>(
    '/:key',
    {
      preHandler: adminPreHandlers,
      schema: {
        description: 'Delete a feature flag',
        tags: ['feature-flags'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { key: { type: 'string' } },
          required: ['key'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: FlagParams }>, reply: FastifyReply) => {
      await flagService.deleteFlag(request.params.key);
      return reply.send({ success: true, message: 'Feature flag deleted' });
    }
  );
}
