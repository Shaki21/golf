/**
 * Player Insights Dashboard
 * SG Journey, Skill DNA, and Bounty Board
 */

import React, { useState } from 'react';
import { Mountain, Dna, Trophy } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { usePlayerInsights } from '../../hooks/usePlayerInsights';
import SGJourneyView from './components/SGJourneyView';
import SkillDNAView from './components/SkillDNAView';
import BountyBoardView from './components/BountyBoardView';

type Tab = 'sg-journey' | 'skill-dna' | 'bounty-board';

const PlayerInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sg-journey');
  const { data: insights, loading, error } = usePlayerInsights();

  const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'sg-journey',
      label: 'SG Journey',
      icon: <Mountain size={18} />,
      description: 'Din reise mot PGA Elite',
    },
    {
      id: 'skill-dna',
      label: 'Skill DNA',
      icon: <Dna size={18} />,
      description: 'Ditt unike ferdighetsprofil',
    },
    {
      id: 'bounty-board',
      label: 'Bounty Board',
      icon: <Trophy size={18} />,
      description: 'Gamifiserte utfordringer',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
            <p className="text-tier-text-secondary">Laster innsikter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="text-tier-error text-4xl mb-2">⚠️</div>
            <p className="text-tier-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Mountain size={28} className="text-tier-info" />
            <PageHeader title="Spillerinnsikter" subtitle="" helpText="" actions={null} className="mb-0" />
          </div>
          <p className="text-tier-text-secondary">
            Avansert analyse av din utvikling, ferdighetsprofil og gamifiserte utfordringer.
          </p>
        </div>

        {/* Quick Stats */}
        {insights?.quickStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-tier-border-default p-4">
              <div className="text-xs text-tier-text-secondary mb-1">Total SG</div>
              <div className="text-2xl font-bold text-tier-navy">
                {insights.quickStats.sgTotal >= 0 ? '+' : ''}
                {insights.quickStats.sgTotal.toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-tier-border-default p-4">
              <div className="text-xs text-tier-text-secondary mb-1">30-dagers trend</div>
              <div
                className={`text-2xl font-bold ${
                  insights.quickStats.sgTrend >= 0 ? 'text-tier-success' : 'text-tier-error'
                }`}
              >
                {insights.quickStats.sgTrend >= 0 ? '+' : ''}
                {insights.quickStats.sgTrend.toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-tier-border-default p-4">
              <div className="text-xs text-tier-text-secondary mb-1">Top styrke</div>
              <div className="text-sm font-semibold text-tier-navy truncate">
                {insights.quickStats.topStrength}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-tier-border-default p-4">
              <div className="text-xs text-tier-text-secondary mb-1">Svakhet</div>
              <div className="text-sm font-semibold text-tier-navy truncate">
                {insights.quickStats.topWeakness}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-tier-border-default p-4">
              <div className="text-xs text-tier-text-secondary mb-1">Aktive bounties</div>
              <div className="text-2xl font-bold text-tier-info">
                {insights.quickStats.activeBountyCount}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-tier-border-default mb-6">
          <div className="grid grid-cols-3 border-b border-tier-border-default">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-tier-info border-b-2 border-tier-info bg-tier-info-light'
                    : 'text-tier-text-secondary hover:text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
                <span className="text-xs text-tier-text-secondary hidden md:block">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'sg-journey' && <SGJourneyView data={insights?.sgJourney} />}
          {activeTab === 'skill-dna' && <SkillDNAView data={insights?.skillDNA} />}
          {activeTab === 'bounty-board' && <BountyBoardView data={insights?.bountyBoard} />}
        </div>
      </div>
    </div>
  );
};

export default PlayerInsightsPage;
