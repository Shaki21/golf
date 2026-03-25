import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';
import { uniqueEmail, uniqueString } from '../helpers/testUtils';

describe('Tests API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let accessToken: string;
  let tenantId: string;
  let userId: string;
  let testId: string;
  let playerId: string;
  let testResultId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: uniqueEmail('tests-admin'),
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        organizationName: uniqueString('Tests Academy'),
        role: 'admin',
      },
    });

    const registerBody = JSON.parse(registerResponse.body);
    if (!registerBody.data) {
      throw new Error(`Registration failed: ${JSON.stringify(registerBody)}`);
    }
    accessToken = registerBody.data.accessToken;
    userId = registerBody.data.user.id;
    tenantId = registerBody.data.user.tenantId;

    // Create a player for test results
    const playerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/players',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        firstName: 'Test',
        lastName: 'Player',
        email: uniqueEmail('test-player'),
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'C',
      },
    });

    const playerBody = JSON.parse(playerResponse.body);
    playerId = playerBody.data.id;
  });

  afterAll(async () => {
    if (testResultId) {
      await prisma.testResult.delete({ where: { id: testResultId } }).catch(() => {});
    }
    if (testId) {
      await prisma.test.delete({ where: { id: testId } }).catch(() => {});
    }
    if (playerId) {
      await prisma.player.delete({ where: { id: playerId } }).catch(() => {});
    }
    if (userId) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    if (tenantId) {
      await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
    }

    await app.close();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/tests', () => {
    it('should create a new test definition', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tests',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Swing Speed Test',
          testNumber: 1,
          category: 'Physical',
          testType: 'performance',
          protocolName: 'Trackman Speed Protocol',
          protocolVersion: '2.1',
          description: 'Measure maximum swing speed with driver',
          targetCategory: 'C',
          testDetails: {
            equipment: ['trackman', 'driver', 'balls'],
            setup: 'Outdoor driving range',
            instructions: 'Hit 5 maximum effort swings',
            scoringCriteria: 'Average of top 3 swings',
            warmupRequired: true,
            duration: 15,
            repetitions: 5,
          },
          benchmarkWeek: true,
          isActive: true,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe('Swing Speed Test');
      expect(body.data.testNumber).toBe(1);
      expect(body.data.benchmarkWeek).toBe(true);

      testId = body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tests',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Incomplete Test',
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/tests', () => {
    it('should list test definitions', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tests',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.tests).toBeInstanceOf(Array);
      expect(body.data.pagination).toBeDefined();
    });

    it('should filter by category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tests?category=Physical',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.tests.forEach((test: any) => {
        expect(test.category).toBe('Physical');
      });
    });

    it('should filter by benchmark week', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tests?benchmarkWeek=true',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.tests.forEach((test: any) => {
        expect(test.benchmarkWeek).toBe(true);
      });
    });
  });

  describe('GET /api/v1/tests/:id', () => {
    it('should get test definition by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/${testId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testId);
      expect(body.data).toHaveProperty('_count');
    });

    it('should return 404 for non-existent test', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tests/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/tests/:id', () => {
    it('should update test definition', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/tests/${testId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          protocolVersion: '2.2',
          isActive: true,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.protocolVersion).toBe('2.2');
    });
  });

  describe('POST /api/v1/tests/results', () => {
    it('should record a test result', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tests/results',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          testId: testId,
          playerId: playerId,
          testDate: '2024-01-15',
          location: 'Driving Range',
          weather: 'Sunny, 20°C',
          equipment: 'Trackman, Titleist Driver',
          results: {
            swing1: 105.3,
            swing2: 106.1,
            swing3: 107.2,
            swing4: 105.8,
            swing5: 106.5,
            average: 106.2,
          },
          pei: 7.5,
          categoryBenchmark: true,
          coachFeedback: 'Good speed, work on consistency',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.pei).toBe('7.5');
      expect(body.data).toHaveProperty('test');
      expect(body.data).toHaveProperty('player');

      testResultId = body.data.id;
    });

    it('should calculate improvement automatically', async () => {
      // Record second result
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tests/results',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          testId: testId,
          playerId: playerId,
          testDate: '2024-02-15',
          results: {
            average: 108.5,
          },
          pei: 8.2,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.data.improvementFromLast).toBeDefined();
      expect(Number(body.data.improvementFromLast)).toBeCloseTo(0.7, 1);

      // Clean up
      await prisma.testResult.delete({ where: { id: body.data.id } });
    });

    it('should validate test exists', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tests/results',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          testId: '00000000-0000-0000-0000-000000000000',
          playerId: playerId,
          testDate: '2024-01-15',
          results: {},
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Test not found');
    });

    it('should validate player exists', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tests/results',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          testId: testId,
          playerId: '00000000-0000-0000-0000-000000000000',
          testDate: '2024-01-15',
          results: {},
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Player not found');
    });
  });

  describe('GET /api/v1/tests/results', () => {
    it('should list test results', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tests/results',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.results).toBeInstanceOf(Array);
      expect(body.data.pagination).toBeDefined();
    });

    it('should filter by player ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/results?playerId=${playerId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.results.forEach((result: any) => {
        expect(result.player.id).toBe(playerId);
      });
    });

    it('should filter by test ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/results?testId=${testId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.results.forEach((result: any) => {
        expect(result.test.id).toBe(testId);
      });
    });

    it('should filter by date range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tests/results?startDate=2024-01-01&endDate=2024-12-31',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('GET /api/v1/tests/results/:id', () => {
    it('should get test result by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/results/${testResultId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testResultId);
      expect(body.data).toHaveProperty('test');
      expect(body.data).toHaveProperty('player');
    });
  });

  describe('PATCH /api/v1/tests/results/:id', () => {
    it('should update test result', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/tests/results/${testResultId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          coachFeedback: 'Updated feedback: Excellent progress!',
          pei: 7.8,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.coachFeedback).toBe('Updated feedback: Excellent progress!');
      expect(body.data.pei).toBe('7.8');
    });
  });

  describe('GET /api/v1/tests/progress', () => {
    it('should get player progress', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/progress?playerId=${playerId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('player');
      expect(body.data).toHaveProperty('tests');
      expect(body.data.tests).toBeInstanceOf(Array);

      if (body.data.tests.length > 0) {
        const testData = body.data.tests[0];
        expect(testData).toHaveProperty('test');
        expect(testData).toHaveProperty('results');
        expect(testData).toHaveProperty('latestResult');
        expect(testData).toHaveProperty('improvement');
      }
    });

    it('should filter progress by test ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/progress?playerId=${playerId}&testId=${testId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      body.data.tests.forEach((testData: any) => {
        expect(testData.test.id).toBe(testId);
      });
    });
  });

  describe('DELETE /api/v1/tests/results/:id', () => {
    it('should delete test result', async () => {
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/tests/results/${testResultId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify result is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/results/${testResultId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);
      testResultId = ''; // Clear for cleanup
    });
  });

  describe('DELETE /api/v1/tests/:id', () => {
    it('should delete test definition', async () => {
      // Create a test to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/tests',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'To Delete Test',
          testNumber: 20, // Max allowed value is 20
          category: 'Test',
          testType: 'test',
          protocolName: 'Delete Protocol',
          description: 'Test for deletion',
          testDetails: {},
        },
      });

      expect(createResponse.statusCode).toBe(201);
      const createBody = JSON.parse(createResponse.body);
      expect(createBody.success).toBe(true);
      const deleteTestId = createBody.data.id;

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/tests/${deleteTestId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify test is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/tests/${deleteTestId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
