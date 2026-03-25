/**
 * StreakCounter Component
 *
 * Displays current goal streak with animated flame, personal best,
 * and progress to next milestone. Includes streak freeze indicator
 * for grace period tracking.
 */

import React from 'react';
import { Trophy, Flame, Snowflake } from 'lucide-react';
import { cn } from 'lib/utils';
import { Card, CardContent } from '../../../components/shadcn/card';
import { Progress } from '../../../components/shadcn/progress';
import { StreakFlame } from '../../../components/shared/StreakFlame';
import { SubSectionTitle } from '../../../components/typography';

export interface StreakCounterProps {
  /** Current active streak count (consecutive days) */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Status of the current streak */
  streakStatus?: 'active' | 'at_risk' | 'frozen' | 'inactive';
  /** Days until streak expires (0-1 for grace period) */
  daysUntilExpiry?: number;
  /** Next streak milestone target */
  nextMilestone?: number;
  /** Custom className */
  className?: string;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

/**
 * Get next milestone based on current streak
 */
function getNextMilestone(currentStreak: number): number {
  const nextMilestone = STREAK_MILESTONES.find(
    (milestone) => milestone > currentStreak
  );
  return nextMilestone || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
}

/**
 * Calculate progress to next milestone (0-100)
 */
function calculateProgress(currentStreak: number, milestone: number): number {
  const previousMilestone =
    STREAK_MILESTONES.find((m, i) => STREAK_MILESTONES[i + 1] === milestone) ||
    0;
  const range = milestone - previousMilestone;
  const progress = currentStreak - previousMilestone;
  return Math.min(Math.round((progress / range) * 100), 100);
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  streakStatus = 'active',
  daysUntilExpiry,
  nextMilestone: providedMilestone,
  className,
}: StreakCounterProps) {
  const isActive = streakStatus === 'active' || streakStatus === 'frozen';
  const isFrozen = streakStatus === 'frozen';
  const isAtRisk = streakStatus === 'at_risk';
  const nextMilestone = providedMilestone || getNextMilestone(currentStreak);
  const progressToMilestone = calculateProgress(currentStreak, nextMilestone);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Flame */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SubSectionTitle style={{ marginBottom: 0 }} className="text-sm font-medium text-text-secondary">
                  Målstreek
                </SubSectionTitle>
                {isFrozen && (
                  <Snowflake className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-4xl font-bold tabular-nums transition-colors duration-300',
                    isActive
                      ? 'text-orange-500 dark:text-orange-400'
                      : 'text-gray-400 dark:text-gray-600'
                  )}
                >
                  {currentStreak}
                </span>
                <span className="text-sm text-text-tertiary">
                  {currentStreak === 1 ? 'dag' : 'dager'}
                </span>
              </div>
            </div>
            <StreakFlame
              isActive={isActive}
              size={48}
              intensity={isAtRisk ? 3 : 2}
            />
          </div>

          {/* Status Message */}
          {isAtRisk && daysUntilExpiry !== undefined && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                {daysUntilExpiry === 0
                  ? 'Streeken utløper i dag! Oppdater fremgangen for å holde den i live.'
                  : `Streeken utløper om ${daysUntilExpiry} dag. Oppdater snart!`}
              </p>
            </div>
          )}

          {isFrozen && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Snowflake className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Streek fryst! Du har 1 dag på deg å oppdatere uten å miste
                streeken.
              </p>
            </div>
          )}

          {/* Progress to Next Milestone */}
          {isActive && nextMilestone > currentStreak && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Neste milepæl: {nextMilestone} dager
                </span>
                <span className="text-text-tertiary font-medium">
                  {nextMilestone - currentStreak} dager igjen
                </span>
              </div>
              <Progress
                value={progressToMilestone}
                className="h-2"
                indicatorClassName="bg-gradient-to-r from-orange-400 to-orange-500"
              />
            </div>
          )}

          {/* Personal Best */}
          {longestStreak > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-text-secondary">
                  Personlig rekord
                </span>
              </div>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {longestStreak} {longestStreak === 1 ? 'dag' : 'dager'}
              </span>
            </div>
          )}

          {/* New Record Indicator */}
          {currentStreak > longestStreak && currentStreak > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg">
              <Trophy className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                🎉 Ny personlig rekord!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StreakCounter;
