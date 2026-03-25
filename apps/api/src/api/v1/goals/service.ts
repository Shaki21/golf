import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../../core/db/prisma';
import { AppError } from '../../../core/errors';

const prisma = getPrismaClient();

/**
 * Milestone data structure
 */
interface GoalMilestone {
  title: string;
  targetValue?: number;
  completed?: boolean;
  completedDate?: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  goalType: string;
  timeframe: string;
  targetValue?: number;
  currentValue?: number;
  startValue?: number;
  unit?: string;
  startDate: Date;
  targetDate: Date;
  icon?: string;
  color?: string;
  notes?: string;
  milestones?: GoalMilestone[];
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  goalType?: string;
  timeframe?: string;
  targetValue?: number;
  currentValue?: number;
  startValue?: number;
  unit?: string;
  progressPercent?: number;
  startDate?: Date;
  targetDate?: Date;
  completedDate?: Date;
  status?: string;
  icon?: string;
  color?: string;
  notes?: string;
  milestones?: GoalMilestone[];
}

export class GoalsService {
  /**
   * Calculate progress percentage based on current, start, and target values
   */
  private calculateProgress(startValue?: number, currentValue?: number, targetValue?: number): number {
    if (startValue === undefined || currentValue === undefined || targetValue === undefined) {
      return 0;
    }

    if (targetValue === startValue) {
      return currentValue >= targetValue ? 100 : 0;
    }

    const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  async listGoals(userId: string, status?: string) {
    const where: Prisma.GoalWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    return prisma.goal.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // active first
        { targetDate: 'asc' } // soonest deadline first
      ]
    });
  }

  async getGoalById(goalId: string, userId: string) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new AppError('validation_error', 'Goal not found', 404, { goalId });
    }

    if (goal.userId !== userId) {
      throw new AppError('authorization_error', 'You do not have permission to access this goal', 403);
    }

    return goal;
  }

  async createGoal(userId: string, input: CreateGoalInput) {
    // Calculate initial progress
    const progressPercent = this.calculateProgress(
      input.startValue ? Number(input.startValue) : undefined,
      input.currentValue ? Number(input.currentValue) : undefined,
      input.targetValue ? Number(input.targetValue) : undefined
    );

    return prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        goalType: input.goalType,
        timeframe: input.timeframe,
        targetValue: input.targetValue ? new Prisma.Decimal(input.targetValue) : null,
        currentValue: input.currentValue ? new Prisma.Decimal(input.currentValue) : null,
        startValue: input.startValue ? new Prisma.Decimal(input.startValue) : null,
        unit: input.unit,
        progressPercent,
        startDate: input.startDate,
        targetDate: input.targetDate,
        icon: input.icon,
        color: input.color,
        notes: input.notes,
        milestones: (input.milestones || []) as unknown as Prisma.InputJsonValue
      }
    });
  }

  async updateGoal(goalId: string, userId: string, input: UpdateGoalInput) {
    // First verify ownership
    const existingGoal = await this.getGoalById(goalId, userId);

    // Prepare update data
    const updateData: Prisma.GoalUpdateInput = {};

    // Basic fields
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.goalType !== undefined) updateData.goalType = input.goalType;
    if (input.timeframe !== undefined) updateData.timeframe = input.timeframe;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.targetDate !== undefined) updateData.targetDate = input.targetDate;
    if (input.completedDate !== undefined) updateData.completedDate = input.completedDate;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.milestones !== undefined) updateData.milestones = input.milestones as unknown as Prisma.InputJsonValue;

    // Numeric fields (convert to Decimal)
    if (input.targetValue !== undefined) {
      updateData.targetValue = input.targetValue ? new Prisma.Decimal(input.targetValue) : null;
    }
    if (input.currentValue !== undefined) {
      updateData.currentValue = input.currentValue ? new Prisma.Decimal(input.currentValue) : null;
    }
    if (input.startValue !== undefined) {
      updateData.startValue = input.startValue ? new Prisma.Decimal(input.startValue) : null;
    }

    // Recalculate progress if values changed
    const newStartValue = input.startValue !== undefined ? input.startValue : Number(existingGoal.startValue || 0);
    const newCurrentValue = input.currentValue !== undefined ? input.currentValue : Number(existingGoal.currentValue || 0);
    const newTargetValue = input.targetValue !== undefined ? input.targetValue : Number(existingGoal.targetValue || 0);

    if (input.progressPercent !== undefined) {
      updateData.progressPercent = input.progressPercent;
    } else if (input.targetValue !== undefined || input.currentValue !== undefined || input.startValue !== undefined) {
      updateData.progressPercent = this.calculateProgress(newStartValue, newCurrentValue, newTargetValue);
    }

    // Auto-complete goal if progress reaches 100%
    if (updateData.progressPercent === 100 && existingGoal.status === 'active') {
      updateData.status = 'completed';
      updateData.completedDate = new Date();
    }

    updateData.updatedAt = new Date();

    return prisma.goal.update({
      where: { id: goalId },
      data: updateData
    });
  }

  async deleteGoal(goalId: string, userId: string) {
    // First verify ownership
    await this.getGoalById(goalId, userId);

    await prisma.goal.delete({
      where: { id: goalId }
    });

    return { success: true };
  }

  async updateProgress(goalId: string, userId: string, currentValue: number) {
    const goal = await this.getGoalById(goalId, userId);

    const progressPercent = this.calculateProgress(
      Number(goal.startValue || 0),
      currentValue,
      Number(goal.targetValue || 0)
    );

    const updateData: Prisma.GoalUpdateInput = {
      currentValue: new Prisma.Decimal(currentValue),
      progressPercent,
      updatedAt: new Date()
    };

    // Auto-complete if reaches 100%
    if (progressPercent === 100 && goal.status === 'active') {
      updateData.status = 'completed';
      updateData.completedDate = new Date();
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData
    });

    // Track streak for this progress update
    await this.updateStreak(userId, goalId, currentValue);

    // Check and unlock badges based on progress
    await this.checkAndUnlockBadges(userId);

    return updatedGoal;
  }

  /**
   * Check and unlock badges based on user's goals and progress
   */
  private async checkAndUnlockBadges(userId: string) {
    const goals = await this.listGoals(userId);
    const completedGoals = goals.filter(g => g.status === 'completed');
    const streak = await this.getStreak(userId);

    // First goal completed
    if (completedGoals.length === 1) {
      await this.tryUnlockBadge(userId, 'first_goal');
    }

    // Five goals completed
    if (completedGoals.length === 5) {
      await this.tryUnlockBadge(userId, 'five_goals');
    }

    // Ten goals completed
    if (completedGoals.length === 10) {
      await this.tryUnlockBadge(userId, 'goal_getter');
    }

    // Streak badges
    if (streak.currentStreak === 3) {
      await this.tryUnlockBadge(userId, 'three_day_streak');
    }

    if (streak.currentStreak === 7) {
      await this.tryUnlockBadge(userId, 'week_warrior');
    }

    if (streak.currentStreak === 30) {
      await this.tryUnlockBadge(userId, 'month_master');
    }

    if (streak.currentStreak === 30 && streak.longestStreak === 30) {
      await this.tryUnlockBadge(userId, 'consistency_king');
    }

    // Time-based badges
    const hour = new Date().getHours();
    if (hour < 9) {
      await this.tryUnlockBadge(userId, 'early_bird');
    } else if (hour >= 22) {
      await this.tryUnlockBadge(userId, 'night_owl');
    }
  }

  /**
   * Try to unlock a badge (silently fails if already unlocked)
   */
  private async tryUnlockBadge(userId: string, badgeId: string) {
    try {
      await this.unlockBadge(userId, badgeId);
    } catch (error) {
      // Ignore if already unlocked
      if (error instanceof AppError && error.statusCode === 409) {
        return;
      }
      throw error;
    }
  }

  async getGoalsByType(userId: string, goalType: string) {
    return prisma.goal.findMany({
      where: {
        userId,
        goalType
      },
      orderBy: [
        { status: 'asc' },
        { targetDate: 'asc' }
      ]
    });
  }

  async getActiveGoals(userId: string) {
    return this.listGoals(userId, 'active');
  }

  async getCompletedGoals(userId: string) {
    return this.listGoals(userId, 'completed');
  }

  // =============================================================================
  // Streak Methods
  // =============================================================================

  async getStreak(userId: string) {
    // Get or create streak record
    let streak = await prisma.goalStreak.findUnique({
      where: { userId }
    });

    if (!streak) {
      // Create initial streak record
      streak = await prisma.goalStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          streakStatus: 'inactive'
        }
      });
    }

    // Calculate days until expiry (streak expires if no activity for 2 days)
    const daysUntilExpiry = this.calculateDaysUntilExpiry(streak.lastActivityDate);

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate?.toISOString() || new Date().toISOString(),
      streakStatus: streak.streakStatus as 'active' | 'at_risk' | 'frozen' | 'inactive',
      daysUntilExpiry
    };
  }

  async updateStreak(userId: string, goalId: string, _progressValue: number) {
    // Verify goal exists and belongs to user
    await this.getGoalById(goalId, userId);

    // Get or create streak
    let streak = await prisma.goalStreak.findUnique({
      where: { userId }
    });

    // Use UTC to avoid timezone issues with PostgreSQL DATE type
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (!streak) {
      streak = await prisma.goalStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          streakStatus: 'active',
          freezeUsed: false
        }
      });

      return {
        success: true,
        currentStreak: 1,
        streakUpdated: true,
        message: 'Streak started! Keep it going!'
      };
    }

    const lastActivity = streak.lastActivityDate
      ? new Date(Date.UTC(
          new Date(streak.lastActivityDate).getUTCFullYear(),
          new Date(streak.lastActivityDate).getUTCMonth(),
          new Date(streak.lastActivityDate).getUTCDate()
        ))
      : null;

    // Calculate day difference
    const daysDiff = lastActivity
      ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let newStreak = streak.currentStreak;
    let streakUpdated = false;
    let message = 'Progress recorded';

    if (daysDiff === 0) {
      // Same day, no streak change
      message = 'Progress recorded for today';
    } else if (daysDiff === 1) {
      // Consecutive day - increase streak
      newStreak = streak.currentStreak + 1;
      streakUpdated = true;
      message = `Streak extended to ${newStreak} days! 🔥`;
    } else if (daysDiff === 2 && !streak.freezeUsed) {
      // 2 days gap, but can use freeze
      newStreak = streak.currentStreak;
      streakUpdated = true;
      message = 'Streak frozen! You get one grace day 🧊';
      await prisma.goalStreak.update({
        where: { userId },
        data: { freezeUsed: true }
      });
    } else {
      // Streak broken - reset
      newStreak = 1;
      streakUpdated = true;
      message = 'Streak reset. Starting fresh! 💪';
    }

    // Update longest streak if needed
    const newLongest = Math.max(streak.longestStreak, newStreak);

    // Determine streak status
    let streakStatus: 'active' | 'at_risk' | 'frozen' | 'inactive' = 'active';
    if (newStreak === 0) {
      streakStatus = 'inactive';
    } else if (daysDiff === 0) {
      streakStatus = 'active';
    }

    await prisma.goalStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: today,
        streakStatus,
        freezeUsed: daysDiff === 2 ? true : (newStreak === 1 ? false : streak.freezeUsed)
      }
    });

    return {
      success: true,
      currentStreak: newStreak,
      streakUpdated,
      message
    };
  }

  private calculateDaysUntilExpiry(lastActivityDate: Date | null): number {
    if (!lastActivityDate) return 0;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const lastActivity = new Date(Date.UTC(
      new Date(lastActivityDate).getUTCFullYear(),
      new Date(lastActivityDate).getUTCMonth(),
      new Date(lastActivityDate).getUTCDate()
    ));

    const daysSinceActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // Streak expires after 2 days of inactivity
    return Math.max(0, 2 - daysSinceActivity);
  }

  // =============================================================================
  // Stats Methods
  // =============================================================================

  async getStats(userId: string) {
    const allGoals = await this.listGoals(userId);
    const activeGoals = allGoals.filter(g => g.status === 'active');
    const completedGoals = allGoals.filter(g => g.status === 'completed');

    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progressPercent || 0), 0) / activeGoals.length)
      : 0;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedThisMonth = completedGoals.filter(
      g => g.completedDate && new Date(g.completedDate) >= thisMonth
    ).length;

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = activeGoals
      .filter(g => g.targetDate && new Date(g.targetDate) <= sevenDaysFromNow)
      .map(g => ({
        id: g.id,
        title: g.title,
        deadline: g.targetDate?.toISOString() || '',
        progress: g.progressPercent || 0,
        category: g.goalType
      }));

    return {
      totalActive: activeGoals.length,
      totalCompleted: completedGoals.length,
      averageProgress: avgProgress,
      completedThisMonth,
      upcomingDeadlines,
      recentActivity: []
    };
  }

  // =============================================================================
  // Badges Methods
  // =============================================================================

  async getBadges(userId: string) {
    // Get all user badges
    const badges = await prisma.goalBadge.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    });

    // Total available badges (from badge definitions)
    const totalBadges = 16; // This matches BADGE_DEFINITIONS count

    // Recent unlocks (last 3)
    const recentUnlocks = badges.slice(0, 3).map(badge => ({
      id: badge.id,
      badgeId: badge.badgeId,
      name: badge.name,
      icon: badge.icon,
      unlockedAt: badge.unlockedAt.toISOString()
    }));

    return {
      badges: badges.map(badge => ({
        id: badge.id,
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon,
        rarity: badge.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        unlockedAt: badge.unlockedAt.toISOString(),
        viewed: badge.viewed
      })),
      unlockedCount: badges.length,
      totalBadges,
      recentUnlocks
    };
  }

  async unlockBadge(userId: string, badgeId: string) {
    // Check if badge is already unlocked
    const existing = await prisma.goalBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });

    if (existing) {
      throw new AppError('validation_error', 'Badge already unlocked', 409);
    }

    // Badge definitions map (should match frontend BADGE_DEFINITIONS)
    const BADGE_DEFINITIONS: Record<string, { name: string; description: string; icon: string; rarity: string }> = {
      first_goal: { name: 'Første Mål', description: 'Fullført ditt første mål', icon: '🎯', rarity: 'common' },
      five_goals: { name: 'Målbevisst', description: 'Fullført 5 mål', icon: '🏆', rarity: 'rare' },
      perfect_week: { name: 'Perfekt Uke', description: 'Alle ukentlige mål oppnådd', icon: '⭐', rarity: 'epic' },
      category_master: { name: 'Kategori Mester', description: 'Alle mål i én kategori fullført', icon: '👑', rarity: 'epic' },
      speed_demon: { name: 'Lynrask', description: 'Mål fullført før deadline', icon: '⚡', rarity: 'rare' },
      comeback_kid: { name: 'Comeback', description: 'Fullført mål etter å ha ligget bak', icon: '💪', rarity: 'rare' },
      three_day_streak: { name: 'Tre Dagers Streak', description: 'Oppdatert mål 3 dager på rad', icon: '🔥', rarity: 'common' },
      week_warrior: { name: 'Uke Kriger', description: '7 dagers streak', icon: '⚔️', rarity: 'rare' },
      month_master: { name: 'Måneds Mester', description: '30 dagers streak', icon: '🌟', rarity: 'epic' },
      early_bird: { name: 'Tidlig Fugl', description: 'Oppdatert mål før kl 9', icon: '🌅', rarity: 'common' },
      night_owl: { name: 'Nattergal', description: 'Oppdatert mål etter kl 22', icon: '🦉', rarity: 'common' },
      overachiever: { name: 'Overpresterer', description: 'Overgått målverdi med 20%', icon: '🚀', rarity: 'rare' },
      consistency_king: { name: 'Konsistent Konge', description: 'Oppdatert mål hver dag i en måned', icon: '👑', rarity: 'legendary' },
      goal_getter: { name: 'Mål Gjenget', description: '10 mål fullført totalt', icon: '🎖️', rarity: 'epic' },
      quick_starter: { name: 'Rask Start', description: 'Opprettet første mål innen 24 timer', icon: '⚡', rarity: 'common' },
      milestone_maker: { name: 'Milepæl Mester', description: 'Fullført alle milepæler i et mål', icon: '🗿', rarity: 'rare' }
    };

    const badgeDef = BADGE_DEFINITIONS[badgeId];
    if (!badgeDef) {
      throw new AppError('validation_error', 'Invalid badge ID', 400);
    }

    // Create badge
    const badge = await prisma.goalBadge.create({
      data: {
        userId,
        badgeId,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        rarity: badgeDef.rarity,
        viewed: false
      }
    });

    return {
      success: true,
      badge: {
        id: badge.id,
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon,
        rarity: badge.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        unlockedAt: badge.unlockedAt.toISOString()
      }
    };
  }

  async markBadgeViewed(userId: string, badgeId: string) {
    // Find the badge
    const badge = await prisma.goalBadge.findFirst({
      where: {
        userId,
        id: badgeId // badgeId here is actually the badge record ID
      }
    });

    if (!badge) {
      throw new AppError('validation_error', 'Badge not found', 404);
    }

    // Mark as viewed
    await prisma.goalBadge.update({
      where: { id: badgeId },
      data: { viewed: true }
    });

    return { success: true };
  }
}
