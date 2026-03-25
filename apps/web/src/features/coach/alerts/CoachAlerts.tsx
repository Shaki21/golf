/**
 * CoachAlerts - Alerts Hub Page
 *
 * Purpose: "What requires coach attention."
 *
 * CRITICAL UX RULES:
 * - Filter: all vs unread
 * - ALWAYS grouped/sorted alphabetically by athlete name (no ranking)
 * - Alert types: proof uploaded, plan waiting, note request, milestone
 * - Clicking marks as read
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Video, ClipboardList, MessageSquare, Trophy, Stethoscope, CheckCircle, Filter } from 'lucide-react';
import { PageTitle, SubSectionTitle } from '../../../components/typography';
import { alertsFeed, getUnreadAlerts, type Alert } from '../../../lib/coachMockData';
import { coachAlertTypes } from '../../../config/coach-navigation';

type FilterType = 'all' | 'unread';

// Icon map for alert types
const alertIconMap = {
  proof_uploaded: Video,
  plan_pending: ClipboardList,
  note_request: MessageSquare,
  milestone: Trophy,
  injury: Stethoscope,
  test_completed: CheckCircle,
};

// Color map for alert types
const alertColorMap = {
  proof_uploaded: 'bg-blue-100 text-blue-600',
  plan_pending: 'bg-yellow-100 text-yellow-600',
  note_request: 'bg-purple-100 text-purple-600',
  milestone: 'bg-green-100 text-green-600',
  injury: 'bg-red-100 text-red-600',
  test_completed: 'bg-green-100 text-green-600',
};

// Alert card
function AlertCard({
  alert,
  onClick,
}: {
  alert: Alert;
  onClick: () => void;
}) {
  const Icon = alertIconMap[alert.type] || Bell;
  const colorClass = alertColorMap[alert.type] || 'bg-gray-100 text-gray-600';
  const alertConfig = coachAlertTypes[alert.type.toUpperCase() as keyof typeof coachAlertTypes];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} dag${diffDays > 1 ? 'er' : ''} siden`;
    if (diffHours > 0) return `${diffHours} time${diffHours > 1 ? 'r' : ''} siden`;
    return 'Akkurat nå';
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-4 p-4 bg-tier-white rounded-xl border cursor-pointer transition-all ${
        alert.isRead
          ? 'border-tier-border-default hover:border-tier-border-default'
          : 'border-tier-navy border-l-4 hover:shadow-md'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-tier-navy">
            {alert.athleteName}
          </span>
          {!alert.isRead && (
            <span className="w-2 h-2 rounded-full bg-tier-navy" />
          )}
        </div>
        <p className="text-tier-text-secondary text-sm">{alert.message}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-tier-text-tertiary">
          <span>{alertConfig?.labelNO || alert.type}</span>
          <span>•</span>
          <span>{formatTime(alert.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// Filter chip
function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-full transition-colors flex items-center gap-2 ${
        active
          ? 'bg-tier-navy text-white'
          : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`text-xs ${active ? 'opacity-80' : 'text-tier-text-tertiary'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

export default function CoachAlerts() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [localAlerts, setLocalAlerts] = useState(alertsFeed);

  // Filter and sort alerts - ALWAYS alphabetical by athlete name
  const filteredAlerts = useMemo(() => {
    let result = [...localAlerts];

    if (filter === 'unread') {
      result = result.filter(a => !a.isRead);
    }

    // Always sort alphabetically by athlete name
    return result.sort((a, b) => a.athleteName.localeCompare(b.athleteName, 'nb-NO'));
  }, [localAlerts, filter]);

  const unreadCount = useMemo(() => {
    return localAlerts.filter(a => !a.isRead).length;
  }, [localAlerts]);

  const handleAlertClick = (alert: Alert) => {
    // Mark as read
    setLocalAlerts(prev =>
      prev.map(a => (a.id === alert.id ? { ...a, isRead: true } : a))
    );

    // Navigate based on alert type
    switch (alert.type) {
      case 'proof_uploaded':
        navigate(`/coach/athletes/${alert.athleteId}/proof`);
        break;
      case 'plan_pending':
        navigate(`/coach/athletes/${alert.athleteId}/plan`);
        break;
      case 'note_request':
        navigate(`/coach/athletes/${alert.athleteId}/notes`);
        break;
      case 'injury':
        navigate(`/coach/athlete-status`);
        break;
      default:
        navigate(`/coach/athletes/${alert.athleteId}`);
    }
  };

  const handleMarkAllRead = () => {
    setLocalAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <PageTitle>Varsler</PageTitle>
          <p className="text-tier-text-secondary mt-1">
            {unreadCount} uleste {unreadCount === 1 ? 'varsel' : 'varsler'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-tier-navy hover:underline"
          >
            Merk alle som lest
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={localAlerts.length}
        >
          Alle
        </FilterChip>
        <FilterChip
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
          count={unreadCount}
        >
          Uleste
        </FilterChip>
      </div>

      {/* Alerts list */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-16 bg-tier-white rounded-xl border border-tier-border-default">
          <Bell size={48} className="mx-auto text-tier-text-tertiary mb-4" />
          <SubSectionTitle style={{ marginBottom: 8 }}>
            {filter === 'unread' ? 'Ingen uleste varsler' : 'Ingen varsler'}
          </SubSectionTitle>
          <p className="text-tier-text-secondary">
            {filter === 'unread'
              ? 'Du har lest alle varsler!'
              : 'Du har ingen varsler ennå.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => handleAlertClick(alert)}
            />
          ))}
        </div>
      )}

      {/* Note about ordering */}
      <p className="text-center text-xs text-tier-text-tertiary mt-4">
        Sortert alfabetisk etter utøvernavn (A-Å)
      </p>
    </div>
  );
}
