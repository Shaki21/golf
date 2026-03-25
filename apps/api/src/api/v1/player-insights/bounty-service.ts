/**
 * Breaking Point Bounties Service
 * Transforms player weaknesses into gamified challenges
 */

import {
  Bounty,
  BountyBoard,
  BountyDifficulty,
  BountyCategory,
  BountyHunterRank,
  BountyCompletionResult,
} from './types';

// =============================================================================
// HUNTER RANKS
// =============================================================================

export const BOUNTY_HUNTER_RANKS: BountyHunterRank[] = [
  { id: 'rookie', name: 'Rookie Hunter', nameNo: 'Nybegynner', minBounties: 0, icon: '🎯', color: '#9CA3AF' },
  { id: 'bronze', name: 'Bronze Hunter', nameNo: 'Bronse-jeger', minBounties: 5, icon: '🥉', color: '#CD7F32' },
  { id: 'silver', name: 'Silver Hunter', nameNo: 'Sølv-jeger', minBounties: 15, icon: '🥈', color: '#C0C0C0' },
  { id: 'gold', name: 'Gold Hunter', nameNo: 'Gull-jeger', minBounties: 30, icon: '🥇', color: '#FFD700' },
  { id: 'platinum', name: 'Platinum Hunter', nameNo: 'Platinum-jeger', minBounties: 50, icon: '💎', color: '#E5E4E2' },
  { id: 'legendary', name: 'Legendary Hunter', nameNo: 'Legendarisk', minBounties: 100, icon: '👑', color: '#9333EA' },
];

// =============================================================================
// XP AND DIFFICULTY CONFIGURATION
// =============================================================================

export const BOUNTY_XP_CONFIG: Record<BountyDifficulty, { base: number; speedBonus: number }> = {
  easy: { base: 150, speedBonus: 75 },
  medium: { base: 300, speedBonus: 150 },
  hard: { base: 500, speedBonus: 250 },
  legendary: { base: 1000, speedBonus: 500 },
};

export const DIFFICULTY_THRESHOLDS = {
  // Based on % improvement required
  easy: 15,      // Less than 15% improvement needed
  medium: 30,    // 15-30% improvement
  hard: 50,      // 30-50% improvement
  legendary: 100, // 50%+ improvement (major transformation)
};

export const ESTIMATED_DAYS: Record<BountyDifficulty, number> = {
  easy: 14,
  medium: 28,
  hard: 42,
  legendary: 90,
};

// =============================================================================
// BOUNTY TEMPLATES
// =============================================================================

interface BountyTemplate {
  id: string;
  title: string;
  titleNo: string;
  description: string;
  descriptionNo: string;
  category: BountyCategory;
  metric: string;
  metricLabel: string;
  unit: string;
  isLowerBetter: boolean;
  exercises: Array<{
    id: string;
    name: string;
    description: string;
    frequency: string;
  }>;
}

export const BOUNTY_TEMPLATES: Record<string, BountyTemplate> = {
  // Approach bounties
  approach_25m: {
    id: 'approach_25m',
    title: 'Short Approach Master',
    titleNo: '25m Approach-mester',
    description: 'Improve your 25m approach shots',
    descriptionNo: 'Forbedre dine 25m approach-slag',
    category: 'approach',
    metric: 'pei_25m',
    metricLabel: 'PEI 25m',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: 'Landing Zone Drill', description: 'Sikt på 1m² mål', frequency: '20 baller/dag' },
      { id: 'ex2', name: 'Distance Control', description: 'Veksle mellom 20m, 25m, 30m', frequency: '15 min/økt' },
    ],
  },
  approach_50m: {
    id: 'approach_50m',
    title: 'Mid Approach Precision',
    titleNo: '50m Presisjon',
    description: 'Sharpen your 50m approach accuracy',
    descriptionNo: 'Skjerp din 50m approach-presisjon',
    category: 'approach',
    metric: 'pei_50m',
    metricLabel: 'PEI 50m',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: '50m Stock Shot', description: 'Etabler konsistent 50m slag', frequency: '25 baller/dag' },
      { id: 'ex2', name: 'Trajectory Control', description: 'Høy, middels, lav bane', frequency: '10 av hver' },
    ],
  },
  approach_75m: {
    id: 'approach_75m',
    title: 'Gap Wedge Excellence',
    titleNo: '75m Excellence',
    description: 'Master the 75m approach',
    descriptionNo: 'Mestre 75m approach-slaget',
    category: 'approach',
    metric: 'pei_75m',
    metricLabel: 'PEI 75m',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: '75m Targets', description: 'Sikt på forskjellige mål', frequency: '30 baller/dag' },
      { id: 'ex2', name: 'Pressure Drill', description: '5 baller, tell treff innen 5m', frequency: '3 runder/økt' },
    ],
  },
  approach_100m: {
    id: 'approach_100m',
    title: 'Full Wedge Command',
    titleNo: '100m Kommando',
    description: 'Command your full wedge shots',
    descriptionNo: 'Ta kontroll over full wedge',
    category: 'approach',
    metric: 'pei_100m',
    metricLabel: 'PEI 100m',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: 'Distance Ladder', description: '90m, 95m, 100m, 105m', frequency: '20 baller/dag' },
      { id: 'ex2', name: 'Wind Adjustment', description: 'Tren med vindpåvirkning', frequency: '15 min/økt' },
    ],
  },

  // Putting bounties
  putting_3m: {
    id: 'putting_3m',
    title: 'Gimme Range',
    titleNo: '3m Putt-sikkerhet',
    description: 'Never miss inside 3 meters',
    descriptionNo: 'Aldri miss innenfor 3 meter',
    category: 'putting',
    metric: 'make_rate_3m',
    metricLabel: 'Make rate 3m',
    unit: '%',
    isLowerBetter: false,
    exercises: [
      { id: 'ex1', name: 'Gate Drill', description: 'Putt gjennom tees-gate', frequency: '50 putter/dag' },
      { id: 'ex2', name: 'Circle Drill', description: '10 baller rundt hullet', frequency: '3 runder' },
    ],
  },
  putting_6m: {
    id: 'putting_6m',
    title: 'Mid Range Putter',
    titleNo: '6m Putt-mester',
    description: 'Improve 6m putting percentage',
    descriptionNo: 'Forbedre 6m putt-prosent',
    category: 'putting',
    metric: 'make_rate_6m',
    metricLabel: 'Make rate 6m',
    unit: '%',
    isLowerBetter: false,
    exercises: [
      { id: 'ex1', name: 'Lag Putting', description: 'Fokus på avstand først', frequency: '30 putter/dag' },
      { id: 'ex2', name: 'Line Drill', description: 'Chalk line for startlinje', frequency: '20 putter' },
    ],
  },
  three_putt: {
    id: 'three_putt',
    title: '3-Putt Eliminator',
    titleNo: '3-Putt Eliminator',
    description: 'Reduce three-putt percentage',
    descriptionNo: 'Reduser tre-putt prosent',
    category: 'putting',
    metric: 'three_putt_rate',
    metricLabel: '3-putt rate',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: 'Lag Zone', description: 'Alle førsteputt innen 1m', frequency: '20 langputt/dag' },
      { id: 'ex2', name: 'Distance Control', description: 'Putt til frisbee 10-15m', frequency: '15 putter' },
    ],
  },

  // Short game bounties
  chipping: {
    id: 'chipping',
    title: 'Chip Shot Artist',
    titleNo: 'Chip-kunstner',
    description: 'Master your chipping proximity',
    descriptionNo: 'Mestre chip-presisjon',
    category: 'shortGame',
    metric: 'pei_chip',
    metricLabel: 'Chip PEI',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: 'Towel Drill', description: 'Land på håndkle ved hull', frequency: '30 chips/dag' },
      { id: 'ex2', name: 'One Club Challenge', description: 'Alle chips med 56°', frequency: '20 chips' },
    ],
  },
  bunker: {
    id: 'bunker',
    title: 'Bunker Escape',
    titleNo: 'Bunker-flukt',
    description: 'Improve bunker shot consistency',
    descriptionNo: 'Forbedre bunker-konsistens',
    category: 'shortGame',
    metric: 'pei_bunker',
    metricLabel: 'Bunker PEI',
    unit: '%',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: 'Line in Sand', description: 'Konsistent sand-kontakt', frequency: '25 slag/dag' },
      { id: 'ex2', name: 'Variable Lies', description: 'Tren fra ulike lies', frequency: '15 min/økt' },
    ],
  },
  up_and_down: {
    id: 'up_and_down',
    title: 'Scramble King',
    titleNo: 'Scramble-kongen',
    description: 'Increase up-and-down percentage',
    descriptionNo: 'Øk up-and-down prosent',
    category: 'shortGame',
    metric: 'up_and_down_rate',
    metricLabel: 'Up & Down %',
    unit: '%',
    isLowerBetter: false,
    exercises: [
      { id: 'ex1', name: 'Par Save Drill', description: 'Simuler banespill', frequency: '10 situasjoner/dag' },
      { id: 'ex2', name: 'Random Lies', description: 'Tilfeldig drop rundt green', frequency: '15 min/økt' },
    ],
  },

  // Driving bounties
  driver_accuracy: {
    id: 'driver_accuracy',
    title: 'Fairway Finder',
    titleNo: 'Fairway-finner',
    description: 'Improve driving accuracy',
    descriptionNo: 'Forbedre driver-presisjon',
    category: 'driving',
    metric: 'fairway_hit_rate',
    metricLabel: 'Fairway %',
    unit: '%',
    isLowerBetter: false,
    exercises: [
      { id: 'ex1', name: 'Corridor Drill', description: 'Sikt på 30m bred korridor', frequency: '20 drives/dag' },
      { id: 'ex2', name: '80% Swing', description: 'Kontrollert tempo', frequency: '15 drives' },
    ],
  },
  driver_dispersion: {
    id: 'driver_dispersion',
    title: 'Tight Dispersion',
    titleNo: 'Stram spredning',
    description: 'Reduce driving dispersion',
    descriptionNo: 'Reduser driver-spredning',
    category: 'driving',
    metric: 'dispersion',
    metricLabel: 'Spredning',
    unit: 'm',
    isLowerBetter: true,
    exercises: [
      { id: 'ex1', name: 'Same Target', description: '20 slag mot samme mål', frequency: '20 drives/dag' },
      { id: 'ex2', name: 'Shot Shape', description: 'Konsistent draw/fade', frequency: '10 av hver' },
    ],
  },

  // Speed bounties
  driver_speed: {
    id: 'driver_speed',
    title: 'Speed Demon',
    titleNo: 'Hastighets-demon',
    description: 'Increase driver clubhead speed',
    descriptionNo: 'Øk driver-hastighet',
    category: 'physical',
    metric: 'driver_speed',
    metricLabel: 'Driver CHS',
    unit: 'mph',
    isLowerBetter: false,
    exercises: [
      { id: 'ex1', name: 'Overspeed Training', description: 'Lett kølle, maks hastighet', frequency: '10 swings/dag' },
      { id: 'ex2', name: 'Step Drill', description: 'Step-through for ground force', frequency: '15 swings' },
    ],
  },

  // Consistency bounties
  preshot_routine: {
    id: 'preshot_routine',
    title: 'Routine Master',
    titleNo: 'Rutine-mester',
    description: 'Establish consistent pre-shot routine',
    descriptionNo: 'Etabler konsistent pre-shot rutine',
    category: 'consistency',
    metric: 'routine_compliance',
    metricLabel: 'Rutine %',
    unit: '%',
    isLowerBetter: false,
    exercises: [
      { id: 'ex1', name: 'Timer Drill', description: 'Samme tid hver gang', frequency: 'Alle slag' },
      { id: 'ex2', name: 'Video Check', description: 'Film og evaluer rutine', frequency: '1x/uke' },
    ],
  },
};

// =============================================================================
// BOUNTY CREATION
// =============================================================================

/**
 * Calculate difficulty based on improvement required
 */
export function calculateDifficulty(
  baselineValue: number,
  targetValue: number,
  isLowerBetter: boolean
): BountyDifficulty {
  let percentImprovement: number;

  if (isLowerBetter) {
    // For PEI: going from 20% to 15% is 25% improvement
    percentImprovement = ((baselineValue - targetValue) / baselineValue) * 100;
  } else {
    // For make rate: going from 60% to 75% is 25% improvement
    percentImprovement = ((targetValue - baselineValue) / baselineValue) * 100;
  }

  if (percentImprovement < DIFFICULTY_THRESHOLDS.easy) return 'easy';
  if (percentImprovement < DIFFICULTY_THRESHOLDS.medium) return 'medium';
  if (percentImprovement < DIFFICULTY_THRESHOLDS.hard) return 'hard';
  return 'legendary';
}

/**
 * Calculate bounty progress
 */
export function calculateProgress(
  baselineValue: number,
  targetValue: number,
  currentValue: number,
  isLowerBetter: boolean
): number {
  if (isLowerBetter) {
    // For PEI (lower is better)
    const totalImprovement = baselineValue - targetValue;
    if (totalImprovement <= 0) return 100;
    const actualImprovement = baselineValue - currentValue;
    return Math.min(100, Math.max(0, (actualImprovement / totalImprovement) * 100));
  } else {
    // For make rate (higher is better)
    const totalImprovement = targetValue - baselineValue;
    if (totalImprovement <= 0) return 100;
    const actualImprovement = currentValue - baselineValue;
    return Math.min(100, Math.max(0, (actualImprovement / totalImprovement) * 100));
  }
}

/**
 * Check if bounty is completed
 */
export function isBountyComplete(
  currentValue: number,
  targetValue: number,
  isLowerBetter: boolean
): boolean {
  if (isLowerBetter) {
    return currentValue <= targetValue;
  }
  return currentValue >= targetValue;
}

/**
 * Create a bounty from a breaking point
 */
export function createBountyFromBreakingPoint(
  breakingPoint: {
    id: string;
    category: string;
    baselineMeasurement: number;
    targetMeasurement: number;
    currentMeasurement: number;
  },
  templateId: string
): Bounty | null {
  const template = BOUNTY_TEMPLATES[templateId];
  if (!template) return null;

  const difficulty = calculateDifficulty(
    breakingPoint.baselineMeasurement,
    breakingPoint.targetMeasurement,
    template.isLowerBetter
  );

  const xpConfig = BOUNTY_XP_CONFIG[difficulty];
  const estimatedDays = ESTIMATED_DAYS[difficulty];

  const now = new Date();
  const speedBonusDeadline = new Date(now.getTime() + (estimatedDays * 0.7) * 24 * 60 * 60 * 1000);

  return {
    id: `bounty_${breakingPoint.id}_${Date.now()}`,
    title: template.title,
    titleNo: template.titleNo,
    description: template.description,
    descriptionNo: template.descriptionNo,
    breakingPointId: breakingPoint.id,
    metric: template.metric,
    metricLabel: template.metricLabel,
    baselineValue: breakingPoint.baselineMeasurement,
    targetValue: breakingPoint.targetMeasurement,
    currentValue: breakingPoint.currentMeasurement,
    unit: template.unit,
    isLowerBetter: template.isLowerBetter,
    progress: calculateProgress(
      breakingPoint.baselineMeasurement,
      breakingPoint.targetMeasurement,
      breakingPoint.currentMeasurement,
      template.isLowerBetter
    ),
    status: 'available',
    category: template.category,
    difficulty,
    xpReward: xpConfig.base,
    bonusXp: xpConfig.speedBonus,
    badgeId: null,
    createdAt: now,
    activatedAt: null,
    completedAt: null,
    expiresAt: null,
    estimatedDays,
    recommendedExercises: template.exercises,
    speedBonusDeadline,
    speedBonusMultiplier: 1.5,
  };
}

// =============================================================================
// HUNTER RANK
// =============================================================================

/**
 * Get hunter rank based on completed bounties
 */
export function getHunterRank(completedBounties: number): BountyHunterRank {
  for (let i = BOUNTY_HUNTER_RANKS.length - 1; i >= 0; i--) {
    if (completedBounties >= BOUNTY_HUNTER_RANKS[i].minBounties) {
      return BOUNTY_HUNTER_RANKS[i];
    }
  }
  return BOUNTY_HUNTER_RANKS[0];
}

/**
 * Get bounties needed for next rank
 */
export function getBountiesToNextRank(completedBounties: number): number {
  const currentRank = getHunterRank(completedBounties);
  const currentIndex = BOUNTY_HUNTER_RANKS.findIndex(r => r.id === currentRank.id);

  if (currentIndex >= BOUNTY_HUNTER_RANKS.length - 1) return 0; // At max rank

  const nextRank = BOUNTY_HUNTER_RANKS[currentIndex + 1];
  return nextRank.minBounties - completedBounties;
}

// =============================================================================
// BOUNTY COMPLETION
// =============================================================================

/**
 * Complete a bounty and calculate rewards
 */
export function completeBounty(
  bounty: Bounty,
  currentStreak: number,
  totalCompleted: number
): BountyCompletionResult {
  const now = new Date();
  const speedBonus = bounty.speedBonusDeadline && now <= bounty.speedBonusDeadline;

  let xpAwarded = bounty.xpReward;
  let bonusXp = 0;

  // Speed bonus
  if (speedBonus) {
    bonusXp += bounty.bonusXp;
  }

  // Streak bonus (10% per consecutive bounty, max 50%)
  const streakMultiplier = Math.min(1.5, 1 + (currentStreak * 0.1));
  const streakBonus = Math.round(bounty.xpReward * (streakMultiplier - 1));
  bonusXp += streakBonus;

  xpAwarded += bonusXp;

  // Check for rank up
  const previousRank = getHunterRank(totalCompleted);
  const newRank = getHunterRank(totalCompleted + 1);
  const rankedUp = previousRank.id !== newRank.id ? newRank : null;

  return {
    bounty: {
      ...bounty,
      status: 'completed',
      completedAt: now,
      progress: 100,
    },
    xpAwarded,
    speedBonus,
    bonusXp,
    newRank: rankedUp,
    badgeUnlocked: bounty.badgeId,
    streakBonus,
  };
}

// =============================================================================
// BOUNTY BOARD BUILDER
// =============================================================================

export interface BountyBoardInput {
  activeBounties: Bounty[];
  availableBounties: Bounty[];
  completedBounties: Bounty[];
  completionHistory: Array<{ completedAt: Date; daysToComplete: number }>;
}

export function buildBountyBoard(input: BountyBoardInput): BountyBoard {
  const { activeBounties, availableBounties, completedBounties, completionHistory } = input;

  const totalCompleted = completedBounties.length;
  const totalXpEarned = completedBounties.reduce((sum, b) => sum + b.xpReward, 0);

  // Calculate completion rate (completed vs total attempted)
  const totalAttempted = activeBounties.length + completedBounties.length;
  const completionRate = totalAttempted > 0 ? (totalCompleted / totalAttempted) * 100 : 0;

  // Average completion days
  const avgDays = completionHistory.length > 0
    ? completionHistory.reduce((sum, h) => sum + h.daysToComplete, 0) / completionHistory.length
    : 0;

  // Calculate current streak
  let currentStreak = 0;
  const sortedCompleted = [...completedBounties].sort(
    (a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
  );

  if (sortedCompleted.length > 0) {
    const now = new Date();
    const lastCompletion = sortedCompleted[0].completedAt;
    if (lastCompletion) {
      const daysSinceLast = (now.getTime() - lastCompletion.getTime()) / (24 * 60 * 60 * 1000);
      if (daysSinceLast <= 30) { // Streak maintained if completed within 30 days
        currentStreak = 1;
        for (let i = 1; i < sortedCompleted.length; i++) {
          const prev = sortedCompleted[i - 1].completedAt;
          const curr = sortedCompleted[i].completedAt;
          if (prev && curr) {
            const daysBetween = (prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000);
            if (daysBetween <= 30) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
    }
  }

  const hunterRank = getHunterRank(totalCompleted);
  const bountiesToNextRank = getBountiesToNextRank(totalCompleted);

  return {
    activeBounties: activeBounties.sort((a, b) => b.progress - a.progress),
    availableBounties: availableBounties.sort((a, b) => {
      // Sort by difficulty (easy first) then by XP
      const diffOrder = { easy: 0, medium: 1, hard: 2, legendary: 3 };
      return diffOrder[a.difficulty] - diffOrder[b.difficulty] || b.xpReward - a.xpReward;
    }),
    completedBounties: completedBounties.sort(
      (a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
    ).slice(0, 10), // Last 10
    totalCompleted,
    totalXpEarned,
    completionRate: Math.round(completionRate),
    averageCompletionDays: Math.round(avgDays),
    currentStreak,
    hunterRank,
    bountiesToNextRank,
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const bountyUtils = {
  calculateDifficulty,
  calculateProgress,
  isBountyComplete,
  createBountyFromBreakingPoint,
  getHunterRank,
  getBountiesToNextRank,
  completeBounty,
  buildBountyBoard,
  BOUNTY_TEMPLATES,
  BOUNTY_HUNTER_RANKS,
  BOUNTY_XP_CONFIG,
};
