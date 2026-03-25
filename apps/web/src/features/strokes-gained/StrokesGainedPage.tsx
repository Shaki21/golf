/**
 * Strokes Gained Page
 * Main page with full dashboard, history, and comparison views
 */

import React, { useState } from 'react';
import { TrendingUp, History, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StrokesGainedDashboardPro from './StrokesGainedDashboardPro';
import StrokesGainedHistory from './StrokesGainedHistory';
import StrokesGainedComparison from './StrokesGainedComparison';
import { PageTitle, SubSectionTitle, CardTitle } from '../../components/typography';

type TabType = 'overview' | 'history' | 'comparison';

const TABS = [
  { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
  { id: 'history' as TabType, label: 'History', icon: History },
  { id: 'comparison' as TabType, label: 'Comparison', icon: BarChart3 },
];

const StrokesGainedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user } = useAuth();

  const playerId = user?.playerId || user?.id;

  if (!playerId) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 text-center">
          <p className="text-tier-error">No user found. Please log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <PageTitle style={{ marginBottom: 0 }}>Strokes Gained Analytics</PageTitle>
          <p className="text-tier-text-secondary">
            Advanced statistical analysis of your playing performance
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-tier-border-default mb-6 p-2 flex gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-tier-navy text-white'
                    : 'text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <StrokesGainedDashboardPro playerId={playerId} />
          )}
          {activeTab === 'history' && (
            <StrokesGainedHistory playerId={playerId} />
          )}
          {activeTab === 'comparison' && (
            <StrokesGainedComparison playerId={playerId} />
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-white rounded-xl border border-tier-border-default">
          <SubSectionTitle style={{ marginBottom: '0.75rem' }}>💡 Om Strokes Gained</SubSectionTitle>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-tier-text-secondary">
            <div>
              <CardTitle style={{ marginBottom: '0.5rem' }}>What is Strokes Gained?</CardTitle>
              <p>
                Strokes Gained is an advanced statistic that measures how many strokes you gain or lose
                compared to a benchmark (e.g. tour average or your competitors).
              </p>
            </div>
            <div>
              <CardTitle style={{ marginBottom: '0.5rem' }}>How to interpret the numbers?</CardTitle>
              <p>
                Positive numbers (+0.5) mean you are better than the benchmark.
                Negative numbers (-0.3) indicate areas for improvement.
                The higher the positive number, the better the performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrokesGainedPage;
