/**
 * Football (Soccer) Sport Configuration
 *
 * Complete configuration for football as a sport in the multi-sport platform.
 * This file contains all football-specific data including training areas,
 * environments, phases, intensity levels, and test protocols.
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
// TRAINING AREAS - Technical, Tactical, Physical
// ============================================================================

const trainingAreas: TrainingAreaGroup[] = [
  {
    code: 'ballControl',
    label: 'Ball Control',
    labelNO: 'Ballkontroll',
    icon: 'Circle',
    areas: [
      {
        code: 'DRIBBLING',
        label: 'Dribbling',
        labelNO: 'Dribbling',
        icon: 'Move',
        description: 'Ball control while moving',
        descriptionNO: 'Ballkontroll i bevegelse',
        usesIntensity: true,
      },
      {
        code: 'FIRST_TOUCH',
        label: 'First Touch',
        labelNO: 'Førstekontakt',
        icon: 'Target',
        description: 'Receiving and controlling the ball',
        descriptionNO: 'Motta og kontrollere ballen',
        usesIntensity: true,
      },
      {
        code: 'JUGGLING',
        label: 'Juggling',
        labelNO: 'Triksing',
        icon: 'Activity',
        description: 'Keep ball in the air',
        descriptionNO: 'Holde ballen i luften',
        usesIntensity: false,
      },
      {
        code: 'TURNS',
        label: 'Turns',
        labelNO: 'Vendinger',
        icon: 'RotateCw',
        description: 'Turning with the ball',
        descriptionNO: 'Vende med ballen',
        usesIntensity: true,
      },
    ],
  },
  {
    code: 'passing',
    label: 'Passing',
    labelNO: 'Pasning',
    icon: 'ArrowRight',
    areas: [
      {
        code: 'SHORT_PASS',
        label: 'Short Passing',
        labelNO: 'Kortpasning',
        icon: 'ArrowRight',
        description: 'Short accurate passes',
        descriptionNO: 'Korte presise pasninger',
        usesIntensity: true,
      },
      {
        code: 'LONG_PASS',
        label: 'Long Passing',
        labelNO: 'Langpasning',
        icon: 'ArrowUpRight',
        description: 'Long distance passes',
        descriptionNO: 'Lange pasninger',
        usesIntensity: true,
      },
      {
        code: 'CROSSING',
        label: 'Crossing',
        labelNO: 'Innlegg',
        icon: 'CornerUpRight',
        description: 'Crosses from wide positions',
        descriptionNO: 'Innlegg fra kantposisjon',
        usesIntensity: true,
      },
      {
        code: 'THROUGH_BALL',
        label: 'Through Ball',
        labelNO: 'Gjennombruddspasning',
        icon: 'Zap',
        description: 'Penetrating passes',
        descriptionNO: 'Gjennombrytende pasninger',
        usesIntensity: true,
      },
    ],
  },
  {
    code: 'shooting',
    label: 'Shooting',
    labelNO: 'Skudd',
    icon: 'Target',
    areas: [
      {
        code: 'FINISHING',
        label: 'Finishing',
        labelNO: 'Avslutning',
        icon: 'Target',
        description: 'Scoring from close range',
        descriptionNO: 'Scoring på kort hold',
        usesIntensity: true,
      },
      {
        code: 'LONG_SHOT',
        label: 'Long Shots',
        labelNO: 'Langskudd',
        icon: 'Crosshair',
        description: 'Shots from distance',
        descriptionNO: 'Skudd fra distanse',
        usesIntensity: true,
      },
      {
        code: 'VOLLEYS',
        label: 'Volleys',
        labelNO: 'Volley',
        icon: 'Zap',
        description: 'Striking ball in the air',
        descriptionNO: 'Treffe ballen i luften',
        usesIntensity: true,
      },
      {
        code: 'HEADERS',
        label: 'Headers',
        labelNO: 'Heading',
        icon: 'ArrowUp',
        description: 'Heading technique',
        descriptionNO: 'Headingteknikk',
        usesIntensity: true,
      },
      {
        code: 'FREE_KICKS',
        label: 'Free Kicks',
        labelNO: 'Frispark',
        icon: 'Circle',
        description: 'Set piece shooting',
        descriptionNO: 'Dødballsituasjoner',
        usesIntensity: false,
      },
      {
        code: 'PENALTIES',
        label: 'Penalties',
        labelNO: 'Straffer',
        icon: 'AlertCircle',
        description: 'Penalty kicks',
        descriptionNO: 'Straffespark',
        usesIntensity: false,
      },
    ],
  },
  {
    code: 'defending',
    label: 'Defending',
    labelNO: 'Forsvar',
    icon: 'Shield',
    areas: [
      {
        code: 'TACKLING',
        label: 'Tackling',
        labelNO: 'Takling',
        icon: 'Shield',
        description: 'Winning the ball',
        descriptionNO: 'Vinne ballen',
        usesIntensity: true,
      },
      {
        code: 'MARKING',
        label: 'Marking',
        labelNO: 'Markering',
        icon: 'User',
        description: 'Tracking opponents',
        descriptionNO: 'Følge motstandere',
        usesIntensity: true,
      },
      {
        code: 'POSITIONING',
        label: 'Defensive Positioning',
        labelNO: 'Defensiv posisjonering',
        icon: 'MapPin',
        description: 'Defensive shape and positioning',
        descriptionNO: 'Forsvarsformasjon og posisjonering',
        usesIntensity: true,
      },
      {
        code: 'HEADING_DEF',
        label: 'Defensive Headers',
        labelNO: 'Defensive headinger',
        icon: 'ArrowUp',
        description: 'Clearing headers',
        descriptionNO: 'Klarerende headinger',
        usesIntensity: true,
      },
    ],
  },
  {
    code: 'goalkeeper',
    label: 'Goalkeeper',
    labelNO: 'Keeper',
    icon: 'Shield',
    areas: [
      {
        code: 'GK_SHOT_STOP',
        label: 'Shot Stopping',
        labelNO: 'Skuddredning',
        icon: 'Shield',
        description: 'Saving shots',
        descriptionNO: 'Redde skudd',
        usesIntensity: true,
      },
      {
        code: 'GK_DISTRIBUTION',
        label: 'Distribution',
        labelNO: 'Utspill',
        icon: 'ArrowRight',
        description: 'Throwing and kicking distribution',
        descriptionNO: 'Kast og spark utspill',
        usesIntensity: true,
      },
      {
        code: 'GK_CROSSES',
        label: 'Handling Crosses',
        labelNO: 'Innleggbehandling',
        icon: 'Hand',
        description: 'Catching and punching crosses',
        descriptionNO: 'Fange og bokse innlegg',
        usesIntensity: true,
      },
      {
        code: 'GK_1V1',
        label: '1v1 Situations',
        labelNO: '1v1-situasjoner',
        icon: 'User',
        description: 'One-on-one saves',
        descriptionNO: 'En-mot-en redninger',
        usesIntensity: true,
      },
    ],
  },
  {
    code: 'physical',
    label: 'Physical',
    labelNO: 'Fysisk',
    icon: 'Dumbbell',
    areas: [
      {
        code: 'SPEED',
        label: 'Speed',
        labelNO: 'Hurtighet',
        icon: 'Zap',
        description: 'Sprinting and acceleration',
        descriptionNO: 'Sprint og akselerasjon',
        usesIntensity: true,
      },
      {
        code: 'AGILITY',
        label: 'Agility',
        labelNO: 'Spenst',
        icon: 'Activity',
        description: 'Quick direction changes',
        descriptionNO: 'Raske retningsendringer',
        usesIntensity: true,
      },
      {
        code: 'ENDURANCE',
        label: 'Endurance',
        labelNO: 'Utholdenhet',
        icon: 'Heart',
        description: 'Aerobic and anaerobic capacity',
        descriptionNO: 'Aerob og anaerob kapasitet',
        usesIntensity: true,
      },
      {
        code: 'STRENGTH',
        label: 'Strength',
        labelNO: 'Styrke',
        icon: 'Dumbbell',
        description: 'Power and strength',
        descriptionNO: 'Kraft og styrke',
        usesIntensity: true,
      },
    ],
  },
];

// ============================================================================
// ENVIRONMENTS
// ============================================================================

const environments: Environment[] = [
  {
    code: 'M0',
    label: 'Off-pitch',
    labelNO: 'Utenfor banen',
    description: 'Gym, home, general training',
    descriptionNO: 'Gym, hjemme, generell trening',
    icon: 'Dumbbell',
    type: 'indoor',
    competitionLevel: 0,
  },
  {
    code: 'M1',
    label: 'Indoor',
    labelNO: 'Innendørs',
    description: 'Indoor pitch or futsal court',
    descriptionNO: 'Innendørs bane eller futsalhall',
    icon: 'Home',
    type: 'indoor',
    competitionLevel: 1,
  },
  {
    code: 'M2',
    label: 'Training Pitch',
    labelNO: 'Treningsbane',
    description: 'Outdoor training pitch',
    descriptionNO: 'Utendørs treningsbane',
    icon: 'Square',
    type: 'outdoor',
    competitionLevel: 1,
  },
  {
    code: 'M3',
    label: 'Small-sided',
    labelNO: 'Småbanespill',
    description: 'Reduced pitch games',
    descriptionNO: 'Spill på redusert bane',
    icon: 'Grid',
    type: 'outdoor',
    competitionLevel: 2,
  },
  {
    code: 'M4',
    label: 'Practice Match',
    labelNO: 'Treningskamp',
    description: 'Full game practice',
    descriptionNO: 'Hel kamp trening',
    icon: 'Users',
    type: 'outdoor',
    competitionLevel: 3,
  },
  {
    code: 'M5',
    label: 'Competition',
    labelNO: 'Konkurranse',
    description: 'Official match',
    descriptionNO: 'Offisiell kamp',
    icon: 'Trophy',
    type: 'outdoor',
    competitionLevel: 5,
  },
];

// ============================================================================
// TRAINING PHASES
// ============================================================================

const phases: TrainingPhase[] = [
  {
    code: 'L-PREP',
    label: 'Pre-season',
    labelNO: 'Forsesong',
    description: 'Fitness and conditioning focus',
    descriptionNO: 'Fokus på fysisk form og kondisjon',
    icon: 'Settings',
    intensityRange: 'MED-HIGH',
    order: 1,
  },
  {
    code: 'L-BUILD',
    label: 'Build',
    labelNO: 'Oppbygging',
    description: 'Technical and tactical development',
    descriptionNO: 'Teknisk og taktisk utvikling',
    icon: 'TrendingUp',
    intensityRange: 'MED-HIGH',
    order: 2,
  },
  {
    code: 'L-COMP',
    label: 'In-season',
    labelNO: 'Sesong',
    description: 'Competition phase',
    descriptionNO: 'Konkurransefase',
    icon: 'Trophy',
    intensityRange: 'HIGH',
    order: 3,
  },
  {
    code: 'L-TAPER',
    label: 'Taper',
    labelNO: 'Nedtrapping',
    description: 'Recovery before key matches',
    descriptionNO: 'Hvile før viktige kamper',
    icon: 'Moon',
    intensityRange: 'LOW-MED',
    order: 4,
  },
  {
    code: 'L-OFF',
    label: 'Off-season',
    labelNO: 'Mellomperiode',
    description: 'Active recovery period',
    descriptionNO: 'Aktiv restitusjonsperiode',
    icon: 'Coffee',
    intensityRange: 'LOW',
    order: 5,
  },
];

// ============================================================================
// INTENSITY LEVELS
// ============================================================================

const intensityLevels: IntensityLevel[] = [
  { code: 'REST', value: 0, label: 'Rest', labelNO: 'Hvile', description: 'Complete rest', descriptionNO: 'Fullstendig hvile' },
  { code: 'RECOVERY', value: 25, label: 'Recovery', labelNO: 'Restitusjon', description: 'Active recovery', descriptionNO: 'Aktiv restitusjon' },
  { code: 'LOW', value: 40, label: 'Low', labelNO: 'Lav', description: 'Technical focus', descriptionNO: 'Teknisk fokus' },
  { code: 'MED', value: 60, label: 'Medium', labelNO: 'Middels', description: 'Moderate effort', descriptionNO: 'Moderat innsats' },
  { code: 'HIGH', value: 80, label: 'High', labelNO: 'Høy', description: 'High intensity', descriptionNO: 'Høy intensitet' },
  { code: 'MATCH', value: 95, label: 'Match', labelNO: 'Kamp', description: 'Match intensity', descriptionNO: 'Kampintensitet' },
  { code: 'MAX', value: 100, label: 'Maximum', labelNO: 'Maksimal', description: 'Maximum effort', descriptionNO: 'Maksimal innsats' },
];

// ============================================================================
// PRESSURE LEVELS
// ============================================================================

const pressureLevels: PressureLevel[] = [
  { code: 'PR1', level: 1, label: 'None', labelNO: 'Ingen', description: 'Individual practice', descriptionNO: 'Individuell trening', icon: 'Smile' },
  { code: 'PR2', level: 2, label: 'Drill', labelNO: 'Øvelse', description: 'Structured drills', descriptionNO: 'Strukturerte øvelser', icon: 'Target' },
  { code: 'PR3', level: 3, label: 'Team Training', labelNO: 'Lagtrening', description: 'Full team practice', descriptionNO: 'Full lagtrening', icon: 'Users' },
  { code: 'PR4', level: 4, label: 'Friendly', labelNO: 'Treningskamp', description: 'Practice match', descriptionNO: 'Treningskamp', icon: 'Shield' },
  { code: 'PR5', level: 5, label: 'Competition', labelNO: 'Konkurranse', description: 'Official match', descriptionNO: 'Offisiell kamp', icon: 'Trophy' },
];

// ============================================================================
// GOAL CATEGORIES
// ============================================================================

const goalCategories: GoalCategory[] = [
  { id: 'scoring', name: 'Scoring', nameNO: 'Scoring', icon: 'Target', color: 'blue', description: 'Goals and assists', descriptionNO: 'Mål og assists' },
  { id: 'technique', name: 'Technique', nameNO: 'Teknikk', icon: 'Crosshair', color: 'green', description: 'Technical skills', descriptionNO: 'Tekniske ferdigheter' },
  { id: 'tactical', name: 'Tactical', nameNO: 'Taktisk', icon: 'Brain', color: 'purple', description: 'Game intelligence', descriptionNO: 'Spillintelligens' },
  { id: 'physical', name: 'Physical', nameNO: 'Fysisk', icon: 'Dumbbell', color: 'orange', description: 'Physical attributes', descriptionNO: 'Fysiske egenskaper' },
  { id: 'mental', name: 'Mental', nameNO: 'Mental', icon: 'Brain', color: 'indigo', description: 'Mental strength', descriptionNO: 'Mental styrke' },
  { id: 'match', name: 'Match', nameNO: 'Kamp', icon: 'Trophy', color: 'gold', description: 'Match performance', descriptionNO: 'Kampprestasjon' },
];

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'goals',
    name: 'Goals',
    nameNO: 'Mål',
    unit: 'goals',
    description: 'Goals scored',
    descriptionNO: 'Mål scoret',
    category: 'scoring',
    higherIsBetter: true,
  },
  {
    id: 'assists',
    name: 'Assists',
    nameNO: 'Assists',
    unit: 'assists',
    description: 'Goal assists',
    descriptionNO: 'Målgivende pasninger',
    category: 'scoring',
    higherIsBetter: true,
  },
  {
    id: 'pass_accuracy',
    name: 'Pass Accuracy',
    nameNO: 'Pasningsprosent',
    unit: '%',
    description: 'Successful pass percentage',
    descriptionNO: 'Vellykkede pasninger i prosent',
    category: 'passing',
    higherIsBetter: true,
    benchmarks: { amateur: 70, intermediate: 78, advanced: 85, elite: 90, professional: 92 },
  },
  {
    id: 'sprint_speed',
    name: 'Sprint Speed',
    nameNO: 'Sprintfart',
    unit: 'km/h',
    description: 'Maximum sprint speed',
    descriptionNO: 'Maksimal sprintfart',
    category: 'physical',
    higherIsBetter: true,
    benchmarks: { amateur: 28, intermediate: 30, advanced: 32, elite: 34, professional: 36 },
  },
  {
    id: 'distance_covered',
    name: 'Distance Covered',
    nameNO: 'Tilbakelagt distanse',
    unit: 'km',
    description: 'Total distance per match',
    descriptionNO: 'Total distanse per kamp',
    category: 'physical',
    higherIsBetter: true,
    benchmarks: { amateur: 8, intermediate: 9.5, advanced: 10.5, elite: 11.5, professional: 13 },
  },
  {
    id: 'high_intensity_runs',
    name: 'High Intensity Runs',
    nameNO: 'Høyintensitetsløp',
    unit: 'count',
    description: 'Number of high intensity runs per match',
    descriptionNO: 'Antall høyintensitetsløp per kamp',
    category: 'physical',
    higherIsBetter: true,
  },
  {
    id: 'tackles_won',
    name: 'Tackles Won',
    nameNO: 'Vunne taklinger',
    unit: '%',
    description: 'Percentage of successful tackles',
    descriptionNO: 'Prosent vellykkede taklinger',
    category: 'defense',
    higherIsBetter: true,
    benchmarks: { amateur: 50, intermediate: 60, advanced: 70, elite: 75, professional: 80 },
  },
  {
    id: 'aerial_duels',
    name: 'Aerial Duels Won',
    nameNO: 'Vunne luftdueller',
    unit: '%',
    description: 'Percentage of aerial duels won',
    descriptionNO: 'Prosent vunne luftdueller',
    category: 'physical',
    higherIsBetter: true,
  },
  {
    id: 'shot_accuracy',
    name: 'Shot Accuracy',
    nameNO: 'Skuddprosent',
    unit: '%',
    description: 'Shots on target percentage',
    descriptionNO: 'Skudd på mål i prosent',
    category: 'shooting',
    higherIsBetter: true,
    benchmarks: { amateur: 30, intermediate: 40, advanced: 50, elite: 55, professional: 60 },
  },
  {
    id: 'save_percentage',
    name: 'Save Percentage',
    nameNO: 'Redningsprosent',
    unit: '%',
    description: 'Goalkeeper save percentage',
    descriptionNO: 'Keeper redningsprosent',
    category: 'goalkeeper',
    higherIsBetter: true,
    benchmarks: { amateur: 60, intermediate: 68, advanced: 72, elite: 75, professional: 78 },
  },
];

// ============================================================================
// EQUIPMENT
// ============================================================================

const equipment: Equipment[] = [
  {
    id: 'football',
    name: 'Football',
    nameNO: 'Fotball',
    category: 'ball',
    icon: 'Circle',
    description: 'Standard football (size 5)',
    providesData: false,
  },
  {
    id: 'gps_tracker',
    name: 'GPS Tracker',
    nameNO: 'GPS-sporer',
    category: 'wearable',
    icon: 'MapPin',
    description: 'Movement and speed tracking',
    providesData: true,
    dataTypes: ['distance', 'speed', 'sprints', 'accelerations', 'heart_rate'],
  },
  {
    id: 'speed_gates',
    name: 'Speed Gates',
    nameNO: 'Fartsporter',
    category: 'measurement',
    icon: 'Timer',
    description: 'Sprint timing system',
    providesData: true,
    dataTypes: ['sprint_time', 'speed'],
  },
  {
    id: 'goalkeeper_gloves',
    name: 'Goalkeeper Gloves',
    nameNO: 'Keeperhansker',
    category: 'protection',
    icon: 'Hand',
    providesData: false,
  },
];

// ============================================================================
// TEST PROTOCOLS
// ============================================================================

const testProtocols: TestProtocol[] = [
  {
    id: 'sprint_30m',
    testNumber: 1,
    name: '30m Sprint Test',
    nameNO: '30m sprinttest',
    shortName: '30m Sprint',
    category: 'speed',
    icon: 'Zap',
    description: 'Maximum speed over 30 meters',
    descriptionNO: 'Maksimal fart over 30 meter',
    purpose: 'Measure acceleration and top speed',
    purposeNO: 'Måle akselerasjon og toppfart',
    methodology: [
      'Standing start behind the line',
      'Sprint through timing gates at 10m and 30m',
      '3 attempts with full recovery',
    ],
    equipment: ['Speed gates', 'Flat surface'],
    duration: '10 min',
    attempts: 3,
    unit: 'seconds',
    lowerIsBetter: true,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 4.0, label: 'Elite', color: 'gold' },
      good: { max: 4.3, label: 'Advanced', color: 'green' },
      average: { max: 4.6, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 5.0, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Explosive start',
      'Drive arms forward',
      'Stay low initially',
    ],
  },
  {
    id: 'agility_test',
    testNumber: 2,
    name: 'Illinois Agility Test',
    nameNO: 'Illinois smidighetstest',
    shortName: 'Illinois',
    category: 'speed',
    icon: 'Activity',
    description: 'Agility and change of direction',
    descriptionNO: 'Smidighet og retningsforandring',
    purpose: 'Measure agility with ball control',
    purposeNO: 'Måle smidighet med ballkontroll',
    methodology: [
      'Lie face down at start',
      'On whistle, sprint through course',
      'Weave through cones',
      'Return to start',
    ],
    equipment: ['Cones', 'Stopwatch'],
    duration: '10 min',
    attempts: 3,
    unit: 'seconds',
    lowerIsBetter: true,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 15.2, label: 'Elite', color: 'gold' },
      good: { max: 16.2, label: 'Advanced', color: 'green' },
      average: { max: 17.5, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 19.0, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Stay low through turns',
      'Quick feet around cones',
      'Accelerate out of turns',
    ],
  },
  {
    id: 'yo_yo_test',
    testNumber: 3,
    name: 'Yo-Yo Intermittent Recovery Test',
    nameNO: 'Yo-Yo utholdenhetstest',
    shortName: 'Yo-Yo',
    category: 'endurance',
    icon: 'Heart',
    description: 'Football-specific endurance test',
    descriptionNO: 'Fotballspesifikk utholdenhetstest',
    purpose: 'Measure repeated sprint ability',
    purposeNO: 'Måle gjentatt sprintevne',
    methodology: [
      'Run 20m shuttles with increasing speed',
      '10 second recovery between each shuttle',
      'Continue until unable to maintain pace',
    ],
    equipment: ['Audio recording', 'Cones'],
    duration: '10-25 min',
    attempts: 1,
    unit: 'meters',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'direct',
    scoring: {
      excellent: { max: 2680, label: 'Elite', color: 'gold' },
      good: { max: 2280, label: 'Advanced', color: 'green' },
      average: { max: 1800, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 1400, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Pace early stages',
      'Use recovery time wisely',
      'Turn efficiently',
    ],
  },
  {
    id: 'vertical_jump',
    testNumber: 4,
    name: 'Vertical Jump Test',
    nameNO: 'Vertikalhopptest',
    shortName: 'VJump',
    category: 'strength',
    icon: 'ArrowUp',
    description: 'Explosive leg power',
    descriptionNO: 'Eksplosiv beinkraft',
    purpose: 'Measure lower body power',
    purposeNO: 'Måle eksplosiv kraft i underkropp',
    methodology: [
      'Counter-movement jump',
      'Arms can be used',
      'Land in same position',
    ],
    equipment: ['Jump mat', 'Measuring tape'],
    duration: '5 min',
    attempts: 3,
    unit: 'cm',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 60, label: 'Elite', color: 'gold' },
      good: { max: 50, label: 'Advanced', color: 'green' },
      average: { max: 42, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 35, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Use arm swing',
      'Full extension',
      'Land softly',
    ],
  },
  {
    id: 'passing_accuracy',
    testNumber: 5,
    name: 'Passing Accuracy Test',
    nameNO: 'Pasningsnøyaktighetstest',
    shortName: 'Pass Test',
    category: 'technique',
    icon: 'Target',
    description: 'Short and long passing accuracy',
    descriptionNO: 'Kort og lang pasningsnøyaktighet',
    purpose: 'Measure passing precision',
    purposeNO: 'Måle pasningspresisjon',
    methodology: [
      '10 short passes to target (10m)',
      '10 long passes to target (30m)',
      'Score based on accuracy zones',
    ],
    equipment: ['Footballs', 'Target zones', 'Cones'],
    duration: '10 min',
    attempts: 20,
    unit: 'points',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'sum',
    scoring: {
      excellent: { max: 36, label: 'Elite', color: 'gold' },
      good: { max: 30, label: 'Advanced', color: 'green' },
      average: { max: 22, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 16, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Focus on technique',
      'Follow through',
      'Keep head steady',
    ],
  },
];

// ============================================================================
// TERMINOLOGY
// ============================================================================

const terminology: SportTerminology = {
  athlete: 'Player',
  athletePlural: 'Players',
  coach: 'Coach',
  coachPlural: 'Coaches',

  athleteNO: 'Spiller',
  athletePluralNO: 'Spillere',
  coachNO: 'Trener',
  coachPluralNO: 'Trenere',

  session: 'Session',
  sessionPlural: 'Sessions',
  practice: 'Training',
  drill: 'Drill',
  drillPlural: 'Drills',

  sessionNO: 'Økt',
  sessionPluralNO: 'Økter',
  practiceNO: 'Trening',
  drillNO: 'Øvelse',
  drillPluralNO: 'Øvelser',

  competition: 'Match',
  competitionPlural: 'Matches',
  match: 'Game',
  matchPlural: 'Games',

  competitionNO: 'Kamp',
  competitionPluralNO: 'Kamper',
  matchNO: 'Kamp',
  matchPluralNO: 'Kamper',

  score: 'Goals',
  result: 'Result',
  personalBest: 'Personal Best',

  scoreNO: 'Mål',
  resultNO: 'Resultat',
  personalBestNO: 'Personlig rekord',

  // Football-specific
  goal: 'Goal',
  goalNO: 'Mål',
  assist: 'Assist',
  assistNO: 'Assist',
  pass: 'Pass',
  passNO: 'Pasning',
  shot: 'Shot',
  shotNO: 'Skudd',
  tackle: 'Tackle',
  tackleNO: 'Takling',
  dribble: 'Dribble',
  dribbleNO: 'Dribbling',
  cross: 'Cross',
  crossNO: 'Innlegg',
  header: 'Header',
  headerNO: 'Heading',
  pitch: 'Pitch',
  pitchNO: 'Bane',
  goalkeeper: 'Goalkeeper',
  goalkeeperNO: 'Keeper',
  defender: 'Defender',
  defenderNO: 'Forsvarer',
  midfielder: 'Midfielder',
  midfielderNO: 'Midtbanespiller',
  forward: 'Forward',
  forwardNO: 'Angriper',
};

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

const pyramidCategories: PyramidCategory[] = [
  {
    code: 'FYS',
    label: 'Physical',
    labelNO: 'Fysisk',
    description: 'Strength, speed, endurance',
    descriptionNO: 'Styrke, hurtighet, utholdenhet',
    icon: 'Dumbbell',
    color: 'rgb(var(--status-warning))',
    order: 1,
    usesIntensity: true,
  },
  {
    code: 'TEK',
    label: 'Technique',
    labelNO: 'Teknikk',
    description: 'Ball control, passing, shooting',
    descriptionNO: 'Ballkontroll, pasning, skudd',
    icon: 'Target',
    color: 'rgb(var(--category-j))',
    order: 2,
    usesIntensity: true,
  },
  {
    code: 'TAK',
    label: 'Tactical',
    labelNO: 'Taktisk',
    description: 'Positioning, game understanding',
    descriptionNO: 'Posisjonering, spillforståelse',
    icon: 'Brain',
    color: 'rgb(var(--status-info))',
    order: 3,
    usesIntensity: true,
  },
  {
    code: 'LAG',
    label: 'Team',
    labelNO: 'Lag',
    description: 'Team play, combinations',
    descriptionNO: 'Lagspill, kombinasjoner',
    icon: 'Users',
    color: 'rgb(var(--status-success))',
    order: 4,
    usesIntensity: true,
  },
  {
    code: 'KAMP',
    label: 'Match',
    labelNO: 'Kamp',
    description: 'Match simulation, competition',
    descriptionNO: 'Kampsimulering, konkurranse',
    icon: 'Trophy',
    color: 'rgb(var(--tier-gold))',
    order: 5,
    usesIntensity: true,
  },
];

const sessionTemplates: SessionTemplate[] = [
  {
    id: 'technical-session',
    name: 'Technical Session',
    nameNO: 'Teknisk økt',
    description: 'Focus on ball skills',
    descriptionNO: 'Fokus på ballferdigheter',
    defaultDuration: 90,
    categoryCode: 'TEK',
    defaultAreas: ['DRIBBLING', 'FIRST_TOUCH', 'SHORT_PASS'],
    defaultEnvironment: 'M2',
    icon: 'Target',
  },
  {
    id: 'shooting-practice',
    name: 'Shooting Practice',
    nameNO: 'Skuddtrening',
    description: 'Finishing and shooting drills',
    descriptionNO: 'Avslutnings- og skuddøvelser',
    defaultDuration: 60,
    categoryCode: 'TEK',
    defaultAreas: ['FINISHING', 'LONG_SHOT', 'VOLLEYS'],
    defaultEnvironment: 'M2',
    icon: 'Crosshair',
  },
  {
    id: 'tactical-training',
    name: 'Tactical Training',
    nameNO: 'Taktisk trening',
    description: 'Tactical patterns and positioning',
    descriptionNO: 'Taktiske mønstre og posisjonering',
    defaultDuration: 90,
    categoryCode: 'TAK',
    defaultEnvironment: 'M2',
    icon: 'Brain',
  },
  {
    id: 'small-sided-games',
    name: 'Small-Sided Games',
    nameNO: 'Småbanespill',
    description: 'Reduced pitch game practice',
    descriptionNO: 'Spill på redusert bane',
    defaultDuration: 60,
    categoryCode: 'LAG',
    defaultEnvironment: 'M3',
    icon: 'Grid',
  },
  {
    id: 'physical-conditioning',
    name: 'Physical Conditioning',
    nameNO: 'Fysisk trening',
    description: 'Fitness and strength work',
    descriptionNO: 'Kondisjon og styrketrening',
    defaultDuration: 60,
    categoryCode: 'FYS',
    defaultAreas: ['SPEED', 'AGILITY', 'ENDURANCE', 'STRENGTH'],
    defaultEnvironment: 'M0',
    icon: 'Dumbbell',
  },
  {
    id: 'goalkeeper-training',
    name: 'Goalkeeper Training',
    nameNO: 'Keepertrening',
    description: 'Goalkeeper-specific training',
    descriptionNO: 'Keeperspesifikk trening',
    defaultDuration: 60,
    categoryCode: 'TEK',
    defaultAreas: ['GK_SHOT_STOP', 'GK_DISTRIBUTION', 'GK_CROSSES'],
    defaultEnvironment: 'M2',
    icon: 'Shield',
  },
];

const sessions: SessionConfig = {
  pyramidCategories,
  templates: sessionTemplates,
  sessionTypes: ['training', 'test', 'tournament', 'recovery', 'physical', 'mental'],
  defaultDuration: 90,
  usesAKFormula: false,
};

// ============================================================================
// SKILL LEVELS & BENCHMARKS
// ============================================================================

const skillLevels: SkillLevel[] = [
  { code: 'K', label: 'Beginner', labelNO: 'Nybegynner', order: 1, color: '#9CA3AF', description: 'New to football' },
  { code: 'J', label: 'Novice', labelNO: 'Nybegynner+', order: 2, color: '#6B7280', description: 'Basic skills' },
  { code: 'I', label: 'Youth', labelNO: 'Bredde ungdom', order: 3, color: '#8B5CF6', description: 'Youth recreational' },
  { code: 'H', label: 'Junior', labelNO: 'Junior', order: 4, color: '#A78BFA', description: 'Junior competitive' },
  { code: 'G', label: 'Senior Rec', labelNO: 'Bredde senior', order: 5, color: '#3B82F6', description: 'Senior recreational' },
  { code: 'F', label: 'Division 3-4', labelNO: 'Div 3-4', order: 6, color: '#60A5FA', description: 'Lower divisions' },
  { code: 'E', label: 'Division 2', labelNO: 'Div 2', order: 7, color: '#10B981', description: 'Division 2' },
  { code: 'D', label: 'Division 1', labelNO: 'Div 1', order: 8, color: '#34D399', description: 'Division 1' },
  { code: 'C', label: 'OBOS-liga', labelNO: 'OBOS-liga', order: 9, color: '#F59E0B', description: 'Second tier' },
  { code: 'B', label: 'Eliteserien', labelNO: 'Eliteserien', order: 10, color: '#FBBF24', description: 'Top tier Norway' },
  { code: 'A', label: 'International', labelNO: 'Internasjonal', order: 11, color: '#EF4444', description: 'International level' },
];

const benchmarks: BenchmarkConfig = {
  skillLevels,
  levelBenchmarks: [
    {
      levelCode: 'A',
      benchmarks: [
        { metricId: 'sprint_speed', value: 35, required: true },
        { metricId: 'pass_accuracy', value: 90 },
        { metricId: 'distance_covered', value: 12 },
      ],
    },
    {
      levelCode: 'B',
      benchmarks: [
        { metricId: 'sprint_speed', value: 33, required: true },
        { metricId: 'pass_accuracy', value: 88 },
        { metricId: 'distance_covered', value: 11 },
      ],
    },
    {
      levelCode: 'E',
      benchmarks: [
        { metricId: 'sprint_speed', value: 30, required: true },
        { metricId: 'pass_accuracy', value: 82 },
        { metricId: 'distance_covered', value: 10 },
      ],
    },
    {
      levelCode: 'G',
      benchmarks: [
        { metricId: 'sprint_speed', value: 28, required: true },
        { metricId: 'pass_accuracy', value: 75 },
        { metricId: 'distance_covered', value: 8.5 },
      ],
    },
  ],
  source: 'NFF',
};

// ============================================================================
// NAVIGATION
// ============================================================================

const navigation: SportNavigation = {
  quickActions: [
    {
      label: 'Log Training',
      labelNO: 'Logg trening',
      icon: 'Plus',
      href: '/trening/logg',
      variant: 'primary',
    },
    {
      label: 'Register Test',
      labelNO: 'Registrer test',
      icon: 'Target',
      href: '/trening/testing/registrer',
      variant: 'secondary',
    },
    {
      label: 'View Calendar',
      labelNO: 'Se kalender',
      icon: 'Calendar',
      href: '/plan/kalender',
      variant: 'secondary',
    },
  ],
  testing: {
    hubPath: '/trening/testing',
    registerPath: '/trening/testing/registrer',
    resultsPath: '/analyse/tester',
    label: 'Test Protocol',
    labelNO: 'Testprotokoll',
  },
  itemOverrides: [],
};

// ============================================================================
// COMPLETE FOOTBALL CONFIG
// ============================================================================

export const FOOTBALL_CONFIG: SportConfig = {
  id: 'football',
  name: 'Football',
  nameNO: 'Fotball',
  icon: 'Circle',
  color: '#16A34A', // Green

  trainingAreas,
  environments,
  phases,
  intensityLevels,
  pressureLevels,

  testProtocols,
  performanceMetrics,
  benchmarkSource: 'NFF',

  goalCategories,
  sessions,
  benchmarks,
  terminology,
  equipment,
  navigation,

  metadata: {
    pitchDimensions: { length: 105, width: 68 },
    goalDimensions: { width: 7.32, height: 2.44 },
    matchDuration: { halves: 2, minutes: 45 },
    teamSize: { field: 11, substitutes: 5 },
    positions: ['goalkeeper', 'defender', 'midfielder', 'forward'],
    formations: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'],
  },
};

export default FOOTBALL_CONFIG;
