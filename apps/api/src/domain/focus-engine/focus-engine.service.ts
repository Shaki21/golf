/**
 * Focus Engine Service
 * Core logic for computing player focus recommendations
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import { WeightsService } from './weights.service';
import type {
  Component,
  FocusOutput,
  PlayerFocusResult,
  TeamFocusResult,
  AtRiskPlayer,
  ComponentWeights,
  TestComponentMap,
} from './types';

// Configuration
const FOCUS_CONFIG = {
  targetPercentile: 75, // Target percentile to compare against
  minSplitPercent: 0.10, // Minimum 10% for any component
  maxSplitPercent: 0.50, // Maximum 50% for any component
  cacheExpiryHours: 24,
  lowConfidenceThreshold: 3, // Less than 3 test results = low confidence
  medConfidenceThreshold: 6, // 3-6 results = medium confidence
  adherenceThreshold: 50, // Below 50% adherence = at-risk
};

export class FocusEngineService {
  private weightsService: WeightsService;

  constructor(private prisma: PrismaClient) {
    this.weightsService = new WeightsService(prisma);
  }

  /**
   * Calculate focus for a player
   */
  async calculatePlayerFocus(
    tenantId: string,
    userId: string,
    includeApproachDetail: boolean = false
  ): Promise<PlayerFocusResult> {
    logger.info({ tenantId, userId }, 'Calculating player focus');

    // Get player
    const player = await this.prisma.player.findFirst({
      where: { userId, tenantId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Check cache first
    const cached = await this.getCachedFocus(player.id);
    if (cached) {
      logger.info({ playerId: player.id }, 'Returning cached focus');
      return cached;
    }

    // Get weights
    const weights = await this.weightsService.getOrComputeWeights();

    // Get test-to-component mappings
    const mappings = await this.getTestComponentMappings();

    // Get player's test results
    const testResults = await this.getPlayerTestResults(player.id);

    // Calculate scores per component
    const componentScores = this.calculateComponentScores(testResults, mappings);

    // Calculate weakness and priority
    const focusOutput = this.calculateFocus(componentScores, weights);

    // Get weakest approach bucket if APP is focus
    let approachWeakestBucket: string | undefined;
    if (includeApproachDetail && focusOutput.focusComponent === 'APP') {
      approachWeakestBucket = await this.getWeakestApproachBucket(player.id);
      if (approachWeakestBucket) {
        focusOutput.reasonCodes.push(`approach_${approachWeakestBucket}_gap`);
      }
    }

    const result: PlayerFocusResult = {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      ...focusOutput,
      approachWeakestBucket,
      computedAt: new Date(),
    };

    // Cache result
    await this.cacheFocus(player.id, result);

    return result;
  }

  /**
   * Calculate team focus heatmap for coach
   */
  async calculateTeamFocus(
    tenantId: string,
    coachId: string,
    teamId: string
  ): Promise<TeamFocusResult> {
    logger.info({ tenantId, coachId, teamId }, 'Calculating team focus');

    // Get all players for this coach
    const players = await this.prisma.player.findMany({
      where: { tenantId, coachId },
      select: { id: true, firstName: true, lastName: true, userId: true },
    });

    if (players.length === 0) {
      return {
        teamId,
        coachId,
        playerCount: 0,
        heatmap: { OTT: 0, APP: 0, ARG: 0, PUTT: 0 },
        topReasonCodes: [],
        atRiskPlayers: [],
        computedAt: new Date(),
      };
    }

    // Get weights once
    const weights = await this.weightsService.getOrComputeWeights();
    const mappings = await this.getTestComponentMappings();

    // Calculate focus for each player
    const heatmap: Record<Component, number> = { OTT: 0, APP: 0, ARG: 0, PUTT: 0 };
    const allReasonCodes: string[] = [];
    const atRiskPlayers: AtRiskPlayer[] = [];

    for (const player of players) {
      const testResults = await this.getPlayerTestResults(player.id);
      const componentScores = this.calculateComponentScores(testResults, mappings);
      const focusOutput = this.calculateFocus(componentScores, weights);

      heatmap[focusOutput.focusComponent]++;
      allReasonCodes.push(...focusOutput.reasonCodes);

      // Check adherence
      const adherence = await this.calculatePlayerAdherence(player.id);
      if (adherence < FOCUS_CONFIG.adherenceThreshold) {
        atRiskPlayers.push({
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          focusComponent: focusOutput.focusComponent,
          reason: 'low_training_adherence',
          adherenceScore: adherence,
        });
      }
    }

    // Get top 3 reason codes
    const reasonCounts = allReasonCodes.reduce((acc, code) => {
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topReasonCodes = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([code]) => code);

    return {
      teamId,
      coachId,
      playerCount: players.length,
      heatmap,
      topReasonCodes,
      atRiskPlayers,
      computedAt: new Date(),
    };
  }

  /**
   * Get test-to-component mappings from database
   */
  private async getTestComponentMappings(): Promise<TestComponentMap[]> {
    const mappings = await this.prisma.testComponentMapping.findMany();
    return mappings.map(m => ({
      testNumber: m.testNumber,
      component: m.component as Component,
      weight: Number(m.weight),
    }));
  }

  /**
   * Get player's recent test results
   */
  private async getPlayerTestResults(playerId: string): Promise<Array<{
    testNumber: number;
    value: number;
    testDate: Date;
  }>> {
    const results = await this.prisma.testResult.findMany({
      where: { playerId },
      orderBy: { testDate: 'desc' },
      take: 50, // Last 50 results
      include: { test: { select: { testNumber: true } } },
    });

    return results.map(r => ({
      testNumber: r.test.testNumber,
      value: Number(r.value),
      testDate: r.testDate,
    }));
  }

  /**
   * Calculate component scores from test results
   */
  private calculateComponentScores(
    testResults: Array<{ testNumber: number; value: number }>,
    mappings: TestComponentMap[]
  ): Record<Component, { score: number; count: number }> {
    const scores: Record<Component, { total: number; weightSum: number; count: number }> = {
      OTT: { total: 0, weightSum: 0, count: 0 },
      APP: { total: 0, weightSum: 0, count: 0 },
      ARG: { total: 0, weightSum: 0, count: 0 },
      PUTT: { total: 0, weightSum: 0, count: 0 },
    };

    // Group by test number (use latest per test)
    const latestByTest = new Map<number, number>();
    for (const result of testResults) {
      if (!latestByTest.has(result.testNumber)) {
        latestByTest.set(result.testNumber, result.value);
      }
    }

    // Aggregate by component
    for (const [testNumber, value] of latestByTest) {
      const mapping = mappings.find(m => m.testNumber === testNumber);
      if (!mapping) continue;

      const component = mapping.component;
      scores[component].total += value * mapping.weight;
      scores[component].weightSum += mapping.weight;
      scores[component].count++;
    }

    // Calculate weighted average scores
    const result: Record<Component, { score: number; count: number }> = {
      OTT: { score: 0, count: scores.OTT.count },
      APP: { score: 0, count: scores.APP.count },
      ARG: { score: 0, count: scores.ARG.count },
      PUTT: { score: 0, count: scores.PUTT.count },
    };

    for (const component of ['OTT', 'APP', 'ARG', 'PUTT'] as Component[]) {
      if (scores[component].weightSum > 0) {
        result[component].score = scores[component].total / scores[component].weightSum;
      }
    }

    return result;
  }

  /**
   * Calculate focus based on weakness and weights
   */
  private calculateFocus(
    componentScores: Record<Component, { score: number; count: number }>,
    weights: ComponentWeights
  ): FocusOutput {
    const components: Component[] = ['OTT', 'APP', 'ARG', 'PUTT'];
    const weightMap: Record<Component, number> = {
      OTT: weights.wOtt,
      APP: weights.wApp,
      ARG: weights.wArg,
      PUTT: weights.wPutt,
    };

    // Calculate percentiles (simplified - assume 50 is average, 100 is max)
    // In production, this would compare against population data
    const percentiles: Record<Component, number> = {
      OTT: this.scoreToPercentile(componentScores.OTT.score),
      APP: this.scoreToPercentile(componentScores.APP.score),
      ARG: this.scoreToPercentile(componentScores.ARG.score),
      PUTT: this.scoreToPercentile(componentScores.PUTT.score),
    };

    // Calculate weakness (gap from target percentile)
    const weaknesses: Record<Component, number> = {} as any;
    for (const c of components) {
      weaknesses[c] = Math.max(0, FOCUS_CONFIG.targetPercentile - percentiles[c]) / 100;
    }

    // Calculate priority (weakness * weight)
    const priorities: Record<Component, number> = {} as any;
    for (const c of components) {
      priorities[c] = weaknesses[c] * weightMap[c];
    }

    // Find focus component (highest priority)
    let focusComponent: Component = 'APP';
    let maxPriority = 0;
    for (const c of components) {
      if (priorities[c] > maxPriority) {
        maxPriority = priorities[c];
        focusComponent = c;
      }
    }

    // Calculate recommended split with floor/ceiling
    const totalPriority = Object.values(priorities).reduce((a, b) => a + b, 0);
    const rawSplit: Record<Component, number> = {} as any;

    for (const c of components) {
      if (totalPriority > 0) {
        rawSplit[c] = priorities[c] / totalPriority;
      } else {
        rawSplit[c] = 0.25; // Equal split if no weakness
      }
    }

    // Apply floor/ceiling
    const recommendedSplit = this.applySplitConstraints(rawSplit);

    // Calculate focus scores (0-100, inverted from percentile for display)
    const focusScores: Record<Component, number> = {
      OTT: Math.round(100 - percentiles.OTT),
      APP: Math.round(100 - percentiles.APP),
      ARG: Math.round(100 - percentiles.ARG),
      PUTT: Math.round(100 - percentiles.PUTT),
    };

    // Build reason codes
    const reasonCodes: string[] = [];
    if (weaknesses[focusComponent] > 0.2) {
      reasonCodes.push(`weak_${focusComponent.toLowerCase()}_test_cluster`);
    }
    if (weightMap[focusComponent] > 0.3) {
      reasonCodes.push(`high_weight_${focusComponent.toLowerCase()}`);
    }

    // Determine confidence
    const totalTests = Object.values(componentScores).reduce((sum, c) => sum + c.count, 0);
    let confidence: 'low' | 'med' | 'high';
    if (totalTests < FOCUS_CONFIG.lowConfidenceThreshold) {
      confidence = 'low';
      reasonCodes.push('insufficient_test_data');
    } else if (totalTests < FOCUS_CONFIG.medConfidenceThreshold) {
      confidence = 'med';
    } else {
      confidence = 'high';
    }

    return {
      focusComponent,
      focusScores,
      recommendedSplit,
      reasonCodes,
      confidence,
    };
  }

  /**
   * Convert score to percentile (simplified heuristic)
   */
  private scoreToPercentile(score: number): number {
    if (score <= 0) return 50; // No data = average
    // Assume scores roughly 0-100 map to percentiles
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Apply floor/ceiling constraints to split
   */
  private applySplitConstraints(split: Record<Component, number>): Record<Component, number> {
    const components: Component[] = ['OTT', 'APP', 'ARG', 'PUTT'];
    const result = { ...split };
    const { minSplitPercent, maxSplitPercent } = FOCUS_CONFIG;

    // Iteratively apply constraints until stable
    for (let iteration = 0; iteration < 10; iteration++) {
      let changed = false;

      // Apply min/max constraints
      for (const c of components) {
        if (result[c] < minSplitPercent) {
          result[c] = minSplitPercent;
          changed = true;
        } else if (result[c] > maxSplitPercent) {
          result[c] = maxSplitPercent;
          changed = true;
        }
      }

      // Calculate sum and redistribute if needed
      const sum = components.reduce((acc, c) => acc + result[c], 0);
      if (Math.abs(sum - 1) < 0.001) break;

      // Find components that can be adjusted
      const adjustableUp = components.filter(c => result[c] < maxSplitPercent);
      const adjustableDown = components.filter(c => result[c] > minSplitPercent);

      if (sum < 1 && adjustableUp.length > 0) {
        // Need to increase - distribute among those below max
        const deficit = 1 - sum;
        const perComponent = deficit / adjustableUp.length;
        for (const c of adjustableUp) {
          result[c] = Math.min(maxSplitPercent, result[c] + perComponent);
        }
        changed = true;
      } else if (sum > 1 && adjustableDown.length > 0) {
        // Need to decrease - take from those above min
        const surplus = sum - 1;
        const perComponent = surplus / adjustableDown.length;
        for (const c of adjustableDown) {
          result[c] = Math.max(minSplitPercent, result[c] - perComponent);
        }
        changed = true;
      }

      if (!changed) break;
    }

    // Final normalization with rounding (should be very close to 1 already)
    const finalSum = components.reduce((acc, c) => acc + result[c], 0);
    for (const c of components) {
      result[c] = Math.round((result[c] / finalSum) * 100) / 100;
    }

    // Ensure sum is exactly 1 by adjusting largest component
    const roundedSum = components.reduce((acc, c) => acc + result[c], 0);
    if (roundedSum !== 1) {
      const maxComponent = components.reduce((max, c) => result[c] > result[max] ? c : max, 'OTT');
      result[maxComponent] = Math.round((result[maxComponent] + (1 - roundedSum)) * 100) / 100;
    }

    return result;
  }

  /**
   * Get weakest approach bucket for a player
   */
  private async getWeakestApproachBucket(playerId: string): Promise<string | undefined> {
    // Check if player is mapped to DataGolf
    const dgPlayer = await this.prisma.dataGolfPlayer.findFirst({
      where: { iupPlayerId: playerId },
      select: { playerName: true },
    });

    if (!dgPlayer) return undefined;

    // Get approach skill data
    const approachData = await this.prisma.dgApproachSkillL24.findMany({
      where: {
        playerId: dgPlayer.playerName,
        stat: 'sg_per_shot',
        lie: 'fairway',
      },
      orderBy: { value: 'asc' },
      take: 1,
    });

    return approachData[0]?.bucket;
  }

  /**
   * Calculate player adherence score based on recent events
   */
  private async calculatePlayerAdherence(playerId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count training events
    const events = await this.prisma.eventParticipant.count({
      where: {
        playerId,
        event: {
          startTime: { gte: thirtyDaysAgo },
          eventType: { in: ['training_session', 'structured_session'] },
        },
        status: 'confirmed',
      },
    });

    // Simple heuristic: 0-2 events = low, 3-5 = medium, 6+ = high
    if (events >= 6) return 100;
    if (events >= 4) return 75;
    if (events >= 2) return 50;
    return events * 20;
  }

  /**
   * Get cached focus result
   */
  private async getCachedFocus(playerId: string): Promise<PlayerFocusResult | null> {
    const cached = await this.prisma.playerFocusCache.findUnique({
      where: { playerId },
    });

    if (!cached || cached.expiresAt < new Date()) {
      return null;
    }

    return {
      playerId: cached.playerId,
      playerName: '', // Would need to fetch
      focusComponent: cached.focusComponent as Component,
      focusScores: cached.focusScores as Record<Component, number>,
      recommendedSplit: cached.recommendedSplit as Record<Component, number>,
      reasonCodes: cached.reasonCodes,
      confidence: cached.confidence as 'low' | 'med' | 'high',
      computedAt: cached.computedAt,
    };
  }

  /**
   * Cache focus result
   */
  private async cacheFocus(playerId: string, result: PlayerFocusResult): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + FOCUS_CONFIG.cacheExpiryHours);

    await this.prisma.playerFocusCache.upsert({
      where: { playerId },
      create: {
        playerId,
        focusComponent: result.focusComponent,
        focusScores: result.focusScores,
        recommendedSplit: result.recommendedSplit,
        reasonCodes: result.reasonCodes,
        confidence: result.confidence,
        expiresAt,
      },
      update: {
        focusComponent: result.focusComponent,
        focusScores: result.focusScores,
        recommendedSplit: result.recommendedSplit,
        reasonCodes: result.reasonCodes,
        confidence: result.confidence,
        computedAt: new Date(),
        expiresAt,
      },
    });
  }
}
