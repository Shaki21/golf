import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Activity, Trophy } from 'lucide-react';
import AppShellTemplate from '../../ui/templates/AppShellTemplate';
import StateCard from '../../ui/composites/StateCard';

// Lazy load the content components for better performance
// Note: coach-athlete-list uses Container pattern (handles its own data)
const CoachAthleteListContent = lazy(
  () => import('../coach-athlete-list/CoachAthleteListContainer')
);
const CoachAthleteStatusContent = lazy(
  () => import('../coach-athlete-status/CoachAthleteStatus')
);
const CoachAthleteTournamentsContent = lazy(
  () => import('../coach-athlete-tournaments/CoachAthleteTournaments')
);

/**
 * CoachAthleteHub - Unified coach athlete management with tab navigation
 *
 * Tabs:
 * 1. Athletes - List of all athletes
 * 2. Status - Health and training status dashboard
 * 3. Tournaments - Tournament participation overview
 */

type TabId = 'utovere' | 'status' | 'turneringer';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'utovere',
    label: 'Athletes',
    icon: Users,
    description: 'All your athletes',
  },
  {
    id: 'status',
    label: 'Status',
    icon: Activity,
    description: 'Health and training',
  },
  {
    id: 'turneringer',
    label: 'Tournaments',
    icon: Trophy,
    description: 'Tournament overview',
  },
];

const CoachAthleteHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tab from URL or default to 'utovere'
  const tabFromUrl = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabFromUrl && TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'utovere'
  );

  // Sync URL with active tab
  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, tabFromUrl, setSearchParams]);

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  const renderTabContent = () => {
    const fallback = (
      <StateCard variant="loading" title="Loading content..." description="Please wait" />
    );

    switch (activeTab) {
      case 'utovere':
        return (
          <Suspense fallback={fallback}>
            <CoachAthleteListContent />
          </Suspense>
        );
      case 'status':
        return (
          <Suspense fallback={fallback}>
            <CoachAthleteStatusContent />
          </Suspense>
        );
      case 'turneringer':
        return (
          <Suspense fallback={fallback}>
            <CoachAthleteTournamentsContent />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <AppShellTemplate
      title="Athletes"
      subtitle={activeTabConfig?.description || 'Manage your athletes'}
    >
      <div id="coach-athletes-export">
        {/* Tab Navigation */}
        <div className="relative mb-4">
          <div
            className="flex gap-1 overflow-x-auto pb-2 border-b border-tier-border-subtle scrollbar-hide"
            role="tablist"
            aria-label="Athlete categories"
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
                  className={`relative flex items-center gap-2 px-4 py-3 bg-transparent border-none rounded-t-lg cursor-pointer transition-all whitespace-nowrap text-[11px] font-medium ${
                    isActive
                      ? 'text-tier-navy font-semibold bg-tier-surface-subtle'
                      : 'text-tier-text-tertiary'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-150 ${
                      isActive ? 'text-tier-gold' : 'text-tier-text-tertiary'
                    }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-px left-4 right-4 h-0.5 bg-tier-gold rounded-t-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile scroll hint */}
          <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-r from-transparent to-white pointer-events-none" />
        </div>

        {/* Tab Content */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="min-h-[400px]"
        >
          {renderTabContent()}
        </div>
      </div>
    </AppShellTemplate>
  );
};

export default CoachAthleteHub;
