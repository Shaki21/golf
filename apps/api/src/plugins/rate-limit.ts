import { FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { logger } from '../utils/logger';
import { AnyFastifyInstance } from '../types/fastify';

/**
 * Rate limit configurations for different endpoints
 */
export const RateLimitConfig = {
  // General API rate limit - increased for development
  default: {
    max: 1000,
    timeWindow: '1 minute',
  },
  // Auth endpoints (login, register) - relaxed for dev
  auth: {
    max: 50,
    timeWindow: '1 minute',
  },
  // Heavy endpoints (reports, exports)
  heavy: {
    max: 10,
    timeWindow: '1 minute',
  },
  // Write operations
  write: {
    max: 30,
    timeWindow: '1 minute',
  },
  // Search/query operations
  search: {
    max: 50,
    timeWindow: '1 minute',
  },
};

/**
 * Get user identifier for rate limiting
 * Uses authenticated user ID if available, falls back to IP
 */
function keyGenerator(request: FastifyRequest): string {
  const userId = request.user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  // Fallback to IP for unauthenticated requests
  return `ip:${request.ip}`;
}

/**
 * Custom error response for rate limit exceeded
 */
function errorResponseBuilder(
  _request: FastifyRequest,
  context: { max: number; ttl: number }
): { statusCode: number; error: string; message: string; retryAfter: number } {
  return {
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Du har oversteget grensen på ${context.max} forespørsler. Prøv igjen om ${Math.ceil(context.ttl / 1000)} sekunder.`,
    retryAfter: Math.ceil(context.ttl / 1000),
  };
}

/**
 * Register rate limiting plugin
 */
export async function registerRateLimit(app: AnyFastifyInstance): Promise<void> {
  // Disable rate limiting in test environment unless explicitly enabled
  // Set ENABLE_RATE_LIMIT_IN_TESTS=true to test rate limiting behavior
  if (process.env.NODE_ENV === 'test' && process.env.ENABLE_RATE_LIMIT_IN_TESTS !== 'true') {
    logger.info('Rate limiting disabled for test environment');
    return;
  }

  await app.register(rateLimit, {
    global: true,
    max: RateLimitConfig.default.max,
    timeWindow: RateLimitConfig.default.timeWindow,
    keyGenerator,
    errorResponseBuilder,
    // Custom hook to add rate limit headers
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    // Skip rate limiting for health checks
    allowList: (request: FastifyRequest) => {
      return request.url === '/health' || request.url === '/ws/stats';
    },
  });

  logger.info('Rate limiting plugin registered');
}

/**
 * Route-specific rate limit decorators
 */
export function authRateLimit() {
  return {
    config: {
      rateLimit: RateLimitConfig.auth,
    },
  };
}

export function heavyRateLimit() {
  return {
    config: {
      rateLimit: RateLimitConfig.heavy,
    },
  };
}

export function writeRateLimit() {
  return {
    config: {
      rateLimit: RateLimitConfig.write,
    },
  };
}

export function searchRateLimit() {
  return {
    config: {
      rateLimit: RateLimitConfig.search,
    },
  };
}

/**
 * Custom rate limit for specific routes
 */
export function customRateLimit(max: number, timeWindow: string) {
  return {
    config: {
      rateLimit: { max, timeWindow },
    },
  };
}

export default registerRateLimit;
