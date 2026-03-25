/**
 * CalendarHeader - Tournament Statistics Header
 * Design System v3.1 - Tailwind CSS
 *
 * Displays key tournament statistics: upcoming, registered, podiums, played this year.
 */

import React from 'react';
import { TournamentStats } from '../types';

interface CalendarHeaderProps {
  stats: TournamentStats;
}

export default function CalendarHeader({ stats }: CalendarHeaderProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-2xl font-bold text-tier-navy leading-tight">
          {stats.upcoming}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Upcoming</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-2xl font-bold text-green-600 leading-tight">
          {stats.registered}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Registered</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-2xl font-bold text-tier-gold leading-tight">
          {stats.podiums}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Podiums</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border border-tier-border-subtle">
        <div className="text-2xl font-bold text-tier-navy leading-tight">
          {stats.playedThisYear}
        </div>
        <div className="text-xs text-tier-text-secondary mt-1">Played this year</div>
      </div>
    </div>
  );
}
