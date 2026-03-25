import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, ChevronRight,
  Target, MapPin, AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import { calendarAPI } from '../../services/api';

// ============================================================================
// MOCK DATA
// ============================================================================

const TOURNAMENT_RESULTS = [
  {
    id: 't1',
    name: 'Junior Masters Oslo',
    date: '2025-01-12',
    course: 'Oslo Golfklubb',
    type: 'ranking',
    rounds: 2,
    scores: [72, 70],
    total: 142,
    par: 144,
    position: 3,
    participants: 48,
    earnings: 5000,
    rankingPoints: 150,
  },
  {
    id: 't2',
    name: 'Asker Open',
    date: '2025-01-05',
    course: 'Asker Golfklubb',
    type: 'club',
    rounds: 1,
    scores: [74],
    total: 74,
    par: 72,
    position: 5,
    participants: 32,
    earnings: 0,
    rankingPoints: 80,
  },
  {
    id: 't3',
    name: 'Vintercup Finale',
    date: '2024-12-15',
    course: 'Bogstad Golfklubb',
    type: 'ranking',
    rounds: 3,
    scores: [71, 73, 69],
    total: 213,
    par: 216,
    position: 1,
    participants: 56,
    earnings: 15000,
    rankingPoints: 300,
  },
  {
    id: 't4',
    name: 'Junior Tour Runde 4',
    date: '2024-12-01',
    course: 'Drammen Golfklubb',
    type: 'tour',
    rounds: 2,
    scores: [75, 72],
    total: 147,
    par: 144,
    position: 8,
    participants: 42,
    earnings: 2000,
    rankingPoints: 60,
  },
  {
    id: 't5',
    name: 'Hostturnering NGF',
    date: '2024-11-15',
    course: 'Miklagard Golfklubb',
    type: 'ranking',
    rounds: 2,
    scores: [73, 74],
    total: 147,
    par: 144,
    position: 12,
    participants: 64,
    earnings: 1000,
    rankingPoints: 45,
  },
];

const STATS = {
  totalTournaments: 15,
  wins: 2,
  top3: 5,
  top10: 11,
  avgPosition: 6.8,
  avgScore: 72.4,
  bestRound: 69,
  totalEarnings: 28000,
  totalPoints: 1250,
};

// ============================================================================
// HELPERS
// ============================================================================

const getTypeConfig = (type) => {
  switch (type) {
    case 'ranking':
      return { label: 'Ranking', color: 'var(--achievement)' };
    case 'tour':
      return { label: 'Tour', color: 'var(--accent)' };
    case 'club':
      return { label: 'Klubb', color: 'var(--status-success)' };
    default:
      return { label: type, color: 'var(--text-secondary)' };
  }
};

const getPositionColor = (position) => {
  if (position === 1) return 'var(--achievement)';
  if (position === 2) return 'rgb(var(--text-secondary))';
  if (position === 3) return 'rgb(var(--status-warning))';
  if (position <= 10) return 'var(--accent)';
  return 'var(--text-secondary)';
};

// ============================================================================
// RESULT CARD
// ============================================================================

const ResultCard = ({ result, onClick }) => {
  const typeConfig = getTypeConfig(result.type);
  const scoreToPar = result.total - result.par;

  return (
    <div
      onClick={() => onClick(result)}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '14px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}>
              {typeConfig.label}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {new Date(result.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <SubSectionTitle>
            {result.name}
          </SubSectionTitle>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '4px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <MapPin size={12} />
            {result.course}
          </div>
        </div>

        {/* Position Badge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: `${getPositionColor(result.position)}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700,
            color: getPositionColor(result.position),
          }}>
            {result.position}
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            av {result.participants}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '10px',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Runder</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {result.scores.join(' + ')}
          </div>
        </div>
        <div style={{ borderLeft: '1px solid var(--border-default)', height: '30px' }} />
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {result.total}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Til par</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: scoreToPar < 0 ? 'var(--status-success)' :
                   scoreToPar > 0 ? 'var(--status-error)' : 'var(--text-primary)',
          }}>
            {scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
        }}>
          {result.rankingPoints > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={14} color={'var(--accent)'} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)' }}>
                +{result.rankingPoints} poeng
              </span>
            </div>
          )}
          {result.earnings > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trophy size={14} color={'var(--achievement)'} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--achievement)' }}>
                {result.earnings.toLocaleString()} kr
              </span>
            </div>
          )}
        </div>
        <ChevronRight size={18} color={'var(--text-secondary)'} />
      </div>
    </div>
  );
};

// ============================================================================
// STATS OVERVIEW
// ============================================================================

const StatsOverview = ({ stats }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px',
    marginBottom: '24px',
  }}>
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      padding: '14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>
        {stats.totalTournaments}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Turneringer</div>
    </div>
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      padding: '14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--achievement)' }}>
        {stats.wins}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Seire</div>
    </div>
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      padding: '14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--status-success)' }}>
        {stats.top3}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Topp 3</div>
    </div>
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      padding: '14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {stats.avgScore}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Snitt score</div>
    </div>
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      padding: '14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--status-error)' }}>
        {stats.bestRound}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Beste runde</div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TurneringsResultaterContainer = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { key: 'all', label: 'Alle' },
    { key: 'ranking', label: 'Ranking' },
    { key: 'tour', label: 'Tour' },
    { key: 'club', label: 'Klubb' },
  ];

  // Fetch tournament results from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const playerId = localStorage.getItem('playerId');
        const response = await calendarAPI.getTournamentResults(playerId);
        const data = response.data?.data || response.data || TOURNAMENT_RESULTS;
        setResults(data);

        // Calculate stats from results
        if (data.length > 0) {
          const calculatedStats = {
            totalTournaments: data.length,
            wins: data.filter(r => r.position === 1).length,
            top3: data.filter(r => r.position <= 3).length,
            top10: data.filter(r => r.position <= 10).length,
            avgPosition: data.reduce((sum, r) => sum + r.position, 0) / data.length,
            avgScore: data.reduce((sum, r) => sum + (r.total / r.rounds), 0) / data.length,
            bestRound: Math.min(...data.flatMap(r => r.scores)),
            totalEarnings: data.reduce((sum, r) => sum + (r.earnings || 0), 0),
            totalPoints: data.reduce((sum, r) => sum + (r.rankingPoints || 0), 0),
          };
          setStats(calculatedStats);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Kunne ikke laste resultater');
        setResults(TOURNAMENT_RESULTS);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleResultClick = (result) => {
    navigate(`/turneringer/${result.id}`, { state: { result } });
  };

  const filteredResults = results.filter(
    (r) => filter === 'all' || r.type === filter
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <PageHeader
        title="Turneringsresultater"
        subtitle="Dine resultater og statistikk"
        helpText="Komplett oversikt over dine turneringsresultater med statistikk, trender og beste prestasjoner. Analyser resultatene dine over tid og identifiser forbedringsmuligheter."
      />

      <div style={{ padding: '16px 24px 24px', width: '100%' }}>
        {/* Stats */}
        <StatsOverview stats={STATS} />

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '20px',
          overflowX: 'auto',
        }}>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === f.key ? 'var(--accent)' : 'var(--bg-primary)',
                color: filter === f.key ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            marginBottom: '20px',
          }}>
            <AlertCircle size={20} color="var(--status-error)" />
            <span style={{ fontSize: '14px', color: 'var(--status-error)', fontWeight: 500 }}>
              {error} (viser demo-data)
            </span>
          </div>
        )}

        {/* Results List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredResults.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              onClick={handleResultClick}
            />
          ))}

          {filteredResults.length === 0 && (
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '14px',
              padding: '40px',
              textAlign: 'center',
            }}>
              <Trophy size={40} color={'var(--text-secondary)'} style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Ingen resultater funnet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurneringsResultaterContainer;
