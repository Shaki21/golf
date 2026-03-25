/**
 * TIER Golf - Coach Player Alerts Widget
 * Design System v3.0 - Semantic CSS Variables
 *
 * Viser rode flagg fra spillere som krever oppmerksomhet:
 * - Darlig sovn
 * - Darlig mat/ernaering
 * - Lav energi
 * - Hoyt stressniva
 * - Manglende trening
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Moon,
  Utensils,
  Battery,
  Brain,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import { SubSectionTitle } from '../../../ui/primitives/typography';

interface PlayerAlert {
  id: string;
  playerId: string;
  playerName: string;
  avatarInitials: string;
  type: 'sleep' | 'nutrition' | 'energy' | 'stress' | 'inactive';
  severity: 'warning' | 'critical';
  message: string;
  value?: string;
  daysAgo: number;
  createdAt: string;
}

interface CoachPlayerAlertsProps {
  maxItems?: number;
  onViewAll?: () => void;
}

export default function CoachPlayerAlerts({ maxItems = 5, onViewAll }: CoachPlayerAlertsProps) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PlayerAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/v1/coach/dashboard/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        // Mock data for development
        setAlerts([
          {
            id: '1',
            playerId: 'p1',
            playerName: 'Anders Hansen',
            avatarInitials: 'AH',
            type: 'sleep',
            severity: 'critical',
            message: 'Har rapportert under 5 timer sovn 3 netter pa rad',
            value: '4.5t snitt',
            daysAgo: 0,
            createdAt: '2025-12-21T08:00:00Z',
          },
          {
            id: '2',
            playerId: 'p2',
            playerName: 'Erik Johansen',
            avatarInitials: 'EJ',
            type: 'inactive',
            severity: 'warning',
            message: 'Ingen treningslogg siste 5 dager',
            value: '5 dager',
            daysAgo: 5,
            createdAt: '2025-12-16T12:00:00Z',
          },
          {
            id: '3',
            playerId: 'p3',
            playerName: 'Sofie Andersen',
            avatarInitials: 'SA',
            type: 'stress',
            severity: 'warning',
            message: 'Hoyt stressniva rapportert for turnering',
            value: '8/10',
            daysAgo: 1,
            createdAt: '2025-12-20T14:00:00Z',
          },
          {
            id: '4',
            playerId: 'p4',
            playerName: 'Lars Olsen',
            avatarInitials: 'LO',
            type: 'nutrition',
            severity: 'warning',
            message: 'Lav ernaeringsscore denne uken',
            value: '3.2/10',
            daysAgo: 2,
            createdAt: '2025-12-19T10:00:00Z',
          },
          {
            id: '5',
            playerId: 'p5',
            playerName: 'Emma Berg',
            avatarInitials: 'EB',
            type: 'energy',
            severity: 'critical',
            message: 'Rapporterer konstant lav energi',
            value: '2/10',
            daysAgo: 0,
            createdAt: '2025-12-21T07:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Get icon and color for alert type
  const getAlertStyle = (type: string, severity: string) => {
    const icons: Record<string, React.ElementType> = {
      sleep: Moon,
      nutrition: Utensils,
      energy: Battery,
      stress: Brain,
      inactive: Clock,
    };

    const colors = {
      critical: {
        bg: 'rgba(var(--error-rgb), 0.1)',
        border: 'var(--status-error)',
        icon: 'var(--status-error)',
      },
      warning: {
        bg: 'rgba(var(--warning-rgb), 0.1)',
        border: 'var(--status-warning)',
        icon: 'var(--status-warning)',
      },
    };

    return {
      Icon: icons[type] || AlertTriangle,
      colors: colors[severity as keyof typeof colors] || colors.warning,
    };
  };

  // Dismiss alert
  const dismissAlert = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/coaches/alerts/${alertId}/dismiss`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setDismissedIds(new Set([...dismissedIds, alertId]));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  // Filter out dismissed alerts
  const visibleAlerts = alerts
    .filter((a) => !dismissedIds.has(a.id))
    .slice(0, maxItems);

  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' && !dismissedIds.has(a.id)
  ).length;

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--bg-tertiary)',
            borderTopColor: 'var(--accent)',
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
              backgroundColor: 'rgba(var(--error-rgb), 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--status-error)' }} />
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
              Spillervarsler
            </SubSectionTitle>
            {criticalCount > 0 && (
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--status-error)',
                }}
              >
                {criticalCount} kritiske
              </span>
            )}
          </div>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Se alle
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {/* Alerts list */}
      {visibleAlerts.length === 0 ? (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: 'rgba(var(--success-rgb), 0.08)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--status-success)',
              margin: 0,
            }}
          >
            Ingen aktive varsler
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibleAlerts.map((alert) => {
            const { Icon, colors } = getAlertStyle(alert.type, alert.severity);
            return (
              <div
                key={alert.id}
                onClick={() => navigate(`/coach/athletes/${alert.playerId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: colors.bg,
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${colors.border}`,
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
                  <Icon size={18} style={{ color: colors.icon }} />
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
                      {alert.avatarInitials}
                    </span>
                    <span
                      style={{
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {alert.playerName}
                    </span>
                    {alert.value && (
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'var(--bg-primary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: colors.icon,
                        }}
                      >
                        {alert.value}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}
                  >
                    {alert.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={(e) => dismissAlert(alert.id, e)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: 0.6,
                  }}
                >
                  <X size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
