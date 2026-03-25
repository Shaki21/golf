/**
 * Bounty Board View
 * Gamified breaking point challenges with XP and rewards
 */

import React, { useState } from 'react';
import { Trophy, Target, Award, Clock, Zap, TrendingUp } from 'lucide-react';
import { useBountyBoard } from '../../../hooks/usePlayerInsights';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../../components/typography';

interface BountyBoardViewProps {
  data: any;
}

const BountyBoardView: React.FC<BountyBoardViewProps> = ({ data: initialData }) => {
  const { activateBounty, updateProgress } = useBountyBoard();
  const [selectedBounty, setSelectedBounty] = useState<any>(null);

  // Use prop data or fallback to empty
  const data = initialData || {
    activeBounties: [],
    availableBounties: [],
    completedBounties: [],
    totalCompleted: 0,
    totalXpEarned: 0,
    completionRate: 0,
    averageCompletionDays: 0,
    currentStreak: 0,
    hunterRank: null,
    bountiesToNextRank: 0,
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-tier-success border-tier-success bg-tier-success-light';
      case 'medium':
        return 'text-tier-info border-tier-info bg-tier-info-light';
      case 'hard':
        return 'text-tier-warning border-tier-warning bg-tier-warning-light';
      case 'legendary':
        return 'text-tier-error border-tier-error bg-tier-error-light';
      default:
        return 'text-tier-text-secondary border-tier-border-default bg-tier-surface-base';
    }
  };

  const handleActivate = async (bountyId: string) => {
    try {
      await activateBounty(bountyId);
      // Refresh will happen automatically via hook
    } catch (err) {
      console.error('Failed to activate bounty:', err);
    }
  };

  const BountyCard = ({ bounty, showActions = false }: { bounty: any; showActions?: boolean }) => (
    <div
      className={`rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer ${
        bounty.status === 'active'
          ? 'border-tier-info bg-tier-info-light'
          : bounty.status === 'completed'
          ? 'border-tier-success bg-tier-success-light'
          : 'border-tier-border-default bg-white'
      }`}
      onClick={() => setSelectedBounty(bounty)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <CardTitle style={{ marginBottom: '0.25rem' }}>{bounty.titleNo || bounty.title}</CardTitle>
          <p className="text-sm text-tier-text-secondary">
            {bounty.descriptionNo || bounty.description}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full border text-xs font-semibold ${getDifficultyColor(
            bounty.difficulty
          )}`}
        >
          {bounty.difficulty.toUpperCase()}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-tier-text-secondary">{bounty.metricLabel}</span>
          <span className="font-semibold text-tier-navy">
            {bounty.currentValue} / {bounty.targetValue} {bounty.unit}
          </span>
        </div>
        <div className="w-full h-3 bg-tier-surface-base rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-tier-info to-tier-success rounded-full transition-all"
            style={{ width: `${Math.min(100, bounty.progress)}%` }}
          />
        </div>
        <div className="text-xs text-tier-text-secondary mt-1 text-right">{bounty.progress}%</div>
      </div>

      {/* Rewards and Timing */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-tier-warning">
            <Trophy size={14} />
            <span className="font-semibold">{bounty.xpReward} XP</span>
          </div>
          {bounty.speedBonusDeadline && (
            <div className="flex items-center gap-1 text-tier-error">
              <Zap size={14} />
              <span className="text-xs">+{bounty.bonusXp} speed bonus</span>
            </div>
          )}
        </div>
        {bounty.estimatedDays && (
          <div className="flex items-center gap-1 text-tier-text-secondary">
            <Clock size={14} />
            <span className="text-xs">~{bounty.estimatedDays}d</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && bounty.status === 'available' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleActivate(bounty.id);
          }}
          className="mt-4 w-full px-4 py-2 bg-tier-info text-white rounded-lg hover:bg-tier-info-dark transition-all"
        >
          Aktiver Bounty
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hunter Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-tier-border-default p-4">
          <div className="text-xs text-tier-text-secondary mb-1">Hunter Rank</div>
          <div className="text-xl font-bold text-tier-info">
            {data.hunterRank?.nameNo || 'Novice'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-tier-border-default p-4">
          <div className="text-xs text-tier-text-secondary mb-1">Fullført</div>
          <div className="text-2xl font-bold text-tier-success">{data.totalCompleted}</div>
        </div>
        <div className="bg-white rounded-xl border border-tier-border-default p-4">
          <div className="text-xs text-tier-text-secondary mb-1">Total XP</div>
          <div className="text-2xl font-bold text-tier-warning">{data.totalXpEarned}</div>
        </div>
        <div className="bg-white rounded-xl border border-tier-border-default p-4">
          <div className="text-xs text-tier-text-secondary mb-1">Gjennomsnitt</div>
          <div className="text-2xl font-bold text-tier-navy">{data.averageCompletionDays}d</div>
        </div>
        <div className="bg-white rounded-xl border border-tier-border-default p-4">
          <div className="text-xs text-tier-text-secondary mb-1">Streak</div>
          <div className="text-2xl font-bold text-tier-error">{data.currentStreak}</div>
        </div>
      </div>

      {/* Rank Progress */}
      {data.hunterRank && data.bountiesToNextRank > 0 && (
        <div className="bg-gradient-to-r from-tier-warning-light to-tier-info-light rounded-xl border border-tier-warning p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award size={24} className="text-tier-warning" />
            <div>
              <div className="font-semibold text-tier-navy">
                {data.bountiesToNextRank} bounties til neste rank
              </div>
              <div className="text-sm text-tier-text-secondary">
                Nåværende: {data.hunterRank.nameNo}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Bounties */}
      <div>
        <SubSectionTitle className="flex items-center gap-2">
          <Target size={20} className="text-tier-info" />
          Aktive Bounties ({data.activeBounties?.length || 0})
        </SubSectionTitle>
        {data.activeBounties && data.activeBounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeBounties.map((bounty: any) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <Target size={48} className="mb-2 text-tier-text-secondary" />
            <p className="text-tier-text-secondary">Ingen aktive bounties</p>
          </div>
        )}
      </div>

      {/* Available Bounties */}
      <div>
        <SubSectionTitle className="flex items-center gap-2">
          <TrendingUp size={20} className="text-tier-success" />
          Tilgjengelige Bounties ({data.availableBounties?.length || 0})
        </SubSectionTitle>
        {data.availableBounties && data.availableBounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.availableBounties.map((bounty: any) => (
              <BountyCard key={bounty.id} bounty={bounty} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <TrendingUp size={48} className="mb-2 text-tier-success" />
            <p className="text-tier-text-secondary">Alle tilgjengelige bounties er aktivert!</p>
          </div>
        )}
      </div>

      {/* Completed Bounties */}
      {data.completedBounties && data.completedBounties.length > 0 && (
        <div>
          <SubSectionTitle className="flex items-center gap-2">
            <Trophy size={20} className="text-tier-success" />
            Fullførte Bounties ({data.completedBounties.length})
          </SubSectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.completedBounties.slice(0, 6).map((bounty: any) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
          {data.completedBounties.length > 6 && (
            <div className="text-center mt-4">
              <button className="text-sm text-tier-info hover:underline">
                Vis alle {data.completedBounties.length} fullførte bounties
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bounty Detail Modal Placeholder */}
      {selectedBounty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBounty(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SectionTitle>
              {selectedBounty.titleNo || selectedBounty.title}
            </SectionTitle>
            <p className="text-tier-text-secondary mb-6">
              {selectedBounty.descriptionNo || selectedBounty.description}
            </p>

            {selectedBounty.recommendedExercises && selectedBounty.recommendedExercises.length > 0 && (
              <div className="mb-6">
                <SubSectionTitle style={{ marginBottom: '0.75rem' }}>Anbefalte øvelser:</SubSectionTitle>
                <div className="space-y-2">
                  {selectedBounty.recommendedExercises.map((exercise: any, idx: number) => (
                    <div key={idx} className="bg-tier-surface-base rounded-lg p-3">
                      <div className="font-semibold text-tier-navy">{exercise.name}</div>
                      <div className="text-sm text-tier-text-secondary">{exercise.description}</div>
                      <div className="text-xs text-tier-info mt-1">{exercise.frequency}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedBounty(null)}
              className="w-full px-4 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy-dark transition-all"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BountyBoardView;
