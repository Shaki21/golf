/**
 * TreningsdagbokContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState, useEffect } from 'react';
import {
  BookOpen, ChevronRight, Plus, Star, Clock,
  Target, Dumbbell, Brain, Search, AlertCircle, Flame
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import apiClient from '../../services/apiClient';
import { SubSectionTitle } from '../../components/typography';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const TYPE_CLASSES = {
  technical: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
    icon: Target,
    label: 'Technique',
    variant: 'accent',
  },
  short_game: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
    icon: Target,
    label: 'Short Game',
    variant: 'success',
  },
  physical: {
    text: 'text-tier-error',
    bg: 'bg-tier-error/15',
    icon: Dumbbell,
    label: 'Physical',
    variant: 'error',
  },
  mental: {
    text: 'text-tier-warning',
    bg: 'bg-tier-warning/15',
    icon: Brain,
    label: 'Mental',
    variant: 'warning',
  },
  competition: {
    text: 'text-tier-navy',
    bg: 'bg-tier-surface-base',
    icon: Target,
    label: 'Round',
    variant: 'neutral',
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const DIARY_ENTRIES = [
  {
    id: 'e1',
    date: '2025-01-18',
    title: 'Driver training at the range',
    type: 'technical',
    duration: 90,
    rating: 4,
    energyLevel: 4,
    focus: 'Tempo and sequence',
    reflection: 'Good session today. The tempo is starting to stick. Focused on the 1-2-3 rhythm and noticed big improvement in consistency. Clubhead speed up to 108 mph.',
    achievements: ['New top speed 108 mph', '15 of 20 on fairway target'],
    improvements: ['Still a bit quick transition', 'Need to work more on hip rotation'],
    mood: 'positive',
    weather: 'sunny',
    coachFeedback: 'Great job! Keep up with the tempo drills.',
  },
  {
    id: 'e2',
    date: '2025-01-17',
    title: 'Short game and putting',
    type: 'short_game',
    duration: 75,
    rating: 5,
    energyLevel: 5,
    focus: 'Bunker and chip',
    reflection: 'Fantastic session! Everything clicked with bunker shots. Got 8 of 10 sand saves and felt very confident. Chipping was also good with great distance control.',
    achievements: ['8/10 sand saves', 'New record in up-and-down challenge'],
    improvements: [],
    mood: 'excited',
    weather: 'cloudy',
    coachFeedback: null,
  },
  {
    id: 'e3',
    date: '2025-01-15',
    title: 'Strength training',
    type: 'physical',
    duration: 60,
    rating: 4,
    energyLevel: 3,
    focus: 'Core and rotation',
    reflection: 'A bit tired before the session, but completed everything. New PR in squat at 100 kg! Core exercises are getting better and better. Noticing rotation power increasing.',
    achievements: ['New squat PR: 100 kg', '90 sec plank'],
    improvements: ['Better warm-up next time', 'Prioritize sleep'],
    mood: 'satisfied',
    weather: null,
    coachFeedback: null,
  },
  {
    id: 'e4',
    date: '2025-01-13',
    title: 'Mental training',
    type: 'mental',
    duration: 45,
    rating: 3,
    energyLevel: 4,
    focus: 'Visualization',
    reflection: 'The visualization session was challenging. Hard to maintain focus for more than 10-15 min. Need to build up gradually. Breathing exercises went well.',
    achievements: ['Completed entire session'],
    improvements: ['Shorter sessions first', 'Quieter environment'],
    mood: 'neutral',
    weather: null,
    coachFeedback: 'Start with 10 min and build up. Use the app for guided visualization.',
  },
  {
    id: 'e5',
    date: '2025-01-11',
    title: 'Full round Asker GK',
    type: 'competition',
    duration: 240,
    rating: 3,
    energyLevel: 4,
    focus: 'Course strategy',
    reflection: 'Mixed round. Started strong with birdie on 1 and 3, but lost focus after a double on 7. Short game saved the day. Need to work on mental strength after bad shots.',
    achievements: ['3 birdies', 'Solid scrambling'],
    improvements: ['Mental reset after bad holes', 'Better club selection on par 3s'],
    mood: 'neutral',
    weather: 'rain',
    coachFeedback: null,
  },
];

const STATS = {
  totalEntries: 45,
  thisMonth: 12,
  avgRating: 4.1,
  avgDuration: 85,
  streak: 5,
};

// ============================================================================
// HELPERS
// ============================================================================

const getMoodIcon = (mood) => {
  switch (mood) {
    case 'excited': return 'flame';
    case 'positive': return 'smile';
    case 'satisfied': return 'thumbs-up';
    case 'neutral': return 'meh';
    case 'frustrated': return 'frown';
    default: return 'file-text';
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// ============================================================================
// RATING STARS
// ============================================================================

const RatingStars = ({ rating, size = 14 }) => (
  <div className="flex gap-0">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        fill={star <= rating ? 'rgb(var(--tier-gold))' : 'none'}
        className={star <= rating ? 'text-tier-gold' : 'text-tier-border-default'}
      />
    ))}
  </div>
);

// ============================================================================
// DIARY ENTRY CARD
// ============================================================================

const DiaryEntryCard = ({ entry, onClick }) => {
  const typeConfig = TYPE_CLASSES[entry.type] || TYPE_CLASSES.competition;
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      variant="default"
      padding="md"
      onClick={() => onClick(entry)}
      className="cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-lg ${typeConfig.bg} flex items-center justify-center shrink-0`}>
          <TypeIcon size={22} className={typeConfig.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <SubSectionTitle className="text-[15px] m-0">
                {entry.title}
              </SubSectionTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={typeConfig.variant} size="sm">{typeConfig.label}</Badge>
                <span className="text-xs text-tier-text-secondary">
                  {formatDate(entry.date)}
                </span>
                <span className="text-xs text-tier-text-secondary flex items-center gap-1">
                  <Clock size={12} />
                  {entry.duration} min
                </span>
                <span className="text-sm">
                  {getMoodIcon(entry.mood)}
                </span>
              </div>
            </div>
            <RatingStars rating={entry.rating} />
          </div>

          <p className="text-[13px] text-tier-navy my-2 leading-[1.4] line-clamp-2">
            {entry.reflection}
          </p>

          {entry.achievements.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {entry.achievements.slice(0, 2).map((achievement, idx) => (
                <Badge key={idx} variant="success" size="sm">✓ {achievement}</Badge>
              ))}
            </div>
          )}
        </div>

        <ChevronRight size={18} className="text-tier-text-secondary shrink-0" />
      </div>
    </Card>
  );
};

// ============================================================================
// STATS OVERVIEW
// ============================================================================

const StatsOverview = ({ stats }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 mb-6">
    <Card variant="default" padding="sm" className="text-center">
      <div className="text-[22px] font-bold text-tier-navy">
        {stats.totalEntries}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Total</div>
    </Card>
    <Card variant="default" padding="sm" className="text-center">
      <div className="text-[22px] font-bold text-tier-success">
        {stats.thisMonth}
      </div>
      <div className="text-[11px] text-tier-text-secondary">This month</div>
    </Card>
    <Card variant="default" padding="sm" className="text-center">
      <div className="flex items-center justify-center gap-0">
        <span className="text-[22px] font-bold text-tier-gold">
          {stats.avgRating}
        </span>
        <Star size={14} fill="rgb(var(--tier-gold))" className="text-tier-gold" />
      </div>
      <div className="text-[11px] text-tier-text-secondary">Avg rating</div>
    </Card>
    <Card variant="default" padding="sm" className="text-center">
      <div className="text-[22px] font-bold text-tier-navy">
        {stats.avgDuration}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Min/session</div>
    </Card>
    <Card variant="default" padding="sm" className="text-center">
      <div className="text-[22px] font-bold text-tier-error flex items-center justify-center gap-1">
        <Flame size={18} /> {stats.streak}
      </div>
      <div className="text-[11px] text-tier-text-secondary">Streak</div>
    </Card>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TreningsdagbokContainer = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch diary entries from API
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/training-diary');
        setEntries(response.data?.data || response.data || DIARY_ENTRIES);
      } catch (err) {
        setError(err.message);
        setEntries(DIARY_ENTRIES);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'technical', label: 'Technique' },
    { key: 'short_game', label: 'Short Game' },
    { key: 'physical', label: 'Physical' },
    { key: 'mental', label: 'Mental' },
    { key: 'competition', label: 'Rounds' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tier-white">
        <StateCard variant="loading" title="Loading training diary..." />
      </div>
    );
  }

  const filteredEntries = entries.filter((e) => {
    const matchesFilter = filter === 'all' || e.type === filter;
    const matchesSearch = searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.reflection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-tier-white">
      <div className="p-0">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-tier-error/15 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-tier-error" />
            <span className="text-[13px] text-tier-error">{error} (showing demo data)</span>
          </div>
        )}

        {/* Stats */}
        <StatsOverview stats={{ ...STATS, totalEntries: entries.length }} />

        {/* Search and Filters */}
        <div className="mb-5">
          <Card variant="default" padding="sm" className="mb-3">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-tier-text-secondary" />
              <input
                type="text"
                placeholder="Search diary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none text-sm text-tier-navy bg-transparent"
              />
            </div>
          </Card>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 overflow-x-auto">
              {filters.map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
              New Entry
            </Button>
          </div>
        </div>

        {/* Entries List */}
        <div className="flex flex-col gap-2">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <DiaryEntryCard
                key={entry.id}
                entry={entry}
                onClick={() => {/* View entry details */}}
              />
            ))
          ) : (
            <StateCard
              variant="empty"
              icon={BookOpen}
              title="No entries found"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TreningsdagbokContainer;
