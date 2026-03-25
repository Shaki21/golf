/**
 * ============================================================
 * ANALYSE PRESTASJONER HUB - Achievements hub with 2 tabs
 * ============================================================
 *
 * This hub consolidates:
 * - /utvikling/badges → Tab: Merker
 * - /utvikling/achievements → Tab: Achievements
 *
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle, CardTitle } from '../../components/typography/Headings';

// Tab type
type PrestasjonsTab = 'badges' | 'achievements';

// Tab components
function BadgesTab() {
  return (
    <div className="space-y-6">
      {/* Badge Summary */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-navy mb-1">24</div>
            <div className="text-sm text-tier-text-secondary">Opptjente merker</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-info mb-1">50</div>
            <div className="text-sm text-tier-text-secondary">Totalt tilgjengelig</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-warning mb-1">8</div>
            <div className="text-sm text-tier-text-secondary">Nesten oppnådd</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-success mb-1">48%</div>
            <div className="text-sm text-tier-text-secondary">Ferdigstillelse</div>
          </div>
        </div>
      </div>

      {/* Badge Categories */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Kategori-merker</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Putting Badges */}
          <div className="p-4 border border-tier-border-default rounded-lg">
            <CardTitle style={{ marginBottom: 0 }} className="text-sm font-semibold text-tier-navy mb-3">Putting</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-tier-success-light rounded-lg">
                <span className="text-2xl">[Gold]</span>
                <div>
                  <div className="text-xs font-medium text-tier-navy">Putting Master</div>
                  <div className="text-xs text-tier-text-secondary">Alle P1-P5 tests</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-tier-success-light rounded-lg">
                <span className="text-2xl">[Silver]</span>
                <div>
                  <div className="text-xs font-medium text-tier-navy">Putting Expert</div>
                  <div className="text-xs text-tier-text-secondary">P1-P3 tests</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-tier-surface-base rounded-lg opacity-50">
                <span className="text-2xl grayscale">[Bronze]</span>
                <div>
                  <div className="text-xs font-medium text-tier-text-secondary">Putting Pro</div>
                  <div className="text-xs text-tier-text-secondary">P1-P2 tests</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chipping Badges */}
          <div className="p-4 border border-tier-border-default rounded-lg">
            <CardTitle style={{ marginBottom: 0 }} className="text-sm font-semibold text-tier-navy mb-3">Chipping</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-tier-surface-base rounded-lg opacity-50">
                <span className="text-2xl grayscale">[Gold]</span>
                <div>
                  <div className="text-xs font-medium text-tier-text-secondary">Chipping Master</div>
                  <div className="text-xs text-tier-text-secondary">Alle CH1-CH5 tests</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-tier-warning-light rounded-lg border border-tier-warning">
                <span className="text-2xl">[Silver]</span>
                <div>
                  <div className="text-xs font-medium text-tier-navy">Chipping Expert</div>
                  <div className="text-xs text-tier-warning font-medium">1 test mangler!</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-tier-success-light rounded-lg">
                <span className="text-2xl">[Bronze]</span>
                <div>
                  <div className="text-xs font-medium text-tier-navy">Chipping Pro</div>
                  <div className="text-xs text-tier-text-secondary">CH1-CH2 tests</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pitching Badges */}
          <div className="p-4 border border-tier-border-default rounded-lg">
            <CardTitle style={{ marginBottom: 0 }} className="text-sm font-semibold text-tier-navy mb-3">Pitching</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-tier-surface-base rounded-lg opacity-50">
                <span className="text-2xl grayscale">[Gold]</span>
                <div>
                  <div className="text-xs font-medium text-tier-text-secondary">Pitching Master</div>
                  <div className="text-xs text-tier-text-secondary">Alle PI1-PI5 tests</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-tier-surface-base rounded-lg opacity-50">
                <span className="text-2xl grayscale">[Silver]</span>
                <div>
                  <div className="text-xs font-medium text-tier-text-secondary">Pitching Expert</div>
                  <div className="text-xs text-tier-text-secondary">PI1-PI3 tests</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-tier-surface-base rounded-lg opacity-50">
                <span className="text-2xl grayscale">[Bronze]</span>
                <div>
                  <div className="text-xs font-medium text-tier-text-secondary">Pitching Pro</div>
                  <div className="text-xs text-tier-text-secondary">PI1-PI2 tests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Earned */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Nylig opptjent</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-tier-success-light border border-tier-success rounded-lg">
            <span className="text-4xl">[Gold]</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-tier-navy">Putting Master</div>
              <div className="text-xs text-tier-text-secondary mb-2">Bestått alle P1-P5 tester</div>
              <div className="text-xs text-tier-text-secondary">Opptjent: 2 dager siden</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-tier-success-light border border-tier-success rounded-lg">
            <span className="text-4xl">[Silver]</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-tier-navy">Chipping Pro</div>
              <div className="text-xs text-tier-text-secondary mb-2">Bestått CH1-CH2 tester</div>
              <div className="text-xs text-tier-text-secondary">Opptjent: 1 uke siden</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Towards Next Badges */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Fremgang mot neste merker</SubSectionTitle>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">[Silver]</span>
                <div>
                  <div className="text-sm font-medium text-tier-navy">Chipping Expert</div>
                  <div className="text-xs text-tier-text-secondary">CH1-CH3 tests</div>
                </div>
              </div>
              <span className="text-sm text-tier-warning font-medium">2/3</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-warning h-2 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">[Bronze]</span>
                <div>
                  <div className="text-sm font-medium text-tier-navy">Full Swing Pro</div>
                  <div className="text-xs text-tier-text-secondary">F1-F2 tests</div>
                </div>
              </div>
              <span className="text-sm text-tier-error font-medium">1/2</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-error h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementsTab() {
  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-navy mb-1">18</div>
            <div className="text-sm text-tier-text-secondary">Achievements låst opp</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-warning mb-1">42</div>
            <div className="text-sm text-tier-text-secondary">Totalt tilgjengelig</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-tier-info mb-1">1250</div>
            <div className="text-sm text-tier-text-secondary">Totale poeng</div>
          </div>
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Achievement kategorier</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skill Achievements */}
          <div>
            <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Ferdigheter</CardTitle>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-tier-success-light border border-tier-success rounded-lg">
                <span className="text-3xl">[Target]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">Perfect Putter</div>
                  <div className="text-xs text-tier-text-secondary">100% accuracy på P1 test</div>
                  <div className="text-xs text-tier-success font-medium mt-1">+50 poeng</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-success-light border border-tier-success rounded-lg">
                <span className="text-3xl">[Golf]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">Chip Champion</div>
                  <div className="text-xs text-tier-text-secondary">Bestå 5 chipping tester på rad</div>
                  <div className="text-xs text-tier-success font-medium mt-1">+75 poeng</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg opacity-50">
                <span className="text-3xl grayscale">[Golfer]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-text-secondary">Swing Master</div>
                  <div className="text-xs text-tier-text-secondary">Bestå alle full swing tester</div>
                  <div className="text-xs text-tier-text-secondary mt-1">100 poeng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Achievements */}
          <div>
            <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Fremgang</CardTitle>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-tier-success-light border border-tier-success rounded-lg">
                <span className="text-3xl">[Rocket]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">Fast Learner</div>
                  <div className="text-xs text-tier-text-secondary">Forbedre handicap med 2.0 på 1 måned</div>
                  <div className="text-xs text-tier-success font-medium mt-1">+100 poeng</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-warning-light border border-tier-warning rounded-lg">
                <span className="text-3xl">[Timer]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">Dedicated</div>
                  <div className="text-xs text-tier-text-secondary">Tren 20 økter på 1 måned</div>
                  <div className="text-xs text-tier-warning font-medium mt-1">18/20 økter</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg opacity-50">
                <span className="text-3xl grayscale">[Fire]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-text-secondary">On Fire</div>
                  <div className="text-xs text-tier-text-secondary">10 dager treningsstreak</div>
                  <div className="text-xs text-tier-text-secondary mt-1">75 poeng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Achievements */}
          <div>
            <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Konkurranser</CardTitle>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-tier-success-light border border-tier-success rounded-lg">
                <span className="text-3xl">[Trophy]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">Tournament Rookie</div>
                  <div className="text-xs text-tier-text-secondary">Spill din første turnering</div>
                  <div className="text-xs text-tier-success font-medium mt-1">+25 poeng</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg opacity-50">
                <span className="text-3xl grayscale">[Gold]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-text-secondary">Podium Finish</div>
                  <div className="text-xs text-tier-text-secondary">Topp 3 finish i turnering</div>
                  <div className="text-xs text-tier-text-secondary mt-1">150 poeng</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg opacity-50">
                <span className="text-3xl grayscale">[Crown]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-text-secondary">Champion</div>
                  <div className="text-xs text-tier-text-secondary">Vinn en turnering</div>
                  <div className="text-xs text-tier-text-secondary mt-1">200 poeng</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Achievements */}
          <div>
            <CardTitle style={{ marginBottom: 0 }} className="text-md font-semibold text-tier-navy mb-3">Sosialt</CardTitle>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-tier-success-light border border-tier-success rounded-lg">
                <span className="text-3xl">[Handshake]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">Team Player</div>
                  <div className="text-xs text-tier-text-secondary">Delta på en treningssamling</div>
                  <div className="text-xs text-tier-success font-medium mt-1">+30 poeng</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-tier-surface-base border border-tier-border-default rounded-lg opacity-50">
                <span className="text-3xl grayscale">[Chat]</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-text-secondary">Helpful</div>
                  <div className="text-xs text-tier-text-secondary">Gi tips til 5 andre spillere</div>
                  <div className="text-xs text-tier-text-secondary mt-1">50 poeng</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Nylig låst opp</SubSectionTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-tier-success-light border border-tier-success rounded-lg">
            <span className="text-4xl">[Target]</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-tier-navy">Perfect Putter</div>
              <div className="text-xs text-tier-text-secondary">100% accuracy på P1 test</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-tier-success">+50</div>
              <div className="text-xs text-tier-text-secondary">2 dager siden</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-tier-success-light border border-tier-success rounded-lg">
            <span className="text-4xl">[Rocket]</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-tier-navy">Fast Learner</div>
              <div className="text-xs text-tier-text-secondary">Forbedre handicap med 2.0 på 1 måned</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-tier-success">+100</div>
              <div className="text-xs text-tier-text-secondary">1 uke siden</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysePrestasjoner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as PrestasjonsTab | null;
  const [activeTab, setActiveTab] = useState<PrestasjonsTab>(tabParam || 'badges');

  // Update URL when tab changes
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: PrestasjonsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs: { id: PrestasjonsTab; label: string; icon: string }[] = [
    { id: 'badges', label: 'Merker', icon: '' },
    { id: 'achievements', label: 'Achievements', icon: '' },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Prestasjoner"
          subtitle="Dine merker, achievements og milepæler"
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
          {activeTab === 'badges' && <BadgesTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
        </div>
      </div>
    </div>
  );
}
