/**
 * Exercise Library Data
 * Mock exercise data for template session planning
 */

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string; // TEE, APP, SGR, PGR, GBR, FYS
  pyramide?: string; // FYS, TEK, SLAG, SPILL, TURN
  lFase?: string; // CS20, CS40, CS60, CS80, CS100
  miljo?: string; // M0-M5
  press?: string; // PR1-PR5
  duration: { min: number; max: number };
  difficulty: number; // 1-5
  equipment?: string[];
  videoUrl?: string;
}

// Mock exercise library
export const EXERCISE_LIBRARY: Exercise[] = [
  // PHYSICAL (FYS)
  {
    id: 'ex-hip-rotation',
    name: 'Hip Rotation Drill',
    description: 'Mobility and strength exercise for hip rotation',
    category: 'FYS',
    pyramide: 'FYS',
    lFase: 'CS20',
    miljo: 'M0',
    press: 'PR1',
    duration: { min: 15, max: 20 },
    difficulty: 2,
    equipment: ['Mat', 'Resistance Band'],
  },
  {
    id: 'ex-core-stability',
    name: 'Core Stability Training',
    description: 'Core strength exercises for better rotation',
    category: 'FYS',
    pyramide: 'FYS',
    lFase: 'CS20',
    miljo: 'M0',
    press: 'PR1',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    equipment: ['Mat', 'Medicine Ball'],
  },
  {
    id: 'ex-balance-board',
    name: 'Balance Board Training',
    description: 'Balance and stability exercises',
    category: 'FYS',
    pyramide: 'FYS',
    lFase: 'CS20',
    miljo: 'M0',
    press: 'PR1',
    duration: { min: 10, max: 15 },
    difficulty: 2,
    equipment: ['Balance Board'],
  },

  // TEE SHOTS (Driver, Woods)
  {
    id: 'ex-driver-target',
    name: 'Driver Target Practice',
    description: 'Driver shots to defined target zones',
    category: 'TEE',
    pyramide: 'TEK',
    lFase: 'CS60',
    miljo: 'M2',
    press: 'PR2',
    duration: { min: 20, max: 30 },
    difficulty: 2,
    equipment: ['Driver', 'Range Balls'],
  },
  {
    id: 'ex-driver-accuracy',
    name: 'Driver Accuracy Drill',
    description: 'Focus on fairway accuracy with driver',
    category: 'TEE',
    pyramide: 'SLAG',
    lFase: 'CS80',
    miljo: 'M2',
    press: 'PR3',
    duration: { min: 25, max: 35 },
    difficulty: 3,
    equipment: ['Driver', 'Alignment Sticks'],
  },
  {
    id: 'ex-3-wood-control',
    name: '3-Wood Control',
    description: 'Controlled 3-wood shots from tee and fairway',
    category: 'TEE',
    pyramide: 'TEK',
    lFase: 'CS60',
    miljo: 'M2',
    press: 'PR2',
    duration: { min: 15, max: 25 },
    difficulty: 3,
    equipment: ['3-Wood'],
  },

  // APPROACH SHOTS (Irons, APP)
  {
    id: 'ex-iron-distance-control',
    name: 'Iron Distance Control',
    description: 'Dial in distances with mid-irons',
    category: 'APP',
    pyramide: 'TEK',
    lFase: 'CS60',
    miljo: 'M2',
    press: 'PR2',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    equipment: ['6-Iron', '7-Iron', '8-Iron'],
  },
  {
    id: 'ex-approach-ladder',
    name: 'Approach Ladder Drill',
    description: 'Progressive distance targets (100, 120, 140, 160 yards)',
    category: 'APP',
    pyramide: 'SLAG',
    lFase: 'CS80',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 25, max: 35 },
    difficulty: 4,
    equipment: ['Multiple Irons'],
  },
  {
    id: 'ex-wedge-matrix',
    name: 'Wedge Distance Matrix',
    description: 'Dialing in wedge distances (50, 75, 100 yards)',
    category: 'APP',
    pyramide: 'TEK',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    equipment: ['PW', 'GW', 'SW'],
  },

  // SHORT GAME RESCUE (Chipping, Pitching, SGR)
  {
    id: 'ex-chip-ladder',
    name: 'Chip Shot Ladder',
    description: 'Progressive chip shots to different distances',
    category: 'SGR',
    pyramide: 'TEK',
    lFase: 'CS40',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 15, max: 25 },
    difficulty: 2,
    equipment: ['Chipping Wedge', '8-Iron'],
  },
  {
    id: 'ex-pitch-precision',
    name: 'Pitch Precision Drill',
    description: 'Pitch shots to tight landing zones',
    category: 'SGR',
    pyramide: 'SLAG',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    equipment: ['SW', 'LW'],
  },
  {
    id: 'ex-bunker-basics',
    name: 'Greenside Bunker Fundamentals',
    description: 'Basic bunker technique and distance control',
    category: 'GBR',
    pyramide: 'TEK',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 15, max: 25 },
    difficulty: 3,
    equipment: ['SW'],
  },
  {
    id: 'ex-bunker-variety',
    name: 'Bunker Shot Variety',
    description: 'Different lies and trajectories from bunkers',
    category: 'GBR',
    pyramide: 'SLAG',
    lFase: 'CS80',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 20, max: 30 },
    difficulty: 4,
    equipment: ['SW', 'LW'],
  },

  // PUTTING (PGR)
  {
    id: 'ex-gate-drill',
    name: 'Gate Drill (3-5 ft)',
    description: 'Putting through gates for path control',
    category: 'PGR',
    pyramide: 'TEK',
    lFase: 'CS40',
    miljo: 'M3',
    press: 'PR1',
    duration: { min: 10, max: 20 },
    difficulty: 2,
    equipment: ['Putter', 'Tees'],
  },
  {
    id: 'ex-clock-drill',
    name: 'Clock Drill',
    description: '12 balls around the hole at 3-5 feet',
    category: 'PGR',
    pyramide: 'SLAG',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 15, max: 30 },
    difficulty: 4,
    equipment: ['Putter', '12 Balls'],
  },
  {
    id: 'ex-lag-putting',
    name: 'Lag Putting Control',
    description: 'Distance control for long putts (25-40 ft)',
    category: 'PGR',
    pyramide: 'TEK',
    lFase: 'CS40',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 15, max: 25 },
    difficulty: 3,
    equipment: ['Putter'],
  },
  {
    id: 'ex-breaking-putts',
    name: 'Breaking Putt Mastery',
    description: 'Reading and executing breaking putts',
    category: 'PGR',
    pyramide: 'SLAG',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 20, max: 30 },
    difficulty: 4,
    equipment: ['Putter'],
  },

  // MIXED/GAME SCENARIOS
  {
    id: 'ex-scattered',
    name: 'Scattered Drill',
    description: 'Change target and club for every shot',
    category: 'SGR',
    pyramide: 'SLAG',
    lFase: 'CS80',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 15, max: 30 },
    difficulty: 3,
    equipment: ['Multiple Clubs'],
  },
  {
    id: 'ex-up-and-down',
    name: 'Up and Down Challenge',
    description: 'Practice getting up and down from various lies',
    category: 'SGR',
    pyramide: 'SPILL',
    lFase: 'CS80',
    miljo: 'M3',
    press: 'PR4',
    duration: { min: 20, max: 30 },
    difficulty: 4,
    equipment: ['Wedges', 'Putter'],
  },
];

// Category filters for exercise picker
export const EXERCISE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'TEE', label: 'Tee Shots (Driver/Woods)' },
  { value: 'APP', label: 'Approach (Irons)' },
  { value: 'SGR', label: 'Short Game Rescue' },
  { value: 'PGR', label: 'Putting Green' },
  { value: 'GBR', label: 'Greenside Bunker' },
  { value: 'FYS', label: 'Physical/Fitness' },
];

// Difficulty filters
export const DIFFICULTY_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: '1', label: 'Beginner' },
  { value: '2', label: 'Intermediate' },
  { value: '3', label: 'Advanced' },
  { value: '4', label: 'Expert' },
  { value: '5', label: 'Elite' },
];

/**
 * Filter exercises by category and search term
 */
export function filterExercises(
  exercises: Exercise[],
  category: string = 'all',
  searchTerm: string = '',
  difficulty: string = 'all'
): Exercise[] {
  return exercises.filter(exercise => {
    // Category filter
    if (category !== 'all' && exercise.category !== category) {
      return false;
    }

    // Difficulty filter
    if (difficulty !== 'all' && exercise.difficulty.toString() !== difficulty) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        exercise.name.toLowerCase().includes(search) ||
        exercise.description.toLowerCase().includes(search) ||
        exercise.category.toLowerCase().includes(search)
      );
    }

    return true;
  });
}

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find(ex => ex.id === id);
}
