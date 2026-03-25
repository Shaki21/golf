import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ChatService, CreateGroupInput, SendMessageInput } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

interface GroupParams {
  groupId: string;
}

interface MessageParams {
  groupId: string;
  messageId: string;
}

interface MessagesQuery {
  limit?: string;
  before?: string;
}

/**
 * Register chat routes
 */
export async function chatRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const chatService = new ChatService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  // Helper to get member info from request
  const getMemberInfo = (request: FastifyRequest) => {
    const user = request.user!;
    if (user.playerId) return { type: 'player', id: user.playerId };
    if (user.coachId) return { type: 'coach', id: user.coachId };
    return { type: 'user', id: user.id };
  };

  /**
   * Create a new chat group
   */
  app.post<{ Body: CreateGroupInput }>(
    '/groups',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new chat group',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string' },
            groupType: { type: 'string', enum: ['direct', 'team', 'academy', 'coach_player'] },
            memberIds: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['player', 'coach', 'parent'] },
                  id: { type: 'string', format: 'uuid' },
                },
                required: ['type', 'id'],
              },
            },
          },
          required: ['name', 'groupType', 'memberIds'],
        },
        response: {
          201: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateGroupInput }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      const group = await chatService.createGroup(request.tenant!.id, member.id, request.body);
      return reply.code(201).send({ success: true, data: group });
    }
  );

  /**
   * Get user's chat groups
   */
  app.get(
    '/groups',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get chat groups for the current user',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      const groups = await chatService.getGroups(request.tenant!.id, member.type, member.id);
      return reply.send({ success: true, data: groups });
    }
  );

  /**
   * Get a specific group
   */
  app.get<{ Params: GroupParams }>(
    '/groups/:groupId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get a specific chat group',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { groupId: { type: 'string', format: 'uuid' } },
          required: ['groupId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GroupParams }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      const group = await chatService.getGroup(request.params.groupId, member.type, member.id);
      return reply.send({ success: true, data: group });
    }
  );

  /**
   * Get messages for a group
   */
  app.get<{ Params: GroupParams; Querystring: MessagesQuery }>(
    '/groups/:groupId/messages',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get messages for a chat group',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { groupId: { type: 'string', format: 'uuid' } },
          required: ['groupId'],
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'string' },
            before: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GroupParams; Querystring: MessagesQuery }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      const { limit, before } = request.query;
      const messages = await chatService.getMessages(request.params.groupId, member.type, member.id, {
        limit: limit ? parseInt(limit) : undefined,
        before,
      });
      return reply.send({ success: true, data: messages });
    }
  );

  /**
   * Send a message to a group
   */
  app.post<{ Params: GroupParams; Body: SendMessageInput }>(
    '/groups/:groupId/messages',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Send a message to a chat group',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { groupId: { type: 'string', format: 'uuid' } },
          required: ['groupId'],
        },
        body: {
          type: 'object',
          properties: {
            content: { type: 'string', minLength: 1 },
            messageType: { type: 'string', enum: ['text', 'image', 'video', 'file'] },
            metadata: { type: 'object' },
            replyToId: { type: 'string', format: 'uuid' },
          },
          required: ['content'],
        },
        response: {
          201: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GroupParams; Body: SendMessageInput }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      const message = await chatService.sendMessage(
        request.params.groupId,
        member.type,
        member.id,
        request.body
      );
      return reply.code(201).send({ success: true, data: message });
    }
  );

  /**
   * Edit a message
   */
  app.patch<{ Params: MessageParams; Body: { content: string } }>(
    '/groups/:groupId/messages/:messageId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Edit a message',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            groupId: { type: 'string', format: 'uuid' },
            messageId: { type: 'string', format: 'uuid' },
          },
          required: ['groupId', 'messageId'],
        },
        body: {
          type: 'object',
          properties: { content: { type: 'string', minLength: 1 } },
          required: ['content'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: MessageParams; Body: { content: string } }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      const message = await chatService.editMessage(
        request.params.messageId,
        member.type,
        member.id,
        request.body.content
      );
      return reply.send({ success: true, data: message });
    }
  );

  /**
   * Delete a message
   */
  app.delete<{ Params: MessageParams }>(
    '/groups/:groupId/messages/:messageId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete a message',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            groupId: { type: 'string', format: 'uuid' },
            messageId: { type: 'string', format: 'uuid' },
          },
          required: ['groupId', 'messageId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: MessageParams }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      await chatService.deleteMessage(request.params.messageId, member.type, member.id);
      return reply.send({ success: true, message: 'Message deleted' });
    }
  );

  /**
   * Mark messages as read
   */
  app.post<{ Params: GroupParams }>(
    '/groups/:groupId/read',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Mark messages in a group as read',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { groupId: { type: 'string', format: 'uuid' } },
          required: ['groupId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GroupParams }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      await chatService.markAsRead(request.params.groupId, member.type, member.id);
      return reply.send({ success: true });
    }
  );

  /**
   * Leave a group
   */
  app.post<{ Params: GroupParams }>(
    '/groups/:groupId/leave',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Leave a chat group',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { groupId: { type: 'string', format: 'uuid' } },
          required: ['groupId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GroupParams }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      await chatService.leaveGroup(request.params.groupId, member.type, member.id);
      return reply.send({ success: true });
    }
  );

  /**
   * Archive a group
   */
  app.post<{ Params: GroupParams }>(
    '/groups/:groupId/archive',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Archive a chat group',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { groupId: { type: 'string', format: 'uuid' } },
          required: ['groupId'],
        },
        response: {
          200: { type: 'object', properties: { success: { type: 'boolean' } } },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GroupParams }>, reply: FastifyReply) => {
      const member = getMemberInfo(request);
      await chatService.archiveGroup(request.params.groupId, member.type, member.id);
      return reply.send({ success: true });
    }
  );
}
