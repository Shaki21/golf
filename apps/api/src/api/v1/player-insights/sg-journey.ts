/**
 * SG Journey Calculator
 * Calculates player's position on the "mountain climb" to PGA Elite level
 */

import {
  SGJourneyLevel,
  SGJourneyPosition,
  SGJourneyMilestone,
  SGJourneyData,
} from './types';

// =============================================================================
// JOURNEY LEVELS - The "Mountain" to climb
// =============================================================================

export const SG_JOURNEY_LEVELS: SGJourneyLevel[] = [
  {
    id: 'pga_elite',
    name: 'PGA Elite',
    nameno: 'PGA Elite',
    sgMin: 2.0,
    sgMax: 5.0,
    altitude: 8848, // Mt. Everest
    description: 'Top 10 on PGA Tour',
    estimatedScore: '66-68',
    color: '#FFD700', // Gold
  },
  {
    id: 'pga_top50',
    name: 'PGA Top 50',
    nameno: 'PGA Topp 50',
    sgMin: 1.0,
    sgMax: 2.0,
    altitude: 6500,
    description: 'Consistent tour winner',
    estimatedScore: '68-70',
    color: '#C0C0C0', // Silver
  },
  {
    id: 'pga_average',
    name: 'PGA Average',
    nameno: 'PGA Snitt',
    sgMin: 0.0,
    sgMax: 1.0,
    altitude: 5000,
    description: 'Tour average player',
    estimatedScore: '70-72',
    color: '#CD7F32', // Bronze
  },
  {
    id: 'mini_tour',
    name: 'Mini Tour',
    nameno: 'Mini Tour',
    sgMin: -0.5,
    sgMax: 0.0,
    altitude: 4000,
    description: 'Developing professional',
    estimatedScore: '72-74',
    color: '#4A90D9',
  },
  {
    id: 'scratch',
    name: 'Scratch Golfer',
    nameno: 'Scratch',
    sgMin: -1.0,
    sgMax: -0.5,
    altitude: 3000,
    description: 'Handicap 0-2',
    estimatedScore: '72-75',
    color: '#50C878',
  },
  {
    id: 'single_digit',
    name: 'Single Digit',
    nameno: 'Ensifret',
    sgMin: -1.5,
    sgMax: -1.0,
    altitude: 2000,
    description: 'Handicap 3-9',
    estimatedScore: '75-82',
    color: '#87CEEB',
  },
  {
    id: 'mid_handicap',
    name: 'Mid Handicap',
    nameno: 'Midthandicap',
    sgMin: -2.5,
    sgMax: -1.5,
    altitude: 1000,
    description: 'Handicap 10-18',
    estimatedScore: '82-90',
    color: '#DDA0DD',
  },
  {
    id: 'beginner',
    name: 'Beginner',
    nameno: 'Nybegynner',
    sgMin: -5.0,
    sgMax: -2.5,
    altitude: 0,
    description: 'Handicap 19+',
    estimatedScore: '90+',
    color: '#98FB98',
  },
];

// =============================================================================
// MILESTONES - Achievements along the journey
// =============================================================================

export const SG_MILESTONES: Omit<SGJourneyMilestone, 'reached' | 'reachedAt'>[] = [
  { id: 'first_positive', name: 'Første positive SG', sg: 0.01, xpAwarded: 500 },
  { id: 'scratch_level', name: 'Scratch-nivå', sg: -0.5, xpAwarded: 300 },
  { id: 'mini_tour', name: 'Mini Tour-nivå', sg: 0.0, xpAwarded: 400 },
  { id: 'tour_level', name: 'Tour-nivå', sg: 0.5, xpAwarded: 600 },
  { id: 'pga_average', name: 'PGA Snitt', sg: 1.0, xpAwarded: 800 },
  { id: 'pga_top50', name: 'PGA Topp 50', sg: 1.5, xpAwarded: 1000 },
  { id: 'pga_elite', name: 'PGA Elite', sg: 2.0, xpAwarded: 1500 },
  { id: 'world_class', name: 'Verdensklasse', sg: 3.0, xpAwarded: 2500 },
];

// =============================================================================
// CALCULATOR FUNCTIONS
// =============================================================================

/**
 * Find the current level based on SG value
 */
export function findCurrentLevel(sg: number): SGJourneyLevel {
  for (const level of SG_JOURNEY_LEVELS) {
    if (sg >= level.sgMin && sg < level.sgMax) {
      return level;
    }
  }
  // Default to lowest or highest
  if (sg >= SG_JOURNEY_LEVELS[0].sgMax) {
    return SG_JOURNEY_LEVELS[0]; // PGA Elite
  }
  return SG_JOURNEY_LEVELS[SG_JOURNEY_LEVELS.length - 1]; // Beginner
}

/**
 * Get the next level (one step up)
 */
export function getNextLevel(currentLevel: SGJourneyLevel): SGJourneyLevel | null {
  const currentIndex = SG_JOURNEY_LEVELS.findIndex(l => l.id === currentLevel.id);
  if (currentIndex <= 0) return null; // Already at top
  return SG_JOURNEY_LEVELS[currentIndex - 1];
}

/**
 * Get the previous level (one step down)
 */
export function getPreviousLevel(currentLevel: SGJourneyLevel): SGJourneyLevel | null {
  const currentIndex = SG_JOURNEY_LEVELS.findIndex(l => l.id === currentLevel.id);
  if (currentIndex >= SG_JOURNEY_LEVELS.length - 1) return null; // Already at bottom
  return SG_JOURNEY_LEVELS[currentIndex + 1];
}

/**
 * Calculate progress percentage to next level
 */
export function calculateProgressToNext(sg: number, currentLevel: SGJourneyLevel, nextLevel: SGJourneyLevel | null): number {
  if (!nextLevel) return 100; // At the top

  const levelRange = nextLevel.sgMin - currentLevel.sgMin;
  const progress = sg - currentLevel.sgMin;

  return Math.min(100, Math.max(0, (progress / levelRange) * 100));
}

/**
 * Calculate metaphorical altitude
 */
export function calculateAltitude(sg: number): number {
  const currentLevel = findCurrentLevel(sg);
  const nextLevel = getNextLevel(currentLevel);

  if (!nextLevel) return currentLevel.altitude;

  const levelRange = nextLevel.sgMin - currentLevel.sgMin;
  const altitudeRange = nextLevel.altitude - currentLevel.altitude;
  const progress = (sg - currentLevel.sgMin) / levelRange;

  return Math.round(currentLevel.altitude + (altitudeRange * progress));
}

/**
 * Estimate score based on SG
 */
export function estimateScoreFromSG(sg: number): number {
  // PGA Tour average is ~71.5 with SG = 0
  // Each 1.0 SG = approximately 1 stroke per round
  const tourAverageScore = 71.5;
  return Math.round((tourAverageScore - sg) * 10) / 10;
}

/**
 * Estimate days to reach next level based on improvement rate
 */
export function estimateDaysToNextLevel(
  currentSG: number,
  nextLevel: SGJourneyLevel | null,
  dailyImprovementRate: number
): number | null {
  if (!nextLevel) return null;
  if (dailyImprovementRate <= 0) return null;

  const sgNeeded = nextLevel.sgMin - currentSG;
  if (sgNeeded <= 0) return 0;

  return Math.ceil(sgNeeded / dailyImprovementRate);
}

/**
 * Calculate milestones status
 */
export function calculateMilestones(
  currentSG: number,
  historicalHighSG: number,
  milestoneHistory: Record<string, Date>
): SGJourneyMilestone[] {
  return SG_MILESTONES.map(milestone => ({
    ...milestone,
    reached: historicalHighSG >= milestone.sg,
    reachedAt: milestoneHistory[milestone.id] || null,
  }));
}

/**
 * Calculate trend from historical data
 */
export function calculateTrend(
  history: Array<{ date: Date; sg: number }>,
  days: number
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentData = history.filter(h => h.date >= cutoffDate);
  if (recentData.length < 2) return 0;

  // Sort by date
  recentData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Simple linear regression or just first vs last
  const first = recentData[0].sg;
  const last = recentData[recentData.length - 1].sg;

  return Math.round((last - first) * 100) / 100;
}

// =============================================================================
// MAIN CALCULATOR
// =============================================================================

export interface SGJourneyInput {
  currentSG: number;
  categoryBreakdown: {
    approach: number;
    aroundGreen: number;
    putting: number;
  };
  history: Array<{ date: Date; sg: number }>;
  startSG: number;
  milestoneHistory?: Record<string, Date>;
}

export function calculateSGJourney(input: SGJourneyInput): SGJourneyData {
  const { currentSG, categoryBreakdown, history, startSG, milestoneHistory = {} } = input;

  const currentLevel = findCurrentLevel(currentSG);
  const nextLevel = getNextLevel(currentLevel);
  const previousLevel = getPreviousLevel(currentLevel);

  // Calculate trends
  const trend30Days = calculateTrend(history, 30);
  const trend90Days = calculateTrend(history, 90);

  // Daily improvement rate (average over last 90 days)
  const dailyRate = trend90Days > 0 ? trend90Days / 90 : 0;

  // Historical high for milestones
  const historicalHighSG = Math.max(currentSG, ...history.map(h => h.sg));

  const position: SGJourneyPosition = {
    currentSG,
    currentLevel,
    nextLevel,
    previousLevel,
    progressToNext: calculateProgressToNext(currentSG, currentLevel, nextLevel),
    sgToNextLevel: nextLevel ? Math.round((nextLevel.sgMin - currentSG) * 100) / 100 : 0,
    altitudeMeters: calculateAltitude(currentSG),
    startSG,
    totalClimbed: Math.round((currentSG - startSG) * 100) / 100,
    trend30Days,
    trend90Days,
    estimatedDaysToNext: estimateDaysToNextLevel(currentSG, nextLevel, dailyRate),
    estimatedScore: estimateScoreFromSG(currentSG),
  };

  const milestones = calculateMilestones(currentSG, historicalHighSG, milestoneHistory);

  // Format history for response
  const formattedHistory = history
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50)
    .map(h => ({
      date: h.date.toISOString().split('T')[0],
      sg: h.sg,
      level: findCurrentLevel(h.sg).id,
    }));

  return {
    position,
    milestones,
    history: formattedHistory,
    categoryBreakdown,
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const sgJourneyUtils = {
  findCurrentLevel,
  getNextLevel,
  getPreviousLevel,
  calculateProgressToNext,
  calculateAltitude,
  estimateScoreFromSG,
  estimateDaysToNextLevel,
  calculateMilestones,
  calculateTrend,
  SG_JOURNEY_LEVELS,
  SG_MILESTONES,
};
