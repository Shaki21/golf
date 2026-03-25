import { FastifyInstance } from 'fastify';
import { AchievementsService } from './service';
import {
  unlockAchievementSchema,
  getAchievementSchema,
  listAchievementsSchema,
  markAsViewedSchema,
  markAllAsViewedSchema,
  deleteAchievementSchema,
  achievementStatsSchema,
  recentAchievementsSchema
} from './schema';
import { authenticateUser } from '../../../middleware/auth';

const achievementsService = new AchievementsService();

export default async function achievementsRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticateUser);

  // List achievements (with optional filtering by category)
  fastify.get(
    '/',
    { schema: listAchievementsSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { category } = request.query as { category?: string };

      const achievements = await achievementsService.listAchievements(userId, category);
      return reply.code(200).send(achievements);
    }
  );

  // Get new achievements only
  fastify.get(
    '/new',
    async (request, reply) => {
      const userId = request.user!.id;
      const achievements = await achievementsService.getNewAchievements(userId);
      return reply.code(200).send(achievements);
    }
  );

  // Get achievement statistics
  fastify.get(
    '/stats',
    { schema: achievementStatsSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const stats = await achievementsService.getAchievementStats(userId);
      return reply.code(200).send(stats);
    }
  );

  // Get recent achievements
  fastify.get(
    '/recent',
    { schema: recentAchievementsSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { limit } = request.query as { limit?: number };

      const achievements = await achievementsService.getRecentAchievements(userId, limit || 5);
      return reply.code(200).send(achievements);
    }
  );

  // Get single achievement
  fastify.get(
    '/:id',
    { schema: getAchievementSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const achievement = await achievementsService.getAchievementById(id, userId);
      return reply.code(200).send(achievement);
    }
  );

  // Unlock achievement
  fastify.post(
    '/',
    { schema: unlockAchievementSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const input = request.body as Parameters<typeof achievementsService.unlockAchievement>[1];
      const achievement = await achievementsService.unlockAchievement(userId, input);
      return reply.code(201).send(achievement);
    }
  );

  // Mark single achievement as viewed
  fastify.patch(
    '/:id/viewed',
    { schema: markAsViewedSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const achievement = await achievementsService.markAsViewed(id, userId);
      return reply.code(200).send(achievement);
    }
  );

  // Mark all achievements as viewed
  fastify.post(
    '/mark-all-viewed',
    { schema: markAllAsViewedSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await achievementsService.markAllAsViewed(userId);
      return reply.code(200).send(result);
    }
  );

  // Delete achievement
  fastify.delete(
    '/:id',
    { schema: deleteAchievementSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const result = await achievementsService.deleteAchievement(id, userId);
      return reply.code(200).send(result);
    }
  );
}
