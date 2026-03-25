/**
 * CoachGroupDetail.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Detaljvisning av en gruppe med medlemmer, treningsplan og statistikk.
 * Inkluderer gruppeplan-funksjonalitet med ukentlig planlegging.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  Calendar,
  ClipboardList,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  UserMinus,
  TrendingUp,
  Target,
  Trophy,
  Clock,
  BarChart3,
  Edit3,
  Copy,
  Trash2,
  X,
  GripVertical,
  Play,
} from 'lucide-react';
import Modal from '../../ui/composites/Modal.composite';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';
import MembersList, { Member } from '../../ui/composites/MembersList.composite';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

interface GroupMember {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  category: string;
  lastActive: string;
  sessionsThisWeek: number;
  trend: 'up' | 'down' | 'stable';
}

interface GroupSession {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  attendees: number;
  totalMembers: number;
}

interface GroupStats {
  totalSessions: number;
  avgAttendance: number;
  avgSessionsPerWeek: number;
  topPerformer: string;
}

// Training Plan types
interface PlannedExercise {
  id: string;
  name: string;
  category: 'teknikk' | 'putting' | 'kort_spill' | 'langt_spill' | 'bane' | 'mental' | 'fysisk';
  duration: number; // minutes
  description?: string;
  order: number;
}

interface PlannedSession {
  id: string;
  dayOfWeek: number; // 0-6, Monday = 0
  time: string;
  title: string;
  type: 'individual' | 'group' | 'competition';
  exercises: PlannedExercise[];
  notes?: string;
}

interface WeeklyPlan {
  weekNumber: number;
  year: number;
  theme?: string;
  focus?: string;
  sessions: PlannedSession[];
}

interface GroupTrainingPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  weeks: WeeklyPlan[];
  isActive: boolean;
}

interface GroupDetail {
  id: string;
  name: string;
  description?: string;
  type: 'wang' | 'team_norway' | 'custom';
  avatarColor: string;
  avatarInitials: string;
  members: GroupMember[];
  upcomingSessions: GroupSession[];
  recentSessions: GroupSession[];
  stats: GroupStats;
  hasTrainingPlan: boolean;
  trainingPlan?: GroupTrainingPlan;
  createdAt: string;
}

// Exercise category colors
const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  teknikk: { bg: 'rgba(var(--accent-rgb), 0.15)', text: 'var(--accent)', label: 'Teknikk' },
  putting: { bg: 'rgba(var(--success-rgb), 0.15)', text: 'var(--status-success)', label: 'Putting' },
  kort_spill: { bg: 'rgba(var(--achievement-rgb), 0.15)', text: 'var(--achievement)', label: 'Kort spill' },
  langt_spill: { bg: 'rgba(var(--accent-rgb), 0.15)', text: 'var(--accent)', label: 'Langt spill' },
  bane: { bg: 'rgba(var(--warning-rgb), 0.15)', text: 'var(--status-warning)', label: 'Bane' },
  mental: { bg: 'rgba(var(--category-j), 0.15)', text: 'rgb(var(--category-j))', label: 'Mental' },
  fysisk: { bg: 'rgba(var(--error-rgb), 0.15)', text: 'var(--status-error)', label: 'Fysisk' },
};

const dayNames = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

export default function CoachGroupDetail() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'sessions' | 'plan' | 'stats'>('members');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);

  // Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`/api/v1/coach/groups/${groupId}`);
        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
        }
      } catch (error) {
        console.error('Failed to fetch group:', error);
        // Mock data for development
        setGroup({
          id: groupId || '1',
          name: 'WANG Toppidrett 2025',
          description: 'Hovedgruppe for WANG Toppidrett elever. Fokus på helhetlig utvikling.',
          type: 'wang',
          avatarColor: 'var(--accent)',
          avatarInitials: 'WT',
          members: [
            {
              id: 'p1',
              name: 'Anders Hansen',
              avatarInitials: 'AH',
              avatarColor: 'var(--accent)',
              category: 'A',
              lastActive: '2025-12-21',
              sessionsThisWeek: 4,
              trend: 'up',
            },
            {
              id: 'p2',
              name: 'Sofie Andersen',
              avatarInitials: 'SA',
              avatarColor: 'var(--achievement)',
              category: 'A',
              lastActive: '2025-12-20',
              sessionsThisWeek: 3,
              trend: 'stable',
            },
            {
              id: 'p3',
              name: 'Erik Johansen',
              avatarInitials: 'EJ',
              avatarColor: 'var(--status-success)',
              category: 'B',
              lastActive: '2025-12-19',
              sessionsThisWeek: 2,
              trend: 'down',
            },
            {
              id: 'p4',
              name: 'Emma Berg',
              avatarInitials: 'EB',
              avatarColor: 'var(--accent)',
              category: 'B',
              lastActive: '2025-12-21',
              sessionsThisWeek: 5,
              trend: 'up',
            },
            {
              id: 'p5',
              name: 'Lars Olsen',
              avatarInitials: 'LO',
              avatarColor: 'var(--status-error)',
              category: 'A',
              lastActive: '2025-12-18',
              sessionsThisWeek: 3,
              trend: 'stable',
            },
          ],
          upcomingSessions: [
            {
              id: 's1',
              title: 'Teknikktrening',
              date: '2025-12-23',
              time: '09:00',
              duration: 120,
              attendees: 5,
              totalMembers: 5,
            },
            {
              id: 's2',
              title: 'Putting workshop',
              date: '2025-12-24',
              time: '14:00',
              duration: 90,
              attendees: 4,
              totalMembers: 5,
            },
          ],
          recentSessions: [
            {
              id: 's3',
              title: 'Banetrening',
              date: '2025-12-20',
              time: '10:00',
              duration: 180,
              attendees: 5,
              totalMembers: 5,
            },
            {
              id: 's4',
              title: 'Kort spill fokus',
              date: '2025-12-18',
              time: '09:00',
              duration: 120,
              attendees: 4,
              totalMembers: 5,
            },
          ],
          stats: {
            totalSessions: 48,
            avgAttendance: 87,
            avgSessionsPerWeek: 3.2,
            topPerformer: 'Emma Berg',
          },
          hasTrainingPlan: true,
          trainingPlan: {
            id: 'plan1',
            name: 'Vår 2025 Treningsplan',
            startDate: '2025-01-06',
            endDate: '2025-06-30',
            isActive: true,
            weeks: [
              {
                weekNumber: 52,
                year: 2024,
                theme: 'Teknikk-fokus',
                focus: 'Grunnleggende slag og posisjon',
                sessions: [
                  {
                    id: 'ps1',
                    dayOfWeek: 0,
                    time: '09:00',
                    title: 'Teknikktrening',
                    type: 'group',
                    exercises: [
                      { id: 'e1', name: 'Oppvarming', category: 'fysisk', duration: 15, order: 1 },
                      { id: 'e2', name: 'Grip og stance', category: 'teknikk', duration: 30, order: 2 },
                      { id: 'e3', name: 'Jern 7 drill', category: 'teknikk', duration: 45, order: 3 },
                    ],
                  },
                  {
                    id: 'ps2',
                    dayOfWeek: 2,
                    time: '14:00',
                    title: 'Putting fokus',
                    type: 'group',
                    exercises: [
                      { id: 'e4', name: 'Gate drill', category: 'putting', duration: 20, order: 1 },
                      { id: 'e5', name: 'Avstandskontroll', category: 'putting', duration: 30, order: 2 },
                      { id: 'e6', name: 'Konkurranseputting', category: 'putting', duration: 30, order: 3 },
                    ],
                  },
                  {
                    id: 'ps3',
                    dayOfWeek: 4,
                    time: '10:00',
                    title: 'Banetrening',
                    type: 'group',
                    exercises: [
                      { id: 'e7', name: '9 hull simulering', category: 'bane', duration: 90, order: 1 },
                      { id: 'e8', name: 'Kursanalyse', category: 'mental', duration: 30, order: 2 },
                    ],
                  },
                ],
              },
              {
                weekNumber: 1,
                year: 2025,
                theme: 'Kort spill',
                focus: 'Chipping og pitching',
                sessions: [
                  {
                    id: 'ps4',
                    dayOfWeek: 0,
                    time: '09:00',
                    title: 'Kort spill intensiv',
                    type: 'group',
                    exercises: [
                      { id: 'e9', name: 'Oppvarming', category: 'fysisk', duration: 15, order: 1 },
                      { id: 'e10', name: 'Chipping teknikk', category: 'kort_spill', duration: 45, order: 2 },
                      { id: 'e11', name: 'Pitching variasjon', category: 'kort_spill', duration: 45, order: 3 },
                    ],
                  },
                  {
                    id: 'ps5',
                    dayOfWeek: 3,
                    time: '14:00',
                    title: 'Bunkertrening',
                    type: 'group',
                    exercises: [
                      { id: 'e12', name: 'Bunker exit', category: 'kort_spill', duration: 30, order: 1 },
                      { id: 'e13', name: 'Greenside bunker', category: 'kort_spill', duration: 30, order: 2 },
                      { id: 'e14', name: 'Fairway bunker', category: 'kort_spill', duration: 30, order: 3 },
                    ],
                  },
                ],
              },
            ],
          },
          createdAt: '2025-01-15',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  // Get trend icon and color
  const getTrendStyle = (trend: string) => {
    switch (trend) {
      case 'up':
        return { color: 'var(--status-success)', rotation: '-45deg' };
      case 'down':
        return { color: 'var(--status-error)', rotation: '45deg' };
      default:
        return { color: 'var(--text-secondary)', rotation: '0deg' };
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Remove member - show confirmation modal
  const handleRemoveMember = (member: GroupMember) => {
    setMemberToRemove(member);
  };

  // Confirm and execute member removal
  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await fetch(`/api/v1/coach/groups/${groupId}/members/${memberToRemove.id}`, {
        method: 'DELETE',
      });
      if (group) {
        setGroup({
          ...group,
          members: group.members.filter((m) => m.id !== memberToRemove.id),
        });
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
    setMemberToRemove(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 text-center">
        <p>Gruppe ikke funnet</p>
        <button onClick={() => navigate('/coach/groups')}>Tilbake til grupper</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header - using PageHeader from design system */}
      <div className="flex items-start gap-4 p-6 pb-0">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-tier-white font-bold text-xl shrink-0"
          style={{ backgroundColor: group.avatarColor }}
        >
          {group.avatarInitials}
        </div>
        <div className="flex-1">
          <PageHeader
            title={group.name}
            subtitle={group.description}
            helpText="Detaljer om treningsgruppen, medlemmer og planlagte aktiviteter. Administrer gruppens innhold og fremgang."
            onBack={() => navigate('/coach/groups')}
            actions={
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Settings size={16} />}
                onClick={() => navigate(`/coach/groups/${groupId}/edit`)}
              >
                Innstillinger
              </Button>
            }
            divider={false}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2.5 py-4 px-6 border-b border-tier-border-default">
        <Button
          variant="primary"
          leftIcon={<ClipboardList size={18} />}
          onClick={() => navigate(`/coach/groups/${groupId}/plan`)}
        >
          Treningsplan
        </Button>
        <Button
          variant="secondary"
          leftIcon={<MessageSquare size={18} />}
          onClick={() => navigate(`/coach/groups/${groupId}/message`)}
        >
          Send melding
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Calendar size={18} />}
          onClick={() => navigate(`/coach/groups/${groupId}/session/new`)}
        >
          Planlegg økt
        </Button>
      </div>

      {/* Stats bar */}
      <div className="py-4 px-6 bg-tier-white">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-tier-navy m-0">
              {group.members.length}
            </p>
            <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-1 mb-0">
              Medlemmer
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-tier-success m-0">
              {group.stats.avgAttendance}%
            </p>
            <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-1 mb-0">
              Snitt oppmøte
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-tier-warning m-0">
              {group.stats.totalSessions}
            </p>
            <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-1 mb-0">
              Økter totalt
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-tier-navy m-0">
              {group.stats.avgSessionsPerWeek}
            </p>
            <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-1 mb-0">
              Økter/uke
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 py-4 px-6 bg-tier-white border-b border-tier-border-default">
        {[
          { key: 'members', label: 'Medlemmer', icon: Users },
          { key: 'sessions', label: 'Økter', icon: Calendar },
          { key: 'plan', label: 'Treningsplan', icon: ClipboardList },
          { key: 'stats', label: 'Statistikk', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'members' | 'sessions' | 'plan' | 'stats')}
            className={`flex items-center gap-2 py-2.5 px-[18px] border-none rounded-lg text-sm font-medium cursor-pointer ${
              activeTab === tab.key
                ? 'bg-tier-navy text-white'
                : 'bg-transparent text-tier-navy'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {/* Members tab */}
        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                Gruppemedlemmer ({group.members.length})
              </SectionTitle>
              <button
                onClick={() => navigate(`/coach/groups/${groupId}/members/add`)}
                className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-navy text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer"
              >
                <Plus size={16} />
                Legg til medlem
              </button>
            </div>

            {/* Members List using reusable component */}
            <div className="bg-tier-white rounded-xl shadow-sm overflow-hidden">
              <MembersList
                members={group.members.map((m): Member => ({
                  id: m.id,
                  name: m.name,
                  avatarInitials: m.avatarInitials,
                  avatarColor: m.avatarColor,
                  category: `Kat. ${m.category}`,
                  role: `${m.sessionsThisWeek} økter/uke`,
                  lastSeen: formatDate(m.lastActive),
                  type: 'player',
                }))}
                onMemberClick={(member) => navigate(`/coach/athletes/${member.id}`)}
                showEmail={false}
                showStatus={true}
                size="lg"
              />
            </div>

            {/* Additional member actions */}
            <div className="flex flex-col gap-2.5 mt-4">
              {group.members.map((member) => {
                const trendStyle = getTrendStyle(member.trend);
                return (
                  <div
                    key={`actions-${member.id}`}
                    className="flex items-center justify-between py-3 px-4 bg-tier-white rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-tier-white font-semibold text-xs"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.avatarInitials}
                      </div>
                      <span className="text-sm font-medium text-tier-navy">
                        {member.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp
                          size={16}
                          color={trendStyle.color}
                          style={{ transform: `rotate(${trendStyle.rotation})` }}
                        />
                        <span className="text-[13px] text-tier-text-secondary">
                          {member.sessionsThisWeek} økter
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(`/coach/athletes/${member.id}`)}
                        className="py-1.5 px-3 bg-tier-surface-base border-none rounded text-xs font-medium text-tier-navy cursor-pointer"
                      >
                        Se profil
                      </button>

                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="w-8 h-8 rounded bg-transparent border-none flex items-center justify-center cursor-pointer opacity-60"
                        title="Fjern fra gruppe"
                      >
                        <UserMinus size={16} className="text-tier-error" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sessions tab */}
        {activeTab === 'sessions' && (
          <div>
            {/* Upcoming sessions */}
            <div className="mb-8">
              <SectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0 mb-4">
                Kommende økter
              </SectionTitle>
              {group.upcomingSessions.length === 0 ? (
                <p className="text-[15px] leading-5 text-tier-text-secondary">
                  Ingen planlagte økter
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {group.upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3.5 py-3.5 px-4 bg-tier-white rounded-lg shadow-sm border-l-[3px] border-l-tier-navy"
                    >
                      <div className="w-12 h-12 rounded-lg bg-tier-navy flex flex-col items-center justify-center text-white">
                        <span className="text-sm font-bold">{session.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                          {session.title}
                        </p>
                        <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-0.5 mb-0">
                          {formatDate(session.date)} · {session.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[17px] leading-[22px] font-semibold text-tier-success m-0">
                          {session.attendees}/{session.totalMembers}
                        </p>
                        <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0">
                          bekreftet
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-tier-text-secondary" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent sessions */}
            <div>
              <SectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0 mb-4">
                Tidligere økter
              </SectionTitle>
              <div className="flex flex-col gap-2.5">
                {group.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3.5 py-3.5 px-4 bg-tier-white rounded-lg shadow-sm opacity-80"
                  >
                    <div className="w-12 h-12 rounded-lg bg-tier-border-default flex flex-col items-center justify-center text-tier-text-secondary">
                      <span className="text-sm font-bold">{session.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                        {session.title}
                      </p>
                      <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-0.5 mb-0">
                        {formatDate(session.date)} · {session.duration} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                        {session.attendees}/{session.totalMembers}
                      </p>
                      <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0">
                        deltok
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plan tab */}
        {activeTab === 'plan' && (
          <div>
            {/* Plan header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <SectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                  {group.trainingPlan?.name || 'Treningsplan'}
                </SectionTitle>
                {group.trainingPlan && (
                  <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-1 mb-0">
                    Aktiv plan: {new Date(group.trainingPlan.startDate).toLocaleDateString('nb-NO')} - {new Date(group.trainingPlan.endDate).toLocaleDateString('nb-NO')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/coach/groups/${groupId}/plan/edit`)}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-surface-base text-tier-navy border-none rounded-lg text-[13px] font-medium cursor-pointer"
                >
                  <Edit3 size={16} />
                  Rediger plan
                </button>
                <button
                  onClick={() => setShowAddSessionModal(true)}
                  className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-navy text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer"
                >
                  <Plus size={16} />
                  Legg til økt
                </button>
              </div>
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between py-4 px-5 bg-tier-white rounded-xl mb-4 shadow-sm">
              <button
                onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                className="flex items-center gap-1.5 py-2 px-3 bg-tier-surface-base border-none rounded-lg text-[13px] font-medium text-tier-navy cursor-pointer"
              >
                <ChevronLeft size={16} />
                Forrige uke
              </button>

              <div className="text-center">
                <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                  Uke {(() => {
                    const now = new Date();
                    now.setDate(now.getDate() + currentWeekOffset * 7);
                    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
                    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
                    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                  })()}
                </p>
                <p className="text-[13px] leading-[18px] text-tier-text-secondary mt-0.5 mb-0">
                  {(() => {
                    const now = new Date();
                    now.setDate(now.getDate() + currentWeekOffset * 7);
                    const monday = new Date(now);
                    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);
                    return `${monday.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}`;
                  })()}
                </p>
              </div>

              <button
                onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                className="flex items-center gap-1.5 py-2 px-3 bg-tier-surface-base border-none rounded-lg text-[13px] font-medium text-tier-navy cursor-pointer"
              >
                Neste uke
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Current week info */}
            {group.trainingPlan && (() => {
              const currentWeek = group.trainingPlan.weeks[Math.abs(currentWeekOffset) % group.trainingPlan.weeks.length];
              if (!currentWeek) return null;

              return (
                <>
                  {/* Week theme/focus */}
                  {(currentWeek.theme || currentWeek.focus) && (
                    <div className="py-4 px-5 bg-tier-navy/10 rounded-xl mb-4 border-l-4 border-l-tier-navy">
                      {currentWeek.theme && (
                        <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                          {currentWeek.theme}
                        </p>
                      )}
                      {currentWeek.focus && (
                        <p className="text-[15px] leading-5 text-tier-navy mt-1 mb-0">
                          Fokus: {currentWeek.focus}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Weekly schedule grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => {
                      const sessionsForDay = currentWeek.sessions.filter((s) => s.dayOfWeek === index);
                      const isToday = (() => {
                        const today = new Date();
                        const dayOfWeek = (today.getDay() + 6) % 7;
                        return dayOfWeek === index && currentWeekOffset === 0;
                      })();

                      return (
                        <div
                          key={day}
                          className={`bg-tier-white rounded-lg overflow-hidden shadow-sm ${
                            isToday ? 'border-2 border-tier-navy' : ''
                          }`}
                        >
                          {/* Day header */}
                          <div
                            className={`py-2.5 px-3 border-b border-tier-border-default ${
                              isToday ? 'bg-tier-navy' : 'bg-tier-surface-base'
                            }`}
                          >
                            <p
                              className={`text-[13px] leading-[18px] font-semibold m-0 text-center ${
                                isToday ? 'text-white' : 'text-tier-navy'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </p>
                          </div>

                          {/* Sessions for day */}
                          <div className="p-2 min-h-[120px]">
                            {sessionsForDay.length === 0 ? (
                              <button
                                onClick={() => {
                                  setSelectedDay(index);
                                  setShowAddSessionModal(true);
                                }}
                                className="w-full p-3 bg-tier-surface-base border border-dashed border-tier-border-default rounded text-tier-text-secondary text-[11px] cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Plus size={12} />
                                Legg til
                              </button>
                            ) : (
                              sessionsForDay.map((session) => (
                                <div
                                  key={session.id}
                                  className="p-2 bg-tier-navy/5 rounded mb-1.5 cursor-pointer border-l-[3px] border-l-tier-navy"
                                  onClick={() => setEditingSession(session.id)}
                                >
                                  <p className="text-[13px] leading-[18px] font-semibold text-tier-navy m-0">
                                    {session.time}
                                  </p>
                                  <p className="text-[11px] text-tier-navy mt-0.5 mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {session.title}
                                  </p>
                                  <div className="flex gap-0.5 mt-1 flex-wrap">
                                    {session.exercises.slice(0, 2).map((ex) => {
                                      const catStyle = categoryColors[ex.category] || { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)', label: ex.category };
                                      return (
                                        <span
                                          key={ex.id}
                                          className="text-[9px] py-px px-1 rounded-sm"
                                          style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                                        >
                                          {catStyle.label || ex.category}
                                        </span>
                                      );
                                    })}
                                    {session.exercises.length > 2 && (
                                      <span className="text-[9px] py-px px-1 bg-tier-surface-base text-tier-text-secondary rounded-sm">
                                        +{session.exercises.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Session detail panel */}
                  {editingSession && (() => {
                    const session = currentWeek.sessions.find((s) => s.id === editingSession);
                    if (!session) return null;

                    return (
                      <div className="mt-6 bg-tier-white rounded-xl shadow-sm overflow-hidden">
                        <div className="py-4 px-5 bg-tier-navy flex items-center justify-between">
                          <div>
                            <SubSectionTitle className="text-[17px] leading-[22px] font-semibold text-white m-0">
                              {session.title}
                            </SubSectionTitle>
                            <p className="text-[13px] leading-[18px] text-white/80 mt-0.5 mb-0">
                              {dayNames[session.dayOfWeek]} kl. {session.time}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingSession(null)}
                            className="w-8 h-8 rounded-full bg-white/20 border-none flex items-center justify-center cursor-pointer"
                          >
                            <X size={18} className="text-white" />
                          </button>
                        </div>

                        <div className="p-5">
                          <CardTitle className="text-[13px] leading-[18px] text-tier-text-secondary uppercase tracking-wide m-0 mb-3">
                            Øvelser ({session.exercises.length})
                          </CardTitle>

                          <div className="flex flex-col gap-2">
                            {session.exercises
                              .sort((a, b) => a.order - b.order)
                              .map((exercise, index) => {
                                const catStyle = categoryColors[exercise.category] || { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)', label: exercise.category };
                                return (
                                  <div
                                    key={exercise.id}
                                    className="flex items-center gap-3 py-3 px-3.5 bg-tier-surface-base rounded-lg"
                                  >
                                    <div className="w-7 h-7 rounded-full bg-tier-navy text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[15px] leading-5 font-medium text-tier-navy m-0">
                                        {exercise.name}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                          className="text-[11px] py-0.5 px-1.5 rounded font-medium"
                                          style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                                        >
                                          {catStyle.label}
                                        </span>
                                        <span className="text-[11px] text-tier-text-secondary">
                                          {exercise.duration} min
                                        </span>
                                      </div>
                                    </div>
                                    <GripVertical size={16} className="text-tier-border-default cursor-grab" />
                                  </div>
                                );
                              })}
                          </div>

                          <div className="flex gap-2.5 mt-4 pt-4 border-t border-tier-border-default">
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-navy text-white border-none rounded-lg text-[13px] font-medium cursor-pointer">
                              <Play size={16} />
                              Start økt
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-surface-base text-tier-navy border-none rounded-lg text-[13px] font-medium cursor-pointer">
                              <Edit3 size={16} />
                              Rediger
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-surface-base text-tier-navy border-none rounded-lg text-[13px] font-medium cursor-pointer">
                              <Copy size={16} />
                              Kopier
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-tier-error/10 text-tier-error border-none rounded-lg text-[13px] font-medium cursor-pointer ml-auto">
                              <Trash2 size={16} />
                              Slett
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}

            {/* No plan message */}
            {!group.trainingPlan && (
              <div className="bg-tier-white rounded-xl py-12 px-6 text-center shadow-sm">
                <ClipboardList size={48} className="text-tier-border-default mb-4" />
                <SubSectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                  Ingen treningsplan
                </SubSectionTitle>
                <p className="text-[15px] leading-5 text-tier-text-secondary mt-2 mb-5">
                  Opprett en treningsplan for å strukturere gruppens økter
                </p>
                <button
                  onClick={() => navigate(`/coach/groups/${groupId}/plan/create`)}
                  className="inline-flex items-center gap-2 py-3 px-5 bg-tier-navy text-white border-none rounded-lg text-sm font-semibold cursor-pointer"
                >
                  <Plus size={18} />
                  Opprett treningsplan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats tab */}
        {activeTab === 'stats' && (
          <div>
            <SectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0 mb-4">
              Gruppestatistikk
            </SectionTitle>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-tier-white rounded-xl shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <Trophy size={20} className="text-tier-warning" />
                  <span className="text-[15px] leading-5 text-tier-text-secondary">
                    Topp utøver denne måneden
                  </span>
                </div>
                <p className="text-[22px] leading-7 font-bold text-tier-navy m-0">
                  {group.stats.topPerformer}
                </p>
              </div>

              <div className="p-5 bg-tier-white rounded-xl shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <Target size={20} className="text-tier-success" />
                  <span className="text-[15px] leading-5 text-tier-text-secondary">
                    Gjennomsnittlig oppmøte
                  </span>
                </div>
                <p className="text-[22px] leading-7 font-bold text-tier-navy m-0">
                  {group.stats.avgAttendance}%
                </p>
              </div>

              <div className="p-5 bg-tier-white rounded-xl shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <Clock size={20} className="text-tier-navy" />
                  <span className="text-[15px] leading-5 text-tier-text-secondary">
                    Økter per uke (snitt)
                  </span>
                </div>
                <p className="text-[22px] leading-7 font-bold text-tier-navy m-0">
                  {group.stats.avgSessionsPerWeek}
                </p>
              </div>

              <div className="p-5 bg-tier-white rounded-xl shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <Calendar size={20} className="text-tier-navy" />
                  <span className="text-[15px] leading-5 text-tier-text-secondary">
                    Totalt antall økter
                  </span>
                </div>
                <p className="text-[22px] leading-7 font-bold text-tier-navy m-0">
                  {group.stats.totalSessions}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Fjern medlem"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setMemberToRemove(null)}
              className="py-2.5 px-[18px] bg-transparent border border-tier-border-default rounded-lg text-tier-navy text-sm font-medium cursor-pointer"
            >
              Avbryt
            </button>
            <button
              onClick={handleConfirmRemoveMember}
              className="py-2.5 px-[18px] bg-tier-error border-none rounded-lg text-white text-sm font-semibold cursor-pointer"
            >
              Fjern medlem
            </button>
          </div>
        }
      >
        <p className="m-0 text-tier-text-secondary leading-relaxed">
          Er du sikker på at du vil fjerne <strong className="text-tier-navy">{memberToRemove?.name}</strong> fra gruppen?
        </p>
      </Modal>
    </div>
  );
}
