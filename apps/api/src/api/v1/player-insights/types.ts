/**
 * Player Insights Types
 * Types for SG Journey, Skill DNA, and Breaking Point Bounties
 */

// =============================================================================
// SG JOURNEY TYPES
// =============================================================================

export interface SGJourneyLevel {
  id: string;
  name: string;
  nameno: string;
  sgMin: number;
  sgMax: number;
  altitude: number; // Metaphorical altitude for visualization
  description: string;
  estimatedScore: string;
  color: string;
}

export interface SGJourneyPosition {
  currentSG: number;
  currentLevel: SGJourneyLevel;
  nextLevel: SGJourneyLevel | null;
  previousLevel: SGJourneyLevel | null;
  progressToNext: number; // 0-100%
  sgToNextLevel: number;
  altitudeMeters: number;

  // Historical data
  startSG: number;
  totalClimbed: number;

  // Trends
  trend30Days: number;
  trend90Days: number;

  // Estimates
  estimatedDaysToNext: number | null;
  estimatedScore: number;
}

export interface SGJourneyMilestone {
  id: string;
  name: string;
  sg: number;
  reached: boolean;
  reachedAt: Date | null;
  xpAwarded: number;
}

export interface SGJourneyData {
  position: SGJourneyPosition;
  milestones: SGJourneyMilestone[];
  history: Array<{
    date: string;
    sg: number;
    level: string;
  }>;
  categoryBreakdown: {
    approach: number;
    aroundGreen: number;
    putting: number;
  };
}

// =============================================================================
// SKILL DNA TYPES
// =============================================================================

export interface SkillDimension {
  id: string;
  name: string;
  nameNo: string;
  score: number; // 0-100 normalized score
  rawValue: number;
  unit: string;
  testNumbers: number[];
  trend: 'improving' | 'stable' | 'declining';
  percentile: number; // vs peers
  categoryBenchmark: number; // % of category requirement
}

export interface SkillDNAProfile {
  dimensions: {
    distance: SkillDimension;
    speed: SkillDimension;
    accuracy: SkillDimension;
    shortGame: SkillDimension;
    putting: SkillDimension;
    physical: SkillDimension;
  };

  // Aggregated scores
  overallScore: number;
  balanceScore: number; // How balanced the profile is (0-100)

  // Strengths and weaknesses
  strengths: string[];
  weaknesses: string[];

  // Pro matching
  proMatches: ProMatch[];

  // Historical
  previousProfile: SkillDNAProfile | null;
  profileDate: Date;
}

export interface ProMatch {
  proName: string;
  similarity: number; // 0-100%
  commonStrengths: string[];
  developmentAreas: string[];
  insight: string;
  imageUrl?: string;
}

export interface ProPlayerDNA {
  name: string;
  tour: string;
  dimensions: {
    distance: number;
    speed: number;
    accuracy: number;
    shortGame: number;
    putting: number;
    physical: number;
  };
  playStyle: string;
  famousFor: string;
}

// =============================================================================
// BREAKING POINT BOUNTIES TYPES
// =============================================================================

export type BountyDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type BountyStatus = 'available' | 'active' | 'completed' | 'expired';
export type BountyCategory = 'approach' | 'shortGame' | 'putting' | 'driving' | 'physical' | 'mental' | 'consistency';

export interface Bounty {
  id: string;
  title: string;
  titleNo: string;
  description: string;
  descriptionNo: string;

  // Linked breaking point
  breakingPointId: string | null;

  // Target and progress
  metric: string;
  metricLabel: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  isLowerBetter: boolean; // true for PEI, false for make rate

  // Progress
  progress: number; // 0-100%
  status: BountyStatus;

  // Categorization
  category: BountyCategory;
  difficulty: BountyDifficulty;

  // Rewards
  xpReward: number;
  bonusXp: number; // For speed bonus
  badgeId: string | null;

  // Timing
  createdAt: Date;
  activatedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  estimatedDays: number;

  // Recommendations
  recommendedExercises: Array<{
    id: string;
    name: string;
    description: string;
    frequency: string;
  }>;

  // Speed bonus
  speedBonusDeadline: Date | null;
  speedBonusMultiplier: number;
}

export interface BountyBoard {
  activeBounties: Bounty[];
  availableBounties: Bounty[];
  completedBounties: Bounty[];

  // Stats
  totalCompleted: number;
  totalXpEarned: number;
  completionRate: number;
  averageCompletionDays: number;
  currentStreak: number;

  // Rank
  hunterRank: BountyHunterRank;
  bountiesToNextRank: number;
}

export interface BountyHunterRank {
  id: string;
  name: string;
  nameNo: string;
  minBounties: number;
  icon: string;
  color: string;
}

export interface BountyCompletionResult {
  bounty: Bounty;
  xpAwarded: number;
  speedBonus: boolean;
  bonusXp: number;
  newRank: BountyHunterRank | null;
  badgeUnlocked: string | null;
  streakBonus: number;
}

// =============================================================================
// COMBINED INSIGHTS RESPONSE
// =============================================================================

export interface PlayerInsightsData {
  sgJourney: SGJourneyData;
  skillDNA: SkillDNAProfile;
  bountyBoard: BountyBoard;

  // Quick stats for dashboard
  quickStats: {
    sgTotal: number;
    sgTrend: number;
    topStrength: string;
    topWeakness: string;
    activeBountyCount: number;
    nearestBountyProgress: number;
  };
}
