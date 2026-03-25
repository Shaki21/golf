import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';
import { AnyFastifyInstance } from '../../src/types/fastify';

describe('Auth API Integration Tests', () => {
  let app: AnyFastifyInstance;
  let prisma: ReturnType<typeof getPrismaClient>;

  // Test data
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Test Organization',
    role: 'admin' as const,
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  let tenantId: string;

  beforeAll(async () => {
    // Build app
    app = await buildApp({ logger: false });
    prisma = getPrismaClient();

    // Wait for app to be ready
    await app.ready();
  });

  afterAll(async () => {
    // Clean up test data
    if (prisma) {
      if (userId) {
        await prisma.refreshToken.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      }
      if (tenantId) {
        await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {});
      }
      await prisma.$disconnect();
    }

    // Close app connection
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and organization', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: testUser,
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data).toHaveProperty('expiresIn', 900);
      expect(body.data.user).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
      });

      // Save tokens and IDs for other tests
      accessToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;
      userId = body.data.user.id;
      tenantId = body.data.user.tenantId;

      // Verify tenant was created
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      expect(tenant).toBeTruthy();
      expect(tenant?.name).toBe(testUser.organizationName);
      expect(tenant?.status).toBe('active');

      // Verify user was created
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(testUser.email);
      expect(user?.tenantId).toBe(tenantId);
      expect(user?.isActive).toBe(true);

      // Verify refresh token was stored
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(storedToken).toBeTruthy();
      expect(storedToken?.userId).toBe(userId);
      expect(storedToken?.isRevoked).toBe(false);
    });

    it('should reject registration with duplicate email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: testUser,
      });

      expect(response.statusCode).toBe(409);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CONFLICT');
      expect(body.error.message).toContain('already exists');
    });

    it('should validate registration input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'short',
          firstName: '',
          lastName: '',
          organizationName: '',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toBeInstanceOf(Array);
      expect(body.error.details.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data.user.email).toBe(testUser.email);

      // Update tokens for other tests
      accessToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;

      // Verify lastLoginAt was updated
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(user?.lastLoginAt).toBeTruthy();
    });

    it('should reject login with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject login with invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject login for inactive user', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(401);

      // Reactivate user for other tests
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user info with valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: userId,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
        tenantId: tenantId,
        isActive: true,
      });
    });

    it('should reject request without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Wait 1.1 seconds to ensure JWT timestamp (iat) changes
      // JWTs have second-level granularity, so tokens generated in same second are identical
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: refreshToken,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data.accessToken).not.toBe(accessToken); // New token
      expect(body.data.refreshToken).not.toBe(refreshToken); // New refresh token

      // Update tokens
      accessToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;
    });

    it('should reject refresh with invalid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: 'invalid-refresh-token',
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject refresh with revoked token', async () => {
      // Revoke the current refresh token
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: refreshToken,
        },
      });

      expect(response.statusCode).toBe(401);

      // Get new tokens by logging in again
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const loginBody = JSON.parse(loginResponse.body);
      accessToken = loginBody.data.accessToken;
      refreshToken = loginBody.data.refreshToken;
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    const newPassword = 'NewPassword123!';

    it('should change password with valid current password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          currentPassword: testUser.password,
          newPassword: newPassword,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('successfully');

      // Verify old refresh tokens were revoked
      const oldToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(oldToken?.isRevoked).toBe(true);

      // Verify can login with new password
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: newPassword,
        },
      });
      expect(loginResponse.statusCode).toBe(200);

      // Update tokens
      const loginBody = JSON.parse(loginResponse.body);
      accessToken = loginBody.data.accessToken;
      refreshToken = loginBody.data.refreshToken;

      // Change password back for other tests
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          currentPassword: newPassword,
          newPassword: testUser.password,
        },
      });

      // Get fresh tokens after changing password back
      const finalLoginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const finalLoginBody = JSON.parse(finalLoginResponse.body);
      accessToken = finalLoginBody.data.accessToken;
      refreshToken = finalLoginBody.data.refreshToken;
    });

    it('should reject change password with incorrect current password', async () => {
      // Get fresh token
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const loginBody = JSON.parse(loginResponse.body);
      accessToken = loginBody.data.accessToken;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          currentPassword: 'WrongPassword123!',
          newPassword: newPassword,
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject change password without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        payload: {
          currentPassword: testUser.password,
          newPassword: newPassword,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and revoke refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        payload: {
          refreshToken: refreshToken,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('successfully');

      // Verify token was revoked
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      expect(storedToken?.isRevoked).toBe(true);

      // Verify cannot refresh with revoked token
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: refreshToken,
        },
      });
      expect(refreshResponse.statusCode).toBe(401);
    });

    it('should handle logout with non-existent token gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        payload: {
          refreshToken: 'non-existent-token',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should accept forgot password request for existing user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/forgot-password',
        payload: {
          email: testUser.email,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('email');

      // Verify reset token was created
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(user?.passwordResetToken).toBeTruthy();
      expect(user?.passwordResetExpires).toBeTruthy();
    });

    it('should return success for non-existent email (security)', async () => {
      // Should not leak whether email exists
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/forgot-password',
        payload: {
          email: 'nonexistent@example.com',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should validate email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/forgot-password',
        payload: {
          email: 'invalid-email',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken: string;
    const crypto = require('crypto');

    beforeAll(async () => {
      // Generate a test reset token directly (bypassing email)
      resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Store the hashed token directly in the database
      await prisma.user.update({
        where: { email: testUser.email },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expiresAt,
        },
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'ResetPassword123!';

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/reset-password',
        payload: {
          token: resetToken,
          email: testUser.email,
          newPassword: newPassword,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: newPassword,
        },
      });
      expect(loginResponse.statusCode).toBe(200);

      // Reset password back to original for other tests
      const loginBody = JSON.parse(loginResponse.body);
      accessToken = loginBody.data.accessToken;

      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          currentPassword: newPassword,
          newPassword: testUser.password,
        },
      });

      // Get fresh tokens
      const finalLoginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });
      const finalLoginBody = JSON.parse(finalLoginResponse.body);
      accessToken = finalLoginBody.data.accessToken;
      refreshToken = finalLoginBody.data.refreshToken;
    });

    it('should reject reset with invalid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/reset-password',
        payload: {
          token: 'invalid-token',
          email: testUser.email,
          newPassword: 'NewPassword123!',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should reject reset with mismatched email', async () => {
      // Request new reset token
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/forgot-password',
        payload: {
          email: testUser.email,
        },
      });

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      const newResetToken = user?.passwordResetToken || '';

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/reset-password',
        payload: {
          token: newResetToken,
          email: 'different@example.com',
          newPassword: 'NewPassword123!',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject weak passwords', async () => {
      // Request new reset token
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/forgot-password',
        payload: {
          email: testUser.email,
        },
      });

      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      const newResetToken = user?.passwordResetToken || '';

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/reset-password',
        payload: {
          token: newResetToken,
          email: testUser.email,
          newPassword: 'weak',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Multi-tenant isolation', () => {
    it('should isolate users by tenant', async () => {
      // Register second user/tenant
      const secondUser = {
        email: 'test2@example.com',
        password: 'TestPassword123!',
        firstName: 'Test2',
        lastName: 'User2',
        organizationName: 'Test Organization 2',
        role: 'admin' as const,
      };

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: secondUser,
      });

      expect(registerResponse.statusCode).toBe(201);

      const registerBody = JSON.parse(registerResponse.body);
      const secondUserId = registerBody.data.user.id;
      const secondTenantId = registerBody.data.user.tenantId;

      // Verify tenants are different
      expect(secondTenantId).not.toBe(tenantId);

      // Clean up
      await prisma.refreshToken.deleteMany({ where: { userId: secondUserId } });
      await prisma.user.delete({ where: { id: secondUserId } });
      await prisma.tenant.delete({ where: { id: secondTenantId } });
    });
  });
});
