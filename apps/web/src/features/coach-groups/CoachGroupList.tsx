/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CoachGroupList.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Overview of all groups the coach administers.
 * Supports WANG Sports Academy, Team Norway, and custom groups.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  ClipboardList,
} from 'lucide-react';
import Modal from '../../ui/composites/Modal.composite';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from "../../ui/components/typography";
import { ListPageSkeleton } from '../../components/skeletons';

interface GroupMember {
  id: string;
  name: string;
  avatarInitials: string;
  category: string;
}

interface CoachGroup {
  id: string;
  name: string;
  description?: string;
  type: 'wang' | 'team_norway' | 'custom';
  avatarColor: string;
  avatarInitials: string;
  memberCount: number;
  members: GroupMember[];
  hasTrainingPlan: boolean;
  nextSession?: string;
  createdAt: string;
}

export default function CoachGroupList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<CoachGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'wang' | 'team_norway' | 'custom'>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<CoachGroup | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v1/coach/groups');
      if (!response.ok) {
        throw new Error(`Failed to load groups: ${response.statusText}`);
      }
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load groups';
      console.error('Failed to fetch groups:', err);
      setError(message);
      toast.error('Could not load groups. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !group.name.toLowerCase().includes(query) &&
          !group.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && group.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [groups, searchQuery, filterType]);

  // Get type badge
  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      wang: { bg: 'rgba(var(--accent-rgb), 0.15)', text: 'var(--accent)', label: 'WANG' },
      team_norway: { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--status-error)', label: 'Team Norway' },
      custom: { bg: 'rgba(var(--text-secondary-rgb), 0.15)', text: 'var(--text-secondary)', label: 'Custom' },
    };
    return styles[type] || styles.custom;
  };

  // Format next session
  const formatNextSession = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  // Delete group - show confirmation modal
  const handleDeleteGroup = (group: CoachGroup) => {
    setActiveMenu(null);
    setGroupToDelete(group);
  };

  // Confirm and execute group deletion
  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await fetch(`/api/v1/coach/groups/${groupToDelete.id}`, { method: 'DELETE' });
      setGroups(groups.filter((g) => g.id !== groupToDelete.id));
      toast.success('Group deleted');
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast.error('Could not delete group. Try again.');
    }
    setGroupToDelete(null);
  };

  // Stats - Actionable metrics (not vanity)
  const totalMembers = new Set(groups.flatMap((g) => g.members.map((m) => m.id))).size;
  const groupsWithoutPlans = groups.filter((g) => !g.hasTrainingPlan).length;
  const inactiveGroups = groups.filter((g) => {
    // Consider a group inactive if it has no recent activity (mock logic)
    // In real implementation, this would check last session date
    return g.members.length === 0;
  }).length;

  if (loading) {
    return <ListPageSkeleton items={6} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center p-6">
        <StateCard
          variant="error"
          title={error}
          action={
            <Button variant="outline" onClick={fetchGroups}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="My groups"
        subtitle={`${groups.length} groups · ${totalMembers} total players`}
        helpText="Manage all your training groups. Create new groups, add members and plan group activities."
        actions={
          <Button
            variant="primary"
            onClick={() => navigate('/coach/groups/create')}
            leftIcon={<Plus size={18} />}
          >
            New group
          </Button>
        }
      />

      <div className="px-6">

        {/* Quick stats - Actionable indicators */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              label: 'Groups needing plans',
              value: groupsWithoutPlans,
              colorClass: groupsWithoutPlans > 0 ? 'text-tier-warning' : 'text-tier-success',
              onClick: () => setSearchQuery(''), // In real app: filter to groups without plans
              actionable: true
            },
            {
              label: 'Inactive groups',
              value: inactiveGroups,
              colorClass: inactiveGroups > 0 ? 'text-tier-error' : 'text-tier-success',
              onClick: () => setSearchQuery(''), // In real app: filter to inactive groups
              actionable: true
            },
            {
              label: 'Total players',
              value: totalMembers,
              colorClass: 'text-tier-navy',
              actionable: false
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-4 bg-tier-white rounded-lg shadow-sm text-center ${stat.actionable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={stat.onClick}
            >
              <p className={`text-2xl font-bold m-0 ${stat.colorClass}`}>
                {stat.value}
              </p>
              <p className="text-xs leading-4 text-tier-text-secondary mt-1 mb-0">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
            />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3 bg-tier-white border border-tier-border-default rounded-lg text-sm outline-none focus:border-tier-navy"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'wang', label: 'WANG' },
              { key: 'team_norway', label: 'Team Norway' },
              { key: 'custom', label: 'Custom' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as 'all' | 'wang' | 'team_norway' | 'custom')}
                className={`py-2 px-3.5 rounded text-[13px] font-medium cursor-pointer whitespace-nowrap ${
                  filterType === filter.key
                    ? 'bg-tier-navy text-white border border-tier-navy'
                    : 'bg-tier-white text-tier-navy border border-tier-border-default'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Groups list */}
      <div className="px-6 pb-6">
        {filteredGroups.length === 0 ? (
          <div className="py-12 px-6 bg-tier-white rounded-xl text-center shadow-sm">
            <Users size={48} className="text-tier-border-default mb-4" />
            <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0 mb-2">
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </p>
            <p className="text-[15px] leading-5 text-tier-text-secondary m-0 mb-5">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first group to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/coach/groups/create')}
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-tier-navy text-white border-none rounded-lg text-sm font-semibold cursor-pointer"
              >
                <Plus size={18} />
                Create group
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredGroups.map((group) => {
              const typeBadge = getTypeBadge(group.type);
              const nextSession = formatNextSession(group.nextSession);

              return (
                <div
                  key={group.id}
                  className="bg-tier-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Main content - clickable */}
                  <div
                    onClick={() => navigate(`/coach/groups/${group.id}`)}
                    className="flex items-center gap-4 p-4 cursor-pointer"
                  >
                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ backgroundColor: group.avatarColor }}
                    >
                      {group.avatarInitials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <SubSectionTitle className="m-0">
                          {group.name}
                        </SubSectionTitle>
                        <span
                          className="py-0.5 px-2 rounded text-[11px] font-semibold"
                          style={{ backgroundColor: typeBadge.bg, color: typeBadge.text }}
                        >
                          {typeBadge.label}
                        </span>
                      </div>

                      {group.description && (
                        <p className="text-[15px] leading-5 text-tier-text-secondary m-0 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                          {group.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs leading-4 text-tier-text-secondary">
                          <Users size={14} />
                          {group.memberCount} players
                        </span>

                        {group.hasTrainingPlan && (
                          <span className="flex items-center gap-1 text-xs leading-4 text-tier-success">
                            <ClipboardList size={14} />
                            Training plan
                          </span>
                        )}

                        {nextSession && (
                          <span className="flex items-center gap-1 text-xs leading-4 text-tier-navy">
                            <Calendar size={14} />
                            Next: {nextSession}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Members preview */}
                    <div className="flex items-center gap-1 mr-2">
                      {group.members.slice(0, 4).map((member, index) => (
                        <div
                          key={member.id}
                          title={member.name}
                          className={`w-8 h-8 rounded-full bg-tier-navy text-white flex items-center justify-center text-[11px] font-semibold border-2 border-tier-white ${index > 0 ? '-ml-2.5' : ''}`}
                        >
                          {member.avatarInitials}
                        </div>
                      ))}
                      {group.memberCount > 4 && (
                        <div className="w-8 h-8 rounded-full bg-tier-surface-base text-tier-text-secondary flex items-center justify-center text-[10px] font-semibold -ml-2.5 border-2 border-tier-white">
                          +{group.memberCount - 4}
                        </div>
                      )}
                    </div>

                    {/* Menu button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === group.id ? null : group.id);
                        }}
                        className={`w-9 h-9 rounded flex items-center justify-center border-none cursor-pointer ${
                          activeMenu === group.id ? 'bg-tier-surface-base' : 'bg-transparent'
                        }`}
                      >
                        <MoreVertical size={18} className="text-tier-text-secondary" />
                      </button>

                      {/* Dropdown menu */}
                      {activeMenu === group.id && (
                        <div className="absolute top-full right-0 mt-1 w-[180px] bg-tier-white rounded-lg shadow-lg border border-tier-surface-base z-[100] overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/coach/groups/${group.id}/edit`);
                            }}
                            className="flex items-center gap-2.5 w-full py-2.5 px-3.5 bg-transparent border-none text-[13px] text-tier-navy cursor-pointer text-left hover:bg-tier-surface-base"
                          >
                            <Edit size={16} />
                            Edit group
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/coach/groups/${group.id}/members`);
                            }}
                            className="flex items-center gap-2.5 w-full py-2.5 px-3.5 bg-transparent border-none text-[13px] text-tier-navy cursor-pointer text-left hover:bg-tier-surface-base"
                          >
                            <UserPlus size={16} />
                            Manage members
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/coach/groups/${group.id}/plan`);
                            }}
                            className="flex items-center gap-2.5 w-full py-2.5 px-3.5 bg-transparent border-none text-[13px] text-tier-navy cursor-pointer text-left hover:bg-tier-surface-base"
                          >
                            <ClipboardList size={16} />
                            Training plan
                          </button>
                          <div className="h-px bg-tier-surface-base my-1" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group);
                            }}
                            className="flex items-center gap-2.5 w-full py-2.5 px-3.5 bg-transparent border-none text-[13px] text-tier-error cursor-pointer text-left hover:bg-tier-surface-base"
                          >
                            <Trash2 size={16} />
                            Delete group
                          </button>
                        </div>
                      )}
                    </div>

                    <ChevronRight size={20} className="text-tier-text-secondary" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setActiveMenu(null)}
        />
      )}

      {/* Delete Group Confirmation Modal */}
      <Modal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        title="Delete group"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setGroupToDelete(null)}
              className="py-2.5 px-[18px] bg-transparent border border-tier-border-default rounded-lg text-tier-navy text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteGroup}
              className="py-2.5 px-[18px] bg-tier-error border-none rounded-lg text-white text-sm font-semibold cursor-pointer"
            >
              Delete group
            </button>
          </div>
        }
      >
        <p className="m-0 text-tier-text-secondary leading-relaxed">
          Are you sure you want to delete the group <strong className="text-tier-navy">{groupToDelete?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
