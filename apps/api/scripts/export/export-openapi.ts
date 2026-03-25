#!/usr/bin/env tsx

/**
 * Export OpenAPI specification to JSON file
 *
 * Usage: npx tsx scripts/export-openapi.ts
 * Output: openapi.json (in project root)
 */

import Fastify from 'fastify';
import { registerSwagger } from '../src/plugins/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function exportOpenAPI() {
  console.log('Exporting OpenAPI specification...');

  // Create a minimal Fastify instance
  const app = Fastify({
    logger: false,
  });

  // Register Swagger
  await registerSwagger(app);

  // Get OpenAPI specification
  const spec = app.swagger();

  // Write to file
  const outputPath = join(__dirname, '../../openapi.json');
  writeFileSync(outputPath, JSON.stringify(spec, null, 2));

  console.log(`✅ OpenAPI specification exported to: ${outputPath}`);
  console.log(`📊 Endpoints: ${Object.keys(spec.paths || {}).length}`);
  console.log(`🏷️  Tags: ${(spec.tags || []).length}`);

  await app.close();
}

exportOpenAPI().catch((error) => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
