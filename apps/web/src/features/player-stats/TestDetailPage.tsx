/**
 * TestDetailPage - Detailed view for a single test
 * Design System v3.1 - Tailwind CSS
 *
 * Features:
 * - Full test history with interactive chart
 * - Trend analysis and improvement rate
 * - Prediction for reaching target
 * - Coach notes integration
 * - Recommendations
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Calendar,
  Award,
  MessageSquare,
  Zap,
  Clock,
  Lightbulb,
  User,
  Send,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { PageTitle, SectionTitle } from '../../components/typography/Headings';
import useTestResults, { TestResult, CoachNote } from '../../hooks/useTestResults';

// ============================================================================
// COMPONENTS
// ============================================================================

interface HistoryChartProps {
  history: TestResult['history'];
  requirement: number;
  targetRequirement?: number;
  lowerIsBetter: boolean;
  unit: string;
}

const HistoryChart: React.FC<HistoryChartProps> = ({
  history,
  requirement,
  targetRequirement,
  lowerIsBetter,
  unit,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (history.length === 0) return null;

    const values = history.map(h => h.value);
    const allValues = [...values, requirement];
    if (targetRequirement) allValues.push(targetRequirement);

    const maxValue = Math.max(...allValues) * 1.1;
    const minValue = Math.min(...allValues) * 0.9;
    const range = maxValue - minValue || 1;

    return {
      values,
      maxValue,
      minValue,
      range,
      getY: (value: number) => 100 - ((value - minValue) / range) * 80 - 10,
      getX: (index: number) => (history.length > 1 ? (index / (history.length - 1)) * 100 : 50),
    };
  }, [history, requirement, targetRequirement]);

  if (!chartData) return null;

  const points = history.map((h, i) =>
    `${chartData.getX(i)},${chartData.getY(h.value)}`
  ).join(' ');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative h-[200px] pb-6">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40">
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

        {/* Current requirement line */}
        <line
          x1="0"
          y1={chartData.getY(requirement)}
          x2="100"
          y2={chartData.getY(requirement)}
          stroke="var(--status-warning)"
          strokeWidth="0.4"
          strokeDasharray="2,2"
        />

        {/* Target requirement line */}
        {targetRequirement && (
          <line
            x1="0"
            y1={chartData.getY(targetRequirement)}
            x2="100"
            y2={chartData.getY(targetRequirement)}
            stroke="var(--status-success)"
            strokeWidth="0.4"
            strokeDasharray="3,3"
          />
        )}

        {/* Area fill */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#areaGradient)"
          opacity="0.3"
        />

        {/* Data line */}
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data points */}
        {history.map((h, i) => {
          const x = chartData.getX(i);
          const y = chartData.getY(h.value);
          const isHovered = hoveredPoint === i;

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? '3' : '2'}
                fill="white"
                stroke="var(--accent)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-white p-2 rounded-md shadow-md flex flex-col items-center pointer-events-none z-10"
          style={{
            left: `${chartData.getX(hoveredPoint)}%`,
            top: `${chartData.getY(history[hoveredPoint].value) - 15}%`,
          }}
        >
          <span className="text-sm font-semibold text-tier-navy">
            {history[hoveredPoint].value}{unit}
          </span>
          <span className="text-xs text-tier-text-tertiary">
            {formatDate(history[hoveredPoint].testDate)}
          </span>
        </div>
      )}

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
        {history.length <= 8 ? (
          history.map((h, i) => (
            <span key={i} className="text-xs text-tier-text-tertiary">
              {formatDate(h.testDate)}
            </span>
          ))
        ) : (
          <>
            <span className="text-xs text-tier-text-tertiary">{formatDate(history[0].testDate)}</span>
            <span className="text-xs text-tier-text-tertiary">{formatDate(history[Math.floor(history.length / 2)].testDate)}</span>
            <span className="text-xs text-tier-text-tertiary">{formatDate(history[history.length - 1].testDate)}</span>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex gap-3">
        <div className="flex items-center gap-1 text-xs text-tier-text-tertiary">
          <span className="w-4 h-0 border-t-2 border-dashed border-amber-500" />
          <span>Krav</span>
        </div>
        {targetRequirement && (
          <div className="flex items-center gap-1 text-xs text-tier-text-tertiary">
            <span className="w-4 h-0 border-t-2 border-dashed border-green-500" />
            <span>Mål</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  colorClass?: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, subValue, colorClass = 'text-tier-gold' }) => (
  <div className="flex items-start gap-3">
    <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-tier-surface-subtle shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-tier-text-tertiary">{label}</span>
      <span className={`text-lg font-semibold ${colorClass === 'text-tier-gold' ? 'text-tier-navy' : colorClass}`}>
        {value}
      </span>
      {subValue && <span className="text-xs text-tier-text-tertiary">{subValue}</span>}
    </div>
  </div>
);

interface CoachNoteCardProps {
  note: CoachNote;
}

const CoachNoteCard: React.FC<CoachNoteCardProps> = ({ note }) => {
  const typeStyles: Record<CoachNote['type'], { bgClass: string; icon: React.ReactNode }> = {
    observation: { bgClass: 'bg-gray-50', icon: <MessageSquare size={14} /> },
    recommendation: { bgClass: 'bg-amber-50', icon: <Lightbulb size={14} /> },
    praise: { bgClass: 'bg-green-50', icon: <Award size={14} /> },
    focus: { bgClass: 'bg-blue-50', icon: <Target size={14} /> },
  };

  const style = typeStyles[note.type];

  return (
    <div className={`p-4 rounded-lg ${style.bgClass}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-tier-gold text-white flex items-center justify-center">
            <User size={12} />
          </div>
          <span className="text-sm font-semibold text-tier-navy">{note.coachName}</span>
        </div>
        <span className="text-xs text-tier-text-tertiary">
          {new Date(note.createdAt).toLocaleDateString('no-NO', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>
      <p className="text-sm text-tier-navy m-0 leading-relaxed">{note.content}</p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TestDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const navigate = useNavigate();

  const { tests, loading, playerCategory, targetCategory } = useTestResults();
  const [newNote, setNewNote] = useState('');

  const test = useMemo(() => {
    return tests.find(t => t.id === testId);
  }, [tests, testId]);

  if (loading) {
    return (
      <StateCard
        variant="loading"
        title="Laster testdetaljer..."
        description="Henter historikk og analyse"
      />
    );
  }

  if (!test) {
    return (
      <StateCard
        variant="empty"
        icon={Target}
        title="Test ikke funnet"
        description="Kunne ikke finne den forespurte testen"
        action={
          <Button onClick={() => navigate('/statistikk?tab=testresultater')}>
            Tilbake til testresultater
          </Button>
        }
      />
    );
  }

  const trendIcon = test.trend === 'improving' ? (
    <TrendingUp size={16} className="text-green-600" />
  ) : test.trend === 'declining' ? (
    <TrendingDown size={16} className="text-red-600" />
  ) : (
    <Minus size={16} className="text-tier-text-tertiary" />
  );

  const formatPrediction = (days: number | null): string => {
    if (days === null) return 'Ukjent';
    if (days === 0) return 'Oppnådd!';
    if (days < 7) return `${days} dager`;
    if (days < 30) return `${Math.ceil(days / 7)} uker`;
    return `${Math.ceil(days / 30)} mnd`;
  };

  const progressPercent = Math.min(100, Math.round(
    test.lowerIsBetter
      ? ((test.targetRequirement ?? test.requirement) / test.currentValue) * 100
      : (test.currentValue / (test.targetRequirement ?? test.requirement)) * 100
  ));

  return (
    <div className="flex flex-col gap-5 p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/statistikk?tab=testresultater')}
          className="flex items-center justify-center w-10 h-10 rounded-lg border-none bg-tier-surface-subtle cursor-pointer text-tier-navy hover:bg-tier-surface-base transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="text-3xl">{test.icon}</div>
          <div>
            <PageTitle className="mb-0">{test.name}</PageTitle>
            <p className="text-sm text-tier-text-secondary m-0 capitalize">{test.category}</p>
          </div>
        </div>
        <Badge
          variant={test.meetsCurrent ? 'success' : 'warning'}
          size="md"
        >
          {test.meetsCurrent ? 'Oppfylt' : 'Under krav'}
        </Badge>
      </div>

      {/* Current Value Hero */}
      <Card variant="elevated" padding="spacious" className="bg-gradient-to-br from-white to-tier-surface-subtle">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs text-tier-text-tertiary uppercase tracking-wide">Nåværende</span>
            <span className={`text-5xl font-bold leading-tight tabular-nums ${test.meetsCurrent ? 'text-green-600' : 'text-amber-500'}`}>
              {test.currentValue}{test.unit}
            </span>
            <div className="flex items-center gap-1 mt-2 text-sm font-medium">
              {trendIcon}
              <span className={
                test.trend === 'improving' ? 'text-green-600' :
                test.trend === 'declining' ? 'text-red-600' : 'text-tier-text-tertiary'
              }>
                {test.trendPercent > 0 ? `${test.trendPercent.toFixed(1)}%` : 'Stabil'}
              </span>
            </div>
          </div>

          <div className="w-px h-20 bg-tier-border-subtle" />

          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-tier-text-tertiary">Krav (Kat. {playerCategory})</span>
              <span className="text-lg font-semibold text-tier-navy">
                {test.lowerIsBetter ? '≤' : '≥'} {test.requirement}{test.unit}
              </span>
            </div>
            {test.targetRequirement && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-tier-text-tertiary">Mål (Kat. {targetCategory})</span>
                <span className="text-lg font-semibold text-tier-navy">
                  {test.lowerIsBetter ? '≤' : '≥'} {test.targetRequirement}{test.unit}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* History Chart */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0">Historikk</SectionTitle>
        <Card padding="md">
          <HistoryChart
            history={test.history}
            requirement={test.requirement}
            targetRequirement={test.targetRequirement}
            lowerIsBetter={test.lowerIsBetter}
            unit={test.unit}
          />
        </Card>
      </section>

      {/* Stats Grid */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0">Statistikk</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Card padding="md">
            <StatBox
              icon={<Target size={18} />}
              label="Beste resultat"
              value={`${test.bestValue}${test.unit}`}
              colorClass="text-green-600"
            />
          </Card>
          <Card padding="md">
            <StatBox
              icon={<Calendar size={18} />}
              label="Antall tester"
              value={test.testCount.toString()}
              subValue="totalt"
            />
          </Card>
          <Card padding="md">
            <StatBox
              icon={<Zap size={18} />}
              label="Forbedring/uke"
              value={`${test.improvementRate > 0 ? '+' : ''}${test.improvementRate}${test.unit}`}
              colorClass={test.improvementRate > 0 ? 'text-green-600' : 'text-tier-text-tertiary'}
            />
          </Card>
          <Card padding="md">
            <StatBox
              icon={<Clock size={18} />}
              label="Tid til mål"
              value={formatPrediction(test.predictedDaysToTarget)}
              colorClass={test.predictedDaysToTarget === 0 ? 'text-green-600' : 'text-tier-gold'}
            />
          </Card>
        </div>
      </section>

      {/* Progress to Target */}
      {test.targetRequirement && (
        <section className="flex flex-col gap-3">
          <SectionTitle className="m-0">Progresjon mot mål</SectionTitle>
          <Card padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-tier-text-secondary">
                  Fra {test.lowerIsBetter ? 'over' : 'under'} krav til kategori {targetCategory}
                </span>
                <span className="text-base font-semibold text-tier-gold">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-3 bg-tier-surface-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tier-gold to-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-tier-text-tertiary">
                <span>{test.history[0]?.value ?? '-'}{test.unit}</span>
                <span className="text-tier-gold font-semibold">
                  {test.currentValue}{test.unit}
                </span>
                <span>{test.targetRequirement}{test.unit}</span>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Recommendations */}
      {test.recommendations.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle className="m-0">Anbefalinger</SectionTitle>
          <Card padding="md">
            <div className="flex flex-col gap-3">
              {test.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-tier-navy">
                  <Lightbulb size={16} className="text-amber-500 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Coach Notes */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SectionTitle className="m-0">Trenernotater</SectionTitle>
          <Badge variant="accent" size="sm">{test.coachNotes.length}</Badge>
        </div>

        {test.coachNotes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {test.coachNotes.map(note => (
              <CoachNoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <Card padding="md">
            <div className="flex flex-col items-center gap-2 py-4 text-tier-text-tertiary text-sm">
              <MessageSquare size={24} />
              <p className="m-0">Ingen trenernotater ennå</p>
            </div>
          </Card>
        )}

        {/* Add note (coach view) */}
        <Card padding="md" className="mt-3">
          <div className="flex gap-3 items-end">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Skriv en kommentar til spilleren..."
              className="flex-1 p-3 rounded-lg border border-tier-border-subtle text-sm resize-none font-sans focus:outline-none focus:ring-2 focus:ring-tier-gold/50"
              rows={2}
            />
            <Button
              variant="primary"
              size="sm"
              disabled={!newNote.trim()}
              className="flex items-center gap-2"
            >
              <Send size={14} />
              Send
            </Button>
          </div>
        </Card>
      </section>

      {/* Quick Actions */}
      <div className="flex gap-3 pt-4 border-t border-tier-border-subtle">
        <Button
          variant="secondary"
          onClick={() => navigate(`/testing/registrer?testId=${test.id}`)}
        >
          <Target size={16} />
          Registrer ny test
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/statistikk?tab=testresultater')}
        >
          Tilbake til oversikt
        </Button>
      </div>
    </div>
  );
};

export default TestDetailPage;
