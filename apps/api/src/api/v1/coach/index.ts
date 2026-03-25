/**
 * Coach API Module
 * Statistics, dashboard, groups, athletes, tournaments, booking settings, and annual plans
 */

export { coachRoutes as coachStatsRoutes } from './routes';
export { annualPlanRoutes } from './annual-plan-routes';
export { CoachService } from './service';
export { AnnualPlanService } from './annual-plan-service';
