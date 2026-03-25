/**
 * TIER Golf - Coach Stats Progress
 * Design System v3.0 - Premium Light
 *
 * Shows players who are making positive progress.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  ArrowUpRight,
  Target,
  Calendar,
  Award,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

interface PlayerProgress {
  id: string;
  name: string;
  avatar?: string;
  category: 'A' | 'B' | 'C';
  currentHcp: number;
  startHcp: number;
  hcpChange: number;
  sessionsThisMonth: number;
  totalSessions: number;
  streak: number;
  lastSession: string;
  improvements: string[];
  goals: {
    current: string;
    progress: number;
  }[];
}

const mockProgressPlayers: PlayerProgress[] = [
  {
    id: '1',
    name: 'Emma Larsen',
    category: 'A',
    currentHcp: 4.2,
    startHcp: 6.8,
    hcpChange: -2.6,
    sessionsThisMonth: 8,
    totalSessions: 45,
    streak: 12,
    lastSession: '2025-01-18',
    improvements: ['Driver consistency', 'Putting under pressure', 'Course management'],
    goals: [
      { current: 'Reach HCP 3.0', progress: 75 },
      { current: 'Win club championship', progress: 60 }
    ]
  },
  {
    id: '2',
    name: 'Thomas Berg',
    category: 'B',
    currentHcp: 12.4,
    startHcp: 18.2,
    hcpChange: -5.8,
    sessionsThisMonth: 6,
    totalSessions: 32,
    streak: 8,
    lastSession: '2025-01-17',
    improvements: ['Iron play', 'Bunker shots', 'Approach'],
    goals: [
      { current: 'Reach HCP 10.0', progress: 80 },
      { current: 'Play under 80', progress: 45 }
    ]
  },
  {
    id: '3',
    name: 'Sofie Andersen',
    category: 'A',
    currentHcp: 2.8,
    startHcp: 4.5,
    hcpChange: -1.7,
    sessionsThisMonth: 10,
    totalSessions: 62,
    streak: 15,
    lastSession: '2025-01-19',
    improvements: ['Wedge play', 'Mental game', 'Scrambling'],
    goals: [
      { current: 'Qualify for nationals', progress: 90 },
      { current: 'Plus handicap', progress: 65 }
    ]
  },
  {
    id: '4',
    name: 'Andreas Nilsen',
    category: 'B',
    currentHcp: 14.8,
    startHcp: 22.0,
    hcpChange: -7.2,
    sessionsThisMonth: 5,
    totalSessions: 28,
    streak: 5,
    lastSession: '2025-01-16',
    improvements: ['Swing technique', 'Distance control'],
    goals: [
      { current: 'Play consistently under 90', progress: 70 }
    ]
  },
  {
    id: '5',
    name: 'Mia Kristiansen',
    category: 'C',
    currentHcp: 28.5,
    startHcp: 36.0,
    hcpChange: -7.5,
    sessionsThisMonth: 4,
    totalSessions: 18,
    streak: 4,
    lastSession: '2025-01-15',
    improvements: ['Basic swing', 'Putting fundamentals'],
    goals: [
      { current: 'Reach HCP 25.0', progress: 60 }
    ]
  },
  {
    id: '6',
    name: 'Erik Hansen',
    category: 'A',
    currentHcp: 5.5,
    startHcp: 7.2,
    hcpChange: -1.7,
    sessionsThisMonth: 7,
    totalSessions: 40,
    streak: 10,
    lastSession: '2025-01-18',
    improvements: ['Driver', 'Long irons', 'Course strategy'],
    goals: [
      { current: 'Reach HCP 4.0', progress: 55 },
      { current: 'Compete in regionals', progress: 80 }
    ]
  }
];

export const CoachStatsProgress: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hcpChange' | 'streak' | 'sessions'>('hcpChange');

  const filteredAndSortedPlayers = useMemo(() => {
    let players = [...mockProgressPlayers];

    if (searchQuery) {
      players = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    players.sort((a, b) => {
      switch (sortBy) {
        case 'hcpChange':
          return a.hcpChange - b.hcpChange; // Most negative first
        case 'streak':
          return b.streak - a.streak;
        case 'sessions':
          return b.sessionsThisMonth - a.sessionsThisMonth;
        default:
          return 0;
      }
    });

    return players;
  }, [searchQuery, sortBy]);

  const topPerformers = useMemo(() => {
    return [...mockProgressPlayers]
      .sort((a, b) => a.hcpChange - b.hcpChange)
      .slice(0, 3);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'A': return { bg: 'bg-tier-success/10', text: 'text-tier-success' };
      case 'B': return { bg: 'bg-tier-navy/10', text: 'text-tier-navy' };
      case 'C': return { bg: 'bg-tier-warning/10', text: 'text-tier-warning' };
      default: return { bg: 'bg-tier-white', text: 'text-tier-text-secondary' };
    }
  };

  return (
    <div className="p-6 bg-tier-white min-h-screen">
      {/* Header with icon */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tier-navy to-tier-navy/80 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <PageHeader
            title="Players Progressing"
            subtitle={`${filteredAndSortedPlayers.length} players showing positive development`}
            helpText="Overview of players showing positive development in handicap, training frequency or goal achievement. See monthly stars, improvements and active progress tracking."
            divider={false}
          />
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-tier-white rounded-2xl p-5 mb-6 border border-tier-border-default">
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-tier-navy" />
          <SectionTitle className="m-0">
            Stars of the Month
          </SectionTitle>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {topPerformers.map((player, index) => {
            // Define colors for gold, silver, bronze
            const medalColors = [
              { bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500', star: true }, // Gold
              { bg: 'bg-gray-300/15', border: 'border-gray-400/40', badge: 'bg-gray-400', star: false }, // Silver
              { bg: 'bg-orange-600/10', border: 'border-orange-700/30', badge: 'bg-orange-700', star: false }, // Bronze
            ];
            const colors = medalColors[index] || { bg: 'bg-tier-surface-base', border: 'border-tier-border-default', badge: '', star: false };

            return (
              <div key={player.id} className={`rounded-xl p-4 relative ${colors.bg} border-2 ${colors.border}`}>
                {colors.star && (
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full ${colors.badge} flex items-center justify-center`}>
                    <Star size={14} className="text-white" fill="white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-tier-navy/15 flex items-center justify-center text-base font-semibold text-tier-navy">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-tier-navy m-0 text-center">
                      {player.name}
                    </p>
                    <span className={`text-[11px] font-medium py-0.5 px-1.5 rounded ${getCategoryClasses(player.category).bg} ${getCategoryClasses(player.category).text}`}>
                      Category {player.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-tier-success/15 rounded-lg">
                  <span className="text-xs text-tier-text-secondary text-center">
                    HCP change
                  </span>
                  <span className="text-lg font-bold text-tier-success text-center">
                    {player.hcpChange}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search for player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pr-3 pl-10 rounded-[10px] border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'hcpChange', label: 'HCP improvement' },
            { key: 'streak', label: 'Training streak' },
            { key: 'sessions', label: 'Sessions this month' }
          ].map(option => (
            <Button
              key={option.key}
              variant={sortBy === option.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSortBy(option.key as typeof sortBy)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="flex flex-col gap-3">
        {filteredAndSortedPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-tier-white rounded-2xl p-5 border border-tier-border-default cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start">
              {/* Left side - Player info */}
              <div className="flex gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-tier-navy/15 flex items-center justify-center text-xl font-semibold text-tier-navy">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SubSectionTitle className="m-0">
                      {player.name}
                    </SubSectionTitle>
                    <span className={`text-[11px] font-medium py-0.5 px-2 rounded ${getCategoryClasses(player.category).bg} ${getCategoryClasses(player.category).text}`}>
                      Kat. {player.category}
                    </span>
                    {player.streak >= 10 && (
                      <span className="text-[11px] font-medium py-0.5 px-2 rounded bg-amber-500/15 text-amber-600 flex items-center gap-1">
                        <Zap size={10} />
                        {player.streak} week streak
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-5 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Target size={14} className="text-tier-text-tertiary" />
                      <span className="text-[13px] text-tier-text-secondary">
                        HCP: {player.currentHcp} (fra {player.startHcp})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-tier-text-tertiary" />
                      <span className="text-[13px] text-tier-text-secondary">
                        {player.sessionsThisMonth} sessions this month
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-tier-text-tertiary">
                        Last: {formatDate(player.lastSession)}
                      </span>
                    </div>
                  </div>

                  {/* Improvements */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {player.improvements.map((imp, idx) => (
                      <span key={idx} className="text-[11px] py-1 px-2.5 rounded-md bg-tier-success/15 text-tier-success font-medium">
                        {imp}
                      </span>
                    ))}
                  </div>

                  {/* Goals progress */}
                  <div className="flex gap-3 flex-wrap">
                    {player.goals.map((goal, idx) => (
                      <div key={idx} className="flex-1 min-w-[150px] max-w-[250px]">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-tier-text-secondary">
                            {goal.current}
                          </span>
                          <span className="text-xs font-medium text-tier-navy">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-tier-border-default rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-tier-navy rounded-sm transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - HCP change */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 py-2 px-4 bg-tier-success/15 rounded-[10px]">
                  <ArrowUpRight size={18} className="text-tier-success" />
                  <span className="text-xl font-bold text-tier-success">
                    {player.hcpChange}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  View details
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedPlayers.length === 0 && (
        <StateCard
          variant="empty"
          title="No players found"
          description="Try adjusting the search to see more players."
        />
      )}
    </div>
  );
};

export default CoachStatsProgress;
