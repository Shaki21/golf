import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';

describe('Exercises API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let accessToken: string;
  let tenantId: string;
  let userId: string;
  let exerciseId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'admin@exercisetest.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        organizationName: 'Exercise Test Academy',
        role: 'admin',
      },
    });

    const registerBody = JSON.parse(registerResponse.body);
    accessToken = registerBody.data.accessToken;
    userId = registerBody.data.user.id;
    tenantId = registerBody.data.user.tenantId;
  });

  afterAll(async () => {
    if (exerciseId) {
      await prisma.exercise.delete({ where: { id: exerciseId } }).catch(() => {});
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

  describe('POST /api/v1/exercises', () => {
    it('should create a new exercise', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/exercises',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Putting Drill - Gate Exercise',
          description: 'Practice putting through a narrow gate to improve accuracy',
          purpose: 'Improve putting accuracy and consistency',
          exerciseType: 'putting',
          learningPhases: ['L3', 'L4'],
          settings: ['S3', 'S4'],
          clubSpeedLevels: ['CS40', 'CS50'],
          categories: ['C', 'D', 'E'],
          periods: ['G', 'S'],
          repsOrTime: '10 putts per distance',
          equipment: ['gate', 'balls', 'putter'],
          location: 'indoor',
          difficulty: 'intermediate',
          progressionSteps: 'Increase distance, narrow gate width',
          regressionSteps: 'Widen gate, reduce distance',
          successCriteria: '8/10 putts through gate',
          commonMistakes: 'Lifting head too early, decelerating',
          coachingCues: 'Keep head still, smooth tempo',
          addressesBreakingPoints: ['alignment', 'tempo'],
          processCategory: 'short_game',
          isActive: true,
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.name).toBe('Putting Drill - Gate Exercise');
      expect(body.data.exerciseType).toBe('putting');
      expect(body.data.categories).toContain('C');
      expect(body.data.periods).toContain('G');

      exerciseId = body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/exercises',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Incomplete Exercise',
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/exercises', () => {
    it('should list exercises with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?page=1&limit=50',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.exercises).toBeInstanceOf(Array);
      expect(body.data.pagination).toHaveProperty('page', 1);
      expect(body.data.pagination).toHaveProperty('limit', 50);
    });

    it('should filter by exercise type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?exerciseType=putting',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.exercises.forEach((ex: any) => {
        expect(ex.exerciseType).toBe('putting');
      });
    });

    it('should filter by category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?category=C',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.exercises.forEach((ex: any) => {
        expect(ex.categories).toContain('C');
      });
    });

    it('should filter by period', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?period=G',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.exercises.forEach((ex: any) => {
        expect(ex.periods).toContain('G');
      });
    });

    it('should filter by difficulty', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?difficulty=intermediate',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.exercises.forEach((ex: any) => {
        expect(ex.difficulty).toBe('intermediate');
      });
    });

    it('should search exercises by name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?search=Gate',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.exercises.length).toBeGreaterThan(0);
    });

    it('should filter by learning phase', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?learningPhase=L3',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.exercises.forEach((ex: any) => {
        expect(ex.learningPhases).toContain('L3');
      });
    });

    it('should filter by breaking point', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises?breakingPoint=alignment',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.exercises.forEach((ex: any) => {
        expect(ex.addressesBreakingPoints).toContain('alignment');
      });
    });
  });

  describe('GET /api/v1/exercises/:id', () => {
    it('should get exercise by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/exercises/${exerciseId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(exerciseId);
      expect(body.data.name).toBe('Putting Drill - Gate Exercise');
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/exercises/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/exercises/:id', () => {
    it('should update exercise', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/exercises/${exerciseId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          difficulty: 'advanced',
          repsOrTime: '15 putts per distance',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.difficulty).toBe('advanced');
      expect(body.data.repsOrTime).toBe('15 putts per distance');
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/exercises/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          difficulty: 'elite',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/exercises/:id', () => {
    it('should delete exercise', async () => {
      // Create an exercise to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/exercises',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'To Delete Exercise',
          description: 'Test exercise for deletion',
          exerciseType: 'driving',
          processCategory: 'full_swing',
        },
      });

      const createBody = JSON.parse(createResponse.body);
      const deleteExerciseId = createBody.data.id;

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/exercises/${deleteExerciseId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify exercise is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/exercises/${deleteExerciseId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
