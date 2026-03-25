/**
 * Training Plan API Routes
 * Endpoints for 12-month training plan management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import { PlanGenerationService } from '../../../domain/training-plan/plan-generation.service';
import type { GenerateAnnualPlanInput } from '../../../domain/training-plan/plan-generation.types';
import { NotificationService } from '../../../domain/notifications/notification.service';
import { checkAchievements, ACHIEVEMENTS } from '../../../domain/achievements/achievement-definitions';
import type { PlayerStats } from '../../../domain/achievements/achievement-definitions';

// Validation schemas
const generatePlanSchema = z.object({
  playerId: z.string().uuid(),
  startDate: z.coerce.date(),
  baselineAverageScore: z.number().min(50).max(150),
  baselineHandicap: z.number().optional(),
  baselineDriverSpeed: z.number().min(40).max(150).optional(),
  planName: z.string().optional(),
  weeklyHoursTarget: z.number().min(5).max(30).optional(),
  tournaments: z
    .array(
      z.object({
        name: z.string(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        importance: z.enum(['A', 'B', 'C']),
        tournamentId: z.string().uuid().optional(),
      })
    )
    .optional(),
  preferredTrainingDays: z.array(z.number().min(0).max(6)).optional(),
  excludeDates: z.array(z.coerce.date()).optional(),
});

const playerIdParamSchema = z.object({
  playerId: z.string().uuid(),
});

const planIdParamSchema = z.object({
  planId: z.string().uuid(),
});

const dateParamSchema = z.object({
  planId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

const updateDailyAssignmentSchema = z.object({
  sessionTemplateId: z.string().uuid().optional(),
  sessionType: z.string().optional(),
  estimatedDuration: z.number().optional(),
  isRestDay: z.boolean().optional(),
  status: z.enum(['planned', 'completed', 'skipped', 'rescheduled']).optional(),
  coachNotes: z.string().optional(),
  playerNotes: z.string().optional(),
});

const addTournamentSchema = z.object({
  name: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  importance: z.enum(['A', 'B', 'C']),
  tournamentId: z.string().uuid().optional(),
});

const calendarQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  weekNumber: z.coerce.number().optional(),
});

const fullPlanQuerySchema = z.object({
  includeSessionDetails: z.coerce.boolean().optional().default(false),
  includeExercises: z.coerce.boolean().optional().default(false),
});

const modificationRequestSchema = z.object({
  concerns: z.array(z.string()).min(1),
  notes: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

const rejectPlanSchema = z.object({
  reason: z.string().min(10),
  willCreateNewIntake: z.boolean().optional().default(false),
});

type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
type PlayerIdParam = z.infer<typeof playerIdParamSchema>;
type PlanIdParam = z.infer<typeof planIdParamSchema>;
type DateParam = z.infer<typeof dateParamSchema>;
type UpdateDailyAssignment = z.infer<typeof updateDailyAssignmentSchema>;
type AddTournament = z.infer<typeof addTournamentSchema>;
type CalendarQuery = z.infer<typeof calendarQuerySchema>;
type FullPlanQuery = z.infer<typeof fullPlanQuerySchema>;
type ModificationRequest = z.infer<typeof modificationRequestSchema>;
type RejectPlan = z.infer<typeof rejectPlanSchema>;

/**
 * Register training plan routes
 */
export async function trainingPlanRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * GET /api/v1/training-plan
   * Get all training plans for the authenticated user
   */
  app.get(
    '/',
    {
      // Temporarily disabled auth for demo mode
      preHandler: [],
      schema: {
        description: 'Get all training plans for the authenticated user',
        tags: ['training-plan'],
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
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Demo mode: return empty array
      if (!request.user) {
        return reply.send({
          success: true,
          data: [],
        });
      }

      // Get all plans for the user's tenant
      const plans = await prisma.annualTrainingPlan.findMany({
        where: {
          tenantId: request.tenant!.id,
          // For players, only show their own plans
          // For coaches, show all plans in tenant
          ...(request.user.role === 'player' && { playerId: request.user.userId }),
        },
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        success: true,
        data: plans,
      });
    }
  );

  /**
   * POST /api/v1/training-plan/generate
   * Generate new 12-month training plan
   */
  app.post<{ Body: GeneratePlanInput }>(
    '/generate',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Generate a new 12-month training plan for a player',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date' },
            baselineAverageScore: { type: 'number', minimum: 50, maximum: 150 },
            baselineHandicap: { type: 'number' },
            baselineDriverSpeed: { type: 'number', minimum: 40, maximum: 150 },
            planName: { type: 'string' },
            weeklyHoursTarget: { type: 'number', minimum: 5, maximum: 30 },
            tournaments: { type: 'array' },
            preferredTrainingDays: { type: 'array', items: { type: 'number' } },
            excludeDates: { type: 'array', items: { type: 'string', format: 'date' } },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
          400: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: GeneratePlanInput }>, reply: FastifyReply) => {
      const input = validate(generatePlanSchema, request.body);

      // Check if player exists and belongs to tenant
      const player = await prisma.player.findUnique({
        where: {
          id: input.playerId,
          tenantId: request.tenant!.id,
        },
      });

      if (!player) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAYER_NOT_FOUND',
            message: 'Player not found',
          },
        });
      }

      // Check if active plan already exists
      const existingPlan = await prisma.annualTrainingPlan.findFirst({
        where: {
          playerId: input.playerId,
          status: 'active',
        },
      });

      if (existingPlan) {
        return reply.code(409).send({
          success: false,
          error: {
            code: 'ACTIVE_PLAN_EXISTS',
            message: 'An active training plan already exists for this player',
            details: { existingPlanId: existingPlan.id },
          },
        });
      }

      // Generate plan
      const generationInput: GenerateAnnualPlanInput = {
        ...input,
        tenantId: request.tenant!.id,
      };

      const result = await PlanGenerationService.generateAnnualPlan(generationInput);

      request.log.info(
        {
          planId: result.annualPlan.id,
          playerId: input.playerId,
          dailyAssignments: result.dailyAssignments.created,
          tournaments: result.tournaments.scheduled,
        },
        'Generated 12-month training plan'
      );

      return reply.code(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /api/v1/training-plan/player/:playerId
   * Get training plan for a player
   */
  app.get<{ Params: PlayerIdParam }>(
    '/player/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get training plan for a player',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
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
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);

      const plan = await prisma.annualTrainingPlan.findFirst({
        where: {
          playerId: params.playerId,
          tenantId: request.tenant!.id,
          status: 'active',
        },
        include: {
          periodizations: {
            orderBy: { weekNumber: 'asc' },
            take: 10,
          },
          scheduledTournaments: {
            orderBy: { startDate: 'asc' },
          },
          dailyAssignments: {
            where: {
              assignedDate: {
                gte: new Date(),
              },
            },
            orderBy: { assignedDate: 'asc' },
            take: 14, // Next 2 weeks
            include: {
              sessionTemplate: {
                select: {
                  id: true,
                  name: true,
                  sessionType: true,
                  duration: true,
                },
              },
            },
          },
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'No active training plan found for this player',
          },
        });
      }

      return reply.send({
        success: true,
        data: plan,
      });
    }
  );

  /**
   * GET /api/v1/training-plan/:planId/calendar
   * Get calendar view of daily assignments
   */
  app.get<{ Params: PlanIdParam; Querystring: CalendarQuery }>(
    '/:planId/calendar',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get calendar view of daily training assignments',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            endDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            weekNumber: { type: 'number' },
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
                  assignments: { type: 'array' },
                  summary: { type: 'object', additionalProperties: true },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlanIdParam; Querystring: CalendarQuery }>,
      reply: FastifyReply
    ) => {
      const params = validate(planIdParamSchema, request.params);
      const query = validate(calendarQuerySchema, request.query);

      // Verify plan belongs to tenant
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Build date range filter
      const where: any = { annualPlanId: params.planId };

      if (query.weekNumber) {
        where.weekNumber = query.weekNumber;
      } else if (query.startDate || query.endDate) {
        where.assignedDate = {};
        if (query.startDate) {
          where.assignedDate.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.assignedDate.lte = new Date(query.endDate);
        }
      } else {
        // Default: next 4 weeks
        where.assignedDate = {
          gte: new Date(),
          lte: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        };
      }

      const assignments = await prisma.dailyTrainingAssignment.findMany({
        where,
        include: {
          sessionTemplate: {
            select: {
              id: true,
              name: true,
              sessionType: true,
              duration: true,
              learningPhase: true,
            },
          },
        },
        orderBy: { assignedDate: 'asc' },
      });

      // Calculate summary
      const summary = {
        totalAssignments: assignments.length,
        planned: assignments.filter((a) => a.status === 'planned').length,
        completed: assignments.filter((a) => a.status === 'completed').length,
        skipped: assignments.filter((a) => a.status === 'skipped').length,
        restDays: assignments.filter((a) => a.isRestDay).length,
        totalMinutes: assignments.reduce((sum, a) => sum + a.estimatedDuration, 0),
        bySessionType: assignments.reduce(
          (acc, a) => {
            acc[a.sessionType] = (acc[a.sessionType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      };

      return reply.send({
        success: true,
        data: {
          assignments,
          summary,
        },
      });
    }
  );

  /**
   * PUT /api/v1/training-plan/:planId/daily/:date
   * Update a daily assignment
   */
  app.put<{ Params: DateParam; Body: UpdateDailyAssignment }>(
    '/:planId/daily/:date',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update a daily training assignment',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
            date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          },
        },
        body: {
          type: 'object',
          properties: {
            sessionTemplateId: { type: 'string', format: 'uuid' },
            sessionType: { type: 'string' },
            estimatedDuration: { type: 'number' },
            isRestDay: { type: 'boolean' },
            status: { type: 'string', enum: ['planned', 'completed', 'skipped', 'rescheduled'] },
            coachNotes: { type: 'string' },
            playerNotes: { type: 'string' },
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
    async (
      request: FastifyRequest<{ Params: DateParam; Body: UpdateDailyAssignment }>,
      reply: FastifyReply
    ) => {
      const params = validate(dateParamSchema, request.params);
      const input = validate(updateDailyAssignmentSchema, request.body);

      const assignedDate = new Date(params.date);

      // Find assignment
      const assignment = await prisma.dailyTrainingAssignment.findFirst({
        where: {
          annualPlanId: params.planId,
          assignedDate,
        },
      });

      if (!assignment) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'ASSIGNMENT_NOT_FOUND',
            message: 'Daily assignment not found',
          },
        });
      }

      // Update assignment
      const updated = await prisma.dailyTrainingAssignment.update({
        where: { id: assignment.id },
        data: {
          ...input,
          ...(input.status === 'completed' && { completedAt: new Date() }),
        },
        include: {
          sessionTemplate: true,
        },
      });

      return reply.send({
        success: true,
        data: updated,
      });
    }
  );

  /**
   * DELETE /api/v1/training-plan/:planId
   * Delete a training plan
   */
  app.delete<{ Params: PlanIdParam }>(
    '/:planId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete a training plan',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlanIdParam }>, reply: FastifyReply) => {
      const params = validate(planIdParamSchema, request.params);

      // Verify plan belongs to tenant
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Delete plan (cascade will delete related records)
      await prisma.annualTrainingPlan.delete({
        where: { id: params.planId },
      });

      return reply.send({
        success: true,
        message: 'Training plan deleted successfully',
      });
    }
  );

  /**
   * POST /api/v1/training-plan/:planId/tournaments
   * Add tournament to plan
   */
  app.post<{ Params: PlanIdParam; Body: AddTournament }>(
    '/:planId/tournaments',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Add tournament to training plan',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['name', 'startDate', 'endDate', 'importance'],
          properties: {
            name: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            importance: { type: 'string', enum: ['A', 'B', 'C'] },
            tournamentId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlanIdParam; Body: AddTournament }>,
      reply: FastifyReply
    ) => {
      const params = validate(planIdParamSchema, request.params);
      const input = validate(addTournamentSchema, request.body);

      // Verify plan belongs to tenant
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Calculate week number
      const diffTime = input.startDate.getTime() - plan.startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weekNumber = Math.ceil(diffDays / 7);

      // Calculate preparation periods
      const toppingWeeks = input.importance === 'A' ? 3 : input.importance === 'B' ? 2 : 1;
      const taperingDays = input.importance === 'A' ? 7 : input.importance === 'B' ? 5 : 3;

      const toppingStartWeek = Math.max(1, weekNumber - toppingWeeks);
      const taperingStartDate = new Date(input.startDate);
      taperingStartDate.setDate(taperingStartDate.getDate() - taperingDays);

      // Create scheduled tournament
      const tournament = await prisma.scheduledTournament.create({
        data: {
          annualPlanId: params.planId,
          tournamentId: input.tournamentId,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          importance: input.importance,
          weekNumber,
          period: 'T',
          toppingStartWeek,
          toppingDurationWeeks: toppingWeeks,
          taperingStartDate,
          taperingDurationDays: taperingDays,
        },
      });

      return reply.code(201).send({
        success: true,
        data: tournament,
      });
    }
  );

  /**
   * GET /api/v1/training-plan/:planId/full
   * Get complete training plan with all daily assignments and periodizations
   */
  app.get<{ Params: PlanIdParam; Querystring: FullPlanQuery }>(
    '/:planId/full',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get complete training plan with all 365 days and 52 weeks',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            includeSessionDetails: { type: 'boolean', default: false },
            includeExercises: { type: 'boolean', default: false },
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
                  annualPlan: { type: 'object' },
                  periodizations: { type: 'array' },
                  dailyAssignments: { type: 'array' },
                  tournaments: { type: 'array' },
                  statistics: { type: 'object' },
                },
              },
            },
          },
          403: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlanIdParam; Querystring: FullPlanQuery }>,
      reply: FastifyReply
    ) => {
      const params = validate(planIdParamSchema, request.params);
      const query = validate(fullPlanQuerySchema, request.query);

      // Verify plan exists and belongs to tenant
      const annualPlan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!annualPlan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Check if user has access (player or coach)
      if (request.user!.role === 'player') {
        const player = await prisma.player.findUnique({
          where: { id: request.user!.playerId },
        });

        if (player?.id !== annualPlan.playerId) {
          return reply.code(403).send({
            success: false,
            error: {
              code: 'ACCESS_DENIED',
              message: "You don't have permission to view this plan",
            },
          });
        }
      }

      // Get all periodizations (52 weeks)
      const periodizations = await prisma.periodization.findMany({
        where: { annualPlanId: params.planId },
        orderBy: { weekNumber: 'asc' },
      });

      // Get all daily assignments (365 days)
      const dailyAssignments = await prisma.dailyTrainingAssignment.findMany({
        where: { annualPlanId: params.planId },
        orderBy: { assignedDate: 'asc' },
        include: query.includeSessionDetails
          ? {
              sessionTemplate: true,
            }
          : undefined,
      });

      // Get all scheduled tournaments
      const tournaments = await prisma.scheduledTournament.findMany({
        where: { annualPlanId: params.planId },
        orderBy: { startDate: 'asc' },
      });

      // Calculate statistics
      const statistics = {
        totalRestDays: dailyAssignments.filter((a) => a.isRestDay).length,
        averageSessionDuration:
          dailyAssignments.reduce((sum, a) => sum + a.estimatedDuration, 0) /
          dailyAssignments.filter((a) => !a.isRestDay).length,
        periodBreakdown: periodizations.reduce(
          (acc, p) => {
            acc[p.period as string] = (acc[p.period as string] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        completionRate: {
          planned: dailyAssignments.filter((a) => a.status === 'planned').length,
          completed: dailyAssignments.filter((a) => a.status === 'completed').length,
          skipped: dailyAssignments.filter((a) => a.status === 'skipped').length,
        },
      };

      return reply.send({
        success: true,
        data: {
          annualPlan,
          periodizations,
          dailyAssignments,
          tournaments,
          statistics,
        },
      });
    }
  );

  /**
   * PUT /api/v1/training-plan/:planId/accept
   * Accept and activate a draft training plan
   */
  app.put<{ Params: PlanIdParam }>(
    '/:planId/accept',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Accept and activate a draft training plan',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
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
                  planId: { type: 'string' },
                  status: { type: 'string' },
                  activatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          403: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlanIdParam }>, reply: FastifyReply) => {
      const params = validate(planIdParamSchema, request.params);

      // Verify plan exists and belongs to tenant
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Check if user has permission (player or coach)
      if (request.user!.role === 'player') {
        const player = await prisma.player.findUnique({
          where: { id: request.user!.playerId },
        });

        if (player?.id !== plan.playerId) {
          return reply.code(403).send({
            success: false,
            error: {
              code: 'ACCESS_DENIED',
              message: "You don't have permission to accept this plan",
            },
          });
        }
      }

      // Check if plan is in draft status
      if (plan.status !== 'draft') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'INVALID_PLAN_STATUS',
            message: `Cannot accept plan in status '${plan.status}'. Only draft plans can be accepted.`,
          },
        });
      }

      // Deactivate any existing active plans for this player
      await prisma.annualTrainingPlan.updateMany({
        where: {
          playerId: plan.playerId,
          status: 'active',
          NOT: { id: params.planId },
        },
        data: {
          status: 'archived',
        },
      });

      // Activate the plan
      const activatedPlan = await prisma.annualTrainingPlan.update({
        where: { id: params.planId },
        data: {
          status: 'active',
        },
      });

      request.log.info(
        {
          planId: activatedPlan.id,
          playerId: activatedPlan.playerId,
        },
        'Training plan accepted and activated'
      );

      return reply.send({
        success: true,
        data: {
          planId: activatedPlan.id,
          status: activatedPlan.status,
          activatedAt: new Date().toISOString(),
        },
      });
    }
  );

  /**
   * POST /api/v1/training-plan/:planId/modification-request
   * Request modifications to a training plan
   */
  app.post<{ Params: PlanIdParam; Body: ModificationRequest }>(
    '/:planId/modification-request',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Request modifications to a training plan (player → coach)',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            concerns: { type: 'array', items: { type: 'string' }, minItems: 1 },
            notes: { type: 'string' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  requestId: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlanIdParam; Body: ModificationRequest }>,
      reply: FastifyReply
    ) => {
      const params = validate(planIdParamSchema, request.params);
      const input = validate(modificationRequestSchema, request.body);

      // Verify plan exists
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Create modification request
      // Note: This assumes you have a ModificationRequest model in Prisma
      // For now, we'll store it in the plan's notes field as JSON
      const requestId = `req_${Date.now()}`;
      const modificationData = {
        requestId,
        concerns: input.concerns,
        notes: input.notes,
        urgency: input.urgency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        requestedBy: request.user!.userId,
      };

      // Store as JSON in plan notes (temporary solution)
      // In production, you'd create a separate ModificationRequest table
      await prisma.annualTrainingPlan.update({
        where: { id: params.planId },
        data: {
          notes: JSON.stringify({
            ...(plan.notes ? JSON.parse(plan.notes) : {}),
            modificationRequests: [
              ...(plan.notes && JSON.parse(plan.notes).modificationRequests || []),
              modificationData,
            ],
          }),
        },
      });

      request.log.info(
        {
          planId: params.planId,
          requestId,
          concerns: input.concerns,
        },
        'Modification request created'
      );

      // Notify coach about modification request
      try {
        const player = await prisma.player.findUnique({
          where: { id: plan.playerId },
          include: { user: true },
        });

        if (player?.user) {
          // Find coach (assume first coach in tenant, or enhance with player-coach relationship)
          const coach = await prisma.user.findFirst({
            where: {
              tenantId: request.tenant!.id,
              role: 'coach',
            },
          });

          if (coach) {
            await NotificationService.notifyCoachOfModificationRequest(
              {
                planId: params.planId,
                planName: plan.planName,
                playerName: `${player.user.firstName} ${player.user.lastName}`,
                playerEmail: player.user.email,
                concerns: input.concerns,
                notes: input.notes,
                urgency: input.urgency,
                requestId,
              },
              coach.id
            );
          }
        }
      } catch (notificationError) {
        // Log error but don't fail the request
        request.log.warn({ error: notificationError }, 'Failed to send notification');
      }

      return reply.code(201).send({
        success: true,
        data: {
          requestId,
          status: 'pending',
          createdAt: modificationData.createdAt,
        },
      });
    }
  );

  /**
   * PUT /api/v1/training-plan/:planId/reject
   * Reject and archive a training plan
   */
  app.put<{ Params: PlanIdParam; Body: RejectPlan }>(
    '/:planId/reject',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Reject and archive a training plan',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string', minLength: 10 },
            willCreateNewIntake: { type: 'boolean', default: false },
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
                  planId: { type: 'string' },
                  status: { type: 'string' },
                  rejectedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlanIdParam; Body: RejectPlan }>,
      reply: FastifyReply
    ) => {
      const params = validate(planIdParamSchema, request.params);
      const input = validate(rejectPlanSchema, request.body);

      // Verify plan exists
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: {
          id: params.planId,
          tenantId: request.tenant!.id,
        },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Training plan not found',
          },
        });
      }

      // Archive the plan
      const rejectedPlan = await prisma.annualTrainingPlan.update({
        where: { id: params.planId },
        data: {
          status: 'rejected',
          notes: JSON.stringify({
            ...(plan.notes ? JSON.parse(plan.notes) : {}),
            rejection: {
              reason: input.reason,
              rejectedAt: new Date().toISOString(),
              rejectedBy: request.user!.userId,
              willCreateNewIntake: input.willCreateNewIntake,
            },
          }),
        },
      });

      request.log.info(
        {
          planId: rejectedPlan.id,
          playerId: rejectedPlan.playerId,
          reason: input.reason,
        },
        'Training plan rejected'
      );

      // Notify coach about plan rejection
      try {
        const player = await prisma.player.findUnique({
          where: { id: rejectedPlan.playerId },
          include: { user: true },
        });

        if (player?.user) {
          // Find coach (assume first coach in tenant, or enhance with player-coach relationship)
          const coach = await prisma.user.findFirst({
            where: {
              tenantId: request.tenant!.id,
              role: 'coach',
            },
          });

          if (coach) {
            await NotificationService.notifyCoachOfPlanRejection(
              {
                planId: params.planId,
                planName: rejectedPlan.planName,
                playerName: `${player.user.firstName} ${player.user.lastName}`,
                playerEmail: player.user.email,
                reason: input.reason,
                willCreateNewIntake: input.willCreateNewIntake || false,
              },
              coach.id
            );
          }
        }
      } catch (notificationError) {
        // Log error but don't fail the request
        request.log.warn({ error: notificationError }, 'Failed to send notification');
      }

      return reply.send({
        success: true,
        data: {
          planId: rejectedPlan.id,
          status: rejectedPlan.status,
          rejectedAt: new Date().toISOString(),
        },
      });
    }
  );

  /**
   * GET /api/v1/training-plan/:planId/analytics
   * Get progress and analytics for a training plan
   */
  app.get<{ Params: PlanIdParam }>(
    '/:planId/analytics',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get training plan analytics and progress',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest<{ Params: PlanIdParam }>, reply: FastifyReply) => {
      const params = validate(planIdParamSchema, request.params);

      const plan = await prisma.annualTrainingPlan.findUnique({
        where: { id: params.planId, tenantId: request.tenant!.id },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Training plan not found' },
        });
      }

      // Access control
      if (request.user!.role === 'player') {
        const player = await prisma.player.findUnique({ where: { id: request.user!.playerId } });
        if (player?.id !== plan.playerId) {
          return reply.code(403).send({
            success: false,
            error: { code: 'ACCESS_DENIED', message: 'Access denied' },
          });
        }
      }

      // Get all assignments
      const assignments = await prisma.dailyTrainingAssignment.findMany({
        where: { annualPlanId: params.planId },
        orderBy: { assignedDate: 'asc' },
      });

      const now = new Date();
      const pastAssignments = assignments.filter(a => new Date(a.assignedDate) <= now);

      // Completion metrics
      const completed = pastAssignments.filter(a => a.status === 'completed').length;
      const planned = pastAssignments.filter(a => !a.isRestDay).length;
      const completionRate = planned > 0 ? (completed / planned) * 100 : 0;

      // Streak calculation
      let currentStreak = 0;
      const sortedCompleted = pastAssignments
        .filter(a => a.status === 'completed')
        .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());

      for (let i = 0; i < sortedCompleted.length; i++) {
        const date = new Date(sortedCompleted[i].assignedDate);
        const expectedDate = new Date(now);
        expectedDate.setDate(expectedDate.getDate() - i);
        if (date.toDateString() === expectedDate.toDateString()) {
          currentStreak++;
        } else break;
      }

      // Weekly breakdown (last 12 weeks)
      const weeks = [];
      for (let i = 11; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekAssignments = pastAssignments.filter(a => {
          const date = new Date(a.assignedDate);
          return date >= weekStart && date <= weekEnd;
        });

        const weekCompleted = weekAssignments.filter(a => a.status === 'completed').length;
        const weekPlanned = weekAssignments.filter(a => !a.isRestDay).length;
        const weekHours = weekAssignments
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + a.estimatedDuration, 0) / 60;

        weeks.push({
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          completed: weekCompleted,
          planned: weekPlanned,
          completionRate: weekPlanned > 0 ? (weekCompleted / weekPlanned) * 100 : 0,
          totalHours: Math.round(weekHours * 10) / 10,
        });
      }

      // Period breakdown (fetch to validate plan exists)
      await prisma.periodization.findMany({
        where: { annualPlanId: params.planId },
      });

      const periodStats: Record<string, { completed: number; planned: number; completionRate: number; totalHours: number }> = {};
      for (const period of ['E', 'G', 'S', 'T']) {
        const periodAssignments = pastAssignments.filter(a => a.period === period);
        const periodCompleted = periodAssignments.filter(a => a.status === 'completed').length;
        const periodPlanned = periodAssignments.filter(a => !a.isRestDay).length;

        periodStats[period] = {
          completed: periodCompleted,
          planned: periodPlanned,
          completionRate: periodPlanned > 0 ? (periodCompleted / periodPlanned) * 100 : 0,
          totalHours: Math.round(
            (periodAssignments
              .filter(a => a.status === 'completed')
              .reduce((sum, a) => sum + a.estimatedDuration, 0) / 60) * 10
          ) / 10,
        };
      }

      // Total hours
      const totalHoursCompleted = Math.round(
        (pastAssignments
          .filter(a => a.status === 'completed')
          .reduce((sum, a) => sum + a.estimatedDuration, 0) / 60) * 10
      ) / 10;

      return reply.send({
        success: true,
        data: {
          overview: {
            completionRate: Math.round(completionRate * 10) / 10,
            currentStreak,
            totalSessionsCompleted: completed,
            totalSessionsPlanned: planned,
            totalHoursCompleted,
          },
          weeklyTrend: weeks,
          periodBreakdown: periodStats,
          upcomingSessions: assignments
            .filter(a => new Date(a.assignedDate) > now && !a.isRestDay)
            .slice(0, 7)
            .map(a => ({
              date: a.assignedDate,
              type: a.sessionType,
              duration: a.estimatedDuration,
              period: a.period,
            })),
        },
      });
    }
  );

  /**
   * POST /api/v1/training-plan/:planId/daily/:date/substitute
   * Find alternative sessions for a daily assignment
   */
  app.post<{ Params: { planId: string; date: string }; Body: { reason?: string } }>(
    '/:planId/daily/:date/substitute',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Request session substitution alternatives',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { planId, date } = request.params;

      const assignment = await prisma.dailyTrainingAssignment.findFirst({
        where: {
          annualPlanId: planId,
          assignedDate: new Date(date),
        },
        include: { sessionTemplate: true },
      });

      if (!assignment) {
        return reply.code(404).send({
          success: false,
          error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' },
        });
      }

      if (!assignment.canBeSubstituted) {
        return reply.code(400).send({
          success: false,
          error: { code: 'NOT_SUBSTITUTABLE', message: 'This session cannot be substituted' },
        });
      }

      // Find similar sessions from template library
      const alternatives = await prisma.sessionTemplate.findMany({
        where: {
          tenantId: request.tenant!.id,
          periods: { has: assignment.period },
          NOT: { id: assignment.sessionTemplateId || '' },
          // Match similar duration (±30 minutes)
          duration: {
            gte: assignment.estimatedDuration - 30,
            lte: assignment.estimatedDuration + 30,
          },
        },
        take: 5,
        orderBy: { duration: 'asc' },
      });

      return reply.send({
        success: true,
        data: {
          original: {
            id: assignment.id,
            type: assignment.sessionType,
            duration: assignment.estimatedDuration,
            date: assignment.assignedDate,
          },
          alternatives: alternatives.map(alt => ({
            id: alt.id,
            name: alt.name,
            type: alt.sessionType,
            duration: alt.duration,
            periods: alt.periods,
            learningPhase: alt.learningPhase,
            description: alt.description,
          })),
        },
      });
    }
  );

  /**
   * PUT /api/v1/training-plan/:planId/daily/:date/quick-action
   * Quick actions: complete, skip, start session
   */
  const quickActionSchema = z.object({
    action: z.enum(['complete', 'skip', 'start']),
    duration: z.number().optional(),
    notes: z.string().optional(),
  });

  app.put<{ Params: { planId: string; date: string }; Body: any }>(
    '/:planId/daily/:date/quick-action',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Quick actions on daily assignments',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { planId, date } = request.params;
      const input = validate(quickActionSchema, request.body);

      const assignment = await prisma.dailyTrainingAssignment.findFirst({
        where: {
          annualPlanId: planId,
          assignedDate: new Date(date),
        },
      });

      if (!assignment) {
        return reply.code(404).send({
          success: false,
          error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Assignment not found' },
        });
      }

      const updates: any = { playerNotes: input.notes };

      if (input.action === 'complete') {
        updates.status = 'completed';
        updates.completedAt = new Date();
        if (input.duration) updates.estimatedDuration = input.duration;
      } else if (input.action === 'skip') {
        updates.status = 'skipped';
      } else if (input.action === 'start') {
        updates.status = 'in_progress';
      }

      const updated = await prisma.dailyTrainingAssignment.update({
        where: { id: assignment.id },
        data: updates,
      });

      return reply.send({
        success: true,
        data: {
          assignmentId: updated.id,
          status: updated.status,
          action: input.action,
        },
      });
    }
  );

  /**
   * GET /api/v1/training-plan/:planId/today
   * Get today's assignment
   */
  app.get<{ Params: PlanIdParam }>(
    '/:planId/today',
    {
      preHandler: preHandlers,
      schema: {
        description: "Get today's training assignment",
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const params = validate(planIdParamSchema, request.params);
      const today = new Date().toISOString().split('T')[0];

      const assignment = await prisma.dailyTrainingAssignment.findFirst({
        where: {
          annualPlanId: params.planId,
          assignedDate: new Date(today),
        },
        include: {
          sessionTemplate: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              sessionType: true,
            },
          },
        },
      });

      if (!assignment) {
        return reply.send({
          success: true,
          data: { hasAssignment: false, message: 'No assignment for today' },
        });
      }

      return reply.send({
        success: true,
        data: {
          hasAssignment: true,
          assignment: {
            id: assignment.id,
            date: assignment.assignedDate,
            type: assignment.sessionType,
            duration: assignment.estimatedDuration,
            status: assignment.status,
            isRestDay: assignment.isRestDay,
            canBeSubstituted: assignment.canBeSubstituted,
            period: assignment.period,
            sessionTemplate: assignment.sessionTemplate,
            notes: assignment.coachNotes,
          },
        },
      });
    }
  );

  /**
   * GET /api/v1/training-plan/:planId/achievements
   * Get player achievements and badges
   */
  app.get<{ Params: PlanIdParam }>(
    '/:planId/achievements',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player achievements and progress',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const params = validate(planIdParamSchema, request.params);

      const plan = await prisma.annualTrainingPlan.findUnique({
        where: { id: params.planId, tenantId: request.tenant!.id },
      });

      if (!plan) {
        return reply.code(404).send({
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Training plan not found' },
        });
      }

      // Get all assignments for stats
      const assignments = await prisma.dailyTrainingAssignment.findMany({
        where: { annualPlanId: params.planId },
      });

      const now = new Date();
      const pastAssignments = assignments.filter(a => new Date(a.assignedDate) <= now);
      const completed = pastAssignments.filter(a => a.status === 'completed');
      const planned = pastAssignments.filter(a => !a.isRestDay).length;

      // Calculate streak
      let currentStreak = 0;
      const sorted = completed
        .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
      for (let i = 0; i < sorted.length; i++) {
        const date = new Date(sorted[i].assignedDate);
        const expected = new Date(now);
        expected.setDate(expected.getDate() - i);
        if (date.toDateString() === expected.toDateString()) currentStreak++;
        else break;
      }

      // Calculate stats
      const stats: PlayerStats = {
        currentStreak,
        totalSessions: completed.length,
        totalHours: Math.round(
          (completed.reduce((sum, a) => sum + a.estimatedDuration, 0) / 60) * 10
        ) / 10,
        completionRate: planned > 0 ? Math.round((completed.length / planned) * 100) : 0,
      };

      // Check achievements
      const earned = checkAchievements(stats);

      return reply.send({
        success: true,
        data: {
          stats,
          achievements: earned,
          totalXP: earned.reduce((sum, a) => sum + a.totalXP, 0),
          availableAchievements: ACHIEVEMENTS.length,
          unlockedAchievements: earned.filter(a => a.currentLevel > 0).length,
        },
      });
    }
  );

  /**
   * GET /api/v1/training-plan/modification-requests
   * List all modification requests for coach
   */
  app.get<{ Querystring: { status?: string } }>(
    '/modification-requests',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all modification requests for coach',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'under_review', 'resolved', 'rejected'] },
          },
        },
      },
    },
    async (request, reply) => {
      // Only coaches can view modification requests
      if (request.user!.role !== 'coach') {
        return reply.code(403).send({
          success: false,
          error: { code: 'ACCESS_DENIED', message: 'Only coaches can view modification requests' },
        });
      }

      const requests = await prisma.modificationRequest.findMany({
        where: {
          annualPlan: { tenantId: request.tenant!.id },
          ...(request.query.status && { status: request.query.status }),
        },
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, email: true } },
          annualPlan: { select: { id: true, planName: true, playerId: true } },
        },
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      });

      return reply.send({
        success: true,
        data: {
          requests: requests.map(req => ({
            id: req.id,
            planId: req.annualPlanId,
            planName: req.annualPlan.planName,
            playerName: `${req.requester.firstName} ${req.requester.lastName}`,
            playerEmail: req.requester.email,
            concerns: req.concerns,
            notes: req.notes,
            urgency: req.urgency,
            status: req.status,
            createdAt: req.createdAt,
            reviewedAt: req.reviewedAt,
          })),
          count: requests.length,
        },
      });
    }
  );

  /**
   * PUT /api/v1/training-plan/modification-requests/:requestId/respond
   * Coach responds to modification request
   */
  const respondSchema = z.object({
    response: z.string().min(10),
    status: z.enum(['resolved', 'rejected']),
  });

  app.put<{ Params: { requestId: string }; Body: { response: string; status: string } }>(
    '/modification-requests/:requestId/respond',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Respond to a modification request',
        tags: ['training-plan'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: { requestId: { type: 'string', format: 'uuid' } },
        },
        body: {
          type: 'object',
          required: ['response', 'status'],
          properties: {
            response: { type: 'string', minLength: 10 },
            status: { type: 'string', enum: ['resolved', 'rejected'] },
          },
        },
      },
    },
    async (request, reply) => {
      if (request.user!.role !== 'coach') {
        return reply.code(403).send({
          success: false,
          error: { code: 'ACCESS_DENIED', message: 'Only coaches can respond to requests' },
        });
      }

      const input = validate(respondSchema, request.body);

      const modRequest = await prisma.modificationRequest.findUnique({
        where: { id: request.params.requestId },
        include: { annualPlan: true, requester: true },
      });

      if (!modRequest || modRequest.annualPlan.tenantId !== request.tenant!.id) {
        return reply.code(404).send({
          success: false,
          error: { code: 'REQUEST_NOT_FOUND', message: 'Modification request not found' },
        });
      }

      const updated = await prisma.modificationRequest.update({
        where: { id: request.params.requestId },
        data: {
          status: input.status,
          coachResponse: input.response,
          reviewedBy: request.user!.userId,
          reviewedAt: new Date(),
          resolvedAt: input.status === 'resolved' ? new Date() : null,
        },
      });

      // Notify player
      try {
        await NotificationService.notifyPlayerOfModificationResponse(
          modRequest.requestedBy,
          modRequest.id,
          input.response,
          input.status as 'resolved' | 'rejected'
        );
      } catch (error) {
        request.log.warn({ error }, 'Failed to send notification');
      }

      return reply.send({
        success: true,
        data: { requestId: updated.id, status: updated.status, reviewedAt: updated.reviewedAt },
      });
    }
  );

  // ============================================================================
  // SYNC TO SESSIONS - P1 Implementation
  // ============================================================================

  /**
   * Sync annual plan daily assignments to TrainingSession records
   * POST /training-plan/:planId/sync-to-sessions
   *
   * Creates TrainingSession records from DailyTrainingAssignment records.
   * Links them via dailyAssignmentId for bidirectional tracking.
   */
  app.post<{ Params: { planId: string }; Body: { startDate?: string; endDate?: string } }>(
    '/:planId/sync-to-sessions',
    {
      schema: {
        description: 'Sync annual plan daily assignments to training sessions',
        tags: ['training-plan'],
        params: {
          type: 'object',
          properties: {
            planId: { type: 'string', format: 'uuid' },
          },
          required: ['planId'],
        },
        body: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date', description: 'Start date for sync (YYYY-MM-DD)' },
            endDate: { type: 'string', format: 'date', description: 'End date for sync (YYYY-MM-DD)' },
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
                  syncedCount: { type: 'number' },
                  skippedCount: { type: 'number' },
                  sessions: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { planId } = request.params;
      const { startDate, endDate } = request.body || {};

      // Verify the plan exists and belongs to the tenant
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: { id: planId },
        include: { player: true },
      });

      if (!plan || plan.tenantId !== request.tenant!.id) {
        return reply.code(404).send({
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Training plan not found' },
        });
      }

      // Authorization: only the player themselves, their coach, or admin
      const user = request.user!;
      if (user.role === 'player' && user.playerId !== plan.playerId) {
        return reply.code(403).send({
          success: false,
          error: { code: 'ACCESS_DENIED', message: 'You can only sync your own training plan' },
        });
      }

      // Build date filter
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      } else {
        // Default: start from today
        dateFilter.gte = new Date();
        dateFilter.gte.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      } else {
        // Default: 4 weeks ahead
        const fourWeeksAhead = new Date();
        fourWeeksAhead.setDate(fourWeeksAhead.getDate() + 28);
        dateFilter.lte = fourWeeksAhead;
      }

      // Get daily assignments that haven't been synced yet
      const assignments = await prisma.dailyTrainingAssignment.findMany({
        where: {
          annualPlanId: planId,
          assignedDate: dateFilter,
          isRestDay: false,
          status: { not: 'skipped' },
          completedSessionId: null, // Not yet linked to a session
        },
        orderBy: { assignedDate: 'asc' },
      });

      // Check for existing sessions to avoid duplicates
      const existingSessionLinks = await prisma.trainingSession.findMany({
        where: {
          dailyAssignmentId: { in: assignments.map(a => a.id) },
        },
        select: { dailyAssignmentId: true },
      });
      const linkedAssignmentIds = new Set(existingSessionLinks.map(s => s.dailyAssignmentId));

      const sessionsToCreate = [];
      let skippedCount = 0;

      for (const assignment of assignments) {
        // Skip if already linked
        if (linkedAssignmentIds.has(assignment.id)) {
          skippedCount++;
          continue;
        }

        // Create session data
        const sessionDate = new Date(assignment.assignedDate);
        sessionDate.setHours(9, 0, 0, 0); // Default to 9 AM

        sessionsToCreate.push({
          playerId: plan.playerId,
          sessionType: assignment.sessionType,
          sessionDate: sessionDate,
          duration: assignment.estimatedDuration,
          period: assignment.period,
          learningPhase: assignment.learningPhase,
          clubSpeed: assignment.clubSpeed,
          intensity: assignment.intensity,
          focusArea: assignment.sessionType,
          dailyAssignmentId: assignment.id,
          notes: `Synkronisert fra årsplan: ${plan.title || 'Årsplan'}`,
        });
      }

      // Batch create sessions
      const createdSessions = [];
      for (const sessionData of sessionsToCreate) {
        try {
          const session = await prisma.trainingSession.create({
            data: sessionData,
          });
          createdSessions.push(session);

          // Update assignment with link to the session
          await prisma.dailyTrainingAssignment.update({
            where: { id: sessionData.dailyAssignmentId! },
            data: { completedSessionId: session.id },
          });
        } catch (error) {
          request.log.warn({ error, sessionData }, 'Failed to create session');
        }
      }

      request.log.info({
        planId,
        syncedCount: createdSessions.length,
        skippedCount,
        dateRange: { start: dateFilter.gte, end: dateFilter.lte },
      }, 'Synced training plan to sessions');

      return reply.send({
        success: true,
        data: {
          syncedCount: createdSessions.length,
          skippedCount,
          sessions: createdSessions.map(s => ({
            id: s.id,
            sessionType: s.sessionType,
            sessionDate: s.sessionDate,
            duration: s.duration,
          })),
        },
      });
    }
  );
}
