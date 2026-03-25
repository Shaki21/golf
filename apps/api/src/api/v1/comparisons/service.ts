/**
 * Video Comparison Service
 * Business logic for side-by-side video comparisons
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { storageService } from '../../../services/storage.service';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../middleware/errors';
import {
  CreateComparisonInput,
  UpdateComparisonInput,
  ListComparisonsInput,
} from './schema';

export class ComparisonService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new video comparison
   */
  async createComparison(
    input: CreateComparisonInput,
    userId: string,
    tenantId: string
  ): Promise<{
    id: string;
    title: string | null;
    syncPoint1: number;
    syncPoint2: number;
    createdAt: Date;
    primaryVideo: { id: string; title: string };
    comparisonVideo: { id: string; title: string };
  }> {
    // Verify both videos exist and belong to tenant
    const [primaryVideo, comparisonVideo] = await Promise.all([
      this.prisma.video.findFirst({
        where: {
          id: input.primaryVideoId,
          tenantId,
          deletedAt: null,
          status: 'ready',
        },
      }),
      this.prisma.video.findFirst({
        where: {
          id: input.comparisonVideoId,
          tenantId,
          deletedAt: null,
          status: 'ready',
        },
      }),
    ]);

    if (!primaryVideo) {
      throw new NotFoundError('Primary video not found or not ready');
    }

    if (!comparisonVideo) {
      throw new NotFoundError('Comparison video not found or not ready');
    }

    if (primaryVideo.id === comparisonVideo.id) {
      throw new BadRequestError('Cannot compare a video with itself');
    }

    // Create comparison
    const comparison = await this.prisma.videoComparison.create({
      data: {
        tenantId,
        createdById: userId,
        primaryVideoId: input.primaryVideoId,
        comparisonVideoId: input.comparisonVideoId,
        title: input.title,
        notes: input.notes,
        syncPoint1: new Prisma.Decimal(input.syncPoint1),
        syncPoint2: new Prisma.Decimal(input.syncPoint2),
      },
      include: {
        primaryVideo: { select: { id: true, title: true } },
        comparisonVideo: { select: { id: true, title: true } },
      },
    });

    return {
      id: comparison.id,
      title: comparison.title,
      syncPoint1: parseFloat(comparison.syncPoint1.toString()),
      syncPoint2: parseFloat(comparison.syncPoint2.toString()),
      createdAt: comparison.createdAt,
      primaryVideo: comparison.primaryVideo,
      comparisonVideo: comparison.comparisonVideo,
    };
  }

  /**
   * Get comparison by ID
   */
  async getComparison(
    comparisonId: string,
    tenantId: string
  ): Promise<{
    id: string;
    title: string | null;
    notes: string | null;
    syncPoint1: number;
    syncPoint2: number;
    createdAt: Date;
    createdBy: { id: string; firstName: string; lastName: string };
    primaryVideo: {
      id: string;
      title: string;
      duration: number;
      category: string | null;
      playerId: string;
    };
    comparisonVideo: {
      id: string;
      title: string;
      duration: number;
      category: string | null;
      playerId: string;
    };
    playbackUrls: {
      primaryVideoUrl: string;
      comparisonVideoUrl: string;
      expiresAt: Date;
    };
  }> {
    const comparison = await this.prisma.videoComparison.findFirst({
      where: {
        id: comparisonId,
        tenantId,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        primaryVideo: {
          select: {
            id: true,
            title: true,
            duration: true,
            category: true,
            playerId: true,
            s3Key: true,
          },
        },
        comparisonVideo: {
          select: {
            id: true,
            title: true,
            duration: true,
            category: true,
            playerId: true,
            s3Key: true,
          },
        },
      },
    });

    if (!comparison) {
      throw new NotFoundError('Comparison not found');
    }

    // Generate playback URLs for both videos
    const expiresIn = 3600; // 1 hour
    const [primaryVideoUrl, comparisonVideoUrl] = await Promise.all([
      storageService.getSignedPlaybackUrl(comparison.primaryVideo.s3Key, tenantId, expiresIn),
      storageService.getSignedPlaybackUrl(comparison.comparisonVideo.s3Key, tenantId, expiresIn),
    ]);

    return {
      id: comparison.id,
      title: comparison.title,
      notes: comparison.notes,
      syncPoint1: parseFloat(comparison.syncPoint1.toString()),
      syncPoint2: parseFloat(comparison.syncPoint2.toString()),
      createdAt: comparison.createdAt,
      createdBy: comparison.createdBy,
      primaryVideo: {
        id: comparison.primaryVideo.id,
        title: comparison.primaryVideo.title,
        duration: comparison.primaryVideo.duration,
        category: comparison.primaryVideo.category,
        playerId: comparison.primaryVideo.playerId,
      },
      comparisonVideo: {
        id: comparison.comparisonVideo.id,
        title: comparison.comparisonVideo.title,
        duration: comparison.comparisonVideo.duration,
        category: comparison.comparisonVideo.category,
        playerId: comparison.comparisonVideo.playerId,
      },
      playbackUrls: {
        primaryVideoUrl,
        comparisonVideoUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    };
  }

  /**
   * List comparisons
   */
  async listComparisons(
    input: ListComparisonsInput,
    tenantId: string
  ): Promise<{
    comparisons: Array<{
      id: string;
      title: string | null;
      syncPoint1: number;
      syncPoint2: number;
      createdAt: Date;
      primaryVideo: { id: string; title: string; category: string | null };
      comparisonVideo: { id: string; title: string; category: string | null };
      createdBy: { id: string; firstName: string; lastName: string };
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    // Build where clause
    const where: Prisma.VideoComparisonWhereInput = {
      tenantId,
    };

    // Filter by video (either primary or comparison)
    if (input.videoId) {
      where.OR = [{ primaryVideoId: input.videoId }, { comparisonVideoId: input.videoId }];
    }

    const [comparisons, total] = await Promise.all([
      this.prisma.videoComparison.findMany({
        where,
        include: {
          primaryVideo: { select: { id: true, title: true, category: true } },
          comparisonVideo: { select: { id: true, title: true, category: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: {
          [input.sortBy]: input.sortOrder,
        },
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.videoComparison.count({ where }),
    ]);

    return {
      comparisons: comparisons.map((c) => ({
        id: c.id,
        title: c.title,
        syncPoint1: parseFloat(c.syncPoint1.toString()),
        syncPoint2: parseFloat(c.syncPoint2.toString()),
        createdAt: c.createdAt,
        primaryVideo: c.primaryVideo,
        comparisonVideo: c.comparisonVideo,
        createdBy: c.createdBy,
      })),
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }

  /**
   * Update comparison
   */
  async updateComparison(
    input: UpdateComparisonInput,
    userId: string,
    tenantId: string
  ): Promise<void> {
    const comparison = await this.prisma.videoComparison.findFirst({
      where: {
        id: input.id,
        tenantId,
      },
    });

    if (!comparison) {
      throw new NotFoundError('Comparison not found');
    }

    // Only creator can update
    if (comparison.createdById !== userId) {
      throw new ForbiddenError('Only the creator can update this comparison');
    }

    const updateData: Prisma.VideoComparisonUpdateInput = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }
    if (input.syncPoint1 !== undefined) {
      updateData.syncPoint1 = new Prisma.Decimal(input.syncPoint1);
    }
    if (input.syncPoint2 !== undefined) {
      updateData.syncPoint2 = new Prisma.Decimal(input.syncPoint2);
    }

    await this.prisma.videoComparison.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  /**
   * Delete comparison
   */
  async deleteComparison(comparisonId: string, userId: string, tenantId: string): Promise<void> {
    const comparison = await this.prisma.videoComparison.findFirst({
      where: {
        id: comparisonId,
        tenantId,
      },
    });

    if (!comparison) {
      throw new NotFoundError('Comparison not found');
    }

    // Only creator can delete
    if (comparison.createdById !== userId) {
      throw new ForbiddenError('Only the creator can delete this comparison');
    }

    await this.prisma.videoComparison.delete({
      where: { id: comparisonId },
    });
  }

  /**
   * Get comparisons for a specific video
   */
  async getVideoComparisons(
    videoId: string,
    tenantId: string
  ): Promise<{
    comparisons: Array<{
      id: string;
      title: string | null;
      role: 'primary' | 'comparison';
      otherVideo: { id: string; title: string };
      createdAt: Date;
    }>;
  }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    const [asPrimary, asComparison] = await Promise.all([
      this.prisma.videoComparison.findMany({
        where: {
          primaryVideoId: videoId,
          tenantId,
        },
        include: {
          comparisonVideo: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.videoComparison.findMany({
        where: {
          comparisonVideoId: videoId,
          tenantId,
        },
        include: {
          primaryVideo: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const comparisons = [
      ...asPrimary.map((c) => ({
        id: c.id,
        title: c.title,
        role: 'primary' as const,
        otherVideo: c.comparisonVideo,
        createdAt: c.createdAt,
      })),
      ...asComparison.map((c) => ({
        id: c.id,
        title: c.title,
        role: 'comparison' as const,
        otherVideo: c.primaryVideo,
        createdAt: c.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { comparisons };
  }
}
