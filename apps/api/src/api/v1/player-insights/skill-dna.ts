/**
 * Skill DNA Calculator
 * Creates a unique skill profile "fingerprint" for each player
 * and matches with professional player profiles
 */

import {
  SkillDimension,
  SkillDNAProfile,
  ProMatch,
  ProPlayerDNA,
} from './types';

// =============================================================================
// PRO PLAYER DNA DATABASE
// =============================================================================

export const PRO_PLAYER_DNA: ProPlayerDNA[] = [
  {
    name: 'Viktor Hovland',
    tour: 'PGA',
    dimensions: { distance: 78, speed: 82, accuracy: 70, shortGame: 65, putting: 75, physical: 80 },
    playStyle: 'Power-fade med sterk putting',
    famousFor: 'Konsistent ballstriking og mental styrke',
  },
  {
    name: 'Collin Morikawa',
    tour: 'PGA',
    dimensions: { distance: 68, speed: 70, accuracy: 92, shortGame: 78, putting: 72, physical: 65 },
    playStyle: 'Presisjons-orientert med elite iron play',
    famousFor: 'Beste iron-spiller på tour, eksepsjonell accuracy',
  },
  {
    name: 'Rory McIlroy',
    tour: 'PGA',
    dimensions: { distance: 95, speed: 95, accuracy: 72, shortGame: 70, putting: 68, physical: 88 },
    playStyle: 'Aggressiv power-golf',
    famousFor: 'Enorm lengde og atletisk swing',
  },
  {
    name: 'Matt Fitzpatrick',
    tour: 'PGA',
    dimensions: { distance: 62, speed: 65, accuracy: 85, shortGame: 82, putting: 78, physical: 70 },
    playStyle: 'Teknisk presis course management',
    famousFor: 'Forbedret lengde gjennom Speed Training, US Open-vinner',
  },
  {
    name: 'Scottie Scheffler',
    tour: 'PGA',
    dimensions: { distance: 82, speed: 85, accuracy: 88, shortGame: 80, putting: 85, physical: 78 },
    playStyle: 'Komplett spiller med sterk mental game',
    famousFor: 'Verdensener, balansert elite-nivå på alle områder',
  },
  {
    name: 'Jon Rahm',
    tour: 'PGA',
    dimensions: { distance: 85, speed: 88, accuracy: 80, shortGame: 75, putting: 82, physical: 85 },
    playStyle: 'Kraftfull og lidenskapelig',
    famousFor: 'Eksplosiv kraft og clutch putting',
  },
  {
    name: 'Jordan Spieth',
    tour: 'PGA',
    dimensions: { distance: 65, speed: 68, accuracy: 72, shortGame: 90, putting: 92, physical: 62 },
    playStyle: 'Kreativ scoring og elite putting',
    famousFor: 'Beste putter på tour, utrolig touch rundt green',
  },
  {
    name: 'Xander Schauffele',
    tour: 'PGA',
    dimensions: { distance: 80, speed: 82, accuracy: 82, shortGame: 78, putting: 80, physical: 75 },
    playStyle: 'Allround excellence',
    famousFor: 'Ingen svakheter, sterk i majors',
  },
  {
    name: 'Ludvig Åberg',
    tour: 'PGA',
    dimensions: { distance: 88, speed: 90, accuracy: 78, shortGame: 72, putting: 75, physical: 85 },
    playStyle: 'Moderne power-golf med teknisk fundament',
    famousFor: 'Raskeste stigning til verdenstoppen, svensk wunderkind',
  },
  {
    name: 'Tommy Fleetwood',
    tour: 'PGA',
    dimensions: { distance: 72, speed: 75, accuracy: 80, shortGame: 85, putting: 78, physical: 68 },
    playStyle: 'Elegant swing med sterk short game',
    famousFor: 'Stilren teknikk og konsistens',
  },
];

// =============================================================================
// NORMALIZATION FUNCTIONS
// =============================================================================

/**
 * Normalize test values to 0-100 scale
 * Each test type has different expected ranges
 */
export function normalizeTestValue(
  testNumber: number,
  value: number,
  category: string,
  gender: 'M' | 'K' = 'M'
): number {
  // Define expected ranges for each test type
  const ranges: Record<string, { min: number; max: number; isLowerBetter?: boolean }> = {
    // Distance tests (meters) - higher is better
    'distance_driver': { min: 180, max: 300 },
    'distance_3wood': { min: 160, max: 260 },
    'distance_iron': { min: 140, max: 220 },
    'distance_wedge': { min: 80, max: 140 },

    // Speed tests (mph) - higher is better
    'speed_driver': { min: 85, max: 125 },
    'speed_ball': { min: 120, max: 185 },
    'speed_smash': { min: 1.35, max: 1.52 },

    // Accuracy/PEI tests (%) - lower is better
    'accuracy_25m': { min: 3, max: 25, isLowerBetter: true },
    'accuracy_50m': { min: 5, max: 30, isLowerBetter: true },
    'accuracy_75m': { min: 8, max: 35, isLowerBetter: true },
    'accuracy_100m': { min: 10, max: 40, isLowerBetter: true },

    // Short game PEI (%) - lower is better
    'shortgame_chip': { min: 5, max: 35, isLowerBetter: true },
    'shortgame_bunker': { min: 10, max: 45, isLowerBetter: true },

    // Putting (% make rate) - higher is better
    'putting_3m': { min: 50, max: 98 },
    'putting_6m': { min: 30, max: 75 },

    // Physical tests
    'physical_medball': { min: 6, max: 16 },
    'physical_vertical': { min: 30, max: 80 },
    'physical_broad': { min: 150, max: 300 },
    'physical_rotation': { min: 40, max: 100 },
    'physical_plank': { min: 30, max: 180 },
  };

  // Adjust for female players (approximately 85% of male ranges)
  const genderMultiplier = gender === 'K' ? 0.85 : 1.0;

  const key = `${category}_${testNumber}` || category;
  const range = ranges[key] || ranges[category] || { min: 0, max: 100 };

  const adjustedMax = range.max * genderMultiplier;
  const adjustedMin = range.min * genderMultiplier;

  let normalized: number;
  if (range.isLowerBetter) {
    // For PEI: lower value = higher score
    normalized = ((adjustedMax - value) / (adjustedMax - adjustedMin)) * 100;
  } else {
    // Higher value = higher score
    normalized = ((value - adjustedMin) / (adjustedMax - adjustedMin)) * 100;
  }

  // Clamp to 0-100
  return Math.min(100, Math.max(0, Math.round(normalized)));
}

/**
 * Calculate dimension score from multiple tests
 */
export function calculateDimensionScore(
  testResults: Array<{ testNumber: number; value: number; weight?: number }>,
  dimensionKey: string,
  gender: 'M' | 'K' = 'M'
): number {
  if (testResults.length === 0) return 50; // Default to middle

  let totalWeight = 0;
  let weightedSum = 0;

  for (const test of testResults) {
    const weight = test.weight || 1;
    const normalized = normalizeTestValue(test.testNumber, test.value, dimensionKey, gender);
    weightedSum += normalized * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

// =============================================================================
// PRO MATCHING
// =============================================================================

/**
 * Calculate similarity between player DNA and pro DNA
 * Uses weighted Euclidean distance
 */
export function calculateProSimilarity(
  playerDNA: Record<string, number>,
  proDNA: Record<string, number>
): number {
  const dimensions = ['distance', 'speed', 'accuracy', 'shortGame', 'putting', 'physical'];

  // Weights for each dimension (some matter more for playing style)
  const weights: Record<string, number> = {
    distance: 1.2,
    speed: 1.2,
    accuracy: 1.5,
    shortGame: 1.3,
    putting: 1.4,
    physical: 0.8,
  };

  let sumSquaredDiff = 0;
  let totalWeight = 0;

  for (const dim of dimensions) {
    const diff = (playerDNA[dim] || 50) - (proDNA[dim] || 50);
    const weight = weights[dim] || 1;
    sumSquaredDiff += (diff * diff) * weight;
    totalWeight += weight;
  }

  const avgSquaredDiff = sumSquaredDiff / totalWeight;
  const distance = Math.sqrt(avgSquaredDiff);

  // Convert distance to similarity (0-100)
  // Max distance would be ~100 (0 vs 100 on all dimensions)
  const maxDistance = 100;
  const similarity = Math.max(0, 100 - (distance / maxDistance * 100));

  return Math.round(similarity);
}

/**
 * Find common strengths between player and pro
 */
export function findCommonStrengths(
  playerDNA: Record<string, number>,
  proDNA: Record<string, number>,
  threshold: number = 70
): string[] {
  const dimensionLabels: Record<string, string> = {
    distance: 'Lengde',
    speed: 'Hastighet',
    accuracy: 'Presisjon',
    shortGame: 'Kortspill',
    putting: 'Putting',
    physical: 'Fysisk',
  };

  const common: string[] = [];

  for (const [dim, label] of Object.entries(dimensionLabels)) {
    if ((playerDNA[dim] || 0) >= threshold && (proDNA[dim] || 0) >= threshold) {
      common.push(label);
    }
  }

  return common;
}

/**
 * Find common development areas
 */
export function findCommonWeaknesses(
  playerDNA: Record<string, number>,
  proDNA: Record<string, number>,
  threshold: number = 70
): string[] {
  const dimensionLabels: Record<string, string> = {
    distance: 'Lengde',
    speed: 'Hastighet',
    accuracy: 'Presisjon',
    shortGame: 'Kortspill',
    putting: 'Putting',
    physical: 'Fysisk',
  };

  const common: string[] = [];

  for (const [dim, label] of Object.entries(dimensionLabels)) {
    if ((playerDNA[dim] || 50) < threshold && (proDNA[dim] || 50) < threshold) {
      common.push(label);
    }
  }

  return common;
}

/**
 * Generate insight text for pro match
 */
export function generateMatchInsight(
  playerDNA: Record<string, number>,
  pro: ProPlayerDNA,
  similarity: number
): string {
  // Strengths/weaknesses available for enhanced recommendations
  // const playerStrengths = Object.entries(playerDNA)
  //   .filter(([_, score]) => score >= 75)
  //   .map(([dim]) => dim);
  // const playerWeaknesses = Object.entries(playerDNA)
  //   .filter(([_, score]) => score < 60)
  //   .map(([dim]) => dim);

  if (similarity >= 80) {
    return `Du har en veldig lik spillestil som ${pro.name}. Fokuser på ${pro.famousFor.toLowerCase()} for videre utvikling.`;
  } else if (similarity >= 65) {
    const proStrength = Object.entries(pro.dimensions)
      .sort(([, a], [, b]) => b - a)[0][0];
    return `${pro.name} har utviklet ${proStrength} til elite-nivå. Dette kan være veien for deg også.`;
  } else {
    return `Selv om profilen er annerledes, kan du lære av ${pro.name}s ${pro.playStyle.toLowerCase()}.`;
  }
}

/**
 * Find top pro matches for a player
 */
export function findProMatches(
  playerDNA: Record<string, number>,
  limit: number = 3
): ProMatch[] {
  const matches: ProMatch[] = PRO_PLAYER_DNA.map(pro => {
    const similarity = calculateProSimilarity(playerDNA, pro.dimensions);
    const commonStrengths = findCommonStrengths(playerDNA, pro.dimensions);
    const developmentAreas = findCommonWeaknesses(playerDNA, pro.dimensions);
    const insight = generateMatchInsight(playerDNA, pro, similarity);

    return {
      proName: pro.name,
      similarity,
      commonStrengths,
      developmentAreas,
      insight,
    };
  });

  return matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// =============================================================================
// BALANCE SCORE
// =============================================================================

/**
 * Calculate how balanced a player's profile is
 * Higher score = more balanced (no extreme weaknesses)
 */
export function calculateBalanceScore(dimensions: Record<string, number>): number {
  const values = Object.values(dimensions);
  if (values.length === 0) return 50;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = more balanced
  // Convert to 0-100 score where 100 is perfectly balanced
  const maxStdDev = 30; // Assume max reasonable std dev
  const balanceScore = Math.max(0, 100 - (stdDev / maxStdDev * 100));

  return Math.round(balanceScore);
}

// =============================================================================
// MAIN CALCULATOR
// =============================================================================

export interface SkillDNAInput {
  playerId: string;
  gender: 'M' | 'K';
  testResults: {
    distance: Array<{ testNumber: number; value: number }>;
    speed: Array<{ testNumber: number; value: number }>;
    accuracy: Array<{ testNumber: number; value: number }>;
    shortGame: Array<{ testNumber: number; value: number }>;
    putting: Array<{ testNumber: number; value: number }>;
    physical: Array<{ testNumber: number; value: number }>;
  };
  peerPercentiles?: Record<string, number>;
  categoryBenchmarks?: Record<string, number>;
  previousProfile?: SkillDNAProfile | null;
}

export function calculateSkillDNA(input: SkillDNAInput): SkillDNAProfile {
  const { gender, testResults, peerPercentiles = {}, categoryBenchmarks = {}, previousProfile } = input;

  const dimensionLabels: Record<string, { name: string; nameNo: string; unit: string }> = {
    distance: { name: 'Distance', nameNo: 'Lengde', unit: 'm' },
    speed: { name: 'Speed', nameNo: 'Hastighet', unit: 'mph' },
    accuracy: { name: 'Accuracy', nameNo: 'Presisjon', unit: 'PEI %' },
    shortGame: { name: 'Short Game', nameNo: 'Kortspill', unit: 'PEI %' },
    putting: { name: 'Putting', nameNo: 'Putting', unit: '% make' },
    physical: { name: 'Physical', nameNo: 'Fysisk', unit: 'mixed' },
  };

  const dimensions: Record<string, SkillDimension> = {};

  for (const [key, tests] of Object.entries(testResults)) {
    const score = calculateDimensionScore(tests, key, gender);
    const labels = dimensionLabels[key];

    // Calculate raw average value
    const rawValue = tests.length > 0
      ? tests.reduce((sum, t) => sum + t.value, 0) / tests.length
      : 0;

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (previousProfile && previousProfile.dimensions[key as keyof typeof previousProfile.dimensions]) {
      const prevScore = previousProfile.dimensions[key as keyof typeof previousProfile.dimensions].score;
      if (score > prevScore + 3) trend = 'improving';
      else if (score < prevScore - 3) trend = 'declining';
    }

    dimensions[key] = {
      id: key,
      name: labels.name,
      nameNo: labels.nameNo,
      score,
      rawValue: Math.round(rawValue * 10) / 10,
      unit: labels.unit,
      testNumbers: tests.map(t => t.testNumber),
      trend,
      percentile: peerPercentiles[key] || 50,
      categoryBenchmark: categoryBenchmarks[key] || 100,
    };
  }

  // Calculate aggregated scores
  const scores = Object.values(dimensions).map(d => d.score);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const balanceScore = calculateBalanceScore(
    Object.fromEntries(Object.entries(dimensions).map(([k, v]) => [k, v.score]))
  );

  // Find strengths and weaknesses
  const sortedDimensions = Object.entries(dimensions).sort(([, a], [, b]) => b.score - a.score);
  const strengths = sortedDimensions.slice(0, 2).map(([, d]) => d.nameNo);
  const weaknesses = sortedDimensions.slice(-2).reverse().map(([, d]) => d.nameNo);

  // Find pro matches
  const playerDNAForMatching = Object.fromEntries(
    Object.entries(dimensions).map(([k, v]) => [k, v.score])
  );
  const proMatches = findProMatches(playerDNAForMatching);

  return {
    dimensions: dimensions as SkillDNAProfile['dimensions'],
    overallScore,
    balanceScore,
    strengths,
    weaknesses,
    proMatches,
    previousProfile,
    profileDate: new Date(),
  };
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export const skillDNAUtils = {
  normalizeTestValue,
  calculateDimensionScore,
  calculateProSimilarity,
  findProMatches,
  calculateBalanceScore,
  PRO_PLAYER_DNA,
};
