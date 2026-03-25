/**
 * Unit Tests for Test Domain Mappers
 *
 * Tests pure functions for:
 * - calculateTrendData: trend direction, lowerIsBetter, edge cases
 * - mapCanonicalTestCategoryToSkillArea: mapped and unmapped categories
 * - mapTestCategoryToSkillArea: fallback behavior
 */

import {
  calculateTrendData,
  mapCanonicalTestCategoryToSkillArea,
  mapTestCategoryToSkillArea,
  mapRawResultsToListPage,
  type TrendData,
  type RawApiTestResultWithTest,
} from './mappers';

import type { TestAttempt } from '../../hooks/useTestResults';

// ============================================================================
// Helper to create test history
// ============================================================================

function createHistory(
  values: number[],
  startDate: Date = new Date('2024-01-01'),
  intervalDays: number = 7
): TestAttempt[] {
  return values.map((value, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index * intervalDays);
    return {
      id: `attempt-${index}`,
      value,
      testDate: date.toISOString(),
    };
  });
}

// ============================================================================
// calculateTrendData Tests
// ============================================================================

describe('calculateTrendData', () => {
  describe('trend direction', () => {
    it('returns "improving" when value increases (higher is better)', () => {
      const history = createHistory([50, 55, 60]);
      const result = calculateTrendData(history, 60, 55, false, 70);

      expect(result.trend).toBe('improving');
      expect(result.trendPercent).toBeGreaterThan(0);
    });

    it('returns "declining" when value decreases (higher is better)', () => {
      const history = createHistory([60, 55, 50]);
      const result = calculateTrendData(history, 50, 55, false, 70);

      expect(result.trend).toBe('declining');
    });

    it('returns "stable" when change is less than 2%', () => {
      const history = createHistory([100, 100, 101]);
      const result = calculateTrendData(history, 101, 100, false, 110);

      expect(result.trend).toBe('stable');
    });

    it('returns "stable" when previousValue is null', () => {
      const history = createHistory([50]);
      const result = calculateTrendData(history, 50, null, false, 70);

      expect(result.trend).toBe('stable');
    });

    it('returns "stable" when previousValue is zero', () => {
      const history = createHistory([0, 50]);
      const result = calculateTrendData(history, 50, 0, false, 70);

      expect(result.trend).toBe('stable');
    });
  });

  describe('lowerIsBetter mode', () => {
    it('returns "improving" when value decreases (lower is better)', () => {
      const history = createHistory([40, 35, 30]);
      const result = calculateTrendData(history, 30, 35, true, 25);

      expect(result.trend).toBe('improving');
    });

    it('returns "declining" when value increases (lower is better)', () => {
      const history = createHistory([30, 35, 40]);
      const result = calculateTrendData(history, 40, 35, true, 25);

      expect(result.trend).toBe('declining');
    });
  });

  describe('empty/single history', () => {
    it('handles empty history array', () => {
      const result = calculateTrendData([], 50, null, false, 70);

      expect(result.trend).toBe('stable');
      expect(result.improvementRate).toBe(0);
      expect(result.predictedDaysToTarget).toBeNull();
    });

    it('handles single-item history', () => {
      const history = createHistory([50]);
      const result = calculateTrendData(history, 50, null, false, 70);

      expect(result.trend).toBe('stable');
      expect(result.improvementRate).toBe(0);
    });
  });

  describe('predictedDaysToTarget', () => {
    it('calculates days to target with positive improvement rate', () => {
      // 4 weeks of history, improving 10 units per week
      const history = createHistory([50, 60, 70, 80]);
      const result = calculateTrendData(history, 80, 70, false, 100);

      // Remaining: 20 units, Rate: ~10/week = ~2 weeks = ~14 days
      expect(result.predictedDaysToTarget).toBeGreaterThan(0);
      expect(result.predictedDaysToTarget).toBeLessThan(30);
    });

    it('returns 0 when already at or past target (higher is better)', () => {
      const history = createHistory([90, 95, 100]);
      const result = calculateTrendData(history, 100, 95, false, 90);

      expect(result.predictedDaysToTarget).toBe(0);
    });

    it('returns 0 when already at or past target (lower is better)', () => {
      const history = createHistory([40, 35, 30]);
      const result = calculateTrendData(history, 30, 35, true, 35);

      expect(result.predictedDaysToTarget).toBe(0);
    });

    it('returns null when improvement rate is zero or negative', () => {
      // No improvement - declining
      const history = createHistory([80, 75, 70]);
      const result = calculateTrendData(history, 70, 75, false, 100);

      expect(result.predictedDaysToTarget).toBeNull();
    });

    it('returns null with missing target and no improvement', () => {
      const history = createHistory([50, 50, 50]);
      const result = calculateTrendData(history, 50, 50, false, 100);

      expect(result.predictedDaysToTarget).toBeNull();
    });
  });

  describe('improvement rate', () => {
    it('calculates positive rate when improving (higher is better)', () => {
      // 3 weeks, improved from 50 to 80 = 30 units over 2 weeks = 15/week
      const history = createHistory([50, 65, 80]);
      const result = calculateTrendData(history, 80, 65, false, 100);

      expect(result.improvementRate).toBeGreaterThan(0);
    });

    it('calculates positive rate when improving (lower is better)', () => {
      // Lower is better: went from 80 to 50 = 30 units improvement over 2 weeks
      const history = createHistory([80, 65, 50]);
      const result = calculateTrendData(history, 50, 65, true, 30);

      expect(result.improvementRate).toBeGreaterThan(0);
    });

    it('calculates negative/zero rate when declining', () => {
      const history = createHistory([80, 70, 60]);
      const result = calculateTrendData(history, 60, 70, false, 100);

      expect(result.improvementRate).toBeLessThanOrEqual(0);
    });
  });

  describe('edge cases', () => {
    it('handles very small values', () => {
      const history = createHistory([0.001, 0.002, 0.003]);
      const result = calculateTrendData(history, 0.003, 0.002, false, 0.01);

      expect(result.trend).toBe('improving');
    });

    it('handles very large values', () => {
      const history = createHistory([1000000, 1100000, 1200000]);
      const result = calculateTrendData(history, 1200000, 1100000, false, 1500000);

      expect(result.trend).toBe('improving');
    });

    it('handles negative values', () => {
      const history = createHistory([-30, -20, -10]);
      const result = calculateTrendData(history, -10, -20, false, 0);

      expect(result.trend).toBe('improving');
    });
  });
});

// ============================================================================
// mapCanonicalTestCategoryToSkillArea Tests
// ============================================================================

describe('mapCanonicalTestCategoryToSkillArea', () => {
  describe('mapped categories', () => {
    it('maps putting to putting', () => {
      expect(mapCanonicalTestCategoryToSkillArea('putting')).toBe('putting');
    });

    it('maps chipping to kortspill', () => {
      expect(mapCanonicalTestCategoryToSkillArea('chipping')).toBe('kortspill');
    });

    it('maps pitching to kortspill', () => {
      expect(mapCanonicalTestCategoryToSkillArea('pitching')).toBe('kortspill');
    });

    it('maps bunker to kortspill', () => {
      expect(mapCanonicalTestCategoryToSkillArea('bunker')).toBe('kortspill');
    });

    it('maps iron to jernspill', () => {
      expect(mapCanonicalTestCategoryToSkillArea('iron')).toBe('jernspill');
    });

    it('maps driver to driving', () => {
      expect(mapCanonicalTestCategoryToSkillArea('driver')).toBe('driving');
    });

    it('maps physical to fysisk', () => {
      expect(mapCanonicalTestCategoryToSkillArea('physical')).toBe('fysisk');
    });

    it('maps mental to mental', () => {
      expect(mapCanonicalTestCategoryToSkillArea('mental')).toBe('mental');
    });
  });

  describe('unmapped categories return null', () => {
    it('returns null for invalid category', () => {
      // @ts-expect-error Testing invalid input
      expect(mapCanonicalTestCategoryToSkillArea('invalid')).toBeNull();
    });

    it('returns null for empty string', () => {
      // @ts-expect-error Testing invalid input
      expect(mapCanonicalTestCategoryToSkillArea('')).toBeNull();
    });
  });
});

// ============================================================================
// mapTestCategoryToSkillArea Tests
// ============================================================================

describe('mapTestCategoryToSkillArea', () => {
  describe('passthrough for valid UISkillArea values', () => {
    it('passes through golf', () => {
      expect(mapTestCategoryToSkillArea('golf')).toBe('golf');
    });

    it('passes through teknikk', () => {
      expect(mapTestCategoryToSkillArea('teknikk')).toBe('teknikk');
    });

    it('passes through strategisk', () => {
      expect(mapTestCategoryToSkillArea('strategisk')).toBe('strategisk');
    });
  });

  describe('case normalization', () => {
    it('normalizes uppercase to lowercase', () => {
      expect(mapTestCategoryToSkillArea('PUTTING')).toBe('putting');
    });

    it('normalizes mixed case', () => {
      expect(mapTestCategoryToSkillArea('Driving')).toBe('driving');
    });

    it('trims whitespace', () => {
      expect(mapTestCategoryToSkillArea('  mental  ')).toBe('mental');
    });
  });

  describe('canonical category mapping', () => {
    it('maps canonical iron to jernspill', () => {
      expect(mapTestCategoryToSkillArea('iron')).toBe('jernspill');
    });

    it('maps canonical physical to fysisk', () => {
      expect(mapTestCategoryToSkillArea('physical')).toBe('fysisk');
    });
  });

  describe('fallback behavior', () => {
    it('returns default fallback (golf) for unknown category', () => {
      expect(mapTestCategoryToSkillArea('unknown_category')).toBe('golf');
    });

    it('uses custom fallback when provided', () => {
      expect(mapTestCategoryToSkillArea('unknown', 'teknikk')).toBe('teknikk');
    });

    it('uses fallback for empty string', () => {
      expect(mapTestCategoryToSkillArea('', 'fysisk')).toBe('fysisk');
    });
  });
});

// ============================================================================
// Purity Verification Tests
// ============================================================================

describe('Purity constraints', () => {
  it('calculateTrendData is deterministic with same inputs', () => {
    const history = createHistory([50, 60, 70]);
    const result1 = calculateTrendData(history, 70, 60, false, 100);
    const result2 = calculateTrendData(history, 70, 60, false, 100);

    expect(result1).toEqual(result2);
  });

  it('mapCanonicalTestCategoryToSkillArea is deterministic', () => {
    const result1 = mapCanonicalTestCategoryToSkillArea('putting');
    const result2 = mapCanonicalTestCategoryToSkillArea('putting');

    expect(result1).toBe(result2);
  });

  it('mapTestCategoryToSkillArea is deterministic', () => {
    const result1 = mapTestCategoryToSkillArea('IRON', 'golf');
    const result2 = mapTestCategoryToSkillArea('IRON', 'golf');

    expect(result1).toBe(result2);
  });

  it('mapRawResultsToListPage is deterministic with same inputs', () => {
    const rawResults: RawApiTestResultWithTest[] = [
      { id: 'r1', testId: 't1', value: 80, testDate: '2025-12-28' },
    ];
    const fallbackDate = '2025-01-01T00:00:00.000Z';

    const result1 = mapRawResultsToListPage(rawResults, fallbackDate);
    const result2 = mapRawResultsToListPage(rawResults, fallbackDate);

    expect(result1).toEqual(result2);
  });
});

// ============================================================================
// mapRawResultsToListPage Tests
// ============================================================================

describe('mapRawResultsToListPage', () => {
  const fallbackDate = '2025-01-01T00:00:00.000Z';

  describe('basic transformation', () => {
    it('maps single result correctly', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        {
          id: 'r1',
          testId: 't1',
          test: {
            id: 't1',
            name: 'Putting 3m',
            testNumber: 21,
            category: 'Putting',
            unit: '%',
            requirement: 70,
            lowerIsBetter: false,
          },
          value: 75,
          testDate: '2025-12-28',
        },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'r1',
        testId: 't1',
        testName: 'Putting 3m',
        testNumber: 21,
        category: 'Putting',
        value: 75,
        unit: '%',
        requirement: 70,
        lowerIsBetter: false,
        testDate: '2025-12-28',
        passed: true,
        trend: 'stable',
      });
    });

    it('uses fallbackDate when testDate is missing', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 50 },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].testDate).toBe(fallbackDate);
    });

    it('prefers testDate over createdAt', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        {
          id: 'r1',
          testDate: '2025-12-28',
          createdAt: '2025-12-27',
          value: 50,
        },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].testDate).toBe('2025-12-28');
    });

    it('uses createdAt when testDate is missing', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        {
          id: 'r1',
          createdAt: '2025-12-27',
          value: 50,
        },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].testDate).toBe('2025-12-27');
    });
  });

  describe('passed calculation', () => {
    it('passes when value >= requirement (lowerIsBetter: false)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 75, requirement: 70, lowerIsBetter: false },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);
      expect(result[0].passed).toBe(true);
    });

    it('fails when value < requirement (lowerIsBetter: false)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 65, requirement: 70, lowerIsBetter: false },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);
      expect(result[0].passed).toBe(false);
    });

    it('passes when value <= requirement (lowerIsBetter: true)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 8, requirement: 10, lowerIsBetter: true },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);
      expect(result[0].passed).toBe(true);
    });

    it('fails when value > requirement (lowerIsBetter: true)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 12, requirement: 10, lowerIsBetter: true },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);
      expect(result[0].passed).toBe(false);
    });
  });

  describe('trend calculation', () => {
    it('calculates improving trend (lowerIsBetter: false, value increased)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', testId: 't1', value: 80, testDate: '2025-12-28', lowerIsBetter: false },
        { id: 'r2', testId: 't1', value: 70, testDate: '2025-12-27', lowerIsBetter: false },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].trend).toBe('up');
      expect(result[0].previousValue).toBe(70);
    });

    it('calculates declining trend (lowerIsBetter: false, value decreased)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', testId: 't1', value: 60, testDate: '2025-12-28', lowerIsBetter: false },
        { id: 'r2', testId: 't1', value: 70, testDate: '2025-12-27', lowerIsBetter: false },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].trend).toBe('down');
      expect(result[0].previousValue).toBe(70);
    });

    it('calculates improving trend (lowerIsBetter: true, value decreased)', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', testId: 't1', value: 5, testDate: '2025-12-28', lowerIsBetter: true },
        { id: 'r2', testId: 't1', value: 8, testDate: '2025-12-27', lowerIsBetter: true },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].trend).toBe('up');
      expect(result[0].previousValue).toBe(8);
    });

    it('calculates stable trend when value unchanged', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', testId: 't1', value: 70, testDate: '2025-12-28' },
        { id: 'r2', testId: 't1', value: 70, testDate: '2025-12-27' },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].trend).toBe('stable');
    });

    it('returns stable trend when no previous result', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', testId: 't1', value: 70, testDate: '2025-12-28' },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].trend).toBe('stable');
      expect(result[0].previousValue).toBeUndefined();
    });
  });

  describe('grouping by test', () => {
    it('calculates trends independently for different tests', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', testId: 't1', value: 80, testDate: '2025-12-28' },
        { id: 'r2', testId: 't1', value: 70, testDate: '2025-12-27' },
        { id: 'r3', testId: 't2', value: 50, testDate: '2025-12-28' },
        { id: 'r4', testId: 't2', value: 60, testDate: '2025-12-27' },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      // t1: 80 vs 70 = up (higher is better by default)
      expect(result[0].trend).toBe('up');
      expect(result[0].previousValue).toBe(70);

      // t2: 50 vs 60 = down (higher is better by default)
      expect(result[2].trend).toBe('down');
      expect(result[2].previousValue).toBe(60);
    });
  });

  describe('fallback values', () => {
    it('provides sensible defaults for missing fields', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 50 },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].testName).toBe('Ukjent test');
      expect(result[0].testNumber).toBe(0);
      expect(result[0].category).toBe('Annet');
      expect(result[0].unit).toBe('');
      expect(result[0].requirement).toBe(0);
      expect(result[0].lowerIsBetter).toBe(false);
    });
  });

  describe('array invariants', () => {
    it('returns same length as input', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 50 },
        { id: 'r2', value: 60 },
        { id: 'r3', value: 70 },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result).toHaveLength(3);
    });

    it('preserves order of input', () => {
      const rawResults: RawApiTestResultWithTest[] = [
        { id: 'r1', value: 50 },
        { id: 'r2', value: 60 },
        { id: 'r3', value: 70 },
      ];

      const result = mapRawResultsToListPage(rawResults, fallbackDate);

      expect(result[0].id).toBe('r1');
      expect(result[1].id).toBe('r2');
      expect(result[2].id).toBe('r3');
    });

    it('returns empty array for empty input', () => {
      const result = mapRawResultsToListPage([], fallbackDate);

      expect(result).toEqual([]);
    });
  });
});
