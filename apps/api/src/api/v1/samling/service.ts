import {
  PrismaClient,
  Prisma,
  Samling,
  SamlingParticipant,
  SamlingSession,
  SamlingSessionAttendance,
} from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';
import {
  CreateSamlingInput,
  UpdateSamlingInput,
  ListSamlingerQuery,
  AddParticipantsInput,
  UpdateParticipantStatusInput,
  CreateSessionInput,
  UpdateSessionInput,
  RecordAttendanceInput,
} from './schema';

// ============================================================================
// TYPES
// ============================================================================

export interface SamlingWithRelations extends Samling {
  coach: { id: string; firstName: string; lastName: string };
  golfCourse?: { id: string; name: string } | null;
  participants: (SamlingParticipant & {
    player: { id: string; firstName: string; lastName: string; category: string };
  })[];
  sessions: SamlingSession[];
  _count: {
    participants: number;
    sessions: number;
  };
}

export interface SamlingListResponse {
  samlinger: SamlingWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ParticipantWithPlayer extends SamlingParticipant {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    category: string;
    avatar: string | null;
  };
}

export interface CalendarDay {
  date: Date;
  sessions: SamlingSession[];
}

export interface SyncResult {
  playerId: string;
  success: boolean;
  assignmentsCreated?: number;
  calendarEventsCreated?: number;
  error?: string;
}

export interface PublishResult {
  samling: Samling;
  syncResults: SyncResult[];
}

// ============================================================================
// SERVICE
// ============================================================================

export class SamlingService {
  constructor(private prisma: PrismaClient) {}

  // ==========================================================================
  // SAMLING CRUD
  // ==========================================================================

  /**
   * Create a new samling
   */
  async createSamling(
    tenantId: string,
    coachId: string,
    input: CreateSamlingInput
  ): Promise<Samling> {
    // Validate dates
    if (input.endDate < input.startDate) {
      throw new BadRequestError('End date must be after start date');
    }

    const samling = await this.prisma.samling.create({
      data: {
        tenantId,
        coachId,
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        venue: input.venue,
        golfCourseId: input.golfCourseId,
        address: input.address,
        locationDetails: input.locationDetails as Prisma.InputJsonValue,
        accommodation: input.accommodation,
        meetingPoint: input.meetingPoint,
        transportInfo: input.transportInfo,
        maxParticipants: input.maxParticipants,
        notes: input.notes,
        status: 'draft',
      },
    });

    return samling;
  }

  /**
   * Get samling by ID with all relations
   */
  async getSamling(id: string, tenantId: string): Promise<SamlingWithRelations> {
    const samling = await this.prisma.samling.findFirst({
      where: { id, tenantId },
      include: {
        coach: {
          select: { id: true, firstName: true, lastName: true },
        },
        golfCourse: {
          select: { id: true, name: true },
        },
        participants: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        sessions: {
          orderBy: [{ sessionDate: 'asc' }, { orderInDay: 'asc' }],
        },
        _count: {
          select: { participants: true, sessions: true },
        },
      },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    return samling as SamlingWithRelations;
  }

  /**
   * List samlinger with filters and pagination
   */
  async listSamlinger(
    tenantId: string,
    coachId: string,
    query: ListSamlingerQuery
  ): Promise<SamlingListResponse> {
    const { page = 1, limit = 20, status, startDateFrom, startDateTo } = query;

    const where: Prisma.SamlingWhereInput = {
      tenantId,
      coachId,
    };

    if (status) {
      where.status = status;
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = startDateFrom;
      if (startDateTo) where.startDate.lte = startDateTo;
    }

    const total = await this.prisma.samling.count({ where });

    const samlinger = await this.prisma.samling.findMany({
      where,
      include: {
        coach: {
          select: { id: true, firstName: true, lastName: true },
        },
        golfCourse: {
          select: { id: true, name: true },
        },
        participants: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                category: true,
              },
            },
          },
        },
        sessions: {
          orderBy: [{ sessionDate: 'asc' }, { orderInDay: 'asc' }],
        },
        _count: {
          select: { participants: true, sessions: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'desc' },
    });

    return {
      samlinger: samlinger as SamlingWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update samling
   */
  async updateSamling(
    id: string,
    tenantId: string,
    input: UpdateSamlingInput
  ): Promise<Samling> {
    const existing = await this.prisma.samling.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundError('Samling not found');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestError('Can only update draft samlinger');
    }

    const updateData: Prisma.SamlingUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.venue !== undefined) updateData.venue = input.venue;
    if (input.golfCourseId !== undefined) updateData.golfCourseId = input.golfCourseId;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.locationDetails !== undefined)
      updateData.locationDetails = input.locationDetails as Prisma.InputJsonValue;
    if (input.accommodation !== undefined) updateData.accommodation = input.accommodation;
    if (input.meetingPoint !== undefined) updateData.meetingPoint = input.meetingPoint;
    if (input.transportInfo !== undefined) updateData.transportInfo = input.transportInfo;
    if (input.maxParticipants !== undefined) updateData.maxParticipants = input.maxParticipants;
    if (input.notes !== undefined) updateData.notes = input.notes;

    return this.prisma.samling.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete samling (only draft)
   */
  async deleteSamling(id: string, tenantId: string): Promise<void> {
    const existing = await this.prisma.samling.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundError('Samling not found');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestError('Can only delete draft samlinger');
    }

    await this.prisma.samling.delete({ where: { id } });
  }

  // ==========================================================================
  // STATUS TRANSITIONS
  // ==========================================================================

  /**
   * Publish samling and trigger sync to participants
   */
  async publishSamling(id: string, tenantId: string): Promise<PublishResult> {
    const samling = await this.prisma.samling.findFirst({
      where: { id, tenantId },
      include: {
        participants: {
          where: { invitationStatus: 'confirmed' },
          include: { player: true },
        },
        sessions: true,
      },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    if (samling.status !== 'draft') {
      throw new BadRequestError('Can only publish draft samlinger');
    }

    // Update status
    const updatedSamling = await this.prisma.samling.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    // Sync to all confirmed participants
    const syncResults: SyncResult[] = [];
    for (const participant of samling.participants) {
      try {
        const result = await this.syncSessionsToTrainingPlan(id, participant.playerId);
        syncResults.push(result);

        // Update participant sync status
        await this.prisma.samlingParticipant.update({
          where: { id: participant.id },
          data: {
            syncedToTrainingPlan: true,
            syncedToCalendar: false, // Calendar sync can be done separately
          },
        });
      } catch (error) {
        syncResults.push({
          playerId: participant.playerId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { samling: updatedSamling, syncResults };
  }

  /**
   * Cancel samling
   */
  async cancelSamling(id: string, tenantId: string): Promise<Samling> {
    const existing = await this.prisma.samling.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundError('Samling not found');
    }

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      throw new BadRequestError('Cannot cancel a completed or already cancelled samling');
    }

    return this.prisma.samling.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Mark samling as completed
   */
  async completeSamling(id: string, tenantId: string): Promise<Samling> {
    const existing = await this.prisma.samling.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundError('Samling not found');
    }

    if (existing.status !== 'published' && existing.status !== 'in_progress') {
      throw new BadRequestError('Can only complete published or in-progress samlinger');
    }

    return this.prisma.samling.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  // ==========================================================================
  // PARTICIPANTS
  // ==========================================================================

  /**
   * Add participants to samling
   */
  async addParticipants(
    samlingId: string,
    tenantId: string,
    input: AddParticipantsInput
  ): Promise<SamlingParticipant[]> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const participants: SamlingParticipant[] = [];

    if (input.type === 'individual' && input.playerIds) {
      for (const playerId of input.playerIds) {
        // Check if player exists
        const player = await this.prisma.player.findFirst({
          where: { id: playerId, tenantId },
        });

        if (!player) continue;

        // Check if already a participant
        const existing = await this.prisma.samlingParticipant.findUnique({
          where: { samlingId_playerId: { samlingId, playerId } },
        });

        if (existing) continue;

        const participant = await this.prisma.samlingParticipant.create({
          data: {
            samlingId,
            playerId,
            addedVia: 'individual',
            invitationStatus: 'invited',
          },
        });

        participants.push(participant);
      }
    }

    // Note: Group handling would require a Group model to be implemented
    // For now, we only support individual player addition

    return participants;
  }

  /**
   * Get participants for a samling
   */
  async getParticipants(
    samlingId: string,
    tenantId: string
  ): Promise<ParticipantWithPlayer[]> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    return this.prisma.samlingParticipant.findMany({
      where: { samlingId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            category: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Remove participant from samling
   */
  async removeParticipant(
    samlingId: string,
    playerId: string,
    tenantId: string
  ): Promise<void> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const participant = await this.prisma.samlingParticipant.findUnique({
      where: { samlingId_playerId: { samlingId, playerId } },
    });

    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    await this.prisma.samlingParticipant.delete({
      where: { id: participant.id },
    });
  }

  /**
   * Update participant invitation status
   */
  async updateParticipantStatus(
    samlingId: string,
    playerId: string,
    tenantId: string,
    input: UpdateParticipantStatusInput
  ): Promise<SamlingParticipant> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const participant = await this.prisma.samlingParticipant.findUnique({
      where: { samlingId_playerId: { samlingId, playerId } },
    });

    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    return this.prisma.samlingParticipant.update({
      where: { id: participant.id },
      data: {
        invitationStatus: input.status,
        declineReason: input.declineReason,
        respondedAt: new Date(),
      },
    });
  }

  // ==========================================================================
  // SESSIONS
  // ==========================================================================

  /**
   * Create a session in samling
   */
  async createSession(
    samlingId: string,
    tenantId: string,
    input: CreateSessionInput
  ): Promise<SamlingSession> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    // Validate session date is within samling dates
    const sessionDate = new Date(input.sessionDate);
    if (sessionDate < samling.startDate || sessionDate > samling.endDate) {
      throw new BadRequestError('Session date must be within samling dates');
    }

    return this.prisma.samlingSession.create({
      data: {
        samlingId,
        sessionDate: input.sessionDate,
        startTime: input.startTime,
        endTime: input.endTime,
        duration: input.duration,
        title: input.title,
        description: input.description,
        sessionType: input.sessionType,
        location: input.location,
        exercises: input.exercises as Prisma.InputJsonValue,
        objectives: input.objectives,
        equipment: input.equipment,
        period: input.period,
        learningPhase: input.learningPhase,
        intensity: input.intensity,
        sessionTemplateId: input.sessionTemplateId,
        orderInDay: input.orderInDay,
        notes: input.notes,
      },
    });
  }

  /**
   * Get sessions for a samling
   */
  async getSessions(samlingId: string, tenantId: string): Promise<SamlingSession[]> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    return this.prisma.samlingSession.findMany({
      where: { samlingId },
      orderBy: [{ sessionDate: 'asc' }, { orderInDay: 'asc' }],
    });
  }

  /**
   * Update a session
   */
  async updateSession(
    samlingId: string,
    sessionId: string,
    tenantId: string,
    input: UpdateSessionInput
  ): Promise<SamlingSession> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const session = await this.prisma.samlingSession.findFirst({
      where: { id: sessionId, samlingId },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const updateData: Prisma.SamlingSessionUpdateInput = {};

    if (input.sessionDate !== undefined) updateData.sessionDate = input.sessionDate;
    if (input.startTime !== undefined) updateData.startTime = input.startTime;
    if (input.endTime !== undefined) updateData.endTime = input.endTime;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.sessionType !== undefined) updateData.sessionType = input.sessionType;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.exercises !== undefined)
      updateData.exercises = input.exercises as Prisma.InputJsonValue;
    if (input.objectives !== undefined) updateData.objectives = input.objectives;
    if (input.equipment !== undefined) updateData.equipment = input.equipment;
    if (input.period !== undefined) updateData.period = input.period;
    if (input.learningPhase !== undefined) updateData.learningPhase = input.learningPhase;
    if (input.intensity !== undefined) updateData.intensity = input.intensity;
    if (input.sessionTemplateId !== undefined) updateData.sessionTemplateId = input.sessionTemplateId;
    if (input.orderInDay !== undefined) updateData.orderInDay = input.orderInDay;
    if (input.notes !== undefined) updateData.notes = input.notes;

    return this.prisma.samlingSession.update({
      where: { id: sessionId },
      data: updateData,
    });
  }

  /**
   * Delete a session
   */
  async deleteSession(
    samlingId: string,
    sessionId: string,
    tenantId: string
  ): Promise<void> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const session = await this.prisma.samlingSession.findFirst({
      where: { id: sessionId, samlingId },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    await this.prisma.samlingSession.delete({ where: { id: sessionId } });
  }

  /**
   * Get calendar view of sessions
   */
  async getCalendarView(samlingId: string, tenantId: string): Promise<CalendarDay[]> {
    const samling = await this.getSamling(samlingId, tenantId);

    // Group sessions by date
    const sessionsByDate = new Map<string, SamlingSession[]>();

    for (const session of samling.sessions) {
      const dateKey = session.sessionDate.toISOString().split('T')[0];
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, []);
      }
      sessionsByDate.get(dateKey)!.push(session);
    }

    // Generate all days between start and end
    const days: CalendarDay[] = [];
    const currentDate = new Date(samling.startDate);
    const endDate = new Date(samling.endDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      days.push({
        date: new Date(currentDate),
        sessions: sessionsByDate.get(dateKey) || [],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  // ==========================================================================
  // SYNC LOGIC
  // ==========================================================================

  /**
   * Sync samling sessions to a player's training plan
   */
  async syncSessionsToTrainingPlan(
    samlingId: string,
    playerId: string
  ): Promise<SyncResult> {
    const samling = await this.prisma.samling.findUnique({
      where: { id: samlingId },
      include: { sessions: { orderBy: { sessionDate: 'asc' } } },
    });

    if (!samling) {
      return { playerId, success: false, error: 'Samling not found' };
    }

    // Find player's active annual plan (if exists)
    const annualPlan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        status: 'active',
        startDate: { lte: samling.endDate },
        endDate: { gte: samling.startDate },
      },
    });

    if (!annualPlan) {
      // No active plan - skip training plan sync but still count as success
      return {
        playerId,
        success: true,
        assignmentsCreated: 0,
        error: 'No active training plan found',
      };
    }

    let assignmentsCreated = 0;

    for (const session of samling.sessions) {
      const sessionDate = new Date(session.sessionDate);
      const weekNumber = getWeekNumber(sessionDate);
      const dayOfWeek = sessionDate.getDay();

      // Check if assignment already exists for this date/type
      const existing = await this.prisma.dailyTrainingAssignment.findFirst({
        where: {
          annualPlanId: annualPlan.id,
          assignedDate: sessionDate,
          samlingSessionId: session.id,
        },
      });

      if (existing) continue;

      await this.prisma.dailyTrainingAssignment.create({
        data: {
          annualPlanId: annualPlan.id,
          playerId,
          assignedDate: sessionDate,
          weekNumber,
          dayOfWeek,
          sessionType: session.sessionType,
          estimatedDuration: session.duration,
          period: session.period || 'S',
          learningPhase: session.learningPhase,
          intensity: session.intensity,
          isRestDay: false,
          status: 'planned',
          coachNotes: `Samling: ${samling.name} - ${session.title}`,
          samlingSessionId: session.id,
          sourceType: 'samling',
        },
      });

      assignmentsCreated++;
    }

    return {
      playerId,
      success: true,
      assignmentsCreated,
    };
  }

  /**
   * Manual sync trigger
   */
  async manualSync(samlingId: string, tenantId: string): Promise<SyncResult[]> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
      include: {
        participants: {
          where: { invitationStatus: 'confirmed' },
        },
      },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const results: SyncResult[] = [];

    for (const participant of samling.participants) {
      const result = await this.syncSessionsToTrainingPlan(samlingId, participant.playerId);
      results.push(result);

      if (result.success) {
        await this.prisma.samlingParticipant.update({
          where: { id: participant.id },
          data: { syncedToTrainingPlan: true },
        });
      }
    }

    return results;
  }

  // ==========================================================================
  // ATTENDANCE
  // ==========================================================================

  /**
   * Record attendance for a session
   */
  async recordAttendance(
    samlingId: string,
    sessionId: string,
    tenantId: string,
    input: RecordAttendanceInput
  ): Promise<SamlingSessionAttendance[]> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const session = await this.prisma.samlingSession.findFirst({
      where: { id: sessionId, samlingId },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const results: SamlingSessionAttendance[] = [];

    for (const record of input.attendance) {
      const attendance = await this.prisma.samlingSessionAttendance.upsert({
        where: {
          sessionId_participantId: {
            sessionId,
            participantId: record.participantId,
          },
        },
        create: {
          sessionId,
          participantId: record.participantId,
          attended: record.attended,
          attendedAt: record.attended ? new Date() : null,
          performance: record.performance as Prisma.InputJsonValue,
          coachNotes: record.coachNotes,
        },
        update: {
          attended: record.attended,
          attendedAt: record.attended ? new Date() : null,
          performance: record.performance as Prisma.InputJsonValue,
          coachNotes: record.coachNotes,
        },
      });

      results.push(attendance);
    }

    return results;
  }

  /**
   * Get attendance overview for a samling
   */
  async getAttendanceOverview(samlingId: string, tenantId: string): Promise<{
    totalSessions: number;
    participants: {
      participantId: string;
      player: { firstName: string; lastName: string };
      sessionsAttended: number;
      attendanceRate: number;
    }[];
  }> {
    const samling = await this.prisma.samling.findFirst({
      where: { id: samlingId, tenantId },
      include: {
        sessions: true,
        participants: {
          include: {
            player: {
              select: { firstName: true, lastName: true },
            },
            sessionAttendance: {
              where: { attended: true },
            },
          },
        },
      },
    });

    if (!samling) {
      throw new NotFoundError('Samling not found');
    }

    const totalSessions = samling.sessions.length;

    const participants = samling.participants.map((p) => ({
      participantId: p.id,
      player: p.player,
      sessionsAttended: p.sessionAttendance.length,
      attendanceRate: totalSessions > 0
        ? Math.round((p.sessionAttendance.length / totalSessions) * 100)
        : 0,
    }));

    return { totalSessions, participants };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get ISO week number from date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
