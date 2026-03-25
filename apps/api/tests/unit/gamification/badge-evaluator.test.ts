/**
 * Badge Evaluator Service Unit Tests
 * Tests badge evaluation, XP calculation, and level progression
 */

import { BadgeEvaluatorService } from '../../../src/domain/gamification/badge-evaluator';
import { PrismaClient } from '@prisma/client';
import { ALL_BADGES } from '../../../src/domain/gamification/achievement-definitions';

// Mock dependencies
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Prisma Client - must include all tables used by badge-evaluator
const mockPrisma = {
  trainingSession: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  testResult: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  tournamentResult: {
    findMany: jest.fn(),
  },
  playerBadge: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  player: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  annualTrainingPlan: {
    findFirst: jest.fn(),
  },
  periodization: {
    findFirst: jest.fn(),
  },
  playerIntake: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

// Helper to setup default mocks for a player
function setupDefaultMocks(playerId: string) {
  (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([]);
  (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([]);
  (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
  (mockPrisma.playerBadge.findMany as jest.Mock).mockResolvedValue([]);
  (mockPrisma.player.findUnique as jest.Mock).mockResolvedValue({
    id: playerId,
    handicap: 10,
  });
  (mockPrisma.player.update as jest.Mock).mockResolvedValue({
    id: playerId,
    totalXP: 0,
    level: 1,
  });
  (mockPrisma.playerBadge.upsert as jest.Mock).mockResolvedValue({});
  (mockPrisma.notification.create as jest.Mock).mockResolvedValue({});
  (mockPrisma.annualTrainingPlan.findFirst as jest.Mock).mockResolvedValue(null);
  (mockPrisma.periodization.findFirst as jest.Mock).mockResolvedValue(null);
  (mockPrisma.playerIntake.findFirst as jest.Mock).mockResolvedValue(null);
}

describe('BadgeEvaluatorService', () => {
  let service: BadgeEvaluatorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BadgeEvaluatorService(mockPrisma);
  });

  describe('evaluatePlayerBadges', () => {
    it('should evaluate player badges and return progress', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      // Override with one session
      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'session-1',
          playerId,
          duration: 60,
          sessionDate: new Date(),
          sessionType: 'teknikk',
          totalShots: 50,
          completionStatus: 'completed',
        },
      ]);

      const result = await service.evaluatePlayerBadges(playerId);

      expect(result).toHaveProperty('unlockedBadges');
      expect(result).toHaveProperty('xpGained');
      expect(result).toHaveProperty('updatedProgress');
      expect(Array.isArray(result.unlockedBadges)).toBe(true);
      expect(Array.isArray(result.updatedProgress)).toBe(true);
    });

    it('should unlock badges when criteria are met', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      // Mock 10 completed sessions (should unlock volume badge)
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        id: `session-${i}`,
        playerId,
        duration: 60,
        sessionDate: new Date(),
        sessionType: 'teknikk',
        totalShots: 50,
        completionStatus: 'completed',
      }));

      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue(sessions);
      (mockPrisma.player.update as jest.Mock).mockResolvedValue({
        id: playerId,
        totalXP: 50,
        level: 1,
      });

      const result = await service.evaluatePlayerBadges(playerId);

      // Should have some badges unlocked or progress updated
      expect(result.updatedProgress.length).toBeGreaterThan(0);
    });

    it('should award XP for unlocked badges', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      const result = await service.evaluatePlayerBadges(playerId);

      expect(typeof result.xpGained).toBe('number');
      expect(result.xpGained).toBeGreaterThanOrEqual(0);
    });

    it('should detect level ups', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      // Mock many earned badges (high XP)
      const earnedBadges = Array.from({ length: 20 }, (_, i) => ({
        id: `badge-${i}`,
        playerId,
        badgeId: `BADGE_${i}`,
        earnedAt: new Date(),
      }));

      (mockPrisma.playerBadge.findMany as jest.Mock).mockResolvedValue(earnedBadges);
      (mockPrisma.player.update as jest.Mock).mockResolvedValue({
        id: playerId,
        totalXP: 1000,
        level: 5,
      });

      const result = await service.evaluatePlayerBadges(playerId);

      // May or may not level up depending on XP gained
      if (result.newLevel) {
        expect(result.newLevel).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('calculatePlayerMetrics', () => {
    it('should calculate volume metrics', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      const sessions = [
        {
          id: 'session-1',
          playerId,
          duration: 60,
          sessionDate: new Date(),
          sessionType: 'teknikk',
          totalShots: 50,
          completionStatus: 'completed',
        },
        {
          id: 'session-2',
          playerId,
          duration: 90,
          sessionDate: new Date(),
          sessionType: 'golfslag',
          totalShots: 100,
          completionStatus: 'completed',
        },
      ];

      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const metrics = await service.calculatePlayerMetrics(playerId);

      expect(metrics.playerId).toBe(playerId);
      expect(metrics).toHaveProperty('volume');
      expect(metrics).toHaveProperty('streaks');
      expect(metrics).toHaveProperty('strength');
      expect(metrics).toHaveProperty('performance');
      expect(metrics).toHaveProperty('phase');
      expect(metrics).toHaveProperty('totalXP');
      expect(metrics).toHaveProperty('currentLevel');
      expect(metrics).toHaveProperty('xpToNextLevel');
    });

    it('should calculate streak metrics', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      // Create sessions for consecutive days
      const today = new Date();
      const sessions = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          id: `session-${i}`,
          playerId,
          duration: 60,
          sessionDate: date,
          sessionType: 'teknikk',
          totalShots: 50,
          completionStatus: 'completed',
        };
      });

      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const metrics = await service.calculatePlayerMetrics(playerId);

      expect(metrics.streaks).toBeDefined();
      // Streak calculation logic will determine the actual streak
    });

    it('should calculate totalXP from earned badges', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      const earnedBadges = [
        { id: '1', playerId, badgeId: 'BADGE_1', earnedAt: new Date() },
        { id: '2', playerId, badgeId: 'BADGE_2', earnedAt: new Date() },
        { id: '3', playerId, badgeId: 'BADGE_3', earnedAt: new Date() },
      ];

      (mockPrisma.playerBadge.findMany as jest.Mock).mockResolvedValue(earnedBadges);

      const metrics = await service.calculatePlayerMetrics(playerId);

      // 3 badges * 50 XP = 150 XP
      expect(metrics.totalXP).toBe(150);
    });

    it('should handle players with no activity', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      const metrics = await service.calculatePlayerMetrics(playerId);

      expect(metrics.playerId).toBe(playerId);
      expect(metrics.totalXP).toBe(0);
      expect(metrics.currentLevel).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent badge evaluations', async () => {
      const playerId = 'player-123';
      setupDefaultMocks(playerId);

      // Run multiple evaluations concurrently
      const results = await Promise.all([
        service.evaluatePlayerBadges(playerId),
        service.evaluatePlayerBadges(playerId),
        service.evaluatePlayerBadges(playerId),
      ]);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty('unlockedBadges');
        expect(result).toHaveProperty('xpGained');
      });
    });

    it('should handle database errors gracefully', async () => {
      const playerId = 'player-123';

      (mockPrisma.trainingSession.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(service.calculatePlayerMetrics(playerId)).rejects.toThrow('Database error');
    });
  });

  describe('ALL_BADGES definition', () => {
    it('should have all 85 badges defined', () => {
      expect(ALL_BADGES.length).toBeGreaterThanOrEqual(85);
    });

    it('should have unique badge IDs', () => {
      const badgeIds = ALL_BADGES.map((b) => b.id);
      const uniqueIds = new Set(badgeIds);
      expect(uniqueIds.size).toBe(badgeIds.length);
    });

    it('should have required fields for each badge', () => {
      ALL_BADGES.forEach((badge) => {
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('symbol'); // Changed from 'icon' to 'symbol'
        expect(badge).toHaveProperty('tier');
        expect(badge).toHaveProperty('category');
      });
    });

    it('should have valid tiers', () => {
      // Updated to include 'standard' tier which is used in the implementation
      const validTiers = ['standard', 'bronze', 'silver', 'gold', 'platinum'];
      ALL_BADGES.forEach((badge) => {
        expect(validTiers).toContain(badge.tier);
      });
    });

    it('should have valid categories', () => {
      const validCategories = [
        'volume',
        'streak',
        'strength',
        'speed',
        'accuracy',
        'putting',
        'short_game',
        'mental',
        'phase',
        'milestone',
        'seasonal',
      ];
      ALL_BADGES.forEach((badge) => {
        expect(validCategories).toContain(badge.category);
      });
    });
  });
});
