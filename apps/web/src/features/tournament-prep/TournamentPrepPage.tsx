/**
 * Tournament Preparation Page
 * Main page for tournament prep with tabs for strategy and checklist
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Map, CheckSquare } from 'lucide-react';
import { useTournamentPrep } from '../../hooks/useTournamentPrep';
import { PageHeader } from '../../components/layout/PageHeader';
import { TournamentPrepDashboard } from './TournamentPrepDashboard';
import { CourseStrategyBuilder } from './CourseStrategyBuilder';
import { PreTournamentChecklist } from './PreTournamentChecklist';
import { SectionTitle } from '../../components/typography';

type Tab = 'overview' | 'strategy' | 'checklist';

const TournamentPrepPage: React.FC = () => {
  const { prepId } = useParams<{ prepId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { selectedPrep, loading, error, fetchPreparation } = useTournamentPrep();

  // Load prep details on mount
  React.useEffect(() => {
    if (prepId) {
      fetchPreparation(prepId);
    }
  }, [prepId, fetchPreparation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-info mx-auto mb-4"></div>
          <p className="text-tier-text-secondary">Loading tournament preparation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-tier-border-default p-8 text-center">
          <div className="text-tier-error text-5xl mb-4">⚠️</div>
          <SectionTitle style={{ marginBottom: '8px' }}>Could not load</SectionTitle>
          <p className="text-tier-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Trophy size={18} /> },
    { id: 'strategy', label: 'Course Strategy', icon: <Map size={18} /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <PageHeader
          title={selectedPrep?.tournament?.name || 'Tournament Preparation'}
          subtitle={
            selectedPrep?.tournament
              ? `${new Date(selectedPrep.tournament.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}${selectedPrep.tournament.location ? ` • ${selectedPrep.tournament.location}` : ''}`
              : ''
          }
          helpText=""
          actions={null}
        />

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-tier-border-default mb-6">
          <div className="flex border-b border-tier-border-default">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-tier-info border-b-2 border-tier-info bg-tier-info-light'
                    : 'text-tier-text-secondary hover:text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && selectedPrep && (
            <TournamentPrepDashboard {...{ prep: selectedPrep } as any} />
          )}

          {activeTab === 'strategy' && selectedPrep && (
            <CourseStrategyBuilder
              {...{
                prepId: selectedPrep.id,
                courseStrategies: selectedPrep.courseStrategies || [],
              } as any}
            />
          )}

          {activeTab === 'checklist' && selectedPrep && (
            <PreTournamentChecklist
              {...{
                prepId: selectedPrep.id,
                checklistItems: selectedPrep.checklistItems || { items: [] },
                checklistProgress: selectedPrep.checklistProgress || 0,
              } as any}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentPrepPage;
