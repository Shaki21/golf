import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * TIER Golf Streak Indicator Component
 *
 * Shows training streak count with animated fire icon.
 * Perfect for gamification and motivation.
 *
 * @param {Object} props
 * @param {number} props.count - Streak count (number of days)
 * @param {string} props.label - Label text (default: "dagers streak")
 * @param {boolean} props.animated - Enable fire flicker animation (default: true)
 * @param {'sm' | 'md' | 'lg'} props.size - Component size
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <StreakIndicator count={7} label="dagers streak" />
 */

const sizes = {
  sm: {
    container: 'px-2 py-1 gap-1.5',
    icon: 'w-4 h-4',
    count: 'text-base',
    label: 'text-xs',
  },
  md: {
    container: 'px-3 py-2 gap-2',
    icon: 'w-5 h-5',
    count: 'text-lg',
    label: 'text-sm',
  },
  lg: {
    container: 'px-4 py-2.5 gap-2.5',
    icon: 'w-6 h-6',
    count: 'text-xl',
    label: 'text-base',
  },
};

export function StreakIndicator({
  count = 0,
  label = 'dagers streak',
  animated = true,
  size = 'md',
  className,
  ...props
}) {
  const sizeClasses = sizes[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-status-warning/10 border border-status-warning/20',
        sizeClasses.container,
        className
      )}
      {...props}
    >
      {/* Fire icon */}
      <Flame
        className={cn(
          sizeClasses.icon,
          'text-status-warning',
          animated && 'animate-fire-flicker'
        )}
        fill="currentColor"
      />

      {/* Streak count */}
      <span
        className={cn(
          'font-display font-bold text-status-warning-dark',
          sizeClasses.count
        )}
      >
        {count}
      </span>

      {/* Label */}
      {label && (
        <span
          className={cn(
            'text-status-warning-dark font-medium',
            sizeClasses.label
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Fire flicker animation (add to globals or tier-animations.css)
const fireFlickerCSS = `
@keyframes fire-flicker {
  0%, 100% {
    transform: scale(1) rotate(-2deg);
    filter: brightness(1);
  }
  25% {
    transform: scale(1.05) rotate(1deg);
    filter: brightness(1.1);
  }
  50% {
    transform: scale(0.98) rotate(-1deg);
    filter: brightness(0.95);
  }
  75% {
    transform: scale(1.02) rotate(2deg);
    filter: brightness(1.05);
  }
}
`;

// Export sizes for external use
StreakIndicator.sizes = Object.keys(sizes);

// Export CSS for manual inclusion if needed
StreakIndicator.animationCSS = fireFlickerCSS;
