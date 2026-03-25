import * as React from "react"
import { Flame, Zap, Star, Crown, Trophy } from "lucide-react"
import { cn } from "lib/utils"

interface StreakBadgeProps {
  count: number
  type?: "days" | "sessions" | "weeks"
  size?: "sm" | "md" | "lg"
  showAnimation?: boolean
  className?: string
}

const getStreakConfig = (count: number) => {
  if (count >= 100) {
    return {
      icon: Crown,
      label: "Legendarisk",
      colors: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
      glow: "shadow-lg shadow-amber-400/50",
    }
  }
  if (count >= 50) {
    return {
      icon: Trophy,
      label: "Mester",
      colors: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      glow: "shadow-lg shadow-purple-400/50",
    }
  }
  if (count >= 30) {
    return {
      icon: Star,
      label: "Stjerne",
      colors: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white",
      glow: "shadow-md shadow-yellow-400/40",
    }
  }
  if (count >= 14) {
    return {
      icon: Zap,
      label: "På gang",
      colors: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
      glow: "shadow-md shadow-blue-400/40",
    }
  }
  if (count >= 7) {
    return {
      icon: Flame,
      label: "Varmer opp",
      colors: "bg-gradient-to-r from-orange-400 to-red-500 text-white",
      glow: "shadow-sm shadow-orange-400/30",
    }
  }
  return {
    icon: Flame,
    label: "Starter",
    colors: "bg-ak-snow text-text-primary border border-border-subtle",
    glow: "",
  }
}

const sizeConfig = {
  sm: {
    container: "px-2 py-1 text-xs",
    icon: "h-3 w-3",
    number: "text-sm font-bold",
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    icon: "h-4 w-4",
    number: "text-lg font-bold",
  },
  lg: {
    container: "px-4 py-2 text-base",
    icon: "h-5 w-5",
    number: "text-xl font-bold",
  },
}

const typeLabels = {
  days: "dager",
  sessions: "økter",
  weeks: "uker",
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  count,
  type = "days",
  size = "md",
  showAnimation = true,
  className,
}) => {
  const config = getStreakConfig(count)
  const sizes = sizeConfig[size]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        config.colors,
        config.glow,
        sizes.container,
        showAnimation && count >= 7 && "animate-pulse",
        className
      )}
    >
      <Icon className={cn(sizes.icon, count >= 7 && "animate-bounce")} />
      <span className={sizes.number}>{count}</span>
      <span className="opacity-80">{typeLabels[type]} streak</span>
    </div>
  )
}

export default StreakBadge
