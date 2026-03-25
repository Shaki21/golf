/**
 * TournamentList - Tournament Grid and Past Results List
 * Design System v3.1 - Tailwind CSS
 *
 * Renders upcoming tournaments grouped by month in a responsive grid
 * and past tournaments with results in a compact list.
 */

import React, { useMemo } from 'react';
import { Trophy, Medal, Calendar } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../../components/typography';
import StateCard from '../../../ui/composites/StateCard';
import { Tournament, PlayerCategory } from '../types';
import TournamentCard from './TournamentCard';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function getMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Group tournaments by month
function groupByMonth(tournaments: Tournament[]): Map<string, { label: string; tournaments: Tournament[] }> {
  const groups = new Map<string, { label: string; tournaments: Tournament[] }>();

  tournaments.forEach(tournament => {
    const key = getMonthKey(tournament.startDate);
    const label = getMonthYear(tournament.startDate);

    if (!groups.has(key)) {
      groups.set(key, { label, tournaments: [] });
    }
    groups.get(key)!.tournaments.push(tournament);
  });

  return groups;
}

// ============================================================================
// PAST TOURNAMENT CARD
// ============================================================================

interface PastTournamentCardProps {
  tournament: Tournament;
}

function PastTournamentCard({ tournament }: PastTournamentCardProps) {
  if (!tournament.result) return null;

  const isTopThree = tournament.result.position <= 3;

  return (
    <div className="bg-white rounded-lg p-4 flex items-center gap-4 border border-tier-border-subtle">
      <div className="w-10 h-10 rounded bg-tier-surface-subtle flex items-center justify-center">
        {isTopThree ? (
          <Medal size={20} className="text-tier-gold" />
        ) : (
          <span className="text-base font-semibold text-tier-navy">
            {tournament.result.position}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-tier-navy">{tournament.name}</div>
        <div className="text-xs text-tier-text-secondary mt-0.5">
          {formatDate(tournament.startDate)} · {tournament.venue}
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-semibold text-tier-navy">
          {tournament.result.position}. place
        </div>
        <div className="text-xs text-tier-text-secondary">
          Score: {tournament.result.score} · {tournament.result.field} participants
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TournamentListProps {
  upcoming: Tournament[];
  past: Tournament[];
  playerCategory?: PlayerCategory;
  onSelect: (t: Tournament) => void;
  onRegister: (t: Tournament) => void;
  onAddToCalendar: (t: Tournament) => void;
  onPlanTournament: (t: Tournament) => void;
  onAbsenceRequest?: (t: Tournament) => void;
}

export default function TournamentList({
  upcoming,
  past,
  playerCategory,
  onSelect,
  onRegister,
  onAddToCalendar,
  onPlanTournament,
  onAbsenceRequest,
}: TournamentListProps) {
  // Group upcoming tournaments by month
  const upcomingByMonth = useMemo(() => {
    if (upcoming.length === 0) return [];

    const groups = groupByMonth(upcoming);
    // Convert Map to array and sort by month key
    return Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => ({
        key,
        label: data.label.charAt(0).toUpperCase() + data.label.slice(1),
        tournaments: data.tournaments,
      }));
  }, [upcoming]);

  return (
    <>
      {/* Upcoming Tournaments */}
      <section className="mt-4">
        <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
          Upcoming tournaments
        </SectionTitle>

        {upcoming.length === 0 ? (
          <StateCard
            variant="empty"
            icon={Trophy}
            title="No upcoming tournaments"
            description="Try changing filters or search criteria"
          />
        ) : (
          <div className="flex flex-col gap-6">
            {upcomingByMonth.map(monthGroup => (
              <div key={monthGroup.key} className="flex flex-col gap-3">
                <SubSectionTitle className="flex items-center text-[15px] font-semibold text-tier-navy m-0 py-2 border-b border-tier-border-subtle">
                  <Calendar size={16} className="mr-2 opacity-70" />
                  {monthGroup.label}
                  <span className="text-[13px] font-medium text-tier-text-tertiary ml-2">
                    ({monthGroup.tournaments.length})
                  </span>
                </SubSectionTitle>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
                  {monthGroup.tournaments.map(tournament => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      playerCategory={playerCategory}
                      onSelect={onSelect}
                      onRegister={onRegister}
                      onAddToCalendar={onAddToCalendar}
                      onPlanTournament={onPlanTournament}
                      onAbsenceRequest={onAbsenceRequest}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Tournaments */}
      {past.length > 0 && (
        <section className="mt-4">
          <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
            Previous results
          </SectionTitle>
          <div className="flex flex-col gap-2">
            {past.map(tournament => (
              <PastTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
