/** @type {import('tailwindcss').Config} */

/**
 * AK Golf Premium Light - Tailwind Configuration
 * Version: 2.0.0
 *
 * This config uses semantic color tokens under the "ak" namespace.
 * Components should use classes like: text-ak-text-primary, bg-ak-surface-card
 *
 * See COLOR_USAGE_RULES.md for Gold discipline and usage constraints.
 */

module.exports = {
  content: [
    "./Screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../apps/web/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // =======================================================================
      // AK GOLF SEMANTIC COLOR SYSTEM
      // Use these tokens instead of raw hex values
      // =======================================================================
      colors: {
        // Semantic tokens under "ak" namespace
        ak: {
          // Brand Colors
          brand: {
            primary: '#1B4D3E',
            'primary-hover': '#2A6B55',
            'primary-active': '#133629',
            'primary-muted': 'rgba(27, 77, 62, 0.08)',
            'primary-soft': 'rgba(27, 77, 62, 0.12)',
          },

          // Surface/Background Colors
          surface: {
            base: '#FAFBFC',
            card: '#FFFFFF',
            elevated: '#F5F7F9',
            subtle: '#EEF1F4',
            muted: '#E5E7EB',
            overlay: 'rgba(0, 0, 0, 0.5)',
            // Dark mode surfaces (for dark: variant)
            'dark-base': '#1C1C1E',
            'dark-card': '#2C2C2E',
            'dark-elevated': '#3A3A3C',
            'dark-border': '#3A3A3C',
          },

          // Text Colors
          text: {
            primary: '#111827',
            secondary: '#374151',
            tertiary: '#6B7280',
            muted: '#9CA3AF',
            'muted-mobile': '#7D8590',
            disabled: '#D1D5DB',
            inverse: '#FFFFFF',
            brand: '#1B4D3E',
            link: '#1B4D3E',
            'link-hover': '#2A6B55',
          },

          // Border Colors
          border: {
            DEFAULT: '#E5E7EB',
            strong: '#D1D5DB',
            muted: '#EEF1F4',
            focus: '#1B4D3E',
            brand: 'rgba(27, 77, 62, 0.2)',
          },

          // Neutral Accents (dividers, inactive UI)
          neutral: {
            accent: '#D1D5DB',
            divider: '#E5E7EB',
            'divider-strong': '#D1D5DB',
            disabled: '#E5E7EB',
          },

          // Status Colors
          status: {
            success: '#059669',
            'success-light': '#10B981',
            'success-muted': 'rgba(5, 150, 105, 0.1)',

            warning: '#D97706',
            'warning-light': '#F59E0B',
            'warning-muted': 'rgba(217, 119, 6, 0.1)',

            error: '#DC2626',
            'error-light': '#EF4444',
            'error-muted': 'rgba(220, 38, 38, 0.08)',

            info: '#0284C7',
            'info-light': '#0EA5E9',
            'info-muted': 'rgba(2, 132, 199, 0.1)',
          },

          // Achievement (Gold) - RESTRICTED USAGE
          // See COLOR_USAGE_RULES.md for constraints
          achievement: {
            gold: '#B8860B',
            'gold-light': '#DAA520',
            'gold-muted': 'rgba(184, 134, 11, 0.1)',
            'gold-border': '#B8860B',
          },

          // Badge Tiers - Gamification badge backgrounds
          tier: {
            // Standard (base level)
            standard: '#64748B',
            'standard-border': '#475569',
            'standard-text': '#FFFFFF',
            'standard-glow': 'rgba(100, 116, 139, 0.4)',
            // Bronze
            bronze: '#CD7F32',
            'bronze-border': '#B86F2C',
            'bronze-text': '#FFFFFF',
            'bronze-glow': 'rgba(205, 127, 50, 0.4)',
            // Silver
            silver: '#9CA3AF',
            'silver-border': '#6B7280',
            'silver-text': '#FFFFFF',
            'silver-glow': 'rgba(156, 163, 175, 0.4)',
            // Gold (bright, for badges)
            gold: '#F59E0B',
            'gold-border': '#D97706',
            'gold-text': '#FFFFFF',
            'gold-glow': 'rgba(245, 158, 11, 0.4)',
            // Platinum (premium)
            platinum: '#8B5CF6',
            'platinum-border': '#7C3AED',
            'platinum-text': '#FFFFFF',
            'platinum-glow': 'rgba(139, 92, 246, 0.4)',
            // Locked state
            locked: '#F5F7F9',
            'locked-border': '#E5E7EB',
            'locked-text': '#9CA3AF',
            'locked-icon': '#9CA3AF',
          },

          // Toast backgrounds (dark surfaces for notifications)
          toast: {
            bg: '#1E293B',
            text: '#FFFFFF',
            'text-muted': '#94A3B8',
          },

          // Session/Training Types - Color coding for activities
          session: {
            // Teknikk (T) - Purple - Technique drills
            teknikk: '#8B6E9D',
            'teknikk-muted': 'rgba(139, 110, 157, 0.15)',
            // Golfslag (G) - Forest Green Light - Golf shots
            golfslag: '#2A6B55',
            'golfslag-muted': 'rgba(42, 107, 85, 0.15)',
            // Spill (S) - Forest Green - Playing sessions
            spill: '#1B4D3E',
            'spill-muted': 'rgba(27, 77, 62, 0.15)',
            // Kompetanse (K) - Red - Competition
            kompetanse: '#DC2626',
            'kompetanse-muted': 'rgba(220, 38, 38, 0.15)',
            // Fysisk (Fs) - Orange - Physical training
            fysisk: '#EA580C',
            'fysisk-muted': 'rgba(234, 88, 12, 0.15)',
            // Funksjonell (Fu) - Teal - Functional training
            funksjonell: '#0D9488',
            'funksjonell-muted': 'rgba(13, 148, 136, 0.15)',
            // Hjemme (L1-2) - Gray - Home practice
            hjemme: '#6B7280',
            'hjemme-muted': 'rgba(107, 114, 128, 0.15)',
            // Test - Brand Gold - Testing sessions
            test: '#B8860B',
            'test-muted': 'rgba(184, 134, 11, 0.15)',
          },

          // Interactive States
          interactive: {
            // Primary button
            'primary-bg': '#1B4D3E',
            'primary-bg-hover': '#2A6B55',
            'primary-bg-active': '#133629',
            'primary-text': '#FFFFFF',

            // Secondary button
            'secondary-bg': '#F5F7F9',
            'secondary-bg-hover': '#EEF1F4',
            'secondary-text': '#111827',
            'secondary-border': '#E5E7EB',

            // Ghost button
            'ghost-bg': 'transparent',
            'ghost-bg-hover': 'rgba(27, 77, 62, 0.08)',
            'ghost-text': '#1B4D3E',
            'ghost-border': '#1B4D3E',

            // Destructive button
            'destructive-bg': '#DC2626',
            'destructive-bg-hover': '#EF4444',
            'destructive-text': '#FFFFFF',
          },

          // Component-specific tokens
          component: {
            // Progress
            'progress-bg': '#EEF1F4',
            'progress-fill': '#1B4D3E',
            'progress-success': '#059669',
            'progress-warning': '#D97706',
            'progress-error': '#DC2626',

            // Input
            'input-bg': '#FFFFFF',
            'input-border': '#E5E7EB',
            'input-border-focus': '#1B4D3E',
            'input-placeholder': '#9CA3AF',

            // Card
            'card-bg': '#FFFFFF',
            'card-border': '#E5E7EB',

            // Tab
            'tab-inactive': '#9CA3AF',
            'tab-active': '#1B4D3E',
          },
        },

        // ---------------------------------------------------------------------
        // LEGACY COLORS (for backwards compatibility)
        // Prefer ak.* tokens for new code
        // ---------------------------------------------------------------------
        primary: {
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
          DEFAULT: '#1B4D3E',
          light: '#2A6B55',
        },

        forest: {
          DEFAULT: '#1B4D3E',
          light: '#2A6B55',
          dark: '#133629',
        },

        gold: {
          DEFAULT: '#B8860B',
          light: '#DAA520',
        },

        success: {
          DEFAULT: '#059669',
          light: '#10B981',
        },

        warning: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
        },

        error: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
        },

        info: {
          DEFAULT: '#0284C7',
          light: '#0EA5E9',
        },

        // Neutrals
        ink: '#111827',
        snow: '#FAFBFC',

        gray: {
          50: '#FAFBFC',
          100: '#F5F7F9',
          150: '#EEF1F4',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          450: '#7D8590',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },

      // =======================================================================
      // TYPOGRAPHY
      // =======================================================================
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'SF Mono', 'Consolas', 'monospace'],
      },

      fontSize: {
        // Display Styles
        'large-title': ['34px', { lineHeight: '41px', letterSpacing: '-0.4px', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '34px', letterSpacing: '0.36px', fontWeight: '700' }],
        'title-2': ['22px', { lineHeight: '28px', letterSpacing: '-0.26px', fontWeight: '700' }],
        'title-3': ['20px', { lineHeight: '25px', letterSpacing: '-0.45px', fontWeight: '600' }],

        // Text Styles
        'headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.43px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', letterSpacing: '-0.43px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.31px', fontWeight: '400' }],
        'subhead': ['15px', { lineHeight: '20px', letterSpacing: '-0.23px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.08px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', letterSpacing: '0', fontWeight: '400' }],
        'caption-2': ['11px', { lineHeight: '13px', letterSpacing: '0.06px', fontWeight: '400' }],

        // Data display
        'stat-number': ['48px', { lineHeight: '1', letterSpacing: '-0.5px', fontWeight: '700' }],
        'stat-label': ['11px', { lineHeight: '13px', letterSpacing: '0.5px', fontWeight: '500' }],
        'hero-score': ['72px', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '700' }],
      },

      // =======================================================================
      // SPACING & LAYOUT
      // =======================================================================
      borderRadius: {
        'ak-xs': '4px',
        'ak-sm': '8px',
        'ak-md': '12px',
        'ak-lg': '16px',
        'ak-xl': '20px',
        'ak-2xl': '24px',
      },

      boxShadow: {
        'ak-xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'ak-sm': '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'ak-md': '0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'ak-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'ak-xl': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'ak-card': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'ak-elevated': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },

      // =======================================================================
      // TRANSITIONS
      // =======================================================================
      transitionDuration: {
        'ak-fast': '150ms',
        'ak-base': '200ms',
        'ak-slow': '300ms',
      },
    },
  },
  plugins: [],
};
