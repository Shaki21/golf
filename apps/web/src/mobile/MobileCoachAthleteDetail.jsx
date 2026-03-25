import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, TrendingUp, Calendar, Award, MessageCircle } from 'lucide-react';
import { PageTitle, SubSectionTitle } from '../components/typography';
import { SkeletonCard, SkeletonLine, SkeletonCircle } from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { playersAPI, sessionsAPI, testsAPI } from '../services/api';

const MobileCoachAthleteDetail = ({ athleteId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [athlete, setAthlete] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sessions' | 'tests'

  useEffect(() => {
    fetchAthleteData();
  }, [athleteId]);

  const fetchAthleteData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [playerRes, sessionsRes, testsRes] = await Promise.all([
        playersAPI.getById(athleteId),
        sessionsAPI.list({ playerId: athleteId }),
        testsAPI.getResults(athleteId),
      ]);

      const player = playerRes.data;
      const sessionsData = sessionsRes.data.sessions || sessionsRes.data || [];
      const testsData = testsRes.data.results || testsRes.data || [];

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sessionsThisWeek = sessionsData.filter(
        (s) => new Date(s.sessionDate || s.date) >= weekAgo
      ).length;

      // Map sessions
      const recentSessions = sessionsData.slice(0, 5).map((s) => ({
        id: s.id,
        date: s.sessionDate?.split('T')[0] || s.date,
        type: s.sessionType || s.type || 'Trening',
        duration: s.duration || 60,
        quality: s.quality || 'medium',
      }));

      // Map tests
      const latestTests = testsData.slice(0, 5).map((t) => ({
        id: t.id,
        name: t.testName || t.name || 'Test',
        date: t.date?.split('T')[0] || t.createdAt?.split('T')[0],
        score: t.score || t.value || 0,
        trend: t.trend || 'stable',
      }));

      // Get upcoming sessions
      const upcomingSessions = sessionsData
        .filter((s) => s.status !== 'completed' && new Date(s.sessionDate || s.date) > now)
        .slice(0, 3)
        .map((s) => ({
          id: s.id,
          date: s.sessionDate?.split('T')[0] || s.date,
          time: s.startTime || s.sessionDate?.split('T')[1]?.slice(0, 5) || '00:00',
          type: s.sessionType || s.type || 'Trening',
        }));

      setAthlete({
        id: player.id,
        name: player.name || `${player.firstName} ${player.lastName}`,
        email: player.email || '',
        avatar: player.avatar || null,
        handicap: player.handicap || 0,
        level: player.category || player.level || 'Ukjent',
        joinDate: player.createdAt?.split('T')[0] || '',
        stats: {
          sessionsThisWeek,
          totalSessions: sessionsData.length,
          avgScore: player.averageScore || 0,
          improvement: player.improvement || '0',
        },
        recentSessions,
        latestTests,
        upcomingSessions,
      });
    } catch (err) {
      // Fallback to empty state on 404
      if (err.response?.status === 404) {
        setAthlete({
          id: athleteId,
          name: 'Ukjent utøver',
          email: '',
          avatar: null,
          handicap: 0,
          level: 'Ukjent',
          joinDate: '',
          stats: { sessionsThisWeek: 0, totalSessions: 0, avgScore: 0, improvement: '0' },
          recentSessions: [],
          latestTests: [],
          upcomingSessions: [],
        });
      } else {
        setError(err.message || 'Kunne ikke laste utøverdata');
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchAthleteData} />;
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <div style={{ padding: '24px' }}>
          <SkeletonLine width="100px" height="40px" style={{ marginBottom: '24px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <SkeletonCircle size="80px" />
            <div style={{ flex: 1 }}>
              <SkeletonLine width="150px" height="24px" style={{ marginBottom: '8px' }} />
              <SkeletonLine width="100px" height="16px" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
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
        <button
          onClick={onBack}
          aria-label="Gå tilbake"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--bg-primary)',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '16px',
            fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          }}
        >
          <ArrowLeft size={20} />
          Tilbake
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <User size={40} />
          </div>
          <div style={{ flex: 1 }}>
            <PageTitle style={{
              fontSize: '22px', lineHeight: '28px', fontWeight: 700,
              margin: 0,
              marginBottom: '4px',
            }}>
              {athlete.name}
            </PageTitle>
            <div style={{
              fontSize: '15px', lineHeight: '20px', fontWeight: 600,
              opacity: 0.9,
            }}>
              HCP {athlete.handicap} • {athlete.level}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px',
        overflowX: 'auto',
      }}>
        <ActionButton icon={<MessageCircle size={18} />} label="Melding" />
        <ActionButton icon={<Calendar size={18} />} label="Book økt" />
        <ActionButton icon={<Award size={18} />} label="Ny test" />
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        padding: `0 ${'16px'} ${'24px'}`,
      }}>
        <QuickStat label="Økter denne uka" value={athlete.stats.sessionsThisWeek} />
        <QuickStat label="Total økter" value={athlete.stats.totalSessions} />
        <QuickStat label="Gj.snitt score" value={athlete.stats.avgScore} />
        <QuickStat label="Forbedring" value={athlete.stats.improvement} trend="up" />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: `0 ${'16px'}`,
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <Tab label="Oversikt" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <Tab label="Økter" active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} />
        <Tab label="Tester" active={activeTab === 'tests'} onClick={() => setActiveTab('tests')} />
      </div>

      {/* Tab Content */}
      <div style={{ padding: `0 ${'16px'}` }}>
        {activeTab === 'overview' && (
          <div>
            {/* Recent Sessions */}
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <SubSectionTitle style={{
                fontSize: '17px', lineHeight: '22px', fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '16px',
              }}>
                Siste økter
              </SubSectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {athlete.recentSessions.slice(0, 3).map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <SubSectionTitle style={{
                fontSize: '17px', lineHeight: '22px', fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '16px',
              }}>
                Kommende økter
              </SubSectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {athlete.upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      padding: '16px',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{
                      fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {session.type}
                    </div>
                    <div style={{
                      fontSize: '11px', lineHeight: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      {session.date} kl. {session.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {athlete.recentSessions.map((session) => (
                <SessionItem key={session.id} session={session} detailed />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {athlete.latestTests.map((test) => (
                <div
                  key={test.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}>
                        {test.name}
                      </div>
                      <div style={{
                        fontSize: '11px', lineHeight: '13px',
                        color: 'var(--text-secondary)',
                      }}>
                        {test.date}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <div style={{
                        fontSize: '20px', lineHeight: '25px', fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        {test.score}
                      </div>
                      <TrendingUp
                        size={20}
                        color={test.trend === 'up' ? 'var(--success)' : 'var(--text-secondary)'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label }) => (
  <button style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: `${'8px'} ${'16px'}`,
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontSize: '15px', lineHeight: '20px', fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  }}>
    {icon}
    {label}
  </button>
);

const QuickStat = ({ label, value, trend }) => (
  <div style={{
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }}>
    <div style={{
      fontSize: '22px', lineHeight: '28px', fontWeight: 700,
      color: trend === 'up' ? 'var(--success)' : 'var(--text-primary)',
      marginBottom: '4px',
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px', lineHeight: '13px',
      color: 'var(--text-secondary)',
    }}>
      {label}
    </div>
  </div>
);

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: `${'8px'} ${'16px'}`,
      background: 'none',
      border: 'none',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      cursor: 'pointer',
      fontSize: '15px', lineHeight: '20px', fontWeight: 600,
      fontWeight: active ? 600 : 400,
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
    }}
  >
    {label}
  </button>
);

const SessionItem = ({ session, detailed = false }) => {
  const qualityColor = {
    high: 'var(--success)',
    medium: 'var(--warning)',
    low: 'var(--text-secondary)',
  }[session.quality];

  return (
    <div style={{
      padding: '16px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: '15px', lineHeight: '20px', fontWeight: 600,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            {session.type}
          </div>
          <div style={{
            fontSize: '11px', lineHeight: '13px',
            color: 'var(--text-secondary)',
          }}>
            {session.date} • {session.duration} min
          </div>
        </div>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: qualityColor,
        }} />
      </div>
    </div>
  );
};

export default MobileCoachAthleteDetail;
