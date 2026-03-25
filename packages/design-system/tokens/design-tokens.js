/**
 * AK Golf Academy - Design Tokens v3.1
 * Based on: Premium Light Palette (Forest Green)
 * Synchronized with: apps/web/src/index.css
 * Font: Inter (Open Source, Cross-Platform)
 * Typography Scale: Apple Human Interface Guidelines
 *
 * Usage:
 * import { tokens } from './design-tokens';
 *
 * <div style={{ backgroundColor: tokens.colors.primary, color: 'white' }}>
 *   Content
 * </div>
 */

export const tokens = {
  // ==================== COLORS ====================
  colors: {
    // Brand Colors - Premium Light (Forest Green)
    ink: '#1a1a1a',
    primary: '#1B4D3E',
    primaryLight: '#2A6B55',
    snow: '#FAFAFA',
    surface: '#F5F5F0',
    gold: '#996F09',

    // Legacy aliases (backwards compatible)
    forest: '#1B4D3E',
    forestLight: '#2A6B55',
    foam: '#FAFAFA',
    ivory: '#F5F5F0',

    // Semantic Colors (WCAG AA compliant)
    success: '#05875F',
    warning: '#B16105',
    error: '#DC2626',

    // Neutrals
    charcoal: '#1a1a1a',
    steel: '#737373',
    mist: '#E5E5E5',
    cloud: '#F5F5F5',

    // Common
    white: '#FFFFFF',
    black: '#000000',

    // Session/Training Types (Harmonized with Premium Light)
    sessionTypes: {
      teknikk: '#8B5CF6',      // T - Purple (technique drills)
      golfslag: '#3B82F6',     // G - Blue (golf shots)
      spill: '#1B4D3E',        // S - Primary Forest (playing sessions)
      kompetanse: '#EF4444',   // K - Red (competition/skills)
      fysisk: '#F97316',       // Fs - Orange (physical/strength)
      funksjonell: '#14B8A6',  // Fu - Teal (functional training)
      hjemme: '#6B7280',       // L1-2 - Gray (home practice)
      test: '#B8860B',         // Test - Gold (testing sessions)
    },
  },

  // ==================== TYPOGRAPHY ====================
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'system-ui', sans-serif",
    },

    // Display Styles
    largeTitle: {
      fontSize: '34px',
      lineHeight: '41px',
      fontWeight: '700',
      letterSpacing: '-0.4px',
    },
    title1: {
      fontSize: '28px',
      lineHeight: '34px',
      fontWeight: '700',
      letterSpacing: '0.36px',
    },
    title2: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: '700',
      letterSpacing: '-0.26px',
    },
    title3: {
      fontSize: '20px',
      lineHeight: '25px',
      fontWeight: '600',
      letterSpacing: '-0.45px',
    },

    // Text Styles
    headline: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: '600',
      letterSpacing: '-0.43px',
    },
    body: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: '400',
      letterSpacing: '-0.43px',
    },
    callout: {
      fontSize: '16px',
      lineHeight: '21px',
      fontWeight: '400',
      letterSpacing: '-0.31px',
    },
    subhead: {
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: '400',
      letterSpacing: '-0.23px',
    },
    footnote: {
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: '400',
      letterSpacing: '-0.08px',
    },
    caption1: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400',
      letterSpacing: '0',
    },
    caption2: {
      fontSize: '11px',
      lineHeight: '13px',
      fontWeight: '400',
      letterSpacing: '0.06px',
    },

    // Special Typography
    statNumber: {
      fontSize: '48px',
      lineHeight: '1',
      fontWeight: '700',
      letterSpacing: '-0.5px',
    },
    statLabel: {
      fontSize: '11px',
      lineHeight: '13px',
      fontWeight: '500',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
  },

  // ==================== SPACING ====================
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  // ==================== BORDER RADIUS ====================
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  // ==================== SHADOWS ====================
  shadows: {
    card: '0 2px 4px rgba(0, 0, 0, 0.06)',
    elevated: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },

  // ==================== TRANSITIONS ====================
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

// Helper function to create style objects with typography tokens
export const getTypographyStyle = (variant) => {
  const style = tokens.typography[variant];
  if (!style) {
    console.warn(`Typography variant "${variant}" not found in tokens`);
    return {};
  }
  return {
    fontFamily: tokens.typography.fontFamily.sans,
    ...style,
  };
};

// Helper function to create color with opacity
export const colorWithOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Export individual token categories for convenience
export const colors = tokens.colors;
export const typography = tokens.typography;
export const spacing = tokens.spacing;
export const radius = tokens.radius;
export const shadows = tokens.shadows;
export const transitions = tokens.transitions;

// Default export
export default tokens;
