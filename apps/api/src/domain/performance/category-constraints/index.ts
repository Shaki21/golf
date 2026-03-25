/**
 * Category Constraints Module
 * Exports for category advancement constraint analysis
 */

export {
  calculateBindingConstraints,
  analyzePlayerConstraints,
  createCategoryConstraintsService,
  type CategoryConstraintsService,
} from './category-constraints.service';

export type {
  BindingConstraint,
  CategoryRequirements,
  ConstraintAnalysis,
  PlayerDomainPerformance,
  PlayerPerformanceSnapshot,
  GetBindingConstraintsInput,
  GetBindingConstraintsOutput,
  CategoryRequirementDef,
  RequirementWithMetadata,
  ConstraintSeverity,
  ComparisonOperator,
  CategoryAK,
  Gender,
} from './category-constraints.types';

export {
  getRequirementsForCategory,
  getRequirementsForTest,
  getRequirement,
  getRequirementsForCategories,
  getNextCategory as getNextCategoryFromDb,
  getPreviousCategory as getPreviousCategoryFromDb,
  getCategoryDistance,
  clearRequirementsCache,
  TEST_NAMES,
  TEST_SEVERITY,
} from './category-requirements.source';

export {
  CATEGORY_REQUIREMENTS,
  getCategoryRequirements,
  getRequirementForDomain,
  getAllCategories,
  getNextCategory,
  getPreviousCategory,
} from './category-constraints.config';
