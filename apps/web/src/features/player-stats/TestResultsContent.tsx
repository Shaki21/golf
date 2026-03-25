/**
 * TestResultsContent - Comprehensive test results view
 * Design System v3.1 - Tailwind CSS
 * Used within StatistikkHub as tab content
 *
 * Features:
 * - Test history list with filtering
 * - Category progression visualization
 * - Test comparison tools
 * - Improvement velocity tracking
 * - Coach notes integration
 */

import React, { useState, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Filter,
  Target,
  GitCompare,
  Zap,
  MessageSquare,
  Award,
  ChevronRight,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle } from '../../components/typography/Headings';
import useTestResults from '../../hooks/useTestResults';

// Lazy load sub-widgets for performance
const CategoryProgressionWidget = lazy(() => import('./CategoryProgressionWidget'));
const TestComparisonWidget = lazy(() => import('./TestComparisonWidget'));
const ImprovementVelocityWidget = lazy(() => import('./ImprovementVelocityWidget'));
const CoachNotesPanel = lazy(() => import('./CoachNotesPanel'));

// ============================================================================
// TYPES
// ============================================================================

type SubView = 'list' | 'progression' | 'compare' | 'velocity' | 'notes';

const SUB_VIEWS: { id: SubView; label: string; icon: React.ReactNode }[] = [
  { id: 'list', label: 'Oversikt', icon: <ClipboardList size={16} /> },
  { id: 'progression', label: 'Progresjon', icon: <Award size={16} /> },
  { id: 'compare', label: 'Sammenlign', icon: <GitCompare size={16} /> },
  { id: 'velocity', label: 'Hastighet', icon: <Zap size={16} /> },
  { id: 'notes', label: 'Notater', icon: <MessageSquare size={16} /> },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TestResultsContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const subView = (searchParams.get('subview') as SubView) || 'list';
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const {
    tests,
    testsByCategory,
    categories,
    totalTests,
    passedTests,
    improvingTests,
    loading,
    error,
  } = useTestResults();

  const setSubView = (view: SubView) => {
    searchParams.set('subview', view);
    setSearchParams(searchParams);
  };

  const handleViewTestDetails = (testId: string) => {
    navigate(`/statistikk?tab=testresultater&testId=${testId}`);
  };

  const filteredTests = filterCategory === 'all'
    ? tests
    : tests.filter(t => t.category === filterCategory);

  if (loading) {
    return (
      <StateCard
        variant="loading"
        title="Laster testresultater..."
        description="Henter dine data"
      />
    );
  }

  if (error && tests.length === 0) {
    return (
      <StateCard
        variant="error"
        title="Kunne ikke laste data"
        description={error}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Quick Stats */}
      <section className="mb-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <ClipboardList size={20} className="text-tier-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-tier-navy tabular-nums">{totalTests}</span>
                <span className="text-xs text-tier-text-tertiary">Totalt tester</span>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Target size={20} className="text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-600 tabular-nums">
                  {passedTests}/{totalTests}
                </span>
                <span className="text-xs text-tier-text-tertiary">Oppfylt</span>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <TrendingUp size={20} className="text-tier-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-tier-navy tabular-nums">{improvingTests}</span>
                <span className="text-xs text-tier-text-tertiary">Forbedrer seg</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Sub-navigation */}
      <section className="mb-5">
        <div className="flex gap-2 p-1 bg-tier-surface-subtle rounded-lg overflow-x-auto">
          {SUB_VIEWS.map(view => (
            <button
              key={view.id}
              onClick={() => setSubView(view.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border-none text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-150 ${
                subView === view.id
                  ? 'bg-white text-tier-gold shadow-sm'
                  : 'bg-transparent text-tier-text-secondary hover:bg-white/50'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content based on sub-view */}
      <Suspense fallback={<StateCard variant="loading" title="Laster..." />}>
        {subView === 'list' && (
          <>
            {/* Filter */}
            <section className="mb-5">
              <div className="flex items-center gap-3 p-3 bg-tier-surface-subtle rounded-lg">
                <Filter size={18} className="text-tier-text-secondary" />
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-2 py-1 rounded-md border-none text-xs font-medium cursor-pointer capitalize transition-colors ${
                      filterCategory === 'all'
                        ? 'bg-tier-gold text-white'
                        : 'bg-transparent text-tier-text-secondary hover:bg-white/50'
                    }`}
                  >
                    Alle ({tests.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2 py-1 rounded-md border-none text-xs font-medium cursor-pointer capitalize transition-colors ${
                        filterCategory === cat
                          ? 'bg-tier-gold text-white'
                          : 'bg-transparent text-tier-text-secondary hover:bg-white/50'
                      }`}
                    >
                      {cat} ({testsByCategory[cat]?.length || 0})
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Test List */}
            <section className="mb-5">
              <SectionTitle className="m-0 mb-3">
                Testresultater ({filteredTests.length})
              </SectionTitle>

              <div className="flex flex-col gap-3">
                {filteredTests.map(test => (
                  <Card
                    key={test.id}
                    padding="md"
                    className="cursor-pointer transition-shadow duration-150 hover:shadow-md"
                    onClick={() => handleViewTestDetails(test.id)}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{test.icon}</span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-base font-semibold text-tier-navy overflow-hidden text-ellipsis whitespace-nowrap">
                            {test.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="accent" size="sm">{test.category}</Badge>
                            <span className="text-xs text-tier-text-tertiary">
                              Sist: {test.lastTestDate
                                ? new Date(test.lastTestDate).toLocaleDateString('no-NO', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className={`text-lg font-bold tabular-nums ${
                            test.meetsCurrent ? 'text-green-600' : 'text-amber-500'
                          }`}>
                            {test.currentValue}{test.unit}
                          </span>
                          <span className="text-xs text-tier-text-tertiary">
                            Krav: {test.lowerIsBetter ? '≤' : '≥'}{test.requirement}{test.unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {test.trend === 'improving' ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : test.trend === 'declining' ? (
                            <TrendingDown size={16} className="text-red-600" />
                          ) : null}
                          <ChevronRight size={16} className="text-tier-text-tertiary" />
                        </div>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="h-1 bg-tier-surface-subtle rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all duration-300 ${
                          test.meetsCurrent ? 'bg-green-500' : 'bg-tier-gold'
                        }`}
                        style={{
                          width: `${Math.min(100, test.lowerIsBetter
                            ? (test.requirement / test.currentValue) * 100
                            : (test.currentValue / test.requirement) * 100)}%`
                        }}
                      />
                    </div>
                  </Card>
                ))}

                {filteredTests.length === 0 && (
                  <StateCard
                    variant="empty"
                    icon={Target}
                    title="Ingen tester funnet"
                    description="Ingen tester matcher filteret"
                  />
                )}
              </div>
            </section>
          </>
        )}

        {subView === 'progression' && (
          <CategoryProgressionWidget onViewTestDetails={handleViewTestDetails} />
        )}

        {subView === 'compare' && (
          <TestComparisonWidget />
        )}

        {subView === 'velocity' && (
          <ImprovementVelocityWidget onViewTestDetails={handleViewTestDetails} />
        )}

        {subView === 'notes' && (
          <CoachNotesPanel onViewTestDetails={handleViewTestDetails} />
        )}
      </Suspense>
    </div>
  );
};

export default TestResultsContent;
