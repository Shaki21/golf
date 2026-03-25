/**
 * Club Speed Calibration API Routes
 * One-time calibration during player onboarding
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';
import { ClubSpeedCalibrationService } from '../../../domain/calibration/club-speed-calibration.service';
import {
  ClubSpeedCalibrationInput,
} from '../../../domain/calibration/club-speed-calibration.types';
import { BreakingPointAutoCreationService } from '../../../domain/breaking-points/auto-creation.service';
// Note: Using FastifyRequest with non-null assertions (!) for authenticated routes
// since Fastify's type system doesn't automatically narrow types after preHandler hooks

// Type for calibration session samples
interface CalibrationSample {
  clubType: string;
  distance: number;
  timestamp: string;
}

interface CalibrationSession {
  userId: string;
  samples: CalibrationSample[];
}

// Validation schemas
const clubTypeEnum = z.enum([
  'driver',
  '3wood',
  '5wood',
  '3hybrid',
  '4hybrid',
  '3iron',
  '4iron',
  '5iron',
  '6iron',
  '7iron',
  '8iron',
  '9iron',
  'pw',
  'gw',
  'sw',
  'lw',
]);

const clubCalibrationSchema = z.object({
  clubType: clubTypeEnum,
  shot1Speed: z.number().min(40).max(150),
  shot2Speed: z.number().min(40).max(150),
  shot3Speed: z.number().min(40).max(150),
});

const calibrationInputSchema = z.object({
  playerId: z.string().uuid(),
  calibrationDate: z.coerce.date(),
  clubs: z.array(clubCalibrationSchema).min(1),
  notes: z.string().optional(),
});

const playerIdParamSchema = z.object({
  playerId: z.string().uuid(),
});

type CalibrationInput = z.infer<typeof calibrationInputSchema>;
type PlayerIdParam = z.infer<typeof playerIdParamSchema>;

/**
 * Register calibration routes
 */
export async function calibrationRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const preHandlers = [authenticateUser, injectTenantContext];

  // Mobile-friendly calibration session endpoints
  const sessions = new Map<string, CalibrationSession>();

  /**
   * POST /api/v1/calibration/start
   * Start mobile calibration session
   */
  app.post(
    '/start',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Start mobile calibration session',
        tags: ['calibration'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              sessionId: { type: 'string' },
              startedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      const userId = request.user!.id;
      const sessionId = `cal_${userId}_${Date.now()}`;
      sessions.set(sessionId, { userId, samples: [] });
      return { sessionId, startedAt: new Date().toISOString() };
    }
  );

  /**
   * POST /api/v1/calibration/submit
   * Submit mobile calibration samples
   */
  app.post(
    '/submit',
    {
      preHandler: [authenticateUser],
      schema: {
        description: 'Submit mobile calibration samples',
        tags: ['calibration'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['sessionId', 'samples'],
          properties: {
            sessionId: { type: 'string' },
            samples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  clubType: { type: 'string' },
                  distance: { type: 'number' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              processedSamples: { type: 'number' },
            },
          },
          422: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as { sessionId: string; samples: CalibrationSample[] };
      const { sessionId, samples } = body;
      const userId = request.user!.id;

      if (samples.length < 5) {
        return reply.code(422).send({
          type: 'validation_error',
          message: 'Minimum 5 samples required',
          details: { minSamples: 5, received: samples.length },
        });
      }

      const session = sessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return reply.code(422).send({
          type: 'domain_violation',
          message: 'Invalid session',
        });
      }

      sessions.delete(sessionId);
      return { success: true, processedSamples: samples.length };
    }
  );

  /**
   * POST /api/v1/calibration
   * Submit club speed calibration
   */
  app.post<{ Body: CalibrationInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Submit club speed calibration for a player',
        tags: ['calibration'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerId', 'calibrationDate', 'clubs'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            calibrationDate: { type: 'string', format: 'date-time' },
            clubs: {
              type: 'array',
              items: {
                type: 'object',
                required: ['clubType', 'shot1Speed', 'shot2Speed', 'shot3Speed'],
                properties: {
                  clubType: { type: 'string', enum: clubTypeEnum.options },
                  shot1Speed: { type: 'number', minimum: 40, maximum: 150 },
                  shot2Speed: { type: 'number', minimum: 40, maximum: 150 },
                  shot3Speed: { type: 'number', minimum: 40, maximum: 150 },
                },
              },
            },
            notes: { type: 'string' },
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
                  id: { type: 'string' },
                  playerId: { type: 'string' },
                  driverSpeed: { type: 'number' },
                  speedProfile: { type: 'object' },
                  recommendations: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CalibrationInput }>, reply: FastifyReply) => {
      const input = validate(calibrationInputSchema, request.body);

      // Validate input
      const validation = ClubSpeedCalibrationService.validateInput(input);
      if (!validation.valid) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid calibration data',
            details: { errors: validation.errors },
          },
        });
      }

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

      // Check if calibration already exists
      const existing = await prisma.clubSpeedCalibration.findUnique({
        where: { playerId: input.playerId },
      });

      if (existing) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'CALIBRATION_EXISTS',
            message: 'Calibration already exists for this player. Use PUT to update.',
          },
        });
      }

      // Process calibration
      const result = ClubSpeedCalibrationService.processCalibration(input);

      // Save to database
      const calibration = await prisma.clubSpeedCalibration.create({
        data: {
          playerId: input.playerId,
          tenantId: request.tenant!.id,
          calibrationDate: result.calibration.calibrationDate,
          driverSpeed: result.calibration.driverSpeed,
          clubsData: result.calibration.clubs as unknown as Prisma.InputJsonValue,
          speedProfile: result.speedProfile as unknown as Prisma.InputJsonValue,
          notes: input.notes,
        },
      });

      // Auto-create breaking points from calibration
      try {
        const clubSpeedLevel = await BreakingPointAutoCreationService.mapDriverSpeedToCSLevel(
          result.calibration.driverSpeed
        );

        const breakingPointResult = await BreakingPointAutoCreationService.createFromCalibration({
          playerId: input.playerId,
          tenantId: request.tenant!.id,
          calibrationId: calibration.id,
          speedProfile: result.speedProfile,
          driverSpeed: result.calibration.driverSpeed,
          clubSpeedLevel,
        });

        request.log.info(
          { breakingPoints: breakingPointResult.created },
          'Auto-created breaking points from calibration'
        );
      } catch (error) {
        request.log.error({ error }, 'Failed to auto-create breaking points');
        // Don't fail the request if breaking point creation fails
      }

      return reply.code(201).send({
        success: true,
        data: {
          id: calibration.id,
          playerId: calibration.playerId,
          driverSpeed: result.calibration.driverSpeed,
          speedProfile: result.speedProfile,
          recommendations: result.recommendations,
          clubs: result.calibration.clubs,
        },
      });
    }
  );

  /**
   * GET /api/v1/calibration/player/:playerId
   * Get calibration for a player
   */
  app.get<{ Params: PlayerIdParam }>(
    '/player/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get club speed calibration for a player',
        tags: ['calibration'],
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
                  calibrationDate: { type: 'string' },
                  driverSpeed: { type: 'number' },
                  clubs: { type: 'array' },
                  speedProfile: { type: 'object' },
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

      const calibration = await prisma.clubSpeedCalibration.findUnique({
        where: {
          playerId: params.playerId,
          tenantId: request.tenant!.id,
        },
      });

      if (!calibration) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'CALIBRATION_NOT_FOUND',
            message: 'No calibration found for this player',
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          id: calibration.id,
          playerId: calibration.playerId,
          calibrationDate: calibration.calibrationDate,
          driverSpeed: calibration.driverSpeed,
          clubs: calibration.clubsData,
          speedProfile: calibration.speedProfile,
          notes: calibration.notes,
        },
      });
    }
  );

  /**
   * PUT /api/v1/calibration/player/:playerId
   * Update calibration for a player
   */
  app.put<{ Params: PlayerIdParam; Body: Omit<CalibrationInput, 'playerId'> }>(
    '/player/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update club speed calibration for a player',
        tags: ['calibration'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['calibrationDate', 'clubs'],
          properties: {
            calibrationDate: { type: 'string', format: 'date-time' },
            clubs: {
              type: 'array',
              items: {
                type: 'object',
                required: ['clubType', 'shot1Speed', 'shot2Speed', 'shot3Speed'],
                properties: {
                  clubType: { type: 'string', enum: clubTypeEnum.options },
                  shot1Speed: { type: 'number' },
                  shot2Speed: { type: 'number' },
                  shot3Speed: { type: 'number' },
                },
              },
            },
            notes: { type: 'string' },
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
      request: FastifyRequest<{
        Params: PlayerIdParam;
        Body: Omit<CalibrationInput, 'playerId'>;
      }>,
      reply: FastifyReply
    ) => {
      const params = validate(playerIdParamSchema, request.params);
      const input: ClubSpeedCalibrationInput = {
        ...request.body,
        playerId: params.playerId,
      };

      const validation = ClubSpeedCalibrationService.validateInput(input);
      if (!validation.valid) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid calibration data',
            details: { errors: validation.errors },
          },
        });
      }

      const result = ClubSpeedCalibrationService.processCalibration(input);

      const calibration = await prisma.clubSpeedCalibration.upsert({
        where: {
          playerId: params.playerId,
        },
        create: {
          playerId: params.playerId,
          tenantId: request.tenant!.id,
          calibrationDate: result.calibration.calibrationDate,
          driverSpeed: result.calibration.driverSpeed,
          clubsData: result.calibration.clubs as unknown as Prisma.InputJsonValue,
          speedProfile: result.speedProfile as unknown as Prisma.InputJsonValue,
          notes: input.notes,
        },
        update: {
          calibrationDate: result.calibration.calibrationDate,
          driverSpeed: result.calibration.driverSpeed,
          clubsData: result.calibration.clubs as unknown as Prisma.InputJsonValue,
          speedProfile: result.speedProfile as unknown as Prisma.InputJsonValue,
          notes: input.notes,
        },
      });

      // Auto-create breaking points from updated calibration
      try {
        const clubSpeedLevel = await BreakingPointAutoCreationService.mapDriverSpeedToCSLevel(
          result.calibration.driverSpeed
        );

        // Delete old auto-created breaking points from previous calibration
        await prisma.breakingPoint.deleteMany({
          where: {
            playerId: params.playerId,
            sourceType: 'calibration',
            calibrationId: calibration.id,
          },
        });

        const breakingPointResult = await BreakingPointAutoCreationService.createFromCalibration({
          playerId: params.playerId,
          tenantId: request.tenant!.id,
          calibrationId: calibration.id,
          speedProfile: result.speedProfile,
          driverSpeed: result.calibration.driverSpeed,
          clubSpeedLevel,
        });

        request.log.info(
          { breakingPoints: breakingPointResult.created },
          'Auto-updated breaking points from calibration'
        );
      } catch (error) {
        request.log.error({ error }, 'Failed to auto-update breaking points');
        // Don't fail the request if breaking point update fails
      }

      return reply.send({
        success: true,
        data: {
          id: calibration.id,
          playerId: calibration.playerId,
          driverSpeed: result.calibration.driverSpeed,
          speedProfile: result.speedProfile,
          recommendations: result.recommendations,
          clubs: result.calibration.clubs,
        },
      });
    }
  );

  /**
   * DELETE /api/v1/calibration/player/:playerId
   * Delete calibration for a player
   */
  app.delete<{ Params: PlayerIdParam }>(
    '/player/:playerId',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete club speed calibration for a player',
        tags: ['calibration'],
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: PlayerIdParam }>, reply: FastifyReply) => {
      const params = validate(playerIdParamSchema, request.params);

      await prisma.clubSpeedCalibration.delete({
        where: {
          playerId: params.playerId,
          tenantId: request.tenant!.id,
        },
      });

      return reply.send({
        success: true,
        message: 'Calibration deleted successfully',
      });
    }
  );
}
