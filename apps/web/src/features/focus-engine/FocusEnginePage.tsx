/**
 * TIER Golf - Focus Engine Page
 * Design System v3.1 - Decision-First Sub-Page
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What should I focus on in my training today?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 - Decision Hero: Current recommended focus area with data-driven reasoning
 * Layer 2 - AI Summary: Overview of analysis and priorities
 * Layer 3 - Full Recommendations: All focus areas with detailed cards
 *
 * AI-powered training focus recommendations based on test results,
 * performance history, and development patterns.
 */

import React, { useState, useMemo } from 'react';
import { Brain, RefreshCw, Settings, Target, ArrowRight, Play, TrendingUp, Zap, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEngine, FocusComponent, FocusData } from './hooks/useFocusEngine';
import FocusRecommendationCard from './components/FocusRecommendationCard';
import FocusAreaSelector from './components/FocusAreaSelector';
import { PageHeader } from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle, CardTitle } from '../../components/typography';

// =============================================================================
// TYPES
// =============================================================================

interface FocusRecommendation {
  id: string;
  focusArea: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impactScore: number;
  reasoning: string;
  currentLevel?: number;
  targetLevel?: number;
  estimatedWeeks?: number;
}

interface FocusSummary {
  analysis: string;
  totalFocusAreas: number;
  highPriority: number;
  lastUpdated?: string;
}

// =============================================================================
// COMPONENT MAPPINGS
// =============================================================================

/** Human-readable names for each golf component */
const COMPONENT_NAMES: Record<FocusComponent, string> = {
  OTT: 'Off The Tee',
  APP: 'Approach',
  ARG: 'Around The Green',
  PUTT: 'Putting',
};

/** Category labels for each component */
const COMPONENT_CATEGORIES: Record<FocusComponent, string> = {
  OTT: 'Driving / Long Game',
  APP: 'Iron Play / Approach',
  ARG: 'Short Game / Wedges',
  PUTT: 'Putting / Green Reading',
};

/** Map reason codes to human-readable explanations */
const REASON_CODE_DESCRIPTIONS: Record<string, string> = {
  weak_ott_test_cluster: 'Your Off The Tee test results show room for improvement.',
  weak_app_test_cluster: 'Your Approach test results indicate this is a development area.',
  weak_arg_test_cluster: 'Your Around The Green test results suggest this needs attention.',
  weak_putt_test_cluster: 'Your Putting test results show this as a key improvement area.',
  high_weight_ott: 'Off The Tee has high impact on your overall scoring.',
  high_weight_app: 'Approach shots significantly affect your scoring potential.',
  high_weight_arg: 'Around The Green performance is crucial for your game.',
  high_weight_putt: 'Putting has high weight in your scoring analysis.',
  insufficient_test_data: 'Complete more tests for more accurate recommendations.',
};

/**
 * Convert FocusData from the hook into FocusRecommendation format for UI components
 */
function transformFocusDataToRecommendations(focusData: FocusData): FocusRecommendation[] {
  const components: FocusComponent[] = ['OTT', 'APP', 'ARG', 'PUTT'];

  // Sort components by score (lowest first - those need most work)
  const sortedComponents = [...components].sort(
    (a, b) => focusData.focusScores[a] - focusData.focusScores[b]
  );

  return sortedComponents.map((component, index) => {
    const score = focusData.focusScores[component];
    const split = focusData.recommendedSplit[component];
    const isPrimary = component === focusData.focusComponent;

    // Determine priority based on position and whether it's the primary focus
    let priority: 'high' | 'medium' | 'low';
    if (isPrimary || index === 0) {
      priority = 'high';
    } else if (index === 1) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Generate reasoning from reason codes
    const relevantReasons = focusData.reasonCodes
      .filter((code) => code.toLowerCase().includes(component.toLowerCase()))
      .map((code) => REASON_CODE_DESCRIPTIONS[code] || code)
      .join(' ');

    const defaultReasoning = `Based on your performance analysis, ${COMPONENT_NAMES[component]} has a score of ${score}/100 with ${Math.round(split * 100)}% recommended training allocation.`;

    return {
      id: component,
      focusArea: COMPONENT_NAMES[component],
      category: COMPONENT_CATEGORIES[component],
      priority,
      impactScore: Math.round(split * 100),
      reasoning: relevantReasons || defaultReasoning,
      currentLevel: score,
      targetLevel: 100,
      estimatedWeeks: Math.ceil((100 - score) / 5), // Rough estimate: 5 points per week
    };
  });
}

/**
 * Generate summary from FocusData
 */
function generateSummaryFromFocusData(focusData: FocusData): FocusSummary {
  const primaryComponent = COMPONENT_NAMES[focusData.focusComponent];
  const confidenceText = focusData.confidence === 'high' ? 'confident' : focusData.confidence === 'med' ? 'moderately confident' : 'initial';

  return {
    analysis: `Based on your test results and performance data, we are ${confidenceText} that ${primaryComponent} should be your primary training focus. This recommendation considers both your current skill level and the potential impact on your overall game.`,
    totalFocusAreas: 4,
    highPriority: focusData.confidence === 'high' ? 2 : 1,
    lastUpdated: new Date().toISOString(),
  };
}

// =============================================================================
// FOCUS HERO COMPONENT (Layer 1 - Decision Hero)
// =============================================================================

interface FocusHeroProps {
  recommendation: FocusRecommendation | null;
  totalRecommendations: number;
  highPriorityCount: number;
  onStartTraining: (recommendation: FocusRecommendation) => void;
}

/**
 * FocusHero - Primary decision interface
 *
 * Answers the question: "What should I focus on in my training today?"
 *
 * Shows:
 * - Current recommended focus area
 * - Data-driven reason for this recommendation
 * - Progress towards target level
 * - Primary CTA to start focused training
 */
function FocusHero({ recommendation, totalRecommendations, highPriorityCount, onStartTraining }: FocusHeroProps) {
  // Empty state when no recommendations
  if (!recommendation) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-tier-navy via-tier-navy to-tier-navy/95 p-6 md:p-8 text-white shadow-xl mb-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-tier-gold/20 flex items-center justify-center mb-4">
            <Target size={32} className="text-tier-gold" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Focus Recommendations Yet</h3>
          <p className="text-white/70 max-w-md">
            Complete more tests so the AI engine can analyze your performance and provide personalized training focus recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage if levels are available
  const progressPercentage = recommendation.currentLevel !== undefined && recommendation.targetLevel !== undefined
    ? Math.min(100, Math.round((recommendation.currentLevel / recommendation.targetLevel) * 100))
    : null;

  // Priority badge configuration
  const priorityConfig = {
    high: { label: 'High Priority', bgClass: 'bg-tier-error/20', textClass: 'text-tier-error' },
    medium: { label: 'Medium Priority', bgClass: 'bg-tier-warning/20', textClass: 'text-tier-warning' },
    low: { label: 'Low Priority', bgClass: 'bg-tier-info/20', textClass: 'text-tier-info' },
  };

  const config = priorityConfig[recommendation.priority];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tier-navy via-tier-navy to-tier-navy/95 p-6 md:p-8 text-white shadow-xl mb-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tier-gold rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-tier-gold font-semibold text-sm uppercase tracking-wide mb-1">
              Today's Training Focus
            </p>
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              What should I focus on?
            </h2>
          </div>

          {/* Priority indicator */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.bgClass} ${config.textClass}`}>
              {config.label}
            </span>
            {highPriorityCount > 1 && (
              <span className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium text-white/80">
                +{highPriorityCount - 1} more
              </span>
            )}
          </div>
        </div>

        {/* Main decision area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-tier-gold/20 flex items-center justify-center shrink-0">
              <Target size={28} className="text-tier-gold" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Focus Area Title */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/60 text-sm">Recommended Focus</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{recommendation.focusArea}</h3>
              <p className="text-white/70 text-sm mb-3">{recommendation.category}</p>

              {/* Data-driven reason */}
              <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg mb-4">
                <Brain size={16} className="text-tier-gold mt-0.5 shrink-0" />
                <p className="text-white/90 text-sm leading-relaxed">{recommendation.reasoning}</p>
              </div>

              {/* Progress indicators */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Impact score */}
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-tier-gold" />
                  <span className="text-white/70">Impact:</span>
                  <span className="font-semibold text-tier-gold">{recommendation.impactScore}/100</span>
                </div>

                {/* Current progress */}
                {progressPercentage !== null && (
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-tier-success" />
                    <span className="text-white/70">Progress:</span>
                    <span className="font-semibold text-tier-success">{progressPercentage}%</span>
                  </div>
                )}

                {/* Estimated time */}
                {recommendation.estimatedWeeks && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-white/70" />
                    <span className="text-white/70">Est. time:</span>
                    <span className="font-semibold">{recommendation.estimatedWeeks} weeks</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {progressPercentage !== null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>Current: {recommendation.currentLevel?.toFixed(1)}</span>
                    <span>Target: {recommendation.targetLevel?.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-tier-gold to-tier-success transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => onStartTraining(recommendation)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-tier-gold hover:bg-tier-gold/90 text-tier-navy font-bold rounded-xl transition-all shadow-lg hover:shadow-xl shrink-0 w-full md:w-auto"
            >
              <Play size={20} />
              Start Focused Training
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
          <span>{totalRecommendations} focus areas identified</span>
          <span className="text-white/30">|</span>
          <span>{highPriorityCount} high priority</span>
          <span className="text-white/30">|</span>
          <span className="text-tier-gold">AI-powered recommendations</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const FocusEnginePage: React.FC = () => {
  const { user } = useAuth();
  const playerId = user?.playerId || user?.id;
  const [showSelector, setShowSelector] = useState(false);

  // Use the new useFocusEngine hook
  const { focusData, isLoading: loading, error, refresh: refetch } = useFocusEngine();

  // Transform focusData to recommendations format used by UI components
  const recommendations = useMemo(() => {
    return transformFocusDataToRecommendations(focusData);
  }, [focusData]);

  // Generate summary from focusData
  const summary = useMemo(() => {
    return generateSummaryFromFocusData(focusData);
  }, [focusData]);

  // Compute primary recommendation (highest priority) for the Decision Hero
  const primaryRecommendation = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return null;
    // First, try to find a high priority recommendation
    const highPriority = recommendations.find((rec: FocusRecommendation) => rec.priority === 'high');
    if (highPriority) return highPriority;
    // Otherwise, return the first recommendation (already sorted by priority)
    return recommendations[0] as FocusRecommendation;
  }, [recommendations]);

  // Count high priority recommendations
  const highPriorityCount = useMemo(() => {
    if (!recommendations) return 0;
    return recommendations.filter((rec: FocusRecommendation) => rec.priority === 'high').length;
  }, [recommendations]);

  if (!playerId) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-tier-error">No user found. Please log in.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStartTraining = (_recommendation: any) => {
    // TODO: Navigate to training for this focus area
    // Implement navigation to training page/exercises
  };

  const handlePrioritiesChange = async (_areas: any[]) => {
    // Note: Priority updates are not yet supported by the new API
    // For now, just refetch the current recommendations
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-tier-text-secondary">Analyzing training focus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-tier-error/10 flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-tier-error" />
            </div>
            <SubSectionTitle style={{ marginBottom: 8 }}>
              Could not load recommendations
            </SubSectionTitle>
            <p className="text-tier-text-secondary mb-4">{error}</p>
            <Button variant="primary" onClick={refetch}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <PageHeader title="Training Focus" subtitle="" helpText="" actions={null} />
          <p className="text-tier-text-secondary mt-2">
            AI-powered recommendations for what to focus on in your training
          </p>
        </div>

        {/* Layer 1: Decision Hero - Primary focus recommendation */}
        <FocusHero
          recommendation={primaryRecommendation}
          totalRecommendations={recommendations.length}
          highPriorityCount={highPriorityCount}
          onStartTraining={handleStartTraining}
        />

        {/* Layer 2: AI Summary Card */}
        {summary && (
          <div className="bg-gradient-to-r from-tier-navy to-tier-info text-white rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Brain size={32} />
              </div>
              <div className="flex-1">
                <SubSectionTitle style={{ marginBottom: 8 }}>AI Analysis</SubSectionTitle>
                <p className="text-white/90 mb-4">{summary.analysis}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-white/70 text-sm mb-1">Focus Areas</div>
                    <div className="text-2xl font-bold">{summary.totalFocusAreas || 0}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">High Priority</div>
                    <div className="text-2xl font-bold">{summary.highPriority || 0}</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Last Updated</div>
                    <div className="text-sm font-semibold">
                      {summary.lastUpdated
                        ? new Date(summary.lastUpdated).toLocaleDateString('en-US')
                        : 'Today'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layer 3: Actions */}
        <div className="flex items-center justify-between mb-6">
          <SubSectionTitle style={{ marginBottom: 0 }}>Recommended Focus Areas</SubSectionTitle>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Settings size={16} />}
              onClick={() => setShowSelector(!showSelector)}
            >
              Adjust Priorities
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={16} />}
              onClick={refetch}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Priority Selector (collapsible) */}
        {showSelector && recommendations.length > 0 && (
          <div className="mb-6">
            <FocusAreaSelector
              focusAreas={recommendations.map((rec: any, index: number) => ({
                id: rec.id,
                name: rec.focusArea,
                category: rec.category,
                currentPriority: recommendations.length - index,
              }))}
              onPrioritiesChange={handlePrioritiesChange}
            />
          </div>
        )}

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((rec: any) => (
              <FocusRecommendationCard
                key={rec.id}
                recommendation={rec}
                onStartTraining={handleStartTraining}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-tier-border-default p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-tier-gold/10 flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-tier-gold" />
            </div>
            <SubSectionTitle style={{ marginBottom: 8 }}>
              No Recommendations Available
            </SubSectionTitle>
            <p className="text-tier-text-secondary mb-4">
              Complete more tests so the AI engine can provide personalized recommendations.
            </p>
            <Button variant="primary" onClick={() => (window.location.href = '/trening/testing')}>
              Start Testing
            </Button>
          </div>
        )}

        {/* Info section */}
        <div className="mt-8 bg-white rounded-xl border border-tier-border-default p-6">
          <SubSectionTitle style={{ marginBottom: 12 }}>About Training Focus</SubSectionTitle>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-tier-text-secondary">
            <div>
              <CardTitle style={{ marginBottom: 8 }}>How does it work?</CardTitle>
              <p>
                The AI engine analyzes your test results, performance history, and
                development patterns to identify areas with the greatest improvement potential.
              </p>
            </div>
            <div>
              <CardTitle style={{ marginBottom: 8 }}>How to use the recommendations?</CardTitle>
              <p>
                Start with the highest priority areas. Each recommendation includes an explanation,
                expected impact, and estimated time to reach the target level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusEnginePage;
