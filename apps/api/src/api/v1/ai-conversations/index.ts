import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AIConversationsService, CreateConversationInput, AddMessageInput, ListConversationsQuery } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

interface ConversationParams {
  conversationId: string;
}

/**
 * Register AI conversation routes
 */
export async function aiConversationRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const conversationService = new AIConversationsService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  // Helper to get player ID from request
  const getPlayerId = (request: FastifyRequest) => {
    const playerId = request.user?.playerId;
    if (!playerId) {
      throw new Error('Player access required');
    }
    return playerId;
  };

  /**
   * Create a new AI conversation
   */
  app.post<{ Body: CreateConversationInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new AI conversation',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            context: { type: 'object' },
          },
        },
        response: {
          201: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateConversationInput }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const conversation = await conversationService.createConversation(playerId, request.body);
      return reply.code(201).send({ success: true, data: conversation });
    }
  );

  /**
   * List conversations for current player
   */
  app.get<{ Querystring: ListConversationsQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List AI conversations',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            isActive: { type: 'string' },
            limit: { type: 'string' },
            offset: { type: 'string' },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListConversationsQuery }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const { isActive, limit, offset } = request.query;
      const result = await conversationService.listConversations(playerId, {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        limit: limit ? parseInt(limit as unknown as string) : undefined,
        offset: offset ? parseInt(offset as unknown as string) : undefined,
      });
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get usage statistics
   */
  app.get(
    '/stats',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get AI conversation usage statistics',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const stats = await conversationService.getUsageStats(playerId);
      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Get or create active conversation
   */
  app.get(
    '/active',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get or create the active AI conversation',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const conversation = await conversationService.getOrCreateActiveConversation(playerId);
      return reply.send({ success: true, data: conversation });
    }
  );

  /**
   * Get a specific conversation
   */
  app.get<{ Params: ConversationParams }>(
    '/:conversationId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get a specific AI conversation',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { conversationId: { type: 'string', format: 'uuid' } },
          required: ['conversationId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ConversationParams }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const conversation = await conversationService.getConversation(request.params.conversationId, playerId);
      return reply.send({ success: true, data: conversation });
    }
  );

  /**
   * Add a message to a conversation
   */
  app.post<{ Params: ConversationParams; Body: AddMessageInput }>(
    '/:conversationId/messages',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Add a message to an AI conversation',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { conversationId: { type: 'string', format: 'uuid' } },
          required: ['conversationId'],
        },
        body: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['user', 'assistant', 'system'] },
            content: { type: 'string', minLength: 1 },
            inputTokens: { type: 'number' },
            outputTokens: { type: 'number' },
            toolsUsed: { type: 'array', items: { type: 'string' } },
          },
          required: ['role', 'content'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ConversationParams; Body: AddMessageInput }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const conversation = await conversationService.addMessage(
        request.params.conversationId,
        playerId,
        request.body
      );
      return reply.send({ success: true, data: conversation });
    }
  );

  /**
   * Update conversation title
   */
  app.patch<{ Params: ConversationParams; Body: { title: string } }>(
    '/:conversationId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update AI conversation title',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { conversationId: { type: 'string', format: 'uuid' } },
          required: ['conversationId'],
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
          },
          required: ['title'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ConversationParams; Body: { title: string } }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      const conversation = await conversationService.updateTitle(
        request.params.conversationId,
        playerId,
        request.body.title
      );
      return reply.send({ success: true, data: conversation });
    }
  );

  /**
   * Archive a conversation
   */
  app.post<{ Params: ConversationParams }>(
    '/:conversationId/archive',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Archive an AI conversation',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { conversationId: { type: 'string', format: 'uuid' } },
          required: ['conversationId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ConversationParams }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      await conversationService.archiveConversation(request.params.conversationId, playerId);
      return reply.send({ success: true });
    }
  );

  /**
   * Delete a conversation
   */
  app.delete<{ Params: ConversationParams }>(
    '/:conversationId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete an AI conversation',
        tags: ['ai-conversations'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { conversationId: { type: 'string', format: 'uuid' } },
          required: ['conversationId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ConversationParams }>, reply: FastifyReply) => {
      const playerId = getPlayerId(request);
      await conversationService.deleteConversation(request.params.conversationId, playerId);
      return reply.send({ success: true, message: 'Conversation deleted' });
    }
  );
}
