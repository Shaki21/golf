/**
 * LoggTreningContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * Based on AK-formula hierarchy v2.0
 * Pyramid: FYS → TEK → SLAG → SPILL → TURN
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Clock, Target, Dumbbell, Brain, Trophy,
  Star, Save, X
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { sessionsAPI } from '../../services/api';
import { SubSectionTitle } from '../../components/typography';
import { TrainingCategoryBadge } from '../../components/shadcn/golf';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// AK-FORMEL CLASS MAPPINGS
// ============================================================================

// Training pyramid: FYS → TEK → SLAG → SPILL → TURN
const SESSION_TYPE_CLASSES = {
  FYS: {
    text: 'text-orange-600',
    bg: 'bg-orange-100',
    activeBg: 'bg-orange-600',
    border: 'border-orange-600',
    icon: Dumbbell,
    label: 'Physical',
    description: 'Strength, power, mobility',
  },
  TEK: {
    text: 'text-purple-600',
    bg: 'bg-purple-100',
    activeBg: 'bg-purple-600',
    border: 'border-purple-600',
    icon: Target,
    label: 'Technique',
    description: 'Movement patterns, positions',
  },
  SLAG: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-100',
    activeBg: 'bg-emerald-600',
    border: 'border-emerald-600',
    icon: Target,
    label: 'Golf Shots',
    description: 'Shot quality, accuracy',
  },
  SPILL: {
    text: 'text-blue-600',
    bg: 'bg-blue-100',
    activeBg: 'bg-blue-600',
    border: 'border-blue-600',
    icon: Target,
    label: 'Play',
    description: 'Strategy, course management',
  },
  TURN: {
    text: 'text-tier-gold',
    bg: 'bg-amber-100',
    activeBg: 'bg-tier-gold',
    border: 'border-tier-gold',
    icon: Trophy,
    label: 'Tournament',
    description: 'Mental performance, pressure',
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

// Map pyramid codes to TrainingCategoryBadge format
const PYRAMID_TO_CATEGORY = {
  FYS: 'fysisk',
  TEK: 'teknikk',
  SLAG: 'slag',
  SPILL: 'spill',
  TURN: 'turnering',
};

const SESSION_TYPES = Object.entries(SESSION_TYPE_CLASSES).map(([id, config]) => ({
  id,
  label: config.label,
  icon: config.icon,
}));

const QUICK_EXERCISES = [
  // FYS - Physical
  { id: 'gym', name: 'Strength Training', type: 'FYS', duration: 60 },
  { id: 'flexibility', name: 'Mobility', type: 'FYS', duration: 30 },
  { id: 'power', name: 'Power', type: 'FYS', duration: 45 },
  // TEK - Technique
  { id: 'swing', name: 'Swing Technique', type: 'TEK', duration: 45 },
  { id: 'positions', name: 'P-Positions', type: 'TEK', duration: 30 },
  // SLAG - Golf Shots
  { id: 'tee', name: 'Tee (Driver)', type: 'SLAG', duration: 45 },
  { id: 'inn100', name: 'Approach 100-150m', type: 'SLAG', duration: 45 },
  { id: 'chip', name: 'Chip/Pitch', type: 'SLAG', duration: 30 },
  { id: 'putting', name: 'Putting', type: 'SLAG', duration: 30 },
  { id: 'bunker', name: 'Bunker', type: 'SLAG', duration: 30 },
  // SPILL - Play
  { id: 'course', name: 'Course Training', type: 'SPILL', duration: 120 },
  { id: 'strategy', name: 'Strategy', type: 'SPILL', duration: 60 },
  // TURN - Tournament
  { id: 'competition', name: 'Competition Training', type: 'TURN', duration: 90 },
  { id: 'pressure', name: 'Pressure Training', type: 'TURN', duration: 60 },
];

const RECENT_LOGS = [
  {
    id: 'r1',
    date: '2025-01-18',
    type: 'SLAG',
    name: 'TEE and INN150 training',
    duration: 90,
    rating: 4,
  },
  {
    id: 'r2',
    date: '2025-01-17',
    type: 'SLAG',
    name: 'Chip and putting',
    duration: 75,
    rating: 5,
  },
  {
    id: 'r3',
    date: '2025-01-15',
    type: 'FYS',
    name: 'Strength and power',
    duration: 60,
    rating: 4,
  },
];

// Training Categories (from category system)
const TRAINING_CATEGORIES = {
  fullSwing: {
    label: 'Full Swing',
    categories: [
      { code: 'TEE', label: 'Tee Total', description: 'Driver, 3-wood' },
      { code: 'INN200', label: 'Approach 200+', description: '3-wood, hybrid, long iron' },
      { code: 'INN150', label: 'Approach 150-200', description: '5-7 iron' },
      { code: 'INN100', label: 'Approach 100-150', description: '8-PW' },
      { code: 'INN50', label: 'Approach 50-100', description: 'Wedges (full swing)' },
    ],
  },
  shortGame: {
    label: 'Short Game',
    categories: [
      { code: 'CHIP', label: 'Chip', description: 'Low trajectory, lots of roll' },
      { code: 'PITCH', label: 'Pitch', description: 'Medium trajectory, medium roll' },
      { code: 'LOB', label: 'Lob', description: 'High trajectory, little roll' },
      { code: 'BUNKER', label: 'Bunker', description: 'Sand, greenside' },
    ],
  },
  putting: {
    label: 'Putting',
    categories: [
      { code: 'PUTT0-3', label: '0-3 ft', description: 'Tap-ins' },
      { code: 'PUTT3-5', label: '3-5 ft', description: 'Short' },
      { code: 'PUTT5-10', label: '5-10 ft', description: 'Medium' },
      { code: 'PUTT10-15', label: '10-15 ft', description: 'Medium-long' },
      { code: 'PUTT15-25', label: '15-25 ft', description: 'Long' },
      { code: 'PUTT25-40', label: '25-40 ft', description: 'Lag putts' },
      { code: 'PUTT40+', label: '40+ ft', description: 'Extra long' },
    ],
  },
};

// L-Phases (Motor Learning)
const L_PHASES = [
  { code: 'L-BODY', label: 'Body', description: 'Body movement only, no equipment', csRange: 'CS0' },
  { code: 'L-ARM', label: 'Arm', description: 'Body + arms, no club/ball', csRange: 'CS0' },
  { code: 'L-CLUB', label: 'Club', description: 'Body + arms + club, no ball', csRange: 'CS20-40' },
  { code: 'L-BALL', label: 'Ball', description: 'Everything included, low speed', csRange: 'CS40-60' },
  { code: 'L-AUTO', label: 'Auto', description: 'Full speed, automated', csRange: 'CS70-100' },
];

// CS-Levels (Clubspeed)
const CS_LEVELS = [
  { code: 'CS0', value: 0, label: '0%', description: 'Physical training (off-course)' },
  { code: 'CS20', value: 20, label: '20%', description: 'Extremely slow, position only' },
  { code: 'CS30', value: 30, label: '30%', description: 'Very slow' },
  { code: 'CS40', value: 40, label: '40%', description: 'Slow' },
  { code: 'CS50', value: 50, label: '50%', description: 'Half speed' },
  { code: 'CS60', value: 60, label: '60%', description: 'Slightly over half speed' },
  { code: 'CS70', value: 70, label: '70%', description: 'Medium' },
  { code: 'CS80', value: 80, label: '80%', description: 'Almost full' },
  { code: 'CS90', value: 90, label: '90%', description: 'Almost max' },
  { code: 'CS100', value: 100, label: '100%', description: 'Full speed' },
];

// M-Environment (Physical context)
const M_ENVIRONMENTS = [
  { code: 'M0', label: 'Off-course', description: 'Gym, home, not golf-specific' },
  { code: 'M1', label: 'Indoor', description: 'Net, simulator, Trackman' },
  { code: 'M2', label: 'Range', description: 'Outdoor, mat or grass' },
  { code: 'M3', label: 'Practice Area', description: 'Short course, chipping green, putting green' },
  { code: 'M4', label: 'Course Training', description: 'Practice round on course' },
  { code: 'M5', label: 'Course Tournament', description: 'Tournament round' },
];

// PR-Press (Physical & Mental load)
const PR_LEVELS = [
  { code: 'PR1', label: 'None', description: 'Exploratory, no consequence' },
  { code: 'PR2', label: 'Self-monitoring', description: 'Targets, tracking, but no social' },
  { code: 'PR3', label: 'Social', description: 'With others, observed' },
  { code: 'PR4', label: 'Competition', description: 'Stakes, playing against others' },
  { code: 'PR5', label: 'Tournament', description: 'Results count, ranking' },
];

// ============================================================================
// SESSION TYPE SELECTOR
// ============================================================================

const SessionTypeSelector = ({ selected, onSelect }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 mb-6">
    {SESSION_TYPES.map((type) => {
      const classes = SESSION_TYPE_CLASSES[type.id];
      const Icon = type.icon;
      const isSelected = selected === type.id;

      return (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            isSelected
              ? `${classes.border} ${classes.bg}`
              : 'border-transparent bg-tier-white'
          }`}
        >
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
            isSelected ? classes.activeBg : classes.bg
          }`}>
            <Icon size={20} className={isSelected ? 'text-white' : classes.text} />
          </div>
          <span className={`text-xs font-medium ${
            isSelected ? classes.text : 'text-tier-navy'
          }`}>
            {type.label}
          </span>
        </button>
      );
    })}
  </div>
);

// ============================================================================
// STANDARD SESSION SUGGESTIONS
// ============================================================================

const STANDARD_SESSIONS = [
  { id: 'driving-range', name: 'Driving Range', duration: 90, description: 'Full swing training with driver and irons' },
  { id: 'short-game', name: 'Short Game', duration: 60, description: 'Chip, pitch, and bunker' },
  { id: 'putting-practice', name: 'Putting', duration: 45, description: 'Green practice and lag putts' },
  { id: 'full-round', name: 'Full Round', duration: 240, description: '18 holes with focus' },
  { id: 'physical', name: 'Physical Training', duration: 60, description: 'Strength, mobility, power' },
];

const StandardSessionSuggestions = ({ onSelect }) => {
  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm m-0 mb-3">
        Select standard session
      </SubSectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {STANDARD_SESSIONS.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelect(session)}
            className="py-3 px-4 rounded-lg border border-tier-border-default bg-tier-surface-base text-left cursor-pointer transition-all duration-200 hover:bg-tier-border-default hover:border-tier-navy"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-tier-navy">
                {session.name}
              </span>
              <span className="text-[11px] text-tier-text-secondary">
                {session.duration} min
              </span>
            </div>
            <p className="text-[11px] text-tier-text-tertiary mt-1">
              {session.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY SELECTOR
// ============================================================================

const CategorySelector = ({ selectedCategories, onToggle }) => {
  // Flatten all categories for display
  const allCategories = [
    ...TRAINING_CATEGORIES.fullSwing.categories,
    ...TRAINING_CATEGORIES.shortGame.categories,
    ...TRAINING_CATEGORIES.putting.categories,
  ];

  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm m-0 mb-3">
        Categories
      </SubSectionTitle>

      {/* Full Swing */}
      <div className="mb-4">
        <div className="text-xs font-medium text-tier-text-secondary mb-2">
          {TRAINING_CATEGORIES.fullSwing.label}
        </div>
        <div className="flex gap-2 flex-wrap">
          {TRAINING_CATEGORIES.fullSwing.categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => onToggle(cat.code)}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1 transition-all duration-200 ${
                selectedCategories.includes(cat.code)
                  ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                  : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategories.includes(cat.code) && (
                <X size={14} className="ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Short Game */}
      <div className="mb-4">
        <div className="text-xs font-medium text-tier-text-secondary mb-2">
          {TRAINING_CATEGORIES.shortGame.label}
        </div>
        <div className="flex gap-2 flex-wrap">
          {TRAINING_CATEGORIES.shortGame.categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => onToggle(cat.code)}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1 transition-all duration-200 ${
                selectedCategories.includes(cat.code)
                  ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                  : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategories.includes(cat.code) && (
                <X size={14} className="ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Putting */}
      <div>
        <div className="text-xs font-medium text-tier-text-secondary mb-2">
          {TRAINING_CATEGORIES.putting.label}
        </div>
        <div className="flex gap-2 flex-wrap">
          {TRAINING_CATEGORIES.putting.categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => onToggle(cat.code)}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1 transition-all duration-200 ${
                selectedCategories.includes(cat.code)
                  ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                  : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategories.includes(cat.code) && (
                <X size={14} className="ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// L-PHASE SELECTOR
// ============================================================================

const LPhaseSelector = ({ selectedPhase, onSelect }) => {
  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm m-0 mb-3">
        L-Phase (Motor Learning)
      </SubSectionTitle>
      <div className="flex gap-2 flex-wrap">
        {L_PHASES.map((phase) => (
          <button
            key={phase.code}
            onClick={() => onSelect(phase.code)}
            className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 ${
              selectedPhase === phase.code
                ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
            }`}
          >
            {phase.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// M-ENVIRONMENT SELECTOR
// ============================================================================

const MEnvironmentSelector = ({ selectedEnvironment, onSelect }) => {
  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm m-0 mb-3">
        M-Environment (Training Location)
      </SubSectionTitle>
      <div className="flex gap-2 flex-wrap">
        {M_ENVIRONMENTS.map((env) => (
          <button
            key={env.code}
            onClick={() => onSelect(env.code)}
            className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 ${
              selectedEnvironment === env.code
                ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
            }`}
          >
            {env.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CS-LEVEL SELECTOR
// ============================================================================

const CSLevelSelector = ({ selectedLevel, onSelect }) => {
  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm m-0 mb-3">
        CS-Level (Clubspeed)
      </SubSectionTitle>
      <div className="flex gap-2 flex-wrap">
        {CS_LEVELS.map((level) => (
          <button
            key={level.code}
            onClick={() => onSelect(level.code)}
            className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 ${
              selectedLevel === level.code
                ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PR-PRESS SELECTOR
// ============================================================================

const PRPressSelector = ({ selectedPress, onSelect }) => {
  return (
    <div className="bg-tier-white rounded-[14px] p-4 mb-5">
      <SubSectionTitle className="text-sm m-0 mb-3">
        PR-Press (Mental Load)
      </SubSectionTitle>
      <div className="flex gap-2 flex-wrap">
        {PR_LEVELS.map((press) => (
          <button
            key={press.code}
            onClick={() => onSelect(press.code)}
            className={`py-2 px-3 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 ${
              selectedPress === press.code
                ? 'border-2 border-tier-navy bg-tier-navy/15 text-tier-navy'
                : 'border border-tier-border-default bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
            }`}
          >
            {press.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// LOG FORM
// ============================================================================

const LogForm = ({ sessionType, selectedCategories, onSubmit, saving = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    focusRating: 7, // Changed from 'rating' to 'focusRating' for clarity
    energyLevel: 4,
    notes: '',
    achievements: '',
    improvements: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: sessionType,
      categories: selectedCategories,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-tier-white rounded-[14px] p-5 mb-5">
      <SubSectionTitle className="text-[15px] m-0 mb-4">
        Log Session
      </SubSectionTitle>

      {/* Session Name */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-tier-navy mb-1">
          Session Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="E.g. Driver training at range"
          className="w-full py-3 px-3 rounded-lg border border-tier-border-default text-sm outline-none focus:border-tier-navy"
        />
      </div>

      {/* Duration */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-tier-navy mb-1">
          Duration (minutes)
        </label>
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-tier-text-secondary" />
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            min="5"
            max="300"
            className="flex-1 py-3 px-3 rounded-lg border border-tier-border-default text-sm outline-none focus:border-tier-navy"
          />
        </div>
      </div>

      {/* Energy Level with Emoji Feedback */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[13px] font-medium text-tier-navy">
            Energy Level
          </label>
          <span className="text-2xl">
            {['😴', '😐', '🙂', '😊', '🔥'][formData.energyLevel - 1]}
          </span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => {
            const energyEmojis = ['😴', '😐', '🙂', '😊', '🔥'];
            const energyColors = [
              'border-gray-400 bg-gray-100',
              'border-amber-500 bg-amber-100',
              'border-emerald-500 bg-emerald-100',
              'border-blue-500 bg-blue-100',
              'border-red-500 bg-red-100',
            ];
            const isSelected = formData.energyLevel === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, energyLevel: level })}
                className={`flex-1 py-3 px-2 rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center gap-1 ${
                  isSelected
                    ? `border-2 ${energyColors[level - 1]}`
                    : 'border border-tier-border-default bg-tier-white'
                }`}
              >
                <span className="text-lg">{energyEmojis[level - 1]}</span>
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-tier-navy' : 'text-tier-text-secondary'
                }`}>
                  {level}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-tier-text-secondary mt-1">
          <span>Low energy</span>
          <span>High energy</span>
        </div>
      </div>

      {/* Focus Level with Emoji Feedback */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[13px] font-medium text-tier-navy">
            <Target size={14} className="inline mr-1" />
            Focus
          </label>
          <span className="text-2xl">
            {['🎯', '💭', '🙂', '😤', '🧠'][Math.min(Math.floor((formData.focusRating - 1) / 2), 4)]}
          </span>
        </div>
        <p className="text-[11px] text-tier-text-secondary mb-2">
          How well were you able to maintain focus throughout the session?
        </p>
        <div className="flex gap-1 bg-tier-surface-base rounded-lg p-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData({ ...formData, focusRating: rating })}
              className={`flex-1 py-2 border-none rounded cursor-pointer text-xs transition-all duration-150 ${
                formData.focusRating === rating
                  ? 'bg-tier-navy text-white font-semibold'
                  : 'bg-transparent text-tier-navy font-medium'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-tier-text-secondary">Distracted</span>
          <span className="text-xs text-tier-text-secondary">Laser focus</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-tier-navy mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="What did you work on? How did it go?"
          rows={3}
          className="w-full py-3 px-3 rounded-lg border border-tier-border-default text-sm outline-none resize-y font-inherit focus:border-tier-navy"
        />
      </div>

      {/* Achievements */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-tier-navy mb-1">
          Achievements (optional)
        </label>
        <input
          type="text"
          value={formData.achievements}
          onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
          placeholder="E.g. New top speed, PR in exercise"
          className="w-full py-3 px-3 rounded-lg border border-tier-border-default text-sm outline-none focus:border-tier-navy"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        leftIcon={<Save size={18} />}
        disabled={saving}
        loading={saving}
        className="w-full justify-center"
      >
        {saving ? 'Saving...' : 'Save Session'}
      </Button>
    </form>
  );
};

// ============================================================================
// RECENT LOGS
// ============================================================================

const RecentLogs = ({ logs }) => (
  <div className="bg-tier-white rounded-[14px] p-4">
    <SubSectionTitle className="text-sm m-0 mb-3">
      Recent Logs
    </SubSectionTitle>
    <div className="flex flex-col gap-2">
      {logs.map((log) => {
        const typeConfig = SESSION_TYPE_CLASSES[log.type] || SESSION_TYPE_CLASSES.TEK;
        const Icon = typeConfig.icon;
        const category = PYRAMID_TO_CATEGORY[log.type];

        return (
          <div
            key={log.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-tier-surface-base"
          >
            <div className={`w-9 h-9 rounded-lg ${typeConfig.bg} flex items-center justify-center`}>
              <Icon size={18} className={typeConfig.text} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-medium text-tier-navy">
                  {log.name}
                </span>
                {category && (
                  <TrainingCategoryBadge category={category} size="sm" />
                )}
              </div>
              <div className="text-[11px] text-tier-text-secondary flex items-center gap-2">
                <span>{new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                <span>•</span>
                <span>{log.duration} min</span>
              </div>
            </div>
            <div className="flex gap-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  fill={star <= log.rating ? 'var(--gold-500)' : 'none'}
                  className={star <= log.rating ? 'text-gold-500' : 'text-tier-border-default'}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoggTreningContainer = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedCSLevel, setSelectedCSLevel] = useState(null);
  const [selectedPress, setSelectedPress] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleStandardSession = (session) => {
    // Pre-fill form with standard session data
    setSelectedType('SLAG'); // Default to SLAG for golf-specific sessions
  };

  const handleToggleCategory = (categoryCode) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryCode)
        ? prev.filter((c) => c !== categoryCode)
        : [...prev, categoryCode]
    );
  };

  const handleSubmit = async (formData) => {
    setSaving(true);

    try {
      // Map form data to session API format (TIER Golf Category Hierarchy v2.0)
      const sessionData = {
        sessionType: formData.type, // FYS, TEK, SLAG, SPILL, TURN
        sessionDate: new Date(formData.date).toISOString(),
        duration: formData.duration,
        notes: formData.notes,
        // Generate simple AK-formula based on type
        akFormula: formData.type,
        // Add categories
        categories: formData.categories || [],
        // L-Phase, M-Environment, CS-Level, PR-Press
        lPhase: selectedPhase,
        mEnvironment: selectedEnvironment,
        csLevel: selectedCSLevel,
        prPress: selectedPress,
        // Evaluation stored in separate fields
        evaluationEnergy: formData.energyLevel,
        evaluationFocus: formData.focusRating,
      };

      await sessionsAPI.create(sessionData);

      // Show success toast
      toast.success('Training session saved!', {
        description: `${formData.name || 'Session'} - ${formData.duration} min`,
        duration: 3000,
      });

      // Navigate to sessions list after short delay
      setTimeout(() => {
        navigate('/trening/dagbok');
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Could not save session';
      toast.error('Could not save session', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Log Training Session"
      />
      {/* Session Type Selector */}
      <div className="bg-tier-white rounded-[14px] p-4 mb-5">
        <SubSectionTitle className="text-sm m-0 mb-3">
          Select Session Type
        </SubSectionTitle>
        <SessionTypeSelector selected={selectedType} onSelect={setSelectedType} />
      </div>

      {/* Category Selector */}
      <CategorySelector
        selectedCategories={selectedCategories}
        onToggle={handleToggleCategory}
      />

      {/* L-Phase Selector */}
      <LPhaseSelector
        selectedPhase={selectedPhase}
        onSelect={setSelectedPhase}
      />

      {/* M-Environment Selector */}
      <MEnvironmentSelector
        selectedEnvironment={selectedEnvironment}
        onSelect={setSelectedEnvironment}
      />

      {/* CS-Level Selector */}
      <CSLevelSelector
        selectedLevel={selectedCSLevel}
        onSelect={setSelectedCSLevel}
      />

      {/* PR-Press Selector */}
      <PRPressSelector
        selectedPress={selectedPress}
        onSelect={setSelectedPress}
      />

      {/* Standard Session Suggestions */}
      <StandardSessionSuggestions onSelect={handleStandardSession} />

      {/* Log Form */}
      <LogForm
        sessionType={selectedType}
        selectedCategories={selectedCategories}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {/* Recent Logs */}
      <RecentLogs logs={RECENT_LOGS} />
    </div>
  );
};

export default LoggTreningContainer;
