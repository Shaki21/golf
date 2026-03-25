/**
 * TIER Golf - Tournament Hierarchy Configuration
 *
 * This file defines the mapping rules for recommending player categories
 * based on tournament tour type and other criteria.
 *
 * IMPORTANT: This is the single source of truth for hierarchy mapping.
 * Update this file when hierarchy rules change.
 *
 * Rule Priority:
 * 1. Exact tour match (highest priority)
 * 2. Secondary attributes (age group, level)
 * 3. Fallback = "udefinert"
 */

import {
  TourType,
  PlayerCategory,
  RecommendationConfidence,
  Tournament,
  TournamentPurpose,
  CompetitionLevel,
} from './types';

// ============================================================================
// HIERARCHY MAPPING RULES
// ============================================================================

/**
 * Mapping rule for a tour type to player category
 */
interface HierarchyRule {
  tour: TourType;
  primaryCategory: PlayerCategory;
  adjacentCategories?: PlayerCategory[];  // Also suitable for these categories
  minHandicap?: number;
  maxHandicap?: number;
  minAge?: number;
  maxAge?: number;
  description: string;
  confidence: RecommendationConfidence;
  // Hierarchy document fields
  defaultPurpose: TournamentPurpose;      // RESULTAT, UTVIKLING, TRENING
  competitionLevel: CompetitionLevel;     // Internasjonal, Nasjonal, Regional, etc.
}

/**
 * Tour-to-category mapping rules
 * Ordered by prestige/level (highest first)
 */
export const HIERARCHY_RULES: HierarchyRule[] = [
  // Elite / Professional Level Tours
  {
    tour: 'pga_tour',
    primaryCategory: 'A',
    description: 'PGA Tour - Verdens beste spillere',
    confidence: 'high',
    defaultPurpose: 'RESULTAT',
    competitionLevel: 'internasjonal',
  },
  {
    tour: 'dp_world_tour',
    primaryCategory: 'A',
    description: 'DP World Tour - Europatouren',
    confidence: 'high',
    defaultPurpose: 'RESULTAT',
    competitionLevel: 'internasjonal',
  },
  {
    tour: 'challenge_tour',
    primaryCategory: 'A',
    adjacentCategories: ['B'],
    description: 'Challenge Tour - Kvalifisering til DP World Tour',
    confidence: 'high',
    defaultPurpose: 'RESULTAT',
    competitionLevel: 'internasjonal',
  },

  // Advanced / Semi-professional Level
  {
    tour: 'wagr_turnering',
    primaryCategory: 'A',
    adjacentCategories: ['B'],
    description: 'WAGR-turneringer - Verdensranking for amatører',
    confidence: 'high',
    defaultPurpose: 'RESULTAT',
    competitionLevel: 'internasjonal',
  },
  {
    tour: 'ega_turnering',
    primaryCategory: 'B',
    adjacentCategories: ['A', 'C'],
    description: 'EGA-turneringer - European Golf Association',
    confidence: 'high',
    defaultPurpose: 'RESULTAT',
    competitionLevel: 'internasjonal',
  },
  {
    tour: 'nordic_league',
    primaryCategory: 'B',
    adjacentCategories: ['A', 'C'],
    description: 'Nordic League - Nordisk eliteserie',
    confidence: 'high',
    defaultPurpose: 'RESULTAT',
    competitionLevel: 'internasjonal',
  },
  {
    tour: 'college_turneringer',
    primaryCategory: 'B',
    adjacentCategories: ['A', 'C'],
    description: 'College-turneringer - Amerikanske universiteter',
    confidence: 'medium',
    defaultPurpose: 'UTVIKLING',
    competitionLevel: 'internasjonal',
  },

  // Intermediate / Competitive Amateur Level
  {
    tour: 'garmin_norges_cup',
    primaryCategory: 'C',
    adjacentCategories: ['B', 'D'],
    description: 'Garmin Norges Cup - Nasjonal konkurranseserie',
    confidence: 'high',
    defaultPurpose: 'UTVIKLING',
    competitionLevel: 'nasjonal',
  },
  {
    tour: 'srixon_tour',
    primaryCategory: 'C',
    adjacentCategories: ['B', 'D'],
    description: 'Srixon Tour - Nasjonal konkurranseserie',
    confidence: 'high',
    defaultPurpose: 'UTVIKLING',
    competitionLevel: 'nasjonal',
  },
  {
    tour: 'global_junior_tour',
    primaryCategory: 'C',
    adjacentCategories: ['B', 'D'],
    minAge: 12,
    maxAge: 21,
    description: 'Global Junior Tour - Internasjonal juniorserie',
    confidence: 'high',
    defaultPurpose: 'UTVIKLING',
    competitionLevel: 'internasjonal',
  },

  // Developing / Club Level
  {
    tour: 'junior_tour_regional',
    primaryCategory: 'D',
    adjacentCategories: ['C', 'E'],
    minAge: 8,
    maxAge: 18,
    description: 'Junior Tour Regional - Regional juniorserie',
    confidence: 'high',
    defaultPurpose: 'UTVIKLING',
    competitionLevel: 'regional',
  },
  {
    tour: 'club',
    primaryCategory: 'D',
    adjacentCategories: ['C', 'E'],
    description: 'Klubbturnering - Lokale klubbturneringer',
    confidence: 'medium',
    defaultPurpose: 'TRENING',
    competitionLevel: 'klubb',
  },

  // Entry Level
  {
    tour: 'academy',
    primaryCategory: 'E',
    adjacentCategories: ['D'],
    description: 'Akademiturnering - TIER Golf interne turneringer',
    confidence: 'high',
    defaultPurpose: 'TRENING',
    competitionLevel: 'trenings_turnering',
  },
];

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Find the hierarchy rule for a given tour type
 */
export function findHierarchyRule(tour: TourType): HierarchyRule | undefined {
  return HIERARCHY_RULES.find(rule => rule.tour === tour);
}

/**
 * Get recommended category for a tournament
 * Returns the mapping result with confidence level
 */
export function getRecommendedCategory(tournament: {
  tour: TourType;
  name?: string;
}): {
  category: PlayerCategory;
  label: string;
  confidence: RecommendationConfidence;
} {
  const rule = findHierarchyRule(tournament.tour);

  if (!rule) {
    return {
      category: 'udefinert',
      label: 'Kategori ikke definert',
      confidence: 'low',
    };
  }

  return {
    category: rule.primaryCategory,
    label: getCategoryLevelLabel(rule.primaryCategory, rule.description),
    confidence: rule.confidence,
  };
}

/**
 * Get human-readable level label for a category
 */
export function getCategoryLevelLabel(
  category: PlayerCategory,
  tourDescription?: string
): string {
  const baseLabels: Record<PlayerCategory, string> = {
    A: 'Elite / Profesjonell',
    B: 'Avansert',
    C: 'Viderekommende',
    D: 'Utviklende',
    E: 'Nybegynner',
    udefinert: 'Ikke definert',
  };

  if (tourDescription) {
    return `${baseLabels[category]} - ${tourDescription}`;
  }

  return baseLabels[category];
}

/**
 * Check if a tournament is recommended for a player category
 * Returns true if the tournament's category matches the player's category
 * or is an adjacent category
 */
export function isTournamentRecommendedForPlayer(
  tournament: { recommendedCategory: PlayerCategory },
  playerCategory: PlayerCategory
): boolean {
  if (tournament.recommendedCategory === playerCategory) {
    return true;
  }

  // Find the rule to check adjacent categories
  const categoryIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(
    tournament.recommendedCategory as string
  );
  const playerIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(
    playerCategory as string
  );

  // Allow +/- 1 category level as adjacent
  return Math.abs(categoryIndex - playerIndex) <= 1;
}

/**
 * Get tour prestige score (for sorting)
 * Higher score = more prestigious
 */
export function getTourPrestigeScore(tour: TourType): number {
  const prestigeMap: Record<TourType, number> = {
    pga_tour: 100,
    dp_world_tour: 95,
    challenge_tour: 85,
    wagr_turnering: 80,
    ega_turnering: 75,
    nordic_league: 70,
    college_turneringer: 65,
    global_junior_tour: 60,
    garmin_norges_cup: 55,
    srixon_tour: 50,
    junior_tour_regional: 40,
    club: 30,
    academy: 20,
  };

  return prestigeMap[tour] ?? 0;
}

/**
 * Get tournament purpose and level from tour type
 */
export function getTournamentPurposeAndLevel(tour: TourType): {
  purpose: TournamentPurpose;
  level: CompetitionLevel;
} {
  const rule = findHierarchyRule(tour);

  if (!rule) {
    return {
      purpose: 'TRENING',
      level: 'klubb',
    };
  }

  return {
    purpose: rule.defaultPurpose,
    level: rule.competitionLevel,
  };
}

/**
 * Apply hierarchy mapping to a tournament
 * Adds recommendedCategory, recommendedLevelLabel, confidence, purpose, and level
 */
export function applyHierarchyMapping(
  tournament: Omit<
    Tournament,
    'recommendedCategory' | 'recommendedLevelLabel' | 'recommendationConfidence'
  >
): Tournament {
  const recommendation = getRecommendedCategory(tournament);
  const purposeAndLevel = getTournamentPurposeAndLevel(tournament.tour);

  return {
    ...tournament,
    recommendedCategory: recommendation.category,
    recommendedLevelLabel: recommendation.label,
    recommendationConfidence: recommendation.confidence,
    // Only set purpose/level if not already defined
    purpose: tournament.purpose ?? purposeAndLevel.purpose,
    level: tournament.level ?? purposeAndLevel.level,
  } as Tournament;
}

// ============================================================================
// CATEGORY BADGE CONFIGURATION
// ============================================================================

/**
 * Badge configuration for displaying categories
 * Uses semantic tokens only (no gold for non-achievements)
 */
export interface CategoryBadgeConfig {
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export function getCategoryBadgeConfig(
  category: PlayerCategory,
  isRecommendedForPlayer: boolean = false
): CategoryBadgeConfig {
  if (category === 'udefinert') {
    return {
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-600',
      borderClass: 'border-gray-300',
    };
  }

  if (isRecommendedForPlayer) {
    // Highlighted for recommended tournaments
    return {
      bgClass: 'bg-calendar-event-recommended-bg',
      textClass: 'text-text-brand',
      borderClass: 'border-border-brand',
    };
  }

  // Default neutral styling
  return {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
  };
}
