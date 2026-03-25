import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TestService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createTestSchema,
  updateTestSchema,
  recordTestResultSchema,
  updateTestResultSchema,
  listTestsQuerySchema,
  listTestResultsQuerySchema,
  testIdParamSchema,
  testResultIdParamSchema,
  playerProgressQuerySchema,
  CreateTestInput,
  UpdateTestInput,
  RecordTestResultInput,
  UpdateTestResultInput,
  ListTestsQuery,
  ListTestResultsQuery,
  TestIdParam,
  TestResultIdParam,
  PlayerProgressQuery,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

/**
 * Register test routes
 */
export async function testRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const testService = new TestService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new test definition
   */
  app.post<{ Body: CreateTestInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new test definition',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateTestInput }>, reply: FastifyReply) => {
      const input = validate(createTestSchema, request.body);
      const test = await testService.createTest(request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: test });
    }
  );

  /**
   * List test definitions
   */
  app.get<{ Querystring: ListTestsQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List test definitions with filters',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListTestsQuery }>, reply: FastifyReply) => {
      const query = validate(listTestsQuerySchema, request.query);
      const result = await testService.listTests(request.tenant!.id, query);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get test definition by ID
   */
  app.get<{ Params: TestIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get test definition by ID',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestIdParam }>, reply: FastifyReply) => {
      const params = validate(testIdParamSchema, request.params);
      const test = await testService.getTestById(request.tenant!.id, params.id);
      return reply.send({ success: true, data: test });
    }
  );

  /**
   * Update test definition
   */
  app.patch<{ Params: TestIdParam; Body: UpdateTestInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update test definition',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestIdParam; Body: UpdateTestInput }>, reply: FastifyReply) => {
      const params = validate(testIdParamSchema, request.params);
      const input = validate(updateTestSchema, request.body);
      const test = await testService.updateTest(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: test });
    }
  );

  /**
   * Delete test definition
   */
  app.delete<{ Params: TestIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete test definition',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestIdParam }>, reply: FastifyReply) => {
      const params = validate(testIdParamSchema, request.params);
      await testService.deleteTest(request.tenant!.id, params.id);
      return reply.send({ success: true, message: 'Test deleted successfully' });
    }
  );

  /**
   * Record a test result
   */
  app.post<{ Body: RecordTestResultInput }>(
    '/results',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Record a test result for a player',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RecordTestResultInput }>, reply: FastifyReply) => {
      const input = validate(recordTestResultSchema, request.body);
      const result = await testService.recordTestResult(request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: result });
    }
  );

  /**
   * List test results
   */
  app.get<{ Querystring: ListTestResultsQuery }>(
    '/results',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List test results with filters',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListTestResultsQuery }>, reply: FastifyReply) => {
      const query = validate(listTestResultsQuerySchema, request.query);
      const result = await testService.listTestResults(request.tenant!.id, query);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get test result by ID
   */
  app.get<{ Params: TestResultIdParam }>(
    '/results/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get test result by ID',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestResultIdParam }>, reply: FastifyReply) => {
      const params = validate(testResultIdParamSchema, request.params);
      const result = await testService.getTestResultById(request.tenant!.id, params.id);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Update test result
   */
  app.patch<{ Params: TestResultIdParam; Body: UpdateTestResultInput }>(
    '/results/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update test result',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestResultIdParam; Body: UpdateTestResultInput }>, reply: FastifyReply) => {
      const params = validate(testResultIdParamSchema, request.params);
      const input = validate(updateTestResultSchema, request.body);
      const result = await testService.updateTestResult(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Delete test result
   */
  app.delete<{ Params: TestResultIdParam }>(
    '/results/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete test result',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: TestResultIdParam }>, reply: FastifyReply) => {
      const params = validate(testResultIdParamSchema, request.params);
      await testService.deleteTestResult(request.tenant!.id, params.id);
      return reply.send({ success: true, message: 'Test result deleted successfully' });
    }
  );

  /**
   * Get player progress across tests
   */
  app.get<{ Querystring: PlayerProgressQuery }>(
    '/progress',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get player progress across tests',
        tags: ['tests'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: PlayerProgressQuery }>, reply: FastifyReply) => {
      const query = validate(playerProgressQuerySchema, request.query);
      const progress = await testService.getPlayerProgress(
        request.tenant!.id,
        query.playerId,
        query.testId
      );
      return reply.send({ success: true, data: progress });
    }
  );
}
