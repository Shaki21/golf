import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  BookOpen,
  Zap,
  MessageCircle,
} from 'lucide-react';
import {
  TierButton,
  TierCard,
  TierBadge,
  CategoryRing,
  StatCard,
  CategoryProgressCard,
  PlayerHeader,
  QuickActionCard,
} from '../../components/tier';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';

/**
 * TIER Golf Dashboard
 *
 * Modern, clean player dashboard using TIER design system.
 * Showcases all TIER components in a real-world context.
 *
 * @example
 * // In DashboardContainer:
 * <TierDashboard dashboardData={dashboardData} />
 */

export function TierDashboard({ dashboardData }) {
  const navigate = useNavigate();

  // Extract data from API or use defaults
  const player = dashboardData?.player || {};
  const stats = dashboardData?.stats || {};
  const categoryProgress = dashboardData?.categoryProgress || {};
  const upcomingTests = dashboardData?.upcomingTests || [];
  const nextTournament = dashboardData?.nextTournament || null;
  const notifications = dashboardData?.notifications || [];

  // Build playerData from API response
  const playerData = {
    name: player.name || 'Player',
    level: dashboardData?.level || 1,
    category: player.category || 'K',
    streak: stats.streak || 0,
    avatarUrl: player.avatarUrl || null,
    stats: {
      sessionsCompleted: stats.sessionsCompleted || 0,
      sessionsGoal: stats.sessionsGoal || stats.sessionsTotal || 15,
      hoursThisWeek: stats.hoursThisWeek || 0,
      hoursGoal: stats.hoursGoal || 10,
      testsCompleted: stats.testsCompleted || 0,
      testsTotal: stats.testsTotal || 5,
      averageScore: player.averageScore || stats.averageScore || player.handicap || stats.handicap || 0,
      averageScoreChange: stats.averageScoreChange || stats.handicapChange || 0,
    },
    categoryProgress: {
      category: categoryProgress.category || player.category || 'K',
      progress: categoryProgress.progress || 0,
      tests: categoryProgress.tests || [],
    },
    upcomingTests: upcomingTests.length > 0 ? upcomingTests : [],
    nextTournament: nextTournament,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section: Player Header */}
        <div className="mb-8">
          <PlayerHeader
            name={playerData.name}
            level={playerData.level}
            category={playerData.category}
            streak={playerData.streak}
            avatarUrl={playerData.avatarUrl}
            greeting={getGreeting()}
          />
        </div>

        {/* Smart Insight Banner */}
        <TierCard className="mb-8 p-5 bg-tier-gold/5 border-l-4 border-tier-gold">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-tier-gold">*</div>
            <div>
              <SubSectionTitle style={{ marginBottom: 4 }}>
                Du er på god vei!
              </SubSectionTitle>
              <p className="text-sm text-text-secondary">
                Kun 3 økter unna ukens mål. Fortsett det gode arbeidet!
              </p>
            </div>
          </div>
        </TierCard>

        {/* Weekly Performance - 4 KPI Cards */}
        <div className="mb-8">
          <SectionTitle style={{ marginBottom: 16 }}>
            Ukens Prestasjon
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              value={`${playerData.stats.sessionsCompleted}/${playerData.stats.sessionsGoal}`}
              label="Økter denne uken"
              trend={+3}
              trendLabel="vs forrige uke"
              status="success"
              iconColor="rgb(var(--tier-navy))"
              progress={{
                current: playerData.stats.sessionsCompleted,
                max: playerData.stats.sessionsGoal,
              }}
            />

            <StatCard
              icon={Clock}
              value={`${playerData.stats.hoursThisWeek}t`}
              label="Treningstimer"
              trend={+1.5}
              trendLabel="timer vs forrige"
              status="warning"
              iconColor="rgb(var(--tier-gold))"
              progress={{
                current: playerData.stats.hoursThisWeek,
                max: playerData.stats.hoursGoal,
                color: 'rgb(var(--tier-gold))',
              }}
            />

            <StatCard
              icon={Trophy}
              value={`${playerData.stats.testsCompleted}/${playerData.stats.testsTotal}`}
              label="Tester bestått"
              iconColor="rgb(var(--status-success))"
              progress={{
                current: playerData.stats.testsCompleted,
                max: playerData.stats.testsTotal,
                color: 'rgb(var(--status-success))',
              }}
            />

            <StatCard
              icon={TrendingUp}
              value={playerData.stats.averageScore.toFixed(1)}
              label="Snitt Score"
              trend={playerData.stats.averageScoreChange}
              trendLabel="fra forrige måned"
              iconColor="rgb(var(--category-f))"
              context="På vei mot under 74!"
            />
          </div>
        </div>

        {/* Category Progress */}
        <div className="mb-8">
          <SectionTitle style={{ marginBottom: 16 }}>
            Din Kategoriutvikling
          </SectionTitle>

          <CategoryProgressCard
            category={playerData.categoryProgress.category}
            progress={playerData.categoryProgress.progress}
            tests={playerData.categoryProgress.tests}
            onViewDetails={() => navigate(`/categories/${playerData.categoryProgress.category}`)}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <SectionTitle style={{ marginBottom: 16 }}>
            Hurtigvalg
          </SectionTitle>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionCard
              icon={Calendar}
              label="Kalender"
              onClick={() => navigate('/calendar')}
            />
            <QuickActionCard
              icon={BookOpen}
              label="Treningsplan"
              onClick={() => navigate('/training-plan')}
            />
            <QuickActionCard
              icon={Trophy}
              label="Badges"
              onClick={() => navigate('/badges')}
            />
            <QuickActionCard
              icon={MessageCircle}
              label="Meldinger"
              badge={notifications.filter(n => !n.read).length || undefined}
              onClick={() => navigate('/messages')}
            />
          </div>
        </div>

        {/* Two Column Layout: Tests + Tournament */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Test */}
          <TierCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <SubSectionTitle style={{ marginBottom: 0 }}>
                Neste Test
              </SubSectionTitle>
              <TierBadge variant="gold" size="sm">
                Om 9 dager
              </TierBadge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-tier-navy">
                  {playerData.upcomingTests[0].name}
                </p>
                <p className="text-sm text-text-muted">
                  Kategori {playerData.upcomingTests[0].category}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span>15. januar 2025</span>
              </div>

              <TierButton variant="primary" className="w-full mt-4">
                <Zap className="w-4 h-4" />
                Forbered test
              </TierButton>
            </div>
          </TierCard>

          {/* Next Tournament */}
          <TierCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <SubSectionTitle style={{ marginBottom: 0 }}>
                Neste Turnering
              </SubSectionTitle>
              <TierBadge variant="info" size="sm">
                Om 35 dager
              </TierBadge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-tier-navy">
                  {playerData.nextTournament.name}
                </p>
                <p className="text-sm text-text-muted">
                  {playerData.nextTournament.location}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span>10. februar 2025</span>
              </div>

              <TierButton variant="outline" className="w-full mt-4">
                Se detaljer
              </TierButton>
            </div>
          </TierCard>
        </div>
      </div>
    </div>
  );
}

export default TierDashboard;
