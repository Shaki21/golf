/**
 * Statistics Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What statistics should I review to improve my game?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with primary statistic insight
 * Layer 2 (40%) — Control & Progress: Tab navigation for detailed views
 * Layer 3 (30%) — Operations & Admin: Current tab content
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { useScreenView } from '../../analytics/useScreenView';
import { ExportButton } from '../../components/common/ExportButton';
import { AICoachGuide } from '../ai-coach/components/AICoachGuide';
import { GUIDE_PRESETS } from '../ai-coach/types';
import {
  BarChart3,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Activity,
} from 'lucide-react';

// Lazy load the content components for better performance
const PlayerStatsContent = lazy(() => import('./PlayerStatsContent'));
const StrokesGainedContent = lazy(() => import('./StrokesGainedContent'));
const TestResultsContent = lazy(() => import('./TestResultsContent'));
const BenchmarkContent = lazy(() => import('./BenchmarkContent'));
const StatusProgressContent = lazy(() => import('./StatusProgressContent'));
const TrendsContent = lazy(() => import('./TrendsContent'));

// =============================================================================
// TYPES
// =============================================================================

type TabId = 'oversikt' | 'strokes-gained' | 'benchmark' | 'trends' | 'testresultater' | 'status';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'oversikt',
    label: 'Overview',
    icon: BarChart3,
    description: 'Statistics summary',
  },
  {
    id: 'strokes-gained',
    label: 'Strokes Gained',
    icon: Activity,
    description: 'Detailed SG analysis',
  },
  {
    id: 'benchmark',
    label: 'Benchmark',
    icon: Trophy,
    description: 'Compare with elite',
  },
  {
    id: 'trends',
    label: 'Trends',
    icon: TrendingUp,
    description: 'Historical development',
  },
  {
    id: 'testresultater',
    label: 'Test Results',
    icon: ClipboardList,
    description: 'All tests',
  },
  {
    id: 'status',
    label: 'Status & Goals',
    icon: Target,
    description: 'Your progression',
  },
];

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaTab: TabId;
  urgency: 'high' | 'medium' | 'low';
}

function computeStatisticsState(sgData: any): PrimaryAction {
  // No data
  if (!sgData || !sgData.hasData || sgData.isDemo) {
    return {
      headline: 'Start tracking your performance',
      subtext: 'Complete tests to see your Strokes Gained analysis',
      ctaLabel: 'View Overview',
      ctaTab: 'oversikt',
      urgency: 'medium',
    };
  }

  // Find weakest category
  if (sgData.byCategory) {
    const categories = Object.entries(sgData.byCategory);
    const weakest = categories.reduce((min: any, [key, cat]: [string, any]) =>
      cat.value < min.value ? { key, ...cat } : min,
      { key: '', value: Infinity, tourAvg: 0 }
    );

    // Clear weakness
    if (weakest.value < weakest.tourAvg - 0.5) {
      return {
        headline: `Focus on ${weakest.key === 'around_green' ? 'Around Green' : weakest.key}`,
        subtext: 'This area needs the most attention',
        ctaLabel: 'View Details',
        ctaTab: 'strokes-gained',
        urgency: 'high',
      };
    }
  }

  // Declining trend
  if (sgData.trend && sgData.trend < -0.2) {
    return {
      headline: 'Performance trending down',
      subtext: 'Review your recent trends',
      ctaLabel: 'View Trends',
      ctaTab: 'trends',
      urgency: 'high',
    };
  }

  // Improving
  if (sgData.trend && sgData.trend > 0.2) {
    return {
      headline: 'Great progress!',
      subtext: 'Your game is improving',
      ctaLabel: 'View Progress',
      ctaTab: 'status',
      urgency: 'low',
    };
  }

  // Default
  return {
    headline: 'Explore your statistics',
    subtext: 'Review your game data and track progress',
    ctaLabel: 'View Overview',
    ctaTab: 'oversikt',
    urgency: 'low',
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface StatisticsHeroCardProps {
  action: PrimaryAction;
  userName: string;
  sgTotal: number | null;
  trend: number;
  onTabSelect: (tab: TabId) => void;
}

function StatisticsHeroDecisionCard({
  action,
  userName,
  sgTotal,
  trend,
  onTabSelect,
}: StatisticsHeroCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  const formatSG = (value: number | null) => {
    if (value === null) return '-';
    if (value > 0) return `+${value.toFixed(2)}`;
    return value.toFixed(2);
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Greeting + SG Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{userName}</span>
        </h2>
        {sgTotal !== null && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            sgTotal >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formatSG(sgTotal)} SG Total
          </span>
        )}
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onTabSelect(action.ctaTab)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <BarChart3 size={18} />
          {action.ctaLabel}
        </button>
        <Link
          to="/trening/testing/registrer"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default bg-white text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Target size={16} />
          Register Test
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-tier-surface-secondary rounded w-1/4" />
      <div className="h-64 bg-tier-surface-secondary rounded" />
      <div className="h-32 bg-tier-surface-secondary rounded" />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const StatistikkHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: sgData } = useStrokesGained();

  // Get tab from URL or default to 'oversikt'
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabFromUrl && TABS.some(t => t.id === tabFromUrl) ? tabFromUrl : 'oversikt'
  );

  const userName = user?.firstName || 'Player';
  const playerId = user?.playerId || user?.id;

  // Track screen view
  useScreenView(`Statistikk - ${TABS.find(t => t.id === activeTab)?.label || 'Oversikt'}`);

  // Sync URL with active tab
  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, tabFromUrl, setSearchParams]);

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    if (tabFromUrl && TABS.some(t => t.id === tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const activeTabConfig = TABS.find(t => t.id === activeTab);
  const action = computeStatisticsState(sgData);

  const renderTabContent = () => {
    const fallback = <ContentSkeleton />;

    switch (activeTab) {
      case 'oversikt':
        return (
          <Suspense fallback={fallback}>
            <PlayerStatsContent />
          </Suspense>
        );
      case 'strokes-gained':
        return (
          <Suspense fallback={fallback}>
            <StrokesGainedContent />
          </Suspense>
        );
      case 'benchmark':
        return (
          <Suspense fallback={fallback}>
            <BenchmarkContent />
          </Suspense>
        );
      case 'trends':
        return (
          <Suspense fallback={fallback}>
            <TrendsContent />
          </Suspense>
        );
      case 'testresultater':
        return (
          <Suspense fallback={fallback}>
            <TestResultsContent />
          </Suspense>
        );
      case 'status':
        return (
          <Suspense fallback={fallback}>
            <StatusProgressContent />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Statistics"
        subtitle={activeTabConfig?.description || 'Your game statistics'}
        helpText="Explore your statistics with Strokes Gained analysis, benchmarks, test results, and progress tracking."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Export button */}
        {playerId && (
          <div className="flex justify-end mb-4">
            <ExportButton
              type="statistics"
              playerId={playerId}
              variant="ghost"
              size="sm"
              label="Export"
            />
          </div>
        )}

        {/* AI Coach Guide */}
        <div className="mb-6">
          <AICoachGuide config={GUIDE_PRESETS.statistics} variant="default" />
        </div>

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with primary insight
            ============================================================ */}
        <section className="mb-8" aria-label="Statistics overview">
          <StatisticsHeroDecisionCard
            action={action}
            userName={userName}
            sgTotal={sgData?.total ?? null}
            trend={sgData?.trend ?? 0}
            onTabSelect={handleTabChange}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Tab navigation
            ============================================================ */}
        <section className="mb-6" aria-label="Statistics navigation">
          <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
            <div
              className="flex overflow-x-auto scrollbar-hide border-b border-tier-border-subtle"
              role="tablist"
              aria-label="Statistics categories"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-medium
                      transition-colors relative border-b-2
                      ${isActive
                        ? 'text-tier-navy border-tier-gold bg-tier-surface-subtle'
                        : 'text-tier-text-secondary border-transparent hover:text-tier-navy hover:bg-tier-surface-subtle'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={isActive ? 'text-tier-gold' : 'text-tier-text-tertiary'}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Tab content
            ============================================================ */}
        <section aria-label="Statistics content">
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="min-h-[400px]"
          >
            {renderTabContent()}
          </div>
        </section>
      </PageContainer>
    </div>
  );
};

export default StatistikkHub;
