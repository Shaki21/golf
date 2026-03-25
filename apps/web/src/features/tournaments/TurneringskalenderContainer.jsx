import React, { useState, useEffect } from 'react';
import {
  Trophy, Calendar, MapPin, Users, Clock, ChevronRight,
  Star, Medal, Flag, CheckCircle, AlertCircle, ExternalLink,
  Hotel, FileText, Plus, Loader2
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import { tournamentsAPI } from '../../services/api';

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const MOCK_TOURNAMENTS = [
  {
    id: 't1',
    name: 'NM Junior 2025',
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
    isRegistered: false,
    description: 'Norgesmesterskap for juniorer. Kvalifisering til Nordisk Mesterskap.',
    format: '54 hull slagspill',
    fee: 850,
  },
  {
    id: 't2',
    name: 'TIER Golf Cup',
    type: 'club',
    category: 'open',
    startDate: '2025-04-20',
    endDate: '2025-04-20',
    location: 'Miklagard Golf',
    city: 'Kløfta',
    registrationDeadline: '2025-04-15',
    maxParticipants: 60,
    currentParticipants: 45,
    status: 'registration_open',
    isRegistered: true,
    description: 'Intern turnering for TIER Golf medlemmer.',
    format: '18 hull stableford',
    fee: 350,
  },
  {
    id: 't3',
    name: 'NGF Tour - Runde 3',
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
    isRegistered: false,
    description: 'Tredje runde i NGF Tour sesongen 2025.',
    format: '36 hull slagspill',
    fee: 650,
  },
  {
    id: 't4',
    name: 'Sommerturneringen',
    type: 'club',
    category: 'open',
    startDate: '2025-07-05',
    endDate: '2025-07-05',
    location: 'Losby Golfklubb',
    city: 'Lørenskog',
    registrationDeadline: '2025-06-28',
    maxParticipants: 100,
    currentParticipants: 23,
    status: 'registration_open',
    isRegistered: false,
    description: 'Populær sommerturnering med grillkveld etter spill.',
    format: '18 hull stableford',
    fee: 450,
  },
  {
    id: 't5',
    name: 'Regionsmesterskap Øst',
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
    isRegistered: false,
    description: 'Regionsmesterskap for juniorer i region Øst.',
    format: '36 hull slagspill',
    fee: 550,
  },
];

const PAST_TOURNAMENTS = [
  {
    id: 'p1',
    name: 'Vårturneringen 2025',
    date: '2025-03-15',
    location: 'Holtsmark GK',
    result: { position: 3, score: 74, field: 42 },
  },
  {
    id: 'p2',
    name: 'NGF Tour - Runde 1',
    date: '2025-02-28',
    location: 'Drammens GK',
    result: { position: 12, score: 148, field: 78 },
  },
  {
    id: 'p3',
    name: 'Sesongåpning',
    date: '2025-02-10',
    location: 'Tyrifjord GK',
    result: { position: 1, score: 71, field: 35 },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
};

const formatDateRange = (start, end) => {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const getStatusConfig = (status, isRegistered) => {
  if (isRegistered) {
    return {
      label: 'Påmeldt',
      color: 'var(--status-success)',
      bg: 'rgba(var(--success-rgb), 0.15)',
      icon: CheckCircle,
    };
  }

  switch (status) {
    case 'registration_open':
      return {
        label: 'Åpen for påmelding',
        color: 'var(--accent)',
        bg: 'rgba(var(--accent-rgb), 0.15)',
        icon: Calendar,
      };
    case 'registration_closed':
      return {
        label: 'Fullt',
        color: 'var(--status-error)',
        bg: 'rgba(var(--error-rgb), 0.15)',
        icon: AlertCircle,
      };
    case 'upcoming':
      return {
        label: 'Kommer snart',
        color: 'var(--text-secondary)',
        bg: 'rgba(var(--text-secondary-rgb), 0.15)',
        icon: Clock,
      };
    default:
      return {
        label: status,
        color: 'var(--text-secondary)',
        bg: 'rgba(var(--text-secondary-rgb), 0.15)',
        icon: Flag,
      };
  }
};

const getCategoryConfig = (category) => {
  switch (category) {
    case 'junior':
      return { label: 'Junior', color: 'var(--accent)' };
    case 'elite':
      return { label: 'Elite', color: 'var(--achievement)' };
    case 'open':
      return { label: 'Åpen', color: 'var(--status-success)' };
    default:
      return { label: category, color: 'var(--text-secondary)' };
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'championship':
      return Medal;
    case 'tour':
      return Star;
    default:
      return Trophy;
  }
};

// ============================================================================
// TOURNAMENT CARD COMPONENT
// ============================================================================

const TournamentCard = ({ tournament, onSelect }) => {
  const statusConfig = getStatusConfig(tournament.status, tournament.isRegistered);
  const categoryConfig = getCategoryConfig(tournament.category);
  const TypeIcon = getTypeIcon(tournament.type);
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntil(tournament.startDate);

  return (
    <div
      onClick={() => onSelect(tournament)}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: tournament.isRegistered ? '2px solid var(--status-success)' : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(var(--achievement-rgb), 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TypeIcon size={22} color={'var(--achievement)'} />
          </div>
          <div>
            <SubSectionTitle>
              {tournament.name}
            </SubSectionTitle>
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: categoryConfig.color,
              backgroundColor: `${categoryConfig.color}15`,
              padding: '2px 8px',
              borderRadius: '4px',
              marginTop: '4px',
              display: 'inline-block',
            }}>
              {categoryConfig.label}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '8px',
          backgroundColor: statusConfig.bg,
        }}>
          <StatusIcon size={14} color={statusConfig.color} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: statusConfig.color }}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={14} color={'var(--text-secondary)'} />
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </span>
          {daysUntil > 0 && daysUntil <= 30 && (
            <span style={{
              fontSize: '11px',
              color: 'var(--accent)',
              backgroundColor: 'rgba(var(--accent-rgb), 0.10)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              om {daysUntil} dager
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={14} color={'var(--text-secondary)'} />
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            {tournament.location}, {tournament.city}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={14} color={'var(--text-secondary)'} />
          <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
            {tournament.currentParticipants}/{tournament.maxParticipants} påmeldte
          </span>
          {tournament.currentParticipants >= tournament.maxParticipants && (
            <span style={{
              fontSize: '11px',
              color: 'var(--status-error)',
              fontWeight: 500,
            }}>
              (Fullt)
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions - Mine Oppgaver */}
      {tournament.isRegistered && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to tasks with pre-filled hotel booking
              window.location.href = '/?task=hotell&tournament=' + tournament.id;
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Hotel size={12} />
            Bestill hotell
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to tasks with pre-filled absence application
              window.location.href = '/skoleplan?action=fravaer&tournament=' + tournament.id;
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={12} />
            Søk idrettsfravær
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add custom task
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px dashed var(--border-default)',
              backgroundColor: 'transparent',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={12} />
            Legg til
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-default)',
      }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Startavgift</span>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {tournament.fee} kr
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Registration Link */}
          {tournament.status === 'registration_open' && !tournament.isRegistered && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://mingolf.no/pamelding/${tournament.id}`, '_blank');
              }}
              leftIcon={<ExternalLink size={12} />}
            >
              Meld på
            </Button>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--accent)',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            Se detaljer
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAST TOURNAMENT CARD COMPONENT
// ============================================================================

const PastTournamentCard = ({ tournament }) => {
  const isTopThree = tournament.result.position <= 3;

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      {/* Position */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: isTopThree ? 'rgba(var(--achievement-rgb), 0.15)' : 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isTopThree ? (
          <Medal size={20} color={'var(--achievement)'} />
        ) : (
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {tournament.result.position}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {tournament.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {formatDate(tournament.date)} • {tournament.location}
        </div>
      </div>

      {/* Result */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {tournament.result.position}. plass
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Score: {tournament.result.score} • {tournament.result.field} deltakere
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FILTER COMPONENT
// ============================================================================

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'Alle' },
    { key: 'registered', label: 'Mine turneringer' },
    { key: 'junior', label: 'Junior' },
    { key: 'elite', label: 'Elite' },
    { key: 'open', label: 'Åpen' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '4px',
    }}>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: activeFilter === filter.key ? 'var(--accent)' : 'var(--bg-primary)',
            color: activeFilter === filter.key ? 'var(--bg-primary)' : 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            boxShadow: activeFilter === filter.key ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// TOURNAMENT DETAIL MODAL
// ============================================================================

const TournamentDetailModal = ({ tournament, onClose, onRegister }) => {
  if (!tournament) return null;

  const categoryConfig = getCategoryConfig(tournament.category);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <SectionTitle style={{ marginBottom: '8px' }}>
                {tournament.name}
              </SectionTitle>
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                color: categoryConfig.color,
                backgroundColor: `${categoryConfig.color}15`,
                padding: '4px 10px',
                borderRadius: '6px',
              }}>
                {categoryConfig.label}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--text-secondary)',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: '0 0 20px 0',
          }}>
            {tournament.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={18} color={'var(--accent)'} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {formatDateRange(tournament.startDate, tournament.endDate)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Påmeldingsfrist: {formatDate(tournament.registrationDeadline)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={18} color={'var(--accent)'} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {tournament.location}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {tournament.city}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Flag size={18} color={'var(--accent)'} />
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {tournament.format}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={18} color={'var(--accent)'} />
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {tournament.currentParticipants}/{tournament.maxParticipants} påmeldte
              </div>
            </div>
          </div>

          {/* Fee info */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Startavgift
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {tournament.fee} kr
            </div>
          </div>

          {/* Action button */}
          {tournament.status === 'registration_open' && !tournament.isRegistered && (
            <Button
              variant="primary"
              onClick={() => onRegister(tournament.id)}
              style={{ width: '100%' }}
            >
              Meld deg på
            </Button>
          )}
          {tournament.isRegistered && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(var(--success-rgb), 0.15)',
              color: 'var(--status-success)',
              fontSize: '15px',
              fontWeight: 600,
            }}>
              <CheckCircle size={18} />
              Du er påmeldt
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TurneringskalenderContainer = () => {
  const [filter, setFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tournaments from API
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all tournaments and my tournaments in parallel
        const [allResponse, myResponse] = await Promise.all([
          tournamentsAPI.getAll().catch(() => null),
          tournamentsAPI.getMy().catch(() => null),
        ]);

        // Process API data if available
        if (allResponse?.data && Array.isArray(allResponse.data)) {
          // Get my registered tournament IDs
          const myTournamentIds = new Set(
            myResponse?.data?.registered?.map(t => t.id) || []
          );

          // Transform API data to match component format
          const apiTournaments = allResponse.data.map(t => ({
            id: t.id,
            name: t.name,
            type: t.tournamentType || 'club',
            category: mapLevelToCategory(t.level),
            startDate: t.startDate,
            endDate: t.endDate,
            location: t.location || t.courseName || '',
            city: t.city || '',
            registrationDeadline: t.registrationDeadline || t.startDate,
            maxParticipants: t.maxParticipants || 100,
            currentParticipants: t.currentParticipants || 0,
            status: t.status || 'registration_open',
            isRegistered: myTournamentIds.has(t.id),
            description: t.description || '',
            format: t.format || '',
            fee: t.entryFee || 0,
          }));

          setTournaments(apiTournaments.length > 0 ? apiTournaments : MOCK_TOURNAMENTS);

          // Set past tournaments from my-tournaments response
          if (myResponse?.data?.pastResults && Array.isArray(myResponse.data.pastResults)) {
            const pastResults = myResponse.data.pastResults.map(r => ({
              id: r.id,
              name: r.name,
              date: r.date,
              location: r.location,
              result: r.result || { position: 0, score: 0, field: 0 },
            }));
            setPastTournaments(pastResults.length > 0 ? pastResults : PAST_TOURNAMENTS);
          } else {
            setPastTournaments(PAST_TOURNAMENTS);
          }
        } else {
          // Use mock data as fallback
          setTournaments(MOCK_TOURNAMENTS);
          setPastTournaments(PAST_TOURNAMENTS);
        }
      } catch (err) {
        console.warn('Failed to fetch tournaments, using mock data:', err);
        setTournaments(MOCK_TOURNAMENTS);
        setPastTournaments(PAST_TOURNAMENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Map tournament level to category
  const mapLevelToCategory = (level) => {
    if (!level) return 'open';
    const l = level.toLowerCase();
    if (l.includes('junior') || l.includes('u18') || l.includes('u16')) return 'junior';
    if (l.includes('elite') || l.includes('pro')) return 'elite';
    return 'open';
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'registered') return t.isRegistered;
    return t.category === filter;
  });

  const handleRegister = (tournamentId) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId ? { ...t, isRegistered: true, currentParticipants: t.currentParticipants + 1 } : t
      )
    );
    setSelectedTournament(null);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Laster turneringer...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <PageHeader
        title="Turneringer"
      />
      <div style={{ padding: '0' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>
              {tournaments.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kommende</div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--status-success)' }}>
              {tournaments.filter(t => t.isRegistered).length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Påmeldt</div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--achievement)' }}>
              {pastTournaments.filter(t => t.result?.position <= 3).length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pallplasser</div>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {pastTournaments.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Spilt i år</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '20px' }}>
          <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        </div>

        {/* Upcoming Tournaments */}
        <div style={{ marginBottom: '32px' }}>
          <SectionTitle style={{ marginBottom: '16px' }}>
            Kommende turneringer
          </SectionTitle>

          {filteredTournaments.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '16px',
            }}>
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onSelect={setSelectedTournament}
                />
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
            }}>
              <Trophy size={40} color={'var(--text-secondary)'} style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Ingen turneringer funnet med valgt filter
              </p>
            </div>
          )}
        </div>

        {/* Past Tournaments */}
        <div>
          <SectionTitle style={{ marginBottom: '16px' }}>
            Tidligere resultater
          </SectionTitle>

          {pastTournaments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pastTournaments.map((tournament) => (
                <PastTournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Ingen tidligere turneringsresultater
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <TournamentDetailModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default TurneringskalenderContainer;
