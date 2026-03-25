/**
 * Manual Stats API Service
 *
 * API client for round tracking, image extraction, and Strokes Gained calculation.
 */

import apiClient from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

export type RoundStatus = 'DRAFT' | 'PENDING_EXTRACTION' | 'PENDING_REVIEW' | 'FINALIZED' | 'ARCHIVED';
export type LieCategory = 'TEE' | 'FAIRWAY' | 'ROUGH' | 'BUNKER' | 'RECOVERY' | 'GREEN' | 'PENALTY' | 'OTHER';
export type ShotCategory = 'TEE' | 'APPROACH' | 'SHORT_GAME' | 'PUTTING';
export type DistanceType = 'TOTAL' | 'CARRY';
export type ExtractionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REQUIRES_REVIEW';

export interface GolfRound {
  id: string;
  playerId: string;
  roundDate: string;
  courseName?: string;
  courseId?: string;
  teeBox?: string;
  totalScore?: number;
  totalPar: number;
  holesPlayed: number;
  dataQuality?: number;
  sgComputable: boolean;
  status: RoundStatus;
  inputMethod: 'manual' | 'ai';
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

export interface RoundHoleData {
  id: string;
  roundId: string;
  holeNumber: number;
  holeLengthM?: number;
  holePar?: number;
  holeScore?: number;
  isComplete: boolean;
  sgComputable: boolean;
  dataSource: string;
}

export interface ShotEvent {
  id: string;
  roundId: string;
  holeNumber: number;
  shotNumber: number;
  startDistanceM: number;
  startLie: LieCategory;
  endDistanceM?: number;
  endLie?: LieCategory;
  isHoled: boolean;
  club?: string;
  distanceType?: DistanceType;
  shotCategory: ShotCategory;
  isEstimated: boolean;
  dataSource: string;
  confidence?: number;
}

export interface SGRoundResult {
  id: string;
  roundId: string;
  sgTee?: number;
  sgApproach?: number;
  sgShortGame?: number;
  sgPutting?: number;
  sgTotal?: number;
  shotCountTee: number;
  shotCountApproach: number;
  shotCountShortGame: number;
  shotCountPutting: number;
  holesWithSG: number;
  totalHoles: number;
  coveragePercent: number;
  baselineVersion: string;
  calculatedAt: string;
}

export interface ExtractionResult {
  id: string;
  imageId: string;
  status: ExtractionStatus;
  attemptCount: number;
  overallConfidence?: number;
  fieldsRequiringReview: number;
  holeData: ExtractionHoleData[];
}

export interface ExtractionHoleData {
  holeNumber: number;
  holeLengthM?: number;
  holePar?: number;
  holeScore?: number;
  tee?: {
    club?: string;
    distanceM?: number;
    distanceType?: DistanceType;
    confidence?: number;
  };
  approach?: {
    startDistanceM?: number;
    lie?: LieCategory;
    club?: string;
    endDistanceM?: number;
    endLie?: LieCategory;
    confidence?: number;
  };
  shortGame?: {
    startDistanceM?: number;
    lie?: LieCategory;
    club?: string;
    endDistanceM?: number;
    confidence?: number;
  };
  putting?: {
    firstPuttM?: number;
    puttsCount?: number;
    confidence?: number;
  };
  overallConfidence?: number;
  requiresReview: boolean;
  reviewFields: string[];
}

export interface PlayerTrends {
  playerId: string;
  period: string;
  roundCount: number;
  avgSGTotal: number;
  avgSGTee: number;
  avgSGApproach: number;
  avgSGShortGame: number;
  avgSGPutting: number;
  trend: {
    sgTotal: 'up' | 'down' | 'neutral';
    sgTee: 'up' | 'down' | 'neutral';
    sgApproach: 'up' | 'down' | 'neutral';
    sgShortGame: 'up' | 'down' | 'neutral';
    sgPutting: 'up' | 'down' | 'neutral';
  };
  weeklyData: Array<{
    weekNumber: number;
    sgTotal: number;
    sgTee: number;
    sgApproach: number;
    sgShortGame: number;
    sgPutting: number;
    roundCount: number;
  }>;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateRoundRequest {
  playerId: string;
  roundDate: string;
  courseName?: string;
  courseId?: string;
  teeBox?: string;
  totalPar?: number;
  holesPlayed?: number;
}

export interface ManualHoleEntry {
  holeNumber: number;
  holeLengthM?: number;
  holePar?: number;
  holeScore?: number;
  tee?: {
    club?: string;
    distanceM?: number;
    distanceType?: DistanceType;
  };
  approach?: {
    startDistanceM?: number;
    lie?: LieCategory;
    club?: string;
    endDistanceM?: number;
    endLie?: LieCategory;
  };
  shortGame?: {
    startDistanceM?: number;
    lie?: LieCategory;
    club?: string;
    endDistanceM?: number;
  };
  putting?: {
    firstPuttM?: number;
    puttsCount?: number;
  };
}

export interface ManualHolesEntryRequest {
  holes: ManualHoleEntry[];
}

export interface UserCorrectionRequest {
  corrections: Array<{
    holeNumber: number;
    field: string;
    value: string | number | boolean;
    reason?: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ============================================================================
// API METHODS
// ============================================================================

const MANUAL_STATS_BASE = '/manual-stats';

/**
 * Create a new golf round
 */
export async function createRound(request: CreateRoundRequest): Promise<GolfRound> {
  const response = await apiClient.post<ApiResponse<GolfRound>>(
    `${MANUAL_STATS_BASE}/rounds`,
    request
  );
  return response.data.data;
}

/**
 * Get a round by ID
 */
export async function getRound(roundId: string): Promise<GolfRound> {
  const response = await apiClient.get<ApiResponse<GolfRound>>(
    `${MANUAL_STATS_BASE}/rounds/${roundId}`
  );
  return response.data.data;
}

/**
 * Get rounds for a player
 */
export async function getPlayerRounds(
  playerId: string,
  options?: {
    status?: RoundStatus;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<GolfRound[]> {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await apiClient.get<ApiResponse<GolfRound[]>>(
    `${MANUAL_STATS_BASE}/players/${playerId}/rounds?${params.toString()}`
  );
  return response.data.data;
}

/**
 * Add manual hole entries to a round
 */
export async function addManualHoles(
  roundId: string,
  request: ManualHolesEntryRequest
): Promise<{ holesProcessed: number; shotsCreated: number; dataQuality: number }> {
  const response = await apiClient.post<ApiResponse<{
    holesProcessed: number;
    shotsCreated: number;
    dataQuality: number;
  }>>(`${MANUAL_STATS_BASE}/rounds/${roundId}/holes`, request);
  return response.data.data;
}

/**
 * Finalize a round and compute Strokes Gained
 */
export async function finalizeRound(
  roundId: string,
  options?: { recalculateSG?: boolean }
): Promise<{ round: GolfRound; sgResult?: SGRoundResult }> {
  const response = await apiClient.post<ApiResponse<{
    round: GolfRound;
    sgResult?: SGRoundResult;
  }>>(`${MANUAL_STATS_BASE}/rounds/${roundId}/finalize`, options ?? {});
  return response.data.data;
}

/**
 * Initiate image upload for a round
 */
export async function initiateImageUpload(
  roundId: string,
  files: Array<{ filename: string; mimeType: string; fileSize: number }>
): Promise<Array<{ uploadUrl: string; imageId: string; expiresAt: string }>> {
  const response = await apiClient.post<ApiResponse<Array<{
    uploadUrl: string;
    imageId: string;
    expiresAt: string;
  }>>>(`${MANUAL_STATS_BASE}/rounds/${roundId}/images/initiate`, { files });
  return response.data.data;
}

/**
 * Get extraction status for a round
 */
export async function getExtractionStatus(roundId: string): Promise<ExtractionResult | null> {
  const response = await apiClient.get<ApiResponse<ExtractionResult | null>>(
    `${MANUAL_STATS_BASE}/rounds/${roundId}/extraction`
  );
  return response.data.data;
}

/**
 * Apply user corrections to extraction
 */
export async function applyCorrections(
  roundId: string,
  request: UserCorrectionRequest
): Promise<{ correctionsApplied: number }> {
  const response = await apiClient.patch<ApiResponse<{ correctionsApplied: number }>>(
    `${MANUAL_STATS_BASE}/rounds/${roundId}/extraction`,
    request
  );
  return response.data.data;
}

/**
 * Get player SG trends
 */
export async function getPlayerTrends(
  playerId: string,
  options?: {
    period?: '30d' | '90d' | '180d' | '1y' | 'all';
    minCoverage?: number;
  }
): Promise<PlayerTrends> {
  const params = new URLSearchParams();
  if (options?.period) params.append('period', options.period);
  if (options?.minCoverage) params.append('minCoverage', options.minCoverage.toString());

  const response = await apiClient.get<ApiResponse<PlayerTrends>>(
    `${MANUAL_STATS_BASE}/players/${playerId}/trends?${params.toString()}`
  );
  return response.data.data;
}

/**
 * Delete a round (only draft rounds can be deleted)
 */
export async function deleteRound(roundId: string): Promise<void> {
  await apiClient.delete(`${MANUAL_STATS_BASE}/rounds/${roundId}`);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const manualStatsApi = {
  createRound,
  getRound,
  getPlayerRounds,
  addManualHoles,
  finalizeRound,
  initiateImageUpload,
  getExtractionStatus,
  applyCorrections,
  getPlayerTrends,
  deleteRound,
};

export default manualStatsApi;
