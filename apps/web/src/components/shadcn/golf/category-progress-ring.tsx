import * as React from "react"
import { cn } from "lib/utils"
import { TrainingCategoryBadge, type TrainingCategory } from "./training-category-badge"

interface CategoryProgressRingProps {
  category: TrainingCategory
  value: number
  maxValue?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  showValue?: boolean
  className?: string
}

const categoryColors: Record<TrainingCategory, string> = {
  fysisk: "var(--category-fys)",
  teknikk: "var(--category-tek)",
  slag: "var(--category-slag)",
  spill: "var(--category-spill)",
  turnering: "var(--category-turn)",
}

const sizeConfig = {
  sm: {
    size: 60,
    strokeWidth: 6,
    fontSize: "text-sm",
    labelSize: "text-xs",
  },
  md: {
    size: 80,
    strokeWidth: 8,
    fontSize: "text-lg",
    labelSize: "text-xs",
  },
  lg: {
    size: 120,
    strokeWidth: 10,
    fontSize: "text-2xl",
    labelSize: "text-sm",
  },
}

export const CategoryProgressRing: React.FC<CategoryProgressRingProps> = ({
  category,
  value,
  maxValue = 100,
  size = "md",
  showLabel = true,
  showValue = true,
  className,
}) => {
  const config = sizeConfig[size]
  const percentage = Math.min((value / maxValue) * 100, 100)

  const radius = (config.size - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const color = categoryColors[category]

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          className="transform -rotate-90"
          width={config.size}
          height={config.size}
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="var(--tier-mist)"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center content */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "font-bold tabular-nums text-text-primary",
                config.fontSize
              )}
            >
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>

      {showLabel && (
        <TrainingCategoryBadge
          category={category}
          size={size === "lg" ? "md" : "sm"}
        />
      )}
    </div>
  )
}

export default CategoryProgressRing
