/**
 * CoachAthleteList - Athlete List Hub Page
 *
 * Purpose: "Find an athlete quickly."
 *
 * CRITICAL UX RULES:
 * - List ALWAYS alphabetical A-Å (hard rule, no ranking)
 * - Neutral presentation (no comparisons)
 * - Search by name only
 * - Click → athlete detail
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronRight } from 'lucide-react';
import { PageTitle } from '../../../components/typography';
import { athleteList, type Athlete } from '../../../lib/coachMockData';
import { athleteStatusOptions } from '../../../config/coach-navigation';

// Avatar component with consistent colors
const AVATAR_COLORS = ['bg-tier-navy', 'bg-tier-success', 'bg-tier-warning', 'bg-tier-info'];

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(',')[0]?.substring(0, 2).toUpperCase() || 'XX';

  // Generate consistent color from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgColorClass = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

  return (
    <div
      className={`rounded-full ${bgColorClass} text-white flex items-center justify-center font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

// Status chip component
function StatusChip({ status }: { status: Athlete['injuryStatus'] }) {
  const statusConfig = athleteStatusOptions.find(s => s.id === status);
  const colorClasses = {
    ready: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    injured: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[status]}`}
    >
      {statusConfig?.labelNO || status}
    </span>
  );
}

// Category badge - neutral presentation
function CategoryBadge({ category }: { category: Athlete['category'] }) {
  return (
    <span className="px-2 py-1 rounded-md text-xs font-medium bg-tier-surface-base text-tier-text-secondary">
      Kat. {category}
    </span>
  );
}

export default function CoachAthleteList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort athletes - ALWAYS alphabetical by displayName
  const filteredAthletes = useMemo(() => {
    const filtered = athleteList.filter(athlete =>
      athlete.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Always sort alphabetically by displayName (already sorted in mock data, but enforce)
    return filtered.sort((a, b) => a.displayName.localeCompare(b.displayName, 'nb-NO'));
  }, [searchTerm]);

  const handleAthleteClick = (athleteId: string) => {
    navigate(`/coach/athletes/${athleteId}`);
  };

  // Format last activity date
  const formatLastActivity = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <PageTitle>Spillere</PageTitle>
        <p className="text-tier-text-secondary mt-1">
          {filteredAthletes.length} {filteredAthletes.length === 1 ? 'spiller' : 'spillere'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-tier-white rounded-xl border border-tier-border-default">
          <Search size={20} className="text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Søk etter spiller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-tier-navy placeholder:text-tier-text-tertiary"
          />
        </div>
      </div>

      {/* Athletes List */}
      {filteredAthletes.length === 0 ? (
        <div className="text-center py-12 bg-tier-white rounded-xl border border-tier-border-default">
          <User size={48} className="mx-auto text-tier-text-tertiary mb-3" />
          <p className="text-tier-text-secondary">Ingen utøvere funnet</p>
          {searchTerm && (
            <p className="text-tier-text-tertiary text-sm mt-1">
              Prøv et annet søkeord
            </p>
          )}
        </div>
      ) : (
        <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
          {filteredAthletes.map((athlete, index) => (
            <div
              key={athlete.id}
              onClick={() => handleAthleteClick(athlete.id)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-tier-surface-base ${
                index !== filteredAthletes.length - 1 ? 'border-b border-tier-border-default' : ''
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleAthleteClick(athlete.id)}
            >
              {/* Avatar */}
              <Avatar name={athlete.displayName} />

              {/* Athlete info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-tier-navy truncate">
                    {athlete.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-tier-text-secondary">
                  <span>HCP {athlete.hcp.toFixed(1)}</span>
                  <span>•</span>
                  <span>Sist aktiv {formatLastActivity(athlete.lastActivityAt)}</span>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-2 shrink-0">
                {athlete.injuryStatus !== 'ready' && (
                  <StatusChip status={athlete.injuryStatus} />
                )}
                <CategoryBadge category={athlete.category} />
                <ChevronRight size={20} className="text-tier-text-tertiary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note about alphabetical ordering */}
      <p className="text-center text-xs text-tier-text-tertiary mt-4">
        Sortert alfabetisk (A-Å)
      </p>
    </div>
  );
}
