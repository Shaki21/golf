/**
 * Goals API Routes
 *
 * Endpoints for goals CRUD, streaks, badges, and statistics
 */

import { FastifyInstance } from 'fastify';
import { GoalsService } from './service';
import {
  createGoalSchema,
  updateGoalSchema,
  getGoalSchema,
  listGoalsSchema,
  deleteGoalSchema,
  updateProgressSchema,
  getStreakSchema,
  updateStreakSchema,
  getStatsSchema,
  getBadgesSchema,
  unlockBadgeSchema,
  markBadgeViewedSchema
} from './schema';
import { authenticateUser } from '../../../middleware/auth';

const goalsService = new GoalsService();

export default async function goalsRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticateUser);

  // =============================================================================
  // Goals CRUD Routes
  // =============================================================================

  // List goals (with optional filtering)
  fastify.get(
    '/',
    { schema: listGoalsSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { status, goalType } = request.query as { status?: string; goalType?: string };

      let goals;
      if (goalType) {
        goals = await goalsService.getGoalsByType(userId, goalType);
      } else {
        goals = await goalsService.listGoals(userId, status);
      }

      return reply.code(200).send(goals);
    }
  );

  // Get active goals
  fastify.get(
    '/active',
    async (request, reply) => {
      const userId = request.user!.id;
      const goals = await goalsService.getActiveGoals(userId);
      return reply.code(200).send(goals);
    }
  );

  // Get completed goals
  fastify.get(
    '/completed',
    async (request, reply) => {
      const userId = request.user!.id;
      const goals = await goalsService.getCompletedGoals(userId);
      return reply.code(200).send(goals);
    }
  );

  // Get single goal
  fastify.get(
    '/:id',
    { schema: getGoalSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const goal = await goalsService.getGoalById(id, userId);
      return reply.code(200).send(goal);
    }
  );

  // Create goal
  fastify.post(
    '/',
    { schema: createGoalSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const input = request.body as Parameters<typeof goalsService.createGoal>[1];
      const goal = await goalsService.createGoal(userId, input);
      return reply.code(201).send(goal);
    }
  );

  // Update goal
  fastify.put(
    '/:id',
    { schema: updateGoalSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };
      const input = request.body as Parameters<typeof goalsService.updateGoal>[2];

      const goal = await goalsService.updateGoal(id, userId, input);
      return reply.code(200).send(goal);
    }
  );

  // Update goal progress (shortcut endpoint)
  fastify.patch(
    '/:id/progress',
    { schema: updateProgressSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };
      const { currentValue } = request.body as { currentValue: number };

      const goal = await goalsService.updateProgress(id, userId, currentValue);
      
      // Also update streak when progress is updated
      await goalsService.updateStreak(userId, id, currentValue);
      
      return reply.code(200).send(goal);
    }
  );

  // Delete goal
  fastify.delete(
    '/:id',
    { schema: deleteGoalSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const result = await goalsService.deleteGoal(id, userId);
      return reply.code(200).send(result);
    }
  );

  // =============================================================================
  // Streak Routes
  // =============================================================================

  // GET /api/v1/goals/streak - Get current streak data
  fastify.get(
    '/streak',
    { schema: getStreakSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const streak = await goalsService.getStreak(userId);
      return reply.code(200).send(streak);
    }
  );

  // POST /api/v1/goals/streak/update - Update streak when progress is made
  fastify.post(
    '/streak/update',
    { schema: updateStreakSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { goalId, progressValue } = request.body as {
        goalId: string;
        progressValue: number;
      };

      const result = await goalsService.updateStreak(userId, goalId, progressValue);
      return reply.code(200).send(result);
    }
  );

  // =============================================================================
  // Stats Routes
  // =============================================================================

  // GET /api/v1/goals/stats - Get enhanced goal statistics
  fastify.get(
    '/stats',
    { schema: getStatsSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const stats = await goalsService.getStats(userId);
      return reply.code(200).send(stats);
    }
  );

  // =============================================================================
  // Badges Routes
  // =============================================================================

  // GET /api/v1/goals/badges - Get all badges for user
  fastify.get(
    '/badges',
    { schema: getBadgesSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const badges = await goalsService.getBadges(userId);
      return reply.code(200).send(badges);
    }
  );

  // POST /api/v1/goals/badges/:badgeId/unlock - Unlock a badge
  fastify.post(
    '/badges/:badgeId/unlock',
    { schema: unlockBadgeSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { badgeId } = request.params as { badgeId: string };

      try {
        const result = await goalsService.unlockBadge(userId, badgeId);
        return reply.code(200).send(result);
      } catch (error: any) {
        if (error.message === 'Badge already unlocked') {
          return reply.code(409).send({ error: error.message });
        }
        if (error.message === 'Badge not found') {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // PATCH /api/v1/goals/badges/:badgeId/viewed - Mark badge as viewed
  fastify.patch(
    '/badges/:badgeId/viewed',
    { schema: markBadgeViewedSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { badgeId } = request.params as { badgeId: string };

      const result = await goalsService.markBadgeViewed(userId, badgeId);
      return reply.code(200).send(result);
    }
  );
}
