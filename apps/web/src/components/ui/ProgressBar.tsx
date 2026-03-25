import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "lib/utils"

// =============================================================================
// PROGRESS BAR COMPONENT
// Rich progress component with milestones, labels, and animations
// =============================================================================

export interface Milestone {
  value: number
  label: string
  color?: "gray" | "green" | "primary" | "warning" | "danger"
}

const progressBarContainerVariants = cva("relative w-full rounded-full bg-gray-100", {
  variants: {
    thickness: {
      thin: "h-1",
      default: "h-2",
      thick: "h-3",
    },
  },
  defaultVariants: {
    thickness: "default",
  },
})

const progressBarFillVariants = cva("h-full rounded-full transition-all duration-500 ease-out", {
  variants: {
    color: {
      primary: "bg-ak-primary",
      success: "bg-ak-success",
      warning: "bg-ak-warning",
      danger: "bg-ak-error",
    },
    animated: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    color: "primary",
    animated: false,
  },
})

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarContainerVariants> {
  value: number
  max?: number
  color?: "primary" | "success" | "warning" | "danger"
  showPercentage?: boolean
  animated?: boolean
  label?: string
  milestones?: Milestone[]
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      thickness,
      color = "primary",
      showPercentage = false,
      animated = false,
      label,
      milestones,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getMilestoneColor = (c?: string) => {
      switch (c) {
        case "green":
          return "bg-ak-success"
        case "warning":
          return "bg-ak-warning"
        case "danger":
          return "bg-ak-error"
        case "primary":
          return "bg-ak-primary"
        default:
          return "bg-gray-400"
      }
    }

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Label and percentage row */}
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <span className="text-sm font-medium text-text-secondary">
                {label}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-text-secondary">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* Progress bar container */}
        <div className="relative">
          <div className={cn(progressBarContainerVariants({ thickness }))}>
            <div
              className={cn(progressBarFillVariants({ color, animated: animated ? true : false }))}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {milestones.map((milestone, index) => {
                const position = (milestone.value / max) * 100
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${position}%` }}
                  >
                    {/* Milestone marker */}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full -translate-x-1/2 border-2 border-white",
                        getMilestoneColor(milestone.color)
                      )}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Milestone labels below */}
        {milestones && milestones.length > 0 && (
          <div className="relative mt-1 h-4">
            {milestones.map((milestone, index) => {
              const position = (milestone.value / max) * 100
              return (
                <span
                  key={index}
                  className="absolute text-xs text-text-tertiary -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  {milestone.label}
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

export { ProgressBar, progressBarContainerVariants, progressBarFillVariants }
