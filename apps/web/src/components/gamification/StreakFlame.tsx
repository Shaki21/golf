/**
 * StreakFlame
 *
 * Animated flame icon for training streaks.
 * Flickers when active, static when inactive.
 */

import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakFlameProps {
  /** Whether the streak is currently active */
  isActive: boolean;
  /** Size of the flame icon */
  size?: number;
  /** Custom class name */
  className?: string;
}

export function StreakFlame({
  isActive,
  size = 24,
  className = '',
}: StreakFlameProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        isActive && 'animate-flicker',
        className
      )}
    >
      <Flame
        size={size}
        className={cn(
          'transition-colors duration-300',
          isActive
            ? 'text-orange-500 fill-orange-500'
            : 'text-gray-400 fill-gray-400'
        )}
      />
    </div>
  );
}

export default StreakFlame;
