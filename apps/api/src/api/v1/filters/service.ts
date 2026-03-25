/**
 * Filter System Service
 * Manages saved filters and advanced filtering for coaches
 */

import { PrismaClient, Prisma, SavedFilter, Player, Coach, Test, TestResult } from '@prisma/client';
import { NotFoundError } from '../../../middleware/errors';

// ============================================================================
// TYPES
// ============================================================================

/** SavedFilter with coach info for detailed views */
type SavedFilterWithCoach = SavedFilter & {
  coach: Pick<Coach, 'id' | 'firstName' | 'lastName'>;
};

/** Player with full test results and coach info */
type PlayerWithTestResults = Player & {
  testResults: (TestResult & {
    test: Test;
  })[];
  coach: Pick<Coach, 'id' | 'firstName' | 'lastName'> | null;
};

export interface FilterCriteria {
  categories?: string[];
  gender?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  handicapRange?: {
    min: number;
    max: number;
  };
  testNumbers?: number[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  testStatus?: 'passed' | 'failed' | 'all';
  minCompletionRate?: number;
}

export interface CreateSavedFilterInput {
  coachId: string;
  name: string;
  description?: string;
  filters: FilterCriteria;
}

export interface UpdateSavedFilterInput {
  name?: string;
  description?: string;
  filters?: FilterCriteria;
}

export interface ApplyFilterInput {
  filters: FilterCriteria;
  limit?: number;
  offset?: number;
}

// ============================================================================
// FILTER SERVICE
// ============================================================================

export class FilterService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a saved filter
   */
  async createSavedFilter(
    tenantId: string,
    input: CreateSavedFilterInput
  ): Promise<SavedFilter> {
    // Verify coach exists
    const coach = await this.prisma.coach.findFirst({
      where: {
        id: input.coachId,
        tenantId,
      },
    });

    if (!coach) {
      throw new NotFoundError('Coach not found');
    }

    // Create saved filter
    const savedFilter = await this.prisma.savedFilter.create({
      data: {
        coachId: input.coachId,
        name: input.name,
        description: input.description,
        filter: input.filters as unknown as Prisma.InputJsonValue,
      },
    });

    return savedFilter;
  }

  /**
   * Get saved filter by ID
   */
  async getSavedFilter(tenantId: string, filterId: string): Promise<SavedFilterWithCoach> {
    const savedFilter = await this.prisma.savedFilter.findFirst({
      where: {
        id: filterId,
        coach: {
          tenantId,
        },
      },
      include: {
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!savedFilter) {
      throw new NotFoundError('Saved filter not found');
    }

    return savedFilter;
  }

  /**
   * List saved filters for a coach
   */
  async listSavedFilters(tenantId: string, coachId: string): Promise<SavedFilter[]> {
    const filters = await this.prisma.savedFilter.findMany({
      where: {
        coachId,
        coach: {
          tenantId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return filters;
  }

  /**
   * Update saved filter
   */
  async updateSavedFilter(
    tenantId: string,
    filterId: string,
    input: UpdateSavedFilterInput
  ): Promise<SavedFilter> {
    // Verify filter exists
    await this.getSavedFilter(tenantId, filterId);

    // Update filter
    const updated = await this.prisma.savedFilter.update({
      where: {
        id: filterId,
      },
      data: {
        name: input.name,
        description: input.description,
        filter: input.filters
          ? (input.filters as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return updated;
  }

  /**
   * Delete saved filter
   */
  async deleteSavedFilter(tenantId: string, filterId: string): Promise<void> {
    // Verify filter exists
    await this.getSavedFilter(tenantId, filterId);

    // Delete filter
    await this.prisma.savedFilter.delete({
      where: {
        id: filterId,
      },
    });
  }

  /**
   * Apply filter criteria to find players
   */
  async applyFilter(
    tenantId: string,
    input: ApplyFilterInput
  ): Promise<{ players: PlayerWithTestResults[]; total: number }> {
    const { filters, limit = 50, offset = 0 } = input;

    // Build where clause
    const where: Prisma.PlayerWhereInput = {
      tenantId,
    };

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      where.category = {
        in: filters.categories,
      };
    }

    // Apply gender filter
    if (filters.gender) {
      where.gender = filters.gender;
    }

    // Apply age range filter
    if (filters.ageRange) {
      const currentYear = new Date().getFullYear();
      const birthYearMax = currentYear - filters.ageRange.min;
      const birthYearMin = currentYear - filters.ageRange.max;

      where.dateOfBirth = {
        gte: new Date(`${birthYearMin}-01-01`),
        lte: new Date(`${birthYearMax}-12-31`),
      };
    }

    // Apply handicap range filter
    if (filters.handicapRange) {
      where.handicap = {
        gte: filters.handicapRange.min,
        lte: filters.handicapRange.max,
      };
    }

    // Get players with pagination
    const players = await this.prisma.player.findMany({
      where,
      include: {
        testResults: {
          include: {
            test: true,
          },
          orderBy: {
            testDate: 'desc',
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        lastName: 'asc',
      },
    });

    // Post-process for test-specific filters
    let filteredPlayers = players;

    // Filter by test numbers
    if (filters.testNumbers && filters.testNumbers.length > 0) {
      filteredPlayers = filteredPlayers.filter((player) => {
        const playerTestNumbers = new Set(
          player.testResults.map((r) => r.test.testNumber)
        );
        return filters.testNumbers!.some((tn) => playerTestNumbers.has(tn));
      });
    }

    // Filter by date range
    if (filters.dateRange) {
      filteredPlayers = filteredPlayers.map((player) => ({
        ...player,
        testResults: player.testResults.filter(
          (r) =>
            r.testDate >= filters.dateRange!.from &&
            r.testDate <= filters.dateRange!.to
        ),
      }));
    }

    // Filter by test status
    if (filters.testStatus && filters.testStatus !== 'all') {
      const passed = filters.testStatus === 'passed';
      filteredPlayers = filteredPlayers.map((player) => ({
        ...player,
        testResults: player.testResults.filter((r) => r.passed === passed),
      }));
    }

    // Filter by completion rate
    if (filters.minCompletionRate !== undefined) {
      const totalTests = 20;
      filteredPlayers = filteredPlayers.filter((player) => {
        const uniqueTests = new Set(player.testResults.map((r) => r.test.testNumber));
        const completionRate = (uniqueTests.size / totalTests) * 100;
        return completionRate >= filters.minCompletionRate!;
      });
    }

    return {
      players: filteredPlayers,
      total: filteredPlayers.length,
    };
  }

  /**
   * Get filter suggestions based on current data
   */
  async getFilterSuggestions(tenantId: string): Promise<{
    categories: string[];
    genders: string[];
    ageRange: { min: number; max: number };
    handicapRange: { min: number; max: number };
    testNumbers: number[];
  }> {
    // Get all players
    const players = await this.prisma.player.findMany({
      where: { tenantId },
      select: {
        category: true,
        gender: true,
        dateOfBirth: true,
        handicap: true,
      },
    });

    // Get unique categories and genders
    const categories = [...new Set(players.map((p) => p.category))].sort();
    const genders = [...new Set(players.map((p) => p.gender))].sort();

    // Calculate age range
    const currentYear = new Date().getFullYear();
    const ages = players.map((p) => currentYear - p.dateOfBirth.getFullYear());
    const ageRange = {
      min: Math.min(...ages),
      max: Math.max(...ages),
    };

    // Calculate handicap range
    const handicaps = players
      .filter((p) => p.handicap !== null)
      .map((p) => Number(p.handicap!));
    const handicapRange = {
      min: handicaps.length > 0 ? Math.min(...handicaps) : 0,
      max: handicaps.length > 0 ? Math.max(...handicaps) : 54,
    };

    // Get available test numbers
    const tests = await this.prisma.test.findMany({
      where: { tenantId },
      select: { testNumber: true },
      distinct: ['testNumber'],
      orderBy: { testNumber: 'asc' },
    });
    const testNumbers = tests.map((t) => t.testNumber);

    return {
      categories,
      genders,
      ageRange,
      handicapRange,
      testNumbers,
    };
  }
}
