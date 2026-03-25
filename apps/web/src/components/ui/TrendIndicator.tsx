import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

// =============================================================================
// TREND INDICATOR COMPONENT
// Shows directional change with value and context
// =============================================================================

const trendIndicatorVariants = cva("inline-flex items-center gap-1 text-sm font-medium", {
  variants: {
    direction: {
      up: "",
      down: "",
      flat: "text-text-secondary",
    },
    positive: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      direction: "up",
      positive: true,
      className: "text-ak-success",
    },
    {
      direction: "up",
      positive: false,
      className: "text-ak-error",
    },
    {
      direction: "down",
      positive: true,
      className: "text-ak-error",
    },
    {
      direction: "down",
      positive: false,
      className: "text-ak-success",
    },
  ],
  defaultVariants: {
    direction: "flat",
    positive: true,
  },
})

export interface TrendIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trendIndicatorVariants> {
  direction: "up" | "down" | "flat"
  value: string
  label?: string
  positive?: boolean
}

const TrendIndicator = React.forwardRef<HTMLDivElement, TrendIndicatorProps>(
  ({ className, direction, value, label, positive = true, ...props }, ref) => {
    const Icon =
      direction === "up"
        ? TrendingUp
        : direction === "down"
          ? TrendingDown
          : Minus

    return (
      <div
        ref={ref}
        className={cn(
          trendIndicatorVariants({ direction, positive: positive ? true : false }),
          className
        )}
        {...props}
      >
        <Icon className="h-4 w-4" />
        <span>{value}</span>
        {label && <span className="text-text-tertiary font-normal">{label}</span>}
      </div>
    )
  }
)

TrendIndicator.displayName = "TrendIndicator"

export { TrendIndicator, trendIndicatorVariants }
