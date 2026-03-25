// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TIER Golf - Coach Session Evaluations
 * Design System v3.1 - Decision-First Sub-Page
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Which session evaluation needs my attention most urgently?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 — Decision Hero: Most urgent evaluation to review
 * Layer 2 — Summary Stats: Quick overview metrics
 * Layer 3 — Full List: All evaluations with filters
 *
 * Purpose:
 * - Allow coaches to view their athletes' session evaluations
 * - Filter by athlete, date, session type
 * - View evaluation details and trends
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sessionsAPI, coachesAPI } from '../../services/api';
import {
  Calendar, Clock, Target, Zap, Brain, Battery,
  ChevronRight, Filter, User
} from 'lucide-react';

import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { SectionTitle } from '../../components/typography/Headings';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';

// Semantic color mappings
const colors = {
  primary: 'var(--accent)',
  snow: 'var(--bg-secondary)',
  surface: 'var(--bg-tertiary)',
  white: 'var(--bg-primary)',
  charcoal: 'var(--text-primary)',
  steel: 'var(--text-secondary)',
  mist: 'var(--border-default)',
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  error: 'var(--status-error)',
  gold: 'var(--achievement)',
};

const borderRadius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
};

const shadows = {
  card: 'var(--shadow-card)',
};

const typography = {
  title1: { fontSize: '28px', lineHeight: '34px', fontWeight: 700 },
  title3: { fontSize: '17px', lineHeight: '22px', fontWeight: 600 },
  body: { fontSize: '15px', lineHeight: '20px', fontWeight: 400 },
  caption: { fontSize: '13px', lineHeight: '18px', fontWeight: 400 },
  label: { fontSize: '12px', lineHeight: '16px', fontWeight: 500 },
};

// Types
interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
}

interface SessionEvaluation {
  id: string;
  sessionType: string;
  sessionDate: string;
  duration: number;
  evaluationFocus: number | null;
  evaluationTechnical: number | null;
  evaluationEnergy: number | null;
  evaluationMental: number | null;
  focusArea: string | null;
  notes: string | null;
  completionStatus: string;
  player: Athlete;
}

// Mock data - will be replaced with API
const mockAthletes: Athlete[] = [
  { id: '1', firstName: 'Emma', lastName: 'Larsen', category: 'A' },
  { id: '2', firstName: 'Jonas', lastName: 'Pedersen', category: 'B' },
  { id: '3', firstName: 'Sofie', lastName: 'Andersen', category: 'A' },
];

const mockEvaluations: SessionEvaluation[] = [
  {
    id: '1',
    sessionType: 'driving_range',
    sessionDate: '2025-01-19T10:00:00',
    duration: 90,
    evaluationFocus: 8,
    evaluationTechnical: 7,
    evaluationEnergy: 9,
    evaluationMental: 8,
    focusArea: 'Driver konsistens',
    notes: 'Bra okt, fokuserte pa timing',
    completionStatus: 'completed',
    player: mockAthletes[0],
  },
  {
    id: '2',
    sessionType: 'putting',
    sessionDate: '2025-01-18T14:00:00',
    duration: 60,
    evaluationFocus: 6,
    evaluationTechnical: 5,
    evaluationEnergy: 7,
    evaluationMental: 6,
    focusArea: 'Korte putter',
    notes: 'Sliten, men fullforte',
    completionStatus: 'completed',
    player: mockAthletes[1],
  },
  {
    id: '3',
    sessionType: 'chipping',
    sessionDate: '2025-01-17T09:00:00',
    duration: 45,
    evaluationFocus: 9,
    evaluationTechnical: 8,
    evaluationEnergy: 8,
    evaluationMental: 9,
    focusArea: 'Lob shots',
    notes: 'Utmerket fokus hele okten',
    completionStatus: 'completed',
    player: mockAthletes[2],
  },
];

// Session type labels
const SESSION_TYPE_LABELS: Record<string, string> = {
  driving_range: 'Driving Range',
  putting: 'Putting',
  chipping: 'Chipping',
  pitching: 'Pitching',
  bunker: 'Bunker',
  course_play: 'Course Play',
  physical: 'Physical',
  mental: 'Mental',
};

// Rating bar component
function RatingBar({ label, value, icon: Icon, color }: { label: string; value: number | null; icon: React.ElementType; color: string }) {
  if (!value) return null;

  const percentage = (value / 10) * 100;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon size={14} color={color} />
          <span style={{ ...typography.caption, color: colors.steel }}>{label}</span>
        </div>
        <span style={{ ...typography.label, color: colors.charcoal }}>{value}/10</span>
      </div>
      <div style={{
        height: '6px',
        backgroundColor: colors.mist,
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
          borderRadius: '3px',
        }} />
      </div>
    </div>
  );
}

// Session card component
interface SessionCardProps {
  evaluation: SessionEvaluation;
  onClick: () => void;
}
const SessionCard: React.FC<SessionCardProps> = ({ evaluation, onClick }) => {
  const date = new Date(evaluation.sessionDate);
  const avgRating = [
    evaluation.evaluationFocus,
    evaluation.evaluationTechnical,
    evaluation.evaluationEnergy,
    evaluation.evaluationMental,
  ].filter(Boolean).reduce((a, b) => a! + b!, 0)! / 4;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: '16px',
        marginBottom: '12px',
        boxShadow: shadows.card,
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <User size={16} color={colors.primary} />
            <span style={{ ...typography.title3, color: colors.charcoal }}>
              {evaluation.player.firstName} {evaluation.player.lastName}
            </span>
            <span style={{
              padding: '2px 8px',
              backgroundColor: colors.snow,
              borderRadius: '4px',
              ...typography.label,
              color: colors.steel,
            }}>
              {evaluation.player.category}
            </span>
          </div>
          <span style={{ ...typography.body, color: colors.charcoal }}>
            {SESSION_TYPE_LABELS[evaluation.sessionType] || evaluation.sessionType}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: avgRating >= 7 ? colors.success : avgRating >= 5 ? colors.warning : colors.error,
          }}>
            {avgRating.toFixed(1)}
          </div>
          <span style={{ ...typography.label, color: colors.steel }}>avg</span>
        </div>
      </div>

      {/* Date and duration */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color={colors.steel} />
          <span style={{ ...typography.caption, color: colors.steel }}>
            {date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color={colors.steel} />
          <span style={{ ...typography.caption, color: colors.steel }}>
            {evaluation.duration} min
          </span>
        </div>
      </div>

      {/* Ratings */}
      <div style={{ marginBottom: '12px' }}>
        <RatingBar label="Focus" value={evaluation.evaluationFocus} icon={Target} color={colors.success} />
        <RatingBar label="Technique" value={evaluation.evaluationTechnical} icon={Zap} color={colors.primary} />
        <RatingBar label="Energy" value={evaluation.evaluationEnergy} icon={Battery} color={colors.warning} />
        <RatingBar label="Mental" value={evaluation.evaluationMental} icon={Brain} color={colors.gold} />
      </div>

      {/* Focus area */}
      {evaluation.focusArea && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: colors.snow,
          borderRadius: borderRadius.sm,
        }}>
          <span style={{ ...typography.caption, color: colors.steel }}>Focus area: </span>
          <span style={{ ...typography.body, color: colors.charcoal }}>{evaluation.focusArea}</span>
        </div>
      )}

      {/* View arrow */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <ChevronRight size={20} color={colors.steel} />
      </div>
    </div>
  );
}

// =============================================================================
// DECISION HERO - Shows most urgent evaluation to review
// =============================================================================

interface EvaluationHeroProps {
  evaluation: SessionEvaluation | null;
  totalPending: number;
  onReview: (evaluation: SessionEvaluation) => void;
}

function EvaluationHero({ evaluation, totalPending, onReview }: EvaluationHeroProps) {
  if (!evaluation) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tier-text-primary">All caught up!</h2>
            <p className="text-sm text-tier-text-secondary">No evaluations need your review</p>
          </div>
        </div>
      </div>
    );
  }

  const date = new Date(evaluation.sessionDate);
  const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const urgency = daysSince > 7 ? 'high' : daysSince > 3 ? 'medium' : 'low';

  const urgencyStyles = {
    high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-white', border: 'border-tier-border-default', badge: 'bg-tier-surface-secondary text-tier-text-secondary' },
  };

  const styles = urgencyStyles[urgency];

  return (
    <div className={`${styles.bg} rounded-xl p-6 shadow-sm border ${styles.border} mb-6`}>
      {/* Header with greeting and badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${urgency === 'high' ? 'bg-red-100' : urgency === 'medium' ? 'bg-amber-100' : 'bg-tier-surface-secondary'} flex items-center justify-center`}>
            <AlertCircle className={`w-5 h-5 ${urgency === 'high' ? 'text-red-600' : urgency === 'medium' ? 'text-amber-600' : 'text-tier-text-secondary'}`} />
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
            {totalPending} awaiting review
          </span>
        </div>
      </div>

      {/* Decision headline */}
      <h2 className="text-xl font-bold text-tier-text-primary mb-2">
        Review {evaluation.player.firstName}'s session
      </h2>
      <p className="text-tier-text-secondary mb-4">
        {SESSION_TYPE_LABELS[evaluation.sessionType] || evaluation.sessionType} • {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`} • {evaluation.duration} min
      </p>

      {/* Quick stats preview */}
      <div className="flex gap-4 mb-4">
        {evaluation.evaluationFocus && (
          <div className="flex items-center gap-1">
            <Target size={14} className="text-green-600" />
            <span className="text-sm text-tier-text-secondary">Focus: {evaluation.evaluationFocus}/10</span>
          </div>
        )}
        {evaluation.evaluationTechnical && (
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-tier-primary" />
            <span className="text-sm text-tier-text-secondary">Technique: {evaluation.evaluationTechnical}/10</span>
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => onReview(evaluation)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy-dark transition-colors"
      >
        Review Session
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

// Main component
export function CoachSessionEvaluations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<SessionEvaluation[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch athletes and sessions in parallel
      const [athletesRes, sessionsRes] = await Promise.all([
        coachesAPI.getAthletes().catch(() => ({ data: null })),
        sessionsAPI.list({ includeEvaluations: true }).catch(() => ({ data: null })),
      ]);

      // Process athletes
      const athletesData = athletesRes.data?.data || athletesRes.data || [];
      if (Array.isArray(athletesData) && athletesData.length > 0) {
        setAthletes(athletesData.map((a: any) => ({
          id: a.id,
          firstName: a.firstName || a.first_name || '',
          lastName: a.lastName || a.last_name || '',
          category: a.category || a.playerCategory || 'B',
        })));
      } else {
        setAthletes(mockAthletes);
      }

      // Process sessions with evaluations
      const sessionsData = sessionsRes.data?.data || sessionsRes.data || [];
      if (Array.isArray(sessionsData) && sessionsData.length > 0) {
        const transformedEvaluations: SessionEvaluation[] = sessionsData
          .filter((s: any) => s.completionStatus === 'completed' || s.status === 'completed')
          .map((s: any) => ({
            id: s.id,
            sessionType: s.sessionType || s.type || 'driving_range',
            sessionDate: s.sessionDate || s.scheduledDate || s.createdAt,
            duration: s.duration || s.durationMinutes || 60,
            evaluationFocus: s.evaluationFocus ?? s.evaluation?.focus ?? null,
            evaluationTechnical: s.evaluationTechnical ?? s.evaluation?.technical ?? null,
            evaluationEnergy: s.evaluationEnergy ?? s.evaluation?.energy ?? null,
            evaluationMental: s.evaluationMental ?? s.evaluation?.mental ?? null,
            focusArea: s.focusArea || s.evaluation?.focusArea || null,
            notes: s.notes || s.evaluation?.notes || null,
            completionStatus: s.completionStatus || s.status || 'completed',
            player: s.player || {
              id: s.playerId,
              firstName: s.playerFirstName || '',
              lastName: s.playerLastName || '',
              category: s.playerCategory || 'B',
            },
          }));
        setEvaluations(transformedEvaluations);
      } else {
        setEvaluations(mockEvaluations);
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setAthletes(mockAthletes);
      setEvaluations(mockEvaluations);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Filter evaluations
  const filteredEvaluations = selectedAthlete
    ? evaluations.filter(e => e.player.id === selectedAthlete)
    : evaluations;

  // Calculate summary stats
  const stats = {
    totalSessions: filteredEvaluations.length,
    avgFocus: filteredEvaluations.reduce((acc, e) => acc + (e.evaluationFocus || 0), 0) / filteredEvaluations.length || 0,
    avgTechnical: filteredEvaluations.reduce((acc, e) => acc + (e.evaluationTechnical || 0), 0) / filteredEvaluations.length || 0,
  };

  // Find most urgent evaluation (oldest first - needs review longest)
  const sortedByUrgency = [...evaluations].sort((a, b) => {
    return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
  });
  const mostUrgentEvaluation = sortedByUrgency[0] || null;

  const handleBack = () => navigate(-1);
  const handleSessionClick = (evaluation: SessionEvaluation) => {
    // Navigate to session detail view - evaluation.id is the session ID
    navigate(`/session/${evaluation.id}`);
  };

  return (
    <div style={{
      backgroundColor: colors.surface,
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      {/* Header */}
      <PageHeader
        title="Session Evaluations"
        subtitle="View your players' evaluations"
        helpText="Overview of players' self-evaluations of training sessions. See ratings for intensity, quality, energy, and motivation to better follow up with players."
        onBack={handleBack}
        divider={false}
      />

      {/* Layer 1: Decision Hero - Most urgent evaluation */}
      <div style={{ padding: '16px 16px 0' }}>
        <EvaluationHero
          evaluation={mostUrgentEvaluation}
          totalPending={evaluations.length}
          onReview={handleSessionClick}
        />
      </div>

      {/* Athlete filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '0 24px 16px',
        borderBottom: `1px solid ${colors.mist}`,
      }}>
        <select
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            backgroundColor: colors.snow,
            border: `1px solid ${colors.mist}`,
            borderRadius: borderRadius.sm,
            ...typography.body,
          }}
        >
          <option value="">All players</option>
          {athletes.map(a => (
            <option key={a.id} value={a.id}>
              {a.firstName} {a.lastName} ({a.category})
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 16px',
            backgroundColor: showFilters ? colors.primary : colors.snow,
            color: showFilters ? colors.white : colors.charcoal,
            border: `1px solid ${showFilters ? colors.primary : colors.mist}`,
            borderRadius: borderRadius.sm,
            cursor: 'pointer',
            gap: '6px',
            ...typography.label,
          }}
        >
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '16px',
      }}>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.md,
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '24px', fontWeight: 700, color: colors.primary, margin: 0 }}>
            {stats.totalSessions}
          </p>
          <p style={{ ...typography.caption, color: colors.steel }}>Sessions</p>
        </div>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.md,
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '24px', fontWeight: 700, color: colors.success, margin: 0 }}>
            {stats.avgFocus.toFixed(1)}
          </p>
          <p style={{ ...typography.caption, color: colors.steel }}>Avg focus</p>
        </div>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.md,
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '24px', fontWeight: 700, color: colors.primary, margin: 0 }}>
            {stats.avgTechnical.toFixed(1)}
          </p>
          <p style={{ ...typography.caption, color: colors.steel }}>Avg technique</p>
        </div>
      </div>

      {/* Sessions list */}
      <div style={{ padding: '0 16px 16px' }}>
        <SectionTitle style={{ ...typography.title3, color: colors.charcoal, marginBottom: '12px' }}>
          Recent evaluations
        </SectionTitle>

        {isLoading ? (
          <StateCard variant="loading" title="Loading evaluations..." />
        ) : filteredEvaluations.length === 0 ? (
          <StateCard
            variant="empty"
            title="No evaluations found"
            description="Try adjusting the filter to see more evaluations."
          />
        ) : (
          filteredEvaluations.map(evaluation => (
            <SessionCard
              key={evaluation.id}
              evaluation={evaluation}
              onClick={() => handleSessionClick(evaluation)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CoachSessionEvaluations;
