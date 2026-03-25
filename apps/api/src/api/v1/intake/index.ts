/**
 * Player Intake Form API Routes
 * Handles intake form submission and plan generation
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import { IntakeProcessingService } from '../../../domain/intake/intake-processing.service';
import type { PlayerIntakeForm } from '../../../domain/intake/intake.types';

// Validation schemas
const trainingHistoryEnum = z.enum(['none', 'sporadic', 'regular', 'systematic']);
const primaryGoalEnum = z.enum([
  'lower_handicap',
  'compete_tournaments',
  'consistency',
  'enjoy_more',
  'specific_skill',
]);
const timeframeEnum = z.enum(['3_months', '6_months', '12_months']);
const ageGroupEnum = z.enum(['<25', '25-35', '35-45', '45-55', '55-65', '65+']);
const workScheduleEnum = z.enum(['flexible', 'regular_hours', 'irregular', 'shift_work']);
const physicalActivityEnum = z.enum(['sedentary', 'light', 'moderate', 'active']);
const learningStyleEnum = z.enum(['visual', 'verbal', 'kinesthetic', 'mixed']);
const motivationTypeEnum = z.enum(['competition', 'personal_growth', 'social', 'achievement']);
const investmentEnum = z.enum(['minimal', 'moderate', 'significant']);

const backgroundSchema = z.object({
  yearsPlaying: z.number().min(0).max(100),
  currentHandicap: z.number().min(-5).max(54),
  averageScore: z.number().min(60).max(150),
  roundsPerYear: z.number().min(0).max(200),
  trainingHistory: trainingHistoryEnum,
});

const availabilitySchema = z.object({
  hoursPerWeek: z.number().min(1).max(40),
  preferredDays: z.array(z.number().min(0).max(6)),
  canTravelToFacility: z.boolean(),
  hasHomeEquipment: z.boolean(),
  seasonalAvailability: z
    .object({
      summer: z.number().min(1).max(40),
      winter: z.number().min(1).max(40),
    })
    .optional(),
});

const tournamentGoalSchema = z.object({
  name: z.string(),
  date: z.coerce.date(),
  importance: z.enum(['major', 'important', 'minor']),
  targetPlacement: z.string().optional(),
});

const goalsSchema = z.object({
  primaryGoal: primaryGoalEnum,
  targetHandicap: z.number().min(-5).max(54).optional(),
  targetScore: z.number().min(60).max(150).optional(),
  timeframe: timeframeEnum,
  tournaments: z.array(tournamentGoalSchema).optional(),
  specificFocus: z.array(z.string()).optional(),
});

const physicalLimitationSchema = z.object({
  area: z.enum(['back', 'shoulder', 'wrist', 'hip', 'knee', 'elbow']),
  severity: z.enum(['mild', 'moderate', 'significant']),
  affectsSwing: z.boolean(),
});

const weaknessesSchema = z.object({
  biggestFrustration: z.string(),
  problemAreas: z.array(z.string()),
  mentalChallenges: z.array(z.string()).optional(),
  physicalLimitations: z.array(physicalLimitationSchema).optional(),
});

const injurySchema = z.object({
  type: z.string(),
  dateOccurred: z.coerce.date().optional(),
  resolved: z.boolean(),
  requiresModification: z.boolean(),
  affectedAreas: z.array(z.string()),
});

const healthSchema = z.object({
  currentInjuries: z.array(injurySchema),
  injuryHistory: z.array(injurySchema),
  chronicConditions: z.array(z.string()).optional(),
  mobilityIssues: z.array(z.string()).optional(),
  ageGroup: ageGroupEnum,
});

const lifestyleSchema = z.object({
  workSchedule: workScheduleEnum,
  stressLevel: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  nutritionFocus: z.boolean(),
  physicalActivity: physicalActivityEnum,
});

const equipmentSchema = z.object({
  hasDriverSpeedMeasurement: z.boolean(),
  driverSpeed: z.number().min(40).max(150).optional(),
  recentClubFitting: z.boolean(),
  accessToTrackMan: z.boolean(),
  accessToGym: z.boolean(),
  willingToInvest: investmentEnum,
});

const learningSchema = z.object({
  preferredStyle: learningStyleEnum,
  wantsDetailedExplanations: z.boolean(),
  prefersStructure: z.boolean(),
  motivationType: motivationTypeEnum,
});

const intakeFormSchema = z.object({
  playerId: z.string().uuid(),
  background: backgroundSchema.optional(),
  availability: availabilitySchema.optional(),
  goals: goalsSchema.optional(),
  weaknesses: weaknessesSchema.optional(),
  health: healthSchema.optional(),
  lifestyle: lifestyleSchema.optional(),
  equipment: equipmentSchema.optional(),
  learning: learningSchema.optional(),
});

const playerIdParamSchema = z.object({
  playerId: z.string().uuid(),
});

const intakeIdParamSchema = z.object({
  intakeId: z.string().uuid(),
});

const tenantIdParamSchema = z.object({
  tenantId: z.string().uuid(),
});

const tenantIntakesQuerySchema = z.object({
  isComplete: z.enum(['true', 'false']).optional(),
  hasGeneratedPlan: z.enum(['true', 'false']).optional(),
});

type IntakeFormInput = z.infer<typeof intakeFormSchema>;
type PlayerIdParam = z.infer<typeof playerIdParamSchema>;
type IntakeIdParam = z.infer<typeof intakeIdParamSchema>;
type TenantIdParam = z.infer<typeof tenantIdParamSchema>;
type TenantIntakesQuery = z.infer<typeof tenantIntakesQuerySchema>;

/**
 * Register intake routes
 */
export async function intakeRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * POST /api/v1/intake
   * Submit or update player intake form
   */
  app.post<{ Body: IntakeFormInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Submit or update player intake form',
        tags: ['intake'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            background: { type: 'object' },
            availability: { type: 'object' },
            goals: { type: 'object' },
            weaknesses: { type: 'object' },
            health: { type: 'object' },
            lifestyle: { type: 'object' },
            equipment: { type: 'object' },
            learning: { type: 'object' },
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
                  id: { type: 'string' },
                  completionPercentage: { type: 'number' },
                  isComplete: { type: 'boolean' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: IntakeFormInput }>, reply: FastifyReply) => {
      const input = validate(intakeFormSchema, request.body);

      // Verify player exists and belongs to tenant
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

      // Submit intake
      const result = await IntakeProcessingService.submitIntake(
        input.playerId,
        request.tenant!.id,
        input as Partial<PlayerIntakeForm>
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /api/v1/intake/player/:playerId
   * Get player's intake form
   */
  app.get<{ Params: PlayerIdParam }>(
    '/player/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player intake form',
        tags: ['intake'],
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
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  playerId: { type: 'string' },
                  completionPercentage: { type: 'number' },
                  isComplete: { type: 'boolean' },
                  background: { type: 'object' },
                  availability: { type: 'object' },
                  goals: { type: 'object' },
                  weaknesses: { type: 'object' },
                  health: { type: 'object' },
                  lifestyle: { type: 'object' },
                  equipment: { type: 'object' },
                  learning: { type: 'object' },
                  submittedAt: { type: 'string' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);

      const intake = await IntakeProcessingService.getPlayerIntake(params.playerId);

      if (!intake) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'INTAKE_NOT_FOUND',
            message: 'No intake form found for this player',
          },
        });
      }

      // Verify tenant access
      if (intake.tenantId !== request.tenant!.id) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'INTAKE_NOT_FOUND',
            message: 'No intake form found for this player',
          },
        });
      }

      return reply.send({
        success: true,
        data: intake,
      });
    }
  );

  /**
   * POST /api/v1/intake/:intakeId/generate-plan
   * Generate training plan from completed intake
   */
  app.post<{ Params: IntakeIdParam }>(
    '/:intakeId/generate-plan',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Generate training plan from completed intake form',
        tags: ['intake'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            intakeId: { type: 'string', format: 'uuid' },
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
                  annualPlan: { type: 'object' },
                  periodizations: { type: 'array' },
                  dailyAssignments: { type: 'array' },
                  tournaments: { type: 'array' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: IntakeIdParam }>, reply: FastifyReply) => {
      const params = validate(intakeIdParamSchema, request.params);

      // Verify intake exists and belongs to tenant
      const intake = await prisma.playerIntake.findUnique({
        where: { id: params.intakeId },
      });

      if (!intake || intake.tenantId !== request.tenant!.id) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'INTAKE_NOT_FOUND',
            message: 'Intake form not found',
          },
        });
      }

      try {
        const planResult = await IntakeProcessingService.generatePlanFromIntake(params.intakeId);

        return reply.code(201).send({
          success: true,
          data: planResult,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate plan';

        if (errorMessage.includes('not complete')) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INCOMPLETE_INTAKE',
              message: errorMessage,
            },
          });
        }

        request.log.error({ error }, 'Failed to generate plan from intake');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'PLAN_GENERATION_FAILED',
            message: 'Failed to generate training plan',
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/intake/tenant/:tenantId
   * Get all intakes for a tenant (admin view)
   */
  app.get<{ Params: TenantIdParam; Querystring: TenantIntakesQuery }>(
    '/tenant/:tenantId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get all intake forms for a tenant (admin only)',
        tags: ['intake'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            isComplete: { type: 'string', enum: ['true', 'false'] },
            hasGeneratedPlan: { type: 'string', enum: ['true', 'false'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    playerId: { type: 'string' },
                    completionPercentage: { type: 'number' },
                    isComplete: { type: 'boolean' },
                    submittedAt: { type: 'string' },
                    player: { type: 'object' },
                  },
                },
              },
            },
          },
          403: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: TenantIdParam; Querystring: TenantIntakesQuery }>,
      reply: FastifyReply
    ) => {
      const params = validate(tenantIdParamSchema, request.params);
      const query = validate(tenantIntakesQuerySchema, request.query);

      // Verify tenant access
      if (params.tenantId !== request.tenant!.id) {
        return reply.code(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this tenant',
          },
        });
      }

      const filters = {
        isComplete: query.isComplete === 'true' ? true : query.isComplete === 'false' ? false : undefined,
        hasGeneratedPlan:
          query.hasGeneratedPlan === 'true'
            ? true
            : query.hasGeneratedPlan === 'false'
              ? false
              : undefined,
      };

      const intakes = await IntakeProcessingService.getTenantIntakes(params.tenantId, filters);

      return reply.send({
        success: true,
        data: intakes,
      });
    }
  );

  /**
   * DELETE /api/v1/intake/:intakeId
   * Delete an intake form
   */
  app.delete<{ Params: IntakeIdParam }>(
    '/:intakeId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete an intake form',
        tags: ['intake'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            intakeId: { type: 'string', format: 'uuid' },
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
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: IntakeIdParam }>, reply: FastifyReply) => {
      const params = validate(intakeIdParamSchema, request.params);

      // Verify intake exists and belongs to tenant
      const intake = await prisma.playerIntake.findUnique({
        where: { id: params.intakeId },
      });

      if (!intake || intake.tenantId !== request.tenant!.id) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'INTAKE_NOT_FOUND',
            message: 'Intake form not found',
          },
        });
      }

      await prisma.playerIntake.delete({
        where: { id: params.intakeId },
      });

      return reply.send({
        success: true,
        message: 'Intake form deleted successfully',
      });
    }
  );
}
