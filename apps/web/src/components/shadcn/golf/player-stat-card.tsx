import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "lib/utils"
import { Card, CardContent } from "../card"

interface PlayerStatCardProps {
  label: string
  value: string | number
  previousValue?: number
  suffix?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  icon?: React.ReactNode
  accentColor?: "primary" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  className?: string
  /** Optional abbreviated label for mobile screens */
  mobileLabel?: string
  /** Optional tooltip text for full label description */
  tooltip?: string
}

const accentColors = {
  primary: "text-ak-primary bg-ak-primary/10",
  success: "text-ak-success bg-ak-success/10",
  warning: "text-ak-warning bg-ak-warning/10",
  error: "text-ak-error bg-ak-error/10",
}

const trendColors = {
  up: "text-ak-success",
  down: "text-ak-error",
  neutral: "text-text-tertiary",
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const sizes = {
  sm: {
    value: "text-xl",
    label: "text-xs",
    icon: "h-8 w-8",
    iconSize: 16,
  },
  md: {
    value: "text-2xl",
    label: "text-sm",
    icon: "h-10 w-10",
    iconSize: 20,
  },
  lg: {
    value: "text-3xl",
    label: "text-sm",
    icon: "h-12 w-12",
    iconSize: 24,
  },
}

export const PlayerStatCard: React.FC<PlayerStatCardProps> = ({
  label,
  value,
  suffix,
  trend,
  trendLabel,
  icon,
  accentColor = "primary",
  size = "md",
  className,
  mobileLabel,
  tooltip,
}) => {
  const TrendIcon = trend ? trendIcons[trend] : null
  const sizeConfig = sizes[size]
  const displayLabel = mobileLabel ? (
    <>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{mobileLabel}</span>
    </>
  ) : label;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p
              className={cn("font-medium text-text-secondary text-xs sm:text-sm", sizeConfig.label)}
              title={tooltip || label}
            >
              {displayLabel}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={cn("font-bold text-text-primary tabular-nums", sizeConfig.value)}>
                {value}
              </span>
              {suffix && (
                <span className="text-sm text-text-secondary">{suffix}</span>
              )}
            </div>
            {trend && trendLabel && (
              <div className={cn("flex items-center gap-1 text-xs", trendColors[trend])}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                <span>{trendLabel}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "flex items-center justify-center rounded-lg",
              sizeConfig.icon,
              accentColors[accentColor]
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlayerStatCard
