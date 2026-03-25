/**
 * Intake Form Types
 * Data structure for player onboarding and goal setting
 */

export interface PlayerIntakeForm {
  // Section 1: Bakgrunnsinformasjon
  background: {
    yearsPlaying: number;                    // Hvor lenge har du spilt golf?
    currentHandicap: number;                 // Nåværende handicap
    averageScore: number;                    // Gjennomsnittlig score (siste 10 runder)
    roundsPerYear: number;                   // Antall runder per år
    trainingHistory: 'none' | 'sporadic' | 'regular' | 'systematic'; // Treningshistorikk
  };

  // Section 2: Tilgjengelighet
  availability: {
    hoursPerWeek: number;                    // Timer tilgjengelig per uke (8-25)
    preferredDays: number[];                 // Foretrukne treningsdager (0=søn, 6=lør)
    canTravelToFacility: boolean;            // Kan reise til treningssenter?
    hasHomeEquipment: boolean;               // Har hjemmeutstyr? (matter, nett, etc)
    seasonalAvailability?: {                 // Sesongvariasjoner
      summer: number;                        // Timer om sommeren
      winter: number;                        // Timer om vinteren
    };
  };

  // Section 3: Målsetninger
  goals: {
    primaryGoal: 'lower_handicap' | 'compete_tournaments' | 'consistency' | 'enjoy_more' | 'specific_skill';
    targetHandicap?: number;                 // Målhandicap (hvis relevant)
    targetScore?: number;                    // Mål-score (hvis relevant)
    timeframe: '3_months' | '6_months' | '12_months'; // Tidsramme
    tournaments?: TournamentGoal[];          // Planlagte turneringer
    specificFocus?: string[];                // Spesifikke områder (e.g., "putting", "driver")
  };

  // Section 4: Nåværende Svakheter
  weaknesses: {
    biggestFrustration: string;              // Åpent felt: "Hva frustrerer deg mest på banen?"
    problemAreas: WeaknessArea[];            // Velg fra liste
    mentalChallenges?: MentalChallenge[];    // Mentale utfordringer
    physicalLimitations?: PhysicalLimitation[]; // Fysiske begrensninger
  };

  // Section 5: Skader og Helse
  health: {
    currentInjuries: Injury[];               // Nåværende skader
    injuryHistory: Injury[];                 // Tidligere skader (siste 2 år)
    chronicConditions?: string[];            // Kroniske tilstander
    mobilityIssues?: string[];               // Mobilitetsproblemer
    ageGroup: '<25' | '25-35' | '35-45' | '45-55' | '55-65' | '65+';
  };

  // Section 6: Livsstil
  lifestyle: {
    workSchedule: 'flexible' | 'regular_hours' | 'irregular' | 'shift_work';
    stressLevel: 1 | 2 | 3 | 4 | 5;          // 1=lav, 5=høy
    sleepQuality: 1 | 2 | 3 | 4 | 5;         // 1=dårlig, 5=utmerket
    nutritionFocus: boolean;                 // Ønsker ernæringsveiledning?
    physicalActivity: 'sedentary' | 'light' | 'moderate' | 'active'; // Annen fysisk aktivitet
  };

  // Section 7: Utstyr og Fasiliteter
  equipment: {
    hasDriverSpeedMeasurement: boolean;      // Har målt driver speed?
    driverSpeed?: number;                    // Driver speed (hvis kjent)
    recentClubFitting: boolean;              // Nylig klubb-fitting?
    accessToTrackMan: boolean;               // Tilgang til TrackMan/simulator?
    accessToGym: boolean;                    // Tilgang til treningssenter?
    willingToInvest: 'minimal' | 'moderate' | 'significant'; // Investeringsvilje
  };

  // Section 8: Læringsprefer anser
  learning: {
    preferredStyle: 'visual' | 'verbal' | 'kinesthetic' | 'mixed'; // Læringsstil
    wantsDetailedExplanations: boolean;      // Ønsker detaljerte forklaringer?
    prefersStructure: boolean;               // Foretrekker strukturert plan?
    motivationType: 'competition' | 'personal_growth' | 'social' | 'achievement'; // Motivasjon
  };

  // Metadata
  submittedAt: Date;
  playerId: string;
  completionPercentage: number;              // % av skjema fullført
}

// Supporting Types

export interface TournamentGoal {
  name: string;
  date: Date;
  importance: 'major' | 'important' | 'minor'; // A, B, C
  targetPlacement?: string;                   // "Top 10", "Win", etc
}

export type WeaknessArea =
  | 'driver_distance'
  | 'driver_accuracy'
  | 'iron_consistency'
  | 'approach_shots'
  | 'short_game'
  | 'putting_distance'
  | 'putting_direction'
  | 'bunker_play'
  | 'course_management'
  | 'mental_game';

export type MentalChallenge =
  | 'pressure_situations'
  | 'focus_consistency'
  | 'confidence'
  | 'anger_management'
  | 'pre_shot_routine'
  | 'course_strategy';

export interface PhysicalLimitation {
  area: 'back' | 'shoulder' | 'wrist' | 'hip' | 'knee' | 'elbow';
  severity: 'mild' | 'moderate' | 'significant';
  affectsSwing: boolean;
}

export interface Injury {
  type: string;                               // "Lower back strain", etc
  dateOccurred?: Date;
  resolved: boolean;
  requiresModification: boolean;              // Krever modifisert trening?
  affectedAreas: string[];                    // "Rotation", "Full backswing", etc
}

// Validation helper types
export interface IntakeValidation {
  isComplete: boolean;
  completionPercentage: number;
  missingRequired: string[];
  warnings: string[];
}

// Processed intake for plan generation
export interface ProcessedIntake {
  playerCategory: 'E1' | 'A1' | 'I1' | 'D1' | 'B1'; // Calculated from average score
  weeklyHoursTarget: number;
  planDuration: number;                       // weeks (typically 52)
  startDate: Date;
  tournaments: Array<{
    name: string;
    startDate: Date;
    endDate: Date;
    importance: 'A' | 'B' | 'C';
  }>;
  priorityAreas: string[];                    // From weaknesses
  restrictions: string[];                     // From injuries/limitations
  preferredTrainingDays: number[];
  intensityModifiers: {
    reduceForAge: boolean;
    reduceForInjury: boolean;
    reduceForStress: boolean;
    increaseForGoals: boolean;
  };
}
