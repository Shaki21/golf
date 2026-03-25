import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ExerciseService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createExerciseSchema,
  updateExerciseSchema,
  listExercisesQuerySchema,
  exerciseIdParamSchema,
  CreateExerciseInput,
  UpdateExerciseInput,
  ListExercisesQuery,
  ExerciseIdParam,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

// Convert Zod schemas to JSON Schema once at module level

/**
 * Register exercise routes
 */
export async function exerciseRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const exerciseService = new ExerciseService(prisma);

  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new exercise
   */
  app.post<{ Body: CreateExerciseInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new exercise',
        tags: ['exercises'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateExerciseInput }>, reply: FastifyReply) => {
      const input = validate(createExerciseSchema, request.body);
      const exercise = await exerciseService.createExercise(request.tenant!.id, input);
      return reply.code(201).send({ success: true, data: exercise });
    }
  );

  /**
   * List exercises with filters and pagination
   */
  app.get<{ Querystring: ListExercisesQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List exercises with filters and pagination',
        tags: ['exercises'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListExercisesQuery }>, reply: FastifyReply) => {
      const query = validate(listExercisesQuerySchema, request.query);
      const result = await exerciseService.listExercises(request.tenant!.id, query);
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get exercise by ID
   */
  app.get<{ Params: ExerciseIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get exercise by ID',
        tags: ['exercises'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ExerciseIdParam }>, reply: FastifyReply) => {
      const params = validate(exerciseIdParamSchema, request.params);
      const exercise = await exerciseService.getExerciseById(request.tenant!.id, params.id);
      return reply.send({ success: true, data: exercise });
    }
  );

  /**
   * Update exercise
   */
  app.patch<{ Params: ExerciseIdParam; Body: UpdateExerciseInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update exercise',
        tags: ['exercises'],
        security: [{ bearerAuth: [] }],
        response: {
          200: { type: 'object', additionalProperties: true },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ExerciseIdParam; Body: UpdateExerciseInput }>, reply: FastifyReply) => {
      const params = validate(exerciseIdParamSchema, request.params);
      const input = validate(updateExerciseSchema, request.body);
      const exercise = await exerciseService.updateExercise(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: exercise });
    }
  );

  /**
   * Delete exercise
   */
  app.delete<{ Params: ExerciseIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete exercise',
        tags: ['exercises'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Exercise deleted successfully' },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ExerciseIdParam }>, reply: FastifyReply) => {
      const params = validate(exerciseIdParamSchema, request.params);
      await exerciseService.deleteExercise(request.tenant!.id, params.id);
      return reply.send({ success: true, message: 'Exercise deleted successfully' });
    }
  );

  /**
   * Duplicate exercise
   */
  app.post<{ Params: ExerciseIdParam }>(
    '/:id/duplicate',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Duplicate an exercise',
        tags: ['exercises'],
        security: [{ bearerAuth: [] }],
        response: {
          201: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: ExerciseIdParam }>, reply: FastifyReply) => {
      const params = validate(exerciseIdParamSchema, request.params);
      const duplicate = await exerciseService.duplicateExercise(request.tenant!.id, params.id);
      return reply.code(201).send({ success: true, data: duplicate });
    }
  );
}
