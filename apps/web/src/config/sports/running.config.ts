/**
 * Running Sport Configuration
 *
 * Complete configuration for running as a sport in the multi-sport platform.
 * This file contains all running-specific data including training areas,
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
// TRAINING AREAS - Speed Work, Endurance, Technical Running
// ============================================================================

const trainingAreas: TrainingAreaGroup[] = [
  {
    code: 'speedWork',
    label: 'Speed Work',
    labelNO: 'Fartstrening',
    icon: 'Zap',
    areas: [
      {
        code: 'SPRINT',
        label: 'Sprint Training',
        labelNO: 'Sprinttrening',
        icon: 'Zap',
        description: '100-400m sprints, max effort',
        descriptionNO: '100-400m sprinter, maksimal innsats',
        usesIntensity: true,
      },
      {
        code: 'INTERVAL',
        label: 'Interval Training',
        labelNO: 'Intervalltrening',
        icon: 'Activity',
        description: 'High intensity intervals with recovery',
        descriptionNO: 'Høyintensitetsintervaller med hvile',
        usesIntensity: true,
      },
      {
        code: 'TEMPO',
        label: 'Tempo Runs',
        labelNO: 'Tempoløp',
        icon: 'TrendingUp',
        description: 'Sustained effort at threshold pace',
        descriptionNO: 'Vedvarende innsats ved terskelfart',
        usesIntensity: true,
      },
      {
        code: 'FARTLEK',
        label: 'Fartlek',
        labelNO: 'Fartlek',
        icon: 'Shuffle',
        description: 'Varied pace running',
        descriptionNO: 'Variert fartstrening',
        usesIntensity: true,
      },
    ],
  },
  {
    code: 'endurance',
    label: 'Endurance',
    labelNO: 'Utholdenhet',
    icon: 'Heart',
    areas: [
      {
        code: 'EASY',
        label: 'Easy Runs',
        labelNO: 'Rolige løp',
        icon: 'Heart',
        description: 'Recovery pace, base building',
        descriptionNO: 'Restitusjonsfart, basebygging',
        usesIntensity: true,
      },
      {
        code: 'LONG',
        label: 'Long Runs',
        labelNO: 'Langturer',
        icon: 'Map',
        description: 'Extended duration for endurance',
        descriptionNO: 'Lengre varighet for utholdenhet',
        usesIntensity: true,
      },
      {
        code: 'MODERATE',
        label: 'Moderate Runs',
        labelNO: 'Moderate løp',
        icon: 'Activity',
        description: 'Steady state aerobic running',
        descriptionNO: 'Jevnt aerob løping',
        usesIntensity: true,
      },
      {
        code: 'PROGRESSIVE',
        label: 'Progressive Runs',
        labelNO: 'Progressive løp',
        icon: 'TrendingUp',
        description: 'Gradually increasing pace',
        descriptionNO: 'Gradvis økende fart',
        usesIntensity: true,
      },
    ],
  },
  {
    code: 'technical',
    label: 'Technical Running',
    labelNO: 'Teknisk løping',
    icon: 'Target',
    areas: [
      {
        code: 'DRILLS',
        label: 'Running Drills',
        labelNO: 'Løpsøvelser',
        icon: 'Target',
        description: 'Form and technique drills',
        descriptionNO: 'Form- og teknikkøvelser',
        usesIntensity: false,
      },
      {
        code: 'STRIDES',
        label: 'Strides',
        labelNO: 'Stigningsløp',
        icon: 'ArrowRight',
        description: 'Short acceleration bursts',
        descriptionNO: 'Korte akselerasjoner',
        usesIntensity: true,
      },
      {
        code: 'HILL',
        label: 'Hill Training',
        labelNO: 'Bakktrening',
        icon: 'Mountain',
        description: 'Uphill and downhill technique',
        descriptionNO: 'Oppoverbakke- og utforbakketeknikk',
        usesIntensity: true,
      },
      {
        code: 'CADENCE',
        label: 'Cadence Work',
        labelNO: 'Skrittfrekvens',
        icon: 'Clock',
        description: 'Step frequency optimization',
        descriptionNO: 'Optimalisering av skrittfrekvens',
        usesIntensity: false,
      },
    ],
  },
  {
    code: 'strength',
    label: 'Strength & Conditioning',
    labelNO: 'Styrke & Kondisjon',
    icon: 'Dumbbell',
    areas: [
      {
        code: 'CORE',
        label: 'Core Training',
        labelNO: 'Kjernetrening',
        icon: 'Shield',
        description: 'Core stability and strength',
        descriptionNO: 'Kjernestabilitet og styrke',
        usesIntensity: false,
      },
      {
        code: 'STRENGTH',
        label: 'Strength Training',
        labelNO: 'Styrketrening',
        icon: 'Dumbbell',
        description: 'General and running-specific strength',
        descriptionNO: 'Generell og løpsspesifikk styrke',
        usesIntensity: false,
      },
      {
        code: 'PLYOMETRIC',
        label: 'Plyometrics',
        labelNO: 'Plyometri',
        icon: 'ArrowUp',
        description: 'Explosive power training',
        descriptionNO: 'Eksplosiv krafttrening',
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
    label: 'Off-running',
    labelNO: 'Off-running',
    description: 'Gym, home, cross-training',
    descriptionNO: 'Gym, hjemme, alternativ trening',
    icon: 'Dumbbell',
    type: 'indoor',
    competitionLevel: 0,
  },
  {
    code: 'M1',
    label: 'Treadmill',
    labelNO: 'Tredemølle',
    description: 'Indoor treadmill running',
    descriptionNO: 'Innendørs tredemølleløping',
    icon: 'Activity',
    type: 'indoor',
    competitionLevel: 0,
  },
  {
    code: 'M2',
    label: 'Track',
    labelNO: 'Friidrettsbane',
    description: 'Outdoor athletics track',
    descriptionNO: 'Utendørs friidrettsbane',
    icon: 'Circle',
    type: 'outdoor',
    competitionLevel: 2,
  },
  {
    code: 'M3',
    label: 'Road',
    labelNO: 'Asfalt',
    description: 'Paved roads and paths',
    descriptionNO: 'Asfalterte veier og stier',
    icon: 'Map',
    type: 'outdoor',
    competitionLevel: 3,
  },
  {
    code: 'M4',
    label: 'Trail',
    labelNO: 'Terreng',
    description: 'Off-road, natural terrain',
    descriptionNO: 'Naturlig terreng, sti',
    icon: 'Mountain',
    type: 'outdoor',
    competitionLevel: 3,
  },
  {
    code: 'M5',
    label: 'Race',
    labelNO: 'Løp',
    description: 'Competition race event',
    descriptionNO: 'Konkurranseløp',
    icon: 'Trophy',
    type: 'outdoor',
    competitionLevel: 5,
  },
];

// ============================================================================
// TRAINING PHASES - Periodization for running
// ============================================================================

const phases: TrainingPhase[] = [
  {
    code: 'L-BASE',
    label: 'Base Building',
    labelNO: 'Basebygging',
    description: 'Aerobic foundation, easy miles',
    descriptionNO: 'Aerob grunnlag, rolige kilometer',
    icon: 'Heart',
    intensityRange: 'Z1-Z2',
    order: 1,
  },
  {
    code: 'L-BUILD',
    label: 'Build Phase',
    labelNO: 'Oppbyggingsfase',
    description: 'Increasing volume and intensity',
    descriptionNO: 'Økende volum og intensitet',
    icon: 'TrendingUp',
    intensityRange: 'Z2-Z3',
    order: 2,
  },
  {
    code: 'L-SPEED',
    label: 'Speed Development',
    labelNO: 'Fartsutvikling',
    description: 'Speed work and VO2max training',
    descriptionNO: 'Fartstrening og VO2max-trening',
    icon: 'Zap',
    intensityRange: 'Z4-Z5',
    order: 3,
  },
  {
    code: 'L-PEAK',
    label: 'Peak/Race Prep',
    labelNO: 'Toppform/Løpsforberedelse',
    description: 'Race-specific preparation',
    descriptionNO: 'Løpsspesifikk forberedelse',
    icon: 'Target',
    intensityRange: 'Z3-Z5',
    order: 4,
  },
  {
    code: 'L-TAPER',
    label: 'Taper',
    labelNO: 'Nedtrapping',
    description: 'Reduced volume before race',
    descriptionNO: 'Redusert volum før løp',
    icon: 'Moon',
    intensityRange: 'Z1-Z3',
    order: 5,
  },
  {
    code: 'L-RECOVER',
    label: 'Recovery',
    labelNO: 'Restitusjon',
    description: 'Active recovery period',
    descriptionNO: 'Aktiv restitusjonsperiode',
    icon: 'Coffee',
    intensityRange: 'Z1',
    order: 6,
  },
];

// ============================================================================
// INTENSITY LEVELS - Heart Rate Zones
// ============================================================================

const intensityLevels: IntensityLevel[] = [
  { code: 'Z0', value: 0, label: 'Rest', labelNO: 'Hvile', description: 'Complete rest', descriptionNO: 'Fullstendig hvile' },
  { code: 'Z1', value: 55, label: 'Recovery', labelNO: 'Restitusjon', description: '50-60% HRmax, very easy', descriptionNO: '50-60% makspuls, veldig lett' },
  { code: 'Z2', value: 70, label: 'Easy Aerobic', labelNO: 'Lett aerob', description: '60-70% HRmax, conversational', descriptionNO: '60-70% makspuls, samtaletempo' },
  { code: 'Z3', value: 80, label: 'Aerobic', labelNO: 'Aerob', description: '70-80% HRmax, moderate', descriptionNO: '70-80% makspuls, moderat' },
  { code: 'Z4', value: 88, label: 'Threshold', labelNO: 'Terskel', description: '80-90% HRmax, tempo pace', descriptionNO: '80-90% makspuls, tempofart' },
  { code: 'Z5A', value: 95, label: 'VO2max', labelNO: 'VO2max', description: '90-95% HRmax, hard intervals', descriptionNO: '90-95% makspuls, harde intervaller' },
  { code: 'Z5B', value: 100, label: 'Anaerobic', labelNO: 'Anaerob', description: '95-100% HRmax, max effort', descriptionNO: '95-100% makspuls, maksimal innsats' },
];

// ============================================================================
// PRESSURE LEVELS - Physical & mental load
// ============================================================================

const pressureLevels: PressureLevel[] = [
  { code: 'PR1', level: 1, label: 'None', labelNO: 'Ingen', description: 'Solo training, no tracking', descriptionNO: 'Solotrening, ingen tracking', icon: 'Smile' },
  { code: 'PR2', level: 2, label: 'Self-monitoring', labelNO: 'Selvmonitorering', description: 'GPS, watch, metrics', descriptionNO: 'GPS, klokke, måltall', icon: 'Watch' },
  { code: 'PR3', level: 3, label: 'Group', labelNO: 'Gruppe', description: 'Training with others', descriptionNO: 'Trening med andre', icon: 'Users' },
  { code: 'PR4', level: 4, label: 'Time Trial', labelNO: 'Tidskjøring', description: 'Simulated race conditions', descriptionNO: 'Simulerte løpsforhold', icon: 'Timer' },
  { code: 'PR5', level: 5, label: 'Race', labelNO: 'Løp', description: 'Competition event', descriptionNO: 'Konkurranseløp', icon: 'Trophy' },
];

// ============================================================================
// GOAL CATEGORIES
// ============================================================================

const goalCategories: GoalCategory[] = [
  { id: 'pace', name: 'Pace', nameNO: 'Fart', icon: 'Timer', color: 'blue', description: 'Pace goals', descriptionNO: 'Fartsmål' },
  { id: 'distance', name: 'Distance', nameNO: 'Distanse', icon: 'Map', color: 'green', description: 'Distance goals', descriptionNO: 'Distansemål' },
  { id: 'endurance', name: 'Endurance', nameNO: 'Utholdenhet', icon: 'Heart', color: 'red', description: 'Endurance goals', descriptionNO: 'Utholdenhetsmål' },
  { id: 'fysisk', name: 'Physical', nameNO: 'Fysisk', icon: 'Dumbbell', color: 'orange', description: 'Physical fitness', descriptionNO: 'Fysisk form' },
  { id: 'race', name: 'Race', nameNO: 'Løp', icon: 'Trophy', color: 'gold', description: 'Race results', descriptionNO: 'Løpsresultater' },
  { id: 'prosess', name: 'Process', nameNO: 'Prosess', icon: 'RefreshCw', color: 'teal', description: 'Process goals', descriptionNO: 'Prosessmål' },
];

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'vo2max',
    name: 'VO2max',
    nameNO: 'VO2max',
    unit: 'ml/kg/min',
    description: 'Maximum oxygen uptake',
    descriptionNO: 'Maksimalt oksygenopptak',
    category: 'endurance',
    higherIsBetter: true,
    benchmarks: { amateur: 35, intermediate: 45, advanced: 55, elite: 65, professional: 75 },
  },
  {
    id: 'threshold_pace',
    name: 'Threshold Pace',
    nameNO: 'Terskelfart',
    unit: 'min/km',
    description: 'Lactate threshold pace',
    descriptionNO: 'Laktatterskel-fart',
    category: 'speed',
    higherIsBetter: false,
    benchmarks: { amateur: 6.0, intermediate: 5.0, advanced: 4.3, elite: 3.5, professional: 3.0 },
  },
  {
    id: '5k_time',
    name: '5K Time',
    nameNO: '5 km tid',
    unit: 'min',
    description: '5 kilometer race time',
    descriptionNO: '5 kilometer løpstid',
    category: 'race',
    higherIsBetter: false,
    benchmarks: { amateur: 30, intermediate: 25, advanced: 20, elite: 16, professional: 14 },
  },
  {
    id: '10k_time',
    name: '10K Time',
    nameNO: '10 km tid',
    unit: 'min',
    description: '10 kilometer race time',
    descriptionNO: '10 kilometer løpstid',
    category: 'race',
    higherIsBetter: false,
    benchmarks: { amateur: 65, intermediate: 52, advanced: 42, elite: 33, professional: 28 },
  },
  {
    id: 'half_marathon',
    name: 'Half Marathon',
    nameNO: 'Halvmaraton',
    unit: 'min',
    description: 'Half marathon time',
    descriptionNO: 'Halvmaratontid',
    category: 'race',
    higherIsBetter: false,
    benchmarks: { amateur: 150, intermediate: 120, advanced: 95, elite: 75, professional: 62 },
  },
  {
    id: 'marathon',
    name: 'Marathon',
    nameNO: 'Maraton',
    unit: 'min',
    description: 'Marathon time',
    descriptionNO: 'Maratontid',
    category: 'race',
    higherIsBetter: false,
    benchmarks: { amateur: 330, intermediate: 260, advanced: 200, elite: 155, professional: 130 },
  },
  {
    id: 'cadence',
    name: 'Cadence',
    nameNO: 'Skrittfrekvens',
    unit: 'spm',
    description: 'Steps per minute',
    descriptionNO: 'Skritt per minutt',
    category: 'technique',
    higherIsBetter: true,
    benchmarks: { amateur: 160, intermediate: 170, advanced: 175, elite: 180, professional: 185 },
  },
  {
    id: 'weekly_km',
    name: 'Weekly Distance',
    nameNO: 'Ukedistanse',
    unit: 'km',
    description: 'Weekly training volume',
    descriptionNO: 'Ukentlig treningsvolum',
    category: 'volume',
    higherIsBetter: true,
    benchmarks: { amateur: 20, intermediate: 40, advanced: 70, elite: 120, professional: 180 },
  },
  {
    id: 'max_hr',
    name: 'Max Heart Rate',
    nameNO: 'Makspuls',
    unit: 'bpm',
    description: 'Maximum heart rate',
    descriptionNO: 'Maksimal hjertefrekvens',
    category: 'physical',
    higherIsBetter: false,
  },
  {
    id: 'resting_hr',
    name: 'Resting Heart Rate',
    nameNO: 'Hvilepuls',
    unit: 'bpm',
    description: 'Resting heart rate',
    descriptionNO: 'Hvilende hjertefrekvens',
    category: 'physical',
    higherIsBetter: false,
    benchmarks: { amateur: 70, intermediate: 60, advanced: 52, elite: 45, professional: 38 },
  },
];

// ============================================================================
// EQUIPMENT
// ============================================================================

const equipment: Equipment[] = [
  {
    id: 'gps_watch',
    name: 'GPS Watch',
    nameNO: 'GPS-klokke',
    category: 'wearable',
    icon: 'Watch',
    description: 'GPS running watch',
    providesData: true,
    dataTypes: ['pace', 'distance', 'heart_rate', 'cadence', 'elevation'],
  },
  {
    id: 'heart_rate_monitor',
    name: 'Heart Rate Monitor',
    nameNO: 'Pulsmåler',
    category: 'wearable',
    icon: 'Heart',
    description: 'Chest strap or optical HR monitor',
    providesData: true,
    dataTypes: ['heart_rate', 'heart_rate_variability'],
  },
  {
    id: 'foot_pod',
    name: 'Foot Pod',
    nameNO: 'Fotpod',
    category: 'sensor',
    icon: 'Activity',
    description: 'Running dynamics sensor',
    providesData: true,
    dataTypes: ['cadence', 'ground_contact_time', 'stride_length'],
  },
  {
    id: 'running_shoes',
    name: 'Running Shoes',
    nameNO: 'Løpesko',
    category: 'footwear',
    icon: 'Footprints',
    providesData: false,
  },
  {
    id: 'treadmill',
    name: 'Treadmill',
    nameNO: 'Tredemølle',
    category: 'equipment',
    icon: 'Activity',
    description: 'Indoor running machine',
    providesData: true,
    dataTypes: ['pace', 'distance', 'incline', 'heart_rate'],
  },
];

// ============================================================================
// TEST PROTOCOLS
// ============================================================================

const testProtocols: TestProtocol[] = [
  {
    id: 'cooper_test',
    testNumber: 1,
    name: 'Cooper Test',
    nameNO: 'Cooper-test',
    shortName: 'Cooper',
    category: 'endurance',
    icon: 'Timer',
    description: '12-minute run test for VO2max estimation',
    descriptionNO: '12-minutters løpetest for estimering av VO2max',
    purpose: 'Measure aerobic capacity',
    purposeNO: 'Måle aerob kapasitet',
    methodology: [
      'Run as far as possible in 12 minutes',
      'Maintain consistent pace',
      'Record total distance covered',
    ],
    equipment: ['Track or measured course', 'Stopwatch', 'GPS watch (optional)'],
    duration: '12 min',
    attempts: 1,
    unit: 'meters',
    lowerIsBetter: false,
    formType: 'simple',
    calculationType: 'direct',
    scoring: {
      excellent: { max: 3200, label: 'Excellent', color: 'green' },
      good: { max: 2800, label: 'Good', color: 'blue' },
      average: { max: 2400, label: 'Average', color: 'yellow' },
      needsWork: { max: 2000, label: 'Needs Work', color: 'red' },
    },
    tips: [
      'Warm up properly before the test',
      'Start at a sustainable pace',
      'Avoid going out too fast',
    ],
  },
  {
    id: 'time_trial_5k',
    testNumber: 2,
    name: '5K Time Trial',
    nameNO: '5 km tidskjøring',
    shortName: '5K TT',
    category: 'endurance',
    icon: 'Timer',
    description: 'Maximal effort 5 kilometer run',
    descriptionNO: 'Maksimal innsats 5 kilometer løp',
    purpose: 'Benchmark 5K performance',
    purposeNO: 'Benchmark 5 km prestasjon',
    methodology: [
      'Run 5 kilometers as fast as possible',
      'Record split times',
      'Record total time',
    ],
    equipment: ['Track or measured course', 'GPS watch'],
    duration: '15-30 min',
    attempts: 1,
    unit: 'seconds',
    lowerIsBetter: true,
    formType: 'timed',
    calculationType: 'direct',
    scoring: {
      excellent: { max: 1080, label: 'Elite', color: 'gold' },
      good: { max: 1320, label: 'Advanced', color: 'green' },
      average: { max: 1560, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 1800, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Pace yourself - don\'t start too fast',
      'Know the course elevation',
      'Run on a cool day for best results',
    ],
  },
  {
    id: 'lactate_threshold',
    testNumber: 3,
    name: 'Lactate Threshold Test',
    nameNO: 'Terskeltest',
    shortName: 'LT Test',
    category: 'endurance',
    icon: 'Activity',
    description: 'Determine lactate threshold pace',
    descriptionNO: 'Bestemme laktatterskel-fart',
    purpose: 'Find threshold training zones',
    purposeNO: 'Finne terskel-treningssoner',
    methodology: [
      'Progressive pace increases every 3-5 minutes',
      'Monitor heart rate at each stage',
      'Identify deflection point',
    ],
    equipment: ['Treadmill or track', 'Heart rate monitor'],
    duration: '30-45 min',
    attempts: 1,
    unit: 'min/km',
    lowerIsBetter: true,
    formType: 'table',
    calculationType: 'direct',
    scoring: {
      excellent: { max: 3.5, label: 'Elite', color: 'gold' },
      good: { max: 4.0, label: 'Advanced', color: 'green' },
      average: { max: 4.5, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 5.5, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Be well-rested before the test',
      'Don\'t eat heavily before testing',
      'Warm up thoroughly',
    ],
  },
  {
    id: 'sprint_100m',
    testNumber: 4,
    name: '100m Sprint',
    nameNO: '100m sprint',
    shortName: '100m',
    category: 'speed',
    icon: 'Zap',
    description: 'Maximum speed test',
    descriptionNO: 'Maksimal hastighetstest',
    purpose: 'Measure top speed and acceleration',
    purposeNO: 'Måle toppfart og akselerasjon',
    methodology: [
      'Sprint 100 meters from standing start',
      'Maximum effort',
      'Record time to nearest 0.01 seconds',
    ],
    equipment: ['Track', 'Timing system', 'Starting blocks (optional)'],
    duration: '10-15 sec',
    attempts: 3,
    unit: 'seconds',
    lowerIsBetter: true,
    formType: 'simple',
    calculationType: 'best',
    scoring: {
      excellent: { max: 11.5, label: 'Elite', color: 'gold' },
      good: { max: 12.5, label: 'Advanced', color: 'green' },
      average: { max: 14.0, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 16.0, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Warm up thoroughly with dynamic stretches',
      'Practice starts before testing',
      'Allow full recovery between attempts',
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
      good: { max: 11, label: 'Advanced', color: 'green' },
      average: { max: 8, label: 'Intermediate', color: 'blue' },
      needsWork: { max: 6, label: 'Beginner', color: 'red' },
    },
    tips: [
      'Pace yourself in early stages',
      'Turn efficiently at each end',
      'Stay relaxed and breathe rhythmically',
    ],
  },
];

// ============================================================================
// TERMINOLOGY
// ============================================================================

const terminology: SportTerminology = {
  // Roles
  athlete: 'Runner',
  athletePlural: 'Runners',
  coach: 'Coach',
  coachPlural: 'Coaches',

  // Norwegian roles
  athleteNO: 'Løper',
  athletePluralNO: 'Løpere',
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
  competition: 'Race',
  competitionPlural: 'Races',
  match: 'Event',
  matchPlural: 'Events',

  // Norwegian competition
  competitionNO: 'Løp',
  competitionPluralNO: 'Løp',
  matchNO: 'Stevne',
  matchPluralNO: 'Stevner',

  // Performance
  score: 'Time',
  result: 'Result',
  personalBest: 'Personal Best',

  // Norwegian performance
  scoreNO: 'Tid',
  resultNO: 'Resultat',
  personalBestNO: 'Personlig rekord',

  // Running-specific
  pace: 'Pace',
  paceNO: 'Fart',
  interval: 'Interval',
  intervalNO: 'Intervall',
  tempo: 'Tempo',
  tempoNO: 'Tempo',
  easy: 'Easy',
  easyNO: 'Lett',
  long: 'Long Run',
  longNO: 'Langtur',
  track: 'Track',
  trackNO: 'Bane',
  road: 'Road',
  roadNO: 'Asfalt',
  trail: 'Trail',
  trailNO: 'Terreng',
  split: 'Split',
  splitNO: 'Mellomtid',
  negative: 'Negative Split',
  negativeNO: 'Negativ splitt',
  lap: 'Lap',
  lapNO: 'Runde',
};

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

const pyramidCategories: PyramidCategory[] = [
  {
    code: 'FYS',
    label: 'Physical',
    labelNO: 'Fysisk',
    description: 'Strength, power, mobility, conditioning',
    descriptionNO: 'Styrke, power, mobilitet, kondisjon',
    icon: 'Dumbbell',
    color: 'rgb(var(--status-warning))',
    order: 1,
    usesIntensity: false,
    usesPosition: false,
  },
  {
    code: 'TEK',
    label: 'Technique',
    labelNO: 'Teknikk',
    description: 'Running form, drills, cadence',
    descriptionNO: 'Løpsform, øvelser, skrittfrekvens',
    icon: 'Target',
    color: 'rgb(var(--category-j))',
    order: 2,
    usesIntensity: true,
    usesPosition: false,
  },
  {
    code: 'UTHOL',
    label: 'Endurance',
    labelNO: 'Utholdenhet',
    description: 'Aerobic base, long runs, easy runs',
    descriptionNO: 'Aerob base, langturer, rolige løp',
    icon: 'Heart',
    color: 'rgb(var(--status-info))',
    order: 3,
    usesIntensity: true,
    usesPosition: false,
  },
  {
    code: 'FART',
    label: 'Speed',
    labelNO: 'Fart',
    description: 'Intervals, tempo, threshold',
    descriptionNO: 'Intervaller, tempo, terskel',
    icon: 'Zap',
    color: 'rgb(var(--status-success))',
    order: 4,
    usesIntensity: true,
    usesPosition: false,
  },
  {
    code: 'RACE',
    label: 'Race',
    labelNO: 'Løp',
    description: 'Competition, time trials',
    descriptionNO: 'Konkurranse, tidskjøring',
    icon: 'Trophy',
    color: 'rgb(var(--tier-gold))',
    order: 5,
    usesIntensity: true,
    usesPosition: false,
  },
];

const sessionTemplates: SessionTemplate[] = [
  {
    id: 'easy-run',
    name: 'Easy Run',
    nameNO: 'Rolig løp',
    description: 'Recovery pace, base building',
    descriptionNO: 'Restitusjonsfart, basebygging',
    defaultDuration: 45,
    categoryCode: 'UTHOL',
    defaultAreas: ['EASY'],
    defaultEnvironment: 'M3',
    icon: 'Heart',
  },
  {
    id: 'long-run',
    name: 'Long Run',
    nameNO: 'Langtur',
    description: 'Extended endurance session',
    descriptionNO: 'Lengre utholdenhetsøkt',
    defaultDuration: 90,
    categoryCode: 'UTHOL',
    defaultAreas: ['LONG'],
    defaultEnvironment: 'M3',
    icon: 'Map',
  },
  {
    id: 'interval-session',
    name: 'Interval Session',
    nameNO: 'Intervalltrening',
    description: 'High intensity intervals',
    descriptionNO: 'Høyintensitets intervaller',
    defaultDuration: 60,
    categoryCode: 'FART',
    defaultAreas: ['INTERVAL'],
    defaultEnvironment: 'M2',
    icon: 'Activity',
  },
  {
    id: 'tempo-run',
    name: 'Tempo Run',
    nameNO: 'Tempoløp',
    description: 'Sustained threshold pace',
    descriptionNO: 'Vedvarende terskelfart',
    defaultDuration: 50,
    categoryCode: 'FART',
    defaultAreas: ['TEMPO'],
    defaultEnvironment: 'M3',
    icon: 'TrendingUp',
  },
  {
    id: 'track-workout',
    name: 'Track Workout',
    nameNO: 'Banetrening',
    description: 'Track-based speed work',
    descriptionNO: 'Fartstrening på bane',
    defaultDuration: 60,
    categoryCode: 'FART',
    defaultAreas: ['INTERVAL', 'SPRINT'],
    defaultEnvironment: 'M2',
    icon: 'Circle',
  },
  {
    id: 'strength-session',
    name: 'Strength Training',
    nameNO: 'Styrketrening',
    description: 'Running-specific strength',
    descriptionNO: 'Løpsspesifikk styrke',
    defaultDuration: 45,
    categoryCode: 'FYS',
    defaultAreas: ['STRENGTH', 'CORE'],
    defaultEnvironment: 'M0',
    icon: 'Dumbbell',
  },
  {
    id: 'drills-session',
    name: 'Running Drills',
    nameNO: 'Løpsøvelser',
    description: 'Technique and form work',
    descriptionNO: 'Teknikk- og formarbeid',
    defaultDuration: 30,
    categoryCode: 'TEK',
    defaultAreas: ['DRILLS', 'STRIDES'],
    defaultEnvironment: 'M2',
    icon: 'Target',
  },
];

const sessions: SessionConfig = {
  pyramidCategories,
  templates: sessionTemplates,
  sessionTypes: ['training', 'test', 'tournament', 'recovery', 'physical', 'mental'],
  defaultDuration: 45,
  usesAKFormula: false,
};

// ============================================================================
// SKILL LEVELS & BENCHMARKS
// ============================================================================

const skillLevels: SkillLevel[] = [
  { code: 'K', label: 'Beginner', labelNO: 'Nybegynner', order: 1, color: '#9CA3AF', description: '5K > 30 min' },
  { code: 'J', label: 'Novice', labelNO: 'Nybegynner+', order: 2, color: '#6B7280', description: '5K 27-30 min' },
  { code: 'I', label: 'Recreational', labelNO: 'Mosjonist', order: 3, color: '#8B5CF6', description: '5K 24-27 min' },
  { code: 'H', label: 'Active', labelNO: 'Aktiv', order: 4, color: '#A78BFA', description: '5K 22-24 min' },
  { code: 'G', label: 'Intermediate', labelNO: 'Mellomnivå', order: 5, color: '#3B82F6', description: '5K 20-22 min' },
  { code: 'F', label: 'Competent', labelNO: 'Kompetent', order: 6, color: '#60A5FA', description: '5K 18-20 min' },
  { code: 'E', label: 'Advanced', labelNO: 'Avansert', order: 7, color: '#10B981', description: '5K 17-18 min' },
  { code: 'D', label: 'Skilled', labelNO: 'Dyktig', order: 8, color: '#34D399', description: '5K 16-17 min' },
  { code: 'C', label: 'Very Skilled', labelNO: 'Meget dyktig', order: 9, color: '#F59E0B', description: '5K 15-16 min' },
  { code: 'B', label: 'Expert', labelNO: 'Expert', order: 10, color: '#FBBF24', description: '5K 14-15 min' },
  { code: 'A', label: 'Elite', labelNO: 'Elite', order: 11, color: '#EF4444', description: '5K < 14 min' },
];

const benchmarks: BenchmarkConfig = {
  skillLevels,
  levelBenchmarks: [
    {
      levelCode: 'A',
      benchmarks: [
        { metricId: '5k_time', value: 14 * 60, required: true },
        { metricId: 'vo2max', value: 65 },
        { metricId: 'weekly_km', value: 100 },
      ],
    },
    {
      levelCode: 'B',
      benchmarks: [
        { metricId: '5k_time', value: 15 * 60, required: true },
        { metricId: 'vo2max', value: 60 },
        { metricId: 'weekly_km', value: 80 },
      ],
    },
    {
      levelCode: 'E',
      benchmarks: [
        { metricId: '5k_time', value: 18 * 60, required: true },
        { metricId: 'vo2max', value: 50 },
        { metricId: 'weekly_km', value: 50 },
      ],
    },
    {
      levelCode: 'G',
      benchmarks: [
        { metricId: '5k_time', value: 22 * 60, required: true },
        { metricId: 'vo2max', value: 45 },
        { metricId: 'weekly_km', value: 30 },
      ],
    },
  ],
  source: 'WorldAthletics',
};

// ============================================================================
// NAVIGATION
// ============================================================================

const navigation: SportNavigation = {
  quickActions: [
    {
      label: 'Log Run',
      labelNO: 'Logg løp',
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
// COMPLETE RUNNING CONFIG
// ============================================================================

export const RUNNING_CONFIG: SportConfig = {
  id: 'running',
  name: 'Running',
  nameNO: 'Løping',
  icon: 'Activity',
  color: '#2563EB', // Blue

  trainingAreas,
  environments,
  phases,
  intensityLevels,
  pressureLevels,

  testProtocols,
  performanceMetrics,
  benchmarkSource: 'WorldAthletics',

  goalCategories,
  sessions,
  benchmarks,
  terminology,
  equipment,
  navigation,

  metadata: {
    commonDistances: [100, 200, 400, 800, 1500, 3000, 5000, 10000, 21097.5, 42195],
    distanceUnits: ['meters', 'kilometers', 'miles'],
    paceUnits: ['min/km', 'min/mile', 'km/h'],
  },
};

export default RUNNING_CONFIG;
