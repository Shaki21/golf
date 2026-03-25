/**
 * Breaking Points Types
 * Types for auto-creation and management of breaking points
 */

import type { ClubType, SpeedProfile } from '../calibration/club-speed-calibration.types';

export interface AutoCreateBreakingPointInput {
  playerId: string;
  tenantId: string;
  calibrationId: string;
  speedProfile: SpeedProfile;
  driverSpeed: number;
  clubSpeedLevel: string; // CS20, CS40, CS70, CS90, CS110, CS120
}

export interface BreakingPointCreationResult {
  created: number;
  breakingPoints: Array<{
    id: string;
    clubType: ClubType;
    deviationPercent: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface ExerciseFilter {
  clubSpeedLevel: string;
  processCategory?: string;
  clubType?: ClubType;
  tenantId: string;
}

export const DEVIATION_THRESHOLDS = {
  LOW: 5,      // 5-10% deviation
  MEDIUM: 10,  // 10-15% deviation
  HIGH: 15,    // >15% deviation
} as const;

export const HOURS_PER_WEEK_BY_SEVERITY = {
  low: 2,
  medium: 3,
  high: 4,
} as const;
