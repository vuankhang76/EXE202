import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

interface DataPoint {
  name: string;
  [key: string]: number | string;
}

interface LineChartMultipleProps {
  title: string;
  description?: string;
  data: DataPoint[];
  dataKeys: { key: string; label: string; color: string }[];
  showDots?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function LineChartMultiple({
  title,
  description,
  data,
  dataKeys,
  showDots = true,
  showLegend = true,
  className,
}: LineChartMultipleProps) {
  const chartConfig = dataKeys.reduce((acc, key) => {
    acc[key.key] = {
      label: key.label,
      color: key.color,
    }
    return acc
  }, {} as any)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Không có dữ liệu</p>
              <p className="text-sm">Chưa có dữ liệu để hiển thị biểu đồ</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            {dataKeys.map((key) => (
              <Line
                key={key.key}
                dataKey={key.key}
                type="monotone"
                stroke={key.color}
                strokeWidth={2}
                dot={showDots ? {
                  fill: key.color,
                  r: 4,
                } : false}
                activeDot={{
                  r: 6,
                }}
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </LineChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
