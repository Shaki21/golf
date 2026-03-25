import { PrismaClient, Prisma, Booking, Event } from '@prisma/client';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../../middleware/errors';
import {
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  CheckConflictsInput,
  ListBookingsQuery,
} from './schema';

export interface ConflictDetails {
  hasConflicts: boolean;
  conflicts: Array<{
    type: 'coach_busy' | 'player_busy' | 'capacity_full';
    message: string;
    event?: Partial<Event>;
  }>;
}

/** Booking with related event data */
type BookingWithEvent = Booking & { event: Event };

export interface BookingListResponse {
  bookings: BookingWithEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class BookingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(
    tenantId: string,
    input: CheckConflictsInput
  ): Promise<ConflictDetails> {
    const conflicts: ConflictDetails['conflicts'] = [];
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    // Validate time range
    if (startTime >= endTime) {
      throw new BadRequestError('End time must be after start time');
    }

    // Check coach exists and belongs to tenant
    const coach = await this.prisma.coach.findFirst({
      where: { id: input.coachId, tenantId },
    });

    if (!coach) {
      throw new BadRequestError('Coach not found');
    }

    // Check player exists and belongs to tenant
    const player = await this.prisma.player.findFirst({
      where: { id: input.playerId, tenantId },
    });

    if (!player) {
      throw new BadRequestError('Player not found');
    }

    // Check for overlapping events for the coach
    const coachEvents = await this.prisma.event.findMany({
      where: {
        tenantId,
        coachId: input.coachId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        status: { notIn: ['cancelled'] },
        ...(input.excludeBookingId && {
          bookings: {
            none: {
              id: input.excludeBookingId,
            },
          },
        }),
      },
      include: {
        participants: {
          include: {
            player: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (coachEvents.length > 0) {
      conflicts.push({
        type: 'coach_busy',
        message: `Coach ${coach.firstName} ${coach.lastName} has ${coachEvents.length} overlapping session(s)`,
        event: coachEvents[0],
      });
    }

    // Check for overlapping events for the player
    const playerEvents = await this.prisma.eventParticipant.findMany({
      where: {
        playerId: input.playerId,
        event: {
          tenantId,
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          status: { notIn: ['cancelled'] },
        },
        ...(input.excludeBookingId && {
          event: {
            bookings: {
              none: {
                id: input.excludeBookingId,
              },
            },
          },
        }),
      },
      include: {
        event: {
          include: {
            coach: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (playerEvents.length > 0) {
      conflicts.push({
        type: 'player_busy',
        message: `${player.firstName} ${player.lastName} has ${playerEvents.length} overlapping session(s)`,
        event: playerEvents[0].event,
      });
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Create a new booking
   */
  async createBooking(
    tenantId: string,
    userId: string,
    input: CreateBookingInput
  ): Promise<BookingWithEvent> {
    // Check for conflicts
    const conflictCheck = await this.checkConflicts(tenantId, {
      coachId: input.coachId,
      playerId: input.playerId,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    if (conflictCheck.hasConflicts) {
      throw new ConflictError(
        `Booking conflicts detected: ${conflictCheck.conflicts.map((c) => c.message).join(', ')}`
      );
    }

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    // If eventId provided, use existing event
    if (input.eventId) {
      const existingEvent = await this.prisma.event.findFirst({
        where: {
          id: input.eventId,
          tenantId,
        },
      });

      if (!existingEvent) {
        throw new NotFoundError('Event not found');
      }

      // Create booking for existing event
      const booking = await this.prisma.booking.create({
        data: {
          eventId: input.eventId,
          playerId: input.playerId,
          availabilityId: input.availabilityId,
          bookedBy: userId,
          bookingType: 'player_request',
          status: 'pending',
          paymentAmount: input.paymentAmount,
          notes: input.notes,
        },
        include: {
          event: {
            include: {
              coach: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Add player to event participants
      await this.prisma.eventParticipant.create({
        data: {
          eventId: input.eventId,
          playerId: input.playerId,
          status: 'confirmed',
        },
      });

      return booking;
    }

    // Create new event and booking
    const result = await this.prisma.$transaction(async (tx) => {
      // Create event
      const event = await tx.event.create({
        data: {
          tenantId,
          title:
            input.title ||
            `Training Session - ${input.sessionType}`,
          eventType: 'individual_training',
          startTime,
          endTime,
          location: input.location,
          coachId: input.coachId,
          maxParticipants: 1,
          currentCount: 1,
          status: 'scheduled',
          metadata: {
            sessionType: input.sessionType,
          },
        },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          eventId: event.id,
          playerId: input.playerId,
          availabilityId: input.availabilityId,
          bookedBy: userId,
          bookingType: 'player_request',
          status: 'pending',
          paymentAmount: input.paymentAmount,
          notes: input.notes,
        },
      });

      // Create event participant
      await tx.eventParticipant.create({
        data: {
          eventId: event.id,
          playerId: input.playerId,
          status: 'confirmed',
        },
      });

      // Fetch complete booking with relations
      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          event: {
            include: {
              coach: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          availability: true,
        },
      });
    });

    if (!result) {
      throw new Error('Failed to create booking');
    }

    return result as BookingWithEvent;
  }

  /**
   * List bookings with filters and pagination
   */
  async listBookings(
    tenantId: string,
    query: ListBookingsQuery
  ): Promise<BookingListResponse> {
    // Build event filter separately to avoid type inference issues
    const eventWhere: Prisma.EventWhereInput = { tenantId };

    if (query.coachId) {
      eventWhere.coachId = query.coachId;
    }

    if (query.startDate) {
      eventWhere.startTime = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      eventWhere.endTime = { lte: new Date(query.endDate) };
    }

    if (query.sessionType) {
      eventWhere.metadata = {
        path: ['sessionType'],
        equals: query.sessionType,
      };
    }

    const where: Prisma.BookingWhereInput = {
      event: eventWhere,
    };

    if (query.playerId) {
      where.playerId = query.playerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        include: {
          event: {
            include: {
              coach: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              category: true,
            },
          },
          availability: true,
        },
        orderBy:
          query.sortBy === 'bookedAt'
            ? { bookedAt: query.sortOrder }
            : query.sortBy === 'status'
              ? { status: query.sortOrder }
              : { event: { startTime: query.sortOrder } },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return {
      bookings,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Get booking by ID
   */
  async getBookingById(tenantId: string, bookingId: string): Promise<BookingWithEvent> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        event: {
          tenantId,
        },
      },
      include: {
        event: {
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            category: true,
          },
        },
        availability: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  /**
   * Update booking
   */
  async updateBooking(
    tenantId: string,
    bookingId: string,
    input: UpdateBookingInput
  ): Promise<BookingWithEvent> {
    const existing = await this.getBookingById(tenantId, bookingId);

    if (existing.status === 'cancelled') {
      throw new BadRequestError('Cannot update a cancelled booking');
    }

    // If updating time, check for conflicts
    if (input.startTime || input.endTime) {
      const newStartTime = input.startTime
        ? new Date(input.startTime)
        : existing.event.startTime;
      const newEndTime = input.endTime
        ? new Date(input.endTime)
        : existing.event.endTime;

      const conflictCheck = await this.checkConflicts(tenantId, {
        coachId: existing.event.coachId!,
        playerId: existing.playerId,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        excludeBookingId: bookingId,
      });

      if (conflictCheck.hasConflicts) {
        throw new ConflictError(
          `Booking conflicts detected: ${conflictCheck.conflicts.map((c) => c.message).join(', ')}`
        );
      }

      // Update event time
      await this.prisma.event.update({
        where: { id: existing.eventId },
        data: {
          startTime: newStartTime,
          endTime: newEndTime,
          ...(input.location && { location: input.location }),
        },
      });
    }

    // Update booking
    const updateData: Prisma.BookingUpdateInput = {};
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.paymentStatus) updateData.paymentStatus = input.paymentStatus;
    if (input.paymentAmount !== undefined)
      updateData.paymentAmount = input.paymentAmount;

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        event: {
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            category: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Confirm booking
   */
  async confirmBooking(tenantId: string, bookingId: string): Promise<BookingWithEvent> {
    const booking = await this.getBookingById(tenantId, bookingId);

    if (booking.status === 'confirmed') {
      throw new BadRequestError('Booking is already confirmed');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestError('Cannot confirm a cancelled booking');
    }

    const confirmed = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
      include: {
        event: {
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update event status
    await this.prisma.event.update({
      where: { id: booking.eventId },
      data: { status: 'confirmed' },
    });

    return confirmed;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    tenantId: string,
    bookingId: string,
    input: CancelBookingInput
  ): Promise<BookingWithEvent> {
    const booking = await this.getBookingById(tenantId, bookingId);

    if (booking.status === 'cancelled') {
      throw new BadRequestError('Booking is already cancelled');
    }

    const cancelled = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: input.reason,
      },
      include: {
        event: {
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update event status
    await this.prisma.event.update({
      where: { id: booking.eventId },
      data: { status: 'cancelled' },
    });

    return cancelled;
  }
}
