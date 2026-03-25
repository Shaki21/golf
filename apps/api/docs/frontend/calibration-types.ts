/**
 * TypeScript Types for Club Speed Calibration API
 *
 * Copy these types to your frontend project for type-safe API integration
 */

// ============================================================================
// CLUB TYPES
// ============================================================================

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

export type SpeedDecayType = 'normal' | 'steep' | 'shallow';
export type GappingType = 'good' | 'uneven';

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Club speed data for a single club (input)
 */
export interface ClubSpeedInput {
  clubType: ClubType;
  shot1Speed: number; // mph (40-150 range)
  shot2Speed: number; // mph (40-150 range)
  shot3Speed: number; // mph (40-150 range)
}

/**
 * Request body for creating/updating calibration
 */
export interface CalibrationRequest {
  playerId: string; // UUID (only for POST, not PUT)
  calibrationDate: string; // ISO 8601 format: "2025-12-15T10:00:00Z"
  clubs: ClubSpeedInput[];
  notes?: string;
}

/**
 * Request body for updating calibration (no playerId in body)
 */
export interface CalibrationUpdateRequest {
  calibrationDate: string;
  clubs: ClubSpeedInput[];
  notes?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Individual shot data
 */
export interface Shot {
  shotNumber: 1 | 2 | 3;
  clubSpeed: number; // mph
}

/**
 * Club speed data with calculated values (response)
 */
export interface ClubSpeedData {
  clubType: ClubType;
  shots: Shot[];
  averageSpeed: number; // mph (average of 3 shots)
  percentOfDriver: number; // % relative to driver speed
}

/**
 * Speed profile analysis
 */
export interface SpeedProfile {
  driverSpeed: number; // mph
  speedDecay: SpeedDecayType;
  gapping: GappingType;
  weakestClub?: ClubType;
  strongestClub?: ClubType;
  recommendations: string[];
}

/**
 * Complete calibration data (response)
 */
export interface Calibration {
  id: string; // UUID
  playerId: string; // UUID
  calibrationDate: string; // ISO 8601
  driverSpeed: number; // mph
  clubs: ClubSpeedData[];
  speedProfile: SpeedProfile;
  notes?: string;
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Create calibration response
 */
export interface CreateCalibrationResponse {
  id: string;
  playerId: string;
  driverSpeed: number;
  clubs: ClubSpeedData[];
  speedProfile: SpeedProfile;
  recommendations: string[];
}

/**
 * Get calibration response
 */
export interface GetCalibrationResponse {
  id: string;
  playerId: string;
  calibrationDate: string;
  driverSpeed: number;
  clubs: ClubSpeedData[];
  speedProfile: SpeedProfile;
  notes?: string;
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Club display names
 */
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

/**
 * Expected speed percentages (relative to driver)
 */
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

/**
 * Club order for display
 */
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

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate club speed value
 */
export function isValidSpeed(speed: number): boolean {
  return speed >= 40 && speed <= 150;
}

/**
 * Validate club type
 */
export function isValidClubType(club: string): club is ClubType {
  return CLUB_ORDER.includes(club as ClubType);
}

/**
 * Get club display name
 */
export function getClubName(clubType: ClubType): string {
  return CLUB_NAMES[clubType];
}

/**
 * Get expected speed for a club based on driver speed
 */
export function getExpectedSpeed(driverSpeed: number, clubType: ClubType): number {
  const ratio = EXPECTED_SPEED_RATIOS[clubType] / 100;
  return Math.round(driverSpeed * ratio * 10) / 10;
}

/**
 * Calculate average of 3 shots
 */
export function calculateAverage(shot1: number, shot2: number, shot3: number): number {
  return Math.round(((shot1 + shot2 + shot3) / 3) * 10) / 10;
}

/**
 * Calculate percentage of driver
 */
export function calculatePercentOfDriver(clubSpeed: number, driverSpeed: number): number {
  return Math.round((clubSpeed / driverSpeed) * 1000) / 10;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Form state for calibration input
 */
export interface CalibrationFormState {
  playerId: string;
  calibrationDate: Date;
  clubs: Map<ClubType, ClubSpeedInput>;
  notes: string;
  currentClub: ClubType | null;
  completedClubs: Set<ClubType>;
}

/**
 * UI state for calibration form
 */
export interface CalibrationUIState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: Record<string, string[]>;
  step: 'input' | 'review' | 'results';
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  club: string; // Display name
  clubType: ClubType;
  speed: number;
  percentOfDriver: number;
  expectedSpeed: number;
  deviation: number; // Actual vs expected
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Creating calibration data
 *
 * ```typescript
 * const calibrationData: CalibrationRequest = {
 *   playerId: 'uuid',
 *   calibrationDate: new Date().toISOString(),
 *   clubs: [
 *     {
 *       clubType: 'driver',
 *       shot1Speed: 116,
 *       shot2Speed: 115,
 *       shot3Speed: 114
 *     },
 *     {
 *       clubType: '7iron',
 *       shot1Speed: 87,
 *       shot2Speed: 86,
 *       shot3Speed: 85
 *     }
 *   ],
 *   notes: 'Initial calibration'
 * };
 * ```
 */

/**
 * Example: Processing response
 *
 * ```typescript
 * const response: ApiSuccessResponse<CreateCalibrationResponse> = await submitCalibration(data);
 *
 * if (response.success) {
 *   const { driverSpeed, speedProfile, recommendations } = response.data;
 *   console.log(`Driver speed: ${driverSpeed} mph`);
 *   console.log(`Speed decay: ${speedProfile.speedDecay}`);
 *   console.log('Recommendations:', recommendations);
 * }
 * ```
 */

/**
 * Example: Building chart data
 *
 * ```typescript
 * function buildChartData(calibration: Calibration): ChartDataPoint[] {
 *   return calibration.clubs.map(club => ({
 *     club: getClubName(club.clubType),
 *     clubType: club.clubType,
 *     speed: club.averageSpeed,
 *     percentOfDriver: club.percentOfDriver,
 *     expectedSpeed: getExpectedSpeed(calibration.driverSpeed, club.clubType),
 *     deviation: club.averageSpeed - getExpectedSpeed(calibration.driverSpeed, club.clubType)
 *   }));
 * }
 * ```
 */
