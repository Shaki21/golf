/**
 * TIER Golf - Turneringsevaluering Container
 * Design System v3.0 - Premium Light
 *
 * Tournament evaluations with stats and performance tracking.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import {
  Calendar, Star, ChevronRight, Plus, Target,
  Award, MapPin, CheckCircle, AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../components/typography';

// ============================================================================
// MOCK DATA
// ============================================================================

const TOURNAMENT_EVALUATIONS = [
  {
    id: 't1',
    tournamentName: 'Varturneringen 2025',
    date: '2025-03-15',
    course: 'Holtsmark GK',
    position: 3,
    field: 42,
    rounds: [74, 72, 71],
    total: 217,
    toPar: '+1',
    rating: 4,
    mentalRating: 4,
    physicalRating: 4,
    technicalRating: 3,
    strengths: ['Putting var solid', 'God course management', 'Holdt seg rolig under press'],
    weaknesses: ['Misset noen fairways pa dag 1', 'Kort spill var litt ustabilt'],
    keyMoments: [
      'Birdie pa 18 dag 2 for a komme inn i topp 5',
      'Redning fra bunker pa 16 siste dag',
    ],
    notes: 'Veldig fornord med turneringen. Var konsistent alle tre dagene og forbedret meg for hver runde.',
    coachAnalysis: 'Meget bra turnering! Du viste at du kan prestere under press. Fokusomrade: Tee-shots pa trange hull.',
    stats: {
      fairways: 65,
      gir: 72,
      puttsPerRound: 29,
      scrambling: 60,
    },
  },
  {
    id: 't2',
    tournamentName: 'Sesongapning',
    date: '2025-02-10',
    course: 'Tyrifjord GK',
    position: 1,
    field: 35,
    rounds: [71],
    total: 71,
    toPar: '-1',
    rating: 5,
    mentalRating: 5,
    physicalRating: 4,
    technicalRating: 5,
    strengths: ['Alt klaffet', 'Utmerket ballstriking', 'Aggressiv men smart strategi'],
    weaknesses: [],
    keyMoments: [
      'Eagle pa par 5 hull 7',
      'Clutch par save pa 17 for a holde ledelsen',
    ],
    notes: 'Beste turneringen pa lenge. Folte meg trygg fra forste hull.',
    coachAnalysis: 'Fantastisk prestasjon! Du spilte med selvtillit og tok gode valg hele veien.',
    stats: {
      fairways: 71,
      gir: 78,
      puttsPerRound: 28,
      scrambling: 100,
    },
  },
  {
    id: 't3',
    tournamentName: 'NGF Tour - Runde 1',
    date: '2025-02-28',
    course: 'Drammens GK',
    position: 12,
    field: 78,
    rounds: [75, 73],
    total: 148,
    toPar: '+4',
    rating: 3,
    mentalRating: 2,
    physicalRating: 4,
    technicalRating: 3,
    strengths: ['Fysisk utholdende', 'Forbedring dag 2'],
    weaknesses: ['Slet med nervositet dag 1', 'For mange 3-putter', 'Darllige valg i treskudd'],
    keyMoments: [
      'Trippelbogey pa hull 3 dag 1 odela starten',
      'God comeback back 9 dag 2',
    ],
    notes: 'Vanskelig turnering mentalt. Forste dag var jeg alt for nervos. Dag 2 var mye bedre.',
    coachAnalysis: 'Lærdom: Fokuser pa pre-shot rutine for a roe ned nervene. Putting pa lengre distanser trenger arbeid.',
    stats: {
      fairways: 58,
      gir: 64,
      puttsPerRound: 32,
      scrambling: 45,
    },
  },
  {
    id: 't4',
    tournamentName: 'Vinterturneringen',
    date: '2025-01-25',
    course: 'Miklagard Golf',
    position: 8,
    field: 48,
    rounds: [73, 74],
    total: 147,
    toPar: '+3',
    rating: 3,
    mentalRating: 3,
    physicalRating: 3,
    technicalRating: 4,
    strengths: ['Solid ballstriking', 'Gode jern-slag'],
    weaknesses: ['Putting var inkonsistent', 'Mistet fokus pa back 9 dag 2'],
    keyMoments: [
      'God start med par-par-birdie',
      'Tre bogeys pa rad dag 2 back 9',
    ],
    notes: 'Ok turnering, men mistet noen muligheter. Putting ma forbedres.',
    coachAnalysis: 'Teknikken er pa plass. Mental utholdenhet over 36 hull er neste steg.',
    stats: {
      fairways: 60,
      gir: 66,
      puttsPerRound: 31,
      scrambling: 50,
    },
  },
];

const SEASON_STATS = {
  tournaments: 8,
  wins: 1,
  topThrees: 2,
  topTens: 4,
  avgPosition: 9,
  avgRating: 3.6,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
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
// TOURNAMENT EVALUATION CARD
// ============================================================================

const TournamentEvaluationCard = ({ evaluation, onClick }) => {
  const isWin = evaluation.position === 1;
  const isTopThree = evaluation.position <= 3;

  return (
    <div
      onClick={() => onClick(evaluation)}
      className={`bg-tier-white rounded-2xl p-[18px] cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-lg ${
        isWin ? 'border-2 border-amber-500' : 'border-2 border-transparent'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Position Badge */}
        <div className={`w-[50px] h-[50px] rounded-xl flex items-center justify-center flex-shrink-0 ${
          isTopThree ? 'bg-amber-500/15' : 'bg-tier-surface-base'
        }`}>
          {isTopThree ? (
            <Award size={24} className="text-amber-500" />
          ) : (
            <span className="text-lg font-bold text-tier-navy">
              {evaluation.position}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <SubSectionTitle className="text-base font-semibold text-tier-navy m-0">
                {evaluation.tournamentName}
              </SubSectionTitle>
              <div className="flex items-center gap-3 mt-1 text-xs text-tier-text-secondary">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(evaluation.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {evaluation.course}
                </span>
              </div>
            </div>
            <RatingStars rating={evaluation.rating} />
          </div>

          {/* Score Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="py-2 px-3 bg-tier-surface-base rounded-lg">
              <div className="text-[11px] text-tier-text-secondary">Position</div>
              <div className="text-base font-bold text-tier-navy">
                {evaluation.position}/{evaluation.field}
              </div>
            </div>
            <div className="py-2 px-3 bg-tier-surface-base rounded-lg">
              <div className="text-[11px] text-tier-text-secondary">Score</div>
              <div className="text-base font-bold text-tier-navy">
                {evaluation.total} ({evaluation.toPar})
              </div>
            </div>
            <div className="py-2 px-3 bg-tier-surface-base rounded-lg">
              <div className="text-[11px] text-tier-text-secondary">Rounds</div>
              <div className="text-sm font-semibold text-tier-navy">
                {evaluation.rounds.join(' - ')}
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-tier-navy" />
              <span className="text-xs text-tier-text-secondary">Technical:</span>
              <span className="text-xs font-semibold text-tier-navy">
                {evaluation.technicalRating}/5
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-500" />
              <span className="text-xs text-tier-text-secondary">Mental:</span>
              <span className="text-xs font-semibold text-tier-navy">
                {evaluation.mentalRating}/5
              </span>
            </div>
          </div>

          {/* Key Points */}
          <div className="flex flex-wrap gap-1.5">
            {evaluation.strengths.slice(0, 2).map((strength, idx) => (
              <span
                key={idx}
                className="text-[11px] text-tier-success bg-tier-success/10 py-1 px-2 rounded-md flex items-center gap-1"
              >
                <CheckCircle size={10} />
                {strength}
              </span>
            ))}
            {evaluation.weaknesses.slice(0, 1).map((weakness, idx) => (
              <span
                key={idx}
                className="text-[11px] text-tier-error bg-tier-error/10 py-1 px-2 rounded-md flex items-center gap-1"
              >
                <AlertCircle size={10} />
                {weakness}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight size={20} className="text-tier-text-secondary flex-shrink-0" />
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
        {stats.tournaments}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Tournaments</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-amber-500">
        {stats.wins}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Wins</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-amber-500">
        {stats.topThrees}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Topp 3</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-tier-success">
        {stats.topTens}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Topp 10</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="text-[22px] font-bold text-tier-navy">
        {stats.avgPosition}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Avg. position</div>
    </div>
    <div className="bg-tier-white rounded-xl p-3.5 text-center">
      <div className="flex items-center justify-center gap-0.5">
        <span className="text-[22px] font-bold text-amber-500">
          {stats.avgRating}
        </span>
        <Star size={14} fill="rgb(var(--tier-gold))" className="text-tier-gold" />
      </div>
      <div className="text-[11px] text-tier-text-secondary">Avg. rating</div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TurneringsevalueringContainer = () => {
  const [sortBy, setSortBy] = useState('date');

  const sortedEvaluations = [...TOURNAMENT_EVALUATIONS].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'position') return a.position - b.position;
    return 0;
  });

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Tournament Evaluations"
        subtitle="Evaluation of tournament performances"
        helpText="Your tournament evaluations with mental, physical and technical assessments. See strengths, weaknesses and key moments from each tournament to improve future performances."
      />

      <div className="p-4 px-6 pb-6 max-w-[1000px] mx-auto">
        {/* Stats */}
        <StatsOverview stats={SEASON_STATS} />

        {/* Filters */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-tier-text-secondary">Sort:</span>
            {[
              { key: 'date', label: 'Date' },
              { key: 'rating', label: 'Rating' },
              { key: 'position', label: 'Position' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`py-1.5 px-3 rounded-md border-none text-xs font-medium cursor-pointer transition-colors ${
                  sortBy === option.key
                    ? 'bg-tier-navy text-white'
                    : 'bg-tier-white text-tier-navy hover:bg-tier-surface-base'
                }`}
              >
                {option.label}
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
        <div className="flex flex-col gap-3">
          {sortedEvaluations.map((evaluation) => (
            <TournamentEvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TurneringsevalueringContainer;
