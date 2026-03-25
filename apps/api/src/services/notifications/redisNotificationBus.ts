/**
 * Redis Notification Bus
 *
 * Pub/Sub system for real-time notifications across multiple API instances.
 *
 * Channel strategy: Per-user channels (notifications:user:{userId})
 * - Simple, efficient - each user only receives their own notifications
 * - No filtering needed on receive
 *
 * For single-instance deployments, see inMemoryNotificationBus.ts as alternative.
 */

import { getPublisher, getSubscriber, isRedisAvailable } from '../redis/redisClient';
import { logger } from '../../utils/logger';

/**
 * Notification payload (minimal, non-sensitive data only)
 */
export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body?: string;
  entityType?: 'video' | 'comment' | 'session' | 'goal' | 'achievement';
  entityId?: string;
  createdAt: string;
  isRead: boolean;
}

type NotificationHandler = (payload: NotificationPayload) => void;

// Track active subscriptions per user
const activeSubscriptions = new Map<string, Set<NotificationHandler>>();

// Channel prefix
const CHANNEL_PREFIX = 'notifications:user:';

/**
 * Get channel name for a user
 */
function getChannel(userId: string): string {
  return `${CHANNEL_PREFIX}${userId}`;
}

/**
 * Publish a notification to a user's channel
 */
export async function publish(userId: string, payload: NotificationPayload): Promise<boolean> {
  try {
    const publisher = await getPublisher();
    const channel = getChannel(userId);
    const message = JSON.stringify(payload);

    await publisher.publish(channel, message);
    logger.debug({ userId, type: payload.type }, 'Notification published to Redis');
    return true;
  } catch (error) {
    logger.error({ error, userId }, 'Failed to publish notification to Redis');
    return false;
  }
}

/**
 * Subscribe to a user's notification channel
 * Returns an unsubscribe function
 */
export async function subscribe(
  userId: string,
  handler: NotificationHandler
): Promise<() => Promise<void>> {
  const channel = getChannel(userId);

  // Track this handler
  if (!activeSubscriptions.has(userId)) {
    activeSubscriptions.set(userId, new Set());
  }
  activeSubscriptions.get(userId)!.add(handler);

  try {
    const subscriber = await getSubscriber();

    // Set up message handler if this is the first subscription for this user
    const handlers = activeSubscriptions.get(userId)!;
    if (handlers.size === 1) {
      // Subscribe to the channel
      await subscriber.subscribe(channel);
      logger.debug({ userId, channel }, 'Subscribed to Redis channel');
    }

    // Global message handler (only set once)
    subscriber.removeAllListeners('message');
    subscriber.on('message', (receivedChannel: string, message: string) => {
      // Extract userId from channel
      if (!receivedChannel.startsWith(CHANNEL_PREFIX)) return;

      const targetUserId = receivedChannel.slice(CHANNEL_PREFIX.length);
      const userHandlers = activeSubscriptions.get(targetUserId);

      if (userHandlers) {
        try {
          const payload = JSON.parse(message) as NotificationPayload;
          userHandlers.forEach((h) => {
            try {
              h(payload);
            } catch (err) {
              logger.error({ err }, 'Notification handler error');
            }
          });
        } catch (parseError) {
          logger.error({ parseError, message }, 'Failed to parse notification message');
        }
      }
    });

    // Return unsubscribe function
    return async () => {
      handlers.delete(handler);

      // If no more handlers for this user, unsubscribe from channel
      if (handlers.size === 0) {
        activeSubscriptions.delete(userId);
        try {
          const sub = await getSubscriber();
          await sub.unsubscribe(channel);
          logger.debug({ userId, channel }, 'Unsubscribed from Redis channel');
        } catch (error) {
          logger.error({ error, channel }, 'Failed to unsubscribe from Redis channel');
        }
      }
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to subscribe to Redis channel');
    // Remove handler on failure
    activeSubscriptions.get(userId)?.delete(handler);
    if (activeSubscriptions.get(userId)?.size === 0) {
      activeSubscriptions.delete(userId);
    }
    throw error;
  }
}

/**
 * Check if Redis pub/sub is available
 */
export function isPubSubAvailable(): boolean {
  return isRedisAvailable();
}

/**
 * Get active subscription count (for monitoring)
 */
export function getActiveSubscriptionCount(): number {
  let count = 0;
  activeSubscriptions.forEach((handlers) => {
    count += handlers.size;
  });
  return count;
}

/**
 * Clear all subscriptions (for shutdown)
 */
export async function clearAllSubscriptions(): Promise<void> {
  const subscriber = await getSubscriber();
  const channels = Array.from(activeSubscriptions.keys()).map(getChannel);

  if (channels.length > 0) {
    await subscriber.unsubscribe(...channels);
  }

  activeSubscriptions.clear();
  logger.info('All Redis subscriptions cleared');
}
