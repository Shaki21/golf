import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AvailabilityService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  listAvailabilityQuerySchema,
  availabilityIdParamSchema,
  getAvailableSlotsQuerySchema,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  ListAvailabilityQuery,
  AvailabilityIdParam,
  GetAvailableSlotsQuery,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

/**
 * Register availability routes
 */
export async function availabilityRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const availabilityService = new AvailabilityService(prisma);

  // All routes require authentication and tenant context
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new availability slot
   */
  app.post<{ Body: CreateAvailabilityInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new coach availability slot',
        tags: ['availability'],
        security: [{ bearerAuth: [] }],
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  coachId: { type: 'string' },
                  dayOfWeek: { type: 'number' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  slotDuration: { type: 'number' },
                  maxBookings: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: CreateAvailabilityInput }>,
      reply: FastifyReply
    ) => {
      const input = validate(createAvailabilitySchema, request.body);
      const availability = await availabilityService.createAvailability(
        request.tenant!.id,
        input
      );
      return reply.code(201).send({ success: true, data: availability });
    }
  );

  /**
   * List availability slots with filters
   */
  app.get<{ Querystring: ListAvailabilityQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List availability slots with optional filters',
        tags: ['availability'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            coachId: { type: 'string', format: 'uuid' },
            dayOfWeek: { type: 'number', minimum: 0, maximum: 6 },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            isActive: { type: 'boolean' },
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
                    coachId: { type: 'string' },
                    dayOfWeek: { type: 'number' },
                    startTime: { type: 'string' },
                    endTime: { type: 'string' },
                    slotDuration: { type: 'number' },
                    maxBookings: { type: 'number' },
                    isActive: { type: 'boolean' },
                    coach: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: ListAvailabilityQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(listAvailabilityQuerySchema, request.query);
      const availabilities = await availabilityService.listAvailability(
        request.tenant!.id,
        query
      );
      return reply.send({ success: true, data: availabilities });
    }
  );

  /**
   * Get availability by ID
   */
  app.get<{ Params: AvailabilityIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get availability slot by ID',
        tags: ['availability'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
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
                  coachId: { type: 'string' },
                  dayOfWeek: { type: 'number' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  slotDuration: { type: 'number' },
                  maxBookings: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: AvailabilityIdParam }>,
      reply: FastifyReply
    ) => {
      const params = validate(availabilityIdParamSchema, request.params);
      const availability = await availabilityService.getAvailabilityById(
        request.tenant!.id,
        params.id
      );
      return reply.send({ success: true, data: availability });
    }
  );

  /**
   * Update availability slot
   */
  app.patch<{ Params: AvailabilityIdParam; Body: UpdateAvailabilityInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update an availability slot',
        tags: ['availability'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
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
                  coachId: { type: 'string' },
                  dayOfWeek: { type: 'number' },
                  startTime: { type: 'string' },
                  endTime: { type: 'string' },
                  slotDuration: { type: 'number' },
                  maxBookings: { type: 'number' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: AvailabilityIdParam;
        Body: UpdateAvailabilityInput;
      }>,
      reply: FastifyReply
    ) => {
      const params = validate(availabilityIdParamSchema, request.params);
      const input = validate(updateAvailabilitySchema, request.body);
      const updated = await availabilityService.updateAvailability(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: updated });
    }
  );

  /**
   * Delete availability slot
   */
  app.delete<{ Params: AvailabilityIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Delete an availability slot',
        tags: ['availability'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Availability deleted successfully' },
            },
          },
          404: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: AvailabilityIdParam }>,
      reply: FastifyReply
    ) => {
      const params = validate(availabilityIdParamSchema, request.params);
      await availabilityService.deleteAvailability(request.tenant!.id, params.id);
      return reply.send({
        success: true,
        message: 'Availability deleted successfully',
      });
    }
  );

  /**
   * Get available slots for booking
   */
  app.get<{ Querystring: GetAvailableSlotsQuery }>(
    '/slots/available',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get available booking slots for a coach within a date range',
        tags: ['availability'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['coachId', 'startDate', 'endDate'],
          properties: {
            coachId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            sessionType: { type: 'string' },
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
                    date: { type: 'string', format: 'date' },
                    startTime: { type: 'string' },
                    endTime: { type: 'string' },
                    availabilityId: { type: 'string' },
                    remainingCapacity: { type: 'number' },
                  },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: GetAvailableSlotsQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(getAvailableSlotsQuerySchema, request.query);
      const slots = await availabilityService.getAvailableSlots(
        request.tenant!.id,
        query
      );
      return reply.send({ success: true, data: slots });
    }
  );
}
