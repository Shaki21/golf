/**
 * TIER Golf - Coach Injury/Illness Tracker Widget
 * Design System v3.0 - Semantic CSS Variables
 *
 * Viser oversikt over spillere med skader eller sykdom.
 * Hjelper treneren a holde oversikt over hvem som er ute.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Thermometer,
  Activity,
  ChevronRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../ui/primitives/typography';

interface InjuryRecord {
  id: string;
  playerId: string;
  playerName: string;
  avatarInitials: string;
  type: 'injury' | 'illness' | 'recovery';
  description: string;
  affectedArea?: string;
  startDate: string;
  expectedReturn?: string;
  status: 'active' | 'recovering' | 'cleared';
  notes?: string;
}

interface CoachInjuryTrackerProps {
  onViewAll?: () => void;
}

export default function CoachInjuryTracker({ onViewAll }: CoachInjuryTrackerProps) {
  const navigate = useNavigate();
  const [records, setRecords] = useState<InjuryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch injury records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('/api/v1/coach/dashboard/injuries');
        if (response.ok) {
          const data = await response.json();
          setRecords(data.records || []);
        }
      } catch (error) {
        console.error('Failed to fetch injury records:', error);
        // Mock data for development
        setRecords([
          {
            id: '1',
            playerId: 'p1',
            playerName: 'Lars Olsen',
            avatarInitials: 'LO',
            type: 'injury',
            description: 'Strekk i hoyre skulder',
            affectedArea: 'Skulder',
            startDate: '2025-12-15',
            expectedReturn: '2025-12-28',
            status: 'active',
            notes: 'Unnga full svingstyrke',
          },
          {
            id: '2',
            playerId: 'p2',
            playerName: 'Erik Johansen',
            avatarInitials: 'EJ',
            type: 'illness',
            description: 'Forkjolelse',
            startDate: '2025-12-19',
            expectedReturn: '2025-12-23',
            status: 'recovering',
          },
          {
            id: '3',
            playerId: 'p3',
            playerName: 'Mikkel Pedersen',
            avatarInitials: 'MP',
            type: 'recovery',
            description: 'Tilbake etter kneoperasjon',
            affectedArea: 'Kne',
            startDate: '2025-11-01',
            expectedReturn: '2025-12-25',
            status: 'recovering',
            notes: 'Gradvis opptrapping',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Get icon and color for record type/status
  const getRecordStyle = (type: string, status: string) => {
    if (status === 'cleared') {
      return {
        Icon: CheckCircle,
        bg: 'rgba(var(--success-rgb), 0.1)',
        color: 'var(--status-success)',
        label: 'Friskmeldt',
      };
    }

    const styles: Record<string, { Icon: React.ElementType; bg: string; color: string; label: string }> = {
      injury: {
        Icon: Activity,
        bg: 'rgba(var(--error-rgb), 0.1)',
        color: 'var(--status-error)',
        label: 'Skade',
      },
      illness: {
        Icon: Thermometer,
        bg: 'rgba(var(--warning-rgb), 0.1)',
        color: 'var(--status-warning)',
        label: 'Sykdom',
      },
      recovery: {
        Icon: Heart,
        bg: 'rgba(var(--accent-rgb), 0.1)',
        color: 'var(--accent)',
        label: 'Rehabilitering',
      },
    };

    return styles[type] || styles.illness;
  };

  // Calculate days until expected return
  const getDaysUntilReturn = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return 'Snart';
    if (diff === 1) return '1 dag';
    return `${diff} dager`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: 'rgba(var(--error-rgb), 0.15)', color: 'var(--status-error)', label: 'Aktiv' },
      recovering: { bg: 'rgba(var(--warning-rgb), 0.15)', color: 'var(--status-warning)', label: 'Under behandling' },
      cleared: { bg: 'rgba(var(--success-rgb), 0.15)', color: 'var(--status-success)', label: 'Friskmeldt' },
    };
    return styles[status] || styles.active;
  };

  // Count by status
  const activeCount = records.filter((r) => r.status === 'active').length;
  const recoveringCount = records.filter((r) => r.status === 'recovering').length;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--bg-tertiary)',
            borderTopColor: 'var(--status-error)',
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
              backgroundColor: 'rgba(var(--error-rgb), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} style={{ color: 'var(--status-error)' }} />
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
              Skade/Sykdom
            </SubSectionTitle>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              {activeCount} aktive, {recoveringCount} under behandling
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

      {/* Records list */}
      {records.length === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: 'rgba(var(--success-rgb), 0.08)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <CheckCircle size={32} style={{ color: 'var(--status-success)', marginBottom: '8px' }} />
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--status-success)',
              margin: 0,
            }}
          >
            Alle spillere er friske
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {records.map((record) => {
            const recordStyle = getRecordStyle(record.type, record.status);
            const statusBadge = getStatusBadge(record.status);
            const daysUntil = getDaysUntilReturn(record.expectedReturn);

            return (
              <div
                key={record.id}
                onClick={() => navigate(`/coach/athletes/${record.playerId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: recordStyle.bg,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <recordStyle.Icon size={18} style={{ color: recordStyle.color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {record.avatarInitials}
                    </span>
                    <span
                      style={{
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {record.playerName}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      margin: '0 0 4px',
                    }}
                  >
                    {record.description}
                    {record.affectedArea && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {' '}
                        ({record.affectedArea})
                      </span>
                    )}
                  </p>

                  {record.notes && (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        margin: '0 0 6px',
                        fontStyle: 'italic',
                      }}
                    >
                      {record.notes}
                    </p>
                  )}

                  {/* Expected return */}
                  {record.expectedReturn && daysUntil && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Forventet tilbake:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {daysUntil}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
