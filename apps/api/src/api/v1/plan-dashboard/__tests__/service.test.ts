/**
 * PlanDashboardService Tests
 * Tests for the decision-first dashboard state machine logic
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PlanDashboardService } from '../service';
import type { PlanGoal } from '../types';

// Create a mock PrismaClient
const createMockPrisma = () => ({
  trainingSession: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  playerGoal: {
    findMany: jest.fn(),
  },
  tournamentResult: {
    findFirst: jest.fn(),
  },
});

describe('PlanDashboardService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    service = new PlanDashboardService(mockPrisma);
  });

  describe('sortGoalsByRisk', () => {
    it('sorts goals with at_risk first, then on_track, then ahead', () => {
      const goals: PlanGoal[] = [
        {
          id: '1',
          title: 'On Track Goal',
          outcome: 'Test',
          leadingIndicator: { label: 'Test', target: 3, current: 2, unit: 'sessions' },
          status: 'on_track',
          statusReason: 'Good',
        },
        {
          id: '2',
          title: 'At Risk Goal',
          outcome: 'Test',
          leadingIndicator: { label: 'Test', target: 3, current: 0, unit: 'sessions' },
          status: 'at_risk',
          statusReason: 'Behind',
        },
        {
          id: '3',
          title: 'Ahead Goal',
          outcome: 'Test',
          leadingIndicator: { label: 'Test', target: 3, current: 4, unit: 'sessions' },
          status: 'ahead',
          statusReason: 'Completed',
        },
      ];

      const sorted = service.sortGoalsByRisk(goals);

      expect(sorted[0].status).toBe('at_risk');
      expect(sorted[1].status).toBe('on_track');
      expect(sorted[2].status).toBe('ahead');
    });
  });

  describe('computeAttentionItems', () => {
    it('includes missing log attention item when missingLogs > 0', () => {
      const items = service.computeAttentionItems([], 2, true, null);

      const missingLogItem = items.find((i: { type: string }) => i.type === 'missing_log');
      expect(missingLogItem).toBeDefined();
      expect(missingLogItem?.severity).toBe('warning');
      expect(missingLogItem?.message).toContain('2 økter mangler treningslogg');
    });

    it('includes plan not confirmed attention item when plan is not confirmed', () => {
      const items = service.computeAttentionItems([], 0, false, null);

      const planItem = items.find((i: { type: string }) => i.type === 'plan_not_confirmed');
      expect(planItem).toBeDefined();
      expect(planItem?.severity).toBe('warning');
    });

    it('includes tournament attention item when tournament is soon without plan', () => {
      const tournament = {
        id: '1',
        name: 'NGF Tour',
        date: new Date(),
        daysUntil: 10,
        hasPlan: false,
        location: 'Test',
      };

      const items = service.computeAttentionItems([], 0, true, tournament);

      const tournamentItem = items.find((i: { type: string }) => i.type === 'tournament_soon');
      expect(tournamentItem).toBeDefined();
      expect(tournamentItem?.severity).toBe('info');
    });

    it('includes at-risk goal attention items', () => {
      const goals: PlanGoal[] = [
        {
          id: '1',
          title: 'At Risk Goal',
          outcome: 'Test',
          leadingIndicator: { label: 'Test', target: 3, current: 0, unit: 'sessions' },
          status: 'at_risk',
          statusReason: 'Behind schedule',
        },
      ];

      const items = service.computeAttentionItems(goals, 0, true, null);

      const goalItem = items.find((i: { type: string }) => i.type === 'at_risk_goal');
      expect(goalItem).toBeDefined();
      expect(goalItem?.message).toContain('At Risk Goal');
    });

    it('does not include tournament item if tournament has plan', () => {
      const tournament = {
        id: '1',
        name: 'NGF Tour',
        date: new Date(),
        daysUntil: 10,
        hasPlan: true,
        location: 'Test',
      };

      const items = service.computeAttentionItems([], 0, true, tournament);

      const tournamentItem = items.find((i: { type: string }) => i.type === 'tournament_soon');
      expect(tournamentItem).toBeUndefined();
    });
  });

  describe('getSessionTitle', () => {
    it('returns correct title for technical sessions', () => {
      const title = service.getSessionTitle('technical');
      expect(title).toBe('Teknikktrening');
    });

    it('returns correct title for coaching sessions', () => {
      const title = service.getSessionTitle('coaching');
      expect(title).toBe('Trenertime');
    });

    it('returns default title for unknown type', () => {
      const title = service.getSessionTitle('unknown');
      expect(title).toBe('Treningsøkt');
    });

    it('returns default title for null type', () => {
      const title = service.getSessionTitle(null);
      expect(title).toBe('Treningsøkt');
    });
  });

  describe('mapSessionType', () => {
    it('maps coaching to coaching', () => {
      const type = service.mapSessionType('coaching');
      expect(type).toBe('coaching');
    });

    it('maps testing to testing', () => {
      const type = service.mapSessionType('testing');
      expect(type).toBe('testing');
    });

    it('maps competition to tournament', () => {
      const type = service.mapSessionType('competition');
      expect(type).toBe('tournament');
    });

    it('maps everything else to training', () => {
      expect(service.mapSessionType('technical')).toBe('training');
      expect(service.mapSessionType('physical')).toBe('training');
      expect(service.mapSessionType(null)).toBe('training');
    });
  });

  describe('formatSessionContext', () => {
    it('returns "I dag" for today sessions', () => {
      const session = {
        date: new Date(),
        time: '14:00',
        focus: 'Putting',
      };

      const context = service.formatSessionContext(session);
      expect(context).toContain('I dag');
      expect(context).toContain('14:00');
      expect(context).toContain('Putting');
    });

    it('returns "I morgen" for tomorrow sessions', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const session = {
        date: tomorrow,
        time: '10:00',
        focus: 'Driving',
      };

      const context = service.formatSessionContext(session);
      expect(context).toContain('I morgen');
    });

    it('returns "Om X dager" for future sessions', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);

      const session = {
        date: future,
        time: '16:00',
        focus: 'Course play',
      };

      const context = service.formatSessionContext(session);
      expect(context).toContain('Om 5 dager');
    });
  });

  describe('getStartOfWeek', () => {
    it('returns Monday for a Wednesday', () => {
      // January 15, 2025 is a Wednesday
      const wednesday = new Date('2025-01-15T12:00:00');
      const monday = service.getStartOfWeek(wednesday);

      expect(monday.getDay()).toBe(1); // Monday
      expect(monday.getDate()).toBe(13);
    });

    it('returns previous Monday for a Sunday', () => {
      // January 19, 2025 is a Sunday
      const sunday = new Date('2025-01-19T12:00:00');
      const monday = service.getStartOfWeek(sunday);

      expect(monday.getDay()).toBe(1);
      expect(monday.getDate()).toBe(13);
    });
  });
});
