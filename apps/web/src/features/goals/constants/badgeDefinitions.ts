/**
 * Badge Definitions for Goals
 *
 * Defines achievement badges that users can unlock through goal completion
 * and consistent progress tracking.
 */

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  /** Condition check function (receives user goal data) */
  condition?: (data: any) => boolean;
}

/**
 * All available badge definitions
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Common Badges
  {
    id: 'first_goal',
    name: 'Første Mål',
    description: 'Fullført ditt første mål',
    icon: '🎯',
    rarity: 'common',
  },
  {
    id: 'early_bird',
    name: 'Tidlig Ute',
    description: 'Fullført et mål før deadline',
    icon: '🌅',
    rarity: 'common',
  },
  {
    id: 'three_day_streak',
    name: '3-dagers Streek',
    description: 'Oppdatert fremgang 3 dager på rad',
    icon: '🔥',
    rarity: 'common',
  },

  // Rare Badges
  {
    id: 'five_goals',
    name: 'Målbevisst',
    description: 'Fullført 5 mål',
    icon: '🏆',
    rarity: 'rare',
  },
  {
    id: 'week_streak',
    name: '7-dagers Streek',
    description: 'Oppdatert fremgang 7 dager på rad',
    icon: '⭐',
    rarity: 'rare',
  },
  {
    id: 'speed_demon',
    name: 'Lynrask',
    description: 'Fullført et mål på halve tiden',
    icon: '⚡',
    rarity: 'rare',
  },
  {
    id: 'comeback_kid',
    name: 'Comeback',
    description: 'Fullført mål etter å ha ligget bak skjema',
    icon: '💪',
    rarity: 'rare',
  },

  // Epic Badges
  {
    id: 'perfect_week',
    name: 'Perfekt Uke',
    description: 'Alle ukentlige mål oppnådd',
    icon: '🌟',
    rarity: 'epic',
  },
  {
    id: 'category_master',
    name: 'Kategori Mester',
    description: 'Fullført alle mål i én kategori',
    icon: '👑',
    rarity: 'epic',
  },
  {
    id: 'ten_goals',
    name: 'Ambisiøs',
    description: 'Fullført 10 mål',
    icon: '🎖️',
    rarity: 'epic',
  },
  {
    id: 'month_streak',
    name: '30-dagers Streek',
    description: 'Oppdatert fremgang 30 dager på rad',
    icon: '🔥',
    rarity: 'epic',
  },

  // Legendary Badges
  {
    id: 'perfect_season',
    name: 'Perfekt Sesong',
    description: 'Alle sesongmål fullført',
    icon: '🏅',
    rarity: 'legendary',
  },
  {
    id: 'grand_master',
    name: 'Stormester',
    description: 'Fullført 25 mål',
    icon: '💎',
    rarity: 'legendary',
  },
  {
    id: 'year_streak',
    name: '365-dagers Streek',
    description: 'Oppdatert fremgang 365 dager på rad',
    icon: '🌈',
    rarity: 'legendary',
  },
  {
    id: 'all_categories',
    name: 'Allsidig',
    description: 'Fullført mål i alle kategorier',
    icon: '🎨',
    rarity: 'legendary',
  },
];

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((badge) => badge.id === badgeId);
}

/**
 * Get badges by rarity
 */
export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((badge) => badge.rarity === rarity);
}

/**
 * Get color scheme for badge rarity
 */
export function getRarityColor(rarity: BadgeRarity): {
  bg: string;
  border: string;
  text: string;
} {
  const colors = {
    common: {
      bg: 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20',
      border: 'border-gray-300 dark:border-gray-600',
      text: 'text-gray-700 dark:text-gray-300',
    },
    rare: {
      bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      border: 'border-blue-300 dark:border-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
    },
    epic: {
      bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      border: 'border-purple-300 dark:border-purple-600',
      text: 'text-purple-700 dark:text-purple-300',
    },
    legendary: {
      bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      border: 'border-amber-400 dark:border-amber-600',
      text: 'text-amber-700 dark:text-amber-300',
    },
  };

  return colors[rarity];
}
