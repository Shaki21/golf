import { PrismaClient, Prisma, Exercise } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';
import { CreateExerciseInput, UpdateExerciseInput, ListExercisesQuery } from './schema';

export interface ExerciseListResponse {
  exercises: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ExerciseService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new exercise
   */
  async createExercise(tenantId: string, input: CreateExerciseInput): Promise<Exercise> {
    const exercise = await this.prisma.exercise.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
        purpose: input.purpose,
        exerciseType: input.exerciseType,
        learningPhases: input.learningPhases,
        settings: input.settings,
        clubSpeedLevels: input.clubSpeedLevels,
        categories: input.categories,
        periods: input.periods,
        repsOrTime: input.repsOrTime,
        equipment: input.equipment as Prisma.InputJsonValue,
        location: input.location,
        difficulty: input.difficulty,
        progressionSteps: input.progressionSteps,
        regressionSteps: input.regressionSteps,
        successCriteria: input.successCriteria,
        commonMistakes: input.commonMistakes,
        coachingCues: input.coachingCues,
        addressesBreakingPoints: input.addressesBreakingPoints,
        processCategory: input.processCategory,
        videoUrl: input.videoUrl,
        imageUrl: input.imageUrl,
        source: input.source,
        tags: input.tags,
        isActive: input.isActive,
      },
    });

    return exercise;
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(tenantId: string, exerciseId: string): Promise<Exercise> {
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        tenantId,
      },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    return exercise;
  }

  /**
   * List exercises with filters and pagination
   */
  async listExercises(tenantId: string, query: ListExercisesQuery): Promise<ExerciseListResponse> {
    const {
      page = 1,
      limit = 50,
      search,
      exerciseType,
      category,
      period,
      learningPhase,
      clubSpeedLevel,
      setting,
      processCategory,
      difficulty,
      location,
      breakingPoint,
      isActive,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: Prisma.ExerciseWhereInput = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (exerciseType) {
      where.exerciseType = exerciseType;
    }

    if (category) {
      where.categories = {
        has: category,
      };
    }

    if (period) {
      where.periods = {
        has: period,
      };
    }

    if (learningPhase) {
      where.learningPhases = {
        has: learningPhase,
      };
    }

    if (clubSpeedLevel) {
      where.clubSpeedLevels = {
        has: clubSpeedLevel,
      };
    }

    if (setting) {
      where.settings = {
        has: setting,
      };
    }

    if (processCategory) {
      where.processCategory = processCategory;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (location) {
      where.location = location;
    }

    if (breakingPoint) {
      where.addressesBreakingPoints = {
        has: breakingPoint,
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await this.prisma.exercise.count({ where });

    // Get exercises
    const exercises = await this.prisma.exercise.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update exercise
   */
  async updateExercise(tenantId: string, exerciseId: string, input: UpdateExerciseInput): Promise<Exercise> {
    // Check if exercise exists
    const existingExercise = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, tenantId },
    });

    if (!existingExercise) {
      throw new NotFoundError('Exercise not found');
    }

    // Build update data
    const updateData: Prisma.ExerciseUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.purpose !== undefined) updateData.purpose = input.purpose;
    if (input.exerciseType !== undefined) updateData.exerciseType = input.exerciseType;
    if (input.learningPhases !== undefined) updateData.learningPhases = input.learningPhases;
    if (input.settings !== undefined) updateData.settings = input.settings;
    if (input.clubSpeedLevels !== undefined) updateData.clubSpeedLevels = input.clubSpeedLevels;
    if (input.categories !== undefined) updateData.categories = input.categories;
    if (input.periods !== undefined) updateData.periods = input.periods;
    if (input.repsOrTime !== undefined) updateData.repsOrTime = input.repsOrTime;
    if (input.equipment !== undefined) updateData.equipment = input.equipment;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.progressionSteps !== undefined) updateData.progressionSteps = input.progressionSteps;
    if (input.regressionSteps !== undefined) updateData.regressionSteps = input.regressionSteps;
    if (input.successCriteria !== undefined) updateData.successCriteria = input.successCriteria;
    if (input.commonMistakes !== undefined) updateData.commonMistakes = input.commonMistakes;
    if (input.coachingCues !== undefined) updateData.coachingCues = input.coachingCues;
    if (input.addressesBreakingPoints !== undefined) updateData.addressesBreakingPoints = input.addressesBreakingPoints;
    if (input.processCategory !== undefined) updateData.processCategory = input.processCategory;
    if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.source !== undefined) updateData.source = input.source;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Update exercise
    const exercise = await this.prisma.exercise.update({
      where: { id: exerciseId },
      data: updateData,
    });

    return exercise;
  }

  /**
   * Delete exercise
   */
  async deleteExercise(tenantId: string, exerciseId: string): Promise<void> {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, tenantId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    await this.prisma.exercise.delete({
      where: { id: exerciseId },
    });
  }

  /**
   * Duplicate an exercise
   * Creates a copy of the exercise with "(Kopi)" appended to the name
   */
  async duplicateExercise(tenantId: string, exerciseId: string): Promise<Exercise> {
    // Find the original exercise
    const original = await this.prisma.exercise.findFirst({
      where: { id: exerciseId, tenantId },
    });

    if (!original) {
      throw new NotFoundError('Exercise not found');
    }

    // Create a copy with "(Kopi)" appended to the name
    const duplicate = await this.prisma.exercise.create({
      data: {
        tenantId,
        name: `${original.name} (Kopi)`,
        description: original.description,
        purpose: original.purpose,
        exerciseType: original.exerciseType,
        learningPhases: original.learningPhases,
        settings: original.settings,
        clubSpeedLevels: original.clubSpeedLevels,
        categories: original.categories,
        periods: original.periods,
        repsOrTime: original.repsOrTime,
        equipment: original.equipment as Prisma.InputJsonValue,
        location: original.location,
        difficulty: original.difficulty,
        progressionSteps: original.progressionSteps,
        regressionSteps: original.regressionSteps,
        successCriteria: original.successCriteria,
        commonMistakes: original.commonMistakes,
        coachingCues: original.coachingCues,
        addressesBreakingPoints: original.addressesBreakingPoints,
        processCategory: original.processCategory,
        videoUrl: original.videoUrl,
        imageUrl: original.imageUrl,
        source: original.source,
        tags: original.tags,
        isActive: original.isActive,
      },
    });

    return duplicate;
  }
}
