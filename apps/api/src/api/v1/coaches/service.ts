import { PrismaClient, Coach, Prisma, Availability } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../../middleware/errors';
import { CreateCoachInput, UpdateCoachInput, ListCoachesQuery } from './schema';

/**
 * Coach with count relations
 */
type CoachWithRelations = Prisma.CoachGetPayload<{
  include: { _count: { select: { players: true; trainingSessions: true } } };
}>;

/**
 * Player with plan status for coach view
 */
interface CoachPlayerView {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string | null;
  category: string;
  gender: string;
  birthDate: Date | null;
  handicap: number | null;
  status: string;
  profileImageUrl: string | null;
  createdAt: Date;
  hasActivePlan: boolean;
  planUpdated?: string;
  nextSession?: string;
  weeksInPlan: number;
}

/**
 * Alert for coach dashboard
 */
interface CoachAlert {
  id: string;
  athleteId: string;
  athleteName: string;
  type: 'proof_uploaded' | 'plan_pending' | 'note_request' | 'milestone';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface CoachListResponse {
  coaches: Coach[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CoachStatistics {
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  players: {
    total: number;
    active: number;
    byCategory: Record<string, number>;
  };
  sessions: {
    thisWeek: number;
    thisMonth: number;
    totalHours: number;
  };
}

export class CoachService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new coach
   */
  async createCoach(tenantId: string, input: CreateCoachInput): Promise<Coach> {
    // Check if email already exists for this tenant
    const existingCoach = await this.prisma.coach.findFirst({
      where: {
        tenantId,
        email: input.email,
      },
    });

    if (existingCoach) {
      throw new ConflictError('A coach with this email already exists');
    }

    // Create coach
    const coach = await this.prisma.coach.create({
      data: {
        tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        specializations: input.specializations || [],
        certifications: input.certifications || [],
        workingHours: input.workingHours || {},
        maxPlayersPerSession: input.maxPlayersPerSession,
        hourlyRate: input.hourlyRate,
        role: input.role,
        color: input.color,
        status: input.status,
        profileImageUrl: input.profileImageUrl,
      },
    });

    return coach;
  }

  /**
   * Get coach by ID
   */
  async getCoachById(tenantId: string, coachId: string): Promise<CoachWithRelations> {
    const coach = await this.prisma.coach.findFirst({
      where: {
        id: coachId,
        tenantId,
      },
      include: {
        _count: {
          select: {
            players: true,
            trainingSessions: true,
          },
        },
      },
    });

    if (!coach) {
      throw new NotFoundError('Coach not found');
    }

    return coach;
  }

  /**
   * List coaches with filters and pagination
   */
  async listCoaches(tenantId: string, query: ListCoachesQuery): Promise<CoachListResponse> {
    const { page = 1, limit = 20, search, status, specialization, sortBy, sortOrder } = query;

    // Build where clause
    const where: Prisma.CoachWhereInput = { tenantId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (specialization) {
      where.specializations = {
        array_contains: specialization,
      };
    }

    // Get total count and coaches in parallel
    const [total, coaches] = await Promise.all([
      this.prisma.coach.count({ where }),
      this.prisma.coach.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              players: true,
            },
          },
        },
      }),
    ]);

    return {
      coaches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update coach
   */
  async updateCoach(tenantId: string, coachId: string, input: UpdateCoachInput): Promise<Coach> {
    // Check if coach exists
    const existingCoach = await this.prisma.coach.findFirst({
      where: { id: coachId, tenantId },
    });

    if (!existingCoach) {
      throw new NotFoundError('Coach not found');
    }

    // Check email uniqueness if updating email
    if (input.email && input.email !== existingCoach.email) {
      const emailExists = await this.prisma.coach.findFirst({
        where: {
          tenantId,
          email: input.email,
          id: { not: coachId },
        },
      });

      if (emailExists) {
        throw new ConflictError('A coach with this email already exists');
      }
    }

    // Build update data
    const updateData: Prisma.CoachUpdateInput = {};

    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.specializations !== undefined) updateData.specializations = input.specializations;
    if (input.certifications !== undefined) updateData.certifications = input.certifications;
    if (input.workingHours !== undefined) updateData.workingHours = input.workingHours;
    if (input.maxPlayersPerSession !== undefined) updateData.maxPlayersPerSession = input.maxPlayersPerSession;
    if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.profileImageUrl !== undefined) updateData.profileImageUrl = input.profileImageUrl;

    // Update coach
    const coach = await this.prisma.coach.update({
      where: { id: coachId },
      data: updateData,
    });

    return coach;
  }

  /**
   * Delete coach
   */
  async deleteCoach(tenantId: string, coachId: string): Promise<void> {
    const coach = await this.prisma.coach.findFirst({
      where: { id: coachId, tenantId },
    });

    if (!coach) {
      throw new NotFoundError('Coach not found');
    }

    await this.prisma.coach.delete({
      where: { id: coachId },
    });
  }

  /**
   * Get coach availability for a date range
   */
  async getAvailability(tenantId: string, coachId: string, startDate: string, endDate: string): Promise<Availability[]> {
    await this.getCoachById(tenantId, coachId);

    const availability = await this.prisma.availability.findMany({
      where: {
        coachId,
        isActive: true,
        validFrom: {
          lte: new Date(endDate),
        },
        OR: [
          {
            validUntil: null,
          },
          {
            validUntil: {
              gte: new Date(startDate),
            },
          },
        ],
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return availability;
  }

  /**
   * Get coach statistics
   */
  async getStatistics(tenantId: string, coachId: string): Promise<CoachStatistics> {
    const coach = await this.getCoachById(tenantId, coachId);

    // Calculate date boundaries
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel
    const [players, sessionsThisWeek, sessionsThisMonth, totalDurationResult] = await Promise.all([
      // Get players assigned to this coach
      this.prisma.player.findMany({
        where: { tenantId, coachId },
        select: { status: true, category: true },
      }),
      // Count sessions this week
      this.prisma.trainingSession.count({
        where: { coachId, sessionDate: { gte: weekStart } },
      }),
      // Count sessions this month
      this.prisma.trainingSession.count({
        where: { coachId, sessionDate: { gte: monthStart } },
      }),
      // Get total hours using aggregate (more efficient than fetching all records)
      this.prisma.trainingSession.aggregate({
        where: { coachId },
        _sum: { duration: true },
      }),
    ]);

    // Process player data
    const activePlayers = players.filter((p) => p.status === 'active').length;
    const byCategory: Record<string, number> = {};
    players.forEach((player) => {
      byCategory[player.category] = (byCategory[player.category] || 0) + 1;
    });

    const totalHours = Math.round((totalDurationResult._sum.duration || 0) / 60);

    return {
      coach: {
        id: coach.id,
        firstName: coach.firstName,
        lastName: coach.lastName,
        email: coach.email,
      },
      players: {
        total: players.length,
        active: activePlayers,
        byCategory,
      },
      sessions: {
        thisWeek: sessionsThisWeek,
        thisMonth: sessionsThisMonth,
        totalHours,
      },
    };
  }

  /**
   * Get the start of the current week (Monday)
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  /**
   * Get all players assigned to a coach with plan status
   */
  async getCoachPlayers(tenantId: string, coachId: string): Promise<CoachPlayerView[]> {
    const now = new Date();

    const players = await this.prisma.player.findMany({
      where: {
        tenantId,
        coachId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        category: true,
        gender: true,
        dateOfBirth: true,
        handicap: true,
        status: true,
        profileImageUrl: true,
        createdAt: true,
        annualPlans: {
          where: {
            status: 'active',
            startDate: { lte: now },
            endDate: { gte: now },
          },
          select: {
            id: true,
            planName: true,
            startDate: true,
            endDate: true,
            updatedAt: true,
          },
          take: 1,
        },
        dailyAssignments: {
          where: {
            assignedDate: { gte: now },
            status: 'planned',
          },
          orderBy: { assignedDate: 'asc' },
          take: 1,
          select: {
            assignedDate: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return players.map(p => {
      const activePlan = p.annualPlans[0];
      const nextAssignment = p.dailyAssignments[0];

      // Calculate weeks in plan
      let weeksInPlan = 0;
      if (activePlan) {
        const planStart = new Date(activePlan.startDate);
        const planEnd = new Date(activePlan.endDate);
        weeksInPlan = Math.ceil((planEnd.getTime() - planStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      }

      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        category: p.category,
        gender: p.gender,
        birthDate: p.dateOfBirth,
        handicap: p.handicap ? Number(p.handicap) : null,
        status: p.status,
        profileImageUrl: p.profileImageUrl,
        createdAt: p.createdAt,
        hasActivePlan: !!activePlan,
        planUpdated: activePlan?.updatedAt?.toISOString().split('T')[0],
        nextSession: nextAssignment?.assignedDate?.toISOString().split('T')[0],
        weeksInPlan,
      };
    });
  }

  /**
   * Get alerts for a coach (based on player activity)
   */
  async getCoachAlerts(tenantId: string, coachId: string, _unreadOnly: boolean = false): Promise<CoachAlert[]> {
    const alerts: CoachAlert[] = [];

    // Get coach's players
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      include: {
        testResults: {
          orderBy: { testDate: 'desc' },
          take: 2,
          include: { test: true },
        },
        trainingSessions: {
          orderBy: { sessionDate: 'desc' },
          take: 1,
        },
        videos: {
          where: { status: 'uploaded' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        annualPlans: {
          where: { status: 'pending_approval' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const player of players) {
      const playerName = `${player.firstName} ${player.lastName}`;

      // Alert: New video uploaded (last 7 days)
      for (const video of player.videos) {
        if (video.createdAt && video.createdAt >= sevenDaysAgo) {
          alerts.push({
            id: `video_${video.id}`,
            athleteId: player.id,
            athleteName: playerName,
            type: 'proof_uploaded',
            message: `Ny video lastet opp: ${video.title || 'Uten tittel'}`,
            createdAt: video.createdAt.toISOString(),
            read: false,
          });
        }
      }

      // Alert: Training plan pending approval
      if (player.annualPlans.length > 0) {
        const plan = player.annualPlans[0];
        alerts.push({
          id: `plan_${plan.id}`,
          athleteId: player.id,
          athleteName: playerName,
          type: 'plan_pending',
          message: 'Treningsplan venter på godkjenning',
          createdAt: plan.createdAt.toISOString(),
          read: false,
        });
      }

      // Alert: Inactive player (no sessions in 14 days)
      const lastSession = player.trainingSessions[0];
      if (!lastSession || lastSession.sessionDate < fourteenDaysAgo) {
        alerts.push({
          id: `inactive_${player.id}`,
          athleteId: player.id,
          athleteName: playerName,
          type: 'note_request',
          message: 'Ingen treningsøkter de siste 14 dagene',
          createdAt: now.toISOString(),
          read: false,
        });
      }

      // Alert: Test performance change
      if (player.testResults.length >= 2) {
        const [latest, previous] = player.testResults;
        if (latest.test.testNumber === previous.test.testNumber) {
          const latestVal = Number(latest.value);
          const prevVal = Number(previous.value);
          if (latestVal < prevVal * 0.9) { // More than 10% drop
            alerts.push({
              id: `test_drop_${latest.id}`,
              athleteId: player.id,
              athleteName: playerName,
              type: 'milestone',
              message: `Nedgang i ${latest.test.name}: ${prevVal} → ${latestVal}`,
              createdAt: latest.testDate.toISOString(),
              read: false,
            });
          }
        }
      }
    }

    // Sort by date (most recent first)
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to 50 alerts
    return alerts.slice(0, 50);
  }

  // =========================================================================
  // BATCH OPERATIONS
  // =========================================================================

  /**
   * Batch assign players to a training session type
   */
  async batchAssignSession(
    tenantId: string,
    coachId: string,
    playerIds: string[],
    session: {
      sessionType: string;
      scheduledDate: string;
      durationMinutes?: number;
      notes?: string;
    }
  ): Promise<{ success: string[]; failed: Array<{ playerId: string; error: string }> }> {
    const success: string[] = [];
    const failed: Array<{ playerId: string; error: string }> = [];

    // Verify all players belong to this coach
    const validPlayers = await this.prisma.player.findMany({
      where: {
        id: { in: playerIds },
        tenantId,
        coachId,
      },
      select: { id: true },
    });

    const validIds = new Set(validPlayers.map(p => p.id));

    for (const playerId of playerIds) {
      try {
        if (!validIds.has(playerId)) {
          failed.push({ playerId, error: 'Player not found or not assigned to this coach' });
          continue;
        }

        // Create training session for this player
        await this.prisma.trainingSession.create({
          data: {
            tenantId,
            playerId,
            coachId,
            sessionDate: new Date(session.scheduledDate),
            sessionType: session.sessionType,
            duration: session.durationMinutes || 60,
            notes: session.notes,
            status: 'planned',
          },
        });

        success.push(playerId);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        failed.push({ playerId, error });
      }
    }

    return { success, failed };
  }

  /**
   * Batch send notes to players
   */
  async batchSendNote(
    tenantId: string,
    coachId: string,
    playerIds: string[],
    note: {
      title: string;
      content: string;
      category?: string;
    }
  ): Promise<{ success: string[]; failed: Array<{ playerId: string; error: string }> }> {
    const success: string[] = [];
    const failed: Array<{ playerId: string; error: string }> = [];

    // Verify all players belong to this coach
    const validPlayers = await this.prisma.player.findMany({
      where: {
        id: { in: playerIds },
        tenantId,
        coachId,
      },
      select: { id: true },
    });

    const validIds = new Set(validPlayers.map(p => p.id));

    for (const playerId of playerIds) {
      try {
        if (!validIds.has(playerId)) {
          failed.push({ playerId, error: 'Player not found or not assigned to this coach' });
          continue;
        }

        // Create note for this player
        await this.prisma.note.create({
          data: {
            tenantId,
            playerId,
            coachId,
            title: note.title,
            content: note.content,
            category: note.category || 'general',
            visibility: 'private',
          },
        });

        success.push(playerId);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        failed.push({ playerId, error });
      }
    }

    return { success, failed };
  }

  /**
   * Batch update player status
   */
  async batchUpdateStatus(
    tenantId: string,
    coachId: string,
    playerIds: string[],
    status: 'active' | 'inactive' | 'on_break'
  ): Promise<{ success: string[]; failed: Array<{ playerId: string; error: string }> }> {
    const success: string[] = [];
    const failed: Array<{ playerId: string; error: string }> = [];

    // Verify all players belong to this coach
    const validPlayers = await this.prisma.player.findMany({
      where: {
        id: { in: playerIds },
        tenantId,
        coachId,
      },
      select: { id: true },
    });

    const validIds = new Set(validPlayers.map(p => p.id));

    for (const playerId of playerIds) {
      try {
        if (!validIds.has(playerId)) {
          failed.push({ playerId, error: 'Player not found or not assigned to this coach' });
          continue;
        }

        // Update player status
        await this.prisma.player.update({
          where: { id: playerId },
          data: { status },
        });

        success.push(playerId);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        failed.push({ playerId, error });
      }
    }

    return { success, failed };
  }

  /**
   * Batch create training plan from template
   */
  async batchCreatePlanFromTemplate(
    tenantId: string,
    coachId: string,
    playerIds: string[],
    planOptions: {
      planName: string;
      startDate: string;
      durationWeeks: number;
      focusAreas?: string[];
    }
  ): Promise<{ success: string[]; failed: Array<{ playerId: string; error: string }> }> {
    const success: string[] = [];
    const failed: Array<{ playerId: string; error: string }> = [];

    // Verify all players belong to this coach
    const validPlayers = await this.prisma.player.findMany({
      where: {
        id: { in: playerIds },
        tenantId,
        coachId,
      },
      select: { id: true, firstName: true, lastName: true },
    });

    const validPlayersMap = new Map(validPlayers.map(p => [p.id, p]));

    const startDate = new Date(planOptions.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planOptions.durationWeeks * 7);

    for (const playerId of playerIds) {
      try {
        const player = validPlayersMap.get(playerId);
        if (!player) {
          failed.push({ playerId, error: 'Player not found or not assigned to this coach' });
          continue;
        }

        // Create annual plan for this player
        await this.prisma.annualPlan.create({
          data: {
            tenantId,
            playerId,
            planName: `${planOptions.planName} - ${player.firstName} ${player.lastName}`,
            startDate,
            endDate,
            status: 'active',
            goals: planOptions.focusAreas ? { focusAreas: planOptions.focusAreas } : {},
          },
        });

        success.push(playerId);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        failed.push({ playerId, error });
      }
    }

    return { success, failed };
  }

  // =========================================================================
  // PLAYER ASSIGNMENT OPERATIONS
  // =========================================================================

  /**
   * Assign a player to a coach
   */
  async assignPlayerToCoach(
    tenantId: string,
    coachId: string,
    playerId: string
  ): Promise<any> {
    // Verify coach exists
    const coach = await this.prisma.coach.findFirst({
      where: { id: coachId, tenantId },
    });
    if (!coach) {
      throw new Error('Coach not found');
    }

    // Verify player exists and get current state
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });
    if (!player) {
      throw new Error('Player not found');
    }

    // Check if player already has a coach
    if (player.coachId) {
      if (player.coachId === coachId) {
        throw new Error('Player is already assigned to this coach');
      }
      throw new Error('Player is already assigned to another coach');
    }

    // Assign player to coach
    const updatedPlayer = await this.prisma.player.update({
      where: { id: playerId },
      data: { coachId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedPlayer;
  }

  /**
   * Unassign a player from a coach
   */
  async unassignPlayerFromCoach(
    tenantId: string,
    coachId: string,
    playerId: string
  ): Promise<void> {
    // Verify player exists and belongs to this coach
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId, coachId },
    });
    if (!player) {
      throw new Error('Player not found or not assigned to this coach');
    }

    // Remove coach assignment
    await this.prisma.player.update({
      where: { id: playerId },
      data: { coachId: null },
    });
  }

  /**
   * Get available players (without a coach) for assignment
   */
  async getAvailablePlayers(
    tenantId: string,
    search?: string
  ): Promise<any[]> {
    const where: any = {
      tenantId,
      coachId: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const players = await this.prisma.player.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        handicap: true,
        category: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      take: 50,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return players;
  }
}
