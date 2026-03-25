import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TrainingStatsService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';

interface StatsParams {
  playerId: string;
}

interface StatsQuery {
  year?: string;
  weekNumber?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}

interface TeamStatsQuery {
  year: string;
  weekNumber?: string;
}

interface CalculateStatsBody {
  year: number;
  weekNumber: number;
}

/**
 * Register training stats routes
 */
export async function trainingStatsRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const statsService = new TrainingStatsService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Get weekly training stats for a player
   */
  app.get<{ Params: StatsParams; Querystring: StatsQuery }>(
    '/players/:playerId/weekly',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get weekly training statistics for a player',
        tags: ['training-stats'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
        querystring: {
          type: 'object',
          properties: {
            year: { type: 'string' },
            weekNumber: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: StatsParams; Querystring: StatsQuery }>, reply: FastifyReply) => {
      const { playerId } = request.params;
      const { year, weekNumber, startDate, endDate } = request.query;

      const stats = await statsService.getWeeklyStats(request.tenant!.id, playerId, {
        year: year ? parseInt(year) : undefined,
        weekNumber: weekNumber ? parseInt(weekNumber) : undefined,
        startDate,
        endDate,
      });

      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Get monthly training stats for a player
   */
  app.get<{ Params: StatsParams; Querystring: StatsQuery }>(
    '/players/:playerId/monthly',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get monthly training statistics for a player',
        tags: ['training-stats'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
        querystring: {
          type: 'object',
          properties: {
            year: { type: 'string' },
            month: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: StatsParams; Querystring: StatsQuery }>, reply: FastifyReply) => {
      const { playerId } = request.params;
      const { year, month } = request.query;

      const stats = await statsService.getMonthlyStats(request.tenant!.id, playerId, {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
      });

      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Get daily training stats for a player
   */
  app.get<{ Params: StatsParams; Querystring: StatsQuery }>(
    '/players/:playerId/daily',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get daily training statistics for a player',
        tags: ['training-stats'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: StatsParams; Querystring: StatsQuery }>, reply: FastifyReply) => {
      const { playerId } = request.params;
      const { startDate, endDate } = request.query;

      const stats = await statsService.getDailyStats(request.tenant!.id, playerId, {
        startDate,
        endDate,
      });

      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Calculate/refresh weekly stats for a player
   */
  app.post<{ Params: StatsParams; Body: CalculateStatsBody }>(
    '/players/:playerId/weekly/calculate',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Calculate and update weekly training statistics',
        tags: ['training-stats'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
          required: ['playerId'],
        },
        body: {
          type: 'object',
          properties: {
            year: { type: 'number' },
            weekNumber: { type: 'number', minimum: 1, maximum: 53 },
          },
          required: ['year', 'weekNumber'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: StatsParams; Body: CalculateStatsBody }>, reply: FastifyReply) => {
      const { playerId } = request.params;
      const { year, weekNumber } = request.body;

      const stats = await statsService.calculateWeeklyStats(request.tenant!.id, playerId, year, weekNumber);

      return reply.send({ success: true, data: stats });
    }
  );

  /**
   * Get team stats for a coach
   */
  app.get<{ Querystring: TeamStatsQuery }>(
    '/team',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get aggregated team training statistics',
        tags: ['training-stats'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            year: { type: 'string' },
            weekNumber: { type: 'string' },
          },
          required: ['year'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: TeamStatsQuery }>, reply: FastifyReply) => {
      const { year, weekNumber } = request.query;
      const coachId = request.user?.coachId;

      if (!coachId) {
        return reply.code(403).send({ success: false, error: 'Coach access required' });
      }

      const stats = await statsService.getTeamStats(
        request.tenant!.id,
        coachId,
        parseInt(year),
        weekNumber ? parseInt(weekNumber) : undefined
      );

      return reply.send({ success: true, data: stats });
    }
  );
}
