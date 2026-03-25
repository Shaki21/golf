/**
 * Player Insights Service
 * Combines SG Journey, Skill DNA, and Bounty Board into unified insights
 */

import { PrismaClient } from '@prisma/client';
import { calculateSGJourney, SGJourneyInput } from './sg-journey';
import { calculateSkillDNA, SkillDNAInput } from './skill-dna';
import {
  buildBountyBoard,
  createBountyFromBreakingPoint,
  calculateProgress,
  isBountyComplete,
} from './bounty-service';
import {
  PlayerInsightsData,
  SGJourneyData,
  SkillDNAProfile,
  BountyBoard,
  Bounty,
} from './types';
import {
  convertPeiToStrokesGained,
} from '../datagolf/pei-to-sg';

export class PlayerInsightsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get complete player insights (all three features)
   */
  async getPlayerInsights(
    tenantId: string,
    playerId: string
  ): Promise<PlayerInsightsData> {
    // Fetch all data in parallel
    const [sgJourney, skillDNA, bountyBoard] = await Promise.all([
      this.getSGJourney(tenantId, playerId),
      this.getSkillDNA(tenantId, playerId),
      this.getBountyBoard(tenantId, playerId),
    ]);

    // Build quick stats
    const quickStats = {
      sgTotal: sgJourney.position.currentSG,
      sgTrend: sgJourney.position.trend30Days,
      topStrength: skillDNA.strengths[0] || 'N/A',
      topWeakness: skillDNA.weaknesses[0] || 'N/A',
      activeBountyCount: bountyBoard.activeBounties.length,
      nearestBountyProgress: bountyBoard.activeBounties[0]?.progress || 0,
    };

    return {
      sgJourney,
      skillDNA,
      bountyBoard,
      quickStats,
    };
  }

  /**
   * Get SG Journey data for a player
   */
  async getSGJourney(_tenantId: string, playerId: string): Promise<SGJourneyData> {
    // Player info available if needed for future SG calculations
    // const player = await this.prisma.player.findUnique({
    //   where: { id: playerId },
    //   select: { gender: true, category: true, createdAt: true },
    // });

    // Get test results for SG calculation (filter by test.testNumber via relation)
    const testResults = await this.prisma.testResult.findMany({
      where: {
        playerId,
        test: {
          testNumber: { in: [8, 9, 10, 11, 15, 16, 17, 18] },
        },
      },
      include: {
        test: { select: { testNumber: true } },
      },
      orderBy: { testDate: 'desc' },
      take: 100,
    });

    if (testResults.length === 0) {
      // Return default journey with no data
      return this.getEmptySGJourney();
    }

    // Calculate SG for each test and build history
    const sgHistory: Array<{ date: Date; sg: number }> = [];
    const categoryTotals = { approach: 0, aroundGreen: 0, putting: 0 };
    const categoryCounts = { approach: 0, aroundGreen: 0, putting: 0 };

    for (const result of testResults) {
      const testNumber = result.test.testNumber;
      const sg = this.calculateTestSG({ ...result, testNumber });

      sgHistory.push({ date: result.testDate, sg: sg.total });

      // Accumulate by category
      if ([8, 9, 10, 11].includes(testNumber)) {
        categoryTotals.approach += sg.total;
        categoryCounts.approach++;
      } else if ([17, 18].includes(testNumber)) {
        categoryTotals.aroundGreen += sg.total;
        categoryCounts.aroundGreen++;
      } else if ([15, 16].includes(testNumber)) {
        categoryTotals.putting += sg.total;
        categoryCounts.putting++;
      }
    }

    // Calculate averages
    const categoryBreakdown = {
      approach: categoryCounts.approach > 0 ? categoryTotals.approach / categoryCounts.approach : 0,
      aroundGreen: categoryCounts.aroundGreen > 0 ? categoryTotals.aroundGreen / categoryCounts.aroundGreen : 0,
      putting: categoryCounts.putting > 0 ? categoryTotals.putting / categoryCounts.putting : 0,
    };

    // Current SG is average of recent tests
    const recentSG = sgHistory.slice(0, 10);
    const currentSG = recentSG.length > 0
      ? recentSG.reduce((sum, h) => sum + h.sg, 0) / recentSG.length
      : 0;

    // Starting SG (oldest test)
    const startSG = sgHistory.length > 0 ? sgHistory[sgHistory.length - 1].sg : -1.5;

    const input: SGJourneyInput = {
      currentSG: Math.round(currentSG * 100) / 100,
      categoryBreakdown: {
        approach: Math.round(categoryBreakdown.approach * 100) / 100,
        aroundGreen: Math.round(categoryBreakdown.aroundGreen * 100) / 100,
        putting: Math.round(categoryBreakdown.putting * 100) / 100,
      },
      history: sgHistory,
      startSG: Math.round(startSG * 100) / 100,
    };

    return calculateSGJourney(input);
  }

  /**
   * Get Skill DNA profile for a player
   */
  async getSkillDNA(tenantId: string, playerId: string): Promise<SkillDNAProfile> {
    // Get player info
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { gender: true, category: true },
    });

    const gender = (player?.gender === 'K' ? 'K' : 'M') as 'M' | 'K';

    // Get latest test results by type (include test relation for testNumber)
    const testResults = await this.prisma.testResult.findMany({
      where: { playerId },
      include: { test: { select: { testNumber: true } } },
      orderBy: { testDate: 'desc' },
    });

    // Group by test number and take latest
    const latestByTest = new Map<number, (typeof testResults)[0]>();
    for (const result of testResults) {
      const testNumber = result.test.testNumber;
      if (!latestByTest.has(testNumber)) {
        latestByTest.set(testNumber, result);
      }
    }

    // Build test results by dimension
    const dimensionTests = {
      distance: [] as Array<{ testNumber: number; value: number }>,
      speed: [] as Array<{ testNumber: number; value: number }>,
      accuracy: [] as Array<{ testNumber: number; value: number }>,
      shortGame: [] as Array<{ testNumber: number; value: number }>,
      putting: [] as Array<{ testNumber: number; value: number }>,
      physical: [] as Array<{ testNumber: number; value: number }>,
    };

    // Distance tests (1-4)
    for (const testNum of [1, 2, 3, 4]) {
      const result = latestByTest.get(testNum);
      if (result?.value) {
        dimensionTests.distance.push({ testNumber: testNum, value: Number(result.value) });
      }
    }

    // Speed tests (5-7)
    for (const testNum of [5, 6, 7]) {
      const result = latestByTest.get(testNum);
      if (result?.value) {
        dimensionTests.speed.push({ testNumber: testNum, value: Number(result.value) });
      }
    }

    // Accuracy/Approach tests (8-11) - using PEI or value
    for (const testNum of [8, 9, 10, 11]) {
      const result = latestByTest.get(testNum);
      if (result?.value) {
        dimensionTests.accuracy.push({ testNumber: testNum, value: Number(result.pei || result.value) });
      }
    }

    // Short game tests (17-18)
    for (const testNum of [17, 18]) {
      const result = latestByTest.get(testNum);
      if (result?.value) {
        dimensionTests.shortGame.push({ testNumber: testNum, value: Number(result.value) });
      }
    }

    // Putting tests (15-16)
    for (const testNum of [15, 16]) {
      const result = latestByTest.get(testNum);
      if (result?.value) {
        dimensionTests.putting.push({ testNumber: testNum, value: Number(result.value) });
      }
    }

    // Physical tests (19-25 or custom)
    // For now, use placeholder if no physical tests
    if (dimensionTests.physical.length === 0) {
      dimensionTests.physical.push({ testNumber: 99, value: 50 }); // Default middle score
    }

    const input: SkillDNAInput = {
      playerId,
      gender,
      testResults: dimensionTests,
    };

    return calculateSkillDNA(input);
  }

  /**
   * Get Bounty Board for a player
   */
  async getBountyBoard(tenantId: string, playerId: string): Promise<BountyBoard> {
    // Get breaking points
    const breakingPoints = await this.prisma.breakingPoint.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });

    // Convert breaking points to bounties
    const bounties: Bounty[] = [];

    for (const bp of breakingPoints) {
      // Map breaking point category to template
      const templateId = this.mapBreakingPointToTemplate(bp);
      if (templateId) {
        const bounty = createBountyFromBreakingPoint(
          {
            id: bp.id,
            category: bp.category || 'approach',
            baselineMeasurement: bp.baselineMeasurement || 0,
            targetMeasurement: bp.targetMeasurement || 0,
            currentMeasurement: bp.currentMeasurement || bp.baselineMeasurement || 0,
          },
          templateId
        );

        if (bounty) {
          // Set status based on breaking point status
          if (bp.status === 'resolved') {
            bounty.status = 'completed';
            bounty.completedAt = bp.resolvedDate || new Date();
          } else if (bp.status === 'in_progress') {
            bounty.status = 'active';
            bounty.activatedAt = bp.createdAt;
          }

          bounties.push(bounty);
        }
      }
    }

    // Split into categories
    const activeBounties = bounties.filter(b => b.status === 'active');
    const availableBounties = bounties.filter(b => b.status === 'available');
    const completedBounties = bounties.filter(b => b.status === 'completed');

    // Build completion history
    const completionHistory = completedBounties
      .filter(b => b.completedAt && b.activatedAt)
      .map(b => ({
        completedAt: b.completedAt!,
        daysToComplete: Math.ceil(
          (b.completedAt!.getTime() - b.activatedAt!.getTime()) / (24 * 60 * 60 * 1000)
        ),
      }));

    return buildBountyBoard({
      activeBounties,
      availableBounties,
      completedBounties,
      completionHistory,
    });
  }

  /**
   * Activate a bounty
   */
  async activateBounty(
    tenantId: string,
    playerId: string,
    bountyId: string
  ): Promise<Bounty | null> {
    // In a real implementation, this would update the database
    // For now, return the bounty with updated status
    const board = await this.getBountyBoard(tenantId, playerId);
    const bounty = board.availableBounties.find(b => b.id === bountyId);

    if (!bounty) return null;

    return {
      ...bounty,
      status: 'active',
      activatedAt: new Date(),
    };
  }

  /**
   * Update bounty progress
   */
  async updateBountyProgress(
    tenantId: string,
    playerId: string,
    bountyId: string,
    newValue: number
  ): Promise<Bounty | null> {
    const board = await this.getBountyBoard(tenantId, playerId);
    const bounty = board.activeBounties.find(b => b.id === bountyId);

    if (!bounty) return null;

    const progress = calculateProgress(
      bounty.baselineValue,
      bounty.targetValue,
      newValue,
      bounty.isLowerBetter
    );

    const completed = isBountyComplete(newValue, bounty.targetValue, bounty.isLowerBetter);

    return {
      ...bounty,
      currentValue: newValue,
      progress,
      status: completed ? 'completed' : 'active',
      completedAt: completed ? new Date() : null,
    };
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private calculateTestSG(test: {
    testNumber: number;
    value: unknown;
    pei?: unknown;
  }): { total: number; category: string } {
    const distanceMap: Record<number, number> = {
      8: 25, 9: 50, 10: 75, 11: 100, 15: 3, 16: 6, 17: 15, 18: 15,
    };

    const distance = distanceMap[test.testNumber] || 50;
    const pei = Number(test.pei || test.value) || 20;

    // Determine lie based on test
    const lie = test.testNumber === 18 ? 'bunker' : 'fairway';

    try {
      const result = convertPeiToStrokesGained({
        startDistance: distance,
        pei,
        lie: lie as 'fairway' | 'bunker',
      });

      return {
        total: result.strokesGained,
        category: result.category,
      };
    } catch {
      return { total: 0, category: 'approach' };
    }
  }

  private mapBreakingPointToTemplate(bp: {
    category?: string | null;
    specificArea?: string | null;
  }): string | null {
    const area = bp.specificArea?.toLowerCase() || '';
    const category = bp.category?.toLowerCase() || '';

    // Map based on keywords
    if (area.includes('25m') || area.includes('25 m')) return 'approach_25m';
    if (area.includes('50m') || area.includes('50 m')) return 'approach_50m';
    if (area.includes('75m') || area.includes('75 m')) return 'approach_75m';
    if (area.includes('100m') || area.includes('100 m')) return 'approach_100m';
    if (area.includes('putt') && area.includes('3')) return 'putting_3m';
    if (area.includes('putt') && area.includes('6')) return 'putting_6m';
    if (area.includes('3-putt') || area.includes('three putt')) return 'three_putt';
    if (area.includes('chip')) return 'chipping';
    if (area.includes('bunker') || area.includes('sand')) return 'bunker';
    if (area.includes('up') && area.includes('down')) return 'up_and_down';
    if (area.includes('fairway')) return 'driver_accuracy';
    if (area.includes('dispersion') || area.includes('spredning')) return 'driver_dispersion';
    if (area.includes('speed') || area.includes('hastighet')) return 'driver_speed';
    if (area.includes('rutine') || area.includes('routine')) return 'preshot_routine';

    // Default based on category
    if (category.includes('approach')) return 'approach_75m';
    if (category.includes('putt')) return 'putting_6m';
    if (category.includes('short') || category.includes('kort')) return 'chipping';

    return null;
  }

  private getEmptySGJourney(): SGJourneyData {
    return calculateSGJourney({
      currentSG: -1.5,
      categoryBreakdown: { approach: 0, aroundGreen: 0, putting: 0 },
      history: [],
      startSG: -1.5,
    });
  }
}
