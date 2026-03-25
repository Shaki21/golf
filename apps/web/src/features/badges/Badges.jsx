import React, { useState, useEffect, useCallback } from 'react';
import { BadgeGrid } from '../../components/badges';
import { useAuth } from '../../contexts/AuthContext';
import { badgesAPI } from '../../services/api';
import { PageHeader } from '../../ui/raw-blocks';
import './Badges.css';

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

  // Accuracy badges
  { id: 'fw_50', name: 'Fairway Finder', description: 'Achieve 50%+ fairway hit', category: 'accuracy', symbol: 'target', tier: 'standard', xp: 75, requirements: [{ description: '50%+ fairways' }] },
  { id: 'fw_60', name: 'Fairway Consistent', description: 'Achieve 60%+ fairway hit', category: 'accuracy', symbol: 'target', tier: 'bronze', xp: 150, requirements: [{ description: '60%+ fairways' }] },
  { id: 'gir_40', name: 'Green Seeker', description: 'Achieve 40%+ GIR', category: 'accuracy', symbol: 'flag', tier: 'standard', xp: 75, requirements: [{ description: '40%+ GIR' }] },
  { id: 'gir_50', name: 'Approach Consistent', description: 'Achieve 50%+ GIR', category: 'accuracy', symbol: 'flag', tier: 'bronze', xp: 150, requirements: [{ description: '50%+ GIR' }] },

  // Putting badges
  { id: 'putts_34', name: 'Solid Putter', description: 'Average under 34 putts per round', category: 'putting', symbol: 'flag', tier: 'bronze', xp: 100, requirements: [{ description: 'Under 34 putts/round' }] },
  { id: 'putts_32', name: 'Putter Pro', description: 'Average under 32 putts per round', category: 'putting', symbol: 'flag', tier: 'silver', xp: 200, requirements: [{ description: 'Under 32 putts/round' }] },
  { id: 'oneputt_30', name: 'One-Putt Artist', description: '30%+ one-putt rate', category: 'putting', symbol: 'star', tier: 'bronze', xp: 100, requirements: [{ description: '30%+ one-putts' }] },

  // Short game badges
  { id: 'up_down_40', name: 'Scrambler', description: '40%+ up-and-down rate', category: 'short_game', symbol: 'flag', tier: 'bronze', xp: 100, requirements: [{ description: '40%+ up-and-down' }] },
  { id: 'sand_save_40', name: 'Bunker Fighter', description: '40%+ sand save rate', category: 'short_game', symbol: 'flag', tier: 'bronze', xp: 100, requirements: [{ description: '40%+ sand saves' }] },

  // Mental badges
  { id: 'mental_10', name: 'Mental Start', description: 'Complete 10 mental training sessions', category: 'mental', symbol: 'brain', tier: 'bronze', xp: 100, requirements: [{ description: '5+ hours mental' }] },
  { id: 'mental_50', name: 'Mental Warrior', description: 'Complete 25 hours mental training', category: 'mental', symbol: 'brain', tier: 'silver', xp: 250, requirements: [{ description: '25+ hours mental' }] },

  // Phase badges
  { id: 'phase_grunnlag', name: 'Foundation Completed', description: 'Complete a foundation period', category: 'phase', symbol: 'check', tier: 'bronze', xp: 150, requirements: [{ description: '1 phase completed' }] },
  { id: 'compliance_80', name: 'Plan Follower', description: 'Achieve 80%+ compliance in a phase', category: 'phase', symbol: 'check', tier: 'bronze', xp: 100, requirements: [{ description: '80%+ compliance' }] },

  // Milestone badges
  { id: 'score_under_90', name: 'Breaking 90', description: 'Play a round under 90 strokes', category: 'milestone', symbol: 'trophy', tier: 'bronze', xp: 150, requirements: [{ description: 'Under 90' }] },
  { id: 'score_under_80', name: 'Breaking 80', description: 'Play a round under 80 strokes', category: 'milestone', symbol: 'trophy', tier: 'gold', xp: 400, requirements: [{ description: 'Under 80' }] },
  { id: 'hcp_single_digit', name: 'Single-Digit', description: 'Achieve single-digit handicap', category: 'milestone', symbol: 'medal', tier: 'silver', xp: 300, requirements: [{ description: 'HCP < 10' }] },
  { id: 'rounds_25', name: 'Course Enthusiast', description: 'Play 25 rounds', category: 'milestone', symbol: 'flag', tier: 'bronze', xp: 100, requirements: [{ description: '25 rounds' }] },

  // Seasonal badges
  { id: 'winter_warrior', name: 'Winter Warrior', description: 'Train outdoors in December, January or February', category: 'seasonal', symbol: 'snowflake', tier: 'bronze', xp: 100, isLimited: true, requirements: [{ description: 'Winter training' }] },
  { id: 'summer_grinder', name: 'Summer Grinder', description: 'Train 50+ hours in June, July or August', category: 'seasonal', symbol: 'sun', tier: 'gold', xp: 300, isLimited: true, requirements: [{ description: '50+ hours summer' }] },
];

const Badges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userStats, setUserStats] = useState({
    unlockedBadges: [],
    badgeProgress: {},
    stats: { total: 0, unlocked: 0, percentComplete: 0 },
  });
  const [loading, setLoading] = useState(true);

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
        'hours_100': { current: 75, target: 100 },
        'sessions_100': { current: 68, target: 100 },
        'streak_14': { current: 10, target: 14 },
        'speed_100': { current: 97, target: 100 },
      },
      stats: { total: DEMO_BADGES.length, unlocked: 6, percentComplete: Math.round((6 / DEMO_BADGES.length) * 100) },
    });
    setLoading(false);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // Fetch badge definitions and progress in parallel using proper API client
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

  const handleBadgeClick = (badge) => {
    // Badge click handler - placeholder for future badge details modal
    console.debug('Badge clicked:', badge.name);
  };

  if (loading) {
    return (
      <div className="badges-page">
        <div className="badges-page__loading">
          <div className="badges-page__spinner" />
          <p>Loading badges...</p>
        </div>
      </div>
    );
  }

  const totalBadges = badges.length || userStats.stats?.total || 0;
  const unlockedCount = userStats.stats?.unlocked ?? userStats.unlockedBadges.length;
  const percentComplete = userStats.stats?.percentComplete ?? Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="badges-page">
      <PageHeader
        title="Achievement Badges"
        subtitle="View your earned badges and available achievements"
        helpText="Complete overview of all available achievement badges you can unlock. Badges are earned through training, tournaments and milestones. Filter by category, track progress and monitor your total XP collection."
      />
      <BadgeGrid
        badges={badges}
        userStats={userStats}
        groupBy="category"
        showFilters={true}
        onBadgeClick={handleBadgeClick}
        hideUnavailable={false}
      />
    </div>
  );
};

export default Badges;
