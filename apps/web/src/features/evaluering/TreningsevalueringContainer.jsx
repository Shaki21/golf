/**
 * TIER Golf - Treningsevaluering Container
 * Design System v3.0 - Premium Light
 *
 * Training session evaluations with session type filtering.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import {
  Dumbbell, Star, ChevronRight, Plus, Target,
  Clock, TrendingUp, Brain, Flag, Flame, CheckCircle
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../components/typography';
import StateCard from '../../ui/composites/StateCard';

// ============================================================================
// MOCK DATA
// ============================================================================

const TRAINING_EVALUATIONS = [
  {
    id: 't1',
    date: '2025-01-15',
    sessionType: 'technical',
    sessionName: 'Driver-trening',
    duration: 90,
    rating: 4,
    energyLevel: 4,
    focus: 'Tempo og sekvens',
    achievements: ['Ny toppfart 110 mph', 'Konsistent ballbane'],
    challenges: ['Litt inkonsistent pa impact'],
    notes: 'God okt totalt sett. Tempoet er mye bedre etter forrige ukes arbeid.',
    coachFeedback: 'Bra jobba! Fokuser pa a holde venstre arm rett lengre i nedsvingen.',
    drillsCompleted: ['Alignment drill', 'Tempo drill 1-2-3', 'Full sving med mal'],
    metrics: { ballSpeed: '158 mph', clubSpeed: '108 mph', smash: '1.46' },
  },
  {
    id: 't2',
    date: '2025-01-13',
    sessionType: 'short_game',
    sessionName: 'Kortspill-okt',
    duration: 75,
    rating: 5,
    energyLevel: 5,
    focus: 'Bunker og chipping',
    achievements: ['80% sand saves', 'Utmerket avstandskontroll'],
    challenges: [],
    notes: 'En av de beste kortspill-oktene pa lenge. Alt klaffet i dag.',
    coachFeedback: 'Fantastisk okt! Hold dette fokuset.',
    drillsCompleted: ['Gate drill', 'Ladder drill', 'Up-and-down challenge'],
    metrics: { sandSaves: '8/10', upAndDowns: '7/10' },
  },
  {
    id: 't3',
    date: '2025-01-10',
    sessionType: 'physical',
    sessionName: 'Styrketrening',
    duration: 60,
    rating: 4,
    energyLevel: 3,
    focus: 'Core og rotasjon',
    achievements: ['Ny PR i squat', 'God core-aktivering'],
    challenges: ['Litt sliten etter garsagens lange dag'],
    notes: 'Tross litt sliten, fikk jeg ny PR. Core-ovelsene gar bedre og bedre.',
    coachFeedback: null,
    drillsCompleted: ['Squats', 'Rotasjon med band', 'Planke varianter'],
    metrics: { squatPR: '100 kg', coreHold: '90 sek' },
  },
  {
    id: 't4',
    date: '2025-01-08',
    sessionType: 'mental',
    sessionName: 'Mental trening',
    duration: 45,
    rating: 3,
    energyLevel: 4,
    focus: 'Visualisering',
    achievements: ['Fullforte hele visualiseringsokten'],
    challenges: ['Vanskelig a holde fokus', 'Distrahert av tanker'],
    notes: 'Visualisering er fortsatt utfordrende. Trenger mer ovelse.',
    coachFeedback: 'Start med kortere okter (10 min) og bygg opp gradvis.',
    drillsCompleted: ['Pusteovelser', 'Visualisering 18 hull', 'Affirmations'],
    metrics: null,
  },
];

const STATS = {
  totalSessions: 45,
  thisMonth: 12,
  avgRating: 4.1,
  avgDuration: 72,
  mostCommon: 'Teknikk',
  improvement: '+0.3',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSessionTypeConfig = (type) => {
  switch (type) {
    case 'technical':
      return { label: 'Technical', colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' }, icon: Target };
    case 'short_game':
      return { label: 'Short Game', colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success' }, icon: Flag };
    case 'physical':
      return { label: 'Physical', colorClasses: { bg: 'bg-tier-error/15', text: 'text-tier-error' }, icon: Dumbbell };
    case 'mental':
      return { label: 'Mental', colorClasses: { bg: 'bg-amber-500/15', text: 'text-amber-600' }, icon: Brain };
    case 'warmup':
      return { label: 'Warmup', colorClasses: { bg: 'bg-tier-warning/15', text: 'text-tier-warning' }, icon: Flame };
    default:
      return { label: type, colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: Dumbbell };
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// ============================================================================
// RATING COMPONENT
// ============================================================================

const RatingStars = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        fill={star <= rating ? 'rgb(var(--tier-gold))' : 'none'}
        className={star <= rating ? 'text-tier-gold' : 'text-tier-border-default'}
      />
    ))}
  </div>
);

// ============================================================================
// EVALUATION CARD COMPONENT
// ============================================================================

const TrainingEvaluationCard = ({ evaluation, onClick }) => {
  const typeConfig = getSessionTypeConfig(evaluation.sessionType);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => onClick(evaluation)}
      className="bg-tier-white rounded-[14px] p-4 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-11 h-11 rounded-[10px] ${typeConfig.colorClasses.bg} flex items-center justify-center flex-shrink-0`}>
          <TypeIcon size={22} className={typeConfig.colorClasses.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
                {evaluation.sessionName}
              </SubSectionTitle>
              <div className="flex items-center gap-2.5 mt-1">
                <span className={`text-[11px] font-medium py-0.5 px-2 rounded ${typeConfig.colorClasses.bg} ${typeConfig.colorClasses.text}`}>
                  {typeConfig.label}
                </span>
                <span className="text-xs text-tier-text-secondary">
                  {formatDate(evaluation.date)}
                </span>
                <span className="text-xs text-tier-text-secondary flex items-center gap-1">
                  <Clock size={12} />
                  {evaluation.duration} min
                </span>
              </div>
            </div>
            <RatingStars rating={evaluation.rating} />
          </div>

          <p className="text-[13px] text-tier-navy my-2 leading-snug">
            {evaluation.notes}
          </p>

          {/* Achievements */}
          {evaluation.achievements.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {evaluation.achievements.slice(0, 2).map((achievement, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-tier-success bg-tier-success/10 py-1 px-2 rounded-md flex items-center gap-1"
                >
                  <CheckCircle size={10} />
                  {achievement}
                </span>
              ))}
            </div>
          )}

          {/* Coach Feedback Indicator */}
          {evaluation.coachFeedback && (
            <div className="mt-2.5 text-xs text-tier-navy flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-tier-navy" />
              Coach feedback available
            </div>
          )}
        </div>

        <ChevronRight size={18} className="text-tier-text-secondary flex-shrink-0" />
      </div>
    </div>
  );
};

// ============================================================================
// STATS OVERVIEW COMPONENT
// ============================================================================

const StatsOverview = ({ stats }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2.5 mb-6">
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-tier-navy">
        {stats.totalSessions}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Total</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-tier-success">
        {stats.thisMonth}
      </div>
      <div className="text-[11px] text-tier-text-secondary">This month</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="flex items-center justify-center gap-0.5">
        <span className="text-[22px] font-bold text-amber-500">
          {stats.avgRating}
        </span>
        <Star size={14} fill="rgb(var(--tier-gold))" className="text-tier-gold" />
      </div>
      <div className="text-[11px] text-tier-text-secondary">Avg.</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-tier-navy">
        {stats.avgDuration}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Min/session</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-base font-bold text-tier-success flex items-center justify-center gap-1">
        <TrendingUp size={16} />
        {stats.improvement}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Trend</div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TreningsevalueringContainer = () => {
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'technical', label: 'Technical' },
    { key: 'short_game', label: 'Short Game' },
    { key: 'physical', label: 'Physical' },
    { key: 'mental', label: 'Mental' },
  ];

  const filteredEvaluations = TRAINING_EVALUATIONS.filter((e) =>
    filter === 'all' || e.sessionType === filter
  );

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Training Evaluations"
        subtitle="Evaluation of your training sessions"
        helpText="Detailed evaluations of all your training sessions with assessments of intensity, quality, energy and focus. Filter by training type and see trends in your development."
      />

      <div className="p-4 px-6 pb-6 w-full">
        {/* Stats */}
        <StatsOverview stats={STATS} />

        {/* Filters */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`py-2 px-3.5 rounded-lg border-none text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors ${
                  filter === f.key
                    ? 'bg-tier-navy text-white'
                    : 'bg-tier-white text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            New evaluation
          </Button>
        </div>

        {/* Evaluations List */}
        <div className="flex flex-col gap-2.5">
          {filteredEvaluations.length > 0 ? (
            filteredEvaluations.map((evaluation) => (
              <TrainingEvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onClick={() => {}}
              />
            ))
          ) : (
            <StateCard
              variant="empty"
              icon={Dumbbell}
              title="No training evaluations found"
              description="Try adjusting the filter to see more evaluations."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TreningsevalueringContainer;
