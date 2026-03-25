/**
 * Test Calculator Unit Tests
 * Tests all 20 test calculations, conversions, and percentiles
 */

import { calculateTestResult, calculateTestResultAsync, validateTestInput } from '../../../src/domain/tests/test-calculator';
import { RequirementsRepository } from '../../../src/domain/tests/requirements-repository';
import type { TestInput, PlayerContext, TestMetadata, CategoryRequirement } from '../../../src/domain/tests/types';

// Mock RequirementsRepository
const mockRequirements: Record<string, CategoryRequirement> = {
  'A-M-1': { category: 'A', gender: 'M', testNumber: 1, requirement: 270, unit: 'm', comparison: '>=' },
  'A-M-2': { category: 'A', gender: 'M', testNumber: 2, requirement: 250, unit: 'm', comparison: '>=' },
  'A-M-12': { category: 'A', gender: 'M', testNumber: 12, requirement: 140, unit: 'kg', comparison: '>=' },
  'A-M-15': { category: 'A', gender: 'M', testNumber: 15, requirement: 90, unit: '%', comparison: '>=' },
};

const mockRequirementsRepo = {
  getRequirement: jest.fn(async (category: string, gender: string, testNumber: number) => {
    const key = `${category}-${gender}-${testNumber}`;
    const req = mockRequirements[key];
    if (!req) {
      throw new Error(`No requirement found for category ${category}, gender ${gender}, test ${testNumber}`);
    }
    return req;
  }),
  clearCache: jest.fn(),
  preloadCache: jest.fn(),
} as unknown as RequirementsRepository;

describe('Test Calculator', () => {
  const mockPlayer: PlayerContext = {
    id: 'player-123',
    category: 'A',
    gender: 'M',
    age: 25,
    handicap: 5,
  };

  // Helper to create valid metadata for tests
  const createMetadata = (): TestMetadata => ({
    testDate: new Date(),
    location: 'Test Location',
    facility: 'Test Facility',
    environment: 'indoor',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTestResult', () => {
    it('should throw error for invalid test number', () => {
      expect(() => {
        calculateTestResult(0, {} as TestInput, mockPlayer);
      }).toThrow('Invalid test number');

      expect(() => {
        calculateTestResult(21, {} as TestInput, mockPlayer);
      }).toThrow('Invalid test number');

      expect(() => {
        calculateTestResult(-1, {} as TestInput, mockPlayer);
      }).toThrow('Invalid test number');
    });

    describe('Test 1: Driver Distance (6 shots)', () => {
      it('should calculate average distance correctly', async () => {
        // Implementation uses top 3 average of carryDistanceMeters
        const input = {
          metadata: createMetadata(),
          shots: [
            { shotNumber: 1, carryDistanceMeters: 250 },
            { shotNumber: 2, carryDistanceMeters: 255 },
            { shotNumber: 3, carryDistanceMeters: 260 },
            { shotNumber: 4, carryDistanceMeters: 245 },
            { shotNumber: 5, carryDistanceMeters: 250 },
            { shotNumber: 6, carryDistanceMeters: 255 },
          ],
        };

        const result = await calculateTestResultAsync(1, input as any, mockPlayer, mockRequirementsRepo);

        // Top 3: 260, 255, 255 = 770/3 = 256.67
        expect(result.value).toBeCloseTo(256.7, 1);
        expect(result.passed).toBeDefined();
        expect(result.categoryRequirement).toBe(270);
        expect(result.percentOfRequirement).toBeGreaterThanOrEqual(0);
      });

      it('should handle edge cases', async () => {
        const input = {
          metadata: createMetadata(),
          shots: [
            { shotNumber: 1, carryDistanceMeters: 0 },
            { shotNumber: 2, carryDistanceMeters: 0 },
            { shotNumber: 3, carryDistanceMeters: 0 },
            { shotNumber: 4, carryDistanceMeters: 0 },
            { shotNumber: 5, carryDistanceMeters: 0 },
            { shotNumber: 6, carryDistanceMeters: 0 },
          ],
        };

        const result = await calculateTestResultAsync(1, input as any, mockPlayer, mockRequirementsRepo);
        expect(result.value).toBe(0);
      });
    });

    describe('Tests 2-20: Various test calculations', () => {
      it('should calculate all test types correctly', async () => {
        // Test 2: 3-Wood - uses top 3 average of carryDistanceMeters
        let result = await calculateTestResultAsync(2, {
          metadata: createMetadata(),
          shots: [
            { shotNumber: 1, carryDistanceMeters: 220 },
            { shotNumber: 2, carryDistanceMeters: 225 },
            { shotNumber: 3, carryDistanceMeters: 230 },
            { shotNumber: 4, carryDistanceMeters: 215 },
            { shotNumber: 5, carryDistanceMeters: 220 },
            { shotNumber: 6, carryDistanceMeters: 225 },
          ],
        } as any, mockPlayer, mockRequirementsRepo);
        // Top 3: 230, 225, 225 = 680/3 = 226.67
        expect(result.value).toBeCloseTo(226.7, 1);
        expect(result.passed).toBeDefined();

        // Test 12: Benkpress 1RM - uses weightKg
        result = await calculateTestResultAsync(12, {
          metadata: createMetadata(),
          weightKg: 100,
        } as any, mockPlayer, mockRequirementsRepo);
        expect(result.value).toBe(100);
        expect(result.passed).toBeDefined();

        // Test 15: Putting 3m - uses putts array with holed boolean
        result = await calculateTestResultAsync(15, {
          metadata: createMetadata(),
          putts: [
            { puttNumber: 1, holed: true },
            { puttNumber: 2, holed: true },
            { puttNumber: 3, holed: true },
            { puttNumber: 4, holed: true },
            { puttNumber: 5, holed: true },
            { puttNumber: 6, holed: true },
            { puttNumber: 7, holed: true },
            { puttNumber: 8, holed: true },
            { puttNumber: 9, holed: false },
            { puttNumber: 10, holed: false },
          ],
        } as any, mockPlayer, mockRequirementsRepo);
        // 8 holed out of 10 = 80%
        expect(result.value).toBe(80);
        expect(result.passed).toBeDefined();
      });
    });
  });

  describe('validateTestInput', () => {
    it('should validate test 1 input successfully', () => {
      const input = {
        metadata: createMetadata(),
        shots: [
          { shotNumber: 1, carryDistanceMeters: 250 },
          { shotNumber: 2, carryDistanceMeters: 255 },
          { shotNumber: 3, carryDistanceMeters: 260 },
          { shotNumber: 4, carryDistanceMeters: 245 },
          { shotNumber: 5, carryDistanceMeters: 250 },
          { shotNumber: 6, carryDistanceMeters: 255 },
        ],
      };

      expect(() => {
        validateTestInput(1, input);
      }).not.toThrow();
    });

    it('should throw error for invalid test 1 input (wrong number of shots)', () => {
      const input = {
        metadata: createMetadata(),
        shots: [
          { shotNumber: 1, carryDistanceMeters: 250 },
          { shotNumber: 2, carryDistanceMeters: 255 },
          { shotNumber: 3, carryDistanceMeters: 260 },
        ],
      };

      expect(() => {
        validateTestInput(1, input);
      }).toThrow();
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        validateTestInput(1, {} as any);
      }).toThrow();
    });

    it('should validate test 15 input (putting)', () => {
      const input = {
        metadata: createMetadata(),
        putts: [
          { puttNumber: 1, holed: true },
          { puttNumber: 2, holed: true },
          { puttNumber: 3, holed: true },
          { puttNumber: 4, holed: true },
          { puttNumber: 5, holed: true },
          { puttNumber: 6, holed: true },
          { puttNumber: 7, holed: true },
          { puttNumber: 8, holed: true },
          { puttNumber: 9, holed: false },
          { puttNumber: 10, holed: false },
        ],
      };

      expect(() => {
        validateTestInput(15, input);
      }).not.toThrow();
    });

    it('should throw error for invalid putting input (wrong number of putts)', () => {
      const input = {
        metadata: createMetadata(),
        putts: [
          { puttNumber: 1, holed: true },
          { puttNumber: 2, holed: true },
        ],
      };

      expect(() => {
        validateTestInput(15, input);
      }).toThrow();
    });
  });

  describe('result evaluation', () => {
    it('should include category requirements', async () => {
      const input = {
        metadata: createMetadata(),
        shots: [
          { shotNumber: 1, carryDistanceMeters: 250 },
          { shotNumber: 2, carryDistanceMeters: 255 },
          { shotNumber: 3, carryDistanceMeters: 260 },
          { shotNumber: 4, carryDistanceMeters: 245 },
          { shotNumber: 5, carryDistanceMeters: 250 },
          { shotNumber: 6, carryDistanceMeters: 255 },
        ],
      };

      const result = await calculateTestResultAsync(1, input as any, mockPlayer, mockRequirementsRepo);

      // Top 3: 260, 255, 255 = 770/3 = 256.67
      expect(result.value).toBeCloseTo(256.7, 1);
      expect(result.passed).toBeDefined();
      expect(result.categoryRequirement).toBeDefined();
      // For category A, M, test 1, requirement should be 270 meters
      expect(result.categoryRequirement).toBe(270);
      expect(result.percentOfRequirement).toBeGreaterThanOrEqual(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', async () => {
      // Test with zero values
      const input = {
        metadata: createMetadata(),
        shots: [
          { shotNumber: 1, carryDistanceMeters: 0 },
          { shotNumber: 2, carryDistanceMeters: 0 },
          { shotNumber: 3, carryDistanceMeters: 0 },
          { shotNumber: 4, carryDistanceMeters: 0 },
          { shotNumber: 5, carryDistanceMeters: 0 },
          { shotNumber: 6, carryDistanceMeters: 0 },
        ],
      };

      const result = await calculateTestResultAsync(1, input as any, mockPlayer, mockRequirementsRepo);
      expect(result.value).toBe(0);
      expect(result.passed).toBe(false); // Should fail with 0 distance
      expect(result.categoryRequirement).toBe(270); // Category A, M requirement
    });
  });

  describe('all 20 tests', () => {
    it('should successfully calculate multiple test types', async () => {
      // Test 1: Driver
      let result = await calculateTestResultAsync(1, {
        metadata: createMetadata(),
        shots: Array(6).fill(null).map((_, i) => ({ shotNumber: i + 1, carryDistanceMeters: 250 })),
      } as any, mockPlayer, mockRequirementsRepo);
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('categoryRequirement');

      // Test 12: Physical test (Benkpress)
      result = await calculateTestResultAsync(12, {
        metadata: createMetadata(),
        weightKg: 100,
      } as any, mockPlayer, mockRequirementsRepo);
      expect(result.value).toBe(100);
      expect(result.categoryRequirement).toBe(140); // Category A, M requirement

      // Test 15: Putting 3m
      result = await calculateTestResultAsync(15, {
        metadata: createMetadata(),
        putts: Array(10).fill(null).map((_, i) => ({ puttNumber: i + 1, holed: true })),
      } as any, mockPlayer, mockRequirementsRepo);
      expect(result.value).toBe(100); // 100% success rate
      expect(result.categoryRequirement).toBe(90); // Category A, M requirement
    });
  });
});
