/** @type {import('tailwindcss').Config} */
/**
 * AK Tailwind Config — Premium Light
 * Stone × Midnight Blue × Emerald × Soft Gold
 *
 * Designed to support semantic usage in components:
 * - ak.surface.*  -> layout surfaces
 * - ak.text.*     -> typography hierarchy
 * - ak.action.*   -> interaction (blue)
 * - ak.progress.* -> progress only (emerald)
 * - ak.prestige.* -> achievements only (gold)
 * - ak.status.*   -> feedback
 * - ak.category.* -> labels only (optional)
 */

const withAlpha = (cssVarName) => `rgb(var(${cssVarName}) / <alpha-value>)`;

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ak: {
          surface: {
            base: withAlpha("--ak-bg-app"),
            card: withAlpha("--ak-surface-card"),
            elevated: withAlpha("--ak-surface-elevated"),
            border: withAlpha("--ak-border"),
          },
          text: {
            primary: withAlpha("--ak-text-primary"),
            body: withAlpha("--ak-text-body"),
            muted: withAlpha("--ak-text-muted"),
            inverse: "#FFFFFF",
          },
          action: {
            primary: withAlpha("--ak-action-primary"),
            hover: withAlpha("--ak-action-hover"),
            active: withAlpha("--ak-action-active"),
          },
          progress: {
            DEFAULT: withAlpha("--ak-progress"),
            soft: withAlpha("--ak-progress-soft"),
          },
          prestige: {
            DEFAULT: withAlpha("--ak-prestige"),
            strong: withAlpha("--ak-prestige-strong"),
            muted: "rgba(198, 162, 77, 0.12)",
          },
          status: {
            success: withAlpha("--ak-status-success"),
            warning: withAlpha("--ak-status-warning"),
            error: withAlpha("--ak-status-error"),
            info: withAlpha("--ak-status-info"),
          },
          category: {
            teknikk: withAlpha("--ak-category-teknikk"),
            fysisk: withAlpha("--ak-category-fysisk"),
            mental: withAlpha("--ak-category-mental"),
            spill: withAlpha("--ak-category-spill"),
            test: withAlpha("--ak-category-test"),

            "teknikk-muted": withAlpha("--ak-category-teknikk-muted"),
            "fysisk-muted": withAlpha("--ak-category-fysisk-muted"),
            "mental-muted": withAlpha("--ak-category-mental-muted"),
            "spill-muted": withAlpha("--ak-category-spill-muted"),
            "test-muted": withAlpha("--ak-category-test-muted"),
          },
        },
      },

      borderRadius: {
        lg: "0.75rem",  // 12px
        xl: "1rem",     // 16px
        "2xl": "1.25rem"// 20px
      },

      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 6px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
