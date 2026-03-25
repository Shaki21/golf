import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BookingService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  checkConflictsSchema,
  listBookingsQuerySchema,
  bookingIdParamSchema,
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  CheckConflictsInput,
  ListBookingsQuery,
  BookingIdParam,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { injectTenantContext } from '../../../middleware/tenant';
import { validate } from '../../../utils/validation';

/**
 * Register booking routes
 */
export async function bookingRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const bookingService = new BookingService(prisma);

  // All routes require authentication and tenant context
  const preHandlers = [authenticateUser, injectTenantContext];

  /**
   * Create a new booking
   */
  app.post<{ Body: CreateBookingInput }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Create a new booking with automatic conflict detection',
        tags: ['bookings'],
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
                  eventId: { type: 'string' },
                  playerId: { type: 'string' },
                  status: { type: 'string' },
                  bookedAt: { type: 'string' },
                  event: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      startTime: { type: 'string' },
                      endTime: { type: 'string' },
                      location: { type: 'string' },
                    },
                  },
                  player: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
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
      request: FastifyRequest<{ Body: CreateBookingInput }>,
      reply: FastifyReply
    ) => {
      const input = validate(createBookingSchema, request.body);
      const booking = await bookingService.createBooking(
        request.tenant!.id,
        request.user!.id,
        input
      );
      return reply.code(201).send({ success: true, data: booking });
    }
  );

  /**
   * List bookings with filters and pagination
   */
  app.get<{ Querystring: ListBookingsQuery }>(
    '/',
    {
      preHandler: preHandlers,
      schema: {
        description: 'List bookings with optional filters and pagination',
        tags: ['bookings'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 20 },
            playerId: { type: 'string', format: 'uuid' },
            coachId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            sessionType: { type: 'string' },
            sortBy: {
              type: 'string',
              enum: ['bookedAt', 'startTime', 'status'],
              default: 'startTime',
            },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
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
                  bookings: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        eventId: { type: 'string' },
                        playerId: { type: 'string' },
                        status: { type: 'string' },
                        bookedAt: { type: 'string' },
                      },
                    },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number' },
                      limit: { type: 'number' },
                      total: { type: 'number' },
                      totalPages: { type: 'number' },
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
      request: FastifyRequest<{ Querystring: ListBookingsQuery }>,
      reply: FastifyReply
    ) => {
      const query = validate(listBookingsQuerySchema, request.query);
      const result = await bookingService.listBookings(
        request.tenant!.id,
        query
      );
      return reply.send({ success: true, data: result });
    }
  );

  /**
   * Get booking by ID
   */
  app.get<{ Params: BookingIdParam }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Get booking details by ID',
        tags: ['bookings'],
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
                  eventId: { type: 'string' },
                  playerId: { type: 'string' },
                  status: { type: 'string' },
                  bookedAt: { type: 'string' },
                },
              },
            },
          },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: BookingIdParam }>,
      reply: FastifyReply
    ) => {
      const params = validate(bookingIdParamSchema, request.params);
      const booking = await bookingService.getBookingById(
        request.tenant!.id,
        params.id
      );
      return reply.send({ success: true, data: booking });
    }
  );

  /**
   * Update booking
   */
  app.patch<{ Params: BookingIdParam; Body: UpdateBookingInput }>(
    '/:id',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Update booking details with conflict checking',
        tags: ['bookings'],
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
                  eventId: { type: 'string' },
                  playerId: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
          400: { $ref: 'Error#' },
          404: { $ref: 'Error#' },
          409: { $ref: 'Error#' },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: BookingIdParam;
        Body: UpdateBookingInput;
      }>,
      reply: FastifyReply
    ) => {
      const params = validate(bookingIdParamSchema, request.params);
      const input = validate(updateBookingSchema, request.body);
      const updated = await bookingService.updateBooking(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: updated });
    }
  );

  /**
   * Confirm booking
   */
  app.post<{ Params: BookingIdParam }>(
    '/:id/confirm',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Confirm a pending booking',
        tags: ['bookings'],
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
                  status: { type: 'string', example: 'confirmed' },
                  confirmedAt: { type: 'string' },
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
      request: FastifyRequest<{ Params: BookingIdParam }>,
      reply: FastifyReply
    ) => {
      const params = validate(bookingIdParamSchema, request.params);
      const confirmed = await bookingService.confirmBooking(
        request.tenant!.id,
        params.id
      );
      return reply.send({ success: true, data: confirmed });
    }
  );

  /**
   * Cancel booking
   */
  app.post<{ Params: BookingIdParam; Body: CancelBookingInput }>(
    '/:id/cancel',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Cancel a booking with a reason',
        tags: ['bookings'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', minLength: 1 },
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
                  status: { type: 'string', example: 'cancelled' },
                  cancelledAt: { type: 'string' },
                  cancellationReason: { type: 'string' },
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
        Params: BookingIdParam;
        Body: CancelBookingInput;
      }>,
      reply: FastifyReply
    ) => {
      const params = validate(bookingIdParamSchema, request.params);
      const input = validate(cancelBookingSchema, request.body);
      const cancelled = await bookingService.cancelBooking(
        request.tenant!.id,
        params.id,
        input
      );
      return reply.send({ success: true, data: cancelled });
    }
  );

  /**
   * Check for booking conflicts
   */
  app.post<{ Body: CheckConflictsInput }>(
    '/check-conflicts',
    {
      preHandler: preHandlers,
      schema: {
        description: 'Check for scheduling conflicts before booking',
        tags: ['bookings'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['coachId', 'playerId', 'startTime', 'endTime'],
          properties: {
            coachId: { type: 'string', format: 'uuid' },
            playerId: { type: 'string', format: 'uuid' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            excludeBookingId: { type: 'string', format: 'uuid' },
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
                  hasConflicts: { type: 'boolean' },
                  conflicts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['coach_busy', 'player_busy', 'capacity_full'],
                        },
                        message: { type: 'string' },
                      },
                    },
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
      request: FastifyRequest<{ Body: CheckConflictsInput }>,
      reply: FastifyReply
    ) => {
      const input = validate(checkConflictsSchema, request.body);
      const result = await bookingService.checkConflicts(
        request.tenant!.id,
        input
      );
      return reply.send({ success: true, data: result });
    }
  );
}
