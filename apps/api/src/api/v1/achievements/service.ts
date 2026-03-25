import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../../core/db/prisma';
import { AppError } from '../../../core/errors';

const prisma = getPrismaClient();

export interface UnlockAchievementInput {
  code: string;
  title: string;
  description: string;
  category: string;
  tier?: string;
  icon: string;
  pointsValue?: number;
  context?: Record<string, unknown>;
}

export class AchievementsService {
  async listAchievements(userId: string, category?: string) {
    const where: Prisma.UserAchievementWhereInput = { userId };

    if (category) {
      where.category = category;
    }

    return prisma.userAchievement.findMany({
      where,
      orderBy: [
        { earnedAt: 'desc' } // Most recent first
      ]
    });
  }

  async getAchievementById(achievementId: string, userId: string) {
    const achievement = await prisma.userAchievement.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) {
      throw new AppError('validation_error', 'Achievement not found', 404, { achievementId });
    }

    if (achievement.userId !== userId) {
      throw new AppError('authorization_error', 'You do not have permission to access this achievement', 403);
    }

    return achievement;
  }

  async unlockAchievement(userId: string, input: UnlockAchievementInput) {
    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_code: {
          userId,
          code: input.code
        }
      }
    });

    if (existing) {
      throw new AppError('validation_error', 'Achievement already unlocked', 409, { code: input.code });
    }

    return prisma.userAchievement.create({
      data: {
        userId,
        code: input.code,
        title: input.title,
        description: input.description,
        category: input.category,
        tier: input.tier || 'bronze',
        icon: input.icon,
        pointsValue: input.pointsValue || 0,
        earnedAt: new Date(),
        context: input.context || {},
        isNew: true
      }
    });
  }

  async markAsViewed(achievementId: string, userId: string) {
    // Verify ownership
    await this.getAchievementById(achievementId, userId);

    return prisma.userAchievement.update({
      where: { id: achievementId },
      data: {
        isNew: false,
        viewedAt: new Date()
      }
    });
  }

  async markAllAsViewed(userId: string) {
    const result = await prisma.userAchievement.updateMany({
      where: {
        userId,
        isNew: true
      },
      data: {
        isNew: false,
        viewedAt: new Date()
      }
    });

    return {
      success: true,
      updatedCount: result.count
    };
  }

  async getNewAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: {
        userId,
        isNew: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });
  }

  async getAchievementsByCategory(userId: string, category: string) {
    return this.listAchievements(userId, category);
  }

  async getAchievementStats(userId: string) {
    const total = await prisma.userAchievement.count({
      where: { userId }
    });

    const newCount = await prisma.userAchievement.count({
      where: {
        userId,
        isNew: true
      }
    });

    const totalPoints = await prisma.userAchievement.aggregate({
      where: { userId },
      _sum: {
        pointsValue: true
      }
    });

    const byCategory = await prisma.userAchievement.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        category: true
      }
    });

    const byTier = await prisma.userAchievement.groupBy({
      by: ['tier'],
      where: { userId },
      _count: {
        tier: true
      }
    });

    return {
      total,
      newCount,
      totalPoints: totalPoints._sum.pointsValue || 0,
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.category
      })),
      byTier: byTier.map(item => ({
        tier: item.tier,
        count: item._count.tier
      }))
    };
  }

  async getRecentAchievements(userId: string, limit: number = 5) {
    return prisma.userAchievement.findMany({
      where: { userId },
      orderBy: {
        earnedAt: 'desc'
      },
      take: limit
    });
  }

  async deleteAchievement(achievementId: string, userId: string) {
    // Verify ownership
    await this.getAchievementById(achievementId, userId);

    await prisma.userAchievement.delete({
      where: { id: achievementId }
    });

    return { success: true };
  }
}
