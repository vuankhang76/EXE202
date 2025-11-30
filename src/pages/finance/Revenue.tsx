import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import RevenueKPICards from "@/components/finance/RevenueKPICards";
import RevenueCharts from "@/components/finance/RevenueCharts";
import DateRangeFilter from "@/components/finance/DateRangeFilter";
import dashboardService from "@/services/dashboardService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { RevenueAnalytics } from "@/types/dashboard";

export default function Revenue() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<{
    fromDate: Date;
    toDate: Date;
    preset: string;
  }>({
    fromDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    toDate: new Date(),
    preset: "6months",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (!tenantId) {
        toast.error("Không thể tải dữ liệu doanh thu. Vui lòng liên hệ quản trị viên.");
        return;
      }

      const result = await dashboardService.getRevenueAnalytics(
        dateRange.fromDate,
        dateRange.toDate
      );

      if (result.success && result.data) {
        setRevenueData(result.data);
      } else {
        toast.error("Không thể tải dữ liệu doanh thu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [tenantId, dateRange.fromDate, dateRange.toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const handleDateRangeChange = (fromDate: Date, toDate: Date, preset: string) => {
    setDateRange({ fromDate, toDate, preset });
  };

  return (
    <AdminLayout
      breadcrumbTitle="Doanh thu"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      }
    >
      <DateRangeFilter
        fromDate={dateRange.fromDate}
        toDate={dateRange.toDate}
        preset={dateRange.preset}
        onChange={handleDateRangeChange}
      />

      <RevenueKPICards data={revenueData} loading={loading} />

      <RevenueCharts data={revenueData} loading={loading} />
    </AdminLayout>
  );
}
