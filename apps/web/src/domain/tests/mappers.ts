/**
 * Test Domain Mappers
 *
 * PURE FUNCTIONS ONLY - All functions in this module must be:
 * - Deterministic: same inputs → same outputs
 * - Side-effect free: no I/O, no logging, no global state
 * - Time-independent: no Date.now(), new Date() without arguments
 *
 * If a function needs current time, it must receive `now: Date` as a parameter.
 *
 * Centralized conversion functions from canonical @iup/shared-types models
 * to UI-specific types used in dashboard and hooks.
 *
 * SEMANTIC GAPS (cannot be safely mapped):
 *
 * 1. Canonical TestCategory vs UISkillArea:
 *    - Canonical: 'putting' | 'chipping' | 'pitching' | 'bunker' | 'iron' | 'driver' | 'physical' | 'mental'
 *    - UI: 'golf' | 'teknikk' | 'fysisk' | 'mental' | 'strategisk' | 'driving' | 'jernspill' | 'kortspill' | 'putting'
 *    These represent DIFFERENT concepts (test protocols vs training skill areas).
 *    No direct mapping exists. Use mapTestCategoryToSkillArea() with explicit handling.
 *
 * 2. Canonical PlayerCategory vs UISkillLevel:
 *    - Canonical: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'D1' | 'D2' (Team Norway tier codes)
 *    - UI: 'K' | 'J' | 'I' | 'H' | 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' (11-level progression)
 *    These are INCOMPATIBLE systems. No safe mapping exists.
 *    UISkillLevel must be sourced from player profile data, not converted from PlayerCategory.
 *
 * SAFE MAPPINGS:
 * - Canonical TestResult → DashboardTestResult (subset extraction)
 * - Canonical TestResult + TestDefinition → UITestResult (with external trend data)
 */

/* eslint-disable no-restricted-syntax */
// Purity constraints enforced by .eslintrc - see rules for domain/tests/**

import type {
  UITestResult,
  UISkillArea,
  UISkillLevel,
  TestAttempt,
  CoachNote,
} from '../../hooks/useTestResults';

import type { DashboardTestResult } from '../../types/dashboard';

// ============================================================================
// CANONICAL TYPES - LOCAL MIRROR OF @iup/shared-types
// ============================================================================
//
// TECHNICAL DEBT: These types are intentionally duplicated from @iup/shared-types.
//
// WHY: Create React App's webpack configuration cannot transpile raw TypeScript
// files from pnpm workspace packages. CRA expects pre-compiled JavaScript, but
// @iup/shared-types only provides .ts source files.
//
// RISK: Type drift if shared-types changes without updating this file.
// MITIGATION: Types verified accurate as of 2026-01-02. Run type comparison
// when updating shared-types: compare packages/shared-types/src/*.ts with these.
//
// EXIT PATH (choose one):
// 1. Migrate from CRA to Vite/Next.js (supports workspace TS transpilation)
// 2. Add build step to shared-types that emits .js + .d.ts files
// 3. Use tsup/unbuild to pre-compile shared-types before web build
//
// See: apps/web/tsconfig.json, packages/shared-types/
// ============================================================================

/**
 * Canonical test categories from Team Norway test protocols.
 * Different from UI skill areas (UISkillArea).
 */
export type CanonicalTestCategory =
  | 'putting'
  | 'chipping'
  | 'pitching'
  | 'bunker'
  | 'iron'
  | 'driver'
  | 'physical'
  | 'mental';

/**
 * Canonical player categories (Team Norway tier codes A1-D2).
 * Different from UI skill levels (UISkillLevel = K-A).
 */
export type CanonicalPlayerCategory =
  | 'A1' | 'A2'
  | 'B1' | 'B2'
  | 'C1' | 'C2'
  | 'D1' | 'D2';

/**
 * Canonical test definition from @iup/shared-types.
 */
export interface CanonicalTestDefinition {
  id: string;
  tenantId: string;
  testNumber: number;
  name: string;
  category: CanonicalTestCategory;
  protocolName: string;
  description: string;
  targetCategory?: CanonicalPlayerCategory;
  testDetails?: Record<string, unknown>;
  benchmarkWeek: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Canonical test result from @iup/shared-types.
 */
export interface CanonicalTestResult {
  id: string;
  testId: string;
  playerId: string;
  testDate: string;
  testTime?: string;
  location?: string;
  environment?: 'indoor' | 'outdoor';
  results: Record<string, unknown>;
  value: number;
  pei?: number;
  passed: boolean;
  categoryRequirement?: number;
  percentOfRequirement?: number;
  improvementFromLast?: number;
  coachFeedback?: string;
  playerFeedback?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Canonical test result with joined definition.
 */
export interface TestResultWithDefinition extends CanonicalTestResult {
  test: CanonicalTestDefinition;
}

// ============================================================================
// CANONICAL → DASHBOARD MAPPERS
// ============================================================================

/**
 * Maps canonical TestResult to simplified DashboardTestResult.
 * Safe mapping - subset extraction only.
 */
export function mapCanonicalToDashboardResult(
  result: CanonicalTestResult,
  testName: string
): DashboardTestResult {
  return {
    id: result.id,
    testName,
    testDate: result.testDate,
    pei: result.pei ?? 0,
    value: result.value,
  };
}

/**
 * Maps array of canonical TestResults to DashboardTestResults.
 * Requires test name lookup.
 */
export function mapCanonicalToDashboardResults(
  results: CanonicalTestResult[],
  testNameLookup: Map<string, string>
): DashboardTestResult[] {
  return results.map(result =>
    mapCanonicalToDashboardResult(
      result,
      testNameLookup.get(result.testId) ?? 'Unknown Test'
    )
  );
}

// ============================================================================
// CANONICAL → UI TEST RESULT MAPPERS
// ============================================================================

/**
 * Raw API response structure before transformation.
 * Matches what the API returns for test definitions.
 */
export interface ApiTestDefinition {
  id: string;
  name: string;
  category: string; // May be canonical or API-specific
  unit?: string;
  icon?: string;
  lowerIsBetter?: boolean;
  description?: string;
  requirements?: Record<string, number>;
  requirement?: number;
}

/**
 * Raw API response structure for test results.
 */
export interface ApiTestResult {
  id: string;
  testId: string;
  testDate: string;
  value?: number;
  pei?: number;
  notes?: string;
  coachNotes?: string;
}

/**
 * Trend calculation result.
 */
export interface TrendData {
  trend: 'improving' | 'declining' | 'stable';
  trendPercent: number;
  improvementRate: number;
  predictedDaysToTarget: number | null;
}

// ============================================================================
// CANONICAL TestCategory → UISkillArea MAPPING
// ============================================================================

/**
 * Canonical TestCategory to UISkillArea mapping table.
 * Only defined mappings are included; unmapped categories return null.
 *
 * Mapping rationale:
 * - putting → putting (direct match)
 * - chipping/pitching/bunker → kortspill (short game grouping)
 * - iron → jernspill (iron play)
 * - driver → driving (direct semantic match)
 * - physical → fysisk (Norwegian translation)
 * - mental → mental (direct match)
 *
 * UNMAPPED: No canonical TestCategory maps to 'golf', 'teknikk', or 'strategisk'
 * because these are training skill areas without test protocol equivalents.
 */
const CANONICAL_TO_UI_SKILL_AREA: Record<CanonicalTestCategory, UISkillArea> = {
  'putting': 'putting',
  'chipping': 'kortspill',
  'pitching': 'kortspill',
  'bunker': 'kortspill',
  'iron': 'jernspill',
  'driver': 'driving',
  'physical': 'fysisk',
  'mental': 'mental',
};

/**
 * Maps canonical TestCategory to UISkillArea.
 * Returns null if no defined mapping exists.
 *
 * SEMANTIC GAP: Canonical TestCategory and UISkillArea are different concepts.
 * TestCategory = test protocol categories (what tests measure)
 * UISkillArea = training skill areas (what players train)
 *
 * @param category - Canonical TestCategory from @iup/shared-types
 * @returns UISkillArea if mapping exists, null otherwise
 */
export function mapCanonicalTestCategoryToSkillArea(
  category: CanonicalTestCategory
): UISkillArea | null {
  return CANONICAL_TO_UI_SKILL_AREA[category] ?? null;
}

/**
 * Maps API test category string to UISkillArea.
 *
 * SEMANTIC GAP: Canonical TestCategory and UISkillArea are different concepts.
 * This mapper attempts best-effort conversion with explicit fallback handling.
 *
 * @param apiCategory - Category string from API (may be canonical or legacy)
 * @param fallback - Default UISkillArea if no mapping found
 * @returns Mapped UISkillArea
 */
export function mapTestCategoryToSkillArea(
  apiCategory: string,
  fallback: UISkillArea = 'golf'
): UISkillArea {
  const normalized = apiCategory.toLowerCase().trim();

  // Direct UISkillArea values (passthrough)
  const uiSkillAreas: UISkillArea[] = [
    'golf', 'teknikk', 'fysisk', 'mental', 'strategisk',
    'driving', 'jernspill', 'kortspill', 'putting'
  ];
  if (uiSkillAreas.includes(normalized as UISkillArea)) {
    return normalized as UISkillArea;
  }

  // Try canonical mapping (returns null if not found)
  const canonicalResult = mapCanonicalTestCategoryToSkillArea(normalized as CanonicalTestCategory);
  if (canonicalResult !== null) {
    return canonicalResult;
  }

  return fallback;
}

/**
 * Calculates trend data from test history.
 */
export function calculateTrendData(
  history: TestAttempt[],
  currentValue: number,
  previousValue: number | null,
  lowerIsBetter: boolean,
  targetValue: number
): TrendData {
  // Calculate trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  let trendPercent = 0;

  if (previousValue !== null && previousValue !== 0) {
    const diff = currentValue - previousValue;
    const percentChange = (Math.abs(diff) / Math.abs(previousValue)) * 100;

    if (percentChange > 2) {
      if (lowerIsBetter) {
        trend = diff < 0 ? 'improving' : 'declining';
      } else {
        trend = diff > 0 ? 'improving' : 'declining';
      }
      trendPercent = percentChange;
    }
  }

  // Calculate improvement rate (per week)
  const firstValue = history[0]?.value ?? currentValue;
  const totalChange = lowerIsBetter ? firstValue - currentValue : currentValue - firstValue;
  const weeksSpan = history.length > 1
    ? (new Date(history[history.length - 1].testDate).getTime() - new Date(history[0].testDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
    : 1;
  const improvementRate = totalChange / Math.max(weeksSpan, 1);

  // Predict days to target
  let predictedDaysToTarget: number | null = null;
  const remaining = lowerIsBetter ? currentValue - targetValue : targetValue - currentValue;

  if (remaining > 0 && improvementRate > 0) {
    const weeksNeeded = remaining / improvementRate;
    predictedDaysToTarget = Math.ceil(weeksNeeded * 7);
  } else if (remaining <= 0) {
    predictedDaysToTarget = 0;
  }

  return {
    trend,
    trendPercent: parseFloat(trendPercent.toFixed(1)),
    improvementRate: parseFloat(improvementRate.toFixed(2)),
    predictedDaysToTarget,
  };
}

/**
 * Maps API test result to TestAttempt.
 */
export function mapApiResultToAttempt(apiResult: ApiTestResult): TestAttempt {
  return {
    id: apiResult.id,
    value: apiResult.value ?? apiResult.pei ?? 0,
    testDate: apiResult.testDate,
    notes: apiResult.notes,
    coachNotes: apiResult.coachNotes,
  };
}

/**
 * Maps API test definition and results to UITestResult.
 *
 * @param test - API test definition
 * @param results - API test results for this test (sorted newest first)
 * @param skillLevel - Player's UI skill level for requirement lookup
 * @returns Fully transformed UITestResult
 */
export function mapApiDataToUITestResult(
  test: ApiTestDefinition,
  results: ApiTestResult[],
  skillLevel: UISkillLevel
): UITestResult {
  // Build history (oldest first for trend calculation)
  const history = results
    .map(mapApiResultToAttempt)
    .reverse();

  const values = history.map(h => h.value);
  const currentValue = history[history.length - 1]?.value ?? 0;
  const previousValue = history[history.length - 2]?.value ?? null;
  const lowerIsBetter = test.lowerIsBetter ?? false;

  // Get requirement for skill level
  const requirement = test.requirements?.[skillLevel] ?? test.requirement ?? 0;

  // Calculate best/worst/average
  const bestValue = values.length > 0
    ? (lowerIsBetter ? Math.min(...values) : Math.max(...values))
    : 0;
  const worstValue = values.length > 0
    ? (lowerIsBetter ? Math.max(...values) : Math.min(...values))
    : 0;
  const averageValue = values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  // Calculate trend data
  const trendData = calculateTrendData(
    history,
    currentValue,
    previousValue,
    lowerIsBetter,
    requirement
  );

  return {
    id: test.id,
    testId: test.id,
    name: test.name,
    category: mapTestCategoryToSkillArea(test.category),
    unit: test.unit ?? '',
    icon: test.icon ?? 'target',
    lowerIsBetter,
    description: test.description,
    currentValue,
    previousValue,
    bestValue,
    worstValue,
    averageValue,
    requirement,
    targetRequirement: undefined, // Set by caller based on target skill level
    meetsCurrent: lowerIsBetter ? currentValue <= requirement : currentValue >= requirement,
    meetsTarget: undefined, // Set by caller
    history,
    testCount: history.length,
    firstTestDate: history[0]?.testDate ?? null,
    lastTestDate: history[history.length - 1]?.testDate ?? null,
    ...trendData,
    coachNotes: [],
    recommendations: [],
  };
}

/**
 * Batch maps API data to UITestResults.
 */
export function mapApiDataToUITestResults(
  tests: ApiTestDefinition[],
  results: ApiTestResult[],
  skillLevel: UISkillLevel
): UITestResult[] {
  // Group results by testId
  const resultsByTestId = new Map<string, ApiTestResult[]>();
  for (const result of results) {
    const existing = resultsByTestId.get(result.testId) ?? [];
    existing.push(result);
    resultsByTestId.set(result.testId, existing);
  }

  // Sort each group by date (newest first, as expected by mapApiDataToUITestResult)
  for (const [testId, testResults] of resultsByTestId) {
    testResults.sort((a, b) =>
      new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
    );
  }

  return tests.map(test => {
    const testResults = resultsByTestId.get(test.id) ?? [];
    return mapApiDataToUITestResult(test, testResults, skillLevel);
  });
}

// ============================================================================
// CANONICAL TestResult → UITestResult DIRECT MAPPER
// ============================================================================

/**
 * Maps a canonical TestResult with its TestDefinition directly to UITestResult.
 *
 * Use this when you have canonical types from @iup/shared-types.
 * For API response data, use mapApiDataToUITestResult instead.
 *
 * @param result - Canonical TestResult from @iup/shared-types
 * @param definition - Canonical TestDefinition for the test
 * @param history - Previous test attempts (oldest first)
 * @param skillLevel - Player's UISkillLevel for requirement lookup
 * @returns UITestResult with computed trends
 */
export function mapCanonicalToUITestResult(
  result: CanonicalTestResult,
  definition: CanonicalTestDefinition,
  history: CanonicalTestResult[],
  skillLevel: UISkillLevel
): UITestResult {
  // Build attempt history (oldest first)
  const attemptHistory: TestAttempt[] = history.map(r => ({
    id: r.id,
    value: r.value,
    testDate: r.testDate,
    notes: r.playerFeedback ?? undefined,
    coachNotes: r.coachFeedback ?? undefined,
  }));

  // Get values for calculations
  const values = attemptHistory.map(h => h.value);
  const currentValue = result.value;
  const previousValue = history.length > 1 ? history[history.length - 2].value : null;
  const lowerIsBetter = (definition.testDetails as Record<string, unknown> | undefined)?.lowerIsBetter === true;

  // Get requirement - needs to be looked up from external source
  // Since canonical TestDefinition doesn't have per-level requirements,
  // use categoryRequirement from result or 0
  const requirement = result.categoryRequirement ?? 0;

  // Calculate best/worst/average
  const bestValue = values.length > 0
    ? (lowerIsBetter ? Math.min(...values) : Math.max(...values))
    : currentValue;
  const worstValue = values.length > 0
    ? (lowerIsBetter ? Math.max(...values) : Math.min(...values))
    : currentValue;
  const averageValue = values.length > 0
    ? values.reduce((a, b) => a + b, 0) / values.length
    : currentValue;

  // Calculate trend data
  const trendData = calculateTrendData(
    attemptHistory,
    currentValue,
    previousValue,
    lowerIsBetter,
    requirement
  );

  // Map category with null fallback for unmapped
  const mappedCategory = mapCanonicalTestCategoryToSkillArea(definition.category);

  return {
    id: result.id,
    testId: result.testId,
    name: definition.name,
    category: mappedCategory ?? 'golf', // Fallback for unmapped categories
    unit: '', // Not in canonical definition
    icon: 'target',
    lowerIsBetter,
    description: definition.description,
    currentValue,
    previousValue,
    bestValue,
    worstValue,
    averageValue,
    requirement,
    targetRequirement: undefined,
    meetsCurrent: result.passed,
    meetsTarget: undefined,
    history: attemptHistory,
    testCount: attemptHistory.length,
    firstTestDate: attemptHistory[0]?.testDate ?? null,
    lastTestDate: attemptHistory[attemptHistory.length - 1]?.testDate ?? null,
    ...trendData,
    coachNotes: [],
    recommendations: [],
  };
}

// ============================================================================
// LIST PAGE TEST RESULT (for TestResultsPage.tsx)
// ============================================================================

/**
 * Simplified test result for list/page display.
 * Used by TestResultsPage and similar list views.
 */
export interface ListPageTestResult {
  id: string;
  testId: string;
  testName: string;
  testNumber: number;
  category: string;
  value: number;
  unit: string;
  requirement: number;
  lowerIsBetter: boolean;
  testDate: string;
  passed: boolean;
  trend: 'up' | 'down' | 'stable';
  previousValue?: number;
}

/**
 * Raw API result structure for list page processing.
 */
export interface RawApiTestResultWithTest {
  id: string;
  testId?: string;
  test?: {
    id: string;
    name: string;
    testNumber: number;
    category: string;
    unit?: string;
    requirement?: number;
    lowerIsBetter?: boolean;
  };
  testName?: string;
  testNumber?: number;
  category?: string;
  unit?: string;
  requirement?: number;
  lowerIsBetter?: boolean;
  value: number;
  testDate?: string;
  createdAt?: string;
}

/**
 * Processes raw API results into ListPageTestResult array.
 * Calculates trends by comparing to previous results for the same test.
 *
 * Moved from TestResultsPage.tsx for centralization.
 *
 * PURE FUNCTION: If testDate/createdAt are missing, uses fallbackDate parameter.
 *
 * @param rawResults - Raw API response results
 * @param fallbackDate - ISO date string to use when testDate is missing (required for purity)
 * @returns Processed ListPageTestResult array
 */
export function mapRawResultsToListPage(
  rawResults: RawApiTestResultWithTest[],
  fallbackDate: string
): ListPageTestResult[] {
  // Group by test to calculate trends
  const byTest: Record<string, RawApiTestResultWithTest[]> = {};
  rawResults.forEach(r => {
    const key = r.testId ?? r.test?.id ?? r.id;
    if (!byTest[key]) byTest[key] = [];
    byTest[key].push(r);
  });

  return rawResults.map(r => {
    const testId = r.testId ?? r.test?.id ?? r.id;
    const testResults = byTest[testId] ?? [];

    // Sort by date descending for trend calculation
    const sortedResults = [...testResults].sort((a, b) =>
      new Date(b.testDate ?? b.createdAt ?? 0).getTime() -
      new Date(a.testDate ?? a.createdAt ?? 0).getTime()
    );

    const currentIndex = sortedResults.findIndex(tr => tr.id === r.id);
    const previousResult = sortedResults[currentIndex + 1];

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (previousResult) {
      const diff = r.value - previousResult.value;
      const lowerIsBetter = r.test?.lowerIsBetter ?? r.lowerIsBetter ?? false;
      if (lowerIsBetter) {
        trend = diff < 0 ? 'up' : diff > 0 ? 'down' : 'stable';
      } else {
        trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';
      }
    }

    const requirement = r.test?.requirement ?? r.requirement ?? 0;
    const lowerIsBetter = r.test?.lowerIsBetter ?? r.lowerIsBetter ?? false;
    const passed = lowerIsBetter ? r.value <= requirement : r.value >= requirement;

    return {
      id: r.id,
      testId,
      testName: r.test?.name ?? r.testName ?? 'Ukjent test',
      testNumber: r.test?.testNumber ?? r.testNumber ?? 0,
      category: r.test?.category ?? r.category ?? 'Annet',
      value: r.value,
      unit: r.test?.unit ?? r.unit ?? '',
      requirement,
      lowerIsBetter,
      testDate: r.testDate ?? r.createdAt ?? fallbackDate,
      passed,
      trend,
      previousValue: previousResult?.value,
    };
  });
}

// ============================================================================
// UNMAPPABLE CONCEPTS - DOCUMENTATION
// ============================================================================

/**
 * CANONICAL PlayerCategory (A1-D2) CANNOT BE SAFELY MAPPED TO UISkillLevel (K-A).
 *
 * These represent fundamentally different categorization systems:
 *
 * Canonical PlayerCategory (Team Norway tier codes):
 *   A1, A2 = Elite/national team level
 *   B1, B2 = Regional competition level
 *   C1, C2 = Club competition level
 *   D1, D2 = Development/beginner level
 *
 * UISkillLevel (11-level progression):
 *   K = Beginner (lowest)
 *   J, I, H, G, F, E, D, C, B = Progressive levels
 *   A = Expert (highest)
 *
 * There is NO deterministic mapping because:
 * 1. Different number of levels (8 vs 11)
 * 2. Different semantics (competition tier vs skill progression)
 * 3. A player's UISkillLevel must come from player profile data, not derived from PlayerCategory
 *
 * If you need UISkillLevel, fetch it from the player profile API endpoint.
 */
export type PlayerCategoryMappingWarning =
  'CANNOT_MAP_PLAYER_CATEGORY_TO_SKILL_LEVEL';

/**
 * Attempts to provide a ROUGH approximation of UISkillLevel from PlayerCategory.
 * USE WITH EXTREME CAUTION - this is NOT a semantic equivalence.
 *
 * @deprecated Do not use in production. Fetch UISkillLevel from player profile instead.
 */
export function approximateSkillLevelFromPlayerCategory(
  category: CanonicalPlayerCategory
): UISkillLevel {
  // This is a ROUGH approximation only, not semantically accurate
  const approximationMap: Record<CanonicalPlayerCategory, UISkillLevel> = {
    'D2': 'K',
    'D1': 'J',
    'C2': 'H',
    'C1': 'G',
    'B2': 'E',
    'B1': 'D',
    'A2': 'B',
    'A1': 'A',
  };
  return approximationMap[category];
}
