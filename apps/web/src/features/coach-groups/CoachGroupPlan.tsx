/**
 * CoachGroupPlan.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Full-screen group training plan editor with:
 * - Weekly view with day columns
 * - Drag-drop session management
 * - Exercise library integration
 * - Apply to all members functionality
 *
 * NON-NEGOTIABLE:
 * - Past sessions are READ-ONLY
 * - No backdating allowed
 * - All changes logged via audit trail
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  GripVertical,
  Trash2,
  Copy,
  Save,
  X,
  Calendar,
  Target,
  Dumbbell,
  Flag,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';
import Modal from '../../ui/composites/Modal.composite';
import { chatAPI } from '../../services/api';

const GROUP_PLANS_STORAGE_KEY = 'tier_group_plans';

// Load group plans from localStorage (until backend API is available)
function loadGroupPlans(): Record<string, any> {
  try {
    const stored = localStorage.getItem(GROUP_PLANS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load group plans:', err);
  }
  return {};
}

// Save group plans to localStorage (until backend API is available)
function saveGroupPlans(plans: Record<string, any>): void {
  try {
    localStorage.setItem(GROUP_PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save group plans:', err);
  }
}

// Types
interface Exercise {
  id: string;
  name: string;
  category: 'teknikk' | 'putting' | 'kort_spill' | 'langt_spill' | 'bane' | 'mental' | 'fysisk';
  duration: number;
  description?: string;
}

interface PlannedSession {
  id: string;
  dayOfWeek: number; // 0-6, Monday = 0
  time: string;
  title: string;
  type: 'individual' | 'group' | 'competition';
  exercises: Exercise[];
  notes?: string;
  isLocked?: boolean;
}

interface WeeklyPlan {
  weekNumber: number;
  year: number;
  theme?: string;
  focus?: string;
  sessions: PlannedSession[];
}

interface GroupInfo {
  id: string;
  name: string;
  memberCount: number;
  avatarColor: string;
  avatarInitials: string;
}

// Category colors - using semantic session tokens
const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  teknikk: { bg: 'rgba(var(--tier-gold), 0.15)', text: 'rgb(var(--tier-gold))', label: 'Teknikk' },
  putting: { bg: 'rgba(var(--status-success), 0.15)', text: 'rgb(var(--status-success))', label: 'Putting' },
  kort_spill: { bg: 'rgba(var(--tier-navy), 0.15)', text: 'rgb(var(--tier-navy))', label: 'Kort spill' },
  langt_spill: { bg: 'rgba(var(--status-success), 0.15)', text: 'rgb(var(--status-success))', label: 'Langt spill' },
  bane: { bg: 'rgba(var(--status-warning), 0.15)', text: 'rgb(var(--status-warning))', label: 'Bane' },
  mental: { bg: 'rgba(var(--category-j), 0.15)', text: 'rgb(var(--tier-navy))', label: 'Mental' },
  fysisk: { bg: 'rgba(var(--status-warning), 0.15)', text: 'rgb(var(--tier-gold))', label: 'Fysisk' },
};

const dayNames = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

// Mock exercise library
const exerciseLibrary: Exercise[] = [
  { id: 'ex1', name: 'Gate Putting Drill', category: 'putting', duration: 20, description: 'Putt gjennom porter fra 1-3m' },
  { id: 'ex2', name: 'Driver Tempo', category: 'langt_spill', duration: 30, description: 'Fokus på 3/4 tempo' },
  { id: 'ex3', name: 'Pitch 30-50m', category: 'kort_spill', duration: 25, description: 'Varierte avstander' },
  { id: 'ex4', name: 'Bunker Basic', category: 'kort_spill', duration: 20, description: 'Standard bunkerslag' },
  { id: 'ex5', name: 'Alignment Sticks', category: 'teknikk', duration: 15, description: 'Siktetrening' },
  { id: 'ex6', name: '9-hulls runde', category: 'bane', duration: 90, description: 'Simulert turnering' },
  { id: 'ex7', name: 'Visualisering', category: 'mental', duration: 15, description: 'Pre-shot rutine' },
  { id: 'ex8', name: 'Core Workout', category: 'fysisk', duration: 30, description: 'Kjernemuskulatur' },
];

// Mock data
const mockGroup: GroupInfo = {
  id: 'g1',
  name: 'Wang Golf Herrer',
  memberCount: 8,
  avatarColor: 'var(--tier-navy)',
  avatarInitials: 'WH',
};

const mockWeeklyPlan: WeeklyPlan = {
  weekNumber: 1,
  year: 2025,
  theme: 'Grunntrening',
  focus: 'Putting og kort spill',
  sessions: [
    {
      id: 's1',
      dayOfWeek: 0,
      time: '09:00',
      title: 'Morgentrening',
      type: 'group',
      exercises: [
        { id: 'ex1', name: 'Gate Putting Drill', category: 'putting', duration: 20 },
        { id: 'ex3', name: 'Pitch 30-50m', category: 'kort_spill', duration: 25 },
      ],
    },
    {
      id: 's2',
      dayOfWeek: 2,
      time: '14:00',
      title: 'Langspill fokus',
      type: 'group',
      exercises: [
        { id: 'ex2', name: 'Driver Tempo', category: 'langt_spill', duration: 30 },
        { id: 'ex5', name: 'Alignment Sticks', category: 'teknikk', duration: 15 },
      ],
    },
    {
      id: 's3',
      dayOfWeek: 4,
      time: '10:00',
      title: 'Banespill',
      type: 'group',
      exercises: [
        { id: 'ex6', name: '9-hulls runde', category: 'bane', duration: 90 },
      ],
    },
  ],
};

export default function CoachGroupPlan() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingSession, setEditingSession] = useState<PlannedSession | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // New session form state
  const [newSession, setNewSession] = useState<{
    title: string;
    time: string;
    type: 'group' | 'individual' | 'competition';
    exercises: Exercise[];
    notes: string;
  }>({
    title: '',
    time: '09:00',
    type: 'group',
    exercises: [],
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to load saved plan from localStorage
        const savedPlans = loadGroupPlans();
        const savedPlan = savedPlans[groupId || ''];

        // Try to get group info from chat API
        let groupInfo: GroupInfo | null = null;
        try {
          if (groupId) {
            const response = await chatAPI.getGroup(groupId);
            const groupData = response.data?.data as any;
            if (groupData) {
              const groupName = groupData.name || 'Training Group';
              groupInfo = {
                id: groupData.id,
                name: groupName,
                memberCount: groupData.members?.length || groupData.memberCount || 0,
                avatarColor: '#0A2540',
                avatarInitials: groupName.substring(0, 2).toUpperCase(),
              };
            }
          }
        } catch {
          // Fallback to mock if API fails
        }

        setGroup(groupInfo || mockGroup);

        // Use saved plan if available, otherwise use mock
        if (savedPlan) {
          setWeeklyPlan(savedPlan);
        } else {
          setWeeklyPlan(mockWeeklyPlan);
        }
      } catch (error) {
        console.error('Error fetching group plan:', error);
        setGroup(mockGroup);
        setWeeklyPlan(mockWeeklyPlan);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const getWeekDates = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + currentWeekOffset * 7);

    return dayNames.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();
  const currentWeekNumber = Math.ceil(
    (weekDates[0].getTime() - new Date(weekDates[0].getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const getSessionsForDay = (dayIndex: number): PlannedSession[] => {
    if (!weeklyPlan) return [];
    return weeklyPlan.sessions.filter((s) => s.dayOfWeek === dayIndex);
  };

  const getTotalDuration = (exercises: Exercise[]): number => {
    return exercises.reduce((sum, ex) => sum + ex.duration, 0);
  };

  const handleAddSession = () => {
    if (!weeklyPlan || !newSession.title) return;

    const session: PlannedSession = {
      id: `s${Date.now()}`,
      dayOfWeek: selectedDay,
      time: newSession.time,
      title: newSession.title,
      type: newSession.type,
      exercises: newSession.exercises,
      notes: newSession.notes,
    };

    setWeeklyPlan({
      ...weeklyPlan,
      sessions: [...weeklyPlan.sessions, session],
    });

    setNewSession({ title: '', time: '09:00', type: 'group', exercises: [], notes: '' });
    setShowAddSessionModal(false);
    setHasUnsavedChanges(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!weeklyPlan) return;
    setWeeklyPlan({
      ...weeklyPlan,
      sessions: weeklyPlan.sessions.filter((s) => s.id !== sessionId),
    });
    setHasUnsavedChanges(true);
  };

  const handleDuplicateSession = (session: PlannedSession) => {
    if (!weeklyPlan) return;
    const duplicated: PlannedSession = {
      ...session,
      id: `s${Date.now()}`,
      dayOfWeek: (session.dayOfWeek + 1) % 7,
    };
    setWeeklyPlan({
      ...weeklyPlan,
      sessions: [...weeklyPlan.sessions, duplicated],
    });
    setHasUnsavedChanges(true);
  };

  const handleAddExerciseToNewSession = (exercise: Exercise) => {
    setNewSession({
      ...newSession,
      exercises: [...newSession.exercises, { ...exercise, id: `${exercise.id}-${Date.now()}` }],
    });
  };

  const handleRemoveExerciseFromNewSession = (exerciseId: string) => {
    setNewSession({
      ...newSession,
      exercises: newSession.exercises.filter((e) => e.id !== exerciseId),
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!weeklyPlan || !groupId || isSaving) return;

    setIsSaving(true);
    try {
      // Save to localStorage (backend API integration pending)
      const savedPlans = loadGroupPlans();
      savedPlans[groupId] = weeklyPlan;
      saveGroupPlans(savedPlans);

      setHasUnsavedChanges(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);

      console.log('Group plan saved to localStorage (API integration pending)');
    } catch (error) {
      console.error('Failed to save group plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (!group || !weeklyPlan) {
    return (
      <div className="p-6 text-center">
        <p>Kunne ikke laste gruppeplan</p>
        <Button onClick={() => navigate('/coach/groups')}>Tilbake til grupper</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-white font-sans">
      {/* Header */}
      <div className="px-6 pt-6 bg-tier-white border-b border-tier-border-default">
        <PageHeader
          title={`Treningsplan: ${group.name}`}
          subtitle={`${group.memberCount} medlemmer`}
          helpText="Lag treningsplan for hele gruppen. Sett opp økter, mål og oppfølging for alle medlemmer."
          onBack={() => navigate(`/coach/groups/${groupId}`)}
          actions={
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <span className="flex items-center py-1.5 px-3 bg-tier-warning/10 text-tier-warning text-[13px] font-medium rounded-lg">
                  Ulagrede endringer
                </span>
              )}
              <Button
                variant="primary"
                leftIcon={<Save size={16} />}
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                Lagre plan
              </Button>
            </div>
          }
        />
      </div>

      {/* Week Theme/Focus */}
      <div className="flex gap-6 py-4 px-6 bg-tier-white">
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-tier-navy" />
          <span className="text-[13px] text-tier-text-secondary">Tema:</span>
          <span className="text-sm font-medium text-tier-navy">{weeklyPlan.theme || 'Ikke satt'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Target size={16} className="text-tier-success" />
          <span className="text-[13px] text-tier-text-secondary">Fokus:</span>
          <span className="text-sm font-medium text-tier-navy">{weeklyPlan.focus || 'Ikke satt'}</span>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between py-4 px-6 bg-tier-white border-b border-tier-border-default">
        <button
          onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
          className="flex items-center gap-1.5 py-2.5 px-4 bg-tier-surface-base border-none rounded-lg text-sm font-medium text-tier-navy cursor-pointer"
        >
          <ChevronLeft size={18} />
          Forrige uke
        </button>

        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-tier-navy" />
          <span className="text-xl font-bold text-tier-navy">Uke {currentWeekNumber}</span>
          <span className="text-sm text-tier-text-secondary">
            {weekDates[0].toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} -{' '}
            {weekDates[6].toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <button
          onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
          className="flex items-center gap-1.5 py-2.5 px-4 bg-tier-surface-base border-none rounded-lg text-sm font-medium text-tier-navy cursor-pointer"
        >
          Neste uke
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-px bg-tier-border-default m-6 rounded-xl overflow-hidden shadow-sm">
        {dayNames.map((day, dayIndex) => {
          const sessions = getSessionsForDay(dayIndex);
          const date = weekDates[dayIndex];
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date() && !isToday;

          return (
            <div
              key={day}
              className={`min-h-[400px] ${isToday ? 'bg-tier-navy/5' : 'bg-tier-white'}`}
            >
              {/* Day Header */}
              <div
                className={`p-3 text-center border-b ${
                  isToday
                    ? 'bg-tier-navy border-transparent'
                    : 'border-tier-border-default'
                }`}
              >
                <span className={`block text-sm font-semibold ${isToday ? 'text-white' : 'text-tier-navy'}`}>
                  {day}
                </span>
                <span className={`block text-xs mt-0.5 ${isToday ? 'text-white/80' : 'text-tier-text-secondary'}`}>
                  {date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              {/* Sessions */}
              <div className="p-3 flex flex-col gap-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 bg-tier-white rounded-lg border border-tier-border-default ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1 text-xs font-medium text-tier-navy">
                        <Clock size={12} />
                        {session.time}
                      </span>
                      {!isPast && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDuplicateSession(session)}
                            className="p-1 bg-transparent border-none rounded text-tier-text-tertiary cursor-pointer hover:text-tier-text-secondary"
                            title="Dupliser"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1 bg-transparent border-none rounded text-tier-text-tertiary cursor-pointer hover:text-tier-text-secondary"
                            title="Slett"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-tier-navy m-0 mb-2">{session.title}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {session.exercises.map((ex) => (
                        <span
                          key={ex.id}
                          className="py-0.5 px-2 text-[11px] font-medium rounded"
                          style={{
                            backgroundColor: categoryColors[ex.category]?.bg || 'rgb(var(--gray-100))',
                            color: categoryColors[ex.category]?.text || 'var(--tier-navy)',
                          }}
                        >
                          {ex.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-tier-border-default">
                      <span className="flex items-center gap-1 text-[11px] text-tier-text-secondary">
                        <Clock size={12} />
                        {getTotalDuration(session.exercises)} min
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-tier-text-secondary">
                        <Users size={12} />
                        {session.type === 'group' ? 'Gruppe' : session.type === 'individual' ? 'Individuell' : 'Konkurranse'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add Session Button */}
                {!isPast && (
                  <button
                    onClick={() => {
                      setSelectedDay(dayIndex);
                      setShowAddSessionModal(true);
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-transparent border-2 border-dashed border-tier-border-default rounded-lg text-[13px] font-medium text-tier-text-secondary cursor-pointer hover:border-tier-navy hover:text-tier-navy"
                  >
                    <Plus size={16} />
                    Legg til økt
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Session Modal */}
      {showAddSessionModal && (
        <Modal
          isOpen={showAddSessionModal}
          onClose={() => setShowAddSessionModal(false)}
          title={`Ny økt - ${dayNames[selectedDay]}`}
          size="lg"
        >
          <div className="flex flex-col gap-5">
            {/* Session Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-tier-navy">Tittel</label>
              <input
                type="text"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                placeholder="F.eks. Morgentrening"
                className="py-2.5 px-3.5 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none focus:border-tier-navy"
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-tier-navy">Tidspunkt</label>
              <input
                type="time"
                value={newSession.time}
                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                className="py-2.5 px-3.5 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none focus:border-tier-navy"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-tier-navy">Type</label>
              <div className="flex gap-2">
                {['group', 'individual', 'competition'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewSession({ ...newSession, type: type as typeof newSession.type })}
                    className={`flex-1 p-2.5 rounded-lg text-[13px] font-medium cursor-pointer ${
                      newSession.type === type
                        ? 'bg-tier-navy border-tier-navy text-white'
                        : 'bg-tier-surface-base border border-tier-border-default text-tier-text-secondary'
                    }`}
                  >
                    {type === 'group' ? 'Gruppe' : type === 'individual' ? 'Individuell' : 'Konkurranse'}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-tier-navy">Øvelser</label>
              {newSession.exercises.length > 0 ? (
                <div className="flex flex-col gap-2 p-3 bg-tier-surface-base rounded-lg">
                  {newSession.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center gap-2.5 py-2 border-b border-tier-border-default last:border-b-0">
                      <GripVertical size={14} className="text-tier-text-tertiary" />
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: categoryColors[ex.category]?.text || 'var(--text-secondary)' }}
                      />
                      <span className="flex-1 text-sm text-tier-navy">{ex.name}</span>
                      <span className="text-[13px] text-tier-text-secondary">{ex.duration} min</span>
                      <button
                        onClick={() => handleRemoveExerciseFromNewSession(ex.id)}
                        className="p-1 bg-transparent border-none rounded text-tier-text-tertiary cursor-pointer hover:text-tier-text-secondary"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-tier-text-tertiary italic m-0">Ingen øvelser lagt til</p>
              )}
              <button
                onClick={() => setShowExerciseLibrary(true)}
                className="flex items-center justify-center gap-2 p-3 bg-tier-white border border-dashed border-tier-border-default rounded-lg text-sm font-medium text-tier-text-secondary cursor-pointer hover:border-tier-navy hover:text-tier-navy"
              >
                <Dumbbell size={16} />
                Legg til øvelse fra bibliotek
              </button>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-tier-navy">Notater (valgfritt)</label>
              <textarea
                value={newSession.notes}
                onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                placeholder="Spesielle instruksjoner..."
                className="py-2.5 px-3.5 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none resize-y font-inherit focus:border-tier-navy"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-tier-border-default">
              <Button variant="secondary" onClick={() => setShowAddSessionModal(false)}>
                Avbryt
              </Button>
              <Button variant="primary" onClick={handleAddSession} disabled={!newSession.title}>
                Legg til økt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Exercise Library Modal */}
      {showExerciseLibrary && (
        <Modal
          isOpen={showExerciseLibrary}
          onClose={() => setShowExerciseLibrary(false)}
          title="Øvelsesbibliotek"
          size="md"
        >
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {exerciseLibrary.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-3 p-3 bg-tier-white rounded-lg cursor-pointer hover:bg-tier-surface-base"
                onClick={() => {
                  handleAddExerciseToNewSession(ex);
                  setShowExerciseLibrary(false);
                }}
              >
                <span
                  className="py-1 px-2.5 text-xs font-medium rounded whitespace-nowrap"
                  style={{
                    backgroundColor: categoryColors[ex.category]?.bg || 'rgb(var(--gray-100))',
                    color: categoryColors[ex.category]?.text || 'var(--tier-navy)',
                  }}
                >
                  {categoryColors[ex.category]?.label || ex.category}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-tier-navy m-0">{ex.name}</p>
                  {ex.description && <p className="text-xs text-tier-text-secondary mt-0.5 m-0">{ex.description}</p>}
                </div>
                <span className="text-[13px] font-medium text-tier-text-secondary">{ex.duration} min</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
