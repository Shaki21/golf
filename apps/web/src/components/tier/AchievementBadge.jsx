import React from 'react';
import {
  Clock,
  Check,
  Flame,
  Sunrise,
  Dumbbell,
  Trophy,
  Zap,
  Target,
  Flag,
  Star,
  Brain,
  Medal,
  Snowflake,
  Sun,
  Lock,
  Gem,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SubSectionTitle } from '../typography/Headings';
import { TierBadge } from './TierBadge';

/**
 * TIER Golf Achievement Badge
 *
 * Displays unlockable achievement badges with tier system (Bronze/Silver/Gold/Platinum).
 * Supports locked, unlocked, and in-progress states with visual feedback.
 *
 * @param {Object} props
 * @param {string} props.id - Badge unique ID
 * @param {string} props.name - Badge name/title
 * @param {string} props.description - Badge description
 * @param {string} props.symbol - Icon symbol (clock, check, flame, etc.)
 * @param {'standard'|'bronze'|'silver'|'gold'|'platinum'} props.tier - Badge tier
 * @param {boolean} props.unlocked - Whether badge is unlocked
 * @param {Object} props.progress - Progress object with { current, target }
 * @param {number} props.xp - XP reward
 * @param {boolean} props.isLimited - Limited/seasonal badge
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.showAnimation - Show unlock animation
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <AchievementBadge
 *   name="Century Club"
 *   description="Logg 100 timer trening totalt"
 *   symbol="clock"
 *   tier="silver"
 *   unlocked={true}
 *   xp={200}
 * />
 *
 * @example
 * <AchievementBadge
 *   name="Uke Warrior"
 *   description="Tren 7 dager på rad"
 *   symbol="flame"
 *   tier="bronze"
 *   unlocked={false}
 *   progress={{ current: 5, target: 7 }}
 * />
 */

const symbolIcons = {
  clock: Clock,
  check: Check,
  flame: Flame,
  sunrise: Sunrise,
  dumbbell: Dumbbell,
  trophy: Trophy,
  lightning: Zap,
  target: Target,
  flag: Flag,
  star: Star,
  brain: Brain,
  medal: Medal,
  snowflake: Snowflake,
  sun: Sun,
};

const tierColors = {
  standard: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    icon: 'text-gray-600',
    glow: 'shadow-gray-200',
  },
  bronze: {
    bg: 'bg-gradient-to-br from-amber-100 to-orange-100',
    border: 'border-badge-tier-bronze',
    icon: 'text-badge-tier-bronze',
    glow: 'shadow-amber-200',
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-100 to-slate-200',
    border: 'border-badge-tier-silver',
    icon: 'text-badge-tier-silver',
    glow: 'shadow-slate-300',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-100 to-amber-200',
    border: 'border-badge-tier-gold',
    icon: 'text-badge-tier-gold',
    glow: 'shadow-yellow-300',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-slate-100 to-gray-200',
    border: 'border-badge-tier-platinum',
    icon: 'text-badge-tier-platinum',
    glow: 'shadow-slate-200',
  },
};

const sizeConfig = {
  sm: {
    container: 'w-32',
    icon: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    title: 'text-xs',
    description: 'text-[10px]',
  },
  md: {
    container: 'w-40',
    icon: 'w-16 h-16',
    iconSize: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    container: 'w-48',
    icon: 'w-20 h-20',
    iconSize: 'w-10 h-10',
    title: 'text-base',
    description: 'text-sm',
  },
};

export function AchievementBadge({
  id,
  name,
  description,
  symbol = 'trophy',
  tier = 'standard',
  unlocked = false,
  progress,
  xp,
  isLimited = false,
  onClick,
  showAnimation = false,
  size = 'md',
  className,
  ...props
}) {
  const Icon = symbolIcons[symbol] || Trophy;
  const tierStyle = tierColors[tier] || tierColors.standard;
  const sizing = sizeConfig[size];

  const progressPercent = progress
    ? Math.min(100, (progress.current / progress.target) * 100)
    : 0;
  const isInProgress = progress && !unlocked;

  return (
    <button
      onClick={onClick}
      disabled={!unlocked && !isInProgress}
      className={cn(
        'relative flex flex-col items-center gap-3 p-4 rounded-xl',
        'border-2 transition-all duration-300',
        sizing.container,
        unlocked && [
          tierStyle.bg,
          tierStyle.border,
          'hover:shadow-lg',
          tierStyle.glow,
          'hover:scale-105',
          'active:scale-100',
          showAnimation && 'animate-badge-unlock',
        ],
        !unlocked && 'bg-gray-50 border-gray-200 opacity-60',
        isInProgress && 'hover:shadow-md hover:opacity-80',
        className
      )}
      {...props}
    >
      {/* Limited/Seasonal Indicator */}
      {isLimited && unlocked && (
        <div className="absolute -top-2 -right-2">
          <TierBadge variant="gold" size="sm" className="text-[10px] px-1.5 py-0.5 flex items-center justify-center">
            <Star size={12} fill="currentColor" />
          </TierBadge>
        </div>
      )}

      {/* XP Badge */}
      {xp && unlocked && (
        <div className="absolute -top-2 -left-2">
          <TierBadge variant="info" size="sm" className="text-[10px] px-1.5 py-0.5">
            +{xp} XP
          </TierBadge>
        </div>
      )}

      {/* Icon Circle */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center border-2',
          'relative',
          sizing.icon,
          unlocked && [tierStyle.border, tierStyle.bg],
          !unlocked && 'bg-gray-100 border-gray-300'
        )}
      >
        {unlocked ? (
          <Icon className={cn(sizing.iconSize, tierStyle.icon)} />
        ) : (
          <Lock className={cn(sizing.iconSize, 'text-gray-400')} />
        )}

        {/* Progress Ring for in-progress badges */}
        {isInProgress && (
          <svg
            className="absolute inset-0 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progressPercent * 3.01593} 301.593`}
              className="text-tier-navy transition-all duration-500"
            />
          </svg>
        )}
      </div>

      {/* Badge Name */}
      <div className="text-center">
        <SubSectionTitle
          className={cn(
            'font-display font-bold mb-1',
            sizing.title,
            unlocked ? 'text-tier-navy' : 'text-gray-500'
          )}
          style={{ marginBottom: '0.25rem' }}
        >
          {name}
        </SubSectionTitle>
        <p
          className={cn(
            'leading-tight',
            sizing.description,
            unlocked ? 'text-text-muted' : 'text-gray-400'
          )}
        >
          {description}
        </p>
      </div>

      {/* Progress Text */}
      {isInProgress && (
        <div className="text-xs text-tier-navy font-medium">
          {progress.current} / {progress.target}
        </div>
      )}

      {/* Tier Indicator */}
      {unlocked && tier !== 'standard' && (
        <div className="absolute bottom-2 right-2">
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center',
              tierStyle.border,
              tierStyle.bg
            )}
          >
            {tier === 'bronze' && <Medal size={14} className="text-badge-tier-bronze" />}
            {tier === 'silver' && <Medal size={14} className="text-badge-tier-silver" />}
            {tier === 'gold' && <Medal size={14} className="text-badge-tier-gold" />}
            {tier === 'platinum' && <Gem size={14} className="text-badge-tier-platinum" />}
          </div>
        </div>
      )}
    </button>
  );
}

AchievementBadge.displayName = 'AchievementBadge';
