import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, TrendingUp, Clock, RefreshCcw } from "lucide-react";
import { formatCurrency } from "@/types/paymentTransaction";
import type { PaymentStatisticsDto } from "@/types/paymentTransaction";

interface PaymentStatsProps {
  stats?: PaymentStatisticsDto;
  loading?: boolean;
}

export default function PaymentStats({ stats, loading }: PaymentStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const safeStats = stats || {
    totalTransactions: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    transactionsByMethod: {},
    transactionsByStatus: {},
    dailySummary: []
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(safeStats.totalAmount)}</div>
          <p className="text-xs text-muted-foreground">
            {safeStats.totalTransactions} giao dịch
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(safeStats.completedAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {safeStats.transactionsByStatus['COMPLETED'] || 0} giao dịch thành công
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(safeStats.pendingAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {safeStats.transactionsByStatus['PENDING'] || 0} giao dịch đang chờ
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã hoàn tiền</CardTitle>
          <RefreshCcw className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(safeStats.refundedAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {safeStats.transactionsByStatus['REFUNDED'] || 0} giao dịch hoàn tiền
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

