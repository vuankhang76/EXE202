import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, Users, ShoppingCart, ArrowUp, ArrowDown } from "lucide-react";
import type { RevenueAnalytics } from "@/types/dashboard";

interface RevenueKPICardsProps {
  data: RevenueAnalytics | null;
  loading: boolean;
}

export default function RevenueKPICards({ data, loading }: RevenueKPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const kpiCards = [
    {
      title: "Tổng doanh thu",
      value: data?.totalRevenue || 0,
      format: formatCurrency,
      growth: data?.revenueGrowth || 0,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Bệnh nhân mới",
      value: data?.newPatients || 0,
      format: (val: number) => val.toString(),
      growth: data?.patientGrowth || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Đơn dịch vụ",
      value: data?.totalServiceOrders || 0,
      format: (val: number) => val.toString(),
      growth: data?.orderGrowth || 0,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.growth > 0;
        const GrowthIcon = isPositive ? ArrowUp : ArrowDown;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpi.format(kpi.value)}</div>
                  {kpi.growth !== 0 && (
                    <div className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      <GrowthIcon className="h-3 w-3 mr-1" />
                      <span>{Math.abs(kpi.growth).toFixed(1)}%</span>
                      <span className="text-gray-500 ml-1">so với kỳ trước</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
