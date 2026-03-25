/**
 * StreakFlame Component
 *
 * Animated flame icon representing active streaks with flicker effect.
 * Used for gamification and motivation in streak tracking features.
 */

import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from 'lib/utils';

export interface StreakFlameProps {
  /** Whether the streak is currently active */
  isActive: boolean;
  /** Size of the flame icon in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Intensity of the flicker animation (1-3) */
  intensity?: 1 | 2 | 3;
}

export function StreakFlame({
  isActive,
  size = 24,
  className,
  intensity = 2,
}: StreakFlameProps) {
  const intensityClasses = {
    1: 'animate-flame-flicker-slow',
    2: 'animate-flame-flicker',
    3: 'animate-flame-flicker-fast',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center transition-all duration-300',
        isActive && 'drop-shadow-lg',
        className
      )}
    >
      <Flame
        size={size}
        className={cn(
          'transition-colors duration-300',
          isActive
            ? [
                'text-orange-500 dark:text-orange-400',
                intensityClasses[intensity],
              ]
            : 'text-gray-300 dark:text-gray-600',
          isActive && 'animate-pulse'
        )}
        fill={isActive ? 'currentColor' : 'none'}
      />
    </div>
  );
}

export default StreakFlame;
