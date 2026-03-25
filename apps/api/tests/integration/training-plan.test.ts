import { FastifyInstance } from 'fastify';
import {
  getTestApp,
  getTestPrisma,
  registerTestUser,
  uniqueEmail,
  uniqueString,
} from '../helpers';

describe('Training Plan API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: ReturnType<typeof getTestPrisma>;
  let accessToken: string;
  let tenantId: string;
  let userId: string;
  let playerId: string;
  let planId: string;

  beforeAll(async () => {
    try {
      app = await getTestApp();
      prisma = getTestPrisma();

      // Register a test user (coach) with unique email
      const userData = await registerTestUser(app, {
        email: uniqueEmail('plan-coach'),
        password: 'TestPassword123!',
        firstName: 'Plan',
        lastName: 'Coach',
        organizationName: uniqueString('Training Plan Test Academy'),
        role: 'coach',
      });

      accessToken = userData.accessToken;
      userId = userData.userId;
      tenantId = userData.tenantId;

      console.log('✅ Registered coach user, accessToken length:', accessToken?.length);

      // Create a test player with unique email
      const playerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/players',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Plan',
          lastName: 'Player',
          email: uniqueEmail('plan-player'),
          dateOfBirth: '2008-03-10',
          gender: 'male',
          category: 'A',
          handicap: 8.5,
        },
      });

      console.log('Player creation response status:', playerResponse.statusCode);
      console.log('Player creation response body:', playerResponse.body);

      const playerBody = JSON.parse(playerResponse.body);
      playerId = playerBody.data?.id;

      if (!playerId) {
        console.error('❌ Failed to create player! Response:', playerBody);
      } else {
        console.log('✅ Created player with ID:', playerId);
      }
    } catch (error) {
      console.error('❌ BeforeAll failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data in order (dependent tables first)
    if (prisma) {
      if (planId) {
        await prisma.dailyTrainingAssignment.deleteMany({ where: { annualPlanId: planId } }).catch(() => {});
        await prisma.periodization.deleteMany({ where: { annualPlanId: planId } }).catch(() => {});
        await prisma.scheduledTournament.deleteMany({ where: { annualPlanId: planId } }).catch(() => {});
        await prisma.annualTrainingPlan.delete({ where: { id: planId } }).catch(() => {});
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
  });

  describe('GET /api/v1/training-plan', () => {
    it('should list training plans', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/training-plan',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/training-plan/generate', () => {
    it('should generate a 12-month training plan', async () => {
      if (!playerId) {
        console.log('⚠️  Skipping test - playerId not set. BeforeAll may have failed.');
        return;
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + 1);
      startDate.setDate(1);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/training-plan/generate',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId,
          startDate: startDate.toISOString().split('T')[0],
          baselineAverageScore: 82,
          baselineHandicap: 8.5,
          baselineDriverSpeed: 98,
          planName: 'Test Plan 2025',
          weeklyHoursTarget: 15,
          tournaments: [
            {
              name: 'NM Amatorer',
              startDate: '2025-07-15',
              endDate: '2025-07-18',
              importance: 'A',
            },
            {
              name: 'Regionale mesterskap',
              startDate: '2025-05-10',
              endDate: '2025-05-12',
              importance: 'B',
            },
          ],
          preferredTrainingDays: [1, 2, 3, 4, 5],
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('annualPlan');
      expect(body.data).toHaveProperty('dailyAssignments');
      expect(body.data).toHaveProperty('tournaments');
      expect(body.data.dailyAssignments.created).toBeGreaterThan(300);

      planId = body.data.annualPlan.id;
    });

    it('should reject duplicate active plan', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/training-plan/generate',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId,
          startDate: '2025-01-01',
          baselineAverageScore: 85,
        },
      });

      expect(response.statusCode).toBe(409);

      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('ACTIVE_PLAN_EXISTS');
    });

    it('should validate baseline score range', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/training-plan/generate',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: '00000000-0000-0000-0000-000000000099',
          startDate: '2025-01-01',
          baselineAverageScore: 200, // Invalid - max is 150
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/training-plan/player/:playerId', () => {
    it('should get training plan for player', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/player/${playerId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('periodizations');
      expect(body.data).toHaveProperty('scheduledTournaments');
      expect(body.data).toHaveProperty('dailyAssignments');
    });

    it('should return 404 for player without plan', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/training-plan/player/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/training-plan/:planId/calendar', () => {
    it('should get calendar view', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/calendar`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('assignments');
      expect(body.data).toHaveProperty('summary');
      expect(body.data.summary).toHaveProperty('totalAssignments');
      expect(body.data.summary).toHaveProperty('bySessionType');
    });

    it('should filter by date range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/calendar?startDate=2025-01-01&endDate=2025-01-31`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should filter by week number', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/calendar?weekNumber=1`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/training-plan/:planId/full', () => {
    it('should get complete training plan', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/full`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('annualPlan');
      expect(body.data).toHaveProperty('periodizations');
      expect(body.data).toHaveProperty('dailyAssignments');
      expect(body.data).toHaveProperty('tournaments');
      expect(body.data).toHaveProperty('statistics');
    });

    it('should include session details when requested', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/full?includeSessionDetails=true`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/training-plan/:planId/today', () => {
    it('should get today\'s assignment', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/today`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('hasAssignment');
    });
  });

  describe('PUT /api/v1/training-plan/:planId/daily/:date', () => {
    it('should update daily assignment', async () => {
      // Get a valid assignment date first
      const calendarResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/calendar`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      const calendarBody = JSON.parse(calendarResponse.body);
      if (calendarBody.data.assignments.length === 0) {
        console.log('No assignments to update');
        return;
      }

      const assignment = calendarBody.data.assignments[0];
      const date = new Date(assignment.assignedDate).toISOString().split('T')[0];

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/training-plan/${planId}/daily/${date}`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          coachNotes: 'Focus on technique today',
          estimatedDuration: 75,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.coachNotes).toBe('Focus on technique today');
    });
  });

  describe('PUT /api/v1/training-plan/:planId/daily/:date/quick-action', () => {
    it('should complete assignment via quick action', async () => {
      const calendarResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/calendar`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      const calendarBody = JSON.parse(calendarResponse.body);
      const plannedAssignment = calendarBody.data.assignments.find(
        (a: any) => a.status === 'planned' && !a.isRestDay
      );

      if (!plannedAssignment) {
        console.log('No planned assignments to complete');
        return;
      }

      const date = new Date(plannedAssignment.assignedDate).toISOString().split('T')[0];

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/training-plan/${planId}/daily/${date}/quick-action`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          action: 'complete',
          duration: 65,
          notes: 'Great session!',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('completed');
    });

    it('should skip assignment via quick action', async () => {
      const calendarResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/calendar`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      const calendarBody = JSON.parse(calendarResponse.body);
      const plannedAssignment = calendarBody.data.assignments.find(
        (a: any) => a.status === 'planned' && !a.isRestDay
      );

      if (!plannedAssignment) {
        console.log('No planned assignments to skip');
        return;
      }

      const date = new Date(plannedAssignment.assignedDate).toISOString().split('T')[0];

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/training-plan/${planId}/daily/${date}/quick-action`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          action: 'skip',
          notes: 'Sick day',
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/v1/training-plan/:planId/tournaments', () => {
    it('should add tournament to plan', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/training-plan/${planId}/tournaments`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          name: 'Club Championship',
          startDate: '2025-09-20',
          endDate: '2025-09-22',
          importance: 'B',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Club Championship');
      expect(body.data.importance).toBe('B');
    });
  });

  describe('GET /api/v1/training-plan/:planId/analytics', () => {
    it('should get plan analytics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/analytics`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('overview');
      expect(body.data).toHaveProperty('weeklyTrend');
      expect(body.data).toHaveProperty('periodBreakdown');
      expect(body.data.overview).toHaveProperty('completionRate');
      expect(body.data.overview).toHaveProperty('currentStreak');
    });
  });

  describe('GET /api/v1/training-plan/:planId/achievements', () => {
    it('should get player achievements', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${planId}/achievements`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('stats');
      expect(body.data).toHaveProperty('achievements');
      expect(body.data).toHaveProperty('totalXP');
    });
  });

  describe('POST /api/v1/training-plan/:planId/modification-request', () => {
    it('should create modification request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/training-plan/${planId}/modification-request`,
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          concerns: ['Too many sessions per week', 'Need more rest days'],
          notes: 'I have exams in week 12-14',
          urgency: 'medium',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('requestId');
      expect(body.data.status).toBe('pending');
    });
  });

  describe('DELETE /api/v1/training-plan/:planId', () => {
    it('should delete training plan', async () => {
      // Create a new plan to delete
      const createPlayerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/players',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          firstName: 'Delete',
          lastName: 'Player',
          email: 'delete@trainingplantest.com',
          dateOfBirth: '2010-01-01',
          gender: 'female',
          category: 'C',
        },
      });

      const createPlayerBody = JSON.parse(createPlayerResponse.body);
      const deletePlayerId = createPlayerBody.data.id;

      const createPlanResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/training-plan/generate',
        headers: { authorization: `Bearer ${accessToken}` },
        payload: {
          playerId: deletePlayerId,
          startDate: '2026-01-01',
          baselineAverageScore: 90,
          planName: 'Plan to Delete',
        },
      });

      const createPlanBody = JSON.parse(createPlanResponse.body);
      const deletePlanId = createPlanBody.data.annualPlan.id;

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/v1/training-plan/${deletePlanId}`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);

      const deleteBody = JSON.parse(deleteResponse.body);
      expect(deleteBody.success).toBe(true);

      // Verify plan is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/training-plan/${deletePlanId}/full`,
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(getResponse.statusCode).toBe(404);

      // Clean up the test player
      await prisma.player.delete({ where: { id: deletePlayerId } }).catch(() => {});
    });
  });
});
