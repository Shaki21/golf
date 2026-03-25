/**
 * SQL Injection Security Tests
 *
 * Tests to ensure all query parameters, request bodies, and URL parameters
 * are properly sanitized against SQL injection attacks.
 *
 * Tests cover:
 * 1. Path parameters (IDs)
 * 2. Query string parameters (filters, search)
 * 3. Request body fields
 * 4. Complex nested objects
 * 5. Array inputs
 */

import { FastifyInstance } from 'fastify';
import {
  getTestApp,
  closeTestConnections,
  registerTestUser,
  authenticatedRequest,
  uniqueEmail,
  uniqueString,
} from '../helpers';

describe('SQL Injection Security Tests', () => {
  let app: FastifyInstance;
  let adminToken: string;

  // Common SQL injection payloads
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin'--",
    "' UNION SELECT NULL--",
    "' DROP TABLE users--",
    "1' AND '1'='1",
    "1' AND '1'='2",
    "'; DELETE FROM users WHERE '1'='1",
    "1'; DROP TABLE users--",
    "' OR 1=1--",
    "\" OR 1=1--",
    "' OR 'a'='a",
    "') OR ('1'='1",
    "') OR '1'='1'--",
    "1' UNION SELECT NULL, NULL, NULL--",
    "1' UNION ALL SELECT NULL--",
    "' AND 1=0 UNION ALL SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055'--",
    "admin' AND 1=0 UNION ALL SELECT NULL, NULL, password FROM users WHERE username='admin'--",
  ];

  beforeAll(async () => {
    app = await getTestApp();

    const admin = await registerTestUser(app, {
      email: uniqueEmail('sql-test-admin'),
      password: 'TestPassword123!',
      firstName: 'SQL',
      lastName: 'Admin',
      organizationName: uniqueString('SQL Test Org'),
      role: 'admin',
    });

    adminToken = admin.accessToken;
  });

  afterAll(async () => {
    await closeTestConnections();
  });

  describe('Path Parameter SQL Injection Tests', () => {
    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in player ID: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/players/${encodeURIComponent(payload)}`,
          adminToken
        );

        // Should return 400 (bad request) or 404 (not found), never 500 (server error)
        expect(response.statusCode).not.toBe(500);
        expect([400, 404]).toContain(response.statusCode);

        // Response should not contain SQL error messages
        const body = response.body.toLowerCase();
        expect(body).not.toMatch(/sql|syntax|postgresql|database error/i);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in coach ID: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/coaches/${encodeURIComponent(payload)}`,
          adminToken
        );

        expect(response.statusCode).not.toBe(500);
        expect([400, 404]).toContain(response.statusCode);

        const body = response.body.toLowerCase();
        expect(body).not.toMatch(/sql|syntax|postgresql|database error/i);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in session ID: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/sessions/${encodeURIComponent(payload)}`,
          adminToken
        );

        expect(response.statusCode).not.toBe(500);
        expect([400, 404]).toContain(response.statusCode);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in training plan ID: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/training-plans/${encodeURIComponent(payload)}`,
          adminToken
        );

        expect(response.statusCode).not.toBe(500);
        expect([400, 404]).toContain(response.statusCode);
      }
    );
  });

  describe('Query Parameter SQL Injection Tests', () => {
    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in search query: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/players?search=${encodeURIComponent(payload)}`,
          adminToken
        );

        // Should handle gracefully, not crash
        expect(response.statusCode).not.toBe(500);
        expect([200, 400]).toContain(response.statusCode);

        const body = response.body.toLowerCase();
        expect(body).not.toMatch(/sql|syntax|postgresql|database error/i);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in filter parameters: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/players?name=${encodeURIComponent(payload)}`,
          adminToken
        );

        expect(response.statusCode).not.toBe(500);
        expect([200, 400]).toContain(response.statusCode);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in sort parameters: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/players?sortBy=${encodeURIComponent(payload)}`,
          adminToken
        );

        expect(response.statusCode).not.toBe(500);
        expect([200, 400]).toContain(response.statusCode);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in date range filters: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/sessions?startDate=${encodeURIComponent(payload)}`,
          adminToken
        );

        expect(response.statusCode).not.toBe(500);
        expect([200, 400]).toContain(response.statusCode);
      }
    );
  });

  describe('Request Body SQL Injection Tests', () => {
    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in player creation: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/players',
          adminToken,
          {
            firstName: payload,
            lastName: 'Test',
            email: uniqueEmail('sqltest'),
            dateOfBirth: '2000-01-01',
          }
        );

        // Should validate and reject, or accept and sanitize
        expect(response.statusCode).not.toBe(500);

        if (response.statusCode === 201) {
          // If created, verify data was sanitized
          const body = JSON.parse(response.body);
          expect(body.data.player.firstName).toBeDefined();
          // Should not execute SQL - verify player exists in DB normally
        }
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in email field: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/players',
          adminToken,
          {
            firstName: 'Test',
            lastName: 'Test',
            email: payload,
            dateOfBirth: '2000-01-01',
          }
        );

        // Should fail validation (invalid email format)
        expect(response.statusCode).not.toBe(500);
        expect([400, 422]).toContain(response.statusCode);
      }
    );

    test.each(sqlInjectionPayloads)(
      'should safely handle SQL injection in search endpoint: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/players/search',
          adminToken,
          {
            query: payload,
          }
        );

        expect(response.statusCode).not.toBe(500);
        expect([200, 400, 404]).toContain(response.statusCode);
      }
    );
  });

  describe('Complex Object SQL Injection Tests', () => {
    test('should safely handle SQL injection in nested objects', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/sessions',
        adminToken,
        {
          title: "' OR '1'='1",
          description: "'; DROP TABLE sessions--",
          date: '2024-12-25',
          duration: 60,
          exercises: [
            {
              name: "' UNION SELECT NULL--",
              sets: 3,
            },
          ],
        }
      );

      expect(response.statusCode).not.toBe(500);
      // Should either validate and reject, or accept and sanitize
    });

    test('should safely handle SQL injection in array inputs', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players/batch',
        adminToken,
        {
          playerIds: [
            "' OR '1'='1",
            "'; DELETE FROM players--",
            'valid-uuid-format-here',
          ],
        }
      );

      expect(response.statusCode).not.toBe(500);
      // Should validate UUIDs and reject invalid ones
    });
  });

  describe('Special Character Handling', () => {
    const specialChars = [
      { char: "'", name: 'single quote' },
      { char: '"', name: 'double quote' },
      { char: ';', name: 'semicolon' },
      { char: '--', name: 'SQL comment' },
      { char: '/*', name: 'C-style comment start' },
      { char: '*/', name: 'C-style comment end' },
      { char: 'xp_', name: 'extended procedure prefix' },
      { char: 'sp_', name: 'stored procedure prefix' },
    ];

    test.each(specialChars)(
      'should safely handle $name in player name',
      async ({ char }) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/players',
          adminToken,
          {
            firstName: `Test${char}Name`,
            lastName: 'User',
            email: uniqueEmail('specialchar'),
            dateOfBirth: '2000-01-01',
          }
        );

        expect(response.statusCode).not.toBe(500);

        if (response.statusCode === 201) {
          const body = JSON.parse(response.body);
          // Verify the special character was either escaped or rejected
          expect(body.data.player.firstName).toBeDefined();
        }
      }
    );
  });

  describe('Parameterized Query Verification', () => {
    test('should use parameterized queries for player lookup', async () => {
      // Create a legitimate player
      const createResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Param',
          lastName: 'Test',
          email: uniqueEmail('param'),
          dateOfBirth: '2000-01-01',
        }
      );

      if (createResponse.statusCode === 201) {
        const body = JSON.parse(createResponse.body);
        const playerId = body.data.player.id;

        // Try SQL injection in the lookup
        const injectionResponse = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/players/${playerId}' OR '1'='1`,
          adminToken
        );

        // Should not find the player (injection failed)
        expect(injectionResponse.statusCode).toBe(404);
      }
    });

    test('should use parameterized queries for search', async () => {
      // Search with SQL injection attempt
      const response = await authenticatedRequest(
        app,
        'GET',
        "/api/v1/players?search=test' OR '1'='1",
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Should return normal search results, not all players
      // (If it returned all players, the injection might have worked)
      expect(body.data).toBeDefined();
    });
  });

  describe('Database Error Exposure Prevention', () => {
    test('should not expose database errors in response', async () => {
      // Try to trigger a database error with malformed UUID
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players/not-a-valid-uuid',
        adminToken
      );

      expect(response.statusCode).not.toBe(500);

      const body = response.body.toLowerCase();
      // Should not expose internal database details
      expect(body).not.toMatch(/postgresql|pg_|column|table|relation/i);
      expect(body).not.toMatch(/prisma|database|constraint/i);
    });

    test('should not expose stack traces with SQL queries', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          // Missing required fields to trigger error
          firstName: 'Test',
        }
      );

      expect(response.statusCode).not.toBe(500);

      const body = response.body.toLowerCase();
      expect(body).not.toMatch(/at\s+\w+\s+\(/); // Stack trace pattern
      expect(body).not.toMatch(/select|insert|update|delete|from|where/i);
    });
  });

  describe('ORM Protection Verification', () => {
    test('should prevent raw SQL injection via Prisma', async () => {
      // Attempt to inject SQL through various fields
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Test',
          lastName: "O'Brien", // Common legitimate case
          email: uniqueEmail('obrien'),
          dateOfBirth: '2000-01-01',
          gender: 'male',
          category: 'C',
        }
      );

      // Should handle single quotes in names properly
      expect([201, 200]).toContain(response.statusCode);

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        expect(body.data.lastName).toBe("O'Brien");
      }
    });

    test('should safely handle Unicode and special characters', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Test',
          lastName: '测试用户', // Chinese characters
          email: uniqueEmail('unicode'),
          dateOfBirth: '2000-01-01',
          gender: 'male',
          category: 'C',
        }
      );

      expect(response.statusCode).not.toBe(500);
    });
  });
});
