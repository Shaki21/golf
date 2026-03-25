/**
 * PlayerAssignment - Assign Players to Coach
 *
 * Allows coaches to search for and assign unassigned players to their roster.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, X, Check, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '../../../components/shadcn';
import apiClient from '../../../services/apiClient';
import { useAuth } from '../../../contexts/AuthContext';

interface AvailablePlayer {
  id: string;
  firstName: string;
  lastName: string;
  handicap?: number;
  category?: string;
  user?: {
    email: string;
  };
}

interface PlayerAssignmentProps {
  onPlayerAssigned?: (player: AvailablePlayer) => void;
  onClose?: () => void;
}

export default function PlayerAssignment({ onPlayerAssigned, onClose }: PlayerAssignmentProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<AvailablePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debounced search
  const searchPlayers = useCallback(async (search: string) => {
    if (!user?.coachId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/v1/coaches/available-players', {
        params: { search: search || undefined },
      });
      setPlayers(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch available players:', err);
      setError('Kunne ikke hente tilgjengelige spillere');
    } finally {
      setLoading(false);
    }
  }, [user?.coachId]);

  // Initial load and debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchPlayers]);

  const handleAssignPlayer = async (player: AvailablePlayer) => {
    if (!user?.coachId || assigning) return;

    setAssigning(player.id);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/api/v1/coaches/me/players/${player.id}`);
      setSuccess(`${player.firstName} ${player.lastName} ble lagt til`);
      setPlayers(prev => prev.filter(p => p.id !== player.id));
      onPlayerAssigned?.(player);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to assign player:', err);
      setError(err.response?.data?.error?.message || 'Kunne ikke legge til spiller');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="w-5 h-5 text-tier-navy" />
          Legg til spiller
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tier-text-tertiary" />
          <Input
            type="text"
            placeholder="Sok etter spiller (navn eller e-post)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Players List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-tier-navy" />
              <span className="ml-2 text-tier-text-secondary">Laster...</span>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8 text-tier-text-secondary">
              {searchTerm
                ? 'Ingen spillere funnet'
                : 'Alle spillere er allerede tildelt en trener'}
            </div>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-tier-surface-base rounded-lg hover:bg-tier-surface-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-tier-navy">
                      {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-tier-navy">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-sm text-tier-text-secondary">
                      {player.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {player.handicap !== undefined && player.handicap !== null && (
                    <Badge variant="secondary" className="text-xs">
                      HCP {player.handicap.toFixed(1)}
                    </Badge>
                  )}
                  {player.category && (
                    <Badge variant="outline" className="text-xs">
                      Kat. {player.category}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleAssignPlayer(player)}
                    disabled={assigning === player.id}
                  >
                    {assigning === player.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Legg til
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Text */}
        <p className="text-xs text-tier-text-tertiary text-center">
          Viser spillere uten tildelt trener
        </p>
      </CardContent>
    </Card>
  );
}
