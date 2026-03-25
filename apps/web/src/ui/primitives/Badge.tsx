/**
 * TIER Golf - Badge/Tag Component
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * NOW POWERED BY CATALYST UI
 *
 * Rules:
 * - Default badges are neutral (stone)
 * - Prestige = gold only for achievement contexts
 * - Blue is allowed for "accent" labels (selection/category labeling), not for prestige
 */

import React from "react";
// @ts-ignore - Catalyst components are JS
import { Badge as CatalystBadge } from "../../components/catalyst/badge";

export type BadgeVariant =
  | "neutral"
  | "default" // alias for neutral
  | "accent"
  | "primary" // alias for accent
  | "success"
  | "warning"
  | "error"
  | "achievement";

export type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Makes the badge pill-shaped (more rounded) */
  pill?: boolean;
  /** Shows a small dot indicator */
  dot?: boolean;
}

// Map our variants to Catalyst colors
const variantToCatalystColor: Record<BadgeVariant, string> = {
  neutral: "surface",
  default: "surface",
  accent: "primary",
  primary: "primary",
  success: "success",
  warning: "warning",
  error: "error",
  achievement: "gold",
};

// Size-specific classes to add
const sizeClasses: Record<BadgeSize, string> = {
  sm: "!text-[11px] !px-1.5 !py-[2px]",
  md: "", // Default Catalyst size
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  children,
  icon,
  className,
  style,
  pill = false,
  dot = false,
}) => {
  const color = variantToCatalystColor[variant];
  const combinedClassName = [
    sizeClasses[size],
    pill ? "!rounded-full" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <CatalystBadge
      color={color as any}
      className={combinedClassName}
      style={style}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </CatalystBadge>
  );
};

// Level Badge - for competency levels
interface LevelBadgeProps {
  level: 1 | 2 | 3 | 4 | 5;
  size?: BadgeSize;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = "md" }) => {
  // Discipline: levels are mostly neutral; only the highest tiers become blue/gold.
  const config: Record<
    LevelBadgeProps["level"],
    { label: string; className: string }
  > = {
    1: { label: "L1", className: "bg-ak-surface-border text-ak-text-muted" },
    2: { label: "L2", className: "bg-ak-surface-border text-ak-text-body" },
    3: { label: "L3", className: "bg-ak-action-active/10 text-ak-action-active" },
    4: { label: "L4", className: "bg-ak-action-primary text-white" },
    5: { label: "L5", className: "bg-ak-prestige text-ak-text-primary" },
  };

  const c = config[level];

  return (
    <span
      className={[
        "inline-flex items-center font-semibold",
        sizeClasses[size],
        c.className,
      ].join(" ")}
    >
      {c.label}
    </span>
  );
};

// Category Badge - for session categories
interface CategoryBadgeProps {
  category: "teknikk" | "fysisk" | "mental" | "spill" | "test";
  size?: BadgeSize;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = "md",
}) => {
  // If you expose ak.category.* tokens, these will map cleanly.
  // If not, keep these as neutral until category tokens are added.
  const categoryConfig: Record<
    CategoryBadgeProps["category"],
    { icon: string; label: string; bg: string; text: string }
  > = {
    teknikk: {
      icon: "swing",
      label: "Teknikk",
      bg: "bg-ak-category-teknikk-muted",
      text: "text-ak-category-teknikk",
    },
    fysisk: {
      icon: "dumbbell",
      label: "Fysisk",
      bg: "bg-ak-category-fysisk-muted",
      text: "text-ak-category-fysisk",
    },
    mental: {
      icon: "🧠",
      label: "Mental",
      bg: "bg-ak-category-mental-muted",
      text: "text-ak-category-mental",
    },
    spill: {
      icon: "flag",
      label: "Spill",
      bg: "bg-ak-category-spill-muted",
      text: "text-ak-category-spill",
    },
    test: {
      icon: "bar-chart",
      label: "Test",
      bg: "bg-ak-category-test-muted",
      text: "text-ak-category-test",
    },
  };

  const c = categoryConfig[category];

  return (
    <span
      className={[
        "inline-flex items-center gap-1 whitespace-nowrap font-semibold",
        sizeClasses[size],
        c.bg,
        c.text,
      ].join(" ")}
    >
      <span className="inline-flex">{c.icon}</span>
      {c.label}
    </span>
  );
};

export default Badge;
