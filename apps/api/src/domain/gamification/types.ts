/**
 * AK Golf Academy - Gamification Type Definitions
 * Complete data model for metrics-based badge system
 */

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export enum BadgeTier {
  STANDARD = 'standard',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum BadgeCategory {
  VOLUME = 'volume',
  STREAK = 'streak',
  STRENGTH = 'strength',
  SPEED = 'speed',
  ACCURACY = 'accuracy',
  PUTTING = 'putting',
  SHORT_GAME = 'short_game',
  MENTAL = 'mental',
  PHASE = 'phase',
  MILESTONE = 'milestone',
  SEASONAL = 'seasonal',
}

export enum TrainingType {
  TEKNIKK = 'teknikk',
  GOLFSLAG = 'golfslag',
  SPILL = 'spill',
  KONKURRANSE = 'konkurranse',
  FYSISK = 'fysisk',
  MENTAL = 'mental',
  REST = 'rest',
}

export enum ClubType {
  DRIVER = 'driver',
  FAIRWAY_WOOD = 'fairway_wood',
  HYBRID = 'hybrid',
  LONG_IRON = 'long_iron',
  MID_IRON = 'mid_iron',
  SHORT_IRON = 'short_iron',
  WEDGE = 'wedge',
  PUTTER = 'putter',
}

export enum StrengthExercise {
  SQUAT = 'squat',
  DEADLIFT = 'deadlift',
  BENCH_PRESS = 'bench_press',
  OVERHEAD_PRESS = 'overhead_press',
  ROW = 'row',
  PULL_UP = 'pull_up',
  HIP_THRUST = 'hip_thrust',
  LUNGE = 'lunge',
  CABLE_ROTATION = 'cable_rotation',
  MED_BALL_THROW = 'med_ball_throw',
  PLANK = 'plank',
  RUSSIAN_TWIST = 'russian_twist',
}

export enum TrainingPhase {
  GRUNNLAG = 'grunnlag',       // Off-season / Base building
  OPPBYGGING = 'oppbygging',   // Pre-season / Build-up
  KONKURRANSE = 'konkurranse', // In-season / Competition
  OVERGANG = 'overgang',       // Transition / Recovery
}

export enum BadgeSymbol {
  FLAME = 'flame',
  TROPHY = 'trophy',
  STAR = 'star',
  TARGET = 'target',
  CLOCK = 'clock',
  CHECK = 'check',
  LIGHTNING = 'lightning',
  ZAP = 'zap',
  FLAG = 'flag',
  MEDAL = 'medal',
  DUMBBELL = 'dumbbell',
  BRAIN = 'brain',
  SUNRISE = 'sunrise',
  MOON = 'moon',
  SNOWFLAKE = 'snowflake',
  SUN = 'sun',
  BOOK = 'book',
  AWARD = 'award',
}

// ═══════════════════════════════════════════════════════════════
// CORE METRICS INTERFACES
// ═══════════════════════════════════════════════════════════════

/**
 * Volume metrics - hours and repetitions
 */
export interface VolumeMetrics {
  // Total hours
  totalHours: number;

  // Hours by training type
  hoursByType: Record<TrainingType, number>;

  // Session counts
  totalSessions: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  sessionsThisYear: number;

  // Completion rate
  completionRate: number; // 0-100%

  // Swings / repetitions
  totalSwings: number;
  swingsByClub: Record<ClubType, number>;

  // Drills
  totalDrillsCompleted: number;
  drillsByCategory: Record<string, number>;

  // Weekly/monthly tracking
  weeklyHours: number;
  monthlyHours: number;
  yearlyHours: number;
}

/**
 * Strength and fitness metrics
 */
export interface StrengthMetrics {
  // Total volume
  totalTonnage: number; // Total kg lifted all time
  weeklyTonnage: number;
  monthlyTonnage: number;

  // Bodyweight for relative calculations
  bodyweight: number;

  // Personal records
  prs: Record<StrengthExercise, PersonalRecord | null>;
  prCount: number;
  prCountThisMonth: number;

  // Relative strength (weight / bodyweight)
  relativeStrength: {
    squat: number;
    deadlift: number;
    benchPress: number;
  };

  // Golf-specific fitness
  golfFitness: GolfFitnessMetrics;

  // Gym consistency
  gymSessionsThisWeek: number;
  gymSessionsThisMonth: number;
  gymStreak: number;
}

export interface PersonalRecord {
  weight: number;
  reps: number;
  estimated1RM: number;
  achievedAt: Date;
  previousPR?: number;
  improvement?: number;
}

export interface GolfFitnessMetrics {
  // Power
  medBallThrow: number; // meters
  verticalJump: number; // cm
  broadJump: number; // cm

  // Mobility
  hipRotationLeft: number; // degrees
  hipRotationRight: number; // degrees
  thoracicRotation: number; // degrees
  shoulderMobility: number; // score 1-10

  // Stability
  singleLegBalanceLeft: number; // seconds
  singleLegBalanceRight: number; // seconds
  plankHold: number; // seconds

  // Speed
  clubheadSpeedDriver: number; // mph
  clubheadSpeed7Iron: number; // mph

  lastAssessmentDate: Date;
}

/**
 * Performance and scoring metrics
 */
export interface PerformanceMetrics {
  // Speed metrics
  speed: SpeedMetrics;

  // Accuracy metrics
  accuracy: AccuracyMetrics;

  // Putting metrics
  putting: PuttingMetrics;

  // Short game metrics
  shortGame: ShortGameMetrics;

  // Scoring
  scoring: ScoringMetrics;

  // Strokes gained (if available)
  strokesGained?: StrokesGainedMetrics;
}

export interface SpeedMetrics {
  // Current speeds
  driverSpeed: number; // mph
  sevenIronSpeed: number; // mph
  wedgeSpeed: number; // mph

  // Baseline (for improvement tracking)
  driverSpeedBaseline: number;
  baselineDate: Date;

  // Improvement
  speedImprovement: number; // mph gain from baseline

  // Ball speed
  driverBallSpeed: number;
  smashFactor: number;

  // Launch conditions
  launchAngle: number; // degrees
  spinRate: number; // rpm
}

export interface AccuracyMetrics {
  // Driving
  fairwayHitPct: number; // 0-100
  avgDrivingDistance: number; // yards
  drivingDispersion: number; // yards (std deviation)
  missDirection: 'left' | 'right' | 'balanced';

  // Approach
  girPct: number; // Greens in Regulation, 0-100
  avgProximity: number; // meters to hole
  proximityFrom100: number; // avg from 100 yards
  proximityFrom150: number; // avg from 150 yards

  // Round counts for statistical validity
  roundsTracked: number;
}

export interface PuttingMetrics {
  // Per round averages
  avgPuttsPerRound: number;

  // Putt rates
  onePuttPct: number; // 0-100
  threePuttPct: number; // 0-100

  // Make rates by distance
  makeRateInside3ft: number; // 0-100
  makeRate3to6ft: number;
  makeRate6to10ft: number;
  makeRate10to20ft: number;
  makeRateOver20ft: number;

  // First putt distance (lag putting)
  avgFirstPuttDistance: number; // feet

  // Practice metrics
  totalPuttingDrills: number;
  puttingDrillAccuracy: number; // 0-100
}

export interface ShortGameMetrics {
  // Up and down
  upAndDownPct: number; // 0-100
  sandSavePct: number; // 0-100
  scramblingPct: number; // 0-100

  // Proximity
  proximityFrom50: number; // avg from 50 yards
  proximityFrom30: number; // avg from 30 yards
  proximityChip: number; // avg from just off green

  // Practice
  totalShortGameDrills: number;
  shortGameDrillAccuracy: number;
}

export interface ScoringMetrics {
  // Best scores
  bestScore18: number;
  bestScore9: number;

  // Averages
  avgScore18: number;
  avgScoreLast10: number;
  avgScoreLast20: number;

  // Score distribution
  roundsUnder80: number;
  roundsUnder75: number;
  roundsUnder70: number;
  roundsUnderPar: number;

  // Handicap
  currentHandicap: number;
  lowHandicap: number;
  handicapTrend: 'improving' | 'stable' | 'declining';

  // Rounds played
  totalRoundsPlayed: number;
  competitiveRounds: number;
}

export interface StrokesGainedMetrics {
  total: number;
  offTheTee: number;
  approach: number;
  aroundTheGreen: number;
  putting: number;
  lastCalculated: Date;
}

/**
 * Streak and consistency metrics
 */
export interface StreakMetrics {
  // Current streaks
  currentStreak: number; // days
  longestStreak: number;

  // Weekly streaks
  perfectWeeks: number; // weeks with 100% completion
  consecutivePerfectWeeks: number;

  // Time-based
  earlyMorningSessions: number; // before 9am
  eveningSessions: number; // after 7pm
  weekendSessions: number;

  // Consistency score
  consistencyScore: number; // 0-100, based on variance

  // Last activity
  lastActiveDate: Date;
  daysActive: number;
}

/**
 * Phase and periodization metrics
 */
export interface PhaseMetrics {
  // Current phase
  currentPhase: TrainingPhase;
  phaseStartDate: Date;
  phaseEndDate: Date;
  daysInPhase: number;

  // Compliance
  phaseCompliance: number; // 0-100%
  volumeVsPlan: number; // actual/planned ratio
  intensityVsPlan: number;

  // History
  phasesCompleted: number;
  phaseHistory: PhaseRecord[];

  // Annual plan
  annualPlanCompliance: number;
  yearlyGoalsAchieved: number;
}

export interface PhaseRecord {
  phase: TrainingPhase;
  startDate: Date;
  endDate: Date;
  compliance: number;
  volumeCompleted: number;
  goalsAchieved: string[];
}

// ═══════════════════════════════════════════════════════════════
// AGGREGATED PLAYER METRICS
// ═══════════════════════════════════════════════════════════════

/**
 * Complete player metrics summary
 */
export interface PlayerMetrics {
  playerId: string;

  // Core metrics
  volume: VolumeMetrics;
  strength: StrengthMetrics;
  performance: PerformanceMetrics;
  streaks: StreakMetrics;
  phase: PhaseMetrics;

  // XP and Level
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastCalculated: Date;
}

// ═══════════════════════════════════════════════════════════════
// BADGE SYSTEM INTERFACES
// ═══════════════════════════════════════════════════════════════

/**
 * Badge definition - static configuration
 */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  symbol: BadgeSymbol;
  tier: BadgeTier;
  xp: number;

  // Unlock requirements
  requirements: BadgeRequirement[];

  // For tiered badges (e.g., "Putter I", "Putter II")
  level?: number;
  maxLevel?: number;

  // Seasonal/limited badges
  isLimited?: boolean;
  availableFrom?: Date;
  availableUntil?: Date;

  // Display
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface BadgeRequirement {
  type: BadgeRequirementType;
  metric: string; // Path to metric, e.g., "volume.totalHours"
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
  value: number;
  description: string;
}

export type BadgeRequirementType =
  | 'volume_hours'
  | 'volume_sessions'
  | 'volume_swings'
  | 'streak_days'
  | 'streak_weeks'
  | 'strength_tonnage'
  | 'strength_pr'
  | 'strength_relative'
  | 'fitness_test'
  | 'speed_absolute'
  | 'speed_improvement'
  | 'accuracy_fairway'
  | 'accuracy_gir'
  | 'putting_avg'
  | 'putting_rate'
  | 'score_absolute'
  | 'score_under'
  | 'phase_compliance'
  | 'phase_complete'
  | 'milestone';

/**
 * Player's badge progress
 */
export interface BadgeProgress {
  badgeId: string;
  playerId: string;

  // Status
  earned: boolean;
  earnedAt?: Date;

  // Progress (0-100)
  progress: number;

  // Individual requirement progress
  requirementProgress: RequirementProgress[];

  // Display state
  isNew: boolean; // Just unlocked, not yet viewed
  viewedAt?: Date;
}

export interface RequirementProgress {
  requirementIndex: number;
  currentValue: number;
  targetValue: number;
  progress: number; // 0-100
  completed: boolean;
}

/**
 * Badge unlock event
 */
export interface BadgeUnlockEvent {
  playerId: string;
  badgeId: string;
  badge: BadgeDefinition;
  xpAwarded: number;
  unlockedAt: Date;
  triggerMetric: string;
  triggerValue: number;
}

// ═══════════════════════════════════════════════════════════════
// TRAINING SESSION INTERFACES
// ═══════════════════════════════════════════════════════════════

/**
 * Training session input
 */
export interface TrainingSessionInput {
  playerId: string;
  type: TrainingType;
  date: Date;
  duration: number; // minutes

  // Optional details
  plannedDuration?: number;
  intensity?: number; // 1-10
  rating?: number; // 1-5 satisfaction
  notes?: string;

  // Golf-specific
  swingCount?: number;
  clubsUsed?: ClubType[];
  drillsCompleted?: DrillRecord[];

  // Gym-specific
  exercises?: ExerciseRecord[];

  // Performance data
  launchMonitorData?: LaunchMonitorSession;
}

export interface DrillRecord {
  drillId: string;
  drillName: string;
  reps: number;
  successRate?: number; // 0-100
  duration?: number; // minutes
}

export interface ExerciseRecord {
  exercise: StrengthExercise;
  sets: SetRecord[];
}

export interface SetRecord {
  reps: number;
  weight: number; // kg
  rpe?: number; // Rate of Perceived Exertion, 1-10
  isWarmup?: boolean;
}

export interface LaunchMonitorSession {
  device: 'trackman' | 'gc_quad' | 'mevo' | 'other';
  shots: LaunchMonitorShot[];
}

export interface LaunchMonitorShot {
  club: ClubType;
  clubheadSpeed: number;
  ballSpeed: number;
  launchAngle: number;
  spinRate: number;
  carryDistance: number;
  totalDistance: number;
  offline: number; // yards left(-) or right(+)
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD AND SOCIAL
// ═══════════════════════════════════════════════════════════════

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  rank: number;
  value: number;
  change: number; // position change from previous period
  tier?: BadgeTier;
}

export interface LeaderboardConfig {
  id: string;
  name: string;
  metric: string;
  period: 'weekly' | 'monthly' | 'yearly' | 'all_time';
  category?: BadgeCategory;
  minSessions?: number; // minimum sessions to qualify
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface PlayerMetricsResponse {
  metrics: PlayerMetrics;
  badges: {
    earned: BadgeProgress[];
    inProgress: BadgeProgress[];
    locked: BadgeProgress[];
  };
  recentUnlocks: BadgeUnlockEvent[];
  level: {
    current: number;
    xp: number;
    xpToNext: number;
    progress: number;
  };
}

export interface SessionCompleteResponse {
  session: TrainingSessionInput;
  metricsUpdated: Partial<PlayerMetrics>;
  badgesUnlocked: BadgeUnlockEvent[];
  badgesProgressed: BadgeProgress[];
  xpGained: number;
  newPRs?: PersonalRecord[];
}

export interface BadgeListResponse {
  categories: {
    category: BadgeCategory;
    name: string;
    badges: BadgeWithProgress[];
    earnedCount: number;
    totalCount: number;
  }[];
  summary: {
    totalEarned: number;
    totalAvailable: number;
    totalXP: number;
    recentUnlocks: BadgeUnlockEvent[];
  };
}

export interface BadgeWithProgress extends BadgeDefinition {
  progress: BadgeProgress;
}
