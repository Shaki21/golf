/**
 * TestComparisonWidget - Compare multiple tests side by side
 * Design System v3.1 - Tailwind CSS
 *
 * Features:
 * - Multi-test selection
 * - Overlaid history charts
 * - Correlation analysis
 * - Relative performance comparison
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  GitCompare,
  ChevronDown,
  Check,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import useTestResults, { TestResult, TestCategory } from '../../hooks/useTestResults';

// ============================================================================
// TYPES
// ============================================================================

interface ComparisonData {
  test: TestResult;
  normalizedHistory: { date: string; value: number }[];
  color: string;
}

const CHART_COLORS = [
  '#C9A227',
  '#16a34a',
  '#f59e0b',
  '#ef4444',
  '#7c3aed',
  '#0284c7',
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface TestSelectorProps {
  tests: TestResult[];
  selectedIds: string[];
  onToggle: (testId: string) => void;
  maxSelections?: number;
}

const TestSelector: React.FC<TestSelectorProps> = ({
  tests,
  selectedIds,
  onToggle,
  maxSelections = 4,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TestCategory | 'all'>('all');

  const categories = useMemo(() => {
    return [...new Set(tests.map(t => t.category))];
  }, [tests]);

  const filteredTests = useMemo(() => {
    if (categoryFilter === 'all') return tests;
    return tests.filter(t => t.category === categoryFilter);
  }, [tests, categoryFilter]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-tier-border-subtle bg-white text-sm text-tier-navy cursor-pointer hover:bg-tier-surface-subtle transition-colors"
      >
        <Plus size={16} />
        <span>Legg til test ({selectedIds.length}/{maxSelections})</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[280px] bg-white border border-tier-border-subtle rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Category Filter */}
          <div className="flex p-2 gap-1 border-b border-tier-border-subtle overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 rounded text-xs cursor-pointer whitespace-nowrap border-none ${
                categoryFilter === 'all'
                  ? 'bg-tier-gold text-white'
                  : 'bg-transparent text-tier-text-secondary hover:bg-tier-surface-subtle'
              }`}
            >
              Alle
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 rounded text-xs cursor-pointer whitespace-nowrap capitalize border-none ${
                  categoryFilter === cat
                    ? 'bg-tier-gold text-white'
                    : 'bg-transparent text-tier-text-secondary hover:bg-tier-surface-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Test List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredTests.map(test => {
              const isSelected = selectedIds.includes(test.id);
              const isDisabled = !isSelected && selectedIds.length >= maxSelections;

              return (
                <button
                  key={test.id}
                  onClick={() => !isDisabled && onToggle(test.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 w-full px-3 py-2 border-none text-sm text-left cursor-pointer ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'bg-indigo-50' : 'bg-transparent hover:bg-tier-surface-subtle'}`}
                >
                  <span className="text-base">{test.icon}</span>
                  <span className="flex-1 text-tier-navy">{test.name}</span>
                  {isSelected && <Check size={16} className="text-tier-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface ComparisonChartProps {
  data: ComparisonData[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ testIdx: number; pointIdx: number } | null>(null);

  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const allDates = data.flatMap(d => d.normalizedHistory.map(h => h.date));
    const uniqueDates = [...new Set(allDates)].sort();

    const allValues = data.flatMap(d => d.normalizedHistory.map(h => h.value));
    const maxValue = Math.max(...allValues, 100);
    const minValue = Math.min(...allValues, 0);
    const range = maxValue - minValue || 1;

    return {
      dates: uniqueDates,
      maxValue,
      minValue,
      range,
      getY: (value: number) => 100 - ((value - minValue) / range) * 80 - 10,
      getX: (date: string) => {
        const idx = uniqueDates.indexOf(date);
        return uniqueDates.length > 1 ? (idx / (uniqueDates.length - 1)) * 100 : 50;
      },
    };
  }, [data]);

  if (!chartData || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-40 text-tier-text-tertiary text-sm">
        <GitCompare size={32} />
        <p className="m-0">Velg minst én test for å vise sammenligning</p>
      </div>
    );
  }

  return (
    <div className="relative h-[200px] pl-8">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[20, 40, 60, 80].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--border-subtle)"
            strokeWidth="0.2"
          />
        ))}

        {/* 100% line (target) */}
        <line
          x1="0"
          y1={chartData.getY(100)}
          x2="100"
          y2={chartData.getY(100)}
          stroke="#16a34a"
          strokeWidth="0.3"
          strokeDasharray="2,2"
        />

        {/* Data lines for each test */}
        {data.map((d, testIdx) => {
          const points = d.normalizedHistory
            .map(h => `${chartData.getX(h.date)},${chartData.getY(h.value)}`)
            .join(' ');

          return (
            <g key={d.test.id}>
              <polyline
                fill="none"
                stroke={d.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                opacity={hoveredPoint && hoveredPoint.testIdx !== testIdx ? 0.3 : 1}
              />

              {d.normalizedHistory.map((h, pointIdx) => {
                const isHovered = hoveredPoint?.testIdx === testIdx && hoveredPoint?.pointIdx === pointIdx;

                return (
                  <circle
                    key={pointIdx}
                    cx={chartData.getX(h.date)}
                    cy={chartData.getY(h.value)}
                    r={isHovered ? '3' : '2'}
                    fill="white"
                    stroke={d.color}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ testIdx, pointIdx })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-white p-2 rounded shadow-md flex flex-col items-center pointer-events-none z-10"
          style={{
            left: `${chartData.getX(data[hoveredPoint.testIdx].normalizedHistory[hoveredPoint.pointIdx].date)}%`,
            top: `${chartData.getY(data[hoveredPoint.testIdx].normalizedHistory[hoveredPoint.pointIdx].value) - 15}%`,
            borderColor: data[hoveredPoint.testIdx].color,
            borderWidth: 2,
          }}
        >
          <span className="text-[10px] text-tier-text-secondary">{data[hoveredPoint.testIdx].test.name}</span>
          <span className="text-base font-semibold text-tier-navy">
            {data[hoveredPoint.testIdx].normalizedHistory[hoveredPoint.pointIdx].value.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Y-axis labels */}
      <div className="absolute left-0 top-[10%] bottom-[10%] flex flex-col justify-between text-[10px] text-tier-text-tertiary">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>
    </div>
  );
};

interface TestLegendProps {
  data: ComparisonData[];
  onRemove: (testId: string) => void;
}

const TestLegend: React.FC<TestLegendProps> = ({ data, onRemove }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {data.map(d => (
        <div key={d.test.id} className="flex items-center gap-2 px-2 py-1 bg-tier-surface-subtle rounded text-sm">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color }} />
          <span className="text-sm">{d.test.icon}</span>
          <span className="text-tier-navy">{d.test.name}</span>
          <button
            onClick={() => onRemove(d.test.id)}
            className="flex items-center justify-center w-4 h-4 rounded-full border-none bg-tier-surface-base text-tier-text-tertiary cursor-pointer hover:bg-tier-border-subtle transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

interface ComparisonTableProps {
  data: ComparisonData[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left p-2 border-b border-tier-border-subtle text-tier-text-secondary font-medium">Test</th>
            <th className="text-left p-2 border-b border-tier-border-subtle text-tier-text-secondary font-medium">Nåværende</th>
            <th className="text-left p-2 border-b border-tier-border-subtle text-tier-text-secondary font-medium">Mål</th>
            <th className="text-left p-2 border-b border-tier-border-subtle text-tier-text-secondary font-medium">Progresjon</th>
            <th className="text-left p-2 border-b border-tier-border-subtle text-tier-text-secondary font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => {
            const progress = d.normalizedHistory[d.normalizedHistory.length - 1]?.value ?? 0;

            return (
              <tr key={d.test.id}>
                <td className="p-2 border-b border-tier-border-subtle text-tier-navy">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span>{d.test.icon}</span>
                    <span>{d.test.name}</span>
                  </div>
                </td>
                <td className="p-2 border-b border-tier-border-subtle text-tier-navy">
                  {d.test.currentValue}{d.test.unit}
                </td>
                <td className="p-2 border-b border-tier-border-subtle text-tier-navy">
                  {d.test.lowerIsBetter ? '≤' : '≥'} {d.test.requirement}{d.test.unit}
                </td>
                <td className="p-2 border-b border-tier-border-subtle text-tier-navy">
                  <div className="flex items-center gap-2">
                    <div className="w-[60px] h-1.5 bg-tier-surface-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, progress)}%`,
                          backgroundColor: progress >= 100 ? '#16a34a' : d.color,
                        }}
                      />
                    </div>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="p-2 border-b border-tier-border-subtle">
                  <div className="flex items-center gap-1">
                    {d.test.trend === 'improving' ? (
                      <>
                        <TrendingUp size={14} className="text-green-600" />
                        <span className="text-green-600">+{d.test.trendPercent}%</span>
                      </>
                    ) : d.test.trend === 'declining' ? (
                      <>
                        <TrendingDown size={14} className="text-red-600" />
                        <span className="text-red-600">-{d.test.trendPercent}%</span>
                      </>
                    ) : (
                      <>
                        <Minus size={14} className="text-tier-text-tertiary" />
                        <span className="text-tier-text-tertiary">Stabil</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TestComparisonWidgetProps {
  initialTestIds?: string[];
}

const TestComparisonWidget: React.FC<TestComparisonWidgetProps> = ({
  initialTestIds = [],
}) => {
  const { tests, loading } = useTestResults();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialTestIds);

  const handleToggle = (testId: string) => {
    setSelectedIds(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleRemove = (testId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== testId));
  };

  const comparisonData: ComparisonData[] = useMemo(() => {
    return selectedIds
      .map((id, idx) => {
        const test = tests.find(t => t.id === id);
        if (!test) return null;

        const normalizedHistory = test.history.map(h => ({
          date: h.testDate.split('T')[0],
          value: test.lowerIsBetter
            ? (test.requirement / h.value) * 100
            : (h.value / test.requirement) * 100,
        }));

        return {
          test,
          normalizedHistory,
          color: CHART_COLORS[idx % CHART_COLORS.length],
        };
      })
      .filter((d): d is ComparisonData => d !== null);
  }, [selectedIds, tests]);

  const insights = useMemo(() => {
    if (comparisonData.length < 2) return [];

    const result: string[] = [];

    const sorted = [...comparisonData].sort((a, b) => {
      const aProgress = a.normalizedHistory[a.normalizedHistory.length - 1]?.value ?? 0;
      const bProgress = b.normalizedHistory[b.normalizedHistory.length - 1]?.value ?? 0;
      return bProgress - aProgress;
    });

    if (sorted.length >= 2) {
      result.push(`${sorted[0].test.name} har best progresjon (${sorted[0].normalizedHistory[sorted[0].normalizedHistory.length - 1]?.value.toFixed(0)}%)`);
      result.push(`${sorted[sorted.length - 1].test.name} trenger mest fokus`);
    }

    const improving = comparisonData.filter(d => d.test.trend === 'improving');
    const declining = comparisonData.filter(d => d.test.trend === 'declining');

    if (improving.length === comparisonData.length) {
      result.push('Alle valgte tester viser positiv utvikling!');
    } else if (declining.length > 0) {
      result.push(`${declining.length} test${declining.length > 1 ? 'er' : ''} viser nedgang`);
    }

    return result;
  }, [comparisonData]);

  if (loading) {
    return (
      <Card padding="spacious">
        <div className="flex items-center justify-center p-8 text-tier-text-tertiary">
          Laster tester...
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <GitCompare size={20} className="text-tier-gold" />
          <SectionTitle className="m-0">Sammenlign tester</SectionTitle>
        </div>
        <TestSelector
          tests={tests}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          maxSelections={4}
        />
      </div>

      {/* Legend */}
      {comparisonData.length > 0 && (
        <TestLegend data={comparisonData} onRemove={handleRemove} />
      )}

      {/* Chart */}
      <Card padding="md">
        <SubSectionTitle className="m-0 mb-3">
          Normalisert progresjon mot krav
        </SubSectionTitle>
        <ComparisonChart data={comparisonData} />
      </Card>

      {/* Comparison Table */}
      {comparisonData.length > 0 && (
        <Card padding="md">
          <SubSectionTitle className="m-0 mb-3">Detaljert sammenligning</SubSectionTitle>
          <ComparisonTable data={comparisonData} />
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card padding="md" className="bg-indigo-50 border border-tier-gold">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-tier-gold" />
            <SubSectionTitle className="m-0 text-tier-gold">Innsikt</SubSectionTitle>
          </div>
          <ul className="m-0 pl-5">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-tier-navy mb-1">{insight}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default TestComparisonWidget;
