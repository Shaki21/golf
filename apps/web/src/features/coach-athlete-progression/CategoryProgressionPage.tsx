/**
 * TIER Golf - Category Progression Page
 * Design System v3.1 - Decision-First Sub-Page
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What tests must I pass to reach my next category?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 - Decision Hero: Most urgent test to pass, progress summary
 * Layer 2 - Control: Progress stats, category badges
 * Layer 3 - Operations: Full list of passed/failed requirements
 *
 * Shows player's progression toward next category with detailed test requirements.
 * Uses analyticsAPI.getCategoryProgression() backend endpoint.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  RefreshCw,
  ArrowRight,
  Play,
  Award,
} from 'lucide-react';
import { analyticsAPI, playersAPI } from '../../services/api';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// Types matching backend CategoryProgression interface
interface CategoryProgressionRequirement {
  testNumber: number;
  testName: string;
  requirement: number;
  currentValue?: number;
  passed: boolean;
  gap?: number;
  gapPercentage?: number;
}

interface CategoryProgression {
  playerId: string;
  currentCategory: string;
  nextCategory: string;
  requirements: CategoryProgressionRequirement[];
  testsPassedForNext: number;
  totalRequiredTests: number;
  overallReadiness: number;
  estimatedMonthsToNext?: number;
  recentTrend: 'on_track' | 'needs_attention' | 'excellent';
}

interface PlayerInfo {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
}

// =============================================================================
// LAYER 1: DECISION HERO - "What tests must I pass to reach my next category?"
// =============================================================================

interface ProgressionHeroProps {
  progression: CategoryProgression;
  player: PlayerInfo | null;
  athleteId: string;
}

function ProgressionHero({ progression, player, athleteId }: ProgressionHeroProps) {
  // Find the most urgent/closest test to pass (smallest gap)
  const failedRequirements = progression.requirements.filter(r => !r.passed);
  const sortedByGap = [...failedRequirements].sort((a, b) => {
    // Sort by gap percentage (closest to passing first)
    const gapA = a.gapPercentage ?? 100;
    const gapB = b.gapPercentage ?? 100;
    return gapA - gapB;
  });
  const mostUrgentTest = sortedByGap[0] || null;

  const testsRemaining = progression.totalRequiredTests - progression.testsPassedForNext;
  const progressPercentage = (progression.testsPassedForNext / progression.totalRequiredTests) * 100;

  // All tests passed state
  if (testsRemaining === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tier-success via-tier-success to-tier-success/90 p-6 md:p-8 shadow-lg mb-6">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Award size={28} className="text-white" />
            </div>
            <div>
              <SectionTitle className="text-xl md:text-2xl text-white" style={{ margin: 0 }}>
                Ready for Category {progression.nextCategory}!
              </SectionTitle>
              <p className="text-white/80">
                {player?.firstName || 'Player'} has passed all required tests
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tier-navy via-tier-navy to-tier-navy-dark p-6 md:p-8 shadow-lg mb-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tier-gold rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Category progression badges */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/30 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {progression.currentCategory}
                </span>
              </div>
              <ChevronRight size={20} className="text-tier-gold" />
              <div className="w-12 h-12 rounded-xl bg-tier-gold/20 border-2 border-tier-gold flex items-center justify-center">
                <span className="text-xl font-bold text-tier-gold">
                  {progression.nextCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="text-right">
            <span className="text-2xl font-bold text-white">
              {progression.testsPassedForNext}/{progression.totalRequiredTests}
            </span>
            <p className="text-xs text-white/60">tests passed</p>
          </div>
        </div>

        {/* Main decision area */}
        {mostUrgentTest && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-tier-gold/20 flex items-center justify-center shrink-0">
                <Play size={28} className="text-tier-gold" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-sm mb-1">Closest to passing</p>
                <SubSectionTitle className="text-lg md:text-xl text-white mb-1" style={{ margin: 0, marginBottom: '4px' }}>
                  Test {mostUrgentTest.testNumber}: {mostUrgentTest.testName}
                </SubSectionTitle>
                <p className="text-white/80 text-sm">
                  Current: {mostUrgentTest.currentValue ?? 'Not tested'} •
                  Required: {mostUrgentTest.requirement}
                  {mostUrgentTest.gap !== undefined && (
                    <span className="ml-2 text-tier-gold">
                      ({mostUrgentTest.gap > 0 ? '+' : ''}{mostUrgentTest.gap.toFixed(1)} to pass)
                    </span>
                  )}
                </p>
              </div>

              {/* Primary CTA */}
              <Link
                to={`/trening/tester/${mostUrgentTest.testNumber}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-tier-gold hover:bg-tier-gold-dark text-tier-navy font-bold rounded-xl transition-all shadow-lg hover:shadow-xl shrink-0"
              >
                Start Test
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-tier-gold transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-white/80">
            <CheckCircle2 size={14} className="text-tier-success" />
            <span>{progression.testsPassedForNext} passed</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <Target size={14} className="text-tier-gold" />
            <span>{testsRemaining} remaining</span>
          </div>
          {progression.estimatedMonthsToNext && (
            <div className="flex items-center gap-1.5 text-white/80">
              <TrendingUp size={14} className="text-tier-gold" />
              <span>~{progression.estimatedMonthsToNext} months to goal</span>
            </div>
          )}
        </div>

        {/* Secondary actions */}
        <div className="flex flex-wrap items-center gap-4 text-sm mt-4 pt-4 border-t border-white/10">
          <Link
            to={`/trening/tester`}
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            View all tests
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to={`/coach/athletes/${athleteId}`}
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Player profile
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to={`/coach/athletes/${athleteId}/training-plan`}
            className="text-white/70 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Training plan
          </Link>
        </div>
      </div>
    </div>
  );
}

export const CategoryProgressionPage: React.FC = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const navigate = useNavigate();

  const [progression, setProgression] = useState<CategoryProgression | null>(null);
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!athleteId) return;

    try {
      setError(null);

      // Fetch player info and progression in parallel
      const [playerRes, progressionRes] = await Promise.all([
        playersAPI.getById(athleteId).catch(() => null),
        analyticsAPI.getCategoryProgression(athleteId).catch(() => null),
      ]);

      if (playerRes?.data?.data) {
        setPlayer(playerRes.data.data);
      }

      if (progressionRes?.data?.data) {
        // Type assertion needed as API returns generic Record type
        const data = progressionRes.data.data as unknown as CategoryProgression;
        setProgression(data);
      } else {
        setError('Kunne ikke hente kategoridata');
      }
    } catch (err) {
      setError('En feil oppstod');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [athleteId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'excellent':
        return <TrendingUp size={18} className="text-tier-success" />;
      case 'on_track':
        return <CheckCircle2 size={18} className="text-tier-navy" />;
      case 'needs_attention':
        return <AlertCircle size={18} className="text-tier-warning" />;
      default:
        return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'excellent':
        return 'Utmerket fremgang';
      case 'on_track':
        return 'På rett spor';
      case 'needs_attention':
        return 'Trenger fokus';
      default:
        return '';
    }
  };

  const getTrendClasses = (trend: string) => {
    switch (trend) {
      case 'excellent':
        return 'bg-tier-success/10 text-tier-success';
      case 'on_track':
        return 'bg-tier-navy/10 text-tier-navy';
      case 'needs_attention':
        return 'bg-tier-warning/10 text-tier-warning';
      default:
        return 'bg-tier-surface-base text-tier-text-secondary';
    }
  };

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 80) return 'text-tier-success';
    if (readiness >= 50) return 'text-tier-navy';
    if (readiness >= 25) return 'text-tier-warning';
    return 'text-tier-error';
  };

  const getProgressBarColor = (readiness: number) => {
    if (readiness >= 80) return 'bg-tier-success';
    if (readiness >= 50) return 'bg-tier-navy';
    if (readiness >= 25) return 'bg-tier-warning';
    return 'bg-tier-error';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-tier-surface-base">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-tier-navy" />
          <p className="text-sm text-tier-text-secondary">Laster kategoridata...</p>
        </div>
      </div>
    );
  }

  if (error || !progression) {
    return (
      <div className="p-6 bg-tier-surface-base min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-tier-text-secondary hover:text-tier-navy mb-6"
        >
          <ArrowLeft size={16} />
          Tilbake
        </button>
        <StateCard
          variant="error"
          title="Kunne ikke laste kategoridata"
          description={error || 'Prøv igjen senere'}
          action={<Button onClick={handleRefresh}>Prøv igjen</Button>}
        />
      </div>
    );
  }

  const passedRequirements = progression.requirements.filter(r => r.passed);
  const failedRequirements = progression.requirements.filter(r => !r.passed);

  return (
    <div className="p-6 bg-tier-surface-base min-h-screen">
      {/* Back navigation */}
      <button
        onClick={() => navigate(`/coach/athletes/${athleteId}`)}
        className="flex items-center gap-2 text-sm text-tier-text-secondary hover:text-tier-navy mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Tilbake til spiller
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tier-navy to-tier-navy/80 flex items-center justify-center flex-shrink-0">
            <Target size={24} className="text-white" />
          </div>
          <div>
            <PageHeader
              title="Kategori-progresjon"
              subtitle={player ? `${player.firstName} ${player.lastName}` : 'Laster...'}
              helpText="Detaljert oversikt over spillerens fremgang mot kategori-krav (A-E). Se oppnådde krav, gjenstående tester og anbefalt fokus for neste kategori."
              divider={false}
            />
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Oppdaterer...' : 'Oppdater'}
        </Button>
      </div>

      {/* Layer 1: Decision Hero - "What tests must I pass to reach my next category?" */}
      <ProgressionHero
        progression={progression}
        player={player}
        athleteId={athleteId || ''}
      />

      {/* Layer 2: Control - Summary Stats Card */}
      <div className="bg-tier-white rounded-2xl p-6 mb-6 border border-tier-border-default">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Current Category */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-tier-text-tertiary mb-1">Nåværende</span>
              <div className="w-14 h-14 rounded-xl bg-tier-surface-base border-2 border-tier-border-default flex items-center justify-center">
                <span className="text-2xl font-bold text-tier-navy">
                  {progression.currentCategory}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight size={24} className="text-tier-text-tertiary" />

            {/* Next Category */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-tier-text-tertiary mb-1">Neste mål</span>
              <div className="w-14 h-14 rounded-xl bg-tier-navy/10 border-2 border-tier-navy flex items-center justify-center">
                <span className="text-2xl font-bold text-tier-navy">
                  {progression.nextCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Trend badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getTrendClasses(progression.recentTrend)}`}>
            {getTrendIcon(progression.recentTrend)}
            <span className="text-sm font-medium">
              {getTrendLabel(progression.recentTrend)}
            </span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-tier-text-secondary">Total fremgang</span>
            <span className={`text-lg font-bold ${getReadinessColor(progression.overallReadiness)}`}>
              {progression.overallReadiness}%
            </span>
          </div>
          <div className="h-3 bg-tier-border-default rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressBarColor(progression.overallReadiness)} transition-all duration-500 rounded-full`}
              style={{ width: `${progression.overallReadiness}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center py-3 px-4 bg-tier-surface-base rounded-xl">
            <span className="text-2xl font-bold text-tier-success">
              {progression.testsPassedForNext}
            </span>
            <p className="text-xs text-tier-text-secondary mt-1">Bestått</p>
          </div>
          <div className="text-center py-3 px-4 bg-tier-surface-base rounded-xl">
            <span className="text-2xl font-bold text-tier-error">
              {progression.totalRequiredTests - progression.testsPassedForNext}
            </span>
            <p className="text-xs text-tier-text-secondary mt-1">Gjenstår</p>
          </div>
          <div className="text-center py-3 px-4 bg-tier-surface-base rounded-xl">
            <span className="text-2xl font-bold text-tier-navy">
              {progression.totalRequiredTests}
            </span>
            <p className="text-xs text-tier-text-secondary mt-1">Totalt</p>
          </div>
        </div>

        {progression.estimatedMonthsToNext && (
          <div className="mt-4 pt-4 border-t border-tier-border-default">
            <p className="text-sm text-tier-text-secondary text-center">
              Estimert tid til kategori {progression.nextCategory}:{' '}
              <span className="font-semibold text-tier-navy">
                {progression.estimatedMonthsToNext} {progression.estimatedMonthsToNext === 1 ? 'måned' : 'måneder'}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Layer 3: Operations - Full Requirements List */}
      <div className="space-y-6">
        {/* Passed requirements */}
        {passedRequirements.length > 0 && (
          <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} className="text-tier-success" />
              <SectionTitle className="m-0">
                Beståtte krav ({passedRequirements.length})
              </SectionTitle>
            </div>
            <div className="space-y-3">
              {passedRequirements.map((req) => (
                <div
                  key={req.testNumber}
                  className="flex items-center justify-between py-3 px-4 bg-tier-success/5 rounded-xl border border-tier-success/20"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-tier-success" />
                    <div>
                      <p className="text-sm font-medium text-tier-navy">
                        Test {req.testNumber}: {req.testName}
                      </p>
                      <p className="text-xs text-tier-text-secondary">
                        Krav: {req.requirement}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-tier-success">
                      {req.currentValue ?? '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed/pending requirements */}
        {failedRequirements.length > 0 && (
          <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-tier-error" />
              <SectionTitle className="m-0">
                Må forbedres ({failedRequirements.length})
              </SectionTitle>
            </div>
            <div className="space-y-3">
              {failedRequirements.map((req) => (
                <div
                  key={req.testNumber}
                  className="flex items-center justify-between py-3 px-4 bg-tier-surface-base rounded-xl border border-tier-border-default"
                >
                  <div className="flex items-center gap-3">
                    <XCircle size={18} className="text-tier-error" />
                    <div>
                      <p className="text-sm font-medium text-tier-navy">
                        Test {req.testNumber}: {req.testName}
                      </p>
                      <p className="text-xs text-tier-text-secondary">
                        Krav: {req.requirement}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-tier-navy">
                      {req.currentValue ?? '-'}
                    </span>
                    {req.gap !== undefined && (
                      <p className="text-xs text-tier-error">
                        {req.gap > 0 ? '+' : ''}{req.gap.toFixed(1)} til krav
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProgressionPage;
