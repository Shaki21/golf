/**
 * Periodization Templates
 * Templates for generating 12-month training plans based on player scoring average
 */

export interface PeriodizationTemplate {
  scoringRange: { min: number; max: number };
  basePeriodWeeks: number;
  specializationWeeks: number;
  tournamentWeeks: number;
  recoveryWeeks: number;
  weeklyHours: [number, number]; // [min, max]
  intensity: {
    base: IntensityLevel;
    specialization: IntensityLevel;
    tournament: IntensityLevel;
  };
  focusAreas: {
    base: string[];
    specialization: string[];
    tournament: string[];
  };
  learningPhaseDistribution: {
    base: string[]; // e.g., ['L1', 'L2', 'L3']
    specialization: string[];
    tournament: string[];
  };
  settingsDistribution: {
    base: string[]; // e.g., ['S1', 'S2', 'S3', 'S4', 'S5']
    specialization: string[];
    tournament: string[];
  };
  periodDistribution: {
    base: string[]; // e.g., ['E', 'G']
    specialization: string[];
    tournament: string[];
  };
}

export type IntensityLevel = 'low' | 'medium' | 'high' | 'peak' | 'taper';

export const PERIODIZATION_TEMPLATES: Record<string, PeriodizationTemplate> = {
  elite: {
    scoringRange: { min: 0, max: 70 },
    basePeriodWeeks: 16,
    specializationWeeks: 24,
    tournamentWeeks: 10,
    recoveryWeeks: 2,
    weeklyHours: [18, 25],
    intensity: {
      base: 'high',
      specialization: 'peak',
      tournament: 'peak',
    },
    focusAreas: {
      base: ['Technical mastery', 'Physical conditioning', 'Mental resilience'],
      specialization: [
        'Competition-specific skills',
        'Breaking point optimization',
        'Course management',
      ],
      tournament: ['Peak performance', 'Mental game', 'Recovery optimization'],
    },
    learningPhaseDistribution: {
      base: ['L1', 'L2', 'L3'],
      specialization: ['L3', 'L4', 'L5'],
      tournament: ['L4', 'L5'],
    },
    settingsDistribution: {
      base: ['S1', 'S2', 'S3', 'S4', 'S5'],
      specialization: ['S5', 'S6', 'S7', 'S8'],
      tournament: ['S8', 'S9', 'S10'],
    },
    periodDistribution: {
      base: ['E', 'G'],
      specialization: ['G', 'S'],
      tournament: ['S', 'T'],
    },
  },

  advanced: {
    scoringRange: { min: 70, max: 75 },
    basePeriodWeeks: 20,
    specializationWeeks: 20,
    tournamentWeeks: 10,
    recoveryWeeks: 2,
    weeklyHours: [15, 20],
    intensity: {
      base: 'medium',
      specialization: 'high',
      tournament: 'peak',
    },
    focusAreas: {
      base: ['Technical foundation', 'Physical development', 'Consistency'],
      specialization: [
        'Golf-specific skills',
        'Breaking point development',
        'Competition preparation',
      ],
      tournament: ['Performance optimization', 'Mental preparation', 'Recovery'],
    },
    learningPhaseDistribution: {
      base: ['L1', 'L2', 'L3'],
      specialization: ['L2', 'L3', 'L4', 'L5'],
      tournament: ['L4', 'L5'],
    },
    settingsDistribution: {
      base: ['S1', 'S2', 'S3', 'S4', 'S5'],
      specialization: ['S4', 'S5', 'S6', 'S7', 'S8'],
      tournament: ['S7', 'S8', 'S9', 'S10'],
    },
    periodDistribution: {
      base: ['E', 'G'],
      specialization: ['G', 'S'],
      tournament: ['S', 'T'],
    },
  },

  intermediate: {
    scoringRange: { min: 75, max: 80 },
    basePeriodWeeks: 24,
    specializationWeeks: 18,
    tournamentWeeks: 8,
    recoveryWeeks: 2,
    weeklyHours: [12, 18],
    intensity: {
      base: 'medium',
      specialization: 'high',
      tournament: 'peak',
    },
    focusAreas: {
      base: ['Fundamental skills', 'Physical base', 'Technical consistency'],
      specialization: [
        'Specific skill development',
        'Breaking point improvement',
         'Course strategy',
      ],
      tournament: ['Competition readiness', 'Mental skills', 'Tapering'],
    },
    learningPhaseDistribution: {
      base: ['L1', 'L2', 'L3'],
      specialization: ['L2', 'L3', 'L4'],
      tournament: ['L3', 'L4', 'L5'],
    },
    settingsDistribution: {
      base: ['S1', 'S2', 'S3', 'S4', 'S5'],
      specialization: ['S4', 'S5', 'S6', 'S7'],
      tournament: ['S7', 'S8', 'S9'],
    },
    periodDistribution: {
      base: ['E', 'G'],
      specialization: ['G', 'S'],
      tournament: ['S', 'T'],
    },
  },

  developing: {
    scoringRange: { min: 80, max: 85 },
    basePeriodWeeks: 28,
    specializationWeeks: 16,
    tournamentWeeks: 6,
    recoveryWeeks: 2,
    weeklyHours: [10, 15],
    intensity: {
      base: 'medium',
      specialization: 'high',
      tournament: 'taper',
    },
    focusAreas: {
      base: ['Basic skills', 'Movement patterns', 'Physical foundation'],
      specialization: [
        'Skill refinement',
        'Breaking point focus',
        'Basic competition skills',
      ],
      tournament: ['Competition exposure', 'Mental basics', 'Performance habits'],
    },
    learningPhaseDistribution: {
      base: ['L1', 'L2'],
      specialization: ['L2', 'L3', 'L4'],
      tournament: ['L3', 'L4'],
    },
    settingsDistribution: {
      base: ['S1', 'S2', 'S3', 'S4'],
      specialization: ['S4', 'S5', 'S6', 'S7'],
      tournament: ['S6', 'S7', 'S8'],
    },
    periodDistribution: {
      base: ['E', 'G'],
      specialization: ['G', 'S'],
      tournament: ['S', 'T'],
    },
  },

  beginner: {
    scoringRange: { min: 85, max: 200 },
    basePeriodWeeks: 32,
    specializationWeeks: 14,
    tournamentWeeks: 4,
    recoveryWeeks: 2,
    weeklyHours: [8, 12],
    intensity: {
      base: 'medium',
      specialization: 'medium',
      tournament: 'medium',
    },
    focusAreas: {
      base: ['Fundamental movements', 'Basic technique', 'Physical literacy'],
      specialization: ['Skill building', 'Breaking point awareness', 'Game introduction'],
      tournament: ['Competition introduction', 'Mental basics', 'Enjoyment'],
    },
    learningPhaseDistribution: {
      base: ['L1', 'L2'],
      specialization: ['L2', 'L3'],
      tournament: ['L3'],
    },
    settingsDistribution: {
      base: ['S1', 'S2', 'S3'],
      specialization: ['S3', 'S4', 'S5', 'S6'],
      tournament: ['S5', 'S6', 'S7'],
    },
    periodDistribution: {
      base: ['E', 'G'],
      specialization: ['G', 'S'],
      tournament: ['S'],
    },
  },
};

/**
 * Get template based on player's scoring average
 */
export function getTemplateForScoringAverage(averageScore: number): PeriodizationTemplate {
  if (averageScore < 70) return PERIODIZATION_TEMPLATES.elite;
  if (averageScore < 75) return PERIODIZATION_TEMPLATES.advanced;
  if (averageScore < 80) return PERIODIZATION_TEMPLATES.intermediate;
  if (averageScore < 85) return PERIODIZATION_TEMPLATES.developing;
  return PERIODIZATION_TEMPLATES.beginner;
}

/**
 * Get player category code based on scoring average
 */
export function getPlayerCategory(averageScore: number): string {
  if (averageScore < 70) return 'E1'; // Elite
  if (averageScore < 75) return 'A1'; // Advanced
  if (averageScore < 80) return 'I1'; // Intermediate
  if (averageScore < 85) return 'D1'; // Developing
  return 'B1'; // Beginner
}

/**
 * Calculate intensity profile for the entire year
 */
export function calculateIntensityProfile(template: PeriodizationTemplate): Record<string, {
  weeks: number;
  intensity: IntensityLevel | 'low';
  volumeProgression: string;
  hoursPerWeek: number;
}> {
  return {
    base: {
      weeks: template.basePeriodWeeks,
      intensity: template.intensity.base,
      volumeProgression: 'gradual_increase',
      hoursPerWeek: template.weeklyHours[0],
    },
    specialization: {
      weeks: template.specializationWeeks,
      intensity: template.intensity.specialization,
      volumeProgression: 'maintain_high',
      hoursPerWeek: template.weeklyHours[1],
    },
    tournament: {
      weeks: template.tournamentWeeks,
      intensity: template.intensity.tournament,
      volumeProgression: 'taper_and_peak',
      hoursPerWeek: Math.round((template.weeklyHours[0] + template.weeklyHours[1]) / 2),
    },
    recovery: {
      weeks: template.recoveryWeeks,
      intensity: 'low',
      volumeProgression: 'minimal',
      hoursPerWeek: Math.round(template.weeklyHours[0] / 2),
    },
  };
}
