import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/Chart';
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartsProps {
  title: string;
  data: ChartData[];
  type?: 'line' | 'bar' | 'area';
  dataKey?: string;
  xAxisKey?: string;
  className?: string;
}

const chartConfig = {
  value: {
    label: 'Giá trị',
    color: 'hsl(var(--chart-1))',
  },
};

export default function Charts({
  title,
  data,
  type = 'line',
  dataKey = 'value',
  xAxisKey = 'name',
  className,
}: ChartsProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 10, left: 10, bottom: 5 },
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey={dataKey} 
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
            />
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))' }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
