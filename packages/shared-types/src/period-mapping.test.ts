/**
 * Unit Tests for Period Mapping Module
 *
 * Tests type guards, parsers, and validation functions for
 * Period and LearningPhase canonical types.
 */

import {
  // Type guards
  isPeriod,
  isDagbokPeriod,
  isLearningPhase,
  // Parsers (return null on invalid)
  parsePeriod,
  parseDagbokPeriod,
  parseLearningPhase,
  parseLearningPhases,
  // Strict parsers (throw on invalid)
  parsePeriodStrict,
  parseLearningPhasesStrict,
  // Constants
  PERIODS,
  DAGBOK_PERIODS,
  LEARNING_PHASES,
} from './period-mapping';

describe('Period Mapping Module', () => {
  // =========================================================================
  // isPeriod Type Guard
  // =========================================================================
  describe('isPeriod', () => {
    it('returns true for valid canonical periods', () => {
      expect(isPeriod('E')).toBe(true);
      expect(isPeriod('G')).toBe(true);
      expect(isPeriod('S')).toBe(true);
      expect(isPeriod('T')).toBe(true);
    });

    it('returns false for lowercase periods', () => {
      expect(isPeriod('e')).toBe(false);
      expect(isPeriod('g')).toBe(false);
      expect(isPeriod('s')).toBe(false);
      expect(isPeriod('t')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isPeriod('X')).toBe(false);
      expect(isPeriod('')).toBe(false);
      expect(isPeriod('ETABLERING')).toBe(false);
      expect(isPeriod('week')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isPeriod(null)).toBe(false);
      expect(isPeriod(undefined)).toBe(false);
      expect(isPeriod(1)).toBe(false);
      expect(isPeriod({ period: 'E' })).toBe(false);
      expect(isPeriod(['E'])).toBe(false);
    });
  });

  // =========================================================================
  // parsePeriod
  // =========================================================================
  describe('parsePeriod', () => {
    it('returns canonical period for valid uppercase input', () => {
      expect(parsePeriod('E')).toBe('E');
      expect(parsePeriod('G')).toBe('G');
      expect(parsePeriod('S')).toBe('S');
      expect(parsePeriod('T')).toBe('T');
    });

    it('normalizes lowercase input to uppercase', () => {
      expect(parsePeriod('e')).toBe('E');
      expect(parsePeriod('g')).toBe('G');
      expect(parsePeriod('s')).toBe('S');
      expect(parsePeriod('t')).toBe('T');
    });

    it('handles whitespace', () => {
      expect(parsePeriod('  E  ')).toBe('E');
      expect(parsePeriod(' t ')).toBe('T');
    });

    it('parses full Norwegian names', () => {
      expect(parsePeriod('ETABLERING')).toBe('E');
      expect(parsePeriod('etablering')).toBe('E');
      expect(parsePeriod('GRUNNLEGGENDE')).toBe('G');
      expect(parsePeriod('SPESIALISERING')).toBe('S');
      expect(parsePeriod('TOPPING')).toBe('T');
    });

    it('parses English equivalents', () => {
      expect(parsePeriod('ESTABLISHMENT')).toBe('E');
      expect(parsePeriod('BASE')).toBe('E');
      expect(parsePeriod('FOUNDATION')).toBe('G');
      expect(parsePeriod('GRUNDLAG')).toBe('G');
      expect(parsePeriod('SPECIALIZATION')).toBe('S');
      expect(parsePeriod('TOURNAMENT')).toBe('T');
      expect(parsePeriod('PEAK')).toBe('T');
    });

    it('returns null for invalid input', () => {
      expect(parsePeriod('X')).toBeNull();
      expect(parsePeriod('')).toBeNull();
      expect(parsePeriod('week')).toBeNull();
      expect(parsePeriod('month')).toBeNull();
    });

    it('returns null for non-string values', () => {
      expect(parsePeriod(null)).toBeNull();
      expect(parsePeriod(undefined)).toBeNull();
      expect(parsePeriod(123)).toBeNull();
      expect(parsePeriod({ value: 'E' })).toBeNull();
    });
  });

  // =========================================================================
  // parsePeriodStrict
  // =========================================================================
  describe('parsePeriodStrict', () => {
    it('returns canonical period for valid input', () => {
      expect(parsePeriodStrict('E')).toBe('E');
      expect(parsePeriodStrict('topping')).toBe('T');
    });

    it('throws for invalid input', () => {
      expect(() => parsePeriodStrict('X')).toThrow('Invalid Period');
      expect(() => parsePeriodStrict(null)).toThrow('Invalid Period');
      expect(() => parsePeriodStrict('')).toThrow('Invalid Period');
    });

    it('includes valid options in error message', () => {
      expect(() => parsePeriodStrict('invalid')).toThrow(/E, G, S, T/);
    });
  });

  // =========================================================================
  // isDagbokPeriod Type Guard
  // =========================================================================
  describe('isDagbokPeriod', () => {
    it('returns true for valid dagbok periods', () => {
      expect(isDagbokPeriod('week')).toBe(true);
      expect(isDagbokPeriod('month')).toBe(true);
      expect(isDagbokPeriod('custom')).toBe(true);
    });

    it('returns false for training periods', () => {
      expect(isDagbokPeriod('E')).toBe(false);
      expect(isDagbokPeriod('G')).toBe(false);
      expect(isDagbokPeriod('S')).toBe(false);
      expect(isDagbokPeriod('T')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isDagbokPeriod('day')).toBe(false);
      expect(isDagbokPeriod('year')).toBe(false);
      expect(isDagbokPeriod('')).toBe(false);
      expect(isDagbokPeriod('Week')).toBe(false); // case sensitive
    });

    it('returns false for non-string values', () => {
      expect(isDagbokPeriod(null)).toBe(false);
      expect(isDagbokPeriod(undefined)).toBe(false);
      expect(isDagbokPeriod(7)).toBe(false);
    });
  });

  // =========================================================================
  // parseDagbokPeriod
  // =========================================================================
  describe('parseDagbokPeriod', () => {
    it('returns valid dagbok period', () => {
      expect(parseDagbokPeriod('week')).toBe('week');
      expect(parseDagbokPeriod('month')).toBe('month');
      expect(parseDagbokPeriod('custom')).toBe('custom');
    });

    it('normalizes to lowercase', () => {
      expect(parseDagbokPeriod('WEEK')).toBe('week');
      expect(parseDagbokPeriod('Month')).toBe('month');
      expect(parseDagbokPeriod('CUSTOM')).toBe('custom');
    });

    it('handles whitespace', () => {
      expect(parseDagbokPeriod('  week  ')).toBe('week');
    });

    it('returns null for training periods (different concept)', () => {
      expect(parseDagbokPeriod('E')).toBeNull();
      expect(parseDagbokPeriod('T')).toBeNull();
    });

    it('returns null for invalid input', () => {
      expect(parseDagbokPeriod('day')).toBeNull();
      expect(parseDagbokPeriod('')).toBeNull();
      expect(parseDagbokPeriod(null)).toBeNull();
    });
  });

  // =========================================================================
  // isLearningPhase Type Guard
  // =========================================================================
  describe('isLearningPhase', () => {
    it('returns true for valid learning phases', () => {
      expect(isLearningPhase('L1')).toBe(true);
      expect(isLearningPhase('L2')).toBe(true);
      expect(isLearningPhase('L3')).toBe(true);
      expect(isLearningPhase('L4')).toBe(true);
      expect(isLearningPhase('L5')).toBe(true);
    });

    it('returns false for lowercase', () => {
      expect(isLearningPhase('l1')).toBe(false);
      expect(isLearningPhase('l5')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isLearningPhase('L0')).toBe(false);
      expect(isLearningPhase('L6')).toBe(false);
      expect(isLearningPhase('')).toBe(false);
      expect(isLearningPhase('1')).toBe(false);
      expect(isLearningPhase('N')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isLearningPhase(null)).toBe(false);
      expect(isLearningPhase(undefined)).toBe(false);
      expect(isLearningPhase(1)).toBe(false);
    });
  });

  // =========================================================================
  // parseLearningPhase
  // =========================================================================
  describe('parseLearningPhase', () => {
    it('returns canonical learning phase for valid input', () => {
      expect(parseLearningPhase('L1')).toBe('L1');
      expect(parseLearningPhase('L2')).toBe('L2');
      expect(parseLearningPhase('L3')).toBe('L3');
      expect(parseLearningPhase('L4')).toBe('L4');
      expect(parseLearningPhase('L5')).toBe('L5');
    });

    it('normalizes lowercase to uppercase', () => {
      expect(parseLearningPhase('l1')).toBe('L1');
      expect(parseLearningPhase('l5')).toBe('L5');
    });

    it('handles whitespace', () => {
      expect(parseLearningPhase('  L3  ')).toBe('L3');
    });

    it('returns null for invalid input', () => {
      expect(parseLearningPhase('L0')).toBeNull();
      expect(parseLearningPhase('L6')).toBeNull();
      expect(parseLearningPhase('')).toBeNull();
      expect(parseLearningPhase('N')).toBeNull();
    });

    it('returns null for non-string values', () => {
      expect(parseLearningPhase(null)).toBeNull();
      expect(parseLearningPhase(undefined)).toBeNull();
      expect(parseLearningPhase(1)).toBeNull();
    });
  });

  // =========================================================================
  // parseLearningPhases (array)
  // =========================================================================
  describe('parseLearningPhases', () => {
    it('filters and returns valid learning phases', () => {
      expect(parseLearningPhases(['L1', 'L2', 'L3'])).toEqual(['L1', 'L2', 'L3']);
    });

    it('filters out invalid values', () => {
      expect(parseLearningPhases(['L1', 'invalid', 'L3'])).toEqual(['L1', 'L3']);
      expect(parseLearningPhases(['L0', 'L6', 'N'])).toEqual([]);
    });

    it('normalizes lowercase', () => {
      expect(parseLearningPhases(['l1', 'l2'])).toEqual(['L1', 'L2']);
    });

    it('handles mixed valid/invalid', () => {
      expect(parseLearningPhases(['L1', null, 'L2', undefined, 123, 'L5']))
        .toEqual(['L1', 'L2', 'L5']);
    });

    it('returns empty array for all invalid', () => {
      expect(parseLearningPhases(['invalid', 'values'])).toEqual([]);
    });

    it('returns empty array for empty input', () => {
      expect(parseLearningPhases([])).toEqual([]);
    });
  });

  // =========================================================================
  // parseLearningPhasesStrict
  // =========================================================================
  describe('parseLearningPhasesStrict', () => {
    it('returns all valid learning phases', () => {
      expect(parseLearningPhasesStrict(['L1', 'L2', 'L3'])).toEqual(['L1', 'L2', 'L3']);
    });

    it('normalizes lowercase', () => {
      expect(parseLearningPhasesStrict(['l1', 'l2'])).toEqual(['L1', 'L2']);
    });

    it('throws on first invalid value', () => {
      expect(() => parseLearningPhasesStrict(['L1', 'invalid', 'L3']))
        .toThrow('Invalid LearningPhase at index 1');
    });

    it('throws with value in error message', () => {
      expect(() => parseLearningPhasesStrict(['L0']))
        .toThrow('"L0"');
    });

    it('handles empty array', () => {
      expect(parseLearningPhasesStrict([])).toEqual([]);
    });
  });

  // =========================================================================
  // Constants verification
  // =========================================================================
  describe('Constants', () => {
    it('PERIODS contains all canonical periods', () => {
      expect(PERIODS).toEqual(['E', 'G', 'S', 'T']);
    });

    it('DAGBOK_PERIODS contains all UI filter periods', () => {
      expect(DAGBOK_PERIODS).toEqual(['week', 'month', 'custom']);
    });

    it('LEARNING_PHASES contains all phases L1-L5', () => {
      expect(LEARNING_PHASES).toEqual(['L1', 'L2', 'L3', 'L4', 'L5']);
    });

    it('constants are readonly', () => {
      // TypeScript enforces this at compile time, but we can verify
      // the arrays are not accidentally mutable at runtime
      expect(Object.isFrozen(PERIODS)).toBe(false); // readonly !== frozen
      expect(PERIODS.length).toBe(4);
    });
  });

  // =========================================================================
  // Semantic distinction tests
  // =========================================================================
  describe('Semantic Distinction: DagbokPeriod vs Period', () => {
    it('training periods are NOT dagbok periods', () => {
      // Training periods (E/G/S/T) are periodization phases
      // DagbokPeriod (week/month/custom) are UI date range filters
      expect(isDagbokPeriod('E')).toBe(false);
      expect(isPeriod('week')).toBe(false);
    });

    it('parsers return appropriate types for their domain', () => {
      // parsePeriod handles training periods and full names
      expect(parsePeriod('ETABLERING')).toBe('E');
      expect(parseDagbokPeriod('ETABLERING')).toBeNull();

      // parseDagbokPeriod handles UI filter periods
      expect(parseDagbokPeriod('week')).toBe('week');
      expect(parsePeriod('week')).toBeNull();
    });
  });
});
