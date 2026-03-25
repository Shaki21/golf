/**
 * Video Annotation Service
 * Business logic for video annotations including drawings and voice-overs
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { storageService } from '../../../services/storage.service';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../middleware/errors';
import { logger } from '../../../utils/logger';
import {
  CreateAnnotationInput,
  UpdateAnnotationInput,
  ListAnnotationsInput,
  GetAudioUploadUrlInput,
  ConfirmAudioUploadInput,
  BulkCreateAnnotationsInput,
} from './schema';

export class AnnotationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new annotation
   */
  async createAnnotation(
    input: CreateAnnotationInput,
    userId: string,
    tenantId: string
  ): Promise<{
    id: string;
    videoId: string;
    timestamp: number;
    type: string;
    color: string;
    strokeWidth: number;
    createdAt: Date;
  }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Create annotation
    const annotation = await this.prisma.videoAnnotation.create({
      data: {
        videoId: input.videoId,
        createdById: userId,
        timestamp: new Prisma.Decimal(input.timestamp),
        duration: input.duration ? new Prisma.Decimal(input.duration) : null,
        frameNumber: input.frameNumber,
        type: input.type,
        drawingData: input.drawingData as Prisma.InputJsonValue,
        color: input.color,
        strokeWidth: input.strokeWidth,
        note: input.note,
      },
    });

    return {
      id: annotation.id,
      videoId: annotation.videoId,
      timestamp: parseFloat(annotation.timestamp.toString()),
      type: annotation.type,
      color: annotation.color,
      strokeWidth: annotation.strokeWidth,
      createdAt: annotation.createdAt,
    };
  }

  /**
   * Bulk create annotations for efficient batch operations
   */
  async bulkCreateAnnotations(
    input: BulkCreateAnnotationsInput,
    userId: string,
    tenantId: string
  ): Promise<{ created: number }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Create all annotations in a transaction
    const annotations = await this.prisma.$transaction(
      input.annotations.map((ann) =>
        this.prisma.videoAnnotation.create({
          data: {
            videoId: input.videoId,
            createdById: userId,
            timestamp: new Prisma.Decimal(ann.timestamp),
            duration: ann.duration ? new Prisma.Decimal(ann.duration) : null,
            frameNumber: ann.frameNumber,
            type: ann.type,
            drawingData: ann.drawingData as Prisma.InputJsonValue,
            color: ann.color,
            strokeWidth: ann.strokeWidth,
            note: ann.note,
          },
        })
      )
    );

    return { created: annotations.length };
  }

  /**
   * Get annotation by ID
   */
  async getAnnotation(
    annotationId: string,
    tenantId: string
  ): Promise<{
    id: string;
    videoId: string;
    createdById: string;
    timestamp: number;
    duration: number | null;
    frameNumber: number | null;
    type: string;
    drawingData: unknown;
    color: string;
    strokeWidth: number;
    audioKey: string | null;
    audioDuration: number | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: { id: string; firstName: string; lastName: string };
  }> {
    const annotation = await this.prisma.videoAnnotation.findFirst({
      where: { id: annotationId },
      include: {
        video: { select: { tenantId: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!annotation) {
      throw new NotFoundError('Annotation not found');
    }

    if (annotation.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    return {
      id: annotation.id,
      videoId: annotation.videoId,
      createdById: annotation.createdById,
      timestamp: parseFloat(annotation.timestamp.toString()),
      duration: annotation.duration ? parseFloat(annotation.duration.toString()) : null,
      frameNumber: annotation.frameNumber,
      type: annotation.type,
      drawingData: annotation.drawingData,
      color: annotation.color,
      strokeWidth: annotation.strokeWidth,
      audioKey: annotation.audioKey,
      audioDuration: annotation.audioDuration
        ? parseFloat(annotation.audioDuration.toString())
        : null,
      note: annotation.note,
      createdAt: annotation.createdAt,
      updatedAt: annotation.updatedAt,
      createdBy: annotation.createdBy,
    };
  }

  /**
   * List annotations for a video
   */
  async listAnnotations(
    input: ListAnnotationsInput,
    tenantId: string
  ): Promise<{
    annotations: Array<{
      id: string;
      timestamp: number;
      duration: number | null;
      frameNumber: number | null;
      type: string;
      drawingData: unknown;
      color: string;
      strokeWidth: number;
      audioKey: string | null;
      audioDuration: number | null;
      note: string | null;
      createdAt: Date;
      createdBy: { id: string; firstName: string; lastName: string };
    }>;
    total: number;
  }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Build where clause
    const where: Prisma.VideoAnnotationWhereInput = {
      videoId: input.videoId,
    };

    if (input.type) {
      where.type = input.type;
    }

    if (input.startTimestamp !== undefined || input.endTimestamp !== undefined) {
      where.timestamp = {};
      if (input.startTimestamp !== undefined) {
        where.timestamp.gte = new Prisma.Decimal(input.startTimestamp);
      }
      if (input.endTimestamp !== undefined) {
        where.timestamp.lte = new Prisma.Decimal(input.endTimestamp);
      }
    }

    const [annotations, total] = await Promise.all([
      this.prisma.videoAnnotation.findMany({
        where,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.videoAnnotation.count({ where }),
    ]);

    return {
      annotations: annotations.map((a) => ({
        id: a.id,
        timestamp: parseFloat(a.timestamp.toString()),
        duration: a.duration ? parseFloat(a.duration.toString()) : null,
        frameNumber: a.frameNumber,
        type: a.type,
        drawingData: a.drawingData,
        color: a.color,
        strokeWidth: a.strokeWidth,
        audioKey: a.audioKey,
        audioDuration: a.audioDuration ? parseFloat(a.audioDuration.toString()) : null,
        note: a.note,
        createdAt: a.createdAt,
        createdBy: a.createdBy,
      })),
      total,
    };
  }

  /**
   * Update annotation
   */
  async updateAnnotation(
    input: UpdateAnnotationInput,
    userId: string,
    tenantId: string
  ): Promise<void> {
    const annotation = await this.prisma.videoAnnotation.findFirst({
      where: { id: input.id },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!annotation) {
      throw new NotFoundError('Annotation not found');
    }

    if (annotation.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    // Only creator can update their annotation
    if (annotation.createdById !== userId) {
      throw new ForbiddenError('Only the creator can update this annotation');
    }

    const updateData: Prisma.VideoAnnotationUpdateInput = {};

    if (input.timestamp !== undefined) {
      updateData.timestamp = new Prisma.Decimal(input.timestamp);
    }
    if (input.duration !== undefined) {
      updateData.duration = input.duration ? new Prisma.Decimal(input.duration) : null;
    }
    if (input.frameNumber !== undefined) {
      updateData.frameNumber = input.frameNumber;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.drawingData !== undefined) {
      updateData.drawingData = input.drawingData as Prisma.InputJsonValue;
    }
    if (input.color !== undefined) {
      updateData.color = input.color;
    }
    if (input.strokeWidth !== undefined) {
      updateData.strokeWidth = input.strokeWidth;
    }
    if (input.note !== undefined) {
      updateData.note = input.note;
    }

    await this.prisma.videoAnnotation.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  /**
   * Delete annotation
   */
  async deleteAnnotation(annotationId: string, userId: string, tenantId: string): Promise<void> {
    const annotation = await this.prisma.videoAnnotation.findFirst({
      where: { id: annotationId },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!annotation) {
      throw new NotFoundError('Annotation not found');
    }

    if (annotation.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    // Only creator can delete their annotation
    if (annotation.createdById !== userId) {
      throw new ForbiddenError('Only the creator can delete this annotation');
    }

    // Delete audio file from S3 if exists
    if (annotation.audioKey) {
      try {
        await storageService.deleteObject(annotation.audioKey);
      } catch (error) {
        logger.warn({ annotationId, audioKey: annotation.audioKey, error }, 'Failed to delete annotation audio from S3');
      }
    }

    await this.prisma.videoAnnotation.delete({
      where: { id: annotationId },
    });
  }

  /**
   * Get signed URL for uploading voice-over audio
   */
  async getAudioUploadUrl(
    input: GetAudioUploadUrlInput,
    userId: string,
    tenantId: string
  ): Promise<{
    uploadUrl: string;
    audioKey: string;
    expiresAt: Date;
  }> {
    const annotation = await this.prisma.videoAnnotation.findFirst({
      where: { id: input.annotationId },
      include: {
        video: { select: { tenantId: true, playerId: true } },
      },
    });

    if (!annotation) {
      throw new NotFoundError('Annotation not found');
    }

    if (annotation.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    // Only creator can add audio to their annotation
    if (annotation.createdById !== userId) {
      throw new ForbiddenError('Only the creator can add audio to this annotation');
    }

    // Generate audio key
    const timestamp = Date.now();
    const extension = input.mimeType.split('/')[1] || 'webm';
    const audioKey = `tenants/${tenantId}/audio/${annotation.video.playerId}/${timestamp}-annotation-${annotation.id}.${extension}`;

    // Get signed upload URL
    const uploadUrl = await storageService.getSignedUploadUrl(
      audioKey,
      tenantId,
      input.mimeType,
      3600 // 1 hour expiry
    );

    return {
      uploadUrl,
      audioKey,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }

  /**
   * Confirm audio upload and link to annotation
   */
  async confirmAudioUpload(
    input: ConfirmAudioUploadInput,
    userId: string,
    tenantId: string
  ): Promise<void> {
    const annotation = await this.prisma.videoAnnotation.findFirst({
      where: { id: input.annotationId },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!annotation) {
      throw new NotFoundError('Annotation not found');
    }

    if (annotation.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    if (annotation.createdById !== userId) {
      throw new ForbiddenError('Only the creator can confirm audio upload');
    }

    // Note: In a real implementation, we'd verify the audio file exists in S3
    // For now, we trust the client confirmation

    await this.prisma.videoAnnotation.update({
      where: { id: input.annotationId },
      data: {
        audioDuration: new Prisma.Decimal(input.audioDuration),
      },
    });
  }

  /**
   * Get signed URL for playing voice-over audio
   */
  async getAudioPlaybackUrl(
    annotationId: string,
    tenantId: string,
    expiresIn: number = 300
  ): Promise<{
    url: string;
    expiresAt: Date;
  }> {
    const annotation = await this.prisma.videoAnnotation.findFirst({
      where: { id: annotationId },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!annotation) {
      throw new NotFoundError('Annotation not found');
    }

    if (annotation.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    if (!annotation.audioKey) {
      throw new BadRequestError('Annotation has no audio');
    }

    const url = await storageService.getSignedPlaybackUrl(
      annotation.audioKey,
      tenantId,
      expiresIn
    );

    return {
      url,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }
}
