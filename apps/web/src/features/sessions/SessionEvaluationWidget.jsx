/**
 * SessionEvaluationWidget - Dashboard widget for session evaluations
 *
 * Shows:
 * - Average evaluation scores
 * - Recent session evaluations
 * - Quick access to in-progress sessions
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Target, Zap, Brain, Battery, Play, CheckCircle } from 'lucide-react';
import { sessionsAPI } from '../../services/api';
import { SubSectionTitle } from '../../components/typography';

// Status config
const STATUS_CONFIG = {
  in_progress: { label: 'Pagar', color: 'text-tier-warning', bg: 'bg-tier-warning/10', icon: Play },
  completed: { label: 'Fullfort', color: 'text-tier-success', bg: 'bg-tier-success/10', icon: CheckCircle },
};

// Rating indicator
function RatingIndicator({ label, value, icon: Icon, color }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={14} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] text-tier-text-secondary">{label}</p>
        <p className="text-[14px] font-semibold text-tier-navy">{value.toFixed(1)}/10</p>
      </div>
    </div>
  );
}

// Session item
function SessionItem({ session, onClick }) {
  const statusConfig = STATUS_CONFIG[session.completionStatus] || STATUS_CONFIG.completed;
  const StatusIcon = statusConfig.icon;
  const date = new Date(session.sessionDate);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-tier-white rounded-lg cursor-pointer hover:bg-tier-surface-base transition-colors"
    >
      <div className={`w-8 h-8 rounded-lg ${statusConfig.bg} flex items-center justify-center`}>
        <StatusIcon size={14} className={statusConfig.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-tier-navy truncate">
          {session.sessionType}
        </p>
        <p className="text-[11px] text-tier-text-secondary">
          {date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
          {session.evaluationFocus && ` • Fokus: ${session.evaluationFocus}/10`}
        </p>
      </div>
      <ChevronRight size={16} className="text-tier-text-secondary" />
    </div>
  );
}

export default function SessionEvaluationWidget() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [inProgressSessions, setInProgressSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch evaluation stats and recent sessions in parallel
        const [statsRes, sessionsRes, inProgressRes] = await Promise.all([
          sessionsAPI.getEvaluationStats().catch(() => ({ data: null })),
          sessionsAPI.getMy({ limit: 3, completionStatus: 'completed' }).catch(() => ({ data: { sessions: [] } })),
          sessionsAPI.getInProgress().catch(() => ({ data: [] })),
        ]);

        setStats(statsRes.data);
        setRecentSessions(sessionsRes.data?.sessions || []);
        setInProgressSessions(Array.isArray(inProgressRes.data) ? inProgressRes.data : []);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleViewAll = () => navigate('/sessions');
  const handleViewStats = () => navigate('/session/stats');
  const handleSessionClick = (session) => {
    if (session.completionStatus === 'in_progress') {
      navigate(`/session/${session.id}/evaluate`);
    } else {
      navigate(`/session/${session.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-tier-surface-base p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="animate-pulse">
          <div className="h-5 w-32 bg-tier-surface-base rounded mb-4" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-16 bg-tier-white rounded-lg" />
            <div className="h-16 bg-tier-white rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-12 bg-tier-white rounded-lg" />
            <div className="h-12 bg-tier-white rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-tier-surface-base p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-tier-navy" />
          <SubSectionTitle style={{ fontSize: '15px' }}>Oktevaluering</SubSectionTitle>
        </div>
        <button
          onClick={handleViewStats}
          className="text-[13px] text-tier-navy font-medium hover:underline flex items-center gap-1"
        >
          Statistikk <ChevronRight size={14} />
        </button>
      </div>

      {/* In-progress sessions alert */}
      {inProgressSessions.length > 0 && (
        <div className="mb-4 p-3 bg-tier-warning/10 border border-tier-warning/20 rounded-lg">
          <p className="text-[13px] font-medium text-tier-warning mb-2">
            {inProgressSessions.length} okt{inProgressSessions.length > 1 ? 'er' : ''} venter pa evaluering
          </p>
          {inProgressSessions.slice(0, 2).map(session => (
            <SessionItem
              key={session.id}
              session={session}
              onClick={() => handleSessionClick(session)}
            />
          ))}
        </div>
      )}

      {/* Average ratings */}
      {stats?.averages && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <RatingIndicator
            label="Snitt fokus"
            value={stats.averages.evaluationFocus}
            icon={Target}
            color="bg-tier-success"
          />
          <RatingIndicator
            label="Snitt teknikk"
            value={stats.averages.evaluationTechnical}
            icon={Zap}
            color="bg-tier-navy"
          />
          <RatingIndicator
            label="Snitt energi"
            value={stats.averages.evaluationEnergy}
            icon={Battery}
            color="bg-tier-warning"
          />
          <RatingIndicator
            label="Snitt mental"
            value={stats.averages.evaluationMental}
            icon={Brain}
            color="bg-tier-gold"
          />
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <>
          <p className="text-[11px] font-medium text-tier-text-secondary uppercase tracking-wide mb-2">
            Siste evalueringer
          </p>
          <div className="space-y-2">
            {recentSessions.map(session => (
              <SessionItem
                key={session.id}
                session={session}
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!stats?.averages && recentSessions.length === 0 && inProgressSessions.length === 0 && (
        <div className="text-center py-6">
          <Target size={32} className="text-tier-surface-base mx-auto mb-2" />
          <p className="text-[14px] text-tier-text-secondary mb-2">Ingen evalueringer enna</p>
          <button
            onClick={() => navigate('/session/new')}
            className="text-[13px] text-tier-navy font-medium hover:underline"
          >
            Opprett din forste okt
          </button>
        </div>
      )}

      {/* View all link */}
      {(recentSessions.length > 0 || inProgressSessions.length > 0) && (
        <button
          onClick={handleViewAll}
          className="w-full mt-4 py-2 text-[13px] text-tier-navy font-medium hover:underline flex items-center justify-center gap-1"
        >
          Se alle okter <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
