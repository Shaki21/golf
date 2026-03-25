/**
 * AK Golf Premium Light - Color Token System
 * Version: 1.0.0
 *
 * This file defines the complete color system using:
 * 1. Primitive colors (raw hex values grouped by family)
 * 2. Semantic colors (intent-based tokens for UI usage)
 *
 * USAGE RULES:
 * - Never import primitiveColors directly in components
 * - Always use semanticColors or Tailwind classes (text-ak-*, bg-ak-*, etc.)
 * - See COLOR_USAGE_RULES.md for Gold discipline and other constraints
 */

// =============================================================================
// PRIMITIVE COLORS
// Raw hex values grouped by color family. These should NOT be used directly
// in components - use semantic tokens instead.
// =============================================================================

export const primitiveColors = {
  // Brand Primary - Deep Forest Green
  primary: {
    DEFAULT: '#1B4D3E',
    light: '#2A6B55',
    dark: '#133629',
    50: '#E8F5F1',
    100: '#D1EBE3',
    200: '#A3D7C7',
    300: '#75C3AB',
    400: '#47AF8F',
    500: '#1B4D3E',
    600: '#185A48',
    700: '#1B4D3E',
    800: '#133629',
    900: '#0D241B',
  },

  // Brand Accent - Premium Gold (RESTRICTED - see usage rules)
  // WCAG AA compliant: 4.53:1 contrast on white
  gold: {
    DEFAULT: '#996F09',
    light: '#DAA520',
    dark: '#7A5907',
    muted: 'rgba(153, 111, 9, 0.1)',
  },

  // Badge Tiers - Used for gamification badge backgrounds
  tier: {
    standard: '#64748B',    // Slate gray - base tier
    standardBorder: '#475569',
    bronze: '#CD7F32',      // Classic bronze
    bronzeBorder: '#B86F2C',
    silver: '#9CA3AF',      // Silver gray
    silverBorder: '#6B7280',
    gold: '#F59E0B',        // Bright gold (different from brand gold)
    goldBorder: '#D97706',
    platinum: '#8B5CF6',    // Premium purple
    platinumBorder: '#7C3AED',
  },

  // Session/Training Types - Color coding for different training activities
  session: {
    teknikk: '#8B6E9D',     // T - Purple (technique drills)
    golfslag: '#2A6B55',    // G - Forest Green Light (golf shots) - aligned with brand
    spill: '#1B4D3E',       // S - Forest Green (playing sessions) - brand primary
    kompetanse: '#DC2626',  // K - Red (competition/skills) - aligned with error
    fysisk: '#EA580C',      // Fs - Orange (physical/strength)
    funksjonell: '#0D9488', // Fu - Teal (functional training)
    hjemme: '#6B7280',      // L1-2 - Gray (home practice)
    test: '#B8860B',        // Test - Brand Gold (testing sessions)
  },

  // Status Colors
  success: {
    // WCAG AA compliant: 4.53:1 contrast on white
    DEFAULT: '#05875F',
    light: '#10B981',
    dark: '#046B4B',
    muted: 'rgba(5, 135, 95, 0.1)',
  },

  warning: {
    // WCAG AA compliant: 4.58:1 contrast on white
    DEFAULT: '#B16105',
    light: '#F59E0B',
    dark: '#8B4D04',
    muted: 'rgba(177, 97, 5, 0.1)',
  },

  error: {
    DEFAULT: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
    muted: 'rgba(220, 38, 38, 0.08)',
  },

  info: {
    DEFAULT: '#0284C7',
    light: '#0EA5E9',
    dark: '#0369A1',
    muted: 'rgba(2, 132, 199, 0.1)',
  },

  // Neutral Grays
  neutral: {
    0: '#FFFFFF',
    50: '#FAFBFC',
    100: '#F5F7F9',
    150: '#EEF1F4',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    450: '#7D8590', // textMutedMobile - slightly darker than 400
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// =============================================================================
// SEMANTIC COLORS
// Intent-based tokens for UI usage. These map to specific use cases and should
// be the ONLY colors imported/used in components.
// =============================================================================

export const semanticColors = {
  // -------------------------------------------------------------------------
  // BRAND
  // -------------------------------------------------------------------------
  brand: {
    primary: primitiveColors.primary.DEFAULT,
    primaryHover: primitiveColors.primary.light,
    primaryActive: primitiveColors.primary.dark,
    primaryMuted: 'rgba(27, 77, 62, 0.08)',
    primarySoft: 'rgba(27, 77, 62, 0.12)',
  },

  // -------------------------------------------------------------------------
  // SURFACES (Backgrounds)
  // -------------------------------------------------------------------------
  surface: {
    base: primitiveColors.neutral[50],      // App background
    card: primitiveColors.neutral[0],       // Card/panel background
    elevated: primitiveColors.neutral[100], // Elevated surfaces (modals, dropdowns)
    subtle: primitiveColors.neutral[150],   // Subtle background sections
    muted: primitiveColors.neutral[200],    // Muted/disabled backgrounds
    overlay: 'rgba(0, 0, 0, 0.5)',          // Modal overlays
  },

  // -------------------------------------------------------------------------
  // TEXT
  // -------------------------------------------------------------------------
  text: {
    primary: primitiveColors.neutral[900],   // Main text (#111827)
    secondary: primitiveColors.neutral[700], // Secondary text (#374151)
    tertiary: primitiveColors.neutral[500],  // Tertiary/helper text (#6B7280)
    muted: primitiveColors.neutral[400],     // Muted/placeholder text (#9CA3AF)
    mutedMobile: primitiveColors.neutral[450], // Mobile-optimized muted (slightly darker)
    disabled: primitiveColors.neutral[300],  // Disabled text
    inverse: primitiveColors.neutral[0],     // Text on dark backgrounds
    brand: primitiveColors.primary.DEFAULT,  // Brand-colored text
    link: primitiveColors.primary.DEFAULT,   // Link text
    linkHover: primitiveColors.primary.light, // Link hover state
  },

  // -------------------------------------------------------------------------
  // BORDERS & DIVIDERS
  // -------------------------------------------------------------------------
  border: {
    default: primitiveColors.neutral[200],   // Standard borders (#E5E7EB)
    strong: primitiveColors.neutral[300],    // Emphasized borders (#D1D5DB)
    muted: primitiveColors.neutral[150],     // Subtle borders
    focus: primitiveColors.primary.DEFAULT,  // Focus ring color
    brand: 'rgba(27, 77, 62, 0.2)',          // Primary-tinted border
  },

  // Neutral accents for dividers and inactive UI
  neutral: {
    accent: primitiveColors.neutral[300],    // Mid-gray for inactive UI (#D1D5DB)
    divider: primitiveColors.neutral[200],   // Divider lines (#E5E7EB)
    dividerStrong: primitiveColors.neutral[300], // Strong dividers
    disabled: primitiveColors.neutral[200],  // Disabled state backgrounds
  },

  // -------------------------------------------------------------------------
  // STATUS (Feedback Colors)
  // -------------------------------------------------------------------------
  status: {
    success: primitiveColors.success.DEFAULT,
    successLight: primitiveColors.success.light,
    successMuted: primitiveColors.success.muted,

    warning: primitiveColors.warning.DEFAULT,
    warningLight: primitiveColors.warning.light,
    warningMuted: primitiveColors.warning.muted,

    error: primitiveColors.error.DEFAULT,
    errorLight: primitiveColors.error.light,
    errorMuted: primitiveColors.error.muted,

    info: primitiveColors.info.DEFAULT,
    infoLight: primitiveColors.info.light,
    infoMuted: primitiveColors.info.muted,
  },

  // -------------------------------------------------------------------------
  // ACHIEVEMENT (Gold - RESTRICTED USAGE)
  // See COLOR_USAGE_RULES.md for strict usage guidelines
  // -------------------------------------------------------------------------
  achievement: {
    gold: primitiveColors.gold.DEFAULT,
    goldLight: primitiveColors.gold.light,
    goldMuted: primitiveColors.gold.muted,
    goldBorder: primitiveColors.gold.DEFAULT,
  },

  // -------------------------------------------------------------------------
  // BADGE TIERS
  // Used for gamification badge backgrounds by tier level
  // -------------------------------------------------------------------------
  tier: {
    // Standard tier (base level)
    standard: primitiveColors.tier.standard,
    standardBorder: primitiveColors.tier.standardBorder,
    standardText: primitiveColors.neutral[0],

    // Bronze tier
    bronze: primitiveColors.tier.bronze,
    bronzeBorder: primitiveColors.tier.bronzeBorder,
    bronzeText: primitiveColors.neutral[0],

    // Silver tier
    silver: primitiveColors.tier.silver,
    silverBorder: primitiveColors.tier.silverBorder,
    silverText: primitiveColors.neutral[0],

    // Gold tier (bright gold, not brand gold)
    gold: primitiveColors.tier.gold,
    goldBorder: primitiveColors.tier.goldBorder,
    goldText: primitiveColors.neutral[0],

    // Platinum tier (premium)
    platinum: primitiveColors.tier.platinum,
    platinumBorder: primitiveColors.tier.platinumBorder,
    platinumText: primitiveColors.neutral[0],

    // Locked/inactive state
    locked: primitiveColors.neutral[100],
    lockedBorder: primitiveColors.neutral[200],
    lockedText: primitiveColors.neutral[400],
    lockedIcon: primitiveColors.neutral[400],
  },

  // -------------------------------------------------------------------------
  // SESSION/TRAINING TYPES
  // Color coding for different training activities and session categories
  // -------------------------------------------------------------------------
  session: {
    // Teknikk (T) - Purple - Technique drills and skill work
    teknikk: primitiveColors.session.teknikk,
    teknikkMuted: 'rgba(139, 110, 157, 0.15)',

    // Golfslag (G) - Forest Green Light - Golf shots practice
    golfslag: primitiveColors.session.golfslag,
    golfslagMuted: 'rgba(42, 107, 85, 0.15)',

    // Spill (S) - Forest Green Primary - Playing sessions/rounds
    spill: primitiveColors.session.spill,
    spillMuted: 'rgba(27, 77, 62, 0.15)',

    // Kompetanse (K) - Red - Competition and skills testing
    kompetanse: primitiveColors.session.kompetanse,
    kompetanseMuted: 'rgba(220, 38, 38, 0.15)',

    // Fysisk (Fs) - Orange - Physical training and strength
    fysisk: primitiveColors.session.fysisk,
    fysiskMuted: 'rgba(234, 88, 12, 0.15)',

    // Funksjonell (Fu) - Teal - Functional training
    funksjonell: primitiveColors.session.funksjonell,
    funksjonellMuted: 'rgba(13, 148, 136, 0.15)',

    // Hjemme (L1-2) - Gray - Home practice
    hjemme: primitiveColors.session.hjemme,
    hjemmeMuted: 'rgba(107, 114, 128, 0.15)',

    // Test - Brand Gold - Testing and evaluation sessions
    test: primitiveColors.session.test,
    testMuted: 'rgba(184, 134, 11, 0.15)',
  },

  // -------------------------------------------------------------------------
  // INTERACTIVE STATES
  // -------------------------------------------------------------------------
  interactive: {
    // Primary button/CTA
    primaryBg: primitiveColors.primary.DEFAULT,
    primaryBgHover: primitiveColors.primary.light,
    primaryBgActive: primitiveColors.primary.dark,
    primaryText: primitiveColors.neutral[0],

    // Secondary button
    secondaryBg: primitiveColors.neutral[100],
    secondaryBgHover: primitiveColors.neutral[150],
    secondaryText: primitiveColors.neutral[900],
    secondaryBorder: primitiveColors.neutral[200],

    // Ghost/outline button
    ghostBg: 'transparent',
    ghostBgHover: 'rgba(27, 77, 62, 0.08)',
    ghostText: primitiveColors.primary.DEFAULT,
    ghostBorder: primitiveColors.primary.DEFAULT,

    // Destructive button
    destructiveBg: primitiveColors.error.DEFAULT,
    destructiveBgHover: primitiveColors.error.light,
    destructiveText: primitiveColors.neutral[0],
  },

  // -------------------------------------------------------------------------
  // COMPONENT-SPECIFIC
  // -------------------------------------------------------------------------
  component: {
    // Progress bars
    progressBg: primitiveColors.neutral[150],
    progressFill: primitiveColors.primary.DEFAULT,
    progressSuccess: primitiveColors.success.DEFAULT,
    progressWarning: primitiveColors.warning.DEFAULT,
    progressError: primitiveColors.error.DEFAULT,

    // Badges
    badgePrimaryBg: 'rgba(27, 77, 62, 0.08)',
    badgePrimaryText: primitiveColors.primary.DEFAULT,
    badgeSuccessBg: primitiveColors.success.muted,
    badgeSuccessText: primitiveColors.success.DEFAULT,
    badgeWarningBg: primitiveColors.warning.muted,
    badgeWarningText: primitiveColors.warning.DEFAULT,
    badgeErrorBg: primitiveColors.error.muted,
    badgeErrorText: primitiveColors.error.DEFAULT,
    badgeNeutralBg: primitiveColors.neutral[150],
    badgeNeutralText: primitiveColors.neutral[700],

    // Input fields
    inputBg: primitiveColors.neutral[0],
    inputBorder: primitiveColors.neutral[200],
    inputBorderFocus: primitiveColors.primary.DEFAULT,
    inputPlaceholder: primitiveColors.neutral[400],

    // Cards
    cardBg: primitiveColors.neutral[0],
    cardBorder: primitiveColors.neutral[200],
    cardShadow: 'rgba(0, 0, 0, 0.04)',

    // Tab bar
    tabInactive: primitiveColors.neutral[400],
    tabActive: primitiveColors.primary.DEFAULT,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PrimitiveColors = typeof primitiveColors;
export type SemanticColors = typeof semanticColors;

// Flatten semantic colors for Tailwind config generation
export function flattenSemanticColors(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenSemanticColors(value as Record<string, unknown>, newKey));
    }
  }

  return result;
}

// Pre-flattened export for Tailwind
export const flatSemanticColors = flattenSemanticColors(semanticColors);

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  primitiveColors,
  semanticColors,
  flatSemanticColors,
};
