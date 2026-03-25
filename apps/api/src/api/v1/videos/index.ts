import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VideoService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  initiateUploadSchema,
  completeUploadSchema,
  listVideosSchema,
  getVideoSchema,
  updateVideoSchema,
  shareVideoSchema,
  createVideoRequestSchema,
  listVideoRequestsSchema,
  InitiateUploadInput,
  CompleteUploadInput,
  ListVideosInput,
  GetVideoInput,
  UpdateVideoInput,
  CreateVideoRequestInput,
  ListVideoRequestsInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';
import { wsManager, WS_EVENTS } from '../../../plugins/websocket';
import { publishNotification } from '../../../services/notifications/notificationPublisher';
import { setNoStore, setPrivateShort } from '../../../middleware/cacheHeaders';

/**
 * Register video routes
 */
export async function videoRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const videoService = new VideoService(prisma);

  /**
   * POST /videos/upload/init
   * Initiate multipart video upload
   */
  app.post<{ Body: InitiateUploadInput }>(
    '/upload/init',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Initiate multipart video upload',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['clientUploadId', 'title', 'playerId', 'fileName', 'fileSize', 'mimeType'],
          properties: {
            clientUploadId: { type: 'string', format: 'uuid' },
            title: { type: 'string', minLength: 1, maxLength: 255 },
            playerId: { type: 'string', format: 'uuid' },
            fileName: { type: 'string', minLength: 1 },
            fileSize: { type: 'number', minimum: 1, maximum: 5368709120 },
            mimeType: { type: 'string', pattern: '^video/' },
            category: { type: 'string', enum: ['swing', 'putting', 'short_game', 'other'] },
            clubType: { type: 'string', maxLength: 50 },
            viewAngle: { type: 'string', enum: ['face_on', 'down_the_line', 'overhead', 'side'] },
            description: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  videoId: { type: 'string' },
                  uploadId: { type: 'string' },
                  key: { type: 'string' },
                  signedUrls: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: InitiateUploadInput }>, reply: FastifyReply) => {
      const input = validate(initiateUploadSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await videoService.initiateUpload(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /videos/upload/complete
   * Complete multipart video upload
   */
  app.post<{ Body: CompleteUploadInput }>(
    '/upload/complete',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Complete multipart video upload',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['videoId', 'uploadId', 'parts'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
            uploadId: { type: 'string' },
            parts: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['etag', 'partNumber'],
                properties: {
                  etag: { type: 'string' },
                  partNumber: { type: 'number', minimum: 1 },
                },
              },
            },
            duration: { type: 'number', minimum: 1 },
            width: { type: 'number', minimum: 1 },
            height: { type: 'number', minimum: 1 },
            fps: { type: 'number', minimum: 0 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  video: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      status: { type: 'string' },
                      s3Key: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CompleteUploadInput }>, reply: FastifyReply) => {
      const input = validate(completeUploadSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await videoService.completeUpload(input, userId, tenantId);

      // Notify tenant about new video upload
      wsManager.sendToTenant(tenantId, WS_EVENTS.VIDEO_UPLOADED, {
        videoId: result.video.id,
        title: result.video.title,
        status: result.video.status,
        uploadedBy: userId,
      });

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /videos
   * List videos with filters and pagination
   */
  app.get<{ Querystring: ListVideosInput }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List videos with filters and pagination',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            category: { type: 'string', enum: ['swing', 'putting', 'short_game', 'other'] },
            status: { type: 'string', enum: ['processing', 'ready', 'reviewed', 'failed', 'deleted'] },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'number', minimum: 0, default: 0 },
            sortBy: { type: 'string', enum: ['createdAt', 'title', 'duration'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  videos: { type: 'array' },
                  total: { type: 'number' },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListVideosInput }>, reply: FastifyReply) => {
      const input = validate(listVideosSchema, request.query);
      const tenantId = request.user!.tenantId;
      const userRole = request.user!.role;
      const playerId = request.user!.playerId;

      // For players, include videos shared with them
      // This happens when a player queries their own videos (playerId matches or no playerId filter)
      const includeSharedWith = userRole === 'player' && playerId ? playerId : undefined;

      const result = await videoService.listVideos(input, tenantId, includeSharedWith);

      // Set cache headers: private short cache (10s)
      setPrivateShort(reply, 10);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /videos/:id
   * Get video by ID
   */
  app.get<{ Params: GetVideoInput }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get video by ID',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          404: { $ref: 'Error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Params: GetVideoInput }>, reply: FastifyReply) => {
      const input = validate(getVideoSchema, request.params);
      const tenantId = request.user!.tenantId;

      const video = await videoService.getVideo(input.id, tenantId);

      // No-store: response may contain signed URLs
      setNoStore(reply);

      return reply.status(200).send({
        success: true,
        data: video,
      });
    }
  );

  /**
   * GET /videos/:id/playback
   * Get signed playback URL
   */
  app.get<{ Params: { id: string }; Querystring: { expiresIn?: number } }>(
    '/:id/playback',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get signed playback URL for video',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            expiresIn: { type: 'number', minimum: 1, maximum: 3600, default: 300 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  expiresAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Querystring: { expiresIn?: number } }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;
      const expiresIn = request.query.expiresIn || 600; // 10 minutes default

      const result = await videoService.getPlaybackUrl(request.params.id, tenantId, expiresIn);

      // No-store: signed URL response
      setNoStore(reply);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * PATCH /videos/:id
   * Update video metadata
   */
  app.patch<{ Params: { id: string }; Body: Omit<UpdateVideoInput, 'id'> }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Update video metadata',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string' },
            category: { type: 'string', enum: ['swing', 'putting', 'short_game', 'other'] },
            clubType: { type: 'string', maxLength: 50 },
            viewAngle: { type: 'string', enum: ['face_on', 'down_the_line', 'overhead', 'side'] },
            visibility: { type: 'string', enum: ['private', 'shared', 'public'] },
            shareExpiresAt: { type: ['string', 'null'], format: 'date-time' },
            status: { type: 'string', enum: ['processing', 'ready', 'reviewed', 'failed', 'deleted'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<UpdateVideoInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(updateVideoSchema, { ...request.body, id: request.params.id });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;
      const userRole = request.user!.role;

      // Get video before update to check if status is changing to "reviewed"
      const videoBefore = await prisma.video.findUnique({
        where: { id: request.params.id },
        select: { status: true, playerId: true, title: true },
      });

      await videoService.updateVideo(input, tenantId);

      // Create notification when coach marks video as reviewed
      if (
        userRole === 'coach' &&
        input.status === 'reviewed' &&
        videoBefore &&
        videoBefore.status !== 'reviewed'
      ) {
        // Get coach name for notification
        const coach = await prisma.coach.findFirst({
          where: { userId },
          select: { firstName: true, lastName: true },
        });
        const coachName = coach ? `${coach.firstName} ${coach.lastName}` : 'Treneren';

        // Create in-app notification for player
        const notification = await prisma.notification.create({
          data: {
            recipientType: 'player',
            recipientId: videoBefore.playerId,
            notificationType: 'video_reviewed',
            title: 'Video gjennomgått',
            message: `${coachName} har gjennomgått videoen "${videoBefore.title}"`,
            metadata: {
              videoId: request.params.id,
              videoTitle: videoBefore.title,
              coachId: userId,
            },
            channels: ['app'],
            status: 'sent',
            sentAt: new Date(),
          },
        });

        // Push real-time notification
        await publishNotification(notification);
      }

      return reply.status(200).send({
        success: true,
        message: 'Video updated successfully',
      });
    }
  );

  /**
   * POST /videos/:id/share
   * Share video with players (coach only)
   */
  app.post<{ Params: { id: string }; Body: { playerIds: string[] } }>(
    '/:id/share',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Share video with players (coach only)',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['playerIds'],
          properties: {
            playerIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              minItems: 1,
              maxItems: 100,
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  shared: { type: 'number' },
                  alreadyShared: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { playerIds: string[] } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;
      const userRole = request.user!.role;
      const { playerIds } = request.body;

      // Only coaches can share videos
      if (userRole !== 'coach') {
        return reply.status(403).send({
          success: false,
          error: 'Only coaches can share videos',
        });
      }

      const input = validate(shareVideoSchema, { id: request.params.id, playerIds });
      const result = await videoService.shareVideo(input, userId, tenantId);

      // Notify each player that video was shared with them
      if (result.shared > 0) {
        // Get video details and coach info for notification
        const video = await videoService.getVideo(request.params.id, tenantId);
        const coach = await prisma.coach.findFirst({
          where: { userId },
          select: { firstName: true, lastName: true },
        });
        const coachName = coach ? `${coach.firstName} ${coach.lastName}` : 'Treneren';

        // Create notifications in batch
        const notificationData = playerIds.map((playerId) => ({
          recipientType: 'player' as const,
          recipientId: playerId,
          notificationType: 'video_shared',
          title: 'Ny video delt med deg',
          message: `${coachName} har delt en video: "${video.title}"`,
          metadata: {
            videoId: request.params.id,
            videoTitle: video.title,
            coachId: userId,
            category: video.category,
          },
          channels: ['app'],
          status: 'sent',
          sentAt: new Date(),
        }));

        await prisma.notification.createMany({ data: notificationData });

        // Send WebSocket events to each player (real-time)
        for (const playerId of playerIds) {
          wsManager.sendToUser(playerId, WS_EVENTS.VIDEO_SHARED, {
            videoId: request.params.id,
            title: video.title,
            sharedBy: userId,
            category: video.category,
          });
        }
      }

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * DELETE /videos/:id
   * Delete video
   */
  app.delete<{ Params: { id: string }; Querystring: { hardDelete?: boolean } }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Delete video (soft delete by default)',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            hardDelete: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Querystring: { hardDelete?: boolean } }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;
      const hardDelete = request.query.hardDelete || false;

      await videoService.deleteVideo(request.params.id, tenantId, hardDelete);

      return reply.status(200).send({
        success: true,
        message: 'Video deleted successfully',
      });
    }
  );

  // ============================================================================
  // VIDEO SHARE ROUTES
  // ============================================================================

  /**
   * GET /videos/:id/shares
   * Get all shares for a video
   */
  app.get<{ Params: { id: string } }>(
    '/:id/shares',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get all shares for a video',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  shares: { type: 'array' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const tenantId = request.user!.tenantId;

      const result = await videoService.getVideoShares(request.params.id, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * DELETE /videos/:id/shares/:playerId
   * Remove a share from a video
   */
  app.delete<{ Params: { id: string; playerId: string } }>(
    '/:id/shares/:playerId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Remove a share from a video',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id', 'playerId'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            playerId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string; playerId: string } }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;

      await videoService.removeVideoShare(request.params.id, request.params.playerId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Share removed successfully',
      });
    }
  );

  // ============================================================================
  // VIDEO REQUEST ROUTES
  // ============================================================================

  /**
   * POST /videos/requests
   * Create a video request (coach requests player to upload video)
   */
  app.post<{ Body: CreateVideoRequestInput }>(
    '/requests',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Create a video request from coach to player',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['playerId'],
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            drillType: { type: 'string', maxLength: 100 },
            category: { type: 'string', enum: ['swing', 'putting', 'short_game', 'other'] },
            viewAngle: { type: 'string', enum: ['face_on', 'down_the_line', 'overhead', 'side'] },
            instructions: { type: 'string', maxLength: 1000 },
            dueDate: { type: 'string', format: 'date-time' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  playerId: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateVideoRequestInput }>, reply: FastifyReply) => {
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;
      const userRole = request.user!.role;

      // Only coaches can create video requests
      if (userRole !== 'coach') {
        return reply.status(403).send({
          success: false,
          error: 'Only coaches can create video requests',
        });
      }

      const input = validate(createVideoRequestSchema, request.body);
      const result = await videoService.createVideoRequest(input, userId, tenantId);

      // Notify the player about the video request
      wsManager.sendToUser(input.playerId, WS_EVENTS.VIDEO_REQUEST_CREATED, {
        requestId: result.id,
        drillType: input.drillType,
        category: input.category,
        instructions: input.instructions,
        dueDate: input.dueDate,
        requestedBy: userId,
      });

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /videos/requests
   * List video requests
   */
  app.get<{ Querystring: ListVideoRequestsInput }>(
    '/requests',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List video requests',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            playerId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending', 'fulfilled', 'expired', 'cancelled'] },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'number', minimum: 0, default: 0 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  requests: { type: 'array' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: ListVideoRequestsInput }>, reply: FastifyReply) => {
      const tenantId = request.user!.tenantId;
      const userRole = request.user!.role;
      const userId = request.user!.id;

      const input = validate(listVideoRequestsSchema, request.query);

      // For players, automatically filter by their own player ID
      if (userRole === 'player') {
        // Get the player ID for this user
        const player = await videoService['prisma'].player.findFirst({
          where: { userId, tenantId },
          select: { id: true },
        });
        if (player) {
          input.playerId = player.id;
        }
      }

      const result = await videoService.listVideoRequests(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  // ============================================================================
  // THUMBNAIL ROUTES
  // ============================================================================

  /**
   * GET /videos/:id/thumbnail
   * Get thumbnail URL for a video
   */
  app.get<{ Params: { id: string }; Querystring: { expiresIn?: number } }>(
    '/:id/thumbnail',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get thumbnail URL for a video',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            expiresIn: { type: 'number', minimum: 1, maximum: 86400, default: 3600 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  url: { type: ['string', 'null'] },
                  expiresAt: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Querystring: { expiresIn?: number } }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;
      const expiresIn = request.query.expiresIn || 86400; // 24 hours default

      const result = await videoService.getThumbnailUrl(request.params.id, tenantId, expiresIn);

      // No-store: signed URL response (thumbnail URL itself should be cached by browser)
      setNoStore(reply);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /videos/:id/thumbnail
   * Upload thumbnail for a video
   */
  app.post<{ Params: { id: string }; Body: { image: string; mimeType?: string } }>(
    '/:id/thumbnail',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Upload thumbnail for a video (base64 encoded image)',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['image'],
          properties: {
            image: { type: 'string', description: 'Base64 encoded image data' },
            mimeType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp'], default: 'image/jpeg' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  thumbnailKey: { type: 'string' },
                  thumbnailUrl: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { image: string; mimeType?: string } }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;
      const { image, mimeType = 'image/jpeg' } = request.body;

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(image, 'base64');

      const result = await videoService.uploadThumbnail(
        request.params.id,
        tenantId,
        imageBuffer,
        mimeType
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * PATCH /videos/requests/:id
   * Update video request status
   */
  app.patch<{ Params: { id: string }; Body: { status: string; fulfilledVideoId?: string } }>(
    '/requests/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Update video request status',
        tags: ['videos'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'fulfilled', 'expired', 'cancelled'] },
            fulfilledVideoId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: { status: string; fulfilledVideoId?: string } }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;
      const { status, fulfilledVideoId } = request.body;

      await videoService.updateVideoRequest(
        request.params.id,
        status as 'pending' | 'fulfilled' | 'expired' | 'cancelled',
        tenantId,
        fulfilledVideoId
      );

      return reply.status(200).send({
        success: true,
        message: 'Video request updated successfully',
      });
    }
  );
}
