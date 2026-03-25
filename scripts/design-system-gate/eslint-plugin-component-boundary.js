/**
 * ESLint Plugin: Component Boundary Enforcement
 *
 * Enforces that scope flows only import allowed UI components from the design system.
 * Blocks imports of legacy UI components.
 *
 * Allowlist (from packages/design-system):
 * - Button
 * - Input
 * - Table
 */

'use strict';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Allowed components from design system
const ALLOWED_COMPONENTS = ['Button', 'Input', 'Table'];

// Paths that define "scope flows" - these are strictly enforced
// For the refactor phase, we check all of apps/**
const SCOPE_FLOW_PATTERNS = [
  /apps\/web\/src\//,
  /apps\/api\//,
];

// Design system import paths (allowed sources)
const DESIGN_SYSTEM_PATHS = [
  '@ak-golf/design-system',
  'packages/design-system',
  '../../packages/design-system',
  '../../../packages/design-system',
];

// Legacy component patterns to block
const LEGACY_COMPONENT_PATTERNS = [
  // Block imports from components/ui that aren't in design system
  /\.\.\/components\/ui\//,
  /\.\.\/\.\.\/components\/ui\//,
  /src\/components\/ui\//,
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isInScopeFlow(filename) {
  if (!filename) return false;
  return SCOPE_FLOW_PATTERNS.some(pattern => pattern.test(filename));
}

function isDesignSystemPath(importPath) {
  return DESIGN_SYSTEM_PATHS.some(path => importPath.includes(path));
}

function isLegacyComponentPath(importPath) {
  return LEGACY_COMPONENT_PATTERNS.some(pattern => pattern.test(importPath));
}

function extractImportedComponents(specifiers) {
  return specifiers
    .filter(s => s.type === 'ImportSpecifier' || s.type === 'ImportDefaultSpecifier')
    .map(s => s.imported?.name || s.local?.name)
    .filter(Boolean);
}

// =============================================================================
// RULES
// =============================================================================

const rules = {
  /**
   * Rule: enforce-design-system-imports
   * In scope flows, only allow UI components from the design system allowlist
   */
  'enforce-design-system-imports': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Enforce that scope flows only import allowed UI components from design system.',
        category: 'Design System',
        recommended: true,
      },
      messages: {
        blockedLegacyImport: 'Import from legacy UI path "{{path}}" is blocked. Use components from packages/design-system instead.',
        blockedComponent: 'Component "{{component}}" is not in the design system allowlist. Allowed: {{allowed}}.',
        useDesignSystem: 'Import UI components from packages/design-system, not from local components.',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();

      // Only enforce in scope flows
      if (!isInScopeFlow(filename)) return {};

      // Skip design-system package itself
      if (filename.includes('packages/design-system')) return {};

      return {
        ImportDeclaration(node) {
          const importPath = node.source.value;

          // Check for legacy component imports
          if (isLegacyComponentPath(importPath)) {
            const importedComponents = extractImportedComponents(node.specifiers);

            // If importing UI components from legacy path, check against allowlist
            importedComponents.forEach(component => {
              // Skip non-UI imports (hooks, utils, etc.)
              const isUIComponent = /^[A-Z]/.test(component);
              if (!isUIComponent) return;

              if (!ALLOWED_COMPONENTS.includes(component)) {
                context.report({
                  node,
                  messageId: 'blockedComponent',
                  data: {
                    component,
                    allowed: ALLOWED_COMPONENTS.join(', '),
                  },
                });
              }
            });
          }
        },
      };
    },
  },

  /**
   * Rule: no-inline-ui-components
   * Block creation of ad-hoc UI components that should be in design system
   */
  'no-inline-ui-components': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Discourage inline UI component definitions that duplicate design system.',
        category: 'Design System',
        recommended: false, // Warning only for now
      },
      messages: {
        inlineComponent: 'Component "{{name}}" appears to duplicate design system functionality. Consider using the design system component.',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();

      if (!isInScopeFlow(filename)) return {};
      if (filename.includes('packages/design-system')) return {};

      // Track component names that suggest UI primitives
      const UI_PRIMITIVE_NAMES = ['Button', 'Input', 'Card', 'Modal', 'Dialog', 'Table', 'Badge', 'Avatar'];

      return {
        FunctionDeclaration(node) {
          if (node.id && UI_PRIMITIVE_NAMES.includes(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'inlineComponent',
              data: { name: node.id.name },
            });
          }
        },
        VariableDeclarator(node) {
          if (node.id && node.id.type === 'Identifier' && UI_PRIMITIVE_NAMES.includes(node.id.name)) {
            // Check if it's a component (arrow function returning JSX)
            if (node.init && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')) {
              context.report({
                node: node.id,
                messageId: 'inlineComponent',
                data: { name: node.id.name },
              });
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
      plugins: ['component-boundary'],
      rules: {
        'component-boundary/enforce-design-system-imports': 'error',
        'component-boundary/no-inline-ui-components': 'warn',
      },
    },
    strict: {
      plugins: ['component-boundary'],
      rules: {
        'component-boundary/enforce-design-system-imports': 'error',
        'component-boundary/no-inline-ui-components': 'error',
      },
    },
  },
};
