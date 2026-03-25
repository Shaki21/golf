/**
 * Handball Sport Configuration
 *
 * Complete configuration for handball as a sport in the multi-sport platform.
 * This file contains all handball-specific data including training areas,
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
    code: 'shooting',
    label: 'Shooting',
    labelNO: 'Skudd',
    icon: 'Target',
    areas: [
      {
        code: 'JUMP_SHOT',
        label: 'Jump Shot',
        labelNO: 'Hoppskudd',
        icon: 'Target',
        description: 'Shooting while jumping',
        descriptionNO: 'Skudd i hopp',
        usesIntensity: true,
      },
      {
        code: 'STANDING_SHOT',
        label: 'Standing Shot',
        labelNO: 'Stående skudd',
        icon: 'Target',
        description: 'Stationary shooting technique',
        descriptionNO: 'Stående skuddteknikk',
        usesIntensity: true,
      },
      {
        code: 'PIVOT_SHOT',
        label: 'Pivot Shot',
        labelNO: 'Strekspisskudd',
        icon: 'RotateCw',
        description: 'Shots from pivot position',
        descriptionNO: 'Skudd fra strekposisjon',
        usesIntensity: true,
      },
      {
        code: 'WING_SHOT',
        label: 'Wing Shot',
        labelNO: 'Kantskudd',
        icon: 'ArrowUpRight',
        description: 'Shots from wing position',
        descriptionNO: 'Skudd fra kantposisjon',
        usesIntensity: true,
      },
      {
        code: 'PENALTY',
        label: 'Penalty',
        labelNO: 'Straffe',
        icon: 'AlertCircle',
        description: '7-meter penalty shots',
        descriptionNO: '7-meter straffer',
        usesIntensity: false,
      },
    ],
  },
  {
    code: 'passing',
    label: 'Passing & Catching',
    labelNO: 'Pasning & Mottak',
    icon: 'ArrowRight',
    areas: [
      {
        code: 'CHEST_PASS',
        label: 'Chest Pass',
        labelNO: 'Brystpasning',
        icon: 'ArrowRight',
        description: 'Basic chest pass technique',
        descriptionNO: 'Grunnleggende brystpasning',
        usesIntensity: true,
      },
      {
        code: 'BOUNCE_PASS',
        label: 'Bounce Pass',
        labelNO: 'Stusspasning',
        icon: 'ArrowDown',
        description: 'Ground bounce passing',
        descriptionNO: 'Pasning via bakken',
        usesIntensity: true,
      },
      {
        code: 'OVERHEAD_PASS',
        label: 'Overhead Pass',
        labelNO: 'Overhåndspasning',
        icon: 'ArrowUp',
        description: 'High passing over defense',
        descriptionNO: 'Høy pasning over forsvar',
        usesIntensity: true,
      },
      {
        code: 'CATCHING',
        label: 'Catching',
        labelNO: 'Mottak',
        icon: 'Hand',
        description: 'Ball receiving technique',
        descriptionNO: 'Mottaksteknikk',
        usesIntensity: false,
      },
    ],
  },
  {
    code: 'movement',
    label: 'Movement',
    labelNO: 'Bevegelse',
    icon: 'Move',
    areas: [
      {
        code: 'FOOTWORK',
        label: 'Footwork',
        labelNO: 'Fotarbeid',
        icon: 'Footprints',
        description: 'Basic movement patterns',
        descriptionNO: 'Grunnleggende bevegelsesmønster',
        usesIntensity: true,
      },
      {
        code: 'FEINTS',
        label: 'Feints',
        labelNO: 'Finter',
        icon: 'Shuffle',
        description: 'Deceptive movements',
        descriptionNO: 'Lurende bevegelser',
        usesIntensity: true,
      },
      {
        code: 'BREAKTHROUGH',
        label: 'Breakthrough',
        labelNO: 'Gjennombrudd',
        icon: 'Zap',
        description: 'Breaking through defense',
        descriptionNO: 'Bryte gjennom forsvar',
        usesIntensity: true,
      },
      {
        code: 'POSITIONING',
        label: 'Positioning',
        labelNO: 'Posisjonering',
        icon: 'MapPin',
        description: 'Court positioning',
        descriptionNO: 'Baneposisjonering',
        usesIntensity: false,
      },
    ],
  },
  {
    code: 'defense',
    label: 'Defense',
    labelNO: 'Forsvar',
    icon: 'Shield',
    areas: [
      {
        code: 'MAN_DEFENSE',
        label: 'Man-to-Man Defense',
        labelNO: 'Mannmarkering',
        icon: 'User',
        description: 'Individual defensive marking',
        descriptionNO: 'Individuell forsvarmarkering',
        usesIntensity: true,
      },
      {
        code: 'ZONE_DEFENSE',
        label: 'Zone Defense',
        labelNO: 'Soneforsvar',
        icon: 'Grid',
        description: 'Zone defensive systems',
        descriptionNO: 'Soneforsvarsystemer',
        usesIntensity: true,
      },
      {
        code: 'BLOCKING',
        label: 'Blocking',
        labelNO: 'Blokkering',
        icon: 'Shield',
        description: 'Shot blocking technique',
        descriptionNO: 'Skuddblokkering',
        usesIntensity: true,
      },
      {
        code: 'GOALKEEPER',
        label: 'Goalkeeper',
        labelNO: 'Keeper',
        icon: 'Shield',
        description: 'Goalkeeper training',
        descriptionNO: 'Keepertrening',
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
        code: 'STRENGTH',
        label: 'Strength',
        labelNO: 'Styrke',
        icon: 'Dumbbell',
        description: 'General and specific strength',
        descriptionNO: 'Generell og spesifikk styrke',
        usesIntensity: true,
      },
      {
        code: 'SPEED',
        label: 'Speed',
        labelNO: 'Hurtighet',
        icon: 'Zap',
        description: 'Sprint and agility',
        descriptionNO: 'Sprint og spenst',
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
        code: 'MOBILITY',
        label: 'Mobility',
        labelNO: 'Mobilitet',
        icon: 'Move',
        description: 'Flexibility and range of motion',
        descriptionNO: 'Fleksibilitet og bevegelighet',
        usesIntensity: false,
      },
    ],
  },
];

// ============================================================================
// ENVIRONMENTS - Where training takes place
// ============================================================================

const environments: Environment[] = [
  {
    code: 'M0',
    label: 'Off-court',
    labelNO: 'Utenfor banen',
    description: 'Gym, home, general training',
    descriptionNO: 'Gym, hjemme, generell trening',
    icon: 'Dumbbell',
    type: 'indoor',
    competitionLevel: 0,
  },
  {
    code: 'M1',
    label: 'Indoor Court',
    labelNO: 'Innendørs hall',
    description: 'Standard handball court',
    descriptionNO: 'Standard håndballhall',
    icon: 'Square',
    type: 'indoor',
    competitionLevel: 1,
  },
  {
    code: 'M2',
    label: 'Half Court',
    labelNO: 'Halvbane',
    description: 'Half court training',
    descriptionNO: 'Trening på halvbane',
    icon: 'LayoutGrid',
    type: 'indoor',
    competitionLevel: 1,
  },
  {
    code: 'M3',
    label: 'Beach/Outdoor',
    labelNO: 'Strand/Utendørs',
    description: 'Beach or outdoor handball',
    descriptionNO: 'Strand- eller utendørshåndball',
    icon: 'Sun',
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
    type: 'indoor',
    competitionLevel: 3,
  },
  {
    code: 'M5',
    label: 'Competition',
    labelNO: 'Konkurranse',
    description: 'Official match',
    descriptionNO: 'Offisiell kamp',
    icon: 'Trophy',
    type: 'indoor',
    competitionLevel: 5,
  },
];

// ============================================================================
// TRAINING PHASES - Periodization for handball
// ============================================================================

const phases: TrainingPhase[] = [
  {
    code: 'L-PREP',
    label: 'Preparation',
    labelNO: 'Forberedelse',
    description: 'Pre-season conditioning',
    descriptionNO: 'Forsesong kondisjonering',
    icon: 'Settings',
    intensityRange: 'LOW-MED',
    order: 1,
  },
  {
    code: 'L-BUILD',
    label: 'Build',
    labelNO: 'Oppbygging',
    description: 'Developing technical and tactical skills',
    descriptionNO: 'Utvikle tekniske og taktiske ferdigheter',
    icon: 'TrendingUp',
    intensityRange: 'MED-HIGH',
    order: 2,
  },
  {
    code: 'L-COMP',
    label: 'Competition',
    labelNO: 'Konkurranse',
    description: 'In-season competition phase',
    descriptionNO: 'Konkurransefase i sesong',
    icon: 'Trophy',
    intensityRange: 'HIGH',
    order: 3,
  },
  {
    code: 'L-PEAK',
    label: 'Peak',
    labelNO: 'Toppform',
    description: 'Peaking for important matches',
    descriptionNO: 'Toppform til viktige kamper',
    icon: 'Star',
    intensityRange: 'PEAK',
    order: 4,
  },
  {
    code: 'L-TRANS',
    label: 'Transition',
    labelNO: 'Overgang',
    description: 'Active recovery between seasons',
    descriptionNO: 'Aktiv hvile mellom sesonger',
    icon: 'RefreshCw',
    intensityRange: 'LOW',
    order: 5,
  },
];

// ============================================================================
// INTENSITY LEVELS - Training intensity
// ============================================================================

const intensityLevels: IntensityLevel[] = [
  { code: 'REST', value: 0, label: 'Rest', labelNO: 'Hvile', description: 'Complete rest', descriptionNO: 'Fullstendig hvile' },
  { code: 'LOW', value: 30, label: 'Low', labelNO: 'Lav', description: 'Technical focus, low intensity', descriptionNO: 'Teknisk fokus, lav intensitet' },
  { code: 'MED', value: 50, label: 'Medium', labelNO: 'Middels', description: 'Moderate effort', descriptionNO: 'Moderat innsats' },
  { code: 'HIGH', value: 75, label: 'High', labelNO: 'Høy', description: 'High intensity training', descriptionNO: 'Høyintensitetstrening' },
  { code: 'MATCH', value: 90, label: 'Match Intensity', labelNO: 'Kampintensitet', description: 'Match-like intensity', descriptionNO: 'Kamplignende intensitet' },
  { code: 'MAX', value: 100, label: 'Maximum', labelNO: 'Maksimal', description: 'Maximum effort', descriptionNO: 'Maksimal innsats' },
];

// ============================================================================
// PRESSURE LEVELS - Mental load
// ============================================================================

const pressureLevels: PressureLevel[] = [
  { code: 'PR1', level: 1, label: 'None', labelNO: 'Ingen', description: 'Individual practice', descriptionNO: 'Individuell trening', icon: 'Smile' },
  { code: 'PR2', level: 2, label: 'Drill', labelNO: 'Øvelse', description: 'Structured drills', descriptionNO: 'Strukturerte øvelser', icon: 'Target' },
  { code: 'PR3', level: 3, label: 'Team Training', labelNO: 'Lagtrening', description: 'Full team practice', descriptionNO: 'Full lagtrening', icon: 'Users' },
  { code: 'PR4', level: 4, label: 'Practice Match', labelNO: 'Treningskamp', description: 'Scrimmage or friendly', descriptionNO: 'Treningskamp', icon: 'Shield' },
  { code: 'PR5', level: 5, label: 'Competition', labelNO: 'Konkurranse', description: 'Official match', descriptionNO: 'Offisiell kamp', icon: 'Trophy' },
];

// ============================================================================
// GOAL CATEGORIES
// ============================================================================

const goalCategories: GoalCategory[] = [
  { id: 'scoring', name: 'Scoring', nameNO: 'Målscoring', icon: 'Target', color: 'blue', description: 'Goals scored', descriptionNO: 'Mål scoret' },
  { id: 'technique', name: 'Technique', nameNO: 'Teknikk', icon: 'Crosshair', color: 'green', description: 'Technical skills', descriptionNO: 'Tekniske ferdigheter' },
  { id: 'tactical', name: 'Tactical', nameNO: 'Taktisk', icon: 'Brain', color: 'purple', description: 'Game understanding', descriptionNO: 'Spillforståelse' },
  { id: 'physical', name: 'Physical', nameNO: 'Fysisk', icon: 'Dumbbell', color: 'orange', description: 'Physical fitness', descriptionNO: 'Fysisk form' },
  { id: 'team', name: 'Team', nameNO: 'Lag', icon: 'Users', color: 'teal', description: 'Team play', descriptionNO: 'Lagspill' },
  { id: 'match', name: 'Match', nameNO: 'Kamp', icon: 'Trophy', color: 'gold', description: 'Match performance', descriptionNO: 'Kampprestasjon' },
];

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'goals_per_match',
    name: 'Goals Per Match',
    nameNO: 'Mål per kamp',
    unit: 'goals',
    description: 'Average goals scored per match',
    descriptionNO: 'Gjennomsnittlig mål per kamp',
    category: 'scoring',
    higherIsBetter: true,
  },
  {
    id: 'shot_accuracy',
    name: 'Shot Accuracy',
    nameNO: 'Skuddprosent',
    unit: '%',
    description: 'Percentage of shots on target',
    descriptionNO: 'Prosent skudd på mål',
    category: 'scoring',
    higherIsBetter: true,
    benchmarks: { amateur: 40, intermediate: 50, advanced: 60, elite: 70, professional: 75 },
  },
  {
    id: 'assists',
    name: 'Assists',
    nameNO: 'Målgivende',
    unit: 'assists',
    description: 'Assists per match',
    descriptionNO: 'Målgivende pasninger per kamp',
    category: 'passing',
    higherIsBetter: true,
  },
  {
    id: 'pass_accuracy',
    name: 'Pass Accuracy',
    nameNO: 'Pasningsprosent',
    unit: '%',
    description: 'Percentage of successful passes',
    descriptionNO: 'Prosent vellykkede pasninger',
    category: 'passing',
    higherIsBetter: true,
    benchmarks: { amateur: 70, intermediate: 78, advanced: 85, elite: 90, professional: 95 },
  },
  {
    id: 'steals',
    name: 'Steals',
    nameNO: 'Ballerobringer',
    unit: 'steals',
    description: 'Defensive ball recoveries',
    descriptionNO: 'Defensive ballerobringer',
    category: 'defense',
    higherIsBetter: true,
  },
  {
    id: 'blocks',
    name: 'Blocks',
    nameNO: 'Blokkeringer',
    unit: 'blocks',
    description: 'Shots blocked',
    descriptionNO: 'Blokkerte skudd',
    category: 'defense',
    higherIsBetter: true,
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
    benchmarks: { amateur: 25, intermediate: 30, advanced: 35, elite: 40, professional: 45 },
  },
  {
    id: 'sprint_speed',
    name: 'Sprint Speed',
    nameNO: 'Sprintfart',
    unit: 'm/s',
    description: 'Maximum sprint speed',
    descriptionNO: 'Maksimal sprintfart',
    category: 'physical',
    higherIsBetter: true,
    benchmarks: { amateur: 6.5, intermediate: 7.0, advanced: 7.5, elite: 8.0, professional: 8.5 },
  },
  {
    id: 'vertical_jump',
    name: 'Vertical Jump',
    nameNO: 'Vertikalhopp',
    unit: 'cm',
    description: 'Vertical jump height',
    descriptionNO: 'Vertikalt hopphøyde',
    category: 'physical',
    higherIsBetter: true,
    benchmarks: { amateur: 35, intermediate: 45, advanced: 55, elite: 65, professional: 75 },
  },
  {
    id: 'throwing_speed',
    name: 'Throwing Speed',
    nameNO: 'Kasthastighet',
    unit: 'km/h',
    description: 'Maximum throwing speed',
    descriptionNO: 'Maksimal kasthastighet',
    category: 'shooting',
    higherIsBetter: true,
    benchmarks: { amateur: 60, intermediate: 75, advanced: 90, elite: 105, professional: 120 },
  },
];

// ============================================================================
// EQUIPMENT
// ============================================================================

const equipment: Equipment[] = [
  {
    id: 'handball',
    name: 'Handball',
    nameNO: 'Håndball',
    category: 'ball',
    icon: 'Circle',
    description: 'Standard handball (size 2/3)',
    providesData: false,
  },
  {
    id: 'goalkeeper_gloves',
    name: 'Goalkeeper Gloves',
    nameNO: 'Keeperhansker',
    category: 'protection',
    icon: 'Hand',
    providesData: false,
  },
  {
    id: 'speed_radar',
    name: 'Speed Radar',
    nameNO: 'Fartsradar',
    category: 'measurement',
    icon: 'Radar',
    description: 'Throwing speed measurement',
    providesData: true,
    dataTypes: ['throwing_speed'],
  },
  {
    id: 'gps_tracker',
    name: 'GPS Tracker',
    nameNO: 'GPS-sporer',
    category: 'wearable',
    icon: 'MapPin',
    description: 'Movement and speed tracking',
    providesData: true,
    dataTypes: ['distance', 'speed', 'sprints', 'accelerations'],
  },
  {
    id: 'heart_rate_monitor',
    name: 'Heart Rate Monitor',
    nameNO: 'Pulsmåler',
    category: 'wearable',
    icon: 'Heart',
    description: 'Heart rate tracking',
    providesData: true,
    dataTypes: ['heart_rate'],
  },
];

// ============================================================================
// TEST PROTOCOLS
// ============================================================================

const testProtocols: TestProtocol[] = [
  {
    id: 'throwing_speed_test',
    testNumber: 1,
    name: 'Throwing Speed Test',
    nameNO: 'Kasthastighetstest',
    shortName: 'Throw',
    category: 'speed',
    icon: 'Zap',
    description: 'Maximum throwing velocity test',
    descriptionNO: 'Maksimal kasthastighetstest',
    purpose: 'Measure throwing power',
    purposeNO: 'Måle kastkraft',
    methodology: [
      'Warm up thoroughly',
      'Take 3 attempts with standing throw',
      'Take 3 attempts with run-up',
      'Record fastest speed',
    ],
    equipment: ['Speed radar', 'Handball', 'Goal'],
    duration: '10 min',
    attempts: 6,
    unit: 'km/h',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 110, label: 'Elite', color: 'gold' },
      good: { max: 95, label: 'Advanced', color: 'green' },
      average: { max: 80, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 65, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Focus on technique before power',
      'Use full body rotation',
      'Follow through completely',
    ],
  },
  {
    id: 'shot_accuracy_test',
    testNumber: 2,
    name: 'Shot Accuracy Test',
    nameNO: 'Skuddnøyaktighetstest',
    shortName: 'Accuracy',
    category: 'accuracy',
    icon: 'Target',
    description: 'Shooting accuracy to target zones',
    descriptionNO: 'Skuddnøyaktighet til målsoner',
    purpose: 'Measure shooting precision',
    purposeNO: 'Måle skuddpresisjon',
    methodology: [
      'Goal divided into 6 zones',
      '10 shots from 9 meters',
      'Alternate between zones',
      'Score hits in correct zone',
    ],
    equipment: ['Goal with target zones', 'Handball'],
    duration: '10 min',
    attempts: 10,
    unit: '%',
    lowerIsBetter: false,
    formType: 'percentage',
    calculationType: 'percentage',
    scoring: {
      excellent: { max: 90, label: 'Elite', color: 'gold' },
      good: { max: 70, label: 'Advanced', color: 'green' },
      average: { max: 50, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 30, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Focus on placement over power',
      'Pick your target before shooting',
      'Stay balanced through the shot',
    ],
  },
  {
    id: 'agility_test',
    testNumber: 3,
    name: 'Agility T-Test',
    nameNO: 'Spenst T-test',
    shortName: 'T-Test',
    category: 'speed',
    icon: 'Activity',
    description: 'Agility and change of direction test',
    descriptionNO: 'Spenst- og retningsforandingstest',
    purpose: 'Measure agility and footwork',
    purposeNO: 'Måle spenst og fotarbeid',
    methodology: [
      'Sprint 10m forward',
      'Shuffle 5m left',
      'Shuffle 10m right',
      'Shuffle 5m back to center',
      'Backpedal 10m to start',
    ],
    equipment: ['Cones', 'Stopwatch'],
    duration: '5 min',
    attempts: 3,
    unit: 'seconds',
    lowerIsBetter: true,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 9.5, label: 'Elite', color: 'gold' },
      good: { max: 10.5, label: 'Advanced', color: 'green' },
      average: { max: 11.5, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 12.5, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Stay low throughout',
      'Touch each cone',
      'Quick feet, not big steps',
    ],
  },
  {
    id: 'vertical_jump_test',
    testNumber: 4,
    name: 'Vertical Jump Test',
    nameNO: 'Vertikalhopptest',
    shortName: 'VJump',
    category: 'strength',
    icon: 'ArrowUp',
    description: 'Counter-movement jump height',
    descriptionNO: 'Vertikalt hopphøyde',
    purpose: 'Measure explosive leg power',
    purposeNO: 'Måle eksplosiv beinkraft',
    methodology: [
      'Stand with feet shoulder-width apart',
      'Perform counter-movement jump',
      'Measure jump height',
      'Best of 3 attempts',
    ],
    equipment: ['Jump mat or Vertec', 'Measuring tape'],
    duration: '5 min',
    attempts: 3,
    unit: 'cm',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 65, label: 'Elite', color: 'gold' },
      good: { max: 55, label: 'Advanced', color: 'green' },
      average: { max: 45, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 35, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Use arm swing for momentum',
      'Jump straight up',
      'Land softly',
    ],
  },
  {
    id: 'beep_test',
    testNumber: 5,
    name: 'Beep Test',
    nameNO: 'Beep-test',
    shortName: 'Beep',
    category: 'endurance',
    icon: 'Volume2',
    description: 'Multi-stage fitness test',
    descriptionNO: 'Flertrinns kondisjonstest',
    purpose: 'Estimate VO2max',
    purposeNO: 'Estimere VO2max',
    methodology: [
      'Run 20m shuttles in time with beeps',
      'Speed increases each level',
      'Continue until unable to keep pace',
    ],
    equipment: ['Flat surface (20m)', 'Beep test audio', 'Cones'],
    duration: '5-20 min',
    attempts: 1,
    unit: 'level',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'direct',
    scoring: {
      excellent: { max: 14, label: 'Elite', color: 'gold' },
      good: { max: 12, label: 'Advanced', color: 'green' },
      average: { max: 10, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 8, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Pace yourself in early stages',
      'Turn efficiently at each end',
      'Stay relaxed',
    ],
  },
];

// ============================================================================
// TERMINOLOGY
// ============================================================================

const terminology: SportTerminology = {
  // Roles
  athlete: 'Player',
  athletePlural: 'Players',
  coach: 'Coach',
  coachPlural: 'Coaches',

  // Norwegian roles
  athleteNO: 'Spiller',
  athletePluralNO: 'Spillere',
  coachNO: 'Trener',
  coachPluralNO: 'Trenere',

  // Training
  session: 'Session',
  sessionPlural: 'Sessions',
  practice: 'Training',
  drill: 'Drill',
  drillPlural: 'Drills',

  // Norwegian training
  sessionNO: 'Økt',
  sessionPluralNO: 'Økter',
  practiceNO: 'Trening',
  drillNO: 'Øvelse',
  drillPluralNO: 'Øvelser',

  // Competition
  competition: 'Match',
  competitionPlural: 'Matches',
  match: 'Game',
  matchPlural: 'Games',

  // Norwegian competition
  competitionNO: 'Kamp',
  competitionPluralNO: 'Kamper',
  matchNO: 'Kamp',
  matchPluralNO: 'Kamper',

  // Performance
  score: 'Goals',
  result: 'Result',
  personalBest: 'Personal Best',

  // Norwegian performance
  scoreNO: 'Mål',
  resultNO: 'Resultat',
  personalBestNO: 'Personlig rekord',

  // Handball-specific
  shot: 'Shot',
  shotNO: 'Skudd',
  pass: 'Pass',
  passNO: 'Pasning',
  save: 'Save',
  saveNO: 'Redning',
  goal: 'Goal',
  goalNO: 'Mål',
  assist: 'Assist',
  assistNO: 'Målgivende',
  block: 'Block',
  blockNO: 'Blokkering',
  steal: 'Steal',
  stealNO: 'Ballerobbring',
  court: 'Court',
  courtNO: 'Bane',
  goalkeeper: 'Goalkeeper',
  goalkeeperNO: 'Keeper',
  wing: 'Wing',
  wingNO: 'Kant',
  pivot: 'Pivot',
  pivotNO: 'Strek',
  backcourt: 'Backcourt',
  backcourtNO: 'Bakspiller',
};

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

const pyramidCategories: PyramidCategory[] = [
  {
    code: 'FYS',
    label: 'Physical',
    labelNO: 'Fysisk',
    description: 'Strength, speed, endurance, mobility',
    descriptionNO: 'Styrke, hurtighet, utholdenhet, mobilitet',
    icon: 'Dumbbell',
    color: 'rgb(var(--status-warning))',
    order: 1,
    usesIntensity: true,
    usesPosition: false,
  },
  {
    code: 'TEK',
    label: 'Technique',
    labelNO: 'Teknikk',
    description: 'Shooting, passing, catching, footwork',
    descriptionNO: 'Skudd, pasning, mottak, fotarbeid',
    icon: 'Target',
    color: 'rgb(var(--category-j))',
    order: 2,
    usesIntensity: true,
    usesPosition: true,
  },
  {
    code: 'TAK',
    label: 'Tactical',
    labelNO: 'Taktisk',
    description: 'Game systems, positioning, decision making',
    descriptionNO: 'Spillsystemer, posisjonering, beslutninger',
    icon: 'Brain',
    color: 'rgb(var(--status-info))',
    order: 3,
    usesIntensity: true,
    usesPosition: true,
  },
  {
    code: 'LAG',
    label: 'Team Play',
    labelNO: 'Lagspill',
    description: 'Team coordination, set plays, communication',
    descriptionNO: 'Lagkoordinering, fastsatte spill, kommunikasjon',
    icon: 'Users',
    color: 'rgb(var(--status-success))',
    order: 4,
    usesIntensity: true,
    usesPosition: false,
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
    usesPosition: false,
  },
];

const sessionTemplates: SessionTemplate[] = [
  {
    id: 'shooting-practice',
    name: 'Shooting Practice',
    nameNO: 'Skuddtrening',
    description: 'Focus on shooting technique and accuracy',
    descriptionNO: 'Fokus på skuddteknikk og nøyaktighet',
    defaultDuration: 60,
    categoryCode: 'TEK',
    defaultAreas: ['JUMP_SHOT', 'STANDING_SHOT', 'WING_SHOT'],
    defaultEnvironment: 'M1',
    icon: 'Target',
  },
  {
    id: 'passing-drills',
    name: 'Passing Drills',
    nameNO: 'Pasningsøvelser',
    description: 'Passing technique and accuracy',
    descriptionNO: 'Pasningsteknikk og nøyaktighet',
    defaultDuration: 45,
    categoryCode: 'TEK',
    defaultAreas: ['CHEST_PASS', 'BOUNCE_PASS', 'CATCHING'],
    defaultEnvironment: 'M1',
    icon: 'ArrowRight',
  },
  {
    id: 'defense-training',
    name: 'Defense Training',
    nameNO: 'Forsvarstrening',
    description: 'Defensive systems and techniques',
    descriptionNO: 'Forsvarssystemer og teknikker',
    defaultDuration: 60,
    categoryCode: 'TAK',
    defaultAreas: ['MAN_DEFENSE', 'ZONE_DEFENSE', 'BLOCKING'],
    defaultEnvironment: 'M1',
    icon: 'Shield',
  },
  {
    id: 'goalkeeper-training',
    name: 'Goalkeeper Training',
    nameNO: 'Keepertrening',
    description: 'Goalkeeper-specific training',
    descriptionNO: 'Keeperspesifikk trening',
    defaultDuration: 60,
    categoryCode: 'TEK',
    defaultAreas: ['GOALKEEPER'],
    defaultEnvironment: 'M1',
    icon: 'Shield',
  },
  {
    id: 'team-tactics',
    name: 'Team Tactics',
    nameNO: 'Lagtaktikk',
    description: 'Team play and tactical systems',
    descriptionNO: 'Lagspill og taktiske systemer',
    defaultDuration: 90,
    categoryCode: 'LAG',
    defaultEnvironment: 'M1',
    icon: 'Users',
  },
  {
    id: 'physical-conditioning',
    name: 'Physical Conditioning',
    nameNO: 'Fysisk trening',
    description: 'Strength and conditioning',
    descriptionNO: 'Styrke og kondisjon',
    defaultDuration: 60,
    categoryCode: 'FYS',
    defaultAreas: ['STRENGTH', 'SPEED', 'ENDURANCE'],
    defaultEnvironment: 'M0',
    icon: 'Dumbbell',
  },
  {
    id: 'match-simulation',
    name: 'Match Simulation',
    nameNO: 'Kampsimulering',
    description: 'Full or partial game simulation',
    descriptionNO: 'Hel eller delvis kampsimulering',
    defaultDuration: 90,
    categoryCode: 'KAMP',
    defaultEnvironment: 'M4',
    icon: 'Trophy',
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
  { code: 'K', label: 'Beginner', labelNO: 'Nybegynner', order: 1, color: '#9CA3AF', description: 'New to handball' },
  { code: 'J', label: 'Novice', labelNO: 'Nybegynner+', order: 2, color: '#6B7280', description: 'Basic skills' },
  { code: 'I', label: 'Youth', labelNO: 'Ungdom', order: 3, color: '#8B5CF6', description: 'Youth level' },
  { code: 'H', label: 'Junior', labelNO: 'Junior', order: 4, color: '#A78BFA', description: 'Junior level' },
  { code: 'G', label: 'Intermediate', labelNO: 'Mellomnivå', order: 5, color: '#3B82F6', description: 'Club level' },
  { code: 'F', label: 'Competent', labelNO: 'Kompetent', order: 6, color: '#60A5FA', description: 'Division 2-3' },
  { code: 'E', label: 'Advanced', labelNO: 'Avansert', order: 7, color: '#10B981', description: 'Division 1' },
  { code: 'D', label: 'Skilled', labelNO: 'Dyktig', order: 8, color: '#34D399', description: 'Elite series' },
  { code: 'C', label: 'Elite', labelNO: 'Elite', order: 9, color: '#F59E0B', description: 'Top league' },
  { code: 'B', label: 'National', labelNO: 'Landslag', order: 10, color: '#FBBF24', description: 'National team' },
  { code: 'A', label: 'International', labelNO: 'Internasjonal', order: 11, color: '#EF4444', description: 'International' },
];

const benchmarks: BenchmarkConfig = {
  skillLevels,
  levelBenchmarks: [
    {
      levelCode: 'A',
      benchmarks: [
        { metricId: 'throwing_speed', value: 110, required: true },
        { metricId: 'shot_accuracy', value: 75 },
        { metricId: 'vertical_jump', value: 65 },
      ],
    },
    {
      levelCode: 'B',
      benchmarks: [
        { metricId: 'throwing_speed', value: 100, required: true },
        { metricId: 'shot_accuracy', value: 70 },
        { metricId: 'vertical_jump', value: 60 },
      ],
    },
    {
      levelCode: 'E',
      benchmarks: [
        { metricId: 'throwing_speed', value: 85, required: true },
        { metricId: 'shot_accuracy', value: 60 },
        { metricId: 'vertical_jump', value: 50 },
      ],
    },
    {
      levelCode: 'G',
      benchmarks: [
        { metricId: 'throwing_speed', value: 70, required: true },
        { metricId: 'shot_accuracy', value: 50 },
        { metricId: 'vertical_jump', value: 40 },
      ],
    },
  ],
  source: 'EHF',
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
// COMPLETE HANDBALL CONFIG
// ============================================================================

export const HANDBALL_CONFIG: SportConfig = {
  id: 'handball',
  name: 'Handball',
  nameNO: 'Håndball',
  icon: 'Circle',
  color: '#DC2626', // Red

  trainingAreas,
  environments,
  phases,
  intensityLevels,
  pressureLevels,

  testProtocols,
  performanceMetrics,
  benchmarkSource: 'EHF',

  goalCategories,
  sessions,
  benchmarks,
  terminology,
  equipment,
  navigation,

  metadata: {
    courtDimensions: { length: 40, width: 20 },
    goalDimensions: { width: 3, height: 2 },
    matchDuration: { halves: 2, minutes: 30 },
    teamSize: { court: 7, substitutes: 7 },
    positions: ['goalkeeper', 'left_wing', 'left_back', 'center_back', 'right_back', 'right_wing', 'pivot'],
  },
};

export default HANDBALL_CONFIG;
