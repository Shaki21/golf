/**
 * Club Speed Calibration Service
 * Processes club speed calibration data and generates speed profiles
 */

import {
  ClubSpeedCalibration,
  ClubSpeedCalibrationInput,
  ClubSpeedCalibrationResult,
  ClubSpeedData,
  ClubSpeedShot,
  SpeedProfile,
  ClubType,
  EXPECTED_SPEED_RATIOS,
  CLUB_ORDER,
} from './club-speed-calibration.types';

export class ClubSpeedCalibrationService {
  /**
   * Process calibration input and calculate speed percentages
   */
  static processCalibration(
    input: ClubSpeedCalibrationInput
  ): ClubSpeedCalibrationResult {
    // Sort clubs by standard order
    const sortedClubs = this.sortClubsByOrder(input.clubs);

    // Calculate average speed for each club
    const clubsData: ClubSpeedData[] = sortedClubs.map((club) => {
      const shots: ClubSpeedShot[] = [
        { shotNumber: 1, clubSpeed: club.shot1Speed },
        { shotNumber: 2, clubSpeed: club.shot2Speed },
        { shotNumber: 3, clubSpeed: club.shot3Speed },
      ];

      const averageSpeed =
        (club.shot1Speed + club.shot2Speed + club.shot3Speed) / 3;

      return {
        clubType: club.clubType,
        shots,
        averageSpeed: Math.round(averageSpeed * 10) / 10, // Round to 1 decimal
        percentOfDriver: 0, // Will be calculated after we know driver speed
      };
    });

    // Find driver speed (baseline for percentages)
    const driverData = clubsData.find((c) => c.clubType === 'driver');
    if (!driverData) {
      throw new Error('Driver speed is required for calibration');
    }

    const driverSpeed = driverData.averageSpeed;

    // Calculate percent of driver for each club
    clubsData.forEach((club) => {
      club.percentOfDriver =
        Math.round((club.averageSpeed / driverSpeed) * 1000) / 10; // Round to 1 decimal
    });

    // Generate speed profile
    const speedProfile = this.generateSpeedProfile(clubsData, driverSpeed);

    const calibration: ClubSpeedCalibration = {
      playerId: input.playerId,
      calibrationDate:
        typeof input.calibrationDate === 'string'
          ? new Date(input.calibrationDate)
          : input.calibrationDate,
      clubs: clubsData,
      driverSpeed,
      speedProfile,
      notes: input.notes,
    };

    return {
      calibration,
      speedProfile,
      recommendations: speedProfile.recommendations,
    };
  }

  /**
   * Generate speed profile analysis
   */
  private static generateSpeedProfile(
    clubs: ClubSpeedData[],
    driverSpeed: number
  ): SpeedProfile {
    const recommendations: string[] = [];

    // Analyze speed decay pattern
    const speedDecay = this.analyzeSpeedDecay(clubs);

    // Analyze gapping consistency
    const gapping = this.analyzeGapping(clubs);

    // Find weakest and strongest clubs (relative to expected)
    const { weakest, strongest } = this.findOutliers(clubs);

    // Generate recommendations
    if (speedDecay === 'steep') {
      recommendations.push(
        'Speed drops quickly through the bag - work on maintaining speed with longer irons'
      );
    } else if (speedDecay === 'shallow') {
      recommendations.push(
        'Speed stays high through the bag - good speed maintenance'
      );
    }

    if (gapping === 'uneven') {
      recommendations.push(
        'Inconsistent speed gaps between clubs - work on even progression'
      );
    }

    if (weakest) {
      recommendations.push(
        `Weakest club relative to expected: ${weakest} - focus training here`
      );
    }

    if (strongest) {
      recommendations.push(`Strongest club: ${strongest} - maintain this efficiency`);
    }

    if (driverSpeed < 90) {
      recommendations.push(
        'Driver speed below 90 mph - focus on speed training protocols'
      );
    } else if (driverSpeed > 115) {
      recommendations.push('Excellent driver speed - maintain and optimize efficiency');
    }

    return {
      driverSpeed,
      speedDecay,
      gapping,
      weakestClub: weakest,
      strongestClub: strongest,
      recommendations,
    };
  }

  /**
   * Analyze how speed decays through the bag
   */
  private static analyzeSpeedDecay(
    clubs: ClubSpeedData[]
  ): 'normal' | 'steep' | 'shallow' {
    // Get driver and lowest iron speeds
    const driver = clubs.find((c) => c.clubType === 'driver');
    const irons = clubs.filter((c) => c.clubType.includes('iron') || c.clubType === 'pw');

    if (!driver || irons.length === 0) return 'normal';

    // Find the longest iron (lowest number)
    const longestIron = irons.reduce((longest, current) => {
      const currentNum = this.getClubNumber(current.clubType);
      const longestNum = this.getClubNumber(longest.clubType);
      return currentNum < longestNum ? current : longest;
    });

    const speedDrop = driver.averageSpeed - longestIron.averageSpeed;
    const percentDrop = (speedDrop / driver.averageSpeed) * 100;

    // Typical drop from driver to long iron is 20-30%
    if (percentDrop > 30) return 'steep';
    if (percentDrop < 20) return 'shallow';
    return 'normal';
  }

  /**
   * Analyze gapping consistency
   */
  private static analyzeGapping(clubs: ClubSpeedData[]): 'good' | 'uneven' {
    // Check if speed gaps between consecutive clubs are consistent
    const gaps: number[] = [];

    for (let i = 1; i < clubs.length; i++) {
      const gap = clubs[i - 1].averageSpeed - clubs[i].averageSpeed;
      gaps.push(gap);
    }

    if (gaps.length === 0) return 'good';

    // Calculate standard deviation of gaps
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance =
      gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);

    // If standard deviation is more than 2 mph, gapping is uneven
    return stdDev > 2 ? 'uneven' : 'good';
  }

  /**
   * Find clubs that are outliers (much better or worse than expected)
   */
  private static findOutliers(clubs: ClubSpeedData[]): {
    weakest?: ClubType;
    strongest?: ClubType;
  } {
    let maxDeviation = 0;
    let minDeviation = 0;
    let weakest: ClubType | undefined;
    let strongest: ClubType | undefined;

    clubs.forEach((club) => {
      const expected = EXPECTED_SPEED_RATIOS[club.clubType];
      const actual = club.percentOfDriver;
      const deviation = actual - expected;

      if (deviation < minDeviation) {
        minDeviation = deviation;
        weakest = club.clubType;
      }
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        strongest = club.clubType;
      }
    });

    // Only return if deviation is significant (>5%)
    return {
      weakest: Math.abs(minDeviation) > 5 ? weakest : undefined,
      strongest: maxDeviation > 5 ? strongest : undefined,
    };
  }

  /**
   * Sort clubs by standard order
   */
  private static sortClubsByOrder(
    clubs: ClubSpeedCalibrationInput['clubs']
  ): ClubSpeedCalibrationInput['clubs'] {
    return clubs.sort((a, b) => {
      const aIndex = CLUB_ORDER.indexOf(a.clubType);
      const bIndex = CLUB_ORDER.indexOf(b.clubType);
      return aIndex - bIndex;
    });
  }

  /**
   * Get numeric value from club type for comparison
   */
  private static getClubNumber(clubType: ClubType): number {
    const match = clubType.match(/\d+/);
    if (match) return parseInt(match[0]);
    if (clubType === 'pw') return 10;
    if (clubType === 'gw') return 11;
    if (clubType === 'sw') return 12;
    if (clubType === 'lw') return 13;
    return 0;
  }

  /**
   * Get expected speed for a club based on driver speed
   */
  static getExpectedSpeed(driverSpeed: number, clubType: ClubType): number {
    const ratio = EXPECTED_SPEED_RATIOS[clubType] / 100;
    return Math.round(driverSpeed * ratio * 10) / 10;
  }

  /**
   * Validate calibration input
   */
  static validateInput(input: ClubSpeedCalibrationInput): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Must have driver
    const hasDriver = input.clubs.some((c) => c.clubType === 'driver');
    if (!hasDriver) {
      errors.push('Driver speed is required');
    }

    // Validate speed values
    input.clubs.forEach((club) => {
      if (club.shot1Speed < 40 || club.shot1Speed > 150) {
        errors.push(`Invalid speed for ${club.clubType} shot 1: ${club.shot1Speed} mph`);
      }
      if (club.shot2Speed < 40 || club.shot2Speed > 150) {
        errors.push(`Invalid speed for ${club.clubType} shot 2: ${club.shot2Speed} mph`);
      }
      if (club.shot3Speed < 40 || club.shot3Speed > 150) {
        errors.push(`Invalid speed for ${club.clubType} shot 3: ${club.shot3Speed} mph`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
