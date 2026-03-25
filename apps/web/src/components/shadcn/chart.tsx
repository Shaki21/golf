import * as React from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"

// TIER Golf color palette for charts
export const chartColors = {
  primary: "var(--tier-primary)",
  primaryLight: "var(--tier-primary-light)",
  success: "var(--tier-success)",
  warning: "var(--tier-warning)",
  error: "var(--tier-error)",
  gold: "var(--tier-gold)",
  mist: "var(--tier-mist)",
  steel: "var(--tier-steel)",
  // Training categories
  fysisk: "var(--category-fys)",
  teknikk: "var(--category-tek)",
  slag: "var(--category-slag)",
  spill: "var(--category-spill)",
  turnering: "var(--category-turn)",
}

// Preset color arrays for multi-series charts
export const categoryColorArray = [
  chartColors.fysisk,
  chartColors.teknikk,
  chartColors.slag,
  chartColors.spill,
  chartColors.turnering,
]

export const statusColorArray = [
  chartColors.success,
  chartColors.warning,
  chartColors.error,
]

// Custom tooltip component
interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
  formatter?: (value: number, name: string) => string
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
}) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border-subtle bg-white p-3 shadow-lg">
      {label && (
        <p className="mb-2 text-sm font-medium text-text-primary">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="font-medium text-text-primary">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Pre-configured chart components for golf coaching
interface BaseChartProps {
  data: Array<Record<string, unknown>>
  className?: string
  height?: number
}

interface LineChartProps extends BaseChartProps {
  dataKeys: string[]
  xAxisKey?: string
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
}

export const GolfLineChart: React.FC<LineChartProps> = ({
  data,
  dataKeys,
  xAxisKey = "name",
  colors = [chartColors.primary, chartColors.success, chartColors.warning],
  showGrid = true,
  showLegend = true,
  className,
  height = 300,
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-mist)" />}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--tier-mist)" }}
          />
          <YAxis
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--tier-mist)" }}
          />
          <Tooltip content={<ChartTooltip />} />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AreaChartProps extends BaseChartProps {
  dataKeys: string[]
  xAxisKey?: string
  colors?: string[]
  stacked?: boolean
}

export const GolfAreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKeys,
  xAxisKey = "name",
  colors = [chartColors.primary, chartColors.primaryLight],
  stacked = false,
  className,
  height = 300,
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-mist)" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "1" : undefined}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface BarChartProps extends BaseChartProps {
  dataKeys: string[]
  xAxisKey?: string
  colors?: string[]
  stacked?: boolean
  horizontal?: boolean
}

export const GolfBarChart: React.FC<BarChartProps> = ({
  data,
  dataKeys,
  xAxisKey = "name",
  colors = categoryColorArray,
  stacked = false,
  horizontal = false,
  className,
  height = 300,
}) => {
  const Chart = horizontal ? BarChart : BarChart

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <Chart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tier-mist)" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            </>
          )}
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stacked ? "1" : undefined}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}

interface PieChartProps extends BaseChartProps {
  dataKey: string
  nameKey?: string
  colors?: string[]
  innerRadius?: number
  showLabels?: boolean
}

export const GolfPieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey = "name",
  colors = categoryColorArray,
  innerRadius = 0,
  showLabels = true,
  className,
  height = 300,
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            label={showLabels ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : false}
            labelLine={showLabels}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface RadarChartProps extends BaseChartProps {
  dataKeys: string[]
  angleKey?: string
  colors?: string[]
}

export const GolfRadarChart: React.FC<RadarChartProps> = ({
  data,
  dataKeys,
  angleKey = "category",
  colors = [chartColors.primary, chartColors.success],
  className,
  height = 300,
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--tier-mist)" />
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <PolarRadiusAxis tick={{ fill: "var(--text-secondary)", fontSize: 10 }} />
          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              name={key}
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Export all recharts primitives for advanced use
export {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
}
