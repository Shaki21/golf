import * as React from "react"
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "../avatar"

interface LeaderboardRowProps {
  rank: number
  previousRank?: number
  name: string
  avatarUrl?: string
  value: number | string
  valueLabel?: string
  subtitle?: string
  isCurrentUser?: boolean
  onClick?: () => void
  className?: string
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-medal-gold" />
    case 2:
      return <Medal className="h-5 w-5 text-medal-silver" />
    case 3:
      return <Award className="h-5 w-5 text-medal-bronze" />
    default:
      return null
  }
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-amber-50 to-yellow-50 border-medal-gold/20"
    case 2:
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-medal-silver/20"
    case 3:
      return "bg-gradient-to-r from-orange-50 to-amber-50 border-medal-bronze/20"
    default:
      return "bg-white border-border-subtle"
  }
}

const getTrendIcon = (current: number, previous?: number) => {
  if (!previous) return null
  if (current < previous) return <TrendingUp className="h-3.5 w-3.5 text-ak-success" />
  if (current > previous) return <TrendingDown className="h-3.5 w-3.5 text-ak-error" />
  return <Minus className="h-3.5 w-3.5 text-text-tertiary" />
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  previousRank,
  name,
  avatarUrl,
  value,
  valueLabel,
  subtitle,
  isCurrentUser = false,
  onClick,
  className,
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const rankIcon = getRankIcon(rank)
  const trendIcon = getTrendIcon(rank, previousRank)

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-3 transition-colors",
        getRankStyle(rank),
        isCurrentUser && "ring-2 ring-ak-primary/20",
        onClick && "cursor-pointer hover:bg-ak-snow/50",
        className
      )}
      onClick={onClick}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-10">
        {rankIcon || (
          <span className={cn(
            "text-lg font-bold tabular-nums",
            rank <= 10 ? "text-text-primary" : "text-text-secondary"
          )}>
            {rank}
          </span>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar size="sm">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div className="min-w-0">
          <p className={cn(
            "font-medium text-text-primary truncate",
            isCurrentUser && "text-ak-primary"
          )}>
            {name}
            {isCurrentUser && <span className="ml-1.5 text-xs">(deg)</span>}
          </p>
          {subtitle && (
            <p className="text-xs text-text-secondary truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Trend */}
      {trendIcon && (
        <div className="flex items-center">
          {trendIcon}
        </div>
      )}

      {/* Value */}
      <div className="text-right">
        <p className="text-lg font-bold tabular-nums text-text-primary">
          {value}
        </p>
        {valueLabel && (
          <p className="text-xs text-text-secondary">{valueLabel}</p>
        )}
      </div>
    </div>
  )
}

export default LeaderboardRow
