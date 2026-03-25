import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { SubSectionTitle } from '../typography';
import {
  Award,
  Clock,
  Flame,
  Dumbbell,
  Zap,
  Target,
  Flag,
  Trophy,
  Star,
  Check,
  Sunrise,
  Moon,
  Snowflake,
  Sun,
  BookOpen,
  Medal,
  Brain,
} from 'lucide-react';

/**
 * Badge symbol to icon mapping
 * Matches BadgeSymbol enum from backend types.ts
 */
const SYMBOL_TO_ICON = {
  flame: Flame,
  trophy: Trophy,
  star: Star,
  target: Target,
  clock: Clock,
  check: Check,
  lightning: Zap,
  zap: Zap,
  flag: Flag,
  medal: Medal,
  dumbbell: Dumbbell,
  brain: Brain,
  sunrise: Sunrise,
  moon: Moon,
  snowflake: Snowflake,
  sun: Sun,
  book: BookOpen,
  award: Award,
};

/**
 * Default icon for each category (fallback when symbol not specified)
 */
const CATEGORY_DEFAULT_ICONS = {
  volume: Clock,
  streak: Flame,
  strength: Dumbbell,
  speed: Zap,
  accuracy: Target,
  putting: Flag,
  short_game: Flag,
  mental: Brain,
  phase: BookOpen,
  milestone: Trophy,
  seasonal: Sun,
};

/**
 * Tier styling classes - using semantic tokens from design system
 * Maps to bg-ak-tier-{tier}, border-ak-tier-{tier}-border, text-ak-tier-{tier}-text
 */
const TIER_CLASSES = {
  standard: {
    card: 'bg-ak-tier-standard border-ak-tier-standard-border',
    text: 'text-ak-tier-standard-text',
    icon: 'text-ak-tier-standard-text',
  },
  bronze: {
    card: 'bg-ak-tier-bronze border-ak-tier-bronze-border',
    text: 'text-ak-tier-bronze-text',
    icon: 'text-ak-tier-bronze-text',
  },
  silver: {
    card: 'bg-ak-tier-silver border-ak-tier-silver-border',
    text: 'text-ak-tier-silver-text',
    icon: 'text-ak-tier-silver-text',
  },
  gold: {
    card: 'bg-ak-tier-gold border-ak-tier-gold-border',
    text: 'text-ak-tier-gold-text',
    icon: 'text-ak-tier-gold-text',
  },
  platinum: {
    card: 'bg-ak-tier-platinum border-ak-tier-platinum-border',
    text: 'text-ak-tier-platinum-text',
    icon: 'text-ak-tier-platinum-text',
  },
};

/**
 * Locked badge styling
 */
const LOCKED_CLASSES = {
  card: 'bg-ak-surface-card border-ak-tier-locked-border',
  text: 'text-ak-text-primary',
  textSecondary: 'text-ak-text-tertiary',
  icon: 'text-ak-tier-locked-icon opacity-50',
};

/**
 * Category labels in Norwegian - matches BadgeCategory enum from backend
 */
const CATEGORY_LABELS = {
  volume: 'Volum',
  streak: 'Serie',
  strength: 'Styrke',
  speed: 'Hastighet',
  accuracy: 'Presisjon',
  putting: 'Putting',
  short_game: 'Kortspill',
  mental: 'Mental',
  phase: 'Periodisering',
  milestone: 'Milepæler',
  seasonal: 'Sesong',
};

/**
 * Category display order
 */
const CATEGORY_ORDER = [
  'volume',
  'streak',
  'strength',
  'speed',
  'accuracy',
  'putting',
  'short_game',
  'mental',
  'phase',
  'milestone',
  'seasonal',
];

/**
 * Get icon component for a badge
 */
const getIconForBadge = (badge) => {
  // First try to get icon from symbol
  if (badge.symbol && SYMBOL_TO_ICON[badge.symbol]) {
    return SYMBOL_TO_ICON[badge.symbol];
  }
  // Fall back to category default
  if (badge.category && CATEGORY_DEFAULT_ICONS[badge.category]) {
    return CATEGORY_DEFAULT_ICONS[badge.category];
  }
  // Ultimate fallback
  return Award;
};

/**
 * Individual badge card component
 */
const BadgeCard = ({ badge, isUnlocked, progress, onClick }) => {
  const Icon = getIconForBadge(badge);
  const tierClasses = TIER_CLASSES[badge.tier] || TIER_CLASSES.standard;

  // Get first requirement description for display
  const requirement = badge.requirements?.[0]?.description || badge.description || '';

  return (
    <div
      onClick={() => onClick?.({ ...badge, isUnlocked, progress })}
      className={clsx(
        'cursor-pointer rounded-xl p-5 flex flex-col items-center gap-2.5 border transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-ak-elevated',
        isUnlocked
          ? [tierClasses.card, 'shadow-ak-md']
          : [LOCKED_CLASSES.card, 'shadow-ak-xs'],
        badge.isAvailable === false && 'opacity-50'
      )}
    >
      {/* Icon container */}
      <div
        className={clsx(
          'w-13 h-13 rounded-full flex items-center justify-center',
          isUnlocked ? 'bg-white/25' : 'bg-ak-surface-subtle'
        )}
      >
        <Icon
          size={26}
          className={isUnlocked ? tierClasses.icon : LOCKED_CLASSES.icon}
        />
      </div>

      {/* Badge info */}
      <div className="text-center">
        <div
          className={clsx(
            'font-semibold text-sm mb-1',
            isUnlocked ? tierClasses.text : LOCKED_CLASSES.text
          )}
        >
          {badge.name}
        </div>
        <div
          className={clsx(
            'text-xs leading-relaxed',
            isUnlocked ? 'text-white/85' : LOCKED_CLASSES.textSecondary
          )}
        >
          {requirement}
        </div>
      </div>

      {/* Progress bar for locked badges */}
      {!isUnlocked && progress && progress.current > 0 && (
        <div className="w-full mt-1">
          <div className="h-1 bg-ak-component-progress-bg rounded-sm overflow-hidden">
            <div
              className="h-full bg-ak-status-info-light rounded-sm transition-all duration-300"
              style={{
                width: `${Math.min(100, (progress.current / (progress.target || 1)) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-ak-text-tertiary text-center mt-1">
            {progress.current} / {progress.target}
          </div>
        </div>
      )}

      {/* Tier badge for unlocked */}
      {isUnlocked && (
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/90 bg-black/15 px-3 py-1 rounded-xl">
          {badge.tier}
        </div>
      )}

      {/* XP indicator */}
      {badge.xp && (
        <div
          className={clsx(
            'text-[10px] font-medium',
            isUnlocked ? 'text-white/70' : 'text-ak-text-muted'
          )}
        >
          +{badge.xp} XP
        </div>
      )}

      {/* Seasonal/Limited indicator */}
      {badge.isLimited && (
        <div
          className={clsx(
            'text-[9px] font-semibold uppercase tracking-wide',
            isUnlocked ? 'text-white/70' : 'text-ak-status-warning-light'
          )}
        >
          Tidsbegrenset
        </div>
      )}
    </div>
  );
};

/**
 * BadgeGrid component
 *
 * @param {Object} props
 * @param {Array} props.badges - Badge definitions from API
 * @param {Object} props.userStats - User's badge progress { unlockedBadges: [], badgeProgress: {} }
 * @param {string} props.groupBy - Group badges by 'category' or 'tier'
 * @param {boolean} props.showFilters - Show category filter buttons
 * @param {Function} props.onBadgeClick - Callback when badge is clicked
 * @param {boolean} props.hideUnavailable - Hide badges that can't be achieved with current data
 */
export const BadgeGrid = ({
  badges = [],
  userStats = { unlockedBadges: [], badgeProgress: {} },
  groupBy = 'category',
  showFilters = true,
  onBadgeClick,
  hideUnavailable = false,
}) => {
  const [filter, setFilter] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Get unique categories from badges
  const categories = useMemo(() => {
    const cats = new Set();
    badges.forEach((badge) => cats.add(badge.category));
    // Sort by predefined order
    return CATEGORY_ORDER.filter((cat) => cats.has(cat));
  }, [badges]);

  // Filter badges
  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      // Filter by category
      if (filter !== 'all' && badge.category !== filter) return false;

      // Filter by unlocked status
      if (showUnlockedOnly && !userStats.unlockedBadges.includes(badge.id)) return false;

      // Filter unavailable badges
      if (hideUnavailable && badge.isAvailable === false) return false;

      return true;
    });
  }, [badges, filter, showUnlockedOnly, userStats.unlockedBadges, hideUnavailable]);

  // Group badges
  const groupedBadges = useMemo(() => {
    if (groupBy === 'category') {
      const groups = {};
      // Initialize groups in order
      CATEGORY_ORDER.forEach((cat) => {
        groups[cat] = [];
      });
      // Populate groups
      filteredBadges.forEach((badge) => {
        if (!groups[badge.category]) groups[badge.category] = [];
        groups[badge.category].push(badge);
      });
      // Remove empty groups
      Object.keys(groups).forEach((key) => {
        if (groups[key].length === 0) delete groups[key];
      });
      return groups;
    }
    if (groupBy === 'tier') {
      const tierOrder = ['standard', 'bronze', 'silver', 'gold', 'platinum'];
      const groups = {};
      tierOrder.forEach((tier) => {
        groups[tier] = [];
      });
      filteredBadges.forEach((badge) => {
        if (!groups[badge.tier]) groups[badge.tier] = [];
        groups[badge.tier].push(badge);
      });
      Object.keys(groups).forEach((key) => {
        if (groups[key].length === 0) delete groups[key];
      });
      return groups;
    }
    return { all: filteredBadges };
  }, [filteredBadges, groupBy]);

  // Tier labels for groupBy='tier'
  const tierLabels = {
    standard: 'Standard',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
  };

  return (
    <div className="p-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 mb-6 flex-wrap pb-5 border-b border-ak-neutral-divider items-center">
          <button
            onClick={() => setFilter('all')}
            style={{
              backgroundColor: filter === 'all' ? 'var(--accent)' : 'var(--background-white)',
              color: filter === 'all' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-footnote)',
              fontWeight: 500,
              border: filter === 'all' ? 'none' : '1px solid var(--border-default)',
              cursor: 'pointer',
            }}
          >
            Alle ({badges.length})
          </button>
          {categories.map((cat) => {
            const count = badges.filter((b) => b.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  backgroundColor: filter === cat ? 'var(--accent)' : 'var(--background-white)',
                  color: filter === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-footnote)',
                  fontWeight: 500,
                  border: filter === cat ? 'none' : '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
              >
                {CATEGORY_LABELS[cat] || cat} ({count})
              </button>
            );
          })}

          <label className="flex items-center gap-2 ml-auto cursor-pointer text-[13px] text-ak-text-tertiary">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Kun opptjent</span>
          </label>
        </div>
      )}

      {/* Badge groups */}
      {Object.entries(groupedBadges).map(([groupKey, groupBadges]) => (
        <div key={groupKey} className="mb-8">
          {groupBy !== 'none' && (
            <SubSectionTitle className="text-base font-semibold mb-4 text-ak-text-primary flex items-center gap-2">
              {groupBy === 'category' && CATEGORY_LABELS[groupKey]}
              {groupBy === 'tier' && tierLabels[groupKey]}
              {groupBy === 'none' && 'Alle merker'}
              <span className="text-xs font-normal text-ak-text-muted">
                ({groupBadges.length})
              </span>
            </SubSectionTitle>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {groupBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isUnlocked={userStats.unlockedBadges.includes(badge.id)}
                progress={userStats.badgeProgress[badge.id]}
                onClick={onBadgeClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {filteredBadges.length === 0 && (
        <div className="text-center p-12 text-ak-text-tertiary">
          Ingen merker funnet med valgte filter
        </div>
      )}
    </div>
  );
};

export default BadgeGrid;
