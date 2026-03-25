/**
 * ================================================================
 * Dashboard API Routes - AK Golf Academy
 * ================================================================
 */

import { FastifyPluginAsync } from 'fastify';
import { DashboardService } from './service';
import { DashboardQuerySchema } from './schema';
import { z } from 'zod';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { getPrismaClient } from '../../../core/db/prisma';

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();
  const dashboardService = new DashboardService(prisma);
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /dashboard
   * Get dashboard data for the authenticated player
   */
  fastify.get<{
    Querystring: z.infer<typeof DashboardQuerySchema>;
  }>(
    '/',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get player dashboard',
        description: `
Returns complete dashboard data for the authenticated player including:
- Player profile information
- Training period details
- Today's scheduled sessions
- Active goals and achievements
- Weekly training statistics
- Breaking points requiring attention
- Recent test results
- Upcoming tournaments and tests
- Unread messages

**Authentication:** Requires valid JWT token with 'player' role
**Response Time:** Optimized for <200ms with database indexes
**Caching:** Consider implementing client-side caching for 5-10 minutes
        `,
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Date in YYYY-MM-DD format (e.g., 2025-12-25). Defaults to current date.',
            },
          },
        },
        response: {
          200: {
            description: 'Dashboard data retrieved successfully',
            type: 'object',
            required: ['player', 'period', 'todaySessions', 'badges', 'goals', 'weeklyStats', 'messages', 'unreadCount'],
            properties: {
              player: {
                type: 'object',
                description: 'Player profile information',
                additionalProperties: true,
              },
              period: {
                type: 'object',
                description: 'Current training period information',
                additionalProperties: true,
              },
              todaySessions: {
                type: 'array',
                description: 'Training sessions scheduled for today',
                items: { type: 'object', additionalProperties: true },
              },
              badges: {
                type: 'array',
                description: 'Recent achievements and badges',
                items: { type: 'object', additionalProperties: true },
              },
              goals: {
                type: 'array',
                description: 'Active training goals',
                items: { type: 'object', additionalProperties: true },
              },
              weeklyStats: {
                type: 'object',
                description: 'Training statistics for current week',
                additionalProperties: true,
              },
              messages: {
                type: 'array',
                description: 'Recent messages from coaches',
                items: { type: 'object', additionalProperties: true },
              },
              unreadCount: {
                type: 'number',
                description: 'Number of unread messages',
              },
              nextTournament: {
                type: 'object',
                nullable: true,
                description: 'Next scheduled tournament (null if none)',
                additionalProperties: true,
              },
              nextTest: {
                type: 'object',
                nullable: true,
                description: 'Next scheduled test (null if none)',
                additionalProperties: true,
              },
              breakingPoints: {
                type: 'array',
                description: 'Top 3 breaking points requiring attention',
                items: { type: 'object', additionalProperties: true },
              },
              recentTests: {
                type: 'array',
                description: 'Last 3 test results',
                items: { type: 'object', additionalProperties: true },
              },
            },
          },
          400: {
            description: 'Bad request - Invalid date format',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid JWT token',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          403: {
            description: 'Forbidden - Insufficient permissions',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            description: 'Not found - Player not found',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      preHandler: preHandlers,
    },
    async (request, reply) => {
      const { tenantId, role } = request.user!;

      // Get player ID from user context
      // For players, userId corresponds to their player record
      // For coaches viewing a player's dashboard, playerId would be in query
      let playerId: string;

      if (role === 'player') {
        // Find player by user email
        const player = await prisma.player.findFirst({
          where: {
            tenantId,
            email: request.user!.email,
          },
        });

        if (!player) {
          return reply.status(404).send({ error: 'Player not found' });
        }
        playerId = player.id;
      } else {
        return reply.status(403).send({ error: 'Dashboard only available for players' });
      }

      const date = request.query.date ? new Date(request.query.date) : new Date();

      try {
        const dashboard = await dashboardService.getDashboard(tenantId, playerId, date);
        return dashboard;
      } catch (error: any) {
        request.log.error({ error, playerId, tenantId }, 'Dashboard fetch failed');
        return reply.status(500).send({
          error: error.message || 'Failed to fetch dashboard data',
          code: error.code || 'DASHBOARD_ERROR'
        });
      }
    }
  );

  /**
   * GET /dashboard/:playerId
   * Get dashboard data for a specific player (coach/admin access)
   */
  fastify.get<{
    Params: { playerId: string };
    Querystring: z.infer<typeof DashboardQuerySchema>;
  }>(
    '/:playerId',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get player dashboard (coach view)',
        description: `
Returns complete dashboard data for a specific player. This endpoint is designed for
coaches and administrators to monitor their athletes' progress and training data.

**Use Cases:**
- Coach reviewing athlete's dashboard before a session
- Admin monitoring player performance metrics
- Multi-player dashboard comparisons

**Authentication:** Requires valid JWT token with 'coach' or 'admin' role
**Authorization:** User must have access to the specified player within their tenant
        `,
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier of the player',
            },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Date in YYYY-MM-DD format. Defaults to current date.',
            },
          },
        },
        response: {
          200: {
            description: 'Dashboard data retrieved successfully (same structure as GET /dashboard)',
            type: 'object',
            additionalProperties: true,
          },
          401: {
            description: 'Unauthorized - Missing or invalid JWT token',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          403: {
            description: 'Forbidden - Insufficient permissions (not coach or admin)',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            description: 'Not found - Player not found in tenant',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      preHandler: preHandlers,
    },
    async (request, reply) => {
      const { tenantId, role } = request.user!;
      const { playerId } = request.params;

      // Only coaches and admins can view other players' dashboards
      if (role !== 'coach' && role !== 'admin') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }

      // Verify player exists in tenant
      const player = await prisma.player.findFirst({
        where: {
          id: playerId,
          tenantId,
        },
      });

      if (!player) {
        return reply.status(404).send({ error: 'Player not found' });
      }

      const date = request.query.date ? new Date(request.query.date) : new Date();

      try {
        const dashboard = await dashboardService.getDashboard(tenantId, playerId, date);
        return dashboard;
      } catch (error: any) {
        request.log.error({ error, playerId, tenantId }, 'Dashboard fetch failed');
        return reply.status(500).send({
          error: error.message || 'Failed to fetch dashboard data',
          code: error.code || 'DASHBOARD_ERROR'
        });
      }
    }
  );

  /**
   * GET /dashboard/weekly-stats
   * Get weekly stats for authenticated player
   */
  fastify.get<{
    Querystring: { week?: number; year?: number };
  }>(
    '/weekly-stats',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get weekly training stats',
        description: `
Retrieves aggregated training statistics for a specific week. Defaults to current week.

**Use Cases:**
- Weekly progress tracking
- Historical performance analysis
- Training volume monitoring

**Authentication:** Requires valid JWT token with 'player' role
        `,
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            week: {
              type: 'number',
              minimum: 1,
              maximum: 53,
              description: 'ISO week number (1-53). Defaults to current week.',
            },
            year: {
              type: 'number',
              minimum: 2000,
              maximum: 2100,
              description: 'Year (YYYY). Defaults to current year.',
            },
          },
        },
        response: {
          200: {
            description: 'Weekly statistics retrieved successfully',
            type: 'object',
            properties: {
              week: { type: 'number', description: 'ISO week number' },
              year: { type: 'number' },
              sessionsCompleted: { type: 'number', description: 'Number of sessions completed this week' },
              totalMinutes: { type: 'number', description: 'Total training time in minutes' },
              peiGained: { type: 'number', description: 'Total PEI (Player Engagement Index) gained' },
              streak: { type: 'number', description: 'Current consecutive training days' },
              byCategory: {
                type: 'object',
                description: 'Breakdown by training category',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    sessions: { type: 'number' },
                    minutes: { type: 'number' },
                  },
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Not a player',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            description: 'Not found - No stats for this week or player not found',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      preHandler: preHandlers,
    },
    async (request, reply) => {
      const { tenantId, role } = request.user!;

      if (role !== 'player') {
        return reply.status(403).send({ error: 'Stats only available for players' });
      }

      const player = await prisma.player.findFirst({
        where: { tenantId, email: request.user!.email },
      });

      if (!player) {
        return reply.status(404).send({ error: 'Player not found' });
      }

      const now = new Date();
      const year = request.query.year || now.getFullYear();
      const week = request.query.week || getWeekNumber(now);

      const stats = await prisma.weeklyTrainingStats.findFirst({
        where: {
          playerId: player.id,
          year,
          weekNumber: week,
        },
      });

      return stats || { message: 'No stats for this week' };
    }
  );

  /**
   * GET /dashboard/badges
   * Get all badges for authenticated player
   */
  fastify.get(
    '/badges',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get all player badges',
        description: `
Retrieves all earned achievements and badges for the authenticated player.
Returns badges sorted by earned date (most recent first).

**Use Cases:**
- Achievement gallery display
- Player profile badge showcase
- Gamification progress tracking

**Authentication:** Requires valid JWT token with 'player' role
        `,
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: 'Badges retrieved successfully',
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'code', 'name', 'tier', 'earnedAt'],
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Unique badge assignment ID',
                },
                code: {
                  type: 'string',
                  description: 'Badge code identifier (e.g., "putting_master_silver")',
                },
                name: {
                  type: 'string',
                  description: 'Display name of the badge',
                },
                description: {
                  type: 'string',
                  nullable: true,
                  description: 'Badge description and unlock criteria',
                },
                icon: {
                  type: 'string',
                  nullable: true,
                  description: 'Icon identifier or emoji',
                },
                tier: {
                  type: 'string',
                  enum: ['bronze', 'silver', 'gold', 'platinum'],
                  description: 'Badge tier/level',
                },
                category: {
                  type: 'string',
                  nullable: true,
                  description: 'Badge category (e.g., "putting", "driving", "short_game")',
                },
                earnedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Timestamp when badge was earned',
                },
                context: {
                  type: 'object',
                  nullable: true,
                  description: 'Additional context about how/when the badge was earned',
                  additionalProperties: true,
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Not a player',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            description: 'Not found - Player not found',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      preHandler: preHandlers,
    },
    async (request, reply) => {
      const { tenantId, role } = request.user!;

      if (role !== 'player') {
        return reply.status(403).send({ error: 'Badges only available for players' });
      }

      const player = await prisma.player.findFirst({
        where: { tenantId, email: request.user!.email },
      });

      if (!player) {
        return reply.status(404).send({ error: 'Player not found' });
      }

      const achievements = await prisma.playerAchievement.findMany({
        where: { playerId: player.id },
        include: { achievement: true },
        orderBy: { earnedAt: 'desc' },
      });

      return achievements.map(a => ({
        id: a.id,
        code: a.achievement.code,
        name: a.achievement.name,
        description: a.achievement.description,
        icon: a.achievement.icon,
        tier: a.achievement.tier,
        category: a.achievement.category,
        earnedAt: a.earnedAt.toISOString(),
        context: a.context,
      }));
    }
  );

  /**
   * GET /dashboard/goals
   * Get all goals for authenticated player
   */
  fastify.get<{
    Querystring: { status?: string };
  }>(
    '/goals',
    {
      schema: {
        tags: ['Dashboard'],
        summary: 'Get player goals',
        description: `
Retrieves training goals for the authenticated player. Goals can be filtered by status.
Returns goals sorted by target date (nearest first).

**Use Cases:**
- Goal tracker widget
- Progress monitoring
- Historical goal analysis
- Coaching review

**Authentication:** Requires valid JWT token with 'player' role
        `,
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'completed', 'paused', 'cancelled'],
              description: 'Filter goals by status. Omit to retrieve all goals.',
            },
          },
        },
        response: {
          200: {
            description: 'Goals retrieved successfully',
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'status', 'createdAt'],
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Unique goal ID',
                },
                title: {
                  type: 'string',
                  description: 'Goal title/description',
                },
                category: {
                  type: 'string',
                  nullable: true,
                  description: 'Goal category (e.g., "handicap", "putting", "driving")',
                },
                targetValue: {
                  type: 'number',
                  nullable: true,
                  description: 'Numeric target value (if applicable)',
                },
                currentValue: {
                  type: 'number',
                  nullable: true,
                  description: 'Current value/progress',
                },
                unit: {
                  type: 'string',
                  nullable: true,
                  description: 'Unit of measurement (e.g., "hcp", "meters", "percent")',
                },
                progress: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  nullable: true,
                  description: 'Progress percentage (0-100)',
                },
                status: {
                  type: 'string',
                  enum: ['active', 'completed', 'paused', 'cancelled'],
                  description: 'Current goal status',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  nullable: true,
                  description: 'Goal priority level',
                },
                targetDate: {
                  type: 'string',
                  format: 'date',
                  nullable: true,
                  description: 'Target completion date',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Goal creation timestamp',
                },
                completedAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                  description: 'Completion timestamp (if completed)',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Not a player',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          404: {
            description: 'Not found - Player not found',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      preHandler: preHandlers,
    },
    async (request, reply) => {
      const { tenantId, role } = request.user!;

      if (role !== 'player') {
        return reply.status(403).send({ error: 'Goals only available for players' });
      }

      const player = await prisma.player.findFirst({
        where: { tenantId, email: request.user!.email },
      });

      if (!player) {
        return reply.status(404).send({ error: 'Player not found' });
      }

      const goals = await prisma.playerGoal.findMany({
        where: {
          playerId: player.id,
          ...(request.query.status && { status: request.query.status }),
        },
        orderBy: { targetDate: 'asc' },
      });

      return goals;
    }
  );
};

// Helper function
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default dashboardRoutes;
