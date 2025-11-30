import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import type { PaymentStatisticsDto } from "@/types/paymentTransaction";

interface TransactionStatsProps {
  stats?: PaymentStatisticsDto;
  loading: boolean;
}

export default function TransactionStats({ stats, loading }: TransactionStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statCards = [
    {
      title: "Tổng giao dịch",
      value: stats?.totalTransactions || 0,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đã hoàn thành",
      value: formatCurrency(stats?.completedAmount || 0),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Đang chờ",
      value: formatCurrency(stats?.pendingAmount || 0),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
