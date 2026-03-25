/**
 * ESLint Plugin: Design Token Enforcement
 *
 * Blocks raw style values in apps/** that should use design tokens.
 * Exceptions: packages/design-system/** is allowlisted as source of truth.
 *
 * Rules:
 * - no-hardcoded-colors: Block hex/rgb/hsl color literals
 * - no-hardcoded-spacing: Block raw px/rem for spacing properties
 * - no-hardcoded-typography: Block raw font-size, line-height, letter-spacing
 * - no-hardcoded-radius: Block raw border-radius values
 * - no-hardcoded-shadow: Block raw box-shadow values
 * - no-hardcoded-z-index: Block raw z-index values
 */

'use strict';

// =============================================================================
// PATTERNS
// =============================================================================

const PATTERNS = {
  // Color patterns
  hex: /#(?:[0-9a-fA-F]{3,4}){1,2}\b/,
  rgb: /rgba?\s*\([^)]+\)/i,
  hsl: /hsla?\s*\([^)]+\)/i,

  // Size patterns (px, rem, em values)
  pxValue: /\b\d+(?:\.\d+)?px\b/,
  remValue: /\b\d+(?:\.\d+)?rem\b/,
  emValue: /\b\d+(?:\.\d+)?em\b/,

  // CSS var pattern (allowed)
  cssVar: /var\s*\(\s*--[\w-]+\s*(?:,\s*[^)]+)?\s*\)/,

  // Token reference patterns (allowed)
  tokenRef: /tokens\.(colors|spacing|typography|radius|shadows|transitions)\./,
  designTokenRef: /designTokens\.(colors|spacing|typography|radius|shadows|transitions)\./,
};

// Style properties that should use tokens
const STYLE_PROPERTIES = {
  color: ['color', 'backgroundColor', 'borderColor', 'background', 'fill', 'stroke', 'outlineColor'],
  spacing: ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
            'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
            'gap', 'rowGap', 'columnGap', 'top', 'right', 'bottom', 'left'],
  typography: ['fontSize', 'lineHeight', 'letterSpacing', 'font'],
  radius: ['borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
           'borderBottomLeftRadius', 'borderBottomRightRadius'],
  shadow: ['boxShadow', 'textShadow'],
  elevation: ['zIndex'],
};

// Allowed values that are NOT violations
const ALLOWED_VALUES = [
  'inherit', 'initial', 'unset', 'revert', 'auto', 'none', '0',
  'transparent', 'currentColor', 'currentcolor',
  '100%', '50%', // Common percentages
  'normal', 'bold', // Font weights as keywords
  '1', '-1', // z-index edge cases
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isInAllowedPath(filename) {
  if (!filename) return true;
  // Allow design-system package
  if (filename.includes('packages/design-system')) return true;
  // Allow this gate script itself
  if (filename.includes('design-system-gate')) return true;
  // Allow design-tokens.js (source of truth for JS tokens)
  if (filename.includes('design-tokens.js')) return true;
  // Allow index.css (source of truth for CSS variables)
  if (filename.includes('index.css')) return true;
  // Allow primitives directory (they use CSS vars internally)
  if (filename.includes('components/primitives')) return true;
  return false;
}

function isAllowedValue(value) {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();

  // Check explicit allowed values
  if (ALLOWED_VALUES.includes(trimmed)) return true;

  // Check if it uses CSS var
  if (PATTERNS.cssVar.test(trimmed)) return true;

  // Check if it references tokens object
  if (PATTERNS.tokenRef.test(trimmed)) return true;
  if (PATTERNS.designTokenRef.test(trimmed)) return true;

  return false;
}

function hasColorViolation(value) {
  if (typeof value !== 'string') return false;
  if (isAllowedValue(value)) return false;
  return PATTERNS.hex.test(value) || PATTERNS.rgb.test(value) || PATTERNS.hsl.test(value);
}

function hasRawSizeViolation(value) {
  if (typeof value !== 'string') return false;
  if (isAllowedValue(value)) return false;
  // Allow 0px, 1px for borders
  if (/^[01]px$/.test(value.trim())) return false;
  return PATTERNS.pxValue.test(value) || PATTERNS.remValue.test(value) || PATTERNS.emValue.test(value);
}

function hasZIndexViolation(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const strValue = String(value).trim();
  // Allow 0, 1, -1, auto
  if (['0', '1', '-1', 'auto', 'inherit', 'initial', 'unset'].includes(strValue)) return false;
  // Check for raw numbers
  return /^-?\d+$/.test(strValue) && Math.abs(parseInt(strValue, 10)) > 1;
}

// =============================================================================
// RULES
// =============================================================================

const rules = {
  /**
   * Rule: no-hardcoded-colors
   * Blocks hex, rgb, hsl color literals in style objects
   */
  'no-hardcoded-colors': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded color values. Use design tokens instead.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        hardcodedColor: 'Hardcoded color "{{value}}" detected. Use a design token (e.g., tokens.colors.primary, var(--ak-primary)).',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (isInAllowedPath(filename)) return {};

      return {
        Property(node) {
          // Check style object properties
          if (node.key && node.value) {
            const propName = node.key.name || node.key.value;
            if (STYLE_PROPERTIES.color.includes(propName)) {
              let value = null;
              if (node.value.type === 'Literal') {
                value = node.value.value;
              } else if (node.value.type === 'TemplateLiteral' && node.value.quasis.length === 1) {
                value = node.value.quasis[0].value.raw;
              }

              if (value && hasColorViolation(value)) {
                context.report({
                  node: node.value,
                  messageId: 'hardcodedColor',
                  data: { value },
                });
              }
            }
          }
        },
      };
    },
  },

  /**
   * Rule: no-hardcoded-spacing
   * Blocks raw px/rem values for spacing properties
   */
  'no-hardcoded-spacing': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded spacing values. Use design tokens instead.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        hardcodedSpacing: 'Hardcoded spacing "{{value}}" on "{{prop}}". Use a design token (e.g., tokens.spacing.md, var(--spacing-md)).',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (isInAllowedPath(filename)) return {};

      return {
        Property(node) {
          if (node.key && node.value) {
            const propName = node.key.name || node.key.value;
            if (STYLE_PROPERTIES.spacing.includes(propName)) {
              let value = null;
              if (node.value.type === 'Literal') {
                value = node.value.value;
              } else if (node.value.type === 'TemplateLiteral' && node.value.quasis.length === 1) {
                value = node.value.quasis[0].value.raw;
              }

              if (value && hasRawSizeViolation(value)) {
                context.report({
                  node: node.value,
                  messageId: 'hardcodedSpacing',
                  data: { value, prop: propName },
                });
              }
            }
          }
        },
      };
    },
  },

  /**
   * Rule: no-hardcoded-typography
   * Blocks raw values for font-size, line-height, letter-spacing
   */
  'no-hardcoded-typography': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded typography values. Use design tokens instead.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        hardcodedTypography: 'Hardcoded typography "{{value}}" on "{{prop}}". Use a design token (e.g., tokens.typography.body, var(--text-body)).',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (isInAllowedPath(filename)) return {};

      return {
        Property(node) {
          if (node.key && node.value) {
            const propName = node.key.name || node.key.value;
            if (STYLE_PROPERTIES.typography.includes(propName)) {
              let value = null;
              if (node.value.type === 'Literal') {
                value = node.value.value;
              } else if (node.value.type === 'TemplateLiteral' && node.value.quasis.length === 1) {
                value = node.value.quasis[0].value.raw;
              }

              if (value && hasRawSizeViolation(value)) {
                context.report({
                  node: node.value,
                  messageId: 'hardcodedTypography',
                  data: { value, prop: propName },
                });
              }
            }
          }
        },
      };
    },
  },

  /**
   * Rule: no-hardcoded-radius
   * Blocks raw border-radius values
   */
  'no-hardcoded-radius': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded border-radius values. Use design tokens instead.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        hardcodedRadius: 'Hardcoded radius "{{value}}". Use a design token (e.g., tokens.radius.md, var(--radius-md)).',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (isInAllowedPath(filename)) return {};

      return {
        Property(node) {
          if (node.key && node.value) {
            const propName = node.key.name || node.key.value;
            if (STYLE_PROPERTIES.radius.includes(propName)) {
              let value = null;
              if (node.value.type === 'Literal') {
                value = node.value.value;
              } else if (node.value.type === 'TemplateLiteral' && node.value.quasis.length === 1) {
                value = node.value.quasis[0].value.raw;
              }

              if (value && hasRawSizeViolation(value)) {
                context.report({
                  node: node.value,
                  messageId: 'hardcodedRadius',
                  data: { value },
                });
              }
            }
          }
        },
      };
    },
  },

  /**
   * Rule: no-hardcoded-shadow
   * Blocks raw box-shadow values (should use token)
   */
  'no-hardcoded-shadow': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded shadow values. Use design tokens instead.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        hardcodedShadow: 'Hardcoded shadow detected. Use a design token (e.g., tokens.shadows.card, var(--shadow-card)).',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (isInAllowedPath(filename)) return {};

      return {
        Property(node) {
          if (node.key && node.value) {
            const propName = node.key.name || node.key.value;
            if (STYLE_PROPERTIES.shadow.includes(propName)) {
              let value = null;
              if (node.value.type === 'Literal') {
                value = node.value.value;
              } else if (node.value.type === 'TemplateLiteral' && node.value.quasis.length === 1) {
                value = node.value.quasis[0].value.raw;
              }

              // Check for raw shadow values (contain px and rgba/rgb)
              if (value && !isAllowedValue(value)) {
                if ((PATTERNS.pxValue.test(value) && (PATTERNS.rgb.test(value) || PATTERNS.hex.test(value))) ||
                    value.includes('shadow')) {
                  // Skip if using CSS var
                  if (!PATTERNS.cssVar.test(value)) {
                    context.report({
                      node: node.value,
                      messageId: 'hardcodedShadow',
                    });
                  }
                }
              }
            }
          }
        },
      };
    },
  },

  /**
   * Rule: no-hardcoded-z-index
   * Blocks raw z-index values (except 0, 1, -1, auto)
   */
  'no-hardcoded-z-index': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Disallow hardcoded z-index values. Use design tokens instead.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        hardcodedZIndex: 'Hardcoded z-index "{{value}}". Use a z-index token from the design system.',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (isInAllowedPath(filename)) return {};

      return {
        Property(node) {
          if (node.key && node.value) {
            const propName = node.key.name || node.key.value;
            if (STYLE_PROPERTIES.elevation.includes(propName)) {
              let value = null;
              if (node.value.type === 'Literal') {
                value = node.value.value;
              }

              if (hasZIndexViolation(value)) {
                context.report({
                  node: node.value,
                  messageId: 'hardcodedZIndex',
                  data: { value },
                });
              }
            }
          }
        },
      };
    },
  },
};

// =============================================================================
// PLUGIN EXPORT
// =============================================================================

module.exports = {
  rules,
  configs: {
    recommended: {
      plugins: ['design-tokens'],
      rules: {
        'design-tokens/no-hardcoded-colors': 'error',
        'design-tokens/no-hardcoded-spacing': 'error',
        'design-tokens/no-hardcoded-typography': 'error',
        'design-tokens/no-hardcoded-radius': 'error',
        'design-tokens/no-hardcoded-shadow': 'error',
        'design-tokens/no-hardcoded-z-index': 'error',
      },
    },
    // Strict mode - all rules as errors (for CI)
    strict: {
      plugins: ['design-tokens'],
      rules: {
        'design-tokens/no-hardcoded-colors': 'error',
        'design-tokens/no-hardcoded-spacing': 'error',
        'design-tokens/no-hardcoded-typography': 'error',
        'design-tokens/no-hardcoded-radius': 'error',
        'design-tokens/no-hardcoded-shadow': 'error',
        'design-tokens/no-hardcoded-z-index': 'error',
      },
    },
  },
};
