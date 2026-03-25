/**
 * Gamification Configuration
 * Centralizes all configurable values and magic numbers
 */

export const GamificationConfig = {
  /**
   * XP and Leveling
   */
  xp: {
    /** XP awarded per badge (simplified calculation) */
    perBadge: 50,

    /** XP required for level 2 (base) */
    baseXpForLevel2: 100,

    /** Multiplier for each subsequent level */
    levelMultiplier: 1.5,
  },

  /**
   * Session and Volume Thresholds
   */
  sessions: {
    /** Default planned sessions per week for completion rate calculation */
    plannedPerWeek: 5,

    /** Minimum sessions per week to count as a "perfect" week */
    perfectWeekThreshold: 5,

    /** Default session duration in minutes when not specified */
    defaultDurationMinutes: 60,

    /** Default intensity when not specified (1-10) */
    defaultIntensity: 5,
  },

  /**
   * Streak Calculation
   */
  streaks: {
    /** Maximum gap (in days) that still counts as consecutive for streaks */
    maxGapDays: 1.5,

    /** Early morning session cutoff hour */
    earlyMorningHour: 9,

    /** Evening session start hour */
    eveningHour: 19,
  },

  /**
   * Strength and Fitness
   */
  strength: {
    /** Default bodyweight in kg when not available */
    defaultBodyweightKg: 70,
  },

  /**
   * Phase Mapping
   * Maps various phase names to standardized TrainingPhase values
   */
  phaseMapping: {
    base: 'grunnlag',
    grunnlag: 'grunnlag',
    off_season: 'grunnlag',
    specialization: 'oppbygging',
    oppbygging: 'oppbygging',
    pre_season: 'oppbygging',
    tournament: 'konkurranse',
    konkurranse: 'konkurranse',
    in_season: 'konkurranse',
    recovery: 'overgang',
    overgang: 'overgang',
    transition: 'overgang',
  } as Record<string, string>,

  /**
   * Test Type Mapping
   * Maps test type strings to golf fitness metric names
   */
  testTypeMapping: {
    med_ball: 'medBallThrow',
    medball: 'medBallThrow',
    vertical: 'verticalJump',
    broad: 'broadJump',
    hip_left: 'hipRotationLeft',
    hip_right: 'hipRotationRight',
    hip: 'hipRotation', // Applied to both
    thoracic: 'thoracicRotation',
    shoulder: 'shoulderMobility',
    balance_left: 'singleLegBalanceLeft',
    balance_right: 'singleLegBalanceRight',
    balance: 'singleLegBalance', // Applied to both
    plank: 'plankHold',
    driver: 'clubheadSpeedDriver',
    clubhead: 'clubheadSpeedDriver',
  } as Record<string, string>,

  /**
   * Scoring Thresholds
   */
  scoring: {
    /** Par for 18 holes (used for under par calculations) */
    par18: 72,

    /** Default handicap when not available */
    defaultHandicap: 54,
  },

  /**
   * Training Types
   * All valid training session types
   */
  trainingTypes: [
    'teknikk',
    'golfslag',
    'spill',
    'konkurranse',
    'fysisk',
    'mental',
    'rest',
  ] as const,

  /**
   * Badge Tiers with XP values
   */
  badgeTierXP: {
    standard: 25,
    bronze: 50,
    silver: 100,
    gold: 200,
    platinum: 500,
  } as Record<string, number>,

  /**
   * Consistency Calculation
   */
  consistency: {
    /** Days to consider for consistency score */
    windowDays: 30,
  },

  /**
   * Database Batch Sizes
   */
  batching: {
    /** Maximum badges to upsert in parallel */
    badgeUpsertBatch: 10,
  },
} as const;

// Type for the training types
export type TrainingTypeName = typeof GamificationConfig.trainingTypes[number];

// Default hours by type initializer
export function createDefaultHoursByType(): Record<string, number> {
  return Object.fromEntries(
    GamificationConfig.trainingTypes.map((type) => [type, 0])
  );
}
