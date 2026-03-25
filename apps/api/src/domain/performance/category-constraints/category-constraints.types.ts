/**
 * Category Constraints Types
 * Types for category advancement binding constraints
 */

import type { TestDomainCode, SgComponent } from '../domain-mapping';

// Re-export types that are used across the module
export type { CategoryAK, Gender } from '../domain-mapping';
import type { CategoryAK, Gender } from '../domain-mapping';

// ============================================================================
// REQUIREMENT DEFINITION TYPES
// ============================================================================

export type ConstraintSeverity = 'hard' | 'soft';
export type ComparisonOperator = '>=' | '<=' | '>' | '<' | '==' | '!=';

export interface CategoryRequirementDef {
  requirementId: string;
  category: CategoryAK;
  gender: Gender;
  testNumber: number;
  requirement: number;
  unit: string;
  comparison: ComparisonOperator;
  rangeMin?: number;
  rangeMax?: number;
  domainCode?: TestDomainCode;
  severity: ConstraintSeverity;
  description?: string;
}

export interface RequirementWithMetadata extends CategoryRequirementDef {
  testName: string;
  sgComponent?: SgComponent;
}

// ============================================================================
// CORE TYPES
// ============================================================================

export interface BindingConstraint {
  domainCode: TestDomainCode;
  currentValue: number;
  requiredValue: number;
  gap: number;
  gapPercent: number;
  priority: number;
  isBinding: boolean;
}

export interface CategoryRequirements {
  category: CategoryAK;
  gender: Gender;
  requirements: Record<TestDomainCode, number>;
}

export interface ConstraintAnalysis {
  playerId: string;
  currentCategory: CategoryAK;
  targetCategory: CategoryAK;
  gender: Gender;
  bindingConstraints: BindingConstraint[];
  nonBindingGaps: BindingConstraint[];
  analysisDate: Date;
}

// ============================================================================
// PLAYER PERFORMANCE TYPES
// ============================================================================

export interface PlayerDomainPerformance {
  domainCode: TestDomainCode;
  currentValue: number;
  lastTestDate?: Date;
  testCount: number;
}

export interface PlayerPerformanceSnapshot {
  playerId: string;
  category: CategoryAK;
  gender: Gender;
  performances: PlayerDomainPerformance[];
  snapshotDate: Date;
}

// ============================================================================
// SERVICE INPUT/OUTPUT TYPES
// ============================================================================

export interface GetBindingConstraintsInput {
  playerId: string;
  currentCategory: CategoryAK;
  targetCategory: CategoryAK;
  gender: Gender;
  performances: PlayerDomainPerformance[];
}

export interface GetBindingConstraintsOutput {
  bindingConstraints: BindingConstraint[];
  nonBindingGaps: BindingConstraint[];
  totalGap: number;
}
