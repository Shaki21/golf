/**
 * AK Golf Academy - Gamification Module
 *
 * Complete gamification system including:
 * - Player metrics tracking (volume, strength, performance)
 * - Badge system with 85+ achievements
 * - XP and leveling system
 * - Leaderboards
 */

// Types and Enums
export * from './types';

// Badge Definitions
export {
  VOLUME_BADGES,
  STREAK_BADGES,
  STRENGTH_BADGES,
  SPEED_BADGES,
  ACCURACY_BADGES,
  PUTTING_BADGES,
  SHORT_GAME_BADGES,
  SCORING_BADGES,
  PHASE_BADGES,
  MENTAL_BADGES,
  SEASONAL_BADGES,
  ALL_BADGES,
  getBadgeById,
  getBadgesByCategory,
  getBadgesByTier,
  getAvailableBadges,
  BADGE_SUMMARY,
} from './achievement-definitions';

// Badge Evaluator Service
export {
  BadgeEvaluatorService,
  createBadgeEvaluatorService,
} from './badge-evaluator';

// Anti-Gaming Service
export {
  AntiGamingService,
  createAntiGamingService,
  ANTI_GAMING_CONFIG,
} from './anti-gaming';

// Badge Availability
export {
  isBadgeAvailable,
  getUnavailabilityReason,
  augmentBadgesWithAvailability,
  filterAvailableBadges,
  getBadgeAvailabilityStats,
  AVAILABLE_METRICS,
  UNAVAILABLE_METRICS,
} from './badge-availability';

// Badge Calculator
export {
  // Core calculations
  getNestedValue,
  evaluateRequirement,
  calculateRequirementProgress,
  calculateBadgeProgress,
  calculateAllBadgeProgress,
  getNewlyUnlockedBadges,

  // XP and Leveling
  getXPForLevel,
  getLevelFromXP,
  getXPToNextLevel,
  getLevelProgress,

  // Badge events
  createBadgeUnlockEvent,
  processBadgeUnlocks,

  // Tier calculations
  TIER_THRESHOLDS,
  getPlayerTier,
  TIER_COLORS,

  // Badge categorization
  categorizeBadgeProgress,
  getAlmostUnlockedBadges,

  // Streak calculations
  shouldBreakStreak,
  calculateStreak,

  // PR calculations
  calculateEstimated1RM,
  isNewPR,
  calculateTonnage,
  calculateSessionTonnage,

  // Leaderboard utilities
  calculateRankChange,
  getRankSuffix,
  formatRank,
} from './badge-calculator';

// Utilities
export {
  DateRangeCalculator,
  SessionFilter,
  type DateBoundaries,
  type FilterableSession,
} from './utils';

// Configuration
export {
  GamificationConfig,
  createDefaultHoursByType,
  type TrainingTypeName,
} from './gamification.config';
