#!/usr/bin/env node

/**
 * AK Golf Color Lint Script
 *
 * Scans source files for disallowed color patterns:
 * - Raw hex values in code
 * - Legacy color class names
 * - Arbitrary Tailwind color values
 * - Direct primitive color imports
 *
 * Usage:
 *   node scripts/lint-colors.js [path]
 *   pnpm lint:colors
 *
 * Options:
 *   --fix    Suggest replacements (no auto-fix yet)
 *   --quiet  Only show errors, no warnings
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // File extensions to scan
  extensions: ['.tsx', '.jsx', '.ts', '.js'],

  // Directories to skip
  ignoreDirs: ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'],

  // Files to skip (relative patterns)
  ignorePatterns: [
    '**/colors.ts',        // Our token definition file
    '**/tailwind.config.*', // Tailwind config
    '**/*.test.*',          // Test files
    '**/*.spec.*',          // Spec files
    '**/scripts/**',        // Scripts
  ],

  // Known hex values and their semantic replacements
  hexReplacements: {
    '#1B4D3E': 'ak-brand-primary',
    '#2A6B55': 'ak-brand-primary-hover',
    '#133629': 'ak-brand-primary-active',
    '#B8860B': 'ak-achievement-gold',
    '#DAA520': 'ak-achievement-gold-light',
    '#059669': 'ak-status-success',
    '#10B981': 'ak-status-success-light',
    '#D97706': 'ak-status-warning',
    '#F59E0B': 'ak-status-warning-light',
    '#DC2626': 'ak-status-error',
    '#EF4444': 'ak-status-error-light',
    '#0284C7': 'ak-status-info',
    '#0EA5E9': 'ak-status-info-light',
    '#FAFBFC': 'ak-surface-base',
    '#FFFFFF': 'ak-surface-card',
    '#F5F7F9': 'ak-surface-elevated',
    '#EEF1F4': 'ak-surface-subtle',
    '#E5E7EB': 'ak-border / ak-neutral-divider',
    '#D1D5DB': 'ak-border-strong / ak-neutral-accent',
    '#111827': 'ak-text-primary',
    '#374151': 'ak-text-secondary',
    '#6B7280': 'ak-text-tertiary',
    '#9CA3AF': 'ak-text-muted',
    '#7D8590': 'ak-text-muted-mobile',
  },

  // Legacy class patterns to flag
  legacyPatterns: [
    /\b(bg|text|border|ring)-primary-\d+\b/g,
    /\b(bg|text|border|ring)-forest(-\w+)?\b/g,
    /\b(bg|text|border|ring)-gold\b/g,
    /\b(bg|text|border|ring)-success(-\w+)?\b/g,
    /\b(bg|text|border|ring)-warning(-\w+)?\b/g,
    /\b(bg|text|border|ring)-error(-\w+)?\b/g,
    /\b(bg|text|border|ring)-info(-\w+)?\b/g,
    /\b(bg|text|border|ring)-ink\b/g,
    /\b(bg|text|border|ring)-snow\b/g,
  ],
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

// Results tracking
let errors = 0;
let warnings = 0;
let filesScanned = 0;

/**
 * Check if a file should be ignored
 */
function shouldIgnore(filePath) {
  // Check ignore patterns
  for (const pattern of CONFIG.ignorePatterns) {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    if (regex.test(filePath)) {
      return true;
    }
  }

  // Check .colorlintignore file (look relative to script location first, then cwd)
  const scriptDir = path.dirname(__filename);
  const packageRoot = path.resolve(scriptDir, '..');
  let ignoreFile = path.join(packageRoot, '.colorlintignore');
  if (!fs.existsSync(ignoreFile)) {
    ignoreFile = path.join(process.cwd(), '.colorlintignore');
  }
  if (fs.existsSync(ignoreFile)) {
    const ignoreList = fs.readFileSync(ignoreFile, 'utf-8')
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'));

    for (const ignorePath of ignoreList) {
      if (filePath.includes(ignorePath.trim())) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Scan a file for color violations
 */
function scanFile(filePath) {
  if (shouldIgnore(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, lineIndex) => {
    const lineNum = lineIndex + 1;

    // Skip comments
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
      return;
    }

    // Skip lines with disable comment
    if (line.includes('lint-colors-disable') || line.includes('no-raw-colors')) {
      return;
    }

    // Check for raw hex values (6-digit)
    const hexRegex = /#[0-9A-Fa-f]{6}\b/g;
    let match;
    while ((match = hexRegex.exec(line)) !== null) {
      const hex = match[0].toUpperCase();
      const replacement = CONFIG.hexReplacements[hex];

      issues.push({
        type: 'error',
        line: lineNum,
        column: match.index + 1,
        message: `Raw hex value "${hex}"`,
        suggestion: replacement ? `Use: ${replacement}` : 'Use semantic token from colors.ts',
      });
    }

    // Check for arbitrary Tailwind color values
    const arbitraryRegex = /(bg|text|border|ring|fill|stroke)-\[#[0-9A-Fa-f]+\]/g;
    while ((match = arbitraryRegex.exec(line)) !== null) {
      issues.push({
        type: 'error',
        line: lineNum,
        column: match.index + 1,
        message: `Arbitrary color value "${match[0]}"`,
        suggestion: 'Use ak-* semantic class instead',
      });
    }

    // Check for legacy color patterns (but not inside CSS variables)
    for (const pattern of CONFIG.legacyPatterns) {
      pattern.lastIndex = 0; // Reset regex state
      while ((match = pattern.exec(line)) !== null) {
        // Skip if this match is inside a var(--...) CSS variable reference
        const beforeMatch = line.substring(0, match.index);
        const lastVarOpen = beforeMatch.lastIndexOf('var(--');
        const lastVarClose = beforeMatch.lastIndexOf(')');
        if (lastVarOpen !== -1 && lastVarOpen > lastVarClose) {
          continue; // Inside a CSS variable, skip this match
        }

        issues.push({
          type: 'warning',
          line: lineNum,
          column: match.index + 1,
          message: `Legacy color class "${match[0]}"`,
          suggestion: 'Migrate to ak-* semantic class',
        });
      }
    }

    // Check for primitive color imports
    if (line.includes('primitiveColors') && !filePath.includes('colors.ts')) {
      issues.push({
        type: 'warning',
        line: lineNum,
        column: line.indexOf('primitiveColors') + 1,
        message: 'Direct import of primitiveColors',
        suggestion: 'Import semanticColors instead',
      });
    }
  });

  if (issues.length > 0) {
    console.log(`\n${colors.cyan}${filePath}${colors.reset}`);

    issues.forEach(issue => {
      const color = issue.type === 'error' ? colors.red : colors.yellow;
      const symbol = issue.type === 'error' ? '✖' : '⚠';

      console.log(
        `  ${color}${symbol}${colors.reset} ` +
        `${colors.dim}${issue.line}:${issue.column}${colors.reset}  ` +
        `${issue.message}  ` +
        `${colors.dim}→ ${issue.suggestion}${colors.reset}`
      );

      if (issue.type === 'error') {
        errors++;
      } else {
        warnings++;
      }
    });
  }

  filesScanned++;
}

/**
 * Recursively scan a directory
 */
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!CONFIG.ignoreDirs.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (CONFIG.extensions.includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  const targetPath = args.find(arg => !arg.startsWith('--')) || '.';
  const quiet = args.includes('--quiet');

  console.log(`${colors.bold}AK Golf Color Lint${colors.reset}`);
  console.log(`${colors.dim}Scanning for color violations...${colors.reset}\n`);

  const startTime = Date.now();

  // Resolve target path
  const resolvedPath = path.resolve(process.cwd(), targetPath);

  if (fs.statSync(resolvedPath).isDirectory()) {
    scanDirectory(resolvedPath);
  } else {
    scanFile(resolvedPath);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n' + '─'.repeat(50));

  if (errors === 0 && warnings === 0) {
    console.log(`${colors.green}✓ No color violations found${colors.reset}`);
  } else {
    if (errors > 0) {
      console.log(`${colors.red}✖ ${errors} error${errors !== 1 ? 's' : ''}${colors.reset}`);
    }
    if (warnings > 0 && !quiet) {
      console.log(`${colors.yellow}⚠ ${warnings} warning${warnings !== 1 ? 's' : ''}${colors.reset}`);
    }
  }

  console.log(`${colors.dim}Scanned ${filesScanned} files in ${duration}s${colors.reset}\n`);

  // Exit with error code if there are errors
  if (errors > 0) {
    process.exit(1);
  }
}

main();
