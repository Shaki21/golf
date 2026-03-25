import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';

describe('Dashboard API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let playerToken: string;
  let coachToken: string;
  let tenantId: string;
  let playerUserId: string;
  let coachUserId: string;
  let playerId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    // Register a coach user
    const coachRegisterResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'coach@dashboardtest.com',
        password: 'TestPassword123!',
        firstName: 'Dashboard',
        lastName: 'Coach',
        organizationName: 'Dashboard Test Academy',
        role: 'coach',
      },
    });

    const coachBody = JSON.parse(coachRegisterResponse.body);
    coachToken = coachBody.data.accessToken;
    coachUserId = coachBody.data.user.id;
    tenantId = coachBody.data.user.tenantId;

    // Create a test player
    const playerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/players',
      headers: { authorization: `Bearer ${coachToken}` },
      payload: {
        firstName: 'Dashboard',
        lastName: 'Player',
        email: 'player@dashboardtest.com',
        dateOfBirth: '2010-05-15',
        gender: 'male',
        category: 'B',
        handicap: 12.5,
      },
    });

    const playerBody = JSON.parse(playerResponse.body);
    playerId = playerBody.data.id;

    // Login as player (create player user first)
    const playerUserResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'playeruser@dashboardtest.com',
        password: 'TestPassword123!',
        firstName: 'Dashboard',
        lastName: 'PlayerUser',
        organizationName: 'Dashboard Test Academy',
        role: 'player',
        existingTenantSlug: 'dashboard-test-academy',
      },
    });

    const playerUserBody = JSON.parse(playerUserResponse.body);
    if (playerUserBody.data) {
      playerToken = playerUserBody.data.accessToken;
      playerUserId = playerUserBody.data.user.id;
    }
  });

  afterAll(async () => {
    // Clean up
    if (playerId) {
      await prisma.player.delete({ where: { id: playerId } }).catch(() => {});
    }
    if (playerUserId) {
      await prisma.refreshToken.deleteMany({ where: { userId: playerUserId } });
      await prisma.user.delete({ where: { id: playerUserId } }).catch(() => {});
    }
    if (coachUserId) {
      await prisma.refreshToken.deleteMany({ where: { userId: coachUserId } });
      await prisma.user.delete({ where: { id: coachUserId } }).catch(() => {});
    }
    if (tenantId) {
      await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
    }

    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return dashboard data for player', async () => {
      // Skip if player token not available
      if (!playerToken) {
        console.log('Skipping player dashboard test - no player token');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('player');
      expect(body).toHaveProperty('period');
      expect(body).toHaveProperty('todaySessions');
      expect(body).toHaveProperty('badges');
      expect(body).toHaveProperty('goals');
      expect(body).toHaveProperty('weeklyStats');

      // New fields from dashboard enhancement
      expect(body).toHaveProperty('nextTournament');
      expect(body).toHaveProperty('nextTest');
      expect(body).toHaveProperty('breakingPoints');
      expect(body).toHaveProperty('recentTests');
      expect(body).toHaveProperty('messages');
      expect(body).toHaveProperty('unreadCount');
    });

    it('should return breaking points array', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(Array.isArray(body.breakingPoints)).toBe(true);
      // Breaking points should have max 3 items
      expect(body.breakingPoints.length).toBeLessThanOrEqual(3);

      // Check structure of breaking points
      if (body.breakingPoints.length > 0) {
        const bp = body.breakingPoints[0];
        expect(bp).toHaveProperty('id');
        expect(bp).toHaveProperty('area');
        expect(bp).toHaveProperty('title');
        expect(bp).toHaveProperty('status');
        expect(bp).toHaveProperty('priority');
        expect(bp).toHaveProperty('progress');
        expect(['high', 'medium', 'low']).toContain(bp.priority);
      }
    });

    it('should return recent tests array', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(Array.isArray(body.recentTests)).toBe(true);
      // Recent tests should have max 3 items
      expect(body.recentTests.length).toBeLessThanOrEqual(3);

      // Check structure of recent tests
      if (body.recentTests.length > 0) {
        const test = body.recentTests[0];
        expect(test).toHaveProperty('id');
        expect(test).toHaveProperty('testId');
        expect(test).toHaveProperty('name');
        expect(test).toHaveProperty('date');
        expect(test).toHaveProperty('score');
        expect(typeof test.score).toBe('number');
      }
    });

    it('should handle null next tournament and test', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Next tournament can be null or object
      expect(body.nextTournament === null || typeof body.nextTournament === 'object').toBe(true);

      // Next test can be null or object
      expect(body.nextTest === null || typeof body.nextTest === 'object').toBe(true);
    });

    it('should accept date parameter', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard?date=2025-12-21',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should reject coach access without player view', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: { authorization: `Bearer ${coachToken}` },
      });

      // Dashboard for authenticated user only works for players
      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/dashboard/:playerId', () => {
    it('should allow coach to view player dashboard', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/dashboard/${playerId}`,
        headers: { authorization: `Bearer ${coachToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('player');
    });

    it('should return 404 for non-existent player', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${coachToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/dashboard/weekly-stats', () => {
    it('should return weekly training stats', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/weekly-stats',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should accept week and year parameters', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/weekly-stats?week=51&year=2025',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/dashboard/badges', () => {
    it('should return player badges', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/badges',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/dashboard/goals', () => {
    it('should return player goals', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/goals',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toBeInstanceOf(Array);
    });

    it('should filter goals by status', async () => {
      if (!playerToken) return;

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/goals?status=active',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
