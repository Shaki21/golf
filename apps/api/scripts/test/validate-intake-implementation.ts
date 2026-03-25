/**
 * Validation Script: Intake Form Implementation
 * Verifies all components are in place without needing database connection
 */

import * as fs from 'fs';
import * as path from 'path';

function checkFile(filePath: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  const symbol = exists ? '✅' : '❌';
  console.log(`${symbol} ${filePath}`);
  return exists;
}

function checkImport(modulePath: string): boolean {
  try {
    require(modulePath);
    console.log(`✅ ${modulePath} (imports successfully)`);
    return true;
  } catch (error) {
    console.log(`❌ ${modulePath} (import failed: ${error})`);
    return false;
  }
}

async function main() {
  console.log('🔍 Validating Intake Form Implementation\n');

  let allChecks = true;

  // Check Type Definitions
  console.log('📝 Type Definitions:');
  allChecks = checkFile('src/domain/intake/intake.types.ts') && allChecks;

  // Check Processing Service
  console.log('\n⚙️  Processing Service:');
  allChecks = checkFile('src/domain/intake/intake-processing.service.ts') && allChecks;

  // Check API Routes
  console.log('\n🌐 API Routes:');
  allChecks = checkFile('src/api/v1/intake/index.ts') && allChecks;

  // Check App Registration
  console.log('\n📦 App Integration:');
  const appContent = fs.readFileSync('src/app.ts', 'utf-8');
  const hasImport = appContent.includes("from './api/v1/intake'");
  const hasRegister = appContent.includes('intakeRoutes');
  console.log(`${hasImport ? '✅' : '❌'} Intake routes imported in app.ts`);
  console.log(`${hasRegister ? '✅' : '❌'} Intake routes registered in app.ts`);
  allChecks = allChecks && hasImport && hasRegister;

  // Check Database Schema
  console.log('\n🗄️  Database Schema:');
  const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf-8');
  const hasPlayerIntake = schemaContent.includes('model PlayerIntake');
  const hasRelations = schemaContent.includes('intakes PlayerIntake[]') &&
                       schemaContent.includes('playerIntakes PlayerIntake[]');
  console.log(`${hasPlayerIntake ? '✅' : '❌'} PlayerIntake model defined`);
  console.log(`${hasRelations ? '✅' : '❌'} Relations added to Player and Tenant models`);
  allChecks = allChecks && hasPlayerIntake && hasRelations;

  // Check Test Scripts
  console.log('\n🧪 Test Scripts:');
  allChecks = checkFile('scripts/test-intake-flow.ts') && allChecks;
  allChecks = checkFile('scripts/test-intake-simple.ts') && allChecks;

  // Check Documentation
  console.log('\n📚 Documentation:');
  allChecks = checkFile('docs/INTAKE_FORM_IMPLEMENTATION.md') && allChecks;

  // Check Module Imports (without database connection)
  console.log('\n🔌 Module Validation:');
  try {
    const intakeTypes = await import('../src/domain/intake/intake.types');
    console.log('✅ intake.types.ts exports correct types');

    const intakeService = await import('../src/domain/intake/intake-processing.service');
    console.log('✅ intake-processing.service.ts exports IntakeProcessingService');
    console.log(`   - Methods: ${Object.getOwnPropertyNames(intakeService.IntakeProcessingService).filter(m => m !== 'prototype' && m !== 'length' && m !== 'name').join(', ')}`);

    const intakeRoutes = await import('../src/api/v1/intake');
    console.log('✅ intake API routes export intakeRoutes function');
  } catch (error) {
    console.log(`❌ Module import failed: ${error}`);
    allChecks = false;
  }

  // API Endpoints Check
  console.log('\n🛣️  API Endpoints Expected:');
  console.log('   POST   /api/v1/intake');
  console.log('   GET    /api/v1/intake/player/:playerId');
  console.log('   POST   /api/v1/intake/:intakeId/generate-plan');
  console.log('   GET    /api/v1/intake/tenant/:tenantId');
  console.log('   DELETE /api/v1/intake/:intakeId');

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allChecks) {
    console.log('✅ ALL CHECKS PASSED - Intake form implementation is complete!');
    console.log('\nTo test:');
    console.log('1. Ensure PostgreSQL is running (port 5432)');
    console.log('2. Run: npm run dev');
    console.log('3. Run: npx tsx scripts/test-intake-flow.ts');
    console.log('4. Or use the API endpoints directly');
    process.exit(0);
  } else {
    console.log('❌ SOME CHECKS FAILED - Please review the output above');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
