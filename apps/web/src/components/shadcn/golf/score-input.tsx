import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "lib/utils"
import { Button } from "../button"

interface ScoreInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  par?: number
  label?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const getScoreColor = (score: number, par?: number) => {
  if (!par) return "text-text-primary"
  const diff = score - par
  if (diff <= -2) return "text-amber-500" // Eagle or better
  if (diff === -1) return "text-ak-success" // Birdie
  if (diff === 0) return "text-text-primary" // Par
  if (diff === 1) return "text-ak-warning" // Bogey
  return "text-ak-error" // Double bogey or worse
}

const getScoreLabel = (score: number, par?: number) => {
  if (!par) return null
  const diff = score - par
  if (diff <= -3) return "Albatross"
  if (diff === -2) return "Eagle"
  if (diff === -1) return "Birdie"
  if (diff === 0) return "Par"
  if (diff === 1) return "Bogey"
  if (diff === 2) return "Double"
  if (diff === 3) return "Triple"
  return `+${diff}`
}

const sizeConfig = {
  sm: {
    container: "gap-1",
    button: "h-7 w-7",
    value: "text-lg w-8",
    iconSize: 12,
  },
  md: {
    container: "gap-2",
    button: "h-9 w-9",
    value: "text-2xl w-12",
    iconSize: 16,
  },
  lg: {
    container: "gap-3",
    button: "h-11 w-11",
    value: "text-3xl w-16",
    iconSize: 20,
  },
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 15,
  par,
  label,
  disabled = false,
  size = "md",
  className,
}) => {
  const config = sizeConfig[size]
  const scoreColor = getScoreColor(value, par)
  const scoreLabel = getScoreLabel(value, par)

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && (
        <span className="text-xs font-medium text-text-secondary mb-1">
          {label}
        </span>
      )}

      <div className={cn("flex items-center", config.container)}>
        <Button
          variant="outline"
          size="icon"
          className={config.button}
          onClick={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Minus style={{ width: config.iconSize, height: config.iconSize }} />
        </Button>

        <span
          className={cn(
            "font-bold tabular-nums text-center",
            config.value,
            scoreColor
          )}
        >
          {value}
        </span>

        <Button
          variant="outline"
          size="icon"
          className={config.button}
          onClick={handleIncrement}
          disabled={disabled || value >= max}
        >
          <Plus style={{ width: config.iconSize, height: config.iconSize }} />
        </Button>
      </div>

      {par && scoreLabel && (
        <span className={cn("text-xs font-medium mt-1", scoreColor)}>
          {scoreLabel}
        </span>
      )}
    </div>
  )
}

export default ScoreInput
