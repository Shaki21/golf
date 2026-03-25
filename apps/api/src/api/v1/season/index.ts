import { FastifyPluginAsync } from 'fastify';
import { authenticateUser } from '../../../middleware/auth';
import { BaselineRecommendationService } from '../../../services/BaselineRecommendationService';
import prisma from '../../../core/db/prisma';

const seasonRoutes: FastifyPluginAsync = async (fastify) => {
  const recommendationService = new BaselineRecommendationService();

  /**
   * GET /api/v1/season/recommendation
   * Get AI recommendation for baseline selection
   */
  fastify.get(
    '/recommendation',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get AI recommendation for season baseline selection',
        tags: ['season'],
        querystring: {
          type: 'object',
          properties: {
            season: { type: 'number', description: 'Target season year (e.g., 2025)' },
          },
          required: ['season'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              recommended: {
                type: 'string',
                enum: ['season_average', 'last_8_rounds'],
                description: 'Recommended baseline type',
              },
              confidence: {
                type: 'number',
                description: 'Confidence percentage (50-100)',
              },
              reasoning: {
                type: 'array',
                items: { type: 'string' },
                description: 'Detailed reasoning in Norwegian',
              },
              metrics: {
                type: 'object',
                properties: {
                  last8StdDev: { type: 'number' },
                  seasonStdDev: { type: 'number' },
                  trendDirection: {
                    type: 'string',
                    enum: ['improving', 'declining', 'stable'],
                  },
                  trendStrength: { type: 'number' },
                  consistencyScore: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { season } = request.query as { season: number };
      const userId = request.user!.id;

      const recommendation = await recommendationService.getRecommendation(
        userId,
        season
      );

      return reply.send(recommendation);
    }
  );

  /**
   * POST /api/v1/season/baseline
   * Set baseline choice for new season
   */
  fastify.post(
    '/baseline',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Set baseline choice for new season',
        tags: ['season'],
        body: {
          type: 'object',
          properties: {
            season: { type: 'number', description: 'Season year' },
            baselineType: {
              type: 'string',
              enum: ['season_average', 'last_8_rounds'],
            },
            baselineScore: { type: 'number', description: 'Average score' },
            metadata: {
              type: 'object',
              description: 'Additional metadata (rounds count, etc.)',
            },
          },
          required: ['season', 'baselineType', 'baselineScore'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              season: { type: 'number' },
              baselineType: { type: 'string' },
              baselineScore: { type: 'number' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const { season, baselineType, baselineScore, metadata } = request.body as {
        season: number;
        baselineType: 'season_average' | 'last_8_rounds';
        baselineScore: number;
        metadata?: Record<string, unknown>;
      };

      // Create or update season baseline
      const baseline = await prisma.seasonBaseline.upsert({
        where: {
          userId_season: {
            userId,
            season,
          },
        },
        update: {
          baselineType,
          baselineScore,
          metadata,
        },
        create: {
          userId,
          season,
          baselineType,
          baselineScore,
          metadata,
        },
      });

      return reply.status(201).send(baseline);
    }
  );

  /**
   * GET /api/v1/season/baseline
   * Get current season baseline
   */
  fastify.get(
    '/baseline',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Get season baseline',
        tags: ['season'],
        querystring: {
          type: 'object',
          properties: {
            season: { type: 'number', description: 'Season year' },
          },
          required: ['season'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              season: { type: 'number' },
              baselineType: { type: 'string' },
              baselineScore: { type: 'number' },
              metadata: { type: 'object', additionalProperties: true },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const { season } = request.query as { season: number };

      const baseline = await prisma.seasonBaseline.findUnique({
        where: {
          userId_season: {
            userId,
            season,
          },
        },
      });

      if (!baseline) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'No baseline found for this season',
        });
      }

      return reply.send(baseline);
    }
  );
};

export default seasonRoutes;
