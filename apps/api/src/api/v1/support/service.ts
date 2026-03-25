import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';

export interface CreateSupportCaseInput {
  title: string;
  description?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
}

export interface UpdateSupportCaseInput {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  resolution?: string;
}

export interface ListSupportCasesQuery {
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export class SupportService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new support case
   */
  async createCase(tenantId: string | null, reportedById: string | null, input: CreateSupportCaseInput) {
    const supportCase = await this.prisma.supportCase.create({
      data: {
        tenantId,
        title: input.title,
        description: input.description,
        priority: input.priority || 'normal',
        category: input.category,
        reportedById,
        status: 'open',
      },
    });

    return supportCase;
  }

  /**
   * List support cases with filters
   */
  async listCases(query: ListSupportCasesQuery = {}) {
    const { status, priority, category, page = 1, limit = 20 } = query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const [cases, total] = await Promise.all([
      this.prisma.supportCase.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.supportCase.count({ where }),
    ]);

    return {
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific support case
   */
  async getCase(caseId: string) {
    const supportCase = await this.prisma.supportCase.findUnique({
      where: { id: caseId },
    });

    if (!supportCase) {
      throw new NotFoundError('Support case not found');
    }

    return supportCase;
  }

  /**
   * Update a support case
   */
  async updateCase(caseId: string, input: UpdateSupportCaseInput) {
    const existing = await this.getCase(caseId);

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.resolution !== undefined) updateData.resolution = input.resolution;

    // Auto-set closedAt when status is closed or resolved
    if (input.status === 'closed' || input.status === 'resolved') {
      updateData.closedAt = new Date();
    }

    const supportCase = await this.prisma.supportCase.update({
      where: { id: caseId },
      data: updateData,
    });

    return supportCase;
  }

  /**
   * Delete a support case
   */
  async deleteCase(caseId: string) {
    await this.getCase(caseId);

    await this.prisma.supportCase.delete({
      where: { id: caseId },
    });
  }

  /**
   * Get support case statistics
   */
  async getStats() {
    const [
      totalOpen,
      totalInProgress,
      totalResolved,
      totalClosed,
      urgentCount,
      highPriorityCount,
    ] = await Promise.all([
      this.prisma.supportCase.count({ where: { status: 'open' } }),
      this.prisma.supportCase.count({ where: { status: 'in_progress' } }),
      this.prisma.supportCase.count({ where: { status: 'resolved' } }),
      this.prisma.supportCase.count({ where: { status: 'closed' } }),
      this.prisma.supportCase.count({ where: { priority: 'urgent', status: { not: 'closed' } } }),
      this.prisma.supportCase.count({ where: { priority: 'high', status: { not: 'closed' } } }),
    ]);

    return {
      byStatus: {
        open: totalOpen,
        inProgress: totalInProgress,
        resolved: totalResolved,
        closed: totalClosed,
      },
      urgent: urgentCount,
      highPriority: highPriorityCount,
      total: totalOpen + totalInProgress + totalResolved + totalClosed,
    };
  }
}
