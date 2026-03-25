import * as React from "react"
import { cn } from "lib/utils"
import { Card, type CardProps } from "../shadcn/card"
import { TrendIndicator, type TrendIndicatorProps } from "./TrendIndicator"
import { Sparkline, type SparklineProps } from "./Sparkline"

// =============================================================================
// KPI CARD COMPONENT
// Composite component for displaying key performance indicators
// =============================================================================

export interface KPICardProps extends Omit<CardProps, "children"> {
  /** The main KPI value */
  value: string | number
  /** Description of the metric */
  label: string
  /** Optional trend indicator data */
  trend?: Omit<TrendIndicatorProps, "className">
  /** Optional sparkline data */
  sparkline?: Omit<SparklineProps, "className">
  /** Optional icon to display */
  icon?: React.ReactNode
  /** Size variant */
  size?: "default" | "compact"
}

const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  (
    {
      className,
      value,
      label,
      trend,
      sparkline,
      icon,
      size = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isCompact = size === "compact"

    return (
      <Card
        ref={ref}
        variant={variant}
        className={cn(
          isCompact ? "p-4" : "p-6",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Value and Label */}
          <div className="flex-1 min-w-0">
            {/* Icon and Value row */}
            <div className="flex items-center gap-2">
              {icon && (
                <div className="flex-shrink-0 text-ak-primary">
                  {icon}
                </div>
              )}
              <span
                className={cn(
                  "font-bold text-text-primary leading-none",
                  isCompact ? "text-2xl" : "text-4xl"
                )}
              >
                {value}
              </span>
            </div>

            {/* Label */}
            <p
              className={cn(
                "text-text-secondary mt-1",
                isCompact ? "text-xs" : "text-sm"
              )}
            >
              {label}
            </p>

            {/* Trend indicator */}
            {trend && (
              <div className="mt-2">
                <TrendIndicator {...trend} />
              </div>
            )}
          </div>

          {/* Right side: Sparkline */}
          {sparkline && (
            <div className="flex-shrink-0">
              <Sparkline {...sparkline} />
            </div>
          )}
        </div>
      </Card>
    )
  }
)

KPICard.displayName = "KPICard"

// =============================================================================
// KPI CARD VALUE - For custom layouts
// =============================================================================

const KPICardValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-4xl font-bold text-text-primary leading-none", className)}
    {...props}
  />
))
KPICardValue.displayName = "KPICardValue"

// =============================================================================
// KPI CARD LABEL - For custom layouts
// =============================================================================

const KPICardLabel = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
))
KPICardLabel.displayName = "KPICardLabel"

export { KPICard, KPICardValue, KPICardLabel }
