import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  description?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {(trend || description) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <div className={cn('flex items-center gap-1', getTrendColor())}>
                {getTrendIcon()}
                {trendValue !== undefined && (
                  <span className="font-medium">
                    {trendValue > 0 ? '+' : ''}{trendValue}%
                  </span>
                )}
              </div>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
