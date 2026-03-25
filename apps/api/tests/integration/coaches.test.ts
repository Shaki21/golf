import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';

describe('Coaches API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;
  let accessToken: string;
  let tenantId: string;
  let userId: string;
  let coachId: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();
    await app.ready();

    // Register a test user
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'admin@coachtest.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        organizationName: 'Coach Test Academy',
        role: 'admin',
      },
    });

    const registerBody = JSON.parse(registerResponse.body);
    accessToken = registerBody.data.accessToken;
    userId = registerBody.data.user.id;
    tenantId = registerBody.data.user.tenantId;
  });

  afterAll(async () => {
    // Clean up
    if (coachId) {
      await prisma.coach.delete({ where: { id: coachId } }).catch(() => {});
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

  describe('POST /api/v1/coaches', () => {
    it('should create a new coach', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/coaches',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Michael',
          lastName: 'Johnson',
          email: 'michael@coach.com',
          phone: '+1234567890',
          specializations: ['putting', 'short game', 'mental coaching'],
          certifications: [
            {
              name: 'PGA Professional',
              issuer: 'PGA',
              issuedDate: '2020-01-15',
            },
          ],
          workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
          },
          maxPlayersPerSession: 4,
          hourlyRate: 75.5,
          color: '#FF5733',
          status: 'active',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data.firstName).toBe('Michael');
      expect(body.data.email).toBe('michael@coach.com');
      expect(body.data.specializations).toContain('putting');
      expect(body.data.maxPlayersPerSession).toBe(4);

      coachId = body.data.id;
    });

    it('should reject duplicate email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/coaches',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Duplicate',
          lastName: 'Coach',
          email: 'michael@coach.com',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('CONFLICT');
    });

    it('should validate email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/coaches',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Invalid',
          lastName: 'Email',
          email: 'not-an-email',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate color format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/coaches',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Color',
          lastName: 'Test',
          email: 'color@test.com',
          color: 'invalid-color',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/coaches', () => {
    it('should list coaches with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/coaches?page=1&limit=10',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.coaches).toBeInstanceOf(Array);
      expect(body.data.pagination).toHaveProperty('page', 1);
      expect(body.data.pagination).toHaveProperty('limit', 10);
    });

    it('should filter coaches by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/coaches?status=active',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      body.data.coaches.forEach((coach: any) => {
        expect(coach.status).toBe('active');
      });
    });

    it('should search coaches by name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/coaches?search=Michael',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.coaches.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/coaches/:id', () => {
    it('should get coach by ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/coaches/${coachId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(coachId);
      expect(body.data.firstName).toBe('Michael');
      expect(body.data).toHaveProperty('_count');
    });

    it('should return 404 for non-existent coach', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/coaches/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/coaches/:id', () => {
    it('should update coach', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/coaches/${coachId}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          hourlyRate: 85.0,
          specializations: ['putting', 'short game', 'mental coaching', 'fitness'],
          status: 'active',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.hourlyRate).toBe('85');
      expect(body.data.specializations).toHaveLength(4);
    });

    it('should return 404 for non-existent coach', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/coaches/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          hourlyRate: 100,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/coaches/:id/availability', () => {
    it('should get coach availability', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/coaches/${coachId}/availability?startDate=2024-01-01&endDate=2024-01-31`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
    });

    it('should require date parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/coaches/${coachId}/availability`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/coaches/:id/statistics', () => {
    it('should get coach statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/coaches/${coachId}/statistics`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('coach');
      expect(body.data).toHaveProperty('players');
      expect(body.data).toHaveProperty('sessions');
      expect(body.data.players).toHaveProperty('total');
      expect(body.data.players).toHaveProperty('active');
      expect(body.data.players).toHaveProperty('byCategory');
      expect(body.data.sessions).toHaveProperty('thisWeek');
      expect(body.data.sessions).toHaveProperty('thisMonth');
      expect(body.data.sessions).toHaveProperty('totalHours');
    });
  });

  describe('DELETE /api/v1/coaches/:id', () => {
    it('should delete coach', async () => {
      // Create a coach to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/coaches',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'ToDelete',
          lastName: 'Coach',
          email: 'delete@coach.com',
        },
      });

      const createBody = JSON.parse(createResponse.body);
      const deleteCoachId = createBody.data.id;

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/coaches/${deleteCoachId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify coach is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/coaches/${deleteCoachId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
