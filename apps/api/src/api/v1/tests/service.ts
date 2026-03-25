import { PrismaClient, Test, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';
import {
  CreateTestInput,
  UpdateTestInput,
  RecordTestResultInput,
  UpdateTestResultInput,
  ListTestsQuery,
  ListTestResultsQuery,
} from './schema';

/**
 * Test result with player and test relations
 */
type TestResultWithRelations = Prisma.TestResultGetPayload<{
  include: {
    player: { select: { id: true; firstName: true; lastName: true } };
    test: { select: { id: true; name: true; testNumber: true } };
  };
}>;

export interface TestListResponse {
  tests: Test[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TestResultListResponse {
  results: TestResultWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlayerProgress {
  player: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tests: Array<{
    test: {
      id: string;
      name: string;
      testNumber: number;
    };
    results: Array<{
      id: string;
      testDate: string;
      pei: number | null;
      improvementFromLast: number | null;
      categoryBenchmark: boolean;
    }>;
    latestResult: {
      id: string;
      testDate: Date;
      pei: number | null;
      improvementFromLast: number | null;
      categoryBenchmark: boolean;
    } | null;
    improvement: {
      absolute: number | null;
      percentage: number | null;
    };
  }>;
}

export class TestService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new test definition
   */
  async createTest(tenantId: string, input: CreateTestInput): Promise<Test> {
    const test = await this.prisma.test.create({
      data: {
        tenantId,
        name: input.name,
        testNumber: input.testNumber,
        category: input.category,
        testType: input.testType,
        protocolName: input.protocolName,
        protocolVersion: input.protocolVersion,
        description: input.description,
        targetCategory: input.targetCategory,
        testDetails: input.testDetails as Prisma.InputJsonValue,
        benchmarkWeek: input.benchmarkWeek,
        isActive: input.isActive,
      },
    });

    return test;
  }

  /**
   * Get test by ID
   */
  async getTestById(tenantId: string, testId: string): Promise<Test> {
    const test = await this.prisma.test.findFirst({
      where: {
        id: testId,
        tenantId,
      },
      include: {
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundError('Test not found');
    }

    return test;
  }

  /**
   * List tests with filters and pagination
   */
  async listTests(tenantId: string, query: ListTestsQuery): Promise<TestListResponse> {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      testType,
      targetCategory,
      benchmarkWeek,
      isActive,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: Prisma.TestWhereInput = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { protocolName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (testType) {
      where.testType = testType;
    }

    if (targetCategory) {
      where.targetCategory = targetCategory;
    }

    if (benchmarkWeek !== undefined) {
      where.benchmarkWeek = benchmarkWeek;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await this.prisma.test.count({ where });

    // Get tests
    const tests = await this.prisma.test.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    return {
      tests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update test
   */
  async updateTest(tenantId: string, testId: string, input: UpdateTestInput): Promise<Test> {
    // Check if test exists (only select id to minimize data transfer)
    const existingTest = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
      select: { id: true },
    });

    if (!existingTest) {
      throw new NotFoundError('Test not found');
    }

    // Build update data
    const updateData: Prisma.TestUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.testNumber !== undefined) updateData.testNumber = input.testNumber;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.testType !== undefined) updateData.testType = input.testType;
    if (input.protocolName !== undefined) updateData.protocolName = input.protocolName;
    if (input.protocolVersion !== undefined) updateData.protocolVersion = input.protocolVersion;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.targetCategory !== undefined) updateData.targetCategory = input.targetCategory;
    if (input.testDetails !== undefined) updateData.testDetails = input.testDetails;
    if (input.benchmarkWeek !== undefined) updateData.benchmarkWeek = input.benchmarkWeek;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Update test
    const test = await this.prisma.test.update({
      where: { id: testId },
      data: updateData,
    });

    return test;
  }

  /**
   * Delete test
   */
  async deleteTest(tenantId: string, testId: string): Promise<void> {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
      select: { id: true },
    });

    if (!test) {
      throw new NotFoundError('Test not found');
    }

    await this.prisma.test.delete({
      where: { id: testId },
    });
  }

  /**
   * Record a test result
   */
  async recordTestResult(tenantId: string, input: RecordTestResultInput): Promise<TestResultWithRelations> {
    // Verify test and player exist in parallel (only select id to minimize data transfer)
    const [test, player] = await Promise.all([
      this.prisma.test.findFirst({
        where: { id: input.testId, tenantId },
        select: { id: true },
      }),
      this.prisma.player.findFirst({
        where: { id: input.playerId, tenantId },
        select: { id: true },
      }),
    ]);

    if (!test) {
      throw new BadRequestError('Test not found');
    }

    if (!player) {
      throw new BadRequestError('Player not found');
    }

    // Calculate improvement if not provided
    let improvementFromLast = input.improvementFromLast;
    if (improvementFromLast === undefined && input.pei !== undefined) {
      const previousResult = await this.prisma.testResult.findFirst({
        where: {
          testId: input.testId,
          playerId: input.playerId,
          testDate: { lt: new Date(input.testDate) },
        },
        orderBy: {
          testDate: 'desc',
        },
      });

      if (previousResult && previousResult.pei) {
        improvementFromLast = input.pei - Number(previousResult.pei);
      }
    }

    // Derive value from results if not provided (use 'average' key if available)
    const derivedValue = input.value ??
      (typeof input.results?.average === 'number' ? input.results.average : 0);

    // Create test result
    const result = await this.prisma.testResult.create({
      data: {
        testId: input.testId,
        playerId: input.playerId,
        testDate: new Date(input.testDate),
        location: input.location,
        weather: input.weather,
        equipment: input.equipment,
        results: input.results as Prisma.InputJsonValue,
        value: derivedValue,
        pei: input.pei,
        categoryBenchmark: input.categoryBenchmark,
        improvementFromLast,
        videoUrl: input.videoUrl,
        trackerData: input.trackerData as Prisma.InputJsonValue,
        coachFeedback: input.coachFeedback,
        playerFeedback: input.playerFeedback,
      },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            testNumber: true,
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return result;
  }

  /**
   * Get test result by ID
   */
  async getTestResultById(tenantId: string, resultId: string): Promise<TestResultWithRelations> {
    const result = await this.prisma.testResult.findFirst({
      where: {
        id: resultId,
        player: { tenantId },
      },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            testNumber: true,
            category: true,
            testType: true,
            protocolName: true,
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundError('Test result not found');
    }

    return result;
  }

  /**
   * List test results with filters
   */
  async listTestResults(tenantId: string, query: ListTestResultsQuery): Promise<TestResultListResponse> {
    const {
      page = 1,
      limit = 20,
      playerId,
      testId,
      startDate,
      endDate,
      categoryBenchmark,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: Prisma.TestResultWhereInput = {
      player: { tenantId },
    };

    if (playerId) {
      where.playerId = playerId;
    }

    if (testId) {
      where.testId = testId;
    }

    if (startDate || endDate) {
      where.testDate = {};
      if (startDate) where.testDate.gte = new Date(startDate);
      if (endDate) where.testDate.lte = new Date(endDate);
    }

    if (categoryBenchmark !== undefined) {
      where.categoryBenchmark = categoryBenchmark;
    }

    // Get total count
    const total = await this.prisma.testResult.count({ where });

    // Get results
    const results = await this.prisma.testResult.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        test: {
          select: {
            id: true,
            name: true,
            testNumber: true,
            category: true,
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update test result
   */
  async updateTestResult(tenantId: string, resultId: string, input: UpdateTestResultInput): Promise<TestResultWithRelations> {
    const existingResult = await this.prisma.testResult.findFirst({
      where: {
        id: resultId,
        player: { tenantId },
      },
      select: { id: true },
    });

    if (!existingResult) {
      throw new NotFoundError('Test result not found');
    }

    // Build update data
    const updateData: Prisma.TestResultUpdateInput = {};

    if (input.testDate !== undefined) updateData.testDate = new Date(input.testDate);
    if (input.location !== undefined) updateData.location = input.location;
    if (input.weather !== undefined) updateData.weather = input.weather;
    if (input.equipment !== undefined) updateData.equipment = input.equipment;
    if (input.results !== undefined) updateData.results = input.results;
    if (input.pei !== undefined) updateData.pei = input.pei;
    if (input.categoryBenchmark !== undefined) updateData.categoryBenchmark = input.categoryBenchmark;
    if (input.improvementFromLast !== undefined) updateData.improvementFromLast = input.improvementFromLast;
    if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
    if (input.trackerData !== undefined) updateData.trackerData = input.trackerData;
    if (input.coachFeedback !== undefined) updateData.coachFeedback = input.coachFeedback;
    if (input.playerFeedback !== undefined) updateData.playerFeedback = input.playerFeedback;

    const result = await this.prisma.testResult.update({
      where: { id: resultId },
      data: updateData,
      include: {
        test: {
          select: {
            id: true,
            name: true,
            testNumber: true,
          },
        },
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return result;
  }

  /**
   * Delete test result
   */
  async deleteTestResult(tenantId: string, resultId: string): Promise<void> {
    const result = await this.prisma.testResult.findFirst({
      where: {
        id: resultId,
        player: { tenantId },
      },
      select: { id: true },
    });

    if (!result) {
      throw new NotFoundError('Test result not found');
    }

    await this.prisma.testResult.delete({
      where: { id: resultId },
    });
  }

  /**
   * Get player progress across tests
   */
  async getPlayerProgress(tenantId: string, playerId: string, testId?: string): Promise<PlayerProgress> {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Get tests with results in a single query (avoids N+1)
    // Only select fields actually used in the response
    const tests = await this.prisma.test.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(testId && { id: testId }),
      },
      select: {
        id: true,
        name: true,
        testNumber: true,
        results: {
          where: { playerId },
          orderBy: { testDate: 'asc' },
          select: {
            id: true,
            testDate: true,
            pei: true,
            improvementFromLast: true,
            categoryBenchmark: true,
          },
        },
      },
      orderBy: { testNumber: 'asc' },
    });

    const progressData = tests.map((test) => {
      const results = test.results;
      const latestResult = results[results.length - 1] || null;
      const firstResult = results[0] || null;

      const improvement = {
        absolute: null as number | null,
        percentage: null as number | null,
      };

      if (latestResult && firstResult && firstResult.pei && latestResult.pei) {
        improvement.absolute = Number(latestResult.pei) - Number(firstResult.pei);
        improvement.percentage = (improvement.absolute / Number(firstResult.pei)) * 100;
      }

      // Convert latestResult Decimal fields to number if present
      const formattedLatestResult = latestResult ? {
        ...latestResult,
        pei: latestResult.pei ? Number(latestResult.pei) : null,
        improvementFromLast: latestResult.improvementFromLast ? Number(latestResult.improvementFromLast) : null,
      } : null;

      return {
        test: {
          id: test.id,
          name: test.name,
          testNumber: test.testNumber,
        },
        results: results.map((r) => ({
          id: r.id,
          testDate: r.testDate.toISOString().split('T')[0],
          pei: r.pei ? Number(r.pei) : null,
          improvementFromLast: r.improvementFromLast ? Number(r.improvementFromLast) : null,
          categoryBenchmark: r.categoryBenchmark,
        })),
        latestResult: formattedLatestResult,
        improvement,
      };
    });

    return {
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
      },
      tests: progressData,
    };
  }
}
