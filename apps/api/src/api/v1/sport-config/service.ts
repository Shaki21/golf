/**
 * Sport Configuration Service
 *
 * Handles sport configuration operations for multi-sport support.
 * Each tenant can have a custom sport configuration that overrides
 * the default sport settings.
 */

import { PrismaClient, SportId, SportConfig } from '@prisma/client';

export interface SportConfigInput {
  sportId: SportId;
  trainingAreasOverride?: Record<string, unknown>;
  environmentsOverride?: Record<string, unknown>;
  phasesOverride?: Record<string, unknown>;
  benchmarksOverride?: Record<string, unknown>;
  terminologyOverride?: Record<string, unknown>;
  navigationOverride?: Record<string, unknown>;
  usesHandicap?: boolean;
  usesClubSpeed?: boolean;
  usesSG?: boolean;
  usesAKFormula?: boolean;
  usesBenchmarks?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface SportConfigResponse {
  id: string;
  tenantId: string;
  sportId: SportId;
  trainingAreasOverride: Record<string, unknown> | null;
  environmentsOverride: Record<string, unknown> | null;
  phasesOverride: Record<string, unknown> | null;
  benchmarksOverride: Record<string, unknown> | null;
  terminologyOverride: Record<string, unknown> | null;
  navigationOverride: Record<string, unknown> | null;
  usesHandicap: boolean | null;
  usesClubSpeed: boolean | null;
  usesSG: boolean | null;
  usesAKFormula: boolean | null;
  usesBenchmarks: boolean | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SportConfigService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all available sports
   */
  async getAvailableSports(): Promise<{ id: SportId; name: string; nameNO: string }[]> {
    return [
      { id: 'GOLF', name: 'Golf', nameNO: 'Golf' },
      { id: 'RUNNING', name: 'Running', nameNO: 'Løping' },
      { id: 'HANDBALL', name: 'Handball', nameNO: 'Håndball' },
      { id: 'FOOTBALL', name: 'Football', nameNO: 'Fotball' },
      { id: 'TENNIS', name: 'Tennis', nameNO: 'Tennis' },
      { id: 'SWIMMING', name: 'Swimming', nameNO: 'Svømming' },
      { id: 'JAVELIN', name: 'Javelin', nameNO: 'Spydkast' },
    ];
  }

  /**
   * Get sport configuration for a tenant
   */
  async getByTenantId(tenantId: string): Promise<SportConfigResponse | null> {
    const config = await this.prisma.sportConfig.findUnique({
      where: { tenantId },
    });

    if (!config) return null;

    return this.mapToResponse(config);
  }

  /**
   * Get tenant's sport ID (from tenant record, not sport config)
   */
  async getTenantSportId(tenantId: string): Promise<SportId> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { sportId: true },
    });

    return tenant?.sportId ?? 'GOLF';
  }

  /**
   * Create or update sport configuration for a tenant
   */
  async upsert(tenantId: string, input: SportConfigInput): Promise<SportConfigResponse> {
    // Also update the tenant's sportId
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { sportId: input.sportId },
    });

    const config = await this.prisma.sportConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        sportId: input.sportId,
        trainingAreasOverride: input.trainingAreasOverride ?? undefined,
        environmentsOverride: input.environmentsOverride ?? undefined,
        phasesOverride: input.phasesOverride ?? undefined,
        benchmarksOverride: input.benchmarksOverride ?? undefined,
        terminologyOverride: input.terminologyOverride ?? undefined,
        navigationOverride: input.navigationOverride ?? undefined,
        usesHandicap: input.usesHandicap,
        usesClubSpeed: input.usesClubSpeed,
        usesSG: input.usesSG,
        usesAKFormula: input.usesAKFormula,
        usesBenchmarks: input.usesBenchmarks,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        logoUrl: input.logoUrl,
      },
      update: {
        sportId: input.sportId,
        trainingAreasOverride: input.trainingAreasOverride ?? undefined,
        environmentsOverride: input.environmentsOverride ?? undefined,
        phasesOverride: input.phasesOverride ?? undefined,
        benchmarksOverride: input.benchmarksOverride ?? undefined,
        terminologyOverride: input.terminologyOverride ?? undefined,
        navigationOverride: input.navigationOverride ?? undefined,
        usesHandicap: input.usesHandicap,
        usesClubSpeed: input.usesClubSpeed,
        usesSG: input.usesSG,
        usesAKFormula: input.usesAKFormula,
        usesBenchmarks: input.usesBenchmarks,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        logoUrl: input.logoUrl,
      },
    });

    return this.mapToResponse(config);
  }

  /**
   * Delete sport configuration for a tenant
   * This resets the tenant to use default sport config
   */
  async delete(tenantId: string): Promise<void> {
    await this.prisma.sportConfig.delete({
      where: { tenantId },
    });
  }

  /**
   * Get all sport configurations (admin only)
   */
  async getAll(): Promise<SportConfigResponse[]> {
    const configs = await this.prisma.sportConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return configs.map((c) => this.mapToResponse(c));
  }

  /**
   * Get sport configurations by sport
   */
  async getBySport(sportId: SportId): Promise<SportConfigResponse[]> {
    const configs = await this.prisma.sportConfig.findMany({
      where: { sportId },
      orderBy: { createdAt: 'desc' },
    });

    return configs.map((c) => this.mapToResponse(c));
  }

  private mapToResponse(config: SportConfig): SportConfigResponse {
    return {
      id: config.id,
      tenantId: config.tenantId,
      sportId: config.sportId,
      trainingAreasOverride: config.trainingAreasOverride as Record<string, unknown> | null,
      environmentsOverride: config.environmentsOverride as Record<string, unknown> | null,
      phasesOverride: config.phasesOverride as Record<string, unknown> | null,
      benchmarksOverride: config.benchmarksOverride as Record<string, unknown> | null,
      terminologyOverride: config.terminologyOverride as Record<string, unknown> | null,
      navigationOverride: config.navigationOverride as Record<string, unknown> | null,
      usesHandicap: config.usesHandicap,
      usesClubSpeed: config.usesClubSpeed,
      usesSG: config.usesSG,
      usesAKFormula: config.usesAKFormula,
      usesBenchmarks: config.usesBenchmarks,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      logoUrl: config.logoUrl,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}
