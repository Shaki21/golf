/**
 * Strokes Gained Engine Unit Tests
 *
 * Tests for the SG calculation engine including expected strokes lookup,
 * shot categorization, and round aggregation.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import {
  LieCategory,
  ShotCategory,
  DistanceType,
  getDistanceBucket,
  type ShotEventData,
} from '../../../src/api/v1/manual-stats/types';

// Mock Prisma client
const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([]),
  $executeRaw: jest.fn().mockResolvedValue(0),
  $transaction: jest.fn((fn) => fn(mockPrisma)),
  $executeRawUnsafe: jest.fn().mockResolvedValue(0),
} as any;

// Import after mocking
import { SGEngine } from '../../../src/api/v1/manual-stats/sg-engine';

describe('SGEngine', () => {
  let engine: SGEngine;

  beforeAll(async () => {
    engine = new SGEngine(mockPrisma);
    // Initialize with synthetic baseline (no DB call needed)
    await engine.initialize();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DISTANCE BUCKET TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('getDistanceBucket', () => {
    it('should return correct bucket for short putts (0-3m)', () => {
      const bucket = getDistanceBucket(2);
      expect(bucket.label).toBe('0-3m');
      expect(bucket.min).toBe(0);
      expect(bucket.max).toBe(3);
    });

    it('should return correct bucket for approach shots (100-125m)', () => {
      const bucket = getDistanceBucket(115);
      expect(bucket.label).toBe('100-125m');
    });

    it('should return 200+ bucket for very long distances', () => {
      const bucket = getDistanceBucket(280);
      expect(bucket.label).toBe('200+m');
    });

    it('should handle boundary values correctly', () => {
      const bucket3m = getDistanceBucket(3);
      expect(bucket3m.label).toBe('3-6m'); // 3 is at boundary, goes to next bucket

      const bucket50m = getDistanceBucket(50);
      expect(bucket50m.label).toBe('50-75m');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // EXPECTED STROKES LOOKUP TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('getExpectedStrokes', () => {
    it('should return expected strokes for green at 5m', () => {
      const result = engine.getExpectedStrokes(LieCategory.GREEN, 5);
      expect(result.lieCategory).toBe(LieCategory.GREEN);
      expect(result.distanceBucket).toBe('3-6m');
      expect(result.expectedStrokes).toBeCloseTo(1.5, 1);
    });

    it('should return expected strokes for fairway at 150m', () => {
      const result = engine.getExpectedStrokes(LieCategory.FAIRWAY, 150);
      expect(result.lieCategory).toBe(LieCategory.FAIRWAY);
      expect(result.distanceBucket).toBe('150-175m');
      expect(result.expectedStrokes).toBeGreaterThan(2.5);
    });

    it('should return higher expected strokes for bunker than fairway at same distance', () => {
      const fairway = engine.getExpectedStrokes(LieCategory.FAIRWAY, 100);
      const bunker = engine.getExpectedStrokes(LieCategory.BUNKER, 100);
      expect(bunker.expectedStrokes).toBeGreaterThan(fairway.expectedStrokes);
    });

    it('should return version info', () => {
      const result = engine.getExpectedStrokes(LieCategory.TEE, 200);
      expect(result.baselineVersion).toBe('synthetic_v1.0');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SHOT CATEGORIZATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('determineShotCategory', () => {
    it('should categorize first shot from tee as TEE', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 1,
        startDistanceM: 380,
        startLie: LieCategory.TEE,
        endDistanceM: 140,
        endLie: LieCategory.FAIRWAY,
        isHoled: false,
        shotCategory: ShotCategory.TEE, // Will be recalculated
        isEstimated: false,
        dataSource: 'manual',
      };

      const category = engine.determineShotCategory(shot);
      expect(category).toBe(ShotCategory.TEE);
    });

    it('should categorize shot from green as PUTTING', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 3,
        startDistanceM: 8,
        startLie: LieCategory.GREEN,
        endDistanceM: 0,
        endLie: LieCategory.GREEN,
        isHoled: true,
        shotCategory: ShotCategory.PUTTING,
        isEstimated: false,
        dataSource: 'manual',
      };

      const category = engine.determineShotCategory(shot);
      expect(category).toBe(ShotCategory.PUTTING);
    });

    it('should categorize shot from 30m rough as SHORT_GAME', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 2,
        startDistanceM: 30,
        startLie: LieCategory.ROUGH,
        endDistanceM: 5,
        endLie: LieCategory.GREEN,
        isHoled: false,
        shotCategory: ShotCategory.SHORT_GAME,
        isEstimated: false,
        dataSource: 'manual',
      };

      const category = engine.determineShotCategory(shot);
      expect(category).toBe(ShotCategory.SHORT_GAME);
    });

    it('should categorize shot from 120m fairway as APPROACH', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 2,
        startDistanceM: 120,
        startLie: LieCategory.FAIRWAY,
        endDistanceM: 6,
        endLie: LieCategory.GREEN,
        isHoled: false,
        shotCategory: ShotCategory.APPROACH,
        isEstimated: false,
        dataSource: 'manual',
      };

      const category = engine.determineShotCategory(shot);
      expect(category).toBe(ShotCategory.APPROACH);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SG CALCULATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('calculateShotSG', () => {
    it('should calculate positive SG for good approach shot', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 2,
        startDistanceM: 150,
        startLie: LieCategory.FAIRWAY,
        endDistanceM: 3, // Close to hole
        endLie: LieCategory.GREEN,
        isHoled: false,
        shotCategory: ShotCategory.APPROACH,
        isEstimated: false,
        dataSource: 'manual',
      };

      const result = engine.calculateShotSG(shot);
      expect(result).not.toBeNull();
      expect(result!.strokesGained).toBeGreaterThan(0); // Good shot = positive SG
    });

    it('should calculate negative SG for poor approach shot', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 2,
        startDistanceM: 100,
        startLie: LieCategory.FAIRWAY,
        endDistanceM: 40, // Long way from hole
        endLie: LieCategory.BUNKER,
        isHoled: false,
        shotCategory: ShotCategory.APPROACH,
        isEstimated: false,
        dataSource: 'manual',
      };

      const result = engine.calculateShotSG(shot);
      expect(result).not.toBeNull();
      expect(result!.strokesGained).toBeLessThan(0); // Poor shot = negative SG
    });

    it('should calculate SG for holed putt', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 4,
        startDistanceM: 5,
        startLie: LieCategory.GREEN,
        endDistanceM: 0,
        endLie: LieCategory.GREEN,
        isHoled: true,
        shotCategory: ShotCategory.PUTTING,
        isEstimated: false,
        dataSource: 'manual',
      };

      const result = engine.calculateShotSG(shot);
      expect(result).not.toBeNull();
      // Making a 5m putt should give positive SG (expected > 1 putt at 5m)
      expect(result!.strokesGained).toBeGreaterThan(0);
    });

    it('should return null for shot without end state', () => {
      const shot: ShotEventData = {
        holeNumber: 1,
        shotNumber: 2,
        startDistanceM: 150,
        startLie: LieCategory.FAIRWAY,
        endDistanceM: null, // Missing
        endLie: null,
        isHoled: false,
        shotCategory: ShotCategory.APPROACH,
        isEstimated: false,
        dataSource: 'manual',
      };

      const result = engine.calculateShotSG(shot);
      expect(result).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ROUND AGGREGATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('calculateRoundSG', () => {
    it('should aggregate SG by category', () => {
      const shotsWithSG = [
        {
          shot: { holeNumber: 1, shotCategory: ShotCategory.TEE } as ShotEventData,
          sg: { shotId: '1', strokesGained: 0.5, shotCategory: ShotCategory.TEE, expectedStrokesStart: 3.2, expectedStrokesEnd: 2.7, baselineVersion: 'v1' },
        },
        {
          shot: { holeNumber: 1, shotCategory: ShotCategory.APPROACH } as ShotEventData,
          sg: { shotId: '2', strokesGained: 0.3, shotCategory: ShotCategory.APPROACH, expectedStrokesStart: 2.7, expectedStrokesEnd: 1.4, baselineVersion: 'v1' },
        },
        {
          shot: { holeNumber: 1, shotCategory: ShotCategory.PUTTING } as ShotEventData,
          sg: { shotId: '3', strokesGained: -0.1, shotCategory: ShotCategory.PUTTING, expectedStrokesStart: 1.4, expectedStrokesEnd: 0, baselineVersion: 'v1' },
        },
      ];

      const result = engine.calculateRoundSG(shotsWithSG);

      expect(result.sgTee).toBeCloseTo(0.5, 2);
      expect(result.sgApproach).toBeCloseTo(0.3, 2);
      expect(result.sgPutting).toBeCloseTo(-0.1, 2);
      expect(result.sgTotal).toBeCloseTo(0.7, 2);
      expect(result.shotCountTee).toBe(1);
      expect(result.shotCountApproach).toBe(1);
      expect(result.shotCountPutting).toBe(1);
    });

    it('should calculate coverage percent correctly', () => {
      const shotsWithSG = [
        {
          shot: { holeNumber: 1, shotCategory: ShotCategory.TEE } as ShotEventData,
          sg: { shotId: '1', strokesGained: 0.1, shotCategory: ShotCategory.TEE, expectedStrokesStart: 3, expectedStrokesEnd: 2.9, baselineVersion: 'v1' },
        },
        {
          shot: { holeNumber: 5, shotCategory: ShotCategory.APPROACH } as ShotEventData,
          sg: { shotId: '2', strokesGained: 0.2, shotCategory: ShotCategory.APPROACH, expectedStrokesStart: 2.5, expectedStrokesEnd: 1.3, baselineVersion: 'v1' },
        },
        {
          shot: { holeNumber: 9, shotCategory: ShotCategory.PUTTING } as ShotEventData,
          sg: { shotId: '3', strokesGained: 0.0, shotCategory: ShotCategory.PUTTING, expectedStrokesStart: 1.5, expectedStrokesEnd: 0, baselineVersion: 'v1' },
        },
      ];

      const result = engine.calculateRoundSG(shotsWithSG);

      // 3 unique holes out of 18
      expect(result.holesWithSG).toBe(3);
      expect(result.coveragePercent).toBeCloseTo(16.7, 0);
    });
  });
});
