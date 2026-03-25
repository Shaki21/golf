#!/usr/bin/env node

/**
 * Contrast Safety Checker
 *
 * Validates text-token on surface-token contrast ratios.
 * Fails if contrast < 4.5:1 for normal text (WCAG AA).
 *
 * Extensible: Add more token pairs to CONTRAST_PAIRS array.
 *
 * Usage:
 *   node scripts/design-system-gate/contrast-checker.js
 *   node scripts/design-system-gate/contrast-checker.js --verbose
 *   node scripts/design-system-gate/contrast-checker.js --ci (exit code 1 on failure)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

// WCAG Contrast Requirements
const CONTRAST_REQUIREMENTS = {
  normalText: 4.5,    // WCAG AA for normal text (< 18pt or < 14pt bold)
  largeText: 3.0,     // WCAG AA for large text (>= 18pt or >= 14pt bold)
  uiComponents: 3.0,  // WCAG AA for UI components and graphical objects
};

// Design token colors (source of truth)
// SYNCED WITH: packages/design-system/tokens/tokens.css
// Last updated: 2026-01-02 - WCAG AA compliant
const TOKEN_COLORS = {
  // Brand Colors - Premium Light (Forest Green)
  '--ak-primary': '#1B4D3E',
  '--ak-primary-light': '#2A6B55',
  '--ak-primary-dark': '#133629',
  '--ak-ink': '#111827',
  '--ak-snow': '#FAFBFC',
  '--ak-surface': '#F5F7F9',
  '--ak-gold': '#996F09',        // WCAG AA: 4.53:1 on white
  '--ak-gold-light': '#DAA520',

  // Legacy aliases (backwards compatible)
  '--ak-forest': '#1B4D3E',
  '--ak-forest-light': '#2A6B55',
  '--ak-foam': '#FAFBFC',
  '--ak-ivory': '#F5F7F9',

  // Semantic Colors (WCAG AA compliant)
  '--ak-success': '#05875F',     // WCAG AA: 4.53:1 on white
  '--ak-success-light': '#10B981',
  '--ak-warning': '#B16105',     // WCAG AA: 4.58:1 on white
  '--ak-warning-light': '#F59E0B',
  '--ak-error': '#DC2626',       // 4.83:1 on white
  '--ak-error-light': '#EF4444',
  '--ak-info': '#0284C7',
  '--ak-info-light': '#0EA5E9',

  // Neutrals
  '--ak-charcoal': '#111827',
  '--ak-steel': '#6B7280',       // 4.83:1 on white
  '--ak-mist': '#E5E7EB',
  '--ak-cloud': '#F5F7F9',
  '--ak-white': '#FFFFFF',
};

// Define text/surface pairs to check
// Format: { text: token, surface: token, type: 'normal' | 'large' | 'ui' }
const CONTRAST_PAIRS = [
  // Primary text on backgrounds
  { text: '--ak-charcoal', surface: '--ak-white', type: 'normal', description: 'Primary text on white' },
  { text: '--ak-charcoal', surface: '--ak-snow', type: 'normal', description: 'Primary text on snow background' },
  { text: '--ak-charcoal', surface: '--ak-surface', type: 'normal', description: 'Primary text on surface' },
  { text: '--ak-charcoal', surface: '--ak-cloud', type: 'normal', description: 'Primary text on cloud' },
  { text: '--ak-charcoal', surface: '--ak-mist', type: 'normal', description: 'Primary text on mist' },

  // Secondary text on backgrounds
  { text: '--ak-steel', surface: '--ak-white', type: 'normal', description: 'Secondary text on white' },
  { text: '--ak-steel', surface: '--ak-snow', type: 'normal', description: 'Secondary text on snow' },
  { text: '--ak-steel', surface: '--ak-surface', type: 'normal', description: 'Secondary text on surface' },

  // White text on dark backgrounds
  { text: '--ak-white', surface: '--ak-primary', type: 'normal', description: 'White text on primary' },
  { text: '--ak-white', surface: '--ak-primary-light', type: 'normal', description: 'White text on primary-light' },
  { text: '--ak-white', surface: '--ak-charcoal', type: 'normal', description: 'White text on charcoal' },

  // Semantic colors on white
  { text: '--ak-success', surface: '--ak-white', type: 'normal', description: 'Success text on white' },
  { text: '--ak-warning', surface: '--ak-white', type: 'normal', description: 'Warning text on white' },
  { text: '--ak-error', surface: '--ak-white', type: 'normal', description: 'Error text on white' },
  { text: '--ak-gold', surface: '--ak-white', type: 'normal', description: 'Gold accent on white' },

  // Large text (headers) - lower threshold
  { text: '--ak-primary', surface: '--ak-white', type: 'large', description: 'Primary header on white' },
  { text: '--ak-primary', surface: '--ak-snow', type: 'large', description: 'Primary header on snow' },

  // UI Components
  { text: '--ak-primary', surface: '--ak-mist', type: 'ui', description: 'Primary button border on mist' },
  { text: '--ak-gold', surface: '--ak-charcoal', type: 'ui', description: 'Gold accent on charcoal' },
];

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance (WCAG formula)
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function relativeLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(channel => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(hexToRgb(color1));
  const l2 = relativeLuminance(hexToRgb(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get the required contrast ratio for a given type
 */
function getRequiredContrast(type) {
  switch (type) {
    case 'large':
      return CONTRAST_REQUIREMENTS.largeText;
    case 'ui':
      return CONTRAST_REQUIREMENTS.uiComponents;
    default:
      return CONTRAST_REQUIREMENTS.normalText;
  }
}

// =============================================================================
// CHECKER LOGIC
// =============================================================================

function checkContrast(pair, verbose = false) {
  const textColor = TOKEN_COLORS[pair.text];
  const surfaceColor = TOKEN_COLORS[pair.surface];

  if (!textColor) {
    return { pass: false, error: `Unknown text token: ${pair.text}` };
  }
  if (!surfaceColor) {
    return { pass: false, error: `Unknown surface token: ${pair.surface}` };
  }

  const ratio = contrastRatio(textColor, surfaceColor);
  const required = getRequiredContrast(pair.type);
  const pass = ratio >= required;

  return {
    pass,
    ratio: ratio.toFixed(2),
    required,
    textToken: pair.text,
    textColor,
    surfaceToken: pair.surface,
    surfaceColor,
    type: pair.type,
    description: pair.description,
  };
}

function runAllChecks(verbose = false) {
  const results = [];
  let failures = 0;

  console.log('\n========================================');
  console.log('  CONTRAST SAFETY CHECK');
  console.log('  WCAG AA Compliance Validation');
  console.log('========================================\n');

  for (const pair of CONTRAST_PAIRS) {
    const result = checkContrast(pair, verbose);
    results.push(result);

    if (result.error) {
      console.log(`[ERROR] ${result.error}`);
      failures++;
      continue;
    }

    const status = result.pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    const ratioStr = `${result.ratio}:1`;
    const requiredStr = `${result.required}:1`;

    if (!result.pass || verbose) {
      console.log(`[${status}] ${result.description}`);
      console.log(`        Text:    ${result.textToken} (${result.textColor})`);
      console.log(`        Surface: ${result.surfaceToken} (${result.surfaceColor})`);
      console.log(`        Ratio:   ${ratioStr} (required: ${requiredStr})`);
      console.log('');
    }

    if (!result.pass) {
      failures++;
    }
  }

  // Summary
  console.log('----------------------------------------');
  const totalChecks = CONTRAST_PAIRS.length;
  const passedChecks = totalChecks - failures;

  if (failures === 0) {
    console.log(`\x1b[32m✓ All ${totalChecks} contrast checks passed!\x1b[0m`);
  } else {
    console.log(`\x1b[31m✗ ${failures} of ${totalChecks} contrast checks failed!\x1b[0m`);
    console.log('\x1b[33mFix these token combinations or update design system.\x1b[0m');
  }
  console.log('');

  return { results, failures, total: totalChecks };
}

// =============================================================================
// CLI
// =============================================================================

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const ciMode = args.includes('--ci');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
Contrast Safety Checker

Usage:
  node contrast-checker.js [options]

Options:
  --verbose, -v   Show all results (not just failures)
  --ci            Exit with code 1 on failures (for CI integration)
  --help, -h      Show this help message

The checker validates text-on-surface contrast ratios against WCAG AA requirements:
  - Normal text: 4.5:1
  - Large text: 3.0:1
  - UI components: 3.0:1
    `);
    process.exit(0);
  }

  const { failures } = runAllChecks(verbose);

  if (ciMode && failures > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  checkContrast,
  runAllChecks,
  contrastRatio,
  TOKEN_COLORS,
  CONTRAST_PAIRS,
  CONTRAST_REQUIREMENTS,
};
