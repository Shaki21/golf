/**
 * TIER Golf - Coach Alerts Page
 * Design System v3.1 - Decision-First Sub-Page (Neutral Variant)
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Do I have any unread alerts that need my attention?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 — Status Hero: Unread alert count (neutral, no prioritization)
 * Layer 2 — Filter Controls: All vs Unread toggle
 * Layer 3 — Alert List: Alphabetically sorted, no ranking
 *
 * Archetype: A - List/Index Page
 * Purpose: Display actionable alerts for coach attention
 * - No ranking, no comparison between athletes
 *
 * Contract references:
 * - COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 * - COACH_ADMIN_SCREEN_CONTRACT.md
 *
 * NON-NEGOTIABLE:
 * - Alerts are neutral observations, not rankings
 * - No "priority" or "importance" ordering
 * - Alphabetical by athlete name only
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { useAuth } from '../../contexts/AuthContext';
import { coachesAPI, AlertsResponseDTO, CoachAlertDTO } from '../../services/api';
import { useToast } from '../../components/shadcn/use-toast';

// ============================================================================
// TYPES
// ============================================================================

type Alert = {
  id: string;
  athleteId: string;
  athleteName: string;
  type: 'proof_uploaded' | 'plan_pending' | 'note_request' | 'milestone';
  message: string;
  createdAt: string;
  read: boolean;
};

type AlertFilter = 'all' | 'unread';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    athleteId: '1',
    athleteName: 'Anders Hansen',
    type: 'proof_uploaded',
    message: 'Ny video lastet opp: Putting øvelse',
    createdAt: '2025-12-21T10:30:00Z',
    read: false,
  },
  {
    id: 'a2',
    athleteId: '2',
    athleteName: 'Emma Berg',
    type: 'plan_pending',
    message: 'Treningsplan venter på godkjenning',
    createdAt: '2025-12-21T09:15:00Z',
    read: false,
  },
  {
    id: 'a3',
    athleteId: '3',
    athleteName: 'Lars Olsen',
    type: 'milestone',
    message: 'Fullført 10 økter denne måneden',
    createdAt: '2025-12-20T16:00:00Z',
    read: true,
  },
  {
    id: 'a4',
    athleteId: '4',
    athleteName: 'Sofie Andersen',
    type: 'note_request',
    message: 'Bedt om tilbakemelding på siste økt',
    createdAt: '2025-12-20T14:30:00Z',
    read: true,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const sortAlphabetically = (alerts: Alert[]): Alert[] =>
  [...alerts].sort((a, b) => a.athleteName.localeCompare(b.athleteName));

const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Nå nettopp';
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays === 1) return 'I går';
  return `${diffDays} dager siden`;
};

const getAlertConfig = (type: Alert['type']) => {
  switch (type) {
    case 'proof_uploaded':
      return {
        icon: CheckCircle,
        colorClass: 'text-tier-success bg-tier-success/15',
        label: 'Dokumentasjon',
      };
    case 'plan_pending':
      return {
        icon: Clock,
        colorClass: 'text-tier-warning bg-tier-warning/15',
        label: 'Treningsplan',
      };
    case 'note_request':
      return {
        icon: AlertCircle,
        colorClass: 'text-tier-navy bg-tier-navy/15',
        label: 'Tilbakemelding',
      };
    case 'milestone':
      return {
        icon: Bell,
        colorClass: 'text-tier-warning bg-tier-warning/15',
        label: 'Milepæl',
      };
    default:
      return {
        icon: Bell,
        colorClass: 'text-tier-text-secondary bg-tier-surface-base',
        label: 'Varsel',
      };
  }
};

// ============================================================================
// DECISION HERO - Status overview (neutral, no prioritization)
// ============================================================================

interface AlertsHeroProps {
  unreadCount: number;
  totalCount: number;
  onMarkAllRead: () => void;
  onViewUnread: () => void;
}

function AlertsHero({ unreadCount, totalCount, onMarkAllRead, onViewUnread }: AlertsHeroProps) {
  if (unreadCount === 0) {
    return (
      <div className="mx-6 mb-4 bg-tier-surface-base rounded-xl p-5 border border-tier-border-default">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tier-success/15 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-tier-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tier-navy">All caught up</h2>
            <p className="text-sm text-tier-text-secondary">
              {totalCount === 0 ? 'No alerts yet' : `All ${totalCount} alerts have been reviewed`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-6 mb-4 bg-tier-navy/5 rounded-xl p-5 border border-tier-navy/20">
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-tier-navy/15 flex items-center justify-center">
            <Bell className="w-6 h-6 text-tier-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tier-navy">
              {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
            </h2>
            <p className="text-sm text-tier-text-secondary">
              {totalCount} total alerts from your players
            </p>
          </div>
        </div>
      </div>

      {/* Actions - neutral, no priority implied */}
      <div className="flex gap-3">
        <button
          onClick={onViewUnread}
          className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg font-medium text-sm hover:bg-tier-navy/90 transition-colors"
        >
          View unread
          <ArrowRight size={14} />
        </button>
        <button
          onClick={onMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 bg-tier-white text-tier-navy rounded-lg font-medium text-sm border border-tier-border-default hover:bg-tier-surface-base transition-colors"
        >
          <CheckCircle size={14} />
          Mark all read
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

interface CoachAlertsPageProps {
  alerts?: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export default function CoachAlertsPage({
  alerts: apiAlerts,
  onAlertClick,
}: CoachAlertsPageProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(apiAlerts || []);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [loading, setLoading] = useState(!apiAlerts);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coachesAPI.getAlerts();
      const responseData = (response.data?.data || response.data || {}) as AlertsResponseDTO | CoachAlertDTO[];
      const alertsData =
        (responseData as AlertsResponseDTO)?.alerts || (Array.isArray(responseData) ? responseData : []);

      if (Array.isArray(alertsData) && alertsData.length > 0) {
        const transformedAlerts: Alert[] = alertsData.map(
          (a: CoachAlertDTO) => ({
            id: a.id,
            athleteId: a.athleteId || a.playerId || a.player?.id || '',
            athleteName:
              a.athleteName ||
              a.playerName ||
              (a.player
                ? `${a.player.firstName || ''} ${a.player.lastName || ''}`.trim()
                : 'Ukjent'),
            type: (a.type as Alert['type']) || 'milestone',
            message: a.message || a.text || a.description || '',
            createdAt: a.createdAt || a.created_at || new Date().toISOString(),
            read: a.read ?? a.isRead ?? false,
          })
        );
        setAlerts(transformedAlerts);
      } else {
        setAlerts(MOCK_ALERTS);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setAlerts(MOCK_ALERTS);
      toast({
        title: 'Kunne ikke laste varsler',
        description: 'Viser demodata. Prøv å laste siden på nytt.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!apiAlerts && user) {
      fetchAlerts();
    }
  }, [apiAlerts, user, fetchAlerts]);

  const filteredAlerts = sortAlphabetically(
    filter === 'unread' ? alerts.filter((a) => !a.read) : alerts
  );

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleAlertClick = (alert: Alert) => {
    markAsRead(alert.id);
    onAlertClick?.(alert);
  };

  const handleViewUnread = () => {
    setFilter('unread');
  };

  return (
    <section
      aria-label="Coach alerts"
      className="min-h-screen bg-tier-surface-base font-sans"
    >
      {/* Header - Standardized layout matching other coach pages */}
      <PageHeader
        title="Varsler"
        subtitle={`${unreadCount} uleste av ${alerts.length} totalt`}
        helpText="Intelligente varsler om spillere som trenger oppfølging. Se avvik fra treningsplan, manglende evalueringer, dårlig form og andre viktige hendelser."
        actions={
          unreadCount > 0 && (
            <div className="flex items-center gap-2 py-2 px-4 bg-tier-error/15 rounded-lg">
              <Bell size={18} className="text-tier-error" />
              <span className="text-sm font-semibold text-tier-error">
                {unreadCount} uleste
              </span>
            </div>
          )
        }
      />

      {/* Layer 1: Status Hero - Alert overview (neutral, no prioritization) */}
      <AlertsHero
        unreadCount={unreadCount}
        totalCount={alerts.length}
        onMarkAllRead={markAllAsRead}
        onViewUnread={handleViewUnread}
      />

      {/* Filter */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`
              flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-none cursor-pointer shadow-sm text-[15px] font-medium
              ${filter === 'all'
                ? 'bg-tier-navy text-white'
                : 'bg-tier-white text-tier-navy'
              }
            `}
          >
            <Filter size={16} />
            Alle
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`
              flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-none cursor-pointer shadow-sm text-[15px] font-medium
              ${filter === 'unread'
                ? 'bg-tier-navy text-white'
                : 'bg-tier-white text-tier-navy'
              }
            `}
          >
            Uleste
            {unreadCount > 0 && (
              <span
                className={`
                  px-2 py-0.5 rounded text-xs font-semibold
                  ${filter === 'unread'
                    ? 'bg-white/20 text-white'
                    : 'bg-tier-error/15 text-tier-error'
                  }
                `}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-[15px] text-tier-text-secondary">Laster varsler...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-tier-white rounded-xl shadow-sm py-12 px-6 text-center">
            <Bell size={40} className="text-tier-border-default mb-3 mx-auto" />
            <p className="text-[15px] text-tier-text-secondary">
              {filter === 'unread' ? 'Ingen uleste varsler' : 'Ingen varsler'}
            </p>
          </div>
        ) : (
          <div className="bg-tier-white rounded-xl shadow-sm overflow-hidden">
            {filteredAlerts.map((alert, index) => {
              const config = getAlertConfig(alert.type);
              const AlertIcon = config.icon;

              return (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => handleAlertClick(alert)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 border-none cursor-pointer text-left transition-colors
                    ${alert.read ? 'bg-transparent' : 'bg-tier-navy/5'}
                    ${index < filteredAlerts.length - 1 ? 'border-b border-tier-border-default' : ''}
                    hover:bg-tier-surface-base
                  `}
                >
                  {/* Alert Icon */}
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${config.colorClass}`}
                  >
                    <AlertIcon size={22} />
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[15px] text-tier-navy ${alert.read ? 'font-normal' : 'font-semibold'}`}
                      >
                        {alert.athleteName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${config.colorClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-tier-text-secondary m-0 truncate">
                      {alert.message}
                    </p>
                  </div>

                  {/* Time & Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-tier-text-secondary">
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                    {!alert.read && (
                      <div className="w-2 h-2 rounded-full bg-tier-navy" />
                    )}
                    <ChevronRight size={18} className="text-tier-text-secondary" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/*
STRICT NOTES:
- Alerts are sorted alphabetically by athlete name only.
- Do NOT prioritize or rank alerts by importance.
- Do NOT show "urgent" or "critical" labels.
- Do NOT compare athletes to each other.
- Do NOT show performance metrics inline.
- This is a neutral notification feed only.
*/
