import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnnotationService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createAnnotationSchema,
  updateAnnotationSchema,
  listAnnotationsSchema,
  getAnnotationSchema,
  deleteAnnotationSchema,
  getAudioUploadUrlSchema,
  confirmAudioUploadSchema,
  bulkCreateAnnotationsSchema,
  CreateAnnotationInput,
  UpdateAnnotationInput,
  ListAnnotationsInput,
  GetAnnotationInput,
  GetAudioUploadUrlInput,
  ConfirmAudioUploadInput,
  BulkCreateAnnotationsInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';
import { wsManager, WS_EVENTS } from '../../../plugins/websocket';

/**
 * Register video annotation routes
 */
export async function annotationRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const annotationService = new AnnotationService(prisma);

  /**
   * POST /annotations
   * Create a new annotation
   */
  app.post<{ Body: CreateAnnotationInput }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Create a new video annotation',
        tags: ['annotations'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['videoId', 'timestamp', 'type', 'drawingData'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
            timestamp: { type: 'number', minimum: 0 },
            duration: { type: 'number', minimum: 0 },
            frameNumber: { type: 'integer', minimum: 0 },
            type: {
              type: 'string',
              enum: ['line', 'circle', 'arrow', 'angle', 'freehand', 'text'],
            },
            drawingData: { type: 'object' },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', default: '#FF0000' },
            strokeWidth: { type: 'integer', minimum: 1, maximum: 20, default: 3 },
            note: { type: 'string', maxLength: 1000 },
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
                  videoId: { type: 'string' },
                  timestamp: { type: 'number' },
                  type: { type: 'string' },
                  color: { type: 'string' },
                  strokeWidth: { type: 'number' },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateAnnotationInput }>, reply: FastifyReply) => {
      const input = validate(createAnnotationSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await annotationService.createAnnotation(input, userId, tenantId);

      // Get video to find owner and notify them
      const video = await prisma.video.findUnique({
        where: { id: input.videoId },
        select: { playerId: true, title: true },
      });

      if (video && video.playerId !== userId) {
        // Notify video owner about new annotation
        wsManager.sendToUser(video.playerId, WS_EVENTS.ANNOTATION_ADDED, {
          annotationId: result.id,
          videoId: input.videoId,
          videoTitle: video.title,
          type: result.type,
          timestamp: result.timestamp,
          addedBy: userId,
        });
      }

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /annotations/bulk
   * Create multiple annotations at once
   */
  app.post<{ Body: BulkCreateAnnotationsInput }>(
    '/bulk',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Create multiple annotations at once (max 50)',
        tags: ['annotations'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['videoId', 'annotations'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
            annotations: {
              type: 'array',
              minItems: 1,
              maxItems: 50,
              items: {
                type: 'object',
                required: ['timestamp', 'type', 'drawingData'],
                properties: {
                  timestamp: { type: 'number', minimum: 0 },
                  duration: { type: 'number', minimum: 0 },
                  frameNumber: { type: 'integer', minimum: 0 },
                  type: {
                    type: 'string',
                    enum: ['line', 'circle', 'arrow', 'angle', 'freehand', 'text'],
                  },
                  drawingData: { type: 'object' },
                  color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', default: '#FF0000' },
                  strokeWidth: { type: 'integer', minimum: 1, maximum: 20, default: 3 },
                  note: { type: 'string', maxLength: 1000 },
                },
              },
            },
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
                  created: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: BulkCreateAnnotationsInput }>, reply: FastifyReply) => {
      const input = validate(bulkCreateAnnotationsSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await annotationService.bulkCreateAnnotations(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /annotations/video/:videoId
   * List annotations for a video
   */
  app.get<{
    Params: { videoId: string };
    Querystring: Omit<ListAnnotationsInput, 'videoId'>;
  }>(
    '/video/:videoId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List annotations for a video',
        tags: ['annotations'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['videoId'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['line', 'circle', 'arrow', 'angle', 'freehand', 'text'],
            },
            startTimestamp: { type: 'number', minimum: 0 },
            endTimestamp: { type: 'number', minimum: 0 },
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
                  annotations: { type: 'array' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { videoId: string };
        Querystring: Omit<ListAnnotationsInput, 'videoId'>;
      }>,
      reply: FastifyReply
    ) => {
      const input = validate(listAnnotationsSchema, {
        videoId: request.params.videoId,
        ...request.query,
      });
      const tenantId = request.user!.tenantId;

      const result = await annotationService.listAnnotations(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /annotations/:id
   * Get annotation by ID
   */
  app.get<{ Params: GetAnnotationInput }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get annotation by ID',
        tags: ['annotations'],
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
    async (request: FastifyRequest<{ Params: GetAnnotationInput }>, reply: FastifyReply) => {
      const input = validate(getAnnotationSchema, request.params);
      const tenantId = request.user!.tenantId;

      const annotation = await annotationService.getAnnotation(input.id, tenantId);

      return reply.status(200).send({
        success: true,
        data: annotation,
      });
    }
  );

  /**
   * PATCH /annotations/:id
   * Update annotation
   */
  app.patch<{ Params: { id: string }; Body: Omit<UpdateAnnotationInput, 'id'> }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Update annotation',
        tags: ['annotations'],
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
            timestamp: { type: 'number', minimum: 0 },
            duration: { type: ['number', 'null'], minimum: 0 },
            frameNumber: { type: ['integer', 'null'], minimum: 0 },
            type: {
              type: 'string',
              enum: ['line', 'circle', 'arrow', 'angle', 'freehand', 'text'],
            },
            drawingData: { type: 'object' },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            strokeWidth: { type: 'integer', minimum: 1, maximum: 20 },
            note: { type: ['string', 'null'], maxLength: 1000 },
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
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<UpdateAnnotationInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(updateAnnotationSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await annotationService.updateAnnotation(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Annotation updated successfully',
      });
    }
  );

  /**
   * DELETE /annotations/:id
   * Delete annotation
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Delete annotation',
        tags: ['annotations'],
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      validate(deleteAnnotationSchema, request.params);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await annotationService.deleteAnnotation(request.params.id, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Annotation deleted successfully',
      });
    }
  );

  /**
   * POST /annotations/:id/audio/upload-url
   * Get signed URL for voice-over audio upload
   */
  app.post<{
    Params: { id: string };
    Body: Omit<GetAudioUploadUrlInput, 'annotationId'>;
  }>(
    '/:id/audio/upload-url',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get signed URL for uploading voice-over audio',
        tags: ['annotations'],
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
          required: ['mimeType', 'duration'],
          properties: {
            mimeType: {
              type: 'string',
              enum: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'],
            },
            duration: { type: 'number', minimum: 0, maximum: 300 },
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
                  uploadUrl: { type: 'string' },
                  audioKey: { type: 'string' },
                  expiresAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: Omit<GetAudioUploadUrlInput, 'annotationId'>;
      }>,
      reply: FastifyReply
    ) => {
      const input = validate(getAudioUploadUrlSchema, {
        annotationId: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await annotationService.getAudioUploadUrl(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /annotations/:id/audio/confirm
   * Confirm audio upload completed
   */
  app.post<{
    Params: { id: string };
    Body: Omit<ConfirmAudioUploadInput, 'annotationId'>;
  }>(
    '/:id/audio/confirm',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Confirm audio upload completed',
        tags: ['annotations'],
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
          required: ['audioDuration'],
          properties: {
            audioDuration: { type: 'number', minimum: 0, maximum: 300 },
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
      request: FastifyRequest<{
        Params: { id: string };
        Body: Omit<ConfirmAudioUploadInput, 'annotationId'>;
      }>,
      reply: FastifyReply
    ) => {
      const input = validate(confirmAudioUploadSchema, {
        annotationId: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await annotationService.confirmAudioUpload(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Audio upload confirmed',
      });
    }
  );

  /**
   * GET /annotations/:id/audio/playback
   * Get signed URL for playing voice-over audio
   */
  app.get<{
    Params: { id: string };
    Querystring: { expiresIn?: number };
  }>(
    '/:id/audio/playback',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get signed URL for playing voice-over audio',
        tags: ['annotations'],
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
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { expiresIn?: number };
      }>,
      reply: FastifyReply
    ) => {
      const tenantId = request.user!.tenantId;
      const expiresIn = request.query.expiresIn || 300;

      const result = await annotationService.getAudioPlaybackUrl(
        request.params.id,
        tenantId,
        expiresIn
      );

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );
}
