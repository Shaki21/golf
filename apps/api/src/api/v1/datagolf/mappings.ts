/**
 * IUP to DataGolf Metric Mappings
 * Based on SAMMENLIGNING_OG_ANALYTICS.md
 */

import { IupDataGolfMapping } from './types';

/**
 * Mapping between IUP tests and DataGolf metrics
 * Correlation strength: 0 = no correlation, 1 = perfect correlation
 */
export const IUP_DATAGOLF_MAPPINGS: IupDataGolfMapping[] = [
  // ============================================================================
  // DISTANCE TESTS (1-4)
  // ============================================================================
  {
    iupTestNumber: 1,
    iupTestName: 'Driver Avstand',
    dataGolfMetric: 'driving_distance',
    conversionFormula: 'meters * 1.094 = yards',
    correlationStrength: 0.95,
    notes: 'Direct correlation with driving distance on tour',
  },
  {
    iupTestNumber: 2,
    iupTestName: '3-tre Avstand',
    dataGolfMetric: 'driving_distance',
    conversionFormula: 'meters * 1.094 = yards',
    correlationStrength: 0.85,
    notes: 'Related to driving distance, but 3-wood specific',
  },
  {
    iupTestNumber: 3,
    iupTestName: '5-jern Avstand',
    dataGolfMetric: 'strokes_gained_approach',
    conversionFormula: 'meters * 1.094 = yards',
    correlationStrength: 0.80,
    notes: 'Iron distance correlates with approach play quality',
  },
  {
    iupTestNumber: 4,
    iupTestName: 'Wedge Avstand (PW)',
    dataGolfMetric: 'strokes_gained_approach',
    conversionFormula: 'meters * 1.094 = yards',
    correlationStrength: 0.75,
    notes: 'Wedge distance correlates with short approach play',
  },

  // ============================================================================
  // SPEED TESTS (5-7)
  // ============================================================================
  {
    iupTestNumber: 5,
    iupTestName: 'Klubbhastighet (Driver)',
    dataGolfMetric: 'club_head_speed',
    conversionFormula: 'km/h * 0.621371 = mph',
    correlationStrength: 0.90,
    notes: 'Club speed directly correlates with ball speed and distance',
  },
  {
    iupTestNumber: 6,
    iupTestName: 'Ballhastighet (Driver)',
    dataGolfMetric: 'ball_speed',
    conversionFormula: 'km/h * 0.621371 = mph',
    correlationStrength: 0.92,
    notes: 'Ball speed is key predictor of driving distance',
  },
  {
    iupTestNumber: 7,
    iupTestName: 'Smash Factor (Driver)',
    dataGolfMetric: 'smash_factor',
    correlationStrength: 0.85,
    notes: 'Efficiency metric - ball speed / club speed',
  },

  // ============================================================================
  // APPROACH TESTS (8-11) - PEI BASED
  // ============================================================================
  {
    iupTestNumber: 8,
    iupTestName: 'Approach 25m',
    dataGolfMetric: 'strokes_gained_approach',
    correlationStrength: 0.70,
    notes: 'Short approach accuracy correlates with SG approach',
  },
  {
    iupTestNumber: 9,
    iupTestName: 'Approach 50m',
    dataGolfMetric: 'strokes_gained_approach',
    correlationStrength: 0.75,
    notes: 'Medium approach accuracy correlates with SG approach',
  },
  {
    iupTestNumber: 10,
    iupTestName: 'Approach 75m',
    dataGolfMetric: 'strokes_gained_approach',
    correlationStrength: 0.80,
    notes: 'Longer approach accuracy correlates with SG approach',
  },
  {
    iupTestNumber: 11,
    iupTestName: 'Approach 100m',
    dataGolfMetric: 'strokes_gained_approach',
    correlationStrength: 0.85,
    notes: 'Full wedge approach correlates strongly with SG approach',
  },

  // ============================================================================
  // PHYSICAL TESTS (12-14)
  // ============================================================================
  {
    iupTestNumber: 12,
    iupTestName: 'Pull-ups',
    dataGolfMetric: 'none',
    correlationStrength: 0.30,
    notes: 'Physical fitness - indirect correlation with performance',
  },
  {
    iupTestNumber: 13,
    iupTestName: 'Plank',
    dataGolfMetric: 'none',
    correlationStrength: 0.35,
    notes: 'Core strength - indirect correlation with consistency',
  },
  {
    iupTestNumber: 14,
    iupTestName: 'Vertical Jump',
    dataGolfMetric: 'none',
    correlationStrength: 0.40,
    notes: 'Power generation - correlates with club speed',
  },

  // ============================================================================
  // SHORT GAME TESTS (15-18)
  // ============================================================================
  {
    iupTestNumber: 15,
    iupTestName: 'Putting 3m',
    dataGolfMetric: 'strokes_gained_putting',
    correlationStrength: 0.75,
    notes: 'Short putt success rate correlates with SG putting',
  },
  {
    iupTestNumber: 16,
    iupTestName: 'Putting 6m',
    dataGolfMetric: 'strokes_gained_putting',
    correlationStrength: 0.70,
    notes: 'Medium putt success rate correlates with SG putting',
  },
  {
    iupTestNumber: 17,
    iupTestName: 'Chipping',
    dataGolfMetric: 'strokes_gained_around_green',
    correlationStrength: 0.80,
    notes: 'Chip proximity correlates with SG around the green',
  },
  {
    iupTestNumber: 18,
    iupTestName: 'Bunker',
    dataGolfMetric: 'strokes_gained_around_green',
    correlationStrength: 0.75,
    notes: 'Bunker play correlates with SG around the green',
  },

  // ============================================================================
  // ON-COURSE TESTS (19-20)
  // ============================================================================
  {
    iupTestNumber: 19,
    iupTestName: '9-hulls Simulering',
    dataGolfMetric: 'scoring_average',
    correlationStrength: 0.90,
    notes: 'Score to par directly correlates with scoring average',
  },
  {
    iupTestNumber: 20,
    iupTestName: 'On-Course Skills',
    dataGolfMetric: 'strokes_gained_total',
    correlationStrength: 0.85,
    notes: 'Overall on-course performance correlates with SG total',
  },
];

/**
 * Get mapping for a specific IUP test
 */
export function getMapping(iupTestNumber: number): IupDataGolfMapping | undefined {
  return IUP_DATAGOLF_MAPPINGS.find((m) => m.iupTestNumber === iupTestNumber);
}

/**
 * Get all mappings with strong correlation (>= 0.70)
 */
export function getStrongCorrelations(): IupDataGolfMapping[] {
  return IUP_DATAGOLF_MAPPINGS.filter((m) => m.correlationStrength >= 0.70);
}

/**
 * Get mappings by DataGolf metric
 */
export function getMappingsByMetric(metric: string): IupDataGolfMapping[] {
  return IUP_DATAGOLF_MAPPINGS.filter((m) => m.dataGolfMetric === metric);
}

/**
 * Convert IUP value to DataGolf equivalent
 */
export function convertIupToDataGolf(
  iupTestNumber: number,
  iupValue: number
): number | null {
  const mapping = getMapping(iupTestNumber);
  if (!mapping || !mapping.conversionFormula) {
    return null;
  }

  // Apply conversion formulas
  switch (iupTestNumber) {
    case 1: // Driver distance: meters to yards
    case 2: // 3-wood distance: meters to yards
    case 3: // 5-iron distance: meters to yards
    case 4: // Wedge distance: meters to yards
      return iupValue * 1.094;

    case 5: // Club speed: km/h to mph
    case 6: // Ball speed: km/h to mph
      return iupValue * 0.621371;

    case 7: // Smash factor: no conversion needed
      return iupValue;

    default:
      return null;
  }
}
