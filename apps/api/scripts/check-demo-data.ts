/**
 * Check Demo Data Script
 * Verify the demo data setup
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env BEFORE any imports that use it
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createPrismaClient, disconnectPrisma } from '../prisma/client';

async function main() {
  const prisma = createPrismaClient();

  try {
    // Find all coaches
    const coaches = await prisma.coach.findMany({
      include: { tenant: true },
    });

    console.log('=== All Coaches ===');
    for (const c of coaches) {
      console.log(`- ${c.email} | Tenant: ${c.tenant.name} | Coach ID: ${c.id}`);
    }

    // Count players per tenant
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: { select: { players: true, coaches: true } },
      },
    });

    console.log('\n=== Tenants with player counts ===');
    for (const t of tenants) {
      console.log(`- ${t.name}: ${t._count.players} players, ${t._count.coaches} coaches`);
    }

    // Show demo players
    const demoTenant = await prisma.tenant.findFirst({
      where: { name: 'TIER Golf Demo' },
      include: {
        players: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (demoTenant) {
      console.log('\n=== Demo Players ===');
      for (const p of demoTenant.players) {
        console.log(`- ${p.firstName} ${p.lastName} (${p.email})`);
      }
    }
  } finally {
    await disconnectPrisma(prisma);
  }
}

main();
