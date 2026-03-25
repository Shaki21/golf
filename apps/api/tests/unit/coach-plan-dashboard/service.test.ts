/**
 * Coach Plan Dashboard Service Unit Tests
 * Tests state machine logic and data aggregation
 */

import { PrismaClient } from '@prisma/client';
import { CoachPlanDashboardService } from '../../../src/api/v1/coach-plan-dashboard/service';

// Mock Prisma Client
const createMockPrisma = () => ({
  trainingSession: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  player: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  annualTrainingPlan: {
    findFirst: jest.fn(),
  },
  tournamentResult: {
    findMany: jest.fn(),
  },
  tournament: {
    findMany: jest.fn(),
  },
  tournamentPreparation: {
    count: jest.fn(),
  },
} as unknown as PrismaClient);

describe('CoachPlanDashboardService', () => {
  let service: CoachPlanDashboardService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  const coachId = 'coach-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    service = new CoachPlanDashboardService(mockPrisma);
  });

  describe('getDashboard', () => {
    beforeEach(() => {
      // Default empty state mocks
      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournament.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('should return all_clear state when no actions needed', async () => {
      const result = await service.getDashboard(coachId);

      expect(result.state).toBe('all_clear');
      expect(result.primaryAction.type).toBe('view_dashboard');
      expect(result.attentionCount).toBe(0);
    });

    it('should return correct team load stats structure', async () => {
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getDashboard(coachId);

      expect(result.teamLoadStats).toHaveProperty('totalPlayers');
      expect(result.teamLoadStats).toHaveProperty('activePlayers');
      expect(result.teamLoadStats).toHaveProperty('sessionsThisWeek');
      expect(result.teamLoadStats).toHaveProperty('pendingReviews');
    });
  });

  describe('State Machine Priority', () => {
    beforeEach(() => {
      // Default mocks
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournament.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('should prioritize unreviewed_sessions (Priority 1)', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3);

      // Mock unreviewed sessions
      (mockPrisma.trainingSession.findMany as jest.Mock).mockImplementation((args) => {
        // Check if this is the unreviewed sessions query
        if (args?.where?.completionStatus === 'completed' && args?.where?.evaluationTechnical === null) {
          return Promise.resolve([{
            id: 'session-1',
            sessionDate: sevenDaysAgo,
            player: {
              id: 'player-1',
              firstName: 'John',
              lastName: 'Doe',
              category: 'A',
            },
          }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getDashboard(coachId);

      expect(result.state).toBe('unreviewed_sessions');
      expect(result.primaryAction.type).toBe('review_session');
      expect(result.primaryAction.count).toBe(1);
    });

    it('should prioritize today_sessions when no higher priority items (Priority 4)', async () => {
      const today = new Date();
      today.setHours(14, 0, 0, 0);

      // Mock today's sessions
      (mockPrisma.trainingSession.findMany as jest.Mock).mockImplementation((args) => {
        // Check if this is the today's sessions query (not completed)
        if (args?.where?.completionStatus?.not === 'completed') {
          return Promise.resolve([{
            id: 'session-1',
            sessionDate: today,
            sessionType: 'coaching',
            duration: 60,
            evaluationFocus: 'Putting practice',
            player: {
              id: 'player-1',
              firstName: 'Jane',
              lastName: 'Smith',
            },
          }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getDashboard(coachId);

      expect(result.state).toBe('today_sessions');
      expect(result.primaryAction.type).toBe('view_today_sessions');
      expect(result.todaySessions.length).toBe(1);
    });

    it('should prioritize players_inactive when no higher priority items (Priority 5)', async () => {
      // Mock inactive players
      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([{
        id: 'player-1',
        firstName: 'Inactive',
        lastName: 'Player',
        category: 'B',
        trainingSessions: [], // No recent sessions
      }]);

      const result = await service.getDashboard(coachId);

      expect(result.state).toBe('players_inactive');
      expect(result.primaryAction.type).toBe('check_inactive_players');
    });
  });

  describe('Attention Items', () => {
    beforeEach(() => {
      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournament.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('should count warnings and errors for attentionCount', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3);

      // Mock unreviewed sessions (creates warning)
      (mockPrisma.trainingSession.findMany as jest.Mock).mockImplementation((args) => {
        if (args?.where?.completionStatus === 'completed' && args?.where?.evaluationTechnical === null) {
          return Promise.resolve([{
            id: 'session-1',
            sessionDate: sevenDaysAgo,
            player: { id: 'player-1', firstName: 'John', lastName: 'Doe', category: 'A' },
          }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getDashboard(coachId);

      expect(result.attentionCount).toBeGreaterThan(0);
      expect(result.attentionItems.some(item => item.severity === 'warning')).toBe(true);
    });

    it('should not count info items in attentionCount', async () => {
      // Mock inactive players (creates info item)
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([{
        id: 'player-1',
        firstName: 'Inactive',
        lastName: 'Player',
        category: 'C',
        trainingSessions: [],
      }]);

      const result = await service.getDashboard(coachId);

      // Inactive players create 'info' severity, which shouldn't count
      const infoItems = result.attentionItems.filter(item => item.severity === 'info');
      const warningErrorItems = result.attentionItems.filter(
        item => item.severity === 'warning' || item.severity === 'error'
      );

      expect(result.attentionCount).toBe(warningErrorItems.length);
    });
  });

  describe('Players Needing Attention', () => {
    beforeEach(() => {
      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournament.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('should limit players needing attention to 5', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3);

      // Mock 10 unreviewed sessions
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        id: `session-${i}`,
        sessionDate: sevenDaysAgo,
        player: {
          id: `player-${i}`,
          firstName: `Player`,
          lastName: `${i}`,
          category: 'A',
        },
      }));

      (mockPrisma.trainingSession.findMany as jest.Mock).mockImplementation((args) => {
        if (args?.where?.completionStatus === 'completed' && args?.where?.evaluationTechnical === null) {
          return Promise.resolve(sessions);
        }
        return Promise.resolve([]);
      });

      const result = await service.getDashboard(coachId);

      expect(result.playersNeedingAttention.length).toBeLessThanOrEqual(5);
    });

    it('should deduplicate players across different attention reasons', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 3);

      // Same player appears in unreviewed sessions
      (mockPrisma.trainingSession.findMany as jest.Mock).mockImplementation((args) => {
        if (args?.where?.completionStatus === 'completed' && args?.where?.evaluationTechnical === null) {
          return Promise.resolve([{
            id: 'session-1',
            sessionDate: sevenDaysAgo,
            player: { id: 'player-1', firstName: 'John', lastName: 'Doe', category: 'A' },
          }]);
        }
        return Promise.resolve([]);
      });

      // Same player also in inactive list
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([{
        id: 'player-1',
        firstName: 'John',
        lastName: 'Doe',
        category: 'A',
        trainingSessions: [],
      }]);

      const result = await service.getDashboard(coachId);

      // Player should only appear once
      const playerIds = result.playersNeedingAttention.map(p => p.id);
      const uniqueIds = [...new Set(playerIds)];
      expect(playerIds.length).toBe(uniqueIds.length);
    });
  });

  describe('Team Load Stats', () => {
    it('should calculate correct team load statistics', async () => {
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(10);
      (mockPrisma.trainingSession.findMany as jest.Mock).mockImplementation((args) => {
        // Active players query
        if (args?.distinct) {
          return Promise.resolve([
            { playerId: 'player-1' },
            { playerId: 'player-2' },
            { playerId: 'player-3' },
          ]);
        }
        return Promise.resolve([]);
      });
      (mockPrisma.trainingSession.count as jest.Mock).mockImplementation((args) => {
        // Sessions this week
        if (args?.where?.sessionDate) {
          return Promise.resolve(15);
        }
        // Pending reviews
        if (args?.where?.completionStatus === 'completed') {
          return Promise.resolve(3);
        }
        return Promise.resolve(0);
      });
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournament.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboard(coachId);

      expect(result.teamLoadStats.totalPlayers).toBe(10);
    });
  });

  describe('Response Structure', () => {
    beforeEach(() => {
      (mockPrisma.trainingSession.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.player.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.player.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.tournamentResult.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.tournament.findMany as jest.Mock).mockResolvedValue([]);
    });

    it('should return complete dashboard response structure', async () => {
      const result = await service.getDashboard(coachId);

      // Verify all required fields exist
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('primaryAction');
      expect(result).toHaveProperty('playersNeedingAttention');
      expect(result).toHaveProperty('todaySessions');
      expect(result).toHaveProperty('teamLoadStats');
      expect(result).toHaveProperty('upcomingTournaments');
      expect(result).toHaveProperty('attentionItems');
      expect(result).toHaveProperty('attentionCount');

      // Verify primary action structure
      expect(result.primaryAction).toHaveProperty('type');
      expect(result.primaryAction).toHaveProperty('label');
      expect(result.primaryAction).toHaveProperty('href');
      expect(result.primaryAction).toHaveProperty('context');
    });

    it('should return arrays for list properties', async () => {
      const result = await service.getDashboard(coachId);

      expect(Array.isArray(result.playersNeedingAttention)).toBe(true);
      expect(Array.isArray(result.todaySessions)).toBe(true);
      expect(Array.isArray(result.upcomingTournaments)).toBe(true);
      expect(Array.isArray(result.attentionItems)).toBe(true);
    });

    it('should return numeric attentionCount', async () => {
      const result = await service.getDashboard(coachId);

      expect(typeof result.attentionCount).toBe('number');
      expect(result.attentionCount).toBeGreaterThanOrEqual(0);
    });
  });
});
