/**
 * BenchmarkContent Component
 * Design System v3.1 - Tailwind CSS
 *
 * Embedded content component for StatistikkHub benchmark tab.
 * Compares player performance against PGA Tour and WAGR benchmarks.
 */

import React from 'react';
import {
  Trophy,
  Target,
  Crosshair,
  Flag,
  CircleDot,
  Zap,
  Globe,
  Star,
  Users,
} from 'lucide-react';
import { useProBenchmark, ApproachSkillData } from '../../hooks/useProBenchmark';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { useAuth } from '../../contexts/AuthContext';
import PeerComparisonWidget from '../../components/widgets/PeerComparisonWidget';
import ProPlayerComparison from '../../components/widgets/ProPlayerComparison';
import { useNorwegianProPlayers } from '../../hooks/useProPlayerSearch';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatSG(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
}

function getSGColorClass(value: number): string {
  if (value >= 0.5) return 'text-green-600';
  if (value >= 0) return 'text-tier-navy';
  if (value >= -0.5) return 'text-amber-600';
  return 'text-red-600';
}

// =============================================================================
// HERO CARD
// =============================================================================

interface HeroCardProps {
  sgTotal: number;
  eliteTotal: number;
  getGapToElite: (category: 'total' | 'approach' | 'putting' | 'aroundGreen') => {
    gap: number;
    playerValue: number;
    eliteValue: number;
  } | null;
}

function HeroCard({ sgTotal, eliteTotal, getGapToElite }: HeroCardProps) {
  const gap = getGapToElite('total');
  const progressPercent = Math.round(
    Math.max(0, Math.min(100, ((sgTotal || 0) + 1) / (eliteTotal + 1) * 100))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-tier-navy to-tier-navy-dark flex items-center justify-center shadow-lg">
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-tier-navy">Your Position</h2>
          <p className="text-tier-text-secondary">How you compare to the best</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-stretch gap-6 mb-5">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-medium text-tier-text-tertiary uppercase tracking-wide">
            Total SG
          </span>
          <span className={`text-5xl font-bold tabular-nums ${getSGColorClass(sgTotal)}`}>
            {formatSG(sgTotal)}
          </span>
          <span className="text-sm text-tier-text-tertiary">per round</span>
        </div>

        <div className="flex flex-col gap-3 ml-auto">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-tier-text-tertiary">Gap to Top 10</span>
            <span className={`text-lg font-semibold tabular-nums ${
              (gap?.gap || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {gap ? formatSG(gap.gap) : '-'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-tier-text-tertiary">PGA Elite</span>
            <span className="text-lg font-semibold tabular-nums text-green-600">
              {formatSG(eliteTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm text-tier-text-secondary">
          <span>Your progression to elite level</span>
          <span className="font-semibold text-tier-navy">{progressPercent}%</span>
        </div>
        <div className="relative h-3 bg-tier-surface-secondary rounded-full overflow-visible">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-tier-navy to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
          <div className="absolute top-[-4px] w-1 h-5 bg-tier-text-tertiary rounded-sm" style={{ left: '40%' }} />
          <div className="absolute top-[-4px] w-1 h-5 bg-amber-500 rounded-sm" style={{ left: '70%' }} />
          <div className="absolute top-[-4px] w-1 h-5 bg-green-500 rounded-sm" style={{ left: '100%' }} />
        </div>
        <div className="flex justify-between text-[10px] text-tier-text-tertiary mt-1">
          <span>Scratch</span>
          <span>Tour Avg</span>
          <span>Top 50</span>
          <span>Top 10</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORY COMPARISON CARD
// =============================================================================

interface CategoryComparisonProps {
  getGapToElite: (category: 'total' | 'approach' | 'putting' | 'aroundGreen') => {
    gap: number;
    playerValue: number;
    eliteValue: number;
  } | null;
}

function CategoryComparison({ getGapToElite }: CategoryComparisonProps) {
  const categories = [
    { key: 'approach' as const, label: 'Approach', icon: Crosshair, desc: 'Shots to green' },
    { key: 'putting' as const, label: 'Putting', icon: CircleDot, desc: 'Shots on green' },
    { key: 'aroundGreen' as const, label: 'Short Game', icon: Flag, desc: 'Around green' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const gap = getGapToElite(cat.key);
        const Icon = cat.icon;
        const progressWidth = Math.max(5, Math.min(100, ((gap?.playerValue || 0) + 0.5) / ((gap?.eliteValue || 0.8) + 0.5) * 100));

        return (
          <div key={cat.key} className="bg-white rounded-xl shadow-sm border border-tier-border-default p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
                <Icon size={20} className="text-tier-navy" />
              </div>
              <div>
                <h4 className="font-semibold text-tier-navy">{cat.label}</h4>
                <span className="text-xs text-tier-text-tertiary">{cat.desc}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between p-3 bg-tier-surface-subtle rounded-lg mb-3">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-tier-text-tertiary uppercase tracking-wide">You</span>
                <span className={`text-lg font-bold tabular-nums ${getSGColorClass(gap?.playerValue || 0)}`}>
                  {formatSG(gap?.playerValue)}
                </span>
              </div>
              <div className="w-px h-8 bg-tier-border-subtle" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-tier-text-tertiary uppercase tracking-wide">Elite</span>
                <span className="text-lg font-bold tabular-nums text-green-600">
                  {formatSG(gap?.eliteValue)}
                </span>
              </div>
              <div className="w-px h-8 bg-tier-border-subtle" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-tier-text-tertiary uppercase tracking-wide">Gap</span>
                <span className={`text-lg font-bold tabular-nums ${
                  (gap?.gap || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatSG(gap?.gap)}
                </span>
              </div>
            </div>

            {/* Mini Progress */}
            <div className="h-1 bg-tier-surface-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (gap?.playerValue || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// APPROACH DISTANCE CARD
// =============================================================================

interface ApproachDistanceCardProps {
  skill: ApproachSkillData;
  index: number;
}

function ApproachDistanceCard({ skill, index }: ApproachDistanceCardProps) {
  const gradients = [
    'from-green-600 to-green-500',
    'from-blue-600 to-blue-500',
    'from-tier-navy to-tier-navy-dark',
    'from-amber-600 to-amber-500',
  ];

  return (
    <div className="rounded-lg border border-tier-border-subtle overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${gradients[index % 4]} text-white`}>
        <Target size={18} />
        <span className="text-sm font-semibold">{skill.distance}</span>
      </div>
      <div className="p-2 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-green-600 w-12">Fairway</span>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-tier-navy tabular-nums">
                {skill.fairway.sgPerShot >= 0 ? '+' : ''}{skill.fairway.sgPerShot.toFixed(2)}
              </span>
              <span className="text-[10px] text-tier-text-tertiary">SG</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-tier-navy tabular-nums">
                {Math.round(skill.fairway.greenHitRate * 100)}%
              </span>
              <span className="text-[10px] text-tier-text-tertiary">GIR</span>
            </div>
          </div>
        </div>
        <div className="h-px bg-tier-border-subtle" />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-amber-600 w-12">Rough</span>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-tier-navy tabular-nums">
                {skill.rough.sgPerShot >= 0 ? '+' : ''}{skill.rough.sgPerShot.toFixed(2)}
              </span>
              <span className="text-[10px] text-tier-text-tertiary">SG</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-tier-navy tabular-nums">
                {Math.round(skill.rough.greenHitRate * 100)}%
              </span>
              <span className="text-[10px] text-tier-text-tertiary">GIR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOP PLAYERS LIST
// =============================================================================

interface TopPlayersListProps {
  players: Array<{
    name: string;
    sgTotal: number;
    eventsPlayed: number;
    wins: number;
  }>;
}

function TopPlayersList({ players }: TopPlayersListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="divide-y divide-tier-border-subtle">
        {players.map((player, index) => (
          <div key={player.name} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-tier-surface-subtle flex items-center justify-center">
              {index === 0 ? (
                <Trophy size={16} className="text-tier-gold" />
              ) : (
                <span className="text-sm font-semibold text-tier-text-secondary">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-tier-navy">{player.name}</span>
              <span className="text-[10px] text-tier-text-tertiary">
                {player.eventsPlayed} tournaments, {player.wins} wins
              </span>
            </div>
            <span className={`text-base font-bold tabular-nums ${getSGColorClass(player.sgTotal)}`}>
              {formatSG(player.sgTotal)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// WAGR RANKINGS
// =============================================================================

interface WAGRRankingsProps {
  rankings: {
    men: Array<{ name: string; country: string; rank: number; pointsAvg: number }>;
    women: Array<{ name: string; country: string; rank: number; pointsAvg: number }>;
  };
}

function WAGRRankings({ rankings }: WAGRRankingsProps) {
  const RankingCard = ({ title, players }: { title: string; players: typeof rankings.men }) => (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default p-4">
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-tier-border-subtle">
        <Users size={18} className="text-tier-navy" />
        <h4 className="font-semibold text-tier-navy">{title}</h4>
      </div>
      <div className="space-y-2">
        {players.map((player, index) => (
          <div key={player.name} className="flex items-center gap-3 p-1">
            <div className="w-5 flex justify-center">
              {index === 0 ? (
                <Star size={14} className="text-tier-gold fill-tier-gold" />
              ) : (
                <span className="text-xs font-semibold text-tier-text-secondary">{player.rank}</span>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-xs font-medium text-tier-navy">{player.name}</span>
              <span className="text-[10px] text-tier-text-tertiary">{player.country}</span>
            </div>
            <span className="text-xs font-semibold text-tier-navy tabular-nums">
              {player.pointsAvg.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RankingCard title="Men" players={rankings.men} />
      <RankingCard title="Women" players={rankings.women} />
    </div>
  );
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 bg-tier-surface-secondary rounded-xl" />
      <div className="h-32 bg-tier-surface-secondary rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-40 bg-tier-surface-secondary rounded-xl" />
        <div className="h-40 bg-tier-surface-secondary rounded-xl" />
        <div className="h-40 bg-tier-surface-secondary rounded-xl" />
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-600 font-medium">Could not load data</p>
      <p className="text-sm text-red-500 mt-1">{message}</p>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const BenchmarkContent: React.FC = () => {
  const { eliteBenchmarks, topPlayers, approachSkills, wagrRankings, loading, error } = useProBenchmark();
  const { data: sgData } = useStrokesGained();
  const { user } = useAuth();
  const { players: norwegianPlayers } = useNorwegianProPlayers();

  const getGapToElite = (category: 'total' | 'approach' | 'putting' | 'aroundGreen') => {
    if (!sgData?.byCategory || !eliteBenchmarks) return null;

    const categoryMap: Record<string, keyof typeof eliteBenchmarks.top10> = {
      total: 'total',
      approach: 'approach',
      putting: 'putting',
      aroundGreen: 'aroundGreen',
    };

    const eliteValue = eliteBenchmarks.top10[categoryMap[category]];
    let playerValue = 0;

    if (category === 'total') {
      playerValue = sgData.total || 0;
    } else {
      const catKey = category === 'aroundGreen' ? 'around_green' : category;
      playerValue = sgData.byCategory[catKey]?.value || 0;
    }

    return {
      gap: playerValue - eliteValue,
      playerValue,
      eliteValue,
    };
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Your Current Position */}
      <section>
        <HeroCard
          sgTotal={sgData?.total || 0}
          eliteTotal={eliteBenchmarks?.top10.total || 2.5}
          getGapToElite={getGapToElite}
        />
      </section>

      {/* Pro Player Comparison */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
            Compare with Pro
          </h3>
          <span className="px-2 py-0.5 bg-tier-gold/10 text-tier-gold text-xs font-medium rounded">
            New
          </span>
        </div>
        <ProPlayerComparison suggestedPlayers={norwegianPlayers} />
      </section>

      {/* Peer Comparison */}
      <section>
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide mb-4">
          Peer Comparison
        </h3>
        {user?.playerId ? (
          <PeerComparisonWidget
            playerId={user.playerId}
            testNumber={1}
            showMultiLevel={true}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-tier-border-default p-8">
            <div className="flex flex-col items-center text-center">
              <Users size={32} className="text-tier-text-tertiary opacity-50 mb-2" />
              <p className="text-tier-text-secondary max-w-xs">
                Log in to see how you compare to other players in your category
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Category Comparison */}
      <section>
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide mb-4">
          Category Comparison
        </h3>
        <CategoryComparison getGapToElite={getGapToElite} />
      </section>

      {/* Approach Analysis */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
            Approach Analysis
          </h3>
          <span className="px-2 py-0.5 bg-tier-gold/10 text-tier-gold text-xs font-medium rounded">
            Pro Data
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-tier-border-default p-4">
          <p className="text-sm text-tier-text-secondary mb-4">
            See how PGA pros perform from different distances.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {approachSkills.map((skill, index) => (
              <ApproachDistanceCard key={skill.distance} skill={skill} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Top PGA Players */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
            PGA Tour Top 5
          </h3>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
            2025
          </span>
        </div>
        <TopPlayersList players={topPlayers} />
      </section>

      {/* WAGR Rankings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
            WAGR - Top Amateurs
          </h3>
          <Globe size={20} className="text-tier-text-secondary" />
        </div>
        <WAGRRankings rankings={wagrRankings} />
      </section>

      {/* Inspiration Quote */}
      <section>
        <div className="bg-tier-surface-subtle rounded-xl p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Zap size={24} className="text-tier-navy" />
            <blockquote className="text-lg italic text-tier-text-secondary">
              "The most important shot in golf is the next one."
            </blockquote>
            <cite className="text-sm text-tier-text-tertiary not-italic">— Ben Hogan</cite>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BenchmarkContent;
