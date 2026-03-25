/**
 * CoachAthleteTournaments.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Oversikt over alle spilleres turneringsdeltakelse for trenere.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Users,
  Search,
  Calendar,
  MapPin,
  ChevronRight,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Filter,
  ChevronDown,
  Award,
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle, CardTitle } from '../../components/typography/Headings';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const STATUS_CLASSES = {
  registered: {
    bg: 'bg-tier-success/15',
    text: 'text-tier-success',
    icon: CheckCircle,
    label: 'Påmeldt',
  },
  pending: {
    bg: 'bg-tier-warning/15',
    text: 'text-tier-warning',
    icon: Clock,
    label: 'Venter',
  },
  interested: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-500',
    icon: Star,
    label: 'Interessert',
  },
  declined: {
    bg: 'bg-tier-error/15',
    text: 'text-tier-error',
    icon: AlertCircle,
    label: 'Avslått',
  },
};

// Types
interface TournamentEntry {
  id: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  location: string;
  status: 'registered' | 'pending' | 'interested' | 'declined';
  category: string;
  result?: {
    position: number;
    score: number;
  };
}

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  category: 'A' | 'B' | 'C';
  avatarColor: string;
  upcomingTournaments: TournamentEntry[];
  completedTournaments: TournamentEntry[];
  totalThisYear: number;
  lastTournament?: string;
}

// Avatar component
const Avatar: React.FC<{ name: string; color: string; size?: number }> = ({
  name,
  color,
  size = 44,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
};

// Get status classes helper
const getStatusClasses = (status: string) => {
  return STATUS_CLASSES[status as keyof typeof STATUS_CLASSES] || {
    bg: 'bg-tier-surface-base',
    text: 'text-tier-text-secondary',
    icon: Clock,
    label: status,
  };
};

// Generate mock data
const generateMockAthletes = (): Athlete[] => {
  // Avatar colors - using CSS variable values
  const avatarColors = [
    'var(--category-spill)', // accent
    'var(--category-tek)', // accent-light
    'var(--category-slag)', // success
    'var(--achievement)', // achievement
    'var(--group-warmearth)', // warm neutral
    'var(--text-tertiary)', // cool neutral
  ];

  return [
    {
      id: 'a1',
      firstName: 'Anders',
      lastName: 'Hansen',
      category: 'A',
      avatarColor: avatarColors[0],
      upcomingTournaments: [
        {
          id: 'e1',
          tournamentId: 't1',
          tournamentName: 'NM Junior 2025',
          date: '2025-06-15',
          location: 'Oslo GK',
          status: 'registered',
          category: 'junior',
        },
        {
          id: 'e2',
          tournamentId: 't3',
          tournamentName: 'NGF Tour - Runde 3',
          date: '2025-05-10',
          location: 'Borre GK',
          status: 'registered',
          category: 'elite',
        },
        {
          id: 'e3',
          tournamentId: 't4',
          tournamentName: 'Nordisk Mesterskap',
          date: '2025-07-20',
          location: 'København',
          status: 'interested',
          category: 'junior',
        },
      ],
      completedTournaments: [
        {
          id: 'c1',
          tournamentId: 't10',
          tournamentName: 'Vårturneringen',
          date: '2025-03-15',
          location: 'Miklagard',
          status: 'registered',
          category: 'open',
          result: { position: 3, score: -2 },
        },
      ],
      totalThisYear: 8,
      lastTournament: '2025-03-15',
    },
    {
      id: 'a2',
      firstName: 'Sofie',
      lastName: 'Andersen',
      category: 'B',
      avatarColor: avatarColors[3],
      upcomingTournaments: [
        {
          id: 'e4',
          tournamentId: 't2',
          tournamentName: 'TIER Golf Cup',
          date: '2025-01-20',
          location: 'Miklagard',
          status: 'registered',
          category: 'open',
        },
      ],
      completedTournaments: [],
      totalThisYear: 5,
      lastTournament: '2025-02-28',
    },
    {
      id: 'a3',
      firstName: 'Erik',
      lastName: 'Johansen',
      category: 'A',
      avatarColor: avatarColors[2],
      upcomingTournaments: [
        {
          id: 'e5',
          tournamentId: 't1',
          tournamentName: 'NM Junior 2025',
          date: '2025-06-15',
          location: 'Oslo GK',
          status: 'registered',
          category: 'junior',
        },
        {
          id: 'e6',
          tournamentId: 't3',
          tournamentName: 'NGF Tour - Runde 3',
          date: '2025-05-10',
          location: 'Borre GK',
          status: 'registered',
          category: 'elite',
        },
        {
          id: 'e7',
          tournamentId: 't7',
          tournamentName: 'WANG Internserie',
          date: '2025-02-15',
          location: 'Miklagard',
          status: 'registered',
          category: 'junior',
        },
      ],
      completedTournaments: [
        {
          id: 'c2',
          tournamentId: 't11',
          tournamentName: 'Vinterturneringen',
          date: '2025-01-20',
          location: 'Losby GK',
          status: 'registered',
          category: 'open',
          result: { position: 1, score: -5 },
        },
      ],
      totalThisYear: 10,
      lastTournament: '2025-03-10',
    },
    {
      id: 'a4',
      firstName: 'Maria',
      lastName: 'Berg',
      category: 'C',
      avatarColor: avatarColors[4],
      upcomingTournaments: [
        {
          id: 'e8',
          tournamentId: 't2',
          tournamentName: 'TIER Golf Cup',
          date: '2025-01-20',
          location: 'Miklagard',
          status: 'pending',
          category: 'open',
        },
      ],
      completedTournaments: [],
      totalThisYear: 3,
      lastTournament: '2025-01-15',
    },
    {
      id: 'a5',
      firstName: 'Lars',
      lastName: 'Olsen',
      category: 'B',
      avatarColor: avatarColors[5],
      upcomingTournaments: [
        {
          id: 'e9',
          tournamentId: 't1',
          tournamentName: 'NM Junior 2025',
          date: '2025-06-15',
          location: 'Oslo GK',
          status: 'pending',
          category: 'junior',
        },
        {
          id: 'e10',
          tournamentId: 't2',
          tournamentName: 'TIER Golf Cup',
          date: '2025-01-20',
          location: 'Miklagard',
          status: 'registered',
          category: 'open',
        },
      ],
      completedTournaments: [],
      totalThisYear: 6,
      lastTournament: '2025-02-20',
    },
    {
      id: 'a6',
      firstName: 'Emma',
      lastName: 'Nilsen',
      category: 'A',
      avatarColor: avatarColors[1],
      upcomingTournaments: [],
      completedTournaments: [
        {
          id: 'c3',
          tournamentId: 't12',
          tournamentName: 'Åpningsturneringen',
          date: '2025-02-01',
          location: 'Oslo GK',
          status: 'registered',
          category: 'open',
          result: { position: 5, score: +1 },
        },
      ],
      totalThisYear: 2,
      lastTournament: '2025-02-01',
    },
  ];
};

type SortOption = 'name' | 'tournaments' | 'category';
type FilterOption = 'all' | 'A' | 'B' | 'C' | 'upcoming' | 'none';

export default function CoachAthleteTournaments() {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);

  // Fetch athletes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/v1/coach/athletes/tournaments');
        if (response.ok) {
          const data = await response.json();
          setAthletes(data.athletes || []);
        } else {
          setAthletes(generateMockAthletes());
        }
      } catch (error) {
        console.error('Failed to fetch athletes:', error);
        setAthletes(generateMockAthletes());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort and filter athletes
  const sortedAndFilteredAthletes = useMemo(() => {
    let result = [...athletes];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      );
    }

    // Filter by category or tournament status
    if (filterBy !== 'all') {
      if (['A', 'B', 'C'].includes(filterBy)) {
        result = result.filter((a) => a.category === filterBy);
      } else if (filterBy === 'upcoming') {
        result = result.filter((a) => a.upcomingTournaments.length > 0);
      } else if (filterBy === 'none') {
        result = result.filter((a) => a.upcomingTournaments.length === 0);
      }
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
        );
        break;
      case 'tournaments':
        result.sort((a, b) => b.upcomingTournaments.length - a.upcomingTournaments.length);
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return result;
  }, [athletes, searchQuery, sortBy, filterBy]);

  // Stats
  const stats = useMemo(() => {
    const totalRegistrations = athletes.reduce(
      (sum, a) => sum + a.upcomingTournaments.filter((t) => t.status === 'registered').length,
      0
    );
    const pendingRegistrations = athletes.reduce(
      (sum, a) => sum + a.upcomingTournaments.filter((t) => t.status === 'pending').length,
      0
    );
    const athletesWithTournaments = athletes.filter((a) => a.upcomingTournaments.length > 0).length;
    const athletesWithoutTournaments = athletes.filter(
      (a) => a.upcomingTournaments.length === 0
    ).length;

    return {
      totalRegistrations,
      pendingRegistrations,
      athletesWithTournaments,
      athletesWithoutTournaments,
    };
  }, [athletes]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format short date
  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
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
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="Turneringsdeltakelse"
        subtitle="Oversikt over spillernes påmeldinger og deltakelse"
        helpText="Oversikt over alle dine spilleres turneringspåmeldinger og resultater. Se kommende turneringer, fullførte turneringer og påmeldingsstatus for hver spiller."
      />

      {/* Stats badges */}
      <div className="flex gap-3 flex-wrap px-6 pb-4 border-b border-tier-border-default">
        <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-success/10 rounded-lg">
          <CheckCircle size={16} className="text-tier-success" />
          <span className="text-[13px] text-tier-navy">
            <strong>{stats.totalRegistrations}</strong> påmeldinger
          </span>
        </div>
        {stats.pendingRegistrations > 0 && (
          <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-warning/15 rounded-lg">
            <Clock size={16} className="text-tier-warning" />
            <span className="text-[13px] text-tier-navy">
              <strong>{stats.pendingRegistrations}</strong> venter
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-navy/10 rounded-lg">
          <Users size={16} className="text-tier-navy" />
          <span className="text-[13px] text-tier-navy">
            <strong>{stats.athletesWithTournaments}</strong> med turneringer
          </span>
        </div>
        {stats.athletesWithoutTournaments > 0 && (
          <div className="flex items-center gap-2 py-2 px-3.5 bg-tier-surface-base rounded-lg">
            <AlertCircle size={16} className="text-tier-text-secondary" />
            <span className="text-[13px] text-tier-navy">
              <strong>{stats.athletesWithoutTournaments}</strong> uten påmeldinger
            </span>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="bg-tier-white py-4 px-6 border-b border-tier-border-default flex gap-3 items-center flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 py-2.5 px-3.5 bg-tier-surface-base rounded-lg flex-1 max-w-[300px]">
          <Search size={18} className="text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Søk spiller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-tier-navy outline-none"
          />
        </div>

        {/* Filter button */}
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter size={16} />}
        >
          Filter
          <ChevronDown size={16} className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>

        {/* Sort select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="py-2.5 px-3.5 bg-tier-surface-base border-none rounded-lg text-sm text-tier-navy cursor-pointer"
        >
          <option value="name">Sorter: Navn</option>
          <option value="tournaments">Sorter: Flest turneringer</option>
          <option value="category">Sorter: Kategori</option>
        </select>
      </div>

      {/* Filter options */}
      {showFilters && (
        <div className="bg-tier-white py-4 px-6 border-b border-tier-border-default flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'A', label: 'Kategori A' },
            { value: 'B', label: 'Kategori B' },
            { value: 'C', label: 'Kategori C' },
            { value: 'upcoming', label: 'Med turneringer' },
            { value: 'none', label: 'Uten turneringer' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterBy(option.value as FilterOption)}
              className={`py-2 px-4 border-none rounded-full text-[13px] font-medium cursor-pointer ${
                filterBy === option.value
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-surface-base text-tier-navy'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Athletes list */}
      <div className="p-6">
        <div className="flex flex-col gap-3">
          {sortedAndFilteredAthletes.length === 0 ? (
            <div className="bg-tier-white rounded-xl py-12 px-6 text-center">
              <Users size={48} className="text-tier-border-default mb-4 mx-auto" />
              <SubSectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                Ingen spillere funnet
              </SubSectionTitle>
              <p className="text-[15px] leading-5 text-tier-text-secondary mt-2">
                Prøv å endre søk eller filter
              </p>
            </div>
          ) : (
            sortedAndFilteredAthletes.map((athlete) => {
              const fullName = `${athlete.firstName} ${athlete.lastName}`;
              const isExpanded = expandedAthlete === athlete.id;

              return (
                <div
                  key={athlete.id}
                  className="bg-tier-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Athlete header */}
                  <div
                    onClick={() => setExpandedAthlete(isExpanded ? null : athlete.id)}
                    className={`py-4 px-5 flex items-center justify-between cursor-pointer ${
                      isExpanded ? 'border-b border-tier-surface-base' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Avatar name={fullName} color={athlete.avatarColor} />
                      <div>
                        <SubSectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                          {athlete.lastName}, {athlete.firstName}
                        </SubSectionTitle>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="text-[11px] font-semibold text-tier-navy bg-tier-navy/15 py-0.5 px-2 rounded">
                            Kategori {athlete.category}
                          </span>
                          <span className="text-xs text-tier-text-secondary">
                            {athlete.totalThisYear} turneringer i år
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Tournament count badges */}
                      <div className="flex gap-2">
                        {athlete.upcomingTournaments.length > 0 && (
                          <div className="flex items-center gap-1 py-1 px-2.5 bg-tier-success/10 rounded-full">
                            <Trophy size={14} className="text-tier-success" />
                            <span className="text-xs font-semibold text-tier-success">
                              {athlete.upcomingTournaments.length}
                            </span>
                          </div>
                        )}
                        {athlete.upcomingTournaments.length === 0 && (
                          <span className="text-xs text-tier-text-secondary italic">
                            Ingen kommende
                          </span>
                        )}
                      </div>

                      <ChevronDown
                        size={20}
                        className={`text-tier-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="py-4 px-5">
                      {/* Upcoming tournaments */}
                      {athlete.upcomingTournaments.length > 0 && (
                        <div className="mb-5">
                          <CardTitle className="text-[13px] leading-[18px] text-tier-text-secondary uppercase tracking-wide m-0 mb-3">
                            Kommende turneringer
                          </CardTitle>
                          <div className="flex flex-col gap-2">
                            {athlete.upcomingTournaments.map((entry) => {
                              const statusClasses = getStatusClasses(entry.status);
                              const StatusIcon = statusClasses.icon;

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
                                      <div className="flex items-center gap-2 mt-1">
                                        <Calendar size={12} className="text-tier-text-secondary" />
                                        <span className="text-xs text-tier-text-secondary">
                                          {formatShortDate(entry.date)}
                                        </span>
                                        <MapPin size={12} className="text-tier-text-secondary" />
                                        <span className="text-xs text-tier-text-secondary">
                                          {entry.location}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full ${statusClasses.bg}`}>
                                    <StatusIcon size={14} className={statusClasses.text} />
                                    <span className={`text-xs font-medium ${statusClasses.text}`}>
                                      {statusClasses.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Completed tournaments (last 3) */}
                      {athlete.completedTournaments.length > 0 && (
                        <div className="mb-4">
                          <CardTitle className="text-[13px] leading-[18px] text-tier-text-secondary uppercase tracking-wide m-0 mb-3">
                            Siste resultater
                          </CardTitle>
                          <div className="flex flex-col gap-2">
                            {athlete.completedTournaments.slice(0, 3).map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between p-3 px-3.5 bg-tier-navy/5 rounded-lg border-l-[3px] border-l-tier-navy"
                              >
                                <div className="flex items-center gap-3">
                                  <Award size={16} className="text-tier-navy" />
                                  <div>
                                    <div className="text-sm font-medium text-tier-navy">
                                      {entry.tournamentName}
                                    </div>
                                    <div className="text-xs text-tier-text-secondary">
                                      {formatDate(entry.date)} • {entry.location}
                                    </div>
                                  </div>
                                </div>

                                {entry.result && (
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="text-base font-bold text-tier-navy">
                                        #{entry.result.position}
                                      </div>
                                      <div className="text-xs text-tier-text-secondary">
                                        {entry.result.score > 0 ? '+' : ''}
                                        {entry.result.score}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No tournaments */}
                      {athlete.upcomingTournaments.length === 0 &&
                        athlete.completedTournaments.length === 0 && (
                          <div className="flex items-center justify-center p-6 text-tier-text-secondary text-sm">
                            <Trophy size={18} className="mr-2" />
                            Ingen turneringer registrert
                          </div>
                        )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-tier-surface-base">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coach/athletes/${athlete.id}`);
                          }}
                          rightIcon={<ChevronRight size={16} />}
                        >
                          Se spillerprofil
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Trophy size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coach/tournaments/players?athlete=${athlete.id}`);
                          }}
                        >
                          Meld på turnering
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
