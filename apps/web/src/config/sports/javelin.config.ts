/**
 * Javelin Sport Configuration
 *
 * Complete configuration for javelin throw as a sport in the multi-sport platform.
 *
 * @see types.ts for interface definitions
 */

import type {
  SportConfig,
  TrainingAreaGroup,
  Environment,
  TrainingPhase,
  IntensityLevel,
  PressureLevel,
  GoalCategory,
  PerformanceMetric,
  SportTerminology,
  Equipment,
  TestProtocol,
  SportNavigation,
  SessionConfig,
  PyramidCategory,
  SessionTemplate,
  BenchmarkConfig,
  SkillLevel,
} from './types';

// ============================================================================
// TRAINING AREAS
// ============================================================================

const trainingAreas: TrainingAreaGroup[] = [
  {
    code: 'throwing',
    label: 'Throwing',
    labelNO: 'Kast',
    icon: 'Target',
    areas: [
      { code: 'STANDING', label: 'Standing Throw', labelNO: 'Stående kast', icon: 'Target', description: 'Stationary throwing technique', descriptionNO: 'Stasjonær kastteknikk', usesIntensity: true },
      { code: 'THREE_STEP', label: '3-Step Approach', labelNO: '3-stegs tilløp', icon: 'ArrowRight', description: 'Short approach', descriptionNO: 'Kort tilløp', usesIntensity: true },
      { code: 'FIVE_STEP', label: '5-Step Approach', labelNO: '5-stegs tilløp', icon: 'ArrowRight', description: 'Medium approach', descriptionNO: 'Middels tilløp', usesIntensity: true },
      { code: 'FULL_APPROACH', label: 'Full Approach', labelNO: 'Fullt tilløp', icon: 'Zap', description: 'Complete run-up and throw', descriptionNO: 'Komplett tilløp og kast', usesIntensity: true },
    ],
  },
  {
    code: 'technique',
    label: 'Technique',
    labelNO: 'Teknikk',
    icon: 'Crosshair',
    areas: [
      { code: 'GRIP', label: 'Grip', labelNO: 'Grep', icon: 'Hand', description: 'Javelin grip technique', descriptionNO: 'Spydgrep teknikk', usesIntensity: false },
      { code: 'RELEASE', label: 'Release', labelNO: 'Utslipp', icon: 'ArrowUpRight', description: 'Release angle and timing', descriptionNO: 'Utslippsvinkel og timing', usesIntensity: true },
      { code: 'CROSSOVER', label: 'Crossover Steps', labelNO: 'Krysstrinn', icon: 'Footprints', description: 'Crossover footwork', descriptionNO: 'Krysstrinn teknikk', usesIntensity: true },
      { code: 'BLOCK', label: 'Block', labelNO: 'Blokk', icon: 'Shield', description: 'Blocking leg technique', descriptionNO: 'Blokkbein teknikk', usesIntensity: true },
    ],
  },
  {
    code: 'physical',
    label: 'Physical',
    labelNO: 'Fysisk',
    icon: 'Dumbbell',
    areas: [
      { code: 'SPEED', label: 'Speed', labelNO: 'Hurtighet', icon: 'Zap', description: 'Sprint and approach speed', descriptionNO: 'Sprint og tilløpsfart', usesIntensity: true },
      { code: 'POWER', label: 'Power', labelNO: 'Eksplosivitet', icon: 'Activity', description: 'Explosive power', descriptionNO: 'Eksplosiv kraft', usesIntensity: true },
      { code: 'STRENGTH', label: 'Strength', labelNO: 'Styrke', icon: 'Dumbbell', description: 'Throwing strength', descriptionNO: 'Kaststyrke', usesIntensity: true },
      { code: 'FLEXIBILITY', label: 'Flexibility', labelNO: 'Fleksibilitet', icon: 'Move', description: 'Shoulder and hip mobility', descriptionNO: 'Skulder- og hoftemobilitet', usesIntensity: false },
      { code: 'CORE', label: 'Core', labelNO: 'Kjernemuskulatur', icon: 'Shield', description: 'Core stability', descriptionNO: 'Kjernestabilitet', usesIntensity: false },
    ],
  },
  {
    code: 'implements',
    label: 'Implements',
    labelNO: 'Redskaper',
    icon: 'Settings',
    areas: [
      { code: 'MEDICINE_BALL', label: 'Medicine Ball', labelNO: 'Medisinball', icon: 'Circle', description: 'Medicine ball throws', descriptionNO: 'Medisinballkast', usesIntensity: true },
      { code: 'LIGHT_IMPLEMENT', label: 'Light Javelin', labelNO: 'Lett spyd', icon: 'ArrowRight', description: 'Underweight javelin', descriptionNO: 'Undervektsspyd', usesIntensity: true },
      { code: 'HEAVY_IMPLEMENT', label: 'Heavy Javelin', labelNO: 'Tungt spyd', icon: 'ArrowRight', description: 'Overweight javelin', descriptionNO: 'Overvektsspyd', usesIntensity: true },
    ],
  },
];

// ============================================================================
// ENVIRONMENTS
// ============================================================================

const environments: Environment[] = [
  { code: 'M0', label: 'Gym', labelNO: 'Gym', description: 'Strength and conditioning', descriptionNO: 'Styrke og kondisjon', icon: 'Dumbbell', type: 'indoor', competitionLevel: 0 },
  { code: 'M1', label: 'Indoor', labelNO: 'Innendørs', description: 'Indoor throwing area', descriptionNO: 'Innendørs kasthall', icon: 'Home', type: 'indoor', competitionLevel: 1 },
  { code: 'M2', label: 'Training Field', labelNO: 'Treningsfelt', description: 'Outdoor throwing area', descriptionNO: 'Utendørs kastfelt', icon: 'Square', type: 'outdoor', competitionLevel: 2 },
  { code: 'M3', label: 'Stadium', labelNO: 'Stadion', description: 'Athletics stadium', descriptionNO: 'Friidrettsstadion', icon: 'Circle', type: 'outdoor', competitionLevel: 3 },
  { code: 'M4', label: 'Practice Meet', labelNO: 'Prøvestevne', description: 'Practice competition', descriptionNO: 'Treningskonkurranse', icon: 'Target', type: 'outdoor', competitionLevel: 4 },
  { code: 'M5', label: 'Competition', labelNO: 'Konkurranse', description: 'Official competition', descriptionNO: 'Offisiell konkurranse', icon: 'Trophy', type: 'outdoor', competitionLevel: 5 },
];

// ============================================================================
// TRAINING PHASES
// ============================================================================

const phases: TrainingPhase[] = [
  { code: 'L-GPP', label: 'GPP', labelNO: 'GPP', description: 'General preparation', descriptionNO: 'Generell forberedelse', icon: 'Settings', intensityRange: 'MED', order: 1 },
  { code: 'L-SPP', label: 'SPP', labelNO: 'SPP', description: 'Specific preparation', descriptionNO: 'Spesifikk forberedelse', icon: 'Target', intensityRange: 'MED-HIGH', order: 2 },
  { code: 'L-PRECOMP', label: 'Pre-Competition', labelNO: 'Førkonkurranse', description: 'Technical refinement', descriptionNO: 'Teknisk finpuss', icon: 'TrendingUp', intensityRange: 'HIGH', order: 3 },
  { code: 'L-COMP', label: 'Competition', labelNO: 'Konkurranse', description: 'Competition phase', descriptionNO: 'Konkurransefase', icon: 'Trophy', intensityRange: 'PEAK', order: 4 },
  { code: 'L-TRANS', label: 'Transition', labelNO: 'Overgang', description: 'Active recovery', descriptionNO: 'Aktiv hvile', icon: 'Coffee', intensityRange: 'LOW', order: 5 },
];

// ============================================================================
// INTENSITY & PRESSURE LEVELS
// ============================================================================

const intensityLevels: IntensityLevel[] = [
  { code: 'REST', value: 0, label: 'Rest', labelNO: 'Hvile', description: 'Complete rest', descriptionNO: 'Fullstendig hvile' },
  { code: 'LOW', value: 40, label: 'Low', labelNO: 'Lav', description: 'Technical focus', descriptionNO: 'Teknisk fokus' },
  { code: 'MED', value: 60, label: 'Medium', labelNO: 'Middels', description: 'Moderate effort', descriptionNO: 'Moderat innsats' },
  { code: 'HIGH', value: 80, label: 'High', labelNO: 'Høy', description: 'Near competition', descriptionNO: 'Nær konkurranseinnsats' },
  { code: 'COMP', value: 95, label: 'Competition', labelNO: 'Konkurranse', description: 'Competition effort', descriptionNO: 'Konkurranseinnsats' },
  { code: 'MAX', value: 100, label: 'Maximum', labelNO: 'Maksimal', description: 'Maximum effort', descriptionNO: 'Maksimal innsats' },
];

const pressureLevels: PressureLevel[] = [
  { code: 'PR1', level: 1, label: 'None', labelNO: 'Ingen', description: 'Solo practice', descriptionNO: 'Solo trening', icon: 'Smile' },
  { code: 'PR2', level: 2, label: 'Technical', labelNO: 'Teknisk', description: 'Technique focus', descriptionNO: 'Teknikkfokus', icon: 'Target' },
  { code: 'PR3', level: 3, label: 'Group', labelNO: 'Gruppe', description: 'Group training', descriptionNO: 'Gruppetrening', icon: 'Users' },
  { code: 'PR4', level: 4, label: 'Simulated', labelNO: 'Simulert', description: 'Simulated competition', descriptionNO: 'Simulert konkurranse', icon: 'Timer' },
  { code: 'PR5', level: 5, label: 'Competition', labelNO: 'Konkurranse', description: 'Official meet', descriptionNO: 'Offisielt stevne', icon: 'Trophy' },
];

// ============================================================================
// GOAL CATEGORIES & METRICS
// ============================================================================

const goalCategories: GoalCategory[] = [
  { id: 'distance', name: 'Distance', nameNO: 'Lengde', icon: 'ArrowRight', color: 'blue', description: 'Throwing distance', descriptionNO: 'Kastlengde' },
  { id: 'technique', name: 'Technique', nameNO: 'Teknikk', icon: 'Target', color: 'green', description: 'Technical goals', descriptionNO: 'Tekniske mål' },
  { id: 'physical', name: 'Physical', nameNO: 'Fysisk', icon: 'Dumbbell', color: 'orange', description: 'Physical development', descriptionNO: 'Fysisk utvikling' },
  { id: 'competition', name: 'Competition', nameNO: 'Konkurranse', icon: 'Trophy', color: 'gold', description: 'Competition results', descriptionNO: 'Konkurranseresultater' },
];

const performanceMetrics: PerformanceMetric[] = [
  { id: 'best_throw', name: 'Best Throw', nameNO: 'Beste kast', unit: 'm', description: 'Personal best distance', descriptionNO: 'Personlig beste lengde', category: 'competition', higherIsBetter: true, benchmarks: { amateur: 35, intermediate: 50, advanced: 65, elite: 80, professional: 90 } },
  { id: 'approach_speed', name: 'Approach Speed', nameNO: 'Tilløpsfart', unit: 'm/s', description: 'Run-up speed', descriptionNO: 'Tilløpshastighet', category: 'technique', higherIsBetter: true, benchmarks: { amateur: 5.5, intermediate: 6.5, advanced: 7.5, elite: 8.0, professional: 8.5 } },
  { id: 'release_angle', name: 'Release Angle', nameNO: 'Utslippsvinkel', unit: '°', description: 'Optimal release angle', descriptionNO: 'Optimal utslippsvinkel', category: 'technique', higherIsBetter: false },
  { id: 'release_speed', name: 'Release Speed', nameNO: 'Utslippsfart', unit: 'm/s', description: 'Javelin release velocity', descriptionNO: 'Spydets utgangsfart', category: 'technique', higherIsBetter: true, benchmarks: { amateur: 18, intermediate: 23, advanced: 27, elite: 30, professional: 32 } },
  { id: 'standing_throw', name: 'Standing Throw', nameNO: 'Stående kast', unit: 'm', description: 'Standing throw distance', descriptionNO: 'Stående kastlengde', category: 'technique', higherIsBetter: true },
  { id: 'med_ball_throw', name: 'Medicine Ball Throw', nameNO: 'Medisinballkast', unit: 'm', description: '3kg medicine ball overhead throw', descriptionNO: '3kg medisinball over hodet', category: 'physical', higherIsBetter: true },
  { id: 'sprint_30m', name: '30m Sprint', nameNO: '30m sprint', unit: 'sec', description: '30m sprint time', descriptionNO: '30m sprinttid', category: 'physical', higherIsBetter: false, benchmarks: { amateur: 4.8, intermediate: 4.4, advanced: 4.1, elite: 3.9, professional: 3.7 } },
];

// ============================================================================
// EQUIPMENT & TEST PROTOCOLS
// ============================================================================

const equipment: Equipment[] = [
  { id: 'javelin_800g', name: 'Javelin 800g', nameNO: 'Spyd 800g', category: 'implement', icon: 'ArrowRight', description: 'Men\'s competition javelin' },
  { id: 'javelin_600g', name: 'Javelin 600g', nameNO: 'Spyd 600g', category: 'implement', icon: 'ArrowRight', description: 'Women\'s competition javelin' },
  { id: 'speed_radar', name: 'Speed Radar', nameNO: 'Fartsradar', category: 'measurement', icon: 'Radar', providesData: true, dataTypes: ['release_speed', 'approach_speed'] },
  { id: 'medicine_ball', name: 'Medicine Ball', nameNO: 'Medisinball', category: 'training', icon: 'Circle' },
];

const testProtocols: TestProtocol[] = [
  {
    id: 'standing_throw_test', testNumber: 1, name: 'Standing Throw Test', nameNO: 'Stående kast test', shortName: 'Standing', category: 'technique', icon: 'Target',
    description: 'Standing throw for technique', descriptionNO: 'Stående kast for teknikk', purpose: 'Measure arm speed', purposeNO: 'Måle armfart',
    methodology: ['6 throws from standing', 'Full effort', 'Best throw counts'], equipment: ['Javelin', 'Measuring tape'], duration: '15 min', attempts: 6, unit: 'meters', lowerIsBetter: false, formType: 'simple', calculationType: 'best',
    scoring: { excellent: { max: 50, label: 'Elite', color: 'gold' }, good: { max: 42, label: 'Advanced', color: 'green' }, average: { max: 35, label: 'Intermediate', color: 'blue' }, needsWork: { max: 28, label: 'Beginner', color: 'red' } },
    tips: ['Focus on release point', 'Drive through release', 'Full arm extension'],
  },
  {
    id: 'full_throw_test', testNumber: 2, name: 'Full Approach Test', nameNO: 'Fullt tilløp test', shortName: 'Full', category: 'speed', icon: 'Zap',
    description: 'Competition-style throws', descriptionNO: 'Konkurranseligkast', purpose: 'Measure competition ability', purposeNO: 'Måle konkurranseevne',
    methodology: ['Full approach', '6 throws', 'Competition rules'], equipment: ['Javelin', 'Runway', 'Sector'], duration: '30 min', attempts: 6, unit: 'meters', lowerIsBetter: false, formType: 'simple', calculationType: 'best',
    scoring: { excellent: { max: 75, label: 'Elite', color: 'gold' }, good: { max: 60, label: 'Advanced', color: 'green' }, average: { max: 48, label: 'Intermediate', color: 'blue' }, needsWork: { max: 38, label: 'Beginner', color: 'red' } },
    tips: ['Consistent approach rhythm', 'Accelerate into release', 'Follow through'],
  },
  {
    id: 'med_ball_test', testNumber: 3, name: 'Medicine Ball Test', nameNO: 'Medisinballtest', shortName: 'MedBall', category: 'strength', icon: 'Circle',
    description: 'Overhead throw power', descriptionNO: 'Kastekraft over hodet', purpose: 'Measure explosive power', purposeNO: 'Måle eksplosiv kraft',
    methodology: ['3kg medicine ball', 'Overhead throw', '3 attempts'], equipment: ['3kg medicine ball', 'Measuring tape'], duration: '10 min', attempts: 3, unit: 'meters', lowerIsBetter: false, formType: 'simple', calculationType: 'best',
    scoring: { excellent: { max: 16, label: 'Elite', color: 'gold' }, good: { max: 14, label: 'Advanced', color: 'green' }, average: { max: 12, label: 'Intermediate', color: 'blue' }, needsWork: { max: 10, label: 'Beginner', color: 'red' } },
    tips: ['Full hip extension', 'Drive from legs', 'Release at peak'],
  },
];

// ============================================================================
// TERMINOLOGY & SESSION CONFIG
// ============================================================================

const terminology: SportTerminology = {
  athlete: 'Thrower', athletePlural: 'Throwers', coach: 'Coach', coachPlural: 'Coaches',
  athleteNO: 'Kaster', athletePluralNO: 'Kastere', coachNO: 'Trener', coachPluralNO: 'Trenere',
  session: 'Session', sessionPlural: 'Sessions', practice: 'Practice', drill: 'Drill', drillPlural: 'Drills',
  sessionNO: 'Økt', sessionPluralNO: 'Økter', practiceNO: 'Trening', drillNO: 'Øvelse', drillPluralNO: 'Øvelser',
  competition: 'Meet', competitionPlural: 'Meets', match: 'Event', matchPlural: 'Events',
  competitionNO: 'Stevne', competitionPluralNO: 'Stevner', matchNO: 'Øvelse', matchPluralNO: 'Øvelser',
  score: 'Distance', result: 'Result', personalBest: 'Personal Best',
  scoreNO: 'Lengde', resultNO: 'Resultat', personalBestNO: 'Personlig rekord',
  throw: 'Throw', throwNO: 'Kast', approach: 'Approach', approachNO: 'Tilløp', release: 'Release', releaseNO: 'Utslipp',
};

const pyramidCategories: PyramidCategory[] = [
  { code: 'FYS', label: 'Physical', labelNO: 'Fysisk', description: 'Strength and power', descriptionNO: 'Styrke og kraft', icon: 'Dumbbell', color: 'rgb(var(--status-warning))', order: 1, usesIntensity: true },
  { code: 'TEK', label: 'Technique', labelNO: 'Teknikk', description: 'Throwing technique', descriptionNO: 'Kastteknikk', icon: 'Target', color: 'rgb(var(--category-j))', order: 2, usesIntensity: true },
  { code: 'FART', label: 'Speed', labelNO: 'Fart', description: 'Approach speed', descriptionNO: 'Tilløpsfart', icon: 'Zap', color: 'rgb(var(--status-info))', order: 3, usesIntensity: true },
  { code: 'KAST', label: 'Throwing', labelNO: 'Kast', description: 'Full throws', descriptionNO: 'Hele kast', icon: 'ArrowRight', color: 'rgb(var(--status-success))', order: 4, usesIntensity: true },
  { code: 'KOMP', label: 'Competition', labelNO: 'Konkurranse', description: 'Competition simulation', descriptionNO: 'Konkurransesimulering', icon: 'Trophy', color: 'rgb(var(--tier-gold))', order: 5, usesIntensity: true },
];

const sessionTemplates: SessionTemplate[] = [
  { id: 'technique', name: 'Technique Session', nameNO: 'Teknikkøkt', defaultDuration: 90, categoryCode: 'TEK', defaultAreas: ['STANDING', 'THREE_STEP', 'RELEASE'], defaultEnvironment: 'M2', icon: 'Target' },
  { id: 'full-throws', name: 'Full Throws', nameNO: 'Hele kast', defaultDuration: 90, categoryCode: 'KAST', defaultAreas: ['FULL_APPROACH'], defaultEnvironment: 'M2', icon: 'ArrowRight' },
  { id: 'strength', name: 'Strength Session', nameNO: 'Styrkeøkt', defaultDuration: 75, categoryCode: 'FYS', defaultAreas: ['STRENGTH', 'POWER', 'CORE'], defaultEnvironment: 'M0', icon: 'Dumbbell' },
  { id: 'speed', name: 'Speed Session', nameNO: 'Fartsøkt', defaultDuration: 60, categoryCode: 'FART', defaultAreas: ['SPEED', 'CROSSOVER'], defaultEnvironment: 'M2', icon: 'Zap' },
];

const sessions: SessionConfig = { pyramidCategories, templates: sessionTemplates, sessionTypes: ['training', 'test', 'tournament', 'recovery', 'physical', 'mental'], defaultDuration: 90, usesAKFormula: false };

// ============================================================================
// SKILL LEVELS & BENCHMARKS
// ============================================================================

const skillLevels: SkillLevel[] = [
  { code: 'K', label: 'Beginner', labelNO: 'Nybegynner', order: 1, color: '#9CA3AF', description: 'Learning basics' },
  { code: 'J', label: 'Novice', labelNO: 'Nybegynner+', order: 2, color: '#6B7280', description: 'Basic technique' },
  { code: 'I', label: 'Youth', labelNO: 'Ungdom', order: 3, color: '#8B5CF6', description: 'Youth level' },
  { code: 'H', label: 'Junior', labelNO: 'Junior', order: 4, color: '#A78BFA', description: 'Junior level' },
  { code: 'G', label: 'Club', labelNO: 'Klubb', order: 5, color: '#3B82F6', description: 'Club level' },
  { code: 'F', label: 'Regional', labelNO: 'Regional', order: 6, color: '#60A5FA', description: 'Regional meets' },
  { code: 'E', label: 'National', labelNO: 'Nasjonal', order: 7, color: '#10B981', description: 'National level' },
  { code: 'D', label: 'National Final', labelNO: 'NM-finale', order: 8, color: '#34D399', description: 'Championship level' },
  { code: 'C', label: 'International', labelNO: 'Internasjonal', order: 9, color: '#F59E0B', description: 'International meets' },
  { code: 'B', label: 'European', labelNO: 'Europeisk', order: 10, color: '#FBBF24', description: 'European level' },
  { code: 'A', label: 'World Class', labelNO: 'Verdensklasse', order: 11, color: '#EF4444', description: 'World level' },
];

const benchmarks: BenchmarkConfig = {
  skillLevels,
  levelBenchmarks: [
    { levelCode: 'A', benchmarks: [{ metricId: 'best_throw', value: 85, required: true }, { metricId: 'release_speed', value: 30 }] },
    { levelCode: 'B', benchmarks: [{ metricId: 'best_throw', value: 78, required: true }, { metricId: 'release_speed', value: 28 }] },
    { levelCode: 'E', benchmarks: [{ metricId: 'best_throw', value: 65, required: true }, { metricId: 'release_speed', value: 25 }] },
    { levelCode: 'G', benchmarks: [{ metricId: 'best_throw', value: 50, required: true }, { metricId: 'release_speed', value: 22 }] },
  ],
  source: 'World Athletics',
};

// ============================================================================
// NAVIGATION
// ============================================================================

const navigation: SportNavigation = {
  quickActions: [
    { label: 'Log Training', labelNO: 'Logg trening', icon: 'Plus', href: '/trening/logg', variant: 'primary' },
    { label: 'Register Test', labelNO: 'Registrer test', icon: 'Target', href: '/trening/testing/registrer', variant: 'secondary' },
    { label: 'View Calendar', labelNO: 'Se kalender', icon: 'Calendar', href: '/plan/kalender', variant: 'secondary' },
  ],
  testing: { hubPath: '/trening/testing', registerPath: '/trening/testing/registrer', resultsPath: '/analyse/tester', label: 'Test Protocol', labelNO: 'Testprotokoll' },
  itemOverrides: [],
};

// ============================================================================
// COMPLETE JAVELIN CONFIG
// ============================================================================

export const JAVELIN_CONFIG: SportConfig = {
  id: 'javelin',
  name: 'Javelin',
  nameNO: 'Spyd',
  icon: 'ArrowRight',
  color: '#F97316', // Orange

  trainingAreas,
  environments,
  phases,
  intensityLevels,
  pressureLevels,
  testProtocols,
  performanceMetrics,
  benchmarkSource: 'World Athletics',
  goalCategories,
  sessions,
  benchmarks,
  terminology,
  equipment,
  navigation,

  metadata: {
    implementWeights: { men: 800, women: 600 },
    runwayLength: 30,
    sectorAngle: 29,
    foulLine: true,
  },
};

export default JAVELIN_CONFIG;
