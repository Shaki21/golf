import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, BadRequestError } from '../../../middleware/errors';
import { CreatePlayerInput, UpdatePlayerInput, ListPlayersQuery, PlayerOnboardingInput } from './schema';

/**
 * Player with coach and parent relations
 */
type PlayerWithRelations = Prisma.PlayerGetPayload<{
  include: {
    coach: { select: { id: true; firstName: true; lastName: true; email?: true } };
    parent: { select: { id: true; firstName: true; lastName: true; email?: true; phone?: true } };
  };
}>;

export interface PlayerListResponse {
  players: PlayerWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WeeklySummary {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    category: string;
    profileImageUrl: string | null;
  };
  week: {
    start: string;
    end: string;
  };
  training: {
    totalHours: number;
    sessionsCompleted: number;
    plannedHours: number;
  };
  tests: {
    completed: number;
    improvements: number;
  };
  breakingPoints: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export class PlayerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new player
   */
  async createPlayer(tenantId: string, input: CreatePlayerInput): Promise<PlayerWithRelations> {
    // Check if email already exists for this tenant (if provided)
    if (input.email) {
      const existingPlayer = await this.prisma.player.findFirst({
        where: {
          tenantId,
          email: input.email,
        },
      });

      if (existingPlayer) {
        throw new ConflictError('A player with this email already exists');
      }
    }

    // Verify coach exists if coachId provided
    if (input.coachId) {
      const coach = await this.prisma.coach.findFirst({
        where: { id: input.coachId, tenantId },
      });

      if (!coach) {
        throw new BadRequestError('Coach not found');
      }
    }

    // Verify parent exists if parentId provided
    if (input.parentId) {
      const parent = await this.prisma.parent.findFirst({
        where: { id: input.parentId, tenantId },
      });

      if (!parent) {
        throw new BadRequestError('Parent not found');
      }
    }

    // Create player
    const player = await this.prisma.player.create({
      data: {
        tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        dateOfBirth: new Date(input.dateOfBirth),
        gender: input.gender,
        category: input.category,
        averageScore: input.averageScore,
        handicap: input.handicap,
        wagrRank: input.wagrRank,
        club: input.club,
        coachId: input.coachId,
        parentId: input.parentId,
        currentPeriod: input.currentPeriod,
        weeklyTrainingHours: input.weeklyTrainingHours,
        seasonStartDate: input.seasonStartDate ? new Date(input.seasonStartDate) : null,
        status: input.status,
        profileImageUrl: input.profileImageUrl,
        emergencyContact: input.emergencyContact as any,
        medicalNotes: input.medicalNotes,
        goals: input.goals || [],
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return player;
  }

  /**
   * Get player by ID
   */
  async getPlayerById(tenantId: string, playerId: string): Promise<PlayerWithRelations> {
    const player = await this.prisma.player.findFirst({
      where: {
        id: playerId,
        tenantId,
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    return player;
  }

  /**
   * List players with filters and pagination
   */
  async listPlayers(tenantId: string, query: ListPlayersQuery): Promise<PlayerListResponse> {
    const { page = 1, limit = 20, search, category, status, coachId, currentPeriod, sortBy, sortOrder } = query;

    // Build where clause
    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (coachId) {
      where.coachId = coachId;
    }

    if (currentPeriod) {
      where.currentPeriod = currentPeriod;
    }

    // Get total count
    const total = await this.prisma.player.count({ where });

    // Get players
    const players = await this.prisma.player.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      players,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update player
   */
  async updatePlayer(tenantId: string, playerId: string, input: UpdatePlayerInput): Promise<PlayerWithRelations> {
    // Check if player exists
    const existingPlayer = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!existingPlayer) {
      throw new NotFoundError('Player not found');
    }

    // Check email uniqueness if updating email
    if (input.email && input.email !== existingPlayer.email) {
      const emailExists = await this.prisma.player.findFirst({
        where: {
          tenantId,
          email: input.email,
          id: { not: playerId },
        },
      });

      if (emailExists) {
        throw new ConflictError('A player with this email already exists');
      }
    }

    // Verify coach exists if updating coachId
    if (input.coachId) {
      const coach = await this.prisma.coach.findFirst({
        where: { id: input.coachId, tenantId },
      });

      if (!coach) {
        throw new BadRequestError('Coach not found');
      }
    }

    // Verify parent exists if updating parentId
    if (input.parentId) {
      const parent = await this.prisma.parent.findFirst({
        where: { id: input.parentId, tenantId },
      });

      if (!parent) {
        throw new BadRequestError('Parent not found');
      }
    }

    // Build update data
    const updateData: any = {};

    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.averageScore !== undefined) updateData.averageScore = input.averageScore;
    if (input.handicap !== undefined) updateData.handicap = input.handicap;
    if (input.wagrRank !== undefined) updateData.wagrRank = input.wagrRank;
    if (input.club !== undefined) updateData.club = input.club;
    if (input.coachId !== undefined) updateData.coachId = input.coachId;
    if (input.parentId !== undefined) updateData.parentId = input.parentId;
    if (input.currentPeriod !== undefined) updateData.currentPeriod = input.currentPeriod;
    if (input.weeklyTrainingHours !== undefined) updateData.weeklyTrainingHours = input.weeklyTrainingHours;
    if (input.seasonStartDate !== undefined) {
      updateData.seasonStartDate = input.seasonStartDate ? new Date(input.seasonStartDate) : null;
    }
    if (input.status !== undefined) updateData.status = input.status;
    if (input.profileImageUrl !== undefined) updateData.profileImageUrl = input.profileImageUrl;
    if (input.emergencyContact !== undefined) updateData.emergencyContact = input.emergencyContact;
    if (input.medicalNotes !== undefined) updateData.medicalNotes = input.medicalNotes;
    if (input.goals !== undefined) updateData.goals = input.goals;

    // Update player
    const player = await this.prisma.player.update({
      where: { id: playerId },
      data: updateData,
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return player;
  }

  /**
   * Delete player
   */
  async deletePlayer(tenantId: string, playerId: string): Promise<void> {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    await this.prisma.player.delete({
      where: { id: playerId },
    });
  }

  /**
   * Get player's weekly summary
   */
  async getWeeklySummary(tenantId: string, playerId: string, weekStart?: string): Promise<WeeklySummary> {
    const player = await this.getPlayerById(tenantId, playerId);

    // Calculate week start and end
    const start = weekStart ? new Date(weekStart) : this.getWeekStart(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    // Get training sessions for the week
    const trainingSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: start,
          lt: end,
        },
      },
    });

    const totalHours = trainingSessions.reduce((sum, session) => {
      return sum + (session.duration || 0);
    }, 0);

    // Get test results for the week
    const testResults = await this.prisma.testResult.findMany({
      where: {
        playerId,
        testDate: {
          gte: start,
          lt: end,
        },
      },
    });

    // Count improvements (where result is better than baseline or previous)
    const improvements = testResults.filter((result) => {
      const feedback = result.coachFeedback || result.playerFeedback || '';
      return feedback.toLowerCase().includes('improvement') ||
             feedback.toLowerCase().includes('better') ||
             (result.improvementFromLast !== null && Number(result.improvementFromLast) > 0);
    }).length;

    // Get breaking points
    const breakingPoints = await this.prisma.breakingPoint.findMany({
      where: {
        playerId,
      },
    });

    const completed = breakingPoints.filter((bp) => bp.status === 'completed').length;
    const inProgress = breakingPoints.filter((bp) => bp.status === 'in_progress').length;

    return {
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        category: player.category,
        profileImageUrl: player.profileImageUrl,
      },
      week: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      training: {
        totalHours: Math.round(totalHours / 60), // Convert minutes to hours
        sessionsCompleted: trainingSessions.length,
        plannedHours: player.weeklyTrainingHours || 10,
      },
      tests: {
        completed: testResults.length,
        improvements,
      },
      breakingPoints: {
        total: breakingPoints.length,
        completed,
        inProgress,
      },
    };
  }

  /**
   * Complete player onboarding - update player profile with onboarding data
   */
  async completeOnboarding(
    tenantId: string,
    playerId: string,
    input: PlayerOnboardingInput
  ): Promise<PlayerWithRelations> {
    // Check if player exists
    const existingPlayer = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!existingPlayer) {
      throw new NotFoundError('Player not found');
    }

    // Verify coach exists if coachId provided
    if (input.coachId) {
      const coach = await this.prisma.coach.findFirst({
        where: { id: input.coachId, tenantId },
      });

      if (!coach) {
        throw new BadRequestError('Coach not found');
      }
    }

    // Convert goals array of strings to goals array of objects
    const goalsData = input.goals.map((goalTitle) => ({
      title: goalTitle,
      completed: false,
    }));

    // Update player with onboarding data
    const player = await this.prisma.player.update({
      where: { id: playerId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: new Date(input.dateOfBirth),
        gender: input.gender,
        phone: input.phone,
        handicap: input.handicap,
        category: input.category || 'D',
        club: input.club,
        coachId: input.coachId,
        emergencyContact: input.emergencyContact as any,
        goals: goalsData,
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return player;
  }

  /**
   * Get the start of the current week (Monday)
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }
}
