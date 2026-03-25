import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { coachesAPI, AthleteDTO } from '../../services/api';
import { ListPageSkeleton } from '../../components/skeletons';
import ErrorState from '../../components/ui/ErrorState';
import CoachAthleteList from './CoachAthleteList';
import { PlayerAssignment } from '../coach/athletes';
import { Button } from '../../components/shadcn';
import { UserPlus } from 'lucide-react';

// Transform AthleteDTO to the format expected by CoachAthleteList
type Athlete = {
  id: string;
  firstName: string;
  lastName: string;
};

/**
 * CoachAthleteListContainer
 * Fetches coach's athletes and provides navigation to detail view.
 */
const CoachAthleteListContainer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'idle' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [athletes, setAthletes] = useState<AthleteDTO[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);

  const fetchAthletes = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      // Try /coaches/me/players first (authenticated coach), fallback to /coaches/:id/players
      let data: AthleteDTO[] = [];
      try {
        const response = await coachesAPI.getAthletes();
        data = response.data?.data || response.data || [];
      } catch {
        // Fallback to specific coach ID endpoint
        // Safely extract coachId from user object
        const userWithCoach = user as { coachId?: string; id?: string } | null;
        const coachId = userWithCoach?.coachId || userWithCoach?.id;
        if (coachId) {
          const response = await coachesAPI.getPlayers(coachId);
          data = response.data?.data || response.data || [];
        }
      }

      // Ensure we have an array
      const athleteArray = Array.isArray(data) ? data : [];

      setAthletes(athleteArray);
      setUsingFallback(false);
      setState('idle');
    } catch (err) {
      console.error('Error fetching athletes:', err);
      setError(err as Error);
      setState('error');
      toast.error('Could not load players. Please try again.');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAthletes();
    }
  }, [user, fetchAthletes]);

  const handleSelectAthlete = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}`);
  };

  // Transform AthleteDTO to Athlete format expected by CoachAthleteList
  // Must be called unconditionally before conditional returns
  const transformedAthletes: Athlete[] = useMemo(() =>
    athletes.map((a): Athlete => ({
      id: a.id,
      firstName: a.firstName || '',
      lastName: a.lastName || '',
    })), [athletes]);

  if (state === 'loading') {
    return <ListPageSkeleton items={8} />;
  }

  if (state === 'error' && athletes.length === 0) {
    const errorType = error && typeof error === 'object' && 'type' in error
      ? (error as { type?: string }).type
      : undefined;
    return (
      <ErrorState
        errorType={errorType}
        message={error?.message || 'Could not load players'}
        onRetry={fetchAthletes}
      />
    );
  }

  const handlePlayerAssigned = () => {
    // Refresh the list when a player is assigned
    fetchAthletes();
  };

  return (
    <div className="space-y-4">
      {/* Add Player Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAssignment(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add player
        </Button>
      </div>

      {/* Player Assignment Modal */}
      {showAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PlayerAssignment
            onPlayerAssigned={handlePlayerAssigned}
            onClose={() => setShowAssignment(false)}
          />
        </div>
      )}

      {/* Athletes List */}
      <CoachAthleteList
        athletes={transformedAthletes}
        onSelectAthlete={handleSelectAthlete}
      />
    </div>
  );
};

export default CoachAthleteListContainer;
