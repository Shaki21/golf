import React, { useState } from 'react';
import {
  TrendingUp, ChevronRight,
  ArrowUp, ArrowDown, Minus, BarChart2
} from 'lucide-react';
import { SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';

// ============================================================================
// MOCK DATA
// ============================================================================

const BENCHMARK_TESTS = [
  {
    id: 'driving_distance',
    name: 'Driver distance',
    unit: 'm',
    category: 'Driving',
    history: [
      { date: '2025-01-15', value: 255, percentile: 78 },
      { date: '2024-12-15', value: 248, percentile: 72 },
      { date: '2024-11-15', value: 245, percentile: 70 },
      { date: '2024-10-01', value: 240, percentile: 65 },
      { date: '2024-08-01', value: 235, percentile: 60 },
    ],
    target: 260,
    categoryAvg: 242,
  },
  {
    id: 'driving_accuracy',
    name: 'Fairway hit',
    unit: '%',
    category: 'Driving',
    history: [
      { date: '2025-01-15', value: 68, percentile: 72 },
      { date: '2024-12-15', value: 65, percentile: 68 },
      { date: '2024-11-15', value: 62, percentile: 62 },
      { date: '2024-10-01', value: 58, percentile: 55 },
    ],
    target: 75,
    categoryAvg: 62,
  },
  {
    id: 'gir',
    name: 'GIR',
    unit: '%',
    category: 'Iron Play',
    history: [
      { date: '2025-01-15', value: 55, percentile: 68 },
      { date: '2024-12-15', value: 52, percentile: 62 },
      { date: '2024-11-15', value: 48, percentile: 55 },
      { date: '2024-10-01', value: 45, percentile: 48 },
    ],
    target: 65,
    categoryAvg: 50,
  },
  {
    id: 'scrambling',
    name: 'Scrambling',
    unit: '%',
    category: 'Short Game',
    history: [
      { date: '2025-01-15', value: 58, percentile: 75 },
      { date: '2024-12-15', value: 55, percentile: 70 },
      { date: '2024-11-15', value: 52, percentile: 65 },
    ],
    target: 65,
    categoryAvg: 48,
  },
  {
    id: 'putts_per_round',
    name: 'Putts per round',
    unit: '',
    category: 'Putting',
    history: [
      { date: '2025-01-15', value: 31.5, percentile: 62 },
      { date: '2024-12-15', value: 32.2, percentile: 55 },
      { date: '2024-11-15', value: 33.0, percentile: 48 },
    ],
    target: 30,
    categoryAvg: 32.5,
    lowerIsBetter: true,
  },
  {
    id: 'club_speed',
    name: 'Club speed driver',
    unit: 'mph',
    category: 'Physical',
    history: [
      { date: '2025-01-15', value: 108, percentile: 82 },
      { date: '2024-12-15', value: 106, percentile: 78 },
      { date: '2024-11-15', value: 104, percentile: 72 },
      { date: '2024-10-01', value: 102, percentile: 68 },
    ],
    target: 112,
    categoryAvg: 100,
  },
];

const CATEGORIES = ['All', 'Driving', 'Iron Play', 'Short Game', 'Putting', 'Physical'];

// ============================================================================
// HELPERS
// ============================================================================

const getTrend = (history, lowerIsBetter = false) => {
  if (history.length < 2) return 'stable';
  const latest = history[0].value;
  const previous = history[1].value;
  if (lowerIsBetter) {
    return latest < previous ? 'up' : latest > previous ? 'down' : 'stable';
  }
  return latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
};

const getChange = (history) => {
  if (history.length < 2) return '0';
  const diff = history[0].value - history[1].value;
  const prefix = diff > 0 ? '+' : '';
  return `${prefix}${diff.toFixed(1)}`;
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <ArrowUp size={14} style={{ color: 'var(--status-success)' }} />;
  if (trend === 'down') return <ArrowDown size={14} style={{ color: 'var(--status-error)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-secondary)' }} />;
};

// ============================================================================
// BENCHMARK CARD
// ============================================================================

const BenchmarkCard = ({ test, onClick }) => {
  const latest = test.history[0];
  const trend = getTrend(test.history, test.lowerIsBetter);
  const change = getChange(test.history);
  const progressToTarget = test.lowerIsBetter
    ? Math.max(0, Math.min(100, ((test.history[test.history.length - 1].value - latest.value) / (test.history[test.history.length - 1].value - test.target)) * 100))
    : Math.max(0, Math.min(100, (latest.value / test.target) * 100));

  return (
    <Card variant="default" padding="none">
      <div
        onClick={() => onClick(test)}
        style={{
          padding: 'var(--spacing-4)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-3)',
        }}>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
              color: 'var(--accent)',
            }}>
              {test.category}
            </span>
            <SubSectionTitle style={{ fontSize: '15px', marginTop: 'var(--spacing-1)' }}>
              {test.name}
            </SubSectionTitle>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Current Value */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)',
        }}>
          <span style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {latest.value}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {test.unit}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            marginLeft: 'var(--spacing-2)',
          }}>
            <TrendIcon trend={trend} />
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: trend === 'up' ? 'var(--status-success)' :
                     trend === 'down' ? 'var(--status-error)' : 'var(--text-secondary)',
            }}>
              {change}
            </span>
          </div>
        </div>

        {/* Progress to Target */}
        <div style={{ marginBottom: 'var(--spacing-3)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-1)',
          }}>
            <span>Target: {test.target}{test.unit}</span>
            <span>{Math.round(progressToTarget)}%</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressToTarget}%`,
              backgroundColor: progressToTarget >= 100 ? 'var(--status-success)' :
                             progressToTarget >= 75 ? 'var(--accent)' : 'var(--status-warning)',
              borderRadius: '3px',
            }} />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-4)',
          paddingTop: 'var(--spacing-3)',
          borderTop: '1px solid var(--border-default)',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Percentile</div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: latest.percentile >= 75 ? 'var(--status-success)' :
                     latest.percentile >= 50 ? 'var(--accent)' : 'var(--status-warning)',
            }}>
              {latest.percentile}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cat. avg</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {test.categoryAvg}{test.unit}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Measurements</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {test.history.length}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BenchmarkHistorikkContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTests = BENCHMARK_TESTS.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  return (
    <div style={{ width: '100%' }}>
        {/* Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-6)',
        }}>
          <Card variant="default" padding="none">
            <div style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)' }}>
                {BENCHMARK_TESTS.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>Benchmarks</div>
            </div>
          </Card>
          <Card variant="default" padding="none">
            <div style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-1)',
              }}>
                <TrendingUp size={18} />
                {BENCHMARK_TESTS.filter((t) => getTrend(t.history, t.lowerIsBetter) === 'up').length}
              </div>
              <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>Improved</div>
            </div>
          </Card>
          <Card variant="default" padding="none">
            <div style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--status-warning)' }}>
                {Math.round(BENCHMARK_TESTS.reduce((sum, t) => sum + t.history[0].percentile, 0) / BENCHMARK_TESTS.length)}%
              </div>
              <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>Avg percentile</div>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-1)',
          marginBottom: 'var(--spacing-5)',
          overflowX: 'auto',
          paddingBottom: 'var(--spacing-1)',
        }}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Benchmark Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-3)',
        }}>
          {filteredTests.map((test) => (
            <BenchmarkCard
              key={test.id}
              test={test}
              onClick={() => {/* View test details */}}
            />
          ))}
        </div>

        {filteredTests.length === 0 && (
          <Card variant="default" padding="none">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <BarChart2 size={40} style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-3)' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                No benchmarks found in this category
              </p>
            </div>
          </Card>
        )}
    </div>
  );
};

export default BenchmarkHistorikkContainer;
