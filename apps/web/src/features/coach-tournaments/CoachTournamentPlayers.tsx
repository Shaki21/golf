/**
 * TIER Golf - Coach Tournament Players
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * Overview of players' tournament participation and registrations.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trophy,
  User,
  Users,
  Search,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle, SectionTitle } from '../../components/typography/Headings';

interface TournamentEntry {
  id: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  location: string;
  status: 'registered' | 'pending' | 'interested' | 'declined';
  category: string;
}

interface Player {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  category: string;
  upcomingTournaments: TournamentEntry[];
  totalThisYear: number;
  lastTournament?: string;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  category: string;
  registrationDeadline: string;
  status: 'registration_open' | 'registration_closed' | 'upcoming';
}

export default function CoachTournamentPlayers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentIdFromUrl = searchParams.get('tournament');

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(!!tournamentIdFromUrl);
  const [selectedTournamentForRegister, setSelectedTournamentForRegister] = useState<string | null>(tournamentIdFromUrl);

  // Fetch players
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, tournamentsRes] = await Promise.all([
          fetch('/api/v1/coach/tournaments/players'),
          fetch('/api/v1/coach/tournaments'),
        ]);

        if (playersRes.ok) {
          const data = await playersRes.json();
          setPlayers(data.players || []);
        }
        if (tournamentsRes.ok) {
          const data = await tournamentsRes.json();
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setPlayers(generateMockPlayers());
        setTournaments(generateMockTournaments());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate mock players
  const generateMockPlayers = (): Player[] => {
    return [
      {
        id: 'p1',
        name: 'Anders Hansen',
        initials: 'AH',
        avatarColor: 'rgb(var(--1,33,74))',
        category: 'A',
        upcomingTournaments: [
          { id: 'e1', tournamentId: 't1', tournamentName: 'NM Junior 2025', date: '2025-06-15', location: 'Oslo GK', status: 'registered', category: 'junior' },
          { id: 'e2', tournamentId: 't3', tournamentName: 'NGF Tour - Runde 3', date: '2025-05-10', location: 'Borre GK', status: 'registered', category: 'elite' },
          { id: 'e3', tournamentId: 't4', tournamentName: 'Nordisk Mesterskap', date: '2025-07-20', location: 'København', status: 'interested', category: 'junior' },
        ],
        totalThisYear: 8,
        lastTournament: '2025-03-15',
      },
      {
        id: 'p2',
        name: 'Sofie Andersen',
        initials: 'SA',
        avatarColor: 'rgb(var(--status-success-rgb))',
        category: 'B',
        upcomingTournaments: [
          { id: 'e4', tournamentId: 't2', tournamentName: 'TIER Golf Cup', date: '2025-01-20', location: 'Miklagard', status: 'registered', category: 'open' },
        ],
        totalThisYear: 5,
        lastTournament: '2025-02-28',
      },
      {
        id: 'p3',
        name: 'Erik Johansen',
        initials: 'EJ',
        avatarColor: 'rgb(var(--status-warning-rgb))',
        category: 'A',
        upcomingTournaments: [
          { id: 'e5', tournamentId: 't1', tournamentName: 'NM Junior 2025', date: '2025-06-15', location: 'Oslo GK', status: 'registered', category: 'junior' },
          { id: 'e6', tournamentId: 't3', tournamentName: 'NGF Tour - Runde 3', date: '2025-05-10', location: 'Borre GK', status: 'registered', category: 'elite' },
          { id: 'e7', tournamentId: 't7', tournamentName: 'WANG Internserie', date: '2025-02-15', location: 'Miklagard', status: 'registered', category: 'junior' },
        ],
        totalThisYear: 10,
        lastTournament: '2025-03-10',
      },
      {
        id: 'p4',
        name: 'Maria Berg',
        initials: 'MB',
        avatarColor: 'rgb(var(--status-error-rgb))',
        category: 'C',
        upcomingTournaments: [
          { id: 'e8', tournamentId: 't2', tournamentName: 'TIER Golf Cup', date: '2025-01-20', location: 'Miklagard', status: 'registered', category: 'open' },
        ],
        totalThisYear: 3,
        lastTournament: '2025-01-15',
      },
      {
        id: 'p5',
        name: 'Lars Olsen',
        initials: 'LO',
        avatarColor: 'rgb(var(--text-secondary-rgb))',
        category: 'B',
        upcomingTournaments: [
          { id: 'e9', tournamentId: 't1', tournamentName: 'NM Junior 2025', date: '2025-06-15', location: 'Oslo GK', status: 'pending', category: 'junior' },
          { id: 'e10', tournamentId: 't2', tournamentName: 'TIER Golf Cup', date: '2025-01-20', location: 'Miklagard', status: 'registered', category: 'open' },
        ],
        totalThisYear: 6,
        lastTournament: '2025-02-20',
      },
    ];
  };

  // Generate mock tournaments
  const generateMockTournaments = (): Tournament[] => {
    return [
      { id: 't1', name: 'NM Junior 2025', date: '2025-06-15', location: 'Oslo GK', category: 'junior', registrationDeadline: '2025-05-30', status: 'registration_open' },
      { id: 't2', name: 'TIER Golf Cup', date: '2025-01-20', location: 'Miklagard', category: 'open', registrationDeadline: '2025-01-15', status: 'registration_open' },
      { id: 't3', name: 'NGF Tour - Runde 3', date: '2025-05-10', location: 'Borre GK', category: 'elite', registrationDeadline: '2025-05-01', status: 'registration_open' },
      { id: 't4', name: 'Nordisk Mesterskap', date: '2025-07-20', location: 'København', category: 'junior', registrationDeadline: '2025-06-30', status: 'registration_open' },
      { id: 't5', name: 'Sommerturneringen', date: '2025-07-05', location: 'Losby GK', category: 'open', registrationDeadline: '2025-06-28', status: 'registration_open' },
    ];
  };

  // Filter players
  const filteredPlayers = useMemo(() => {
    if (!searchQuery) return players;
    const query = searchQuery.toLowerCase();
    return players.filter(
      (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalRegistrations = players.reduce(
      (sum, p) => sum + p.upcomingTournaments.filter((t) => t.status === 'registered').length,
      0
    );
    const pendingRegistrations = players.reduce(
      (sum, p) => sum + p.upcomingTournaments.filter((t) => t.status === 'pending').length,
      0
    );
    const playersWithTournaments = players.filter((p) => p.upcomingTournaments.length > 0).length;

    return { totalRegistrations, pendingRegistrations, playersWithTournaments };
  }, [players]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  };

  // Get status config
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'registered':
        return { label: 'Registered', colorClass: 'text-tier-success', bgClass: 'bg-tier-success/15', icon: CheckCircle };
      case 'pending':
        return { label: 'Pending', colorClass: 'text-tier-warning', bgClass: 'bg-tier-warning/15', icon: Clock };
      case 'interested':
        return { label: 'Interested', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/15', icon: Star };
      case 'declined':
        return { label: 'Declined', colorClass: 'text-tier-error', bgClass: 'bg-tier-error/15', icon: AlertCircle };
      default:
        return { label: status, colorClass: 'text-tier-text-secondary', bgClass: 'bg-tier-surface-base', icon: Clock };
    }
  };

  // Handle register player
  const handleRegisterPlayer = async (playerId: string, tournamentId: string) => {
    try {
      await fetch(`/api/v1/coach/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      // Update local state
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === playerId) {
            const tournament = tournaments.find((t) => t.id === tournamentId);
            if (tournament) {
              return {
                ...p,
                upcomingTournaments: [
                  ...p.upcomingTournaments,
                  {
                    id: `new-${Date.now()}`,
                    tournamentId,
                    tournamentName: tournament.name,
                    date: tournament.date,
                    location: tournament.location,
                    status: 'pending' as const,
                    category: tournament.category,
                  },
                ],
              };
            }
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Failed to register player:', error);
    }

    setShowRegisterModal(false);
    setSelectedTournamentForRegister(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header */}
      <div className="bg-tier-white border-b border-tier-border-default py-5 px-6">
        <PageHeader
          title="Player Participation"
          subtitle="Overview of players' tournament registrations"
          helpText="Alphabetical overview of players' tournament participation. See registrations, pending entries, and tournament history for each player."
          onBack={() => navigate('/coach/tournaments')}
          divider={false}
        />

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-success/10 rounded-lg">
            <CheckCircle size={16} className="text-tier-success" />
            <span className="text-[13px] text-tier-navy">
              <strong>{stats.totalRegistrations}</strong> registrations
            </span>
          </div>
          {stats.pendingRegistrations > 0 && (
            <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-warning/15 rounded-lg">
              <Clock size={16} className="text-tier-warning" />
              <span className="text-[13px] text-tier-navy">
                <strong>{stats.pendingRegistrations}</strong> pending
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-navy/10 rounded-lg">
            <Users size={16} className="text-tier-navy" />
            <span className="text-[13px] text-tier-navy">
              <strong>{stats.playersWithTournaments}</strong> of {players.length} players
            </span>
          </div>
        </div>
      </div>

      {/* Search and actions */}
      <div className="bg-tier-white py-4 px-6 border-b border-tier-border-default flex gap-3 items-center">
        <div className="flex items-center gap-2 py-2 px-3 bg-tier-surface-base rounded-lg flex-1 max-w-[300px]">
          <Search size={18} className="text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-tier-navy outline-none"
          />
        </div>

        <Button
          variant="primary"
          onClick={() => setShowRegisterModal(true)}
          leftIcon={<Plus size={18} />}
        >
          Register player
        </Button>
      </div>

      {/* Player list */}
      <div className="p-6">
        <div className="flex flex-col gap-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-tier-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Player header */}
              <div className="p-4 px-5 flex items-center justify-between border-b border-tier-surface-base">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full text-tier-white flex items-center justify-center text-base font-semibold"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {player.initials}
                  </div>
                  <div>
                    <SubSectionTitle className="m-0">
                      {player.name}
                    </SubSectionTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold text-tier-navy bg-tier-navy/15 py-0.5 px-2 rounded">
                        Category {player.category}
                      </span>
                      <span className="text-xs text-tier-text-secondary">
                        {player.totalThisYear} tournaments this year
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/coach/athletes/${player.id}`)}
                  leftIcon={<User size={16} />}
                >
                  Profile
                </Button>
              </div>

              {/* Tournaments */}
              <div className="p-4 px-5">
                {player.upcomingTournaments.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-tier-text-secondary text-sm">
                    <Trophy size={18} className="mr-2" />
                    No upcoming tournaments
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {player.upcomingTournaments.map((entry) => {
                      const statusConfig = getStatusConfig(entry.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 px-3.5 bg-tier-surface-base rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Trophy size={16} className="text-amber-500" />
                            <div>
                              <div className="text-sm font-medium text-tier-navy">
                                {entry.tournamentName}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-tier-text-secondary">
                                  {formatDate(entry.date)}
                                </span>
                                <span className="text-xs text-tier-text-secondary">•</span>
                                <span className="text-xs text-tier-text-secondary">
                                  {entry.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full ${statusConfig.bgClass}`}>
                            <StatusIcon size={14} className={statusConfig.colorClass} />
                            <span className={`text-xs font-medium ${statusConfig.colorClass}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register modal */}
      {showRegisterModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => {
              setShowRegisterModal(false);
              setSelectedTournamentForRegister(null);
            }}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tier-white rounded-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-auto z-[101]">
            <SectionTitle className="m-0 mb-5">
              Register player
            </SectionTitle>

            {/* Tournament selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-tier-navy mb-2">
                Select tournament
              </label>
              <select
                value={selectedTournamentForRegister || ''}
                onChange={(e) => setSelectedTournamentForRegister(e.target.value)}
                className="w-full p-3 border border-tier-border-default rounded-lg text-sm text-tier-navy"
              >
                <option value="">Select tournament...</option>
                {tournaments
                  .filter((t) => t.status === 'registration_open')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {formatDate(t.date)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Player selection */}
            {selectedTournamentForRegister && (
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-2">
                  Select players
                </label>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-auto">
                  {players.map((player) => {
                    const isAlreadyRegistered = player.upcomingTournaments.some(
                      (t) => t.tournamentId === selectedTournamentForRegister
                    );

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 bg-tier-surface-base rounded-lg ${
                          isAlreadyRegistered ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full text-tier-white flex items-center justify-center text-xs font-semibold"
                            style={{ backgroundColor: player.avatarColor }}
                          >
                            {player.initials}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-tier-navy">
                              {player.name}
                            </div>
                            <div className="text-xs text-tier-text-secondary">
                              Category {player.category}
                            </div>
                          </div>
                        </div>

                        {isAlreadyRegistered ? (
                          <span className="text-xs text-tier-success font-medium">
                            Already registered
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRegisterPlayer(player.id, selectedTournamentForRegister)}
                          >
                            Register
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-5">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedTournamentForRegister(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
