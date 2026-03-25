/**
 * ============================================================
 * ANALYSE SAMMENLIGNINGER HUB - Comparisons hub with 3 tabs
 * ============================================================
 *
 * This hub consolidates the following old pages:
 * - /utvikling/peer-sammenligning → Tab: Peer
 * - /utvikling/sammenlign-proff → Tab: Proff
 * - /utvikling/datagolf → Tab: Proff (same)
 * - /utvikling/sammenligninger → Tab: Multi-spiller
 *
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle } from '../../components/typography/Headings';

// Tab type
type SammenligningTab = 'peer' | 'proff' | 'multi';

// Tab components (placeholders - will use existing components in Phase 2)
function PeerComparisonTab() {
  return (
    <div className="space-y-6">
      {/* Peer Group Overview */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Your peer group</SubSectionTitle>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="text-sm text-tier-text-secondary mb-1">Your ranking</div>
            <div className="text-3xl font-bold text-tier-navy">#12</div>
            <div className="text-xs text-tier-text-secondary">of 45 players</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-tier-text-secondary mb-1">Average handicap</div>
            <div className="text-3xl font-bold text-tier-navy">13.2</div>
            <div className="text-xs text-tier-success">You: 12.4 ✓</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-tier-text-secondary mb-1">Peer group</div>
            <div className="text-3xl font-bold text-tier-navy">U18</div>
            <div className="text-xs text-tier-text-secondary">Elite</div>
          </div>
        </div>

        {/* Peer Group Selector */}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-tier-info text-white rounded-lg text-sm font-medium">
            U18 Elite
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            U18 All
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            Same academy
          </button>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Comparison with peer group</SubSectionTitle>
        <div className="h-96 bg-tier-surface-base rounded-lg flex items-center justify-center text-tier-text-secondary">
          [Peer comparison chart - shows you vs peer average]
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Category comparison</SubSectionTitle>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Putting</span>
              <span className="text-sm text-tier-success">+0.5 vs peer avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-tier-surface-base rounded-full h-2">
                <div className="bg-tier-success h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-xs text-tier-text-secondary">65th percentile</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Driving</span>
              <span className="text-sm text-tier-error">-0.3 vs peer avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-tier-surface-base rounded-full h-2">
                <div className="bg-tier-warning h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <span className="text-xs text-tier-text-secondary">42nd percentile</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Approach</span>
              <span className="text-sm text-tier-success">+0.8 vs peer avg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-tier-surface-base rounded-full h-2">
                <div className="bg-tier-success h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <span className="text-xs text-tier-text-secondary">78th percentile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProffComparisonTab() {
  return (
    <div className="space-y-6">
      {/* Tour Selection */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Select tour for comparison</SubSectionTitle>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-tier-info text-white rounded-lg text-sm font-medium">
            PGA Tour
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            European Tour
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            LPGA
          </button>
          <button className="px-4 py-2 bg-tier-surface-base text-tier-text-secondary rounded-lg text-sm font-medium hover:bg-tier-info-light">
            Korn Ferry
          </button>
        </div>
      </div>

      {/* Tour Average Comparison */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Comparison with PGA Tour average</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-tier-surface-base rounded-lg">
            <div className="text-sm text-tier-text-secondary mb-1">Driving Distance</div>
            <div className="text-2xl font-bold text-tier-navy mb-1">248 yds</div>
            <div className="text-xs text-tier-error">Tour avg: 295 yds (-47)</div>
          </div>

          <div className="text-center p-4 bg-tier-surface-base rounded-lg">
            <div className="text-sm text-tier-text-secondary mb-1">GIR %</div>
            <div className="text-2xl font-bold text-tier-navy mb-1">62%</div>
            <div className="text-xs text-tier-error">Tour avg: 68% (-6%)</div>
          </div>

          <div className="text-center p-4 bg-tier-surface-base rounded-lg">
            <div className="text-sm text-tier-text-secondary mb-1">Putts per GIR</div>
            <div className="text-2xl font-bold text-tier-navy mb-1">1.78</div>
            <div className="text-xs text-tier-success">Tour avg: 1.81 (+0.03)</div>
          </div>
        </div>

        <div className="h-64 bg-tier-surface-base rounded-lg flex items-center justify-center text-tier-text-secondary">
          [Radar chart - showing all stats vs tour average]
        </div>
      </div>

      {/* Search Specific Pro */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Compare with specific pro</SubSectionTitle>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for pro player..."
            className="w-full px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-info"
          />
        </div>
        <div className="text-sm text-tier-text-secondary">
          Search for a pro player to see detailed comparison (e.g. "Rory McIlroy", "Jon Rahm")
        </div>
      </div>
    </div>
  );
}

function MultiPlayerComparisonTab() {
  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Select players to compare</SubSectionTitle>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for players..."
            className="w-full px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-info"
          />
        </div>

        {/* Selected Players */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-tier-info-light border border-tier-info rounded-lg">
            <span className="text-sm font-medium text-tier-navy">You</span>
            <button className="text-tier-text-secondary hover:text-tier-error">✕</button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-tier-surface-base border border-tier-border-default rounded-lg">
            <span className="text-sm font-medium text-tier-navy">Magnus Olsen</span>
            <button className="text-tier-text-secondary hover:text-tier-error">✕</button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-tier-surface-base border border-tier-border-default rounded-lg">
            <span className="text-sm font-medium text-tier-navy">Emma Hansen</span>
            <button className="text-tier-text-secondary hover:text-tier-error">✕</button>
          </div>
          <button className="px-3 py-2 border-2 border-dashed border-tier-border-default rounded-lg text-tier-text-secondary hover:border-tier-info hover:text-tier-info transition-colors">
            + Add player
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6 overflow-x-auto">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Statistics comparison</SubSectionTitle>
        <table className="w-full">
          <thead>
            <tr className="border-b border-tier-border-default">
              <th className="text-left py-3 px-4 text-sm font-medium text-tier-text-secondary">Category</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-tier-navy">You</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-tier-text-secondary">Magnus Olsen</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-tier-text-secondary">Emma Hansen</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-tier-border-default">
              <td className="py-3 px-4 text-sm text-tier-navy">Handicap</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-success">12.4 [Best]</td>
              <td className="py-3 px-4 text-center text-sm text-tier-text-secondary">13.8</td>
              <td className="py-3 px-4 text-center text-sm text-tier-text-secondary">11.2</td>
            </tr>
            <tr className="border-b border-tier-border-default">
              <td className="py-3 px-4 text-sm text-tier-navy">Strokes Gained</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-navy">+2.4</td>
              <td className="py-3 px-4 text-center text-sm text-tier-text-secondary">+1.8</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-success">+3.1 [Best]</td>
            </tr>
            <tr className="border-b border-tier-border-default">
              <td className="py-3 px-4 text-sm text-tier-navy">GIR %</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-success">62% [Best]</td>
              <td className="py-3 px-4 text-center text-sm text-tier-text-secondary">58%</td>
              <td className="py-3 px-4 text-center text-sm text-tier-text-secondary">60%</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-sm text-tier-navy">Putts per round</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-navy">32.4</td>
              <td className="py-3 px-4 text-center text-sm text-tier-text-secondary">34.1</td>
              <td className="py-3 px-4 text-center text-sm font-medium text-tier-success">31.8 [Best]</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Visual Comparison Chart */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Visual comparison</SubSectionTitle>
        <div className="h-80 bg-tier-surface-base rounded-lg flex items-center justify-center text-tier-text-secondary">
          [Multi-player comparison chart - radar or bar chart]
        </div>
      </div>
    </div>
  );
}

export default function AnalyseSammenligningerHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as SammenligningTab | null;
  const [activeTab, setActiveTab] = useState<SammenligningTab>(tabParam || 'peer');

  // Update URL when tab changes
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: SammenligningTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs: { id: SammenligningTab; label: string; icon: string }[] = [
    { id: 'peer', label: 'Peer', icon: '' },
    { id: 'proff', label: 'Proff', icon: '' },
    { id: 'multi', label: 'Multi-player', icon: '' },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Comparisons"
          subtitle="Compare your performance with peer group, pro players and others"
          helpText=""
          actions={null}
        />

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-tier-border-default mb-6">
          <div className="flex border-b border-tier-border-default overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-tier-info border-b-2 border-tier-info bg-tier-info-light'
                    : 'text-tier-text-secondary hover:text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'peer' && <PeerComparisonTab />}
          {activeTab === 'proff' && <ProffComparisonTab />}
          {activeTab === 'multi' && <MultiPlayerComparisonTab />}
        </div>
      </div>
    </div>
  );
}
