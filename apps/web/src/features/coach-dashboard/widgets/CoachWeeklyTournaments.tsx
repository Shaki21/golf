/**
 * TIER Golf - Coach Weekly Tournaments Widget
 * Design System v3.0 - Semantic CSS Variables
 *
 * Viser ukens turneringer med spillerdeltakelse.
 * Gir oversikt over hvem som spiller hvor.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle, CardTitle } from '../../../ui/primitives/typography';

interface TournamentPlayer {
  id: string;
  name: string;
  avatarInitials: string;
  category: string;
  teeTime?: string;
}

interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  type: 'national' | 'regional' | 'club' | 'international';
  players: TournamentPlayer[];
}

interface CoachWeeklyTournamentsProps {
  onViewAll?: () => void;
}

export default function CoachWeeklyTournaments({ onViewAll }: CoachWeeklyTournamentsProps) {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/v1/coach/dashboard/tournaments');
        if (response.ok) {
          const data = await response.json();
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
        // Mock data for development
        setTournaments([
          {
            id: '1',
            name: 'NM Junior 2025',
            location: 'Oslo Golfklubb',
            startDate: '2025-12-22',
            endDate: '2025-12-24',
            type: 'national',
            players: [
              { id: 'p1', name: 'Anders Hansen', avatarInitials: 'AH', category: 'A', teeTime: '08:30' },
              { id: 'p2', name: 'Sofie Andersen', avatarInitials: 'SA', category: 'A', teeTime: '09:15' },
              { id: 'p3', name: 'Emma Berg', avatarInitials: 'EB', category: 'B', teeTime: '10:00' },
            ],
          },
          {
            id: '2',
            name: 'Sor-Cup Runde 4',
            location: 'Kristiansand GK',
            startDate: '2025-12-23',
            endDate: '2025-12-23',
            type: 'regional',
            players: [
              { id: 'p4', name: 'Erik Johansen', avatarInitials: 'EJ', category: 'B', teeTime: '11:30' },
              { id: 'p5', name: 'Lars Olsen', avatarInitials: 'LO', category: 'C', teeTime: '12:15' },
            ],
          },
          {
            id: '3',
            name: 'Julecup 2025',
            location: 'Bergen GK',
            startDate: '2025-12-26',
            endDate: '2025-12-26',
            type: 'club',
            players: [
              { id: 'p6', name: 'Mikkel Pedersen', avatarInitials: 'MP', category: 'C' },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Get tournament type badge
  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      national: { bg: 'rgba(var(--warning-rgb), 0.2)', text: 'var(--status-warning)', label: 'Nasjonal' },
      international: { bg: 'rgba(var(--accent-rgb), 0.15)', text: 'var(--accent)', label: 'Internasjonal' },
      regional: { bg: 'rgba(var(--accent-rgb), 0.1)', text: 'var(--accent)', label: 'Regional' },
      club: { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)', label: 'Klubb' },
    };
    return styles[type] || styles.club;
  };

  // Format date range
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

    if (start === end) {
      return startDate.toLocaleDateString('nb-NO', options);
    }
    return `${startDate.toLocaleDateString('nb-NO', { day: 'numeric' })}-${endDate.toLocaleDateString('nb-NO', options)}`;
  };

  // Get days until tournament
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'I dag';
    if (diff === 1) return 'I morgen';
    if (diff < 0) return 'Pagar';
    return `Om ${diff} dager`;
  };

  // Total players this week
  const totalPlayers = new Set(
    tournaments.flatMap((t) => t.players.map((p) => p.id))
  ).size;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--bg-tertiary)',
            borderTopColor: 'var(--status-warning)',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(var(--warning-rgb), 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={20} style={{ color: 'var(--status-warning)' }} />
          </div>
          <div>
            <SubSectionTitle
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 0,
              }}
            >
              Ukens turneringer
            </SubSectionTitle>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              {totalPlayers} spillere deltar
            </span>
          </div>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Se alle
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {/* Tournaments list */}
      {tournaments.length === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Trophy size={32} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            Ingen turneringer denne uken
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tournaments.map((tournament) => {
            const typeBadge = getTypeBadge(tournament.type);
            const daysUntil = getDaysUntil(tournament.startDate);

            return (
              <div
                key={tournament.id}
                onClick={() => navigate(`/coach/tournaments/${tournament.id}`)}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Tournament header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CardTitle
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: 0,
                        }}
                      >
                        {tournament.name}
                      </CardTitle>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: typeBadge.bg,
                          color: typeBadge.text,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {typeBadge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <MapPin size={12} />
                        {tournament.location}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Calendar size={12} />
                        {formatDateRange(tournament.startDate, tournament.endDate)}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      backgroundColor:
                        daysUntil === 'I dag' || daysUntil === 'Pagar'
                          ? 'rgba(var(--success-rgb), 0.15)'
                          : 'var(--bg-tertiary)',
                      color:
                        daysUntil === 'I dag' || daysUntil === 'Pagar'
                          ? 'var(--status-success)'
                          : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {daysUntil}
                  </span>
                </div>

                {/* Players */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    {tournament.players.slice(0, 4).map((player, index) => (
                      <div
                        key={player.id}
                        title={`${player.name}${player.teeTime ? ` - Tee: ${player.teeTime}` : ''}`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 600,
                          marginLeft: index > 0 ? '-8px' : 0,
                          border: '2px solid var(--bg-primary)',
                        }}
                      >
                        {player.avatarInitials}
                      </div>
                    ))}
                    {tournament.players.length > 4 && (
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          marginLeft: '4px',
                        }}
                      >
                        +{tournament.players.length - 4} til
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--accent)',
                      fontWeight: 500,
                    }}
                  >
                    {tournament.players.length} spillere
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
