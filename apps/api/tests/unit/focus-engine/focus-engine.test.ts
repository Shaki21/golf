/**
 * Focus Engine Service Unit Tests
 * Tests focus calculation logic
 */

import { PrismaClient } from '@prisma/client';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocks
import { FocusEngineService } from '../../../src/domain/focus-engine/focus-engine.service';

// Mock Prisma Client
const createMockPrisma = () => ({
  player: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  testResult: {
    findMany: jest.fn(),
  },
  testComponentMapping: {
    findMany: jest.fn(),
  },
  dgComponentWeight: {
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  dgPlayerSeason: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
  },
  dgApproachSkillL24: {
    findMany: jest.fn(),
  },
  dataGolfPlayer: {
    findFirst: jest.fn(),
  },
  eventParticipant: {
    count: jest.fn(),
  },
  playerFocusCache: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
} as unknown as PrismaClient);

describe('FocusEngineService', () => {
  let service: FocusEngineService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    service = new FocusEngineService(mockPrisma);
  });

  describe('calculatePlayerFocus', () => {
    const tenantId = 'tenant-123';
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mocks
      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue({
        id: 'player-123',
        firstName: 'Test',
        lastName: 'Player',
      });

      (mockPrisma.playerFocusCache.findUnique as jest.Mock).mockResolvedValue(null);

      (mockPrisma.dgComponentWeight.findFirst as jest.Mock).mockResolvedValue({
        windowStartSeason: 2022,
        windowEndSeason: 2024,
        wOtt: 0.25,
        wApp: 0.35,
        wArg: 0.20,
        wPutt: 0.20,
        computedAt: new Date(),
        isActive: true,
      });

      (mockPrisma.testComponentMapping.findMany as jest.Mock).mockResolvedValue([
        { testNumber: 1, component: 'OTT', weight: 1.0 },
        { testNumber: 10, component: 'APP', weight: 1.0 },
        { testNumber: 17, component: 'ARG', weight: 1.0 },
        { testNumber: 15, component: 'PUTT', weight: 1.0 },
      ]);

      (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([
        { test: { testNumber: 1 }, value: 70, testDate: new Date() },
        { test: { testNumber: 10 }, value: 40, testDate: new Date() },
        { test: { testNumber: 17 }, value: 60, testDate: new Date() },
        { test: { testNumber: 15 }, value: 80, testDate: new Date() },
      ]);

      (mockPrisma.playerFocusCache.upsert as jest.Mock).mockResolvedValue({});
    });

    it('should calculate focus for a player with test results', async () => {
      const result = await service.calculatePlayerFocus(tenantId, userId, false);

      expect(result).toHaveProperty('focusComponent');
      expect(result).toHaveProperty('focusScores');
      expect(result).toHaveProperty('recommendedSplit');
      expect(result).toHaveProperty('reasonCodes');
      expect(result).toHaveProperty('confidence');
      expect(result.playerId).toBe('player-123');
    });

    it('should identify APP as focus when approach scores are weak', async () => {
      // Approach is weakest (40 vs 60-80 for others)
      const result = await service.calculatePlayerFocus(tenantId, userId, false);

      // APP should be identified as focus due to low score and high weight
      expect(result.focusComponent).toBe('APP');
    });

    it('should return high confidence with sufficient test data', async () => {
      // Need 6+ mapped tests for high confidence
      // Update mappings to include more tests
      (mockPrisma.testComponentMapping.findMany as jest.Mock).mockResolvedValue([
        { testNumber: 1, component: 'OTT', weight: 1.0 },
        { testNumber: 2, component: 'OTT', weight: 0.8 },
        { testNumber: 5, component: 'OTT', weight: 1.0 },
        { testNumber: 10, component: 'APP', weight: 1.0 },
        { testNumber: 11, component: 'APP', weight: 0.8 },
        { testNumber: 17, component: 'ARG', weight: 1.0 },
        { testNumber: 15, component: 'PUTT', weight: 1.0 },
      ]);

      // Add more test results (7 results, all mapped)
      (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([
        { test: { testNumber: 1 }, value: 70, testDate: new Date() },
        { test: { testNumber: 2 }, value: 65, testDate: new Date() },
        { test: { testNumber: 5 }, value: 75, testDate: new Date() },
        { test: { testNumber: 10 }, value: 40, testDate: new Date() },
        { test: { testNumber: 11 }, value: 45, testDate: new Date() },
        { test: { testNumber: 17 }, value: 60, testDate: new Date() },
        { test: { testNumber: 15 }, value: 80, testDate: new Date() },
      ]);

      const result = await service.calculatePlayerFocus(tenantId, userId, false);

      expect(result.confidence).toBe('high');
    });

    it('should return low confidence with minimal test data', async () => {
      (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([
        { test: { testNumber: 1 }, value: 70, testDate: new Date() },
      ]);

      const result = await service.calculatePlayerFocus(tenantId, userId, false);

      expect(result.confidence).toBe('low');
      expect(result.reasonCodes).toContain('insufficient_test_data');
    });

    it('should throw error if player not found', async () => {
      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.calculatePlayerFocus(tenantId, userId, false)).rejects.toThrow(
        'Player not found'
      );
    });

    it('should respect split constraints (min 10%, max 50%)', async () => {
      const result = await service.calculatePlayerFocus(tenantId, userId, false);

      Object.values(result.recommendedSplit).forEach((split) => {
        expect(split).toBeGreaterThanOrEqual(0.1);
        expect(split).toBeLessThanOrEqual(0.5);
      });

      // Sum should equal 1
      const sum = Object.values(result.recommendedSplit).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 1);
    });
  });

  describe('calculateTeamFocus', () => {
    const tenantId = 'tenant-123';
    const coachId = 'coach-123';
    const teamId = 'team-123';

    beforeEach(() => {
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([
        { id: 'p1', firstName: 'Player', lastName: 'One', userId: 'u1' },
        { id: 'p2', firstName: 'Player', lastName: 'Two', userId: 'u2' },
      ]);

      (mockPrisma.dgComponentWeight.findFirst as jest.Mock).mockResolvedValue({
        windowStartSeason: 2022,
        windowEndSeason: 2024,
        wOtt: 0.25,
        wApp: 0.35,
        wArg: 0.20,
        wPutt: 0.20,
        computedAt: new Date(),
        isActive: true,
      });

      (mockPrisma.testComponentMapping.findMany as jest.Mock).mockResolvedValue([
        { testNumber: 1, component: 'OTT', weight: 1.0 },
        { testNumber: 10, component: 'APP', weight: 1.0 },
      ]);

      (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([
        { test: { testNumber: 1 }, value: 70, testDate: new Date() },
        { test: { testNumber: 10 }, value: 40, testDate: new Date() },
      ]);

      (mockPrisma.eventParticipant.count as jest.Mock).mockResolvedValue(3);
    });

    it('should return heatmap for team', async () => {
      const result = await service.calculateTeamFocus(tenantId, coachId, teamId);

      expect(result).toHaveProperty('heatmap');
      expect(result).toHaveProperty('playerCount');
      expect(result).toHaveProperty('topReasonCodes');
      expect(result).toHaveProperty('atRiskPlayers');
      expect(result.playerCount).toBe(2);
    });

    it('should return empty result when no players', async () => {
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.calculateTeamFocus(tenantId, coachId, teamId);

      expect(result.playerCount).toBe(0);
      expect(result.heatmap).toEqual({ OTT: 0, APP: 0, ARG: 0, PUTT: 0 });
    });

    it('should identify at-risk players with low adherence', async () => {
      // Low adherence
      (mockPrisma.eventParticipant.count as jest.Mock).mockResolvedValue(0);

      const result = await service.calculateTeamFocus(tenantId, coachId, teamId);

      expect(result.atRiskPlayers.length).toBe(2);
      result.atRiskPlayers.forEach((player) => {
        expect(player.adherenceScore).toBeLessThan(50);
        expect(player.reason).toBe('low_training_adherence');
      });
    });
  });
});
