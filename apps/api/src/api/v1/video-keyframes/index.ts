/**
 * Video Keyframes API Routes
 *
 * Extract and manage keyframes from videos for analysis
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { KeyframeService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  createKeyframeSchema,
  listKeyframesSchema,
  getKeyframeSchema,
  deleteKeyframeSchema,
  updateKeyframeSchema,
  CreateKeyframeInput,
  ListKeyframesInput,
  GetKeyframeInput,
  UpdateKeyframeInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';

export async function keyframeRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const keyframeService = new KeyframeService(prisma);

  /**
   * POST /video-keyframes
   * Extract a keyframe from a video at a specific timestamp
   */
  app.post<{ Body: CreateKeyframeInput }>(
    '/',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Extract a keyframe from video',
        tags: ['video-keyframes'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['videoId', 'timestamp'],
          properties: {
            videoId: { type: 'string', format: 'uuid' },
            timestamp: { type: 'number', minimum: 0 },
            label: { type: 'string', maxLength: 255 },
            notes: { type: 'string', maxLength: 1000 },
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
                  s3Key: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateKeyframeInput }>, reply: FastifyReply) => {
      const input = validate(createKeyframeSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await keyframeService.createKeyframe(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /video-keyframes/video/:videoId
   * List all keyframes for a video
   */
  app.get<{
    Params: { videoId: string };
    Querystring: Omit<ListKeyframesInput, 'videoId'>;
  }>(
    '/video/:videoId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'List keyframes for a video',
        tags: ['video-keyframes'],
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
            playerId: { type: 'string', format: 'uuid' },
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
                  keyframes: { type: 'array' },
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
        Querystring: Omit<ListKeyframesInput, 'videoId'>;
      }>,
      reply: FastifyReply
    ) => {
      const input = validate(listKeyframesSchema, {
        videoId: request.params.videoId,
        ...request.query,
      });
      const tenantId = request.user!.tenantId;

      const result = await keyframeService.listKeyframes(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /video-keyframes/:id
   * Get a specific keyframe
   */
  app.get<{ Params: GetKeyframeInput }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get keyframe by ID',
        tags: ['video-keyframes'],
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
    async (request: FastifyRequest<{ Params: GetKeyframeInput }>, reply: FastifyReply) => {
      const input = validate(getKeyframeSchema, request.params);
      const tenantId = request.user!.tenantId;

      const keyframe = await keyframeService.getKeyframe(input.id, tenantId);

      return reply.status(200).send({
        success: true,
        data: keyframe,
      });
    }
  );

  /**
   * PATCH /video-keyframes/:id
   * Update keyframe metadata
   */
  app.patch<{ Params: { id: string }; Body: Omit<UpdateKeyframeInput, 'id'> }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Update keyframe metadata',
        tags: ['video-keyframes'],
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
            label: { type: 'string', maxLength: 255 },
            notes: { type: 'string', maxLength: 1000 },
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
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<UpdateKeyframeInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(updateKeyframeSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await keyframeService.updateKeyframe(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Keyframe updated successfully',
      });
    }
  );

  /**
   * DELETE /video-keyframes/:id
   * Delete a keyframe
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Delete keyframe',
        tags: ['video-keyframes'],
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
      validate(deleteKeyframeSchema, request.params);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      await keyframeService.deleteKeyframe(request.params.id, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Keyframe deleted successfully',
      });
    }
  );

  /**
   * GET /video-keyframes/:id/url
   * Get signed URL for keyframe image
   */
  app.get<{
    Params: { id: string };
    Querystring: { expiresIn?: number };
  }>(
    '/:id/url',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get signed URL for keyframe image',
        tags: ['video-keyframes'],
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
            expiresIn: { type: 'number', minimum: 1, maximum: 3600, default: 3600 },
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
                  thumbnailUrl: { type: 'string' },
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
      const expiresIn = request.query.expiresIn || 3600;

      const result = await keyframeService.getKeyframeUrl(request.params.id, tenantId, expiresIn);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );
}
