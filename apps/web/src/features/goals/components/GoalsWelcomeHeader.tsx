/**
 * GoalsWelcomeHeader
 *
 * Personalized welcome header for Goals page with time-based gradients
 * and motivational messages based on goal progress.
 */

import React from 'react';
import { Target, Trophy, TrendingUp } from 'lucide-react';
import { cn } from 'lib/utils';
import { SectionTitle } from '../../../components/typography';

export interface GoalsWelcomeHeaderProps {
  /** User's display name */
  userName: string;
  /** Number of active goals */
  activeGoals: number;
  /** Average progress percentage across all goals (0-100) */
  totalProgress: number;
  /** Number of completed goals this month */
  completedThisMonth?: number;
  /** Optional custom welcome message */
  customMessage?: string;
  /** Custom className for additional styling */
  className?: string;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

/**
 * Get time-based greeting in English
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get current time of day category
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Get personalized motivational message based on goal progress
 */
function getMotivationalMessage(
  activeGoals: number,
  totalProgress: number,
  completedThisMonth?: number
): string | null {
  if (activeGoals === 0) {
    return 'Opprett ditt første mål for å komme i gang!';
  }

  // Completed goals this month
  if (completedThisMonth && completedThisMonth > 0) {
    if (completedThisMonth === 1) {
      return '🎉 Du har fullført 1 mål denne måneden!';
    }
    return `🎉 Imponerende! ${completedThisMonth} mål fullført denne måneden!`;
  }

  // Based on average progress
  if (totalProgress >= 90) {
    return '🔥 Utrolig fremgang! Du nærmer deg målene dine';
  }

  if (totalProgress >= 75) {
    return '💪 Flott jobbet! Du ligger godt an på målene dine';
  }

  if (totalProgress >= 50) {
    return '📈 God progresjon! Du er godt i gang';
  }

  if (totalProgress >= 25) {
    return '🎯 Du har kommet i gang – fortsett det gode arbeidet';
  }

  // Low progress / getting started
  if (activeGoals > 0) {
    return `Du har ${activeGoals} ${activeGoals === 1 ? 'aktivt mål' : 'aktive mål'} – tid for å gjøre fremskritt!`;
  }

  return null;
}

/**
 * Get gradient classes based on time of day
 */
function getGradientClass(timeOfDay: TimeOfDay): string {
  const gradients = {
    morning: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-blue-950/30',
    afternoon: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30',
    evening: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-indigo-950/30',
  };
  return gradients[timeOfDay];
}

/**
 * Get icon based on progress level
 */
function getProgressIcon(totalProgress: number) {
  if (totalProgress >= 75) return Trophy;
  if (totalProgress >= 50) return TrendingUp;
  return Target;
}

export function GoalsWelcomeHeader({
  userName,
  activeGoals,
  totalProgress,
  completedThisMonth,
  customMessage,
  className,
}: GoalsWelcomeHeaderProps) {
  const greeting = getGreeting();
  const timeOfDay = getTimeOfDay();
  const motivationalMessage = customMessage || getMotivationalMessage(activeGoals, totalProgress, completedThisMonth);
  const gradientClass = getGradientClass(timeOfDay);
  const ProgressIcon = getProgressIcon(totalProgress);

  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-colors duration-500 shadow-sm',
        'dark:shadow-none dark:ring-1 dark:ring-white/10',
        gradientClass,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Greeting */}
          <div className="flex items-center gap-2 mb-2">
            <SectionTitle style={{ marginBottom: 0 }} className="text-2xl font-bold text-gray-900 dark:text-white">
              {greeting}, {userName}!
            </SectionTitle>
            <ProgressIcon className={cn(
              "h-6 w-6 animate-pulse",
              totalProgress >= 75 ? "text-amber-500" : totalProgress >= 50 ? "text-blue-500" : "text-gray-400"
            )} />
          </div>

          {/* Motivational Message */}
          {motivationalMessage && (
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {motivationalMessage}
            </p>
          )}

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {activeGoals} {activeGoals === 1 ? 'aktivt mål' : 'aktive mål'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {Math.round(totalProgress)}% gjennomsnittlig fremgang
              </span>
            </div>
            {completedThisMonth !== undefined && completedThisMonth > 0 && (
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {completedThisMonth} fullført denne måneden
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Circle */}
        {activeGoals > 0 && (
          <div className="hidden sm:flex items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - totalProgress / 100)}
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    totalProgress >= 75 ? "text-green-500" : totalProgress >= 50 ? "text-blue-500" : "text-gray-400"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(totalProgress)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalsWelcomeHeader;
