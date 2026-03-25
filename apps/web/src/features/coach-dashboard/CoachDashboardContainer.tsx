import React from 'react';
import CoachDashboard from './CoachDashboard';

/**
 * CoachDashboardContainer
 * Simple wrapper that delegates data fetching to CoachDashboard itself.
 * The CoachDashboard component handles its own API calls and loading states.
 */
const CoachDashboardContainer: React.FC = () => {
  // CoachDashboard handles its own data fetching when no props are provided
  return <CoachDashboard />;
};

export default CoachDashboardContainer;
