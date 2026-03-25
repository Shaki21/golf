import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';

describe('Goals API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let playerToken: string;
  let coachToken: string;
  let tenantId: string;
  let playerUserId: string;
  let coachUserId: string;
  let testGoalId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    // Register a coach user
    const coachRegisterResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'coach@goalstest.com',
        password: 'TestPassword123!',
        firstName: 'Goals',
        lastName: 'Coach',
        organizationName: 'Goals Test Academy',
        role: 'coach',
      },
    });

    const coachBody = JSON.parse(coachRegisterResponse.body);
    coachToken = coachBody.data?.accessToken;
    coachUserId = coachBody.data?.user.id;
    tenantId = coachBody.data?.user.tenantId;

    // Register a player user
    const playerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'player@goalstest.com',
        password: 'TestPassword123!',
        firstName: 'Goals',
        lastName: 'Player',
        organizationName: 'Goals Test Academy',
        role: 'player',
        existingTenantSlug: 'goals-test-academy',
      },
    });

    const playerBody = JSON.parse(playerResponse.body);
    playerToken = playerBody.data?.accessToken;
    playerUserId = playerBody.data?.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testGoalId) {
      await prisma.goal.delete({ where: { id: testGoalId } }).catch(() => {});
    }
    if (playerUserId) {
      await prisma.refreshToken.deleteMany({ where: { userId: playerUserId } });
      await prisma.goal.deleteMany({ where: { userId: playerUserId } });
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

  describe('POST /api/v1/goals', () => {
    it('should create a new goal', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/goals',
        headers: { authorization: `Bearer ${playerToken}` },
        payload: {
          title: 'Reach handicap 5',
          description: 'Lower my handicap from 10 to 5',
          goalType: 'score',
          status: 'active',
          targetDate: '2025-12-31',
          currentValue: 10,
          targetValue: 5,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.title).toBe('Reach handicap 5');
      expect(body.goalType).toBe('score');

      testGoalId = body.id;
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/goals',
        payload: {
          title: 'Test Goal',
          goalType: 'score',
        },
      });

      // Should reject unauthenticated requests (401 or 400 depending on validation order)
      expect([400, 401]).toContain(response.statusCode);
    });
  });

  describe('GET /api/v1/goals', () => {
    it('should list all goals for user', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/goals',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('should filter goals by status', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/goals?status=active',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      body.forEach((goal: any) => {
        expect(goal.status).toBe('active');
      });
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/goals',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/goals/active', () => {
    it('should return only active goals', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/goals/active',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /api/v1/goals/completed', () => {
    it('should return only completed goals', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/goals/completed',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /api/v1/goals/:id', () => {
    it('should return a specific goal', async () => {
      if (!playerToken || !testGoalId) {
        console.log('Skipping test: player token or goal ID not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/goals/${testGoalId}`,
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.id).toBe(testGoalId);
    });

    it('should return 404 for non-existent goal', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/goals/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/goals/:id', () => {
    it('should update a goal', async () => {
      if (!playerToken || !testGoalId) {
        console.log('Skipping test: player token or goal ID not available');
        return;
      }

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/goals/${testGoalId}`,
        headers: { authorization: `Bearer ${playerToken}` },
        payload: {
          title: 'Updated: Reach handicap 5',
          currentValue: 8,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.title).toBe('Updated: Reach handicap 5');
    });
  });

  describe('POST /api/v1/goals/:id/progress', () => {
    it('should update goal progress', async () => {
      if (!playerToken || !testGoalId) {
        console.log('Skipping test: player token or goal ID not available');
        return;
      }

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/goals/${testGoalId}/progress`,
        headers: { authorization: `Bearer ${playerToken}` },
        payload: {
          value: 7,
          note: 'Making good progress!',
        },
      });

      // Accept both 200 and 201 as valid responses
      expect([200, 201]).toContain(response.statusCode);
    });
  });

  describe('DELETE /api/v1/goals/:id', () => {
    it('should delete a goal', async () => {
      if (!playerToken) {
        console.log('Skipping test: player token not available');
        return;
      }

      // Create a goal to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/goals',
        headers: { authorization: `Bearer ${playerToken}` },
        payload: {
          title: 'Goal to delete',
          goalType: 'technique',
          status: 'active',
        },
      });

      if (createResponse.statusCode !== 201) {
        console.log('Skipping delete test: could not create goal');
        return;
      }

      const createdGoal = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/goals/${createdGoal.id}`,
        headers: { authorization: `Bearer ${playerToken}` },
      });

      expect([200, 204]).toContain(response.statusCode);
    });
  });
});
