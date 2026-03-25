/**
 * Video Service
 * Business logic for video management
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { storageService } from '../../../services/storage.service';
import { NotFoundError, BadRequestError, InternalServerError } from '../../../middleware/errors';
import { logger } from '../../../utils/logger';
import {
  InitiateUploadInput,
  CompleteUploadInput,
  ListVideosInput,
  UpdateVideoInput,
  ShareVideoInput,
  CreateVideoRequestInput,
  ListVideoRequestsInput,
} from './schema';

export class VideoService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Initiate multipart upload
   */
  async initiateUpload(
    input: InitiateUploadInput,
    userId: string,
    tenantId: string
  ): Promise<{
    videoId: string;
    uploadId: string;
    key: string;
    signedUrls: string[];
  }> {
    // Verify player belongs to tenant
    const player = await this.prisma.player.findFirst({
      where: {
        id: input.playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found or access denied');
    }

    // Validate mime type
    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];

    if (!allowedMimeTypes.includes(input.mimeType)) {
      throw new BadRequestError(`Unsupported video format. Allowed: ${allowedMimeTypes.join(', ')}`);
    }

    // Initiate S3 multipart upload
    const upload = await storageService.initiateMultipartUpload({
      tenantId,
      playerId: input.playerId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
    });

    // Create video record in database
    const video = await this.prisma.video.create({
      data: {
        tenantId,
        playerId: input.playerId,
        uploadedById: userId,
        title: input.title,
        description: input.description,
        s3Key: upload.key,
        duration: 0, // Will be updated on complete
        fileSize: BigInt(input.fileSize),
        mimeType: input.mimeType,
        category: input.category,
        clubType: input.clubType,
        viewAngle: input.viewAngle,
        status: 'processing',
      },
    });

    return {
      videoId: video.id,
      uploadId: upload.uploadId,
      key: upload.key,
      signedUrls: upload.signedUrls,
    };
  }

  /**
   * Complete multipart upload
   */
  async completeUpload(
    input: CompleteUploadInput,
    _userId: string,
    tenantId: string
  ): Promise<{
    video: {
      id: string;
      title: string;
      status: string;
      s3Key: string;
    };
  }> {
    // Get video record
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found or access denied');
    }

    if (video.status !== 'processing') {
      throw new BadRequestError('Video upload already completed or failed');
    }

    // Complete S3 multipart upload
    try {
      await storageService.completeMultipartUpload({
        key: video.s3Key,
        uploadId: input.uploadId,
        parts: input.parts,
      });
    } catch (error: unknown) {
      // Mark video as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.video.update({
        where: { id: video.id },
        data: {
          status: 'failed',
          errorCode: 'UPLOAD_FAILED',
          errorMessage,
        },
      });

      throw new InternalServerError('Failed to complete upload');
    }

    // Update video record
    const updatedVideo = await this.prisma.video.update({
      where: { id: video.id },
      data: {
        status: 'ready',
        duration: input.duration || 0,
        width: input.width,
        height: input.height,
        fps: input.fps,
        processedAt: new Date(),
      },
    });

    return {
      video: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        status: updatedVideo.status,
        s3Key: updatedVideo.s3Key,
      },
    };
  }

  /**
   * Get video by ID
   */
  async getVideo(
    videoId: string,
    tenantId: string
  ): Promise<{
    id: string;
    title: string;
    description: string | null;
    playerId: string;
    uploadedById: string;
    category: string | null;
    clubType: string | null;
    viewAngle: string | null;
    duration: number;
    width: number | null;
    height: number | null;
    fps: number | null;
    fileSize: string;
    status: string;
    visibility: string;
    hasHls: boolean;
    hlsManifestUrl: string | null;
    playbackUrl: string | null;
    thumbnailUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    player: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }> {
    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        tenantId,
        deletedAt: null,
        archivedAt: null,
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Generate signed URLs
    let hlsManifestUrl: string | null = null;
    let playbackUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (video.status === 'ready') {
      // HLS manifest URL (10 min TTL)
      if (video.hasHls && video.hlsManifestKey) {
        try {
          hlsManifestUrl = await storageService.getSignedPlaybackUrl(
            video.hlsManifestKey,
            tenantId,
            600 // 10 minutes
          );
        } catch (error) {
          logger.warn({ videoId: video.id, key: video.hlsManifestKey, error }, 'Failed to get HLS manifest URL, falling back to MP4');
        }
      }

      // MP4 playback URL (10 min TTL) - always as fallback
      try {
        playbackUrl = await storageService.getSignedPlaybackUrl(
          video.s3Key,
          tenantId,
          600 // 10 minutes
        );
      } catch (error) {
        logger.error({ videoId: video.id, key: video.s3Key, error }, 'Failed to get MP4 playback URL');
      }

      // Thumbnail URL (24 hour TTL)
      if (video.thumbnailKey) {
        try {
          thumbnailUrl = await storageService.getSignedPlaybackUrl(
            video.thumbnailKey,
            tenantId,
            86400 // 24 hours
          );
        } catch (error) {
          logger.warn({ videoId: video.id, key: video.thumbnailKey, error }, 'Failed to get thumbnail URL');
        }
      }
    }

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      playerId: video.playerId,
      uploadedById: video.uploadedById,
      category: video.category,
      clubType: video.clubType,
      viewAngle: video.viewAngle,
      duration: video.duration,
      width: video.width,
      height: video.height,
      fps: video.fps ? parseFloat(video.fps.toString()) : null,
      fileSize: video.fileSize.toString(),
      status: video.status,
      visibility: video.visibility,
      hasHls: video.hasHls,
      hlsManifestUrl,
      playbackUrl,
      thumbnailUrl,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      player: video.player,
    };
  }

  /**
   * List videos with filters and pagination
   * When includeSharedWith is provided (player's ID), also includes videos shared with that player
   */
  async listVideos(
    input: ListVideosInput,
    tenantId: string,
    includeSharedWith?: string
  ): Promise<{
    videos: Array<{
      id: string;
      title: string;
      playerId: string;
      category: string | null;
      viewAngle: string | null;
      duration: number;
      status: string;
      hasHls: boolean;
      thumbnailUrl: string | null;
      createdAt: Date;
      isShared?: boolean;
      player: {
        firstName: string;
        lastName: string;
      };
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    // Base conditions - exclude deleted and archived videos
    const baseConditions: Prisma.VideoWhereInput = {
      tenantId,
      deletedAt: null,
      archivedAt: null,
    };

    if (input.category) {
      baseConditions.category = input.category;
    }

    if (input.status) {
      baseConditions.status = input.status;
    }

    let where: Prisma.VideoWhereInput;

    // If player is viewing and we want to include shared videos
    if (includeSharedWith && input.playerId === includeSharedWith) {
      // Player sees: own videos OR videos shared with them
      where = {
        AND: [
          baseConditions,
          {
            OR: [
              { playerId: includeSharedWith },
              { shares: { some: { playerId: includeSharedWith } } },
            ],
          },
        ],
      };
    } else {
      // Standard query (coach view or specific player filter)
      where = { ...baseConditions };
      if (input.playerId) {
        where.playerId = input.playerId;
      }
    }

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        include: {
          player: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          shares: includeSharedWith
            ? {
                where: { playerId: includeSharedWith },
                select: { playerId: true },
              }
            : false,
        },
        orderBy: {
          [input.sortBy]: input.sortOrder,
        },
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.video.count({ where }),
    ]);

    // Generate thumbnail URLs for videos that have thumbnails
    const videosWithThumbnails = await Promise.all(
      videos.map(async (v) => {
        let thumbnailUrl: string | null = null;

        if (v.thumbnailKey) {
          try {
            thumbnailUrl = await storageService.getSignedPlaybackUrl(
              v.thumbnailKey,
              tenantId,
              3600 // 1 hour expiry for thumbnails
            );
          } catch (err) {
            // Ignore thumbnail errors, just return null
            logger.warn({ videoId: v.id, error: err }, 'Failed to get thumbnail URL');
          }
        }

        return {
          id: v.id,
          title: v.title,
          playerId: v.playerId,
          category: v.category,
          viewAngle: v.viewAngle,
          duration: v.duration,
          status: v.status,
          hasHls: v.hasHls,
          thumbnailUrl,
          createdAt: v.createdAt,
          // Mark as shared if video is not owned by the viewer but is shared with them
          isShared: includeSharedWith ? (v.playerId !== includeSharedWith && 'shares' in v && Array.isArray(v.shares) && v.shares.length > 0) : undefined,
          player: v.player,
        };
      })
    );

    return {
      videos: videosWithThumbnails,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }

  /**
   * Get playback URL
   */
  async getPlaybackUrl(
    videoId: string,
    tenantId: string,
    expiresIn: number = 300
  ): Promise<{
    url: string;
    expiresAt: Date;
  }> {
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

    if (video.status !== 'ready') {
      throw new BadRequestError('Video not ready for playback');
    }

    const url = await storageService.getSignedPlaybackUrl(
      video.s3Key,
      tenantId,
      expiresIn
    );

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      url,
      expiresAt,
    };
  }

  /**
   * Update video metadata
   */
  async updateVideo(
    input: UpdateVideoInput,
    tenantId: string
  ): Promise<void> {
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    const updateData: Prisma.VideoUpdateInput = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.clubType !== undefined) updateData.clubType = input.clubType;
    if (input.viewAngle !== undefined) updateData.viewAngle = input.viewAngle;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.shareExpiresAt !== undefined) {
      updateData.shareExpiresAt = input.shareExpiresAt ? new Date(input.shareExpiresAt) : null;
    }

    await this.prisma.video.update({
      where: { id: input.id },
      data: updateData,
    });
  }

  /**
   * Soft delete (archive) a video
   * Sets archivedAt, video is hidden from lists but storage is preserved.
   */
  async archiveVideo(videoId: string, tenantId: string): Promise<void> {
    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        tenantId,
        archivedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Hard delete a video and all storage assets
   * Deletes: mp4, thumbnail, HLS segments. Idempotent.
   */
  async hardDeleteVideo(
    videoId: string,
    tenantId: string
  ): Promise<{ video: boolean; thumbnail: boolean; hlsCount: number }> {
    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        tenantId,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Generate HLS prefix from manifest key
    const hlsPrefix = video.hlsManifestKey
      ? video.hlsManifestKey.replace(/\/master\.m3u8$/, '/')
      : null;

    // Delete all storage assets (idempotent)
    const storageResult = await storageService.deleteVideoAssets(
      video.s3Key,
      video.thumbnailKey,
      hlsPrefix
    );

    // Mark as deleted in DB
    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        deletedAt: new Date(),
        status: 'deleted',
      },
    });

    return storageResult;
  }

  /**
   * Delete video (legacy - defaults to soft delete/archive)
   */
  async deleteVideo(
    videoId: string,
    tenantId: string,
    hardDelete: boolean = false
  ): Promise<void> {
    if (hardDelete) {
      await this.hardDeleteVideo(videoId, tenantId);
    } else {
      await this.archiveVideo(videoId, tenantId);
    }
  }

  /**
   * Share video with players
   */
  async shareVideo(
    input: ShareVideoInput,
    userId: string,
    tenantId: string
  ): Promise<{
    shared: number;
    alreadyShared: number;
  }> {
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Verify all players belong to tenant
    const players = await this.prisma.player.findMany({
      where: {
        id: { in: input.playerIds },
        tenantId,
      },
      select: { id: true },
    });

    const validPlayerIds = players.map(p => p.id);
    const invalidIds = input.playerIds.filter(id => !validPlayerIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestError(`Invalid player IDs: ${invalidIds.join(', ')}`);
    }

    // Check existing shares
    const existingShares = await this.prisma.videoShare.findMany({
      where: {
        videoId: input.id,
        playerId: { in: validPlayerIds },
      },
      select: { playerId: true },
    });

    const alreadySharedIds = existingShares.map(s => s.playerId);
    const newPlayerIds = validPlayerIds.filter(id => !alreadySharedIds.includes(id));

    // Create new shares
    if (newPlayerIds.length > 0) {
      await this.prisma.videoShare.createMany({
        data: newPlayerIds.map(playerId => ({
          videoId: input.id,
          playerId,
          sharedById: userId,
          tenantId,
        })),
      });
    }

    return {
      shared: newPlayerIds.length,
      alreadyShared: alreadySharedIds.length,
    };
  }

  /**
   * Get shares for a video
   */
  async getVideoShares(
    videoId: string,
    tenantId: string
  ): Promise<{
    shares: Array<{
      playerId: string;
      playerName: string;
      sharedAt: Date;
    }>;
  }> {
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

    const shares = await this.prisma.videoShare.findMany({
      where: {
        videoId,
        tenantId,
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      shares: shares.map(s => ({
        playerId: s.playerId,
        playerName: `${s.player.firstName} ${s.player.lastName}`.trim(),
        sharedAt: s.createdAt,
      })),
    };
  }

  /**
   * Remove share from a video
   */
  async removeVideoShare(
    videoId: string,
    playerId: string,
    tenantId: string
  ): Promise<void> {
    const share = await this.prisma.videoShare.findFirst({
      where: {
        videoId,
        playerId,
        tenantId,
      },
    });

    if (!share) {
      throw new NotFoundError('Share not found');
    }

    await this.prisma.videoShare.delete({
      where: { id: share.id },
    });
  }

  /**
   * Create video request from coach to player
   */
  async createVideoRequest(
    input: CreateVideoRequestInput,
    userId: string,
    tenantId: string
  ): Promise<{
    id: string;
    playerId: string;
    status: string;
    createdAt: Date;
  }> {
    // Verify player belongs to tenant
    const player = await this.prisma.player.findFirst({
      where: {
        id: input.playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    const request = await this.prisma.videoRequest.create({
      data: {
        tenantId,
        playerId: input.playerId,
        requestedById: userId,
        drillType: input.drillType,
        category: input.category,
        viewAngle: input.viewAngle,
        instructions: input.instructions,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: 'pending',
      },
    });

    return {
      id: request.id,
      playerId: request.playerId,
      status: request.status,
      createdAt: request.createdAt,
    };
  }

  /**
   * List video requests
   */
  async listVideoRequests(
    input: ListVideoRequestsInput,
    tenantId: string
  ): Promise<{
    requests: Array<{
      id: string;
      playerId: string;
      playerName: string;
      drillType: string | null;
      category: string | null;
      instructions: string | null;
      status: string;
      dueDate: Date | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const where: Prisma.VideoRequestWhereInput = { tenantId };

    if (input.playerId) {
      where.playerId = input.playerId;
    }

    if (input.status) {
      where.status = input.status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.videoRequest.findMany({
        where,
        include: {
          player: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.videoRequest.count({ where }),
    ]);

    return {
      requests: requests.map(r => ({
        id: r.id,
        playerId: r.playerId,
        playerName: `${r.player.firstName} ${r.player.lastName}`.trim(),
        drillType: r.drillType,
        category: r.category,
        instructions: r.instructions,
        status: r.status,
        dueDate: r.dueDate,
        createdAt: r.createdAt,
      })),
      total,
    };
  }

  /**
   * Update video request status
   */
  async updateVideoRequest(
    requestId: string,
    status: 'pending' | 'fulfilled' | 'expired' | 'cancelled',
    tenantId: string,
    fulfilledVideoId?: string
  ): Promise<void> {
    const request = await this.prisma.videoRequest.findFirst({
      where: {
        id: requestId,
        tenantId,
      },
    });

    if (!request) {
      throw new NotFoundError('Video request not found');
    }

    const updateData: Prisma.VideoRequestUpdateInput = { status };

    if (status === 'fulfilled' && fulfilledVideoId) {
      updateData.fulfilledVideo = { connect: { id: fulfilledVideoId } };
      updateData.fulfilledAt = new Date();
    }

    await this.prisma.videoRequest.update({
      where: { id: requestId },
      data: updateData,
    });
  }

  /**
   * Get thumbnail URL for a video
   * Returns null if thumbnail doesn't exist
   */
  async getThumbnailUrl(
    videoId: string,
    tenantId: string,
    expiresIn: number = 3600
  ): Promise<{
    url: string | null;
    expiresAt: Date | null;
  }> {
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

    // If thumbnail key exists, return signed URL
    if (video.thumbnailKey) {
      const url = await storageService.getSignedPlaybackUrl(
        video.thumbnailKey,
        tenantId,
        expiresIn
      );

      return {
        url,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };
    }

    // No thumbnail available
    return {
      url: null,
      expiresAt: null,
    };
  }

  /**
   * Upload thumbnail for a video
   * Accepts base64 image data or a buffer
   */
  async uploadThumbnail(
    videoId: string,
    tenantId: string,
    imageData: Buffer,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    thumbnailKey: string;
    thumbnailUrl: string;
  }> {
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

    // Validate mime type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestError(`Unsupported thumbnail format. Allowed: ${allowedMimeTypes.join(', ')}`);
    }

    // Generate thumbnail key based on video key
    const thumbnailKey = storageService.getThumbnailKey(video.s3Key);

    // Upload thumbnail to S3 using specific key
    await storageService.uploadToKey(
      thumbnailKey,
      imageData,
      mimeType,
      {
        tenantId,
        playerId: video.playerId,
        videoId,
      }
    );

    // Update video record with thumbnail key
    await this.prisma.video.update({
      where: { id: videoId },
      data: { thumbnailKey },
    });

    // Return signed URL for the uploaded thumbnail
    const thumbnailUrl = await storageService.getSignedPlaybackUrl(
      thumbnailKey,
      tenantId,
      3600
    );

    return {
      thumbnailKey,
      thumbnailUrl,
    };
  }
}
