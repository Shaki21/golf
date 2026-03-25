import * as React from "react"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { cn } from "lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "../card"

interface SkillData {
  category: string
  value: number
  fullMark?: number
}

interface MergedSkillData {
  category: string
  value: number
  compareValue?: number
  fullMark?: number
}

interface SkillRadarProps {
  data: SkillData[]
  title?: string
  subtitle?: string
  showCard?: boolean
  height?: number
  color?: string
  compareData?: SkillData[]
  compareColor?: string
  compareLabel?: string
  className?: string
}

export const SkillRadar: React.FC<SkillRadarProps> = ({
  data,
  title,
  subtitle,
  showCard = true,
  height = 300,
  color = "var(--tier-primary)",
  compareData,
  compareColor = "var(--tier-success)",
  compareLabel,
  className,
}) => {
  // Merge data for comparison if compareData is provided
  const chartData: MergedSkillData[] = React.useMemo(() => {
    if (!compareData) return data

    return data.map((item, index) => ({
      ...item,
      compareValue: compareData[index]?.value ?? 0,
    }))
  }, [data, compareData])

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="var(--tier-mist)" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
        />
        <Radar
          name="Nåværende"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {compareData && (
          <Radar
            name={compareLabel || "Sammenligning"}
            dataKey="compareValue"
            stroke={compareColor}
            fill={compareColor}
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
        {compareData && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  )

  if (!showCard) {
    return <div className={className}>{chartContent}</div>
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || subtitle) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="pt-0">{chartContent}</CardContent>
    </Card>
  )
}

export default SkillRadar
