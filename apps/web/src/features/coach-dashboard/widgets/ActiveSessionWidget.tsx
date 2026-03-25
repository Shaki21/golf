import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI, Session } from '../../../services/api';
import Card from '../../../ui/primitives/Card';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../components/typography';
import { Play, Clock, MapPin, ChevronRight } from 'lucide-react';

interface ActiveSessionWidgetProps {
  playerId?: string;
  onSessionClick?: (sessionId: string) => void;
}

export const ActiveSessionWidget: React.FC<ActiveSessionWidgetProps> = ({
  playerId,
  onSessionClick,
}) => {
  const navigate = useNavigate();
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const response = await sessionsAPI.getInProgress();
        const sessions = response.data.data || [];
        setActiveSessions(playerId ? sessions.filter(s => s.playerId === playerId) : sessions);
      } catch (error) {
        console.error('Could not fetch active sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSessions();
    // Poll every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, [playerId]);

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}t ${mins}min`;
  };

  if (loading) {
    return (
      <Card variant="default" padding="md">
        <div className="animate-pulse">
          <div className="h-4 bg-tier-surface-base rounded w-1/3 mb-3" />
          <div className="h-16 bg-tier-surface-base rounded" />
        </div>
      </Card>
    );
  }

  if (activeSessions.length === 0) {
    return null; // Don't show widget if no active sessions
  }

  return (
    <Card variant="default" padding="md" className="border-l-4 border-tier-success">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-tier-success animate-pulse" />
        <SubSectionTitle>Aktive økter</SubSectionTitle>
      </div>

      <div className="space-y-2">
        {activeSessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSessionClick?.(session.id) || navigate(`/sessions/${session.id}`)}
            className="w-full flex items-center gap-3 p-3 bg-tier-success/5 rounded-lg hover:bg-tier-success/10 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-tier-success/20 flex items-center justify-center">
              <Play size={18} className="text-tier-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-tier-navy truncate">
                {session.sessionType || 'Treningsøkt'}
              </p>
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <Clock size={12} />
                <span>{formatDuration(session.sessionDate)}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-tier-text-secondary" />
          </button>
        ))}
      </div>

      {activeSessions.length > 0 && (
        <p className="text-xs text-tier-success font-medium mt-2 text-center">
          {activeSessions.length} aktiv{activeSessions.length > 1 ? 'e' : ''} økt{activeSessions.length > 1 ? 'er' : ''}
        </p>
      )}
    </Card>
  );
};

export default ActiveSessionWidget;
