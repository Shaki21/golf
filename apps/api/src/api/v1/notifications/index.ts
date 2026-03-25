import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, verifyToken } from '../../../middleware/auth';
import { subscribe, getStatus, NotificationPayload } from '../../../services/notifications/notificationBus';
import { logger } from '../../../utils/logger';
import { authenticationError } from '../../../core/errors';
import { setNoStore } from '../../../middleware/cacheHeaders';

/**
 * Register notification routes
 *
 * Endpoints:
 * - GET /notifications - List user notifications (latest 50, sorted desc)
 * - PATCH /notifications/:id/read - Mark single notification as read
 * - POST /notifications/read-all - Mark all user notifications as read
 * - POST /push-subscription - Register a push subscription
 * - DELETE /push-subscription - Unregister a push subscription
 */
export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();

  /**
   * GET /notifications
   * List notifications for the authenticated user
   * Supports pagination with limit and cursor
   */
  app.get<{
    Querystring: { unreadOnly?: string; limit?: string; cursor?: string };
  }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List notifications for the authenticated user',
        tags: ['notifications'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            unreadOnly: {
              type: 'string',
              enum: ['0', '1', 'true', 'false'],
              description: 'Filter to only unread notifications',
            },
            limit: {
              type: 'string',
              description: 'Max items to return (1-100, default 50)',
            },
            cursor: {
              type: 'string',
              description: 'Cursor for pagination (notification ID)',
            },
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
                  notifications: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        notificationType: { type: 'string' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        metadata: { type: 'object' },
                        readAt: { type: ['string', 'null'] },
                        createdAt: { type: 'string' },
                      },
                    },
                  },
                  unreadCount: { type: 'number' },
                  nextCursor: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: { unreadOnly?: string; limit?: string; cursor?: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user!.id;
      const unreadOnly =
        request.query.unreadOnly === '1' || request.query.unreadOnly === 'true';

      // Parse pagination params
      const limit = Math.min(Math.max(parseInt(request.query.limit || '50', 10), 1), 100);
      const cursor = request.query.cursor;

      // Build where clause
      const whereClause: any = {
        recipientId: userId,
        channels: {
          path: [],
          array_contains: 'app',
        },
      };

      if (unreadOnly) {
        whereClause.readAt = null;
      }

      // Fetch notifications with cursor-based pagination
      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit + 1, // Fetch one extra to determine if there's a next page
          ...(cursor && {
            cursor: { id: cursor },
            skip: 1, // Skip the cursor item itself
          }),
          select: {
            id: true,
            notificationType: true,
            title: true,
            message: true,
            metadata: true,
            readAt: true,
            createdAt: true,
          },
        }),
        prisma.notification.count({
          where: {
            recipientId: userId,
            readAt: null,
            channels: {
              path: [],
              array_contains: 'app',
            },
          },
        }),
      ]);

      // Determine next cursor
      let nextCursor: string | null = null;
      if (notifications.length > limit) {
        const nextItem = notifications.pop(); // Remove the extra item
        nextCursor = nextItem!.id;
      }

      // No-store: real-time data must be fresh
      setNoStore(reply);

      return reply.status(200).send({
        success: true,
        data: {
          notifications,
          unreadCount,
          nextCursor,
        },
      });
    }
  );

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read
   */
  app.patch<{ Params: { id: string } }>(
    '/:id/read',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Mark a notification as read',
        tags: ['notifications'],
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
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const userId = request.user!.id;
      const notificationId = request.params.id;

      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          recipientId: userId,
        },
      });

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      // Mark as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });

      return reply.status(200).send({
        success: true,
        message: 'Notification marked as read',
      });
    }
  );

  /**
   * POST /notifications/read-all
   * Mark all user notifications as read
   */
  app.post(
    '/read-all',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Mark all notifications as read',
        tags: ['notifications'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.id;

      // Mark all unread notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          readAt: null,
        },
        data: { readAt: new Date() },
      });

      return reply.status(200).send({
        success: true,
        message: 'All notifications marked as read',
        count: result.count,
      });
    }
  );

  // ============================================================================
  // PUSH SUBSCRIPTION ENDPOINTS
  // ============================================================================

  /**
   * POST /push-subscription
   * Register a push notification subscription
   */
  app.post<{
    Body: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      deviceType?: string;
    };
  }>(
    '/push-subscription',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Register a push notification subscription',
        tags: ['notifications'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['endpoint', 'keys'],
          properties: {
            endpoint: { type: 'string', format: 'uri' },
            keys: {
              type: 'object',
              required: ['p256dh', 'auth'],
              properties: {
                p256dh: { type: 'string' },
                auth: { type: 'string' },
              },
            },
            deviceType: { type: 'string', enum: ['web', 'mobile', 'desktop'] },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              subscriptionId: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const { endpoint, keys, deviceType } = request.body;
      const userAgent = request.headers['user-agent'] || null;

      // Upsert subscription (update if same endpoint exists)
      const subscription = await prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: { userId, endpoint },
        },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          deviceType: deviceType || 'web',
          isActive: true,
          lastUsedAt: new Date(),
        },
        create: {
          userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          deviceType: deviceType || 'web',
        },
      });

      logger.info({ userId, subscriptionId: subscription.id }, 'Push subscription registered');

      return reply.status(201).send({
        success: true,
        message: 'Push subscription registered',
        subscriptionId: subscription.id,
      });
    }
  );

  /**
   * DELETE /push-subscription
   * Unregister a push notification subscription
   */
  app.delete<{ Body: { endpoint: string } }>(
    '/push-subscription',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Unregister a push notification subscription',
        tags: ['notifications'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['endpoint'],
          properties: {
            endpoint: { type: 'string', format: 'uri' },
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
    async (request, reply) => {
      const userId = request.user!.id;
      const { endpoint } = request.body;

      // Delete the subscription
      const deleted = await prisma.pushSubscription.deleteMany({
        where: { userId, endpoint },
      });

      if (deleted.count === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Subscription not found',
        });
      }

      logger.info({ userId, endpoint }, 'Push subscription removed');

      return reply.status(200).send({
        success: true,
        message: 'Push subscription removed',
      });
    }
  );

  /**
   * GET /notifications/stream
   * Server-Sent Events stream for real-time notifications
   *
   * Auth: Accepts token via:
   * - Authorization header (Bearer token)
   * - Query param (?token=xxx) - for EventSource which doesn't support headers
   *
   * Headers:
   * - Content-Type: text/event-stream
   * - Cache-Control: no-cache
   * - Connection: keep-alive
   *
   * Events:
   * - connected: Initial connection confirmation
   * - notification: New notification payload
   * - ping: Keep-alive (every 25s)
   * - error: Connection error (non-sensitive)
   */
  app.get<{ Querystring: { token?: string } }>(
    '/stream',
    {
      schema: {
        description: 'Real-time notification stream (SSE)',
        tags: ['notifications'],
        querystring: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT token (for EventSource)' },
          },
        },
        response: {
          200: {
            type: 'string',
            description: 'SSE event stream',
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { token?: string } }>, reply: FastifyReply) => {
      // Authenticate via header or query param
      let userId: string;

      // Try Authorization header first
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await verifyToken(token);
        if (!payload) {
          throw authenticationError('Invalid token');
        }
        userId = payload.id;
        request.user = payload;
      } else if (request.query.token) {
        // Fallback to query param (for EventSource)
        const payload = await verifyToken(request.query.token);
        if (!payload) {
          throw authenticationError('Invalid token');
        }
        userId = payload.id;
        request.user = payload;
      } else {
        throw authenticationError('No token provided');
      }

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      });

      // Helper to write SSE event
      const writeEvent = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\n`);
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Send initial connection event
      writeEvent('connected', {
        message: 'SSE connection established',
        mode: getStatus().mode,
        timestamp: new Date().toISOString(),
      });

      logger.info({ userId }, 'SSE stream connected');

      // Subscribe to notifications for this user
      let unsubscribe: (() => Promise<void>) | null = null;

      try {
        unsubscribe = await subscribe(userId, (payload: NotificationPayload) => {
          try {
            writeEvent('notification', payload);
          } catch (err) {
            logger.error({ err, userId }, 'Failed to write SSE notification');
          }
        });
      } catch (err) {
        logger.error({ err, userId }, 'Failed to subscribe to notifications');
        writeEvent('error', { message: 'Subscription failed' });
        reply.raw.end();
        return;
      }

      // Keep-alive ping every 25 seconds
      const pingInterval = setInterval(() => {
        try {
          writeEvent('ping', { timestamp: new Date().toISOString() });
        } catch {
          // Connection closed
          clearInterval(pingInterval);
        }
      }, 25000);

      // Cleanup on close
      request.raw.on('close', async () => {
        clearInterval(pingInterval);
        if (unsubscribe) {
          await unsubscribe();
        }
        logger.info({ userId }, 'SSE stream disconnected');
      });

      // Keep the connection open (Fastify will handle the response)
      // Don't call reply.send() - we're streaming
    }
  );

  /**
   * GET /notifications/stream/status
   * Get notification bus status (for diagnostics)
   */
  app.get(
    '/stream/status',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get notification stream status',
        tags: ['notifications'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  mode: { type: 'string', enum: ['redis', 'memory'] },
                  activeSubscriptions: { type: 'number' },
                  redisAvailable: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        success: true,
        data: getStatus(),
      });
    }
  );
}
