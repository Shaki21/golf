/**
 * Peer Comparison API Service
 */

import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';
import {
  calculateMultiLevelComparison,
  matchesPeerCriteria,
  type PeerCriteria,
  type MultiLevelComparison,
} from '../../../domain/peer-comparison';

export interface GetPeerComparisonInput {
  playerId: string;
  testNumber: number;
  criteria?: PeerCriteria;
}

export interface GetMultiLevelComparisonInput {
  playerId: string;
  testNumber: number;
}

export class PeerComparisonService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get peer comparison for a player's latest test result
   */
  async getPeerComparison(
    tenantId: string,
    input: GetPeerComparisonInput
  ): Promise<any> {
    // Get player
    const player = await this.prisma.player.findFirst({
      where: {
        id: input.playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Get player's latest result for this test
    const latestResult = await this.prisma.testResult.findFirst({
      where: {
        playerId: input.playerId,
        test: {
          testNumber: input.testNumber,
        },
      },
      orderBy: {
        testDate: 'desc',
      },
      include: {
        peerComparisons: {
          orderBy: {
            calculatedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!latestResult) {
      throw new NotFoundError('No test results found for this player and test');
    }

    // Return existing peer comparison if available
    if (latestResult.peerComparisons.length > 0) {
      return latestResult.peerComparisons[0];
    }

    // If no peer comparison exists, return null
    // (Peer comparison should be calculated when test result is recorded)
    return null;
  }

  /**
   * Get multi-level comparison (coach view)
   * Shows how player compares across all category levels
   */
  async getMultiLevelComparison(
    tenantId: string,
    input: GetMultiLevelComparisonInput
  ): Promise<MultiLevelComparison> {
    // Get player
    const player = await this.prisma.player.findFirst({
      where: {
        id: input.playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Get player's latest result
    const playerResult = await this.prisma.testResult.findFirst({
      where: {
        playerId: input.playerId,
        test: {
          testNumber: input.testNumber,
        },
      },
      orderBy: {
        testDate: 'desc',
      },
    });

    if (!playerResult) {
      throw new NotFoundError('No test results found for this player and test');
    }

    const playerValue = Number(playerResult.value);

    // Get all players' latest results grouped by category
    const allPlayers = await this.prisma.player.findMany({
      where: {
        tenantId,
        gender: player.gender,
      },
      select: {
        id: true,
        category: true,
      },
    });

    // Get latest results for all players
    const allResults = await this.prisma.testResult.findMany({
      where: {
        playerId: { in: allPlayers.map((p) => p.id) },
        test: {
          testNumber: input.testNumber,
        },
      },
      orderBy: {
        testDate: 'desc',
      },
      distinct: ['playerId'],
    });

    // Group by category
    const valuesByCategory: Record<string, number[]> = {};
    allResults.forEach((result) => {
      const playerData = allPlayers.find((p) => p.id === result.playerId);
      if (playerData) {
        const category = playerData.category;
        if (!valuesByCategory[category]) {
          valuesByCategory[category] = [];
        }
        valuesByCategory[category].push(Number(result.value));
      }
    });

    // Get requirements by category
    const requirements = await this.prisma.categoryRequirement.findMany({
      where: {
        testNumber: input.testNumber,
        gender: player.gender as 'M' | 'K',
      },
    });

    const requirementsByCategory: Record<string, number> = {};
    requirements.forEach((req) => {
      requirementsByCategory[req.category] = Number(req.requirement);
    });

    // Determine if lower is better
    const lowerIsBetter = [8, 9, 10, 11, 17, 18, 19, 20].includes(input.testNumber);

    // Calculate multi-level comparison
    const comparison = calculateMultiLevelComparison(
      input.playerId,
      player.category,
      input.testNumber,
      playerValue,
      valuesByCategory,
      requirementsByCategory,
      lowerIsBetter
    );

    return comparison;
  }

  /**
   * Get peer group for a player based on criteria
   */
  async getPeerGroup(
    tenantId: string,
    playerId: string,
    criteria: PeerCriteria
  ): Promise<any[]> {
    const players = await this.prisma.player.findMany({
      where: {
        tenantId,
        id: { not: playerId },
      },
    });

    const peers = players
      .map((p) => ({
        ...p,
        handicap: p.handicap ? Number(p.handicap) : null,
      }))
      .filter((p) => matchesPeerCriteria(p, criteria, playerId));

    return peers;
  }
}
