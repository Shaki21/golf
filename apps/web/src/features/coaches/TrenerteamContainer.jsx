import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { coachesAPI } from '../../services/api';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Trenerteam from './Trenerteam';
import { PageHeader } from '../../ui/raw-blocks';

/**
 * TrenerteamContainer
 * Fetches coach team data and displays using Trenerteam component.
 */
const TrenerteamContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [coaches, setCoaches] = useState([]);

  const fetchCoaches = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      // Fetch all coaches
      const response = await coachesAPI.getAll();

      // Handle different response formats
      let coachData = response.data?.data || response.data || [];
      if (!Array.isArray(coachData)) {
        coachData = coachData.coaches || [];
      }

      // Transform to expected format
      const transformedCoaches = coachData.map((coach, index) => ({
        id: coach.id,
        name: `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.name || 'Trener',
        role: mapSpecializationToRole(coach.specialization),
        isPrimary: index === 0 || coach.isPrimary,
        email: coach.email || coach.user?.email || '',
        phone: coach.phone || coach.user?.phone || '',
        specializations: coach.specializations || coach.expertise || [],
        certifications: coach.certifications || [],
        startYear: coach.hireDate ? new Date(coach.hireDate).getFullYear() : new Date().getFullYear(),
        sessionsTotal: coach.totalSessions || coach.sessionCount || 0,
        sessionsMonth: coach.monthlySessions || 0,
        bio: coach.bio || coach.description || '',
      }));

      setCoaches(transformedCoaches);
      setState(transformedCoaches.length === 0 ? 'empty' : 'idle');
    } catch (err) {
      console.error('Error fetching coaches:', err);
      // Use fallback data on error - component has defaults
      setCoaches([]);
      setState('idle');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCoaches();
    }
  }, [user, fetchCoaches]);

  if (state === 'loading') {
    return <LoadingState message="Loading coaching team..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load coaching team'}
        onRetry={fetchCoaches}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        title="No coaches"
        message="You don't have any coaches assigned yet"
      />
    );
  }

  // Pass coaches data or let component use defaults
  return (
    <>
      <PageHeader
        title="Coaching Team"
        subtitle="Meet your dedicated coaches"
        helpText="Overview of the coaching team with head coach and specialized coaches (technical, physical, mental, strategy). See each coach's profile with specializations, certifications, start year, total sessions and monthly sessions. Contact information (email, phone) and biography available. Use to get to know the team and know who helps you with what."
      />
      <Trenerteam trainers={coaches.length > 0 ? coaches : null} />
    </>
  );
};

/**
 * Map coach specialization to display role
 */
function mapSpecializationToRole(specialization) {
  const roleMap = {
    head: 'head_coach',
    head_coach: 'head_coach',
    technical: 'technical',
    tech: 'technical',
    swing: 'technical',
    physical: 'physical',
    fitness: 'physical',
    strength: 'physical',
    mental: 'mental',
    psychology: 'mental',
    strategy: 'strategy',
    course: 'strategy',
  };
  return roleMap[specialization?.toLowerCase()] || 'technical';
}

export default TrenerteamContainer;
