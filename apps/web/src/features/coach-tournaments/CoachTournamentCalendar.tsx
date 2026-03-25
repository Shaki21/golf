/**
 * TIER Golf - Coach Tournament Calendar
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * Tournament calendar for coaches with player participation overview.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Star,
  Medal,
  Flag,
  CheckCircle,
  ExternalLink,
  Eye,
  UserPlus,
  MessageSquare,
  Send,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

interface PlayerParticipant {
  id: string;
  name: string;
  initials: string;
  category: string;
  status: 'registered' | 'pending' | 'interested';
}

interface Tournament {
  id: string;
  name: string;
  type: 'championship' | 'tour' | 'club' | 'international';
  category: 'junior' | 'elite' | 'open' | 'senior';
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'registration_open' | 'registration_closed' | 'upcoming' | 'in_progress' | 'completed';
  description?: string;
  format: string;
  fee: number;
  myPlayers: PlayerParticipant[];
}

export default function CoachTournamentCalendar() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my_players' | 'upcoming'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTournament, setMessageTournament] = useState<Tournament | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/v1/coach/tournaments');
        if (response.ok) {
          const data = await response.json();
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
        setTournaments(generateMockTournaments());
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Generate mock tournaments
  const generateMockTournaments = (): Tournament[] => {
    const players = [
      { id: 'p1', name: 'Anders Hansen', initials: 'AH', category: 'A' },
      { id: 'p2', name: 'Sofie Andersen', initials: 'SA', category: 'B' },
      { id: 'p3', name: 'Erik Johansen', initials: 'EJ', category: 'A' },
      { id: 'p4', name: 'Maria Berg', initials: 'MB', category: 'C' },
      { id: 'p5', name: 'Lars Olsen', initials: 'LO', category: 'B' },
    ];

    return [
      {
        id: 't1',
        name: 'Garmin Norgescup - Runde 4',
        type: 'championship',
        category: 'junior',
        startDate: '2025-06-15',
        endDate: '2025-06-17',
        location: 'Oslo Golfklubb',
        city: 'Oslo',
        registrationDeadline: '2025-05-30',
        maxParticipants: 120,
        currentParticipants: 87,
        status: 'registration_open',
        description: 'Fjerde runde av Garmin Norgescup. Viktig for sluttspill-kvalifisering.',
        format: '54 hull slagspill',
        fee: 850,
        myPlayers: [
          { ...players[0], status: 'registered' },
          { ...players[2], status: 'registered' },
          { ...players[4], status: 'pending' },
        ],
      },
      {
        id: 't2',
        name: 'Srixon Tour - Miklagard',
        type: 'tour',
        category: 'open',
        startDate: '2025-01-20',
        endDate: '2025-01-20',
        location: 'Miklagard Golf',
        city: 'Kløfta',
        registrationDeadline: '2025-01-15',
        maxParticipants: 60,
        currentParticipants: 45,
        status: 'registration_open',
        description: 'Srixon Tour på Miklagard Golf. Åpen klasse.',
        format: '18 hull stableford',
        fee: 350,
        myPlayers: [
          { ...players[0], status: 'registered' },
          { ...players[1], status: 'registered' },
          { ...players[2], status: 'registered' },
          { ...players[3], status: 'registered' },
          { ...players[4], status: 'registered' },
        ],
      },
      {
        id: 't3',
        name: 'Srixon Tour - Borre',
        type: 'tour',
        category: 'elite',
        startDate: '2025-05-10',
        endDate: '2025-05-11',
        location: 'Borre Golfklubb',
        city: 'Horten',
        registrationDeadline: '2025-05-01',
        maxParticipants: 80,
        currentParticipants: 80,
        status: 'registration_closed',
        description: 'Srixon Tour på Borre Golfklubb. Elite-klasse.',
        format: '36 hull slagspill',
        fee: 650,
        myPlayers: [
          { ...players[0], status: 'registered' },
          { ...players[2], status: 'registered' },
        ],
      },
      {
        id: 't4',
        name: 'Garmin Norgescup - Finale',
        type: 'championship',
        category: 'junior',
        startDate: '2025-07-20',
        endDate: '2025-07-23',
        location: 'Holtsmark Golf',
        city: 'Rygge',
        registrationDeadline: '2025-06-30',
        maxParticipants: 100,
        currentParticipants: 45,
        status: 'registration_open',
        description: 'Finale i Garmin Norgescup 2025. Kun kvalifiserte spillere.',
        format: '72 hull slagspill',
        fee: 1200,
        myPlayers: [
          { ...players[0], status: 'interested' },
        ],
      },
      {
        id: 't5',
        name: 'Srixon Tour - Losby',
        type: 'tour',
        category: 'open',
        startDate: '2025-07-05',
        endDate: '2025-07-05',
        location: 'Losby Golfklubb',
        city: 'Lørenskog',
        registrationDeadline: '2025-06-28',
        maxParticipants: 100,
        currentParticipants: 23,
        status: 'registration_open',
        description: 'Srixon Tour på Losby Golfklubb med grillkveld etter spill.',
        format: '18 hull stableford',
        fee: 450,
        myPlayers: [],
      },
      {
        id: 't6',
        name: 'Garmin Norgescup - Runde 5',
        type: 'championship',
        category: 'junior',
        startDate: '2025-08-22',
        endDate: '2025-08-23',
        location: 'Gamle Fredrikstad GK',
        city: 'Fredrikstad',
        registrationDeadline: '2025-08-10',
        maxParticipants: 80,
        currentParticipants: 0,
        status: 'upcoming',
        description: 'Femte runde av Garmin Norgescup 2025.',
        format: '36 hull slagspill',
        fee: 550,
        myPlayers: [],
      },
      {
        id: 't7',
        name: 'WANG Toppidrett Internserie - Runde 2',
        type: 'club',
        category: 'junior',
        startDate: '2025-02-15',
        endDate: '2025-02-15',
        location: 'Miklagard Golf',
        city: 'Kløfta',
        registrationDeadline: '2025-02-10',
        maxParticipants: 30,
        currentParticipants: 18,
        status: 'registration_open',
        description: 'Intern konkurranse for WANG Toppidrett elever.',
        format: '18 hull slagspill',
        fee: 0,
        myPlayers: [
          { ...players[0], status: 'registered' },
          { ...players[1], status: 'registered' },
          { ...players[2], status: 'registered' },
        ],
      },
    ];
  };

  // Helper functions (must be defined before useMemo hooks that use them)
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!t.name.toLowerCase().includes(query) && !t.location.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Main filter
      if (filter === 'my_players' && t.myPlayers.length === 0) return false;
      if (filter === 'upcoming') {
        const days = getDaysUntil(t.startDate);
        if (days < 0 || days > 30) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      return true;
    });
  }, [tournaments, filter, categoryFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const upcoming = tournaments.filter((t) => getDaysUntil(t.startDate) >= 0).length;
    const withPlayers = tournaments.filter((t) => t.myPlayers.length > 0).length;
    const totalParticipations = tournaments.reduce((sum, t) => sum + t.myPlayers.filter((p) => p.status === 'registered').length, 0);
    const pendingRegistrations = tournaments.reduce((sum, t) => sum + t.myPlayers.filter((p) => p.status === 'pending').length, 0);

    return { upcoming, withPlayers, totalParticipations, pendingRegistrations };
  }, [tournaments]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'championship':
        return Medal;
      case 'tour':
        return Star;
      case 'international':
        return Flag;
      default:
        return Trophy;
    }
  };

  const getStatusConfig = (status: string): { label: string; variant: 'success' | 'error' | 'neutral' | 'accent' } => {
    switch (status) {
      case 'registration_open':
        return { label: 'Open', variant: 'success' };
      case 'registration_closed':
        return { label: 'Full', variant: 'error' };
      case 'upcoming':
        return { label: 'Upcoming', variant: 'neutral' };
      case 'in_progress':
        return { label: 'In Progress', variant: 'accent' };
      case 'completed':
        return { label: 'Completed', variant: 'neutral' };
      default:
        return { label: status, variant: 'neutral' };
    }
  };

  const getCategoryConfig = (category: string): { label: string; variant: 'accent' | 'warning' | 'success' | 'neutral' } => {
    switch (category) {
      case 'junior':
        return { label: 'Junior', variant: 'accent' };
      case 'elite':
        return { label: 'Elite', variant: 'warning' };
      case 'open':
        return { label: 'Open', variant: 'success' };
      case 'senior':
        return { label: 'Senior', variant: 'neutral' };
      default:
        return { label: category, variant: 'neutral' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-white flex items-center justify-center">
        <StateCard variant="loading" title="Loading tournaments..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-white">
      {/* Header */}
      <div className="py-6 px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <PageTitle style={{ marginBottom: 4 }}>
              Tournament Calendar
            </PageTitle>
            <p className="text-[15px] text-tier-text-secondary m-0">
              Overview of tournaments and player participation
            </p>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/coach/tournaments/players')}
              leftIcon={<Users size={18} />}
            >
              My players
            </Button>
          </div>
        </div>

        {/* Stats - Clean inline design without boxes */}
        <div className="flex gap-6 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-tier-text-tertiary" />
            <span className="text-[14px] text-tier-navy">
              <strong className="font-semibold">{stats.upcoming}</strong> upcoming
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-tier-text-tertiary" />
            <span className="text-[14px] text-tier-navy">
              <strong className="font-semibold">{stats.withPlayers}</strong> with my players
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-tier-text-tertiary" />
            <span className="text-[14px] text-tier-navy">
              <strong className="font-semibold">{stats.totalParticipations}</strong> registrations
            </span>
          </div>
          {stats.pendingRegistrations > 0 && (
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-tier-warning" />
              <span className="text-[14px] text-tier-navy">
                <strong className="font-semibold">{stats.pendingRegistrations}</strong> pending
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="py-4 px-6 border-y border-tier-border-default flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-tier-surface-base rounded-lg flex-1 max-w-[300px]">
          <Search size={18} className="text-tier-text-tertiary" />
          <input
            type="text"
            placeholder="Search tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-tier-navy outline-none placeholder:text-tier-text-tertiary"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'my_players', 'upcoming'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'All'}
              {f === 'my_players' && 'With players'}
              {f === 'upcoming' && 'Next 30 days'}
            </Button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-2 px-3 bg-tier-white border border-tier-border-default rounded-lg text-[13px] text-tier-navy cursor-pointer"
        >
          <option value="all">All categories</option>
          <option value="junior">Junior</option>
          <option value="elite">Elite</option>
          <option value="open">Open</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      {/* Tournament list */}
      <div className="p-6">
        {filteredTournaments.length === 0 ? (
          <StateCard
            variant="empty"
            icon={Trophy}
            title="No tournaments found"
            description="Try changing filter or search criteria"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredTournaments.map((tournament) => {
              const TypeIcon = getTypeIcon(tournament.type);
              const statusConfig = getStatusConfig(tournament.status);
              const categoryConfig = getCategoryConfig(tournament.category);
              const daysUntil = getDaysUntil(tournament.startDate);
              const pendingPlayers = tournament.myPlayers.filter((p) => p.status === 'pending');

              return (
                <Card
                  key={tournament.id}
                  variant="default"
                  padding="none"
                  onClick={() => setSelectedTournament(tournament)}
                  className={`cursor-pointer overflow-hidden ${
                    tournament.myPlayers.length > 0
                      ? 'border-2 border-tier-navy'
                      : 'border border-tier-border-default'
                  }`}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-tier-warning/15 flex items-center justify-center">
                          <TypeIcon size={24} className="text-tier-warning" />
                        </div>
                        <div>
                          <SubSectionTitle style={{ marginBottom: 0 }}>
                            {tournament.name}
                          </SubSectionTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={categoryConfig.variant} size="sm">{categoryConfig.label}</Badge>
                            <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
                          </div>
                        </div>
                      </div>

                      {daysUntil >= 0 && daysUntil <= 14 && (
                        <Badge variant="accent" size="sm">
                          {daysUntil === 0 ? 'Today!' : `In ${daysUntil} days`}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-tier-text-tertiary" />
                        <span className="text-sm text-tier-navy">
                          {formatDateRange(tournament.startDate, tournament.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-tier-text-tertiary" />
                        <span className="text-sm text-tier-navy">
                          {tournament.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-tier-text-tertiary" />
                        <span className="text-sm text-tier-navy">
                          {tournament.currentParticipants}/{tournament.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag size={16} className="text-tier-text-tertiary" />
                        <span className="text-sm text-tier-navy">
                          {tournament.format}
                        </span>
                      </div>
                    </div>

                    {/* My Players */}
                    {tournament.myPlayers.length > 0 && (
                      <div className="p-3 px-4 bg-tier-navy/10 rounded-lg border-l-[3px] border-tier-navy">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] font-semibold text-tier-navy">
                            My players ({tournament.myPlayers.length})
                          </span>
                          {pendingPlayers.length > 0 && (
                            <Badge variant="warning" size="sm">{pendingPlayers.length} pending</Badge>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {tournament.myPlayers.map((player) => (
                            <div
                              key={player.id}
                              className={`flex items-center gap-1.5 py-1 px-2.5 bg-tier-white rounded-full ${
                                player.status === 'pending'
                                  ? 'border border-tier-warning'
                                  : 'border border-tier-border-default'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full bg-tier-navy text-tier-white text-[9px] font-semibold flex items-center justify-center">
                                {player.initials}
                              </div>
                              <span className="text-xs text-tier-navy">
                                {player.name}
                              </span>
                              {player.status === 'pending' && (
                                <Clock size={12} className="text-tier-warning" />
                              )}
                              {player.status === 'interested' && (
                                <Star size={12} className="text-tier-warning" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between py-3 px-5 bg-tier-surface-base border-t border-tier-border-default">
                    <div>
                      <span className="text-xs text-tier-text-tertiary">Entry fee</span>
                      <div className="text-base font-semibold text-tier-navy">
                        {tournament.fee === 0 ? 'Free' : `${tournament.fee} kr`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tournament.myPlayers.filter(p => p.status === 'registered').length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<MessageSquare size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessageTournament(tournament);
                            setMessageModalOpen(true);
                          }}
                        >
                          Send message
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<UserPlus size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/coach/tournaments/players?tournament=${tournament.id}`);
                        }}
                      >
                        Register player
                      </Button>
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white text-sm font-medium rounded-lg hover:bg-tier-navy/90 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTournament(tournament);
                        }}
                      >
                        <Eye size={16} />
                        Details
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Tournament detail modal */}
      {selectedTournament && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setSelectedTournament(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tier-white rounded-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-auto z-[101] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <SectionTitle style={{ marginBottom: 0 }}>
                {selectedTournament.name}
              </SectionTitle>
              <button
                onClick={() => setSelectedTournament(null)}
                className="w-8 h-8 rounded bg-tier-surface-base border-none text-lg cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base"
              >
                ×
              </button>
            </div>

            <p className="text-[15px] text-tier-navy mb-5">
              {selectedTournament.description}
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-tier-navy" />
                <span className="text-tier-navy">{formatDateRange(selectedTournament.startDate, selectedTournament.endDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-tier-navy" />
                <span className="text-tier-navy">{selectedTournament.location}, {selectedTournament.city}</span>
              </div>
              <div className="flex items-center gap-3">
                <Flag size={18} className="text-tier-navy" />
                <span className="text-tier-navy">{selectedTournament.format}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-tier-navy" />
                <span className="text-tier-navy">Registration deadline: {formatDate(selectedTournament.registrationDeadline)}</span>
              </div>
            </div>

            {selectedTournament.myPlayers.length > 0 && (
              <div className="mb-5">
                <CardTitle style={{ marginBottom: 12 }}>
                  Registered players
                </CardTitle>
                <div className="flex flex-col gap-2">
                  {selectedTournament.myPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between py-2.5 px-3 bg-tier-surface-base rounded-lg"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-tier-navy text-tier-white text-xs font-semibold flex items-center justify-center">
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
                      <Badge
                        variant={
                          player.status === 'registered' ? 'success' :
                          player.status === 'pending' ? 'warning' : 'neutral'
                        }
                        size="sm"
                      >
                        {player.status === 'registered' && 'Registered'}
                        {player.status === 'pending' && 'Pending'}
                        {player.status === 'interested' && 'Interested'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {selectedTournament.myPlayers.filter(p => p.status === 'registered').length > 0 && (
                <Button
                  variant="ghost"
                  leftIcon={<MessageSquare size={18} />}
                  onClick={() => {
                    setMessageTournament(selectedTournament);
                    setSelectedTournament(null);
                    setMessageModalOpen(true);
                  }}
                  className="flex-1"
                >
                  Send message
                </Button>
              )}
              <Button
                variant="ghost"
                leftIcon={<UserPlus size={18} />}
                onClick={() => {
                  setSelectedTournament(null);
                  navigate(`/coach/tournaments/players?tournament=${selectedTournament.id}`);
                }}
                className="flex-1"
              >
                Register player
              </Button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-tier-navy text-white text-sm font-medium rounded-lg hover:bg-tier-navy/90 transition-colors"
                onClick={() => window.open(`https://mingolf.no/turnering/${selectedTournament.id}`, '_blank')}
              >
                <ExternalLink size={18} />
                Open in MinGolf
              </button>
            </div>
          </div>
        </>
      )}

      {/* Message Modal */}
      {messageModalOpen && messageTournament && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={() => {
              setMessageModalOpen(false);
              setMessageTournament(null);
              setMessageText('');
            }}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tier-white rounded-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-auto z-[101] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
                  <MessageSquare size={20} className="text-tier-navy" />
                </div>
                <div>
                  <SectionTitle style={{ marginBottom: 0 }}>
                    Send message
                  </SectionTitle>
                  <p className="text-sm text-tier-text-secondary">
                    {messageTournament.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMessageModalOpen(false);
                  setMessageTournament(null);
                  setMessageText('');
                }}
                className="w-8 h-8 rounded bg-tier-surface-base border-none text-lg cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base"
              >
                ×
              </button>
            </div>

            {/* Recipients */}
            <div className="mb-4">
              <label className="text-sm font-medium text-tier-navy mb-2 block">
                Recipients ({messageTournament.myPlayers.filter(p => p.status === 'registered').length} players)
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-tier-surface-base rounded-lg">
                {messageTournament.myPlayers
                  .filter(p => p.status === 'registered')
                  .map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-1.5 py-1 px-2.5 bg-tier-white rounded-full border border-tier-border-default"
                    >
                      <div className="w-5 h-5 rounded-full bg-tier-navy text-white text-[9px] font-semibold flex items-center justify-center">
                        {player.initials}
                      </div>
                      <span className="text-xs text-tier-navy">
                        {player.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-5">
              <label className="text-sm font-medium text-tier-navy mb-2 block">
                Message
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Write a message to the players about ${messageTournament.name}...`}
                className="w-full h-32 p-3 border border-tier-border-default rounded-lg text-sm text-tier-navy placeholder:text-tier-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy"
              />
            </div>

            {/* Quick Templates */}
            <div className="mb-5">
              <label className="text-xs font-medium text-tier-text-tertiary mb-2 block uppercase tracking-wide">
                Quick templates
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Remember to register!',
                  'Training tips before tournament',
                  'Practical info',
                  'Good luck!',
                ].map((template) => (
                  <button
                    key={template}
                    onClick={() => setMessageText(prev => prev + (prev ? '\n\n' : '') + template + '\n')}
                    className="px-3 py-1.5 bg-tier-surface-base border border-tier-border-default rounded-full text-xs text-tier-text-secondary hover:bg-tier-navy/10 hover:text-tier-navy hover:border-tier-navy transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setMessageModalOpen(false);
                  setMessageTournament(null);
                  setMessageText('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-tier-navy text-white text-sm font-medium rounded-lg hover:bg-tier-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!messageText.trim() || sendingMessage}
                onClick={async () => {
                  if (!messageText.trim()) return;
                  setSendingMessage(true);
                  try {
                    // Send message to all registered players
                    const playerIds = messageTournament.myPlayers
                      .filter(p => p.status === 'registered')
                      .map(p => p.id);

                    await fetch('/api/v1/coach/messages', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        recipientIds: playerIds,
                        subject: `Re: ${messageTournament.name}`,
                        message: messageText,
                        tournamentId: messageTournament.id,
                      }),
                    });

                    // Close modal and reset
                    setMessageModalOpen(false);
                    setMessageTournament(null);
                    setMessageText('');

                    // Show success (could add toast notification)
                    alert(`Message sent to ${playerIds.length} players!`);
                  } catch (error) {
                    console.error('Failed to send message:', error);
                    alert('Could not send message. Try again.');
                  } finally {
                    setSendingMessage(false);
                  }
                }}
              >
                <Send size={16} />
                {sendingMessage ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
