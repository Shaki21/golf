/**
 * Video Keyframes Service
 *
 * Handles extraction and management of video keyframes
 */

import { PrismaClient } from '@prisma/client';
import { CreateKeyframeInput, ListKeyframesInput, UpdateKeyframeInput } from './schema';
import { AppError } from '../../../core/errors';

export class KeyframeService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new keyframe
   * In a full implementation, this would trigger video frame extraction
   */
  async createKeyframe(input: CreateKeyframeInput, userId: string, tenantId: string) {
    // Verify video exists and user has access
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
      },
      select: {
        id: true,
        playerId: true,
        s3Key: true,
      },
    });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Generate S3 keys for keyframe storage
    const keyframeId = crypto.randomUUID();
    const s3Key = `keyframes/${tenantId}/${video.playerId}/${input.videoId}/${keyframeId}.jpg`;
    const thumbnailKey = `keyframes/${tenantId}/${video.playerId}/${input.videoId}/${keyframeId}_thumb.jpg`;

    // Create keyframe record
    const keyframe = await this.prisma.videoKeyframe.create({
      data: {
        videoId: input.videoId,
        playerId: video.playerId,
        tenantId,
        timestamp: input.timestamp,
        s3Key,
        thumbnailKey,
        label: input.label,
        notes: input.notes,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // TODO: In production, trigger async job to extract actual frame from video
    // This would use FFmpeg to extract the frame at the specified timestamp
    // and upload to S3

    return keyframe;
  }

  /**
   * List keyframes for a video
   */
  async listKeyframes(input: ListKeyframesInput, tenantId: string) {
    const where: any = {
      videoId: input.videoId,
      tenantId,
    };

    if (input.playerId) {
      where.playerId = input.playerId;
    }

    const keyframes = await this.prisma.videoKeyframe.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      keyframes,
      total: keyframes.length,
    };
  }

  /**
   * Get a single keyframe
   */
  async getKeyframe(id: string, tenantId: string) {
    const keyframe = await this.prisma.videoKeyframe.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            s3Key: true,
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!keyframe) {
      throw new AppError('Keyframe not found', 404);
    }

    return keyframe;
  }

  /**
   * Update keyframe metadata
   */
  async updateKeyframe(input: UpdateKeyframeInput, userId: string, tenantId: string) {
    const existing = await this.prisma.videoKeyframe.findFirst({
      where: {
        id: input.id,
        tenantId,
      },
    });

    if (!existing) {
      throw new AppError('Keyframe not found', 404);
    }

    const updated = await this.prisma.videoKeyframe.update({
      where: { id: input.id },
      data: {
        label: input.label,
        notes: input.notes,
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete a keyframe
   */
  async deleteKeyframe(id: string, userId: string, tenantId: string) {
    const existing = await this.prisma.videoKeyframe.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existing) {
      throw new AppError('Keyframe not found', 404);
    }

    await this.prisma.videoKeyframe.delete({
      where: { id },
    });

    // TODO: In production, also delete S3 objects
    // await s3Client.deleteObject({ Bucket, Key: existing.s3Key });
    // await s3Client.deleteObject({ Bucket, Key: existing.thumbnailKey });

    return { success: true };
  }

  /**
   * Get signed URL for keyframe image
   */
  async getKeyframeUrl(id: string, tenantId: string, expiresIn: number = 3600) {
    const keyframe = await this.getKeyframe(id, tenantId);

    // TODO: In production, generate signed S3 URL
    // const url = await s3Client.getSignedUrl('getObject', {
    //   Bucket: config.s3.bucket,
    //   Key: keyframe.s3Key,
    //   Expires: expiresIn,
    // });

    // For now, return a placeholder
    const url = `/api/v1/video-keyframes/${id}/image`;

    return {
      url,
      thumbnailUrl: `/api/v1/video-keyframes/${id}/thumbnail`,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}
