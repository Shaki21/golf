import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StreakIndicator } from '../StreakIndicator';
import { TierBadge } from '../TierBadge';
import { PageTitle } from '../../typography/Headings';

/**
 * TIER Golf Player Header Widget
 *
 * Displays player info with avatar, name, level, current category, and streak.
 * Perfect for dashboard hero sections.
 *
 * @param {Object} props
 * @param {string} props.name - Player name
 * @param {number} props.level - Player level
 * @param {'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'} props.category - Current category
 * @param {number} props.streak - Training streak (days)
 * @param {string} props.avatarUrl - Avatar image URL
 * @param {string} props.greeting - Custom greeting message
 * @param {string} props.subtitle - Subtitle/role
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <PlayerHeader
 *   name="Ola Nordmann"
 *   level={12}
 *   category="F"
 *   streak={7}
 *   avatarUrl="/avatars/ola.jpg"
 *   greeting="Good morning"
 * />
 */

const categoryLabels = {
  A: 'Tour/Elite',
  B: 'Landslag',
  C: 'Høyt nasjonalt',
  D: 'Nasjonalt',
  E: 'Regionalt topp',
  F: 'Regionalt',
  G: 'Klubb høy',
  H: 'Klubb middels',
  I: 'Klubb lav',
  J: 'Utvikling',
  K: 'Nybegynner',
};

export function PlayerHeader({
  name,
  level,
  category,
  streak,
  avatarUrl,
  greeting = 'Hei',
  subtitle,
  className,
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-6', className)} {...props}>
      {/* Avatar + Level */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-tier-navy flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-tier-white" />
          )}
        </div>

        {/* Level indicator */}
        {level !== undefined && (
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-tier-gold border-3 border-white flex items-center justify-center shadow-md">
            <span className="font-display text-sm font-bold text-tier-navy">
              {level}
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex-1">
        {/* Greeting */}
        <div className="text-sm text-text-muted mb-1">{greeting},</div>

        {/* Name */}
        <PageTitle className="font-display text-3xl font-bold text-tier-navy mb-2" style={{ marginBottom: '0.5rem' }}>
          {name}
        </PageTitle>

        {/* Badges row */}
        <div className="flex items-center gap-2">
          {/* Category badge */}
          {category && (
            <TierBadge
              variant="primary"
              size="md"
              className={`bg-category-${category.toLowerCase()} border-none text-white`}
            >
              Kategori {category} · {categoryLabels[category]}
            </TierBadge>
          )}

          {/* Streak indicator */}
          {streak !== undefined && streak > 0 && (
            <StreakIndicator count={streak} size="md" />
          )}

          {/* Subtitle */}
          {subtitle && (
            <span className="text-sm text-text-tertiary">· {subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

PlayerHeader.displayName = 'PlayerHeader';
