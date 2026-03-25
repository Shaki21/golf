/**
 * Technique Plan Service
 * Business logic for technique tasks, goals, and TrackMan imports
 */

import { PrismaClient, Prisma } from '@prisma/client';

type Decimal = Prisma.Decimal;
import { parseTrackmanCSV, TrackmanShotData } from './csv-parser';
import { parseTrackmanPDF } from './pdf-parser';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
  CreateGoalInput,
  UpdateGoalInput,
  ListGoalsQuery,
  ListImportsQuery,
  StatsQuery,
} from './schema';

export class TechniquePlanService {
  constructor(private prisma: PrismaClient) {}

  // =========================================================================
  // TASKS
  // =========================================================================

  async createTask(
    input: CreateTaskInput & {
      pLevel?: string;
      repetitions?: number;
      priorityOrder?: number;
      imageUrls?: string[];
    },
    createdById: string,
    creatorType: 'coach' | 'player',
    tenantId: string
  ) {
    return this.prisma.techniqueTask.create({
      data: {
        playerId: input.playerId,
        createdById,
        creatorType,
        tenantId,
        title: input.title,
        description: input.description,
        instructions: input.instructions,
        videoUrl: input.videoUrl,
        technicalArea: input.technicalArea,
        targetMetrics: input.targetMetrics || undefined,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        // P-System fields
        pLevel: input.pLevel,
        repetitions: input.repetitions ?? 0,
        priorityOrder: input.priorityOrder ?? 0,
        imageUrls: input.imageUrls || [],
      },
      include: {
        player: {
          select: { firstName: true, lastName: true },
        },
        drills: {
          include: {
            exercise: {
              select: { id: true, name: true, exerciseType: true },
            },
          },
        },
        responsible: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
        },
      },
    });
  }

  async getTask(taskId: string, tenantId: string) {
    return this.prisma.techniqueTask.findFirst({
      where: { id: taskId, tenantId },
      include: {
        player: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async listTasks(query: ListTasksQuery & { pLevel?: string }, tenantId: string) {
    const where: any = { tenantId };

    if (query.playerId) where.playerId = query.playerId;
    if (query.status) where.status = query.status;
    if (query.technicalArea) where.technicalArea = query.technicalArea;
    if (query.creatorType) where.creatorType = query.creatorType;
    if (query.pLevel) where.pLevel = query.pLevel;

    const [tasks, total] = await Promise.all([
      this.prisma.techniqueTask.findMany({
        where,
        include: {
          player: {
            select: { firstName: true, lastName: true },
          },
          drills: {
            include: {
              exercise: {
                select: { id: true, name: true, exerciseType: true },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          responsible: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, role: true },
              },
            },
          },
        },
        orderBy: [
          { priorityOrder: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.techniqueTask.count({ where }),
    ]);

    return { tasks, total };
  }

  async updateTask(
    taskId: string,
    input: UpdateTaskInput & {
      pLevel?: string;
      repetitions?: number;
      priorityOrder?: number;
      imageUrls?: string[];
    },
    _tenantId: string
  ) {
    const data: any = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.instructions !== undefined) data.instructions = input.instructions;
    if (input.videoUrl !== undefined) data.videoUrl = input.videoUrl;
    if (input.technicalArea !== undefined) data.technicalArea = input.technicalArea;
    if (input.targetMetrics !== undefined) data.targetMetrics = input.targetMetrics;
    if (input.status !== undefined) {
      data.status = input.status;
      if (input.status === 'completed') {
        data.completedAt = new Date();
      }
    }
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.dueDate !== undefined) {
      data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    // P-System fields
    if (input.pLevel !== undefined) data.pLevel = input.pLevel;
    if (input.repetitions !== undefined) data.repetitions = input.repetitions;
    if (input.priorityOrder !== undefined) data.priorityOrder = input.priorityOrder;
    if (input.imageUrls !== undefined) data.imageUrls = input.imageUrls;

    return this.prisma.techniqueTask.update({
      where: { id: taskId },
      data,
      include: {
        player: {
          select: { firstName: true, lastName: true },
        },
        drills: {
          include: {
            exercise: {
              select: { id: true, name: true, exerciseType: true },
            },
          },
        },
        responsible: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
        },
      },
    });
  }

  async deleteTask(taskId: string, tenantId: string) {
    // Verify tenant
    const task = await this.prisma.techniqueTask.findFirst({
      where: { id: taskId, tenantId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return this.prisma.techniqueTask.delete({
      where: { id: taskId },
    });
  }

  // =========================================================================
  // P-SYSTEM ENHANCEMENTS
  // =========================================================================

  /**
   * Add a drill/exercise to a technique task
   */
  async addDrillToTask(
    taskId: string,
    exerciseId: string,
    orderIndex: number = 0,
    notes?: string,
    tenantId?: string
  ) {
    // Verify task exists and belongs to tenant (if provided)
    const task = await this.prisma.techniqueTask.findFirst({
      where: { id: taskId, ...(tenantId && { tenantId }) },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    return this.prisma.techniqueTaskDrill.create({
      data: {
        taskId,
        exerciseId,
        orderIndex,
        notes,
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            description: true,
            exerciseType: true,
            learningPhases: true,
          },
        },
      },
    });
  }

  /**
   * Remove a drill from a technique task
   */
  async removeDrillFromTask(taskId: string, drillLinkId: string, tenantId?: string) {
    const drillLink = await this.prisma.techniqueTaskDrill.findFirst({
      where: {
        id: drillLinkId,
        taskId,
      },
      include: {
        task: true,
      },
    });

    if (!drillLink) {
      throw new Error('Drill assignment not found');
    }

    if (tenantId && drillLink.task.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.techniqueTaskDrill.delete({
      where: { id: drillLinkId },
    });
  }

  /**
   * Assign a responsible person (coach/player) to a technique task
   */
  async assignResponsible(
    taskId: string,
    userId: string,
    role?: string,
    tenantId?: string
  ) {
    // Verify task exists
    const task = await this.prisma.techniqueTask.findFirst({
      where: { id: taskId, ...(tenantId && { tenantId }) },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.techniqueTaskResponsible.create({
      data: {
        taskId,
        userId,
        role: role || user.role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Remove a responsible person from a technique task
   */
  async removeResponsible(taskId: string, responsibleId: string, tenantId?: string) {
    const responsible = await this.prisma.techniqueTaskResponsible.findFirst({
      where: {
        id: responsibleId,
        taskId,
      },
      include: {
        task: true,
      },
    });

    if (!responsible) {
      throw new Error('Responsible assignment not found');
    }

    if (tenantId && responsible.task.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.techniqueTaskResponsible.delete({
      where: { id: responsibleId },
    });
  }

  /**
   * Update task priority order (for drag-and-drop reordering)
   */
  async updateTaskPriority(taskId: string, newPriorityOrder: number, tenantId?: string) {
    const task = await this.prisma.techniqueTask.findFirst({
      where: { id: taskId, ...(tenantId && { tenantId }) },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return this.prisma.techniqueTask.update({
      where: { id: taskId },
      data: { priorityOrder: newPriorityOrder },
    });
  }

  /**
   * Get tasks filtered by P-level
   */
  async getTasksByPLevel(playerId: string, pLevel: string, tenantId: string) {
    return this.prisma.techniqueTask.findMany({
      where: {
        playerId,
        pLevel,
        tenantId,
      },
      include: {
        drills: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                description: true,
                exerciseType: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        responsible: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { priorityOrder: 'asc' },
    });
  }

  /**
   * Get complete task with all relations (for P-System view)
   */
  async getTaskWithFullDetails(taskId: string, tenantId?: string) {
    return this.prisma.techniqueTask.findFirst({
      where: {
        id: taskId,
        ...(tenantId && { tenantId }),
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        drills: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                description: true,
                exerciseType: true,
                learningPhases: true,
                videoUrl: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        responsible: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  // =========================================================================
  // GOALS
  // =========================================================================

  async createGoal(input: CreateGoalInput, tenantId: string) {
    return this.prisma.techniqueGoal.create({
      data: {
        playerId: input.playerId,
        tenantId,
        title: input.title,
        metricType: input.metricType,
        baselineValue: input.baselineValue,
        targetValue: input.targetValue,
      },
      include: {
        player: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async listGoals(query: ListGoalsQuery, tenantId: string) {
    const where: any = { tenantId };

    if (query.playerId) where.playerId = query.playerId;
    if (query.metricType) where.metricType = query.metricType;
    if (query.status) where.status = query.status;

    const [goals, total] = await Promise.all([
      this.prisma.techniqueGoal.findMany({
        where,
        include: {
          player: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.techniqueGoal.count({ where }),
    ]);

    return { goals, total };
  }

  async updateGoal(goalId: string, input: UpdateGoalInput, _tenantId: string) {
    const data: any = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.targetValue !== undefined) data.targetValue = input.targetValue;
    if (input.status !== undefined) data.status = input.status;

    return this.prisma.techniqueGoal.update({
      where: { id: goalId },
      data,
      include: {
        player: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  // =========================================================================
  // IMPORTS
  // =========================================================================

  async importTrackmanCSV(
    csvContent: string,
    fileName: string,
    playerId: string,
    uploadedById: string,
    tenantId: string
  ) {
    // Parse CSV
    const result = parseTrackmanCSV(csvContent);

    if (result.validRows === 0) {
      throw new Error('No valid shot data found in CSV file');
    }

    // Check for duplicate import
    const existingImport = await this.prisma.trackmanImport.findFirst({
      where: {
        playerId,
        fileHash: result.fileHash,
      },
    });

    if (existingImport) {
      throw new Error('This file has already been imported');
    }

    // Create session for the shots
    const session = await this.prisma.launchMonitorSession.create({
      data: {
        playerId,
        deviceType: 'TrackMan',
        sessionType: 'practice',
        sessionDate: new Date(),
        location: 'Import',
        notes: `Imported from ${fileName}`,
        totalShots: result.validRows,
        tenantId,
      } as Prisma.LaunchMonitorSessionUncheckedCreateInput,
    });

    // Create shots
    const shotData = result.shots.map((shot: TrackmanShotData) => ({
      tenantId,
      sessionId: session.id,
      playerId,
      shotNumber: shot.shotNumber,
      club: shot.club || 'Unknown',
      timestamp: new Date(),
      ballSpeed: shot.ballSpeed,
      launchAngle: shot.launchAngle,
      spinRate: shot.spinRate,
      clubSpeed: shot.clubSpeed,
      attackAngle: shot.attackAngle,
      clubPath: shot.clubPath,
      faceAngle: shot.faceAngle,
      faceToPath: shot.faceToPath,
      swingDirection: shot.swingDirection,
      dynamicLoft: shot.dynamicLoft,
      carryDistance: shot.carryDistance,
      totalDistance: shot.totalDistance,
      smashFactor: shot.smashFactor,
    }));

    await this.prisma.launchMonitorShot.createMany({
      data: shotData,
    });

    // Record the import
    const importRecord = await this.prisma.trackmanImport.create({
      data: {
        playerId,
        uploadedById,
        tenantId,
        fileName,
        fileHash: result.fileHash,
        totalRows: result.totalRows,
        importedRows: result.validRows,
        sessionId: session.id,
      },
    });

    // Update technique goals with new data
    await this.updateGoalsFromImport(playerId, result.shots, tenantId);

    return {
      import: importRecord,
      session,
      shotsImported: result.validRows,
    };
  }

  async importTrackmanPDF(
    pdfBuffer: Buffer,
    fileName: string,
    playerId: string,
    uploadedById: string,
    tenantId: string
  ) {
    // Parse PDF
    const result = await parseTrackmanPDF(pdfBuffer);

    if (result.validRows === 0) {
      throw new Error('No valid shot data found in PDF file');
    }

    // Check for duplicate import
    const existingImport = await this.prisma.trackmanImport.findFirst({
      where: {
        playerId,
        fileHash: result.fileHash,
      },
    });

    if (existingImport) {
      throw new Error('This file has already been imported');
    }

    // Create session for the shots
    const session = await this.prisma.launchMonitorSession.create({
      data: {
        playerId,
        deviceType: 'TrackMan',
        sessionType: 'practice',
        sessionDate: new Date(),
        location: 'Import',
        notes: `Imported from ${fileName}`,
        totalShots: result.validRows,
        tenantId,
      } as Prisma.LaunchMonitorSessionUncheckedCreateInput,
    });

    // Create shots
    const shotData = result.shots.map((shot: TrackmanShotData) => ({
      tenantId,
      sessionId: session.id,
      playerId,
      shotNumber: shot.shotNumber,
      club: shot.club || 'Unknown',
      timestamp: new Date(),
      ballSpeed: shot.ballSpeed,
      launchAngle: shot.launchAngle,
      spinRate: shot.spinRate,
      clubSpeed: shot.clubSpeed,
      attackAngle: shot.attackAngle,
      clubPath: shot.clubPath,
      faceAngle: shot.faceAngle,
      faceToPath: shot.faceToPath,
      swingDirection: shot.swingDirection,
      dynamicLoft: shot.dynamicLoft,
      carryDistance: shot.carryDistance,
      totalDistance: shot.totalDistance,
      smashFactor: shot.smashFactor,
    }));

    await this.prisma.launchMonitorShot.createMany({
      data: shotData,
    });

    // Record the import
    const importRecord = await this.prisma.trackmanImport.create({
      data: {
        playerId,
        uploadedById,
        tenantId,
        fileName,
        fileHash: result.fileHash,
        totalRows: result.totalRows,
        importedRows: result.validRows,
        sessionId: session.id,
      },
    });

    // Update technique goals with new data
    await this.updateGoalsFromImport(playerId, result.shots, tenantId);

    return {
      import: importRecord,
      session,
      shotsImported: result.validRows,
    };
  }

  async listImports(query: ListImportsQuery, tenantId: string) {
    const where: any = { tenantId };

    if (query.playerId) where.playerId = query.playerId;

    const [imports, total] = await Promise.all([
      this.prisma.trackmanImport.findMany({
        where,
        include: {
          player: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { importedAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.trackmanImport.count({ where }),
    ]);

    return { imports, total };
  }

  // =========================================================================
  // STATS
  // =========================================================================

  async getPlayerStats(playerId: string, query: StatsQuery, tenantId: string) {
    const where: any = {
      playerId,
      session: { tenantId },
    };

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    if (query.club) {
      where.club = query.club;
    }

    // Get all shots for the player
    const shots = await this.prisma.launchMonitorShot.findMany({
      where,
      select: {
        clubPath: true,
        attackAngle: true,
        swingDirection: true,
        faceToPath: true,
        dynamicLoft: true,
        club: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats for each metric
    const metrics = ['clubPath', 'attackAngle', 'swingDirection', 'faceToPath', 'dynamicLoft'] as const;
    const stats: Record<string, { avg: number; min: number; max: number; count: number; trend: number[] }> = {};

    for (const metric of metrics) {
      const values = shots
        .map(s => s[metric])
        .filter((v): v is Decimal => v !== null)
        .map(v => v.toNumber());

      if (values.length > 0) {
        stats[metric] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
          trend: values.slice(0, 20), // Last 20 values for trend
        };
      }
    }

    // Get goals for comparison
    const goals = await this.prisma.techniqueGoal.findMany({
      where: { playerId, tenantId, status: 'active' },
    });

    return {
      stats,
      totalShots: shots.length,
      goals: goals.map(g => ({
        id: g.id,
        metricType: g.metricType,
        targetValue: g.targetValue?.toNumber(),
        currentValue: g.currentValue?.toNumber(),
        progressPercent: g.progressPercent,
      })),
    };
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  private async updateGoalsFromImport(playerId: string, shots: TrackmanShotData[], tenantId: string) {
    // Get active goals for this player
    const goals = await this.prisma.techniqueGoal.findMany({
      where: { playerId, tenantId, status: 'active' },
    });

    for (const goal of goals) {
      const metricKey = goal.metricType as keyof TrackmanShotData;
      const values = shots
        .map(s => s[metricKey])
        .filter((v): v is number => v !== undefined && v !== null);

      if (values.length === 0) continue;

      // Calculate new average
      const newAvg = values.reduce((a, b) => a + b, 0) / values.length;

      // Calculate progress
      const baseline = goal.baselineValue?.toNumber() ?? newAvg;
      const target = goal.targetValue.toNumber();
      const totalDiff = target - baseline;
      const currentDiff = newAvg - baseline;
      const progress = totalDiff !== 0 ? Math.round((currentDiff / totalDiff) * 100) : 0;

      // Update goal
      await this.prisma.techniqueGoal.update({
        where: { id: goal.id },
        data: {
          currentValue: newAvg,
          progressPercent: Math.min(Math.max(progress, 0), 100),
          status: progress >= 100 ? 'achieved' : 'active',
        },
      });
    }
  }
}
