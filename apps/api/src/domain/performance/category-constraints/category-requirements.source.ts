/**
 * Category Requirements Source
 * Provides access to category requirements from database
 * Falls back to in-memory defaults if database unavailable
 */

import { PrismaClient } from '@prisma/client';
import type {
  CategoryAK,
  Gender,
  CategoryRequirementDef,
  RequirementWithMetadata,
  ConstraintSeverity,
  ComparisonOperator,
} from './category-constraints.types';
import type { TestDomainCode } from '../domain-mapping';
import { TEST_TO_DOMAIN_MAP, getSgComponentForDomain } from '../domain-mapping';

// ============================================================================
// TEST METADATA
// ============================================================================

/**
 * Test names for display
 */
export const TEST_NAMES: Record<number, string> = {
  1: 'Driver Avstand (Carry)',
  2: '3-Tre Avstand',
  3: '5-Jern Avstand',
  4: 'Wedge Avstand (PW)',
  5: 'Klubbhastighet (Driver)',
  6: 'Ballhastighet (Driver)',
  7: 'Smash Factor',
  8: 'Approach 25m',
  9: 'Approach 50m',
  10: 'Approach 75m',
  11: 'Approach 100m',
  12: 'Benkpress (1RM)',
  13: 'Markløft Trapbar (1RM)',
  14: '3000m Løping',
  15: 'Putting 3m',
  16: 'Putting 6m',
  17: 'Chipping',
  18: 'Bunker',
  19: '9-hulls Simulering',
  20: 'On-course Skills',
};

/**
 * Test severity mapping
 * hard = must be met for category advancement
 * soft = recommended but not blocking
 */
export const TEST_SEVERITY: Record<number, ConstraintSeverity> = {
  1: 'hard',  // Driver distance - critical for scoring
  2: 'soft',  // 3-wood
  3: 'hard',  // 5-iron - critical for approach
  4: 'soft',  // PW
  5: 'hard',  // Club speed - foundational
  6: 'soft',  // Ball speed
  7: 'soft',  // Smash factor
  8: 'hard',  // Short approach - critical
  9: 'hard',  // 50m approach
  10: 'hard', // 75m approach
  11: 'hard', // 100m approach
  12: 'soft', // Bench press
  13: 'soft', // Deadlift
  14: 'soft', // Running
  15: 'hard', // 3m putting - critical
  16: 'soft', // 6m putting
  17: 'hard', // Chipping - critical
  18: 'soft', // Bunker
  19: 'hard', // 9-hole sim - overall performance
  20: 'soft', // On-course skills
};

// ============================================================================
// REQUIREMENTS CACHE
// ============================================================================

let cachedRequirements: CategoryRequirementDef[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// DATABASE ACCESS
// ============================================================================

/**
 * Load requirements from database
 */
async function loadRequirementsFromDb(prisma: PrismaClient): Promise<CategoryRequirementDef[]> {
  const dbRequirements = await prisma.categoryRequirement.findMany({
    where: { isActive: true },
  });

  return dbRequirements.map(req => ({
    requirementId: req.id,
    category: req.category as CategoryAK,
    gender: req.gender as Gender,
    testNumber: req.testNumber,
    requirement: Number(req.requirement),
    unit: req.unit,
    comparison: req.comparison as ComparisonOperator,
    rangeMin: req.rangeMin ? Number(req.rangeMin) : undefined,
    rangeMax: req.rangeMax ? Number(req.rangeMax) : undefined,
    domainCode: TEST_TO_DOMAIN_MAP[req.testNumber] as TestDomainCode | undefined,
    severity: TEST_SEVERITY[req.testNumber] || 'soft',
    description: req.description || undefined,
  }));
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all requirements for a specific category and gender
 */
export async function getRequirementsForCategory(
  prisma: PrismaClient,
  category: CategoryAK,
  gender: Gender
): Promise<RequirementWithMetadata[]> {
  // Check cache
  const now = Date.now();
  if (cachedRequirements && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return filterAndEnrich(cachedRequirements, category, gender);
  }

  // Load from database
  try {
    cachedRequirements = await loadRequirementsFromDb(prisma);
    cacheTimestamp = now;
  } catch (error) {
    console.error('Failed to load requirements from database:', error);
    // If cache exists, use stale cache
    if (cachedRequirements) {
      return filterAndEnrich(cachedRequirements, category, gender);
    }
    throw error;
  }

  return filterAndEnrich(cachedRequirements, category, gender);
}

/**
 * Get requirements for a specific test across all categories
 */
export async function getRequirementsForTest(
  prisma: PrismaClient,
  testNumber: number,
  gender: Gender
): Promise<RequirementWithMetadata[]> {
  // Ensure cache is loaded
  const now = Date.now();
  if (!cachedRequirements || !cacheTimestamp || (now - cacheTimestamp) >= CACHE_TTL_MS) {
    cachedRequirements = await loadRequirementsFromDb(prisma);
    cacheTimestamp = now;
  }

  return cachedRequirements
    .filter(req => req.testNumber === testNumber && req.gender === gender)
    .map(req => enrichRequirement(req));
}

/**
 * Get a single requirement by category, gender, and test
 */
export async function getRequirement(
  prisma: PrismaClient,
  category: CategoryAK,
  gender: Gender,
  testNumber: number
): Promise<RequirementWithMetadata | null> {
  const requirements = await getRequirementsForCategory(prisma, category, gender);
  return requirements.find(r => r.testNumber === testNumber) || null;
}

/**
 * Get requirements for multiple categories (useful for gap analysis)
 */
export async function getRequirementsForCategories(
  prisma: PrismaClient,
  categories: CategoryAK[],
  gender: Gender
): Promise<Map<CategoryAK, RequirementWithMetadata[]>> {
  const result = new Map<CategoryAK, RequirementWithMetadata[]>();

  for (const category of categories) {
    result.set(category, await getRequirementsForCategory(prisma, category, gender));
  }

  return result;
}

/**
 * Get next category up from current
 */
export function getNextCategory(current: CategoryAK): CategoryAK | null {
  const order: CategoryAK[] = ['J', 'I', 'H', 'G', 'E', 'D', 'C', 'B', 'A'];
  const currentIndex = order.indexOf(current);
  if (currentIndex === -1 || currentIndex >= order.length - 1) {
    return null; // Already at A or invalid
  }
  return order[currentIndex + 1];
}

/**
 * Get previous category (lower)
 */
export function getPreviousCategory(current: CategoryAK): CategoryAK | null {
  const order: CategoryAK[] = ['J', 'I', 'H', 'G', 'E', 'D', 'C', 'B', 'A'];
  const currentIndex = order.indexOf(current);
  if (currentIndex <= 0) {
    return null; // Already at J or invalid
  }
  return order[currentIndex - 1];
}

/**
 * Calculate category distance (number of levels between)
 */
export function getCategoryDistance(from: CategoryAK, to: CategoryAK): number {
  const order: CategoryAK[] = ['J', 'I', 'H', 'G', 'E', 'D', 'C', 'B', 'A'];
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  return toIndex - fromIndex;
}

/**
 * Clear the requirements cache
 */
export function clearRequirementsCache(): void {
  cachedRequirements = null;
  cacheTimestamp = null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function filterAndEnrich(
  requirements: CategoryRequirementDef[],
  category: CategoryAK,
  gender: Gender
): RequirementWithMetadata[] {
  return requirements
    .filter(req => req.category === category && req.gender === gender)
    .map(req => enrichRequirement(req));
}

function enrichRequirement(req: CategoryRequirementDef): RequirementWithMetadata {
  const domainCode = req.domainCode || TEST_TO_DOMAIN_MAP[req.testNumber];
  const sgComponent = domainCode ? getSgComponentForDomain(domainCode) : undefined;

  return {
    ...req,
    testName: TEST_NAMES[req.testNumber] || `Test ${req.testNumber}`,
    sgComponent,
  };
}
