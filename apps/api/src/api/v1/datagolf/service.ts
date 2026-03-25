/**
 * DataGolf Integration Service
 * Handles integration with DataGolf API and comparison functionality
 */

import { PrismaClient, Prisma, DataGolfApproachSkill } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';
import { getMapping, convertIupToDataGolf } from './mappings';
import { DataGolfClient } from '../../../integrations/datagolf/client';
import { logger } from '../../../utils/logger';
import type {
  DataGolfPlayerData,
  DataGolfTourAverages,
  IupToDataGolfComparison,
  DataGolfSyncStatus,
  CoachPlayerDataGolfStats,
  CoachDataGolfDashboard,
} from './types';

/**
 * Type for tour average stats stored as JSON
 */
interface TourAverageStats {
  avgSgTotal?: number | null;
  avgSgOtt?: number | null;
  avgSgApp?: number | null;
  avgSgArg?: number | null;
  avgSgPutt?: number | null;
  avgDrivingDistance?: number | null;
  avgDrivingAccuracy?: number | null;
  avgScoringAverage?: number | null;
  avgGreensInRegulation?: number | null;
  avgScrambling?: number | null;
  avgPuttsPerRound?: number | null;
}

/**
 * Type for DataGolf skill rating data from API
 */
interface DataGolfSkillRating {
  dg_id: number;
  player_name: string;
  sg_total?: number | null;
  sg_ott?: number | null;
  sg_app?: number | null;
  sg_arg?: number | null;
  sg_putt?: number | null;
}

/**
 * Type for IUP to DataGolf metric comparison
 */
interface MetricComparison {
  iupTestNumber: number;
  iupTestName: string;
  iupValue: number;
  dataGolfMetric: string;
  dataGolfValue: number;
  tourAverage: number;
  percentileVsTour: number;
  gap: number;
  gapPercentage: number;
}

/**
 * Formatted approach skill record for API response
 */
interface FormattedApproachSkill {
  dataGolfId: number;
  playerName: string;
  tour: string;
  season: number;
  approachSkill: {
    '50-75': number | null;
    '75-100': number | null;
    '100-125': number | null;
    '125-150': number | null;
    '150-175': number | null;
    '175-200': number | null;
    '200+': number | null;
  };
  lastSynced: Date;
}

/**
 * Pro player with ranking for comparison
 */
interface RankedProPlayer {
  rank: number;
  dataGolfId: string;
  playerName: string;
  tour: string | null;
  stats: {
    sgTotal: number | null;
    sgTee: number | null;
    sgApproach: number | null;
    sgAround: number | null;
    sgPutting: number | null;
    drivingDistance: number | null;
    drivingAccuracy: number | null;
  };
  lastSynced: Date;
}

/**
 * Test result with test info
 */
interface TestResultWithTest {
  testDate: Date;
  value: Prisma.Decimal | null;
  test: { testNumber: number };
}

/**
 * Approach skill averages response
 */
interface ApproachSkillAverages {
  tour: string;
  season: number;
  playerCount: number;
  averages: {
    skill50to75: number | null;
    skill75to100: number | null;
    skill100to125: number | null;
    skill125to150: number | null;
    skill150to175: number | null;
    skill175to200: number | null;
    skill200plus: number | null;
  };
}

/**
 * Ranked approach skill player
 */
interface RankedApproachSkillPlayer extends FormattedApproachSkill {
  rank: number;
}

/**
 * Approach skill list response
 */
interface ApproachSkillListResponse {
  data: FormattedApproachSkill[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class DataGolfService {
  private dataGolfClient: DataGolfClient;

  constructor(private prisma: PrismaClient) {
    this.dataGolfClient = new DataGolfClient();
  }

  /**
   * Get DataGolf data for a player
   */
  async getDataGolfPlayer(
    tenantId: string,
    playerId: string
  ): Promise<DataGolfPlayerData | null> {
    // Get player
    const player = await this.prisma.player.findFirst({
      where: {
        id: playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Get DataGolf player data
    const dataGolfPlayer = await this.prisma.dataGolfPlayer.findFirst({
      where: {
        iupPlayerId: playerId,
      },
    });

    if (!dataGolfPlayer) {
      return null;
    }

    return {
      playerId: dataGolfPlayer.iupPlayerId,
      dataGolfPlayerId: dataGolfPlayer.dataGolfId,
      playerName: dataGolfPlayer.playerName,
      tour: dataGolfPlayer.tour,
      lastUpdated: dataGolfPlayer.lastSynced,
      strokesGainedTotal: dataGolfPlayer.sgTotal ? Number(dataGolfPlayer.sgTotal) : null,
      strokesGainedOTT: dataGolfPlayer.sgOffTee ? Number(dataGolfPlayer.sgOffTee) : null,
      strokesGainedAPR: dataGolfPlayer.sgApproach ? Number(dataGolfPlayer.sgApproach) : null,
      strokesGainedARG: dataGolfPlayer.sgAroundGreen ? Number(dataGolfPlayer.sgAroundGreen) : null,
      strokesGainedPutting: dataGolfPlayer.sgPutting ? Number(dataGolfPlayer.sgPutting) : null,
      drivingDistance: dataGolfPlayer.drivingDistance ? Number(dataGolfPlayer.drivingDistance) : null,
      drivingAccuracy: dataGolfPlayer.drivingAccuracy ? Number(dataGolfPlayer.drivingAccuracy) : null,
      scoringAverage: null, // Not in schema
      birdiesToPars: null, // Not in schema
      greensInRegulation: dataGolfPlayer.girPercent ? Number(dataGolfPlayer.girPercent) : null,
      scrambling: dataGolfPlayer.scramblingPercent ? Number(dataGolfPlayer.scramblingPercent) : null,
      puttsPerRound: dataGolfPlayer.puttsPerRound ? Number(dataGolfPlayer.puttsPerRound) : null,
    };
  }

  /**
   * Get tour averages for a specific tour
   */
  async getTourAverages(tour: string, season: number): Promise<DataGolfTourAverages | null> {
    const tourAverage = await this.prisma.dataGolfTourAverage.findFirst({
      where: {
        tour,
        season,
      },
    });

    if (!tourAverage) {
      return null;
    }

    const stats = tourAverage.stats as TourAverageStats | null;
    return {
      tour: tourAverage.tour,
      season: tourAverage.season,
      lastUpdated: tourAverage.updatedAt,
      avgStrokesGainedTotal: stats?.avgSgTotal ?? null,
      avgStrokesGainedOTT: stats?.avgSgOtt ?? null,
      avgStrokesGainedAPR: stats?.avgSgApp ?? null,
      avgStrokesGainedARG: stats?.avgSgArg ?? null,
      avgStrokesGainedPutting: stats?.avgSgPutt ?? null,
      avgDrivingDistance: stats?.avgDrivingDistance ?? null,
      avgDrivingAccuracy: stats?.avgDrivingAccuracy ?? null,
      avgScoringAverage: stats?.avgScoringAverage ?? null,
      avgGreensInRegulation: stats?.avgGreensInRegulation ?? null,
      avgScrambling: stats?.avgScrambling ?? null,
      avgPuttsPerRound: stats?.avgPuttsPerRound ?? null,
    };
  }

  /**
   * Compare IUP player performance to DataGolf tour averages
   */
  async compareToTour(
    tenantId: string,
    playerId: string,
    tour: string = 'PGA',
    season: number = new Date().getFullYear()
  ): Promise<IupToDataGolfComparison> {
    // Get player
    const player = await this.prisma.player.findFirst({
      where: {
        id: playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new NotFoundError('Player not found');
    }

    // Get player's latest test results
    const testResults = await this.prisma.testResult.findMany({
      where: {
        playerId,
      },
      include: {
        test: true,
      },
      orderBy: {
        testDate: 'desc',
      },
      distinct: ['testId'],
    });

    // Get tour averages
    const tourAverages = await this.getTourAverages(tour, season);

    if (!tourAverages) {
      throw new NotFoundError(`Tour averages not found for ${tour} ${season}`);
    }

    // Build comparisons
    const comparisons: MetricComparison[] = [];
    let aboveTourAverage = 0;
    let belowTourAverage = 0;
    let nearTourAverage = 0;

    for (const result of testResults) {
      const mapping = getMapping(result.test.testNumber);
      if (!mapping || mapping.dataGolfMetric === 'none') {
        continue;
      }

      const iupValue = Number(result.value);
      const convertedValue = convertIupToDataGolf(result.test.testNumber, iupValue);

      if (convertedValue === null) {
        continue;
      }

      // Get tour average for this metric (placeholder - would need proper mapping)
      let tourAvg = 0;
      let dataGolfValue = 0;

      // Map to tour averages based on metric
      switch (mapping.dataGolfMetric) {
        case 'driving_distance':
          tourAvg = tourAverages.avgDrivingDistance ?? 0;
          dataGolfValue = convertedValue;
          break;
        case 'strokes_gained_approach':
          tourAvg = tourAverages.avgStrokesGainedAPR ?? 0;
          dataGolfValue = iupValue; // Would need proper conversion
          break;
        case 'strokes_gained_putting':
          tourAvg = tourAverages.avgStrokesGainedPutting ?? 0;
          dataGolfValue = iupValue; // Would need proper conversion
          break;
        case 'strokes_gained_around_green':
          tourAvg = tourAverages.avgStrokesGainedARG ?? 0;
          dataGolfValue = iupValue; // Would need proper conversion
          break;
        case 'scoring_average':
          tourAvg = tourAverages.avgScoringAverage ?? 0;
          dataGolfValue = iupValue;
          break;
        default:
          continue;
      }

      const gap = dataGolfValue - tourAvg;
      const gapPercentage = tourAvg !== 0 ? (gap / tourAvg) * 100 : 0;

      // Calculate percentile (simplified)
      const percentile = gap > 0 ? 60 : gap < 0 ? 40 : 50;

      if (Math.abs(gapPercentage) < 5) {
        nearTourAverage++;
      } else if (gap > 0) {
        aboveTourAverage++;
      } else {
        belowTourAverage++;
      }

      comparisons.push({
        iupTestNumber: result.test.testNumber,
        iupTestName: result.test.name,
        iupValue,
        dataGolfMetric: mapping.dataGolfMetric,
        dataGolfValue,
        tourAverage: tourAvg,
        percentileVsTour: percentile,
        gap: Math.round(gap * 100) / 100,
        gapPercentage: Math.round(gapPercentage * 10) / 10,
      });
    }

    const totalTests = comparisons.length;
    const overallPercentile =
      totalTests > 0
        ? Math.round(
            ((aboveTourAverage + nearTourAverage * 0.5) / totalTests) * 100
          )
        : 50;

    return {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      category: player.category,
      comparisons,
      overallAssessment: {
        totalTests,
        aboveTourAverage,
        belowTourAverage,
        nearTourAverage,
        overallPercentile,
      },
    };
  }

  /**
   * Sync DataGolf data from API
   * Fetches current skill ratings and historical data going back to 2017
   */
  async syncDataGolf(tenantId: string): Promise<DataGolfSyncStatus> {
    if (!this.dataGolfClient.isConfigured()) {
      logger.warn({ tenantId }, 'DataGolf API not configured, skipping sync');
      return {
        lastSyncAt: new Date(),
        nextSyncAt: this.calculateNextSync(),
        syncStatus: 'failed',
        playersUpdated: 0,
        tourAveragesUpdated: 0,
        errors: ['DataGolf API key not configured'],
      };
    }

    logger.info({ tenantId }, 'Starting DataGolf sync');
    const startTime = Date.now();
    let playersUpdated = 0;
    let tourAveragesUpdated = 0;
    const errors: string[] = [];

    // Years to sync - DataGolf typically has data from 2017 onwards
    const currentYear = new Date().getFullYear();
    const yearsToSync = [];
    for (let year = currentYear; year >= 2017; year--) {
      yearsToSync.push(year);
    }

    try {
      // First, get historical events to see what data is available
      logger.debug('Fetching historical event list');
      let availableYears: number[] = [];
      try {
        const historicalEvents = await this.dataGolfClient.getHistoricalEventList('pga');
        if (historicalEvents && Array.isArray(historicalEvents)) {
          // Extract unique years from events
          availableYears = [...new Set(
            historicalEvents
              .map((e: any) => e.calendar_year || e.year)
              .filter((y: any) => typeof y === 'number' && y >= 2017)
          )].sort((a, b) => b - a);
          logger.info({ availableYears, eventCount: historicalEvents.length }, 'Found historical DataGolf events');
        }
      } catch (histError) {
        logger.warn({ error: histError }, 'Could not fetch historical event list, using default years');
        availableYears = yearsToSync;
      }

      // Sync current skill ratings (most important - this is the current state)
      logger.debug('Syncing current PGA Tour skill ratings');
      const pgaData = await this.dataGolfClient.getSkillRatings('pga');

      if (pgaData && Array.isArray(pgaData)) {
        // Sync for all available years to maintain history
        for (const year of availableYears.length > 0 ? availableYears : yearsToSync) {
          try {
            await this.syncTourData('pga', year, pgaData);
            tourAveragesUpdated++;
            logger.debug({ year }, 'Synced tour data for year');
          } catch (yearError) {
            const msg = yearError instanceof Error ? yearError.message : String(yearError);
            logger.warn({ year, error: msg }, 'Failed to sync tour data for year');
          }
        }

        // Sync selected players (top 100 + Norwegian players)
        const playersToSync = this.getPlayersToSync(pgaData);
        logger.debug({ count: playersToSync.length }, 'Syncing players');

        for (const playerData of playersToSync) {
          try {
            await this.syncPlayerWithHistory(playerData, currentYear);
            playersUpdated++;
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error({ error: message, player: playerData.player_name }, 'Failed to sync player');
            errors.push(`Failed to sync ${playerData.player_name}: ${message}`);
          }
        }
      }

      // Also try to sync European Tour if available
      try {
        logger.debug('Syncing European Tour data');
        const euroData = await this.dataGolfClient.getSkillRatings('euro');
        if (euroData && Array.isArray(euroData)) {
          await this.syncTourData('euro', currentYear, euroData);
          tourAveragesUpdated++;

          // Sync top European players
          const euroPlayersToSync = this.getPlayersToSync(euroData).slice(0, 50);
          for (const playerData of euroPlayersToSync) {
            try {
              await this.syncPlayerWithHistory(playerData, currentYear, 'euro');
              playersUpdated++;
            } catch (error: unknown) {
              // Silent fail for euro players
            }
          }
        }
      } catch (euroError) {
        logger.debug('European Tour data not available or failed');
      }

      const duration = Date.now() - startTime;
      logger.info({
        tenantId,
        playersUpdated,
        tourAveragesUpdated,
        yearsProcessed: availableYears.length || yearsToSync.length,
        duration,
        errorCount: errors.length
      }, 'DataGolf sync completed');

      return {
        lastSyncAt: new Date(),
        nextSyncAt: this.calculateNextSync(),
        syncStatus: errors.length > 0 ? 'completed_with_errors' : 'success',
        playersUpdated,
        tourAveragesUpdated,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ error: message, tenantId }, 'DataGolf sync failed');

      return {
        lastSyncAt: new Date(),
        nextSyncAt: this.calculateNextSync(),
        syncStatus: 'failed',
        playersUpdated: 0,
        tourAveragesUpdated: 0,
        errors: [message],
      };
    }
  }

  /**
   * Sync tour averages to database
   */
  private async syncTourData(tour: string, season: number, skillRatings: DataGolfSkillRating[]): Promise<void> {
    const averages = {
      avgSgTotal: this.calculateAverage(skillRatings, 'sg_total'),
      avgSgOtt: this.calculateAverage(skillRatings, 'sg_ott'),
      avgSgApp: this.calculateAverage(skillRatings, 'sg_app'),
      avgSgArg: this.calculateAverage(skillRatings, 'sg_arg'),
      avgSgPutt: this.calculateAverage(skillRatings, 'sg_putt'),
    };

    await this.prisma.dataGolfTourAverage.upsert({
      where: {
        tour_season: {
          tour,
          season,
        },
      },
      create: {
        tour,
        season,
        stats: averages,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        stats: averages,
        updatedAt: new Date(),
      },
    });

    logger.debug({ tour, season, averages }, 'Synced tour averages');
  }

  /**
   * Sync individual player data to database
   */
  private async syncPlayer(playerData: DataGolfSkillRating): Promise<void> {
    const currentYear = new Date().getFullYear();
    await this.syncPlayerWithHistory(playerData, currentYear);
  }

  /**
   * Sync individual player data with year/season support
   */
  private async syncPlayerWithHistory(
    playerData: DataGolfSkillRating,
    season: number,
    tour: string = 'pga'
  ): Promise<void> {
    await this.prisma.dataGolfPlayer.upsert({
      where: {
        dataGolfId: playerData.dg_id.toString(),
      },
      create: {
        dataGolfId: playerData.dg_id.toString(),
        playerName: playerData.player_name,
        sgTotal: playerData.sg_total,
        sgOffTee: playerData.sg_ott,
        sgApproach: playerData.sg_app,
        sgAroundGreen: playerData.sg_arg,
        sgPutting: playerData.sg_putt,
        tour,
        season,
        lastSynced: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        playerName: playerData.player_name,
        sgTotal: playerData.sg_total,
        sgOffTee: playerData.sg_ott,
        sgApproach: playerData.sg_app,
        sgAroundGreen: playerData.sg_arg,
        sgPutting: playerData.sg_putt,
        tour,
        season,
        lastSynced: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Select which players to sync (top 100 + Norwegian players)
   */
  private getPlayersToSync(skillRatings: DataGolfSkillRating[]): DataGolfSkillRating[] {
    // Top 100 players
    const top100 = skillRatings
      .sort((a, b) => (b.sg_total || 0) - (a.sg_total || 0))
      .slice(0, 100);

    // Norwegian players
    const norwegianNames = [
      'Viktor Hovland',
      'Ludvig Åberg',
      'Kristoffer Ventura',
      'Kristoffer Reitan',
      'Kristian Krogh Johannessen',
      'Kris Ventura', // Alternative name format
    ];
    const norwegianPlayers = skillRatings.filter(p =>
      norwegianNames.some(name => p.player_name?.includes(name))
    );

    // Combine and deduplicate
    const allPlayers = [...top100, ...norwegianPlayers];
    const uniquePlayers = Array.from(
      new Map(allPlayers.map(p => [p.dg_id, p])).values()
    );

    return uniquePlayers;
  }

  /**
   * Calculate next sync time (03:00 UTC daily)
   */
  private calculateNextSync(): Date {
    const next = new Date();
    next.setUTCHours(3, 0, 0, 0);

    // If we've passed 03:00 UTC today, schedule for tomorrow
    if (next <= new Date()) {
      next.setUTCDate(next.getUTCDate() + 1);
    }

    return next;
  }

  /**
   * Calculate average for a field
   */
  private calculateAverage(data: DataGolfSkillRating[], field: keyof DataGolfSkillRating): number {
    const values = data
      .map(item => item[field])
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));

    if (values.length === 0) {
      return 0;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(3));
  }

  // ============================================================================
  // APPROACH SKILL METHODS
  // ============================================================================

  /**
   * Get approach skill data with optional filters
   */
  async getApproachSkillData(options: {
    tour?: string;
    season?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApproachSkillListResponse> {
    const {
      tour,
      season = new Date().getFullYear(),
      limit = 50,
      offset = 0,
      sortBy = 'skill100to125',
      sortOrder = 'desc',
    } = options;

    const where: Prisma.DataGolfApproachSkillWhereInput = { season };
    if (tour) where.tour = tour.toLowerCase();

    const [data, total] = await Promise.all([
      this.prisma.dataGolfApproachSkill.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.dataGolfApproachSkill.count({ where }),
    ]);

    return {
      data: data.map(this.formatApproachSkillRecord),
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + data.length < total,
      },
    };
  }

  /**
   * Get approach skill for a specific player by name
   */
  async getApproachSkillByPlayer(
    playerName: string,
    tour?: string,
    season?: number
  ): Promise<FormattedApproachSkill | null> {
    const where: Prisma.DataGolfApproachSkillWhereInput = {
      playerName: { contains: playerName, mode: 'insensitive' },
      season: season || new Date().getFullYear(),
    };
    if (tour) where.tour = tour.toLowerCase();

    const player = await this.prisma.dataGolfApproachSkill.findFirst({ where });
    return player ? this.formatApproachSkillRecord(player) : null;
  }

  /**
   * Get approach skill tour averages
   */
  async getApproachSkillAverages(
    tour?: string,
    season?: number
  ): Promise<ApproachSkillAverages | null> {
    const where: Prisma.DataGolfApproachSkillWhereInput = { season: season || new Date().getFullYear() };
    if (tour) where.tour = tour.toLowerCase();

    const data = await this.prisma.dataGolfApproachSkill.findMany({ where });

    if (data.length === 0) {
      return null;
    }

    const calcAvg = (field: keyof typeof data[0]) => {
      const values = data
        .map(d => d[field])
        .filter((v): v is NonNullable<typeof v> => v !== null && v !== undefined)
        .map(v => Number(v));
      if (values.length === 0) return null;
      return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3));
    };

    return {
      tour: tour || 'all',
      season: season || new Date().getFullYear(),
      playerCount: data.length,
      averages: {
        skill50to75: calcAvg('skill50to75'),
        skill75to100: calcAvg('skill75to100'),
        skill100to125: calcAvg('skill100to125'),
        skill125to150: calcAvg('skill125to150'),
        skill150to175: calcAvg('skill150to175'),
        skill175to200: calcAvg('skill175to200'),
        skill200plus: calcAvg('skill200plus'),
      },
    };
  }

  /**
   * Get top players for a specific distance bucket
   */
  async getTopApproachSkillByDistance(
    distance: string,
    options: { tour?: string; season?: number; limit?: number } = {}
  ): Promise<RankedApproachSkillPlayer[]> {
    const { tour, season = new Date().getFullYear(), limit = 20 } = options;

    const distanceFieldMap: Record<string, string> = {
      '50-75': 'skill50to75',
      '75-100': 'skill75to100',
      '100-125': 'skill100to125',
      '125-150': 'skill125to150',
      '150-175': 'skill150to175',
      '175-200': 'skill175to200',
      '200+': 'skill200plus',
    };

    const field = distanceFieldMap[distance];
    if (!field) {
      throw new Error(`Invalid distance bucket: ${distance}. Valid: ${Object.keys(distanceFieldMap).join(', ')}`);
    }

    const where: Prisma.DataGolfApproachSkillWhereInput = {
      season,
      [field]: { not: null },
    };
    if (tour) where.tour = tour.toLowerCase();

    const data = await this.prisma.dataGolfApproachSkill.findMany({
      where,
      orderBy: { [field]: 'desc' },
      take: limit,
    });

    return data.map((d, index) => ({
      rank: index + 1,
      ...this.formatApproachSkillRecord(d),
    }));
  }

  /**
   * Format approach skill record for API response
   */
  private formatApproachSkillRecord(record: DataGolfApproachSkill): FormattedApproachSkill {
    return {
      dataGolfId: Number(record.dataGolfId),
      playerName: record.playerName,
      tour: record.tour,
      season: record.season,
      approachSkill: {
        '50-75': record.skill50to75 ? Number(record.skill50to75) : null,
        '75-100': record.skill75to100 ? Number(record.skill75to100) : null,
        '100-125': record.skill100to125 ? Number(record.skill100to125) : null,
        '125-150': record.skill125to150 ? Number(record.skill125to150) : null,
        '150-175': record.skill150to175 ? Number(record.skill150to175) : null,
        '175-200': record.skill175to200 ? Number(record.skill175to200) : null,
        '200+': record.skill200plus ? Number(record.skill200plus) : null,
      },
      lastSynced: record.lastSynced,
    };
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<DataGolfSyncStatus> {
    // Get last sync time from database
    const lastSync = await this.prisma.dataGolfPlayer.findFirst({
      orderBy: {
        lastSynced: 'desc',
      },
      select: {
        lastSynced: true,
      },
    });

    const lastSyncAt = lastSync?.lastSynced || new Date(0);
    const nextSyncAt = new Date(lastSyncAt.getTime() + 24 * 60 * 60 * 1000);

    const playerCount = await this.prisma.dataGolfPlayer.count();
    const tourAverageCount = await this.prisma.dataGolfTourAverage.count();

    return {
      lastSyncAt,
      nextSyncAt,
      syncStatus: 'idle',
      playersUpdated: playerCount,
      tourAveragesUpdated: tourAverageCount,
    };
  }

  // ============================================================================
  // COACH DASHBOARD METHODS
  // ============================================================================

  /**
   * Get all coach players with their DataGolf stats for the dashboard
   */
  async getCoachPlayersDashboard(
    tenantId: string,
    coachId: string,
    tour: string = 'pga',
    season: number = new Date().getFullYear()
  ): Promise<CoachDataGolfDashboard> {
    // Get all players for this coach
    const players = await this.prisma.player.findMany({
      where: {
        tenantId,
        coachId,
      },
      include: {
        testResults: {
          orderBy: { testDate: 'desc' },
          take: 20, // Last 20 test results per player
          include: {
            test: true,
          },
        },
      },
    }) as Array<{
      id: string;
      firstName: string;
      lastName: string;
      category: string;
      handicap: Prisma.Decimal | null;
      testResults: Array<{
        testDate: Date;
        value: Prisma.Decimal | null;
        test: { testNumber: number };
      }>;
    }>;

    // Get tour averages for comparison
    const tourAverages = await this.getTourAverages(tour, season);

    // Get last sync time
    const lastSync = await this.prisma.dataGolfPlayer.findFirst({
      orderBy: { lastSynced: 'desc' },
      select: { lastSynced: true },
    });

    // Process each player
    const playerStats: CoachPlayerDataGolfStats[] = await Promise.all(
      players.map(async (player) => {
        // Calculate SG estimates from test results
        const sgEstimates = this.calculateSGFromTests(player.testResults, tourAverages);

        // Calculate trends by comparing recent vs older results
        const trends = this.calculateTrends(player.testResults);

        // Calculate tour comparison
        let tourComparison = null;
        if (tourAverages && sgEstimates.sgTotal !== null) {
          const tourAvgTotal = tourAverages.avgStrokesGainedTotal || 0;
          const gap = sgEstimates.sgTotal - tourAvgTotal;
          // Simplified percentile calculation
          const percentile = Math.min(100, Math.max(0, 50 + gap * 10));
          tourComparison = {
            tour: tour.toUpperCase(),
            gapToTour: Math.round(gap * 100) / 100,
            percentile: Math.round(percentile),
          };
        }

        return {
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          category: player.category || 'C',
          handicap: player.handicap ? Number(player.handicap) : null,
          dataGolfConnected: player.testResults.length > 0,
          lastSync: player.testResults[0]?.testDate || null,
          roundsTracked: player.testResults.length,
          stats: sgEstimates,
          trends,
          tourComparison,
        };
      })
    );

    // Calculate summary stats
    const connectedPlayers = playerStats.filter(p => p.dataGolfConnected).length;
    const totalRoundsTracked = playerStats.reduce((sum, p) => sum + p.roundsTracked, 0);

    return {
      players: playerStats,
      summary: {
        totalPlayers: playerStats.length,
        connectedPlayers,
        totalRoundsTracked,
        lastSyncAt: lastSync?.lastSynced || null,
      },
      tourAverages,
    };
  }

  /**
   * Calculate estimated SG values from test results
   */
  private calculateSGFromTests(
    testResults: TestResultWithTest[],
    tourAverages: DataGolfTourAverages | null
  ): CoachPlayerDataGolfStats['stats'] {
    const defaults: CoachPlayerDataGolfStats['stats'] = {
      sgTotal: null,
      sgTee: null,
      sgApproach: null,
      sgAround: null,
      sgPutting: null,
      drivingDistance: null,
      drivingAccuracy: null,
      girPercent: null,
      scrambling: null,
      puttsPerRound: null,
    };

    if (testResults.length === 0) return defaults;

    // Group test results by test type
    const latestByTest: Record<number, TestResultWithTest> = {};
    for (const result of testResults) {
      const testNum = result.test?.testNumber;
      if (testNum && !latestByTest[testNum]) {
        latestByTest[testNum] = result;
      }
    }

    // Map test results to SG estimates
    // Test #1: Driving - maps to sgTee
    if (latestByTest[1]) {
      const drivingDist = Number(latestByTest[1].value);
      defaults.drivingDistance = drivingDist;
      // Estimate SG based on distance (rough approximation)
      // Tour avg ~295y, each 10y = ~0.1 SG
      const tourAvgDist = tourAverages?.avgDrivingDistance || 295;
      defaults.sgTee = Math.round((drivingDist - tourAvgDist) / 10 * 10) / 100;
    }

    // Test #3: Approach 100m - maps to sgApproach (partial)
    // Test #6: Approach 150m - maps to sgApproach
    if (latestByTest[6] || latestByTest[3]) {
      const approachScore = Number(latestByTest[6]?.value || latestByTest[3]?.value || 0);
      // Higher score = better approach, convert to SG
      // Simplified: assume max 36 points = +1.5 SG, 0 = -1.5 SG
      defaults.sgApproach = Math.round((approachScore / 36 * 3 - 1.5) * 100) / 100;
    }

    // Test #4: Chipping - maps to sgAround
    if (latestByTest[4]) {
      const chipScore = Number(latestByTest[4].value);
      defaults.sgAround = Math.round((chipScore / 36 * 2 - 1) * 100) / 100;
    }

    // Test #5: Putting - maps to sgPutting
    if (latestByTest[5]) {
      const puttScore = Number(latestByTest[5].value);
      defaults.sgPutting = Math.round((puttScore / 36 * 2 - 1) * 100) / 100;
    }

    // Calculate total SG from components
    const components = [defaults.sgTee, defaults.sgApproach, defaults.sgAround, defaults.sgPutting]
      .filter((v): v is number => v !== null);
    if (components.length > 0) {
      defaults.sgTotal = Math.round(components.reduce((a, b) => a + b, 0) * 100) / 100;
    }

    // Additional stats from tests
    // Test #7: Putting distance
    if (latestByTest[7]) {
      defaults.puttsPerRound = 36 - Number(latestByTest[7].value) * 0.5; // Rough estimate
    }

    return defaults;
  }

  /**
   * Calculate trends based on comparing recent vs older results
   */
  private calculateTrends(testResults: TestResultWithTest[]): CoachPlayerDataGolfStats['trends'] {
    const defaults: CoachPlayerDataGolfStats['trends'] = {
      sgTotal: 'stable',
      sgTee: 'stable',
      sgApproach: 'stable',
      sgAround: 'stable',
      sgPutting: 'stable',
    };

    if (testResults.length < 4) return defaults;

    // Group by test and compare first half vs second half
    const byTest: Record<number, number[]> = {};
    for (const result of testResults) {
      const testNum = result.test?.testNumber;
      if (testNum) {
        if (!byTest[testNum]) byTest[testNum] = [];
        byTest[testNum].push(Number(result.value));
      }
    }

    const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
      if (values.length < 2) return 'stable';
      const mid = Math.floor(values.length / 2);
      const recent = values.slice(0, mid);
      const older = values.slice(mid);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const diff = recentAvg - olderAvg;
      if (diff > 1) return 'up';
      if (diff < -1) return 'down';
      return 'stable';
    };

    // Map tests to trends
    if (byTest[1]) defaults.sgTee = calculateTrend(byTest[1]);
    if (byTest[6] || byTest[3]) defaults.sgApproach = calculateTrend(byTest[6] || byTest[3]);
    if (byTest[4]) defaults.sgAround = calculateTrend(byTest[4]);
    if (byTest[5]) defaults.sgPutting = calculateTrend(byTest[5]);

    // Calculate overall trend
    const trends = [defaults.sgTee, defaults.sgApproach, defaults.sgAround, defaults.sgPutting];
    const upCount = trends.filter(t => t === 'up').length;
    const downCount = trends.filter(t => t === 'down').length;
    if (upCount > downCount + 1) defaults.sgTotal = 'up';
    else if (downCount > upCount + 1) defaults.sgTotal = 'down';
    else defaults.sgTotal = 'stable';

    return defaults;
  }

  /**
   * Get pro players for comparison (top performers)
   */
  async getProPlayers(options: {
    tour?: string;
    limit?: number;
  } = {}): Promise<RankedProPlayer[]> {
    const { tour = 'pga', limit = 50 } = options;

    const players = await this.prisma.dataGolfPlayer.findMany({
      where: {
        tour: tour.toLowerCase(),
        sgTotal: { not: null },
      },
      orderBy: {
        sgTotal: 'desc',
      },
      take: limit,
    });

    return players.map((p, index) => ({
      rank: index + 1,
      dataGolfId: p.dataGolfId,
      playerName: p.playerName,
      tour: p.tour,
      stats: {
        sgTotal: p.sgTotal ? Number(p.sgTotal) : null,
        sgTee: p.sgOffTee ? Number(p.sgOffTee) : null,
        sgApproach: p.sgApproach ? Number(p.sgApproach) : null,
        sgAround: p.sgAroundGreen ? Number(p.sgAroundGreen) : null,
        sgPutting: p.sgPutting ? Number(p.sgPutting) : null,
        drivingDistance: p.drivingDistance ? Number(p.drivingDistance) : null,
        drivingAccuracy: p.drivingAccuracy ? Number(p.drivingAccuracy) : null,
      },
      lastSynced: p.lastSynced,
    }));
  }

  /**
   * Search pro players by name
   * Supports partial matching for typeahead search
   */
  async searchProPlayers(options: {
    query: string;
    tour?: string;
    limit?: number;
  }): Promise<RankedProPlayer[]> {
    const { query, tour, limit = 20 } = options;

    if (!query || query.length < 2) {
      return [];
    }

    const whereClause: Prisma.DataGolfPlayerWhereInput = {
      playerName: {
        contains: query,
        mode: 'insensitive',
      },
      sgTotal: { not: null },
    };

    if (tour) {
      whereClause.tour = tour.toLowerCase();
    }

    const players = await this.prisma.dataGolfPlayer.findMany({
      where: whereClause,
      orderBy: {
        sgTotal: 'desc',
      },
      take: limit,
    });

    return players.map((p, index) => ({
      rank: index + 1,
      dataGolfId: p.dataGolfId,
      playerName: p.playerName,
      tour: p.tour,
      stats: {
        sgTotal: p.sgTotal ? Number(p.sgTotal) : null,
        sgTee: p.sgOffTee ? Number(p.sgOffTee) : null,
        sgApproach: p.sgApproach ? Number(p.sgApproach) : null,
        sgAround: p.sgAroundGreen ? Number(p.sgAroundGreen) : null,
        sgPutting: p.sgPutting ? Number(p.sgPutting) : null,
        drivingDistance: p.drivingDistance ? Number(p.drivingDistance) : null,
        drivingAccuracy: p.drivingAccuracy ? Number(p.drivingAccuracy) : null,
      },
      lastSynced: p.lastSynced,
    }));
  }

  /**
   * Get a specific pro player by DataGolf ID
   */
  async getProPlayerById(dataGolfId: string): Promise<RankedProPlayer | null> {
    const player = await this.prisma.dataGolfPlayer.findFirst({
      where: {
        dataGolfId,
      },
    });

    if (!player) {
      return null;
    }

    return {
      rank: 0, // Rank not applicable for single player lookup
      dataGolfId: player.dataGolfId,
      playerName: player.playerName,
      tour: player.tour,
      stats: {
        sgTotal: player.sgTotal ? Number(player.sgTotal) : null,
        sgTee: player.sgOffTee ? Number(player.sgOffTee) : null,
        sgApproach: player.sgApproach ? Number(player.sgApproach) : null,
        sgAround: player.sgAroundGreen ? Number(player.sgAroundGreen) : null,
        sgPutting: player.sgPutting ? Number(player.sgPutting) : null,
        drivingDistance: player.drivingDistance ? Number(player.drivingDistance) : null,
        drivingAccuracy: player.drivingAccuracy ? Number(player.drivingAccuracy) : null,
      },
      lastSynced: player.lastSynced,
    };
  }
}
