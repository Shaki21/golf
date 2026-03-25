import { FastifyPluginAsync } from 'fastify';
import prisma from '../../../core/db/prisma';
import { ALL_BADGES, getBadgesByCategory, BADGE_SUMMARY } from '../../../domain/gamification/achievement-definitions';
import { BadgeCategory } from '../../../domain/gamification/types';
import {
  augmentBadgesWithAvailability,
  getBadgeAvailabilityStats,
} from '../../../domain/gamification/badge-availability';

/**
 * Badges API Routes
 * Provides badge definitions and player badge progress
 */
const badgesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all badge definitions with availability status
  fastify.get('/definitions', {
    handler: async (req, _reply) => {
      const { includeUnavailable = 'true' } = req.query as { includeUnavailable?: string };

      // Augment badges with availability info
      const augmentedBadges = augmentBadgesWithAvailability(ALL_BADGES);

      // Optionally filter out unavailable badges
      const badges = includeUnavailable === 'true'
        ? augmentedBadges
        : augmentedBadges.filter(b => b.isAvailable);

      // Get availability stats
      const availabilityStats = getBadgeAvailabilityStats(ALL_BADGES);

      return {
        badges,
        summary: {
          ...BADGE_SUMMARY,
          availability: availabilityStats,
        },
      };
    },
  });

  // Get badge definitions by category
  fastify.get('/definitions/:category', {
    handler: async (req, reply) => {
      const { category } = req.params as { category: string };
      const { includeUnavailable = 'true' } = req.query as { includeUnavailable?: string };

      // Validate category
      const validCategories = Object.values(BadgeCategory);
      if (!validCategories.includes(category as BadgeCategory)) {
        return reply.code(400).send({
          error: 'Invalid category',
          validCategories,
        });
      }

      const categoryBadges = getBadgesByCategory(category as BadgeCategory);
      const augmentedBadges = augmentBadgesWithAvailability(categoryBadges);

      const badges = includeUnavailable === 'true'
        ? augmentedBadges
        : augmentedBadges.filter(b => b.isAvailable);

      return {
        badges,
        count: badges.length,
        totalInCategory: categoryBadges.length,
      };
    },
  });

  // Get player badge progress (requires auth)
  fastify.get('/progress', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { id: string; playerId?: string; role: string };

      // Get playerId - either from token or by looking up user
      let playerId = user.playerId;
      if (!playerId && user.role === 'player') {
        // Look up player by userId
        const player = await prisma.player.findFirst({
          where: { id: user.id },
          select: { id: true },
        });
        playerId = player?.id;
      }

      if (!playerId) {
        // Return empty progress for non-player users
        return {
          unlockedBadges: [],
          badgeProgress: {},
          stats: {
            total: ALL_BADGES.length,
            unlocked: 0,
            inProgress: 0,
            locked: ALL_BADGES.length,
            percentComplete: 0,
          },
        };
      }

      // Get player's badge progress from database
      const playerBadges = await prisma.playerBadge.findMany({
        where: { playerId },
      });

      const unlockedBadges = playerBadges
        .filter(pb => pb.earnedAt !== null)
        .map(pb => pb.badgeId);

      const badgeProgress: Record<string, { current: number; target?: number }> = {};

      for (const pb of playerBadges) {
        badgeProgress[pb.badgeId] = {
          current: pb.progress ?? 0,
          target: pb.targetValue ?? undefined,
        };
      }

      // Calculate stats
      const inProgressCount = playerBadges.filter(
        pb => pb.earnedAt === null && (pb.progress ?? 0) > 0
      ).length;

      return {
        unlockedBadges,
        badgeProgress,
        stats: {
          total: ALL_BADGES.length,
          unlocked: unlockedBadges.length,
          inProgress: inProgressCount,
          locked: ALL_BADGES.length - unlockedBadges.length - inProgressCount,
          percentComplete: Math.round((unlockedBadges.length / ALL_BADGES.length) * 100),
        },
      };
    },
  });

  // Get recently unlocked badges
  fastify.get('/recent', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { id: string; playerId?: string };
      const { limit = 5 } = req.query as { limit?: number };

      if (!user.playerId) {
        return { badges: [] };
      }

      const recentBadges = await prisma.playerBadge.findMany({
        where: {
          playerId: user.playerId,
          earnedAt: { not: null },
        },
        orderBy: { earnedAt: 'desc' },
        take: Number(limit),
      });

      // Enrich with badge definitions
      const enrichedBadges = recentBadges.map(pb => {
        const definition = ALL_BADGES.find(b => b.id === pb.badgeId);
        return {
          ...pb,
          definition,
        };
      });

      return { badges: enrichedBadges };
    },
  });

  // Get badge leaderboard
  fastify.get('/leaderboard', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      const user = req.user as { tenantId: string };
      const { limit = 10 } = req.query as { limit?: number };

      // Get players with most badges in the tenant
      const leaderboard = await prisma.playerBadge.groupBy({
        by: ['playerId'],
        where: {
          earnedAt: { not: null },
          player: { tenantId: user.tenantId },
        },
        _count: { badgeId: true },
        orderBy: { _count: { badgeId: 'desc' } },
        take: Number(limit),
      });

      // Get player details
      const playerIds = leaderboard.map(l => l.playerId);
      const players = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        select: { id: true, firstName: true, lastName: true },
      });

      const playerMap = new Map(players.map(p => [p.id, p]));

      const enrichedLeaderboard = leaderboard.map((entry, index) => {
        const player = playerMap.get(entry.playerId);
        return {
          rank: index + 1,
          playerId: entry.playerId,
          playerName: player ? `${player.firstName} ${player.lastName}` : 'Ukjent',
          badgeCount: entry._count.badgeId,
        };
      });

      return { leaderboard: enrichedLeaderboard };
    },
  });

  // Award badge to player (internal/admin use)
  fastify.post('/award', {
    onRequest: [fastify.authenticate],
    handler: async (req, reply) => {
      const user = req.user as { role: string; playerId?: string };
      const { badgeId, playerId } = req.body as { badgeId: string; playerId?: string };

      // Only coaches/admins can award to others, players can only receive
      const targetPlayerId = playerId || user.playerId;

      if (!targetPlayerId) {
        return reply.code(400).send({ error: 'No player ID specified' });
      }

      // Verify badge exists
      const badgeDefinition = ALL_BADGES.find(b => b.id === badgeId);
      if (!badgeDefinition) {
        return reply.code(404).send({ error: 'Badge not found' });
      }

      // Check if already earned
      const existing = await prisma.playerBadge.findUnique({
        where: {
          playerId_badgeId: {
            playerId: targetPlayerId,
            badgeId,
          },
        },
      });

      if (existing?.earnedAt) {
        return reply.code(409).send({ error: 'Badge already earned' });
      }

      // Award the badge
      const badge = await prisma.playerBadge.upsert({
        where: {
          playerId_badgeId: {
            playerId: targetPlayerId,
            badgeId,
          },
        },
        update: {
          earnedAt: new Date(),
          progress: 100,
        },
        create: {
          playerId: targetPlayerId,
          badgeId,
          earnedAt: new Date(),
          progress: 100,
        },
      });

      return {
        success: true,
        badge: {
          ...badge,
          definition: badgeDefinition,
        },
      };
    },
  });
};

export default badgesRoutes;
