/**
 * Coach API Routes
 * Endpoints for coach statistics, dashboard, groups, athletes, tournaments, and booking settings
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CoachService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// ============================================================================
// SCHEMAS
// ============================================================================

const progressQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

const bookingSettingsUpdateSchema = z.object({
  defaultSessionDuration: z.number().int().min(15).max(180).optional(),
  bufferBetweenSessions: z.number().int().min(0).max(60).optional(),
  maxAdvanceBookingDays: z.number().int().min(1).max(90).optional(),
  minAdvanceBookingHours: z.number().int().min(0).max(168).optional(),
  allowCancellation: z.boolean().optional(),
  cancellationDeadlineHours: z.number().int().min(0).max(168).optional(),
  workingHours: z.record(z.union([
    z.object({
      start: z.string(),
      end: z.string(),
    }),
    z.null(),
  ])).optional(),
});

type ProgressQuery = z.infer<typeof progressQuerySchema>;
type BookingSettingsUpdate = z.infer<typeof bookingSettingsUpdateSchema>;

// Helper to get coachId from request
function getCoachId(request: FastifyRequest): string | null {
  const user = request.user as { coachId?: string; role?: string; id?: string } | undefined;
  if (user?.coachId) return user.coachId;
  if (user?.role === 'coach' && user?.id) return user.id;
  return null;
}

// ============================================================================
// ROUTES
// ============================================================================

export async function coachRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new CoachService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  // -------------------------------------------------------------------------
  // STATS ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * GET /api/v1/coach/stats/overview
   * Get coach stats overview with all players
   */
  app.get(
    '/stats/overview',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get coach statistics overview with player summaries',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const overview = await service.getStatsOverview(request.tenant!.id, coachId);
      return reply.send({ success: true, data: overview });
    }
  );

  /**
   * GET /api/v1/coach/stats/progress
   * Get player progress over time
   */
  app.get<{ Querystring: ProgressQuery }>(
    '/stats/progress',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player progress over time periods',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            months: { type: 'number', default: 6, description: 'Number of months to analyze' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ProgressQuery }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const query = validate(progressQuerySchema, request.query);
      const progress = await service.getProgress(request.tenant!.id, coachId, query.months);
      return reply.send({ success: true, data: progress });
    }
  );

  /**
   * GET /api/v1/coach/stats/regression
   * Get players with regression indicators
   */
  app.get(
    '/stats/regression',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get players showing regression in performance',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const regressions = await service.getRegressions(request.tenant!.id, coachId);
      return reply.send({ success: true, data: regressions });
    }
  );

  // -------------------------------------------------------------------------
  // DASHBOARD ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * GET /api/v1/coach/dashboard/alerts
   * Get dashboard alerts for coach
   */
  app.get(
    '/dashboard/alerts',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get alerts for coach dashboard',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const alerts = await service.getAlerts(request.tenant!.id, coachId);
      return reply.send({ success: true, data: alerts });
    }
  );

  /**
   * GET /api/v1/coach/dashboard/injuries
   * Get player injuries
   */
  app.get(
    '/dashboard/injuries',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player injury information',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const injuries = await service.getInjuries(request.tenant!.id, coachId);
      return reply.send({ success: true, data: injuries });
    }
  );

  /**
   * GET /api/v1/coach/dashboard/tournaments
   * Get upcoming tournaments
   */
  app.get(
    '/dashboard/tournaments',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get upcoming tournaments for coach players',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const tournaments = await service.getTournaments(request.tenant!.id, coachId);
      return reply.send({ success: true, data: tournaments });
    }
  );

  // -------------------------------------------------------------------------
  // GROUPS ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * GET /api/v1/coach/groups
   * Get coach groups
   */
  app.get(
    '/groups',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get coach player groups',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const groups = await service.getGroups(request.tenant!.id, coachId);
      return reply.send({ success: true, data: groups });
    }
  );

  // -------------------------------------------------------------------------
  // ATHLETES ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * GET /api/v1/coach/athletes
   * Get all athletes (players) for coach
   */
  app.get(
    '/athletes',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all athletes assigned to coach',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const athletes = await service.getAthletes(request.tenant!.id, coachId);
      return reply.send({ success: true, data: athletes });
    }
  );

  // -------------------------------------------------------------------------
  // TOURNAMENTS ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * GET /api/v1/coach/tournaments
   * Get all tournaments
   */
  app.get(
    '/tournaments',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all tournaments for coach players',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const tournaments = await service.getTournaments(request.tenant!.id, coachId);
      return reply.send({ success: true, data: tournaments });
    }
  );

  /**
   * GET /api/v1/coach/tournaments/players
   * Get players registered for tournaments
   */
  app.get(
    '/tournaments/players',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get players registered for tournaments',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      // For now, return athletes - would be tournament registrations
      const athletes = await service.getAthletes(request.tenant!.id, coachId);
      return reply.send({ success: true, data: athletes });
    }
  );

  /**
   * GET /api/v1/coach/tournaments/results
   * Get tournament results
   */
  app.get(
    '/tournaments/results',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get tournament results for coach players',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      // Placeholder - would need tournament results model
      return reply.send({ success: true, data: [] });
    }
  );

  // -------------------------------------------------------------------------
  // BOOKING SETTINGS ENDPOINTS
  // -------------------------------------------------------------------------

  /**
   * GET /api/v1/coach/bookings/settings
   * Get booking settings for coach
   */
  app.get(
    '/bookings/settings',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get booking settings for coach',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const settings = await service.getBookingSettings(request.tenant!.id, coachId);
      return reply.send({ success: true, data: settings });
    }
  );

  /**
   * PUT /api/v1/coach/bookings/settings
   * Update booking settings for coach
   */
  app.put<{ Body: BookingSettingsUpdate }>(
    '/bookings/settings',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update booking settings for coach',
        tags: ['coach'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            defaultSessionDuration: { type: 'number' },
            bufferBetweenSessions: { type: 'number' },
            maxAdvanceBookingDays: { type: 'number' },
            minAdvanceBookingHours: { type: 'number' },
            allowCancellation: { type: 'boolean' },
            cancellationDeadlineHours: { type: 'number' },
            workingHours: { type: 'object', additionalProperties: true },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: BookingSettingsUpdate }>, reply: FastifyReply) => {
      const coachId = getCoachId(request);
      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const input = validate(bookingSettingsUpdateSchema, request.body);
      const settings = await service.updateBookingSettings(request.tenant!.id, coachId, input);
      return reply.send({ success: true, data: settings });
    }
  );
}
