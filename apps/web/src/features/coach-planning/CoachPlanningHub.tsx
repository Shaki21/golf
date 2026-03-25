/**
 * CoachPlanningHub.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * Phase 4 Extended Sprint 4.6: Collapsible filters with tier branding
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList,
  Search,
  Users,
  User,
  ChevronRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { coachesAPI } from '../../services/api';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from "../../ui/components/typography";
import { HubPageSkeleton } from '../../components/skeletons';
import { CollapsibleFilterDrawer, FilterControl } from '../../components/filters/CollapsibleFilterDrawer';
import { useUrlFilters } from '../../hooks/useUrlFilters';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const CATEGORY_CLASSES = {
  A: { bg: 'bg-tier-success/15', text: 'text-tier-success' },
  B: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' },
  C: { bg: 'bg-tier-warning/15', text: 'text-tier-warning' },
};

interface Player {
  id: string;
  name: string;
  category: 'A' | 'B' | 'C';
  hcp: number;
  hasActivePlan: boolean;
  planUpdated?: string;
  nextSession?: string;
  weeksInPlan?: number;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  hasGroupPlan: boolean;
  planUpdated?: string;
}

export const CoachPlanningHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'players' | 'groups'>('players');
  const [searchQuery, setSearchQuery] = useState('');

  // URL-persisted filters (Sprint 4.6)
  const { filters, setFilter, clearFilters } = useUrlFilters({ plan: 'all' });
  const filterPlan = filters.plan as 'all' | 'with' | 'without';

  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Count active filters for badge
  const activeFilterCount = filterPlan !== 'all' ? 1 : 0;

  // Fetch players and groups from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch coach's players with their plan status
      const playersRes = await coachesAPI.getAthletes();
      const playersData = playersRes.data?.data || playersRes.data || [];

      if (Array.isArray(playersData)) {
        const mappedPlayers: Player[] = playersData.map((p: any) => ({
          id: p.id,
          name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Player',
          category: p.category || 'C',
          hcp: p.handicap ? Number(p.handicap) : 54,
          hasActivePlan: !!p.hasActivePlan || !!p.trainingPlan,
          planUpdated: p.planUpdated || p.trainingPlan?.updatedAt,
          nextSession: p.nextSession,
          weeksInPlan: p.weeksInPlan || p.trainingPlan?.weeks || 0,
        }));
        setPlayers(mappedPlayers);
      }

      // Groups feature is planned but not yet implemented
      // Show empty state until groups API is available
      setGroups([]);
    } catch (err) {
      console.error('Error fetching planning data:', err);
      setError('Could not load players');
      toast.error('Kunne ikke laste spillere. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPlayers = useMemo(() => {
    let filtered = [...players];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPlan === 'with') {
      filtered = filtered.filter(p => p.hasActivePlan);
    } else if (filterPlan === 'without') {
      filtered = filtered.filter(p => !p.hasActivePlan);
    }

    return filtered;
  }, [players, searchQuery, filterPlan]);

  const filteredGroups = useMemo(() => {
    let filtered = [...groups];

    if (searchQuery) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPlan === 'with') {
      filtered = filtered.filter(g => g.hasGroupPlan);
    } else if (filterPlan === 'without') {
      filtered = filtered.filter(g => !g.hasGroupPlan);
    }

    return filtered;
  }, [groups, searchQuery, filterPlan]);

  const stats = useMemo(() => ({
    playersWithPlan: players.filter(p => p.hasActivePlan).length,
    playersWithoutPlan: players.filter(p => !p.hasActivePlan).length,
    groupsWithPlan: groups.filter(g => g.hasGroupPlan).length,
    groupsWithoutPlan: groups.filter(g => !g.hasGroupPlan).length
  }), [players, groups]);

  const getCategoryClasses = (category: string) => {
    return CATEGORY_CLASSES[category as keyof typeof CATEGORY_CLASSES] || { bg: 'bg-tier-white', text: 'text-tier-text-secondary' };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return <HubPageSkeleton />;
  }

  return (
    <div className="bg-tier-surface-base min-h-screen">
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="Training Planner"
        subtitle="Select a player or group to create/edit a training plan"
        helpText="Your planning overview for players, groups, and training programs. Keep track of all your activities."
        actions={
          <Button
            variant="secondary"
            leftIcon={<FileText size={18} />}
            onClick={() => navigate('/coach/exercises/templates')}
          >
            Templates
          </Button>
        }
      />

      <div className="px-6 pb-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-tier-success" />
            <span className="text-xs text-tier-text-secondary">Players with plan</span>
          </div>
          <p className="text-2xl font-bold text-tier-success m-0">
            {stats.playersWithPlan}
          </p>
        </div>
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-tier-warning" />
            <span className="text-xs text-tier-text-secondary">Missing plan</span>
          </div>
          <p className="text-2xl font-bold text-tier-warning m-0">
            {stats.playersWithoutPlan}
          </p>
        </div>
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-tier-success" />
            <span className="text-xs text-tier-text-secondary">Groups with plan</span>
          </div>
          <p className="text-2xl font-bold text-tier-success m-0">
            {stats.groupsWithPlan}
          </p>
        </div>
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-tier-error" />
            <span className="text-xs text-tier-text-secondary">Groups without plan</span>
          </div>
          <p className="text-2xl font-bold text-tier-error m-0">
            {stats.groupsWithoutPlan}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-tier-surface-base rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('players')}
          className={`py-2.5 px-5 rounded-lg border-none text-sm font-medium cursor-pointer flex items-center gap-2 transition-all ${
            activeTab === 'players'
              ? 'bg-tier-white text-tier-navy shadow-sm'
              : 'bg-transparent text-tier-text-secondary'
          }`}
        >
          <User size={16} />
          Players ({players.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`py-2.5 px-5 rounded-lg border-none text-sm font-medium cursor-pointer flex items-center gap-2 transition-all ${
            activeTab === 'groups'
              ? 'bg-tier-white text-tier-navy shadow-sm'
              : 'bg-transparent text-tier-text-secondary'
          }`}
        >
          <Users size={16} />
          Groups ({groups.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[400px] mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
        />
        <input
          type="text"
          placeholder={activeTab === 'players' ? 'Search for player...' : 'Search for group...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-3 pl-10 pr-3 rounded-[10px] border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy"
        />
      </div>

      {/* Collapsible Filters */}
      <CollapsibleFilterDrawer
        activeFilterCount={activeFilterCount}
        onClearAll={clearFilters}
      >
        <FilterControl label="Plan Status">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'with', label: 'With plan' },
              { key: 'without', label: 'Without plan' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setFilter('plan', option.key)}
                className={`py-2.5 px-4 rounded-[10px] border-none text-[13px] font-medium cursor-pointer transition-colors ${
                  filterPlan === option.key
                    ? 'bg-tier-navy text-white'
                    : 'bg-tier-white text-tier-text-secondary hover:bg-tier-surface-base border border-tier-border-default'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterControl>
      </CollapsibleFilterDrawer>

      {/* Content */}
      {activeTab === 'players' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {filteredPlayers.map(player => {
            const catClasses = getCategoryClasses(player.category);
            return (
              <div
                key={player.id}
                onClick={() => navigate(`/coach/athletes/${player.id}/plan`)}
                className="bg-tier-white rounded-xl p-4 border border-tier-border-default cursor-pointer transition-all hover:shadow-md flex items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border-2 ${
                  player.hasActivePlan
                    ? 'bg-tier-success/15 border-tier-success text-tier-success'
                    : 'bg-tier-warning/15 border-tier-warning text-tier-warning'
                }`}>
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
                      {player.name}
                    </SubSectionTitle>
                    <span className={`text-[10px] font-semibold py-0.5 px-1.5 rounded ${catClasses.bg} ${catClasses.text}`}>
                      {player.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-tier-text-secondary">
                      HCP {player.hcp}
                    </span>
                    {player.hasActivePlan ? (
                      <>
                        <span className="text-[11px] text-tier-success flex items-center gap-1">
                          <CheckCircle size={12} />
                          {player.weeksInPlan}w plan
                        </span>
                        {player.planUpdated && (
                          <span className="text-[11px] text-tier-text-secondary">
                            Updated {formatDate(player.planUpdated)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] text-tier-warning font-medium">
                        No active plan
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-tier-text-secondary" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              onClick={() => navigate(`/coach/groups/${group.id}/plan`)}
              className="bg-tier-white rounded-xl p-4 border border-tier-border-default cursor-pointer transition-all hover:shadow-md flex items-center gap-3"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                group.hasGroupPlan
                  ? 'bg-tier-success/15 border-tier-success'
                  : 'bg-tier-warning/15 border-tier-warning'
              }`}>
                <Users size={20} className={group.hasGroupPlan ? 'text-tier-success' : 'text-tier-warning'} />
              </div>
              <div className="flex-1">
                <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0 mb-1">
                  {group.name}
                </SubSectionTitle>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-tier-text-secondary">
                    {group.memberCount} members
                  </span>
                  {group.hasGroupPlan ? (
                    <>
                      <span className="text-[11px] text-tier-success flex items-center gap-1">
                        <CheckCircle size={12} />
                        Active plan
                      </span>
                      {group.planUpdated && (
                        <span className="text-[11px] text-tier-text-secondary">
                          Updated {formatDate(group.planUpdated)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-tier-warning font-medium">
                      No group plan
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-tier-text-secondary" />
            </div>
          ))}
        </div>
      )}

      {((activeTab === 'players' && filteredPlayers.length === 0) ||
        (activeTab === 'groups' && filteredGroups.length === 0)) && (
        <div className="text-center py-16 px-5 bg-tier-white rounded-2xl border border-tier-border-default">
          <ClipboardList size={48} className="text-tier-text-secondary mb-4 mx-auto" />
          <p className="text-base text-tier-text-secondary m-0">
            No {activeTab === 'players' ? 'players' : 'groups'} found
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default CoachPlanningHub;
