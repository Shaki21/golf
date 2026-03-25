/**
 * TournamentCard - Individual Tournament Display Card
 * Design System v3.1 - Tailwind CSS
 *
 * Displays tournament information including:
 * - Name, dates, venue
 * - Category recommendation
 * - Registration status
 * - Quick actions (hotel, school absence, calendar)
 * - Entry fee and registration button
 */

import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Flag,
  Star,
  Medal,
  Trophy,
  ChevronRight,
  ExternalLink,
  Hotel,
  FileText,
  Plus,
  Target,
} from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import Badge from '../../../ui/primitives/Badge.primitive';
import { SubSectionTitle } from '../../../components/typography';
import {
  Tournament,
  TourType,
  TournamentStatus,
  PlayerCategory,
  STATUS_LABELS,
  CATEGORY_LABELS,
} from '../types';
import {
  getCategoryBadgeConfig,
  isTournamentRecommendedForPlayer,
} from '../hierarchy-config';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getTourIcon(tour: TourType) {
  switch (tour) {
    case 'pga_tour':
    case 'dp_world_tour':
    case 'challenge_tour':
      return Star;
    case 'wagr_turnering':
    case 'ega_turnering':
      return Medal;
    case 'nordic_league':
    case 'global_junior_tour':
      return Flag;
    default:
      return Trophy;
  }
}

function getStatusConfig(status: TournamentStatus, isRegistered?: boolean): {
  label: string;
  variant: 'success' | 'error' | 'neutral' | 'accent' | 'warning';
} {
  if (isRegistered) {
    return { label: 'Registered', variant: 'success' };
  }

  switch (status) {
    case 'open':
      return { label: 'Open for registration', variant: 'accent' };
    case 'full':
      return { label: 'Full', variant: 'error' };
    case 'upcoming':
      return { label: 'Coming soon', variant: 'neutral' };
    case 'ongoing':
      return { label: 'Ongoing', variant: 'warning' };
    case 'finished':
      return { label: 'Finished', variant: 'neutral' };
    default:
      return { label: STATUS_LABELS[status] || status, variant: 'neutral' };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

interface TournamentCardProps {
  tournament: Tournament;
  playerCategory?: PlayerCategory;
  onSelect: (t: Tournament) => void;
  onRegister: (t: Tournament) => void;
  onAddToCalendar: (t: Tournament) => void;
  onPlanTournament: (t: Tournament) => void;
  onAbsenceRequest?: (t: Tournament) => void;
  compact?: boolean;
}

export default function TournamentCard({
  tournament,
  playerCategory,
  onSelect,
  onRegister,
  onAddToCalendar,
  onPlanTournament,
  onAbsenceRequest,
  compact = true,
}: TournamentCardProps) {
  const daysUntil = getDaysUntil(tournament.startDate);
  const statusConfig = getStatusConfig(tournament.status, tournament.isRegistered);
  const TourIcon = getTourIcon(tournament.tour);
  const isRecommended = playerCategory
    ? isTournamentRecommendedForPlayer(tournament, playerCategory)
    : false;

  const showRegisterButton =
    tournament.status === 'open' && !tournament.isRegistered;

  // Border style based on status
  const getBorderClass = () => {
    if (tournament.isRegistered) return 'border-2 border-green-500';
    if (isRecommended) return 'border-2 border-tier-gold';
    return 'border border-tier-border-default';
  };

  // Compact card layout
  if (compact) {
    return (
      <div
        onClick={() => onSelect(tournament)}
        className={`bg-white rounded-lg px-3.5 py-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${getBorderClass()}`}
      >
        {/* Header Row */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-tier-surface-subtle flex items-center justify-center shrink-0">
            <TourIcon size={16} className="text-tier-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-tier-navy leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                {tournament.name}
              </span>
              {daysUntil >= 0 && daysUntil <= 14 && (
                <span className="text-[10px] font-semibold text-tier-gold bg-tier-gold/10 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                  {daysUntil === 0 ? 'Today!' : `In ${daysUntil} d`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  isRecommended
                    ? 'bg-tier-gold/10 text-tier-gold font-semibold'
                    : 'bg-gray-100 text-tier-text-secondary'
                }`}
              >
                {CATEGORY_LABELS[tournament.recommendedCategory]}
              </span>
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>
              {isRecommended && (
                <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details Row */}
        <div className="flex flex-col gap-1 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-tier-text-secondary">
            <Calendar size={12} className="text-tier-text-tertiary" />
            <span>{formatDateRange(tournament.startDate, tournament.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tier-text-secondary">
            <MapPin size={12} className="text-tier-text-tertiary" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {tournament.venue}, {tournament.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tier-text-secondary">
            <Users size={12} className="text-tier-text-tertiary" />
            <span>{tournament.currentParticipants ?? 0}/{tournament.maxParticipants ?? '∞'} registered</span>
          </div>
          {tournament.format && (
            <div className="flex items-center gap-1.5 text-xs text-tier-text-secondary">
              <Flag size={12} className="text-tier-text-tertiary" />
              <span>{tournament.format}</span>
            </div>
          )}
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-2 border-t border-tier-border-subtle">
          <div className="flex flex-col">
            <span className="text-[10px] text-tier-text-tertiary">Entry fee</span>
            <span className="text-[13px] font-semibold text-tier-navy">
              {tournament.entryFee === 0 ? 'Free' : `${tournament.entryFee} kr`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                onPlanTournament(tournament);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded border border-tier-border-default bg-tier-surface-subtle text-[11px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-white"
            >
              <Target size={12} />
              Plan
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onSelect(tournament);
              }}
              className="flex items-center gap-0.5 text-tier-gold text-xs font-medium bg-transparent border-none cursor-pointer p-0"
            >
              View details
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full card layout
  const showQuickActions = tournament.isRegistered;

  return (
    <div
      onClick={() => onSelect(tournament)}
      className={`bg-white rounded-xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${getBorderClass()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-tier-surface-subtle flex items-center justify-center">
            <TourIcon size={22} className="text-tier-text-secondary" />
          </div>
          <div>
            <SubSectionTitle className="text-base font-semibold text-tier-navy m-0 leading-tight">
              {tournament.name}
            </SubSectionTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  isRecommended
                    ? 'bg-tier-gold/10 text-tier-gold'
                    : 'bg-gray-100 text-tier-text-secondary'
                }`}
              >
                {CATEGORY_LABELS[tournament.recommendedCategory]}
              </span>
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        {daysUntil >= 0 && daysUntil <= 14 && (
          <div className="text-[11px] font-semibold text-tier-gold bg-tier-gold/10 px-2 py-1 rounded whitespace-nowrap">
            {daysUntil === 0 ? 'Today!' : `In ${daysUntil} d`}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-tier-navy">
          <Calendar size={14} className="text-tier-text-tertiary" />
          <span>{formatDateRange(tournament.startDate, tournament.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-tier-navy">
          <MapPin size={14} className="text-tier-text-tertiary" />
          <span>{tournament.venue}, {tournament.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-tier-navy">
          <Users size={14} className="text-tier-text-tertiary" />
          <span>
            {tournament.currentParticipants ?? 0}/{tournament.maxParticipants ?? '∞'} registered
          </span>
        </div>
        {tournament.format && (
          <div className="flex items-center gap-2 text-sm text-tier-navy">
            <Flag size={14} className="text-tier-text-tertiary" />
            <span>{tournament.format}</span>
          </div>
        )}
      </div>

      {/* Quick Actions (for registered tournaments) */}
      {showQuickActions && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tournament.hotelUrl && (
            <button
              onClick={e => {
                e.stopPropagation();
                window.open(tournament.hotelUrl, '_blank');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-tier-border-default bg-tier-surface-subtle text-[11px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-white"
            >
              <Hotel size={12} />
              Book hotel
            </button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onAbsenceRequest?.(tournament);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-tier-border-default bg-tier-surface-subtle text-[11px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-white"
          >
            <FileText size={12} />
            Request sports absence
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddToCalendar(tournament);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-dashed border-tier-border-default bg-transparent text-[11px] font-medium text-tier-text-secondary cursor-pointer transition-all duration-200 hover:bg-tier-surface-subtle"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-tier-border-subtle">
        <div>
          <span className="text-xs text-tier-text-secondary">Entry fee</span>
          <div className="text-base font-semibold text-tier-navy">
            {tournament.entryFee === 0 ? 'Free' : `${tournament.entryFee} kr`}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => {
              e.stopPropagation();
              onPlanTournament(tournament);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-tier-border-default bg-tier-surface-subtle text-[13px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-white"
            title="Add to tournament plan"
          >
            <Target size={14} />
            Plan
          </button>
          {showRegisterButton && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ExternalLink size={14} />}
              onClick={e => {
                e.stopPropagation();
                onRegister(tournament);
              }}
            >
              Register
            </Button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onSelect(tournament);
            }}
            className="flex items-center gap-1 text-tier-gold text-sm font-medium bg-transparent border-none cursor-pointer p-0"
          >
            View details
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
