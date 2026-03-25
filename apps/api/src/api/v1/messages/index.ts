import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../../../core/db/prisma';
import { wsManager } from '../../../plugins/websocket';
// Note: Using FastifyRequest with non-null assertions (!) for authenticated routes
// since Fastify's type system doesn't automatically narrow types after preHandler hooks

/**
 * Message API Routes
 * Handles conversations and messages between players, coaches, and groups
 */

// Schema definitions
const createConversationSchema = z.object({
  type: z.enum(['direct', 'group', 'coach_player']),
  name: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(1),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z.array(z.object({
    type: z.enum(['image', 'file', 'video']),
    url: z.string().url(),
    name: z.string(),
    size: z.number().optional(),
  })).optional(),
});

const updateMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function messageRoutes(app: FastifyInstance): Promise<void> {
  // All routes require authentication
  app.addHook('preHandler', app.authenticate);

  /**
   * GET /conversations
   * List all conversations for the current user
   */
  app.get('/conversations', {
    schema: {
      description: 'Get all conversations for current user',
      tags: ['messages'],
      response: {
        200: {
          type: 'object',
          properties: {
            conversations: { type: 'array' },
            total: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                player: { select: { firstName: true, lastName: true, avatar: true } },
                coach: { select: { firstName: true, lastName: true, avatar: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                player: { select: { firstName: true } },
                coach: { select: { firstName: true } },
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readBy: { none: { userId } },
                senderId: { not: userId },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedConversations = conversations.map((conv) => {
      const lastMessage = conv.messages[0];
      const otherParticipants = conv.participants.filter((p) => p.userId !== userId);

      return {
        id: conv.id,
        type: conv.type,
        name: conv.name || otherParticipants.map((p) => {
          const user = p.user;
          return user.player
            ? `${user.player.firstName} ${user.player.lastName}`
            : user.coach
            ? `${user.coach.firstName} ${user.coach.lastName}`
            : user.email;
        }).join(', '),
        participants: conv.participants.map((p) => ({
          id: p.userId,
          name: p.user.player
            ? `${p.user.player.firstName} ${p.user.player.lastName}`
            : p.user.coach
            ? `${p.user.coach.firstName} ${p.user.coach.lastName}`
            : p.user.email,
          avatar: p.user.player?.avatar || p.user.coach?.avatar,
          role: p.user.player ? 'player' : p.user.coach ? 'coach' : 'user',
        })),
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderName: lastMessage.sender.player?.firstName ||
                      lastMessage.sender.coach?.firstName || 'Unknown',
          sentAt: lastMessage.createdAt,
          isRead: lastMessage.readBy?.some((r) => r.userId === userId) ?? false,
        } : null,
        unreadCount: conv._count.messages,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return { conversations: formattedConversations, total: conversations.length };
  });

  /**
   * POST /conversations
   * Create a new conversation
   */
  app.post('/conversations', {
    schema: {
      description: 'Create a new conversation',
      tags: ['messages'],
      body: {
        type: 'object',
        required: ['type', 'participantIds'],
        properties: {
          type: { type: 'string', enum: ['direct', 'group', 'coach_player'] },
          name: { type: 'string' },
          participantIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user!.id;
    const body = createConversationSchema.parse(request.body);

    // For direct messages, check if conversation already exists
    if (body.type === 'direct' && body.participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: body.participantIds[0] } } },
          ],
        },
      });

      if (existingConversation) {
        return { conversation: existingConversation, existing: true };
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: body.type,
        name: body.name,
        participants: {
          create: [
            { userId },
            ...body.participantIds.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                player: { select: { firstName: true, lastName: true } },
                coach: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    return { conversation, existing: false };
  });

  /**
   * GET /conversations/:conversationId
   * Get a specific conversation with messages
   */
  app.get('/conversations/:conversationId', {
    schema: {
      description: 'Get conversation with messages',
      tags: ['messages'],
      params: {
        type: 'object',
        required: ['conversationId'],
        properties: {
          conversationId: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          before: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest<{
    Params: { conversationId: string };
    Querystring: { limit?: number; before?: string };
  }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const { conversationId } = request.params;
    const { limit = 50, before } = request.query;

    // Verify user is participant
    const participation = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participation) {
      return reply.status(403).send({ error: 'Not a participant' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                player: { select: { firstName: true, lastName: true, avatar: true } },
                coach: { select: { firstName: true, lastName: true, avatar: true } },
              },
            },
          },
        },
        messages: {
          where: before ? { createdAt: { lt: new Date(before) } } : undefined,
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            sender: {
              select: {
                id: true,
                player: { select: { firstName: true, lastName: true, avatar: true } },
                coach: { select: { firstName: true, lastName: true, avatar: true } },
              },
            },
            readBy: {
              select: { userId: true, readAt: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return reply.status(404).send({ error: 'Conversation not found' });
    }

    // Mark messages as read
    await prisma.messageRead.createMany({
      data: conversation.messages
        .filter((m) => m.senderId !== userId && !m.readBy.some((r) => r.userId === userId))
        .map((m) => ({ messageId: m.id, userId })),
      skipDuplicates: true,
    });

    return {
      conversation: {
        id: conversation.id,
        type: conversation.type,
        name: conversation.name,
        participants: conversation.participants.map((p) => ({
          id: p.userId,
          name: p.user.player
            ? `${p.user.player.firstName} ${p.user.player.lastName}`
            : p.user.coach
            ? `${p.user.coach.firstName} ${p.user.coach.lastName}`
            : p.user.email,
          avatar: p.user.player?.avatar || p.user.coach?.avatar,
          role: p.user.player ? 'player' : p.user.coach ? 'coach' : 'user',
        })),
      },
      messages: conversation.messages.reverse().map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: m.sender.player
          ? `${m.sender.player.firstName} ${m.sender.player.lastName}`
          : m.sender.coach
          ? `${m.sender.coach.firstName} ${m.sender.coach.lastName}`
          : 'Unknown',
        senderAvatar: m.sender.player?.avatar || m.sender.coach?.avatar,
        createdAt: m.createdAt,
        readBy: m.readBy,
      })),
      hasMore: conversation.messages.length === limit,
    };
  });

  /**
   * POST /conversations/:conversationId/messages
   * Send a message in a conversation
   */
  app.post('/conversations/:conversationId/messages', {
    schema: {
      description: 'Send a message',
      tags: ['messages'],
      params: {
        type: 'object',
        required: ['conversationId'],
        properties: {
          conversationId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest<{
    Params: { conversationId: string };
  }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const { conversationId } = request.params;
    const body = sendMessageSchema.parse(request.body);

    // Verify user is participant
    const participation = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participation) {
      return reply.status(403).send({ error: 'Not a participant' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: body.content,
        attachments: body.attachments as Prisma.InputJsonValue | undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            player: { select: { firstName: true, lastName: true, avatar: true } },
            coach: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Mark as read by sender
    await prisma.messageRead.create({
      data: { messageId: message.id, userId },
    });

    // Get other participants and notify via WebSocket
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: userId } },
    });

    const formattedMessage = {
      id: message.id,
      conversationId,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.player
        ? `${message.sender.player.firstName} ${message.sender.player.lastName}`
        : message.sender.coach
        ? `${message.sender.coach.firstName} ${message.sender.coach.lastName}`
        : 'Unknown',
      senderAvatar: message.sender.player?.avatar || message.sender.coach?.avatar,
      createdAt: message.createdAt,
    };

    // Send real-time notification to other participants
    for (const participant of participants) {
      wsManager.sendToUser(participant.userId, 'message:new', formattedMessage);
    }

    return { message: formattedMessage };
  });

  /**
   * PATCH /messages/:messageId
   * Edit a message (only by sender)
   */
  app.patch('/messages/:messageId', {
    schema: {
      description: 'Edit a message',
      tags: ['messages'],
    },
  }, async (request: FastifyRequest<{
    Params: { messageId: string };
  }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const { messageId } = request.params;
    const body = updateMessageSchema.parse(request.body);

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return reply.status(404).send({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return reply.status(403).send({ error: 'Can only edit your own messages' });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: body.content, editedAt: new Date() },
    });

    return { message: updated };
  });

  /**
   * DELETE /messages/:messageId
   * Delete a message (only by sender)
   */
  app.delete('/messages/:messageId', {
    schema: {
      description: 'Delete a message',
      tags: ['messages'],
    },
  }, async (request: FastifyRequest<{
    Params: { messageId: string };
  }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const { messageId } = request.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return reply.status(404).send({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return reply.status(403).send({ error: 'Can only delete your own messages' });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), content: '[Melding slettet]' },
    });

    return { success: true };
  });

  /**
   * POST /conversations/:conversationId/read
   * Mark all messages in conversation as read
   */
  app.post('/conversations/:conversationId/read', {
    schema: {
      description: 'Mark conversation as read',
      tags: ['messages'],
    },
  }, async (request: FastifyRequest<{
    Params: { conversationId: string };
  }>, _reply: FastifyReply) => {
    const userId = request.user!.id;
    const { conversationId } = request.params;

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readBy: { none: { userId } },
      },
      select: { id: true },
    });

    if (unreadMessages.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadMessages.map((m) => ({ messageId: m.id, userId })),
        skipDuplicates: true,
      });
    }

    return { markedAsRead: unreadMessages.length };
  });

  /**
   * GET /unread-count
   * Get total unread message count
   */
  app.get('/unread-count', {
    schema: {
      description: 'Get unread message count',
      tags: ['messages'],
    },
  }, async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.user!.id;

    const count = await prisma.message.count({
      where: {
        conversation: {
          participants: { some: { userId } },
        },
        senderId: { not: userId },
        readBy: { none: { userId } },
      },
    });

    return { unreadCount: count };
  });
}

export default messageRoutes;
