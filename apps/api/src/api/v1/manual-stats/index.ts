/**
 * Manual Stats API Routes
 *
 * Endpoints for round management, image upload, extraction, and SG calculation.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';
import { getRoundService } from './round-service';
import { getExtractionService } from './extraction-service';
import { getSGEngine, initializeSGEngine } from './sg-engine';
import {
  CreateRoundRequestSchema,
  ManualHolesEntrySchema,
  FinalizeRoundRequestSchema,
  BatchUserCorrectionsSchema,
  GetRoundsQuerySchema,
  GetPlayerTrendsQuerySchema,
  InitiateUploadRequestSchema,
  CompleteUploadRequestSchema,
  SGBaselineImportSchema,
} from './schemas';
import { logger } from '../../../utils/logger';

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

export async function manualStatsRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const roundService = getRoundService(prisma);
  const extractionService = getExtractionService(prisma);

  // ─────────────────────────────────────────────────────────────────────────
  // ROUND MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new round
   * POST /api/v1/manual-stats/rounds
   */
  app.post(
    '/rounds',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Create a new golf round',
        tags: ['manual-stats'],
        body: {
          type: 'object',
          required: ['playerId', 'roundDate'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            roundDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            courseName: { type: 'string' },
            courseId: { type: 'string', format: 'uuid' },
            teeBox: { type: 'string' },
            totalPar: { type: 'integer', minimum: 54, maximum: 90 },
            holesPlayed: { type: 'integer', minimum: 1, maximum: 18 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const input = CreateRoundRequestSchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      const result = await roundService.createRound(tenantId, input);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * Get round by ID
   * GET /api/v1/manual-stats/rounds/:roundId
   */
  app.get(
    '/rounds/:roundId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get a golf round by ID',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['roundId'],
          properties: {
            roundId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { roundId: string } }>, reply: FastifyReply) => {
      const { roundId } = request.params;
      const tenantId = request.user!.tenantId;

      const round = await roundService.getRound(tenantId, roundId);
      if (!round) {
        throw new NotFoundError('Round not found');
      }

      return reply.send({
        success: true,
        data: round,
      });
    }
  );

  /**
   * Add manual hole entries to a round
   * POST /api/v1/manual-stats/rounds/:roundId/holes
   */
  app.post(
    '/rounds/:roundId/holes',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Add manual hole entries to a round',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['roundId'],
          properties: {
            roundId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { roundId: string }; Body: unknown }>,
      reply: FastifyReply
    ) => {
      const { roundId } = request.params;
      const tenantId = request.user!.tenantId;
      const input = ManualHolesEntrySchema.parse(request.body);

      const result = await roundService.addManualHoles(tenantId, roundId, input);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * Finalize round and compute SG
   * POST /api/v1/manual-stats/rounds/:roundId/finalize
   */
  app.post(
    '/rounds/:roundId/finalize',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Finalize a round and compute Strokes Gained',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['roundId'],
          properties: {
            roundId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { roundId: string }; Body: unknown }>,
      reply: FastifyReply
    ) => {
      const { roundId } = request.params;
      const tenantId = request.user!.tenantId;
      const input = FinalizeRoundRequestSchema.parse(request.body ?? {});

      const result = await roundService.finalizeRound(tenantId, roundId, input);

      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGE UPLOAD & EXTRACTION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initiate image upload
   * POST /api/v1/manual-stats/rounds/:roundId/images/initiate
   */
  app.post(
    '/rounds/:roundId/images/initiate',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Initiate an image upload for a round',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['roundId'],
          properties: {
            roundId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { roundId: string }; Body: unknown }>,
      reply: FastifyReply
    ) => {
      const { roundId } = request.params;
      const input = InitiateUploadRequestSchema.parse({ ...request.body as object, roundId });

      // In production, this would generate a signed S3 upload URL
      // For now, return a mock URL
      const uploadUrl = `/api/v1/manual-stats/rounds/${roundId}/images/upload`;

      return reply.send({
        success: true,
        data: {
          uploadUrl,
          imageId: 'pending', // Will be assigned after actual upload
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      });
    }
  );

  /**
   * Get extraction status for a round
   * GET /api/v1/manual-stats/rounds/:roundId/extraction
   */
  app.get(
    '/rounds/:roundId/extraction',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get extraction status for a round',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['roundId'],
          properties: {
            roundId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { roundId: string } }>, reply: FastifyReply) => {
      const { roundId } = request.params;

      const status = await roundService.getExtractionStatus(roundId);

      return reply.send({
        success: true,
        data: status,
      });
    }
  );

  /**
   * Apply user corrections to extraction
   * PATCH /api/v1/manual-stats/rounds/:roundId/extraction
   */
  app.patch(
    '/rounds/:roundId/extraction',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Apply user corrections to extraction data',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['roundId'],
          properties: {
            roundId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { roundId: string }; Body: unknown }>,
      reply: FastifyReply
    ) => {
      const { roundId } = request.params;
      const userId = request.user!.userId;
      const input = BatchUserCorrectionsSchema.parse(request.body);

      // Get extraction ID for this round
      const extractions = await prisma.$queryRaw<Array<{ extraction_id: string }>>`
        SELECT ie.id as extraction_id
        FROM image_extractions ie
        JOIN round_images ri ON ri.id = ie.image_id
        WHERE ri.round_id = ${roundId}::uuid
        LIMIT 1
      `;

      if (extractions.length === 0) {
        throw new NotFoundError('No extraction found for this round');
      }

      const extractionId = extractions[0].extraction_id;

      // Apply each correction
      for (const correction of input.corrections) {
        await extractionService.applyCorrection(
          extractionId,
          correction.holeNumber,
          correction.field,
          correction.value,
          userId,
          correction.reason
        );
      }

      return reply.send({
        success: true,
        data: {
          correctionsApplied: input.corrections.length,
        },
      });
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYER STATS & TRENDS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get player SG trends
   * GET /api/v1/manual-stats/players/:playerId/trends
   */
  app.get(
    '/players/:playerId/trends',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get Strokes Gained trends for a player',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['30d', '90d', '180d', '1y', 'all'] },
            minCoverage: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { playerId: string };
        Querystring: { period?: string; minCoverage?: number };
      }>,
      reply: FastifyReply
    ) => {
      const { playerId } = request.params;
      const tenantId = request.user!.tenantId;
      const query = GetPlayerTrendsQuerySchema.parse(request.query);

      const trends = await roundService.getPlayerTrends(tenantId, playerId, {
        period: query.period ?? '90d',
        minCoverage: query.minCoverage ?? 50,
      });

      return reply.send({
        success: true,
        data: trends,
      });
    }
  );

  /**
   * Get player rounds
   * GET /api/v1/manual-stats/players/:playerId/rounds
   */
  app.get(
    '/players/:playerId/rounds',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get rounds for a player',
        tags: ['manual-stats'],
        params: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { playerId: string };
        Querystring: { status?: string; startDate?: string; endDate?: string; limit?: number; offset?: number };
      }>,
      reply: FastifyReply
    ) => {
      const { playerId } = request.params;
      const tenantId = request.user!.tenantId;
      const query = GetRoundsQuerySchema.parse({ ...request.query, playerId });

      const rounds = await prisma.$queryRaw<
        Array<{
          id: string;
          round_date: Date;
          course_name: string | null;
          status: string;
          total_score: number | null;
          data_quality: number | null;
          sg_computable: boolean;
        }>
      >`
        SELECT id, round_date, course_name, status, total_score, data_quality, sg_computable
        FROM golf_rounds
        WHERE tenant_id = ${tenantId}::uuid AND player_id = ${playerId}::uuid
        ORDER BY round_date DESC
        LIMIT ${query.limit} OFFSET ${query.offset}
      `;

      return reply.send({
        success: true,
        data: rounds.map((r) => ({
          id: r.id,
          roundDate: r.round_date.toISOString().split('T')[0],
          courseName: r.course_name,
          status: r.status,
          totalScore: r.total_score,
          dataQuality: r.data_quality,
          sgComputable: r.sg_computable,
        })),
      });
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SG BASELINE MANAGEMENT (Admin only)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Import SG baseline
   * POST /api/v1/manual-stats/admin/baselines
   */
  app.post(
    '/admin/baselines',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Import a new SG baseline (admin only)',
        tags: ['manual-stats-admin'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Check admin role
      if (request.user!.role !== 'admin') {
        throw new BadRequestError('Admin access required');
      }

      const input = SGBaselineImportSchema.parse(request.body);

      const sgEngine = await initializeSGEngine(prisma);
      await sgEngine.importBaseline(
        input.version,
        input.entries.map((e) => ({
          lieCategory: e.lieCategory as any,
          distanceBucketMin: e.distanceBucketMin,
          distanceBucketMax: e.distanceBucketMax,
          expectedStrokes: e.expectedStrokes,
          sampleSize: e.sampleSize,
          source: e.source,
        })),
        input.setActive
      );

      return reply.status(201).send({
        success: true,
        data: {
          version: input.version,
          entriesImported: input.entries.length,
          isActive: input.setActive,
        },
      });
    }
  );

  /**
   * Get active baseline info
   * GET /api/v1/manual-stats/admin/baselines/active
   */
  app.get(
    '/admin/baselines/active',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get active SG baseline info',
        tags: ['manual-stats-admin'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sgEngine = await initializeSGEngine(prisma);
      const version = sgEngine.getActiveVersion();

      const count = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM sg_expected_strokes_baseline WHERE version = ${version}
      `;

      return reply.send({
        success: true,
        data: {
          version,
          entryCount: Number(count[0]?.count ?? 0),
        },
      });
    }
  );

  logger.info('Manual stats routes registered');
}
