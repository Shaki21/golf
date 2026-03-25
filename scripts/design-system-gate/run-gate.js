#!/usr/bin/env node

/**
 * Design System CI Gate Runner
 *
 * Runs all design system enforcement checks:
 * 1. Hex color violations (with allowlist)
 * 2. Inline style violations (with allowlist)
 * 3. Raw Tailwind color violations (with allowlist)
 * 4. Contrast safety checks (WCAG AA) - non-blocking
 * 5. Component boundary enforcement - non-blocking
 *
 * Uses allowlists to grandfather existing violations.
 * Only BLOCKS on NEW violations not in allowlists.
 *
 * Exits with code 1 if any BLOCKING check fails.
 *
 * Usage:
 *   node scripts/design-system-gate/run-gate.js
 *   pnpm run design-system:check
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

const ROOT_DIR = path.resolve(__dirname, '../..');
const GATE_DIR = __dirname;
const ALLOWLISTS_DIR = path.join(GATE_DIR, 'allowlists');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// =============================================================================
// HELPERS
// =============================================================================

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title) {
  console.log('');
  log('═'.repeat(60), colors.cyan);
  log(`  ${title}`, colors.cyan + colors.bold);
  log('═'.repeat(60), colors.cyan);
  console.log('');
}

function runCommand(command, description, options = {}) {
  log(`Running: ${description}...`, colors.blue);
  log(`  $ ${command}`, colors.yellow);
  console.log('');

  try {
    execSync(command, {
      cwd: ROOT_DIR,
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
    });
    log(`✓ ${description} passed`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, colors.red);
    if (options.silent && error.stdout) {
      console.log(error.stdout);
    }
    return false;
  }
}

// =============================================================================
// ALLOWLIST FUNCTIONS
// =============================================================================

/**
 * Load an allowlist JSON file.
 * Returns { files: { [path]: count } } or empty object if not found.
 */
function loadAllowlist(name) {
  const filePath = path.join(ALLOWLISTS_DIR, `${name}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      log(`  Loaded allowlist: ${name}.json (${Object.keys(data.files || {}).length} files)`, colors.blue);
      return data.files || {};
    }
  } catch (e) {
    log(`  Warning: Could not load allowlist ${name}.json: ${e.message}`, colors.yellow);
  }
  return {};
}

/**
 * Check if a file:count is in the allowlist.
 * Returns true if the file is allowlisted with >= the given count.
 */
function isAllowlisted(allowlist, filePath, count) {
  // Normalize path to be relative to apps/
  const normalizedPath = filePath.replace(/^.*?(apps\/)/, '$1');
  const allowedCount = allowlist[normalizedPath];
  return allowedCount !== undefined && count <= allowedCount;
}

/**
 * Find violations using grep and check against allowlist.
 * Returns { total: number, new: number, newViolations: string[] }
 */
function findViolationsWithAllowlist(pattern, fileTypes, allowlist) {
  const includes = fileTypes.map(t => `--include="*.${t}"`).join(' ');

  try {
    const result = execSync(
      `grep -rn ${includes} -E "${pattern}" apps/ 2>/dev/null | grep -v node_modules || true`,
      { cwd: ROOT_DIR, encoding: 'utf-8' }
    );

    if (!result.trim()) {
      return { total: 0, new: 0, newViolations: [] };
    }

    const lines = result.trim().split('\n').filter(Boolean);

    // Count violations per file
    const fileCounts = {};
    for (const line of lines) {
      const match = line.match(/^([^:]+):/);
      if (match) {
        const file = match[1];
        fileCounts[file] = (fileCounts[file] || 0) + 1;
      }
    }

    // Check against allowlist
    const newViolations = [];
    for (const [file, count] of Object.entries(fileCounts)) {
      if (!isAllowlisted(allowlist, file, count)) {
        const normalizedPath = file.replace(/^.*?(apps\/)/, '$1');
        const allowed = allowlist[normalizedPath] || 0;
        newViolations.push(`${file}: ${count} violations (allowlisted: ${allowed})`);
      }
    }

    return {
      total: lines.length,
      new: newViolations.length,
      newViolations
    };
  } catch (e) {
    return { total: 0, new: 0, newViolations: [] };
  }
}

// =============================================================================
// CHECK FUNCTIONS
// =============================================================================

function checkHexColors() {
  header('1. Hex Color Enforcement');

  log('Loading allowlists...', colors.blue);
  const hexAllowlist = loadAllowlist('hex-color');

  log('Scanning for hardcoded hex colors in apps/**...', colors.blue);

  // Check for hex colors in style objects
  const hexPattern = '#[0-9a-fA-F]{3,8}';
  const result = findViolationsWithAllowlist(
    `:\\s*['\"]${hexPattern}`,
    ['jsx', 'tsx'],
    hexAllowlist
  );

  if (result.total > 0) {
    log(`  Found ${result.total} total hex color references`, colors.yellow);
    log(`  Allowlisted: ${result.total - result.new}`, colors.blue);
  }

  if (result.new > 0) {
    log(`\n✗ NEW hex color violations detected (${result.new}):`, colors.red);
    result.newViolations.slice(0, 10).forEach(v => log(`    ${v}`, colors.red));
    if (result.newViolations.length > 10) {
      log(`    ... and ${result.newViolations.length - 10} more`, colors.red);
    }
    log('\nFix: Use CSS variables (var(--ak-*)) or design tokens.', colors.yellow);
    return false;
  }

  log('✓ No NEW hex color violations', colors.green);
  return true;
}

function checkInlineStyles() {
  header('2. Inline Style Enforcement');

  log('Loading allowlists...', colors.blue);
  const inlineAllowlist = loadAllowlist('inline-style');

  log('Scanning for inline style={{...}} usage in apps/**...', colors.blue);

  // Check for style={{...}} in JSX
  const stylePattern = 'style\\s*=\\s*\\{\\{';
  const result = findViolationsWithAllowlist(
    stylePattern,
    ['jsx', 'tsx'],
    inlineAllowlist
  );

  if (result.total > 0) {
    log(`  Found ${result.total} total inline style usages`, colors.yellow);
    log(`  Allowlisted: ${result.total - result.new}`, colors.blue);
  }

  if (result.new > 0) {
    log(`\n✗ NEW inline style violations detected (${result.new}):`, colors.red);
    result.newViolations.slice(0, 10).forEach(v => log(`    ${v}`, colors.red));
    if (result.newViolations.length > 10) {
      log(`    ... and ${result.newViolations.length - 10} more`, colors.red);
    }
    log('\nFix: Use Tailwind classes or CSS modules instead of inline styles.', colors.yellow);
    return false;
  }

  log('✓ No NEW inline style violations', colors.green);
  return true;
}

function checkRawTailwindColors() {
  header('3. Raw Tailwind Color Enforcement');

  log('Loading allowlists...', colors.blue);
  const tailwindAllowlist = loadAllowlist('raw-tailwind-color');

  log('Scanning for raw Tailwind colors (bg-gray-*, text-blue-*, etc.) in apps/**...', colors.blue);

  // Check for raw Tailwind color classes (not semantic --ak-* tokens)
  const rawTailwindPattern = '(bg|text|border|ring)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+';
  const result = findViolationsWithAllowlist(
    rawTailwindPattern,
    ['jsx', 'tsx'],
    tailwindAllowlist
  );

  if (result.total > 0) {
    log(`  Found ${result.total} total raw Tailwind color usages`, colors.yellow);
    log(`  Allowlisted: ${result.total - result.new}`, colors.blue);
  }

  if (result.new > 0) {
    log(`\n✗ NEW raw Tailwind color violations detected (${result.new}):`, colors.red);
    result.newViolations.slice(0, 10).forEach(v => log(`    ${v}`, colors.red));
    if (result.newViolations.length > 10) {
      log(`    ... and ${result.newViolations.length - 10} more`, colors.red);
    }
    log('\nFix: Use semantic tokens (bg-ak-*, text-ak-*) instead of raw Tailwind colors.', colors.yellow);
    return false;
  }

  log('✓ No NEW raw Tailwind color violations', colors.green);
  return true;
}

function checkContrast() {
  header('4. Contrast Safety Check (WCAG AA)');

  const contrastScript = path.join(GATE_DIR, 'contrast-checker.js');
  return runCommand(`node "${contrastScript}" --ci`, 'Contrast validation');
}

function checkComponentBoundary() {
  header('5. Component Boundary Enforcement');

  log('Checking for legacy UI imports in scope flows...', colors.blue);

  try {
    // Check for imports from ../components/ui that aren't in allowlist
    // This is a simplified grep-based check
    const result = execSync(
      `grep -rn --include="*.jsx" --include="*.tsx" "from.*components/ui" apps/ 2>/dev/null | grep -v node_modules | head -20 || true`,
      { cwd: ROOT_DIR, encoding: 'utf-8' }
    );

    if (result.trim()) {
      log('\nFound UI component imports (review for compliance):', colors.yellow);
      const lines = result.trim().split('\n').slice(0, 10);
      lines.forEach(line => log(`  ${line}`, colors.yellow));
      log('\nEnsure only Button, Input, Table are used from design-system.', colors.yellow);
    }

    log('✓ Component boundary check complete', colors.green);
    return true;
  } catch (e) {
    return true;
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('');
  log('╔════════════════════════════════════════════════════════════╗', colors.cyan + colors.bold);
  log('║                                                            ║', colors.cyan + colors.bold);
  log('║         DESIGN SYSTEM CI GATE                              ║', colors.cyan + colors.bold);
  log('║         Enforcement Mode: STRICT (with allowlists)         ║', colors.cyan + colors.bold);
  log('║                                                            ║', colors.cyan + colors.bold);
  log('╚════════════════════════════════════════════════════════════╝', colors.cyan + colors.bold);

  const results = [];

  // Run all design system checks with allowlists
  // Blocking checks - will fail CI on NEW violations
  results.push({ name: 'Hex Colors', passed: checkHexColors(), blocking: true });
  results.push({ name: 'Inline Styles', passed: checkInlineStyles(), blocking: true });
  results.push({ name: 'Raw Tailwind Colors', passed: checkRawTailwindColors(), blocking: true });

  // Non-blocking checks - warn but don't fail CI
  // TODO: Make these blocking after token fixes are complete
  results.push({ name: 'Contrast Safety (WCAG)', passed: checkContrast(), blocking: false });
  results.push({ name: 'Component Boundary', passed: checkComponentBoundary(), blocking: false });

  // Summary
  header('SUMMARY');

  const blockingFailures = results.filter(r => !r.passed && r.blocking);
  const nonBlockingFailures = results.filter(r => !r.passed && !r.blocking);

  results.forEach(r => {
    const icon = r.passed ? '✓' : '✗';
    const color = r.passed ? colors.green : (r.blocking ? colors.red : colors.yellow);
    const suffix = (!r.passed && !r.blocking) ? ' (non-blocking)' : '';
    log(`${icon} ${r.name}${suffix}`, color);
  });

  console.log('');

  if (nonBlockingFailures.length > 0) {
    log(`Note: ${nonBlockingFailures.length} non-blocking check(s) failed.`, colors.yellow);
    log('These will be made blocking after token fixes are complete.\n', colors.yellow);
  }

  if (blockingFailures.length > 0) {
    log('═'.repeat(60), colors.red);
    log(`  ${blockingFailures.length} BLOCKING CHECK(S) FAILED - CI GATE BLOCKED`, colors.red + colors.bold);
    log('═'.repeat(60), colors.red);
    log('\nFix the above issues before merging.', colors.yellow);
    log('Design system rules are non-negotiable during refactor phase.', colors.yellow);
    log('\nAllowlists grandfather existing violations.', colors.blue);
    log('Only NEW violations in non-allowlisted files will block.\n', colors.blue);
    process.exit(1);
  } else {
    log('═'.repeat(60), colors.green);
    log('  ALL BLOCKING CHECKS PASSED - CI GATE OPEN', colors.green + colors.bold);
    log('═'.repeat(60), colors.green);
    console.log('');
    process.exit(0);
  }
}

main().catch(error => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
