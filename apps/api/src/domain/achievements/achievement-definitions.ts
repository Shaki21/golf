/**
 * Achievement System - Badge Definitions & Rules
 */

export interface Achievement {
  id: string;
  category: 'consistency' | 'volume' | 'improvement' | 'milestone' | 'special';
  name: string;
  description: string;
  icon: string;
  levels: AchievementLevel[];
}

export interface AchievementLevel {
  level: number;
  requirement: number;
  title: string;
  xp: number;
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak',
    category: 'consistency',
    name: 'Streak Master',
    description: 'Complete sessions on consecutive days',
    icon: '🔥',
    levels: [
      { level: 1, requirement: 3, title: 'Warm Up', xp: 50, color: '#fbbf24' },
      { level: 2, requirement: 7, title: 'On Fire', xp: 100, color: '#f59e0b' },
      { level: 3, requirement: 14, title: 'Blazing', xp: 200, color: '#ea580c' },
      { level: 4, requirement: 30, title: 'Unstoppable', xp: 500, color: '#dc2626' },
      { level: 5, requirement: 60, title: 'Legendary', xp: 1000, color: '#991b1b' },
    ],
  },
  {
    id: 'total_sessions',
    category: 'volume',
    name: 'Training Warrior',
    description: 'Complete training sessions',
    icon: '⚡',
    levels: [
      { level: 1, requirement: 10, title: 'Beginner', xp: 100, color: '#3b82f6' },
      { level: 2, requirement: 25, title: 'Apprentice', xp: 200, color: '#2563eb' },
      { level: 3, requirement: 50, title: 'Warrior', xp: 400, color: '#1d4ed8' },
      { level: 4, requirement: 100, title: 'Master', xp: 800, color: '#1e40af' },
      { level: 5, requirement: 250, title: 'Legend', xp: 2000, color: '#1e3a8a' },
    ],
  },
  {
    id: 'total_hours',
    category: 'volume',
    name: 'Time Champion',
    description: 'Total hours trained',
    icon: '⏱️',
    levels: [
      { level: 1, requirement: 10, title: '10 Hours', xp: 100, color: '#8b5cf6' },
      { level: 2, requirement: 25, title: '25 Hours', xp: 200, color: '#7c3aed' },
      { level: 3, requirement: 50, title: '50 Hours', xp: 400, color: '#6d28d9' },
      { level: 4, requirement: 100, title: '100 Hours', xp: 800, color: '#5b21b6' },
      { level: 5, requirement: 250, title: '250 Hours', xp: 2000, color: '#4c1d95' },
    ],
  },
  {
    id: 'completion_rate',
    category: 'consistency',
    name: 'Reliable',
    description: 'Maintain high completion rate (30+ sessions)',
    icon: '✅',
    levels: [
      { level: 1, requirement: 70, title: 'Committed', xp: 150, color: '#10b981' },
      { level: 2, requirement: 80, title: 'Dedicated', xp: 300, color: '#059669' },
      { level: 3, requirement: 90, title: 'Disciplined', xp: 600, color: '#047857' },
      { level: 4, requirement: 95, title: 'Unstoppable', xp: 1200, color: '#065f46' },
    ],
  },
  {
    id: 'early_bird',
    category: 'special',
    name: 'Early Bird',
    description: 'Complete 20 sessions before 9 AM',
    icon: '🌅',
    levels: [
      { level: 1, requirement: 5, title: 'Morning Person', xp: 100, color: '#f59e0b' },
      { level: 2, requirement: 20, title: 'Early Riser', xp: 300, color: '#d97706' },
      { level: 3, requirement: 50, title: 'Dawn Warrior', xp: 600, color: '#b45309' },
    ],
  },
  {
    id: 'breaking_points',
    category: 'improvement',
    name: 'Weakness Crusher',
    description: 'Resolve breaking points',
    icon: '🎯',
    levels: [
      { level: 1, requirement: 1, title: 'First Fix', xp: 200, color: '#ef4444' },
      { level: 2, requirement: 3, title: 'Improving', xp: 400, color: '#dc2626' },
      { level: 3, requirement: 5, title: 'Optimizer', xp: 800, color: '#b91c1c' },
      { level: 4, requirement: 10, title: 'Perfectionist', xp: 1600, color: '#991b1b' },
    ],
  },
  {
    id: 'perfect_week',
    category: 'consistency',
    name: 'Perfect Week',
    description: 'Complete all planned sessions in a week',
    icon: '🏆',
    levels: [
      { level: 1, requirement: 1, title: 'First Perfect', xp: 150, color: '#fbbf24' },
      { level: 2, requirement: 4, title: 'Consistent', xp: 300, color: '#f59e0b' },
      { level: 3, requirement: 12, title: 'Unstoppable', xp: 600, color: '#d97706' },
    ],
  },
  {
    id: 'tournament_ready',
    category: 'milestone',
    name: 'Tournament Ready',
    description: 'Complete all sessions in 2 weeks before tournament',
    icon: '⛳',
    levels: [
      { level: 1, requirement: 1, title: 'Prepared', xp: 200, color: '#22c55e' },
      { level: 2, requirement: 3, title: 'Battle Ready', xp: 400, color: '#16a34a' },
      { level: 3, requirement: 5, title: 'Champion', xp: 800, color: '#15803d' },
    ],
  },
  {
    id: 'speed_boost',
    category: 'improvement',
    name: 'Speed Demon',
    description: 'Improve driver speed by 5+ mph from baseline',
    icon: '💨',
    levels: [
      { level: 1, requirement: 5, title: '+5 mph', xp: 300, color: '#06b6d4' },
      { level: 2, requirement: 10, title: '+10 mph', xp: 600, color: '#0891b2' },
      { level: 3, requirement: 15, title: '+15 mph', xp: 1200, color: '#0e7490' },
    ],
  },
  {
    id: 'night_owl',
    category: 'special',
    name: 'Night Owl',
    description: 'Complete 10 sessions after 7 PM',
    icon: '🦉',
    levels: [
      { level: 1, requirement: 10, title: 'Evening Warrior', xp: 200, color: '#6366f1' },
      { level: 2, requirement: 25, title: 'Night Fighter', xp: 400, color: '#4f46e5' },
    ],
  },
];

/**
 * Calculate which achievements a player has earned
 */
export function checkAchievements(stats: PlayerStats): EarnedAchievement[] {
  const earned: EarnedAchievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    let currentLevel = 0;
    let nextLevel: AchievementLevel | null = null;

    for (const level of achievement.levels) {
      const statValue = getStatValue(achievement.id, stats);
      if (statValue >= level.requirement) {
        currentLevel = level.level;
      } else {
        nextLevel = level;
        break;
      }
    }

    if (currentLevel > 0 || nextLevel) {
      earned.push({
        achievementId: achievement.id,
        category: achievement.category,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        currentLevel,
        currentLevelData: achievement.levels.find(l => l.level === currentLevel),
        nextLevel: nextLevel,
        progress: nextLevel ? (getStatValue(achievement.id, stats) / nextLevel.requirement) * 100 : 100,
        totalXP: achievement.levels
          .filter(l => l.level <= currentLevel)
          .reduce((sum, l) => sum + l.xp, 0),
      });
    }
  }

  return earned;
}

function getStatValue(achievementId: string, stats: PlayerStats): number {
  const map: Record<string, number> = {
    streak: stats.currentStreak,
    total_sessions: stats.totalSessions,
    total_hours: stats.totalHours,
    completion_rate: stats.completionRate,
    early_bird: stats.earlyMorningSessions || 0,
    breaking_points: stats.resolvedBreakingPoints || 0,
    perfect_week: stats.perfectWeeks || 0,
    tournament_ready: stats.tournamentPreps || 0,
    speed_boost: stats.speedImprovement || 0,
    night_owl: stats.eveningSessions || 0,
  };
  return map[achievementId] || 0;
}

export interface PlayerStats {
  currentStreak: number;
  totalSessions: number;
  totalHours: number;
  completionRate: number;
  earlyMorningSessions?: number;
  resolvedBreakingPoints?: number;
  perfectWeeks?: number;
  tournamentPreps?: number;
  speedImprovement?: number;
  eveningSessions?: number;
}

export interface EarnedAchievement {
  achievementId: string;
  category: string;
  name: string;
  description: string;
  icon: string;
  currentLevel: number;
  currentLevelData?: AchievementLevel;
  nextLevel: AchievementLevel | null;
  progress: number;
  totalXP: number;
}
