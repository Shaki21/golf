/**
 * DashboardPage
 *
 * Archetype: C - Dashboard/Calendar Page
 * Purpose: Main dashboard using the new UI templates
 * Composes AppShellTemplate + StatsGridTemplate + Card
 * Data fetched via useDashboardData hook
 *
 * DEV: Test states via querystring:
 *   /dashboard-v2?state=loading
 *   /dashboard-v2?state=error
 *   /dashboard-v2?state=empty
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import AppShellTemplate from '../../ui/templates/AppShellTemplate';
import StatsGridTemplate from '../../ui/templates/StatsGridTemplate';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { Plus, RefreshCw } from 'lucide-react';
import { useDashboardData } from '../../data';
import type { DashboardSession } from '../../data';
import { getSimState } from '../../dev/simulateState';
import { useScreenView } from '../../analytics/useScreenView';
import { SectionTitle } from '../../components/typography/Headings';

// Pure functions - moved outside component to avoid recreation
const getStatusText = (status: DashboardSession['status']) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In progress';
    default:
      return 'Scheduled';
  }
};

const getStatusColorClass = (status: DashboardSession['status']) => {
  switch (status) {
    case 'completed':
      return 'text-tier-success';
    case 'in_progress':
      return 'text-tier-navy';
    default:
      return 'text-tier-text-secondary';
  }
};

const DashboardPage: React.FC = () => {
  useScreenView('Dashboard');
  const location = useLocation();
  const simState = getSimState(location.search);

  const hookResult = useDashboardData();

  // Override data based on simState (DEV only)
  const { data, isLoading, error, refetch } = simState
    ? {
        data: simState === 'empty' ? { sessions: [], stats: [] } : null,
        isLoading: simState === 'loading',
        error: simState === 'error' ? 'Simulert feil (DEV)' : null,
        refetch: hookResult.refetch,
      }
    : hookResult;

  // Action button for header
  const headerActions = (
    <Button size="sm" leftIcon={<Plus size={16} />}>
      New session
    </Button>
  );

  // Loading state
  if (isLoading && !data) {
    return (
      <AppShellTemplate
        title="Overview"
        subtitle="Welcome back"
        helpText="Main overview (dashboard) showing your training status and activity. KPI statistics with total sessions, completed sessions this month, upcoming sessions and current streak. List of upcoming sessions with time, title, category, intensity and duration. List of recent sessions with date, category, intensity and evaluation status (pending/completed). Quick links to key features (New session, Calendar, Statistics, Breaking Points). Use for quick overview of training status and planning activities."
      >
        <section className="mb-6">
          <StateCard
            variant="info"
            title="Loading..."
            description="Fetching your data"
          />
        </section>
      </AppShellTemplate>
    );
  }

  const sessions = data?.sessions ?? [];
  const stats = data?.stats ?? [];

  return (
    <AppShellTemplate
      title="Overview"
      subtitle="Welcome back"
      helpText="Main overview (dashboard) showing your training status and activity. KPI statistics with total sessions, completed sessions this month, upcoming sessions and current streak. List of upcoming sessions with time, title, category, intensity and duration. List of recent sessions with date, category, intensity and evaluation status (pending/completed). Quick links to key features (New session, Calendar, Statistics, Breaking Points). Use for quick overview of training status and planning activities."
      actions={headerActions}
    >
      {/* Error message */}
      {error && (
        <section className="mb-6">
          <StateCard
            variant="error"
            title="Something went wrong"
            description={error}
            action={
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<RefreshCw size={14} />}
                onClick={refetch}
              >
                Try again
              </Button>
            }
          />
        </section>
      )}

      {/* Stats Grid */}
      <section className="mb-6">
        <StatsGridTemplate items={stats} columns={2} />
      </section>

      {/* Today's Sessions */}
      <section className="mb-6">
        <SectionTitle className="text-lg font-semibold text-tier-navy mb-3">
          Your sessions today
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {sessions.length === 0 ? (
            <StateCard
              variant="empty"
              title="No sessions today"
              description="Schedule a training session to get started"
              action={
                <Button size="sm" leftIcon={<Plus size={14} />}>
                  New session
                </Button>
              }
            />
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-tier-navy">
                    {session.title}
                  </span>
                  <span
                    className={`text-xs font-medium ${getStatusColorClass(session.status)}`}
                  >
                    {getStatusText(session.status)}
                  </span>
                </div>
                <div className="text-xs text-tier-text-secondary">
                  {session.start} - {session.end}
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </AppShellTemplate>
  );
};

export default DashboardPage;
