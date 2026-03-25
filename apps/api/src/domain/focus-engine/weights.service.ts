/**
 * Component Weights Service
 * Computes global weights based on variance in pro data
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import type { ComponentWeights, Component } from './types';

interface WeightsConfig {
  windowSize: number; // Number of seasons to include (3-5)
  minPlayers: number; // Minimum players per season for validity
}

const DEFAULT_CONFIG: WeightsConfig = {
  windowSize: 3,
  minPlayers: 100,
};

export class WeightsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get current active weights
   */
  async getCurrentWeights(): Promise<ComponentWeights | null> {
    const weights = await this.prisma.dgComponentWeight.findFirst({
      where: { isActive: true },
      orderBy: { computedAt: 'desc' },
    });

    if (!weights) return null;

    return {
      windowStartSeason: weights.windowStartSeason,
      windowEndSeason: weights.windowEndSeason,
      wOtt: Number(weights.wOtt),
      wApp: Number(weights.wApp),
      wArg: Number(weights.wArg),
      wPutt: Number(weights.wPutt),
      computedAt: weights.computedAt,
    };
  }

  /**
   * Compute and store new weights based on recent seasons
   */
  async computeWeights(config: Partial<WeightsConfig> = {}): Promise<ComponentWeights> {
    const { windowSize, minPlayers } = { ...DEFAULT_CONFIG, ...config };

    logger.info({ windowSize, minPlayers }, 'Computing component weights');

    // Get latest season available
    const latestSeason = await this.prisma.dgPlayerSeason.aggregate({
      _max: { season: true },
    });

    if (!latestSeason._max.season) {
      throw new Error('No player season data available');
    }

    const endSeason = latestSeason._max.season;
    const startSeason = endSeason - windowSize + 1;

    logger.info({ startSeason, endSeason }, 'Window range determined');

    // Get all player data for the window
    // Filter out -9999 placeholder values (DataGolf uses this for missing data)
    const players = await this.prisma.dgPlayerSeason.findMany({
      where: {
        season: { gte: startSeason, lte: endSeason },
        ottTrue: { not: null, gt: -100 },
        appTrue: { not: null, gt: -100 },
        argTrue: { not: null, gt: -100 },
        puttTrue: { not: null, gt: -100 },
      },
      select: {
        ottTrue: true,
        appTrue: true,
        argTrue: true,
        puttTrue: true,
      },
    });

    if (players.length < minPlayers) {
      throw new Error(`Insufficient data: ${players.length} records, need ${minPlayers}`);
    }

    logger.info({ playerCount: players.length }, 'Computing variance from player data');

    // Calculate standard deviation for each component
    const components: Array<{ key: Component; values: number[] }> = [
      { key: 'OTT', values: players.map(p => Number(p.ottTrue)) },
      { key: 'APP', values: players.map(p => Number(p.appTrue)) },
      { key: 'ARG', values: players.map(p => Number(p.argTrue)) },
      { key: 'PUTT', values: players.map(p => Number(p.puttTrue)) },
    ];

    const stdDevs: Record<Component, number> = {
      OTT: this.calculateStdDev(components[0].values),
      APP: this.calculateStdDev(components[1].values),
      ARG: this.calculateStdDev(components[2].values),
      PUTT: this.calculateStdDev(components[3].values),
    };

    logger.info({ stdDevs }, 'Standard deviations calculated');

    // Normalize to weights (sum to 1)
    const totalStdDev = stdDevs.OTT + stdDevs.APP + stdDevs.ARG + stdDevs.PUTT;
    const weights: ComponentWeights = {
      windowStartSeason: startSeason,
      windowEndSeason: endSeason,
      wOtt: Math.round((stdDevs.OTT / totalStdDev) * 10000) / 10000,
      wApp: Math.round((stdDevs.APP / totalStdDev) * 10000) / 10000,
      wArg: Math.round((stdDevs.ARG / totalStdDev) * 10000) / 10000,
      wPutt: Math.round((stdDevs.PUTT / totalStdDev) * 10000) / 10000,
      computedAt: new Date(),
    };

    // Ensure they sum to exactly 1 (handle rounding)
    const sum = weights.wOtt + weights.wApp + weights.wArg + weights.wPutt;
    if (Math.abs(sum - 1) > 0.0001) {
      weights.wOtt += (1 - sum);
    }

    logger.info({ weights }, 'Weights computed');

    // Deactivate previous weights
    await this.prisma.dgComponentWeight.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Store new weights (upsert to handle re-computation)
    await this.prisma.dgComponentWeight.upsert({
      where: {
        windowStartSeason_windowEndSeason: {
          windowStartSeason: weights.windowStartSeason,
          windowEndSeason: weights.windowEndSeason,
        },
      },
      update: {
        wOtt: weights.wOtt,
        wApp: weights.wApp,
        wArg: weights.wArg,
        wPutt: weights.wPutt,
        isActive: true,
        computedAt: weights.computedAt,
      },
      create: {
        windowStartSeason: weights.windowStartSeason,
        windowEndSeason: weights.windowEndSeason,
        wOtt: weights.wOtt,
        wApp: weights.wApp,
        wArg: weights.wArg,
        wPutt: weights.wPutt,
        isActive: true,
      },
    });

    logger.info('Weights stored successfully');

    return weights;
  }

  /**
   * Calculate standard deviation of an array
   */
  private calculateStdDev(values: number[]): number {
    const n = values.length;
    if (n === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    return Math.sqrt(variance);
  }

  /**
   * Get or compute weights (lazy computation)
   */
  async getOrComputeWeights(): Promise<ComponentWeights> {
    let weights = await this.getCurrentWeights();

    if (!weights) {
      logger.info('No weights found, computing...');
      weights = await this.computeWeights();
    }

    return weights;
  }
}
