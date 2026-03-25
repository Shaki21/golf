/**
 * DashboardV2
 *
 * Premium elite golf talent development dashboard.
 * Follows TIER Golf Design System v3.0 (Premium Light).
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * COMPONENT TREE:
 *
 * DashboardV2
 * └── DashboardV2Layout
 *     ├── header: DashboardHeader
 *     │   └── Player greeting, date, avatar
 *     ├── hero: AsyncBoundary
 *     │   └── HeroCard
 *     ├── statsGrid: AsyncBoundary
 *     │   └── StatsGrid (2x2)
 *     ├── nextUp: NextUpSection
 *     ├── dailyPlan: ScheduleCard
 *     ├── strokesGained: StrokesGainedCard
 *     └── activityFeed: ActivityFeed
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardV2Layout from './DashboardV2Layout';
import {
  HeroCard,
  StatsCard,
  StatsGrid,
  NextUpSection,
  ScheduleCard,
  StrokesGainedCard,
  ActivityFeed,
  AsyncBoundary,
  useAsyncState,
} from './components';
import { PageTitle } from '../../../components/typography';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardV2Props {
  playerName: string;
  playerId: string;
}

// ============================================================================
// DASHBOARD HEADER
// ============================================================================

interface DashboardHeaderProps {
  playerName: string;
  dateLabel: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ playerName, dateLabel }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <span className="block text-xs uppercase tracking-wider text-tier-text-secondary font-medium">
          {dateLabel}
        </span>
        <PageTitle className="text-xl font-bold text-tier-navy mt-0.5 mb-0">
          Hi, {playerName}
        </PageTitle>
      </div>
    </div>
  );
};

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

const HeroSkeleton: React.FC = () => (
  <div className="bg-tier-white rounded-xl p-6 shadow-lg">
    <div className="h-3 w-20 bg-tier-surface-base rounded mb-2 animate-pulse" />
    <div className="h-7 w-48 bg-tier-surface-base rounded mb-5 animate-pulse" />
    <div className="bg-tier-surface-base rounded-lg p-4">
      <div className="h-3 w-20 bg-tier-border-default rounded mb-2 animate-pulse" />
      <div className="h-5 w-3/5 bg-tier-border-default rounded mb-1.5 animate-pulse" />
      <div className="h-3.5 w-4/5 bg-tier-border-default rounded animate-pulse" />
    </div>
    <div className="h-11 w-28 bg-tier-surface-base rounded mt-4 animate-pulse" />
  </div>
);

const StatsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-tier-white rounded-xl p-4 shadow-sm">
        <div className="h-3 w-14 bg-tier-surface-base rounded mb-2 animate-pulse" />
        <div className="h-7 w-12 bg-tier-surface-base rounded mb-2 animate-pulse" />
        <div className="h-3 w-10 bg-tier-surface-base rounded animate-pulse" />
      </div>
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DashboardV2: React.FC<DashboardV2Props> = ({ playerName, playerId }) => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Determine async states (would use real hook data)
  const heroState = useAsyncState(false, null, { exists: true }, () => false);
  const statsState = useAsyncState(false, null, { exists: true }, () => false);

  return (
    <DashboardV2Layout
      header={<DashboardHeader playerName={playerName} dateLabel={dateLabel} />}
      hero={
        <AsyncBoundary state={heroState} skeleton={<HeroSkeleton />}>
          <HeroCard
            dateLabel={dateLabel.split(',')[0]}
            playerName={playerName}
            todaysFocus={{
              title: 'Technique: Putts under 2m',
              description: 'Focus on pendulum frequency and impact angle',
              category: 'Putting',
              progress: 65,
            }}
            primaryAction={{
              label: 'Start session',
              onClick: () => navigate('/logg-trening'),
            }}
            secondaryAction={{
              label: 'View plan',
              onClick: () => navigate('/treningsdagbok'),
            }}
          />
        </AsyncBoundary>
      }
      statsGrid={
        <AsyncBoundary state={statsState} skeleton={<StatsGridSkeleton />}>
          <StatsGrid>
            <StatsCard
              label="Sessions this week"
              value="4"
              unit="/ 6"
              change={{ value: '1', direction: 'up', label: 'vs. previous' }}
            />
            <StatsCard
              label="Training time"
              value="8.5"
              unit="hours"
              change={{ value: '2.5', direction: 'up' }}
            />
            <StatsCard label="Streak" value="12" unit="days" />
            <StatsCard
              label="Avg Score"
              value="74"
              change={{ value: '1.2', direction: 'down' }}
            />
          </StatsGrid>
        </AsyncBoundary>
      }
      nextUp={
        <NextUpSection
          tournament={{
            title: 'NM Juniorer',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            location: 'Oslo Golfklubb',
          }}
          test={{
            title: 'Kategori B Test',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            subtitle: 'Driving, Approach, Putting',
          }}
        />
      }
      dailyPlan={
        <ScheduleCard
          dateLabel={dateLabel.split(',')[1]?.trim() || dateLabel}
          sessions={[
            {
              id: '1',
              title: 'Putting technique',
              type: 'teknikk',
              startTime: '09:00',
              endTime: '10:30',
              status: 'completed',
            },
            {
              id: '2',
              title: 'Approach shots',
              type: 'golfslag',
              startTime: '11:00',
              endTime: '12:30',
              status: 'in_progress',
              location: 'Range',
            },
            {
              id: '3',
              title: '9-hole round',
              type: 'spill',
              startTime: '14:00',
              endTime: '16:00',
              status: 'upcoming',
              location: 'Course',
            },
          ]}
          onViewAll={() => navigate('/treningsdagbok')}
        />
      }
      strokesGained={
        <StrokesGainedCard
          title="Strokes Gained"
          subtitle="Last 10 rounds"
          metrics={[
            { id: 'driving', label: 'Driving', value: 0.42 },
            { id: 'approach', label: 'Approach', value: -0.18 },
            { id: 'around', label: 'Around', value: 0.25 },
            { id: 'putting', label: 'Putting', value: -0.34 },
          ]}
          total={0.15}
          onViewDetails={() => navigate('/statistikk/strokes-gained')}
        />
      }
      activityFeed={
        <ActivityFeed
          activities={[
            {
              id: '1',
              type: 'session_completed',
              title: 'Putting session completed',
              description: '45 min, 87% focus',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              isUnread: true,
            },
            {
              id: '2',
              type: 'coach_message',
              title: 'New message from coach',
              description: 'Great job with...',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
              isUnread: true,
            },
            {
              id: '3',
              type: 'badge_earned',
              title: 'New badge earned',
              description: 'Putting Master - Bronze',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              isGoldAchievement: false,
            },
          ]}
          onViewAll={() => navigate('/aktivitet')}
        />
      }
    />
  );
};

export default DashboardV2;
