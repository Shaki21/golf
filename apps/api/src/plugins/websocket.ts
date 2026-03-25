import { IncomingMessage } from 'http';
import websocket from '@fastify/websocket';
import { WebSocket } from 'ws';
import { verifyToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { AccessTokenPayload } from '../utils/jwt';
import { AnyFastifyInstance } from '../types/fastify';

/**
 * Extended IncomingMessage with user from WebSocket auth
 */
interface AuthenticatedIncomingMessage extends IncomingMessage {
  user?: AccessTokenPayload;
}

/**
 * WebSocket Connection Store
 * Tracks connected clients by user ID for targeted messaging
 */
interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  role: string;
  tenantId: string;
  connectedAt: Date;
  lastPing: Date;
}

class WebSocketManager {
  private clients: Map<string, ConnectedClient[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Add a new WebSocket connection
   */
  addClient(ws: WebSocket, userId: string, role: string, tenantId: string): void {
    const client: ConnectedClient = {
      ws,
      userId,
      role,
      tenantId,
      connectedAt: new Date(),
      lastPing: new Date(),
    };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(client);

    logger.info({ userId, role, tenantId }, 'WebSocket client connected');
  }

  /**
   * Remove a WebSocket connection
   */
  removeClient(ws: WebSocket, userId: string): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.findIndex((c) => c.ws === ws);
      if (index > -1) {
        userClients.splice(index, 1);
        if (userClients.length === 0) {
          this.clients.delete(userId);
        }
      }
    }
    logger.info({ userId }, 'WebSocket client disconnected');
  }

  /**
   * Send message to specific user (all their connections)
   */
  sendToUser(userId: string, type: string, payload: unknown): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
      userClients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });
    }
  }

  /**
   * Send message to all users with specific role
   */
  sendToRole(role: string, type: string, payload: unknown, excludeUserId?: string): void {
    const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    this.clients.forEach((userClients, userId) => {
      if (excludeUserId && userId === excludeUserId) return;
      userClients.forEach((client) => {
        if (client.role === role && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });
    });
  }

  /**
   * Send message to all users in tenant
   */
  sendToTenant(tenantId: string, type: string, payload: unknown, excludeUserId?: string): void {
    const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    this.clients.forEach((userClients, userId) => {
      if (excludeUserId && userId === excludeUserId) return;
      userClients.forEach((client) => {
        if (client.tenantId === tenantId && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });
    });
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(type: string, payload: unknown): void {
    const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      });
    });
  }

  /**
   * Get connection statistics
   */
  getStats(): { totalConnections: number; uniqueUsers: number } {
    let totalConnections = 0;
    this.clients.forEach((clients) => {
      totalConnections += clients.length;
    });
    return {
      totalConnections,
      uniqueUsers: this.clients.size,
    };
  }

  /**
   * Heartbeat to clean up dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((userClients, userId) => {
        userClients.forEach((client, index) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            // Send ping
            client.ws.ping();
            client.lastPing = new Date();
          } else {
            // Remove dead connections
            userClients.splice(index, 1);
          }
        });
        if (userClients.length === 0) {
          this.clients.delete(userId);
        }
      });
    }, 30000); // 30 seconds
  }

  /**
   * Cleanup on shutdown
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        client.ws.close(1001, 'Server shutting down');
      });
    });
    this.clients.clear();
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

/**
 * Event types for real-time updates
 */
export const WS_EVENTS = {
  // Session events
  SESSION_CREATED: 'session:created',
  SESSION_UPDATED: 'session:updated',
  SESSION_STARTED: 'session:started',
  SESSION_COMPLETED: 'session:completed',
  SESSION_EVALUATION_ADDED: 'session:evaluation_added',

  // Training plan events
  PLAN_UPDATED: 'plan:updated',
  PLAN_WEEK_CHANGED: 'plan:week_changed',

  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  BADGE_EARNED: 'badge:earned',

  // Coach events
  COACH_NOTE_ADDED: 'coach:note_added',
  COACH_FEEDBACK: 'coach:feedback',

  // Video events
  VIDEO_UPLOADED: 'video:uploaded',
  VIDEO_REQUEST_CREATED: 'video:request_created',
  VIDEO_SHARED: 'video:shared',
  VIDEO_REVIEWED: 'video:reviewed',
  ANNOTATION_ADDED: 'annotation:added',
  VIDEO_COMMENT_ADDED: 'video:comment_added',

  // Notification events
  NOTIFICATION: 'notification',

  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  CONNECTION_ACK: 'connection:ack',
  PING: 'ping',
  PONG: 'pong',
} as const;

/**
 * Register WebSocket plugin with Fastify
 */
export async function registerWebSocket(app: AnyFastifyInstance): Promise<void> {
  await app.register(websocket, {
    options: {
      maxPayload: 1048576, // 1MB
      verifyClient: async (
        info: { origin: string; secure: boolean; req: IncomingMessage },
        callback: (result: boolean, code?: number, message?: string) => void
      ) => {
        // Extract token from query string
        const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
          callback(false, 401, 'Unauthorized: Token required');
          return;
        }

        try {
          const decoded = await verifyToken(token);
          if (decoded) {
            // Attach user info to request
            (info.req as AuthenticatedIncomingMessage).user = decoded;
            callback(true);
          } else {
            callback(false, 401, 'Unauthorized: Invalid token');
          }
        } catch {
          callback(false, 401, 'Unauthorized: Invalid token');
        }
      },
    },
  });

  // WebSocket endpoint
  app.get('/ws', { websocket: true }, (connection, req) => {
    const user = (req as unknown as AuthenticatedIncomingMessage).user;
    const ws = connection as unknown as WebSocket;

    if (!user) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const { id: userId, role, tenantId } = user;

    // Register connection
    wsManager.addClient(ws, userId, role, tenantId);

    // Send acknowledgment
    ws.send(
      JSON.stringify({
        type: WS_EVENTS.CONNECTION_ACK,
        payload: {
          userId,
          role,
          connectedAt: new Date().toISOString(),
        },
      })
    );

    // Handle incoming messages
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle ping/pong
        if (data.type === WS_EVENTS.PING) {
          ws.send(
            JSON.stringify({
              type: WS_EVENTS.PONG,
              timestamp: new Date().toISOString(),
            })
          );
        }

        // Handle other message types if needed
        logger.debug({ userId, type: data.type }, 'WebSocket message received');
      } catch (error) {
        logger.error({ error }, 'Failed to parse WebSocket message');
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      wsManager.removeClient(ws, userId);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      logger.error({ error, userId }, 'WebSocket error');
      wsManager.removeClient(ws, userId);
    });
  });

  // Stats endpoint for monitoring
  app.get('/ws/stats', {
    schema: {
      description: 'WebSocket connection statistics',
      tags: ['websocket'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalConnections: { type: 'number' },
            uniqueUsers: { type: 'number' },
          },
        },
      },
    },
  }, async () => {
    return wsManager.getStats();
  });

  // Graceful shutdown
  app.addHook('onClose', async () => {
    wsManager.shutdown();
  });

  logger.info('WebSocket plugin registered');
}

export default registerWebSocket;
