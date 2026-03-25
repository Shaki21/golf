import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AnyFastifyInstance } from '../types/fastify';

/**
 * Redis Cache Service
 * Provides caching functionality with TTL support
 */
class CacheService {
  private redis: Redis | null = null;
  private prefix: string = 'iup:';
  private defaultTTL: number = 3600; // 1 hour

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    // Skip if Redis is not configured (REDIS_URL not set)
    if (!config.redis.enabled || !config.redis.url) {
      logger.info('Redis not configured (REDIS_URL not set) - caching disabled');
      return;
    }

    try {
      this.redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed, caching disabled');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
        lazyConnect: true,
      });

      await this.redis.connect();
      logger.info('Redis cache connected');
    } catch (error) {
      logger.warn({ error }, 'Redis connection failed, caching disabled');
      this.redis = null;
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.redis?.status === 'ready';
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      const data = await this.redis!.get(this.prefix + key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error({ error, key }, 'Cache get error');
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const ttl = ttlSeconds || this.defaultTTL;
      await this.redis!.setex(
        this.prefix + key,
        ttl,
        JSON.stringify(value)
      );
      return true;
    } catch (error) {
      logger.error({ error, key }, 'Cache set error');
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.redis!.del(this.prefix + key);
      return true;
    } catch (error) {
      logger.error({ error, key }, 'Cache delete error');
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      const keys = await this.redis!.keys(this.prefix + pattern);
      if (keys.length > 0) {
        await this.redis!.del(...keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      logger.error({ error, pattern }, 'Cache delete by pattern error');
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      return (await this.redis!.exists(this.prefix + key)) === 1;
    } catch (error) {
      logger.error({ error, key }, 'Cache exists error');
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;

    try {
      return await this.redis!.ttl(this.prefix + key);
    } catch (error) {
      logger.error({ error, key }, 'Cache TTL error');
      return -1;
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const data = await fetchFn();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  /**
   * Increment a counter
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      return await this.redis!.incrby(this.prefix + key, amount);
    } catch (error) {
      logger.error({ error, key }, 'Cache incr error');
      return 0;
    }
  }

  /**
   * Set counter with expiry (for rate limiting)
   */
  async incrWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      const pipeline = this.redis!.pipeline();
      pipeline.incr(this.prefix + key);
      pipeline.expire(this.prefix + key, ttlSeconds);
      const results = await pipeline.exec();
      return (results?.[0]?.[1] as number) || 0;
    } catch (error) {
      logger.error({ error, key }, 'Cache incrWithExpiry error');
      return 0;
    }
  }

  /**
   * Flush all cache with prefix
   */
  async flush(): Promise<void> {
    if (!this.isAvailable()) return;

    try {
      const keys = await this.redis!.keys(this.prefix + '*');
      if (keys.length > 0) {
        await this.redis!.del(...keys);
      }
      logger.info({ keysDeleted: keys.length }, 'Cache flushed');
    } catch (error) {
      logger.error({ error }, 'Cache flush error');
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      logger.info('Redis cache disconnected');
    }
  }
}

// Singleton instance
export const cache = new CacheService();

/**
 * Cache key generators for common entities
 */
export const CacheKeys = {
  player: (id: string) => `player:${id}`,
  playerDashboard: (id: string) => `player:${id}:dashboard`,
  playerPlan: (id: string) => `player:${id}:plan`,
  playerTests: (id: string) => `player:${id}:tests`,
  playerAchievements: (id: string) => `player:${id}:achievements`,
  coachAthletes: (coachId: string) => `coach:${coachId}:athletes`,
  coachStats: (coachId: string) => `coach:${coachId}:stats`,
  exercises: (tenantId: string) => `exercises:${tenantId}`,
  exercise: (id: string) => `exercise:${id}`,
  session: (id: string) => `session:${id}`,
  trainingPlan: (playerId: string, week: number) => `plan:${playerId}:week:${week}`,
};

/**
 * TTL values in seconds
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

/**
 * Cache decorator for route handlers
 * Usage: @Cached(CacheKeys.player, CacheTTL.MEDIUM)
 */
export function withCache<T>(
  keyFn: (...args: unknown[]) => string,
  ttl: number = CacheTTL.MEDIUM
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = keyFn(...args);
      const cached = await cache.get<T>(cacheKey);

      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, result, ttl);
      return result;
    };

    return descriptor;
  };
}

/**
 * Register cache plugin with Fastify
 */
export async function registerCache(app: AnyFastifyInstance): Promise<void> {
  await cache.connect();

  // Decorate app with cache instance
  app.decorate('cache', cache);

  // Graceful shutdown
  app.addHook('onClose', async () => {
    await cache.disconnect();
  });

  // Cache stats endpoint
  app.get('/cache/stats', {
    schema: {
      description: 'Cache statistics',
      tags: ['cache'],
      response: {
        200: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            status: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return {
      available: cache.isAvailable(),
      status: cache.isAvailable() ? 'connected' : 'disconnected',
    };
  });

  logger.info('Cache plugin registered');
}

export default registerCache;
