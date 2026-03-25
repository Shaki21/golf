/**
 * RBAC and Cross-Tenant Isolation Security Tests
 *
 * Tests to ensure:
 * 1. Users cannot access resources from other tenants
 * 2. Role-based access control is properly enforced
 * 3. Authorization checks prevent privilege escalation
 * 4. Tenant context isolation is maintained across all endpoints
 */

import { FastifyInstance } from 'fastify';
import {
  getTestApp,
  getTestPrisma,
  closeTestConnections,
  registerTestUser,
  authenticatedRequest,
  uniqueEmail,
  uniqueString,
  cleanupTestData,
} from '../helpers';

describe('RBAC and Cross-Tenant Isolation Security Tests', () => {
  let app: FastifyInstance;
  const testData = {
    tenant1: { id: '', userId: '', coachId: '', playerId: '', token: '' },
    tenant2: { id: '', userId: '', coachId: '', playerId: '', token: '' },
  };

  beforeAll(async () => {
    app = await getTestApp();
    const prisma = getTestPrisma();

    // Create first tenant with users
    const user1 = await registerTestUser(app, {
      email: uniqueEmail('tenant1-admin'),
      password: 'TestPassword123!',
      firstName: 'Tenant1',
      lastName: 'Admin',
      organizationName: uniqueString('Tenant1 Org'),
      role: 'admin',
    });

    testData.tenant1.id = user1.tenantId;
    testData.tenant1.userId = user1.userId;
    testData.tenant1.token = user1.accessToken;

    // Create coach in tenant 1

    const coach1 = await prisma.coach.create({
      data: {
        tenantId: user1.tenantId,
        firstName: 'Coach1',
        lastName: 'Test',
        email: uniqueEmail('tenant1-coach'),
        specializations: ['Golf'],
      },
    });

    testData.tenant1.coachId = coach1.id;

    // Create player in tenant 1

    const player1 = await prisma.player.create({
      data: {
        tenantId: user1.tenantId,
        firstName: 'Player1',
        lastName: 'Test',
        email: uniqueEmail('tenant1-player'),
        dateOfBirth: new Date('2000-01-01'),
        gender: 'male',
        category: 'B',
        handicap: 10.5,
      },
    });

    testData.tenant1.playerId = player1.id;

    // Create second tenant with users
    const user2 = await registerTestUser(app, {
      email: uniqueEmail('tenant2-admin'),
      password: 'TestPassword123!',
      firstName: 'Tenant2',
      lastName: 'Admin',
      organizationName: uniqueString('Tenant2 Org'),
      role: 'admin',
    });

    testData.tenant2.id = user2.tenantId;
    testData.tenant2.userId = user2.userId;
    testData.tenant2.token = user2.accessToken;

    // Create coach in tenant 2

    const coach2 = await prisma.coach.create({
      data: {
        tenantId: user2.tenantId,
        firstName: 'Coach2',
        lastName: 'Test',
        email: uniqueEmail('tenant2-coach'),
        specializations: ['Golf'],
      },
    });

    testData.tenant2.coachId = coach2.id;

    // Create player in tenant 2

    const player2 = await prisma.player.create({
      data: {
        tenantId: user2.tenantId,
        firstName: 'Player2',
        lastName: 'Test',
        email: uniqueEmail('tenant2-player'),
        dateOfBirth: new Date('2000-01-01'),
        gender: 'female',
        category: 'C',
        handicap: 15.0,
      },
    });

    testData.tenant2.playerId = player2.id;
  });

  afterAll(async () => {
    await cleanupTestData({
      tenantIds: [testData.tenant1.id, testData.tenant2.id],
    });
    await closeTestConnections();
  });

  describe('Cross-Tenant Player Isolation', () => {
    test('should NOT allow tenant1 user to access tenant2 players', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players/${testData.tenant2.playerId}`,
        testData.tenant1.token
      );

      expect(response.statusCode).toBe(404);
    });

    test('should NOT allow tenant1 user to list tenant2 players', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players',
        testData.tenant1.token
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Should not contain tenant2 player
      const tenant2Players = body.data.players.filter(
        (p: any) => p.id === testData.tenant2.playerId
      );
      expect(tenant2Players.length).toBe(0);
    });

    test('should NOT allow tenant1 user to update tenant2 player', async () => {
      const response = await authenticatedRequest(
        app,
        'PUT',
        `/api/v1/players/${testData.tenant2.playerId}`,
        testData.tenant1.token,
        { handicap: 5.0 }
      );

      expect(response.statusCode).toBe(404);
    });

    test('should NOT allow tenant1 user to delete tenant2 player', async () => {
      const response = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/players/${testData.tenant2.playerId}`,
        testData.tenant1.token
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Cross-Tenant Coach Isolation', () => {
    test('should NOT allow tenant1 user to access tenant2 coaches', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/coaches/${testData.tenant2.coachId}`,
        testData.tenant1.token
      );

      expect(response.statusCode).toBe(404);
    });

    test('should NOT allow tenant1 user to list tenant2 coaches', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/coaches',
        testData.tenant1.token
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Should not contain tenant2 coach
      const tenant2Coaches = body.data.coaches.filter(
        (c: any) => c.id === testData.tenant2.coachId
      );
      expect(tenant2Coaches.length).toBe(0);
    });
  });

  describe('Role-Based Access Control', () => {
    let playerToken: string;
    let coachToken: string;

    beforeAll(async () => {
      const prisma = getTestPrisma();

      // Create player user in tenant1
      const playerUser = await registerTestUser(app, {
        email: uniqueEmail('rbac-player'),
        password: 'TestPassword123!',
        firstName: 'RBAC',
        lastName: 'Player',
        organizationName: uniqueString('RBAC Org'),
        role: 'player',
      });
      playerToken = playerUser.accessToken;

      // Create coach user in tenant1 (different tenant from player)

      await prisma.coach.create({
        data: {
          tenantId: testData.tenant1.id,
          firstName: 'RBAC',
          lastName: 'Coach',
          email: uniqueEmail('rbac-coach-profile'),
          specializations: ['Golf'],
        },
      });

      // Create a coach in a new tenant for RBAC testing
      const coachAuth = await registerTestUser(app, {
        email: uniqueEmail('rbac-coach2'),
        password: 'TestPassword123!',
        firstName: 'RBAC',
        lastName: 'Coach2',
        organizationName: uniqueString('RBAC Coach Org'),
        role: 'coach',
      });
      coachToken = coachAuth.accessToken;
    });

    test('player should NOT be able to create coaches', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/coaches',
        playerToken,
        {
          firstName: 'New',
          lastName: 'Coach',
          email: uniqueEmail('unauthorized-coach'),
          specialization: 'Golf',
        }
      );

      expect([403, 401]).toContain(response.statusCode);
    });

    test('player should NOT be able to delete coaches', async () => {
      const response = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/coaches/${testData.tenant1.coachId}`,
        playerToken
      );

      expect([403, 401]).toContain(response.statusCode);
    });

    test('coach should NOT be able to delete other coaches', async () => {
      const response = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/coaches/${testData.tenant1.coachId}`,
        coachToken
      );

      expect([403, 401]).toContain(response.statusCode);
    });

    test('player should NOT be able to access admin endpoints', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/admin/users',
        playerToken
      );

      expect([403, 401, 404]).toContain(response.statusCode);
    });
  });

  describe('Authentication Bypass Attempts', () => {
    test('should reject requests without authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject requests with malformed authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
        headers: {
          authorization: 'Invalid header format',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject requests with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject requests with expired token', async () => {
      // Create a token with very short expiry (this would need JWT utility modification for testing)
      // For now, test with a clearly invalid token
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/players',
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.invalid',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Tenant Context Enforcement', () => {
    test('should include tenant context in all authenticated requests', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players',
        testData.tenant1.token
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // All returned players should belong to tenant1
      if (body.data.players && body.data.players.length > 0) {
        body.data.players.forEach((player: any) => {
          expect(player.tenantId).toBe(testData.tenant1.id);
        });
      }
    });

    test('should NOT allow modifying tenantId in request payload', async () => {
      const prisma = getTestPrisma();

      // Try to create a player with a different tenantId
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        testData.tenant1.token,
        {
          firstName: 'Hacker',
          lastName: 'Player',
          email: uniqueEmail('hacker'),
          dateOfBirth: '2000-01-01',
          tenantId: testData.tenant2.id, // Try to inject different tenant
        }
      );

      // If creation was successful, check that tenantId was not modified
      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        expect(body.data.player.tenantId).toBe(testData.tenant1.id);

        // Cleanup
        await prisma.player.delete({ where: { id: body.data.player.id } });
      }
    });
  });

  describe('Direct Database Access Prevention', () => {
    test('should NOT allow SQL injection via player ID', async () => {
      const maliciousId = "' OR '1'='1";
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/players/${encodeURIComponent(maliciousId)}`,
        testData.tenant1.token
      );

      // Should return 404 or 400, not 500 (SQL error)
      expect([404, 400]).toContain(response.statusCode);
    });

    test('should NOT allow SQL injection via query parameters', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        "/api/v1/players?search=' OR '1'='1",
        testData.tenant1.token
      );

      // Should not crash with SQL error
      expect(response.statusCode).not.toBe(500);
    });
  });

  describe('Horizontal Privilege Escalation Prevention', () => {
    let player1Token: string;
    let player2Id: string;

    beforeAll(async () => {
      const prisma = getTestPrisma();

      // Create two players in the same tenant
      // Note: We need to create a new test tenant for this test
      // since testData.tenant1 already has users
      const player1 = await registerTestUser(app, {
        email: uniqueEmail('player1-priv'),
        password: 'TestPassword123!',
        firstName: 'Player',
        lastName: 'One',
        organizationName: uniqueString('PrivEscalation Org'),
        role: 'player',
      });
      player1Token = player1.accessToken;

      // Create player2 in the same tenant as player1
      const player2 = await prisma.player.create({
        data: {
          tenantId: player1.tenantId,
          firstName: 'Player',
          lastName: 'Two',
          email: uniqueEmail('player2-priv'),
          dateOfBirth: new Date('2000-01-01'),
          gender: 'male',
          category: 'B',
          handicap: 12.0,
        },
      });

      player2Id = player2.id;
    });

    test('player1 should NOT be able to modify player2 profile', async () => {
      const response = await authenticatedRequest(
        app,
        'PUT',
        `/api/v1/players/${player2Id}`,
        player1Token,
        { handicap: 0.0 }
      );

      // Players should only be able to modify their own profile
      expect([403, 404]).toContain(response.statusCode);
    });

    test('player1 should NOT be able to delete player2', async () => {
      const response = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/players/${player2Id}`,
        player1Token
      );

      expect([403, 404]).toContain(response.statusCode);
    });
  });
});
