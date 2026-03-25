/**
 * TIER Golf - Evaluering Container
 * Design System v3.0 - Premium Light
 *
 * Player evaluations overview with stats and filtering.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import {
  ClipboardCheck, Star, ChevronRight,
  Trophy, Dumbbell, Search, Plus
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../components/typography';
import StateCard from '../../ui/composites/StateCard';

// ============================================================================
// MOCK DATA
// ============================================================================

const EVALUATIONS = [
  {
    id: 'e1',
    type: 'training',
    title: 'Teknisk okt - Driver',
    date: '2025-01-15',
    rating: 4,
    summary: 'God fremgang med tempo. Fortsatt litt inkonsistent pa impact.',
    tags: ['Teknikk', 'Driver', 'Simulator'],
    coachNote: 'Bra jobba! Fokuser pa hofterotasjon neste okt.',
  },
  {
    id: 'e2',
    type: 'tournament',
    title: 'Vinterturneringen',
    date: '2025-01-12',
    rating: 3,
    summary: 'Ok turnering, men slet med putting pa back 9.',
    tags: ['Turnering', 'Miklagard'],
    result: { position: 8, score: 147 },
  },
  {
    id: 'e3',
    type: 'training',
    title: 'Kortspill-okt',
    date: '2025-01-10',
    rating: 5,
    summary: 'Utmerket okt! Sand saves var 80% i dag.',
    tags: ['Kortspill', 'Bunker', 'Chipping'],
    coachNote: 'Fantastisk! Hold fokus pa dette nivaet.',
  },
  {
    id: 'e4',
    type: 'tournament',
    title: 'Sesongapning',
    date: '2025-02-10',
    rating: 5,
    summary: 'Seier! Spilte kontrollert hele runden.',
    tags: ['Turnering', 'Tyrifjord'],
    result: { position: 1, score: 71 },
  },
  {
    id: 'e5',
    type: 'training',
    title: 'Styrketrening',
    date: '2025-01-08',
    rating: 4,
    summary: 'Ny PR i squat! Core-ovelser gikk bra.',
    tags: ['Fysisk', 'Styrke'],
  },
  {
    id: 'e6',
    type: 'training',
    title: 'Mental trening',
    date: '2025-01-05',
    rating: 3,
    summary: 'Visualisering var vanskelig i dag. Trenger mer ovelse.',
    tags: ['Mental', 'Visualisering'],
  },
];

const STATS = {
  totalEvaluations: 24,
  avgRating: 3.8,
  trainingCount: 18,
  tournamentCount: 6,
  trend: 'improving',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTypeConfig = (type) => {
  switch (type) {
    case 'training':
      return { label: 'Training', colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' }, icon: Dumbbell };
    case 'tournament':
      return { label: 'Tournament', colorClasses: { bg: 'bg-amber-500/15', text: 'text-amber-600' }, icon: Trophy };
    default:
      return { label: type, colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: ClipboardCheck };
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ============================================================================
// RATING STARS COMPONENT
// ============================================================================

const RatingStars = ({ rating, size = 14 }) => {
  return (
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
};

// ============================================================================
// EVALUATION CARD COMPONENT
// ============================================================================

const EvaluationCard = ({ evaluation, onClick }) => {
  const typeConfig = getTypeConfig(evaluation.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => onClick(evaluation)}
      className="bg-tier-white rounded-[14px] p-4 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-[42px] h-[42px] rounded-[10px] ${typeConfig.colorClasses.bg} flex items-center justify-center flex-shrink-0`}>
          <TypeIcon size={20} className={typeConfig.colorClasses.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0">
              {evaluation.title}
            </SubSectionTitle>
            <RatingStars rating={evaluation.rating} />
          </div>

          <div className="text-xs text-tier-text-secondary mb-2 flex items-center gap-2">
            <span className={`py-0.5 px-1.5 rounded ${typeConfig.colorClasses.bg} ${typeConfig.colorClasses.text} font-medium`}>
              {typeConfig.label}
            </span>
            <span>{formatDate(evaluation.date)}</span>
          </div>

          <p className="text-[13px] text-tier-navy m-0 mb-2 leading-snug line-clamp-2">
            {evaluation.summary}
          </p>

          {evaluation.result && (
            <div className={`inline-flex items-center gap-2 py-1.5 px-2.5 rounded-md mb-2 ${
              evaluation.result.position <= 3 ? 'bg-amber-500/15' : 'bg-tier-surface-base'
            }`}>
              <Trophy size={14} className={evaluation.result.position <= 3 ? 'text-amber-500' : 'text-tier-text-secondary'} />
              <span className="text-xs font-medium text-tier-navy">
                {evaluation.result.position}. plass - Score: {evaluation.result.score}
              </span>
            </div>
          )}

          <div className="flex gap-1.5 flex-wrap">
            {evaluation.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] text-tier-text-secondary bg-tier-surface-base py-0.5 px-2 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight size={18} className="text-tier-text-secondary flex-shrink-0" />
      </div>
    </div>
  );
};

// ============================================================================
// STATS OVERVIEW COMPONENT
// ============================================================================

const StatsOverview = ({ stats }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-6">
      <div className="bg-tier-white rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-tier-navy">
          {stats.totalEvaluations}
        </div>
        <div className="text-xs text-tier-text-secondary">Total</div>
      </div>
      <div className="bg-tier-white rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-bold text-amber-500">
            {stats.avgRating.toFixed(1)}
          </span>
          <Star size={18} fill="rgb(var(--tier-gold))" className="text-tier-gold" />
        </div>
        <div className="text-xs text-tier-text-secondary">Avg. rating</div>
      </div>
      <div className="bg-tier-white rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-tier-navy">
          {stats.trainingCount}
        </div>
        <div className="text-xs text-tier-text-secondary">Training</div>
      </div>
      <div className="bg-tier-white rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-amber-500">
          {stats.tournamentCount}
        </div>
        <div className="text-xs text-tier-text-secondary">Tournaments</div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EvalueringContainer = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvaluations = EVALUATIONS.filter((e) => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'training', label: 'Training' },
    { key: 'tournament', label: 'Tournament' },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <div className="p-4 px-6 pb-6 w-full">
        {/* Stats Overview */}
        <StatsOverview stats={STATS} />

        {/* Filters and Search */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`py-2 px-4 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  filter === f.key
                    ? 'bg-tier-navy text-white border-none'
                    : 'bg-tier-white text-tier-text-secondary border border-tier-border-default'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px] relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evaluations..."
              className="w-full py-2.5 pr-3 pl-9 rounded-lg border border-tier-border-default text-[13px] bg-tier-white text-tier-navy outline-none focus:border-tier-navy"
            />
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
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onClick={() => {}}
              />
            ))
          ) : (
            <StateCard
              variant="empty"
              icon={ClipboardCheck}
              title="No evaluations found"
              description="Try adjusting the search or filter to see more evaluations."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EvalueringContainer;
