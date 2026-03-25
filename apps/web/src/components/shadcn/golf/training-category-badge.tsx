import * as React from "react"
import { cn } from "lib/utils"
import { Dumbbell, Target, Zap, Trophy, Flag } from "lucide-react"

type TrainingCategory = "fysisk" | "teknikk" | "slag" | "spill" | "turnering"

interface TrainingCategoryBadgeProps {
  category: TrainingCategory
  showIcon?: boolean
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const categoryConfig: Record<TrainingCategory, {
  label: string
  labelNo: string
  icon: React.ElementType
  colors: string
}> = {
  fysisk: {
    label: "Physical",
    labelNo: "Fysisk",
    icon: Dumbbell,
    colors: "bg-category-fys-muted text-category-fys border-category-fys/20",
  },
  teknikk: {
    label: "Technique",
    labelNo: "Teknikk",
    icon: Target,
    colors: "bg-category-tek-muted text-category-tek border-category-tek/20",
  },
  slag: {
    label: "Shot Types",
    labelNo: "Slag",
    icon: Zap,
    colors: "bg-category-slag-muted text-category-slag border-category-slag/20",
  },
  spill: {
    label: "Course Play",
    labelNo: "Spill",
    icon: Flag,
    colors: "bg-category-spill-muted text-category-spill border-category-spill/20",
  },
  turnering: {
    label: "Tournament",
    labelNo: "Turnering",
    icon: Trophy,
    colors: "bg-category-turn-muted text-category-turn border-category-turn/20",
  },
}

const sizeConfig = {
  sm: {
    badge: "px-2 py-0.5 text-xs",
    icon: "h-3 w-3",
    gap: "gap-1",
  },
  md: {
    badge: "px-2.5 py-1 text-sm",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },
  lg: {
    badge: "px-3 py-1.5 text-sm",
    icon: "h-5 w-5",
    gap: "gap-2",
  },
}

export const TrainingCategoryBadge: React.FC<TrainingCategoryBadgeProps> = ({
  category,
  showIcon = true,
  showLabel = true,
  size = "md",
  className,
}) => {
  // Fallback to 'teknikk' if category is invalid
  const config = categoryConfig[category] || categoryConfig.teknikk
  const sizes = sizeConfig[size]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.colors,
        sizes.badge,
        sizes.gap,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} />}
      {showLabel && <span>{config.labelNo}</span>}
    </span>
  )
}

// Export for use in other components
export const trainingCategories = Object.keys(categoryConfig) as TrainingCategory[]
export type { TrainingCategory }
export default TrainingCategoryBadge
