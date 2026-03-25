/**
 * ============================================================
 * ANALYSE STATISTIKK HUB - Statistics hub with 4 tabs
 * ============================================================
 *
 * This hub consolidates the following old pages:
 * - /utvikling/statistikk → Tab: Oversikt
 * - /utvikling/strokes-gained → Tab: Strokes Gained
 * - /utvikling/fremgang → Tab: Trender
 * - (implicit status page) → Tab: Status & Mål
 *
 * Absorbed content:
 * - /utvikling/vendepunkter → Integrated into Oversikt tab
 * - /utvikling/treningsomrader → Integrated into Trender tab
 * - /utvikling/innsikter → Integrated into Status & Mål tab
 *
 * Deep pages (accessible from tabs):
 * - /analyse/statistikk/historikk → Full historical data view
 *
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Target,
  Trophy
} from 'lucide-react';
import { SubSectionTitle } from '../../components/typography/Headings';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import api from '../../services/api';
import { useBreakingPoints } from '../../hooks/useBreakingPoints';
import { usePlayerInsights } from '../../hooks/usePlayerInsights';
import BreakingPointTimeline from '../breaking-points/components/BreakingPointTimeline';
import BreakingPointCard from '../breaking-points/components/BreakingPointCard';
import { ProgressTrackingView } from '../training-area-performance/ProgressTrackingView';
import SGJourneyView from '../player-insights/components/SGJourneyView';
import SkillDNAView from '../player-insights/components/SkillDNAView';
import BountyBoardView from '../player-insights/components/BountyBoardView';

// Tab type
type StatistikkTab = 'oversikt' | 'strokes-gained' | 'trender' | 'status-maal';

// Tab components (Phase 2: Fully integrated)
function StatistikkOversiktTab() {
  const { data: breakingPointsData, loading: bpLoading } = useBreakingPoints('all');
  const breakingPoints = breakingPointsData?.breakingPoints || [];

  // Convert to timeline format (show latest 5)
  const timelinePoints = breakingPoints.slice(0, 5).map((bp: any) => {
    const type: 'breakthrough' | 'plateau' | 'regression' = bp.progress > 80 ? 'breakthrough' : bp.progress > 20 ? 'plateau' : 'regression';
    return {
      id: bp.id,
      date: bp.identifiedDate,
      type,
      title: bp.title,
      area: bp.area,
      performanceChange: bp.progressPercent || 0,
    };
  });

  // Convert to card format (show latest 2)
  const cardPoints = breakingPoints.slice(0, 2).map((bp: any) => ({
    id: bp.id,
    type: bp.progress > 80 ? 'breakthrough' : bp.progress > 20 ? 'plateau' : 'regression',
    date: bp.identifiedDate,
    area: bp.area,
    title: bp.title,
    description: bp.description,
    performanceBefore: 70,
    performanceAfter: 70 + (bp.progressPercent || 0),
    causes: bp.coachNotes ? [bp.coachNotes] : [],
    recommendations: bp.drills?.map((d: any) => d.name) || [],
    priority: bp.priority,
  }));

  // Mock data for Snitt score chart
  const mockSnittScoreData = [
    { date: 'Aug', score: 14.2 },
    { date: 'Sep', score: 13.8 },
    { date: 'Okt', score: 13.5 },
    { date: 'Nov', score: 13.1 },
    { date: 'Des', score: 12.8 },
    { date: 'Jan', score: 12.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">AVG SCORE</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">12.4</div>
          <div className="text-xs text-tier-success flex items-center gap-1">
            <span>↓ 0.8</span>
            <span className="text-tier-text-secondary">last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">Strokes Gained</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">+2.4</div>
          <div className="text-xs text-tier-success flex items-center gap-1">
            <span>↗ Positive</span>
            <span className="text-tier-text-secondary">trend</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">Rounds last 30 days</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">12</div>
          <div className="text-xs text-tier-text-secondary">Average: 78.5</div>
        </div>
      </div>

      {/* Handicap Chart */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">AVG SCORE DEVELOPMENT</SubSectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockSnittScoreData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-border-default)" />
            <XAxis
              dataKey="date"
              stroke="var(--tier-text-secondary)"
              style={{ fontSize: 12 }}
            />
            <YAxis
              reversed
              domain={[10, 15]}
              stroke="var(--tier-text-secondary)"
              style={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tier-surface-card)',
                border: '1px solid var(--tier-border-default)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--tier-navy)"
              strokeWidth={3}
              dot={{ fill: 'var(--tier-navy)', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ PHASE 2 INTEGRATION: Vendepunkter section */}
      <div id="vendepunkter" className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="flex items-center justify-between mb-4">
          <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy">Performance breaking points</SubSectionTitle>
          {breakingPoints.length > 5 && (
            <Link
              to="/utvikling/vendepunkter"
              className="text-sm text-tier-info hover:text-tier-info-dark"
            >
              See all ({breakingPoints.length}) →
            </Link>
          )}
        </div>

        {bpLoading ? (
          <div className="h-48 flex items-center justify-center text-tier-text-secondary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tier-info"></div>
          </div>
        ) : breakingPoints.length > 0 ? (
          <>
            {/* Timeline */}
            {timelinePoints.length > 0 && (
              <div className="mb-6">
                <BreakingPointTimeline
                  breakingPoints={timelinePoints}
                  onPointClick={() => { /* TODO: Handle point selection */ }}
                />
              </div>
            )}

            {/* Latest breaking point cards */}
            {cardPoints.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {cardPoints.map((point: any) => (
                  <BreakingPointCard
                    key={point.id}
                    breakingPoint={point}
                    onClick={() => { /* TODO: Handle card click */ }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-tier-text-secondary text-center py-8">
            No breaking points identified yet. Keep training and recording tests.
          </p>
        )}
      </div>

      {/* Link to full history */}
      <Link
        to="/analyse/statistikk/historikk"
        className="block bg-tier-info-light border border-tier-info rounded-xl p-4 text-center text-tier-info font-medium hover:bg-tier-info hover:text-white transition-colors"
      >
        See full history →
      </Link>
    </div>
  );
}

function StrokesGainedTab() {
  // Mock data for SG Breakdown
  const mockSGBreakdown = [
    { category: 'Putting', value: 0.8 },
    { category: 'Approach', value: 1.2 },
    { category: 'Tee-to-Green', value: -0.3 },
    { category: 'Short Game', value: 0.7 },
  ];

  // Mock data for SG Trends
  const mockSGTrends = [
    { date: 'Aug', total: 1.8, putting: 0.5, approach: 0.9, aroundGreen: 0.4 },
    { date: 'Sep', total: 2.0, putting: 0.6, approach: 1.0, aroundGreen: 0.4 },
    { date: 'Okt', total: 2.1, putting: 0.7, approach: 1.0, aroundGreen: 0.4 },
    { date: 'Nov', total: 2.3, putting: 0.7, approach: 1.2, aroundGreen: 0.4 },
    { date: 'Des', total: 2.4, putting: 0.8, approach: 1.2, aroundGreen: 0.4 },
    { date: 'Jan', total: 2.4, putting: 0.8, approach: 1.2, aroundGreen: 0.4 },
  ];

  return (
    <div className="space-y-6">
      {/* SG Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">Total SG</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">+2.4</div>
          <div className="text-xs text-tier-success">vs Par</div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">SG: Putting</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">+0.8</div>
          <div className="text-xs text-tier-success">Strength</div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">SG: Approach</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">+1.2</div>
          <div className="text-xs text-tier-success">Strength</div>
        </div>

        <div className="bg-white rounded-xl border border-tier-border-default p-6">
          <div className="text-sm text-tier-text-secondary mb-1">SG: Tee-to-Green</div>
          <div className="text-3xl font-bold text-tier-navy mb-2">-0.3</div>
          <div className="text-xs text-tier-error">Weakness</div>
        </div>
      </div>

      {/* SG Breakdown Chart */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Strokes Gained distribution</SubSectionTitle>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={mockSGBreakdown} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-border-default)" />
            <XAxis type="number" stroke="var(--tier-text-secondary)" style={{ fontSize: 12 }} />
            <YAxis dataKey="category" type="category" stroke="var(--tier-text-secondary)" style={{ fontSize: 12 }} width={120} />
            <Tooltip />
            <ReferenceLine x={0} stroke="var(--tier-text-secondary)" strokeWidth={2} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {mockSGBreakdown.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? '#059669' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Historical SG Trends */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Historical SG trends</SubSectionTitle>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={mockSGTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-border-default)" />
            <XAxis dataKey="date" stroke="var(--tier-text-secondary)" style={{ fontSize: 12 }} />
            <YAxis stroke="var(--tier-text-secondary)" style={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total SG" stroke="var(--tier-navy)" strokeWidth={3} />
            <Line type="monotone" dataKey="putting" name="Putting" stroke="var(--tier-success)" strokeWidth={2} />
            <Line type="monotone" dataKey="approach" name="Approach" stroke="var(--tier-info)" strokeWidth={2} />
            <Line type="monotone" dataKey="aroundGreen" name="Around Green" stroke="var(--tier-warning)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TrenderTab() {
  const [trainingAreaStats, setTrainingAreaStats] = useState<any[]>([]);
  const [taLoading, setTaLoading] = useState(false);

  // Fetch training area stats for key areas (show 4 most important)
  useEffect(() => {
    const fetchTrainingAreaStats = async () => {
      setTaLoading(true);
      const keyAreas = ['PUTT0-3', 'CHIP', 'TEE', 'INN100']; // 4 key training areas
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 90 days

      try {
        const promises = keyAreas.map(area =>
          api.get('/training-area-performance/progress/stats', {
            params: { trainingArea: area, startDate, endDate }
          })
        );
        const results = await Promise.all(promises);
        setTrainingAreaStats(results.map((r, i) => ({ area: keyAreas[i], ...r.data.data })));
      } catch (err) {
        console.error('Error fetching training area stats:', err);
      } finally {
        setTaLoading(false);
      }
    };

    fetchTrainingAreaStats();
  }, []);

  const getAreaLabel = (area: string) => {
    const labels: Record<string, string> = {
      'PUTT0-3': 'Putt 0-3m',
      'CHIP': 'Chip',
      'TEE': 'Tee',
      'INN100': 'Inn 100m'
    };
    return labels[area] || area;
  };

  const getImprovementColor = (value: number | null) => {
    if (value === null || value === 0) return 'text-tier-text-secondary';
    return value > 0 ? 'text-tier-success' : 'text-tier-error';
  };

  const getImprovementIcon = (value: number | null) => {
    if (value === null || value === 0) return '→';
    return value > 0 ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Trend indicators</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-tier-success-light rounded-lg">
            <div className="text-2xl">↗</div>
            <div>
              <div className="text-sm font-medium text-tier-navy">Putting</div>
              <div className="text-xs text-tier-text-secondary">Positive trend</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-tier-warning-light rounded-lg">
            <div className="text-2xl">→</div>
            <div>
              <div className="text-sm font-medium text-tier-navy">Driver</div>
              <div className="text-xs text-tier-text-secondary">Stable</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-tier-error-light rounded-lg">
            <div className="text-2xl">↘</div>
            <div>
              <div className="text-sm font-medium text-tier-navy">Short game</div>
              <div className="text-xs text-tier-text-secondary">Negative trend</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PHASE 2 INTEGRATION: Treningsområder section */}
      <div id="treningsomrader" className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="flex items-center justify-between mb-4">
          <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy">Performance per training area</SubSectionTitle>
          <Link
            to="/training-area-performance"
            className="text-sm text-tier-info hover:text-tier-info-dark transition-colors"
          >
            See all areas →
          </Link>
        </div>
        <p className="text-sm text-tier-text-secondary mb-4">
          See how you perform in different training areas (last 90 days)
        </p>

        {taLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tier-info"></div>
          </div>
        ) : trainingAreaStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trainingAreaStats.map((stat) => (
              <div key={stat.area} className="bg-tier-surface-base rounded-lg p-4 border border-tier-border-default">
                <div className="text-sm font-medium text-tier-navy mb-2">{getAreaLabel(stat.area)}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-tier-text-secondary">Sessions</span>
                    <span className="text-sm font-semibold text-tier-navy">{stat.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-tier-text-secondary">Success rate</span>
                    <span className="text-sm font-semibold text-tier-navy">
                      {stat.averageSuccessRate !== null ? `${stat.averageSuccessRate.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-tier-text-secondary">Improvement</span>
                    <span className={`text-sm font-semibold ${getImprovementColor(stat.improvement?.successRate)}`}>
                      {getImprovementIcon(stat.improvement?.successRate)}{' '}
                      {stat.improvement?.successRate !== null
                        ? `${Math.abs(stat.improvement.successRate).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-tier-text-secondary text-center py-8">
            No training data available yet.
          </p>
        )}
      </div>

      {/* Long-term trends */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Long-term trends (12 months)</SubSectionTitle>
        <div className="h-64 bg-tier-surface-base rounded-lg flex items-center justify-center text-tier-text-secondary">
          [12-month trend chart]
        </div>
      </div>
    </div>
  );
}

function StatusMaalTab() {
  const { data: insightsData, loading: insightsLoading } = usePlayerInsights();
  const [showFullInsights, setShowFullInsights] = useState(false);

  return (
    <div className="space-y-6">
      {/* Status mot mål */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Status vs goals</SubSectionTitle>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Avg score goal: 10.0</span>
              <span className="text-sm text-tier-text-secondary">Current: 12.4</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-success h-2 rounded-full" style={{ width: '76%' }}></div>
            </div>
            <div className="text-xs text-tier-text-secondary mt-1">76% of goal reached</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tier-navy">Strokes Gained: +5.0</span>
              <span className="text-sm text-tier-text-secondary">Current: +2.4</span>
            </div>
            <div className="w-full bg-tier-surface-base rounded-full h-2">
              <div className="bg-tier-info h-2 rounded-full" style={{ width: '48%' }}></div>
            </div>
            <div className="text-xs text-tier-text-secondary mt-1">48% of goal reached</div>
          </div>
        </div>
      </div>

      {/* ✅ PHASE 2 INTEGRATION: Player Insights (innsikter) */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <div className="flex items-center justify-between mb-4">
          <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy">Player insights</SubSectionTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFullInsights(!showFullInsights)}
              className="text-sm text-tier-info hover:text-tier-info-dark transition-colors"
            >
              {showFullInsights ? 'Show less' : 'Show more'}
            </button>
            <Link
              to="/player-insights"
              className="text-sm text-tier-info hover:text-tier-info-dark transition-colors"
            >
              Full view →
            </Link>
          </div>
        </div>
        <p className="text-sm text-tier-text-secondary mb-4">
          AI-generated recommendations and insights based on your performance
        </p>

        {insightsLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tier-info"></div>
          </div>
        ) : insightsData ? (
          <div className="space-y-4">
            {/* SG Journey - Compact View */}
            <div className="border border-tier-border-default rounded-lg overflow-hidden">
              <div className="bg-tier-info-light p-3 border-b border-tier-info">
                <div className="text-sm font-medium text-tier-navy">SG Journey</div>
              </div>
              <div className="p-4">
                {showFullInsights ? (
                  <SGJourneyView data={insightsData.sgJourney} />
                ) : (
                  <div className="text-sm text-tier-text-secondary">
                    {insightsData.sgJourney?.summary || 'Your Strokes Gained development shows a positive trend in recent months.'}
                    <div className="mt-2 text-xs">
                      <span className="font-medium text-tier-navy">Key points: </span>
                      {insightsData.sgJourney?.keyPoints?.slice(0, 2).join(', ') || 'Improvement in putting, stable approach'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skill DNA - Compact View */}
            <div className="border border-tier-border-default rounded-lg overflow-hidden">
              <div className="bg-tier-success-light p-3 border-b border-tier-success">
                <div className="text-sm font-medium text-tier-navy">Skill DNA</div>
              </div>
              <div className="p-4">
                {showFullInsights ? (
                  <SkillDNAView data={insightsData.skillDNA} />
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-tier-success-light rounded">
                      <span className="text-tier-text-secondary">Putting</span>
                      <span className="font-semibold text-tier-success">Strength</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-tier-info-light rounded">
                      <span className="text-tier-text-secondary">Approach</span>
                      <span className="font-semibold text-tier-info">Good</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-tier-warning-light rounded">
                      <span className="text-tier-text-secondary">Short Game</span>
                      <span className="font-semibold text-tier-warning">Average</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-tier-error-light rounded">
                      <span className="text-tier-text-secondary">Driving</span>
                      <span className="font-semibold text-tier-error">Weakness</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bounty Board - Compact View */}
            <div className="border border-tier-border-default rounded-lg overflow-hidden">
              <div className="bg-tier-warning-light p-3 border-b border-tier-warning">
                <div className="text-sm font-medium text-tier-navy">Bounty Board</div>
              </div>
              <div className="p-4">
                {showFullInsights ? (
                  <BountyBoardView data={insightsData.bountyBoard} />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-tier-warning">→</span>
                      <span className="text-tier-navy">Focus on driving accuracy for fastest improvement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-tier-info">→</span>
                      <span className="text-tier-navy">Maintain putting strength with regular practice</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-tier-success">→</span>
                      <span className="text-tier-navy">Short game bunker shots have high improvement potential</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-tier-text-secondary text-center py-8">
            No player insights available yet. Play more rounds for AI analysis.
          </p>
        )}
      </div>

      {/* Next milestones */}
      <div className="bg-white rounded-xl border border-tier-border-default p-6">
        <SubSectionTitle style={{ marginBottom: 0 }} className="text-lg font-semibold text-tier-navy mb-4">Next milestones</SubSectionTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
            <div className="w-10 h-10 bg-tier-info-light rounded-full flex items-center justify-center">
              <Target size={20} className="text-tier-info" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-tier-navy">Reach handicap 11.0</div>
              <div className="text-xs text-tier-text-secondary">Estimated: 6 weeks</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
            <div className="w-10 h-10 bg-tier-gold-light rounded-full flex items-center justify-center">
              <Trophy size={20} className="text-tier-gold" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-tier-navy">Earn 'Putting Master' badge</div>
              <div className="text-xs text-tier-text-secondary">2 tests remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyseStatistikkHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as StatistikkTab | null;
  const [activeTab, setActiveTab] = useState<StatistikkTab>(tabParam || 'oversikt');

  // Update URL when tab changes
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: StatistikkTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs: { id: StatistikkTab; label: string; icon: React.ReactNode }[] = [
    { id: 'oversikt', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'strokes-gained', label: 'Strokes Gained', icon: <TrendingUp size={16} /> },
    { id: 'trender', label: 'Trends', icon: <TrendingUp size={16} /> },
    { id: 'status-maal', label: 'Status & Goals', icon: <Target size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Statistics"
          subtitle="Track your development with detailed statistics, strokes gained analysis and trends"
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
          {activeTab === 'oversikt' && <StatistikkOversiktTab />}
          {activeTab === 'strokes-gained' && <StrokesGainedTab />}
          {activeTab === 'trender' && <TrenderTab />}
          {activeTab === 'status-maal' && <StatusMaalTab />}
        </div>
      </div>
    </div>
  );
}
