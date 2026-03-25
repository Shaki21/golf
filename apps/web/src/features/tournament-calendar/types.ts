/**
 * TIER Golf - Tournament Calendar Types
 *
 * Type definitions for the tournament calendar feature.
 * Follows the spec requirements for tournament ingestion,
 * hierarchy mapping, and filtering.
 */

// ============================================================================
// QUICK FILTER TYPES
// ============================================================================

/**
 * Quick filter tab options
 */
export type QuickFilter = 'alle' | 'mine' | 'junior' | 'elite' | 'open';

export const QUICK_FILTER_LABELS: Record<QuickFilter, string> = {
  alle: 'All',
  mine: 'My tournaments',
  junior: 'Junior',
  elite: 'Elite',
  open: 'Open',
};

// Legacy alias for backward compatibility
export type TournamentTab = QuickFilter;

// ============================================================================
// TOUR/SERIES TYPES
// ============================================================================

/**
 * Tournament series/tour types
 */
export type TournamentSeries =
  | 'junior_tour_regional'
  | 'srixon_tour'
  | 'garmin_norges_cup'
  | 'global_junior_tour'
  | 'nordic_league'
  | 'ega_turnering'
  | 'wagr_turnering'
  | 'college_turneringer'
  | 'challenge_tour'
  | 'dp_world_tour'
  | 'pga_tour'
  | 'club'
  | 'academy';

// Legacy alias
export type TourType = TournamentSeries;

export const SERIES_LABELS: Record<TournamentSeries, string> = {
  junior_tour_regional: 'Junior Tour Regional',
  srixon_tour: 'Srixon Tour',
  garmin_norges_cup: 'Garmin Norges Cup',
  global_junior_tour: 'Global Junior Tour',
  nordic_league: 'Nordic League',
  ega_turnering: 'EGA Tournament',
  wagr_turnering: 'WAGR Tournament',
  college_turneringer: 'College Tournaments',
  challenge_tour: 'Challenge Tour',
  dp_world_tour: 'DP World Tour',
  pga_tour: 'PGA Tour',
  club: 'Club Tournament',
  academy: 'Academy Tournament',
};

// Legacy alias
export const TOUR_LABELS = SERIES_LABELS;

// ============================================================================
// STATUS TYPES
// ============================================================================

/**
 * Tournament status - simplified
 */
export type TournamentStatus = 'open' | 'upcoming' | 'full' | 'ongoing' | 'finished';

export const STATUS_LABELS: Record<TournamentStatus, string> = {
  open: 'Open for registration',
  upcoming: 'Coming soon',
  full: 'Full',
  ongoing: 'Ongoing',
  finished: 'Finished',
};

// Legacy aliases for backward compatibility
export const STATUS_LABELS_LEGACY: Record<string, string> = {
  registration_open: 'Open for registration',
  registration_closed: 'Registration closed',
  registered: 'Registered',
  in_progress: 'In progress',
  completed: 'Completed',
  ...STATUS_LABELS,
};

// ============================================================================
// CATEGORY TYPES (Player Categories / Hierarchy)
// ============================================================================

/**
 * Player categories based on hierarchy document
 * Determines recommended tournament level
 */
export type PlayerCategory =
  | 'A'  // Elite / Professional level
  | 'B'  // Advanced / Semi-professional
  | 'C'  // Intermediate / Competitive amateur
  | 'D'  // Developing / Club level
  | 'E'  // Beginner / Entry level
  | 'udefinert'; // Unknown/undefined

export const CATEGORY_LABELS: Record<PlayerCategory, string> = {
  A: 'Category A',
  B: 'Category B',
  C: 'Category C',
  D: 'Category D',
  E: 'Category E',
  udefinert: 'Undefined',
};

export const CATEGORY_DESCRIPTIONS: Record<PlayerCategory, string> = {
  A: 'Elite / Professional level',
  B: 'Advanced / Semi-professional',
  C: 'Intermediate / Competitive amateur',
  D: 'Developing / Club level',
  E: 'Beginner / Entry level',
  udefinert: 'Category not defined',
};

// ============================================================================
// TOURNAMENT PURPOSE (from hierarchy document Section 10)
// ============================================================================

/**
 * Tournament purpose categories from hierarchy document
 * Determines how the player should approach the tournament
 */
export type TournamentPurpose =
  | 'RESULTAT'   // High priority - results matter, full performance mode
  | 'UTVIKLING'  // Medium priority - gain experience, test skills
  | 'TRENING';   // Low priority - practice under competition conditions

export const PURPOSE_LABELS: Record<TournamentPurpose, string> = {
  RESULTAT: 'Result',
  UTVIKLING: 'Development',
  TRENING: 'Training',
};

export const PURPOSE_DESCRIPTIONS: Record<TournamentPurpose, string> = {
  RESULTAT: 'Full performance mode - result is most important',
  UTVIKLING: 'Test skills - build competitive experience',
  TRENING: 'Practice under tournament pressure - experiment',
};

// ============================================================================
// COMPETITION LEVEL (from hierarchy document - Nivå)
// ============================================================================

/**
 * Competition level/scope
 * Determines the geographic scope and prestige of the tournament
 */
export type CompetitionLevel =
  | 'internasjonal'
  | 'nasjonal'
  | 'regional'
  | 'klubb'
  | 'junior'
  | 'trenings_turnering';

export const LEVEL_LABELS: Record<CompetitionLevel, string> = {
  internasjonal: 'International',
  nasjonal: 'National',
  regional: 'Regional',
  klubb: 'Club',
  junior: 'Junior',
  trenings_turnering: 'Training tournament',
};

// ============================================================================
// JUNIOR TOUR REGIONS (Appendix 2 - Norwegian Golf Federation)
// ============================================================================

/**
 * Junior Tour regions - Norwegian character version
 */
export type JuniorRegion =
  | 'østlandet-øst'
  | 'østlandet-vest'
  | 'sørlandet'
  | 'vestlandet'
  | 'midt-norge'
  | 'nord-norge';

// Legacy alias
export type JuniorTourRegion = JuniorRegion;

export const JUNIOR_REGION_LABELS: Record<JuniorRegion, string> = {
  'østlandet-øst': 'Østlandet Øst',
  'østlandet-vest': 'Østlandet Vest',
  'sørlandet': 'Sørlandet',
  'vestlandet': 'Vestlandet',
  'midt-norge': 'Midt-Norge',
  'nord-norge': 'Nord-Norge',
};

// Legacy alias
export const JUNIOR_TOUR_REGION_LABELS = JUNIOR_REGION_LABELS as Record<string, string>;

export const JUNIOR_REGION_DESCRIPTIONS: Record<JuniorRegion, string> = {
  'østlandet-øst': 'Østfold, Follo, Romerike Øst',
  'østlandet-vest': 'Oslo, Buskerud, Vestfold, Asker/Bærum',
  'sørlandet': 'Aust-Agder, Vest-Agder',
  'vestlandet': 'Rogaland, Hordaland, Sogn og Fjordane',
  'midt-norge': 'Sør-Trøndelag, Nord-Trøndelag',
  'nord-norge': 'Nordland, Troms, Finnmark',
};

// Legacy alias
export const JUNIOR_TOUR_REGION_DESCRIPTIONS = JUNIOR_REGION_DESCRIPTIONS as Record<string, string>;

/**
 * Map counties/cities to Junior Tour regions
 * Used for automatic region assignment based on tournament location
 */
export const CITY_TO_JUNIOR_REGION: Record<string, JuniorRegion> = {
  // Østlandet Øst
  'Fredrikstad': 'østlandet-øst',
  'Sarpsborg': 'østlandet-øst',
  'Halden': 'østlandet-øst',
  'Moss': 'østlandet-øst',
  'Askim': 'østlandet-øst',
  'Ski': 'østlandet-øst',
  'Drøbak': 'østlandet-øst',
  'Lillestrøm': 'østlandet-øst',
  'Jessheim': 'østlandet-øst',
  'Lørenskog': 'østlandet-øst',

  // Østlandet Vest
  'Oslo': 'østlandet-vest',
  'Drammen': 'østlandet-vest',
  'Kongsberg': 'østlandet-vest',
  'Hønefoss': 'østlandet-vest',
  'Tønsberg': 'østlandet-vest',
  'Sandefjord': 'østlandet-vest',
  'Larvik': 'østlandet-vest',
  'Horten': 'østlandet-vest',
  'Asker': 'østlandet-vest',
  'Sandvika': 'østlandet-vest',
  'Kløfta': 'østlandet-vest',

  // Sørlandet
  'Kristiansand': 'sørlandet',
  'Arendal': 'sørlandet',
  'Grimstad': 'sørlandet',
  'Mandal': 'sørlandet',
  'Flekkefjord': 'sørlandet',

  // Vestlandet
  'Stavanger': 'vestlandet',
  'Bergen': 'vestlandet',
  'Haugesund': 'vestlandet',
  'Ålesund': 'vestlandet',
  'Florø': 'vestlandet',

  // Midt-Norge
  'Trondheim': 'midt-norge',
  'Steinkjer': 'midt-norge',
  'Levanger': 'midt-norge',
  'Namsos': 'midt-norge',

  // Nord-Norge
  'Bodø': 'nord-norge',
  'Tromsø': 'nord-norge',
  'Narvik': 'nord-norge',
  'Alta': 'nord-norge',
  'Hammerfest': 'nord-norge',
};

// ============================================================================
// COUNTRY TYPES
// ============================================================================

/**
 * Country labels for filtering
 * ISO 3166-1 alpha-2 codes
 */
export const COUNTRY_LABELS: Record<string, string> = {
  NO: 'Norge',
  SE: 'Sverige',
  DK: 'Danmark',
  FI: 'Finland',
  GB: 'Storbritannia',
  IE: 'Irland',
  US: 'USA',
  ES: 'Spania',
  PT: 'Portugal',
  FR: 'Frankrike',
  DE: 'Tyskland',
  IT: 'Italia',
  NL: 'Nederland',
  BE: 'Belgia',
  CH: 'Sveits',
  AT: 'Østerrike',
  CZ: 'Tsjekkia',
  SK: 'Slovakia',
  ZA: 'Sør-Afrika',
  AE: 'De forente arabiske emirater',
  QA: 'Qatar',
  BH: 'Bahrain',
  CN: 'Kina',
  JP: 'Japan',
  KE: 'Kenya',
};

/**
 * Country groups for quick filtering
 */
export const COUNTRY_GROUPS: Record<string, string[]> = {
  nordic: ['NO', 'SE', 'DK', 'FI'],
  europe: ['NO', 'SE', 'DK', 'FI', 'GB', 'IE', 'ES', 'PT', 'FR', 'DE', 'IT', 'NL', 'BE', 'CH', 'AT', 'CZ', 'SK'],
  worldwide: ['US', 'ZA', 'AE', 'QA', 'BH', 'CN', 'JP', 'KE'],
};

/**
 * Confidence level for category recommendation
 */
export type RecommendationConfidence = 'high' | 'medium' | 'low';

// ============================================================================
// TOURNAMENT INTERFACE
// ============================================================================

/**
 * Result data for completed tournaments
 */
export interface TournamentResult {
  position: number;
  score: number;
  scoreToPar?: number;
  field: number;  // Total participants
  rounds?: number[];
}

/**
 * Main Tournament interface
 * Normalized format for all tournament data regardless of source
 */
export interface Tournament {
  // Identity
  id: string;
  name: string;

  // Dates
  startDate: string;  // ISO date string YYYY-MM-DD
  endDate: string;    // ISO date string YYYY-MM-DD
  registrationDeadline?: string;

  // Location
  venue: string;      // Course name
  city: string;
  region?: string;
  country: string;    // ISO country code

  // Tour/Source
  tour: TourType;

  // Hierarchy classification (from hierarchy document)
  purpose?: TournamentPurpose;  // RESULTAT, UTVIKLING, TRENING
  level?: CompetitionLevel;     // Internasjonal, Nasjonal, Regional, etc.

  // Junior Tour region (for regional filtering)
  juniorTourRegion?: JuniorTourRegion;

  // Status
  status: TournamentStatus;

  // Participation
  maxParticipants?: number;
  currentParticipants?: number;

  // Fees & Links
  entryFee?: number;  // In NOK
  registrationUrl?: string;
  hotelUrl?: string;
  resultsUrl?: string;

  // Format
  format?: string;    // e.g., "54 hull slagspill"
  description?: string;

  // Player-specific
  isRegistered?: boolean;
  result?: TournamentResult;

  // Hierarchy mapping (derived)
  recommendedCategory: PlayerCategory;
  recommendedLevelLabel: string;
  recommendationConfidence: RecommendationConfidence;

  // Metadata
  source?: string;    // API source identifier
  lastUpdated?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Date range filter options
 */
export type DateRangePreset =
  | 'next_30_days'
  | 'next_90_days'
  | 'this_season'
  | 'custom';

/**
 * Tournament list filters
 */
export interface TournamentFilters {
  // Category filter
  recommendedCategories?: PlayerCategory[];
  showRecommendedForMe?: boolean;

  // Tour filter
  tours?: TourType[];

  // Hierarchy filters (from hierarchy document)
  purposes?: TournamentPurpose[];   // RESULTAT, UTVIKLING, TRENING
  levels?: CompetitionLevel[];      // Internasjonal, Nasjonal, Regional, etc.

  // Junior Tour Region filter (Appendix 2)
  juniorTourRegions?: JuniorTourRegion[];

  // Status filter
  statuses?: TournamentStatus[];

  // Date filter
  dateRange?: DateRangePreset;
  customDateStart?: string;
  customDateEnd?: string;

  // Location filter
  countries?: string[];
  regions?: string[];

  // Search
  searchQuery?: string;
}

/**
 * Sort options for tournament list
 */
export type TournamentSortKey =
  | 'date'
  | 'recommended_fit'
  | 'prestige'
  | 'distance';

export interface TournamentSort {
  key: TournamentSortKey;
  direction: 'asc' | 'desc';
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Parameters for fetching tournaments
 */
export interface FetchTournamentsParams {
  startDate?: string;
  endDate?: string;
  filters?: TournamentFilters;
  sort?: TournamentSort;
  page?: number;
  limit?: number;
}

/**
 * Response from tournament fetch
 */
export interface TournamentsResponse {
  tournaments: Tournament[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

/**
 * Tournament statistics for header display
 */
export interface TournamentStats {
  upcoming: number;
  registered: number;
  podiums: number;      // Top 3 finishes this year
  playedThisYear: number;
}
