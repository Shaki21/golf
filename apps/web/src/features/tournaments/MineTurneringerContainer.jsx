import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Calendar, MapPin, Clock, ChevronRight,
  Medal, CheckCircle, XCircle, AlertCircle, FileText, Loader2
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle, CardTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import { useAuth } from '../../contexts/AuthContext';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const getStatusBadge = (status, waitlistPosition) => {
  switch (status) {
    case 'confirmed':
      return {
        label: 'Bekreftet',
        icon: CheckCircle,
        color: 'var(--status-success)',
        bg: 'rgba(var(--success-rgb), 0.15)',
      };
    case 'registered':
      return {
        label: 'Registrert',
        icon: CheckCircle,
        color: 'var(--status-success)',
        bg: 'rgba(var(--success-rgb), 0.15)',
      };
    case 'pending':
      return {
        label: 'Venter på starttid',
        icon: Clock,
        color: 'var(--status-warning)',
        bg: 'rgba(var(--warning-rgb), 0.15)',
      };
    case 'waitlist':
      return {
        label: `Venteliste (#${waitlistPosition})`,
        icon: AlertCircle,
        color: 'var(--text-secondary)',
        bg: 'rgba(var(--text-secondary-rgb), 0.15)',
      };
    case 'cancelled':
      return {
        label: 'Avmeldt',
        icon: XCircle,
        color: 'var(--status-error)',
        bg: 'rgba(var(--error-rgb), 0.15)',
      };
    default:
      return {
        label: status || 'Ukjent',
        icon: Clock,
        color: 'var(--text-secondary)',
        bg: 'rgba(var(--text-secondary-rgb), 0.15)',
      };
  }
};

const UpcomingTournamentCard = ({ tournament, onViewDetails }) => {
  const statusConfig = getStatusBadge(tournament.status, tournament.waitlistPosition);
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntil(tournament.startDate);

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails(tournament)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <SubSectionTitle>{tournament.name}</SubSectionTitle>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
            >
              <StatusIcon size={12} />
              {statusConfig.label}
            </span>
            {tournament.level && (
              <span className="px-2 py-1 bg-tier-surface-base rounded-lg text-xs font-medium text-tier-navy">
                {tournament.level}
              </span>
            )}
          </div>
        </div>

        {daysUntil > 0 && daysUntil <= 60 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-tier-navy">{daysUntil}</div>
            <div className="text-xs text-tier-text-secondary">dager</div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-tier-text-secondary" />
          <span className="text-tier-navy">{formatDate(tournament.startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-tier-text-secondary" />
          <span className="text-tier-navy">{tournament.location}</span>
        </div>
        {tournament.format && (
          <div className="flex items-center gap-2 text-sm">
            <Trophy size={16} className="text-tier-text-secondary" />
            <span className="text-tier-navy">
              {tournament.numberOfRounds > 1 ? `${tournament.numberOfRounds} runder - ` : ''}
              {tournament.format}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-tier-surface-base">
        <Button variant="ghost" size="sm" style={{ color: 'var(--status-error)' }}>
          Meld av
        </Button>
        <div className="flex items-center gap-1 text-sm text-tier-navy font-medium">
          Se detaljer
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

const PastResultCard = ({ result }) => {
  const isTopThree = result.position && result.position <= 3;

  const getMedalColor = (position) => {
    switch (position) {
      case 1: return 'rgb(var(--tier-gold))';
      case 2: return 'rgb(var(--text-secondary))';
      case 3: return 'rgb(var(--status-warning))';
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4">
      {/* Position */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: isTopThree ? `${getMedalColor(result.position)}20` : 'var(--bg-secondary)'
        }}
      >
        {isTopThree ? (
          <Medal size={24} style={{ color: getMedalColor(result.position) }} />
        ) : (
          <span className="text-lg font-bold text-tier-navy">{result.position || '-'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <CardTitle>{result.name}</CardTitle>
        <p className="text-sm text-tier-text-secondary">
          {formatDate(result.date)} · {result.location}
        </p>
      </div>

      {/* Result */}
      <div className="text-right">
        <div className="text-lg font-bold text-tier-navy">
          {result.position ? `${result.position}. plass` : '-'}
        </div>
        <div className="text-sm text-tier-text-secondary">
          {result.totalScore} ({result.scoreToPar >= 0 ? '+' : ''}{result.scoreToPar})
        </div>
      </div>
    </div>
  );
};

const MineTurneringerContainer = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournaments, setTournaments] = useState({ upcoming: [], past: [] });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/calendar/my-tournaments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Kunne ikke hente turneringer');
        }

        const data = await response.json();
        setTournaments(data);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTournaments();
    }
  }, [token]);

  const confirmedCount = tournaments.upcoming.filter(t =>
    t.status === 'confirmed' || t.status === 'registered'
  ).length;
  const pendingCount = tournaments.upcoming.filter(t =>
    t.status === 'pending' || t.status === 'waitlist'
  ).length;
  const topThreeCount = tournaments.past.filter(r => r.position && r.position <= 3).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tier-navy" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <PageHeader
        title="Mine turneringer"
        subtitle="Dine påmeldinger og resultater"
        helpText="Oversikt over turneringer du er påmeldt, har deltatt i eller er interessert i. Se påmeldingsstatus, resultater og kommende turneringer."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/turneringskalender')}
          >
            Finn turnering
          </Button>
        }
      />

      <div style={{ padding: '24px', width: '100%' }}>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-success">{confirmedCount}</div>
            <div className="text-xs text-tier-text-secondary">Bekreftet</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-warning">{pendingCount}</div>
            <div className="text-xs text-tier-text-secondary">Venter</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-gold">{topThreeCount}</div>
            <div className="text-xs text-tier-text-secondary">Pallplasser</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-tier-navy text-white'
                : 'bg-white text-tier-navy hover:bg-tier-white'
            }`}
          >
            Kommende ({tournaments.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'bg-tier-navy text-white'
                : 'bg-white text-tier-navy hover:bg-tier-white'
            }`}
          >
            Resultater ({tournaments.past.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'upcoming' ? (
          <div className="space-y-4">
            {tournaments.upcoming.length > 0 ? (
              tournaments.upcoming.map(tournament => (
                <UpcomingTournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onViewDetails={(t) => navigate(`/turnering/${t.id}`)}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Trophy size={48} className="mx-auto mb-4 text-tier-surface-base" />
                <SubSectionTitle style={{ marginBottom: '8px' }}>
                  Ingen påmeldinger ennå
                </SubSectionTitle>
                <p className="text-sm text-tier-text-secondary mb-4">
                  Finn din neste turnering i turneringskalenderen
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/turneringskalender')}
                >
                  Se turneringer
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.past.length > 0 ? (
              tournaments.past.map(result => (
                <PastResultCard key={result.id} result={result} />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center">
                <FileText size={48} className="mx-auto mb-4 text-tier-surface-base" />
                <SubSectionTitle style={{ marginBottom: '8px' }}>
                  Ingen resultater ennå
                </SubSectionTitle>
                <p className="text-sm text-tier-text-secondary">
                  Dine turneringsresultater vil vises her
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MineTurneringerContainer;
