import * as React from "react"
import { Target, CheckCircle2, Clock } from "lucide-react"
import { cn } from "lib/utils"
import { Card, CardContent } from "../card"
import { Progress } from "../progress"
import { CardTitle } from "../../typography"
import { STATUS_LABELS, TIME_LABELS } from "../../../constants/ui-labels"

export interface Milestone {
  label: string
  value: number
  reached: boolean
}

interface GoalProgressProps {
  title: string
  description?: string
  current: number
  target: number
  unit?: string
  deadline?: string
  status?: "on_track" | "behind" | "completed" | "at_risk"
  showCard?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  /** Optional milestones to display on progress bar */
  milestones?: Milestone[]
  /** Whether to animate progress on mount */
  animated?: boolean
}

const statusConfig = {
  on_track: {
    label: STATUS_LABELS.onTrack,
    color: "text-ak-success",
    bgColor: "bg-gradient-to-r from-green-500 to-green-600",
    solidBg: "bg-ak-success",
    icon: Target,
  },
  behind: {
    label: STATUS_LABELS.behind,
    color: "text-ak-warning",
    bgColor: "bg-gradient-to-r from-orange-400 to-orange-500",
    solidBg: "bg-ak-warning",
    icon: Clock,
  },
  completed: {
    label: STATUS_LABELS.completed,
    color: "text-ak-success",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
    solidBg: "bg-ak-success",
    icon: CheckCircle2,
  },
  at_risk: {
    label: STATUS_LABELS.atRisk,
    color: "text-ak-error",
    bgColor: "bg-gradient-to-r from-red-500 to-red-600",
    solidBg: "bg-ak-error",
    icon: Target,
  },
}

const sizeConfig = {
  sm: {
    title: "text-sm font-medium",
    value: "text-lg font-bold",
    progress: "h-1.5",
  },
  md: {
    title: "text-base font-medium",
    value: "text-2xl font-bold",
    progress: "h-2",
  },
  lg: {
    title: "text-lg font-semibold",
    value: "text-3xl font-bold",
    progress: "h-3",
  },
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  title,
  description,
  current,
  target,
  unit = "",
  deadline,
  status = "on_track",
  showCard = true,
  size = "md",
  className,
  milestones,
  animated = true,
}) => {
  const [displayPercentage, setDisplayPercentage] = React.useState(animated ? 0 : Math.min(Math.round((current / target) * 100), 100))
  const percentage = Math.min(Math.round((current / target) * 100), 100)
  const statusInfo = statusConfig[status]
  const sizes = sizeConfig[size]
  const StatusIcon = statusInfo.icon
  const isNearCompletion = percentage >= 90 && percentage < 100

  // Animate progress on mount
  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [percentage, animated])

  const content = (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className={cn("text-text-primary", sizes.title)}>{title}</CardTitle>
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium", statusInfo.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusInfo.label}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className={cn("tabular-nums text-text-primary", sizes.value)}>
            {current}
            <span className="text-sm font-normal text-text-secondary ml-1">
              / {target} {unit}
            </span>
          </span>
          <span className={cn(
            "text-sm font-medium text-text-secondary",
            isNearCompletion && "animate-pulse text-green-600 dark:text-green-400 font-bold"
          )}>
            {percentage}%
          </span>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative">
          <Progress
            value={displayPercentage}
            className={cn(
              sizes.progress,
              "transition-all duration-1000 ease-out"
            )}
            indicatorClassName={cn(
              statusInfo.bgColor,
              isNearCompletion && "animate-pulse"
            )}
          />

          {/* Milestone Markers */}
          {milestones && milestones.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {milestones.map((milestone, index) => {
                const position = (milestone.value / target) * 100
                return (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-gray-900"
                    style={{ left: `${position}%` }}
                    title={`${milestone.label}: ${milestone.value} ${unit}`}
                  >
                    {milestone.reached && (
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {deadline && (
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Clock className="h-3 w-3" />
          <span>{TIME_LABELS.deadline}: {deadline}</span>
        </div>
      )}
    </div>
  )

  if (!showCard) {
    return <div className={className}>{content}</div>
  }

  return (
    <Card className={className}>
      <CardContent className="pt-4">{content}</CardContent>
    </Card>
  )
}

export default GoalProgress
