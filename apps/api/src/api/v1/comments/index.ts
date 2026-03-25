import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CommentService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createCommentSchema,
  updateCommentSchema,
  listCommentsSchema,
  getCommentSchema,
  deleteCommentSchema,
  getCommentRepliesSchema,
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsInput,
  GetCommentInput,
  GetCommentRepliesInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';
import { publishNotification } from '../../../services/notifications/notificationPublisher';

/**
 * Register video comment routes
 */
export async function commentRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const commentService = new CommentService(prisma);

  /**
   * POST /comments
   * Create a new comment
   */
  app.post<{ Body: CreateCommentInput }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Create a new video comment',
        tags: ['comments'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['videoId', 'body'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
            parentId: { type: 'string', format: 'uuid' },
            body: { type: 'string', minLength: 1, maxLength: 2000 },
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
                  videoId: { type: 'string' },
                  parentId: { type: ['string', 'null'] },
                  body: { type: 'string' },
                  createdAt: { type: 'string' },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateCommentInput }>, reply: FastifyReply) => {
      const input = validate(createCommentSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;
      const userRole = request.user!.role;

      const result = await commentService.createComment(input, userId, tenantId);

      // Create notification when coach comments on a player's video
      if (userRole === 'coach') {
        // Get video owner (player) to notify them
        const video = await prisma.video.findUnique({
          where: { id: input.videoId },
          select: { playerId: true, title: true },
        });

        if (video && video.playerId !== userId) {
          // Get coach name for notification
          const coach = await prisma.coach.findFirst({
            where: { userId },
            select: { firstName: true, lastName: true },
          });
          const coachName = coach ? `${coach.firstName} ${coach.lastName}` : 'Treneren';

          // Create in-app notification for player
          const notification = await prisma.notification.create({
            data: {
              recipientType: 'player',
              recipientId: video.playerId,
              notificationType: 'comment_created',
              title: 'Ny kommentar på video',
              message: `${coachName} har kommentert på videoen "${video.title}"`,
              metadata: {
                videoId: input.videoId,
                videoTitle: video.title,
                commentId: result.id,
                coachId: userId,
              },
              channels: ['app'],
              status: 'sent',
              sentAt: new Date(),
            },
          });

          // Push real-time notification via SSE
          await publishNotification(notification);
        }
      }

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /comments/video/:videoId
   * List comments for a video
   */
  app.get<{
    Params: { videoId: string };
    Querystring: Omit<ListCommentsInput, 'videoId'>;
  }>(
    '/video/:videoId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List comments for a video',
        tags: ['comments'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['videoId'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            parentId: { type: ['string', 'null'] },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
            offset: { type: 'number', minimum: 0, default: 0 },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
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
                  comments: { type: 'array' },
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
    async (
      request: FastifyRequest<{
        Params: { videoId: string };
        Querystring: Omit<ListCommentsInput, 'videoId'>;
      }>,
      reply: FastifyReply
    ) => {
      const input = validate(listCommentsSchema, {
        videoId: request.params.videoId,
        ...request.query,
      });
      const tenantId = request.user!.tenantId;

      const result = await commentService.listComments(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /comments/video/:videoId/count
   * Get comment count for a video
   */
  app.get<{ Params: { videoId: string } }>(
    '/video/:videoId/count',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get comment count for a video',
        tags: ['comments'],
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
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { videoId: string } }>, reply: FastifyReply) => {
      const tenantId = request.user!.tenantId;

      const result = await commentService.getCommentCount(request.params.videoId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /comments/:id
   * Get comment by ID
   */
  app.get<{ Params: GetCommentInput }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get comment by ID',
        tags: ['comments'],
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
    async (request: FastifyRequest<{ Params: GetCommentInput }>, reply: FastifyReply) => {
      const input = validate(getCommentSchema, request.params);
      const tenantId = request.user!.tenantId;

      const comment = await commentService.getComment(input.id, tenantId);

      return reply.status(200).send({
        success: true,
        data: comment,
      });
    }
  );

  /**
   * GET /comments/:id/replies
   * Get replies to a comment
   */
  app.get<{
    Params: { id: string };
    Querystring: Omit<GetCommentRepliesInput, 'parentId'>;
  }>(
    '/:id/replies',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get replies to a comment',
        tags: ['comments'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'number', minimum: 0, default: 0 },
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
                  replies: { type: 'array' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: Omit<GetCommentRepliesInput, 'parentId'>;
      }>,
      reply: FastifyReply
    ) => {
      const input = validate(getCommentRepliesSchema, {
        parentId: request.params.id,
        ...request.query,
      });
      const tenantId = request.user!.tenantId;

      const result = await commentService.getCommentReplies(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * PATCH /comments/:id
   * Update comment
   */
  app.patch<{ Params: { id: string }; Body: Omit<UpdateCommentInput, 'id'> }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Update comment',
        tags: ['comments'],
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
          required: ['body'],
          properties: {
            body: { type: 'string', minLength: 1, maxLength: 2000 },
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
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<UpdateCommentInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(updateCommentSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await commentService.updateComment(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Comment updated successfully',
      });
    }
  );

  /**
   * DELETE /comments/:id
   * Delete comment
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Delete comment (soft delete)',
        tags: ['comments'],
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
      validate(deleteCommentSchema, request.params);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await commentService.deleteComment(request.params.id, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Comment deleted successfully',
      });
    }
  );
}
