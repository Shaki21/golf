/**
 * Shot Normalizer Unit Tests
 *
 * Tests for converting hole-based data to shot events.
 */

import { describe, it, expect } from '@jest/globals';
import { ShotNormalizer, getShotNormalizer } from '../../../src/api/v1/manual-stats/shot-normalizer';
import { LieCategory, ShotCategory, DistanceType, type ExtractionHoleData } from '../../../src/api/v1/manual-stats/types';
import type { ManualHoleEntry } from '../../../src/api/v1/manual-stats/schemas';

describe('ShotNormalizer', () => {
  const normalizer = new ShotNormalizer();

  // ─────────────────────────────────────────────────────────────────────────
  // MANUAL HOLE NORMALIZATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('normalizeManualHole', () => {
    it('should normalize a complete par 4 hole', () => {
      const hole: ManualHoleEntry = {
        holeNumber: 1,
        holeLengthM: 380,
        holePar: 4,
        holeScore: 4,
        tee: {
          club: 'Driver',
          distanceM: 240,
          distanceType: DistanceType.TOTAL,
        },
        approach: {
          startDistanceM: 140,
          lie: LieCategory.FAIRWAY,
          club: '8i',
          endDistanceM: 5,
          endLie: LieCategory.GREEN,
        },
        putting: {
          firstPuttM: 5,
          puttsCount: 2,
        },
      };

      const result = normalizer.normalizeManualHole(hole);

      expect(result.holeNumber).toBe(1);
      expect(result.shots.length).toBe(4); // Tee + Approach + 2 putts
      expect(result.isComplete).toBe(true);

      // Check tee shot
      expect(result.shots[0].shotNumber).toBe(1);
      expect(result.shots[0].startDistanceM).toBe(380);
      expect(result.shots[0].startLie).toBe(LieCategory.TEE);
      expect(result.shots[0].endDistanceM).toBe(140); // 380 - 240
      expect(result.shots[0].shotCategory).toBe(ShotCategory.TEE);

      // Check approach shot
      expect(result.shots[1].shotNumber).toBe(2);
      expect(result.shots[1].startDistanceM).toBe(140);
      expect(result.shots[1].startLie).toBe(LieCategory.FAIRWAY);
      expect(result.shots[1].endDistanceM).toBe(5);
      expect(result.shots[1].shotCategory).toBe(ShotCategory.APPROACH);

      // Check first putt
      expect(result.shots[2].shotNumber).toBe(3);
      expect(result.shots[2].startDistanceM).toBe(5);
      expect(result.shots[2].startLie).toBe(LieCategory.GREEN);
      expect(result.shots[2].isHoled).toBe(false);

      // Check second putt (holed)
      expect(result.shots[3].shotNumber).toBe(4);
      expect(result.shots[3].isHoled).toBe(true);
    });

    it('should normalize a par 3 hole with short game', () => {
      const hole: ManualHoleEntry = {
        holeNumber: 7,
        holeLengthM: 165,
        holePar: 3,
        holeScore: 4,
        approach: {
          startDistanceM: 165,
          lie: LieCategory.TEE, // Par 3 - start from tee
          club: '6i',
          endDistanceM: 15,
          endLie: LieCategory.ROUGH,
        },
        shortGame: {
          startDistanceM: 15,
          lie: LieCategory.ROUGH,
          club: 'SW',
          endDistanceM: 3,
        },
        putting: {
          firstPuttM: 3,
          puttsCount: 1,
        },
      };

      const result = normalizer.normalizeManualHole(hole);

      expect(result.shots.length).toBe(3); // Approach + Short game + 1 putt

      // Check short game shot
      expect(result.shots[1].shotNumber).toBe(2);
      expect(result.shots[1].startDistanceM).toBe(15);
      expect(result.shots[1].startLie).toBe(LieCategory.ROUGH);
      expect(result.shots[1].shotCategory).toBe(ShotCategory.SHORT_GAME);
    });

    it('should handle partial data correctly', () => {
      const hole: ManualHoleEntry = {
        holeNumber: 5,
        holePar: 4,
        tee: {
          club: 'Driver',
          distanceM: 260,
        },
        // Missing approach and putting data
      };

      const result = normalizer.normalizeManualHole(hole);

      expect(result.shots.length).toBe(1);
      expect(result.isComplete).toBe(false);
      expect(result.sgComputable).toBe(false); // Can't compute SG without end state
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AI EXTRACTION NORMALIZATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('normalizeExtractionHole', () => {
    it('should normalize extraction data with full information', () => {
      const hole: ExtractionHoleData = {
        hole_number: 2,
        hole_length_m: 410,
        hole_par: 4,
        hole_score: 5,
        tee: {
          club: 'Driver',
          distance_m: 230,
          distance_type: DistanceType.TOTAL,
          confidence: 0.85,
        },
        approach: {
          start_distance_m: 180,
          lie: LieCategory.ROUGH,
          club: '5i',
          end: {
            distance_to_hole_m: 45,
            lie: LieCategory.BUNKER,
          },
          confidence: 0.72,
        },
        short_game: {
          start_distance_m: 45,
          lie: LieCategory.BUNKER,
          club: 'SW',
          end_distance_m: 8,
          confidence: 0.68,
        },
        putting: {
          first_putt_m: 8,
          putts: 2,
          confidence: 0.90,
        },
        overall_confidence: 0.78,
        requires_review: true,
        review_fields: ['approach.club'],
      };

      const result = normalizer.normalizeExtractionHole(hole);

      expect(result.shots.length).toBe(5); // Tee + Approach + Short game + 2 putts
      expect(result.holeScore).toBe(5);

      // Check bunker shot is categorized as short game
      const bunkerShot = result.shots.find(s => s.startLie === LieCategory.BUNKER);
      expect(bunkerShot).toBeDefined();
      expect(bunkerShot!.shotCategory).toBe(ShotCategory.SHORT_GAME);
    });

    it('should infer end position from subsequent shot start', () => {
      const hole: ExtractionHoleData = {
        hole_number: 3,
        hole_length_m: 350,
        tee: {
          club: 'Driver',
          distance_m: 240,
          distance_type: DistanceType.TOTAL,
          confidence: 0.80,
        },
        approach: {
          start_distance_m: 110, // This tells us where tee shot ended
          lie: LieCategory.FAIRWAY,
          club: 'PW',
          confidence: 0.75,
        },
        putting: {
          first_putt_m: 6,
          putts: 1,
          confidence: 0.92,
        },
        overall_confidence: 0.82,
        requires_review: false,
        review_fields: [],
      };

      const result = normalizer.normalizeExtractionHole(hole);

      // Tee shot end distance should be inferred from approach start
      expect(result.shots[0].endDistanceM).toBe(110);
      expect(result.shots[0].endLie).toBe(LieCategory.FAIRWAY);
      expect(result.shots[0].isEstimated).toBe(false);
    });

    it('should handle low confidence extractions', () => {
      const hole: ExtractionHoleData = {
        hole_number: 4,
        hole_length_m: 400,
        tee: {
          club: 'Driver',
          distance_m: 200,
          distance_type: DistanceType.TOTAL,
          confidence: 0.35, // Very low confidence
        },
        overall_confidence: 0.35,
        requires_review: true,
        review_fields: ['tee.distance_m', 'tee.club'],
      };

      const result = normalizer.normalizeExtractionHole(hole);

      // Should still create shot but mark as estimated
      expect(result.shots.length).toBeGreaterThan(0);
      expect(result.shots[0].confidence).toBe(0.35);
      expect(result.isComplete).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DATA QUALITY TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('calculateDataQuality', () => {
    it('should return high quality for complete holes', () => {
      const holes = [
        normalizer.normalizeManualHole({
          holeNumber: 1,
          holeLengthM: 380,
          holePar: 4,
          holeScore: 4,
          tee: { club: 'Driver', distanceM: 240 },
          approach: { startDistanceM: 140, lie: LieCategory.FAIRWAY, endDistanceM: 5 },
          putting: { firstPuttM: 5, puttsCount: 2 },
        }),
      ];

      const quality = normalizer.calculateDataQuality(holes);
      expect(quality).toBeGreaterThan(0.5);
    });

    it('should return low quality for incomplete holes', () => {
      const holes = [
        normalizer.normalizeManualHole({
          holeNumber: 1,
          tee: { club: 'Driver', distanceM: 240 },
          // Missing everything else
        }),
      ];

      const quality = normalizer.calculateDataQuality(holes);
      expect(quality).toBeLessThan(0.5);
    });

    it('should return 0 for empty array', () => {
      const quality = normalizer.calculateDataQuality([]);
      expect(quality).toBe(0);
    });
  });

  describe('calculateSGCoverage', () => {
    it('should return 100% when all holes are SG computable', () => {
      const holes = [
        { holeNumber: 1, shots: [], isComplete: true, sgComputable: true },
        { holeNumber: 2, shots: [], isComplete: true, sgComputable: true },
      ] as any[];

      const coverage = normalizer.calculateSGCoverage(holes);
      expect(coverage).toBe(100);
    });

    it('should return 50% when half of holes are SG computable', () => {
      const holes = [
        { holeNumber: 1, shots: [], isComplete: true, sgComputable: true },
        { holeNumber: 2, shots: [], isComplete: false, sgComputable: false },
      ] as any[];

      const coverage = normalizer.calculateSGCoverage(holes);
      expect(coverage).toBe(50);
    });
  });
});
