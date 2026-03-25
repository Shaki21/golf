/**
 * Sport Configuration Types
 *
 * Multi-sport architecture foundation.
 * These types define the structure for sport-specific configurations
 * that can be swapped at runtime for different sports.
 *
 * Supported sports (planned):
 * - Golf (current)
 * - Running
 * - Handball
 * - Football
 * - Javelin
 * - etc.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type SportId = 'golf' | 'running' | 'handball' | 'football' | 'javelin' | 'tennis' | 'swimming';

export interface SportConfig {
  id: SportId;
  name: string;
  nameNO: string;
  icon: string;
  color: string;

  // Training structure
  trainingAreas: TrainingAreaGroup[];
  environments: Environment[];
  phases: TrainingPhase[];
  intensityLevels: IntensityLevel[];
  pressureLevels: PressureLevel[];

  // Testing & metrics
  testProtocols: TestProtocol[];
  performanceMetrics: PerformanceMetric[];
  benchmarkSource?: string;

  // Goals & categories
  goalCategories: GoalCategory[];

  // Session configuration
  sessions?: SessionConfig;

  // Skill levels & benchmarks
  benchmarks?: BenchmarkConfig;

  // Terminology
  terminology: SportTerminology;

  // Equipment (optional)
  equipment?: Equipment[];

  // Navigation customization
  navigation?: SportNavigation;

  // Sport-specific metadata
  metadata?: Record<string, unknown>;
}

// ============================================================================
// NAVIGATION
// ============================================================================

export interface QuickAction {
  label: string;
  labelNO?: string;
  icon: string;
  href: string;
  variant: 'primary' | 'secondary' | 'success';
}

export interface NavItemOverride {
  /** Target path to override */
  targetHref: string;
  /** New label (optional) */
  label?: string;
  labelNO?: string;
  /** New description (optional) */
  description?: string;
  descriptionNO?: string;
  /** New icon (optional) */
  icon?: string;
  /** Hide this item entirely */
  hidden?: boolean;
}

export interface SportNavigation {
  /** Quick actions shown on dashboard */
  quickActions: QuickAction[];
  /** Override specific navigation items */
  itemOverrides?: NavItemOverride[];
  /** Testing section configuration */
  testing: {
    /** Hub page path */
    hubPath: string;
    /** Register test path */
    registerPath: string;
    /** Results path */
    resultsPath: string;
    /** Label for testing section */
    label: string;
    labelNO?: string;
  };
}

// ============================================================================
// SESSION & PYRAMID CATEGORIES
// ============================================================================

export interface PyramidCategory {
  code: string;
  label: string;
  labelNO?: string;
  description: string;
  descriptionNO?: string;
  icon: string;
  color: string;
  /** Order in pyramid (1 = base/foundation) */
  order: number;
  /** Whether this category uses intensity/speed tracking */
  usesIntensity?: boolean;
  /** Whether this category uses position tracking */
  usesPosition?: boolean;
}

export interface SessionTemplate {
  id: string;
  name: string;
  nameNO?: string;
  description?: string;
  descriptionNO?: string;
  /** Default duration in minutes */
  defaultDuration: number;
  /** Category code (links to PyramidCategory) */
  categoryCode: string;
  /** Default training area codes */
  defaultAreas?: string[];
  /** Default environment code */
  defaultEnvironment?: string;
  /** Icon for this template */
  icon: string;
}

export type SessionType = 'training' | 'test' | 'tournament' | 'recovery' | 'physical' | 'mental';
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';

export interface SessionConfig {
  /** Pyramid categories for this sport */
  pyramidCategories: PyramidCategory[];
  /** Pre-defined session templates */
  templates: SessionTemplate[];
  /** Available session types */
  sessionTypes: SessionType[];
  /** Default session duration in minutes */
  defaultDuration: number;
  /** Whether to track AK-formula components */
  usesAKFormula?: boolean;
}

// ============================================================================
// TRAINING AREAS
// ============================================================================

export interface TrainingArea {
  code: string;
  label: string;
  labelNO?: string;
  icon: string;
  description: string;
  descriptionNO?: string;
  /** Whether this area uses intensity/speed tracking */
  usesIntensity?: boolean;
  /** Parent group code */
  groupCode?: string;
}

export interface TrainingAreaGroup {
  code: string;
  label: string;
  labelNO?: string;
  icon?: string;
  areas: TrainingArea[];
}

// ============================================================================
// ENVIRONMENTS
// ============================================================================

export interface Environment {
  code: string;
  label: string;
  labelNO?: string;
  description: string;
  descriptionNO?: string;
  icon: string;
  /** Indoor/outdoor/mixed */
  type: 'indoor' | 'outdoor' | 'mixed';
  /** Competition level: 0 = practice, 5 = competition */
  competitionLevel: number;
}

// ============================================================================
// TRAINING PHASES
// ============================================================================

export interface TrainingPhase {
  code: string;
  label: string;
  labelNO?: string;
  description: string;
  descriptionNO?: string;
  icon: string;
  /** Recommended intensity range */
  intensityRange?: string;
  /** Order in progression */
  order: number;
}

// ============================================================================
// INTENSITY & PRESSURE
// ============================================================================

export interface IntensityLevel {
  code: string;
  value: number;
  label: string;
  labelNO?: string;
  description: string;
  descriptionNO?: string;
}

export interface PressureLevel {
  code: string;
  level: number;
  label: string;
  labelNO?: string;
  description: string;
  descriptionNO?: string;
  icon: string;
}

// ============================================================================
// TEST PROTOCOLS
// ============================================================================

export type TestCategory =
  | 'speed'
  | 'distance'
  | 'accuracy'
  | 'endurance'
  | 'strength'
  | 'technique'
  | 'mental'
  | 'tactical'
  | 'physical'
  | 'scoring'
  | 'short_game'
  | 'putting';

export type FormType = 'simple' | 'percentage' | 'table' | 'round' | 'timed' | 'repetitions';
export type CalculationType = 'best' | 'average' | 'averageBest3' | 'percentage' | 'pei' | 'stddev' | 'direct' | 'sum';

export interface ScoringThreshold {
  max: number;
  label: string;
  labelNO?: string;
  color: string;
}

export interface ScoringThresholds {
  excellent: ScoringThreshold;
  good: ScoringThreshold;
  average: ScoringThreshold;
  needsWork: ScoringThreshold;
}

export interface TestProtocol {
  id: string;
  testNumber: number;
  name: string;
  nameNO?: string;
  shortName: string;
  category: TestCategory;
  icon: string;
  description: string;
  descriptionNO?: string;
  purpose: string;
  purposeNO?: string;
  methodology: string[];
  equipment: string[];
  duration: string;
  attempts: number;
  unit: string;
  lowerIsBetter: boolean;
  formType: FormType;
  calculationType: CalculationType;
  scoring: ScoringThresholds;
  tips: string[];
  formConfig?: {
    columns?: ColumnDef[];
    distances?: number[];
    targetWidth?: number;
    holes?: number;
    [key: string]: unknown;
  };
}

export interface ColumnDef {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  unit?: string;
  options?: { id: string; label: string; color?: string }[];
  required?: boolean;
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface PerformanceMetric {
  id: string;
  name: string;
  nameNO?: string;
  unit: string;
  description: string;
  descriptionNO?: string;
  category: string;
  /** Higher is better (true) or lower is better (false) */
  higherIsBetter: boolean;
  /** Benchmark values by level */
  benchmarks?: {
    amateur?: number;
    intermediate?: number;
    advanced?: number;
    elite?: number;
    professional?: number;
  };
  /** Calculation method if derived */
  calculation?: string;
}

// ============================================================================
// GOALS
// ============================================================================

export interface GoalCategory {
  id: string;
  name: string;
  nameNO?: string;
  icon: string;
  color: string;
  description?: string;
  descriptionNO?: string;
}

// ============================================================================
// EQUIPMENT
// ============================================================================

export interface Equipment {
  id: string;
  name: string;
  nameNO?: string;
  category: string;
  icon?: string;
  description?: string;
  /** Whether this equipment provides data (e.g., TrackMan, GPS watch) */
  providesData?: boolean;
  /** Data types this equipment can provide */
  dataTypes?: string[];
}

// ============================================================================
// TERMINOLOGY
// ============================================================================

export interface SportTerminology {
  // Roles
  athlete: string;
  athletePlural: string;
  coach: string;
  coachPlural: string;

  // Training
  session: string;
  sessionPlural: string;
  practice: string;
  drill: string;
  drillPlural: string;

  // Competition
  competition: string;
  competitionPlural: string;
  match: string;
  matchPlural: string;

  // Performance
  score: string;
  result: string;
  personalBest: string;

  // Sport-specific terms (extensible)
  [key: string]: string;
}

// ============================================================================
// SKILL LEVELS & BENCHMARKS
// ============================================================================

export interface SkillLevel {
  code: string;
  label: string;
  labelNO?: string;
  description?: string;
  descriptionNO?: string;
  /** Order from beginner (1) to elite (highest) */
  order: number;
  /** Color for UI */
  color: string;
  /** Icon name */
  icon?: string;
}

export interface MetricBenchmark {
  /** Metric ID this benchmark applies to */
  metricId: string;
  /** Target value for this skill level */
  value: number;
  /** Whether meeting this is required for the level */
  required?: boolean;
}

export interface SkillLevelBenchmarks {
  /** Skill level code */
  levelCode: string;
  /** Benchmarks for this level */
  benchmarks: MetricBenchmark[];
  /** Test requirements for this level */
  testRequirements?: {
    testId: string;
    targetValue: number;
    /** 'min' = must be >= value, 'max' = must be <= value */
    comparison: 'min' | 'max';
  }[];
}

export interface BenchmarkConfig {
  /** Available skill levels for this sport */
  skillLevels: SkillLevel[];
  /** Benchmarks per skill level */
  levelBenchmarks: SkillLevelBenchmarks[];
  /** Data source for benchmarks (e.g., 'DataGolf', 'WorldAthletics') */
  source?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type SportConfigKey = keyof SportConfig;

export interface PartialSportConfig extends Partial<SportConfig> {
  id: SportId;
  name: string;
}
