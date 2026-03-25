import { PrismaClient } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../../middleware/errors';

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
}

export class FeatureFlagService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new feature flag
   */
  async createFlag(input: CreateFeatureFlagInput) {
    // Check for existing key
    const existing = await this.prisma.featureFlag.findUnique({
      where: { key: input.key },
    });

    if (existing) {
      throw new ConflictError('A feature flag with this key already exists');
    }

    const flag = await this.prisma.featureFlag.create({
      data: {
        key: input.key,
        name: input.name,
        description: input.description,
        enabled: input.enabled ?? false,
        rolloutPercentage: input.rolloutPercentage ?? 100,
      },
    });

    return flag;
  }

  /**
   * List all feature flags
   */
  async listFlags() {
    const flags = await this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });

    return flags;
  }

  /**
   * Get a specific feature flag by key
   */
  async getFlag(key: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      throw new NotFoundError('Feature flag not found');
    }

    return flag;
  }

  /**
   * Update a feature flag
   */
  async updateFlag(key: string, input: UpdateFeatureFlagInput) {
    await this.getFlag(key);

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.rolloutPercentage !== undefined) updateData.rolloutPercentage = input.rolloutPercentage;

    const flag = await this.prisma.featureFlag.update({
      where: { key },
      data: updateData,
    });

    return flag;
  }

  /**
   * Delete a feature flag
   */
  async deleteFlag(key: string) {
    await this.getFlag(key);

    await this.prisma.featureFlag.delete({
      where: { key },
    });
  }

  /**
   * Toggle a feature flag
   */
  async toggleFlag(key: string) {
    const flag = await this.getFlag(key);

    const updated = await this.prisma.featureFlag.update({
      where: { key },
      data: { enabled: !flag.enabled },
    });

    return updated;
  }

  /**
   * Check if a feature is enabled for a specific user
   * Takes into account rollout percentage
   */
  async isEnabledForUser(key: string, userId: string): Promise<boolean> {
    try {
      const flag = await this.getFlag(key);

      if (!flag.enabled) {
        return false;
      }

      if (flag.rolloutPercentage >= 100) {
        return true;
      }

      // Use consistent hashing based on userId to determine if user is in rollout
      const hash = this.hashCode(userId + key);
      const userBucket = Math.abs(hash) % 100;

      return userBucket < flag.rolloutPercentage;
    } catch {
      return false;
    }
  }

  /**
   * Get all enabled flags for a user
   */
  async getEnabledFlagsForUser(userId: string): Promise<string[]> {
    const flags = await this.listFlags();
    const enabledFlags: string[] = [];

    for (const flag of flags) {
      if (!flag.enabled) continue;

      if (flag.rolloutPercentage >= 100) {
        enabledFlags.push(flag.key);
      } else {
        const hash = this.hashCode(userId + flag.key);
        const userBucket = Math.abs(hash) % 100;
        if (userBucket < flag.rolloutPercentage) {
          enabledFlags.push(flag.key);
        }
      }
    }

    return enabledFlags;
  }

  /**
   * Simple hash function for consistent user bucketing
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}
