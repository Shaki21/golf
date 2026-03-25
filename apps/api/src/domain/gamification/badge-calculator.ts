/**
 * AK Golf Academy - Badge Calculator
 * Utilities for evaluating player metrics against badge requirements
 */

import {
  BadgeDefinition,
  BadgeProgress,
  BadgeRequirement,
  BadgeUnlockEvent,
  PlayerMetrics,
  RequirementProgress,
  BadgeTier,
} from './types';

// ═══════════════════════════════════════════════════════════════
// CORE CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get a nested property value from an object using dot notation
 * e.g., getNestedValue(metrics, "volume.totalHours") => metrics.volume.totalHours
 */
export function getNestedValue(obj: unknown, path: string): number | null {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return null;
    }
    if (typeof current !== 'object') {
      return null;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === 'number') {
    return current;
  }

  return null;
}

/**
 * Evaluate a single requirement against a value
 */
export function evaluateRequirement(
  currentValue: number,
  requirement: BadgeRequirement
): { passed: boolean; progress: number } {
  const { operator, value: targetValue } = requirement;

  let passed = false;
  let progress = 0;

  switch (operator) {
    case 'gte': // Greater than or equal
      passed = currentValue >= targetValue;
      progress = Math.min(100, (currentValue / targetValue) * 100);
      break;

    case 'gt': // Greater than
      passed = currentValue > targetValue;
      progress = Math.min(100, (currentValue / targetValue) * 100);
      break;

    case 'lte': // Less than or equal (for things like handicap)
      passed = currentValue <= targetValue;
      // Inverse progress - lower is better
      if (targetValue === 0) {
        progress = currentValue === 0 ? 100 : 0;
      } else {
        progress = Math.min(100, Math.max(0, (1 - (currentValue - targetValue) / targetValue) * 100));
      }
      break;

    case 'lt': // Less than
      passed = currentValue < targetValue;
      if (targetValue === 0) {
        progress = 0;
      } else {
        progress = Math.min(100, Math.max(0, (1 - currentValue / targetValue) * 100));
      }
      break;

    case 'eq': // Equal
      passed = currentValue === targetValue;
      progress = passed ? 100 : 0;
      break;

    default:
      passed = false;
      progress = 0;
  }

  return { passed, progress: Math.round(progress * 100) / 100 };
}

/**
 * Calculate progress for all requirements of a badge
 */
export function calculateRequirementProgress(
  metrics: PlayerMetrics,
  requirements: BadgeRequirement[]
): RequirementProgress[] {
  return requirements.map((requirement, index) => {
    const currentValue = getNestedValue(metrics, requirement.metric) ?? 0;
    const { passed, progress } = evaluateRequirement(currentValue, requirement);

    return {
      requirementIndex: index,
      currentValue,
      targetValue: requirement.value,
      progress,
      completed: passed,
    };
  });
}

/**
 * Calculate overall badge progress
 * All requirements must be met for the badge to be earned
 */
export function calculateBadgeProgress(
  metrics: PlayerMetrics,
  badge: BadgeDefinition,
  existingProgress?: BadgeProgress
): BadgeProgress {
  const requirementProgress = calculateRequirementProgress(metrics, badge.requirements);

  // Badge is earned when ALL requirements are completed
  const allCompleted = requirementProgress.every((rp) => rp.completed);

  // Overall progress is the minimum of all requirement progress
  // (bottleneck determines overall progress)
  const overallProgress = requirementProgress.length > 0
    ? Math.min(...requirementProgress.map((rp) => rp.progress))
    : 0;

  // Check if badge was just earned
  const wasEarned = existingProgress?.earned ?? false;
  const isNewlyEarned = allCompleted && !wasEarned;

  return {
    badgeId: badge.id,
    playerId: metrics.playerId,
    earned: allCompleted,
    earnedAt: isNewlyEarned ? new Date() : existingProgress?.earnedAt,
    progress: Math.round(overallProgress * 100) / 100,
    requirementProgress,
    isNew: isNewlyEarned,
    viewedAt: existingProgress?.viewedAt,
  };
}

/**
 * Calculate progress for all badges
 */
export function calculateAllBadgeProgress(
  metrics: PlayerMetrics,
  badges: BadgeDefinition[],
  existingProgressMap: Map<string, BadgeProgress>
): BadgeProgress[] {
  return badges.map((badge) => {
    const existingProgress = existingProgressMap.get(badge.id);
    return calculateBadgeProgress(metrics, badge, existingProgress);
  });
}

/**
 * Get newly unlocked badges
 */
export function getNewlyUnlockedBadges(
  previousProgress: BadgeProgress[],
  currentProgress: BadgeProgress[]
): string[] {
  const previousEarned = new Set(
    previousProgress.filter((bp) => bp.earned).map((bp) => bp.badgeId)
  );

  return currentProgress
    .filter((bp) => bp.earned && !previousEarned.has(bp.badgeId))
    .map((bp) => bp.badgeId);
}

// ═══════════════════════════════════════════════════════════════
// XP AND LEVELING
// ═══════════════════════════════════════════════════════════════

/**
 * XP required for each level
 * Uses a progressive formula: Level N requires N * 100 XP
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  // Total XP needed to reach this level
  // Sum of 100 + 200 + 300 + ... + (level-1)*100
  return ((level - 1) * level * 100) / 2;
}

/**
 * Get level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
  // Inverse of getXPForLevel
  // XP = (level-1) * level * 50
  // level^2 - level - XP/50 = 0
  // Using quadratic formula:
  const discriminant = 1 + (4 * totalXP) / 50;
  const level = Math.floor((1 + Math.sqrt(discriminant)) / 2);
  return Math.max(1, level);
}

/**
 * Calculate XP to next level
 */
export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  return xpForNextLevel - totalXP;
}

/**
 * Calculate level progress percentage
 */
export function getLevelProgress(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const levelRange = xpForNextLevel - xpForCurrentLevel;

  if (levelRange === 0) return 100;

  const progressInLevel = totalXP - xpForCurrentLevel;
  return Math.round((progressInLevel / levelRange) * 100);
}

// ═══════════════════════════════════════════════════════════════
// BADGE UNLOCK EVENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Create unlock event for a newly earned badge
 */
export function createBadgeUnlockEvent(
  playerId: string,
  badge: BadgeDefinition,
  metrics: PlayerMetrics
): BadgeUnlockEvent {
  // Find the requirement that was the "trigger" (the one completed last)
  const reqProgress = calculateRequirementProgress(metrics, badge.requirements);
  const triggerReq = badge.requirements[reqProgress.findIndex((rp) => rp.progress >= 100)] ?? badge.requirements[0];

  return {
    playerId,
    badgeId: badge.id,
    badge,
    xpAwarded: badge.xp,
    unlockedAt: new Date(),
    triggerMetric: triggerReq?.metric ?? '',
    triggerValue: getNestedValue(metrics, triggerReq?.metric ?? '') ?? 0,
  };
}

/**
 * Process badge unlocks and calculate XP gained
 */
export function processBadgeUnlocks(
  playerId: string,
  badges: BadgeDefinition[],
  previousProgress: BadgeProgress[],
  currentProgress: BadgeProgress[],
  metrics: PlayerMetrics
): { events: BadgeUnlockEvent[]; xpGained: number } {
  const newlyUnlockedIds = getNewlyUnlockedBadges(previousProgress, currentProgress);
  const badgeMap = new Map(badges.map((b) => [b.id, b]));

  const events: BadgeUnlockEvent[] = [];
  let xpGained = 0;

  for (const badgeId of newlyUnlockedIds) {
    const badge = badgeMap.get(badgeId);
    if (badge) {
      events.push(createBadgeUnlockEvent(playerId, badge, metrics));
      xpGained += badge.xp;
    }
  }

  return { events, xpGained };
}

// ═══════════════════════════════════════════════════════════════
// TIER CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Tier thresholds based on percentage of badges earned
 */
export const TIER_THRESHOLDS: Record<BadgeTier, number> = {
  [BadgeTier.STANDARD]: 0,
  [BadgeTier.BRONZE]: 10,
  [BadgeTier.SILVER]: 25,
  [BadgeTier.GOLD]: 50,
  [BadgeTier.PLATINUM]: 75,
};

/**
 * Get player tier based on badges earned
 */
export function getPlayerTier(earnedCount: number, totalCount: number): BadgeTier {
  if (totalCount === 0) return BadgeTier.STANDARD;

  const percentage = (earnedCount / totalCount) * 100;

  if (percentage >= TIER_THRESHOLDS[BadgeTier.PLATINUM]) return BadgeTier.PLATINUM;
  if (percentage >= TIER_THRESHOLDS[BadgeTier.GOLD]) return BadgeTier.GOLD;
  if (percentage >= TIER_THRESHOLDS[BadgeTier.SILVER]) return BadgeTier.SILVER;
  if (percentage >= TIER_THRESHOLDS[BadgeTier.BRONZE]) return BadgeTier.BRONZE;

  return BadgeTier.STANDARD;
}

/**
 * Get tier colors for display
 */
export const TIER_COLORS: Record<BadgeTier, { primary: string; secondary: string }> = {
  [BadgeTier.STANDARD]: { primary: '#8A9BA8', secondary: '#6B7C88' },
  [BadgeTier.BRONZE]: { primary: '#B08D57', secondary: '#8B6F3D' },
  [BadgeTier.SILVER]: { primary: '#8A9BA8', secondary: '#6B7C88' },
  [BadgeTier.GOLD]: { primary: '#C9A227', secondary: '#9A7B1A' },
  [BadgeTier.PLATINUM]: { primary: '#E5E4E2', secondary: '#C0BFBD' },
};

// ═══════════════════════════════════════════════════════════════
// BADGE CATEGORIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Categorize badge progress into earned, in-progress, and locked
 */
export function categorizeBadgeProgress(progress: BadgeProgress[]): {
  earned: BadgeProgress[];
  inProgress: BadgeProgress[];
  locked: BadgeProgress[];
} {
  const earned: BadgeProgress[] = [];
  const inProgress: BadgeProgress[] = [];
  const locked: BadgeProgress[] = [];

  for (const bp of progress) {
    if (bp.earned) {
      earned.push(bp);
    } else if (bp.progress > 0) {
      inProgress.push(bp);
    } else {
      locked.push(bp);
    }
  }

  // Sort earned by earnedAt (newest first)
  earned.sort((a, b) => {
    const aTime = a.earnedAt?.getTime() ?? 0;
    const bTime = b.earnedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  // Sort in-progress by progress (highest first)
  inProgress.sort((a, b) => b.progress - a.progress);

  return { earned, inProgress, locked };
}

/**
 * Get badges that are close to being unlocked (>= 80% progress)
 */
export function getAlmostUnlockedBadges(progress: BadgeProgress[]): BadgeProgress[] {
  return progress
    .filter((bp) => !bp.earned && bp.progress >= 80)
    .sort((a, b) => b.progress - a.progress);
}

// ═══════════════════════════════════════════════════════════════
// STREAK CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate if a streak should be broken
 */
export function shouldBreakStreak(lastActiveDate: Date, gracePeriodHours = 36): boolean {
  const now = new Date();
  const hoursSinceLastActive = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastActive > gracePeriodHours;
}

/**
 * Calculate streak with grace period
 */
export function calculateStreak(
  currentStreak: number,
  lastActiveDate: Date,
  sessionDate: Date
): number {
  // If session is on the same day as last active, don't increment
  const isSameDay =
    lastActiveDate.toDateString() === sessionDate.toDateString();

  if (isSameDay) {
    return currentStreak;
  }

  // If streak should be broken, reset to 1
  if (shouldBreakStreak(lastActiveDate)) {
    return 1;
  }

  // Otherwise increment
  return currentStreak + 1;
}

// ═══════════════════════════════════════════════════════════════
// PERSONAL RECORD CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate estimated 1RM using Epley formula
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) reps = 12; // Formula less accurate above 12 reps

  // Epley formula: 1RM = weight * (1 + reps/30)
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Check if a lift is a new PR
 */
export function isNewPR(
  weight: number,
  reps: number,
  currentPR: { weight: number; reps: number; estimated1RM: number } | null
): boolean {
  if (!currentPR) return true;

  const new1RM = calculateEstimated1RM(weight, reps);
  return new1RM > currentPR.estimated1RM;
}

/**
 * Calculate tonnage for a set
 */
export function calculateTonnage(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total tonnage for a session
 */
export function calculateSessionTonnage(
  exercises: Array<{ sets: Array<{ weight: number; reps: number; isWarmup?: boolean }> }>
): number {
  return exercises.reduce((total, exercise) => {
    const exerciseTonnage = exercise.sets
      .filter((set) => !set.isWarmup)
      .reduce((sum, set) => sum + calculateTonnage(set.weight, set.reps), 0);
    return total + exerciseTonnage;
  }, 0);
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate rank change
 */
export function calculateRankChange(
  playerId: string,
  previousRankings: Map<string, number>,
  currentRank: number
): number {
  const previousRank = previousRankings.get(playerId);
  if (previousRank === undefined) return 0;
  return previousRank - currentRank; // Positive = moved up
}

/**
 * Get rank suffix (1st, 2nd, 3rd, etc.)
 */
export function getRankSuffix(rank: number): string {
  const lastDigit = rank % 10;
  const lastTwoDigits = rank % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Format rank for display
 */
export function formatRank(rank: number): string {
  return `${rank}${getRankSuffix(rank)}`;
}
