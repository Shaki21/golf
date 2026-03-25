/**
 * Bounty Board Widget
 * Gamified breaking point challenges with rewards
 */

import React, { useState } from 'react';
import { Target, Zap, Trophy, Flame } from 'lucide-react';
import { DashboardCard, WidgetHeader } from '../../ui/widgets';
import Badge from '../../ui/primitives/Badge.primitive';
import { Button } from '../../ui/primitives';
import StateCard from '../../ui/composites/StateCard';
import { CardTitle } from '../typography';

// Difficulty colors and labels
const DIFFICULTY_CONFIG = {
  easy: { color: 'var(--success)', label: 'Enkel', icon: 'E' },
  medium: { color: 'var(--warning)', label: 'Middels', icon: 'M' },
  hard: { color: 'var(--error)', label: 'Vanskelig', icon: 'H' },
  legendary: { color: 'var(--rank-legendary)', label: 'Legendarisk', icon: 'L' },
};

// Hunter rank configuration - using semantic medal/rank tokens
const RANK_CONFIG = {
  rookie: { icon: 'R', color: 'var(--rank-rookie)' },
  bronze: { icon: 'B', color: 'var(--medal-bronze)' },
  silver: { icon: 'S', color: 'var(--medal-silver)' },
  gold: { icon: 'G', color: 'var(--medal-gold)' },
  platinum: { icon: 'P', color: 'var(--medal-platinum)' },
  legendary: { icon: 'L', color: 'var(--rank-legendary)' },
};

/**
 * Hunter Rank Display
 */
const HunterRankDisplay = ({ rank, totalCompleted, bountiesToNext }) => {
  const config = RANK_CONFIG[rank?.id] || RANK_CONFIG.rookie;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
      borderRadius: 'var(--radius-lg)',
      marginBottom: '16px',
      border: `1px solid ${config.color}30`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: `0 4px 12px ${config.color}40`,
        }}>
          {config.icon}
        </div>
        <div>
          <p style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            Din rank
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '2px 0 0 0',
          }}>
            {rank?.nameNo || 'Nybegynner'}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <p style={{
          fontSize: '24px',
          fontWeight: 700,
          color: config.color,
          margin: 0,
        }}>
          {totalCompleted}
        </p>
        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          bounties løst
        </p>
        {bountiesToNext > 0 && (
          <p style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            margin: '2px 0 0 0',
          }}>
            {bountiesToNext} til neste rank
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Single Bounty Card
 */
const BountyCard = ({ bounty, onActivate, onViewDetails, isActive }) => {
  const diffConfig = DIFFICULTY_CONFIG[bounty.difficulty] || DIFFICULTY_CONFIG.medium;

  const formatValue = (value, unit, isLower) => {
    if (isLower) return `${value}${unit}`;
    return `${value}${unit}`;
  };

  return (
    <div style={{
      padding: '16px',
      backgroundColor: isActive ? 'var(--bg-secondary)' : 'var(--bg-primary)',
      borderRadius: 'var(--radius-lg)',
      border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-default)',
      transition: 'all 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>{diffConfig.icon}</span>
            <Badge variant={bounty.difficulty === 'easy' ? 'success' : bounty.difficulty === 'hard' ? 'error' : 'warning'} size="sm">
              {diffConfig.label}
            </Badge>
            {bounty.speedBonusDeadline && new Date() < new Date(bounty.speedBonusDeadline) && (
              <Badge variant="accent" size="sm">
                <Zap size={10} style={{ marginRight: '2px' }} />
                Speed Bonus
              </Badge>
            )}
          </div>
          <CardTitle style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {bounty.titleNo || bounty.title}
          </CardTitle>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            margin: '4px 0 0 0',
          }}>
            {bounty.descriptionNo || bounty.description}
          </p>
        </div>

        {/* XP Reward */}
        <div style={{
          textAlign: 'right',
          padding: '8px 12px',
          backgroundColor: 'var(--achievement-muted)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--medal-gold)',
            margin: 0,
          }}>
            {bounty.xpReward}
          </p>
          <p style={{
            fontSize: '10px',
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            XP
          </p>
        </div>
      </div>

      {/* Progress section */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {bounty.metricLabel}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {formatValue(bounty.currentValue, bounty.unit, bounty.isLowerBetter)} → {formatValue(bounty.targetValue, bounty.unit, bounty.isLowerBetter)}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${bounty.progress || 0}%`,
            backgroundColor: bounty.progress >= 80 ? 'var(--success)' : 'var(--accent)',
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
        }}>
          <span>{Math.round(bounty.progress || 0)}% fullført</span>
          {bounty.estimatedDays && (
            <span>~{bounty.estimatedDays} dager estimert</span>
          )}
        </div>
      </div>

      {/* Recommended exercises (collapsed by default) */}
      {bounty.recommendedExercises && bounty.recommendedExercises.length > 0 && (
        <div style={{
          padding: '10px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '12px',
        }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '6px',
          }}>
            Anbefalt ovelse:
          </p>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {bounty.recommendedExercises[0].name} - {bounty.recommendedExercises[0].frequency}
          </p>
        </div>
      )}

      {/* Actions */}
      {bounty.status === 'available' && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onActivate?.(bounty.id)}
          style={{ width: '100%' }}
        >
          Start Bounty
        </Button>
      )}
    </div>
  );
};

/**
 * Completed Bounty Mini Card
 */
const CompletedBountyCard = ({ bounty }) => {
  const diffConfig = DIFFICULTY_CONFIG[bounty.difficulty] || DIFFICULTY_CONFIG.medium;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--success)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Trophy size={12} style={{ color: 'white' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {bounty.titleNo || bounty.title}
        </p>
        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          {bounty.completedAt ? new Date(bounty.completedAt).toLocaleDateString('nb-NO') : 'Nylig'}
        </p>
      </div>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--success)',
      }}>
        +{bounty.xpReward} XP
      </span>
    </div>
  );
};

/**
 * Stats Summary
 */
const StatsSummary = ({ stats }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginBottom: '16px',
    }}>
      <div style={{
        padding: '12px 8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--accent)',
          margin: 0,
        }}>
          {stats?.totalXpEarned || 0}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Total XP
        </p>
      </div>

      <div style={{
        padding: '12px 8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--success)',
          margin: 0,
        }}>
          {stats?.completionRate || 0}%
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Suksessrate
        </p>
      </div>

      <div style={{
        padding: '12px 8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--warning)',
          margin: 0,
        }}>
          {stats?.averageCompletionDays || 0}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Snitt dager
        </p>
      </div>

      <div style={{
        padding: '12px 8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Flame size={14} style={{ color: 'var(--error)' }} />
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--error)',
          }}>
            {stats?.currentStreak || 0}
          </span>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Serie
        </p>
      </div>
    </div>
  );
};

/**
 * Main Bounty Board Widget
 */
const BountyBoardWidget = ({ data, loading, error, onActivateBounty, onViewDetails }) => {
  const [activeTab, setActiveTab] = useState('active');

  if (loading) {
    return (
      <DashboardCard padding="lg">
        <WidgetHeader title="Bounty Board" icon={Target} />
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-default)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard padding="lg">
        <WidgetHeader title="Bounty Board" icon={Target} />
        <StateCard
          variant="error"
          title="Kunne ikke laste Bounty Board"
          description="Prøv igjen senere"
          compact
        />
      </DashboardCard>
    );
  }

  // Use demo data if no real data
  const boardData = data || getDemoData();

  const tabs = [
    { id: 'active', label: 'Aktive', count: boardData.activeBounties?.length || 0 },
    { id: 'available', label: 'Tilgjengelige', count: boardData.availableBounties?.length || 0 },
    { id: 'completed', label: 'Fullført', count: boardData.completedBounties?.length || 0 },
  ];

  const currentBounties = activeTab === 'active'
    ? boardData.activeBounties
    : activeTab === 'available'
      ? boardData.availableBounties
      : boardData.completedBounties;

  return (
    <DashboardCard padding="lg">
      <WidgetHeader
        title="Bounty Board"
        icon={Target}
        action={onViewDetails}
        actionLabel="Se alle"
      />

      {/* Demo indicator */}
      {!data && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--accent)',
        }}>
          <Target size={14} />
          <span>Eksempeldata – legg til breaking points for å se dine bounties</span>
        </div>
      )}

      {/* Hunter Rank */}
      <HunterRankDisplay
        rank={boardData.hunterRank}
        totalCompleted={boardData.totalCompleted || 0}
        bountiesToNext={boardData.bountiesToNextRank || 0}
      />

      {/* Stats Summary */}
      <StatsSummary stats={boardData} />

      {/* Tab navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
            <span style={{
              padding: '2px 6px',
              fontSize: '11px',
              backgroundColor: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              borderRadius: '10px',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bounty list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentBounties && currentBounties.length > 0 ? (
          activeTab === 'completed' ? (
            currentBounties.slice(0, 5).map(bounty => (
              <CompletedBountyCard key={bounty.id} bounty={bounty} />
            ))
          ) : (
            currentBounties.slice(0, 3).map(bounty => (
              <BountyCard
                key={bounty.id}
                bounty={bounty}
                isActive={activeTab === 'active'}
                onActivate={onActivateBounty}
                onViewDetails={onViewDetails}
              />
            ))
          )
        ) : (
          <StateCard
            variant="empty"
            title={activeTab === 'active' ? 'Ingen aktive bounties' : activeTab === 'available' ? 'Ingen tilgjengelige bounties' : 'Ingen fullførte bounties ennå'}
            description={activeTab === 'active' ? 'Start en bounty fra tilgjengelige utfordringer' : activeTab === 'available' ? 'Fullfør tester for å generere nye utfordringer' : 'Fullfør din første bounty for å se den her'}
            compact
          />
        )}
      </div>
    </DashboardCard>
  );
};

/**
 * Demo data for when no real data exists
 */
function getDemoData() {
  return {
    hunterRank: { id: 'silver', name: 'Silver Hunter', nameNo: 'Sølv-jeger', minBounties: 15 },
    totalCompleted: 18,
    totalXpEarned: 4250,
    completionRate: 75,
    averageCompletionDays: 21,
    currentStreak: 3,
    bountiesToNextRank: 12,
    activeBounties: [
      {
        id: 'bounty_1',
        title: 'Approach Precision 75m',
        titleNo: '75m Presisjon',
        description: 'Improve your 75m approach shots',
        descriptionNo: 'Forbedre dine 75m approach-slag',
        metricLabel: 'PEI 75m',
        baselineValue: 24,
        targetValue: 18,
        currentValue: 19.5,
        unit: '%',
        isLowerBetter: true,
        progress: 75,
        status: 'active',
        category: 'approach',
        difficulty: 'medium',
        xpReward: 300,
        estimatedDays: 28,
        speedBonusDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        recommendedExercises: [
          { id: 'ex1', name: '75m Targets', description: 'Sikt på forskjellige mål', frequency: '30 baller/dag' },
        ],
      },
    ],
    availableBounties: [
      {
        id: 'bounty_2',
        title: '3-Putt Eliminator',
        titleNo: '3-Putt Eliminator',
        description: 'Reduce three-putt percentage',
        descriptionNo: 'Reduser tre-putt prosent',
        metricLabel: '3-putt rate',
        baselineValue: 12,
        targetValue: 8,
        currentValue: 12,
        unit: '%',
        isLowerBetter: true,
        progress: 0,
        status: 'available',
        category: 'putting',
        difficulty: 'easy',
        xpReward: 150,
        estimatedDays: 14,
        recommendedExercises: [
          { id: 'ex1', name: 'Lag Zone', description: 'Alle førsteputt innen 1m', frequency: '20 langputt/dag' },
        ],
      },
      {
        id: 'bounty_3',
        title: 'Driver Accuracy',
        titleNo: 'Driver Presisjon',
        description: 'Improve driving accuracy',
        descriptionNo: 'Forbedre driver-presisjon',
        metricLabel: 'Fairway %',
        baselineValue: 45,
        targetValue: 60,
        currentValue: 45,
        unit: '%',
        isLowerBetter: false,
        progress: 0,
        status: 'available',
        category: 'driving',
        difficulty: 'hard',
        xpReward: 500,
        estimatedDays: 42,
        recommendedExercises: [
          { id: 'ex1', name: 'Corridor Drill', description: 'Sikt på 30m bred korridor', frequency: '20 drives/dag' },
        ],
      },
    ],
    completedBounties: [
      {
        id: 'bounty_c1',
        title: 'Bunker Escape',
        titleNo: 'Bunker-flukt',
        difficulty: 'medium',
        xpReward: 350,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'bounty_c2',
        title: 'Putting 6m',
        titleNo: '6m Putting',
        difficulty: 'easy',
        xpReward: 250,
        completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ],
  };
}

export default BountyBoardWidget;
