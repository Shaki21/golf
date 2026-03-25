import { FastifyInstance } from 'fastify';
import {
  getTestApp,
  getTestPrisma,
  registerTestUser,
  uniqueEmail,
  uniqueString,
} from '../helpers';

describe('Sessions API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getTestPrisma>;
  let accessToken: string;
  let tenantId: string;
  let userId: string;
  let playerId: string;
  let sessionId: string;

  beforeAll(async () => {
    try {
      app = await getTestApp();
      prisma = getTestPrisma();

      // Register a test user (coach) with unique email
      const userData = await registerTestUser(app, {
        email: uniqueEmail('session-coach'),
        password: 'TestPassword123!',
        firstName: 'Session',
        lastName: 'Coach',
        organizationName: uniqueString('Session Test Academy'),
        role: 'coach',
      });

      accessToken = userData.accessToken;
      userId = userData.userId;
      tenantId = userData.tenantId;

      // Create a test player with unique email
      const playerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/players',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Test',
          lastName: 'Player',
          email: uniqueEmail('session-player'),
          dateOfBirth: '2010-05-15',
          gender: 'male',
          category: 'B',
        },
      });

      if (playerResponse.statusCode !== 201) {
        console.error('Player creation failed:', playerResponse.statusCode, playerResponse.body);
        throw new Error(`Player creation failed: ${playerResponse.statusCode}`);
      }

      const playerBody = JSON.parse(playerResponse.body);
      playerId = playerBody.data.id;
    } catch (error) {
      console.error('BeforeAll setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (prisma) {
      if (sessionId) {
        await prisma.trainingSession.delete({ where: { id: sessionId } }).catch(() => {});
      }
      if (playerId) {
        await prisma.player.delete({ where: { id: playerId } }).catch(() => {});
      }
      if (userId) {
        await prisma.refreshToken.deleteMany({ where: { userId } }).catch(() => {});
        await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      }
      if (tenantId) {
        await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
      }
    }

    // Note: Using shared test app/prisma instances - don't close them here
    // They will be closed when all tests complete
  });

  describe('POST /api/v1/sessions', () => {
    it('should create a new session', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/sessions',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId,
          sessionType: 'individual',
          sessionDate: new Date().toISOString(),
          duration: 60,
          focusArea: 'putting',
          notes: 'Focus on lag putts',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.playerId).toBe(playerId);
      expect(body.data.sessionType).toBe('individual');
      expect(body.data.duration).toBe(60);

      sessionId = body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/sessions',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId,
          sessionType: 'individual',
          // Missing required fields: sessionDate and duration
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/sessions', () => {
    it('should list sessions with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/sessions?page=1&limit=10',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.sessions).toBeInstanceOf(Array);
      expect(body.data.pagination).toHaveProperty('page', 1);
      expect(body.data.pagination).toHaveProperty('limit', 10);
    });

    it('should filter by player', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/sessions?playerId=${playerId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.sessions.length).toBeGreaterThan(0);
      body.data.sessions.forEach((session: any) => {
        expect(session.playerId).toBe(playerId);
      });
    });

    it('should filter by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/sessions?status=planned',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/sessions/technical-cues', () => {
    it('should return predefined technical cues', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/sessions/technical-cues',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/sessions/:id', () => {
    it('should get session by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/sessions/${sessionId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(sessionId);
      expect(body.data.playerId).toBe(playerId);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/sessions/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/sessions/:id', () => {
    it('should update session', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/sessions/${sessionId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          duration: 90,
          notes: 'Extended session - added short game practice',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.duration).toBe(90);
    });
  });

  describe('PATCH /api/v1/sessions/:id/evaluation', () => {
    it('should update session evaluation', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/sessions/${sessionId}/evaluation`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          evaluationFocus: 8,
          evaluationEnergy: 7,
          whatWentWell: 'Good progress on putting stroke',
          technicalCues: ['Hold armen rett', 'Fokuser på tempo'],
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.evaluationFocus).toBe(8);
      expect(body.data.evaluationEnergy).toBe(7);
    });
  });

  describe('POST /api/v1/sessions/:id/complete', () => {
    it('should complete session with evaluation', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/sessions/${sessionId}/complete`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          evaluationFocus: 8,
          evaluationTechnical: 7,
          notes: 'Great progress today',
          completionStatus: 'completed',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      // Response is SessionCompletionResult with { session, badgeUnlocks, xpGained, newLevel }
      expect(body.data.session.completionStatus).toBe('completed');
    });
  });

  describe('GET /api/v1/sessions/stats/evaluation', () => {
    it('should get evaluation statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/sessions/stats/evaluation?playerId=${playerId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('totalSessions');
      expect(body.data).toHaveProperty('averages');
    });

    it('should filter by date range', async () => {
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/sessions/stats/evaluation?playerId=${playerId}&fromDate=${fromDate.toISOString()}&toDate=${new Date().toISOString()}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/v1/sessions/:id', () => {
    it('should delete session', async () => {
      // Create a session to delete - use a different date to avoid anti-gaming limits
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // Use a date 7 days in the future

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/sessions',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId,
          sessionType: 'individual',
          sessionDate: futureDate.toISOString(),
          duration: 30,
          focusArea: 'driving',
        },
      });

      if (createResponse.statusCode !== 201) {
        console.error('Failed to create session for delete test:', createResponse.statusCode, createResponse.body);
      }
      expect(createResponse.statusCode).toBe(201);

      const createBody = JSON.parse(createResponse.body);
      const deleteSessionId = createBody.data.id;

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/sessions/${deleteSessionId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      const deleteBody = JSON.parse(deleteResponse.body);
      expect(deleteBody.success).toBe(true);

      // Verify session is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/sessions/${deleteSessionId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
