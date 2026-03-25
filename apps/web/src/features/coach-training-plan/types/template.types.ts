/**
 * Training Plan Template Types
 * Type definitions for reusable training plan templates
 */

export type TemplateCategory = 'technique' | 'fitness' | 'mental' | 'competition-prep' | 'recovery' | 'custom';
export type TemplateLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type TrainingPhase = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type TrainingEnvironment = 'C1' | 'C2' | 'C3' | 'C4';

/**
 * Main training plan template
 */
export interface TrainingPlanTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  durationWeeks: number;
  targetLevel: TemplateLevel;
  sessions: TemplateSession[];
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Individual session within a template
 */
export interface TemplateSession {
  id: string;
  weekNumber: number; // 1-based (Week 1, Week 2, etc.)
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  name: string;
  description?: string;
  durationMinutes: number;
  categories: string[]; // TEE, APP, SGR, PGR, GBR
  phase?: TrainingPhase; // L1-L5
  environment?: TrainingEnvironment; // C1-C4
  cognitiveSkillsLevel?: string; // CS1-CS5
  pressureLevel?: string; // PR1-PR5
  exercises?: TemplateExercise[];
  notes?: string;
}

/**
 * Exercise within a session
 */
export interface TemplateExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  notes?: string;
  videoUrl?: string;
  category?: string;
}

/**
 * Template application options
 */
export interface TemplateApplicationOptions {
  skipWeekends?: boolean;
  adjustForExistingSessions?: boolean;
  startDate: string; // ISO date
  athleteIds: string[];
  customizePerAthlete?: boolean;
}

/**
 * Template application result
 */
export interface TemplateApplicationResult {
  success: boolean;
  sessionsCreated: number;
  conflictsFound?: number;
  errors?: string[];
  athleteResults: {
    athleteId: string;
    athleteName: string;
    sessionsCreated: number;
    conflicts: {
      date: string;
      existingSession: string;
      templateSession: string;
    }[];
  }[];
}

/**
 * Template filter options
 */
export interface TemplateFilters {
  category?: TemplateCategory;
  level?: TemplateLevel;
  minWeeks?: number;
  maxWeeks?: number;
  searchTerm?: string;
  tags?: string[];
  createdBy?: string;
  isPublic?: boolean;
}

/**
 * Pre-built template configuration
 */
export interface PrebuiltTemplate {
  name: string;
  description: string;
  category: TemplateCategory;
  level: TemplateLevel;
  durationWeeks: number;
  tags: string[];
  sessions: Omit<TemplateSession, 'id'>[];
}

/**
 * Period Planning Types
 * For macro-level view and training periodization
 */

export type PeriodType =
  | 'preparation'   // Initial phase, building foundation
  | 'base'          // Building volume and endurance
  | 'build'         // Increasing intensity
  | 'competition'   // Peak performance
  | 'taper'         // Pre-competition reduction
  | 'recovery'      // Active recovery phase
  | 'transition';   // Off-season transition

/**
 * Period block within a template
 */
export interface TemplatePeriod {
  id: string;
  type: PeriodType;
  name: string;
  description?: string;
  startWeek: number; // 1-based week number
  endWeek: number;   // 1-based week number (inclusive)
  color: string;     // Hex color for visualization
  goals?: string[];
  focusAreas?: string[]; // e.g., ['TEE', 'APP']
  intensityTarget?: 'low' | 'moderate' | 'high';
}

/**
 * Weekly aggregated metrics
 */
export interface WeeklyMetrics {
  weekNumber: number;
  weekStart: string; // ISO date
  weekEnd: string;   // ISO date
  totalMinutes: number;
  sessionCount: number;
  avgSessionDuration: number;
  categoryBreakdown: Record<string, {
    minutes: number;
    sessions: number;
    percentage: number;
  }>;
  daysWithSessions: number;
  loadScore: number; // 0-100 normalized load
  periodId?: string; // Associated period if exists
}

/**
 * Period-level aggregated metrics
 */
export interface PeriodMetrics {
  periodId: string;
  periodType: PeriodType;
  weekCount: number;
  totalMinutes: number;
  totalSessions: number;
  avgMinutesPerWeek: number;
  avgSessionsPerWeek: number;
  avgLoadScore: number;
  categoryBreakdown: Record<string, {
    minutes: number;
    sessions: number;
    percentage: number;
  }>;
  peakWeek: {
    weekNumber: number;
    minutes: number;
    loadScore: number;
  };
  lowestWeek: {
    weekNumber: number;
    minutes: number;
    loadScore: number;
  };
}

/**
 * Macro view data structure
 */
export interface MacroPlanData {
  template: TrainingPlanTemplate;
  periods: TemplatePeriod[];
  weeklyMetrics: WeeklyMetrics[];
  periodMetrics: PeriodMetrics[];
  totalLoad: {
    totalMinutes: number;
    totalSessions: number;
    avgWeeklyMinutes: number;
    avgWeeklySessions: number;
  };
}
