import { Pie, PieChart, Cell, Legend } from "recharts"
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

interface PieChartData {
  name: string;
  value: number;
  fill?: string;
}

interface PieChartComponentProps {
  title: string;
  description?: string;
  data: PieChartData[];
  colors?: string[];
  showLegend?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function PieChartComponent({
  title,
  description,
  data,
  colors = DEFAULT_COLORS,
  showLegend = true,
  className,
}: PieChartComponentProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill || colors[index % colors.length],
  }))

  const chartConfig = chartData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill,
    }
    return acc
  }, {} as any)

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="mx-auto aspect-square max-h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Không có dữ liệu</p>
              <p className="text-sm">Chưa có dữ liệu để hiển thị biểu đồ</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="min-w-[200px]"
                  formatter={(value, name) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{name}</span>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold">
                          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}đ
                        </span>
                        <span className="text-muted-foreground">
                          ({((Number(value) / total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              label={(entry: any) =>
                `${(entry.percent * 100).toFixed(0)}%`
              }
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {showLegend && <Legend />}
          </PieChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
