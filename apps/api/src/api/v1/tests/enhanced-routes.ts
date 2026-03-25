/**
 * Enhanced Test Routes
 * API endpoints for enhanced test results with automatic calculations
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TestResultsEnhancedService } from './test-results-enhanced.service';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// ============================================================================
// SCHEMAS
// ============================================================================

const recordTestResultEnhancedSchema = z.object({
  playerId: z.string().uuid(),
  testNumber: z.number().int().min(1).max(20),
  testDate: z.coerce.date(),
  testTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  location: z.string().min(1),
  facility: z.string().min(1),
  environment: z.enum(['indoor', 'outdoor']),
  conditions: z
    .object({
      weather: z.string().optional(),
      wind: z.string().optional(),
      temperature: z.number().optional(),
    })
    .optional(),
  testData: z.record(z.any()), // Varies by test - required field
  skipPeerComparison: z.boolean().optional(),
  peerCriteria: z
    .object({
      category: z.string().optional(),
      gender: z.string().optional(),
      ageRange: z
        .object({
          min: z.number(),
          max: z.number(),
        })
        .optional(),
      handicapRange: z
        .object({
          min: z.number(),
          max: z.number(),
        })
        .optional(),
    })
    .optional(),
});

const testResultIdParamSchema = z.object({
  id: z.string().uuid(),
});

const playerTestHistoryParamsSchema = z.object({
  playerId: z.string().uuid(),
  testNumber: z.string().regex(/^\d+$/).transform(Number),
});

type RecordTestResultEnhancedInput = z.output<typeof recordTestResultEnhancedSchema>;
type TestResultIdParam = z.output<typeof testResultIdParamSchema>;
type PlayerTestHistoryParams = z.output<typeof playerTestHistoryParamsSchema>;

// ============================================================================
// ROUTES
// ============================================================================

export async function enhancedTestRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new TestResultsEnhancedService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * POST /api/v1/tests/results/enhanced
   * Record a new test result with automatic calculations
   */
  app.post<{ Body: RecordTestResultEnhancedInput }>(
    '/results/enhanced',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Record test result with automatic calculation and peer comparison',
        tags: ['tests', 'enhanced'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: RecordTestResultEnhancedInput }>,
      reply: FastifyReply
    ) => {
      const input = validate(recordTestResultEnhancedSchema, request.body);
      const result = await service.recordTestResult(
        request.tenant!.id,
        input as RecordTestResultEnhancedInput
      );
      return reply.code(201).send({ success: true, data: result });
    }
  );

  /**
   * GET /api/v1/tests/results/:id/enhanced
   * Get test result with peer comparison
   */
  app.get<{ Params: TestResultIdParam }>(
    '/results/:id/enhanced',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get test result with peer comparison data',
        tags: ['tests', 'enhanced'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestResultIdParam }>, reply: FastifyReply) => {
      const params = validate(testResultIdParamSchema, request.params);
      const result = await service.getTestResultWithComparison(
        request.tenant!.id,
        params.id
      );
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * GET /api/v1/tests/players/:playerId/history/:testNumber
   * Get player's test history for a specific test
   */
  app.get<{ Params: PlayerTestHistoryParams }>(
    '/players/:playerId/history/:testNumber',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player test history for a specific test',
        tags: ['tests', 'enhanced'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: PlayerTestHistoryParams }>,
      reply: FastifyReply
    ) => {
      const params = validate(playerTestHistoryParamsSchema, request.params);
      const results = await service.getPlayerTestHistory(
        request.tenant!.id,
        params.playerId,
        params.testNumber
      );
      return reply.send({ success: true, data: results });
    }
  );
}
