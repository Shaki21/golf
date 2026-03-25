/**
 * Video Annotations Service
 *
 * Business logic for video annotations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateAnnotationInput {
  videoId: string;
  createdById: string;
  type: string;
  timestamp: number;
  duration?: number;
  frameNumber?: number;
  drawingData: any;
  color?: string;
  strokeWidth?: number;
  note?: string;
  audioKey?: string;
  audioDuration?: number;
}

interface UpdateAnnotationInput {
  type?: string;
  timestamp?: number;
  duration?: number;
  frameNumber?: number;
  drawingData?: any;
  color?: string;
  strokeWidth?: number;
  note?: string;
  audioKey?: string;
  audioDuration?: number;
}

/**
 * Get all annotations for a video
 */
export async function getAnnotationsByVideoId(videoId: string) {
  return prisma.videoAnnotation.findMany({
    where: { videoId },
    orderBy: { timestamp: 'asc' },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Create a new annotation
 */
export async function createAnnotation(data: CreateAnnotationInput) {
  return prisma.videoAnnotation.create({
    data: {
      videoId: data.videoId,
      createdById: data.createdById,
      type: data.type,
      timestamp: data.timestamp,
      duration: data.duration,
      frameNumber: data.frameNumber,
      drawingData: data.drawingData,
      color: data.color || '#FF0000',
      strokeWidth: data.strokeWidth || 3,
      note: data.note,
      audioKey: data.audioKey,
      audioDuration: data.audioDuration,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

/**
 * Update an annotation
 * Only the creator can update their annotation
 */
export async function updateAnnotation(
  id: string,
  userId: string,
  data: UpdateAnnotationInput
) {
  // Check if user owns this annotation
  const existing = await prisma.videoAnnotation.findFirst({
    where: {
      id,
      createdById: userId,
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.videoAnnotation.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

/**
 * Delete an annotation
 * Only the creator can delete their annotation
 */
export async function deleteAnnotation(id: string, userId: string) {
  const existing = await prisma.videoAnnotation.findFirst({
    where: {
      id,
      createdById: userId,
    },
  });

  if (!existing) {
    return false;
  }

  await prisma.videoAnnotation.delete({
    where: { id },
  });

  return true;
}

/**
 * Get annotations that appear at a specific timestamp
 * Considers both point annotations and duration-based annotations
 */
export async function getAnnotationsAtTimestamp(videoId: string, timestamp: number) {
  return prisma.videoAnnotation.findMany({
    where: {
      videoId,
      AND: [
        { timestamp: { lte: timestamp } },
        {
          OR: [
            // Point annotations (no duration)
            { duration: null },
            // Duration-based annotations that overlap this timestamp
            {
              duration: { gt: 0 },
            },
          ],
        },
      ],
    },
    orderBy: { timestamp: 'asc' },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}
