/**
 * TIER Golf - Tournament Planner Page (PLANLEGGER)
 *
 * Subsection "MIN TURNERINGSPLAN" for planning tournament participation.
 * Allows players to plan their tournament season with coach guidance.
 *
 * Design System: TIER Golf Premium Light
 * - Semantic tokens only (no raw hex)
 * - Gold reserved for earned achievements only
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Download,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import {
  Tournament,
  TournamentPurpose,
  CATEGORY_LABELS,
  PURPOSE_LABELS,
  PURPOSE_DESCRIPTIONS,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface PlannedTournament {
  tournament: Tournament;
  purpose: TournamentPurpose;
  notes?: string;
  addedAt: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOCAL_STORAGE_KEY = 'tier_golf_tournament_plan';

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

function getMonthName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Purpose selector for a planned tournament
 */
function PurposeSelector({
  value,
  onChange,
}: {
  value: TournamentPurpose;
  onChange: (purpose: TournamentPurpose) => void;
}) {
  const purposes: TournamentPurpose[] = ['RESULTAT', 'UTVIKLING', 'TRENING'];

  return (
    <div className="flex gap-2">
      {purposes.map(purpose => (
        <button
          key={purpose}
          onClick={() => onChange(purpose)}
          className={`flex-1 px-3 py-2 rounded border text-[13px] font-medium cursor-pointer transition-all duration-200 ${
            value === purpose
              ? 'bg-tier-gold border-tier-gold text-white'
              : 'bg-tier-surface-subtle border-tier-border-default text-tier-navy hover:bg-white'
          }`}
          title={PURPOSE_DESCRIPTIONS[purpose]}
        >
          {PURPOSE_LABELS[purpose]}
        </button>
      ))}
    </div>
  );
}

/**
 * Planned tournament card
 */
function PlannedTournamentCard({
  planned,
  onRemove,
  onUpdatePurpose,
  onUpdateNotes,
}: {
  planned: PlannedTournament;
  onRemove: () => void;
  onUpdatePurpose: (purpose: TournamentPurpose) => void;
  onUpdateNotes: (notes: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(planned.notes || '');
  const { tournament } = planned;

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-tier-border-default overflow-hidden">
      <div className="flex justify-between items-start p-4 border-b border-tier-border-subtle">
        <div className="flex-1">
          <SubSectionTitle>{tournament.name}</SubSectionTitle>
          <div className="flex flex-wrap gap-4 mt-2 text-[13px] text-tier-text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {tournament.venue}, {tournament.city}
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 border-none bg-transparent text-tier-text-tertiary cursor-pointer rounded hover:text-red-500"
          title="Remove from plan"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-tier-text-secondary">Tournament purpose:</label>
          <PurposeSelector
            value={planned.purpose}
            onChange={onUpdatePurpose}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-tier-text-secondary">Notes:</label>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 border-none bg-transparent text-tier-text-tertiary cursor-pointer rounded hover:text-tier-navy"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about goals, preparations..."
                className="p-3 rounded-lg border border-tier-border-default text-sm font-inherit resize-y min-h-[60px] outline-none focus:border-tier-gold"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setNotes(planned.notes || '');
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded border border-tier-border-default bg-transparent text-xs text-tier-text-secondary cursor-pointer hover:bg-tier-surface-subtle"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center gap-1 px-3 py-1.5 rounded border-none bg-tier-gold text-xs text-white cursor-pointer hover:bg-tier-gold/90"
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-tier-text-secondary m-0 italic">
              {planned.notes || 'No notes added'}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-tier-border-subtle bg-tier-surface-subtle">
        <Badge variant="neutral" size="sm">
          {CATEGORY_LABELS[tournament.recommendedCategory]}
        </Badge>
        <span className="text-[11px] text-tier-text-tertiary">
          Added {new Date(planned.addedAt).toLocaleDateString('en-US')}
        </span>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyPlan({ onBrowse }: { onBrowse: () => void }) {
  return (
    <StateCard
      variant="empty"
      icon={Calendar}
      title="No tournaments planned"
      description="Start by adding tournaments from the tournament calendar"
      action={
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={onBrowse}>
          Browse tournaments
        </Button>
      }
    />
  );
}

/**
 * Plan summary stats
 */
function PlanSummary({ planned }: { planned: PlannedTournament[] }) {
  const stats = useMemo(() => {
    const resultat = planned.filter(p => p.purpose === 'RESULTAT').length;
    const utvikling = planned.filter(p => p.purpose === 'UTVIKLING').length;
    const trening = planned.filter(p => p.purpose === 'TRENING').length;

    return { total: planned.length, resultat, utvikling, trening };
  }, [planned]);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3">
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-[28px] font-bold text-tier-navy leading-tight">{stats.total}</div>
        <div className="text-xs text-tier-text-secondary mt-1">Total</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-[28px] font-bold text-tier-gold leading-tight">
          {stats.resultat}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Result</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-[28px] font-bold text-green-600 leading-tight">
          {stats.utvikling}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Development</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-[28px] font-bold text-tier-text-secondary leading-tight">
          {stats.trening}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Training</div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TournamentPlannerPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [plannedTournaments, setPlannedTournaments] = useState<PlannedTournament[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlannedTournaments(parsed);
      } catch (e) {
        console.error('Failed to parse saved tournament plan:', e);
      }
    }
  }, []);

  // Save to localStorage when plan changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannedTournaments));
  }, [plannedTournaments]);

  // Group tournaments by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, PlannedTournament[]> = {};
    plannedTournaments
      .sort((a, b) => new Date(a.tournament.startDate).getTime() - new Date(b.tournament.startDate).getTime())
      .forEach(planned => {
        const monthKey = getMonthName(planned.tournament.startDate);
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(planned);
      });
    return groups;
  }, [plannedTournaments]);

  // Handlers
  const handleRemove = (tournamentId: string) => {
    setPlannedTournaments(prev =>
      prev.filter(p => p.tournament.id !== tournamentId)
    );
  };

  const handleUpdatePurpose = (tournamentId: string, purpose: TournamentPurpose) => {
    setPlannedTournaments(prev =>
      prev.map(p =>
        p.tournament.id === tournamentId ? { ...p, purpose } : p
      )
    );
  };

  const handleUpdateNotes = (tournamentId: string, notes: string) => {
    setPlannedTournaments(prev =>
      prev.map(p =>
        p.tournament.id === tournamentId ? { ...p, notes } : p
      )
    );
  };

  const handleBrowse = () => {
    navigate('/turneringskalender');
  };

  const handleExport = () => {
    // Create a simple text export
    const lines = [
      'MY TOURNAMENT PLAN',
      '==================',
      '',
      ...plannedTournaments.map(p => {
        const t = p.tournament;
        return [
          `${t.name}`,
          `  Date: ${formatDateRange(t.startDate, t.endDate)}`,
          `  Location: ${t.venue}, ${t.city}`,
          `  Purpose: ${PURPOSE_LABELS[p.purpose]}`,
          p.notes ? `  Notes: ${p.notes}` : '',
          '',
        ].filter(Boolean).join('\n');
      }),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-tournament-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (plannedTournaments.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <SectionTitle>My tournament plan</SectionTitle>
            <p className="text-sm text-tier-text-secondary mt-1 m-0">
              Plan your tournament season with purpose for each tournament
            </p>
          </div>
        </div>
        <EmptyPlan onBrowse={handleBrowse} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <SectionTitle>My tournament plan</SectionTitle>
          <p className="text-sm text-tier-text-secondary mt-1 m-0">
            Plan your tournament season with purpose for each tournament
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download size={16} />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleBrowse}
          >
            Add tournament
          </Button>
        </div>
      </div>

      <PlanSummary planned={plannedTournaments} />

      {Object.entries(groupedByMonth).map(([month, tournaments]) => (
        <section key={month} className="mt-4">
          <SectionTitle className="text-base font-semibold text-tier-navy m-0 mb-3 capitalize">{month}</SectionTitle>
          <div className="flex flex-col gap-4">
            {tournaments.map(planned => (
              <PlannedTournamentCard
                key={planned.tournament.id}
                planned={planned}
                onRemove={() => handleRemove(planned.tournament.id)}
                onUpdatePurpose={purpose =>
                  handleUpdatePurpose(planned.tournament.id, purpose)
                }
                onUpdateNotes={notes =>
                  handleUpdateNotes(planned.tournament.id, notes)
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

