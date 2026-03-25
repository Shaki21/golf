/**
 * Focus Engine Types
 * Types for DataGolf data ingestion and focus calculation
 */

// ============================================================================
// INGESTION TYPES
// ============================================================================

export interface IngestionResult {
  success: boolean;
  sourceVersion: string;
  stats: {
    playerSeasons: { upserted: number; errors: number };
    approachSkills: { upserted: number; errors: number };
    filesProcessed: string[];
  };
  errors: string[];
  duration: number;
}

export interface PerformanceRow {
  player_name: string;
  events_played?: number;
  wins?: number;
  x_wins?: number;
  rounds_played?: number;
  shotlink_played?: number;
  putt_true?: number;
  arg_true?: number;
  app_true?: number;
  ott_true?: number;
  t2g_true?: number;
  total_true?: number;
}

export interface ApproachSkillRow {
  time_period: string;
  stat: string;
  player_name: string;
  // Fairway buckets
  '50_100_fw_shot_count'?: number;
  '50_100_fw_value'?: number;
  '100_150_fw_shot_count'?: number;
  '100_150_fw_value'?: number;
  '150_200_fw_shot_count'?: number;
  '150_200_fw_value'?: number;
  'over_200_fw_shot_count'?: number;
  'over_200_fw_value'?: number;
  // Rough buckets
  'under_150_rgh_shot_count'?: number;
  'under_150_rgh_value'?: number;
  'over_150_rgh_shot_count'?: number;
  'over_150_rgh_value'?: number;
}

// ============================================================================
// COMPONENT WEIGHTS
// ============================================================================

export interface ComponentWeights {
  windowStartSeason: number;
  windowEndSeason: number;
  wOtt: number;
  wApp: number;
  wArg: number;
  wPutt: number;
  computedAt: Date;
}

export type Component = 'OTT' | 'APP' | 'ARG' | 'PUTT';

// ============================================================================
// FOCUS ENGINE OUTPUT
// ============================================================================

export interface FocusOutput {
  focusComponent: Component;
  focusScores: Record<Component, number>; // 0-100 per component
  recommendedSplit: Record<Component, number>; // 0.0-1.0, sum to 1
  reasonCodes: string[];
  confidence: 'low' | 'med' | 'high';
}

export interface PlayerFocusResult extends FocusOutput {
  playerId: string;
  playerName: string;
  computedAt: Date;
  approachWeakestBucket?: string; // e.g., "150_200" if APP is focus
}

export interface TeamFocusResult {
  teamId: string;
  coachId: string;
  playerCount: number;
  heatmap: Record<Component, number>; // count of players focused on each
  topReasonCodes: string[]; // top 3
  atRiskPlayers: AtRiskPlayer[];
  computedAt: Date;
}

export interface AtRiskPlayer {
  playerId: string;
  playerName: string;
  focusComponent: Component;
  reason: string;
  adherenceScore: number; // 0-100
}

// ============================================================================
// INTERNAL CALCULATION TYPES
// ============================================================================

export interface PlayerTestScores {
  playerId: string;
  scores: Record<Component, { value: number; count: number }>;
  percentiles: Record<Component, number>;
}

export interface TestComponentMap {
  testNumber: number;
  component: Component;
  weight: number;
}

// ============================================================================
// API REQUEST/RESPONSE
// ============================================================================

export interface IngestionRequest {
  zipPath?: string; // defaults to known location
  forceReprocess?: boolean;
}

export interface WeightsResponse {
  weights: ComponentWeights;
  lastUpdated: Date;
}

export interface UserFocusRequest {
  userId: string;
  includeApproachDetail?: boolean;
}

export interface TeamFocusRequest {
  coachId: string;
  teamId: string;
}
