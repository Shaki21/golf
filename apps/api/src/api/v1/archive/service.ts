import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../../core/db/prisma';
import { AppError } from '../../../core/errors';

const prisma = getPrismaClient();

export interface ArchiveItemInput {
  entityType: string;
  entityId: string;
  entityData: Record<string, unknown>;
  reason?: string;
}

export class ArchiveService {
  async listArchived(userId: string, entityType?: string) {
    const where: Prisma.ArchivedItemWhereInput = { userId };

    if (entityType) {
      where.entityType = entityType;
    }

    return prisma.archivedItem.findMany({
      where,
      orderBy: {
        archivedAt: 'desc'
      }
    });
  }

  async getArchivedById(archiveId: string, userId: string) {
    const archivedItem = await prisma.archivedItem.findUnique({
      where: { id: archiveId }
    });

    if (!archivedItem) {
      throw new AppError('validation_error', 'Archived item not found', 404, { archiveId });
    }

    if (archivedItem.userId !== userId) {
      throw new AppError('authorization_error', 'You do not have permission to access this archived item', 403);
    }

    return archivedItem;
  }

  async archiveItem(userId: string, input: ArchiveItemInput) {
    // Check if already archived
    const existing = await prisma.archivedItem.findUnique({
      where: {
        entityType_entityId: {
          entityType: input.entityType,
          entityId: input.entityId
        }
      }
    });

    if (existing) {
      throw new AppError('validation_error', 'Item is already archived', 409, {
        entityType: input.entityType,
        entityId: input.entityId
      });
    }

    return prisma.archivedItem.create({
      data: {
        userId,
        entityType: input.entityType,
        entityId: input.entityId,
        entityData: input.entityData,
        archivedAt: new Date(),
        reason: input.reason
      }
    });
  }

  async restoreItem(archiveId: string, userId: string) {
    // Verify ownership
    const archivedItem = await this.getArchivedById(archiveId, userId);

    // Delete the archive record (restoration is handled by caller)
    await prisma.archivedItem.delete({
      where: { id: archiveId }
    });

    // Return the entity data for restoration
    return {
      success: true,
      entityType: archivedItem.entityType,
      entityId: archivedItem.entityId,
      entityData: archivedItem.entityData
    };
  }

  async deleteArchived(archiveId: string, userId: string) {
    // Verify ownership
    await this.getArchivedById(archiveId, userId);

    // Permanently delete
    await prisma.archivedItem.delete({
      where: { id: archiveId }
    });

    return { success: true };
  }

  async getArchivesByType(userId: string, entityType: string) {
    return this.listArchived(userId, entityType);
  }

  async getArchiveCount(userId: string) {
    const total = await prisma.archivedItem.count({
      where: { userId }
    });

    const byType = await prisma.archivedItem.groupBy({
      by: ['entityType'],
      where: { userId },
      _count: {
        entityType: true
      }
    });

    return {
      total,
      byType: byType.map(item => ({
        type: item.entityType,
        count: item._count.entityType
      }))
    };
  }

  async bulkDelete(userId: string, archiveIds: string[]) {
    // Verify all items belong to user
    const items = await prisma.archivedItem.findMany({
      where: {
        id: { in: archiveIds },
        userId
      }
    });

    if (items.length !== archiveIds.length) {
      throw new AppError('authorization_error', 'Some items do not belong to you or do not exist', 403);
    }

    // Delete all
    const result = await prisma.archivedItem.deleteMany({
      where: {
        id: { in: archiveIds },
        userId
      }
    });

    return {
      success: true,
      deletedCount: result.count
    };
  }
}
