/**
 * Swimming Sport Configuration
 *
 * Complete configuration for swimming as a sport in the multi-sport platform.
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
    code: 'strokes',
    label: 'Strokes',
    labelNO: 'Svømmearter',
    icon: 'Activity',
    areas: [
      { code: 'FREESTYLE', label: 'Freestyle', labelNO: 'Fri', icon: 'ArrowRight', description: 'Freestyle/crawl technique', descriptionNO: 'Crawl-teknikk', usesIntensity: true },
      { code: 'BACKSTROKE', label: 'Backstroke', labelNO: 'Rygg', icon: 'ArrowLeft', description: 'Backstroke technique', descriptionNO: 'Ryggteknikk', usesIntensity: true },
      { code: 'BREASTSTROKE', label: 'Breaststroke', labelNO: 'Bryst', icon: 'Heart', description: 'Breaststroke technique', descriptionNO: 'Brystteknikk', usesIntensity: true },
      { code: 'BUTTERFLY', label: 'Butterfly', labelNO: 'Butterfly', icon: 'Zap', description: 'Butterfly technique', descriptionNO: 'Butterfly-teknikk', usesIntensity: true },
      { code: 'IM', label: 'Individual Medley', labelNO: 'Medley', icon: 'RefreshCw', description: 'All four strokes', descriptionNO: 'Alle fire svømmearter', usesIntensity: true },
    ],
  },
  {
    code: 'skills',
    label: 'Skills',
    labelNO: 'Ferdigheter',
    icon: 'Target',
    areas: [
      { code: 'STARTS', label: 'Starts', labelNO: 'Starter', icon: 'Zap', description: 'Dive and push starts', descriptionNO: 'Stup- og støt-starter', usesIntensity: true },
      { code: 'TURNS', label: 'Turns', labelNO: 'Vendinger', icon: 'RotateCw', description: 'Flip and open turns', descriptionNO: 'Rulle- og åpne vendinger', usesIntensity: true },
      { code: 'UNDERWATER', label: 'Underwater', labelNO: 'Undervann', icon: 'Droplet', description: 'Underwater dolphin kicks', descriptionNO: 'Delfinpark under vann', usesIntensity: true },
      { code: 'FINISH', label: 'Finish', labelNO: 'Finish', icon: 'Flag', description: 'Touch finish technique', descriptionNO: 'Touchteknikk', usesIntensity: true },
    ],
  },
  {
    code: 'training',
    label: 'Training Types',
    labelNO: 'Treningstyper',
    icon: 'Activity',
    areas: [
      { code: 'ENDURANCE', label: 'Endurance', labelNO: 'Utholdenhet', icon: 'Heart', description: 'Aerobic base', descriptionNO: 'Aerob base', usesIntensity: true },
      { code: 'THRESHOLD', label: 'Threshold', labelNO: 'Terskel', icon: 'TrendingUp', description: 'Lactate threshold', descriptionNO: 'Laktatterskel', usesIntensity: true },
      { code: 'SPRINT', label: 'Sprint', labelNO: 'Sprint', icon: 'Zap', description: 'Maximum speed', descriptionNO: 'Maksimal fart', usesIntensity: true },
      { code: 'RACE_PACE', label: 'Race Pace', labelNO: 'Konkurransefart', icon: 'Timer', description: 'Goal pace training', descriptionNO: 'Målfart-trening', usesIntensity: true },
    ],
  },
  {
    code: 'dryland',
    label: 'Dryland',
    labelNO: 'Tørrtrening',
    icon: 'Dumbbell',
    areas: [
      { code: 'STRENGTH', label: 'Strength', labelNO: 'Styrke', icon: 'Dumbbell', description: 'Weight training', descriptionNO: 'Styrketrening', usesIntensity: true },
      { code: 'CORE', label: 'Core', labelNO: 'Kjernemuskulatur', icon: 'Shield', description: 'Core stability', descriptionNO: 'Kjernestabilitet', usesIntensity: false },
      { code: 'FLEXIBILITY', label: 'Flexibility', labelNO: 'Fleksibilitet', icon: 'Move', description: 'Stretching and mobility', descriptionNO: 'Tøying og mobilitet', usesIntensity: false },
    ],
  },
];

// ============================================================================
// ENVIRONMENTS
// ============================================================================

const environments: Environment[] = [
  { code: 'M0', label: 'Dryland', labelNO: 'Tørrtrening', description: 'Gym, dryland training', descriptionNO: 'Gym, tørrtrening', icon: 'Dumbbell', type: 'indoor', competitionLevel: 0 },
  { code: 'M1', label: '25m Pool', labelNO: '25m basseng', description: 'Short course pool', descriptionNO: 'Kortbane basseng', icon: 'Droplet', type: 'indoor', competitionLevel: 1 },
  { code: 'M2', label: '50m Pool', labelNO: '50m basseng', description: 'Long course pool', descriptionNO: 'Langbane basseng', icon: 'Droplet', type: 'indoor', competitionLevel: 2 },
  { code: 'M3', label: 'Open Water', labelNO: 'Åpent vann', description: 'Open water swimming', descriptionNO: 'Åpent vann svømming', icon: 'Waves', type: 'outdoor', competitionLevel: 3 },
  { code: 'M4', label: 'Time Trial', labelNO: 'Tidskjøring', description: 'Simulated race', descriptionNO: 'Simulert konkurranse', icon: 'Timer', type: 'indoor', competitionLevel: 4 },
  { code: 'M5', label: 'Competition', labelNO: 'Konkurranse', description: 'Official meet', descriptionNO: 'Offisiell stevne', icon: 'Trophy', type: 'indoor', competitionLevel: 5 },
];

// ============================================================================
// TRAINING PHASES
// ============================================================================

const phases: TrainingPhase[] = [
  { code: 'L-BASE', label: 'Base', labelNO: 'Base', description: 'Aerobic foundation', descriptionNO: 'Aerob grunnlag', icon: 'Heart', intensityRange: 'LOW-MED', order: 1 },
  { code: 'L-BUILD', label: 'Build', labelNO: 'Oppbygging', description: 'Increasing intensity', descriptionNO: 'Økende intensitet', icon: 'TrendingUp', intensityRange: 'MED-HIGH', order: 2 },
  { code: 'L-COMP', label: 'Competition', labelNO: 'Konkurranse', description: 'Race preparation', descriptionNO: 'Konkurranseforberedelse', icon: 'Trophy', intensityRange: 'HIGH', order: 3 },
  { code: 'L-TAPER', label: 'Taper', labelNO: 'Nedtrapping', description: 'Pre-meet taper', descriptionNO: 'Nedtrapping før stevne', icon: 'Moon', intensityRange: 'LOW-MED', order: 4 },
  { code: 'L-RECOVER', label: 'Recovery', labelNO: 'Restitusjon', description: 'Active recovery', descriptionNO: 'Aktiv restitusjon', icon: 'Coffee', intensityRange: 'LOW', order: 5 },
];

// ============================================================================
// INTENSITY & PRESSURE LEVELS
// ============================================================================

const intensityLevels: IntensityLevel[] = [
  { code: 'EN1', value: 50, label: 'EN1', labelNO: 'EN1', description: 'Recovery/warm-up', descriptionNO: 'Restitusjon/oppvarming' },
  { code: 'EN2', value: 60, label: 'EN2', labelNO: 'EN2', description: 'Aerobic endurance', descriptionNO: 'Aerob utholdenhet' },
  { code: 'EN3', value: 70, label: 'EN3', labelNO: 'EN3', description: 'Aerobic threshold', descriptionNO: 'Aerob terskel' },
  { code: 'SP1', value: 80, label: 'SP1', labelNO: 'SP1', description: 'Lactate tolerance', descriptionNO: 'Laktattoleranse' },
  { code: 'SP2', value: 90, label: 'SP2', labelNO: 'SP2', description: 'Lactate production', descriptionNO: 'Laktatproduksjon' },
  { code: 'SP3', value: 100, label: 'SP3', labelNO: 'SP3', description: 'Max speed', descriptionNO: 'Maksimal fart' },
];

const pressureLevels: PressureLevel[] = [
  { code: 'PR1', level: 1, label: 'None', labelNO: 'Ingen', description: 'Solo practice', descriptionNO: 'Solo trening', icon: 'Smile' },
  { code: 'PR2', level: 2, label: 'Set', labelNO: 'Sett', description: 'Structured sets', descriptionNO: 'Strukturerte sett', icon: 'Target' },
  { code: 'PR3', level: 3, label: 'Group', labelNO: 'Gruppe', description: 'Group training', descriptionNO: 'Gruppetrening', icon: 'Users' },
  { code: 'PR4', level: 4, label: 'Time Trial', labelNO: 'Tidskjøring', description: 'Simulated race', descriptionNO: 'Simulert løp', icon: 'Timer' },
  { code: 'PR5', level: 5, label: 'Competition', labelNO: 'Konkurranse', description: 'Official meet', descriptionNO: 'Offisiell stevne', icon: 'Trophy' },
];

// ============================================================================
// GOAL CATEGORIES & METRICS
// ============================================================================

const goalCategories: GoalCategory[] = [
  { id: 'time', name: 'Time', nameNO: 'Tid', icon: 'Timer', color: 'blue', description: 'Race times', descriptionNO: 'Løpstider' },
  { id: 'technique', name: 'Technique', nameNO: 'Teknikk', icon: 'Target', color: 'green', description: 'Technical goals', descriptionNO: 'Tekniske mål' },
  { id: 'physical', name: 'Physical', nameNO: 'Fysisk', icon: 'Dumbbell', color: 'orange', description: 'Physical goals', descriptionNO: 'Fysiske mål' },
  { id: 'competition', name: 'Competition', nameNO: 'Konkurranse', icon: 'Trophy', color: 'gold', description: 'Meet performance', descriptionNO: 'Stevneprestasjon' },
];

const performanceMetrics: PerformanceMetric[] = [
  { id: 'time_50free', name: '50m Freestyle', nameNO: '50m fri', unit: 'sec', description: '50m freestyle time', descriptionNO: '50m fri tid', category: 'race', higherIsBetter: false, benchmarks: { amateur: 35, intermediate: 28, advanced: 24, elite: 22, professional: 21 } },
  { id: 'time_100free', name: '100m Freestyle', nameNO: '100m fri', unit: 'sec', description: '100m freestyle time', descriptionNO: '100m fri tid', category: 'race', higherIsBetter: false, benchmarks: { amateur: 75, intermediate: 60, advanced: 52, elite: 48, professional: 46 } },
  { id: 'time_200free', name: '200m Freestyle', nameNO: '200m fri', unit: 'sec', description: '200m freestyle time', descriptionNO: '200m fri tid', category: 'race', higherIsBetter: false },
  { id: 'stroke_count', name: 'Stroke Count', nameNO: 'Antall tak', unit: 'strokes', description: 'Strokes per 50m', descriptionNO: 'Tak per 50m', category: 'technique', higherIsBetter: false },
  { id: 'stroke_rate', name: 'Stroke Rate', nameNO: 'Takfrekvens', unit: 'spm', description: 'Strokes per minute', descriptionNO: 'Tak per minutt', category: 'technique', higherIsBetter: true },
  { id: 'fina_points', name: 'FINA Points', nameNO: 'FINA-poeng', unit: 'points', description: 'FINA points score', descriptionNO: 'FINA-poengsum', category: 'competition', higherIsBetter: true },
];

// ============================================================================
// EQUIPMENT & TEST PROTOCOLS
// ============================================================================

const equipment: Equipment[] = [
  { id: 'goggles', name: 'Goggles', nameNO: 'Svømmebriller', category: 'gear', icon: 'Eye' },
  { id: 'paddles', name: 'Paddles', nameNO: 'Padler', category: 'training', icon: 'Hand' },
  { id: 'kickboard', name: 'Kickboard', nameNO: 'Sparkebrett', category: 'training', icon: 'Square' },
  { id: 'fins', name: 'Fins', nameNO: 'Svømmeføtter', category: 'training', icon: 'Footprints' },
  { id: 'tempo_trainer', name: 'Tempo Trainer', nameNO: 'Tempomåler', category: 'measurement', icon: 'Timer', providesData: true, dataTypes: ['stroke_rate'] },
];

const testProtocols: TestProtocol[] = [
  {
    id: 'test_100free', testNumber: 1, name: '100m Freestyle Time Trial', nameNO: '100m fri tidskjøring', shortName: '100 Free', category: 'speed', icon: 'Timer',
    description: 'Maximum effort 100m', descriptionNO: 'Maksimal innsats 100m', purpose: 'Benchmark speed', purposeNO: 'Måle fart',
    methodology: ['Full warm-up', 'Race start', 'Maximum effort'], equipment: ['Lane', 'Timing system'], duration: '5 min', attempts: 1, unit: 'seconds', lowerIsBetter: true, formType: 'timed', calculationType: 'direct',
    scoring: { excellent: { max: 50, label: 'Elite', color: 'gold' }, good: { max: 55, label: 'Advanced', color: 'green' }, average: { max: 62, label: 'Intermediate', color: 'blue' }, needsWork: { max: 70, label: 'Beginner', color: 'red' } },
    tips: ['Strong start', 'Even pace first 50', 'Strong finish'],
  },
  {
    id: 'test_t30', testNumber: 2, name: 'T30 Test', nameNO: 'T30 test', shortName: 'T30', category: 'endurance', icon: 'Heart',
    description: '30 min swim test', descriptionNO: '30 minutters svømmetest', purpose: 'Measure endurance', purposeNO: 'Måle utholdenhet',
    methodology: ['Swim continuously for 30 min', 'Count laps', 'Record distance'], equipment: ['50m pool', 'Lap counter'], duration: '30 min', attempts: 1, unit: 'meters', lowerIsBetter: false, formType: 'simple', calculationType: 'direct',
    scoring: { excellent: { max: 2200, label: 'Elite', color: 'gold' }, good: { max: 1900, label: 'Advanced', color: 'green' }, average: { max: 1600, label: 'Intermediate', color: 'blue' }, needsWork: { max: 1300, label: 'Beginner', color: 'red' } },
    tips: ['Steady pace', 'Efficient technique', 'Count strokes'],
  },
  {
    id: 'test_css', testNumber: 3, name: 'CSS Test', nameNO: 'CSS-test', shortName: 'CSS', category: 'endurance', icon: 'Activity',
    description: 'Critical Swim Speed', descriptionNO: 'Kritisk svømmefart', purpose: 'Determine training zones', purposeNO: 'Bestemme treningssoner',
    methodology: ['400m time trial', '200m time trial', 'Calculate CSS'], equipment: ['Pool', 'Timing'], duration: '15 min', attempts: 2, unit: 'sec/100m', lowerIsBetter: true, formType: 'simple', calculationType: 'direct',
    scoring: { excellent: { max: 70, label: 'Elite', color: 'gold' }, good: { max: 80, label: 'Advanced', color: 'green' }, average: { max: 95, label: 'Intermediate', color: 'blue' }, needsWork: { max: 110, label: 'Beginner', color: 'red' } },
    tips: ['Maximum effort', 'Full recovery between', 'Even pacing'],
  },
];

// ============================================================================
// TERMINOLOGY & SESSION CONFIG
// ============================================================================

const terminology: SportTerminology = {
  athlete: 'Swimmer', athletePlural: 'Swimmers', coach: 'Coach', coachPlural: 'Coaches',
  athleteNO: 'Svømmer', athletePluralNO: 'Svømmere', coachNO: 'Trener', coachPluralNO: 'Trenere',
  session: 'Session', sessionPlural: 'Sessions', practice: 'Practice', drill: 'Set', drillPlural: 'Sets',
  sessionNO: 'Økt', sessionPluralNO: 'Økter', practiceNO: 'Trening', drillNO: 'Sett', drillPluralNO: 'Sett',
  competition: 'Meet', competitionPlural: 'Meets', match: 'Race', matchPlural: 'Races',
  competitionNO: 'Stevne', competitionPluralNO: 'Stevner', matchNO: 'Heat', matchPluralNO: 'Heat',
  score: 'Time', result: 'Result', personalBest: 'Personal Best',
  scoreNO: 'Tid', resultNO: 'Resultat', personalBestNO: 'Personlig rekord',
  lane: 'Lane', laneNO: 'Bane', lap: 'Lap', lapNO: 'Lengde', stroke: 'Stroke', strokeNO: 'Tak',
};

const pyramidCategories: PyramidCategory[] = [
  { code: 'FYS', label: 'Dryland', labelNO: 'Tørrtrening', description: 'Strength and flexibility', descriptionNO: 'Styrke og fleksibilitet', icon: 'Dumbbell', color: 'rgb(var(--status-warning))', order: 1, usesIntensity: true },
  { code: 'TEK', label: 'Technique', labelNO: 'Teknikk', description: 'Stroke efficiency', descriptionNO: 'Svømmeeffektivitet', icon: 'Target', color: 'rgb(var(--category-j))', order: 2, usesIntensity: true },
  { code: 'UTHOL', label: 'Endurance', labelNO: 'Utholdenhet', description: 'Aerobic capacity', descriptionNO: 'Aerob kapasitet', icon: 'Heart', color: 'rgb(var(--status-info))', order: 3, usesIntensity: true },
  { code: 'FART', label: 'Speed', labelNO: 'Fart', description: 'Race speed', descriptionNO: 'Konkurransefart', icon: 'Zap', color: 'rgb(var(--status-success))', order: 4, usesIntensity: true },
  { code: 'KAMP', label: 'Race', labelNO: 'Konkurrranse', description: 'Race simulation', descriptionNO: 'Konkurransesimulering', icon: 'Trophy', color: 'rgb(var(--tier-gold))', order: 5, usesIntensity: true },
];

const sessionTemplates: SessionTemplate[] = [
  { id: 'endurance', name: 'Endurance Set', nameNO: 'Utholdenhetsøkt', defaultDuration: 90, categoryCode: 'UTHOL', defaultAreas: ['ENDURANCE'], defaultEnvironment: 'M2', icon: 'Heart' },
  { id: 'technique', name: 'Technique Session', nameNO: 'Teknikkøkt', defaultDuration: 75, categoryCode: 'TEK', defaultAreas: ['FREESTYLE', 'TURNS'], defaultEnvironment: 'M1', icon: 'Target' },
  { id: 'speed', name: 'Speed Session', nameNO: 'Fartsøkt', defaultDuration: 60, categoryCode: 'FART', defaultAreas: ['SPRINT', 'STARTS'], defaultEnvironment: 'M2', icon: 'Zap' },
  { id: 'dryland', name: 'Dryland', nameNO: 'Tørrtrening', defaultDuration: 60, categoryCode: 'FYS', defaultAreas: ['STRENGTH', 'CORE'], defaultEnvironment: 'M0', icon: 'Dumbbell' },
];

const sessions: SessionConfig = { pyramidCategories, templates: sessionTemplates, sessionTypes: ['training', 'test', 'tournament', 'recovery', 'physical', 'mental'], defaultDuration: 90, usesAKFormula: false };

// ============================================================================
// SKILL LEVELS & BENCHMARKS
// ============================================================================

const skillLevels: SkillLevel[] = [
  { code: 'K', label: 'Beginner', labelNO: 'Nybegynner', order: 1, color: '#9CA3AF', description: 'Learning to swim' },
  { code: 'J', label: 'Novice', labelNO: 'Nybegynner+', order: 2, color: '#6B7280', description: 'Basic strokes' },
  { code: 'I', label: 'Youth', labelNO: 'Ungdom', order: 3, color: '#8B5CF6', description: 'Youth swimmer' },
  { code: 'H', label: 'Club', labelNO: 'Klubb', order: 4, color: '#A78BFA', description: 'Club level' },
  { code: 'G', label: 'Regional', labelNO: 'Regional', order: 5, color: '#3B82F6', description: 'Regional meets' },
  { code: 'F', label: 'National Jr', labelNO: 'Nasjonal Jr', order: 6, color: '#60A5FA', description: 'National junior' },
  { code: 'E', label: 'National', labelNO: 'Nasjonal', order: 7, color: '#10B981', description: 'National level' },
  { code: 'D', label: 'National Final', labelNO: 'NM-finale', order: 8, color: '#34D399', description: 'Championship finalist' },
  { code: 'C', label: 'International', labelNO: 'Internasjonal', order: 9, color: '#F59E0B', description: 'International meets' },
  { code: 'B', label: 'European', labelNO: 'Europeisk', order: 10, color: '#FBBF24', description: 'European level' },
  { code: 'A', label: 'World Class', labelNO: 'Verdensklasse', order: 11, color: '#EF4444', description: 'World level' },
];

const benchmarks: BenchmarkConfig = {
  skillLevels,
  levelBenchmarks: [
    { levelCode: 'A', benchmarks: [{ metricId: 'time_100free', value: 48, required: true }, { metricId: 'fina_points', value: 900 }] },
    { levelCode: 'B', benchmarks: [{ metricId: 'time_100free', value: 50, required: true }, { metricId: 'fina_points', value: 800 }] },
    { levelCode: 'E', benchmarks: [{ metricId: 'time_100free', value: 55, required: true }, { metricId: 'fina_points', value: 600 }] },
    { levelCode: 'G', benchmarks: [{ metricId: 'time_100free', value: 62, required: true }, { metricId: 'fina_points', value: 450 }] },
  ],
  source: 'FINA',
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
// COMPLETE SWIMMING CONFIG
// ============================================================================

export const SWIMMING_CONFIG: SportConfig = {
  id: 'swimming',
  name: 'Swimming',
  nameNO: 'Svømming',
  icon: 'Droplet',
  color: '#0EA5E9', // Cyan

  trainingAreas,
  environments,
  phases,
  intensityLevels,
  pressureLevels,
  testProtocols,
  performanceMetrics,
  benchmarkSource: 'FINA',
  goalCategories,
  sessions,
  benchmarks,
  terminology,
  equipment,
  navigation,

  metadata: {
    poolLengths: [25, 50],
    strokes: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
    distances: [50, 100, 200, 400, 800, 1500],
  },
};

export default SWIMMING_CONFIG;
