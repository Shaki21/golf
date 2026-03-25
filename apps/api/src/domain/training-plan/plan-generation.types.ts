/**
 * Training Plan Generation Types
 * Types for 12-month training plan generation
 */

export interface GenerateAnnualPlanInput {
  playerId: string;
  tenantId: string;
  startDate: Date;

  // Player baseline data
  baselineAverageScore: number;
  baselineHandicap?: number;
  baselineDriverSpeed?: number;

  // Optional overrides
  planName?: string;
  weeklyHoursTarget?: number;
  tournaments?: TournamentInput[];

  // Generation options
  includeRestDays?: boolean;
  preferredTrainingDays?: number[]; // 0=Sunday, 1=Monday, etc.
  excludeDates?: Date[];
}

export interface TournamentInput {
  name: string;
  startDate: Date;
  endDate: Date;
  importance: 'A' | 'B' | 'C'; // A=Major, B=Important, C=Minor
  tournamentId?: string;
}

export interface AnnualPlanGenerationResult {
  annualPlan: {
    id: string;
    playerId: string;
    planName: string;
    startDate: Date;
    endDate: Date;
    playerCategory: string;
    basePeriodWeeks: number;
    specializationWeeks: number;
    tournamentWeeks: number;
  };
  periodizations: {
    created: number;
    weekRange: { from: number; to: number };
  };
  dailyAssignments: {
    created: number;
    dateRange: { from: Date; to: Date };
    sessionsByType: Record<string, number>;
  };
  tournaments: {
    scheduled: number;
    list: Array<{
      name: string;
      startDate: Date;
      importance: string;
    }>;
  };
  breakingPoints: {
    linked: number;
  };
  /** V2: Category constraints analysis */
  categoryConstraints?: {
    currentCategory: string;
    totalGap: number;
    canAdvance: boolean;
    topBindingConstraints: Array<{
      domain: string;
      currentValue: number;
      requiredValue: number;
      gapPercent: number;
      priority: number;
    }>;
  } | null;
}

export interface DailyAssignmentContext {
  playerId: string;
  tenantId: string;
  annualPlanId: string;
  date: Date;
  weekNumber: number;
  dayOfWeek: number;

  // Periodization context
  period: 'E' | 'G' | 'S' | 'T';
  periodPhase: 'base' | 'specialization' | 'tournament' | 'recovery';
  weekInPeriod: number;
  learningPhases: string[]; // Available learning phases for this period
  settings: string[]; // Available settings for this period

  // Player context
  clubSpeedLevel: string;
  breakingPointIds: string[];

  // Training context
  targetHoursThisWeek: number;
  hoursAllocatedSoFar: number;
  intensity: string;

  // Flags
  isRestDay: boolean;
  isTournamentWeek: boolean;
  isTaperingWeek: boolean;
  isToppingWeek: boolean;
}

export interface SessionSelectionCriteria {
  period: string;
  learningPhases: string[];
  clubSpeed: string;
  settings: string[];
  breakingPointIds: string[];
  targetDuration: number;
  intensity: string;
  excludeTemplateIds: string[]; // Recently used templates
}

/**
 * V2: Selection reasons explaining WHY a session was chosen
 * Provides transparency for coach review and debugging
 */
export interface SelectionReasons {
  domainMatch: boolean;       // Template trains a domain with active BP
  constraintMatch: boolean;   // Template trains a top-2 binding constraint
  periodizationFit: number;   // 0-100 score for period/phase match
  proofCoverage: boolean;     // Template includes proof-metric exercise
  scoreBreakdown?: {
    periodMatch: number;
    learningPhaseMatch: number;
    durationMatch: number;
    domainCoverageBonus: number;
    constraintRelevance: number;
    proofProgressBonus: number;
    recentUsagePenalty: number;
  };
}

export interface SelectedSession {
  sessionTemplateId: string;
  sessionType: string;
  estimatedDuration: number;
  learningPhase: string;
  setting: string;
  period: string;
  priority: number; // Higher = more relevant to breaking points
  /** V2: Explains why this session was selected */
  selectionReasons?: SelectionReasons;
}

export interface WeeklyPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  periodPhase: string;
  targetHours: number;
  assignments: DailyAssignmentPreview[];
}

export interface DailyAssignmentPreview {
  date: Date;
  dayOfWeek: number;
  sessionType: string;
  estimatedDuration: number;
  isRestDay: boolean;
  period: string;
}

export interface TournamentSchedule {
  tournamentId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  weekNumber: number;
  importance: 'A' | 'B' | 'C';

  // Preparation periods
  toppingStartWeek: number;
  toppingDurationWeeks: number;
  taperingStartDate: Date;
  taperingDurationDays: number;

  focusAreas: string[];
}

export interface PeriodizationWeek {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  period: 'E' | 'G' | 'S' | 'T';
  periodPhase: 'base' | 'specialization' | 'tournament' | 'recovery';
  weekInPeriod: number;
  learningPhases: string[];
  volumeIntensity: string;
  targetHours: number;
}
