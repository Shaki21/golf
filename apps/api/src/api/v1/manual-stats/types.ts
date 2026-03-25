/**
 * Manual Stats Module - Type Definitions
 *
 * Types for the manual stat tracking, AI extraction, and SG calculation system.
 */

// ============================================================================
// ENUMS (Mirror Prisma enums for use in TypeScript)
// ============================================================================

export enum LieCategory {
  TEE = 'TEE',
  FAIRWAY = 'FAIRWAY',
  ROUGH = 'ROUGH',
  BUNKER = 'BUNKER',
  RECOVERY = 'RECOVERY',
  GREEN = 'GREEN',
  PENALTY = 'PENALTY',
  OTHER = 'OTHER',
}

export enum ShotCategory {
  TEE = 'TEE',
  APPROACH = 'APPROACH',
  SHORT_GAME = 'SHORT_GAME',
  PUTTING = 'PUTTING',
}

export enum DistanceType {
  TOTAL = 'TOTAL',
  CARRY = 'CARRY',
}

export enum ExtractionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
}

export enum RoundStatus {
  DRAFT = 'DRAFT',
  PENDING_EXTRACTION = 'PENDING_EXTRACTION',
  PENDING_REVIEW = 'PENDING_REVIEW',
  FINALIZED = 'FINALIZED',
  ARCHIVED = 'ARCHIVED',
}

// ============================================================================
// AI EXTRACTION - JSON Schema Types
// ============================================================================

/**
 * Tee shot data from AI extraction
 */
export interface ExtractionTeeShot {
  club: string;
  distance_m: number;
  distance_type: DistanceType;
  confidence: number;
}

/**
 * Approach shot data from AI extraction
 */
export interface ExtractionApproachShot {
  start_distance_m: number;
  lie: LieCategory;
  club: string;
  end?: {
    distance_to_hole_m: number;
    lie: LieCategory;
  };
  confidence: number;
}

/**
 * Short game shot data from AI extraction
 */
export interface ExtractionShortGameShot {
  start_distance_m: number;
  lie: LieCategory;
  club?: string;
  end_distance_m?: number;
  confidence: number;
}

/**
 * Putting data from AI extraction
 */
export interface ExtractionPuttingData {
  first_putt_m: number;
  putts: number;
  confidence: number;
}

/**
 * Single hole data from AI extraction
 */
export interface ExtractionHoleData {
  hole_number: number;
  hole_length_m?: number;
  hole_par?: number;
  hole_score?: number;
  tee?: ExtractionTeeShot;
  approach?: ExtractionApproachShot;
  short_game?: ExtractionShortGameShot;
  putting?: ExtractionPuttingData;
  notes?: string;
  overall_confidence: number;
  requires_review: boolean;
  review_fields: string[];
}

/**
 * Complete AI extraction output
 */
export interface AIExtractionOutput {
  round_date?: string;
  course?: string;
  holes: ExtractionHoleData[];
  notes?: string;
  overall_confidence: number;
  extraction_timestamp: string;
  model_version: string;
  prompt_version: string;
}

// ============================================================================
// SHOT EVENT - Normalized shot data for SG calculation
// ============================================================================

/**
 * A single shot event with start and end state
 */
export interface ShotEventData {
  holeNumber: number;
  shotNumber: number;
  startDistanceM: number;
  startLie: LieCategory;
  endDistanceM: number | null;
  endLie: LieCategory | null;
  isHoled: boolean;
  club?: string;
  distanceType?: DistanceType;
  shotCategory: ShotCategory;
  isEstimated: boolean;
  dataSource: 'manual' | 'ai' | 'mixed';
  confidence?: number;
}

/**
 * Hole data in normalized format
 */
export interface NormalizedHoleData {
  holeNumber: number;
  holeLengthM?: number;
  holePar?: number;
  holeScore?: number;
  shots: ShotEventData[];
  isComplete: boolean;
  sgComputable: boolean;
}

// ============================================================================
// SG CALCULATION - Strokes Gained types
// ============================================================================

/**
 * Expected strokes lookup result
 */
export interface ExpectedStrokesLookup {
  lieCategory: LieCategory;
  distanceM: number;
  expectedStrokes: number;
  distanceBucket: string;
  baselineVersion: string;
}

/**
 * SG result for a single shot
 */
export interface SGShotResultData {
  shotId: string;
  expectedStrokesStart: number;
  expectedStrokesEnd: number;
  strokesGained: number;
  shotCategory: ShotCategory;
  baselineVersion: string;
}

/**
 * Aggregated SG for a round
 */
export interface SGRoundResultData {
  roundId: string;
  sgTee: number | null;
  sgApproach: number | null;
  sgShortGame: number | null;
  sgPutting: number | null;
  sgTotal: number | null;
  shotCountTee: number;
  shotCountApproach: number;
  shotCountShortGame: number;
  shotCountPutting: number;
  holesWithSG: number;
  totalHoles: number;
  coveragePercent: number;
  baselineVersion: string;
}

// ============================================================================
// API - Request/Response types
// ============================================================================

/**
 * Create round request
 */
export interface CreateRoundRequest {
  playerId: string;
  roundDate: string;
  courseName?: string;
  courseId?: string;
  teeBox?: string;
  totalPar?: number;
  holesPlayed?: number;
}

/**
 * Upload image response
 */
export interface UploadImageResponse {
  imageId: string;
  uploadUrl: string;
  thumbnailUrl?: string;
}

/**
 * Extraction status response
 */
export interface ExtractionStatusResponse {
  roundId: string;
  status: ExtractionStatus;
  images: Array<{
    imageId: string;
    status: ExtractionStatus;
    overallConfidence?: number;
    fieldsRequiringReview: number;
    errorMessage?: string;
  }>;
  holes: ExtractionHoleData[];
  overallConfidence: number;
  fieldsRequiringReview: number;
}

/**
 * User correction request
 */
export interface UserCorrectionRequest {
  holeNumber: number;
  field: string;
  value: unknown;
  reason?: string;
}

/**
 * Finalize round response
 */
export interface FinalizeRoundResponse {
  roundId: string;
  status: RoundStatus;
  dataQuality: number;
  sgComputable: boolean;
  sgResult?: SGRoundResultData;
}

/**
 * Manual hole entry request
 */
export interface ManualHoleEntryRequest {
  holeNumber: number;
  holeLengthM?: number;
  holePar?: number;
  holeScore?: number;
  tee?: {
    club: string;
    distanceM: number;
    distanceType?: DistanceType;
  };
  approach?: {
    startDistanceM: number;
    lie: LieCategory;
    club?: string;
    endDistanceM?: number;
    endLie?: LieCategory;
  };
  shortGame?: {
    startDistanceM: number;
    lie: LieCategory;
    club?: string;
    endDistanceM?: number;
  };
  putting?: {
    firstPuttM: number;
    puttsCount: number;
  };
}

/**
 * Player SG trends response
 */
export interface PlayerSGTrendsResponse {
  playerId: string;
  period: string;
  rounds: Array<{
    roundId: string;
    roundDate: string;
    courseName?: string;
    sgTee: number | null;
    sgApproach: number | null;
    sgShortGame: number | null;
    sgPutting: number | null;
    sgTotal: number | null;
    coveragePercent: number;
  }>;
  averages: {
    sgTee: number | null;
    sgApproach: number | null;
    sgShortGame: number | null;
    sgPutting: number | null;
    sgTotal: number | null;
  };
  trends: {
    sgTee: 'up' | 'down' | 'stable';
    sgApproach: 'up' | 'down' | 'stable';
    sgShortGame: 'up' | 'down' | 'stable';
    sgPutting: 'up' | 'down' | 'stable';
    sgTotal: 'up' | 'down' | 'stable';
  };
}

/**
 * Club stats response
 */
export interface ClubStatsResponse {
  club: string;
  shotCount: number;
  avgDistanceM: number;
  avgSG: number | null;
  dispersion: {
    avgOfflineM: number | null;
    maxLeftM: number | null;
    maxRightM: number | null;
  };
  lieBreakdown: Record<LieCategory, number>;
}

// ============================================================================
// SG CATEGORY RULES - Configurable categorization
// ============================================================================

export interface SGCategoryRules {
  SHORT_GAME_MAX_DISTANCE_M: number;
  TEE_SHOT_NUMBER: number;
  PUTTING_START_LIE: LieCategory[];
}

export const DEFAULT_SG_CATEGORY_RULES: SGCategoryRules = {
  SHORT_GAME_MAX_DISTANCE_M: 50,
  TEE_SHOT_NUMBER: 1,
  PUTTING_START_LIE: [LieCategory.GREEN],
};

// ============================================================================
// DISTANCE BUCKETS - For expected strokes lookup
// ============================================================================

export interface DistanceBucket {
  min: number;
  max: number;
  label: string;
}

export const DISTANCE_BUCKETS: DistanceBucket[] = [
  { min: 0, max: 3, label: '0-3m' },
  { min: 3, max: 6, label: '3-6m' },
  { min: 6, max: 10, label: '6-10m' },
  { min: 10, max: 15, label: '10-15m' },
  { min: 15, max: 25, label: '15-25m' },
  { min: 25, max: 50, label: '25-50m' },
  { min: 50, max: 75, label: '50-75m' },
  { min: 75, max: 100, label: '75-100m' },
  { min: 100, max: 125, label: '100-125m' },
  { min: 125, max: 150, label: '125-150m' },
  { min: 150, max: 175, label: '150-175m' },
  { min: 175, max: 200, label: '175-200m' },
  { min: 200, max: 999, label: '200+m' },
];

/**
 * Get distance bucket for a given distance in meters
 */
export function getDistanceBucket(distanceM: number): DistanceBucket {
  const bucket = DISTANCE_BUCKETS.find(
    (b) => distanceM >= b.min && distanceM < b.max
  );
  return bucket ?? DISTANCE_BUCKETS[DISTANCE_BUCKETS.length - 1];
}
