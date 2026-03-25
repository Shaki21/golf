/**
 * Rate Limiting Tests
 * Tests API rate limiting behavior
 *
 * To run these tests with rate limiting enabled:
 * ENABLE_RATE_LIMIT_IN_TESTS=true npm test -- tests/unit/rate-limit.test.ts
 */

import Fastify, { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { RateLimitConfig } from '../../src/plugins/rate-limit';

describe('Rate Limiting', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();

    // Register rate limiting with test configuration
    await app.register(rateLimit, {
      max: 3, // Low limit for testing
      timeWindow: '1 minute',
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
      },
    });

    // Test route
    app.get('/test', async () => {
      return { success: true };
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return rate limit headers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-ratelimit-limit']).toBe('3');
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
  });

  it('should decrement remaining requests', async () => {
    const response1 = await app.inject({
      method: 'GET',
      url: '/test',
    });

    const remaining1 = parseInt(response1.headers['x-ratelimit-remaining'] as string);

    const response2 = await app.inject({
      method: 'GET',
      url: '/test',
    });

    const remaining2 = parseInt(response2.headers['x-ratelimit-remaining'] as string);

    expect(remaining2).toBeLessThan(remaining1);
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Create a fresh instance for this test
    const testApp = Fastify();

    await testApp.register(rateLimit, {
      max: 2,
      timeWindow: '1 minute',
    });

    testApp.get('/limited', async () => {
      return { success: true };
    });

    await testApp.ready();

    // Make requests up to the limit
    await testApp.inject({ method: 'GET', url: '/limited' });
    await testApp.inject({ method: 'GET', url: '/limited' });

    // This request should be rate limited
    const response = await testApp.inject({
      method: 'GET',
      url: '/limited',
    });

    expect(response.statusCode).toBe(429);

    await testApp.close();
  });

  it('should identify different users separately', async () => {
    const testApp = Fastify();

    await testApp.register(rateLimit, {
      max: 1,
      timeWindow: '1 minute',
      keyGenerator: (request) => request.headers['x-user-id'] as string || 'anonymous',
    });

    testApp.get('/user-limited', async () => {
      return { success: true };
    });

    await testApp.ready();

    // User 1's first request should succeed
    const user1Response = await testApp.inject({
      method: 'GET',
      url: '/user-limited',
      headers: { 'x-user-id': 'user-1' },
    });
    expect(user1Response.statusCode).toBe(200);

    // User 2's first request should also succeed (different user)
    const user2Response = await testApp.inject({
      method: 'GET',
      url: '/user-limited',
      headers: { 'x-user-id': 'user-2' },
    });
    expect(user2Response.statusCode).toBe(200);

    // User 1's second request should be rate limited
    const user1Response2 = await testApp.inject({
      method: 'GET',
      url: '/user-limited',
      headers: { 'x-user-id': 'user-1' },
    });
    expect(user1Response2.statusCode).toBe(429);

    await testApp.close();
  });
});

describe('RateLimitConfig', () => {
  it('should export rate limit configurations', () => {
    expect(RateLimitConfig.default).toBeDefined();
    expect(RateLimitConfig.default.max).toBe(100);
    expect(RateLimitConfig.auth.max).toBe(5);
    expect(RateLimitConfig.heavy.max).toBe(10);
    expect(RateLimitConfig.write.max).toBe(30);
    expect(RateLimitConfig.search.max).toBe(50);
  });
});
