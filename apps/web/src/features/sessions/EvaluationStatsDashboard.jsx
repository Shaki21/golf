/**
 * TIER Golf - Evaluation Stats Dashboard
 * Design System v3.0 - Premium Light
 *
 * Shows:
 * - Average ratings over time (focus, technical, energy, mental)
 * - Pre-shot routine consistency
 * - Technical cues usage frequency
 * - Session trends and insights
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React from 'react';
import { TrendingUp, TrendingDown, Target, Battery, BarChart2, Calendar } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getIconBgClasses = (colorKey) => {
  switch (colorKey) {
    case 'accent':
      return 'bg-tier-navy/15';
    case 'success':
      return 'bg-tier-success/15';
    case 'warning':
      return 'bg-tier-warning/15';
    case 'error':
      return 'bg-tier-error/15';
    default:
      return 'bg-tier-navy/15';
  }
};

const getIconTextClasses = (colorKey) => {
  switch (colorKey) {
    case 'accent':
      return 'text-tier-navy';
    case 'success':
      return 'text-tier-success';
    case 'warning':
      return 'text-tier-warning';
    case 'error':
      return 'text-tier-error';
    default:
      return 'text-tier-navy';
  }
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ title, value, subtitle, trend, icon: Icon, colorKey = 'accent' }) {
  const trendPositive = trend > 0;
  const trendNegative = trend < 0;
  const TrendIcon = trendPositive ? TrendingUp : trendNegative ? TrendingDown : null;

  return (
    <div className="bg-tier-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-tier-text-secondary">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-tier-navy">
              {value}
            </span>
            {trend !== undefined && TrendIcon && (
              <span className={`flex items-center gap-0.5 text-xs ${trendPositive ? 'text-tier-success' : 'text-tier-error'}`}>
                <TrendIcon size={14} />
                {Math.abs(trend).toFixed(1)}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-xs text-tier-text-secondary">
              {subtitle}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${getIconBgClasses(colorKey)} flex items-center justify-center`}>
            <Icon size={20} className={getIconTextClasses(colorKey)} />
          </div>
        )}
      </div>
    </div>
  );
}

function RatingBar({ label, value, maxValue = 10, colorKey = 'accent' }) {
  const percentage = (value / maxValue) * 100;

  const getBarColorClass = () => {
    switch (colorKey) {
      case 'success': return 'bg-tier-success';
      case 'warning': return 'bg-tier-warning';
      case 'achievement': return 'bg-amber-500';
      default: return 'bg-tier-navy';
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-[15px] text-tier-navy">{label}</span>
        <span className="text-xs font-medium text-tier-navy">{value.toFixed(1)}/10</span>
      </div>
      <div className="w-full h-2 bg-tier-border-default rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TechnicalCuesList({ cues }) {
  if (!cues || cues.length === 0) {
    return (
      <p className="text-[15px] text-tier-text-secondary">
        Ingen tekniske cues registrert enna
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {cues.map((cue, index) => (
        <div
          key={cue.name}
          className={`flex justify-between items-center p-2 rounded-lg ${
            index === 0 ? 'bg-tier-navy/10' : 'bg-tier-surface-base'
          }`}
        >
          <span className="text-[15px] text-tier-navy">
            {cue.name}
          </span>
          <span className="text-xs font-medium text-tier-navy">
            {cue.count}x
          </span>
        </div>
      ))}
    </div>
  );
}

function PreShotRoutineChart({ data }) {
  if (!data) {
    return (
      <p className="text-[15px] text-tier-text-secondary">
        Ingen pre-shot data tilgjengelig
      </p>
    );
  }

  const total = data.yes + data.partial + data.no;
  const percentages = {
    yes: total > 0 ? (data.yes / total) * 100 : 0,
    partial: total > 0 ? (data.partial / total) * 100 : 0,
    no: total > 0 ? (data.no / total) * 100 : 0,
  };

  return (
    <div>
      <div className="flex h-6 rounded-lg overflow-hidden mb-4">
        <div className="bg-tier-success" style={{ width: `${percentages.yes}%` }} />
        <div className="bg-tier-warning" style={{ width: `${percentages.partial}%` }} />
        <div className="bg-tier-error" style={{ width: `${percentages.no}%` }} />
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-tier-success rounded-sm" />
          <span className="text-xs text-tier-text-secondary">Ja ({percentages.yes.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-tier-warning rounded-sm" />
          <span className="text-xs text-tier-text-secondary">Delvis ({percentages.partial.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-tier-error rounded-sm" />
          <span className="text-xs text-tier-text-secondary">Nei ({percentages.no.toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-tier-white rounded-xl p-6 mb-4 shadow-sm">
      <SubSectionTitle className="mb-4">
        {title}
      </SubSectionTitle>
      {children}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EvaluationStatsDashboard({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <span className="text-[15px] text-tier-text-secondary">
          Laster statistikk...
        </span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <span className="text-[15px] text-tier-text-secondary">
          Ingen statistikk tilgjengelig
        </span>
      </div>
    );
  }

  // Calculate trends (compare to previous period)
  const focusTrend = stats.trends?.focus || 0;
  const technicalTrend = stats.trends?.technical || 0;
  const energyTrend = stats.trends?.energy || 0;

  return (
    <div className="bg-tier-white min-h-screen font-sans p-6">
      {/* Header */}
      <div className="mb-6">
        <SectionTitle>
          Evalueringsstatistikk
        </SectionTitle>
        <p className="text-[15px] text-tier-text-secondary">
          Oversikt over dine treningsevalueringer
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 mb-6">
        <StatCard
          title="Antall okter"
          value={stats.totalSessions || 0}
          subtitle="siste 30 dager"
          icon={Calendar}
          colorKey="accent"
        />
        <StatCard
          title="Gj.snitt fokus"
          value={(stats.averages?.focus || 0).toFixed(1)}
          trend={focusTrend}
          icon={Target}
          colorKey="success"
        />
        <StatCard
          title="Gj.snitt teknikk"
          value={(stats.averages?.technical || 0).toFixed(1)}
          trend={technicalTrend}
          icon={BarChart2}
          colorKey="accent"
        />
        <StatCard
          title="Gj.snitt energi"
          value={(stats.averages?.energy || 0).toFixed(1)}
          trend={energyTrend}
          icon={Battery}
          colorKey="warning"
        />
      </div>

      {/* Rating Breakdown */}
      <Section title="Gjennomsnittlige vurderinger">
        <RatingBar
          label="Fokus"
          value={stats.averages?.focus || 0}
          colorKey="success"
        />
        <RatingBar
          label="Teknisk"
          value={stats.averages?.technical || 0}
          colorKey="accent"
        />
        <RatingBar
          label="Energi"
          value={stats.averages?.energy || 0}
          colorKey="warning"
        />
        <RatingBar
          label="Mental"
          value={stats.averages?.mental || 0}
          colorKey="achievement"
        />
      </Section>

      {/* Pre-shot Routine */}
      <Section title="Pre-shot rutine konsistens">
        <PreShotRoutineChart data={stats.preShotRoutine} />
        {stats.preShotRoutine && (
          <div className="mt-4">
            <p className="text-[15px] text-tier-navy">
              Gjennomsnitt: {stats.preShotRoutine.averageCount?.toFixed(0) || 0} av {stats.preShotRoutine.averageTotal?.toFixed(0) || 0} slag
            </p>
          </div>
        )}
      </Section>

      {/* Top Technical Cues */}
      <Section title="Mest brukte tekniske cues">
        <TechnicalCuesList cues={stats.topTechnicalCues} />
      </Section>

      {/* Insights */}
      {stats.insights && stats.insights.length > 0 && (
        <Section title="Innsikt">
          {stats.insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 bg-tier-surface-base rounded-lg mb-2"
            >
              <span className="text-base">{insight.icon || 'TIP'}</span>
              <span className="text-[15px] text-tier-navy">
                {insight.text}
              </span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
