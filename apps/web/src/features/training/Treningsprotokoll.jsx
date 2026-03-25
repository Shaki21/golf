/**
 * TrainingProtocol.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import Button from '../../ui/primitives/Button';
import {
  TeknikIcon, GolfslagIcon, SpillIcon, KonkurranseIcon,
  FysiskIcon, MentalIcon, GolfScorecard
} from '../../components/icons';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const SESSION_CATEGORY_CLASSES = {
  teknikk: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
  },
  golfslag: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
  },
  spill: {
    text: 'text-tier-warning',
    bg: 'bg-tier-warning/15',
  },
  konkurranse: {
    text: 'text-amber-500',
    bg: 'bg-amber-500/15',
  },
  fysisk: {
    text: 'text-tier-error',
    bg: 'bg-tier-error/15',
  },
  mental: {
    text: 'text-tier-text-secondary',
    bg: 'bg-tier-surface-base',
  },
};

const LEVEL_CLASSES = {
  L1: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary', label: 'L1 · Exposure' },
  L2: { bg: 'bg-tier-border-default', text: 'text-tier-navy', label: 'L2 · Fundamentals' },
  L3: { bg: 'bg-tier-success/20', text: 'text-tier-success', label: 'L3 · Variation' },
  L4: { bg: 'bg-tier-success', text: 'text-white', label: 'L4 · Timing' },
  L5: { bg: 'bg-tier-navy', text: 'text-white', label: 'L5 · Automatic' },
};

const SPEED_CLASSES = {
  CS0: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary', label: 'CS0 · N/A' },
  CS20: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary', label: 'CS20 · 20%' },
  CS40: { bg: 'bg-tier-border-default', text: 'text-tier-navy', label: 'CS40 · 40%' },
  CS60: { bg: 'bg-tier-success/20', text: 'text-tier-success', label: 'CS60 · 60%' },
  CS70: { bg: 'bg-tier-success', text: 'text-white', label: 'CS70 · 70%' },
  CS80: { bg: 'bg-tier-navy/80', text: 'text-white', label: 'CS80 · 80%' },
  CS100: { bg: 'bg-tier-navy', text: 'text-white', label: 'CS100 · Max' },
};

// ===== ICONS =====
const Icons = {
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  ),
  Pause: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),
  Target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Repeat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17,1 21,5 17,9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7,23 3,19 7,15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  Video: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23,7 16,12 23,17"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  SkipForward: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5,4 15,12 5,20"/>
      <line x1="19" y1="5" x2="19" y2="19"/>
    </svg>
  ),
};

// ===== UI COMPONENTS =====
const Card = ({ children, className = '', padding = true }) => (
  <div className={`bg-white border border-tier-surface-base rounded-xl shadow-sm ${padding ? 'p-4' : ''} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'neutral', size = 'sm' }) => {
  const variants = {
    neutral: 'bg-gray-100 text-gray-600',
    accent: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-[13px]',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};


// ===== LEVEL TAG COMPONENT =====
const LevelTag = ({ level }) => {
  const classes = LEVEL_CLASSES[level] || LEVEL_CLASSES.L3;

  return (
    <span className={`px-2 py-1 rounded-md text-[11px] font-medium ${classes.bg} ${classes.text}`}>
      {classes.label}
    </span>
  );
};

const SpeedTag = ({ speed }) => {
  const classes = SPEED_CLASSES[speed] || SPEED_CLASSES.CS60;

  return (
    <span className={`px-2 py-1 rounded-md text-[11px] font-medium ${classes.bg} ${classes.text}`}>
      {classes.label}
    </span>
  );
};

const SettingTag = ({ setting }) => {
  const config = {
    S1: { label: 'S1 · Range perfect' },
    S2: { label: 'S2 · Range target' },
    S3: { label: 'S3 · Short course' },
    S4: { label: 'S4 · 9-hole practice' },
    S5: { label: 'S5 · 18-hole practice' },
    S6: { label: 'S6 · Internal competition' },
    S7: { label: 'S7 · External club' },
    S8: { label: 'S8 · Low-stakes tournament' },
    S9: { label: 'S9 · Important tournament' },
    S10: { label: 'S10 · High-stakes' },
  };

  const { label } = config[setting] || { label: setting };

  return (
    <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-tier-gold/10 text-tier-gold">
      {label}
    </span>
  );
};

// ===== MAIN TRAINING PROTOCOL COMPONENT =====
const TIERGolfTrainingProtocol = ({ sessions: apiSessions = [], player: apiPlayer = null }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeExercise, setActiveExercise] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Player profile - use API data if available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const player = apiPlayer || {
    name: 'John Smith',
    category: 'B',
  };

  // Training sessions library (demo data)
  const trainingSessions = [
    {
      id: 1,
      name: 'Driver Technique - Fundamentals',
      category: 'teknikk',
      level: 'L2',
      speed: 'CS40',
      setting: 'S1',
      duration: 60,
      focus: ['Grip', 'Stance', 'Backswing'],
      description: 'Focus on fundamental driver technique with slow swings to build correct patterns.',
      exercises: [
        { id: 1, name: 'Warm-up - Rotation', duration: 5, reps: null, description: 'Dynamic stretching for shoulders and hips' },
        { id: 2, name: 'Grip check', duration: 3, reps: 10, description: 'Correct grip with V toward right shoulder' },
        { id: 3, name: 'Stance & Alignment', duration: 5, reps: null, description: 'Check shoulder width, ball position and alignment' },
        { id: 4, name: 'L1 - Body only', duration: 10, reps: 20, description: 'Swing without club, focus on rotation' },
        { id: 5, name: 'L2 - Body + arms', duration: 10, reps: 20, description: 'Half swing with focus on arm sync' },
        { id: 6, name: 'Full swing CS40', duration: 15, reps: 30, description: 'Full swing at 40% speed' },
        { id: 7, name: 'Video analysis', duration: 5, reps: 3, description: 'Film 3 swings for analysis' },
        { id: 8, name: 'Cool-down', duration: 7, reps: null, description: 'Static stretching and reflection' },
      ],
      icon: TeknikIcon,
    },
    {
      id: 2,
      name: 'Putting Lab - Distance Control',
      category: 'golfslag',
      level: 'L4',
      speed: 'CS100',
      setting: 'S3',
      duration: 45,
      focus: ['Lag control', 'Distance control', 'Tempo'],
      description: 'Develop consistent distance control on putting with focus on tempo and follow-through.',
      exercises: [
        { id: 1, name: 'Warm-up', duration: 5, reps: 20, description: 'Rolling drill 1-2 meters' },
        { id: 2, name: '3m Lag control', duration: 8, reps: 15, description: 'Putt to 3m, focus on remaining distance' },
        { id: 3, name: '6m Lag control', duration: 8, reps: 15, description: 'Putt to 6m, goal: within 60cm' },
        { id: 4, name: '9m Lag control', duration: 8, reps: 15, description: 'Putt to 9m, goal: within 90cm' },
        { id: 5, name: 'Ladder Drill', duration: 10, reps: 10, description: 'Putt to 3, 6, 9, 12m in sequence' },
        { id: 6, name: 'Pressure Putts', duration: 6, reps: 10, description: 'Elimination: miss = start over' },
      ],
      icon: GolfslagIcon,
    },
    {
      id: 3,
      name: 'Physical - Golf Strength',
      category: 'fysisk',
      level: 'L3',
      speed: 'CS0',
      setting: 'S1',
      duration: 45,
      focus: ['Rotational power', 'Leg strength', 'Core'],
      description: 'Golf-specific strength training with focus on rotational power and explosiveness.',
      exercises: [
        { id: 1, name: 'Warm-up', duration: 8, reps: null, description: 'Light cardio and dynamic stretching' },
        { id: 2, name: 'Rotational throws', duration: 6, reps: 12, description: '4kg medicine ball, both sides' },
        { id: 3, name: 'Goblet Squat', duration: 5, reps: 12, description: '3 sets with moderate weight' },
        { id: 4, name: 'Cable Rotation', duration: 6, reps: 15, description: 'Both sides, controlled tempo' },
        { id: 5, name: 'Single-leg RDL', duration: 5, reps: 10, description: 'With kettlebell, both sides' },
        { id: 6, name: 'Pallof Press', duration: 5, reps: 12, description: 'Anti-rotation, both sides' },
        { id: 7, name: 'Plank variation', duration: 5, reps: null, description: '45 sec front, 30 sec side' },
        { id: 8, name: 'Cool-down', duration: 5, reps: null, description: 'Static stretching' },
      ],
      icon: FysiskIcon,
    },
    {
      id: 4,
      name: 'Short Game - Pitch & Chip',
      category: 'golfslag',
      level: 'L3',
      speed: 'CS60',
      setting: 'S3',
      duration: 60,
      focus: ['Pitch 30-60m', 'Chip around green', 'Lie variation'],
      description: 'Varied short game practice with different lies and distances.',
      exercises: [
        { id: 1, name: 'Warm-up', duration: 5, reps: null, description: 'Light stretching and short swings' },
        { id: 2, name: 'Chip - Bump & Run', duration: 10, reps: 20, description: '7-iron, 5-15m to hole' },
        { id: 3, name: 'Pitch 30m', duration: 10, reps: 15, description: 'SW/LW, focus on landing spot' },
        { id: 4, name: 'Pitch 50m', duration: 10, reps: 15, description: 'GW/PW, vary backswing' },
        { id: 5, name: 'Flop Shot', duration: 8, reps: 10, description: 'Open clubface, high arc' },
        { id: 6, name: 'Lie variation', duration: 10, reps: 15, description: 'Tight lie, rough, uphill/downhill' },
        { id: 7, name: 'Par-saving drill', duration: 7, reps: 9, description: '9 hole simulation' },
      ],
      icon: GolfslagIcon,
    },
    {
      id: 5,
      name: 'Mental - Focus & Routines',
      category: 'mental',
      level: 'L2',
      speed: 'CS0',
      setting: 'S1',
      duration: 30,
      focus: ['Pre-shot routine', 'Breathing', 'Visualization'],
      description: 'Mental training with focus on building consistent routines and focus techniques.',
      exercises: [
        { id: 1, name: 'Breathing technique', duration: 5, reps: null, description: '4-7-8 technique for calm' },
        { id: 2, name: 'Pre-shot routine design', duration: 8, reps: null, description: 'Define 5-step routine' },
        { id: 3, name: 'Visualization', duration: 7, reps: 5, description: 'Visualize perfect shot' },
        { id: 4, name: 'Routine practice', duration: 5, reps: 10, description: 'Repeat routine with timing' },
        { id: 5, name: 'Distraction training', duration: 5, reps: 5, description: 'Maintain focus with distractions' },
      ],
      icon: MentalIcon,
    },
    {
      id: 6,
      name: 'Iron Technique - L3 Variation',
      category: 'teknikk',
      level: 'L3',
      speed: 'CS70',
      setting: 'S2',
      duration: 75,
      focus: ['High/low shots', 'Draw/Fade', 'Lie variation'],
      description: 'Advanced iron practice with focus on shot variation and lie adaptation.',
      exercises: [
        { id: 1, name: 'Warm-up', duration: 8, reps: null, description: 'Progressive warm-up' },
        { id: 2, name: 'Stock shot 7-iron', duration: 10, reps: 20, description: 'Standard shot to target' },
        { id: 3, name: 'Low punch', duration: 10, reps: 15, description: 'Ball back, hands forward' },
        { id: 4, name: 'High fade', duration: 10, reps: 15, description: 'Open stance, high finish' },
        { id: 5, name: 'Low draw', duration: 10, reps: 15, description: 'Closed stance, low finish' },
        { id: 6, name: 'Uphill/Downhill', duration: 12, reps: 20, description: 'Simulate sloping lies' },
        { id: 7, name: 'Random targets', duration: 10, reps: 15, description: 'Vary target each time' },
        { id: 8, name: 'Cool-down', duration: 5, reps: null, description: 'Stretch and reflection' },
      ],
      icon: TeknikIcon,
    },
  ];

  // Transform API sessions to internal format
  const transformApiSessions = (apiData) => {
    if (!apiData || apiData.length === 0) return demoTrainingSessions;

    return apiData.map((session, index) => {
      // Map API session type to category
      const categoryMap = {
        'technique': 'teknikk',
        'teknikk': 'teknikk',
        'golf_shots': 'golfslag',
        'golfslag': 'golfslag',
        'physical': 'fysisk',
        'fysisk': 'fysisk',
        'mental': 'mental',
        'play': 'spill',
        'spill': 'spill',
        'competition': 'konkurranse',
        'konkurranse': 'konkurranse',
      };

      const iconMap = {
        'teknikk': TeknikIcon,
        'golfslag': GolfslagIcon,
        'fysisk': FysiskIcon,
        'mental': MentalIcon,
        'spill': SpillIcon,
        'konkurranse': KonkurranseIcon,
      };

      const category = categoryMap[session.type?.toLowerCase()] || 'teknikk';

      return {
        id: session.id || index + 1,
        name: session.name || session.title || `Training session ${index + 1}`,
        category: category,
        level: session.level || 'L3',
        speed: session.speed || 'CS60',
        setting: session.setting || 'S1',
        duration: session.duration || 60,
        focus: session.focus || session.focusAreas || ['General'],
        description: session.description || '',
        exercises: session.exercises || session.blocks?.flatMap(block =>
          block.exercises?.map((ex, i) => ({
            id: ex.id || i + 1,
            name: ex.name || ex.title,
            duration: ex.duration || 5,
            reps: ex.reps || null,
            description: ex.description || ex.notes || ''
          }))
        ) || [],
        icon: iconMap[category] || GolfScorecard,
      };
    });
  };

  // Category labels in English
  const categoryLabels = {
    teknikk: 'Technique',
    golfslag: 'Golf shots',
    fysisk: 'Physical',
    mental: 'Mental',
    spill: 'Play',
    konkurranse: 'Competition',
  };

  // Use API sessions if available, otherwise use demo data
  const demoTrainingSessions = trainingSessions;
  const displaySessions = apiSessions && apiSessions.length > 0
    ? transformApiSessions(apiSessions)
    : demoTrainingSessions;

  // Update session categories based on actual data
  const computedCategories = [
    { id: 'all', label: 'All sessions', count: displaySessions.length },
    ...['teknikk', 'golfslag', 'fysisk', 'mental', 'spill', 'konkurranse']
      .map(cat => ({
        id: cat,
        label: categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
        count: displaySessions.filter(s => s.category === cat).length
      }))
      .filter(cat => cat.count > 0)
  ];

  // Get session category classes
  const getSessionClasses = (category) => {
    return SESSION_CATEGORY_CLASSES[category] || SESSION_CATEGORY_CLASSES.teknikk;
  };

  // Filter sessions based on selected category
  const filteredSessions = selectedCategory === 'all'
    ? displaySessions
    : displaySessions.filter(s => s.category === selectedCategory);

  // Handle exercise completion
  const toggleExerciseComplete = (exerciseId) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  // Calculate session progress
  const getSessionProgress = (session) => {
    if (!session) return 0;
    const completed = session.exercises.filter(e => completedExercises.includes(e.id)).length;
    return Math.round((completed / session.exercises.length) * 100);
  };

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header with tabs */}
      <PageHeader
        title="Training Plan"
        subtitle="Your weekly training calendar"
        helpText="Log and document training sessions with details about exercises, duration and intensity."
        tabs={{
          items: [
            {
              id: 'day',
              label: 'Day',
              content: (
                <PageContainer paddingY="md" background="base">
                  <div className="text-center py-12">
                    <p className="text-tier-text-tertiary">Day view coming soon</p>
                  </div>
                </PageContainer>
              ),
            },
            {
              id: 'week',
              label: 'Week',
              content: (
      <div className="p-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Session Library */}
          <div className="lg:col-span-1">
            <SectionTitle className="mb-4">Session Library</SectionTitle>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {computedCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-tier-navy text-white'
                      : 'bg-white text-tier-navy border border-tier-surface-base hover:bg-tier-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              {filteredSessions.map(session => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSession?.id === session.id ? 'ring-2 ring-tier-navy' : ''
                  }`}
                  onClick={() => {
                    setSelectedSession(session);
                    setActiveExercise(0);
                    setCompletedExercises([]);
                    setIsPlaying(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${getSessionClasses(session.category).bg}`}
                    >
                      {session.icon && <session.icon size={24} className={getSessionClasses(session.category).text} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <SubSectionTitle className="text-[14px] line-clamp-1">{session.name}</SubSectionTitle>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-tier-text-secondary">
                        <Icons.Clock />
                        <span>{session.duration} min</span>
                        <span>·</span>
                        <span>{session.exercises.length} exercises</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <LevelTag level={session.level} />
                        <SpeedTag speed={session.speed} />
                      </div>
                    </div>
                    <Icons.ChevronRight />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Session Detail */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <>
                {/* Session Header */}
                <Card className="mb-4 bg-gradient-to-r from-tier-navy to-tier-navy-light text-white border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedSession.icon && <selectedSession.icon size={28} className="text-white/80" />}
                        <SectionTitle className="text-[20px] text-white">{selectedSession.name}</SectionTitle>
                      </div>
                      <p className="text-white/70 text-[13px] mb-3">{selectedSession.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <LevelTag level={selectedSession.level} />
                        <SpeedTag speed={selectedSession.speed} />
                        <SettingTag setting={selectedSession.setting} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[11px] uppercase">Duration</p>
                      <p className="text-[24px] font-bold">{selectedSession.duration}m</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-white/70">Progress</span>
                      <span className="text-[12px] font-medium">{getSessionProgress(selectedSession)}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${getSessionProgress(selectedSession)}%` }}
                      />
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className="flex items-center gap-2">
                    <Icons.Target />
                    <span className="text-[12px] text-white/70">Focus:</span>
                    {selectedSession.focus.map((f, i) => (
                      <Badge key={i} variant="neutral" size="sm">
                        <span className="text-tier-navy">{f}</span>
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Playback Controls */}
                <Card className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isPlaying ? 'bg-tier-error text-white' : 'bg-tier-navy text-white'
                        }`}
                      >
                        {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                      </button>
                      <div>
                        <p className="text-[14px] font-semibold text-tier-navy">
                          {selectedSession.exercises[activeExercise]?.name || 'Ready to start'}
                        </p>
                        <p className="text-[12px] text-tier-text-secondary">
                          Exercise {activeExercise + 1} of {selectedSession.exercises.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveExercise(Math.max(0, activeExercise - 1))}
                        disabled={activeExercise === 0}
                        className="p-2 rounded-lg border border-tier-surface-base disabled:opacity-50"
                      >
                        <span className="rotate-180 inline-block"><Icons.ChevronRight /></span>
                      </button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Icons.Check />}
                        onClick={() => {
                          toggleExerciseComplete(selectedSession.exercises[activeExercise].id);
                          if (activeExercise < selectedSession.exercises.length - 1) {
                            setActiveExercise(activeExercise + 1);
                          }
                        }}
                        className="!bg-tier-success hover:!bg-tier-success/90"
                      >
                        Complete
                      </Button>
                      <button
                        onClick={() => setActiveExercise(Math.min(selectedSession.exercises.length - 1, activeExercise + 1))}
                        disabled={activeExercise === selectedSession.exercises.length - 1}
                        className="p-2 rounded-lg border border-tier-surface-base disabled:opacity-50"
                      >
                        <Icons.SkipForward />
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Exercise List */}
                <SubSectionTitle className="text-[15px] mb-3">Exercises</SubSectionTitle>
                <div className="space-y-2">
                  {selectedSession.exercises.map((exercise, idx) => {
                    const isActive = idx === activeExercise;
                    const isCompleted = completedExercises.includes(exercise.id);

                    return (
                      <Card
                        key={exercise.id}
                        className={`cursor-pointer transition-all ${
                          isActive ? 'ring-2 ring-tier-navy bg-tier-navy/5' : ''
                        } ${isCompleted ? 'opacity-60' : ''}`}
                        onClick={() => setActiveExercise(idx)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <div className="w-8 h-8 rounded-full bg-tier-success flex items-center justify-center text-white">
                                <Icons.Check />
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] font-bold ${
                                isActive ? 'border-tier-navy text-tier-navy' : 'border-tier-surface-base text-tier-text-secondary'
                              }`}>
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <CardTitle className={`text-[14px] ${isCompleted ? 'line-through text-tier-text-secondary' : ''}`}>
                                {exercise.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-[11px] text-tier-text-secondary">
                                <Icons.Clock />
                                {exercise.duration} min
                                {exercise.reps && (
                                  <>
                                    <span>·</span>
                                    <Icons.Repeat />
                                    {exercise.reps}x
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-[12px] text-tier-text-secondary">{exercise.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <StateCard
                variant="empty"
                title="Select a training session"
                description="Click on a session in the list to see details and start training."
              />
            )}
          </div>
        </div>
      </div>
              ),
            },
          ],
        }}
      />
    </div>
  );
};

export default TIERGolfTrainingProtocol;
