import { PrismaClient } from '@prisma/client';

export interface CreateAuditEventInput {
  action: string;
  resourceType: string;
  resourceId: string;
  subjectId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ListAuditEventsQuery {
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create an audit event
   */
  async createEvent(tenantId: string, actorId: string, input: CreateAuditEventInput) {
    const event = await this.prisma.auditEvent.create({
      data: {
        tenantId,
        actorId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        subjectId: input.subjectId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
    });

    return event;
  }

  /**
   * List audit events with filters
   */
  async listEvents(tenantId: string, query: ListAuditEventsQuery = {}) {
    const { action, resourceType, resourceId, actorId, startDate, endDate, page = 1, limit = 50 } = query;

    const where: any = { tenantId };

    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (actorId) where.actorId = actorId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [events, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditEvent.count({ where }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit events for a specific resource
   */
  async getResourceHistory(tenantId: string, resourceType: string, resourceId: string) {
    const events = await this.prisma.auditEvent.findMany({
      where: {
        tenantId,
        resourceType,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return events;
  }

  /**
   * Get audit events for a specific actor (user)
   */
  async getActorHistory(tenantId: string, actorId: string, options: { limit?: number } = {}) {
    const events = await this.prisma.auditEvent.findMany({
      where: {
        tenantId,
        actorId,
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 100,
    });

    return events;
  }

  /**
   * Get audit event statistics for dashboard
   */
  async getStats(tenantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get event counts by action
    const actionCounts = await this.prisma.auditEvent.groupBy({
      by: ['action'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    });

    // Get event counts by resource type
    const resourceTypeCounts = await this.prisma.auditEvent.groupBy({
      by: ['resourceType'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      _count: { resourceType: true },
      orderBy: { _count: { resourceType: 'desc' } },
      take: 10,
    });

    // Get most active users
    const activeActors = await this.prisma.auditEvent.groupBy({
      by: ['actorId'],
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
      _count: { actorId: true },
      orderBy: { _count: { actorId: 'desc' } },
      take: 10,
    });

    // Get actor details
    const actorIds = activeActors.map((a) => a.actorId);
    const actors = await this.prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const actorMap = new Map(actors.map((a) => [a.id, a]));

    // Get total count
    const totalEvents = await this.prisma.auditEvent.count({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
    });

    // Get daily counts for chart
    const dailyCounts = await this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM audit_events
      WHERE tenant_id = ${tenantId}::uuid
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return {
      totalEvents,
      periodDays: days,
      byAction: actionCounts.map((a) => ({ action: a.action, count: a._count.action })),
      byResourceType: resourceTypeCounts.map((r) => ({ resourceType: r.resourceType, count: r._count.resourceType })),
      topActors: activeActors.map((a) => ({
        actor: actorMap.get(a.actorId),
        count: a._count.actorId,
      })),
      dailyTrend: dailyCounts.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        count: Number(d.count),
      })),
    };
  }

  /**
   * Search audit events
   */
  async searchEvents(tenantId: string, searchTerm: string, options: { limit?: number } = {}) {
    // Search in action, resourceType, and metadata
    const events = await this.prisma.auditEvent.findMany({
      where: {
        tenantId,
        OR: [
          { action: { contains: searchTerm, mode: 'insensitive' } },
          { resourceType: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return events;
  }
}
