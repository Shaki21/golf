import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './service';
import { SecurityService } from './security.service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetTokenSchema,
  setup2FASchema,
  verify2FASchema,
  disable2FASchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  LogoutInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyResetTokenInput,
  Setup2FAInput,
  Verify2FAInput,
  Disable2FAInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';

/**
 * Register auth routes
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const authService = new AuthService(prisma);
  const securityService = new SecurityService(prisma);

  /**
   * Register a new user and organization
   */
  app.post<{ Body: RegisterInput }>(
    '/register',
    {
      schema: {
        description: 'Register a new user and create an organization',
        tags: ['auth'],
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                  expiresIn: { type: 'number', example: 900 },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      role: { type: 'string' },
                      tenantId: { type: 'string' },
                      onboardingComplete: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
      const input = validate(registerSchema, request.body);
      const result = await authService.register(input);
      return reply.code(201).send({ success: true, data: result });
    }
  );

  /**
   * Login with email and password
   */
  app.post<{ Body: LoginInput }>(
    '/login',
    {
      schema: {
        description: 'Login with email and password',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                  expiresIn: { type: 'number', example: 900 },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      role: { type: 'string' },
                      tenantId: { type: 'string' },
                      onboardingComplete: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
      const input = validate(loginSchema, request.body);
      const result = await authService.login(input);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Refresh access token
   */
  app.post<{ Body: RefreshTokenInput }>(
    '/refresh',
    {
      schema: {
        description: 'Refresh access token using refresh token',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                  expiresIn: { type: 'number', example: 900 },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      role: { type: 'string' },
                      tenantId: { type: 'string' },
                      onboardingComplete: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) => {
      const input = validate(refreshTokenSchema, request.body);
      const result = await authService.refreshAccessToken(input.refreshToken);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Logout (revoke refresh token)
   * Note: Does not require authentication - only needs refresh token in body
   */
  app.post<{ Body: LogoutInput }>(
    '/logout',
    {
      schema: {
        description: 'Logout and revoke refresh token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Logged out successfully' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: LogoutInput }>, reply: FastifyReply) => {
      const input = validate(logoutSchema, request.body);
      await authService.logout(input.refreshToken);
      return reply.send({ success: true, message: 'Logged out successfully' });
    }
  );

  /**
   * Change password (requires authentication)
   */
  app.post<{ Body: ChangePasswordInput }>(
    '/change-password',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Change user password',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Password changed successfully' },
            },
          },
          401: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ChangePasswordInput }>, reply: FastifyReply) => {
      const input = validate(changePasswordSchema, request.body);
      await authService.changePassword(
        request.user!.userId,
        input.currentPassword,
        input.newPassword
      );
      return reply.send({ success: true, message: 'Password changed successfully' });
    }
  );

  /**
   * Get current user info (requires authentication)
   */
  app.get(
    '/me',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Get current authenticated user information',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string' },
                  tenantId: { type: 'string' },
                  isActive: { type: 'boolean' },
                  lastLoginAt: { type: 'string', nullable: true },
                },
              },
            },
          },
          401: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user!.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      return reply.send({ success: true, data: user });
    }
  );

  /**
   * Forgot password - send reset email
   */
  app.post<{ Body: ForgotPasswordInput }>(
    '/forgot-password',
    {
      schema: {
        description: 'Request password reset email',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ForgotPasswordInput }>, reply: FastifyReply) => {
      const input = validate(forgotPasswordSchema, request.body);
      const result = await securityService.forgotPassword(input.email);
      return reply.send({ success: true, message: result.message });
    }
  );

  /**
   * Verify reset token
   */
  app.get<{ Querystring: VerifyResetTokenInput }>(
    '/verify-reset-token',
    {
      schema: {
        description: 'Verify password reset token validity',
        tags: ['auth'],
        querystring: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  valid: { type: 'boolean' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: VerifyResetTokenInput }>, reply: FastifyReply) => {
      const input = validate(verifyResetTokenSchema, request.query);
      const result = await securityService.verifyResetToken(input.token);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Reset password using token
   */
  app.post<{ Body: ResetPasswordInput }>(
    '/reset-password',
    {
      schema: {
        description: 'Reset password using reset token',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ResetPasswordInput }>, reply: FastifyReply) => {
      const input = validate(resetPasswordSchema, request.body);
      await securityService.resetPassword(input.token, input.newPassword);
      return reply.send({ success: true, message: 'Password reset successfully' });
    }
  );

  /**
   * Setup 2FA - generate QR code
   */
  app.post<{ Body: Setup2FAInput }>(
    '/2fa/setup',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Setup two-factor authentication',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  secret: { type: 'string' },
                  qrCodeUrl: { type: 'string' },
                  backupCodes: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Setup2FAInput }>, reply: FastifyReply) => {
      const input = validate(setup2FASchema, request.body);
      const result = await securityService.setup2FA(request.user!.userId, input.password);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Verify 2FA token and enable
   */
  app.post<{ Body: Verify2FAInput }>(
    '/2fa/verify',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Verify 2FA token and enable two-factor authentication',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', minLength: 6, maxLength: 6 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Verify2FAInput }>, reply: FastifyReply) => {
      const input = validate(verify2FASchema, request.body);
      await securityService.verify2FA(request.user!.userId, input.token);
      return reply.send({ success: true, message: '2FA enabled successfully' });
    }
  );

  /**
   * Disable 2FA
   */
  app.post<{ Body: Disable2FAInput }>(
    '/2fa/disable',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Disable two-factor authentication',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Disable2FAInput }>, reply: FastifyReply) => {
      const input = validate(disable2FASchema, request.body);
      await securityService.disable2FA(request.user!.userId, input.password);
      return reply.send({ success: true, message: '2FA disabled successfully' });
    }
  );

  /**
   * Check 2FA status
   */
  app.get(
    '/2fa/status',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Check if 2FA is enabled for current user',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await securityService.check2FAStatus(request.user!.userId);
      return reply.send({ success: true, data: result });
    }
  );
}
