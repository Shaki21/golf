/**
 * Strokes Gained Calculation Engine
 *
 * Deterministic SG calculation with versioned baseline tables.
 * Formula: SG = Expected(Start) - Expected(End) - 1
 * For holed shots: SG = Expected(Start) - 0 - 1 = Expected(Start) - 1
 */

import { PrismaClient } from '@prisma/client';
import {
  LieCategory,
  ShotCategory,
  getDistanceBucket,
  type ShotEventData,
  type SGShotResultData,
  type SGRoundResultData,
  type ExpectedStrokesLookup,
  type SGCategoryRules,
  DEFAULT_SG_CATEGORY_RULES,
  DISTANCE_BUCKETS,
} from './types';
import { logger } from '../../../utils/logger';

// ============================================================================
// EXPECTED STROKES BASELINE (Placeholder - Synthetic Data)
// ============================================================================

/**
 * Synthetic expected strokes baseline.
 * This will be replaced with real PGA Tour data via database import.
 *
 * Sources for real data:
 * - PGA Tour ShotLink data
 * - Mark Broadie's research
 * - DataGolf baseline tables
 */
const SYNTHETIC_BASELINE: Record<LieCategory, Record<string, number>> = {
  [LieCategory.TEE]: {
    '0-3m': 1.0,
    '3-6m': 1.05,
    '6-10m': 1.1,
    '10-15m': 1.15,
    '15-25m': 1.25,
    '25-50m': 1.4,
    '50-75m': 2.1,
    '75-100m': 2.3,
    '100-125m': 2.5,
    '125-150m': 2.7,
    '150-175m': 2.85,
    '175-200m': 2.95,
    '200+m': 3.2,
  },
  [LieCategory.FAIRWAY]: {
    '0-3m': 1.0,
    '3-6m': 1.05,
    '6-10m': 1.1,
    '10-15m': 1.2,
    '15-25m': 1.35,
    '25-50m': 1.8,
    '50-75m': 2.3,
    '75-100m': 2.55,
    '100-125m': 2.75,
    '125-150m': 2.9,
    '150-175m': 3.0,
    '175-200m': 3.1,
    '200+m': 3.3,
  },
  [LieCategory.ROUGH]: {
    '0-3m': 1.1,
    '3-6m': 1.15,
    '6-10m': 1.25,
    '10-15m': 1.4,
    '15-25m': 1.6,
    '25-50m': 2.1,
    '50-75m': 2.5,
    '75-100m': 2.75,
    '100-125m': 2.95,
    '125-150m': 3.1,
    '150-175m': 3.25,
    '175-200m': 3.4,
    '200+m': 3.6,
  },
  [LieCategory.BUNKER]: {
    '0-3m': 1.2,
    '3-6m': 1.3,
    '6-10m': 1.5,
    '10-15m': 1.8,
    '15-25m': 2.1,
    '25-50m': 2.6,
    '50-75m': 2.9,
    '75-100m': 3.1,
    '100-125m': 3.3,
    '125-150m': 3.5,
    '150-175m': 3.7,
    '175-200m': 3.9,
    '200+m': 4.1,
  },
  [LieCategory.RECOVERY]: {
    '0-3m': 1.5,
    '3-6m': 1.6,
    '6-10m': 1.8,
    '10-15m': 2.1,
    '15-25m': 2.4,
    '25-50m': 2.8,
    '50-75m': 3.2,
    '75-100m': 3.5,
    '100-125m': 3.7,
    '125-150m': 3.9,
    '150-175m': 4.1,
    '175-200m': 4.3,
    '200+m': 4.5,
  },
  [LieCategory.GREEN]: {
    '0-3m': 1.0,
    '3-6m': 1.5,
    '6-10m': 1.8,
    '10-15m': 1.95,
    '15-25m': 2.1,
    '25-50m': 2.3,
    '50-75m': 2.5,
    '75-100m': 2.7,
    '100-125m': 2.9,
    '125-150m': 3.1,
    '150-175m': 3.3,
    '175-200m': 3.5,
    '200+m': 3.7,
  },
  [LieCategory.PENALTY]: {
    '0-3m': 2.0,
    '3-6m': 2.1,
    '6-10m': 2.2,
    '10-15m': 2.4,
    '15-25m': 2.6,
    '25-50m': 2.9,
    '50-75m': 3.2,
    '75-100m': 3.5,
    '100-125m': 3.7,
    '125-150m': 3.9,
    '150-175m': 4.1,
    '175-200m': 4.3,
    '200+m': 4.5,
  },
  [LieCategory.OTHER]: {
    '0-3m': 1.2,
    '3-6m': 1.3,
    '6-10m': 1.5,
    '10-15m': 1.7,
    '15-25m': 1.9,
    '25-50m': 2.3,
    '50-75m': 2.7,
    '75-100m': 3.0,
    '100-125m': 3.2,
    '125-150m': 3.4,
    '150-175m': 3.6,
    '175-200m': 3.8,
    '200+m': 4.0,
  },
};

const SYNTHETIC_BASELINE_VERSION = 'synthetic_v1.0';

// ============================================================================
// SG ENGINE SERVICE
// ============================================================================

export class SGEngine {
  private baselineCache: Map<string, Map<string, number>> = new Map();
  private activeVersion: string = SYNTHETIC_BASELINE_VERSION;
  private categoryRules: SGCategoryRules = DEFAULT_SG_CATEGORY_RULES;

  constructor(private prisma: PrismaClient) {}

  /**
   * Initialize the engine with the active baseline from database
   */
  async initialize(): Promise<void> {
    try {
      // Check if we have a database baseline
      const activeBaseline = await this.prisma.$queryRaw<
        Array<{ version: string }>
      >`
        SELECT DISTINCT version
        FROM sg_expected_strokes_baseline
        WHERE is_active = true
        LIMIT 1
      `;

      if (activeBaseline.length > 0) {
        this.activeVersion = activeBaseline[0].version;
        await this.loadBaselineFromDB(this.activeVersion);
        logger.info({ version: this.activeVersion }, 'Loaded SG baseline from database');
      } else {
        // Use synthetic baseline
        this.loadSyntheticBaseline();
        logger.info('Using synthetic SG baseline');
      }

      // Load category rules
      await this.loadCategoryRules();
    } catch (error) {
      logger.warn({ error }, 'Failed to load baseline from DB, using synthetic');
      this.loadSyntheticBaseline();
    }
  }

  /**
   * Load synthetic baseline into cache
   */
  private loadSyntheticBaseline(): void {
    this.activeVersion = SYNTHETIC_BASELINE_VERSION;
    const versionCache = new Map<string, number>();

    for (const [lie, buckets] of Object.entries(SYNTHETIC_BASELINE)) {
      for (const [bucket, expected] of Object.entries(buckets)) {
        const key = `${lie}:${bucket}`;
        versionCache.set(key, expected);
      }
    }

    this.baselineCache.set(this.activeVersion, versionCache);
  }

  /**
   * Load baseline from database
   */
  private async loadBaselineFromDB(version: string): Promise<void> {
    const entries = await this.prisma.$queryRaw<
      Array<{
        lie_category: string;
        distance_bucket_min: number;
        distance_bucket_max: number;
        expected_strokes: number;
      }>
    >`
      SELECT lie_category, distance_bucket_min, distance_bucket_max, expected_strokes
      FROM sg_expected_strokes_baseline
      WHERE version = ${version}
    `;

    const versionCache = new Map<string, number>();

    for (const entry of entries) {
      const bucket = DISTANCE_BUCKETS.find(
        (b) => b.min === entry.distance_bucket_min && b.max === entry.distance_bucket_max
      );
      if (bucket) {
        const key = `${entry.lie_category}:${bucket.label}`;
        versionCache.set(key, entry.expected_strokes);
      }
    }

    this.baselineCache.set(version, versionCache);
  }

  /**
   * Load category rules from database
   */
  private async loadCategoryRules(): Promise<void> {
    try {
      const config = await this.prisma.$queryRaw<
        Array<{ rules: SGCategoryRules }>
      >`
        SELECT rules FROM sg_category_configs WHERE is_active = true LIMIT 1
      `;

      if (config.length > 0) {
        this.categoryRules = config[0].rules;
      }
    } catch {
      // Use defaults
    }
  }

  /**
   * Get expected strokes for a given position
   */
  getExpectedStrokes(lie: LieCategory, distanceM: number): ExpectedStrokesLookup {
    const bucket = getDistanceBucket(distanceM);
    const cacheKey = `${lie}:${bucket.label}`;
    const versionCache = this.baselineCache.get(this.activeVersion);

    let expectedStrokes = 2.0; // Fallback
    if (versionCache) {
      expectedStrokes = versionCache.get(cacheKey) ?? expectedStrokes;
    }

    return {
      lieCategory: lie,
      distanceM,
      expectedStrokes,
      distanceBucket: bucket.label,
      baselineVersion: this.activeVersion,
    };
  }

  /**
   * Determine shot category based on rules
   */
  determineShotCategory(shot: ShotEventData): ShotCategory {
    // Rule 1: First shot = TEE
    if (shot.shotNumber === this.categoryRules.TEE_SHOT_NUMBER && shot.startLie === LieCategory.TEE) {
      return ShotCategory.TEE;
    }

    // Rule 2: Start on GREEN = PUTTING
    if (this.categoryRules.PUTTING_START_LIE.includes(shot.startLie)) {
      return ShotCategory.PUTTING;
    }

    // Rule 3: <= 50m and not on green = SHORT_GAME
    if (
      shot.startDistanceM <= this.categoryRules.SHORT_GAME_MAX_DISTANCE_M &&
      shot.startLie !== LieCategory.GREEN
    ) {
      return ShotCategory.SHORT_GAME;
    }

    // Rule 4: Everything else = APPROACH
    return ShotCategory.APPROACH;
  }

  /**
   * Calculate SG for a single shot
   */
  calculateShotSG(shot: ShotEventData): SGShotResultData | null {
    // Can't calculate without end state (unless holed)
    if (!shot.isHoled && (shot.endDistanceM === null || shot.endLie === null)) {
      return null;
    }

    const startLookup = this.getExpectedStrokes(shot.startLie, shot.startDistanceM);

    let endExpected: number;
    if (shot.isHoled) {
      endExpected = 0;
    } else {
      const endLookup = this.getExpectedStrokes(shot.endLie!, shot.endDistanceM!);
      endExpected = endLookup.expectedStrokes;
    }

    // SG Formula: Expected(Start) - Expected(End) - 1
    const strokesGained = startLookup.expectedStrokes - endExpected - 1;

    return {
      shotId: '', // Will be set when persisting
      expectedStrokesStart: startLookup.expectedStrokes,
      expectedStrokesEnd: endExpected,
      strokesGained: Math.round(strokesGained * 1000) / 1000, // 3 decimal precision
      shotCategory: shot.shotCategory,
      baselineVersion: this.activeVersion,
    };
  }

  /**
   * Calculate aggregated SG for a round
   */
  calculateRoundSG(shots: Array<{ shot: ShotEventData; sg: SGShotResultData }>): SGRoundResultData {
    const byCategory: Record<ShotCategory, { total: number; count: number }> = {
      [ShotCategory.TEE]: { total: 0, count: 0 },
      [ShotCategory.APPROACH]: { total: 0, count: 0 },
      [ShotCategory.SHORT_GAME]: { total: 0, count: 0 },
      [ShotCategory.PUTTING]: { total: 0, count: 0 },
    };

    const holesWithSG = new Set<number>();

    for (const { shot, sg } of shots) {
      byCategory[sg.shotCategory].total += sg.strokesGained;
      byCategory[sg.shotCategory].count += 1;
      holesWithSG.add(shot.holeNumber);
    }

    const sgTee = byCategory[ShotCategory.TEE].count > 0 ? byCategory[ShotCategory.TEE].total : null;
    const sgApproach = byCategory[ShotCategory.APPROACH].count > 0 ? byCategory[ShotCategory.APPROACH].total : null;
    const sgShortGame = byCategory[ShotCategory.SHORT_GAME].count > 0 ? byCategory[ShotCategory.SHORT_GAME].total : null;
    const sgPutting = byCategory[ShotCategory.PUTTING].count > 0 ? byCategory[ShotCategory.PUTTING].total : null;

    const sgTotal = [sgTee, sgApproach, sgShortGame, sgPutting]
      .filter((v): v is number => v !== null)
      .reduce((a, b) => a + b, 0);

    const totalHoles = 18; // Default
    const coveragePercent = (holesWithSG.size / totalHoles) * 100;

    return {
      roundId: '', // Will be set when persisting
      sgTee: sgTee !== null ? Math.round(sgTee * 1000) / 1000 : null,
      sgApproach: sgApproach !== null ? Math.round(sgApproach * 1000) / 1000 : null,
      sgShortGame: sgShortGame !== null ? Math.round(sgShortGame * 1000) / 1000 : null,
      sgPutting: sgPutting !== null ? Math.round(sgPutting * 1000) / 1000 : null,
      sgTotal: Math.round(sgTotal * 1000) / 1000,
      shotCountTee: byCategory[ShotCategory.TEE].count,
      shotCountApproach: byCategory[ShotCategory.APPROACH].count,
      shotCountShortGame: byCategory[ShotCategory.SHORT_GAME].count,
      shotCountPutting: byCategory[ShotCategory.PUTTING].count,
      holesWithSG: holesWithSG.size,
      totalHoles,
      coveragePercent: Math.round(coveragePercent * 10) / 10,
      baselineVersion: this.activeVersion,
    };
  }

  /**
   * Get the active baseline version
   */
  getActiveVersion(): string {
    return this.activeVersion;
  }

  /**
   * Import a new baseline version
   */
  async importBaseline(
    version: string,
    entries: Array<{
      lieCategory: LieCategory;
      distanceBucketMin: number;
      distanceBucketMax: number;
      expectedStrokes: number;
      sampleSize?: number;
      source?: string;
    }>,
    setActive: boolean = false
  ): Promise<void> {
    // Insert entries in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete existing entries for this version
      await tx.$executeRaw`
        DELETE FROM sg_expected_strokes_baseline WHERE version = ${version}
      `;

      // Insert new entries
      for (const entry of entries) {
        await tx.$executeRaw`
          INSERT INTO sg_expected_strokes_baseline
          (id, version, lie_category, distance_bucket_min, distance_bucket_max, expected_strokes, sample_size, source, is_active, created_at)
          VALUES (gen_random_uuid(), ${version}, ${entry.lieCategory}::text, ${entry.distanceBucketMin}, ${entry.distanceBucketMax}, ${entry.expectedStrokes}, ${entry.sampleSize ?? null}, ${entry.source ?? null}, ${setActive}, now())
        `;
      }

      // If setting active, deactivate others
      if (setActive) {
        await tx.$executeRaw`
          UPDATE sg_expected_strokes_baseline SET is_active = false WHERE version != ${version}
        `;
        await tx.$executeRaw`
          UPDATE sg_expected_strokes_baseline SET is_active = true WHERE version = ${version}
        `;
      }
    });

    // Reload cache
    if (setActive) {
      this.activeVersion = version;
      await this.loadBaselineFromDB(version);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let sgEngineInstance: SGEngine | null = null;

export function getSGEngine(prisma: PrismaClient): SGEngine {
  if (!sgEngineInstance) {
    sgEngineInstance = new SGEngine(prisma);
  }
  return sgEngineInstance;
}

export async function initializeSGEngine(prisma: PrismaClient): Promise<SGEngine> {
  const engine = getSGEngine(prisma);
  await engine.initialize();
  return engine;
}
