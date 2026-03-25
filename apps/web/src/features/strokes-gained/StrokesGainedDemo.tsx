/**
 * StrokesGainedDemo
 *
 * Demo page showcasing the Pro Dashboard components with mock data.
 * No authentication required - for design review only.
 */

import React from 'react';
import {
  PrimaryKPICard,
  InsightCard,
  InsightCardGrid,
  DiagnosticCard,
  DiagnosticCardGrid,
  DiagnosticSection,
} from '../../components/dashboard/cards';
import {
  formatSG,
  formatDelta,
  formatPercentile,
  getSGSemantic,
} from '../../utils/sgFormatting';
import { TrendingUp, Percent, Users, Target, Flag, Circle, Crosshair } from 'lucide-react';
import { PageTitle, SubSectionTitle, CardTitle } from '../../components/typography';

// Mock data for demonstration
const mockData = {
  total: 1.85,
  trend: 0.23,
  percentile: 85,
  playerCategory: 'G',
  categoryBenchmark: 0.5,
  byCategory: {
    tee: { value: 0.45, pgaElite: 0.8, testCount: 8 },
    approach: { value: 0.72, pgaElite: 0.6, testCount: 12 },
    around_green: { value: 0.38, pgaElite: 0.4, testCount: 6 },
    putting: { value: 0.30, pgaElite: 0.3, testCount: 15 },
  },
  recentTests: [
    { testName: 'Approach 150m', date: '2026-01-09', category: 'Approach', sg: 0.85 },
    { testName: 'Putting 10ft', date: '2026-01-08', category: 'Putting', sg: 0.22 },
    { testName: 'Driver Accuracy', date: '2026-01-07', category: 'Tee', sg: -0.15 },
    { testName: 'Chip & Run', date: '2026-01-06', category: 'Short Game', sg: 0.45 },
  ],
};

const categoryIcons: Record<string, React.ReactNode> = {
  tee: <Target size={16} />,
  approach: <Crosshair size={16} />,
  around_green: <Flag size={16} />,
  putting: <Circle size={16} />,
};

const categoryLabels: Record<string, string> = {
  tee: 'Tee',
  approach: 'Approach',
  around_green: 'Short Game',
  putting: 'Putting',
};

export default function StrokesGainedDemo() {
  return (
    <div className="min-h-screen bg-[rgb(var(--surface-primary))] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <PageTitle style={{ marginBottom: 0 }}>
            Strokes Gained Analytics
          </PageTitle>
          <p className="text-[rgb(var(--text-secondary))]">
            Pro Dashboard Demo - Enterprise-grade analytics UI
          </p>
          <div className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800 inline-block">
            Demo mode - Using mock data
          </div>
        </div>

        {/* Primary KPI: Total Strokes Gained */}
        <section>
          <PrimaryKPICard
            value={mockData.total}
            label="TOTAL STROKES GAINED"
            subtitle="Performance vs PGA Tour average"
            delta={mockData.trend}
            deltaPeriod="30d"
            percentile={mockData.percentile}
            benchmarkLabel={`Category ${mockData.playerCategory}`}
            benchmarkValue={mockData.categoryBenchmark}
            monoValue
          />
        </section>

        {/* Secondary KPIs Row */}
        <section>
          <InsightCardGrid columns={3}>
            <InsightCard
              value={formatDelta(mockData.trend, '30d', '/round')}
              label="30-DAY TREND"
              sublabel="Change per round"
              semantic={getSGSemantic(mockData.trend)}
              icon={<TrendingUp size={16} />}
            />
            <InsightCard
              value={formatPercentile(mockData.percentile)}
              label="PERCENTILE"
              sublabel={`Better than ${mockData.percentile}% of players`}
              semantic="info"
              icon={<Percent size={16} />}
            />
            <InsightCard
              value={formatSG(mockData.total - mockData.categoryBenchmark)}
              label={`VS CATEGORY ${mockData.playerCategory}`}
              sublabel="Comparison with level"
              semantic={getSGSemantic(mockData.total - mockData.categoryBenchmark)}
              icon={<Users size={16} />}
            />
          </InsightCardGrid>
        </section>

        {/* Tertiary: Category Breakdown */}
        <DiagnosticSection title="Category Breakdown">
          <DiagnosticCardGrid columns={4}>
            {Object.entries(mockData.byCategory).map(([key, data]) => (
              <DiagnosticCard
                key={key}
                title={categoryLabels[key]}
                value={data.value}
                icon={categoryIcons[key]}
                benchmarkLabel="PGA Elite"
                benchmarkValue={data.pgaElite}
                testCount={data.testCount}
              />
            ))}
          </DiagnosticCardGrid>
        </DiagnosticSection>

        {/* Recent Tests */}
        <section className="space-y-3">
          <SubSectionTitle style={{ marginBottom: 0 }}>
            Recent Tests
          </SubSectionTitle>
          <div className="space-y-2">
            {mockData.recentTests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--card-diagnostic-bg,rgb(var(--surface-secondary)))] border border-[var(--card-diagnostic-border,rgb(var(--gray-200)))] rounded-[var(--pro-radius-sm,4px)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                    {test.testName}
                  </div>
                  <div className="text-xs text-[rgb(var(--text-tertiary))]">
                    {new Date(test.date).toLocaleDateString('en-US')} • {test.category}
                  </div>
                </div>
                <div
                  className="kpi-value-mono text-base font-semibold ml-4"
                  style={{
                    color: test.sg >= 0
                      ? 'var(--semantic-positive-text, #047857)'
                      : 'var(--semantic-negative-text, #b91c1c)',
                  }}
                >
                  {formatSG(test.sg)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Design Notes */}
        <section className="mt-12 p-6 bg-[rgb(var(--surface-secondary))] rounded-lg border border-[rgb(var(--gray-200))]">
          <SubSectionTitle style={{ marginBottom: '1rem' }}>
            Design System Notes
          </SubSectionTitle>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[rgb(var(--text-secondary))]">
            <div>
              <CardTitle style={{ marginBottom: '0.5rem' }}>Hierarchy</CardTitle>
              <ul className="space-y-1">
                <li>• Primary KPI: 56px value</li>
                <li>• Secondary: 28px value</li>
                <li>• Tertiary: 24px value</li>
              </ul>
            </div>
            <div>
              <CardTitle style={{ marginBottom: '0.5rem' }}>Semantic Colors</CardTitle>
              <ul className="space-y-1">
                <li className="text-[var(--semantic-positive-text,#047857)]">• Positive: Green</li>
                <li className="text-[var(--semantic-negative-text,#b91c1c)]">• Negative: Red</li>
                <li className="text-[var(--semantic-neutral-text,#6b7280)]">• Neutral: Gray</li>
              </ul>
            </div>
            <div>
              <CardTitle style={{ marginBottom: '0.5rem' }}>Pro Tokens</CardTitle>
              <ul className="space-y-1">
                <li>• Reduced radius (4-8px)</li>
                <li>• Border emphasis</li>
                <li>• Tabular numbers</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
