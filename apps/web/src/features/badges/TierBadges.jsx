import React, { useState, useEffect, useCallback } from 'react';
import { TierCard, AchievementBadge, TierBadge } from '../../components/tier';
import { useAuth } from '../../contexts/AuthContext';
import { badgesAPI } from '../../services/api';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../ui/raw-blocks';
import { SubSectionTitle } from '../../components/typography/Headings';

/**
 * TIER Golf Badges Gallery
 *
 * Modern badge display using TIER design system with AchievementBadge components.
 * Replaces the old BadgeGrid with cleaner TIER design.
 *
 * Features:
 * - Category filtering
 * - Tier filtering
 * - Progress tracking
 * - Unlock animations
 * - Stats summary
 */

/**
 * Demo badge definitions matching backend structure
 * Used when API is not available
 */
const DEMO_BADGES = [
  // Volume badges
  { id: 'hours_10', name: 'Dedicated Start', description: 'Log 10 hours training total', category: 'volume', symbol: 'clock', tier: 'standard', xp: 50, requirements: [{ description: '10 hours training' }] },
  { id: 'hours_50', name: 'Focused Effort', description: 'Log 50 hours training total', category: 'volume', symbol: 'clock', tier: 'bronze', xp: 100, requirements: [{ description: '50 hours training' }] },
  { id: 'hours_100', name: 'Century Club', description: 'Log 100 hours training total', category: 'volume', symbol: 'clock', tier: 'silver', xp: 200, requirements: [{ description: '100 hours training' }] },
  { id: 'hours_250', name: 'Serious Player', description: 'Log 250 hours training total', category: 'volume', symbol: 'clock', tier: 'silver', xp: 350, requirements: [{ description: '250 hours training' }] },
  { id: 'hours_500', name: 'Halfway to 1000', description: 'Log 500 hours training total', category: 'volume', symbol: 'clock', tier: 'gold', xp: 500, requirements: [{ description: '500 hours training' }] },
  { id: 'sessions_25', name: 'Routine Builder', description: 'Complete 25 training sessions', category: 'volume', symbol: 'check', tier: 'standard', xp: 50, requirements: [{ description: '25 sessions' }] },
  { id: 'sessions_100', name: 'Session Enthusiast', description: 'Complete 100 training sessions', category: 'volume', symbol: 'check', tier: 'bronze', xp: 150, requirements: [{ description: '100 sessions' }] },

  // Streak badges
  { id: 'streak_3', name: 'Getting Started', description: 'Train 3 days in a row', category: 'streak', symbol: 'flame', tier: 'standard', xp: 25, requirements: [{ description: '3 day streak' }] },
  { id: 'streak_7', name: 'Week Warrior', description: 'Train 7 days in a row', category: 'streak', symbol: 'flame', tier: 'bronze', xp: 75, requirements: [{ description: '7 day streak' }] },
  { id: 'streak_14', name: 'Two Weeks Strong', description: 'Train 14 days in a row', category: 'streak', symbol: 'flame', tier: 'silver', xp: 150, requirements: [{ description: '14 day streak' }] },
  { id: 'streak_30', name: 'Monthly Endurance', description: 'Train 30 days in a row', category: 'streak', symbol: 'flame', tier: 'gold', xp: 300, requirements: [{ description: '30 day streak' }] },
  { id: 'early_bird_10', name: 'Early Bird', description: 'Train before 09:00 ten times', category: 'streak', symbol: 'sunrise', tier: 'bronze', xp: 100, requirements: [{ description: '10 morning sessions' }] },

  // Strength badges
  { id: 'tonnage_1000', name: 'First Ton', description: 'Lift 1000 kg total tonnage', category: 'strength', symbol: 'dumbbell', tier: 'standard', xp: 50, requirements: [{ description: '1000 kg tonnage' }] },
  { id: 'tonnage_10000', name: '10 Ton Club', description: 'Lift 10,000 kg total tonnage', category: 'strength', symbol: 'dumbbell', tier: 'bronze', xp: 100, requirements: [{ description: '10,000 kg tonnage' }] },
  { id: 'pr_first', name: 'First PR', description: 'Set your first personal record', category: 'strength', symbol: 'trophy', tier: 'standard', xp: 50, requirements: [{ description: '1 PR' }] },
  { id: 'pr_10', name: 'PR Hunter', description: 'Set 10 personal records', category: 'strength', symbol: 'trophy', tier: 'bronze', xp: 150, requirements: [{ description: '10 PRs' }] },

  // Speed badges
  { id: 'speed_100', name: '100+ Club', description: 'Achieve 100+ mph driver speed', category: 'speed', symbol: 'lightning', tier: 'bronze', xp: 150, requirements: [{ description: '100+ mph driver' }] },
  { id: 'speed_105', name: '105+ Club', description: 'Achieve 105+ mph driver speed', category: 'speed', symbol: 'lightning', tier: 'silver', xp: 250, requirements: [{ description: '105+ mph driver' }] },
  { id: 'speed_110', name: '110+ Club', description: 'Achieve 110+ mph driver speed', category: 'speed', symbol: 'lightning', tier: 'gold', xp: 400, requirements: [{ description: '110+ mph driver' }] },
  { id: 'speed_gain_3', name: 'Speed Increase', description: 'Increase driver speed by 3+ mph from baseline', category: 'speed', symbol: 'lightning', tier: 'bronze', xp: 150, requirements: [{ description: '+3 mph improvement' }] },

  // Milestone badges
  { id: 'score_under_90', name: 'Breaking 90', description: 'Play a round under 90 strokes', category: 'milestone', symbol: 'trophy', tier: 'bronze', xp: 150, requirements: [{ description: 'Under 90' }] },
  { id: 'score_under_80', name: 'Breaking 80', description: 'Play a round under 80 strokes', category: 'milestone', symbol: 'trophy', tier: 'gold', xp: 400, requirements: [{ description: 'Under 80' }] },
  { id: 'hcp_single_digit', name: 'Single-Digit', description: 'Achieve single-digit handicap', category: 'milestone', symbol: 'medal', tier: 'silver', xp: 300, requirements: [{ description: 'HCP < 10' }] },
  { id: 'rounds_25', name: 'Course Enthusiast', description: 'Play 25 rounds', category: 'milestone', symbol: 'flag', tier: 'bronze', xp: 100, requirements: [{ description: '25 rounds' }] },

  // Seasonal badges
  { id: 'winter_warrior', name: 'Winter Warrior', description: 'Train outdoors in December, January or February', category: 'seasonal', symbol: 'snowflake', tier: 'bronze', xp: 100, isLimited: true, requirements: [{ description: 'Winter training' }] },
  { id: 'summer_grinder', name: 'Summer Grinder', description: 'Train 50+ hours in June, July or August', category: 'seasonal', symbol: 'sun', tier: 'gold', xp: 300, isLimited: true, requirements: [{ description: '50+ hours summer' }] },
];

const categoryLabels = {
  all: 'All categories',
  volume: 'Training volume',
  streak: 'Streaks',
  strength: 'Strength',
  speed: 'Speed',
  accuracy: 'Accuracy',
  putting: 'Putting',
  short_game: 'Short game',
  mental: 'Mental',
  phase: 'Phases',
  milestone: 'Milestones',
  seasonal: 'Seasonal',
};

const tierLabels = {
  all: 'All levels',
  standard: 'Standard',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export function TierBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userStats, setUserStats] = useState({
    unlockedBadges: [],
    badgeProgress: {},
    stats: { total: 0, unlocked: 0, percentComplete: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const loadDemoData = useCallback(() => {
    setBadges(DEMO_BADGES);
    setUserStats({
      unlockedBadges: [
        'hours_10',
        'hours_50',
        'sessions_25',
        'streak_3',
        'streak_7',
        'pr_first',
      ],
      badgeProgress: {
        hours_100: { current: 75, target: 100 },
        sessions_100: { current: 68, target: 100 },
        streak_14: { current: 10, target: 14 },
        speed_100: { current: 97, target: 100 },
      },
      stats: { total: DEMO_BADGES.length, unlocked: 6, percentComplete: Math.round((6 / DEMO_BADGES.length) * 100) },
    });
    setLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [definitionsRes, progressRes] = await Promise.all([
        badgesAPI.getDefinitions(true),
        badgesAPI.getProgress(),
      ]);

      const definitionsData = definitionsRes.data;
      const progressData = progressRes.data;

      setBadges(definitionsData.badges || []);
      setUserStats(progressData);
      setLoading(false);
    } catch (error) {
      console.warn('Badge API not available, using demo data:', error);
      loadDemoData();
    }
  }, [loadDemoData]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      loadDemoData();
    }
  }, [user, fetchData, loadDemoData]);

  const filteredBadges = badges.filter((badge) => {
    const categoryMatch = categoryFilter === 'all' || badge.category === categoryFilter;
    const tierMatch = tierFilter === 'all' || badge.tier === tierFilter;
    return categoryMatch && tierMatch;
  });

  const handleBadgeClick = (badge) => {
    console.debug('Badge clicked:', badge.name);
    // Future: Open modal with badge details
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-tier-navy/20 border-t-tier-navy rounded-full animate-spin mb-4" />
            <p className="text-text-muted">Loading badges...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalBadges = badges.length || userStats.stats?.total || 0;
  const unlockedCount = userStats.stats?.unlocked ?? userStats.unlockedBadges.length;
  const percentComplete = userStats.stats?.percentComplete ?? Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Your Badges"
          subtitle="Collect achievements and unlock rewards"
          helpText="Overview of all available achievement badges you can unlock through training and tournaments. Track progress towards your next badge, filter by category and level, and monitor your badge collection. Earn XP and rewards."
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <TierCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-tier-navy/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-tier-navy" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-tier-navy">
                  {unlockedCount}
                </div>
                <div className="text-sm text-text-muted">Badges unlocked</div>
              </div>
            </div>
          </TierCard>

          <TierCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-tier-gold/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-tier-gold" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-tier-navy">
                  {totalBadges}
                </div>
                <div className="text-sm text-text-muted">Total badges</div>
              </div>
            </div>
          </TierCard>

          <TierCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-status-success" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-tier-navy">
                  {percentComplete}%
                </div>
                <div className="text-sm text-text-muted">Completed</div>
              </div>
            </div>
          </TierCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Level
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
            >
              {Object.entries(tierLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Result Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {filteredBadges.length} of {totalBadges} badges
          </p>
          {(categoryFilter !== 'all' || tierFilter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setTierFilter('all');
              }}
              className="text-sm text-tier-navy hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = userStats.unlockedBadges.includes(badge.id);
            const progress = userStats.badgeProgress[badge.id];

            return (
              <AchievementBadge
                key={badge.id}
                {...badge}
                unlocked={isUnlocked}
                progress={progress}
                onClick={() => handleBadgeClick(badge)}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <TierCard className="p-12">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <SubSectionTitle style={{ marginBottom: '0.5rem' }}>
                No badges found
              </SubSectionTitle>
              <p className="text-text-muted mb-4">
                Try adjusting your filters
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setTierFilter('all');
                }}
                className="text-tier-navy hover:underline"
              >
                Reset filters
              </button>
            </div>
          </TierCard>
        )}
      </div>
    </div>
  );
}

export default TierBadges;
