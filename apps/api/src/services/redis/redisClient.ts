/**
 * Redis Client Singleton
 * Provides separate connections for publishing and subscribing (required for Redis pub/sub)
 */

import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../../utils/logger';

let publisher: Redis | null = null;
let subscriber: Redis | null = null;
let isConnecting = false;

/**
 * Check if Redis is configured (REDIS_URL is set)
 */
export function isRedisConfigured(): boolean {
  return config.redis.enabled && !!config.redis.url;
}

/**
 * Create a new Redis connection with retry logic
 */
function createConnection(name: string): Redis {
  if (!config.redis.url) {
    throw new Error('Redis URL not configured');
  }

  const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 5) {
        logger.error({ name }, 'Redis connection failed after 5 retries');
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      logger.warn({ name, times, delay }, 'Redis reconnecting...');
      return delay;
    },
    lazyConnect: true,
  });

  redis.on('connect', () => {
    logger.info({ name }, 'Redis connected');
  });

  redis.on('error', (err) => {
    logger.error({ name, err: err.message }, 'Redis error');
  });

  redis.on('close', () => {
    logger.warn({ name }, 'Redis connection closed');
  });

  return redis;
}

/**
 * Get the Redis publisher connection
 * Used for publishing messages to channels
 */
export async function getPublisher(): Promise<Redis> {
  if (publisher && publisher.status === 'ready') {
    return publisher;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getPublisher();
  }

  isConnecting = true;
  try {
    publisher = createConnection('publisher');
    await publisher.connect();
    return publisher;
  } finally {
    isConnecting = false;
  }
}

/**
 * Get the Redis subscriber connection
 * Used for subscribing to channels (separate connection required by Redis)
 */
export async function getSubscriber(): Promise<Redis> {
  if (subscriber && subscriber.status === 'ready') {
    return subscriber;
  }

  subscriber = createConnection('subscriber');
  await subscriber.connect();
  return subscriber;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return publisher?.status === 'ready' || false;
}

/**
 * Disconnect all Redis connections
 */
export async function disconnectRedis(): Promise<void> {
  const disconnects: Promise<void>[] = [];

  if (publisher) {
    disconnects.push(
      publisher.quit().then(() => {
        publisher = null;
        logger.info('Redis publisher disconnected');
      })
    );
  }

  if (subscriber) {
    disconnects.push(
      subscriber.quit().then(() => {
        subscriber = null;
        logger.info('Redis subscriber disconnected');
      })
    );
  }

  await Promise.all(disconnects);
}
