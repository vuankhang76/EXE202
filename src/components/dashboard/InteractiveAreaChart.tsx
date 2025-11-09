import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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

interface InteractiveAreaChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  dataKeys: { key: string; label: string; color: string }[];
  timeRanges?: { value: string; label: string; days: number }[];
}

export function InteractiveAreaChart({
  title,
  description,
  data,
  dataKeys,
  timeRanges = [
    { value: "90d", label: "90 ngày gần nhất", days: 90 },
    { value: "30d", label: "30 ngày gần nhất", days: 30 },
    { value: "7d", label: "7 ngày gần nhất", days: 7 },
  ],
}: InteractiveAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState(timeRanges[1]?.value || timeRanges[0].value)
  
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
    
    if (filtered.length === 0 && data.length > 0) {
      return data;
    }
    
    return filtered;
  }, [data, timeRange, timeRanges])

  const chartConfig = React.useMemo(() => {
    const config: any = {}
    dataKeys.forEach((key) => {
      config[key.key] = {
        label: key.label,
        color: key.color,
      }
    })
    return config
  }, [dataKeys])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[180px] rounded-lg sm:ml-auto"
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
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Không có dữ liệu</p>
              <p className="text-sm">Chưa có dữ liệu để hiển thị biểu đồ</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full"
          >
            <AreaChart data={filteredData}>
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key.key} id={`fill${key.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={key.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={key.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key.key}
                dataKey={key.key}
                type="natural"
                fill={`url(#fill${key.key})`}
                stroke={key.color}
                stackId={index === 0 ? "a" : undefined}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
