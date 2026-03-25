/**
 * Notification Bus - Unified interface
 *
 * Automatically uses Redis when available, falls back to in-memory.
 *
 * Configuration:
 * - Set REDIS_URL or REDIS_HOST/REDIS_PORT for Redis pub/sub
 * - If Redis is unavailable, falls back to in-memory (single instance only)
 *
 * Scaling:
 * - Single instance: in-memory OK
 * - Multiple instances: Redis REQUIRED
 */

import * as redisBus from './redisNotificationBus';
import * as memoryBus from './inMemoryNotificationBus';
import { isRedisAvailable, isRedisConfigured } from '../redis/redisClient';
import { logger } from '../../utils/logger';

export type { NotificationPayload } from './redisNotificationBus';
import type { NotificationPayload } from './redisNotificationBus';

type NotificationHandler = (payload: NotificationPayload) => void;

let useRedis = false;

/**
 * Initialize the notification bus
 * Call this on app startup
 */
export async function initNotificationBus(): Promise<void> {
  // Skip Redis if not configured (REDIS_URL not set)
  if (!isRedisConfigured()) {
    useRedis = false;
    logger.info('Redis not configured - using in-memory notification bus');
    return;
  }

  try {
    // Try to connect to Redis
    const { getPublisher } = await import('../redis/redisClient');
    await getPublisher();
    useRedis = true;
    logger.info('Notification bus initialized with Redis pub/sub');
  } catch (error) {
    useRedis = false;
    logger.warn(
      { error },
      'Redis not available - using in-memory notification bus. ' +
        'WARNING: Notifications will not work across multiple API instances.'
    );
  }
}

/**
 * Check if using Redis (for diagnostics)
 */
export function isUsingRedis(): boolean {
  return useRedis && isRedisAvailable();
}

/**
 * Publish a notification to a user
 */
export async function publish(userId: string, payload: NotificationPayload): Promise<boolean> {
  if (useRedis && isRedisAvailable()) {
    return redisBus.publish(userId, payload);
  }
  return memoryBus.publish(userId, payload);
}

/**
 * Subscribe to notifications for a user
 * Returns an unsubscribe function
 */
export async function subscribe(
  userId: string,
  handler: NotificationHandler
): Promise<() => Promise<void>> {
  if (useRedis && isRedisAvailable()) {
    return redisBus.subscribe(userId, handler);
  }

  // Wrap in-memory unsubscribe to return Promise
  const unsubscribe = memoryBus.subscribe(userId, handler);
  return async () => unsubscribe();
}

/**
 * Get status info for monitoring
 */
export function getStatus(): {
  mode: 'redis' | 'memory';
  activeSubscriptions: number;
  redisAvailable: boolean;
} {
  const redisAvailable = isRedisAvailable();
  const mode = useRedis && redisAvailable ? 'redis' : 'memory';

  return {
    mode,
    activeSubscriptions:
      mode === 'redis'
        ? redisBus.getActiveSubscriptionCount()
        : memoryBus.getActiveSubscriptionCount(),
    redisAvailable,
  };
}

/**
 * Cleanup on shutdown
 */
export async function shutdown(): Promise<void> {
  if (useRedis) {
    await redisBus.clearAllSubscriptions();
  } else {
    memoryBus.clearAllSubscriptions();
  }
  logger.info('Notification bus shutdown complete');
}
