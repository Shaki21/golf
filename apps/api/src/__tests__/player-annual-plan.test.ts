import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PlayerAnnualPlanService } from '../api/v1/players/annual-plan-service';
import { getPrismaClient } from '../core/db/prisma';

const prisma = getPrismaClient();
const service = new PlayerAnnualPlanService(prisma);

describe('PlayerAnnualPlanService', () => {
  const testTenantId = '00000000-0000-0000-0000-000000000001';
  const testPlayerId = '00000000-0000-0000-0000-000000000004';

  describe('validatePeriods', () => {
    it('should reject overlapping periods', () => {
      const periods = [
        {
          id: 'p1',
          type: 'E' as const,
          name: 'Period 1',
          startDate: '2026-01-01',
          endDate: '2026-03-01',
          weeklyFrequency: 3,
          goals: [],
          color: '#000',
          textColor: '#fff',
        },
        {
          id: 'p2',
          type: 'G' as const,
          name: 'Period 2',
          startDate: '2026-02-15', // Overlaps with p1
          endDate: '2026-04-01',
          weeklyFrequency: 4,
          goals: [],
          color: '#000',
          textColor: '#fff',
        },
      ];

      expect(() => {
        (service as any).validatePeriods(periods);
      }).toThrow('Period overlap detected');
    });

    it('should accept non-overlapping periods', () => {
      const periods = [
        {
          id: 'p1',
          type: 'E' as const,
          name: 'Period 1',
          startDate: '2026-01-01',
          endDate: '2026-02-28',
          weeklyFrequency: 3,
          goals: [],
          color: '#000',
          textColor: '#fff',
        },
        {
          id: 'p2',
          type: 'G' as const,
          name: 'Period 2',
          startDate: '2026-03-01', // No overlap
          endDate: '2026-04-30',
          weeklyFrequency: 4,
          goals: [],
          color: '#000',
          textColor: '#fff',
        },
      ];

      expect(() => {
        (service as any).validatePeriods(periods);
      }).not.toThrow();
    });

    it('should reject periods with invalid weekly frequency', () => {
      const periods = [
        {
          id: 'p1',
          type: 'E' as const,
          name: 'Period 1',
          startDate: '2026-01-01',
          endDate: '2026-02-28',
          weeklyFrequency: 0, // Invalid
          goals: [],
          color: '#000',
          textColor: '#fff',
        },
      ];

      expect(() => {
        (service as any).validatePeriods(periods);
      }).toThrow('Invalid weekly frequency');
    });

    it('should reject periods with end date before start date', () => {
      const periods = [
        {
          id: 'p1',
          type: 'E' as const,
          name: 'Period 1',
          startDate: '2026-03-01',
          endDate: '2026-01-01', // Before start
          weeklyFrequency: 3,
          goals: [],
          color: '#000',
          textColor: '#fff',
        },
      ];

      expect(() => {
        (service as any).validatePeriods(periods);
      }).toThrow('end date must be after start date');
    });
  });
});
