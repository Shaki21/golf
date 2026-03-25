/**
 * Tennis Sport Configuration
 *
 * Complete configuration for tennis as a sport in the multi-sport platform.
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
    code: 'groundstrokes',
    label: 'Groundstrokes',
    labelNO: 'Grunnslag',
    icon: 'Activity',
    areas: [
      { code: 'FOREHAND', label: 'Forehand', labelNO: 'Forehand', icon: 'ArrowRight', description: 'Forehand technique', descriptionNO: 'Forehandteknikk', usesIntensity: true },
      { code: 'BACKHAND', label: 'Backhand', labelNO: 'Backhand', icon: 'ArrowLeft', description: 'Backhand technique', descriptionNO: 'Backhandteknikk', usesIntensity: true },
      { code: 'RALLY', label: 'Rally', labelNO: 'Rally', icon: 'RefreshCw', description: 'Consistent rally play', descriptionNO: 'Konsistent rallyspill', usesIntensity: true },
    ],
  },
  {
    code: 'serve',
    label: 'Serve & Return',
    labelNO: 'Serve & Retur',
    icon: 'Zap',
    areas: [
      { code: 'FIRST_SERVE', label: 'First Serve', labelNO: 'Førsteserve', icon: 'Zap', description: 'Power first serve', descriptionNO: 'Kraftig førsteserve', usesIntensity: true },
      { code: 'SECOND_SERVE', label: 'Second Serve', labelNO: 'Andreserve', icon: 'Target', description: 'Consistent second serve', descriptionNO: 'Sikker andreserve', usesIntensity: true },
      { code: 'RETURN', label: 'Return', labelNO: 'Retur', icon: 'CornerUpLeft', description: 'Service return', descriptionNO: 'Serveretur', usesIntensity: true },
    ],
  },
  {
    code: 'net',
    label: 'Net Play',
    labelNO: 'Nettspill',
    icon: 'Grid',
    areas: [
      { code: 'VOLLEY', label: 'Volley', labelNO: 'Volley', icon: 'Crosshair', description: 'Net volleys', descriptionNO: 'Nettvolleys', usesIntensity: true },
      { code: 'OVERHEAD', label: 'Overhead', labelNO: 'Smash', icon: 'ArrowUp', description: 'Overhead smash', descriptionNO: 'Smash over hodet', usesIntensity: true },
      { code: 'APPROACH', label: 'Approach', labelNO: 'Innspill', icon: 'TrendingUp', description: 'Approach shots', descriptionNO: 'Innspillslag', usesIntensity: true },
    ],
  },
  {
    code: 'specialty',
    label: 'Specialty Shots',
    labelNO: 'Spesialslag',
    icon: 'Star',
    areas: [
      { code: 'DROP_SHOT', label: 'Drop Shot', labelNO: 'Stoppball', icon: 'ArrowDown', description: 'Soft drop shots', descriptionNO: 'Myke stoppballer', usesIntensity: false },
      { code: 'LOB', label: 'Lob', labelNO: 'Lobb', icon: 'ArrowUpRight', description: 'Defensive and offensive lobs', descriptionNO: 'Defensive og offensive lobber', usesIntensity: true },
      { code: 'PASSING', label: 'Passing Shot', labelNO: 'Passeringsslag', icon: 'Slash', description: 'Passing shots', descriptionNO: 'Passeringsslag', usesIntensity: true },
    ],
  },
  {
    code: 'physical',
    label: 'Physical',
    labelNO: 'Fysisk',
    icon: 'Dumbbell',
    areas: [
      { code: 'FOOTWORK', label: 'Footwork', labelNO: 'Fotarbeid', icon: 'Footprints', description: 'Court movement', descriptionNO: 'Banebevegelse', usesIntensity: true },
      { code: 'SPEED', label: 'Speed', labelNO: 'Hurtighet', icon: 'Zap', description: 'Sprint and agility', descriptionNO: 'Sprint og spenst', usesIntensity: true },
      { code: 'ENDURANCE', label: 'Endurance', labelNO: 'Utholdenhet', icon: 'Heart', description: 'Match endurance', descriptionNO: 'Kamputholdenhhet', usesIntensity: true },
      { code: 'STRENGTH', label: 'Strength', labelNO: 'Styrke', icon: 'Dumbbell', description: 'Power and strength', descriptionNO: 'Kraft og styrke', usesIntensity: true },
    ],
  },
];

// ============================================================================
// ENVIRONMENTS
// ============================================================================

const environments: Environment[] = [
  { code: 'M0', label: 'Off-court', labelNO: 'Utenfor banen', description: 'Gym, fitness', descriptionNO: 'Gym, fitness', icon: 'Dumbbell', type: 'indoor', competitionLevel: 0 },
  { code: 'M1', label: 'Indoor Hard', labelNO: 'Innendørs hard', description: 'Indoor hard court', descriptionNO: 'Innendørs hardcourt', icon: 'Square', type: 'indoor', competitionLevel: 1 },
  { code: 'M2', label: 'Outdoor Hard', labelNO: 'Utendørs hard', description: 'Outdoor hard court', descriptionNO: 'Utendørs hardcourt', icon: 'Sun', type: 'outdoor', competitionLevel: 2 },
  { code: 'M3', label: 'Clay', labelNO: 'Grus', description: 'Clay court', descriptionNO: 'Grusbane', icon: 'Circle', type: 'outdoor', competitionLevel: 2 },
  { code: 'M4', label: 'Grass', labelNO: 'Gress', description: 'Grass court', descriptionNO: 'Gressbane', icon: 'Leaf', type: 'outdoor', competitionLevel: 3 },
  { code: 'M5', label: 'Tournament', labelNO: 'Turnering', description: 'Competition match', descriptionNO: 'Konkurransekamp', icon: 'Trophy', type: 'mixed', competitionLevel: 5 },
];

// ============================================================================
// TRAINING PHASES
// ============================================================================

const phases: TrainingPhase[] = [
  { code: 'L-BASE', label: 'Base', labelNO: 'Base', description: 'Fitness foundation', descriptionNO: 'Fysisk grunnlag', icon: 'Heart', intensityRange: 'LOW-MED', order: 1 },
  { code: 'L-BUILD', label: 'Build', labelNO: 'Oppbygging', description: 'Technical development', descriptionNO: 'Teknisk utvikling', icon: 'TrendingUp', intensityRange: 'MED-HIGH', order: 2 },
  { code: 'L-COMP', label: 'Competition', labelNO: 'Konkurranse', description: 'Tournament phase', descriptionNO: 'Turneringsfase', icon: 'Trophy', intensityRange: 'HIGH', order: 3 },
  { code: 'L-PEAK', label: 'Peak', labelNO: 'Toppform', description: 'Major tournament prep', descriptionNO: 'Stor turnering forberedelse', icon: 'Star', intensityRange: 'PEAK', order: 4 },
  { code: 'L-RECOVER', label: 'Recovery', labelNO: 'Restitusjon', description: 'Active recovery', descriptionNO: 'Aktiv hvile', icon: 'Coffee', intensityRange: 'LOW', order: 5 },
];

// ============================================================================
// INTENSITY & PRESSURE LEVELS
// ============================================================================

const intensityLevels: IntensityLevel[] = [
  { code: 'REST', value: 0, label: 'Rest', labelNO: 'Hvile', description: 'Complete rest', descriptionNO: 'Fullstendig hvile' },
  { code: 'LOW', value: 30, label: 'Low', labelNO: 'Lav', description: 'Technical focus', descriptionNO: 'Teknisk fokus' },
  { code: 'MED', value: 50, label: 'Medium', labelNO: 'Middels', description: 'Rally practice', descriptionNO: 'Rally trening' },
  { code: 'HIGH', value: 75, label: 'High', labelNO: 'Høy', description: 'Match-like drills', descriptionNO: 'Kamplignende øvelser' },
  { code: 'MATCH', value: 90, label: 'Match', labelNO: 'Kamp', description: 'Match intensity', descriptionNO: 'Kampintensitet' },
  { code: 'MAX', value: 100, label: 'Maximum', labelNO: 'Maksimal', description: 'Maximum effort', descriptionNO: 'Maksimal innsats' },
];

const pressureLevels: PressureLevel[] = [
  { code: 'PR1', level: 1, label: 'None', labelNO: 'Ingen', description: 'Solo practice', descriptionNO: 'Solo trening', icon: 'Smile' },
  { code: 'PR2', level: 2, label: 'Drill', labelNO: 'Øvelse', description: 'With coach', descriptionNO: 'Med trener', icon: 'Target' },
  { code: 'PR3', level: 3, label: 'Practice Set', labelNO: 'Treningssett', description: 'Practice sets', descriptionNO: 'Treningssett', icon: 'Users' },
  { code: 'PR4', level: 4, label: 'Practice Match', labelNO: 'Treningskamp', description: 'Practice match', descriptionNO: 'Treningskamp', icon: 'Shield' },
  { code: 'PR5', level: 5, label: 'Tournament', labelNO: 'Turnering', description: 'Official match', descriptionNO: 'Offisiell kamp', icon: 'Trophy' },
];

// ============================================================================
// GOAL CATEGORIES & METRICS
// ============================================================================

const goalCategories: GoalCategory[] = [
  { id: 'serve', name: 'Serve', nameNO: 'Serve', icon: 'Zap', color: 'blue', description: 'Serve goals', descriptionNO: 'Servemål' },
  { id: 'groundstroke', name: 'Groundstrokes', nameNO: 'Grunnslag', icon: 'Activity', color: 'green', description: 'Groundstroke goals', descriptionNO: 'Grunnnslagmål' },
  { id: 'physical', name: 'Physical', nameNO: 'Fysisk', icon: 'Dumbbell', color: 'orange', description: 'Physical goals', descriptionNO: 'Fysiske mål' },
  { id: 'match', name: 'Match', nameNO: 'Kamp', icon: 'Trophy', color: 'gold', description: 'Match performance', descriptionNO: 'Kampprestasjon' },
  { id: 'ranking', name: 'Ranking', nameNO: 'Ranking', icon: 'TrendingUp', color: 'purple', description: 'Ranking goals', descriptionNO: 'Rankingmål' },
];

const performanceMetrics: PerformanceMetric[] = [
  { id: 'first_serve_pct', name: 'First Serve %', nameNO: 'Førsteserve %', unit: '%', description: 'First serve in percentage', descriptionNO: 'Førsteserve inn prosent', category: 'serve', higherIsBetter: true, benchmarks: { amateur: 50, intermediate: 58, advanced: 65, elite: 70, professional: 75 } },
  { id: 'aces', name: 'Aces per Match', nameNO: 'Ess per kamp', unit: 'aces', description: 'Average aces per match', descriptionNO: 'Gjennomsnitt ess per kamp', category: 'serve', higherIsBetter: true },
  { id: 'serve_speed', name: 'Serve Speed', nameNO: 'Servefart', unit: 'km/h', description: 'Maximum serve speed', descriptionNO: 'Maksimal servefart', category: 'serve', higherIsBetter: true, benchmarks: { amateur: 140, intermediate: 160, advanced: 180, elite: 200, professional: 220 } },
  { id: 'return_win_pct', name: 'Return Games Won', nameNO: 'Vunne returgames', unit: '%', description: 'Return games won percentage', descriptionNO: 'Vunne returgames prosent', category: 'return', higherIsBetter: true },
  { id: 'winners', name: 'Winners', nameNO: 'Winners', unit: 'count', description: 'Winners per match', descriptionNO: 'Winners per kamp', category: 'shots', higherIsBetter: true },
  { id: 'unforced_errors', name: 'Unforced Errors', nameNO: 'Upressede feil', unit: 'count', description: 'Unforced errors per match', descriptionNO: 'Upressede feil per kamp', category: 'shots', higherIsBetter: false },
  { id: 'ranking', name: 'Ranking', nameNO: 'Ranking', unit: 'rank', description: 'Current ranking', descriptionNO: 'Nåværende ranking', category: 'competition', higherIsBetter: false },
];

// ============================================================================
// EQUIPMENT & TEST PROTOCOLS
// ============================================================================

const equipment: Equipment[] = [
  { id: 'racket', name: 'Tennis Racket', nameNO: 'Tennisracket', category: 'equipment', icon: 'Activity' },
  { id: 'speed_gun', name: 'Speed Gun', nameNO: 'Fartsradar', category: 'measurement', icon: 'Radar', providesData: true, dataTypes: ['serve_speed'] },
  { id: 'ball_machine', name: 'Ball Machine', nameNO: 'Ballmaskin', category: 'training', icon: 'Settings' },
];

const testProtocols: TestProtocol[] = [
  {
    id: 'serve_speed_test', testNumber: 1, name: 'Serve Speed Test', nameNO: 'Servefarttest', shortName: 'Serve', category: 'speed', icon: 'Zap',
    description: 'Maximum serve velocity', descriptionNO: 'Maksimal servefart', purpose: 'Measure serve power', purposeNO: 'Måle servekraft',
    methodology: ['10 first serves', 'Record fastest'], equipment: ['Speed gun', 'Racket', 'Balls'], duration: '10 min', attempts: 10, unit: 'km/h', lowerIsBetter: false, formType: 'simple', calculationType: 'best',
    scoring: { excellent: { max: 200, label: 'Elite', color: 'gold' }, good: { max: 180, label: 'Advanced', color: 'green' }, average: { max: 160, label: 'Intermediate', color: 'blue' }, needsWork: { max: 140, label: 'Beginner', color: 'red' } },
    tips: ['Full body rotation', 'Pronation at contact'],
  },
  {
    id: 'serve_accuracy_test', testNumber: 2, name: 'Serve Accuracy Test', nameNO: 'Servenøyaktighetstest', shortName: 'Accuracy', category: 'accuracy', icon: 'Target',
    description: 'Serve placement accuracy', descriptionNO: 'Serveplasseringsnøyaktighet', purpose: 'Measure serve control', purposeNO: 'Måle servekontroll',
    methodology: ['20 serves to target zones', '5 per zone'], equipment: ['Target zones', 'Balls'], duration: '15 min', attempts: 20, unit: '%', lowerIsBetter: false, formType: 'percentage', calculationType: 'percentage',
    scoring: { excellent: { max: 80, label: 'Elite', color: 'gold' }, good: { max: 65, label: 'Advanced', color: 'green' }, average: { max: 50, label: 'Intermediate', color: 'blue' }, needsWork: { max: 35, label: 'Beginner', color: 'red' } },
    tips: ['Focus on placement', 'Consistent toss'],
  },
  {
    id: 'spider_drill', testNumber: 3, name: 'Spider Drill', nameNO: 'Edderkopp-drill', shortName: 'Spider', category: 'speed', icon: 'Activity',
    description: 'Court coverage speed test', descriptionNO: 'Banedekning hastighetstest', purpose: 'Measure footwork', purposeNO: 'Måle fotarbeid',
    methodology: ['Start at center T', 'Touch 5 points', 'Return to center each time'], equipment: ['Cones', 'Stopwatch'], duration: '5 min', attempts: 3, unit: 'seconds', lowerIsBetter: true, formType: 'simple', calculationType: 'best',
    scoring: { excellent: { max: 12, label: 'Elite', color: 'gold' }, good: { max: 14, label: 'Advanced', color: 'green' }, average: { max: 16, label: 'Intermediate', color: 'blue' }, needsWork: { max: 18, label: 'Beginner', color: 'red' } },
    tips: ['Split step', 'Quick recovery'],
  },
];

// ============================================================================
// TERMINOLOGY & SESSION CONFIG
// ============================================================================

const terminology: SportTerminology = {
  athlete: 'Player', athletePlural: 'Players', coach: 'Coach', coachPlural: 'Coaches',
  athleteNO: 'Spiller', athletePluralNO: 'Spillere', coachNO: 'Trener', coachPluralNO: 'Trenere',
  session: 'Session', sessionPlural: 'Sessions', practice: 'Practice', drill: 'Drill', drillPlural: 'Drills',
  sessionNO: 'Økt', sessionPluralNO: 'Økter', practiceNO: 'Trening', drillNO: 'Øvelse', drillPluralNO: 'Øvelser',
  competition: 'Tournament', competitionPlural: 'Tournaments', match: 'Match', matchPlural: 'Matches',
  competitionNO: 'Turnering', competitionPluralNO: 'Turneringer', matchNO: 'Kamp', matchPluralNO: 'Kamper',
  score: 'Score', result: 'Result', personalBest: 'Personal Best',
  scoreNO: 'Poeng', resultNO: 'Resultat', personalBestNO: 'Personlig rekord',
  serve: 'Serve', serveNO: 'Serve', forehand: 'Forehand', forehandNO: 'Forehand', backhand: 'Backhand', backhandNO: 'Backhand',
  volley: 'Volley', volleyNO: 'Volley', ace: 'Ace', aceNO: 'Ess', court: 'Court', courtNO: 'Bane',
};

const pyramidCategories: PyramidCategory[] = [
  { code: 'FYS', label: 'Physical', labelNO: 'Fysisk', description: 'Fitness and conditioning', descriptionNO: 'Kondisjon og styrke', icon: 'Dumbbell', color: 'rgb(var(--status-warning))', order: 1, usesIntensity: true },
  { code: 'TEK', label: 'Technique', labelNO: 'Teknikk', description: 'Stroke production', descriptionNO: 'Slagteknikk', icon: 'Target', color: 'rgb(var(--category-j))', order: 2, usesIntensity: true },
  { code: 'TAK', label: 'Tactical', labelNO: 'Taktisk', description: 'Point construction', descriptionNO: 'Poengbygging', icon: 'Brain', color: 'rgb(var(--status-info))', order: 3, usesIntensity: true },
  { code: 'KAMP', label: 'Match', labelNO: 'Kamp', description: 'Match play', descriptionNO: 'Kampspill', icon: 'Trophy', color: 'rgb(var(--tier-gold))', order: 4, usesIntensity: true },
];

const sessionTemplates: SessionTemplate[] = [
  { id: 'serve-practice', name: 'Serve Practice', nameNO: 'Servetrening', defaultDuration: 45, categoryCode: 'TEK', defaultAreas: ['FIRST_SERVE', 'SECOND_SERVE'], defaultEnvironment: 'M2', icon: 'Zap' },
  { id: 'groundstroke-rally', name: 'Groundstroke Rally', nameNO: 'Grunnslag-rally', defaultDuration: 60, categoryCode: 'TEK', defaultAreas: ['FOREHAND', 'BACKHAND', 'RALLY'], defaultEnvironment: 'M2', icon: 'Activity' },
  { id: 'match-play', name: 'Match Play', nameNO: 'Kamptrening', defaultDuration: 90, categoryCode: 'KAMP', defaultEnvironment: 'M2', icon: 'Trophy' },
  { id: 'fitness', name: 'Fitness Session', nameNO: 'Kondisjonsøkt', defaultDuration: 60, categoryCode: 'FYS', defaultAreas: ['FOOTWORK', 'SPEED', 'ENDURANCE'], defaultEnvironment: 'M0', icon: 'Dumbbell' },
];

const sessions: SessionConfig = { pyramidCategories, templates: sessionTemplates, sessionTypes: ['training', 'test', 'tournament', 'recovery', 'physical', 'mental'], defaultDuration: 90, usesAKFormula: false };

// ============================================================================
// SKILL LEVELS & BENCHMARKS
// ============================================================================

const skillLevels: SkillLevel[] = [
  { code: 'K', label: 'Beginner', labelNO: 'Nybegynner', order: 1, color: '#9CA3AF', description: 'New to tennis' },
  { code: 'J', label: 'Novice', labelNO: 'Nybegynner+', order: 2, color: '#6B7280', description: 'Basic strokes' },
  { code: 'I', label: 'Club', labelNO: 'Klubb', order: 3, color: '#8B5CF6', description: 'Club level' },
  { code: 'H', label: 'Team', labelNO: 'Lag', order: 4, color: '#A78BFA', description: 'Team player' },
  { code: 'G', label: 'Regional', labelNO: 'Regional', order: 5, color: '#3B82F6', description: 'Regional tournaments' },
  { code: 'F', label: 'National Jr', labelNO: 'Nasjonal Jr', order: 6, color: '#60A5FA', description: 'National junior' },
  { code: 'E', label: 'National', labelNO: 'Nasjonal', order: 7, color: '#10B981', description: 'National level' },
  { code: 'D', label: 'ITF', labelNO: 'ITF', order: 8, color: '#34D399', description: 'ITF circuit' },
  { code: 'C', label: 'Challenger', labelNO: 'Challenger', order: 9, color: '#F59E0B', description: 'ATP/WTA Challenger' },
  { code: 'B', label: 'Tour', labelNO: 'Tour', order: 10, color: '#FBBF24', description: 'Main tour' },
  { code: 'A', label: 'Top 100', labelNO: 'Topp 100', order: 11, color: '#EF4444', description: 'Top 100 ranking' },
];

const benchmarks: BenchmarkConfig = {
  skillLevels,
  levelBenchmarks: [
    { levelCode: 'A', benchmarks: [{ metricId: 'serve_speed', value: 210, required: true }, { metricId: 'first_serve_pct', value: 70 }] },
    { levelCode: 'B', benchmarks: [{ metricId: 'serve_speed', value: 195, required: true }, { metricId: 'first_serve_pct', value: 68 }] },
    { levelCode: 'E', benchmarks: [{ metricId: 'serve_speed', value: 170, required: true }, { metricId: 'first_serve_pct', value: 62 }] },
    { levelCode: 'G', benchmarks: [{ metricId: 'serve_speed', value: 150, required: true }, { metricId: 'first_serve_pct', value: 55 }] },
  ],
  source: 'ITF',
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
// COMPLETE TENNIS CONFIG
// ============================================================================

export const TENNIS_CONFIG: SportConfig = {
  id: 'tennis',
  name: 'Tennis',
  nameNO: 'Tennis',
  icon: 'Activity',
  color: '#FACC15', // Yellow

  trainingAreas,
  environments,
  phases,
  intensityLevels,
  pressureLevels,
  testProtocols,
  performanceMetrics,
  benchmarkSource: 'ITF',
  goalCategories,
  sessions,
  benchmarks,
  terminology,
  equipment,
  navigation,

  metadata: {
    courtDimensions: { singles: { length: 23.77, width: 8.23 }, doubles: { length: 23.77, width: 10.97 } },
    scoringSystem: ['games', 'sets', 'tiebreak'],
    surfaces: ['hard', 'clay', 'grass', 'carpet'],
  },
};

export default TENNIS_CONFIG;
