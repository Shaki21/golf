/**
 * AK Golf Academy - Achievement Definitions
 * Complete badge catalog with unlock requirements
 */

import {
  BadgeDefinition,
  BadgeCategory,
  BadgeTier,
  BadgeSymbol,
} from './types';

// ═══════════════════════════════════════════════════════════════
// VOLUME BADGES - Hours & Sessions
// ═══════════════════════════════════════════════════════════════

export const VOLUME_BADGES: BadgeDefinition[] = [
  // Total Hours Series
  {
    id: 'hours_10',
    name: 'Dedikert Start',
    description: 'Logg 10 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CLOCK,
    tier: BadgeTier.STANDARD,
    xp: 50,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 10, description: '10 timer trening' }
    ],
    level: 1,
    maxLevel: 7,
    rarity: 'common',
  },
  {
    id: 'hours_50',
    name: 'Fokusert Innsats',
    description: 'Logg 50 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CLOCK,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 50, description: '50 timer trening' }
    ],
    level: 2,
    maxLevel: 7,
    rarity: 'common',
  },
  {
    id: 'hours_100',
    name: 'Century Club',
    description: 'Logg 100 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CLOCK,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 100, description: '100 timer trening' }
    ],
    level: 3,
    maxLevel: 7,
    rarity: 'uncommon',
  },
  {
    id: 'hours_250',
    name: 'Seriøs Utøver',
    description: 'Logg 250 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CLOCK,
    tier: BadgeTier.SILVER,
    xp: 350,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 250, description: '250 timer trening' }
    ],
    level: 4,
    maxLevel: 7,
    rarity: 'uncommon',
  },
  {
    id: 'hours_500',
    name: 'Halvveis til 1000',
    description: 'Logg 500 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CLOCK,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 500, description: '500 timer trening' }
    ],
    level: 5,
    maxLevel: 7,
    rarity: 'rare',
  },
  {
    id: 'hours_1000',
    name: '1000-Timers Klubben',
    description: 'Logg 1000 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.GOLD,
    xp: 1000,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 1000, description: '1000 timer trening' }
    ],
    level: 6,
    maxLevel: 7,
    rarity: 'epic',
  },
  {
    id: 'hours_2500',
    name: 'Mester i Dedikasjon',
    description: 'Logg 2500 timer trening totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.PLATINUM,
    xp: 2500,
    requirements: [
      { type: 'volume_hours', metric: 'volume.totalHours', operator: 'gte', value: 2500, description: '2500 timer trening' }
    ],
    level: 7,
    maxLevel: 7,
    rarity: 'legendary',
  },

  // Session Count Series
  {
    id: 'sessions_25',
    name: 'Rutinebygger',
    description: 'Fullfør 25 treningsøkter',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.STANDARD,
    xp: 50,
    requirements: [
      { type: 'volume_sessions', metric: 'volume.totalSessions', operator: 'gte', value: 25, description: '25 økter' }
    ],
    rarity: 'common',
  },
  {
    id: 'sessions_100',
    name: 'Økt-Entusiast',
    description: 'Fullfør 100 treningsøkter',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'volume_sessions', metric: 'volume.totalSessions', operator: 'gte', value: 100, description: '100 økter' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'sessions_500',
    name: 'Økt-Veteran',
    description: 'Fullfør 500 treningsøkter',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'volume_sessions', metric: 'volume.totalSessions', operator: 'gte', value: 500, description: '500 økter' }
    ],
    rarity: 'rare',
  },

  // Swing Count Series
  {
    id: 'swings_1000',
    name: 'Swing Starter',
    description: 'Slå 1000 slag totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.ZAP,
    tier: BadgeTier.STANDARD,
    xp: 50,
    requirements: [
      { type: 'volume_swings', metric: 'volume.totalSwings', operator: 'gte', value: 1000, description: '1000 slag' }
    ],
    rarity: 'common',
  },
  {
    id: 'swings_10000',
    name: 'Swing Maskin',
    description: 'Slå 10,000 slag totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.ZAP,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'volume_swings', metric: 'volume.totalSwings', operator: 'gte', value: 10000, description: '10,000 slag' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'swings_50000',
    name: 'Swing Legend',
    description: 'Slå 50,000 slag totalt',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.ZAP,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'volume_swings', metric: 'volume.totalSwings', operator: 'gte', value: 50000, description: '50,000 slag' }
    ],
    rarity: 'rare',
  },

  // Weekly Completion
  {
    id: 'weekly_perfect_1',
    name: 'Perfekt Uke',
    description: 'Fullfør alle planlagte økter i en uke',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.STAR,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'streak_weeks', metric: 'streaks.perfectWeeks', operator: 'gte', value: 1, description: '1 perfekt uke' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'weekly_perfect_10',
    name: 'Ukemester',
    description: 'Fullfør alle planlagte økter i 10 uker',
    category: BadgeCategory.VOLUME,
    symbol: BadgeSymbol.STAR,
    tier: BadgeTier.GOLD,
    xp: 300,
    requirements: [
      { type: 'streak_weeks', metric: 'streaks.perfectWeeks', operator: 'gte', value: 10, description: '10 perfekte uker' }
    ],
    rarity: 'rare',
  },
];

// ═══════════════════════════════════════════════════════════════
// STREAK BADGES - Consistency
// ═══════════════════════════════════════════════════════════════

export const STREAK_BADGES: BadgeDefinition[] = [
  {
    id: 'streak_3',
    name: 'På Gang',
    description: 'Tren 3 dager på rad',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.FLAME,
    tier: BadgeTier.STANDARD,
    xp: 25,
    requirements: [
      { type: 'streak_days', metric: 'streaks.currentStreak', operator: 'gte', value: 3, description: '3 dager streak' }
    ],
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: 'Uke Warrior',
    description: 'Tren 7 dager på rad',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.FLAME,
    tier: BadgeTier.BRONZE,
    xp: 75,
    requirements: [
      { type: 'streak_days', metric: 'streaks.currentStreak', operator: 'gte', value: 7, description: '7 dagers streak' }
    ],
    rarity: 'common',
  },
  {
    id: 'streak_14',
    name: 'To Uker Sterk',
    description: 'Tren 14 dager på rad',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.FLAME,
    tier: BadgeTier.SILVER,
    xp: 150,
    requirements: [
      { type: 'streak_days', metric: 'streaks.currentStreak', operator: 'gte', value: 14, description: '14 dagers streak' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'streak_30',
    name: 'Månedens Utholdenhet',
    description: 'Tren 30 dager på rad',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.FLAME,
    tier: BadgeTier.GOLD,
    xp: 300,
    requirements: [
      { type: 'streak_days', metric: 'streaks.currentStreak', operator: 'gte', value: 30, description: '30 dagers streak' }
    ],
    rarity: 'rare',
  },
  {
    id: 'streak_60',
    name: 'To Måneders Mester',
    description: 'Tren 60 dager på rad',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.FLAME,
    tier: BadgeTier.GOLD,
    xp: 600,
    requirements: [
      { type: 'streak_days', metric: 'streaks.currentStreak', operator: 'gte', value: 60, description: '60 dagers streak' }
    ],
    rarity: 'epic',
  },
  {
    id: 'streak_100',
    name: 'Century Streak',
    description: 'Tren 100 dager på rad',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.FLAME,
    tier: BadgeTier.PLATINUM,
    xp: 1000,
    requirements: [
      { type: 'streak_days', metric: 'streaks.currentStreak', operator: 'gte', value: 100, description: '100 dagers streak' }
    ],
    rarity: 'legendary',
  },

  // Time-based streaks
  {
    id: 'early_bird_10',
    name: 'Morgenfugl',
    description: 'Tren før kl. 09:00 ti ganger',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.SUNRISE,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'milestone', metric: 'streaks.earlyMorningSessions', operator: 'gte', value: 10, description: '10 morgenøkter' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'early_bird_50',
    name: 'Soloppgangsmester',
    description: 'Tren før kl. 09:00 femti ganger',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.SUNRISE,
    tier: BadgeTier.GOLD,
    xp: 250,
    requirements: [
      { type: 'milestone', metric: 'streaks.earlyMorningSessions', operator: 'gte', value: 50, description: '50 morgenøkter' }
    ],
    rarity: 'rare',
  },
  {
    id: 'night_owl_10',
    name: 'Kveldstrener',
    description: 'Tren etter kl. 19:00 ti ganger',
    category: BadgeCategory.STREAK,
    symbol: BadgeSymbol.MOON,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'milestone', metric: 'streaks.eveningSessions', operator: 'gte', value: 10, description: '10 kveldsøkter' }
    ],
    rarity: 'uncommon',
  },
];

// ═══════════════════════════════════════════════════════════════
// STRENGTH BADGES - Gym & Fitness
// ═══════════════════════════════════════════════════════════════

export const STRENGTH_BADGES: BadgeDefinition[] = [
  // Tonnage Series
  {
    id: 'tonnage_1000',
    name: 'Første Tonn',
    description: 'Løft 1000 kg total tonnasje',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.STANDARD,
    xp: 50,
    requirements: [
      { type: 'strength_tonnage', metric: 'strength.totalTonnage', operator: 'gte', value: 1000, description: '1000 kg tonnasje' }
    ],
    rarity: 'common',
  },
  {
    id: 'tonnage_10000',
    name: '10 Tonn Klubben',
    description: 'Løft 10,000 kg total tonnasje',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'strength_tonnage', metric: 'strength.totalTonnage', operator: 'gte', value: 10000, description: '10,000 kg tonnasje' }
    ],
    rarity: 'common',
  },
  {
    id: 'tonnage_50000',
    name: '50 Tonn Beast',
    description: 'Løft 50,000 kg total tonnasje',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.SILVER,
    xp: 250,
    requirements: [
      { type: 'strength_tonnage', metric: 'strength.totalTonnage', operator: 'gte', value: 50000, description: '50,000 kg tonnasje' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'tonnage_100000',
    name: '100 Tonn Legend',
    description: 'Løft 100,000 kg total tonnasje',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'strength_tonnage', metric: 'strength.totalTonnage', operator: 'gte', value: 100000, description: '100,000 kg tonnasje' }
    ],
    rarity: 'rare',
  },

  // PR Series
  {
    id: 'pr_first',
    name: 'Første PR',
    description: 'Sett din første personlige rekord',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.STANDARD,
    xp: 50,
    requirements: [
      { type: 'strength_pr', metric: 'strength.prCount', operator: 'gte', value: 1, description: '1 PR' }
    ],
    rarity: 'common',
  },
  {
    id: 'pr_10',
    name: 'PR Jeger',
    description: 'Sett 10 personlige rekorder',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'strength_pr', metric: 'strength.prCount', operator: 'gte', value: 10, description: '10 PRs' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'pr_25',
    name: 'PR Master',
    description: 'Sett 25 personlige rekorder',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'strength_pr', metric: 'strength.prCount', operator: 'gte', value: 25, description: '25 PRs' }
    ],
    rarity: 'rare',
  },
  {
    id: 'pr_50',
    name: 'PR Legend',
    description: 'Sett 50 personlige rekorder',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'strength_pr', metric: 'strength.prCount', operator: 'gte', value: 50, description: '50 PRs' }
    ],
    rarity: 'epic',
  },

  // Relative Strength (weight/bodyweight)
  {
    id: 'squat_1x_bw',
    name: 'Squat: Kroppsvekt',
    description: 'Squat din egen kroppsvekt',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'strength_relative', metric: 'strength.relativeStrength.squat', operator: 'gte', value: 1.0, description: '1x kroppsvekt squat' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'squat_1.5x_bw',
    name: 'Squat: 1.5x Kroppsvekt',
    description: 'Squat 1.5x din kroppsvekt',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'strength_relative', metric: 'strength.relativeStrength.squat', operator: 'gte', value: 1.5, description: '1.5x kroppsvekt squat' }
    ],
    rarity: 'rare',
  },
  {
    id: 'squat_2x_bw',
    name: 'Squat: 2x Kroppsvekt',
    description: 'Squat 2x din kroppsvekt',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'strength_relative', metric: 'strength.relativeStrength.squat', operator: 'gte', value: 2.0, description: '2x kroppsvekt squat' }
    ],
    rarity: 'epic',
  },
  {
    id: 'deadlift_1.5x_bw',
    name: 'Deadlift: 1.5x Kroppsvekt',
    description: 'Deadlift 1.5x din kroppsvekt',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'strength_relative', metric: 'strength.relativeStrength.deadlift', operator: 'gte', value: 1.5, description: '1.5x kroppsvekt deadlift' }
    ],
    rarity: 'rare',
  },
  {
    id: 'deadlift_2x_bw',
    name: 'Deadlift: 2x Kroppsvekt',
    description: 'Deadlift 2x din kroppsvekt',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'strength_relative', metric: 'strength.relativeStrength.deadlift', operator: 'gte', value: 2.0, description: '2x kroppsvekt deadlift' }
    ],
    rarity: 'epic',
  },

  // Gym Consistency
  {
    id: 'gym_streak_4',
    name: 'Gym Rutine',
    description: 'Tren på gym 4 uker på rad',
    category: BadgeCategory.STRENGTH,
    symbol: BadgeSymbol.DUMBBELL,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'streak_weeks', metric: 'strength.gymStreak', operator: 'gte', value: 4, description: '4 ukers gym-streak' }
    ],
    rarity: 'uncommon',
  },
];

// ═══════════════════════════════════════════════════════════════
// SPEED BADGES - Clubhead Speed
// ═══════════════════════════════════════════════════════════════

export const SPEED_BADGES: BadgeDefinition[] = [
  {
    id: 'speed_100',
    name: '100+ Club',
    description: 'Oppnå 100+ mph driver speed',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.driverSpeed', operator: 'gte', value: 100, description: '100+ mph driver' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'speed_105',
    name: '105+ Club',
    description: 'Oppnå 105+ mph driver speed',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.SILVER,
    xp: 250,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.driverSpeed', operator: 'gte', value: 105, description: '105+ mph driver' }
    ],
    rarity: 'rare',
  },
  {
    id: 'speed_110',
    name: '110+ Club',
    description: 'Oppnå 110+ mph driver speed',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.driverSpeed', operator: 'gte', value: 110, description: '110+ mph driver' }
    ],
    rarity: 'epic',
  },
  {
    id: 'speed_115',
    name: '115+ Club',
    description: 'Oppnå 115+ mph driver speed',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.PLATINUM,
    xp: 600,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.driverSpeed', operator: 'gte', value: 115, description: '115+ mph driver' }
    ],
    rarity: 'legendary',
  },

  // Speed Improvement
  {
    id: 'speed_gain_3',
    name: 'Hastighetsøkning',
    description: 'Øk driver speed med 3+ mph fra baseline',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'speed_improvement', metric: 'performance.speed.speedImprovement', operator: 'gte', value: 3, description: '+3 mph forbedring' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'speed_gain_5',
    name: 'Speed Demon',
    description: 'Øk driver speed med 5+ mph fra baseline',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'speed_improvement', metric: 'performance.speed.speedImprovement', operator: 'gte', value: 5, description: '+5 mph forbedring' }
    ],
    rarity: 'rare',
  },
  {
    id: 'speed_gain_10',
    name: 'Speed King',
    description: 'Øk driver speed med 10+ mph fra baseline',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.LIGHTNING,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'speed_improvement', metric: 'performance.speed.speedImprovement', operator: 'gte', value: 10, description: '+10 mph forbedring' }
    ],
    rarity: 'epic',
  },

  // Smash Factor
  {
    id: 'smash_1.45',
    name: 'Solid Kontakt',
    description: 'Oppnå 1.45+ smash factor',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.ZAP,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.smashFactor', operator: 'gte', value: 1.45, description: '1.45+ smash factor' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'smash_1.48',
    name: 'Perfekt Treff',
    description: 'Oppnå 1.48+ smash factor',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.ZAP,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.smashFactor', operator: 'gte', value: 1.48, description: '1.48+ smash factor' }
    ],
    rarity: 'rare',
  },
  {
    id: 'smash_1.50',
    name: 'Maksimal Effektivitet',
    description: 'Oppnå 1.50 smash factor',
    category: BadgeCategory.SPEED,
    symbol: BadgeSymbol.ZAP,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'speed_absolute', metric: 'performance.speed.smashFactor', operator: 'gte', value: 1.50, description: '1.50 smash factor' }
    ],
    rarity: 'epic',
  },
];

// ═══════════════════════════════════════════════════════════════
// ACCURACY BADGES - Fairways & Greens
// ═══════════════════════════════════════════════════════════════

export const ACCURACY_BADGES: BadgeDefinition[] = [
  // Fairway Hit %
  {
    id: 'fw_50',
    name: 'Fairway Finder',
    description: 'Oppnå 50%+ fairway hit',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.TARGET,
    tier: BadgeTier.STANDARD,
    xp: 75,
    requirements: [
      { type: 'accuracy_fairway', metric: 'performance.accuracy.fairwayHitPct', operator: 'gte', value: 50, description: '50%+ fairways' }
    ],
    rarity: 'common',
  },
  {
    id: 'fw_60',
    name: 'Fairway Konsistent',
    description: 'Oppnå 60%+ fairway hit',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.TARGET,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'accuracy_fairway', metric: 'performance.accuracy.fairwayHitPct', operator: 'gte', value: 60, description: '60%+ fairways' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'fw_70',
    name: 'Fairway Ekspert',
    description: 'Oppnå 70%+ fairway hit',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.TARGET,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'accuracy_fairway', metric: 'performance.accuracy.fairwayHitPct', operator: 'gte', value: 70, description: '70%+ fairways' }
    ],
    rarity: 'rare',
  },
  {
    id: 'fw_80',
    name: 'Fairway Master',
    description: 'Oppnå 80%+ fairway hit',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.TARGET,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'accuracy_fairway', metric: 'performance.accuracy.fairwayHitPct', operator: 'gte', value: 80, description: '80%+ fairways' }
    ],
    rarity: 'epic',
  },

  // GIR %
  {
    id: 'gir_40',
    name: 'Green Seeker',
    description: 'Oppnå 40%+ GIR',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.STANDARD,
    xp: 75,
    requirements: [
      { type: 'accuracy_gir', metric: 'performance.accuracy.girPct', operator: 'gte', value: 40, description: '40%+ GIR' }
    ],
    rarity: 'common',
  },
  {
    id: 'gir_50',
    name: 'Approach Konsistent',
    description: 'Oppnå 50%+ GIR',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'accuracy_gir', metric: 'performance.accuracy.girPct', operator: 'gte', value: 50, description: '50%+ GIR' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'gir_60',
    name: 'Iron Ekspert',
    description: 'Oppnå 60%+ GIR',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'accuracy_gir', metric: 'performance.accuracy.girPct', operator: 'gte', value: 60, description: '60%+ GIR' }
    ],
    rarity: 'rare',
  },
  {
    id: 'gir_70',
    name: 'Approach Master',
    description: 'Oppnå 70%+ GIR',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'accuracy_gir', metric: 'performance.accuracy.girPct', operator: 'gte', value: 70, description: '70%+ GIR' }
    ],
    rarity: 'epic',
  },

  // Proximity
  {
    id: 'proximity_10m',
    name: 'Pin Seeker',
    description: 'Gjennomsnitt under 10m fra hull på approach',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.TARGET,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'accuracy_gir', metric: 'performance.accuracy.avgProximity', operator: 'lte', value: 10, description: 'Under 10m snitt' }
    ],
    rarity: 'rare',
  },
  {
    id: 'proximity_7m',
    name: 'Laser Focus',
    description: 'Gjennomsnitt under 7m fra hull på approach',
    category: BadgeCategory.ACCURACY,
    symbol: BadgeSymbol.TARGET,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'accuracy_gir', metric: 'performance.accuracy.avgProximity', operator: 'lte', value: 7, description: 'Under 7m snitt' }
    ],
    rarity: 'epic',
  },
];

// ═══════════════════════════════════════════════════════════════
// PUTTING BADGES
// ═══════════════════════════════════════════════════════════════

export const PUTTING_BADGES: BadgeDefinition[] = [
  // Putts per round
  {
    id: 'putts_34',
    name: 'Solid Putter',
    description: 'Gjennomsnitt under 34 putts per runde',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'putting_avg', metric: 'performance.putting.avgPuttsPerRound', operator: 'lte', value: 34, description: 'Under 34 putts/runde' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'putts_32',
    name: 'Putter Pro',
    description: 'Gjennomsnitt under 32 putts per runde',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'putting_avg', metric: 'performance.putting.avgPuttsPerRound', operator: 'lte', value: 32, description: 'Under 32 putts/runde' }
    ],
    rarity: 'rare',
  },
  {
    id: 'putts_30',
    name: 'Putter Master',
    description: 'Gjennomsnitt under 30 putts per runde',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'putting_avg', metric: 'performance.putting.avgPuttsPerRound', operator: 'lte', value: 30, description: 'Under 30 putts/runde' }
    ],
    rarity: 'epic',
  },

  // One-putt rate
  {
    id: 'oneputt_30',
    name: 'One-Putt Artist',
    description: '30%+ one-putt rate',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.STAR,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'putting_rate', metric: 'performance.putting.onePuttPct', operator: 'gte', value: 30, description: '30%+ one-putts' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'oneputt_40',
    name: 'One-Putt Machine',
    description: '40%+ one-putt rate',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.STAR,
    tier: BadgeTier.SILVER,
    xp: 250,
    requirements: [
      { type: 'putting_rate', metric: 'performance.putting.onePuttPct', operator: 'gte', value: 40, description: '40%+ one-putts' }
    ],
    rarity: 'rare',
  },
  {
    id: 'oneputt_50',
    name: 'One-Putt Legend',
    description: '50%+ one-putt rate',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.STAR,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'putting_rate', metric: 'performance.putting.onePuttPct', operator: 'gte', value: 50, description: '50%+ one-putts' }
    ],
    rarity: 'epic',
  },

  // Make rates
  {
    id: 'inside3ft_95',
    name: 'Gimme Killer',
    description: '95%+ make rate innenfor 3 fot',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'putting_rate', metric: 'performance.putting.makeRateInside3ft', operator: 'gte', value: 95, description: '95%+ innenfor 3ft' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'inside3ft_99',
    name: 'Never Miss',
    description: '99%+ make rate innenfor 3 fot',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.GOLD,
    xp: 300,
    requirements: [
      { type: 'putting_rate', metric: 'performance.putting.makeRateInside3ft', operator: 'gte', value: 99, description: '99%+ innenfor 3ft' }
    ],
    rarity: 'rare',
  },

  // No three-putts
  {
    id: 'no_three_putts_5',
    name: '3-Putt Fri',
    description: 'Under 5% three-putt rate',
    category: BadgeCategory.PUTTING,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'putting_rate', metric: 'performance.putting.threePuttPct', operator: 'lte', value: 5, description: 'Under 5% three-putts' }
    ],
    rarity: 'rare',
  },
];

// ═══════════════════════════════════════════════════════════════
// SHORT GAME BADGES
// ═══════════════════════════════════════════════════════════════

export const SHORT_GAME_BADGES: BadgeDefinition[] = [
  // Up and down
  {
    id: 'up_down_40',
    name: 'Scrambler',
    description: '40%+ up-and-down rate',
    category: BadgeCategory.SHORT_GAME,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'milestone', metric: 'performance.shortGame.upAndDownPct', operator: 'gte', value: 40, description: '40%+ up-and-down' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'up_down_50',
    name: 'Scramble Expert',
    description: '50%+ up-and-down rate',
    category: BadgeCategory.SHORT_GAME,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'milestone', metric: 'performance.shortGame.upAndDownPct', operator: 'gte', value: 50, description: '50%+ up-and-down' }
    ],
    rarity: 'rare',
  },
  {
    id: 'up_down_60',
    name: 'Scramble Master',
    description: '60%+ up-and-down rate',
    category: BadgeCategory.SHORT_GAME,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'milestone', metric: 'performance.shortGame.upAndDownPct', operator: 'gte', value: 60, description: '60%+ up-and-down' }
    ],
    rarity: 'epic',
  },

  // Sand saves
  {
    id: 'sand_save_40',
    name: 'Bunker Fighter',
    description: '40%+ sand save rate',
    category: BadgeCategory.SHORT_GAME,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'milestone', metric: 'performance.shortGame.sandSavePct', operator: 'gte', value: 40, description: '40%+ sand saves' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'sand_save_50',
    name: 'Bunker Expert',
    description: '50%+ sand save rate',
    category: BadgeCategory.SHORT_GAME,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.SILVER,
    xp: 250,
    requirements: [
      { type: 'milestone', metric: 'performance.shortGame.sandSavePct', operator: 'gte', value: 50, description: '50%+ sand saves' }
    ],
    rarity: 'rare',
  },
  {
    id: 'sand_save_60',
    name: 'Bunker Master',
    description: '60%+ sand save rate',
    category: BadgeCategory.SHORT_GAME,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'milestone', metric: 'performance.shortGame.sandSavePct', operator: 'gte', value: 60, description: '60%+ sand saves' }
    ],
    rarity: 'epic',
  },
];

// ═══════════════════════════════════════════════════════════════
// SCORING BADGES
// ═══════════════════════════════════════════════════════════════

export const SCORING_BADGES: BadgeDefinition[] = [
  // Breaking score barriers
  {
    id: 'score_under_90',
    name: 'Breaking 90',
    description: 'Spill en runde under 90 slag',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'score_under', metric: 'performance.scoring.bestScore18', operator: 'lt', value: 90, description: 'Under 90' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'score_under_85',
    name: 'Breaking 85',
    description: 'Spill en runde under 85 slag',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.SILVER,
    xp: 250,
    requirements: [
      { type: 'score_under', metric: 'performance.scoring.bestScore18', operator: 'lt', value: 85, description: 'Under 85' }
    ],
    rarity: 'rare',
  },
  {
    id: 'score_under_80',
    name: 'Breaking 80',
    description: 'Spill en runde under 80 slag',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'score_under', metric: 'performance.scoring.bestScore18', operator: 'lt', value: 80, description: 'Under 80' }
    ],
    rarity: 'epic',
  },
  {
    id: 'score_under_75',
    name: 'Breaking 75',
    description: 'Spill en runde under 75 slag',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.TROPHY,
    tier: BadgeTier.PLATINUM,
    xp: 600,
    requirements: [
      { type: 'score_under', metric: 'performance.scoring.bestScore18', operator: 'lt', value: 75, description: 'Under 75' }
    ],
    rarity: 'legendary',
  },
  {
    id: 'score_under_par',
    name: 'Under Par',
    description: 'Spill en runde under par',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.AWARD,
    tier: BadgeTier.PLATINUM,
    xp: 1000,
    requirements: [
      { type: 'milestone', metric: 'performance.scoring.roundsUnderPar', operator: 'gte', value: 1, description: '1 runde under par' }
    ],
    rarity: 'legendary',
  },

  // Handicap milestones
  {
    id: 'hcp_under_20',
    name: 'Single-Digit Hunter',
    description: 'Oppnå handicap under 20',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.MEDAL,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'score_absolute', metric: 'performance.scoring.currentHandicap', operator: 'lt', value: 20, description: 'HCP < 20' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'hcp_single_digit',
    name: 'Single-Digit',
    description: 'Oppnå enkeltsifret handicap',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.MEDAL,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'score_absolute', metric: 'performance.scoring.currentHandicap', operator: 'lt', value: 10, description: 'HCP < 10' }
    ],
    rarity: 'rare',
  },
  {
    id: 'hcp_under_5',
    name: 'Low Single-Digit',
    description: 'Oppnå handicap under 5',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.MEDAL,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'score_absolute', metric: 'performance.scoring.currentHandicap', operator: 'lt', value: 5, description: 'HCP < 5' }
    ],
    rarity: 'epic',
  },
  {
    id: 'hcp_scratch',
    name: 'Scratch Golfer',
    description: 'Oppnå scratch handicap (0 eller bedre)',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.AWARD,
    tier: BadgeTier.PLATINUM,
    xp: 1000,
    requirements: [
      { type: 'score_absolute', metric: 'performance.scoring.currentHandicap', operator: 'lte', value: 0, description: 'HCP ≤ 0' }
    ],
    rarity: 'legendary',
  },

  // Rounds played
  {
    id: 'rounds_25',
    name: 'Bane Entusiast',
    description: 'Spill 25 runder',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'milestone', metric: 'performance.scoring.totalRoundsPlayed', operator: 'gte', value: 25, description: '25 runder' }
    ],
    rarity: 'common',
  },
  {
    id: 'rounds_100',
    name: 'Bane Veteran',
    description: 'Spill 100 runder',
    category: BadgeCategory.MILESTONE,
    symbol: BadgeSymbol.FLAG,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'milestone', metric: 'performance.scoring.totalRoundsPlayed', operator: 'gte', value: 100, description: '100 runder' }
    ],
    rarity: 'rare',
  },
];

// ═══════════════════════════════════════════════════════════════
// PHASE & PLAN BADGES
// ═══════════════════════════════════════════════════════════════

export const PHASE_BADGES: BadgeDefinition[] = [
  // Phase completion
  {
    id: 'phase_grunnlag',
    name: 'Grunnlag Fullført',
    description: 'Fullfør en grunnlagsperiode',
    category: BadgeCategory.PHASE,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.BRONZE,
    xp: 150,
    requirements: [
      { type: 'phase_complete', metric: 'phase.phasesCompleted', operator: 'gte', value: 1, description: '1 fase fullført' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'phases_4',
    name: 'Årssyklus',
    description: 'Fullfør alle 4 treningsfaser i en sesong',
    category: BadgeCategory.PHASE,
    symbol: BadgeSymbol.BOOK,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'phase_complete', metric: 'phase.phasesCompleted', operator: 'gte', value: 4, description: '4 faser fullført' }
    ],
    rarity: 'rare',
  },

  // Compliance
  {
    id: 'compliance_80',
    name: 'Plan Følger',
    description: 'Oppnå 80%+ compliance i en fase',
    category: BadgeCategory.PHASE,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'phase_compliance', metric: 'phase.phaseCompliance', operator: 'gte', value: 80, description: '80%+ compliance' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'compliance_90',
    name: 'Plan Mester',
    description: 'Oppnå 90%+ compliance i en fase',
    category: BadgeCategory.PHASE,
    symbol: BadgeSymbol.CHECK,
    tier: BadgeTier.SILVER,
    xp: 200,
    requirements: [
      { type: 'phase_compliance', metric: 'phase.phaseCompliance', operator: 'gte', value: 90, description: '90%+ compliance' }
    ],
    rarity: 'rare',
  },
  {
    id: 'compliance_95',
    name: 'Perfekt Utførelse',
    description: 'Oppnå 95%+ compliance i en fase',
    category: BadgeCategory.PHASE,
    symbol: BadgeSymbol.STAR,
    tier: BadgeTier.GOLD,
    xp: 400,
    requirements: [
      { type: 'phase_compliance', metric: 'phase.phaseCompliance', operator: 'gte', value: 95, description: '95%+ compliance' }
    ],
    rarity: 'epic',
  },

  // Annual plan
  {
    id: 'annual_compliance_80',
    name: 'Årsplan Følger',
    description: 'Oppnå 80%+ compliance på årsplanen',
    category: BadgeCategory.PHASE,
    symbol: BadgeSymbol.BOOK,
    tier: BadgeTier.SILVER,
    xp: 300,
    requirements: [
      { type: 'phase_compliance', metric: 'phase.annualPlanCompliance', operator: 'gte', value: 80, description: '80%+ årsplan' }
    ],
    rarity: 'rare',
  },
];

// ═══════════════════════════════════════════════════════════════
// MENTAL BADGES
// ═══════════════════════════════════════════════════════════════

export const MENTAL_BADGES: BadgeDefinition[] = [
  {
    id: 'mental_10',
    name: 'Mental Start',
    description: 'Fullfør 10 mental treningsøkter',
    category: BadgeCategory.MENTAL,
    symbol: BadgeSymbol.BRAIN,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'volume_sessions', metric: 'volume.hoursByType.mental', operator: 'gte', value: 5, description: '5+ timer mental' }
    ],
    rarity: 'uncommon',
  },
  {
    id: 'mental_50',
    name: 'Mental Warrior',
    description: 'Fullfør 25 timer mental trening',
    category: BadgeCategory.MENTAL,
    symbol: BadgeSymbol.BRAIN,
    tier: BadgeTier.SILVER,
    xp: 250,
    requirements: [
      { type: 'volume_hours', metric: 'volume.hoursByType.mental', operator: 'gte', value: 25, description: '25+ timer mental' }
    ],
    rarity: 'rare',
  },
  {
    id: 'mental_100',
    name: 'Mental Master',
    description: 'Fullfør 100 timer mental trening',
    category: BadgeCategory.MENTAL,
    symbol: BadgeSymbol.BRAIN,
    tier: BadgeTier.GOLD,
    xp: 500,
    requirements: [
      { type: 'volume_hours', metric: 'volume.hoursByType.mental', operator: 'gte', value: 100, description: '100+ timer mental' }
    ],
    rarity: 'epic',
  },
];

// ═══════════════════════════════════════════════════════════════
// SEASONAL BADGES
// ═══════════════════════════════════════════════════════════════

export const SEASONAL_BADGES: BadgeDefinition[] = [
  {
    id: 'winter_warrior',
    name: 'Vinterkrigere',
    description: 'Tren ute i desember, januar eller februar',
    category: BadgeCategory.SEASONAL,
    symbol: BadgeSymbol.SNOWFLAKE,
    tier: BadgeTier.BRONZE,
    xp: 100,
    requirements: [
      { type: 'milestone', metric: 'volume.sessionsThisMonth', operator: 'gte', value: 1, description: 'Vintertrening' }
    ],
    isLimited: true,
    availableFrom: new Date(2024, 11, 1), // December
    availableUntil: new Date(2025, 2, 1), // End of February
    rarity: 'uncommon',
  },
  {
    id: 'summer_grinder',
    name: 'Sommergrinder',
    description: 'Tren 50+ timer i juni, juli eller august',
    category: BadgeCategory.SEASONAL,
    symbol: BadgeSymbol.SUN,
    tier: BadgeTier.GOLD,
    xp: 300,
    requirements: [
      { type: 'volume_hours', metric: 'volume.monthlyHours', operator: 'gte', value: 50, description: '50+ timer sommer' }
    ],
    isLimited: true,
    availableFrom: new Date(2025, 5, 1), // June
    availableUntil: new Date(2025, 8, 1), // End of August
    rarity: 'rare',
  },
];

// ═══════════════════════════════════════════════════════════════
// COMBINED EXPORTS
// ═══════════════════════════════════════════════════════════════

export const ALL_BADGES: BadgeDefinition[] = [
  ...VOLUME_BADGES,
  ...STREAK_BADGES,
  ...STRENGTH_BADGES,
  ...SPEED_BADGES,
  ...ACCURACY_BADGES,
  ...PUTTING_BADGES,
  ...SHORT_GAME_BADGES,
  ...SCORING_BADGES,
  ...PHASE_BADGES,
  ...MENTAL_BADGES,
  ...SEASONAL_BADGES,
];

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find((badge) => badge.id === id);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return ALL_BADGES.filter((badge) => badge.category === category);
}

/**
 * Get badges by tier
 */
export function getBadgesByTier(tier: BadgeTier): BadgeDefinition[] {
  return ALL_BADGES.filter((badge) => badge.tier === tier);
}

/**
 * Get currently available badges (considering seasonal limits)
 */
export function getAvailableBadges(date: Date = new Date()): BadgeDefinition[] {
  return ALL_BADGES.filter((badge) => {
    if (!badge.isLimited) return true;
    if (!badge.availableFrom || !badge.availableUntil) return true;
    return date >= badge.availableFrom && date < badge.availableUntil;
  });
}

/**
 * Badge summary
 */
export const BADGE_SUMMARY = {
  total: ALL_BADGES.length,
  byCategory: {
    [BadgeCategory.VOLUME]: VOLUME_BADGES.length,
    [BadgeCategory.STREAK]: STREAK_BADGES.length,
    [BadgeCategory.STRENGTH]: STRENGTH_BADGES.length,
    [BadgeCategory.SPEED]: SPEED_BADGES.length,
    [BadgeCategory.ACCURACY]: ACCURACY_BADGES.length,
    [BadgeCategory.PUTTING]: PUTTING_BADGES.length,
    [BadgeCategory.SHORT_GAME]: SHORT_GAME_BADGES.length,
    [BadgeCategory.MILESTONE]: SCORING_BADGES.length,
    [BadgeCategory.PHASE]: PHASE_BADGES.length,
    [BadgeCategory.MENTAL]: MENTAL_BADGES.length,
    [BadgeCategory.SEASONAL]: SEASONAL_BADGES.length,
  },
  byTier: {
    [BadgeTier.STANDARD]: ALL_BADGES.filter((b) => b.tier === BadgeTier.STANDARD).length,
    [BadgeTier.BRONZE]: ALL_BADGES.filter((b) => b.tier === BadgeTier.BRONZE).length,
    [BadgeTier.SILVER]: ALL_BADGES.filter((b) => b.tier === BadgeTier.SILVER).length,
    [BadgeTier.GOLD]: ALL_BADGES.filter((b) => b.tier === BadgeTier.GOLD).length,
    [BadgeTier.PLATINUM]: ALL_BADGES.filter((b) => b.tier === BadgeTier.PLATINUM).length,
  },
  totalXP: ALL_BADGES.reduce((sum, badge) => sum + badge.xp, 0),
};
