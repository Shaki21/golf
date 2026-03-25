/**
 * Unit Tests for Test Mapping Module
 *
 * Tests type guards, parsers, and validation functions for
 * TestCategory, TestEnvironment, and PlayerCategory canonical types.
 */

import {
  // Type guards
  isTestCategory,
  isTestEnvironment,
  isPlayerCategory,
  // Parsers (return null on invalid)
  parseTestCategory,
  parseTestEnvironment,
  parsePlayerCategory,
  // Strict parsers (throw on invalid)
  parseTestCategoryStrict,
  parseTestEnvironmentStrict,
  parsePlayerCategoryStrict,
  // Constants
  TEST_CATEGORIES,
  TEST_ENVIRONMENTS,
  PLAYER_CATEGORIES,
} from './test-mapping';

describe('Test Mapping Module', () => {
  // =========================================================================
  // isTestCategory Type Guard
  // =========================================================================
  describe('isTestCategory', () => {
    it('returns true for valid test categories', () => {
      expect(isTestCategory('putting')).toBe(true);
      expect(isTestCategory('chipping')).toBe(true);
      expect(isTestCategory('pitching')).toBe(true);
      expect(isTestCategory('bunker')).toBe(true);
      expect(isTestCategory('iron')).toBe(true);
      expect(isTestCategory('driver')).toBe(true);
      expect(isTestCategory('physical')).toBe(true);
      expect(isTestCategory('mental')).toBe(true);
    });

    it('returns false for uppercase categories', () => {
      expect(isTestCategory('PUTTING')).toBe(false);
      expect(isTestCategory('DRIVER')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isTestCategory('golf')).toBe(false);
      expect(isTestCategory('teknikk')).toBe(false);
      expect(isTestCategory('')).toBe(false);
      expect(isTestCategory('invalid')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isTestCategory(null)).toBe(false);
      expect(isTestCategory(undefined)).toBe(false);
      expect(isTestCategory(1)).toBe(false);
      expect(isTestCategory({ category: 'putting' })).toBe(false);
      expect(isTestCategory(['putting'])).toBe(false);
    });
  });

  // =========================================================================
  // parseTestCategory
  // =========================================================================
  describe('parseTestCategory', () => {
    it('returns canonical category for valid lowercase input', () => {
      expect(parseTestCategory('putting')).toBe('putting');
      expect(parseTestCategory('chipping')).toBe('chipping');
      expect(parseTestCategory('driver')).toBe('driver');
    });

    it('normalizes uppercase input to lowercase', () => {
      expect(parseTestCategory('PUTTING')).toBe('putting');
      expect(parseTestCategory('DRIVER')).toBe('driver');
      expect(parseTestCategory('Mental')).toBe('mental');
    });

    it('handles whitespace', () => {
      expect(parseTestCategory('  putting  ')).toBe('putting');
      expect(parseTestCategory(' driver ')).toBe('driver');
    });

    it('parses common aliases', () => {
      expect(parseTestCategory('putt')).toBe('putting');
      expect(parseTestCategory('chip')).toBe('chipping');
      expect(parseTestCategory('pitch')).toBe('pitching');
      expect(parseTestCategory('sand')).toBe('bunker');
      expect(parseTestCategory('irons')).toBe('iron');
      expect(parseTestCategory('driving')).toBe('driver');
      expect(parseTestCategory('fitness')).toBe('physical');
      expect(parseTestCategory('psychology')).toBe('mental');
    });

    it('returns null for invalid input', () => {
      expect(parseTestCategory('golf')).toBeNull();
      expect(parseTestCategory('teknikk')).toBeNull();
      expect(parseTestCategory('')).toBeNull();
      expect(parseTestCategory('invalid')).toBeNull();
    });

    it('returns null for non-string values', () => {
      expect(parseTestCategory(null)).toBeNull();
      expect(parseTestCategory(undefined)).toBeNull();
      expect(parseTestCategory(123)).toBeNull();
      expect(parseTestCategory({ value: 'putting' })).toBeNull();
    });
  });

  // =========================================================================
  // parseTestCategoryStrict
  // =========================================================================
  describe('parseTestCategoryStrict', () => {
    it('returns canonical category for valid input', () => {
      expect(parseTestCategoryStrict('putting')).toBe('putting');
      expect(parseTestCategoryStrict('DRIVER')).toBe('driver');
    });

    it('throws for invalid input', () => {
      expect(() => parseTestCategoryStrict('golf')).toThrow('Invalid TestCategory');
      expect(() => parseTestCategoryStrict(null)).toThrow('Invalid TestCategory');
      expect(() => parseTestCategoryStrict('')).toThrow('Invalid TestCategory');
    });

    it('includes valid options in error message', () => {
      expect(() => parseTestCategoryStrict('invalid')).toThrow(/putting/);
    });
  });

  // =========================================================================
  // isTestEnvironment Type Guard
  // =========================================================================
  describe('isTestEnvironment', () => {
    it('returns true for valid environments', () => {
      expect(isTestEnvironment('indoor')).toBe(true);
      expect(isTestEnvironment('outdoor')).toBe(true);
    });

    it('returns false for uppercase', () => {
      expect(isTestEnvironment('INDOOR')).toBe(false);
      expect(isTestEnvironment('OUTDOOR')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isTestEnvironment('inside')).toBe(false);
      expect(isTestEnvironment('outside')).toBe(false);
      expect(isTestEnvironment('')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isTestEnvironment(null)).toBe(false);
      expect(isTestEnvironment(undefined)).toBe(false);
      expect(isTestEnvironment(1)).toBe(false);
    });
  });

  // =========================================================================
  // parseTestEnvironment
  // =========================================================================
  describe('parseTestEnvironment', () => {
    it('returns valid environment', () => {
      expect(parseTestEnvironment('indoor')).toBe('indoor');
      expect(parseTestEnvironment('outdoor')).toBe('outdoor');
    });

    it('normalizes to lowercase', () => {
      expect(parseTestEnvironment('INDOOR')).toBe('indoor');
      expect(parseTestEnvironment('Outdoor')).toBe('outdoor');
    });

    it('handles whitespace', () => {
      expect(parseTestEnvironment('  indoor  ')).toBe('indoor');
    });

    it('parses common aliases', () => {
      expect(parseTestEnvironment('inside')).toBe('indoor');
      expect(parseTestEnvironment('indoors')).toBe('indoor');
      expect(parseTestEnvironment('outside')).toBe('outdoor');
      expect(parseTestEnvironment('outdoors')).toBe('outdoor');
      expect(parseTestEnvironment('range')).toBe('outdoor');
      expect(parseTestEnvironment('simulator')).toBe('indoor');
    });

    it('returns null for invalid input', () => {
      expect(parseTestEnvironment('court')).toBeNull();
      expect(parseTestEnvironment('')).toBeNull();
      expect(parseTestEnvironment(null)).toBeNull();
    });
  });

  // =========================================================================
  // parseTestEnvironmentStrict
  // =========================================================================
  describe('parseTestEnvironmentStrict', () => {
    it('returns valid environment', () => {
      expect(parseTestEnvironmentStrict('indoor')).toBe('indoor');
      expect(parseTestEnvironmentStrict('OUTDOOR')).toBe('outdoor');
    });

    it('throws for invalid input', () => {
      expect(() => parseTestEnvironmentStrict('court')).toThrow('Invalid TestEnvironment');
      expect(() => parseTestEnvironmentStrict(null)).toThrow('Invalid TestEnvironment');
    });
  });

  // =========================================================================
  // isPlayerCategory Type Guard
  // =========================================================================
  describe('isPlayerCategory', () => {
    it('returns true for valid player categories', () => {
      expect(isPlayerCategory('A1')).toBe(true);
      expect(isPlayerCategory('A2')).toBe(true);
      expect(isPlayerCategory('B1')).toBe(true);
      expect(isPlayerCategory('B2')).toBe(true);
      expect(isPlayerCategory('C1')).toBe(true);
      expect(isPlayerCategory('C2')).toBe(true);
      expect(isPlayerCategory('D1')).toBe(true);
      expect(isPlayerCategory('D2')).toBe(true);
    });

    it('returns false for lowercase', () => {
      expect(isPlayerCategory('a1')).toBe(false);
      expect(isPlayerCategory('b2')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isPlayerCategory('A')).toBe(false);
      expect(isPlayerCategory('A3')).toBe(false);
      expect(isPlayerCategory('E1')).toBe(false);
      expect(isPlayerCategory('')).toBe(false);
    });

    it('returns false for non-string values', () => {
      expect(isPlayerCategory(null)).toBe(false);
      expect(isPlayerCategory(undefined)).toBe(false);
      expect(isPlayerCategory(1)).toBe(false);
    });
  });

  // =========================================================================
  // parsePlayerCategory
  // =========================================================================
  describe('parsePlayerCategory', () => {
    it('returns canonical category for valid input', () => {
      expect(parsePlayerCategory('A1')).toBe('A1');
      expect(parsePlayerCategory('B2')).toBe('B2');
      expect(parsePlayerCategory('D1')).toBe('D1');
    });

    it('normalizes lowercase to uppercase', () => {
      expect(parsePlayerCategory('a1')).toBe('A1');
      expect(parsePlayerCategory('c2')).toBe('C2');
    });

    it('handles whitespace', () => {
      expect(parsePlayerCategory('  A1  ')).toBe('A1');
    });

    it('returns null for invalid input', () => {
      expect(parsePlayerCategory('A')).toBeNull();
      expect(parsePlayerCategory('A3')).toBeNull();
      expect(parsePlayerCategory('E1')).toBeNull();
      expect(parsePlayerCategory('')).toBeNull();
    });

    it('returns null for non-string values', () => {
      expect(parsePlayerCategory(null)).toBeNull();
      expect(parsePlayerCategory(undefined)).toBeNull();
      expect(parsePlayerCategory(1)).toBeNull();
    });
  });

  // =========================================================================
  // parsePlayerCategoryStrict
  // =========================================================================
  describe('parsePlayerCategoryStrict', () => {
    it('returns canonical category for valid input', () => {
      expect(parsePlayerCategoryStrict('A1')).toBe('A1');
      expect(parsePlayerCategoryStrict('d2')).toBe('D2');
    });

    it('throws for invalid input', () => {
      expect(() => parsePlayerCategoryStrict('A')).toThrow('Invalid PlayerCategory');
      expect(() => parsePlayerCategoryStrict(null)).toThrow('Invalid PlayerCategory');
      expect(() => parsePlayerCategoryStrict('')).toThrow('Invalid PlayerCategory');
    });

    it('includes valid options in error message', () => {
      expect(() => parsePlayerCategoryStrict('invalid')).toThrow(/A1, A2, B1, B2/);
    });
  });

  // =========================================================================
  // Constants verification
  // =========================================================================
  describe('Constants', () => {
    it('TEST_CATEGORIES contains all canonical test categories', () => {
      expect(TEST_CATEGORIES).toEqual([
        'putting',
        'chipping',
        'pitching',
        'bunker',
        'iron',
        'driver',
        'physical',
        'mental',
      ]);
    });

    it('TEST_ENVIRONMENTS contains indoor and outdoor', () => {
      expect(TEST_ENVIRONMENTS).toEqual(['indoor', 'outdoor']);
    });

    it('PLAYER_CATEGORIES contains all tier codes', () => {
      expect(PLAYER_CATEGORIES).toEqual([
        'A1', 'A2',
        'B1', 'B2',
        'C1', 'C2',
        'D1', 'D2',
      ]);
    });

    it('constants have correct length', () => {
      expect(TEST_CATEGORIES.length).toBe(8);
      expect(TEST_ENVIRONMENTS.length).toBe(2);
      expect(PLAYER_CATEGORIES.length).toBe(8);
    });
  });
});
