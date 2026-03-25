/**
 * AK Golf Academy - Badge Availability Check
 * Identifies which badges can actually be achieved with current data sources
 */

import { BadgeDefinition } from './types';

/**
 * Metrics that are currently tracked in the system
 * These are the data sources that actually exist and are populated
 */
export const AVAILABLE_METRICS = new Set([
  // Volume metrics (from TrainingSession)
  'volume.totalHours',
  'volume.totalSessions',
  'volume.totalSwings',
  'volume.sessionsThisWeek',
  'volume.sessionsThisMonth',
  'volume.monthlyHours',
  'volume.hoursByType.teknikk',
  'volume.hoursByType.golfslag',
  'volume.hoursByType.spill',
  'volume.hoursByType.konkurranse',
  'volume.hoursByType.fysisk',
  'volume.hoursByType.mental',
  'volume.hoursByType.rest',

  // Streak metrics (calculated from TrainingSession dates)
  'streaks.currentStreak',
  'streaks.longestStreak',
  'streaks.perfectWeeks',
  'streaks.consecutivePerfectWeeks',
  'streaks.earlyMorningSessions',
  'streaks.eveningSessions',
  'streaks.weekendSessions',

  // Strength metrics (from gym sessions with exercises logged)
  'strength.totalTonnage',
  'strength.prCount',
  'strength.gymStreak',
  'strength.gymSessionsThisWeek',
  'strength.gymSessionsThisMonth',
  'strength.relativeStrength.squat',
  'strength.relativeStrength.deadlift',
  'strength.relativeStrength.benchPress',

  // Speed metrics (from TestResult - speed tests)
  'performance.speed.driverSpeed',
  'performance.speed.sevenIronSpeed',
  'performance.speed.speedImprovement',
  'performance.speed.smashFactor',

  // Scoring metrics (from TournamentResult)
  'performance.scoring.bestScore18',
  'performance.scoring.bestScore9',
  'performance.scoring.avgScore18',
  'performance.scoring.currentHandicap',
  'performance.scoring.totalRoundsPlayed',
  'performance.scoring.roundsUnderPar',

  // Phase metrics (from phase/compliance tracking)
  'phase.phasesCompleted',
  'phase.phaseCompliance',
  'phase.annualPlanCompliance',
]);

/**
 * Metrics that are NOT currently tracked but are referenced in badge definitions
 * These badges should be hidden or marked as "coming soon"
 */
export const UNAVAILABLE_METRICS = new Set([
  // Proximity metrics (requires shot-by-shot tracking with GPS/laser)
  'performance.accuracy.avgProximity',
  'performance.accuracy.proximityFrom100',
  'performance.accuracy.proximityFrom150',

  // Detailed putting metrics (requires putt tracking app integration)
  'performance.putting.makeRateInside3ft',
  'performance.putting.makeRate3to6ft',
  'performance.putting.makeRate6to10ft',
  'performance.putting.makeRate10to20ft',
  'performance.putting.makeRateOver20ft',

  // Short game proximity (requires shot tracking)
  'performance.shortGame.proximityFrom50',
  'performance.shortGame.proximityFrom30',
  'performance.shortGame.proximityChip',

  // Strokes gained (requires benchmark data and detailed stats)
  'strokesGained.total',
  'strokesGained.offTheTee',
  'strokesGained.approach',
  'strokesGained.aroundTheGreen',
  'strokesGained.putting',

  // Golf fitness assessments (requires periodic testing)
  'strength.golfFitness.medBallThrow',
  'strength.golfFitness.verticalJump',
  'strength.golfFitness.broadJump',
  'strength.golfFitness.hipRotationLeft',
  'strength.golfFitness.hipRotationRight',
  'strength.golfFitness.thoracicRotation',
  'strength.golfFitness.shoulderMobility',
  'strength.golfFitness.singleLegBalanceLeft',
  'strength.golfFitness.singleLegBalanceRight',
  'strength.golfFitness.plankHold',
  'strength.golfFitness.clubheadSpeedDriver',
  'strength.golfFitness.clubheadSpeed7Iron',
]);

/**
 * Check if a badge is available (can be achieved with current data)
 */
export function isBadgeAvailable(badge: BadgeDefinition): boolean {
  // Check each requirement
  for (const req of badge.requirements) {
    const metric = req.metric;

    // If any requirement uses an unavailable metric, badge is unavailable
    if (UNAVAILABLE_METRICS.has(metric)) {
      return false;
    }

    // If metric is not in available set and not in unavailable set,
    // assume it's available (conservative approach)
    // This handles new metrics that might be added
  }

  return true;
}

/**
 * Get reason why a badge is unavailable
 */
export function getUnavailabilityReason(badge: BadgeDefinition): string | null {
  for (const req of badge.requirements) {
    const metric = req.metric;

    if (metric.includes('proximity')) {
      return 'Krever shot-by-shot sporing med GPS eller laser';
    }
    if (metric.includes('makeRate')) {
      return 'Krever detaljert putt-tracking integrasjon';
    }
    if (metric.includes('strokesGained')) {
      return 'Strokes Gained krever benchmark-data og detaljert statistikk';
    }
    if (metric.includes('golfFitness')) {
      return 'Krever periodisk fysisk testing med coach';
    }
  }

  return null;
}

/**
 * Augment badge definitions with availability status
 */
export function augmentBadgesWithAvailability(
  badges: BadgeDefinition[]
): (BadgeDefinition & { isAvailable: boolean; unavailableReason?: string })[] {
  return badges.map((badge) => {
    const isAvailable = isBadgeAvailable(badge);
    const reason = isAvailable ? undefined : getUnavailabilityReason(badge);
    const unavailableReason = reason ?? undefined; // Convert null to undefined

    return {
      ...badge,
      isAvailable,
      unavailableReason,
    };
  });
}

/**
 * Filter to only available badges
 */
export function filterAvailableBadges(badges: BadgeDefinition[]): BadgeDefinition[] {
  return badges.filter(isBadgeAvailable);
}

/**
 * Get statistics about badge availability
 */
export function getBadgeAvailabilityStats(badges: BadgeDefinition[]) {
  const available = badges.filter(isBadgeAvailable);
  const unavailable = badges.filter((b) => !isBadgeAvailable(b));

  // Group unavailable by reason
  const unavailableByReason: Record<string, BadgeDefinition[]> = {};
  unavailable.forEach((badge) => {
    const reason = getUnavailabilityReason(badge) || 'Unknown';
    if (!unavailableByReason[reason]) {
      unavailableByReason[reason] = [];
    }
    unavailableByReason[reason].push(badge);
  });

  return {
    total: badges.length,
    available: available.length,
    unavailable: unavailable.length,
    availablePercent: Math.round((available.length / badges.length) * 100),
    unavailableByReason: Object.entries(unavailableByReason).map(([reason, badges]) => ({
      reason,
      count: badges.length,
      badges: badges.map((b) => b.id),
    })),
  };
}
