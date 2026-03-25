/**
 * TIER Golf - Tournament Details Panel
 * Design System v3.1 - Tailwind CSS
 *
 * Side panel (desktop) / bottom sheet (mobile) for tournament details.
 * Shows full tournament info with action buttons.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Flag,
  ExternalLink,
  Hotel,
  FileText,
  CalendarPlus,
  CheckCircle,
  Info,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import Badge from '../../ui/primitives/Badge.primitive';
import { SectionTitle } from '../../components/typography/Headings';
import { tournamentsAPI } from '../../services/api';
import {
  Tournament,
  PlayerCategory,
  TOUR_LABELS,
  CATEGORY_LABELS,
} from './types';
import {
  isTournamentRecommendedForPlayer,
} from './hierarchy-config';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  })} - ${endDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// COMPONENT
// ============================================================================

interface TournamentDetailsPanelProps {
  tournament: Tournament;
  playerCategory?: PlayerCategory;
  onClose: () => void;
  onRegister: (t: Tournament) => void;
  onAddToCalendar: (t: Tournament) => void;
}

export default function TournamentDetailsPanel({
  tournament,
  playerCategory,
  onClose,
  onRegister,
  onAddToCalendar,
}: TournamentDetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isMarkedRegistered, setIsMarkedRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const isRecommended = playerCategory
    ? isTournamentRecommendedForPlayer(tournament, playerCategory)
    : false;
  const daysUntil = getDaysUntil(tournament.startDate);
  const isUpcoming = daysUntil >= 0;
  const showRegisterButton =
    tournament.status === 'open' && !tournament.isRegistered && !isMarkedRegistered;
  const isRegistered = tournament.isRegistered || isMarkedRegistered;
  const hasResult = tournament.result && tournament.status === 'finished';

  const handleMarkRegistered = async () => {
    if (isRegistering) return;

    setIsRegistering(true);
    try {
      await tournamentsAPI.addToCalendar(tournament.id, { isRegistered: true });
      setIsMarkedRegistered(true);
    } catch (error) {
      console.error('Failed to mark tournament as registered:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAbsenceApplication = () => {
    navigate('/skoleplan', {
      state: {
        tournamentAbsence: {
          name: tournament.name,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          venue: tournament.venue,
        },
      },
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[100]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed bg-white flex flex-col z-[101] overflow-hidden ${
          isMobile
            ? 'inset-x-0 bottom-0 max-h-[90vh] rounded-t-xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)]'
            : 'top-0 right-0 bottom-0 w-[480px] max-w-[90vw] shadow-[-4px_0_24px_rgba(0,0,0,0.15)]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-tier-border-subtle">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <SectionTitle>{tournament.name}</SectionTitle>
            {isRecommended && (
              <Badge variant="accent" size="sm">
                Recommended for you
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded bg-tier-surface-subtle border-none cursor-pointer flex items-center justify-center text-tier-text-secondary ml-3 shrink-0 hover:bg-tier-border-subtle"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {/* Description */}
          {tournament.description && (
            <p className="text-[15px] text-tier-navy leading-relaxed m-0 mb-5">
              {tournament.description}
            </p>
          )}

          {/* Info grid */}
          <div className="flex flex-col gap-4 mb-5">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-tier-gold mt-0.5" />
              <div>
                <div className="text-xs text-tier-text-tertiary mb-0.5">Date</div>
                <div className="text-[15px] font-medium text-tier-navy">
                  {formatDateRange(tournament.startDate, tournament.endDate)}
                </div>
                {isUpcoming && tournament.registrationDeadline && (
                  <div className="text-[13px] text-tier-text-secondary mt-0.5">
                    Registration deadline: {formatDate(tournament.registrationDeadline)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-tier-gold mt-0.5" />
              <div>
                <div className="text-xs text-tier-text-tertiary mb-0.5">Location</div>
                <div className="text-[15px] font-medium text-tier-navy">{tournament.venue}</div>
                <div className="text-[13px] text-tier-text-secondary mt-0.5">
                  {tournament.city}, {tournament.country}
                </div>
              </div>
            </div>

            {tournament.format && (
              <div className="flex items-start gap-3">
                <Flag size={18} className="text-tier-gold mt-0.5" />
                <div>
                  <div className="text-xs text-tier-text-tertiary mb-0.5">Format</div>
                  <div className="text-[15px] font-medium text-tier-navy">{tournament.format}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users size={18} className="text-tier-gold mt-0.5" />
              <div>
                <div className="text-xs text-tier-text-tertiary mb-0.5">Participants</div>
                <div className="text-[15px] font-medium text-tier-navy">
                  {tournament.currentParticipants ?? 0} / {tournament.maxParticipants ?? '∞'}
                </div>
              </div>
            </div>
          </div>

          {/* Category recommendation */}
          <div className="bg-tier-surface-subtle rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-tier-text-tertiary" />
              <span className="text-[13px] font-semibold text-tier-text-secondary">
                Recommended level
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span
                className={`inline-block self-start text-[13px] font-semibold px-3 py-1.5 rounded ${
                  isRecommended
                    ? 'bg-tier-gold/10 text-tier-gold border border-tier-gold/30'
                    : 'bg-tier-surface-subtle text-tier-text-secondary border border-tier-border-default'
                }`}
              >
                {CATEGORY_LABELS[tournament.recommendedCategory]}
              </span>
              <p className="text-sm text-tier-navy m-0 leading-relaxed">
                {tournament.recommendedLevelLabel}
              </p>
              {playerCategory && !isRecommended && (
                <p className="text-[13px] text-tier-text-secondary m-0 italic leading-relaxed">
                  You are in {CATEGORY_LABELS[playerCategory]}. This tournament
                  may be more challenging or less suitable for your level.
                </p>
              )}
            </div>
          </div>

          {/* Tour info */}
          <div className="flex justify-between items-center py-3 border-b border-tier-border-subtle mb-3">
            <div className="text-[13px] text-tier-text-secondary">Series</div>
            <div className="text-sm font-medium text-tier-navy">{TOUR_LABELS[tournament.tour]}</div>
          </div>

          {/* Fee */}
          <div className="bg-tier-surface-subtle rounded-lg p-4 mb-4">
            <div className="text-xs text-tier-text-secondary mb-1">Entry fee</div>
            <div className="text-2xl font-bold text-tier-navy">
              {tournament.entryFee === 0 ? 'Free' : `${tournament.entryFee} kr`}
            </div>
          </div>

          {/* Result (for completed tournaments) */}
          {hasResult && (
            <div className="bg-tier-gold/10 rounded-lg p-4 border-l-[3px] border-l-tier-gold">
              <div className="text-[13px] font-semibold text-tier-gold mb-2">Your result</div>
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold text-tier-navy">
                  {tournament.result!.position}. place
                </div>
                <div className="text-sm text-tier-text-secondary">
                  <span>Score: {tournament.result!.score}</span>
                  {tournament.result!.scoreToPar !== undefined && (
                    <span>
                      ({tournament.result!.scoreToPar > 0 ? '+' : ''}
                      {tournament.result!.scoreToPar})
                    </span>
                  )}
                  <span> · {tournament.result!.field} participants</span>
                </div>
                {tournament.result!.rounds && (
                  <div className="text-[13px] text-tier-text-tertiary mt-1">
                    Rounds: {tournament.result!.rounds.join(' - ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-tier-border-subtle bg-white">
          {/* Primary action row */}
          <div className="flex gap-3 mb-4">
            {showRegisterButton && (
              <Button
                variant="primary"
                leftIcon={<ExternalLink size={18} />}
                onClick={() => onRegister(tournament)}
                className="flex-1"
              >
                Register
              </Button>
            )}

            {isRegistered && (
              <div className="flex items-center justify-center gap-2 flex-1 p-3 rounded-lg bg-green-100 text-green-600 text-[15px] font-semibold">
                <CheckCircle size={18} />
                You are registered
              </div>
            )}

            {!isRegistered && tournament.status !== 'open' && isUpcoming && (
              <Button
                variant="ghost"
                onClick={handleMarkRegistered}
                className="flex-1"
              >
                Mark as registered
              </Button>
            )}

            <Button
              variant="ghost"
              leftIcon={<CalendarPlus size={18} />}
              onClick={() => onAddToCalendar(tournament)}
              className="flex-1"
            >
              Add to calendar
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-2 flex-wrap">
            {tournament.hotelUrl && (
              <button
                onClick={() => window.open(tournament.hotelUrl, '_blank')}
                className="flex items-center gap-1.5 px-3 py-2 rounded border border-tier-border-default bg-white text-[13px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-tier-surface-subtle"
              >
                <Hotel size={16} />
                Book hotel
              </button>
            )}

            <button
              onClick={handleAbsenceApplication}
              className="flex items-center gap-1.5 px-3 py-2 rounded border border-tier-border-default bg-white text-[13px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-tier-surface-subtle"
            >
              <FileText size={16} />
              Request sports absence
            </button>

            {tournament.resultsUrl && (
              <button
                onClick={() => window.open(tournament.resultsUrl, '_blank')}
                className="flex items-center gap-1.5 px-3 py-2 rounded border border-tier-border-default bg-white text-[13px] font-medium text-tier-navy cursor-pointer transition-all duration-200 hover:bg-tier-surface-subtle"
              >
                <ExternalLink size={16} />
                View results
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
