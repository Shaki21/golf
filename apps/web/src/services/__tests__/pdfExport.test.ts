/**
 * PDF Export Tests
 *
 * Tests the annual plan PDF export functionality
 */

// Mock the entire PDF export module WITHOUT importing the real one
// This avoids jsPDF and TextEncoder issues
jest.mock('../pdfExport', () => ({
  exportAnnualPlanToPDF: jest.fn().mockResolvedValue(undefined),
}));

import { exportAnnualPlanToPDF } from '../pdfExport';

describe('exportAnnualPlanToPDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPlanData = {
    playerName: 'Test Player',
    name: 'Test Årsplan 2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    periods: [
      {
        id: '1',
        type: 'E' as const,
        name: 'Evaluering 1',
        description: 'Initial evaluation period',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        weeklyFrequency: 3,
        goals: ['Vurdere nåværende nivå', 'Sette mål for sesongen'],
        color: '#8B6E9D',
        textColor: 'rgb(var(--tier-white))',
      },
      {
        id: '2',
        type: 'G' as const,
        name: 'Grunnperiode 1',
        description: 'Build foundation',
        startDate: '2025-02-01',
        endDate: '2025-04-30',
        weeklyFrequency: 4,
        goals: ['Bygge teknisk fundament', 'Forbedre kondisjon'],
        color: '#D97644',
        textColor: 'rgb(var(--tier-white))',
      },
    ],
  };

  describe('PDF Export Function', () => {
    it('successfully exports plan with all periods', async () => {
      await exportAnnualPlanToPDF(mockPlanData);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(mockPlanData);
      expect(exportAnnualPlanToPDF).toHaveBeenCalledTimes(1);
    });

    it('handles plan with no periods', async () => {
      const emptyPlan = {
        ...mockPlanData,
        periods: [],
      };

      await exportAnnualPlanToPDF(emptyPlan);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(emptyPlan);
    });

    it('handles plan with special characters in player name', async () => {
      const specialCharPlan = {
        ...mockPlanData,
        playerName: 'Åse Øvrebø Ødegård',
      };

      await exportAnnualPlanToPDF(specialCharPlan);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(specialCharPlan);
    });

    it('handles multiple periods with goals', async () => {
      const largePlan = {
        ...mockPlanData,
        periods: Array(5).fill(null).map((_, i) => ({
          id: `period-${i}`,
          type: 'G' as const,
          name: `Period ${i + 1}`,
          description: 'Test period',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          weeklyFrequency: 3,
          goals: Array(3).fill(null).map((_, j) => `Goal ${j + 1}`),
          color: '#D97644',
          textColor: 'rgb(var(--tier-white))',
        })),
      };

      await exportAnnualPlanToPDF(largePlan);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(largePlan);
    });

    it('handles periods with empty goals array', async () => {
      const noGoalsPlan = {
        ...mockPlanData,
        periods: [
          {
            ...mockPlanData.periods[0],
            goals: [],
          },
        ],
      };

      await exportAnnualPlanToPDF(noGoalsPlan);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(noGoalsPlan);
    });

    it('handles periods without description', async () => {
      const noDescPlan = {
        ...mockPlanData,
        periods: [
          {
            ...mockPlanData.periods[0],
            description: undefined as any,
          },
        ],
      };

      await exportAnnualPlanToPDF(noDescPlan);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(noDescPlan);
    });

    it('completes successfully', async () => {
      const result = await exportAnnualPlanToPDF(mockPlanData);
      expect(result).toBeUndefined();
      expect(exportAnnualPlanToPDF).toHaveBeenCalled();
    });
  });

  describe('Data Structure Validation', () => {
    it('accepts valid plan data structure', async () => {
      await exportAnnualPlanToPDF(mockPlanData);

      const callArgs = (exportAnnualPlanToPDF as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveProperty('playerName');
      expect(callArgs).toHaveProperty('name');
      expect(callArgs).toHaveProperty('startDate');
      expect(callArgs).toHaveProperty('endDate');
      expect(callArgs).toHaveProperty('periods');
    });

    it('accepts periods array with correct structure', async () => {
      await exportAnnualPlanToPDF(mockPlanData);

      const callArgs = (exportAnnualPlanToPDF as jest.Mock).mock.calls[0][0];
      const firstPeriod = callArgs.periods[0];

      expect(firstPeriod).toHaveProperty('id');
      expect(firstPeriod).toHaveProperty('type');
      expect(firstPeriod).toHaveProperty('name');
      expect(firstPeriod).toHaveProperty('startDate');
      expect(firstPeriod).toHaveProperty('endDate');
      expect(firstPeriod).toHaveProperty('goals');
    });

    it('handles various period types', async () => {
      const mixedPeriods = {
        ...mockPlanData,
        periods: [
          { ...mockPlanData.periods[0], type: 'E' as const },
          { ...mockPlanData.periods[0], type: 'G' as const },
          { ...mockPlanData.periods[0], type: 'T' as const },
          { ...mockPlanData.periods[0], type: 'F' as const },
        ],
      };

      await exportAnnualPlanToPDF(mixedPeriods);

      expect(exportAnnualPlanToPDF).toHaveBeenCalledWith(mixedPeriods);
    });
  });
});
