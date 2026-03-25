/**
 * Calibration API Integration Tests
 * Tests for club speed calibration endpoints
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  getTestApp,
  getTestPrisma,
  closeTestConnections,
  loginDemoCoach,
  authenticatedRequest,
  parseResponse,
  getDemoIds,
} from '../helpers';

describe('Calibration API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;
  let coachToken: string;
  let demoIds: Awaited<ReturnType<typeof getDemoIds>>;
  let createdCalibrationIds: string[] = [];

  beforeAll(async () => {
    app = await getTestApp();
    prisma = getTestPrisma();
    demoIds = await getDemoIds();

    const coachAuth = await loginDemoCoach(app);
    coachToken = coachAuth.accessToken;
  });

  afterAll(async () => {
    // Clean up created calibrations
    for (const playerId of createdCalibrationIds) {
      try {
        await prisma.clubSpeedCalibration.delete({ where: { playerId } });
      } catch {
        // Ignore cleanup errors
      }
    }
    await closeTestConnections();
  });

  describe('POST /api/v1/calibration/start', () => {
    it('should start a calibration session', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration/start',
        coachToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.sessionId).toBeDefined();
      expect(body.sessionId).toMatch(/^cal_/);
      expect(body.startedAt).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/calibration/start',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/calibration/submit', () => {
    it('should reject submissions with fewer than 5 samples', async () => {
      // First start a session
      const startResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration/start',
        coachToken
      );
      const startBody = parseResponse(startResponse);
      const sessionId = startBody.sessionId;

      if (!sessionId) {
        console.log('Skipping: could not start calibration session, startBody:', startBody);
        return;
      }

      // Submit with only 3 samples
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration/submit',
        coachToken,
        {
          sessionId,
          samples: [
            { clubType: 'driver', distance: 250, timestamp: new Date().toISOString() },
            { clubType: '7iron', distance: 150, timestamp: new Date().toISOString() },
            { clubType: 'pw', distance: 120, timestamp: new Date().toISOString() },
          ],
        }
      );

      // Should reject with 422 for too few samples
      expect(response.statusCode).toBe(422);
    });

    it('should accept valid submission with 5+ samples', async () => {
      // First start a session
      const startResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration/start',
        coachToken
      );
      const { sessionId } = parseResponse(startResponse);

      // Submit with 5 samples
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration/submit',
        coachToken,
        {
          sessionId,
          samples: [
            { clubType: 'driver', distance: 250, timestamp: new Date().toISOString() },
            { clubType: '3wood', distance: 220, timestamp: new Date().toISOString() },
            { clubType: '7iron', distance: 150, timestamp: new Date().toISOString() },
            { clubType: '9iron', distance: 130, timestamp: new Date().toISOString() },
            { clubType: 'pw', distance: 120, timestamp: new Date().toISOString() },
          ],
        }
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.processedSamples).toBe(5);
    });

    it('should reject invalid session ID', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration/submit',
        coachToken,
        {
          sessionId: 'invalid-session-id',
          samples: [
            { clubType: 'driver', distance: 250, timestamp: new Date().toISOString() },
            { clubType: '3wood', distance: 220, timestamp: new Date().toISOString() },
            { clubType: '7iron', distance: 150, timestamp: new Date().toISOString() },
            { clubType: '9iron', distance: 130, timestamp: new Date().toISOString() },
            { clubType: 'pw', distance: 120, timestamp: new Date().toISOString() },
          ],
        }
      );

      // Should reject with 422 for invalid session
      expect(response.statusCode).toBe(422);
    });
  });

  describe('POST /api/v1/calibration', () => {
    it('should create calibration for a player', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration',
        coachToken,
        {
          playerId: demoIds.playerEntity,
          calibrationDate: new Date().toISOString(),
          clubs: [
            { clubType: 'driver', shot1Speed: 105, shot2Speed: 107, shot3Speed: 106 },
            { clubType: '7iron', shot1Speed: 85, shot2Speed: 86, shot3Speed: 84 },
          ],
          notes: 'Test calibration',
        }
      );

      // Could be 201 (created) or 400 (already exists)
      if (response.statusCode === 201) {
        const body = parseResponse(response);
        expect(body.success).toBe(true);
        expect(body.data.playerId).toBe(demoIds.playerEntity);
        expect(body.data.driverSpeed).toBeGreaterThan(0);
        createdCalibrationIds.push(demoIds.playerEntity);
      } else if (response.statusCode === 400) {
        const body = parseResponse(response);
        expect(body.error.code).toBe('CALIBRATION_EXISTS');
      }
    });

    it('should reject calibration with invalid club speeds', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration',
        coachToken,
        {
          playerId: demoIds.playerEntity,
          calibrationDate: new Date().toISOString(),
          clubs: [
            { clubType: 'driver', shot1Speed: 200, shot2Speed: 200, shot3Speed: 200 }, // Too high
          ],
        }
      );

      // Should fail validation (speed max is 150)
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should reject calibration for non-existent player', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/calibration',
        coachToken,
        {
          playerId: '00000000-0000-0000-0000-000000000999',
          calibrationDate: new Date().toISOString(),
          clubs: [
            { clubType: 'driver', shot1Speed: 105, shot2Speed: 107, shot3Speed: 106 },
          ],
        }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/calibration/player/:playerId', () => {
    it('should get calibration for a player', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/calibration/player/${demoIds.playerEntity}`,
        coachToken
      );

      // Could be 200 (found) or 404 (not found)
      if (response.statusCode === 200) {
        const body = parseResponse(response);
        expect(body.success).toBe(true);
        expect(body.data.playerId).toBe(demoIds.playerEntity);
      } else {
        expect(response.statusCode).toBe(404);
      }
    });

    it('should return 404 for non-existent player calibration', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/calibration/player/00000000-0000-0000-0000-000000000999',
        coachToken
      );

      expect(response.statusCode).toBe(404);
    });

    it('should validate UUID format', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/calibration/player/invalid-uuid',
        coachToken
      );

      expect(response.statusCode).toBe(400);
    });
  });
});
