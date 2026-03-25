/**
 * Stylelint Configuration: Design Token Enforcement for CSS
 *
 * Blocks raw style values in CSS files within apps/**
 * Exceptions: packages/design-system/** is allowlisted
 */

'use strict';

module.exports = {
  // Extend recommended config
  extends: ['stylelint-config-standard'],

  // Custom rules
  rules: {
    // =========================================================================
    // COLOR ENFORCEMENT
    // =========================================================================

    // Block hardcoded colors - must use CSS custom properties
    'color-no-hex': true,

    // Named colors are also blocked (except common ones)
    'color-named': 'never',

    // Block rgb/hsl functions (use tokens)
    'function-disallowed-list': [
      'rgb',
      'rgba',
      'hsl',
      'hsla',
      // Allow var() and calc()
    ],

    // =========================================================================
    // VALUE ENFORCEMENT
    // =========================================================================

    // Limit allowed units - guide toward tokens
    'unit-allowed-list': [
      'px',      // Still needed for tokens.css definitions
      'rem',
      'em',
      '%',
      'vh',
      'vw',
      'vmin',
      'vmax',
      'fr',
      's',
      'ms',
      'deg',
    ],

    // =========================================================================
    // CUSTOM PROPERTY ENFORCEMENT
    // =========================================================================

    // Require custom properties for certain values
    // This regex pattern ensures var(--...) is used for color properties
    'declaration-property-value-allowed-list': {
      // Colors must use CSS variables or allowed keywords
      'color': ['/^var\\(--/', 'inherit', 'initial', 'unset', 'currentColor', 'transparent'],
      'background-color': ['/^var\\(--/', 'inherit', 'initial', 'unset', 'transparent', 'none'],
      'border-color': ['/^var\\(--/', 'inherit', 'initial', 'unset', 'transparent', 'currentColor'],
      'outline-color': ['/^var\\(--/', 'inherit', 'initial', 'unset', 'currentColor'],

      // Box shadows must use CSS variables
      'box-shadow': ['/^var\\(--/', 'none', 'inherit', 'initial', 'unset'],

      // Z-index enforcement (only allow tokens or small values)
      'z-index': ['/^var\\(--/', 'auto', 'inherit', 'initial', 'unset', '-1', '0', '1'],
    },

    // =========================================================================
    // SELECTOR ENFORCEMENT
    // =========================================================================

    // Discourage overly specific selectors
    'selector-max-specificity': '0,4,0',

    // Discourage ID selectors (use classes)
    'selector-max-id': 0,

    // =========================================================================
    // FORMATTING (inherit from standard)
    // =========================================================================

    // Allow empty lines between rule blocks
    'rule-empty-line-before': ['always', {
      except: ['first-nested'],
      ignore: ['after-comment'],
    }],

    // Require newline after opening brace
    'block-opening-brace-newline-after': 'always',
  },

  // Override rules for design-system package (allowlist)
  overrides: [
    {
      files: ['**/packages/design-system/**/*.css'],
      rules: {
        // Allow raw values in design system (source of truth)
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-value-allowed-list': null,
      },
    },
    {
      // Also allow in design-system-gate scripts
      files: ['**/scripts/design-system-gate/**/*.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-value-allowed-list': null,
      },
    },
    {
      // Allow in index.css (source of truth for CSS variables)
      files: ['**/apps/web/src/index.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-value-allowed-list': null,
      },
    },
  ],

  // Ignore patterns
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/packages/design-system/**', // Handled by override, but also ignore
  ],
};
