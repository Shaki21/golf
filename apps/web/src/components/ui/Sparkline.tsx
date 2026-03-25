import * as React from "react"
import { cn } from "lib/utils"

// =============================================================================
// SPARKLINE COMPONENT
// Compact trend visualization for KPI cards
// Uses inline SVG for minimal dependencies
// =============================================================================

export interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[]
  width?: number
  height?: number
  color?: "primary" | "success" | "warning" | "danger" | "gray"
  showDot?: boolean
  strokeWidth?: number
}

const getColorValue = (color: SparklineProps["color"]): string => {
  switch (color) {
    case "success":
      return "var(--tier-success)"
    case "warning":
      return "var(--tier-warning)"
    case "danger":
      return "var(--tier-error)"
    case "gray":
      return "var(--gray-500)"
    case "primary":
    default:
      return "var(--tier-primary)"
  }
}

const Sparkline = React.forwardRef<HTMLDivElement, SparklineProps>(
  (
    {
      className,
      data,
      width = 80,
      height = 24,
      color = "primary",
      showDot = false,
      strokeWidth = 1.5,
      ...props
    },
    ref
  ) => {
    // Handle empty or single-point data
    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          className={cn("inline-block", className)}
          style={{ width, height }}
          {...props}
        />
      )
    }

    // Calculate min/max for scaling
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Avoid division by zero

    // Add padding to prevent clipping
    const padding = strokeWidth + (showDot ? 3 : 0)
    const effectiveHeight = height - padding * 2
    const effectiveWidth = width - padding * 2

    // Generate path points
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * effectiveWidth
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight
      return { x, y }
    })

    // Create SVG path
    const pathD = points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      return `${acc} L ${point.x} ${point.y}`
    }, "")

    const strokeColor = getColorValue(color)
    const lastPoint = points[points.length - 1]

    return (
      <div
        ref={ref}
        className={cn("inline-block", className)}
        {...props}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current value dot */}
          {showDot && lastPoint && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={3}
              fill={strokeColor}
            />
          )}
        </svg>
      </div>
    )
  }
)

Sparkline.displayName = "Sparkline"

export { Sparkline }
