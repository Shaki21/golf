/**
 * BadgeShowcase
 *
 * Displays recent badges with entry animations and shine effects.
 * Perfect for celebrating achievements on the dashboard.
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Trophy } from 'lucide-react';
import { SubSectionTitle } from '../typography/Headings';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  earnedAt?: Date;
}

interface BadgeShowcaseProps {
  /** Badges to display (max 3 shown) */
  badges: Badge[];
  /** Title for the showcase */
  title?: string;
  /** Maximum number of badges to show */
  maxDisplay?: number;
  /** Custom class name */
  className?: string;
  /** Callback when a badge is clicked */
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeShowcase({
  badges,
  title = 'Siste merker',
  maxDisplay = 3,
  className = '',
  onBadgeClick,
}: BadgeShowcaseProps) {
  const displayBadges = badges.slice(0, maxDisplay);

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <SubSectionTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide" style={{ fontSize: '0.875rem' }}>
          {title}
        </SubSectionTitle>
      )}

      <div className="flex gap-3">
        {displayBadges.map((badge, index) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            delay={index * 200}
            onClick={onBadgeClick}
          />
        ))}
      </div>
    </div>
  );
}

interface BadgeItemProps {
  badge: Badge;
  delay: number;
  onClick?: (badge: Badge) => void;
}

function BadgeItem({ badge, delay, onClick }: BadgeItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(badge);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative group',
        'w-20 h-20 rounded-xl',
        'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
        'border-2 border-amber-200 dark:border-amber-700',
        'flex items-center justify-center',
        'transition-all duration-200',
        'hover:scale-110 hover:shadow-lg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'cursor-pointer',
        'overflow-hidden'
      )}
      style={{
        animation: `badge-entry 0.5s ease-out ${delay}ms forwards`,
        opacity: 0,
        transform: 'scale(0.5) rotate(-10deg)',
      }}
      title={badge.description || badge.name}
    >
      {/* Shine Effect */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          animation: 'badge-shine 2s infinite',
          animationDelay: `${delay + 500}ms`,
        }}
      />

      {/* Badge Icon or Emoji */}
      <div className="relative z-10 text-3xl">
        {badge.icon || <Trophy className="text-amber-600 dark:text-amber-400" size={36} />}
      </div>

      {/* Tooltip on hover */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-3 py-1.5 rounded-lg',
          'bg-gray-900 dark:bg-gray-800',
          'text-xs font-medium text-white',
          'whitespace-nowrap',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200',
          'pointer-events-none',
          'shadow-lg'
        )}
      >
        {badge.name}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      </div>
    </button>
  );
}

export default BadgeShowcase;
