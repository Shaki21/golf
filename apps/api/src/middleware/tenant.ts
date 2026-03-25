import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient, createTenantPrismaClient } from '../core/db/prisma';
import { UnauthorizedError, NotFoundError } from './errors';

/**
 * Inject tenant context into request
 * Requires authenticateUser middleware to run first
 */
export async function injectTenantContext(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    // Tenant ID should come from authenticated user
    if (!request.user) {
      throw new UnauthorizedError('Authentication required for tenant context');
    }

    const tenantId = request.user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedError('No tenant ID in user token');
    }

    // Fetch tenant information
    const prisma = getPrismaClient();
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundError(`Tenant ${tenantId} not found`);
    }

    // Check tenant status
    if (tenant.status !== 'active') {
      throw new UnauthorizedError(`Tenant ${tenant.name} is not active`);
    }

    // Inject tenant into request
    request.tenant = tenant;

    // Create tenant-scoped Prisma client
    // The extended client is compatible with PrismaClient interface
    request.db = createTenantPrismaClient(tenantId) as unknown as PrismaClient;

    request.log.debug(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
      },
      'Tenant context injected'
    );
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw error;
    }

    request.log.error({ err: error }, 'Failed to inject tenant context');
    throw new UnauthorizedError('Failed to establish tenant context');
  }
}

/**
 * Optional tenant context - don't throw if user is not authenticated
 * Useful for public endpoints that optionally use tenant context
 */
export async function optionalTenantContext(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    if (!request.user) {
      return; // No user, no tenant
    }

    const tenantId = request.user.tenantId;
    if (!tenantId) {
      return;
    }

    const prisma = getPrismaClient();
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (tenant && tenant.status === 'active') {
      request.tenant = tenant;
      request.db = createTenantPrismaClient(tenantId) as unknown as PrismaClient;
    }
  } catch (error) {
    // Silently fail for optional context
    request.log.warn({ err: error }, 'Optional tenant context failed');
  }
}
