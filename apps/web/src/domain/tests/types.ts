/**
 * Test Domain Types - Frontend
 *
 * This file contains types for the test registration and results system.
 * Combines user-provided interfaces with existing domain types.
 *
 * NAMING CONVENTION:
 * - Norwegian field names for UI/form types (nr, slagType, målLengde, etc.)
 * - English field names for canonical/API types
 *
 * See also:
 * - packages/shared-types/src/test.ts (canonical types)
 * - apps/api/src/domain/tests/types.ts (backend types)
 */

// ============================================================================
// TEST SHOT TYPES
// ============================================================================

/**
 * Individual shot within a test session.
 * Used for detailed shot-by-shot recording.
 */
export interface TestShot {
  /** Shot number (1-indexed) */
  nr: number;
  /** Type of shot (e.g., 'driver', 'putt', 'chip') */
  slagType: string;
  /** Target distance in meters */
  målLengde: number;
  /** Actual result distance (null if not yet recorded) */
  resultatLengde: number | null;
  /** Points earned for this shot (null if not scored) */
  poeng: number | null;
}

/**
 * Extended shot type with additional metrics.
 */
export interface TestShotExtended extends TestShot {
  /** Deviation from target (calculated) */
  avvik?: number;
  /** Shot direction (left, right, straight) */
  retning?: 'venstre' | 'høyre' | 'rett';
  /** Notes for this shot */
  notat?: string;
  /** Timestamp when shot was recorded */
  tidspunkt?: Date;
}

// ============================================================================
// TEST DEFINITION TYPES
// ============================================================================

/**
 * Test definition for UI display and form generation.
 * Norwegian naming for consistency with UI.
 */
export interface Test {
  /** Unique identifier */
  id: string;
  /** Test name (Norwegian) */
  navn: string;
  /** Description of the test */
  beskrivelse: string;
  /** Measurement type (e.g., 'meter', 'prosent', 'sekunder') */
  maling: string;
  /** Registration method (e.g., 'enkelt', 'tabell', 'runde') */
  registrering: string;
  /** Template shots for this test */
  slag: TestShot[];
}

/**
 * Extended test definition with additional metadata.
 */
export interface TestExtended extends Test {
  /** Test category */
  kategori: TestKategori;
  /** Number of attempts required */
  antallForsok: number;
  /** Calculation method */
  beregning: Beregningstype;
  /** Whether lower values are better */
  lavereBedre: boolean;
  /** Category requirements for passing */
  krav?: Record<string, number>;
  /** Equipment needed */
  utstyr?: string[];
  /** Tips for the test taker */
  tips?: string[];
  /** Duration estimate */
  varighet?: string;
}

// ============================================================================
// TEST RESULT TYPES
// ============================================================================

/**
 * Test result status.
 */
export type TestResultStatus = 'started' | 'in_progress' | 'completed' | 'submitted';

/**
 * Result of a test session.
 */
export interface TestResult {
  /** Test definition ID */
  testId: string;
  /** Player ID */
  spillerId: string;
  /** Coach ID (who administered the test) */
  trenerId: string;
  /** Date of the test */
  dato: Date;
  /** All shots recorded */
  slag: TestShot[];
  /** Total points earned */
  totalPoeng: number;
  /** Current status */
  status: TestResultStatus;
}

/**
 * Extended test result with additional data.
 */
export interface TestResultExtended extends TestResult {
  /** Unique result ID */
  id: string;
  /** Calculated main value (e.g., average, best) */
  verdi: number;
  /** Whether the test was passed */
  bestatt: boolean;
  /** Percentage of requirement achieved */
  prosentAvKrav?: number;
  /** Improvement from last attempt */
  forbedringFraSist?: number;
  /** Location where test was conducted */
  sted?: string;
  /** Environment (indoor/outdoor) */
  miljo?: 'inne' | 'ute';
  /** Coach feedback */
  trenerTilbakemelding?: string;
  /** Player feedback */
  spillerTilbakemelding?: string;
  /** Video URL */
  videoUrl?: string;
  /** Created timestamp */
  opprettet: Date;
  /** Updated timestamp */
  oppdatert: Date;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

/**
 * Input for creating a new test result.
 */
export interface TestResultInput {
  testId: string;
  spillerId: string;
  trenerId?: string;
  dato?: Date;
  slag: TestShotInput[];
  notat?: string;
}

/**
 * Input for recording a shot.
 */
export interface TestShotInput {
  nr: number;
  slagType?: string;
  målLengde?: number;
  resultatLengde: number | null;
  poeng?: number | null;
}

/**
 * Form state for test registration.
 */
export interface TestRegistrationForm {
  /** Selected test */
  test: Test | null;
  /** Current shots */
  slag: TestShot[];
  /** Current shot being recorded */
  aktivtSlag: number;
  /** Notes */
  notat: string;
  /** Form status */
  status: 'idle' | 'recording' | 'review' | 'submitting' | 'submitted';
  /** Validation errors */
  feil: Record<string, string>;
}

// ============================================================================
// CATEGORY & ENUM TYPES
// ============================================================================

/**
 * Test categories (Norwegian).
 */
export type TestKategori =
  | 'hastighet'
  | 'avstand'
  | 'presisjon'
  | 'naerspill'
  | 'putting'
  | 'fysisk'
  | 'scoring'
  | 'mental';

/**
 * Calculation types for test results.
 */
export type Beregningstype =
  | 'beste'
  | 'gjennomsnitt'
  | 'gjennomsnittBeste3'
  | 'prosent'
  | 'pei'
  | 'standardavvik'
  | 'direkte';

/**
 * Maps Norwegian categories to English.
 */
export const KATEGORI_TIL_ENGLISH: Record<TestKategori, string> = {
  hastighet: 'speed',
  avstand: 'distance',
  presisjon: 'accuracy',
  naerspill: 'short_game',
  putting: 'putting',
  fysisk: 'physical',
  scoring: 'scoring',
  mental: 'mental',
};

/**
 * Category display configuration.
 */
export const KATEGORI_CONFIG: Record<TestKategori, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  hastighet: {
    label: 'Hastighet',
    color: 'rgb(16, 69, 106)',
    bgColor: 'bg-blue-50',
    icon: 'zap',
  },
  avstand: {
    label: 'Avstand',
    color: 'rgb(14, 116, 144)',
    bgColor: 'bg-teal-50',
    icon: 'ruler',
  },
  presisjon: {
    label: 'Presisjon',
    color: 'rgb(124, 58, 237)',
    bgColor: 'bg-purple-50',
    icon: 'target',
  },
  naerspill: {
    label: 'Naerspill',
    color: 'rgb(31, 122, 92)',
    bgColor: 'bg-emerald-50',
    icon: 'flag',
  },
  putting: {
    label: 'Putting',
    color: 'rgb(37, 99, 235)',
    bgColor: 'bg-blue-50',
    icon: 'circle',
  },
  fysisk: {
    label: 'Fysisk',
    color: 'rgb(220, 38, 38)',
    bgColor: 'bg-red-50',
    icon: 'dumbbell',
  },
  scoring: {
    label: 'Scoring',
    color: 'rgb(158, 124, 47)',
    bgColor: 'bg-amber-50',
    icon: 'flag-triangle-right',
  },
  mental: {
    label: 'Mental',
    color: 'rgb(79, 70, 229)',
    bgColor: 'bg-indigo-50',
    icon: 'brain',
  },
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Summary of test results for display.
 */
export interface TestResultSummary {
  testId: string;
  testNavn: string;
  kategori: TestKategori;
  sisteResultat?: {
    dato: Date;
    verdi: number;
    bestatt: boolean;
  };
  besteResultat?: {
    dato: Date;
    verdi: number;
  };
  antallForsok: number;
  antallBestatt: number;
}

/**
 * Test session for tracking a complete test attempt.
 */
export interface TestSession {
  id: string;
  test: Test;
  spiller: {
    id: string;
    navn: string;
    kategori?: string;
  };
  trener?: {
    id: string;
    navn: string;
  };
  startTid: Date;
  sluttTid?: Date;
  slag: TestShot[];
  status: TestResultStatus;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for test results list.
 */
export interface TestResultListResponse {
  success: boolean;
  data: {
    results: TestResultExtended[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * API response for single test result.
 */
export interface TestResultResponse {
  success: boolean;
  data: TestResultExtended;
}

/**
 * API response for test submission.
 */
export interface TestSubmitResponse {
  success: boolean;
  data: {
    resultId: string;
    verdi: number;
    bestatt: boolean;
    prosentAvKrav?: number;
  };
}
