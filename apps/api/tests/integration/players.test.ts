/**
 * Players API Integration Tests
 * Tests for player CRUD operations and related endpoints
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  getTestApp,
  getTestPrisma,
  closeTestConnections,
  loginDemoCoach,
  loginDemoAdmin,
  authenticatedRequest,
  parseResponse,
  uniqueEmail,
  getDemoIds,
} from '../helpers';

describe('Players API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;
  let coachToken: string;
  let adminToken: string;
  let demoIds: Awaited<ReturnType<typeof getDemoIds>>;
  let createdPlayerIds: string[] = [];
  let createdUserIds: string[] = [];

  beforeAll(async () => {
    app = await getTestApp();
    prisma = getTestPrisma();

    // Get actual demo IDs from database
    demoIds = await getDemoIds();

    // Login with demo accounts
    const coachAuth = await loginDemoCoach(app);
    coachToken = coachAuth.accessToken;

    const adminAuth = await loginDemoAdmin(app);
    adminToken = adminAuth.accessToken;
  });

  afterAll(async () => {
    // Clean up created test data
    for (const playerId of createdPlayerIds) {
      try {
        await prisma.testResult.deleteMany({ where: { playerId } });
        await prisma.playerGoal.deleteMany({ where: { playerId } });
        await prisma.playerBadge.deleteMany({ where: { playerId } });
        await prisma.weeklyTrainingStats.deleteMany({ where: { playerId } });
        await prisma.monthlyTrainingStats.deleteMany({ where: { playerId } });
        await prisma.player.delete({ where: { id: playerId } });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    for (const userId of createdUserIds) {
      try {
        await prisma.refreshToken.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    await closeTestConnections();
  });

  describe('POST /api/v1/players', () => {
    it('should create a new player', async () => {
      const email = uniqueEmail('player');

      const response = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'Test',
        lastName: 'Player',
        email,
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'C',
        coachId: demoIds.coachEntity,
        currentPeriod: 'G',
        status: 'active',
      });

      const body = parseResponse(response);

      expect(response.statusCode).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.firstName).toBe('Test');
      expect(body.data.lastName).toBe('Player');
      expect(body.data.category).toBe('C');

      // Track for cleanup
      if (body.data?.id) createdPlayerIds.push(body.data.id);
      if (body.data?.userId) createdUserIds.push(body.data.userId);
    });

    it('should reject duplicate email', async () => {
      const email = uniqueEmail('duplicate');

      // Create first player
      const firstResponse = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'First',
        lastName: 'Player',
        email,
        dateOfBirth: '2005-03-15',
        gender: 'female',
        category: 'C',
        coachId: demoIds.coachEntity,
      });

      const firstBody = parseResponse(firstResponse);
      if (firstBody.data?.id) createdPlayerIds.push(firstBody.data.id);
      if (firstBody.data?.userId) createdUserIds.push(firstBody.data.userId);

      // Try to create duplicate
      const response = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'Duplicate',
        lastName: 'Player',
        email, // Same email
        dateOfBirth: '2005-03-15',
        gender: 'female',
        category: 'C',
        coachId: demoIds.coachEntity,
      });

      expect(response.statusCode).toBe(409);
      const body = parseResponse(response);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CONFLICT');
    });

    it('should validate required fields', async () => {
      const response = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'Incomplete',
        // Missing required fields
      });

      expect(response.statusCode).toBe(400);
      const body = parseResponse(response);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid coach ID', async () => {
      const response = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'Test',
        lastName: 'Player',
        email: uniqueEmail('invalid-coach'),
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'C',
        coachId: '00000000-0000-0000-0000-000000000099', // Non-existent
      });

      expect(response.statusCode).toBe(400);
      const body = parseResponse(response);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/v1/players', () => {
    it('should list players with pagination', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players?page=1&limit=10',
        coachToken
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data.players).toBeInstanceOf(Array);
      expect(body.data.pagination).toHaveProperty('page', 1);
      expect(body.data.pagination).toHaveProperty('limit', 10);
      expect(body.data.pagination).toHaveProperty('total');
    });

    it('should filter players by category', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players?category=C',
        coachToken
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);

      // All returned players should have category C
      body.data.players.forEach((player: any) => {
        expect(player.category).toBe('C');
      });
    });

    it('should search players by name', async () => {
      // First create a player with a unique name
      const uniqueName = `SearchTest${Date.now()}`;
      const createResponse = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: uniqueName,
        lastName: 'Player',
        email: uniqueEmail('search'),
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'D',
        coachId: demoIds.coachEntity,
      });

      const createBody = parseResponse(createResponse);
      if (createBody.data?.id) createdPlayerIds.push(createBody.data.id);
      if (createBody.data?.userId) createdUserIds.push(createBody.data.userId);

      // Search for the player
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players?search=${uniqueName}`,
        coachToken
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data.players.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/players/:id', () => {
    let testPlayerId: string;

    beforeAll(async () => {
      // Create a player to test with
      const response = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'GetById',
        lastName: 'Test',
        email: uniqueEmail('getbyid'),
        dateOfBirth: '2005-03-15',
        gender: 'female',
        category: 'E',
        coachId: demoIds.coachEntity,
      });

      const body = parseResponse(response);
      testPlayerId = body.data?.id;
      if (testPlayerId) createdPlayerIds.push(testPlayerId);
      if (body.data?.userId) createdUserIds.push(body.data.userId);
    });

    it('should get player by ID', async () => {
      if (!testPlayerId) {
        console.log('Skipping test - no test player created');
        return;
      }

      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players/${testPlayerId}`,
        coachToken
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testPlayerId);
      expect(body.data.firstName).toBe('GetById');
    });

    it('should return 404 for non-existent player', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players/00000000-0000-0000-0000-000000000099',
        coachToken
      );

      expect(response.statusCode).toBe(404);

      const body = parseResponse(response);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/players/:id', () => {
    let testPlayerId: string;

    beforeAll(async () => {
      const response = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'ToUpdate',
        lastName: 'Player',
        email: uniqueEmail('update'),
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'C',
        coachId: demoIds.coachEntity,
      });

      const body = parseResponse(response);
      testPlayerId = body.data?.id;
      if (testPlayerId) createdPlayerIds.push(testPlayerId);
      if (body.data?.userId) createdUserIds.push(body.data.userId);
    });

    it('should update player', async () => {
      if (!testPlayerId) {
        console.log('Skipping test - no test player created');
        return;
      }

      const response = await authenticatedRequest(
        app,
        'PATCH',
        `/api/v1/players/${testPlayerId}`,
        adminToken,
        {
          category: 'D',
          handicap: 5.5,
        }
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data.category).toBe('D');
    });

    it('should return 404 for non-existent player', async () => {
      const response = await authenticatedRequest(
        app,
        'PATCH',
        '/api/v1/players/00000000-0000-0000-0000-000000000099',
        adminToken,
        { category: 'E' }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/players/:id/weekly-summary', () => {
    it('should get player weekly summary for demo player', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players/${demoIds.playerEntity}/weekly-summary`,
        coachToken
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('player');
      expect(body.data).toHaveProperty('week');
      expect(body.data).toHaveProperty('training');
    });

    it('should accept custom week start date', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players/${demoIds.playerEntity}/weekly-summary?weekStart=2024-01-01`,
        coachToken
      );

      expect(response.statusCode).toBe(200);

      const body = parseResponse(response);
      expect(body.success).toBe(true);
      expect(body.data.week.start).toBe('2024-01-01');
    });
  });

  describe('DELETE /api/v1/players/:id', () => {
    it('should delete player', async () => {
      // Create a player to delete
      const createResponse = await authenticatedRequest(app, 'POST', '/api/v1/players', adminToken, {
        firstName: 'ToDelete',
        lastName: 'Player',
        email: uniqueEmail('delete'),
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'F',
        coachId: demoIds.coachEntity,
      });

      const createBody = parseResponse(createResponse);
      const deletePlayerId = createBody.data?.id;

      if (!deletePlayerId) {
        console.log('Skipping test - could not create player');
        return;
      }

      // Delete the player
      const deleteResponse = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/players/${deletePlayerId}`,
        adminToken
      );

      expect(deleteResponse.statusCode).toBe(200);

      const deleteBody = parseResponse(deleteResponse);
      expect(deleteBody.success).toBe(true);

      // Verify player is deleted
      const getResponse = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players/${deletePlayerId}`,
        coachToken
      );

      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
        headers: { authorization: 'Bearer invalid-token' },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
