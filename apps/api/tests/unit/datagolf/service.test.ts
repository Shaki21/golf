/**
 * DataGolf Service Unit Tests
 * Tests DataGolf sync logic, rate limiting, and error handling
 */

import { DataGolfService } from '../../../src/api/v1/datagolf/service';
import { DataGolfClient } from '../../../src/integrations/datagolf/client';
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../src/middleware/errors';

// Mock dependencies
jest.mock('../../../src/integrations/datagolf/client');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Prisma Client
const mockPrisma = {
  player: {
    findFirst: jest.fn(),
  },
  dataGolfPlayer: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  dataGolfTourAverage: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  testResult: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('DataGolfService', () => {
  let service: DataGolfService;
  let mockDataGolfClient: jest.Mocked<DataGolfClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DataGolfService(mockPrisma);
    mockDataGolfClient = (service as any).dataGolfClient;
  });

  describe('getDataGolfPlayer', () => {
    it('should return DataGolf player data when player exists', async () => {
      const playerId = 'player-123';
      const tenantId = 'tenant-123';

      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue({
        id: playerId,
        tenantId,
        firstName: 'Test',
        lastName: 'Player',
      });

      (mockPrisma.dataGolfPlayer.findFirst as jest.Mock).mockResolvedValue({
        iupPlayerId: playerId,
        dataGolfId: 'dg-123',
        playerName: 'Test Player',
        tour: 'pga',
        lastSynced: new Date(),
        sgTotal: 1.5,
        sgOffTee: 0.5,
        sgApproach: 0.4,
        sgAroundGreen: 0.3,
        sgPutting: 0.3,
        drivingDistance: 300,
        drivingAccuracy: 0.65,
        girPercent: 0.70,
        scramblingPercent: 0.58,
        puttsPerRound: 29,
      });

      const result = await service.getDataGolfPlayer(tenantId, playerId);

      expect(result).toEqual({
        playerId,
        dataGolfPlayerId: 'dg-123',
        playerName: 'Test Player',
        tour: 'pga',
        lastUpdated: expect.any(Date),
        strokesGainedTotal: 1.5,
        strokesGainedOTT: 0.5,
        strokesGainedAPR: 0.4,
        strokesGainedARG: 0.3,
        strokesGainedPutting: 0.3,
        drivingDistance: 300,
        drivingAccuracy: 0.65,
        scoringAverage: null,
        birdiesToPars: null,
        greensInRegulation: 0.70,
        scrambling: 0.58,
        puttsPerRound: 29,
      });
    });

    it('should throw NotFoundError when player does not exist', async () => {
      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getDataGolfPlayer('tenant-123', 'player-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should return null when DataGolf player data does not exist', async () => {
      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue({
        id: 'player-123',
        tenantId: 'tenant-123',
      });

      (mockPrisma.dataGolfPlayer.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getDataGolfPlayer('tenant-123', 'player-123');
      expect(result).toBeNull();
    });
  });

  describe('getTourAverages', () => {
    it('should return tour averages when data exists', async () => {
      const mockTourAverage = {
        tour: 'pga',
        season: 2025,
        stats: {
          avgSgTotal: 0.0,
          avgSgOtt: 0.0,
          avgSgApp: 0.0,
          avgSgArg: 0.0,
          avgSgPutt: 0.0,
          avgDrivingDistance: 295,
          avgDrivingAccuracy: 0.60,
          avgScoringAverage: 70.5,
          avgGreensInRegulation: 0.65,
          avgScrambling: 0.55,
          avgPuttsPerRound: 29.5,
        },
        updatedAt: new Date(),
      };

      (mockPrisma.dataGolfTourAverage.findFirst as jest.Mock).mockResolvedValue(mockTourAverage);

      const result = await service.getTourAverages('pga', 2025);

      expect(result).toEqual({
        tour: 'pga',
        season: 2025,
        lastUpdated: expect.any(Date),
        avgStrokesGainedTotal: 0.0,
        avgStrokesGainedOTT: 0.0,
        avgStrokesGainedAPR: 0.0,
        avgStrokesGainedARG: 0.0,
        avgStrokesGainedPutting: 0.0,
        avgDrivingDistance: 295,
        avgDrivingAccuracy: 0.60,
        avgScoringAverage: 70.5,
        avgGreensInRegulation: 0.65,
        avgScrambling: 0.55,
        avgPuttsPerRound: 29.5,
      });
    });

    it('should return null when tour averages do not exist', async () => {
      (mockPrisma.dataGolfTourAverage.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getTourAverages('pga', 2025);
      expect(result).toBeNull();
    });
  });

  describe('syncDataGolf', () => {
    it('should successfully sync PGA tour data', async () => {
      const mockSkillRatings = [
        { dg_id: 1, player_name: 'Player 1', sg_total: 2.0, sg_ott: 0.5, sg_app: 0.6, sg_arg: 0.4, sg_putt: 0.5 },
        { dg_id: 2, player_name: 'Player 2', sg_total: 1.5, sg_ott: 0.4, sg_app: 0.5, sg_arg: 0.3, sg_putt: 0.3 },
        { dg_id: 3, player_name: 'Viktor Hovland', sg_total: 1.8, sg_ott: 0.6, sg_app: 0.5, sg_arg: 0.4, sg_putt: 0.3 },
      ];

      mockDataGolfClient.isConfigured = jest.fn().mockReturnValue(true);
      mockDataGolfClient.getSkillRatings = jest.fn().mockResolvedValue(mockSkillRatings);
      (mockPrisma.dataGolfTourAverage.upsert as jest.Mock).mockResolvedValue({});
      (mockPrisma.dataGolfPlayer.upsert as jest.Mock).mockResolvedValue({});

      const result = await service.syncDataGolf('tenant-123');

      expect(result.syncStatus).toBe('success');
      expect(result.playersUpdated).toBeGreaterThan(0);
      expect(result.tourAveragesUpdated).toBe(1);
      expect(mockDataGolfClient.getSkillRatings).toHaveBeenCalledWith('pga');
      expect(mockPrisma.dataGolfTourAverage.upsert).toHaveBeenCalled();
      expect(mockPrisma.dataGolfPlayer.upsert).toHaveBeenCalled();
    });

    it('should fail when DataGolf API is not configured', async () => {
      mockDataGolfClient.isConfigured = jest.fn().mockReturnValue(false);

      const result = await service.syncDataGolf('tenant-123');

      expect(result.syncStatus).toBe('failed');
      expect(result.playersUpdated).toBe(0);
      expect(result.tourAveragesUpdated).toBe(0);
      expect(result.errors).toContain('DataGolf API key not configured');
    });

    it('should handle API errors gracefully', async () => {
      mockDataGolfClient.isConfigured = jest.fn().mockReturnValue(true);
      mockDataGolfClient.getSkillRatings = jest.fn().mockRejectedValue(new Error('API Error'));

      const result = await service.syncDataGolf('tenant-123');

      expect(result.syncStatus).toBe('failed');
      expect(result.playersUpdated).toBe(0);
      expect(result.tourAveragesUpdated).toBe(0);
      expect(result.errors).toContain('API Error');
    });

    it('should sync top 100 players + Norwegian players', async () => {
      const mockSkillRatings = Array.from({ length: 150 }, (_, i) => ({
        dg_id: i + 1,
        player_name: `Player ${i + 1}`,
        sg_total: 2.0 - i * 0.01,
        sg_ott: 0.5,
        sg_app: 0.5,
        sg_arg: 0.5,
        sg_putt: 0.5,
      }));

      // Add Norwegian players
      mockSkillRatings.push({
        dg_id: 999,
        player_name: 'Viktor Hovland',
        sg_total: 1.5,
        sg_ott: 0.5,
        sg_app: 0.5,
        sg_arg: 0.3,
        sg_putt: 0.2,
      });

      mockDataGolfClient.isConfigured = jest.fn().mockReturnValue(true);
      mockDataGolfClient.getSkillRatings = jest.fn().mockResolvedValue(mockSkillRatings);
      (mockPrisma.dataGolfTourAverage.upsert as jest.Mock).mockResolvedValue({});
      (mockPrisma.dataGolfPlayer.upsert as jest.Mock).mockResolvedValue({});

      const result = await service.syncDataGolf('tenant-123');

      expect(result.syncStatus).toBe('success');
      // Should sync top 100 + Viktor Hovland (101 total, but Viktor might be in top 100)
      expect(result.playersUpdated).toBeGreaterThanOrEqual(100);
      expect(result.playersUpdated).toBeLessThanOrEqual(101);
    });

    it('should handle partial sync failures', async () => {
      const mockSkillRatings = [
        { dg_id: 1, player_name: 'Player 1', sg_total: 2.0, sg_ott: 0.5, sg_app: 0.5, sg_arg: 0.5, sg_putt: 0.5 },
        { dg_id: 2, player_name: 'Player 2', sg_total: 1.5, sg_ott: 0.5, sg_app: 0.5, sg_arg: 0.5, sg_putt: 0.5 },
      ];

      mockDataGolfClient.isConfigured = jest.fn().mockReturnValue(true);
      mockDataGolfClient.getSkillRatings = jest.fn().mockResolvedValue(mockSkillRatings);
      (mockPrisma.dataGolfTourAverage.upsert as jest.Mock).mockResolvedValue({});

      // First player succeeds, second fails
      (mockPrisma.dataGolfPlayer.upsert as jest.Mock)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await service.syncDataGolf('tenant-123');

      expect(result.syncStatus).toBe('completed_with_errors');
      expect(result.playersUpdated).toBe(1);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('compareToTour', () => {
    it('should compare player performance to tour averages', async () => {
      const playerId = 'player-123';
      const tenantId = 'tenant-123';

      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue({
        id: playerId,
        tenantId,
        firstName: 'Test',
        lastName: 'Player',
        category: 'A',
      });

      (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'test-1',
          playerId,
          testId: 'test-driving',
          value: 280,
          testDate: new Date(),
          test: {
            testNumber: 1,
            name: 'Driving Distance',
          },
        },
      ]);

      (mockPrisma.dataGolfTourAverage.findFirst as jest.Mock).mockResolvedValue({
        tour: 'PGA',
        season: 2025,
        stats: {
          avgSgTotal: 0.0,
          avgDrivingDistance: 295,
        },
        updatedAt: new Date(),
      });

      const result = await service.compareToTour(tenantId, playerId, 'PGA', 2025);

      expect(result.playerId).toBe(playerId);
      expect(result.playerName).toBe('Test Player');
      expect(result.category).toBe('A');
      expect(result.comparisons).toBeDefined();
      expect(result.overallAssessment).toBeDefined();
      expect(result.overallAssessment.totalTests).toBeGreaterThanOrEqual(0);
    });

    it('should throw NotFoundError when player does not exist', async () => {
      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.compareToTour('tenant-123', 'player-123', 'PGA', 2025)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when tour averages do not exist', async () => {
      (mockPrisma.player.findFirst as jest.Mock).mockResolvedValue({
        id: 'player-123',
        tenantId: 'tenant-123',
        firstName: 'Test',
        lastName: 'Player',
      });

      (mockPrisma.testResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.dataGolfTourAverage.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.compareToTour('tenant-123', 'player-123', 'PGA', 2025)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getSyncStatus', () => {
    it('should return current sync status', async () => {
      const lastSyncDate = new Date('2025-01-01T00:00:00Z');

      (mockPrisma.dataGolfPlayer.findFirst as jest.Mock).mockResolvedValue({
        lastSynced: lastSyncDate,
      });

      (mockPrisma.dataGolfPlayer.count as jest.Mock).mockResolvedValue(105);
      (mockPrisma.dataGolfTourAverage.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getSyncStatus();

      expect(result.lastSyncAt).toEqual(lastSyncDate);
      expect(result.playersUpdated).toBe(105);
      expect(result.tourAveragesUpdated).toBe(1);
      expect(result.syncStatus).toBe('idle');
    });

    it('should handle no previous sync', async () => {
      (mockPrisma.dataGolfPlayer.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.dataGolfPlayer.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.dataGolfTourAverage.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getSyncStatus();

      expect(result.lastSyncAt).toEqual(new Date(0));
      expect(result.playersUpdated).toBe(0);
      expect(result.tourAveragesUpdated).toBe(0);
    });
  });

  describe('private methods', () => {
    describe('calculateAverage', () => {
      it('should calculate average correctly', () => {
        const data = [
          { value: 10 },
          { value: 20 },
          { value: 30 },
        ];

        // Access private method via type assertion
        const result = (service as any).calculateAverage(data, 'value');
        expect(result).toBe(20);
      });

      it('should handle empty arrays', () => {
        const result = (service as any).calculateAverage([], 'value');
        expect(result).toBe(0);
      });

      it('should filter out null/undefined values', () => {
        const data = [
          { value: 10 },
          { value: null },
          { value: 20 },
          { value: undefined },
          { value: 30 },
        ];

        const result = (service as any).calculateAverage(data, 'value');
        expect(result).toBe(20);
      });

      it('should filter out NaN values', () => {
        const data = [
          { value: 10 },
          { value: NaN },
          { value: 20 },
        ];

        const result = (service as any).calculateAverage(data, 'value');
        expect(result).toBe(15);
      });
    });

    describe('calculateNextSync', () => {
      it('should calculate next sync at 03:00 UTC', () => {
        const result = (service as any).calculateNextSync();

        expect(result.getUTCHours()).toBe(3);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCSeconds()).toBe(0);
        expect(result.getTime()).toBeGreaterThan(Date.now());
      });
    });

    describe('getPlayersToSync', () => {
      it('should return top 100 players', () => {
        const skillRatings = Array.from({ length: 150 }, (_, i) => ({
          dg_id: i + 1,
          player_name: `Player ${i + 1}`,
          sg_total: 2.0 - i * 0.01,
        }));

        const result = (service as any).getPlayersToSync(skillRatings);

        expect(result.length).toBeGreaterThanOrEqual(100);
        expect(result.length).toBeLessThanOrEqual(104); // 100 + up to 4 Norwegian players
      });

      it('should include Norwegian players', () => {
        const skillRatings = [
          { dg_id: 1, player_name: 'Player 1', sg_total: 2.0 },
          { dg_id: 2, player_name: 'Viktor Hovland', sg_total: 1.5 },
          { dg_id: 3, player_name: 'Ludvig Åberg', sg_total: 1.4 },
        ];

        const result = (service as any).getPlayersToSync(skillRatings);

        const norwegianPlayers = result.filter((p: any) =>
          p.player_name === 'Viktor Hovland' || p.player_name === 'Ludvig Åberg'
        );

        expect(norwegianPlayers.length).toBeGreaterThanOrEqual(2);
      });

      it('should deduplicate players', () => {
        const skillRatings = Array.from({ length: 10 }, (_, i) => ({
          dg_id: i + 1,
          player_name: i === 5 ? 'Viktor Hovland' : `Player ${i + 1}`,
          sg_total: 2.0 - i * 0.01,
        }));

        const result = (service as any).getPlayersToSync(skillRatings);

        // Viktor Hovland should only appear once
        const viktorCount = result.filter((p: any) => p.player_name === 'Viktor Hovland').length;
        expect(viktorCount).toBe(1);
      });
    });
  });
});
