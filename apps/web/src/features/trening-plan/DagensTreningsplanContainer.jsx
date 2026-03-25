/**
 * DagensTreningsplanContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import {
  Calendar, Clock, Target, CheckCircle, Play,
  ChevronRight, RotateCcw, Flame, Dumbbell, Brain, Flag,
  Video, MessageCircle, Plus, Award
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const TODAY_PLAN = {
  date: new Date().toISOString().split('T')[0],
  dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  theme: 'Long game focus',
  totalDuration: 150,
  completedDuration: 60,
  sessions: [
    {
      id: 's1',
      type: 'warmup',
      name: 'Warm-up',
      duration: 15,
      status: 'completed',
      description: 'Dynamic stretching and light swings',
      exercises: [
        { name: 'Arm circles', reps: '10 each way', completed: true },
        { name: 'Hip rotation', reps: '10 each way', completed: true },
        { name: 'Torso twist', reps: '20 total', completed: true },
        { name: 'Light swings', reps: '20 swings', completed: true },
      ],
    },
    {
      id: 's2',
      type: 'technical',
      name: 'Driver training',
      duration: 45,
      status: 'completed',
      description: 'Focus on consistent contact and ball flight',
      exercises: [
        { name: 'Alignment drill', reps: '10 balls', completed: true, notes: 'Focus on shoulder line' },
        { name: 'Tempo drill (1-2-3)', reps: '20 balls', completed: true },
        { name: 'Full swing with target', reps: '30 balls', completed: true },
      ],
      trackmanData: {
        avgClubSpeed: '108 mph',
        avgBallSpeed: '158 mph',
        avgCarry: '242 m',
        avgSmash: '1.46',
      },
    },
    {
      id: 's3',
      type: 'technical',
      name: 'Long irons (4-6)',
      duration: 40,
      status: 'in_progress',
      description: 'Precision and distance control',
      exercises: [
        { name: 'Alignment check', reps: '5 balls', completed: true },
        { name: '6-iron to target 147 m', reps: '20 balls', completed: false },
        { name: '5-iron to target 160 m', reps: '15 balls', completed: false },
        { name: '4-iron to target 175 m', reps: '15 balls', completed: false },
      ],
      targetZones: [
        { club: '6-iron', distance: '147 m', tolerance: '±7 m' },
        { club: '5-iron', distance: '160 m', tolerance: '±9 m' },
        { club: '4-iron', distance: '175 m', tolerance: '±11 m' },
      ],
    },
    {
      id: 's4',
      type: 'short_game',
      name: 'Short game',
      duration: 35,
      status: 'pending',
      description: 'Chipping and pitching',
      exercises: [
        { name: 'Chip from tight lie', reps: '15 balls', completed: false },
        { name: 'Pitch 25-42 m', reps: '20 balls', completed: false },
        { name: 'Up-and-down challenge', reps: '10 attempts', completed: false },
      ],
    },
    {
      id: 's5',
      type: 'cooldown',
      name: 'Cool-down',
      duration: 15,
      status: 'pending',
      description: 'Putting and stretching',
      exercises: [
        { name: 'Gate putting drill', reps: '20 putts', completed: false },
        { name: 'Distance control 6-12 m', reps: '10 putts', completed: false },
        { name: 'Stretching', reps: '5 min', completed: false },
      ],
    },
  ],
  coachNote: 'Remember to focus on tempo today. We adjusted the grip in the last session - be mindful of this throughout the training.',
  goals: [
    'Achieve minimum 65% fairway hits with driver',
    'Average deviation from target under 10 m with long irons',
    'Minimum 5/10 up-and-downs',
  ],
};

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const SESSION_TYPE_CLASSES = {
  warmup: {
    text: 'text-tier-warning',
    bg: 'bg-tier-warning/15',
    icon: Flame,
    label: 'Warm-up',
  },
  technical: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
    icon: Target,
    label: 'Technical',
  },
  short_game: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
    icon: Flag,
    label: 'Short game',
  },
  physical: {
    text: 'text-tier-error',
    bg: 'bg-tier-error/15',
    icon: Dumbbell,
    label: 'Physical',
  },
  mental: {
    text: 'text-amber-500',
    bg: 'bg-amber-500/15',
    icon: Brain,
    label: 'Mental',
  },
  cooldown: {
    text: 'text-tier-text-secondary',
    bg: 'bg-tier-surface-base',
    icon: RotateCcw,
    label: 'Cool-down',
  },
};

const STATUS_CLASSES = {
  completed: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
    progressBg: 'bg-tier-success',
    icon: CheckCircle,
    label: 'Completed',
  },
  in_progress: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
    progressBg: 'bg-tier-navy',
    icon: Play,
    label: 'In progress',
  },
  pending: {
    text: 'text-tier-text-secondary',
    bg: 'bg-tier-surface-base',
    progressBg: 'bg-tier-text-secondary',
    icon: Clock,
    label: 'Pending',
  },
};

// ============================================================================
// SESSION CARD COMPONENT
// ============================================================================

const SessionCard = ({ session, onStart, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(session.status === 'in_progress');
  const typeConfig = SESSION_TYPE_CLASSES[session.type] || SESSION_TYPE_CLASSES.cooldown;
  const statusConfig = STATUS_CLASSES[session.status] || STATUS_CLASSES.pending;
  const TypeIcon = typeConfig.icon;

  const completedExercises = session.exercises.filter(e => e.completed).length;
  const totalExercises = session.exercises.length;
  const progressWidth = (completedExercises / totalExercises) * 100;

  return (
    <div className={`bg-tier-white rounded-2xl overflow-hidden shadow-sm border-2 ${
      session.status === 'in_progress' ? 'border-tier-navy' : 'border-transparent'
    } ${session.status === 'completed' ? 'opacity-80' : 'opacity-100'}`}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer flex items-center gap-3"
      >
        <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} flex items-center justify-center`}>
          {session.status === 'completed' ? (
            <CheckCircle size={22} className="text-tier-success" />
          ) : (
            <TypeIcon size={22} className={typeConfig.text} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <SubSectionTitle className={`text-[15px] m-0 ${
              session.status === 'completed' ? 'line-through' : ''
            }`}>
              {session.name}
            </SubSectionTitle>
            <span className={`text-[11px] font-medium ${statusConfig.text} ${statusConfig.bg} py-0.5 px-1.5 rounded`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="text-xs text-tier-text-secondary mt-0.5">
            {session.duration} min - {completedExercises}/{totalExercises} exercises
          </div>
        </div>

        <div className={`w-7 h-7 rounded-lg bg-tier-surface-base flex items-center justify-center transition-transform duration-200 ${
          isExpanded ? 'rotate-90' : 'rotate-0'
        }`}>
          <ChevronRight size={16} className="text-tier-text-secondary" />
        </div>
      </div>

      {/* Progress bar */}
      {session.status !== 'pending' && (
        <div className="px-4 pb-2">
          <div className="h-1 bg-tier-surface-base rounded-sm overflow-hidden">
            <div
              className={`h-full rounded-sm transition-[width] duration-300 ${statusConfig.progressBg}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-tier-border-default mt-2">
          <p className="text-[13px] text-tier-text-secondary my-3 leading-relaxed">
            {session.description}
          </p>

          {/* Exercises */}
          <div className="flex flex-col gap-2">
            {session.exercises.map((exercise, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg ${
                  exercise.completed ? 'bg-tier-success/10' : 'bg-tier-surface-base'
                }`}
              >
                <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center cursor-pointer ${
                  exercise.completed
                    ? 'bg-tier-success border-0'
                    : 'bg-tier-white border-2 border-tier-border-default'
                }`}>
                  {exercise.completed && <CheckCircle size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className={`text-[13px] ${
                    exercise.completed ? 'text-tier-text-secondary line-through' : 'text-tier-navy'
                  }`}>
                    {exercise.name}
                  </div>
                  {exercise.notes && (
                    <div className="text-[11px] text-tier-text-secondary">
                      {exercise.notes}
                    </div>
                  )}
                </div>
                <span className="text-xs text-tier-text-secondary bg-tier-white py-1 px-2 rounded-md">
                  {exercise.reps}
                </span>
              </div>
            ))}
          </div>

          {/* Trackman Data (if available) */}
          {session.trackmanData && (
            <div className="mt-3 p-3 bg-tier-navy/10 rounded-[10px]">
              <div className="text-xs font-semibold text-tier-navy mb-2 flex items-center gap-1.5">
                <Video size={14} />
                TrackMan Data
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(session.trackmanData).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm font-semibold text-tier-navy">
                      {value}
                    </div>
                    <div className="text-[10px] text-tier-text-secondary">
                      {key.replace('avg', 'Avg ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {session.status === 'pending' && (
            <Button
              variant="primary"
              leftIcon={<Play size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onStart(session.id);
              }}
              className="w-full mt-3 justify-center"
            >
              Start session
            </Button>
          )}
          {session.status === 'in_progress' && (
            <Button
              variant="primary"
              leftIcon={<CheckCircle size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(session.id);
              }}
              className="w-full mt-3 justify-center !bg-tier-success"
            >
              Mark as completed
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DagensTreningsplanContainer = () => {
  const [plan, setPlan] = useState(TODAY_PLAN);

  const progressPercent = Math.round((plan.completedDuration / plan.totalDuration) * 100);
  const completedSessions = plan.sessions.filter(s => s.status === 'completed').length;

  const handleStartSession = (sessionId) => {
    setPlan(prev => ({
      ...prev,
      sessions: prev.sessions.map(s =>
        s.id === sessionId ? { ...s, status: 'in_progress' } : s
      ),
    }));
  };

  const handleCompleteSession = (sessionId) => {
    setPlan(prev => {
      const session = prev.sessions.find(s => s.id === sessionId);
      return {
        ...prev,
        completedDuration: prev.completedDuration + (session?.duration || 0),
        sessions: prev.sessions.map(s =>
          s.id === sessionId
            ? { ...s, status: 'completed', exercises: s.exercises.map(e => ({ ...e, completed: true })) }
            : s
        ),
      };
    });
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Today's training plan"
        subtitle="Overview of planned sessions for today"
        helpText="Complete overview of today's training plan with all planned sessions. See today's theme, total duration, progress and completion rate. Start sessions directly, mark as completed and track execution. Read the coach note for today's focus areas and priorities."
      />
      {/* Context info - theme and day */}
      <div className="text-[13px] text-tier-text-secondary mb-4">
        {plan.dayName.charAt(0).toUpperCase() + plan.dayName.slice(1)} - {plan.theme}
      </div>

      {/* Two-column layout: Sessions left, Coach note top-right */}
      <div className="grid grid-cols-[1fr_320px] gap-6 mb-5">
        {/* Left column: Progress Overview */}
        <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionTitle className="text-lg m-0">
                Today's progress
              </SectionTitle>
              <div className="text-[13px] text-tier-text-secondary mt-0.5">
                {completedSessions}/{plan.sessions.length} sessions completed
              </div>
            </div>
            <div className={`text-[28px] font-bold ${
              progressPercent >= 100 ? 'text-tier-success' : 'text-tier-navy'
            }`}>
              {progressPercent}%
            </div>
          </div>

          <div className="h-2 bg-tier-surface-base rounded overflow-hidden">
            <div
              className={`h-full rounded transition-[width] duration-500 ${
                progressPercent >= 100 ? 'bg-tier-success' : 'bg-tier-navy'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-xs text-tier-text-secondary">
            <span>{plan.completedDuration} min completed</span>
            <span>{plan.totalDuration - plan.completedDuration} min remaining</span>
          </div>
        </div>

        {/* Right column: Coach Note (top-right position) */}
        {plan.coachNote && (
          <div className="bg-tier-navy/10 rounded-xl p-4 border-l-4 border-tier-navy self-start">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={16} className="text-tier-navy" />
              <span className="text-[13px] font-semibold text-tier-navy">
                Message from coach
              </span>
            </div>
            <p className="text-[13px] text-tier-navy m-0 leading-relaxed">
              {plan.coachNote}
            </p>
          </div>
        )}
      </div>

      {/* Today's Goals */}
      <div className="bg-tier-white rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-tier-warning" />
          <span className="text-[13px] font-semibold text-tier-navy">
            Today's goals
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {plan.goals.map((goal, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-[13px] text-tier-navy"
            >
              <Target size={12} className="text-tier-warning" />
              {goal}
            </div>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <SectionTitle className="text-base m-0 mb-4">
        Sessions
      </SectionTitle>

      <div className="flex flex-col gap-3">
        {plan.sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onStart={handleStartSession}
            onComplete={handleCompleteSession}
          />
        ))}
      </div>

      {/* Add Custom Exercise */}
      <Button
        variant="secondary"
        leftIcon={<Plus size={18} />}
        className="w-full mt-4 justify-center border-2 border-dashed border-tier-border-default !bg-transparent"
      >
        Add custom session
      </Button>
    </div>
  );
};

export default DagensTreningsplanContainer;
