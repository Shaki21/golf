import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Activity } from 'lucide-react';
import { PageTitle, SectionTitle } from '../components/typography';
import { SkeletonCard, SkeletonLine } from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { coachesAPI } from '../services/api';

const MobileCoachDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, scheduleRes] = await Promise.all([
        coachesAPI.getDashboard(),
        coachesAPI.getTodaySchedule(),
      ]);

      const dashboard = dashboardRes.data;
      const schedule = scheduleRes.data;

      setStats({
        totalAthletes: dashboard.totalAthletes || 0,
        activeToday: dashboard.activeToday || 0,
        upcomingSessions: dashboard.upcomingSessions || 0,
        recentTests: dashboard.recentTests || 0,
        activeAthletes: dashboard.recentActivity || [],
        upcomingSchedule: schedule.sessions || [],
      });
    } catch (err) {
      // Fallback to empty state on 404 (endpoint not implemented)
      if (err.response?.status === 404) {
        setStats({
          totalAthletes: 0,
          activeToday: 0,
          upcomingSessions: 0,
          recentTests: 0,
          activeAthletes: [],
          upcomingSchedule: [],
        });
      } else {
        setError(err.message || 'Kunne ikke laste dashboard-data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
        backgroundColor: 'var(--bg-secondary)',
        minHeight: '100vh',
      }}>
        <SkeletonLine width="200px" height="32px" style={{ marginBottom: '24px' }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard style={{ height: '300px' }} />
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
        padding: '24px',
        backgroundColor: 'var(--accent)',
        color: 'var(--bg-primary)',
      }}>
        <PageTitle style={{
          fontSize: '22px', lineHeight: '28px', fontWeight: 700,
          margin: 0,
          marginBottom: '8px',
        }}>
          Trener Dashboard
        </PageTitle>
        <p style={{
          fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          margin: 0,
          opacity: 0.9,
        }}>
          Oversikt over dine utøvere
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <StatCard
            icon={<Users size={24} />}
            label="Totale utøvere"
            value={stats.totalAthletes}
            color={'var(--accent)'}
          />
          <StatCard
            icon={<Activity size={24} />}
            label="Aktive i dag"
            value={stats.activeToday}
            color={'var(--success)'}
          />
          <StatCard
            icon={<Calendar size={24} />}
            label="Kommende økter"
            value={stats.upcomingSessions}
            color={'var(--achievement)'}
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Nye tester"
            value={stats.recentTests}
            color={'var(--warning)'}
          />
        </div>

        {/* Active Athletes */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <SectionTitle style={{
            fontSize: '17px', lineHeight: '22px', fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '16px',
          }}>
            Nylig aktivitet
          </SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.activeAthletes.map((athlete) => (
              <div
                key={athlete.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}>
                    {athlete.name}
                  </div>
                  <div style={{
                    fontSize: '13px', lineHeight: '18px',
                    color: 'var(--text-secondary)',
                  }}>
                    {athlete.activity}
                  </div>
                </div>
                <div style={{
                  fontSize: '11px', lineHeight: '13px',
                  color: 'var(--text-secondary)',
                  textAlign: 'right',
                }}>
                  {athlete.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <SectionTitle style={{
            fontSize: '17px', lineHeight: '22px', fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '16px',
          }}>
            Dagens øktplan
          </SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.upcomingSchedule.map((session) => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px', lineHeight: '13px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  minWidth: '60px',
                  textAlign: 'center',
                }}>
                  {session.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}>
                    {session.athlete}
                  </div>
                  <div style={{
                    fontSize: '11px', lineHeight: '13px',
                    color: 'var(--text-secondary)',
                  }}>
                    {session.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
    }}>
      {icon}
    </div>
    <div style={{
      fontSize: '34px', lineHeight: '41px', fontWeight: 700,
      color: 'var(--text-primary)',
      margin: 0,
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '11px', lineHeight: '13px',
      color: 'var(--text-secondary)',
      margin: 0,
    }}>
      {label}
    </div>
  </div>
);

export default MobileCoachDashboard;
