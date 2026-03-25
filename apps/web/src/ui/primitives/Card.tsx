/**
 * TIER Golf - Card Component
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * Rules:
 * - Cards are stone surfaces (no colored fills)
 * - Differentiation is via elevation and spacing, not color
 */

import React from "react";

export type CardVariant = "default" | "elevated" | "outlined" | "highlight" | "accent" | "flat";

interface CardProps {
  variant?: CardVariant;
  padding?: "none" | "compact" | "sm" | "md" | "default" | "lg" | "spacious";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  compact: "p-2",
  sm: "p-3",
  md: "p-4",
  default: "p-4", // alias for md
  lg: "p-6",
  spacious: "p-8",
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-ak-surface-card shadow-sm",
  elevated: "bg-ak-surface-elevated shadow-md",
  outlined: "bg-ak-surface-card border border-ak-surface-border shadow-none",
  highlight: "bg-ak-surface-card border-2 border-ak-action-active shadow-md",
  accent: "bg-ak-action-primary text-white shadow-md",
  flat: "bg-ak-surface-card shadow-none",
};

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  children,
  onClick,
  className,
  style,
}) => {
  const classes = [
    "rounded-2xl overflow-hidden",
    variantClasses[variant],
    paddingClasses[padding],
    onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

// Session Card - specialized for training sessions
interface SessionCardProps {
  title: string;
  subtitle?: string;
  duration?: string;
  category?: string;
  status?: "upcoming" | "active" | "completed";
  onClick?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  title,
  subtitle,
  duration,
  category,
  status = "upcoming",
  onClick,
}) => {
  const statusClasses: Record<
    NonNullable<SessionCardProps["status"]>,
    { tile: string; text: string }
  > = {
    upcoming: { tile: "bg-ak-surface-border", text: "text-ak-text-body" },
    active: { tile: "bg-ak-action-primary", text: "text-white" },
    completed: { tile: "bg-ak-progress", text: "text-white" },
  };

  const icon =
    category === "teknikk" ? "swing" : category === "fysisk" ? "dumbbell" : "flag";

  return (
    <Card variant="default" onClick={onClick} padding="md">
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-xl text-[20px]",
            statusClasses[status].tile,
            statusClasses[status].text,
          ].join(" ")}
        >
          {status === "completed" ? "✓" : icon}
        </div>

        <div className="flex-1">
          <div className="mb-1 text-[15px] font-semibold text-ak-text-primary">
            {title}
          </div>
          {subtitle ? (
            <div className="text-[13px] text-ak-text-muted">{subtitle}</div>
          ) : null}
        </div>

        {duration ? (
          <div className="rounded-lg bg-ak-action-active/10 px-2 py-1 text-[13px] font-medium text-ak-action-active">
            {duration}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

// Stats Card - for displaying statistics
interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  trend,
  trendValue,
}) => {
  const trendClass: Record<
    NonNullable<StatsCardProps["trend"]>,
    string
  > = {
    up: "text-ak-progress",
    down: "text-ak-status-error",
    neutral: "text-ak-text-muted",
  };

  return (
    <Card variant="default" padding="md">
      <div className="text-center">
        <div className="mb-1 text-[32px] font-bold text-ak-action-primary">
          {value}
        </div>
        <div className="text-[12px] font-medium uppercase tracking-[0.5px] text-ak-text-muted">
          {label}
        </div>

        {trend && trendValue ? (
          <div className={["mt-2 text-[12px] font-medium", trendClass[trend]].join(" ")}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default Card;
