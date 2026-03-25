/**
 * Shot Normalization Service
 *
 * Converts hole-based extraction data to individual shot events.
 * Handles partial data, estimation marking, and data quality assessment.
 */

import {
  LieCategory,
  ShotCategory,
  DistanceType,
  type ShotEventData,
  type NormalizedHoleData,
  type ExtractionHoleData,
  type SGCategoryRules,
  DEFAULT_SG_CATEGORY_RULES,
} from './types';
import type { ManualHoleEntry } from './schemas';
import { logger } from '../../../utils/logger';

// ============================================================================
// SHOT NORMALIZER SERVICE
// ============================================================================

export class ShotNormalizer {
  private categoryRules: SGCategoryRules;

  constructor(categoryRules?: SGCategoryRules) {
    this.categoryRules = categoryRules ?? DEFAULT_SG_CATEGORY_RULES;
  }

  /**
   * Normalize a single hole from AI extraction
   */
  normalizeExtractionHole(
    hole: ExtractionHoleData,
    dataSource: 'ai' | 'manual' | 'mixed' = 'ai'
  ): NormalizedHoleData {
    const shots: ShotEventData[] = [];
    let shotNumber = 1;
    let isComplete = true;
    let sgComputable = true;

    const holeLengthM = hole.hole_length_m ?? 400; // Default if not provided

    // ========================================
    // TEE SHOT
    // ========================================
    if (hole.tee) {
      const teeShot: ShotEventData = {
        holeNumber: hole.hole_number,
        shotNumber: shotNumber++,
        startDistanceM: holeLengthM,
        startLie: LieCategory.TEE,
        endDistanceM: null,
        endLie: null,
        isHoled: false,
        club: hole.tee.club,
        distanceType: hole.tee.distance_type,
        shotCategory: ShotCategory.TEE,
        isEstimated: false,
        dataSource,
        confidence: hole.tee.confidence,
      };

      // Calculate end position from tee shot distance
      if (hole.tee.distance_m) {
        const remainingDistance = holeLengthM - hole.tee.distance_m;
        teeShot.endDistanceM = Math.max(0, remainingDistance);

        // Infer end lie based on approach data or default to FAIRWAY
        if (hole.approach?.lie) {
          teeShot.endLie = hole.approach.lie;
        } else if (remainingDistance <= 0) {
          teeShot.endLie = LieCategory.GREEN;
          teeShot.isHoled = remainingDistance <= 0 && !hole.approach && !hole.short_game && hole.putting?.putts === 0;
        } else {
          teeShot.endLie = LieCategory.FAIRWAY; // Assumption - mark as estimated
          teeShot.isEstimated = true;
        }
      } else {
        // No distance = can't determine end state
        isComplete = false;
        sgComputable = false;
      }

      shots.push(teeShot);
    } else {
      // No tee data at all
      isComplete = false;
      sgComputable = false;
    }

    // ========================================
    // APPROACH SHOT
    // ========================================
    if (hole.approach) {
      const approachShot: ShotEventData = {
        holeNumber: hole.hole_number,
        shotNumber: shotNumber++,
        startDistanceM: hole.approach.start_distance_m,
        startLie: hole.approach.lie,
        endDistanceM: null,
        endLie: null,
        isHoled: false,
        club: hole.approach.club,
        shotCategory: ShotCategory.APPROACH,
        isEstimated: false,
        dataSource,
        confidence: hole.approach.confidence,
      };

      // Set end state from approach data
      if (hole.approach.end) {
        approachShot.endDistanceM = hole.approach.end.distance_to_hole_m;
        approachShot.endLie = hole.approach.end.lie;
      } else if (hole.short_game) {
        // Infer from short game start
        approachShot.endDistanceM = hole.short_game.start_distance_m;
        approachShot.endLie = hole.short_game.lie;
      } else if (hole.putting) {
        // Infer from putting (hit green)
        approachShot.endDistanceM = hole.putting.first_putt_m;
        approachShot.endLie = LieCategory.GREEN;
      } else {
        // Can't determine end - mark as partial
        isComplete = false;
        sgComputable = false;
      }

      shots.push(approachShot);

      // Update last tee shot's end if we didn't have approach start info
      if (shots.length >= 2 && shots[0].endDistanceM === null) {
        shots[0].endDistanceM = hole.approach.start_distance_m;
        shots[0].endLie = hole.approach.lie;
        shots[0].isEstimated = false;
      }
    }

    // ========================================
    // SHORT GAME (if miss green)
    // ========================================
    if (hole.short_game) {
      const shortGameShot: ShotEventData = {
        holeNumber: hole.hole_number,
        shotNumber: shotNumber++,
        startDistanceM: hole.short_game.start_distance_m,
        startLie: hole.short_game.lie,
        endDistanceM: null,
        endLie: null,
        isHoled: false,
        club: hole.short_game.club,
        shotCategory: ShotCategory.SHORT_GAME,
        isEstimated: false,
        dataSource,
        confidence: hole.short_game.confidence,
      };

      // Set end state
      if (hole.short_game.end_distance_m !== undefined) {
        shortGameShot.endDistanceM = hole.short_game.end_distance_m;
        shortGameShot.endLie = LieCategory.GREEN;
      } else if (hole.putting) {
        // Infer from putting
        shortGameShot.endDistanceM = hole.putting.first_putt_m;
        shortGameShot.endLie = LieCategory.GREEN;
      } else {
        isComplete = false;
        sgComputable = false;
      }

      // Check for chip-in
      if (shortGameShot.endDistanceM === 0 || (hole.putting?.putts === 0 && hole.putting?.first_putt_m === 0)) {
        shortGameShot.isHoled = true;
        shortGameShot.endDistanceM = 0;
        shortGameShot.endLie = LieCategory.GREEN;
      }

      shots.push(shortGameShot);
    }

    // ========================================
    // PUTTING
    // ========================================
    if (hole.putting && hole.putting.putts > 0) {
      const firstPuttDistance = hole.putting.first_putt_m;
      const totalPutts = hole.putting.putts;

      // Create shots for each putt
      for (let puttNum = 1; puttNum <= totalPutts; puttNum++) {
        const isLastPutt = puttNum === totalPutts;

        const puttShot: ShotEventData = {
          holeNumber: hole.hole_number,
          shotNumber: shotNumber++,
          startDistanceM: puttNum === 1 ? firstPuttDistance : 0, // We only know first putt distance
          startLie: LieCategory.GREEN,
          endDistanceM: isLastPutt ? 0 : 0, // Unknown intermediate distances
          endLie: LieCategory.GREEN,
          isHoled: isLastPutt,
          shotCategory: ShotCategory.PUTTING,
          isEstimated: puttNum > 1, // Only first putt distance is known
          dataSource,
          confidence: hole.putting?.confidence,
        };

        // Mark intermediate putts as having unknown start distance (only first is known)
        if (puttNum > 1) {
          puttShot.startDistanceM = 0; // Unknown
          puttShot.isEstimated = true;
          // Can't calculate SG without start distance
          sgComputable = false;
        }

        shots.push(puttShot);
      }
    }

    // Check total shots vs score
    if (hole.hole_score && shots.length !== hole.hole_score) {
      logger.warn(
        { holeNumber: hole.hole_number, shotCount: shots.length, holeScore: hole.hole_score },
        'Shot count does not match hole score'
      );
      // Mark as partial since something is missing
      isComplete = false;
    }

    return {
      holeNumber: hole.hole_number,
      holeLengthM: hole.hole_length_m,
      holePar: hole.hole_par,
      holeScore: hole.hole_score,
      shots,
      isComplete,
      sgComputable,
    };
  }

  /**
   * Normalize a manually entered hole
   */
  normalizeManualHole(hole: ManualHoleEntry): NormalizedHoleData {
    const shots: ShotEventData[] = [];
    let shotNumber = 1;
    let isComplete = true;
    let sgComputable = true;

    const holeLengthM = hole.holeLengthM ?? 400;

    // TEE SHOT
    if (hole.tee) {
      const remainingDistance = holeLengthM - hole.tee.distanceM;

      const teeShot: ShotEventData = {
        holeNumber: hole.holeNumber,
        shotNumber: shotNumber++,
        startDistanceM: holeLengthM,
        startLie: LieCategory.TEE,
        endDistanceM: Math.max(0, remainingDistance),
        endLie: hole.approach?.lie ?? LieCategory.FAIRWAY,
        isHoled: false,
        club: hole.tee.club,
        distanceType: hole.tee.distanceType,
        shotCategory: ShotCategory.TEE,
        isEstimated: !hole.approach, // End lie is estimated if no approach data
        dataSource: 'manual',
      };

      shots.push(teeShot);
    }

    // APPROACH
    if (hole.approach) {
      const approachShot: ShotEventData = {
        holeNumber: hole.holeNumber,
        shotNumber: shotNumber++,
        startDistanceM: hole.approach.startDistanceM,
        startLie: hole.approach.lie,
        endDistanceM: hole.approach.endDistanceM ?? (hole.putting?.firstPuttM ?? null),
        endLie: hole.approach.endLie ?? (hole.putting ? LieCategory.GREEN : null),
        isHoled: false,
        club: hole.approach.club,
        shotCategory: ShotCategory.APPROACH,
        isEstimated: hole.approach.endDistanceM === undefined,
        dataSource: 'manual',
      };

      if (approachShot.endDistanceM === null) {
        sgComputable = false;
      }

      shots.push(approachShot);
    }

    // SHORT GAME
    if (hole.shortGame) {
      const shortGameShot: ShotEventData = {
        holeNumber: hole.holeNumber,
        shotNumber: shotNumber++,
        startDistanceM: hole.shortGame.startDistanceM,
        startLie: hole.shortGame.lie,
        endDistanceM: hole.shortGame.endDistanceM ?? (hole.putting?.firstPuttM ?? null),
        endLie: LieCategory.GREEN,
        isHoled: hole.shortGame.endDistanceM === 0,
        club: hole.shortGame.club,
        shotCategory: ShotCategory.SHORT_GAME,
        isEstimated: hole.shortGame.endDistanceM === undefined,
        dataSource: 'manual',
      };

      if (shortGameShot.endDistanceM === null) {
        sgComputable = false;
      }

      shots.push(shortGameShot);
    }

    // PUTTING
    if (hole.putting && hole.putting.puttsCount > 0) {
      for (let puttNum = 1; puttNum <= hole.putting.puttsCount; puttNum++) {
        const isLastPutt = puttNum === hole.putting.puttsCount;

        const puttShot: ShotEventData = {
          holeNumber: hole.holeNumber,
          shotNumber: shotNumber++,
          startDistanceM: puttNum === 1 ? hole.putting.firstPuttM : 0,
          startLie: LieCategory.GREEN,
          endDistanceM: isLastPutt ? 0 : 0,
          endLie: LieCategory.GREEN,
          isHoled: isLastPutt,
          shotCategory: ShotCategory.PUTTING,
          isEstimated: puttNum > 1,
          dataSource: 'manual',
        };

        if (puttNum > 1) {
          sgComputable = false; // Can't calculate SG for intermediate putts
        }

        shots.push(puttShot);
      }
    }

    // Validate total
    if (hole.holeScore && shots.length !== hole.holeScore) {
      isComplete = false;
    }

    return {
      holeNumber: hole.holeNumber,
      holeLengthM: hole.holeLengthM,
      holePar: hole.holePar,
      holeScore: hole.holeScore,
      shots,
      isComplete,
      sgComputable,
    };
  }

  /**
   * Normalize all holes from extraction
   */
  normalizeExtractionHoles(holes: ExtractionHoleData[]): NormalizedHoleData[] {
    return holes.map((hole) => this.normalizeExtractionHole(hole));
  }

  /**
   * Normalize all manually entered holes
   */
  normalizeManualHoles(holes: ManualHoleEntry[]): NormalizedHoleData[] {
    return holes.map((hole) => this.normalizeManualHole(hole));
  }

  /**
   * Calculate data quality score (0-1)
   */
  calculateDataQuality(holes: NormalizedHoleData[]): number {
    if (holes.length === 0) return 0;

    let totalFields = 0;
    let completeFields = 0;

    for (const hole of holes) {
      // Count expected fields
      totalFields += 4; // tee, approach, shortgame (optional), putting

      // Count complete shots
      for (const shot of hole.shots) {
        if (shot.startDistanceM !== null && shot.endDistanceM !== null && !shot.isEstimated) {
          completeFields++;
        }
      }
    }

    return totalFields > 0 ? completeFields / totalFields : 0;
  }

  /**
   * Calculate SG computable coverage
   */
  calculateSGCoverage(holes: NormalizedHoleData[]): number {
    if (holes.length === 0) return 0;
    const sgComputableCount = holes.filter((h) => h.sgComputable).length;
    return (sgComputableCount / holes.length) * 100;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let normalizerInstance: ShotNormalizer | null = null;

export function getShotNormalizer(rules?: SGCategoryRules): ShotNormalizer {
  if (!normalizerInstance) {
    normalizerInstance = new ShotNormalizer(rules);
  }
  return normalizerInstance;
}
