import * as React from "react"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { cn } from "lib/utils"
import { Button } from "../button"
import { Card, CardContent } from "../card"

interface SessionTimerProps {
  initialSeconds?: number
  onComplete?: (totalSeconds: number) => void
  onTick?: (seconds: number) => void
  autoStart?: boolean
  showCard?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

const sizeConfig = {
  sm: {
    time: "text-2xl",
    buttons: "h-8 w-8",
    iconSize: 14,
  },
  md: {
    time: "text-4xl",
    buttons: "h-10 w-10",
    iconSize: 18,
  },
  lg: {
    time: "text-6xl",
    buttons: "h-12 w-12",
    iconSize: 24,
  },
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  initialSeconds = 0,
  onComplete,
  onTick,
  autoStart = false,
  showCard = true,
  size = "md",
  className,
}) => {
  const [seconds, setSeconds] = React.useState(initialSeconds)
  const [isRunning, setIsRunning] = React.useState(autoStart)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const sizes = sizeConfig[size]

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1
          onTick?.(newSeconds)
          return newSeconds
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, onTick])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleStop = () => {
    setIsRunning(false)
    onComplete?.(seconds)
  }
  const handleReset = () => {
    setIsRunning(false)
    setSeconds(initialSeconds)
  }

  const timerContent = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "font-mono font-bold tabular-nums text-text-primary",
          sizes.time,
          isRunning && "text-ak-primary"
        )}
      >
        {formatTime(seconds)}
      </div>
      <div className="flex items-center gap-2">
        {!isRunning ? (
          <Button
            variant="default"
            size="icon"
            className={sizes.buttons}
            onClick={handleStart}
          >
            <Play style={{ width: sizes.iconSize, height: sizes.iconSize }} />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            className={sizes.buttons}
            onClick={handlePause}
          >
            <Pause style={{ width: sizes.iconSize, height: sizes.iconSize }} />
          </Button>
        )}
        <Button
          variant="destructive"
          size="icon"
          className={sizes.buttons}
          onClick={handleStop}
          disabled={seconds === 0}
        >
          <Square style={{ width: sizes.iconSize, height: sizes.iconSize }} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={sizes.buttons}
          onClick={handleReset}
        >
          <RotateCcw style={{ width: sizes.iconSize, height: sizes.iconSize }} />
        </Button>
      </div>
      {seconds > 0 && (
        <p className="text-sm text-text-secondary">
          {Math.floor(seconds / 60)} min {seconds % 60} sek
        </p>
      )}
    </div>
  )

  if (!showCard) {
    return <div className={className}>{timerContent}</div>
  }

  return (
    <Card className={className}>
      <CardContent className="py-6">{timerContent}</CardContent>
    </Card>
  )
}

export default SessionTimer
