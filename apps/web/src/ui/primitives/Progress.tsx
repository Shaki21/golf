/**
 * TIER Golf - Progress Components
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * Rules:
 * - Progress fill = ak.progress (emerald) by default
 * - Track = ak.surface.border
 * - Do not use ak.action (blue) or ak.prestige (gold) for progress fills
 */

import React from "react";

// Progress Bar
interface ProgressBarProps {
  value: number; // 0-100 (or relative if max provided)
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "error"; // legacy support
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const heightClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const fillClassByVariant: Record<
  NonNullable<ProgressBarProps["variant"]>,
  string
> = {
  // primary + success both map to progress (emerald) to keep discipline
  primary: "bg-ak-progress",
  success: "bg-ak-progress",
  warning: "bg-ak-status-warning",
  error: "bg-ak-status-error",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  label,
  animated = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={["w-full", className ?? ""].filter(Boolean).join(" ")}>
      {(showLabel || label) && (
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium">
          <span className="text-ak-text-primary">{label ?? ""}</span>
          {showLabel && (
            <span className={["", variant === "warning"
              ? "text-ak-status-warning"
              : variant === "error"
              ? "text-ak-status-error"
              : "text-ak-progress"].join(" ")}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={[
          "w-full overflow-hidden rounded-full bg-ak-surface-border",
          heightClasses[size],
        ].join(" ")}
        aria-label={label ?? "Progress"}
      >
        <div
          className={[
            "h-full rounded-full",
            fillClassByVariant[variant],
            animated ? "transition-[width] duration-500 ease-out" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress
interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "success" | "warning" | "error"; // legacy support
  showValue?: boolean;
  label?: string;
  className?: string;
}

const strokeByVariant: Record<
  NonNullable<CircularProgressProps["variant"]>,
  string
> = {
  primary: "var(--tier-progress)",
  success: "var(--tier-progress)",
  warning: "var(--tier-status-warning)",
  error: "var(--tier-status-error)",
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  variant = "primary",
  showValue = true,
  label,
  className,
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={["relative inline-flex items-center justify-center", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
      aria-label={label ?? "Progress"}
    >
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--tier-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeByVariant[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>

      {showValue && (
        <div className="absolute text-center">
          <div
            className="font-bold leading-none text-ak-progress"
            style={{ fontSize: size * 0.25 }}
          >
            {Math.round(percentage)}%
          </div>
          {label && (
            <div
              className="mt-[2px] text-ak-text-muted"
              style={{ fontSize: size * 0.12 }}
            >
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Goal Progress - specialized for showing goal completion
interface GoalProgressProps {
  current: number;
  target: number;
  unit?: string;
  title: string;
  icon?: string;
  className?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  current,
  target,
  unit = "",
  title,
  icon = "target",
  className,
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div
      className={[
        "rounded-2xl bg-ak-surface-card p-4 shadow-sm",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl text-[20px]",
            isComplete ? "bg-ak-progress text-white" : "bg-ak-surface-border text-ak-text-body",
          ].join(" ")}
        >
          {isComplete ? "✓" : icon}
        </div>

        <div className="flex-1">
          <div className="mb-[2px] text-[15px] font-semibold text-ak-text-primary">
            {title}
          </div>
          <div className="text-[13px] text-ak-text-muted">
            {current} / {target} {unit}
          </div>
        </div>
      </div>

      <ProgressBar
        value={current}
        max={target}
        size="md"
        variant="primary"
        animated
        showLabel
        label={`Fremdrift`}
      />
    </div>
  );
};

export default ProgressBar;
