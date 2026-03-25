/**
 * Peer Comparison Module
 * Main export for peer comparison functionality
 */

// Types
export type * from './types';

// Services
export {
  calculateStatistics,
  calculatePercentileRank,
  generateComparisonText,
  calculatePeerComparison,
  calculateMultiLevelComparison,
  matchesPeerCriteria,
} from './peer-comparison.service';
