/**
 * Treningsdagbok Types
 *
 * TypeScript interfaces for the Training Ledger (Dagbok) feature.
 * Based on AK_GOLF_KATEGORI_HIERARKI_v2.0.md
 */

import type {
  Pyramid,
  Area,
  LPhase,
  CSLevel,
  Environment,
  Pressure,
  Position,
  TournamentType,
  PhysicalFocus,
  PlayFocus,
  PuttingFocus,
} from '../../calendar/components/session-planner/hooks/useAKFormula';

// Re-export for convenience
export type {
  Pyramid,
  Area,
  LPhase,
  CSLevel,
  Environment,
  Pressure,
  Position,
  TournamentType,
  PhysicalFocus,
  PlayFocus,
  PuttingFocus,
};

// =============================================================================
// URL STATE TYPES
// =============================================================================

/** Period type for date range filtering */
export type DagbokPeriod = 'week' | 'month' | 'custom';

/** Plan type filter */
export type DagbokPlanType = 'all' | 'planned' | 'free';

/** URL query parameters for the dagbok page */
export interface DagbokUrlParams {
  // Hierarchy filters
  pyramid?: Pyramid;
  area?: Area;
  lPhase?: LPhase;
  m?: Environment;
  pr?: Pressure;
  cs?: CSLevel;
  p?: Position;
  tournamentType?: TournamentType;
  physicalFocus?: PhysicalFocus;
  playFocus?: PlayFocus;
  puttingFocus?: PuttingFocus;

  // Period/date
  period: DagbokPeriod;
  date: string; // YYYY-MM-DD
  endDate?: string; // For custom period

  // Classification
  planType: DagbokPlanType;

  // Search
  q?: string;
}

/** Complete dagbok state derived from URL */
export interface DagbokState {
  // Hierarchy filters
  pyramid: Pyramid | null;
  area: Area | null;
  lPhase: LPhase | null;
  environment: Environment | null;
  pressure: Pressure | null;
  csLevel: CSLevel | null;
  position: Position | null;
  tournamentType: TournamentType | null;
  physicalFocus: PhysicalFocus | null;
  playFocus: PlayFocus | null;
  puttingFocus: PuttingFocus | null;

  // Period
  period: DagbokPeriod;
  anchorDate: Date;
  rangeStart: Date;
  rangeEnd: Date;

  // Computed period info
  weekNumber: number;
  monthName: string;
  year: number;

  // Classification
  planType: DagbokPlanType;

  // Search
  searchQuery: string;
}

/** Actions for modifying dagbok state */
export interface DagbokActions {
  // Hierarchy setters
  setPyramid: (pyramid: Pyramid | null) => void;
  setArea: (area: Area | null) => void;
  setLPhase: (lPhase: LPhase | null) => void;
  setEnvironment: (environment: Environment | null) => void;
  setPressure: (pressure: Pressure | null) => void;
  setCSLevel: (csLevel: CSLevel | null) => void;
  setPosition: (position: Position | null) => void;
  setTournamentType: (type: TournamentType | null) => void;
  setPhysicalFocus: (focus: PhysicalFocus | null) => void;
  setPlayFocus: (focus: PlayFocus | null) => void;
  setPuttingFocus: (focus: PuttingFocus | null) => void;

  // Period/date
  setPeriod: (period: DagbokPeriod) => void;
  setDate: (date: Date) => void;
  setDateRange: (start: Date, end: Date) => void;
  goToToday: () => void;
  goToNext: () => void;
  goToPrev: () => void;

  // Classification
  setPlanType: (type: DagbokPlanType) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Reset
  resetFilters: () => void;
  resetAll: () => void;
}

// =============================================================================
// SESSION TYPES
// =============================================================================

/** Drill item within a session */
export interface DagbokDrill {
  id: string;
  name: string;
  description?: string;
  sets?: number;
  reps?: number;
  duration?: number; // minutes
  formula?: string;
  notes?: string;
}

/** Session entry in the dagbok */
export interface DagbokSession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm

  // Classification
  isPlanned: boolean; // true if dailyAssignmentId exists
  dailyAssignmentId?: string;

  // Hierarchy
  pyramid: Pyramid;
  area?: Area;
  lPhase?: LPhase;
  environment?: Environment;
  pressure?: Pressure;
  csLevel?: CSLevel;
  position?: Position;
  formula?: string;

  // Details
  title: string;
  description?: string;
  duration: number; // minutes
  drills: DagbokDrill[];

  // Drill totals
  totalSets: number;
  totalReps: number;

  // Rating/feedback
  rating?: number; // 1-5
  energyLevel?: number; // 1-5
  reflection?: string;
  coachFeedback?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/** Summary statistics for display */
export interface DagbokStats {
  totalSessions: number;
  totalMinutes: number;
  totalReps: number;
  avgRating: number;
  avgDuration: number;

  // Breakdown by pyramid
  byPyramid: Record<Pyramid, {
    sessions: number;
    minutes: number;
    reps: number;
  }>;

  // Compliance (planned vs actual)
  plannedSessions: number;
  completedPlanned: number;
  freeSessions: number;
  complianceRate: number; // 0-100
}

// =============================================================================
// HEATMAP TYPES
// =============================================================================

/** Intensity level for heatmap cells (0-4) */
export type HeatmapIntensity = 0 | 1 | 2 | 3 | 4;

/** Single cell in the weekly heatmap */
export interface HeatmapCell {
  day: number; // 0-6 (Mon-Sun)
  pyramid: Pyramid;
  minutes: number;
  sessions: number;
  intensity: HeatmapIntensity;
  plannedMinutes: number;
  complianceRate: number; // 0-100
}

/** Complete heatmap data for a week */
export interface WeeklyHeatmapData {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  cells: HeatmapCell[];

  // Totals per day
  dailyTotals: {
    day: number;
    dayName: string;
    minutes: number;
    sessions: number;
  }[];

  // Totals per pyramid
  pyramidTotals: Record<Pyramid, {
    minutes: number;
    sessions: number;
  }>;

  // Overall stats
  totalMinutes: number;
  totalSessions: number;
  avgMinutesPerDay: number;
}

// =============================================================================
// FILTER OPTION TYPES
// =============================================================================

/** Option for a filter dropdown */
export interface FilterOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: string;
}

/** Filter visibility based on hierarchy rules */
export interface FilterVisibility {
  showArea: boolean;
  showLPhase: boolean;
  showEnvironment: boolean;
  showPressure: boolean;
  showCS: boolean;
  showPosition: boolean;
  showTournamentType: boolean;
  showPhysicalFocus: boolean;
  showPlayFocus: boolean;
  showPuttingFocus: boolean;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/** Props for the filter bar */
export interface DagbokFilterBarProps {
  state: DagbokState;
  actions: DagbokActions;
  visibility: FilterVisibility;
  className?: string;
}

/** Props for hierarchy filters */
export interface DagbokHierarchyFiltersProps {
  state: DagbokState;
  actions: DagbokActions;
  visibility: FilterVisibility;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

/** Props for period filter */
export interface DagbokPeriodFilterProps {
  period: DagbokPeriod;
  anchorDate: Date;
  rangeStart: Date;
  rangeEnd: Date;
  weekNumber: number;
  monthName: string;
  year: number;
  onPeriodChange: (period: DagbokPeriod) => void;
  onDateChange: (date: Date) => void;
  onNext: () => void;
  onPrev: () => void;
  onToday: () => void;
  className?: string;
}

/** Props for the weekly heatmap */
export interface DagbokWeeklyHeatmapProps {
  data: WeeklyHeatmapData;
  isLoading?: boolean;
  onCellClick?: (cell: HeatmapCell) => void;
  className?: string;
}

/** Props for the compliance band */
export interface DagbokComplianceBandProps {
  plannedMinutes: number;
  actualMinutes: number;
  plannedSessions: number;
  actualSessions: number;
  complianceRate: number;
  className?: string;
}

/** Props for summary section */
export interface DagbokSummarySectionProps {
  stats: DagbokStats;
  isLoading?: boolean;
  className?: string;
}

/** Props for session row */
export interface DagbokSessionRowProps {
  session: DagbokSession;
  onClick?: (session: DagbokSession) => void;
  isExpanded?: boolean;
  className?: string;
}

/** Props for session list */
export interface DagbokSessionListProps {
  sessions: DagbokSession[];
  isLoading?: boolean;
  onSessionClick?: (session: DagbokSession) => void;
  emptyMessage?: string;
  className?: string;
}

// =============================================================================
// API TYPES
// =============================================================================

/** Query params for fetching sessions */
export interface DagbokSessionsQuery {
  startDate: string;
  endDate: string;
  pyramid?: Pyramid;
  area?: Area;
  lPhase?: LPhase;
  environment?: Environment;
  pressure?: Pressure;
  csLevel?: CSLevel;
  planType?: DagbokPlanType;
  search?: string;
  includeDrills?: boolean;
  limit?: number;
  offset?: number;
}

/** Response from sessions API */
export interface DagbokSessionsResponse {
  sessions: DagbokSession[];
  stats: DagbokStats;
  total: number;
  hasMore: boolean;
}
