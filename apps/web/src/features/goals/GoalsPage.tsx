/**
 * TIER Golf - Goals Page
 *
 * Archetype: A - List/Index Page
 * Purpose: View and manage player goals
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, RefreshCw, Target } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text, Button, Badge, Card } from '../../ui/primitives';
import StateCard from '../../ui/composites/StateCard';
import { useGoals } from '../../data';
import { getSimState } from '../../dev/simulateState';
import { useScreenView } from '../../analytics/useScreenView';
import { AICoachGuide, GUIDE_PRESETS } from '../ai-coach';

// ============================================================================
// TYPES
// ============================================================================

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'short' | 'long';
  status: 'active' | 'completed' | 'paused';
  current: number;
  target: number;
  unit: string;
}

interface GoalsData {
  goals: Goal[];
  stats: Array<{ label: string; value: string | number; trend?: string }>;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface GoalCardProps {
  goal: Goal;
}

function GoalCard({ goal }: GoalCardProps) {
  const progressPercent = Math.min(Math.max((goal.current / goal.target) * 100, 0), 100);

  return (
    <Card variant="default" padding="md">
      <div className="flex justify-between items-center mb-2">
        <Text variant="body" color="primary" className="font-semibold">
          {goal.title}
        </Text>
        {goal.type === 'long' && (
          <Badge variant={goal.status === 'completed' ? 'success' : 'primary'} size="sm">
            {goal.status === 'completed' ? 'Fullført' : 'Pågår'}
          </Badge>
        )}
      </div>

      {goal.description && (
        <Text variant="footnote" color="secondary" className="mb-3">
          {goal.description}
        </Text>
      )}

      {goal.type === 'short' && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <Text variant="caption1" color="secondary">
              {goal.current} / {goal.target} {goal.unit}
            </Text>
            <Text variant="caption1" color="primary" className="font-semibold">
              {Math.round(progressPercent)}%
            </Text>
          </div>
          <div className="h-1.5 bg-tier-surface-base rounded-full overflow-hidden">
            <div
              className="h-full bg-tier-navy rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// STATS GRID
// ============================================================================

interface StatsGridProps {
  stats: Array<{ label: string; value: string | number; trend?: string }>;
}

function StatsGrid({ stats }: StatsGridProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="p-4 bg-tier-surface-base rounded-lg text-center">
          <Text variant="caption1" color="secondary" className="uppercase tracking-wide">
            {stat.label}
          </Text>
          <div className="flex items-baseline justify-center gap-2 mt-1">
            <Text variant="title1" color="primary">
              {stat.value}
            </Text>
            {stat.trend && (
              <Text
                variant="caption1"
                color={stat.trend.startsWith('+') ? 'success' : 'secondary'}
              >
                {stat.trend}
              </Text>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GoalsPage: React.FC = () => {
  useScreenView('Mål');
  const location = useLocation();
  const simState = getSimState(location.search);

  const hookResult = useGoals();

  // Override data based on simState (DEV only)
  const { data, isLoading, error, refetch } = simState
    ? {
        data: simState === 'empty' ? { goals: [], stats: [] } : null,
        isLoading: simState === 'loading',
        error: simState === 'error' ? 'Simulert feil (DEV)' : null,
        refetch: hookResult.refetch,
      }
    : hookResult;

  const goals = (data as GoalsData)?.goals ?? [];
  const stats = (data as GoalsData)?.stats ?? [];
  const activeGoals = goals.filter((g) => g.type === 'short' && g.status === 'active');
  const longTermGoals = goals.filter((g) => g.type === 'long');

  // Determine page state
  const pageState = isLoading && !data ? 'loading' : error ? 'error' : 'idle';

  return (
    <Page state={pageState} maxWidth="xl">
      <Page.Header
        title="Mine mål"
        subtitle="Denne uken"
        helpText="Sett og spor dine golfmål. Se kortsiktige ukentlige mål og langsiktige sesongmål. Spor fremgang med prosent fullført, trender og statistikk. Opprett nye mål, marker som fullført eller pause midlertidig. Få AI-coach veiledning for målsetting."
        actions={
          <Button size="sm" leftIcon={<Plus size={16} />}>
            Nytt mål
          </Button>
        }
      />

      {/* AI Coach contextual guide */}
      <div style={{ padding: '0 var(--spacing-4)' }}>
        <AICoachGuide config={GUIDE_PRESETS.goals} />
      </div>

      <Page.Content>
        {/* Error State */}
        {error && (
          <Page.Section card={false}>
            <StateCard
              variant="error"
              title="Noe gikk galt"
              description={error as string}
              action={
                <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={14} />} onClick={refetch}>
                  Prøv igjen
                </Button>
              }
            />
          </Page.Section>
        )}

        {/* Stats Overview */}
        {stats.length > 0 && (
          <Page.Section title="Oversikt">
            <StatsGrid stats={stats} />
          </Page.Section>
        )}

        {/* Active Goals */}
        <Page.Section
          title="Aktive mål"
          actions={
            activeGoals.length > 0 && (
              <Button variant="ghost" size="sm">
                Se alle
              </Button>
            )
          }
        >
          {activeGoals.length === 0 ? (
            <StateCard
              variant="empty"
              icon={Target}
              title="Ingen aktive mål"
              description="Opprett ditt første mål for å komme i gang"
              action={
                <Button size="sm" leftIcon={<Plus size={14} />}>
                  Nytt mål
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </Page.Section>

        {/* Long-term Goals */}
        <Page.Section
          title="Langsiktige mål"
          actions={
            longTermGoals.length > 0 && (
              <Button variant="ghost" size="sm">
                Se alle
              </Button>
            )
          }
        >
          {longTermGoals.length === 0 ? (
            <StateCard
              variant="empty"
              icon={Target}
              title="Ingen langsiktige mål"
              description="Legg til mål for sesongen"
              action={
                <Button size="sm" leftIcon={<Plus size={14} />}>
                  Nytt mål
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {longTermGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default GoalsPage;
