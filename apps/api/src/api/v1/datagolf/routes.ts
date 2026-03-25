/**
 * DataGolf Integration API Routes
 *
 * Includes pro player search for comparison feature
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DataGolfService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import {
  convertPeiToStrokesGained,
  convertBatchPeiToStrokesGained,
  convertIupApproachTestToSG,
  convertIupChippingToSG,
  convertIupBunkerToSG,
  convertIupPuttingToSG,
  calculateTourPercentile,
  getTourBenchmark,
  LieType,
} from './pei-to-sg';

// ============================================================================
// SCHEMAS
// ============================================================================

const playerIdParamSchema = z.object({
  playerId: z.string().uuid(),
});

const compareToTourQuerySchema = z.object({
  playerId: z.string().uuid(),
  tour: z.string().default('PGA'),
  season: z.coerce.number().int().optional(),
});

const tourAveragesQuerySchema = z.object({
  tour: z.string().default('PGA'),
  season: z.coerce.number().int().optional(),
});

const approachSkillQuerySchema = z.object({
  tour: z.string().optional(),
  season: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['skill50to75', 'skill75to100', 'skill100to125', 'skill125to150', 'skill150to175', 'skill175to200', 'skill200plus', 'playerName']).default('skill100to125'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const approachSkillPlayerQuerySchema = z.object({
  tour: z.string().optional(),
  season: z.coerce.number().int().optional(),
});

const approachSkillTopQuerySchema = z.object({
  distance: z.enum(['50-75', '75-100', '100-125', '125-150', '150-175', '175-200', '200+']),
  tour: z.string().optional(),
  season: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

type PlayerIdParam = z.infer<typeof playerIdParamSchema>;
type CompareToTourQuery = z.infer<typeof compareToTourQuerySchema>;
type TourAveragesQuery = z.infer<typeof tourAveragesQuerySchema>;
type ApproachSkillQuery = z.infer<typeof approachSkillQuerySchema>;
type ApproachSkillPlayerQuery = z.infer<typeof approachSkillPlayerQuerySchema>;
type ApproachSkillTopQuery = z.infer<typeof approachSkillTopQuerySchema>;

const coachDashboardQuerySchema = z.object({
  tour: z.string().default('pga'),
  season: z.coerce.number().int().optional(),
});

const proPlayersQuerySchema = z.object({
  tour: z.string().default('pga'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const playerSgSummaryQuerySchema = z.object({
  playerId: z.string().uuid().optional(),
});

type CoachDashboardQuery = z.infer<typeof coachDashboardQuerySchema>;
type ProPlayersQuery = z.infer<typeof proPlayersQuerySchema>;
type PlayerSgSummaryQuery = z.infer<typeof playerSgSummaryQuerySchema>;

// PEI to SG schemas
const peiToSgSchema = z.object({
  startDistance: z.number().positive().describe('Start distance in meters'),
  pei: z.number().min(0).max(100).describe('PEI value (0-100, lower is better)'),
  lie: z.enum(['tee', 'fairway', 'rough', 'bunker', 'recovery', 'green']).optional().default('fairway'),
});

const batchPeiToSgSchema = z.object({
  shots: z.array(z.object({
    startDistance: z.number().positive(),
    pei: z.number().min(0).max(100),
    lie: z.enum(['tee', 'fairway', 'rough', 'bunker', 'recovery', 'green']).optional(),
  })).min(1).max(100),
});

const iupTestToSgSchema = z.object({
  testNumber: z.number().int().min(8).max(18),
  peiValues: z.array(z.number()).optional(),
  madeCount: z.number().int().min(0).optional(),
  totalAttempts: z.number().int().min(1).optional(),
  startDistance: z.number().positive().optional(),
  lie: z.enum(['fairway', 'bunker']).optional(),
});

type PeiToSgBody = z.infer<typeof peiToSgSchema>;
type BatchPeiToSgBody = z.infer<typeof batchPeiToSgSchema>;
type IupTestToSgBody = z.infer<typeof iupTestToSgSchema>;

// ============================================================================
// ROUTES
// ============================================================================

export async function dataGolfRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new DataGolfService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /api/v1/datagolf/players/:playerId
   * Get DataGolf data for a player
   */
  app.get<{ Params: PlayerIdParam }>(
    '/players/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get DataGolf player data',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);
      const playerData = await service.getDataGolfPlayer(
        request.tenant!.id,
        params.playerId
      );
      return reply.send({ success: true, data: playerData });
    }
  );

  /**
   * GET /api/v1/datagolf/tour-averages
   * Get tour averages for a specific tour and season
   */
  app.get<{ Querystring: TourAveragesQuery }>(
    '/tour-averages',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get tour averages for a specific tour and season',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: TourAveragesQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(tourAveragesQuerySchema, request.query);
      const season = query.season || new Date().getFullYear();
      const tourAverages = await service.getTourAverages(query.tour, season);
      return reply.send({ success: true, data: tourAverages });
    }
  );

  /**
   * GET /api/v1/datagolf/compare
   * Compare IUP player performance to tour averages
   */
  app.get<{ Querystring: CompareToTourQuery }>(
    '/compare',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Compare IUP player performance to DataGolf tour averages',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: CompareToTourQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(compareToTourQuerySchema, request.query);
      const season = query.season || new Date().getFullYear();
      const comparison = await service.compareToTour(
        request.tenant!.id,
        query.playerId,
        query.tour,
        season
      );
      return reply.send({ success: true, data: comparison });
    }
  );

  /**
   * POST /api/v1/datagolf/sync
   * Trigger DataGolf data sync
   */
  app.post(
    '/sync',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Trigger DataGolf data synchronization',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const syncStatus = await service.syncDataGolf(request.tenant!.id);
      return reply.send({ success: true, data: syncStatus });
    }
  );

  /**
   * GET /api/v1/datagolf/sync-status
   * Get DataGolf sync status
   */
  app.get(
    '/sync-status',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get DataGolf synchronization status',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const syncStatus = await service.getSyncStatus();
      return reply.send({ success: true, data: syncStatus });
    }
  );

  // ============================================================================
  // APPROACH SKILL ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/datagolf/approach-skill
   * Get approach skill data with optional filters
   */
  app.get<{ Querystring: ApproachSkillQuery }>(
    '/approach-skill',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get approach skill data for pro players by distance buckets',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            tour: { type: 'string', description: 'Filter by tour (pga, euro, kft)' },
            season: { type: 'number', description: 'Filter by season year' },
            limit: { type: 'number', default: 50, description: 'Number of results (max 100)' },
            offset: { type: 'number', default: 0, description: 'Offset for pagination' },
            sortBy: { type: 'string', default: 'skill100to125', description: 'Sort by distance bucket' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array' },
              total: { type: 'number' },
              pagination: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ApproachSkillQuery }>, reply: FastifyReply) => {
      const query = validate(approachSkillQuerySchema, request.query);
      const result = await service.getApproachSkillData(query);
      return reply.send({ success: true, ...result });
    }
  );

  /**
   * GET /api/v1/datagolf/approach-skill/averages
   * Get tour averages for approach skill by distance
   */
  app.get<{ Querystring: ApproachSkillPlayerQuery }>(
    '/approach-skill/averages',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get tour averages for approach skill by distance bucket',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            tour: { type: 'string', description: 'Filter by tour (pga, euro, kft)' },
            season: { type: 'number', description: 'Filter by season year' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ApproachSkillPlayerQuery }>, reply: FastifyReply) => {
      const query = validate(approachSkillPlayerQuerySchema, request.query);
      const averages = await service.getApproachSkillAverages(query.tour, query.season);
      return reply.send({ success: true, data: averages });
    }
  );

  /**
   * GET /api/v1/datagolf/approach-skill/top
   * Get top players for a specific distance bucket
   */
  app.get<{ Querystring: ApproachSkillTopQuery }>(
    '/approach-skill/top',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get top players for a specific approach distance',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['distance'],
          properties: {
            distance: { type: 'string', enum: ['50-75', '75-100', '100-125', '125-150', '150-175', '175-200', '200+'], description: 'Distance bucket in yards' },
            tour: { type: 'string', description: 'Filter by tour (pga, euro, kft)' },
            season: { type: 'number', description: 'Filter by season year' },
            limit: { type: 'number', default: 20, description: 'Number of results (max 100)' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ApproachSkillTopQuery }>, reply: FastifyReply) => {
      const query = validate(approachSkillTopQuerySchema, request.query);
      const topPlayers = await service.getTopApproachSkillByDistance(query.distance, {
        tour: query.tour,
        season: query.season,
        limit: query.limit,
      });
      return reply.send({ success: true, data: topPlayers });
    }
  );

  /**
   * GET /api/v1/datagolf/approach-skill/player/:playerName
   * Get approach skill for a specific player by name
   */
  app.get<{ Params: { playerName: string }; Querystring: ApproachSkillPlayerQuery }>(
    '/approach-skill/player/:playerName',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get approach skill data for a specific player by name',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['playerName'],
          properties: {
            playerName: { type: 'string', description: 'Player name (partial match supported)' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            tour: { type: 'string', description: 'Filter by tour (pga, euro, kft)' },
            season: { type: 'number', description: 'Filter by season year' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { playerName: string }; Querystring: ApproachSkillPlayerQuery }>, reply: FastifyReply) => {
      const { playerName } = request.params;
      const query = validate(approachSkillPlayerQuerySchema, request.query);
      const player = await service.getApproachSkillByPlayer(playerName, query.tour, query.season);
      return reply.send({ success: true, data: player });
    }
  );

  // ============================================================================
  // COACH DASHBOARD ENDPOINTS
  // ============================================================================

  /**
   * GET /api/v1/datagolf/coach/dashboard
   * Get all coach players with their DataGolf stats for the dashboard
   */
  app.get<{ Querystring: CoachDashboardQuery }>(
    '/coach/dashboard',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get coach players with DataGolf stats for dashboard',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            tour: { type: 'string', default: 'pga', description: 'Tour to compare against' },
            season: { type: 'number', description: 'Season year' },
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
    async (request: FastifyRequest<{ Querystring: CoachDashboardQuery }>, reply: FastifyReply) => {
      const query = validate(coachDashboardQuerySchema, request.query);
      const season = query.season || new Date().getFullYear();

      // Get coach ID - prefer coachId from token (added for Data Golf stats fix)
      let coachId = (request.user as { coachId?: string })?.coachId;

      // If coachId not in token, try to look it up
      if (!coachId && request.user?.role === 'coach') {
        const coach = await prisma.coach.findFirst({
          where: { userId: request.user.id },
          select: { id: true },
        });
        if (coach) {
          coachId = coach.id;
        }
      }

      if (!coachId) {
        return reply.status(403).send({ success: false, error: 'Coach access required' });
      }

      const dashboard = await service.getCoachPlayersDashboard(
        request.tenant!.id,
        coachId,
        query.tour,
        season
      );
      return reply.send({ success: true, data: dashboard });
    }
  );

  /**
   * GET /api/v1/datagolf/pro-players
   * Get top pro players for comparison
   */
  app.get<{ Querystring: ProPlayersQuery }>(
    '/pro-players',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get top pro players from DataGolf for comparison',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            tour: { type: 'string', default: 'pga', description: 'Tour (pga, euro, kft)' },
            limit: { type: 'number', default: 50, description: 'Number of players (max 100)' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ProPlayersQuery }>, reply: FastifyReply) => {
      const query = validate(proPlayersQuerySchema, request.query);
      const proPlayers = await service.getProPlayers({
        tour: query.tour,
        limit: query.limit,
      });
      return reply.send({ success: true, data: proPlayers });
    }
  );

  /**
   * GET /api/v1/datagolf/pro-players/search
   * Search pro players by name (for typeahead comparison feature)
   */
  app.get<{ Querystring: { q: string; tour?: string; limit?: number } }>(
    '/pro-players/search',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Search pro players by name for comparison feature',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string', minLength: 2, description: 'Search query (min 2 characters)' },
            tour: { type: 'string', description: 'Filter by tour (pga, euro, kft)' },
            limit: { type: 'number', default: 20, description: 'Max results (default 20)' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { q: string; tour?: string; limit?: number } }>, reply: FastifyReply) => {
      const { q, tour, limit } = request.query;
      const players = await service.searchProPlayers({
        query: q,
        tour,
        limit: limit || 20,
      });
      return reply.send({ success: true, data: players });
    }
  );

  /**
   * GET /api/v1/datagolf/pro-players/:dataGolfId
   * Get a specific pro player by DataGolf ID
   */
  app.get<{ Params: { dataGolfId: string } }>(
    '/pro-players/:dataGolfId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get a specific pro player by DataGolf ID',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['dataGolfId'],
          properties: {
            dataGolfId: { type: 'string', description: 'DataGolf player ID' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { dataGolfId: string } }>, reply: FastifyReply) => {
      const { dataGolfId } = request.params;
      const player = await service.getProPlayerById(dataGolfId);
      return reply.send({ success: true, data: player });
    }
  );

  // ============================================================================
  // PLAYER SG SUMMARY ENDPOINT
  // ============================================================================

  /**
   * GET /api/v1/datagolf/player-sg-summary
   * Get aggregated Strokes Gained summary for player dashboard
   */
  app.get<{ Querystring: PlayerSgSummaryQuery }>(
    '/player-sg-summary',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get aggregated Strokes Gained summary for player dashboard',
        tags: ['datagolf'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid', description: 'Player ID (defaults to current user)' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  hasData: { type: 'boolean' },
                  total: { type: 'number' },
                  trend: { type: 'number' },
                  percentile: { type: 'number' },
                  byCategory: { type: 'object' },
                  recentTests: { type: 'array' },
                  weeklyTrend: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: PlayerSgSummaryQuery }>, reply: FastifyReply) => {
      const query = validate(playerSgSummaryQuerySchema, request.query);

      // Get playerId from query or from current user
      let playerId = query.playerId;
      if (!playerId && request.user) {
        // If user is a player, get their player ID
        const player = await prisma.player.findFirst({
          where: { userId: request.user.id, tenantId: request.tenant!.id },
          select: { id: true },
        });
        if (player) {
          playerId = player.id;
        }
      }

      if (!playerId) {
        return reply.send({
          success: true,
          data: { hasData: false },
        });
      }

      // Get recent test results with PEI values
      const recentTests = await prisma.testResult.findMany({
        where: {
          playerId,
          test: {
            testNumber: { in: [8, 9, 10, 11, 15, 16, 17, 18] },
          },
        },
        orderBy: { testDate: 'desc' },
        take: 50,
        include: {
          test: {
            select: { testNumber: true, name: true },
          },
        },
      });

      if (recentTests.length === 0) {
        return reply.send({
          success: true,
          data: { hasData: false },
        });
      }

      // Calculate SG for each test result
      const testNames: Record<number, string> = {
        8: 'Approach 25m',
        9: 'Approach 50m',
        10: 'Approach 75m',
        11: 'Approach 100m',
        15: 'Putting 3m',
        16: 'Putting 6m',
        17: 'Chipping',
        18: 'Bunker',
      };

      const categoryMap: Record<number, 'approach' | 'around_green' | 'putting'> = {
        8: 'approach',
        9: 'approach',
        10: 'approach',
        11: 'approach',
        15: 'putting',
        16: 'putting',
        17: 'around_green',
        18: 'around_green',
      };

      const distanceMap: Record<number, number> = {
        8: 25,
        9: 50,
        10: 75,
        11: 100,
        15: 3,
        16: 6,
        17: 15,
        18: 15,
      };

      type CategoryKey = 'approach' | 'around_green' | 'putting';
      const sgByCategory: Record<CategoryKey, { values: number[]; testCount: number }> = {
        approach: { values: [], testCount: 0 },
        around_green: { values: [], testCount: 0 },
        putting: { values: [], testCount: 0 },
      };

      const processedTests: Array<{
        date: string;
        category: string;
        sg: number;
        testName: string;
      }> = [];

      // Process each test result
      for (const testResult of recentTests) {
        const testNumber = testResult.test.testNumber;
        const category = categoryMap[testNumber];
        if (!category) continue;

        let sg = 0;
        const resultsData = testResult.results as { shots?: Array<{ pei?: number }> } | null;
        const shots = resultsData?.shots ?? null;
        const value = testResult.value !== null ? Number(testResult.value) : null;

        // For approach tests (8-11), use PEI values
        if (testNumber >= 8 && testNumber <= 11) {
          // Get average PEI from shots array if available
          if (shots && shots.length > 0) {
            const peiValues = shots.map(s => s.pei).filter((p): p is number => p !== undefined);
            if (peiValues.length > 0) {
              const avgPei = peiValues.reduce((a, b) => a + b, 0) / peiValues.length;
              const result = convertPeiToStrokesGained({
                startDistance: distanceMap[testNumber],
                pei: avgPei,
                lie: 'fairway',
              });
              sg = result.strokesGained;
            }
          } else if (value !== null) {
            // Fallback: estimate SG from value
            const result = convertPeiToStrokesGained({
              startDistance: distanceMap[testNumber],
              pei: value,
              lie: 'fairway',
            });
            sg = result.strokesGained;
          }
        } else if (testNumber === 15 || testNumber === 16) {
          // Putting tests - use make percentage (3ft for test 15, 6ft for test 16)
          const makeRate = value !== null ? value / 100 : 0.5;
          // Expected make rates (approximate tour averages)
          const expectedMakeRate = testNumber === 15 ? 0.75 : 0.55;
          sg = (makeRate - expectedMakeRate) * 1.0; // Simplified SG calculation for putting
        } else if (testNumber === 17 || testNumber === 18) {
          // Chipping/Bunker tests
          if (shots && shots.length > 0) {
            const peiValues = shots.map(s => s.pei).filter((p): p is number => p !== undefined);
            if (peiValues.length > 0) {
              const avgPei = peiValues.reduce((a, b) => a + b, 0) / peiValues.length;
              const result = convertPeiToStrokesGained({
                startDistance: distanceMap[testNumber],
                pei: avgPei,
                lie: testNumber === 18 ? 'bunker' : 'fairway',
              });
              sg = result.strokesGained;
            }
          } else if (value !== null) {
            const result = convertPeiToStrokesGained({
              startDistance: distanceMap[testNumber],
              pei: value,
              lie: testNumber === 18 ? 'bunker' : 'fairway',
            });
            sg = result.strokesGained;
          }
        }

        sgByCategory[category].values.push(sg);
        sgByCategory[category].testCount++;

        processedTests.push({
          date: testResult.testDate.toISOString().split('T')[0],
          category,
          sg: Math.round(sg * 100) / 100,
          testName: testNames[testNumber] || testResult.test?.name || `Test ${testNumber}`,
        });
      }

      // Calculate category averages
      const byCategory: Record<CategoryKey, { value: number; tourAvg: number; pgaElite: number; testCount: number }> = {
        approach: {
          value: sgByCategory.approach.values.length > 0
            ? sgByCategory.approach.values.reduce((a, b) => a + b, 0) / sgByCategory.approach.values.length
            : 0,
          tourAvg: 0,
          pgaElite: getTourBenchmark('approach', 'pga_elite'),
          testCount: sgByCategory.approach.testCount,
        },
        around_green: {
          value: sgByCategory.around_green.values.length > 0
            ? sgByCategory.around_green.values.reduce((a, b) => a + b, 0) / sgByCategory.around_green.values.length
            : 0,
          tourAvg: 0,
          pgaElite: getTourBenchmark('around_green', 'pga_elite'),
          testCount: sgByCategory.around_green.testCount,
        },
        putting: {
          value: sgByCategory.putting.values.length > 0
            ? sgByCategory.putting.values.reduce((a, b) => a + b, 0) / sgByCategory.putting.values.length
            : 0,
          tourAvg: 0,
          pgaElite: getTourBenchmark('putting', 'pga_elite'),
          testCount: sgByCategory.putting.testCount,
        },
      };

      // Calculate total SG
      const allSg = [
        ...sgByCategory.approach.values,
        ...sgByCategory.around_green.values,
        ...sgByCategory.putting.values,
      ];
      const totalSg = allSg.length > 0 ? allSg.reduce((a, b) => a + b, 0) / allSg.length : 0;

      // Calculate trend (compare last 7 days to previous 7 days)
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const lastWeekTests = processedTests.filter(t => new Date(t.date) >= oneWeekAgo);
      const prevWeekTests = processedTests.filter(t => new Date(t.date) >= twoWeeksAgo && new Date(t.date) < oneWeekAgo);

      const lastWeekAvg = lastWeekTests.length > 0
        ? lastWeekTests.reduce((a, t) => a + t.sg, 0) / lastWeekTests.length
        : totalSg;
      const prevWeekAvg = prevWeekTests.length > 0
        ? prevWeekTests.reduce((a, t) => a + t.sg, 0) / prevWeekTests.length
        : totalSg;

      const trend = lastWeekAvg - prevWeekAvg;

      // Calculate percentile
      const percentile = calculateTourPercentile(totalSg, 'approach');

      // Weekly trend data
      const weeklyTrend: Array<{ week: number; total: number }> = [];
      const weekMap = new Map<number, number[]>();

      for (const test of processedTests) {
        const date = new Date(test.date);
        const week = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (week <= 5) {
          const weekNum = 52 - week;
          if (!weekMap.has(weekNum)) {
            weekMap.set(weekNum, []);
          }
          weekMap.get(weekNum)!.push(test.sg);
        }
      }

      for (const [week, values] of weekMap) {
        weeklyTrend.push({
          week,
          total: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
        });
      }
      weeklyTrend.sort((a, b) => a.week - b.week);

      return reply.send({
        success: true,
        data: {
          hasData: true,
          total: Math.round(totalSg * 100) / 100,
          trend: Math.round(trend * 100) / 100,
          percentile: Math.round(percentile),
          byCategory,
          recentTests: processedTests.slice(0, 10),
          weeklyTrend,
        },
      });
    }
  );

  // ============================================================================
  // PEI TO STROKES GAINED ENDPOINTS
  // ============================================================================

  /**
   * POST /api/v1/datagolf/pei-to-sg
   * Convert a single PEI measurement to Strokes Gained
   */
  app.post<{ Body: PeiToSgBody }>(
    '/pei-to-sg',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Convert PEI (Performance Efficiency Index) to Strokes Gained',
        tags: ['datagolf', 'pei-to-sg'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['startDistance', 'pei'],
          properties: {
            startDistance: { type: 'number', description: 'Start distance in meters' },
            pei: { type: 'number', description: 'PEI value (0-100, lower is better)' },
            lie: { type: 'string', enum: ['tee', 'fairway', 'rough', 'bunker', 'recovery', 'green'], default: 'fairway' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  strokesGained: { type: 'number' },
                  expectedBefore: { type: 'number' },
                  expectedAfter: { type: 'number' },
                  leaveDistance: { type: 'number' },
                  lie: { type: 'string' },
                  category: { type: 'string' },
                  tourPercentile: { type: 'number' },
                  tourComparison: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PeiToSgBody }>, reply: FastifyReply) => {
      const body = validate(peiToSgSchema, request.body);

      const result = convertPeiToStrokesGained({
        startDistance: body.startDistance,
        pei: body.pei,
        lie: body.lie as LieType,
      });

      const tourPercentile = calculateTourPercentile(result.strokesGained, result.category);

      return reply.send({
        success: true,
        data: {
          ...result,
          tourPercentile,
          tourComparison: {
            pgaElite: getTourBenchmark(result.category, 'pga_elite'),
            pgaAverage: getTourBenchmark(result.category, 'pga_average'),
            amateur: getTourBenchmark(result.category, 'amateur_mid'),
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/datagolf/pei-to-sg/batch
   * Convert multiple PEI measurements to Strokes Gained
   */
  app.post<{ Body: BatchPeiToSgBody }>(
    '/pei-to-sg/batch',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Convert multiple PEI measurements to Strokes Gained (batch)',
        tags: ['datagolf', 'pei-to-sg'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['shots'],
          properties: {
            shots: {
              type: 'array',
              items: {
                type: 'object',
                required: ['startDistance', 'pei'],
                properties: {
                  startDistance: { type: 'number' },
                  pei: { type: 'number' },
                  lie: { type: 'string', enum: ['tee', 'fairway', 'rough', 'bunker', 'recovery', 'green'] },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  shots: { type: 'array' },
                  totalStrokesGained: { type: 'number' },
                  averageStrokesGained: { type: 'number' },
                  category: { type: 'string' },
                  tourPercentile: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: BatchPeiToSgBody }>, reply: FastifyReply) => {
      const body = validate(batchPeiToSgSchema, request.body);

      const result = convertBatchPeiToStrokesGained(
        body.shots.map(s => ({
          startDistance: s.startDistance,
          pei: s.pei,
          lie: (s.lie || 'fairway') as LieType,
        }))
      );

      // Enrich with tour percentile
      const categoryForPercentile = result.category === 'mixed' ? 'approach' : result.category as 'approach' | 'around_green' | 'putting';
      const tourPercentile = calculateTourPercentile(result.averageStrokesGained, categoryForPercentile);

      // Add tour percentile to each shot
      const enrichedShots = result.shots.map(shot => ({
        ...shot,
        tourPercentile: calculateTourPercentile(shot.strokesGained, shot.category),
        tourComparison: {
          pgaElite: getTourBenchmark(shot.category, 'pga_elite'),
          pgaAverage: getTourBenchmark(shot.category, 'pga_average'),
          amateur: getTourBenchmark(shot.category, 'amateur_mid'),
        },
      }));

      return reply.send({
        success: true,
        data: {
          shots: enrichedShots,
          totalStrokesGained: result.totalStrokesGained,
          averageStrokesGained: result.averageStrokesGained,
          category: result.category,
          tourPercentile,
        },
      });
    }
  );

  /**
   * POST /api/v1/datagolf/pei-to-sg/iup-test
   * Convert IUP test results (8-11, 15-18) to Strokes Gained
   */
  app.post<{ Body: IupTestToSgBody }>(
    '/pei-to-sg/iup-test',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Convert IUP test results to Strokes Gained. Tests 8-11 are approach (25m, 50m, 75m, 100m), 15-16 are putting (3m, 6m), 17 is chipping, 18 is bunker.',
        tags: ['datagolf', 'pei-to-sg'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['testNumber'],
          properties: {
            testNumber: { type: 'number', description: 'IUP test number (8-11: approach, 15-16: putting, 17: chipping, 18: bunker)' },
            peiValues: { type: 'array', items: { type: 'number' }, description: 'Array of PEI values for approach/chipping/bunker tests' },
            madeCount: { type: 'number', description: 'Number of putts made (for putting tests)' },
            totalAttempts: { type: 'number', description: 'Total putting attempts (for putting tests)' },
            startDistance: { type: 'number', description: 'Override start distance for chipping test' },
            lie: { type: 'string', enum: ['fairway', 'bunker'], description: 'Lie for chipping test' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  testNumber: { type: 'number' },
                  testName: { type: 'string' },
                  strokesGained: { type: 'number' },
                  averageStrokesGained: { type: 'number' },
                  category: { type: 'string' },
                  shotCount: { type: 'number' },
                  tourPercentile: { type: 'number' },
                  comparison: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: IupTestToSgBody }>, reply: FastifyReply) => {
      const body = validate(iupTestToSgSchema, request.body);

      const testNames: Record<number, string> = {
        8: 'Approach 25m',
        9: 'Approach 50m',
        10: 'Approach 75m',
        11: 'Approach 100m',
        15: 'Putting 3m',
        16: 'Putting 6m',
        17: 'Chipping',
        18: 'Bunker',
      };

      let result: {
        strokesGained: number;
        averageStrokesGained: number;
        category: 'approach' | 'around_green' | 'putting';
        shotCount: number;
      };

      // Handle different test types
      if (body.testNumber >= 8 && body.testNumber <= 11) {
        // Approach tests
        if (!body.peiValues || body.peiValues.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'peiValues required for approach tests (8-11)',
          });
        }
        const batchResult = convertIupApproachTestToSG(
          body.testNumber as 8 | 9 | 10 | 11,
          body.peiValues
        );
        result = {
          strokesGained: batchResult.totalStrokesGained,
          averageStrokesGained: batchResult.averageStrokesGained,
          category: 'approach',
          shotCount: body.peiValues.length,
        };
      } else if (body.testNumber === 15 || body.testNumber === 16) {
        // Putting tests
        if (body.madeCount === undefined || body.totalAttempts === undefined) {
          return reply.status(400).send({
            success: false,
            error: 'madeCount and totalAttempts required for putting tests (15-16)',
          });
        }
        const puttResult = convertIupPuttingToSG(
          body.testNumber as 15 | 16,
          body.madeCount,
          body.totalAttempts
        );
        result = {
          strokesGained: puttResult.strokesGained,
          averageStrokesGained: puttResult.strokesGained / body.totalAttempts,
          category: 'putting',
          shotCount: body.totalAttempts,
        };
      } else if (body.testNumber === 17) {
        // Chipping test
        if (!body.peiValues || body.peiValues.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'peiValues required for chipping test (17)',
          });
        }
        const batchResult = convertIupChippingToSG(
          body.peiValues,
          body.startDistance || 15,
          body.lie || 'fairway'
        );
        result = {
          strokesGained: batchResult.totalStrokesGained,
          averageStrokesGained: batchResult.averageStrokesGained,
          category: 'around_green',
          shotCount: body.peiValues.length,
        };
      } else if (body.testNumber === 18) {
        // Bunker test
        if (!body.peiValues || body.peiValues.length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'peiValues required for bunker test (18)',
          });
        }
        const batchResult = convertIupBunkerToSG(
          body.peiValues,
          body.startDistance || 15
        );
        result = {
          strokesGained: batchResult.totalStrokesGained,
          averageStrokesGained: batchResult.averageStrokesGained,
          category: 'around_green',
          shotCount: body.peiValues.length,
        };
      } else {
        return reply.status(400).send({
          success: false,
          error: 'Invalid test number. Supported: 8-11 (approach), 15-16 (putting), 17 (chipping), 18 (bunker)',
        });
      }

      const tourPercentile = calculateTourPercentile(result.averageStrokesGained, result.category);

      return reply.send({
        success: true,
        data: {
          testNumber: body.testNumber,
          testName: testNames[body.testNumber] || `Test ${body.testNumber}`,
          strokesGained: result.strokesGained,
          averageStrokesGained: result.averageStrokesGained,
          category: result.category,
          shotCount: result.shotCount,
          tourPercentile,
          comparison: {
            vsPgaElite: result.averageStrokesGained - getTourBenchmark(result.category, 'pga_elite'),
            vsPgaAverage: result.averageStrokesGained - getTourBenchmark(result.category, 'pga_average'),
            vsAmateur: result.averageStrokesGained - getTourBenchmark(result.category, 'amateur_mid'),
          },
        },
      });
    }
  );
}
