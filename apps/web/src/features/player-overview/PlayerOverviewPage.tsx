/**
 * Player Overview Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PURPOSE: Display coach's assigned players
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Which of my players need attention?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with player status summary
 * Layer 2 (40%) — Control & Progress: Player list with status
 * Layer 3 (30%) — Operations & Admin: Quick actions
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import {
  Users,
  UserCheck,
  UserX,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Player {
  id: string;
  name: string;
  category: string;
  handicap: number | null;
  status: string;
}

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

function computePlayersState(players: Player[]): PrimaryAction {
  // No players
  if (players.length === 0) {
    return {
      headline: 'No players assigned yet',
      subtext: 'Add players to start tracking their progress',
      ctaLabel: 'Add Player',
      ctaHref: '/coach/athletes/add',
      urgency: 'medium',
    };
  }

  const inactivePlayers = players.filter(p => p.status !== 'active');

  // Inactive players
  if (inactivePlayers.length > 0) {
    return {
      headline: `${inactivePlayers.length} player${inactivePlayers.length > 1 ? 's' : ''} need${inactivePlayers.length === 1 ? 's' : ''} attention`,
      subtext: 'Some players are inactive or need follow-up',
      ctaLabel: 'Review Players',
      ctaHref: '/coach/athletes',
      urgency: 'high',
    };
  }

  // All good
  return {
    headline: `${players.length} active player${players.length > 1 ? 's' : ''}`,
    subtext: 'All players are on track',
    ctaLabel: 'View All Players',
    ctaHref: '/coach/athletes',
    urgency: 'low',
  };
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface PlayersHeroCardProps {
  action: PrimaryAction;
  totalPlayers: number;
  activePlayers: number;
}

function PlayersHeroDecisionCard({ action, totalPlayers, activePlayers }: PlayersHeroCardProps) {
  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Stats Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          Your players
        </h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          <UserCheck size={14} />
          {activePlayers}/{totalPlayers} active
        </span>
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <Users size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/coach/athletes/add"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default bg-white text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Plus size={16} />
          Add Player
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// PLAYER LIST CARD
// =============================================================================

interface PlayerListCardProps {
  players: Player[];
}

function PlayerListCard({ players }: PlayerListCardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Players ({players.length})
        </h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-sm border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-gold/50"
          />
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="p-8 text-center">
          <Users size={32} className="mx-auto mb-2 text-tier-text-tertiary opacity-50" />
          <p className="text-tier-text-secondary">
            {searchTerm ? 'No players match your search' : 'No players assigned yet'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-tier-border-subtle">
          {filteredPlayers.map((player) => (
            <Link
              key={player.id}
              to={`/coach/athletes/${player.id}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-tier-surface-subtle transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-tier-navy/10 flex items-center justify-center text-tier-navy font-semibold">
                {player.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark truncate">
                  {player.name}
                </div>
                <div className="text-xs text-tier-text-secondary">
                  Category {player.category} • HCP {player.handicap ?? '-'}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  player.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {player.status === 'active' ? 'Active' : player.status}
              </span>
              <ChevronRight size={16} className="text-tier-text-tertiary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// QUICK STATS CARD
// =============================================================================

interface QuickStatsCardProps {
  players: Player[];
}

function QuickStatsCard({ players }: QuickStatsCardProps) {
  const activeCount = players.filter(p => p.status === 'active').length;
  const inactiveCount = players.length - activeCount;

  // Group by category
  const byCategory = players.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(byCategory).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Quick Stats</h3>

      <div className="space-y-4">
        {/* Status breakdown */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
            <UserCheck size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-tier-text-secondary">Active</div>
          </div>
          <div className="text-xl font-bold text-green-600">{activeCount}</div>
        </div>

        {inactiveCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 text-gray-600">
              <UserX size={20} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-tier-text-secondary">Inactive</div>
            </div>
            <div className="text-xl font-bold text-gray-600">{inactiveCount}</div>
          </div>
        )}

        {/* Category breakdown */}
        {categories.length > 0 && (
          <div className="pt-4 border-t border-tier-border-subtle">
            <p className="text-xs text-tier-text-secondary mb-3">By Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-2 py-1 bg-tier-surface-subtle rounded text-xs font-medium text-tier-navy"
                >
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PlayerOverviewPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('/api/v1/coaches/me/players', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch players');
        return r.json();
      })
      .then((data) => {
        setPlayers(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="My Players"
          subtitle="Overview of assigned players"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-white rounded-xl" />
              <div className="h-64 bg-white rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="My Players"
          subtitle="Overview of assigned players"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-tier-navy mb-2">Could not load players</h3>
            <p className="text-tier-text-secondary mb-6">{error}</p>
            <button
              onClick={fetchPlayers}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy/90 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </PageContainer>
      </div>
    );
  }

  const action = computePlayersState(players);
  const activePlayers = players.filter(p => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="My Players"
        subtitle="Overview of assigned players"
        helpText="Complete overview of all players you coach. See name, category (A-K), handicap and status for each player. Click on a player to see detailed profile, training data and progress."
      />

      <PageContainer paddingY="lg" background="base">
        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with player status summary
            ============================================================ */}
        <section className="mb-8" aria-label="Player summary">
          <PlayersHeroDecisionCard
            action={action}
            totalPlayers={players.length}
            activePlayers={activePlayers}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Player list + Quick stats
            ============================================================ */}
        <section className="mb-8" aria-label="Player list">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PlayerListCard players={players} />
            </div>
            <div>
              <QuickStatsCard players={players} />
            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}

export default PlayerOverviewPage;
