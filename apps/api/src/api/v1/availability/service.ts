import { PrismaClient, Prisma } from '@prisma/client';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../../middleware/errors';
import {
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  ListAvailabilityQuery,
  GetAvailableSlotsQuery,
} from './schema';

/**
 * Availability with coach relation
 */
type AvailabilityWithCoach = Prisma.AvailabilityGetPayload<{
  include: {
    coach: { select: { id: true; firstName: true; lastName: true; email: true } };
  };
}>;

/**
 * Availability with coach and booking count
 */
type AvailabilityWithCoachAndCount = Prisma.AvailabilityGetPayload<{
  include: {
    coach: { select: { id: true; firstName: true; lastName: true; email: true } };
    _count: { select: { bookings: true } };
  };
}>;

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  availabilityId: string;
  remainingCapacity: number;
}

export class AvailabilityService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new availability slot
   */
  async createAvailability(
    tenantId: string,
    input: CreateAvailabilityInput
  ): Promise<AvailabilityWithCoach> {
    // Verify coach exists and belongs to tenant
    const coach = await this.prisma.coach.findFirst({
      where: { id: input.coachId, tenantId },
    });

    if (!coach) {
      throw new BadRequestError('Coach not found');
    }

    // Validate time range
    if (input.startTime >= input.endTime) {
      throw new BadRequestError('End time must be after start time');
    }

    // Check for overlapping availability for the same coach
    const overlapping = await this.prisma.availability.findFirst({
      where: {
        coachId: input.coachId,
        dayOfWeek: input.dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: input.startTime } },
              { endTime: { gt: input.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: input.endTime } },
              { endTime: { gte: input.endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictError(
        'This time slot overlaps with an existing availability'
      );
    }

    const availability = await this.prisma.availability.create({
      data: {
        coachId: input.coachId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        slotDuration: input.slotDuration,
        maxBookings: input.maxBookings,
        sessionType: input.sessionType,
        validFrom: new Date(input.validFrom),
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
      },
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
    });

    return availability;
  }

  /**
   * List availability slots
   */
  async listAvailability(
    tenantId: string,
    query: ListAvailabilityQuery
  ): Promise<AvailabilityWithCoachAndCount[]> {
    const where: Prisma.AvailabilityWhereInput = {
      coach: {
        tenantId,
      },
    };

    if (query.coachId) {
      where.coachId = query.coachId;
    }

    if (query.dayOfWeek !== undefined) {
      where.dayOfWeek = query.dayOfWeek;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Filter by date range if provided
    if (query.startDate) {
      where.validFrom = { lte: new Date(query.endDate || query.startDate) };
    }

    if (query.endDate) {
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: new Date(query.startDate || query.endDate) } },
      ];
    }

    const availabilities = await this.prisma.availability.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return availabilities;
  }

  /**
   * Get availability by ID
   */
  async getAvailabilityById(
    tenantId: string,
    availabilityId: string
  ): Promise<AvailabilityWithCoachAndCount> {
    const availability = await this.prisma.availability.findFirst({
      where: {
        id: availabilityId,
        coach: {
          tenantId,
        },
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!availability) {
      throw new NotFoundError('Availability slot not found');
    }

    return availability;
  }

  /**
   * Update availability slot
   */
  async updateAvailability(
    tenantId: string,
    availabilityId: string,
    input: UpdateAvailabilityInput
  ): Promise<AvailabilityWithCoach> {
    // Verify availability exists (will throw if not found)
    await this.getAvailabilityById(tenantId, availabilityId);

    // Validate time range if both times provided
    if (input.startTime && input.endTime) {
      if (input.startTime >= input.endTime) {
        throw new BadRequestError('End time must be after start time');
      }
    }

    const updateData: Prisma.AvailabilityUpdateInput = {};

    if (input.dayOfWeek !== undefined) updateData.dayOfWeek = input.dayOfWeek;
    if (input.startTime) updateData.startTime = input.startTime;
    if (input.endTime) updateData.endTime = input.endTime;
    if (input.slotDuration) updateData.slotDuration = input.slotDuration;
    if (input.maxBookings) updateData.maxBookings = input.maxBookings;
    if (input.sessionType !== undefined)
      updateData.sessionType = input.sessionType;
    if (input.validFrom) updateData.validFrom = new Date(input.validFrom);
    if (input.validUntil !== undefined) {
      updateData.validUntil = input.validUntil
        ? new Date(input.validUntil)
        : null;
    }

    const updated = await this.prisma.availability.update({
      where: { id: availabilityId },
      data: updateData,
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
    });

    return updated;
  }

  /**
   * Delete availability slot
   */
  async deleteAvailability(
    tenantId: string,
    availabilityId: string
  ): Promise<void> {
    await this.getAvailabilityById(tenantId, availabilityId);

    // Check if there are future bookings
    const futureBookings = await this.prisma.booking.count({
      where: {
        availabilityId,
        status: { notIn: ['cancelled'] },
        event: {
          startTime: { gte: new Date() },
        },
      },
    });

    if (futureBookings > 0) {
      throw new ConflictError(
        `Cannot delete availability with ${futureBookings} future bookings. Cancel or reschedule bookings first.`
      );
    }

    await this.prisma.availability.delete({
      where: { id: availabilityId },
    });
  }

  /**
   * Get available time slots for booking
   */
  async getAvailableSlots(
    tenantId: string,
    query: GetAvailableSlotsQuery
  ): Promise<AvailableSlot[]> {
    // Verify coach exists
    const coach = await this.prisma.coach.findFirst({
      where: { id: query.coachId, tenantId },
    });

    if (!coach) {
      throw new BadRequestError('Coach not found');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (startDate >= endDate) {
      throw new BadRequestError('End date must be after start date');
    }

    // Get all availability slots for this coach
    const availabilities = await this.prisma.availability.findMany({
      where: {
        coachId: query.coachId,
        isActive: true,
        validFrom: { lte: endDate },
        OR: [{ validUntil: null }, { validUntil: { gte: startDate } }],
        ...(query.sessionType && { sessionType: query.sessionType }),
      },
      include: {
        bookings: {
          where: {
            status: { notIn: ['cancelled'] },
            event: {
              startTime: { gte: startDate },
              endTime: { lte: endDate },
            },
          },
          include: {
            event: true,
          },
        },
      },
    });

    const slots: AvailableSlot[] = [];

    // Generate slots for each day in the date range
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();

      // Find availability for this day of week
      const dayAvailability = availabilities.filter(
        (a) => a.dayOfWeek === dayOfWeek
      );

      for (const avail of dayAvailability) {
        const slotDate = new Date(date);
        const validFrom = new Date(avail.validFrom);
        const validUntil = avail.validUntil
          ? new Date(avail.validUntil)
          : null;

        // Check if this date is within validity period
        if (slotDate < validFrom) continue;
        if (validUntil && slotDate > validUntil) continue;

        // Count existing bookings for this day
        const bookingsCount = avail.bookings.filter((b) => {
          const eventDate = new Date(b.event.startTime);
          return eventDate.toDateString() === slotDate.toDateString();
        }).length;

        const remainingCapacity = avail.maxBookings - bookingsCount;

        if (remainingCapacity > 0) {
          slots.push({
            date: slotDate.toISOString().split('T')[0],
            startTime: avail.startTime,
            endTime: avail.endTime,
            availabilityId: avail.id,
            remainingCapacity,
          });
        }
      }
    }

    return slots.sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    });
  }
}
