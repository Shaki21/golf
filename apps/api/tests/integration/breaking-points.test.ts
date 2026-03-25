import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';

describe('Breaking Points API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let accessToken: string;
  let tenantId: string;
  let userId: string;
  let playerId: string;
  let exerciseId: string;
  let breakingPointId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'admin@bptest.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        organizationName: 'BP Test Academy',
        role: 'admin',
      },
    });

    const registerBody = JSON.parse(registerResponse.body);
    accessToken = registerBody.data.accessToken;
    userId = registerBody.data.user.id;
    tenantId = registerBody.data.user.tenantId;

    // Create a player
    const playerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/players',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        firstName: 'Test',
        lastName: 'Player',
        email: 'bpplayer@example.com',
        dateOfBirth: '2005-03-15',
        gender: 'male',
        category: 'C',
      },
    });

    const playerBody = JSON.parse(playerResponse.body);
    playerId = playerBody.data.id;

    // Create an exercise for assignment
    const exerciseResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/exercises',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        name: 'Alignment Drill',
        description: 'Practice alignment',
        exerciseType: 'alignment',
        processCategory: 'fundamentals',
      },
    });

    const exerciseBody = JSON.parse(exerciseResponse.body);
    exerciseId = exerciseBody.data.id;
  });

  afterAll(async () => {
    if (breakingPointId) {
      await prisma.breakingPoint.delete({ where: { id: breakingPointId } }).catch(() => {});
    }
    if (exerciseId) {
      await prisma.exercise.delete({ where: { id: exerciseId } }).catch(() => {});
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

  describe('POST /api/v1/breaking-points', () => {
    it('should create a new breaking point', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/breaking-points',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: playerId,
          processCategory: 'setup',
          specificArea: 'Alignment at address',
          description: 'Player consistently aims right of target',
          identifiedDate: '2024-01-10',
          severity: 'high',
          baselineMeasurement: '15 degrees right',
          targetMeasurement: '0 degrees (square)',
          currentMeasurement: '15 degrees right',
          progressPercent: 0,
          assignedExerciseIds: [exerciseId],
          hoursPerWeek: 3,
          status: 'not_started',
          notes: 'Identified during assessment session',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.specificArea).toBe('Alignment at address');
      expect(body.data.severity).toBe('high');
      expect(body.data).toHaveProperty('player');
      expect(body.data.assignedExerciseIds).toContain(exerciseId);

      breakingPointId = body.data.id;
    });

    it('should validate player exists', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/breaking-points',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: '00000000-0000-0000-0000-000000000000',
          processCategory: 'setup',
          specificArea: 'Test',
          description: 'Test',
          identifiedDate: '2024-01-10',
          severity: 'low',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('Player not found');
    });

    it('should validate assigned exercises exist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/breaking-points',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: playerId,
          processCategory: 'setup',
          specificArea: 'Test',
          description: 'Test',
          identifiedDate: '2024-01-10',
          severity: 'low',
          assignedExerciseIds: ['00000000-0000-0000-0000-000000000000'],
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.message).toContain('exercises not found');
    });

    it('should validate severity enum', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/breaking-points',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: playerId,
          processCategory: 'setup',
          specificArea: 'Test',
          description: 'Test',
          identifiedDate: '2024-01-10',
          severity: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/breaking-points', () => {
    it('should list breaking points with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/breaking-points?page=1&limit=50',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.breakingPoints).toBeInstanceOf(Array);
      expect(body.data.pagination).toHaveProperty('page', 1);
    });

    it('should filter by player ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/breaking-points?playerId=${playerId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.breakingPoints.forEach((bp: any) => {
        expect(bp.player.id).toBe(playerId);
      });
    });

    it('should filter by severity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/breaking-points?severity=high',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.breakingPoints.forEach((bp: any) => {
        expect(bp.severity).toBe('high');
      });
    });

    it('should filter by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/breaking-points?status=not_started',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.breakingPoints.forEach((bp: any) => {
        expect(bp.status).toBe('not_started');
      });
    });

    it('should filter by process category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/breaking-points?processCategory=setup',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.breakingPoints.forEach((bp: any) => {
        expect(bp.processCategory).toBe('setup');
      });
    });

    it('should search breaking points', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/breaking-points?search=alignment',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('GET /api/v1/breaking-points/:id', () => {
    it('should get breaking point by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/breaking-points/${breakingPointId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(breakingPointId);
      expect(body.data).toHaveProperty('player');
      expect(body.data).toHaveProperty('assignedExercises');
    });

    it('should return 404 for non-existent breaking point', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/breaking-points/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/breaking-points/:id', () => {
    it('should update breaking point', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/breaking-points/${breakingPointId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          status: 'in_progress',
          currentMeasurement: '10 degrees right',
          progressPercent: 33,
          notes: 'Making progress with alignment drills',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('in_progress');
      expect(body.data.progressPercent).toBe(33);
      expect(body.data.currentMeasurement).toBe('10 degrees right');
    });

    it('should auto-set resolved date when status is completed', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/breaking-points/${breakingPointId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          status: 'completed',
          progressPercent: 100,
          currentMeasurement: '0 degrees',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data.status).toBe('completed');
      expect(body.data.resolvedDate).toBeDefined();
      expect(body.data.resolvedDate).not.toBeNull();

      // Reset status for other tests
      await app.inject({
        method: 'PATCH',
        url: `/api/v1/breaking-points/${breakingPointId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          status: 'in_progress',
          resolvedDate: null,
        },
      });
    });
  });

  describe('POST /api/v1/breaking-points/:id/progress', () => {
    it('should update progress quickly', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/breaking-points/${breakingPointId}/progress`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          currentMeasurement: '5 degrees right',
          progressPercent: 67,
          status: 'in_progress',
          notes: 'Significant improvement this week',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.progressPercent).toBe(67);
      expect(body.data.currentMeasurement).toBe('5 degrees right');

      // Verify success history was updated
      expect(body.data.successHistory).toBeInstanceOf(Array);
      expect(body.data.successHistory.length).toBeGreaterThan(0);

      const latestEntry = body.data.successHistory[body.data.successHistory.length - 1];
      expect(latestEntry.measurement).toBe('5 degrees right');
    });

    it('should add entries to success history', async () => {
      // Get current history length
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/breaking-points/${breakingPointId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      const getBody = JSON.parse(getResponse.body);
      const initialHistoryLength = getBody.data.successHistory.length;

      // Add new progress entry
      const updateResponse = await app.inject({
        method: 'POST',
        url: `/api/v1/breaking-points/${breakingPointId}/progress`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          currentMeasurement: '3 degrees right',
          progressPercent: 80,
          notes: 'Almost there!',
        },
      });

      const updateBody = JSON.parse(updateResponse.body);
      expect(updateBody.data.successHistory.length).toBe(initialHistoryLength + 1);
    });
  });

  describe('DELETE /api/v1/breaking-points/:id', () => {
    it('should delete breaking point', async () => {
      // Create a breaking point to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/breaking-points',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: playerId,
          processCategory: 'test',
          specificArea: 'To Delete',
          description: 'Test breaking point for deletion',
          identifiedDate: '2024-01-10',
          severity: 'low',
        },
      });

      const createBody = JSON.parse(createResponse.body);
      const deleteBpId = createBody.data.id;

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/breaking-points/${deleteBpId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify breaking point is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/breaking-points/${deleteBpId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe('Progress tracking workflow', () => {
    it('should track complete workflow: identified -> in_progress -> completed', async () => {
      // Create new breaking point
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/breaking-points',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: playerId,
          processCategory: 'tempo',
          specificArea: 'Backswing tempo',
          description: 'Too fast in backswing',
          identifiedDate: '2024-01-01',
          severity: 'medium',
          baselineMeasurement: '0.5s',
          targetMeasurement: '0.8s',
          currentMeasurement: '0.5s',
          progressPercent: 0,
          status: 'not_started',
        },
      });

      const createBody = JSON.parse(createResponse.body);
      const workflowBpId = createBody.data.id;

      // Start working on it
      const startResponse = await app.inject({
        method: 'PATCH',
        url: `/api/v1/breaking-points/${workflowBpId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          status: 'in_progress',
        },
      });

      expect(startResponse.statusCode).toBe(200);

      // Update progress week 1
      const week1Response = await app.inject({
        method: 'POST',
        url: `/api/v1/breaking-points/${workflowBpId}/progress`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          currentMeasurement: '0.6s',
          progressPercent: 33,
          notes: 'Week 1 progress',
        },
      });

      expect(week1Response.statusCode).toBe(200);

      // Update progress week 2
      const week2Response = await app.inject({
        method: 'POST',
        url: `/api/v1/breaking-points/${workflowBpId}/progress`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          currentMeasurement: '0.7s',
          progressPercent: 66,
          notes: 'Week 2 progress',
        },
      });

      expect(week2Response.statusCode).toBe(200);

      // Complete breaking point
      const completeResponse = await app.inject({
        method: 'POST',
        url: `/api/v1/breaking-points/${workflowBpId}/progress`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          currentMeasurement: '0.8s',
          progressPercent: 100,
          status: 'completed',
          notes: 'Target achieved!',
        },
      });

      expect(completeResponse.statusCode).toBe(200);

      const completeBody = JSON.parse(completeResponse.body);
      expect(completeBody.data.status).toBe('completed');
      expect(completeBody.data.progressPercent).toBe(100);
      expect(completeBody.data.resolvedDate).toBeDefined();
      expect(completeBody.data.successHistory.length).toBe(3);

      // Clean up
      await prisma.breakingPoint.delete({ where: { id: workflowBpId } });
    });
  });
});
