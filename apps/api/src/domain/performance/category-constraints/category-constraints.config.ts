/**
 * Category Constraints Configuration
 * Requirements for each category by gender
 */

import type { CategoryAK, Gender, TestDomainCode } from '../domain-mapping';
import type { CategoryRequirements } from './category-constraints.types';

// ============================================================================
// CATEGORY REQUIREMENT THRESHOLDS
// These define the minimum metric values required for each category
// ============================================================================

type CategoryRequirementMatrix = Record<Gender, Record<CategoryAK, Record<TestDomainCode, number>>>;

export const CATEGORY_REQUIREMENTS: CategoryRequirementMatrix = {
  M: {
    A: { TEE: 280, INN200: 80, INN150: 85, INN100: 90, INN50: 95, ARG: 1.5, PUTT: 95, PHYS: 120 },
    B: { TEE: 270, INN200: 75, INN150: 80, INN100: 85, INN50: 90, ARG: 1.8, PUTT: 92, PHYS: 115 },
    C: { TEE: 260, INN200: 70, INN150: 75, INN100: 80, INN50: 85, ARG: 2.0, PUTT: 88, PHYS: 110 },
    D: { TEE: 250, INN200: 65, INN150: 70, INN100: 75, INN50: 80, ARG: 2.3, PUTT: 85, PHYS: 105 },
    E: { TEE: 230, INN200: 55, INN150: 60, INN100: 65, INN50: 70, ARG: 3.0, PUTT: 78, PHYS: 98 },
    G: { TEE: 220, INN200: 50, INN150: 55, INN100: 60, INN50: 65, ARG: 3.5, PUTT: 75, PHYS: 95 },
    H: { TEE: 210, INN200: 45, INN150: 50, INN100: 55, INN50: 60, ARG: 4.0, PUTT: 70, PHYS: 92 },
    I: { TEE: 200, INN200: 40, INN150: 45, INN100: 50, INN50: 55, ARG: 4.5, PUTT: 65, PHYS: 88 },
    J: { TEE: 180, INN200: 30, INN150: 35, INN100: 40, INN50: 45, ARG: 5.5, PUTT: 55, PHYS: 80 },
  },
  K: {
    A: { TEE: 240, INN200: 75, INN150: 80, INN100: 85, INN50: 90, ARG: 1.8, PUTT: 92, PHYS: 100 },
    B: { TEE: 230, INN200: 70, INN150: 75, INN100: 80, INN50: 85, ARG: 2.0, PUTT: 88, PHYS: 95 },
    C: { TEE: 220, INN200: 65, INN150: 70, INN100: 75, INN50: 80, ARG: 2.3, PUTT: 85, PHYS: 92 },
    D: { TEE: 210, INN200: 60, INN150: 65, INN100: 70, INN50: 75, ARG: 2.6, PUTT: 82, PHYS: 88 },
    E: { TEE: 190, INN200: 50, INN150: 55, INN100: 60, INN50: 65, ARG: 3.5, PUTT: 75, PHYS: 82 },
    G: { TEE: 180, INN200: 45, INN150: 50, INN100: 55, INN50: 60, ARG: 4.0, PUTT: 70, PHYS: 78 },
    H: { TEE: 170, INN200: 40, INN150: 45, INN100: 50, INN50: 55, ARG: 4.5, PUTT: 65, PHYS: 75 },
    I: { TEE: 160, INN200: 35, INN150: 40, INN100: 45, INN50: 50, ARG: 5.0, PUTT: 60, PHYS: 72 },
    J: { TEE: 140, INN200: 25, INN150: 30, INN100: 35, INN50: 40, ARG: 6.0, PUTT: 50, PHYS: 65 },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCategoryRequirements(
  category: CategoryAK,
  gender: Gender
): CategoryRequirements {
  return {
    category,
    gender,
    requirements: CATEGORY_REQUIREMENTS[gender][category],
  };
}

export function getRequirementForDomain(
  category: CategoryAK,
  gender: Gender,
  domainCode: TestDomainCode
): number {
  return CATEGORY_REQUIREMENTS[gender][category][domainCode];
}

export function getAllCategories(): CategoryAK[] {
  return ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J'];
}

export function getNextCategory(current: CategoryAK): CategoryAK | null {
  const categories = getAllCategories();
  const currentIndex = categories.indexOf(current);
  if (currentIndex <= 0) return null; // Already at A or not found
  return categories[currentIndex - 1];
}

export function getPreviousCategory(current: CategoryAK): CategoryAK | null {
  const categories = getAllCategories();
  const currentIndex = categories.indexOf(current);
  if (currentIndex >= categories.length - 1 || currentIndex < 0) return null;
  return categories[currentIndex + 1];
}
