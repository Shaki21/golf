/**
 * Benchmark Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "How do I compare to elite players?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with position vs elite
 * Layer 2 (40%) — Control & Progress: Category comparison + Approach analysis
 * Layer 3 (30%) — Operations & Admin: Top players + WAGR rankings
 */

import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useProBenchmark, ApproachSkillData } from '../../hooks/useProBenchmark';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { useScreenView } from '../../analytics/useScreenView';
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Crosshair,
  Flag,
  CircleDot,
  Zap,
  Globe,
  Star,
  Users,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatSG = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
};

const getSGColorClass = (value: number) => {
  if (value >= 0.5) return 'text-green-600';
  if (value >= 0) return 'text-tier-gold';
  if (value >= -0.5) return 'text-amber-600';
  return 'text-red-600';
};

const getSGBgClass = (value: number) => {
  if (value >= 0.5) return 'bg-green-100 text-green-800';
  if (value >= 0) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
};

// =============================================================================
// STATE MACHINE
// =============================================================================

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

function computeBenchmarkState(
  sgData: any,
  eliteBenchmarks: any
): PrimaryAction {
  if (!sgData || !sgData.hasData) {
    return {
      headline: 'Start tracking to compare',
      subtext: 'Complete tests to see how you compare to elite players',
      ctaLabel: 'Register Test',
      ctaHref: '/trening/testing/registrer',
      urgency: 'medium',
    };
  }

  const gapToTop10 = (sgData.total || 0) - (eliteBenchmarks?.top10?.total || 2.5);
  const progressPercent = Math.max(0, Math.min(100, ((sgData.total || 0) + 1) / ((eliteBenchmarks?.top10?.total || 2.5) + 1) * 100));

  if (progressPercent >= 80) {
    return {
      headline: 'Elite level performance!',
      subtext: 'You are performing at a professional level',
      ctaLabel: 'View Details',
      ctaHref: '/statistikk/strokes-gained',
      urgency: 'low',
    };
  }

  if (progressPercent >= 50) {
    return {
      headline: 'Above tour average',
      subtext: `${Math.abs(gapToTop10).toFixed(1)} strokes to reach Top 10 level`,
      ctaLabel: 'View Gap Analysis',
      ctaHref: '/statistikk/strokes-gained',
      urgency: 'low',
    };
  }

  return {
    headline: 'Room for improvement',
    subtext: 'Focus on your weakest category to close the gap',
    ctaLabel: 'See Weak Areas',
    ctaHref: '/statistikk/strokes-gained',
    urgency: 'medium',
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface BenchmarkHeroCardProps {
  action: PrimaryAction;
  sgTotal: number | null;
  eliteTotal: number;
  progressPercent: number;
}

function BenchmarkHeroDecisionCard({ action, sgTotal, eliteTotal, progressPercent }: BenchmarkHeroCardProps) {
  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  const gap = (sgTotal || 0) - eliteTotal;

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Header with Trophy */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-tier-gold to-amber-600 flex items-center justify-center shadow-lg">
            <Trophy size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tier-navy">Your Position</h2>
            <p className="text-sm text-tier-text-secondary">Compared to elite players</p>
          </div>
        </div>
        {sgTotal !== null && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getSGBgClass(sgTotal)}`}>
            {sgTotal >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formatSG(sgTotal)} SG Total
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-tier-text-tertiary uppercase tracking-wide mb-1">Your SG</div>
          <div className={`text-3xl font-bold ${getSGColorClass(sgTotal || 0)}`}>
            {formatSG(sgTotal)}
          </div>
        </div>
        <div className="text-center border-x border-tier-border-subtle">
          <div className="text-xs text-tier-text-tertiary uppercase tracking-wide mb-1">Gap to Elite</div>
          <div className={`text-3xl font-bold ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatSG(gap)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-tier-text-tertiary uppercase tracking-wide mb-1">PGA Top 10</div>
          <div className="text-3xl font-bold text-green-600">
            {formatSG(eliteTotal)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-tier-text-secondary mb-2">
          <span>Progress to elite level</span>
          <span className="font-semibold text-tier-gold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="relative h-3 bg-tier-surface-secondary rounded-full overflow-visible">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-tier-gold to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
          {/* Markers */}
          <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-tier-text-tertiary rounded-full" style={{ left: '40%' }} title="Tour Average" />
          <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-500 rounded-full" style={{ left: '70%' }} title="Top 50" />
          <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-full" style={{ left: '100%' }} title="Top 10" />
        </div>
        <div className="flex justify-between text-[10px] text-tier-text-tertiary mt-1">
          <span>Scratch</span>
          <span>Tour Avg</span>
          <span>Top 50</span>
          <span>Top 10</span>
        </div>
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <Target size={18} />
          {action.ctaLabel}
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORY COMPARISON CARD
// =============================================================================

interface CategoryComparisonCardProps {
  sgData: any;
  eliteBenchmarks: any;
}

function CategoryComparisonCard({ sgData, eliteBenchmarks }: CategoryComparisonCardProps) {
  const categories = [
    { key: 'approach', label: 'Approach', icon: Crosshair, desc: 'Shots to green', sgKey: 'approach' },
    { key: 'putting', label: 'Putting', icon: CircleDot, desc: 'Shots on green', sgKey: 'putting' },
    { key: 'aroundGreen', label: 'Short Game', icon: Flag, desc: 'Around green', sgKey: 'around_green' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Category Comparison</h3>

      <div className="space-y-4">
        {categories.map(cat => {
          const playerValue = sgData?.byCategory?.[cat.sgKey]?.value || 0;
          const eliteValue = eliteBenchmarks?.top10?.[cat.key] || 0;
          const gap = playerValue - eliteValue;
          const Icon = cat.icon;
          const progressPercent = Math.max(0, Math.min(100, ((playerValue + 0.5) / (eliteValue + 0.5)) * 100));

          return (
            <div key={cat.key} className="p-4 bg-tier-surface-subtle rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-tier-gold/10 flex items-center justify-center">
                  <Icon size={20} className="text-tier-gold" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-tier-navy">{cat.label}</div>
                  <div className="text-xs text-tier-text-tertiary">{cat.desc}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <div className="text-[10px] text-tier-text-tertiary uppercase">You</div>
                  <div className={`text-lg font-bold ${getSGColorClass(playerValue)}`}>
                    {formatSG(playerValue)}
                  </div>
                </div>
                <div className="border-x border-tier-border-subtle">
                  <div className="text-[10px] text-tier-text-tertiary uppercase">Elite</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatSG(eliteValue)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-tier-text-tertiary uppercase">Gap</div>
                  <div className={`text-lg font-bold ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatSG(gap)}
                  </div>
                </div>
              </div>

              <div className="h-1.5 bg-tier-surface-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    playerValue >= 0 ? 'bg-green-500' : playerValue >= -0.3 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// APPROACH ANALYSIS CARD
// =============================================================================

interface ApproachAnalysisCardProps {
  approachSkills: ApproachSkillData[];
}

function ApproachAnalysisCard({ approachSkills }: ApproachAnalysisCardProps) {
  const gradientClasses = [
    'from-green-500 to-green-600',
    'from-blue-500 to-blue-600',
    'from-tier-navy to-tier-navy/80',
    'from-amber-500 to-amber-600',
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Approach Analysis</h3>
        <span className="px-2 py-1 bg-tier-gold/10 text-tier-gold text-xs font-medium rounded">Pro Data</span>
      </div>

      <p className="text-sm text-tier-text-secondary mb-4">
        PGA Tour performance by distance. Use this to identify focus areas.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {approachSkills.map((skill, index) => (
          <div key={skill.distance} className="rounded-lg overflow-hidden border border-tier-border-subtle">
            <div className={`bg-gradient-to-r ${gradientClasses[index % 4]} px-3 py-2 flex items-center gap-2`}>
              <Target size={14} className="text-white" />
              <span className="text-sm font-semibold text-white">{skill.distance}</span>
            </div>
            <div className="p-3 space-y-2">
              {/* Fairway */}
              <div>
                <div className="text-[10px] text-green-600 font-medium mb-1">Fairway</div>
                <div className="flex justify-between text-xs">
                  <span className="text-tier-text-secondary">SG</span>
                  <span className="font-semibold">{skill.fairway.sgPerShot >= 0 ? '+' : ''}{skill.fairway.sgPerShot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-tier-text-secondary">Prox</span>
                  <span className="font-semibold">{skill.fairway.proximity.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-tier-text-secondary">GIR</span>
                  <span className="font-semibold">{Math.round(skill.fairway.greenHitRate * 100)}%</span>
                </div>
              </div>
              <div className="border-t border-tier-border-subtle pt-2">
                {/* Rough */}
                <div className="text-[10px] text-amber-600 font-medium mb-1">Rough</div>
                <div className="flex justify-between text-xs">
                  <span className="text-tier-text-secondary">SG</span>
                  <span className="font-semibold">{skill.rough.sgPerShot >= 0 ? '+' : ''}{skill.rough.sgPerShot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-tier-text-secondary">Prox</span>
                  <span className="font-semibold">{skill.rough.proximity.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-tier-text-secondary">GIR</span>
                  <span className="font-semibold">{Math.round(skill.rough.greenHitRate * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-tier-border-subtle">
        <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
          <div className="w-2 h-2 rounded-sm bg-green-500" />
          <span>Fairway</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
          <div className="w-2 h-2 rounded-sm bg-amber-500" />
          <span>Rough</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOP PLAYERS CARD
// =============================================================================

interface TopPlayersCardProps {
  topPlayers: any[];
}

function TopPlayersCard({ topPlayers }: TopPlayersCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          PGA Tour Top 5
        </h3>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">2025</span>
      </div>

      <div className="divide-y divide-tier-border-subtle">
        {topPlayers.map((player, index) => (
          <div key={player.name} className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-lg bg-tier-surface-subtle flex items-center justify-center">
              {index === 0 ? (
                <Trophy size={16} className="text-tier-gold" />
              ) : (
                <span className="text-sm font-semibold text-tier-text-secondary">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-tier-navy truncate">{player.name}</div>
              <div className="text-xs text-tier-text-tertiary">
                {player.eventsPlayed} events, {player.wins} wins
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getSGColorClass(player.sgTotal)}`}>
                {formatSG(player.sgTotal)}
              </div>
              <div className="text-[10px] text-tier-text-tertiary">Total SG</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// WAGR RANKINGS CARD
// =============================================================================

interface WAGRRankingsCardProps {
  wagrRankings: {
    men: any[];
    women: any[];
  };
}

function WAGRRankingsCard({ wagrRankings }: WAGRRankingsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle flex items-center gap-2">
        <Globe size={18} className="text-tier-text-secondary" />
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          WAGR - Top Amateurs
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-tier-border-subtle">
        {/* Men */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-tier-border-subtle">
            <Users size={16} className="text-tier-gold" />
            <span className="font-medium text-tier-navy">Men</span>
          </div>
          <div className="space-y-2">
            {wagrRankings.men.map((player, index) => (
              <div key={player.name} className="flex items-center gap-2 py-1">
                <div className="w-5 text-center">
                  {index === 0 ? (
                    <Star size={12} className="text-tier-gold" fill="currentColor" />
                  ) : (
                    <span className="text-xs font-medium text-tier-text-secondary">{player.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-tier-navy truncate">{player.name}</div>
                  <div className="text-[10px] text-tier-text-tertiary">{player.country}</div>
                </div>
                <div className="text-sm font-semibold text-tier-gold">{player.pointsAvg.toFixed(0)}</div>
                <div className={`w-4 flex justify-center ${
                  player.move > 0 ? 'text-green-500' : player.move < 0 ? 'text-red-500' : 'text-tier-text-tertiary'
                }`}>
                  {player.move > 0 && <TrendingUp size={12} />}
                  {player.move < 0 && <TrendingDown size={12} />}
                  {player.move === 0 && <span className="text-xs">-</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Women */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-tier-border-subtle">
            <Users size={16} className="text-tier-gold" />
            <span className="font-medium text-tier-navy">Women</span>
          </div>
          <div className="space-y-2">
            {wagrRankings.women.map((player, index) => (
              <div key={player.name} className="flex items-center gap-2 py-1">
                <div className="w-5 text-center">
                  {index === 0 ? (
                    <Star size={12} className="text-tier-gold" fill="currentColor" />
                  ) : (
                    <span className="text-xs font-medium text-tier-text-secondary">{player.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-tier-navy truncate">{player.name}</div>
                  <div className="text-[10px] text-tier-text-tertiary">{player.country}</div>
                </div>
                <div className="text-sm font-semibold text-tier-gold">{player.pointsAvg.toFixed(0)}</div>
                <div className={`w-4 flex justify-center ${
                  player.move > 0 ? 'text-green-500' : player.move < 0 ? 'text-red-500' : 'text-tier-text-tertiary'
                }`}>
                  {player.move > 0 && <TrendingUp size={12} />}
                  {player.move < 0 && <TrendingDown size={12} />}
                  {player.move === 0 && <span className="text-xs">-</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const BenchmarkPage: React.FC = () => {
  useScreenView('Benchmark');
  const { eliteBenchmarks, topPlayers, approachSkills, wagrRankings, loading, error, refetch } = useProBenchmark();
  const { data: sgData } = useStrokesGained();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Benchmark"
          subtitle="Compare with the best"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-white rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-white rounded-xl" />
              <div className="h-80 bg-white rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Benchmark"
          subtitle="Compare with the best"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-tier-navy mb-2">Could not load benchmark data</h3>
            <p className="text-tier-text-secondary mb-6">{error}</p>
            <button
              onClick={() => refetch?.()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy/90 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </PageContainer>
      </div>
    );
  }

  const action = computeBenchmarkState(sgData, eliteBenchmarks);
  const progressPercent = Math.max(0, Math.min(100, ((sgData?.total || 0) + 1) / ((eliteBenchmarks?.top10?.total || 2.5) + 1) * 100));

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Benchmark"
        subtitle="Compare with the best"
        helpText="Benchmark analysis comparing your performance against PGA Tour professionals and world's best amateurs (WAGR). See your position relative to Tour Average, Top 50 and Top 10. Category comparison for Approach, Putting and Around Green with gap analysis."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with position vs elite
            ============================================================ */}
        <section className="mb-8" aria-label="Benchmark overview">
          <BenchmarkHeroDecisionCard
            action={action}
            sgTotal={sgData?.total ?? null}
            eliteTotal={eliteBenchmarks?.top10?.total || 2.5}
            progressPercent={progressPercent}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Category comparison + Approach analysis
            ============================================================ */}
        <section className="mb-8" aria-label="Category analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryComparisonCard sgData={sgData} eliteBenchmarks={eliteBenchmarks} />
            <ApproachAnalysisCard approachSkills={approachSkills} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Top players + WAGR rankings
            ============================================================ */}
        <section className="mb-8" aria-label="Rankings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPlayersCard topPlayers={topPlayers} />
            <WAGRRankingsCard wagrRankings={wagrRankings} />
          </div>
        </section>

        {/* Inspiration Quote */}
        <section aria-label="Inspiration">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default text-center">
            <Zap size={24} className="mx-auto mb-3 text-tier-gold" />
            <blockquote className="text-lg italic text-tier-text-secondary mb-2">
              "The most important shot in golf is the next one."
            </blockquote>
            <cite className="text-sm text-tier-text-tertiary not-italic">— Ben Hogan</cite>
          </div>
        </section>
      </PageContainer>
    </div>
  );
};

export default BenchmarkPage;
