/**
 * Coach Analytics Module
 * Main export for coach analytics functionality
 */

// Types
export type * from './types';

// Services
export {
  analyzeTrend,
  calculatePlayerOverview,
  calculateCategoryProgression,
  compareMultiplePlayers,
  calculateTeamTestStatistics,
  calculateTeamAnalytics,
} from './coach-analytics.service';
