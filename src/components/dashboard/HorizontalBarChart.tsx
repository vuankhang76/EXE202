import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
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

interface DataPoint {
  name: string;
  value: number;
}

interface HorizontalBarChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  color?: string;
  className?: string;
}

export function HorizontalBarChart({
  title,
  description,
  data,
  color = "hsl(var(--chart-1))",
  className,
}: HorizontalBarChartProps) {
  const chartConfig = {
    value: {
      label: "Giá trị",
      color: color,
    },
  }

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
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill={color} radius={5} />
          </BarChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
