/**
 * In-Memory Notification Bus
 *
 * Simple pub/sub for single-instance deployments.
 * Use this when Redis is not available or for local development.
 *
 * WARNING: Does NOT work across multiple API instances.
 * For horizontal scaling, use redisNotificationBus.ts instead.
 */

import { logger } from '../../utils/logger';
import type { NotificationPayload } from './redisNotificationBus';

type NotificationHandler = (payload: NotificationPayload) => void;

// In-memory subscriptions
const subscriptions = new Map<string, Set<NotificationHandler>>();

/**
 * Publish a notification to a user (in-memory only)
 */
export function publish(userId: string, payload: NotificationPayload): boolean {
  const handlers = subscriptions.get(userId);

  if (!handlers || handlers.size === 0) {
    logger.debug({ userId }, 'No subscribers for user (in-memory)');
    return false;
  }

  handlers.forEach((handler) => {
    try {
      handler(payload);
    } catch (error) {
      logger.error({ error }, 'In-memory notification handler error');
    }
  });

  logger.debug({ userId, type: payload.type }, 'Notification published (in-memory)');
  return true;
}

/**
 * Subscribe to notifications for a user (in-memory)
 */
export function subscribe(
  userId: string,
  handler: NotificationHandler
): () => void {
  if (!subscriptions.has(userId)) {
    subscriptions.set(userId, new Set());
  }

  subscriptions.get(userId)!.add(handler);
  logger.debug({ userId }, 'Subscribed to notifications (in-memory)');

  // Return unsubscribe function
  return () => {
    const handlers = subscriptions.get(userId);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        subscriptions.delete(userId);
      }
    }
    logger.debug({ userId }, 'Unsubscribed from notifications (in-memory)');
  };
}

/**
 * Get active subscription count
 */
export function getActiveSubscriptionCount(): number {
  let count = 0;
  subscriptions.forEach((handlers) => {
    count += handlers.size;
  });
  return count;
}

/**
 * Clear all subscriptions
 */
export function clearAllSubscriptions(): void {
  subscriptions.clear();
  logger.info('All in-memory subscriptions cleared');
}
