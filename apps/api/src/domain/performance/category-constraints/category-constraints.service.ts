/**
 * Category Constraints Service
 * Analyzes binding constraints for category advancement
 */

import type { PrismaClient } from '@prisma/client';
import type { CategoryAK, Gender } from '../domain-mapping';
import { DOMAIN_PRIORITY_ORDER } from '../domain-mapping';
import type {
  BindingConstraint,
  ConstraintAnalysis,
  PlayerDomainPerformance,
  GetBindingConstraintsInput,
  GetBindingConstraintsOutput,
} from './category-constraints.types';
import {
  CATEGORY_REQUIREMENTS,
  getNextCategory,
} from './category-constraints.config';

// ============================================================================
// CONSTRAINT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Calculates binding constraints for a player's category advancement
 * Binding constraints are the domains where the player is furthest from requirements
 */
export function calculateBindingConstraints(
  input: GetBindingConstraintsInput
): GetBindingConstraintsOutput {
  const { targetCategory, gender, performances } = input;
  const requirements = CATEGORY_REQUIREMENTS[gender][targetCategory];

  const constraints: BindingConstraint[] = [];

  for (const perf of performances) {
    const required = requirements[perf.domainCode];
    if (required === undefined) continue;

    // Calculate gap based on metric direction
    // For most metrics, higher is better. For ARG (proximity), lower is better.
    const isLowerBetter = perf.domainCode === 'ARG';
    let gap: number;
    let gapPercent: number;

    if (isLowerBetter) {
      // For ARG: gap is positive if current > required (need to reduce)
      gap = perf.currentValue - required;
      gapPercent = required > 0 ? (gap / required) * 100 : 0;
    } else {
      // For others: gap is positive if current < required (need to increase)
      gap = required - perf.currentValue;
      gapPercent = required > 0 ? (gap / required) * 100 : 0;
    }

    // Priority based on domain priority order
    const priority = DOMAIN_PRIORITY_ORDER.indexOf(perf.domainCode);

    constraints.push({
      domainCode: perf.domainCode,
      currentValue: perf.currentValue,
      requiredValue: required,
      gap: Math.max(0, gap), // Clamp to 0 if already met
      gapPercent: Math.max(0, gapPercent),
      priority: priority >= 0 ? priority : 999,
      isBinding: gap > 0,
    });
  }

  // Sort by gap percent descending to find most binding constraints
  constraints.sort((a, b) => {
    if (b.gapPercent !== a.gapPercent) return b.gapPercent - a.gapPercent;
    return a.priority - b.priority; // Tie-break by priority
  });

  // Binding constraints are those with gap > 0, limited to top 3
  const bindingConstraints = constraints.filter(c => c.isBinding).slice(0, 3);
  const nonBindingGaps = constraints.filter(c => !c.isBinding);
  const totalGap = bindingConstraints.reduce((sum, c) => sum + c.gap, 0);

  return {
    bindingConstraints,
    nonBindingGaps,
    totalGap,
  };
}

/**
 * Performs full constraint analysis for a player
 */
export function analyzePlayerConstraints(
  playerId: string,
  currentCategory: CategoryAK,
  gender: Gender,
  performances: PlayerDomainPerformance[]
): ConstraintAnalysis {
  const targetCategory = getNextCategory(currentCategory);

  if (!targetCategory) {
    // Player is already at highest category
    return {
      playerId,
      currentCategory,
      targetCategory: currentCategory,
      gender,
      bindingConstraints: [],
      nonBindingGaps: [],
      analysisDate: new Date(),
    };
  }

  const result = calculateBindingConstraints({
    playerId,
    currentCategory,
    targetCategory,
    gender,
    performances,
  });

  return {
    playerId,
    currentCategory,
    targetCategory,
    gender,
    bindingConstraints: result.bindingConstraints,
    nonBindingGaps: result.nonBindingGaps,
    analysisDate: new Date(),
  };
}

// ============================================================================
// SERVICE FACTORY
// ============================================================================

export interface CategoryConstraintsService {
  calculateBindingConstraints(input: GetBindingConstraintsInput): GetBindingConstraintsOutput;
  analyzePlayerConstraints(
    playerId: string,
    currentCategory: CategoryAK,
    gender: Gender,
    performances: PlayerDomainPerformance[]
  ): ConstraintAnalysis;
  getPlayerPerformances(playerId: string): Promise<PlayerDomainPerformance[]>;
}

export function createCategoryConstraintsService(
  _prisma: PrismaClient
): CategoryConstraintsService {
  return {
    calculateBindingConstraints,
    analyzePlayerConstraints,

    async getPlayerPerformances(playerId: string): Promise<PlayerDomainPerformance[]> {
      // This would query the database for the player's latest test results
      // For now, returns empty array - implement based on actual schema
      console.log(`Getting performances for player: ${playerId}`);
      return [];
    },
  };
}
