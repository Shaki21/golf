/**
 * Category Requirements Repository
 * Handles database lookups for test requirements
 */

import { PrismaClient } from '@prisma/client';
import type { CategoryRequirement } from './types';

export class RequirementsRepository {
  private cache: Map<string, CategoryRequirement> = new Map();

  constructor(private prisma: PrismaClient) {}

  /**
   * Get requirement from database with caching
   */
  async getRequirement(
    category: string,
    gender: 'M' | 'K',
    testNumber: number
  ): Promise<CategoryRequirement> {
    const cacheKey = `${category}-${gender}-${testNumber}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Fetch from database
    const dbRequirement = await this.prisma.categoryRequirement.findUnique({
      where: {
        category_gender_testNumber: {
          category,
          gender,
          testNumber,
        },
      },
    });

    if (!dbRequirement) {
      throw new Error(
        `No requirement found for category ${category}, gender ${gender}, test ${testNumber}`
      );
    }

    // Convert database model to domain type
    const requirement: CategoryRequirement = {
      category: dbRequirement.category,
      gender: dbRequirement.gender as 'M' | 'K',
      testNumber: dbRequirement.testNumber,
      requirement: parseFloat(dbRequirement.requirement.toString()),
      unit: dbRequirement.unit,
      comparison: dbRequirement.comparison as '>=' | '<=' | 'range',
      rangeMin: dbRequirement.rangeMin
        ? parseFloat(dbRequirement.rangeMin.toString())
        : undefined,
      rangeMax: dbRequirement.rangeMax
        ? parseFloat(dbRequirement.rangeMax.toString())
        : undefined,
    };

    // Cache the result
    this.cache.set(cacheKey, requirement);

    return requirement;
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Preload all requirements into cache
   */
  async preloadCache(): Promise<void> {
    const allRequirements = await this.prisma.categoryRequirement.findMany({
      where: { isActive: true },
    });

    for (const dbReq of allRequirements) {
      const requirement: CategoryRequirement = {
        category: dbReq.category,
        gender: dbReq.gender as 'M' | 'K',
        testNumber: dbReq.testNumber,
        requirement: parseFloat(dbReq.requirement.toString()),
        unit: dbReq.unit,
        comparison: dbReq.comparison as '>=' | '<=' | 'range',
        rangeMin: dbReq.rangeMin
          ? parseFloat(dbReq.rangeMin.toString())
          : undefined,
        rangeMax: dbReq.rangeMax
          ? parseFloat(dbReq.rangeMax.toString())
          : undefined,
      };

      const cacheKey = `${dbReq.category}-${dbReq.gender}-${dbReq.testNumber}`;
      this.cache.set(cacheKey, requirement);
    }
  }
}
