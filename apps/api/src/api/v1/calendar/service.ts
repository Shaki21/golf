import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError } from '../../../middleware/errors';
import {
  CalendarEventsQuery,
  MonthViewParams,
  WeekViewParams,
  DayViewParams,
} from './schema';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  status: string;
  maxParticipants: number | null;
  currentCount: number;
  coach?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  participants: Array<{
    id: string;
    status: string;
    player: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  bookings: Array<{
    id: string;
    status: string;
    playerId: string;
  }>;
}

export class CalendarService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get calendar events with filters
   */
  async getCalendarEvents(
    tenantId: string,
    query: CalendarEventsQuery
  ): Promise<CalendarEvent[]> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (startDate >= endDate) {
      throw new BadRequestError('End date must be after start date');
    }

    const where: Prisma.CalendarEventWhereInput = {
      tenantId,
      startTime: { gte: startDate },
      endTime: { lte: endDate },
    };

    if (query.eventTypes && query.eventTypes.length > 0) {
      where.eventType = { in: query.eventTypes };
    }

    if (query.coachId) {
      where.coachId = query.coachId;
    }

    if (query.status) {
      where.status = query.status;
    }

    // Filter by player if specified
    if (query.playerId) {
      where.participants = {
        some: {
          playerId: query.playerId,
        },
      };
    }

    const events = await this.prisma.event.findMany({
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
        participants: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            playerId: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return events as CalendarEvent[];
  }

  /**
   * Get events for a specific month
   */
  async getMonthEvents(
    tenantId: string,
    params: MonthViewParams,
    filters?: Partial<CalendarEventsQuery>
  ): Promise<CalendarEvent[]> {
    // Calculate first and last day of the month
    const startDate = new Date(params.year, params.month - 1, 1);
    const endDate = new Date(params.year, params.month, 0, 23, 59, 59, 999);

    return this.getCalendarEvents(tenantId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...filters,
    });
  }

  /**
   * Get events for a specific week (ISO week)
   */
  async getWeekEvents(
    tenantId: string,
    params: WeekViewParams,
    filters?: Partial<CalendarEventsQuery>
  ): Promise<CalendarEvent[]> {
    // Calculate start and end of ISO week
    const startDate = this.getStartOfISOWeek(params.year, params.week);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return this.getCalendarEvents(tenantId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...filters,
    });
  }

  /**
   * Get events for a specific day
   */
  async getDayEvents(
    tenantId: string,
    params: DayViewParams,
    filters?: Partial<CalendarEventsQuery>
  ): Promise<CalendarEvent[]> {
    const date = new Date(params.date);
    const startDate = new Date(date.setHours(0, 0, 0, 0));
    const endDate = new Date(date.setHours(23, 59, 59, 999));

    return this.getCalendarEvents(tenantId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...filters,
    });
  }

  /**
   * Get summary statistics for a date range
   * Uses database-level aggregation for efficiency
   */
  async getCalendarSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalParticipants: number;
  }> {
    const whereClause = {
      tenantId,
      startTime: { gte: startDate },
      endTime: { lte: endDate },
    };

    // Run all aggregations in parallel
    const [totalEvents, groupByType, groupByStatus, participantCount] = await Promise.all([
      // Total event count
      this.prisma.event.count({ where: whereClause }),

      // Group by event type
      this.prisma.event.groupBy({
        by: ['eventType'],
        where: whereClause,
        _count: { id: true },
      }),

      // Group by status
      this.prisma.event.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),

      // Count participants for events in this range
      this.prisma.eventParticipant.count({
        where: {
          event: whereClause,
        },
      }),
    ]);

    // Transform groupBy results to Record format
    const byType: Record<string, number> = {};
    groupByType.forEach((g) => {
      byType[g.eventType] = g._count.id;
    });

    const byStatus: Record<string, number> = {};
    groupByStatus.forEach((g) => {
      byStatus[g.status] = g._count.id;
    });

    return {
      totalEvents,
      byType,
      byStatus,
      totalParticipants: participantCount,
    };
  }

  /**
   * Helper: Get start of ISO week
   */
  private getStartOfISOWeek(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const isoWeekStart = simple;

    if (dayOfWeek <= 4) {
      isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    return isoWeekStart;
  }
}
