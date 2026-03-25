/**
 * Tests Domain - Main Export
 */

// Types
export type * from './types';

// Calculator
export { calculateTestResult, calculateTestResultAsync, validateTestInput } from './test-calculator';

// Requirements Repository
export { RequirementsRepository } from './requirements-repository';

// Individual calculation functions
export * from './calculations';
