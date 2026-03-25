/**
 * Enhanced Test Results Service
 * Includes automatic calculation of test results and peer comparisons
 */

import { PrismaClient, Prisma, TestResult, PeerComparison, CategoryRequirement } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';
import { calculateTestResultAsync, validateTestInput } from '../../../domain/tests';
import { RequirementsRepository } from '../../../domain/tests/requirements-repository';
import {
  calculatePeerComparison,
  type PeerCriteria,
} from '../../../domain/peer-comparison';
import { BadgeEvaluatorService, BadgeUnlockEvent } from '../../../domain/gamification/badge-evaluator';
import { logger } from '../../../utils/logger';

/**
 * Test result with relations
 */
type TestResultWithRelations = Prisma.TestResultGetPayload<{
  include: {
    test: true;
    player: { select: { id: true; firstName: true; lastName: true; category: true; gender: true } };
    peerComparisons: true;
  };
}>;

// ============================================================================
// TYPES
// ============================================================================

export interface RecordTestResultEnhancedInput {
  playerId: string;
  testNumber: number; // 1-20
  testDate: Date;
  testTime?: string;
  location: string;
  facility: string;
  environment: 'indoor' | 'outdoor';
  conditions?: {
    weather?: string;
    wind?: string;
    temperature?: number;
  };

  // Raw test input data (varies by test)
  testData: Record<string, unknown>;

  // Optional: Override automatic peer comparison
  skipPeerComparison?: boolean;
  peerCriteria?: PeerCriteria;
}

export interface TestResultWithComparison {
  testResult: TestResult | TestResultWithRelations;
  peerComparison?: PeerComparison | null;
  categoryRequirement: CategoryRequirement | null;
  badgeUnlocks?: BadgeUnlockEvent[];
  xpGained?: number;
  newLevel?: number;
}

// ============================================================================
// TEST RESULT ENHANCED SERVICE
// ============================================================================

export class TestResultsEnhancedService {
  private badgeEvaluator: BadgeEvaluatorService;
  private requirementsRepo: RequirementsRepository;
  private logger = logger;

  constructor(private prisma: PrismaClient) {
    this.badgeEvaluator = new BadgeEvaluatorService(prisma);
    this.requirementsRepo = new RequirementsRepository(prisma);
  }

  /**
   * Record a new test result with automatic calculations
   *
   * This method:
   * 1. Validates test input
   * 2. Fetches player and category requirements
   * 3. Calculates test result using domain functions
   * 4. Saves result to database
   * 5. Optionally calculates peer comparison
   * 6. Returns complete result with metadata
   */
  async recordTestResult(
    tenantId: string,
    input: RecordTestResultEnhancedInput
  ): Promise<TestResultWithComparison> {
    // 1. Validate test input
    try {
      validateTestInput(input.testNumber, {
        metadata: {
          testDate: input.testDate,
          testTime: input.testTime,
          location: input.location,
          facility: input.facility,
          environment: input.environment,
          conditions: input.conditions,
        },
        ...input.testData,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestError(`Invalid test input: ${errorMessage}`);
    }

    // 2. Fetch player
    const player = await this.prisma.player.findFirst({
      where: {
        id: input.playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // 3. Fetch category requirement
    const categoryRequirement = await this.prisma.categoryRequirement.findFirst({
      where: {
        category: player.category,
        gender: player.gender as 'M' | 'K',
        testNumber: input.testNumber,
      },
    });

    if (!categoryRequirement) {
      throw new NotFoundError(
        `Category requirement not found for category ${player.category}, gender ${player.gender}, test ${input.testNumber}`
      );
    }

    // 4. Calculate test result
    const age = new Date().getFullYear() - player.dateOfBirth.getFullYear();

    const playerContext = {
      id: player.id,
      category: player.category,
      gender: player.gender as 'M' | 'K',
      age,
      handicap: player.handicap ? Number(player.handicap) : undefined,
    };

    // Build test input with metadata and test-specific data
    // Type assertion is safe because validateTestInput verifies the shape matches testNumber
    const testInput = {
      metadata: {
        testDate: input.testDate,
        testTime: input.testTime,
        location: input.location,
        facility: input.facility,
        environment: input.environment,
        conditions: input.conditions,
      },
      ...input.testData,
    } as Parameters<typeof calculateTestResultAsync>[1];

    const calculatedResult = await calculateTestResultAsync(
      input.testNumber,
      testInput,
      playerContext,
      this.requirementsRepo
    );

    // 5. Fetch test definition
    const test = await this.prisma.test.findFirst({
      where: {
        tenantId,
        testNumber: input.testNumber,
      },
    });

    if (!test) {
      throw new NotFoundError(`Test definition not found for test number ${input.testNumber}`);
    }

    // 6. Save test result
    const testResult = await this.prisma.testResult.create({
      data: {
        testId: test.id,
        playerId: player.id,
        testDate: input.testDate,
        testTime: input.testTime,
        location: input.location,
        facility: input.facility,
        environment: input.environment,
        weather: input.conditions?.weather,
        equipment: null, // Can be extended

        // Raw input data
        results: input.testData as Prisma.InputJsonValue,

        // Calculated values
        value: calculatedResult.value,
        pei: calculatedResult.pei || null,
        passed: calculatedResult.passed,
        categoryRequirement: calculatedResult.categoryRequirement,
        percentOfRequirement: calculatedResult.percentOfRequirement,
      },
    });

    // 7. Calculate peer comparison (if not skipped)
    let peerComparison = null;

    if (!input.skipPeerComparison) {
      try {
        peerComparison = await this.calculateAndSavePeerComparison(
          testResult.id,
          player.id,
          input.testNumber,
          calculatedResult.value,
          input.peerCriteria || {
            category: player.category,
            gender: player.gender,
          },
          tenantId
        );
      } catch (error: unknown) {
        // Log error but don't fail the request
        this.logger.error({ error }, 'Failed to calculate peer comparison');
      }
    }

    // 8. Evaluate badges after test completion
    let badgeUnlocks: BadgeUnlockEvent[] = [];
    let xpGained = 0;
    let newLevel: number | undefined;

    try {
      const badgeResult = await this.badgeEvaluator.evaluatePlayerBadges(player.id);
      badgeUnlocks = badgeResult.unlockedBadges;
      xpGained = badgeResult.xpGained;
      newLevel = badgeResult.newLevel;
    } catch (error: unknown) {
      this.logger.error({ error }, 'Badge evaluation failed');
    }

    return {
      testResult,
      peerComparison,
      categoryRequirement,
      badgeUnlocks: badgeUnlocks.length > 0 ? badgeUnlocks : undefined,
      xpGained: xpGained > 0 ? xpGained : undefined,
      newLevel,
    };
  }

  /**
   * Calculate and save peer comparison for a test result
   */
  private async calculateAndSavePeerComparison(
    testResultId: string,
    playerId: string,
    testNumber: number,
    playerValue: number,
    peerCriteria: PeerCriteria,
    tenantId: string
  ): Promise<PeerComparison | null> {
    // Build optimized database query with criteria filtering
    const whereClause: Prisma.PlayerWhereInput = {
      tenantId,
      id: { not: playerId }, // Exclude the player themselves
    };

    // Add category filter
    if (peerCriteria.category) {
      whereClause.category = peerCriteria.category;
    }

    // Add gender filter
    if (peerCriteria.gender) {
      whereClause.gender = peerCriteria.gender;
    }

    // Add age range filter
    if (peerCriteria.ageRange) {
      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - peerCriteria.ageRange.max;
      const maxBirthYear = currentYear - peerCriteria.ageRange.min;

      whereClause.dateOfBirth = {
        gte: new Date(`${minBirthYear}-01-01`),
        lte: new Date(`${maxBirthYear}-12-31`),
      };
    }

    // Add handicap range filter
    if (peerCriteria.handicapRange) {
      whereClause.handicap = {
        gte: peerCriteria.handicapRange.min,
        lte: peerCriteria.handicapRange.max,
        not: null,
      };
    }

    // Fetch peer players with optimized query
    const peers = await this.prisma.player.findMany({
      where: whereClause,
      select: {
        id: true,
      },
    });

    if (peers.length === 0) {
      return null; // Not enough peers for comparison
    }

    // Fetch peer test results
    const peerResults = await this.prisma.testResult.findMany({
      where: {
        playerId: { in: peers.map((p) => p.id) },
        test: {
          testNumber,
        },
      },
      orderBy: {
        testDate: 'desc',
      },
      distinct: ['playerId'], // Get latest result for each player
    });

    const peerValues = peerResults.map((r) => Number(r.value));

    if (peerValues.length === 0) {
      return null; // No peer data
    }

    // Determine if lower is better for this test
    // Tests 8-11 (PEI), 17-18 (short game distances), 19-20 (score to par) - lower is better
    const lowerIsBetter = [8, 9, 10, 11, 17, 18, 19, 20].includes(testNumber);

    // Calculate peer comparison
    const comparison = calculatePeerComparison(
      playerId,
      testNumber,
      testResultId,
      playerValue,
      peerValues,
      peerCriteria,
      lowerIsBetter
    );

    // Calculate percentile values for peer distribution
    const sorted = [...peerValues].sort((a, b) => a - b);
    const getPercentileValue = (p: number) => {
      const index = Math.ceil(sorted.length * p) - 1;
      return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    };

    // Save peer comparison
    const savedComparison = await this.prisma.peerComparison.create({
      data: {
        testResultId,
        playerId,
        testNumber,
        peerCount: comparison.peerCount,
        peerMean: comparison.peerMean,
        peerMedian: comparison.peerMedian,
        peerStdDev: comparison.peerStdDev,
        peerMin: comparison.peerMin,
        peerMax: comparison.peerMax,
        percentile25: getPercentileValue(0.25),
        percentile75: getPercentileValue(0.75),
        percentile90: getPercentileValue(0.90),
        playerValue: comparison.playerValue,
        playerPercentile: comparison.playerPercentile,
        playerRank: comparison.playerRank,
        playerZScore: comparison.playerZScore,
        peerCriteria: comparison.peerCriteria as Prisma.InputJsonValue,
        comparisonText: comparison.comparisonText,
      },
    });

    return savedComparison;
  }

  /**
   * Get test result with peer comparison
   */
  async getTestResultWithComparison(
    tenantId: string,
    testResultId: string
  ): Promise<TestResultWithComparison> {
    const testResult = await this.prisma.testResult.findFirst({
      where: {
        id: testResultId,
        player: {
          tenantId,
        },
      },
      include: {
        test: true,
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
            gender: true,
          },
        },
        peerComparisons: {
          orderBy: {
            calculatedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!testResult) {
      throw new NotFoundError('Test result not found');
    }

    // Fetch category requirement
    const categoryRequirement = await this.prisma.categoryRequirement.findFirst({
      where: {
        category: testResult.player.category,
        gender: testResult.player.gender as 'M' | 'K',
        testNumber: testResult.test.testNumber,
      },
    });

    return {
      testResult,
      peerComparison: testResult.peerComparisons[0] || null,
      categoryRequirement,
    };
  }

  /**
   * Get player test history for a specific test
   */
  async getPlayerTestHistory(
    tenantId: string,
    playerId: string,
    testNumber: number
  ): Promise<TestResultWithRelations[]> {
    // Verify player exists and belongs to tenant
    const player = await this.prisma.player.findFirst({
      where: {
        id: playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Fetch test results
    const results = await this.prisma.testResult.findMany({
      where: {
        playerId,
        test: {
          testNumber,
        },
      },
      include: {
        test: true,
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
            gender: true,
          },
        },
        peerComparisons: {
          orderBy: {
            calculatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        testDate: 'asc',
      },
    });

    return results;
  }
}
