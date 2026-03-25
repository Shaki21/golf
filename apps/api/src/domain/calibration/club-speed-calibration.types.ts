/**
 * Club Speed Calibration Types
 * One-time calibration test during player onboarding
 */

export type ClubType =
  | 'driver'
  | '3wood'
  | '5wood'
  | '3hybrid'
  | '4hybrid'
  | '3iron'
  | '4iron'
  | '5iron'
  | '6iron'
  | '7iron'
  | '8iron'
  | '9iron'
  | 'pw'
  | 'gw'
  | 'sw'
  | 'lw';

export interface ClubSpeedShot {
  shotNumber: 1 | 2 | 3;
  clubSpeed: number; // mph
}

export interface ClubSpeedData {
  clubType: ClubType;
  shots: ClubSpeedShot[];
  averageSpeed: number; // Calculated average of 3 shots
  percentOfDriver: number; // % relative to driver speed
}

export interface ClubSpeedCalibration {
  playerId: string;
  calibrationDate: Date;
  clubs: ClubSpeedData[];
  driverSpeed: number; // mph (baseline for percentages)
  speedProfile: SpeedProfile;
  notes?: string;
}

export interface SpeedProfile {
  driverSpeed: number;
  speedDecay: 'normal' | 'steep' | 'shallow'; // How speed drops through bag
  gapping: 'good' | 'uneven'; // Consistency between clubs
  weakestClub?: ClubType;
  strongestClub?: ClubType;
  recommendations: string[];
}

export interface ClubSpeedCalibrationInput {
  playerId: string;
  calibrationDate: Date | string;
  clubs: {
    clubType: ClubType;
    shot1Speed: number;
    shot2Speed: number;
    shot3Speed: number;
  }[];
  notes?: string;
}

export interface ClubSpeedCalibrationResult {
  calibration: ClubSpeedCalibration;
  speedProfile: SpeedProfile;
  recommendations: string[];
}

// Standard club order for display
export const CLUB_ORDER: ClubType[] = [
  'driver',
  '3wood',
  '5wood',
  '3hybrid',
  '4hybrid',
  '3iron',
  '4iron',
  '5iron',
  '6iron',
  '7iron',
  '8iron',
  '9iron',
  'pw',
  'gw',
  'sw',
  'lw',
];

// Expected speed percentages (relative to driver)
// Based on typical tour player ratios
export const EXPECTED_SPEED_RATIOS: Record<ClubType, number> = {
  driver: 100,
  '3wood': 92,
  '5wood': 88,
  '3hybrid': 86,
  '4hybrid': 84,
  '3iron': 82,
  '4iron': 80,
  '5iron': 78,
  '6iron': 76,
  '7iron': 74,
  '8iron': 72,
  '9iron': 70,
  pw: 68,
  gw: 66,
  sw: 64,
  lw: 62,
};

// Club display names
export const CLUB_NAMES: Record<ClubType, string> = {
  driver: 'Driver',
  '3wood': '3-Wood',
  '5wood': '5-Wood',
  '3hybrid': '3-Hybrid',
  '4hybrid': '4-Hybrid',
  '3iron': '3-Iron',
  '4iron': '4-Iron',
  '5iron': '5-Iron',
  '6iron': '6-Iron',
  '7iron': '7-Iron',
  '8iron': '8-Iron',
  '9iron': '9-Iron',
  pw: 'Pitching Wedge',
  gw: 'Gap Wedge',
  sw: 'Sand Wedge',
  lw: 'Lob Wedge',
};
