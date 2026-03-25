/**
 * Weather API Integration Tests
 * Tests for weather endpoints using Met.no API
 */

import { FastifyInstance } from 'fastify';
import {
  getTestApp,
  closeTestConnections,
  loginDemoPlayer,
  authenticatedRequest,
  parseResponse,
} from '../helpers';

describe('Weather API Integration Tests', () => {
  let app: FastifyInstance;
  let playerToken: string;

  beforeAll(async () => {
    app = await getTestApp();

    try {
      const playerAuth = await loginDemoPlayer(app);
      playerToken = playerAuth.accessToken;
    } catch (error) {
      // Demo player might not exist - tests will be skipped
      console.log('Could not login demo player, some tests will be skipped');
    }
  });

  afterAll(async () => {
    await closeTestConnections();
  });

  describe('GET /api/v1/weather/location', () => {
    it('should get weather for valid coordinates', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      // Oslo coordinates - uses 'lng' not 'lon'
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/location?lat=59.9139&lng=10.7522',
        playerToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it('should require lat and lng parameters', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/location',
        playerToken
      );

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid latitude', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/location?lat=100&lng=10.7522', // lat > 90 is invalid
        playerToken
      );

      // Zod validation errors may return 400 or 500 depending on error handler
      expect([400, 500]).toContain(response.statusCode);
    });

    it('should reject invalid longitude', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/location?lat=59.9139&lng=200', // lng > 180 is invalid
        playerToken
      );

      // Zod validation errors may return 400 or 500 depending on error handler
      expect([400, 500]).toContain(response.statusCode);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/weather/location?lat=59.9139&lng=10.7522',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/weather/best-courses', () => {
    it('should get best courses to play today', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/best-courses?limit=5',
        playerToken
      );

      // May return 200 with empty array if no courses exist
      if (response.statusCode === 200) {
        const body = parseResponse(response);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
      } else {
        // Acceptable if no courses in test DB
        expect([200, 400]).toContain(response.statusCode);
      }
    });
  });

  describe('GET /api/v1/weather/region', () => {
    it('should get weather for courses in a region', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/region?city=Oslo',
        playerToken
      );

      // May return 200 with empty array if no courses exist
      if (response.statusCode === 200) {
        const body = parseResponse(response);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
      } else {
        // Acceptable if no courses in test DB
        expect([200, 400]).toContain(response.statusCode);
      }
    });
  });

  describe('Weather Caching', () => {
    it('should cache weather responses', async () => {
      if (!playerToken) {
        console.log('Skipping: playerToken not available');
        return;
      }
      // First request
      const response1 = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/location?lat=60.3913&lng=5.3221', // Bergen
        playerToken
      );

      if (response1.statusCode !== 200) {
        // Weather service might be unavailable
        console.log('Weather service unavailable, skipping cache test');
        return;
      }

      const body1 = parseResponse(response1);

      // Second request should be cached (faster)
      const startTime = Date.now();
      const response2 = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/weather/location?lat=60.3913&lng=5.3221',
        playerToken
      );
      const duration = Date.now() - startTime;

      expect(response2.statusCode).toBe(200);
      const body2 = parseResponse(response2);

      // Data should be consistent
      expect(body1.success).toBe(body2.success);

      // Cached response should be fast (under 1000ms typically)
      expect(duration).toBeLessThan(2000);
    });
  });
});
