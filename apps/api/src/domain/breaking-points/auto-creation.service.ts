/**
 * Breaking Points Auto-Creation Service
 * Automatically creates breaking points from calibration data
 */

import { getPrismaClient } from '../../core/db/prisma';
import type { ClubType, ClubSpeedData } from '../calibration/club-speed-calibration.types';

/**
 * Type for clubsData stored as JSON in the database
 */
type ClubsDataJson = ClubSpeedData[] | { clubs: ClubSpeedData[] };
import type {
  AutoCreateBreakingPointInput,
  BreakingPointCreationResult,
  ExerciseFilter,
} from './types';
import { DEVIATION_THRESHOLDS, HOURS_PER_WEEK_BY_SEVERITY } from './types';

const prisma = getPrismaClient();

export class BreakingPointAutoCreationService {
  /**
   * Auto-create breaking points from calibration weak clubs
   */
  static async createFromCalibration(
    input: AutoCreateBreakingPointInput
  ): Promise<BreakingPointCreationResult> {
    const { playerId, tenantId, calibrationId, speedProfile, clubSpeedLevel } = input;

    const createdBreakingPoints: BreakingPointCreationResult['breakingPoints'] = [];

    // Check for weakest club deviation
    if (speedProfile.weakestClub) {
      // Find the club data to get deviation percentage
      const weakClubData = await this.getClubDeviation(calibrationId, speedProfile.weakestClub);

      if (weakClubData && Math.abs(weakClubData.deviation) >= DEVIATION_THRESHOLDS.LOW) {
        const severity = this.calculateSeverity(Math.abs(weakClubData.deviation));
        const hoursPerWeek = HOURS_PER_WEEK_BY_SEVERITY[severity];

        // Find relevant exercises for this club
        const exercises = await this.findRelevantExercises({
          tenantId,
          clubSpeedLevel,
          clubType: speedProfile.weakestClub,
          processCategory: 'speed',
        });

        // Create breaking point
        const breakingPoint = await prisma.breakingPoint.create({
          data: {
            playerId,
            processCategory: 'speed',
            specificArea: `${this.formatClubName(speedProfile.weakestClub)} speed efficiency`,
            description: `${this.formatClubName(speedProfile.weakestClub)} club speed is ${Math.abs(weakClubData.deviation).toFixed(1)}% ${weakClubData.deviation < 0 ? 'below' : 'above'} expected. This indicates a need for ${weakClubData.deviation < 0 ? 'speed development' : 'technique refinement'} with this club.`,
            identifiedDate: new Date(),
            severity,
            baselineMeasurement: `${weakClubData.actualSpeed.toFixed(1)} mph`,
            targetMeasurement: `${weakClubData.expectedSpeed.toFixed(1)} mph`,
            currentMeasurement: `${weakClubData.actualSpeed.toFixed(1)} mph`,
            progressPercent: 0,
            assignedExerciseIds: exercises.map((e: { id: string }) => e.id),
            hoursPerWeek,
            status: 'not_started',
            sourceType: 'calibration',
            calibrationId,
            clubType: speedProfile.weakestClub,
            deviationPercent: Math.abs(weakClubData.deviation),
            autoDetected: true,
            notes: 'Auto-created from club speed calibration analysis',
          },
        });

        createdBreakingPoints.push({
          id: breakingPoint.id,
          clubType: speedProfile.weakestClub,
          deviationPercent: Math.abs(weakClubData.deviation),
          severity,
        });
      }
    }

    // Check for strongest club if it's a positive outlier (technique issue)
    if (speedProfile.strongestClub) {
      const strongClubData = await this.getClubDeviation(calibrationId, speedProfile.strongestClub);

      if (strongClubData && strongClubData.deviation > DEVIATION_THRESHOLDS.LOW) {
        const severity = this.calculateSeverity(strongClubData.deviation);
        const hoursPerWeek = HOURS_PER_WEEK_BY_SEVERITY[severity];

        // Find technique exercises for this club
        const exercises = await this.findRelevantExercises({
          tenantId,
          clubSpeedLevel,
          clubType: speedProfile.strongestClub,
          processCategory: 'technique',
        });

        // Create breaking point for over-swinging or technique issue
        const breakingPoint = await prisma.breakingPoint.create({
          data: {
            playerId,
            processCategory: 'technique',
            specificArea: `${this.formatClubName(speedProfile.strongestClub)} technique optimization`,
            description: `${this.formatClubName(speedProfile.strongestClub)} club speed is ${strongClubData.deviation.toFixed(1)}% above expected. This may indicate over-swinging or compensatory movements that could benefit from technique work.`,
            identifiedDate: new Date(),
            severity,
            baselineMeasurement: `${strongClubData.actualSpeed.toFixed(1)} mph`,
            targetMeasurement: `Optimize technique while maintaining ${strongClubData.actualSpeed.toFixed(1)} mph`,
            currentMeasurement: `${strongClubData.actualSpeed.toFixed(1)} mph`,
            progressPercent: 0,
            assignedExerciseIds: exercises.map((e: { id: string }) => e.id),
            hoursPerWeek,
            status: 'not_started',
            sourceType: 'calibration',
            calibrationId,
            clubType: speedProfile.strongestClub,
            deviationPercent: strongClubData.deviation,
            autoDetected: true,
            notes: 'Auto-created from club speed calibration analysis - technique optimization',
          },
        });

        createdBreakingPoints.push({
          id: breakingPoint.id,
          clubType: speedProfile.strongestClub,
          deviationPercent: strongClubData.deviation,
          severity,
        });
      }
    }

    // Check speed decay pattern
    if (speedProfile.speedDecay === 'steep') {
      // Create a general speed maintenance breaking point
      const exercises = await this.findRelevantExercises({
        tenantId,
        clubSpeedLevel,
        processCategory: 'physical',
      });

      const breakingPoint = await prisma.breakingPoint.create({
        data: {
          playerId,
          processCategory: 'physical',
          specificArea: 'Speed maintenance through the bag',
          description: `Speed decay pattern is steep, indicating a need for improved physical conditioning and speed maintenance work. Focus on maintaining speed from long clubs through to short irons.`,
          identifiedDate: new Date(),
          severity: 'medium',
          baselineMeasurement: speedProfile.speedDecay,
          targetMeasurement: 'normal speed decay',
          currentMeasurement: speedProfile.speedDecay,
          progressPercent: 0,
          assignedExerciseIds: exercises.map((e) => e.id).slice(0, 5), // Limit to 5 exercises
          hoursPerWeek: 3,
          status: 'not_started',
          sourceType: 'calibration',
          calibrationId,
          deviationPercent: 0, // Pattern-based, not club-specific
          autoDetected: true,
          notes: 'Auto-created from speed decay pattern analysis',
        },
      });

      createdBreakingPoints.push({
        id: breakingPoint.id,
        clubType: 'driver', // General, but using driver as reference
        deviationPercent: 0,
        severity: 'medium',
      });
    }

    return {
      created: createdBreakingPoints.length,
      breakingPoints: createdBreakingPoints,
    };
  }

  /**
   * Get club deviation data from calibration
   */
  private static async getClubDeviation(
    calibrationId: string,
    clubType: ClubType
  ): Promise<{ actualSpeed: number; expectedSpeed: number; deviation: number } | null> {
    const calibration = await prisma.clubSpeedCalibration.findUnique({
      where: { id: calibrationId },
    });

    if (!calibration) return null;

    const clubsData = calibration.clubsData as ClubsDataJson | null;
    const clubs: ClubSpeedData[] = clubsData
      ? (Array.isArray(clubsData) ? clubsData : clubsData.clubs || [])
      : [];

    const club = clubs.find((c) => c.clubType === clubType);
    if (!club) return null;

    // Import expected ratios (we'll need to duplicate this from calibration types)
    const EXPECTED_SPEED_RATIOS: Record<ClubType, number> = {
      driver: 100,
      '3wood': 92,
      '5wood': 88,
      '3hybrid': 86,
      '4hybrid': 84,
      '3iron': 82,
      '4iron': 80,
      '5iron': 78,
      '6iron': 76,
      '7iron': 74,
      '8iron': 72,
      '9iron': 70,
      pw: 68,
      gw: 66,
      sw: 64,
      lw: 62,
    };

    const expectedRatio = EXPECTED_SPEED_RATIOS[clubType] / 100;
    const driverSpeed = Number(calibration.driverSpeed);
    const expectedSpeed = driverSpeed * expectedRatio;
    const actualSpeed = club.averageSpeed;
    const deviation = ((actualSpeed - expectedSpeed) / expectedSpeed) * 100;

    return { actualSpeed, expectedSpeed, deviation };
  }

  /**
   * Calculate severity based on deviation percentage
   */
  private static calculateSeverity(deviationPercent: number): 'low' | 'medium' | 'high' {
    if (deviationPercent >= DEVIATION_THRESHOLDS.HIGH) return 'high';
    if (deviationPercent >= DEVIATION_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  /**
   * Find relevant exercises for breaking point
   */
  private static async findRelevantExercises(filter: ExerciseFilter) {
    const { tenantId, clubSpeedLevel, processCategory } = filter;

    // Build where clause
    const where: any = {
      tenantId,
      isActive: true,
      clubSpeedLevels: {
        has: clubSpeedLevel,
      },
    };

    if (processCategory) {
      where.processCategory = processCategory;
    }

    // Find exercises
    const exercises = await prisma.exercise.findMany({
      where,
      take: 8, // Limit to 8 exercises per breaking point
      orderBy: {
        usageCount: 'desc', // Prefer commonly used exercises
      },
    });

    return exercises;
  }

  /**
   * Format club name for display
   */
  private static formatClubName(clubType: ClubType): string {
    const CLUB_NAMES: Record<ClubType, string> = {
      driver: 'Driver',
      '3wood': '3-Wood',
      '5wood': '5-Wood',
      '3hybrid': '3-Hybrid',
      '4hybrid': '4-Hybrid',
      '3iron': '3-Iron',
      '4iron': '4-Iron',
      '5iron': '5-Iron',
      '6iron': '6-Iron',
      '7iron': '7-Iron',
      '8iron': '8-Iron',
      '9iron': '9-Iron',
      pw: 'Pitching Wedge',
      gw: 'Gap Wedge',
      sw: 'Sand Wedge',
      lw: 'Lob Wedge',
    };

    return CLUB_NAMES[clubType];
  }

  /**
   * Map driver speed to club speed level
   */
  static async mapDriverSpeedToCSLevel(driverSpeed: number): Promise<string> {
    const mapping = await prisma.speedCategoryMapping.findFirst({
      where: {
        minDriverSpeed: { lte: driverSpeed },
        maxDriverSpeed: { gte: driverSpeed },
        isActive: true,
      },
    });

    return mapping?.clubSpeedLevel || 'CS90'; // Default to average if not found
  }
}
