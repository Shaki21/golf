import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Search } from 'lucide-react';
import { PageTitle, SubSectionTitle } from '../components/typography';
import { SkeletonCard } from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { sessionsAPI } from '../services/api';

const MobileCoachSessionsView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'past'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.date = today;
      } else if (filter === 'upcoming') {
        params.status = 'scheduled';
      } else if (filter === 'past') {
        params.status = 'completed';
      }

      const response = await sessionsAPI.list(params);
      const sessionsData = response.data.sessions || response.data || [];

      // Map API response to expected format
      const mappedSessions = sessionsData.map((s) => ({
        id: s.id,
        athlete: s.player?.name || s.playerName || 'Ukjent utøver',
        date: s.sessionDate?.split('T')[0] || s.date,
        time: s.startTime || s.sessionDate?.split('T')[1]?.slice(0, 5) || '00:00',
        duration: s.duration || 60,
        type: s.sessionType || s.type || 'Trening',
        status: s.status === 'completed' ? 'completed' : 'upcoming',
        notes: s.notes || s.coachNotes || '',
      }));

      setSessions(mappedSessions);
    } catch (err) {
      // Fallback to empty state on 404
      if (err.response?.status === 404) {
        setSessions([]);
      } else {
        setError(err.message || 'Kunne ikke laste økter');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.athlete.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const today = new Date().toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        return session.date === today;
      case 'upcoming':
        return session.status === 'upcoming';
      case 'past':
        return session.status === 'completed';
      default:
        return true;
    }
  });

  if (error) {
    return <ErrorState message={error} onRetry={fetchSessions} />;
  }

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      backgroundColor: 'var(--bg-secondary)',
      minHeight: '100vh',
      paddingBottom: '32px',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--accent)',
        color: 'var(--bg-primary)',
        padding: '24px',
      }}>
        <PageTitle style={{
          fontSize: '22px', lineHeight: '28px', fontWeight: 700,
          margin: 0,
          marginBottom: '8px',
        }}>
          Treningsøkter
        </PageTitle>
        <p style={{
          fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          margin: 0,
          opacity: 0.9,
        }}>
          Administrer økter med utøvere
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '16px',
        }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
            }}
          />
          <input
            type="text"
            placeholder="Søk etter utøver eller økttype..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: `${'16px'} ${'16px'} ${'16px'} 48px`,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px', lineHeight: '20px', fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}>
          <FilterTab label="Alle" active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterTab label="I dag" active={filter === 'today'} onClick={() => setFilter('today')} />
          <FilterTab label="Kommende" active={filter === 'upcoming'} onClick={() => setFilter('upcoming')} />
          <FilterTab label="Tidligere" active={filter === 'past'} onClick={() => setFilter('past')} />
        </div>

        {/* Sessions List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: `${'32px'} ${'24px'}`,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <Calendar size={48} color={'var(--text-secondary)'} style={{ margin: '0 auto 16px' }} />
            <div style={{
              fontSize: '17px', lineHeight: '22px', fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}>
              Ingen økter funnet
            </div>
            <div style={{
              fontSize: '15px', lineHeight: '20px', fontWeight: 600,
              color: 'var(--text-secondary)',
            }}>
              {searchQuery ? 'Prøv et annet søk' : 'Ingen økter matcher dette filteret'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: `${'8px'} ${'16px'}`,
      backgroundColor: active ? 'var(--accent)' : 'var(--bg-primary)',
      color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
      border: active ? 'none' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontSize: '15px', lineHeight: '20px', fontWeight: 600,
      fontWeight: active ? 600 : 400,
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
    }}
  >
    {label}
  </button>
);

const SessionCard = ({ session }) => {
  const isUpcoming = session.status === 'upcoming';

  const sessionTypeColors = {
    'Technique': 'var(--accent)',
    'Strategy': 'var(--achievement)',
    'Mental': 'var(--success)',
    'Short Game': 'var(--warning)',
    'Full Swing': 'var(--accent)',
  };

  const typeColor = sessionTypeColors[session.type] || 'var(--text-secondary)';

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 'var(--radius-md)',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: isUpcoming ? '2px solid rgba(var(--accent-rgb), 0.15)' : 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div style={{ flex: 1 }}>
          <SubSectionTitle style={{
            fontSize: '17px', lineHeight: '22px', fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '4px',
          }}>
            {session.athlete}
          </SubSectionTitle>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: `${typeColor}15`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px', lineHeight: '13px',
            fontWeight: 600,
            color: typeColor,
          }}>
            {session.type}
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          backgroundColor: isUpcoming ? 'rgba(var(--success-rgb), 0.15)' : 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px', lineHeight: '13px',
          fontWeight: 600,
          color: isUpcoming ? 'var(--success)' : 'var(--text-secondary)',
        }}>
          {isUpcoming ? 'Kommende' : 'Fullført'}
        </div>
      </div>

      {/* Date & Time */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          color: 'var(--text-secondary)',
        }}>
          <Calendar size={16} />
          {new Date(session.date).toLocaleDateString('nb-NO', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          color: 'var(--text-secondary)',
        }}>
          <Clock size={16} />
          {session.time} ({session.duration} min)
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px', lineHeight: '18px',
          color: 'var(--text-primary)',
        }}>
          {session.notes}
        </div>
      )}

      {/* Actions */}
      {isUpcoming && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px',
        }}>
          <button style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '15px', lineHeight: '20px', fontWeight: 600,
            fontWeight: 600,
          }}>
            Start økt
          </button>
          <button style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          }}>
            Rediger
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileCoachSessionsView;
