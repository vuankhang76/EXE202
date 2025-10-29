"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

interface DataPoint {
  date: string;
  [key: string]: number | string;
}

interface InteractiveBarChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  dataKeys: { key: string; label: string; color: string }[];
  timeRanges?: { value: string; label: string; days: number }[];
}

export function InteractiveBarChart({
  title,
  description,
  data,
  dataKeys,
  timeRanges = [
    { value: "90d", label: "90 ngày gần nhất", days: 90 },
    { value: "30d", label: "30 ngày gần nhất", days: 30 },
    { value: "7d", label: "7 ngày gần nhất", days: 7 },
  ],
}: InteractiveBarChartProps) {
  const [timeRange, setTimeRange] = React.useState(timeRanges[1]?.value || timeRanges[0].value)
  const [activeChart, setActiveChart] = React.useState<string>(dataKeys[0]?.key || "revenue")

  // Debug logging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`📊 [${title}] Received data:`, data);
      console.log(`📊 [${title}] Data length:`, data.length);
    }
  }, [data, title]);

  const filteredData = React.useMemo(() => {
    const selectedRange = timeRanges.find((r) => r.value === timeRange)
    if (!selectedRange || !data.length) return data

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - selectedRange.days)

    const filtered = data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })
    
    if (import.meta.env.DEV) {
      console.log(`📊 Filtered data (${timeRange}):`, filtered);
      console.log(`📊 Filter range: ${startDate.toISOString()} to ${now.toISOString()}`);
    }
    
    // If filter results in empty data but we have data available, show all data
    if (filtered.length === 0 && data.length > 0) {
      if (import.meta.env.DEV) {
        console.log(`⚠️ No data in selected range, showing all available data instead`);
      }
      return data;
    }
    
    return filtered;
  }, [data, timeRange, timeRanges])

  const chartConfig = React.useMemo(() => {
    const config: any = {
      views: {
        label: "Doanh thu",
      },
    }
    dataKeys.forEach((key) => {
      config[key.key] = {
        label: key.label,
        color: key.color,
      }
    })
    return config
  }, [dataKeys])

  const total = React.useMemo(() => {
    const totals: Record<string, number> = {}
    dataKeys.forEach((key) => {
      totals[key.key] = filteredData.reduce((acc, curr) => acc + (Number(curr[key.key]) || 0), 0)
    })
    return totals
  }, [filteredData, dataKeys])

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex">
          {dataKeys.map((keyConfig) => {
            const chart = keyConfig.key
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {keyConfig.label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[chart].toLocaleString('vi-VN')}đ
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 px-6 py-4 sm:py-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Chọn khoảng thời gian"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value} className="rounded-lg">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {filteredData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Không có dữ liệu</p>
              <p className="text-sm">Chưa có dữ liệu để hiển thị biểu đồ</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={filteredData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Bar 
                dataKey={activeChart} 
                fill={`var(--color-${activeChart})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
