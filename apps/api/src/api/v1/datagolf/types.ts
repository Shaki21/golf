/**
 * DataGolf Integration Types
 * Based on SAMMENLIGNING_OG_ANALYTICS.md
 */

// ============================================================================
// DATAGOLF PLAYER DATA
// ============================================================================

export interface DataGolfPlayerData {
  playerId: string | null; // IUP Player ID
  dataGolfPlayerId: string;
  playerName: string;
  tour: string | null; // PGA, LPGA, DP World, etc.
  lastUpdated: Date;

  // Strokes Gained stats
  strokesGainedTotal: number | null;
  strokesGainedOTT: number | null; // Off the tee
  strokesGainedAPR: number | null; // Approach
  strokesGainedARG: number | null; // Around the green
  strokesGainedPutting: number | null;

  // Distance stats
  drivingDistance: number | null;
  drivingAccuracy: number | null;

  // Scoring stats
  scoringAverage: number | null;
  birdiesToPars: number | null;

  // Additional stats
  greensInRegulation: number | null;
  scrambling: number | null;
  puttsPerRound: number | null;
}

// ============================================================================
// DATAGOLF TOUR AVERAGES
// ============================================================================

export interface DataGolfTourAverages {
  tour: string;
  season: number;
  lastUpdated: Date;

  // Average strokes gained
  avgStrokesGainedTotal: number | null;
  avgStrokesGainedOTT: number | null;
  avgStrokesGainedAPR: number | null;
  avgStrokesGainedARG: number | null;
  avgStrokesGainedPutting: number | null;

  // Average distance
  avgDrivingDistance: number | null;
  avgDrivingAccuracy: number | null;

  // Average scoring
  avgScoringAverage: number | null;
  avgGreensInRegulation: number | null;
  avgScrambling: number | null;
  avgPuttsPerRound: number | null;
}

// ============================================================================
// IUP TO DATAGOLF MAPPING
// ============================================================================

export interface IupDataGolfMapping {
  iupTestNumber: number;
  iupTestName: string;
  dataGolfMetric: string;
  conversionFormula?: string; // e.g., "meters * 1.094 for yards"
  correlationStrength: number; // 0-1, how well they correlate
  notes?: string;
}

// ============================================================================
// COMPARISON RESULT
// ============================================================================

export interface IupToDataGolfComparison {
  playerId: string;
  playerName: string;
  category: string;

  comparisons: Array<{
    iupTestNumber: number;
    iupTestName: string;
    iupValue: number;
    dataGolfMetric: string;
    dataGolfValue: number;
    tourAverage: number;
    percentileVsTour: number; // 0-100
    gap: number; // Difference from tour average
    gapPercentage: number;
  }>;

  overallAssessment: {
    totalTests: number;
    aboveTourAverage: number;
    belowTourAverage: number;
    nearTourAverage: number;
    overallPercentile: number;
  };
}

// ============================================================================
// COACH PLAYER STATS
// ============================================================================

export interface CoachPlayerDataGolfStats {
  playerId: string;
  playerName: string;
  category: string;
  handicap: number | null;
  dataGolfConnected: boolean;
  lastSync: Date | null;
  roundsTracked: number;
  stats: {
    sgTotal: number | null;
    sgTee: number | null;
    sgApproach: number | null;
    sgAround: number | null;
    sgPutting: number | null;
    drivingDistance: number | null;
    drivingAccuracy: number | null;
    girPercent: number | null;
    scrambling: number | null;
    puttsPerRound: number | null;
  };
  trends: {
    sgTotal: 'up' | 'down' | 'stable';
    sgTee: 'up' | 'down' | 'stable';
    sgApproach: 'up' | 'down' | 'stable';
    sgAround: 'up' | 'down' | 'stable';
    sgPutting: 'up' | 'down' | 'stable';
  };
  tourComparison: {
    tour: string;
    gapToTour: number | null;
    percentile: number | null;
  } | null;
}

export interface CoachDataGolfDashboard {
  players: CoachPlayerDataGolfStats[];
  summary: {
    totalPlayers: number;
    connectedPlayers: number;
    totalRoundsTracked: number;
    lastSyncAt: Date | null;
  };
  tourAverages: DataGolfTourAverages | null;
}

// ============================================================================
// SYNC STATUS
// ============================================================================

export interface DataGolfSyncStatus {
  lastSyncAt: Date;
  nextSyncAt: Date;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success' | 'failed' | 'completed_with_errors';
  playersUpdated: number;
  tourAveragesUpdated: number;
  errors?: string[];
}

// ============================================================================
// PEI TO STROKES GAINED
// ============================================================================

export type LieType = 'tee' | 'fairway' | 'rough' | 'bunker' | 'recovery' | 'green';

export interface PeiToSgRequest {
  startDistance: number; // meters
  pei: number; // PEI value (lower = better)
  lie?: LieType;
}

export interface PeiToSgResponse {
  strokesGained: number;
  expectedBefore: number;
  expectedAfter: number;
  leaveDistance: number;
  lie: LieType;
  category: 'approach' | 'around_green' | 'putting';
  tourPercentile: number;
  tourComparison: {
    pgaElite: number;
    pgaAverage: number;
    amateur: number;
  };
}

export interface BatchPeiToSgRequest {
  shots: Array<{
    startDistance: number;
    pei: number;
    lie?: LieType;
  }>;
}

export interface BatchPeiToSgResponse {
  shots: PeiToSgResponse[];
  totalStrokesGained: number;
  averageStrokesGained: number;
  category: string;
  tourPercentile: number;
}

export interface IupTestToSgRequest {
  testNumber: 8 | 9 | 10 | 11 | 15 | 16 | 17 | 18;
  peiValues?: number[]; // For approach/chipping/bunker tests
  madeCount?: number; // For putting tests
  totalAttempts?: number; // For putting tests
  startDistance?: number; // Optional override for chipping
  lie?: 'fairway' | 'bunker'; // For chipping test
}

export interface IupTestToSgResponse {
  testNumber: number;
  testName: string;
  strokesGained: number;
  averageStrokesGained: number;
  category: 'approach' | 'around_green' | 'putting';
  shotCount: number;
  tourPercentile: number;
  comparison: {
    vsPgaElite: number;
    vsPgaAverage: number;
    vsAmateur: number;
  };
}
