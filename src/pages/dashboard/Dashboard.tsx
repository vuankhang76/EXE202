import { useEffect, useMemo } from 'react';
import AdminLayout from "@/layout/AdminLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import Charts from "@/components/dashboard/Charts";
import { InteractiveBarChart } from "@/components/dashboard/InteractiveBarChart";
import { PieChartComponent } from "@/components/dashboard/PieChartComponent";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import dashboardService from "@/services/dashboardService";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp,
  UserPlus,
  ShoppingCart,
  AlertCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useAppDispatch,
  useDashboardData,
  useDashboardLoading,
  isCacheValid
} from "@/stores/hooks";
import {
  setLoading,
  setDashboardData,
  clearDashboardData
} from "@/stores/dashboardSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { overview, recentOrders, revenueAnalytics, lastUpdated, cacheExpiration } = useDashboardData();
  const loading = useDashboardLoading();

  useEffect(() => {
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      return;
    }

    loadDashboardData();
  }, [lastUpdated, cacheExpiration]);

  const loadDashboardData = async () => {
    dispatch(setLoading(true));
    try {
      const [overviewResult, ordersResult, analyticsResult] = await Promise.all([
        dashboardService.getDashboardOverview(),
        dashboardService.getRecentOrders(10),
        dashboardService.getRevenueAnalytics(),
      ]);

      const overviewData = overviewResult.success ? overviewResult.data : null;
      const ordersData = ordersResult.success ? ordersResult.data : [];
      const analyticsData = analyticsResult.success ? analyticsResult.data : null;

      dispatch(setDashboardData({
        overview: overviewData ?? null,
        recentOrders: ordersData ?? [],
        revenueAnalytics: analyticsData ?? null,
      }));

      if (!overviewResult.success || !ordersResult.success) {
        toast.error('Không thể tải đầy đủ dữ liệu dashboard');
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu dashboard');
      dispatch(clearDashboardData());
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getRevenueByMonthData = useMemo(() => {
    if (!revenueAnalytics?.revenueByMonth) return [];
    return Object.entries(revenueAnalytics.revenueByMonth).map(([month, revenue]) => ({
      name: `Tháng ${month}`,
      value: revenue,
    }));
  }, [revenueAnalytics?.revenueByMonth]);

  const getTopServicesData = useMemo(() => {
    if (!revenueAnalytics?.topServices) return [];
    return Object.entries(revenueAnalytics.topServices)
      .slice(0, 8)
      .map(([service, count]) => ({
        name: service,
        value: count,
      }));
  }, [revenueAnalytics?.topServices]);

  const getServiceRevenueData = useMemo(() => {
    if (!revenueAnalytics?.serviceRevenueDistribution) return [];
    return Object.entries(revenueAnalytics.serviceRevenueDistribution)
      .slice(0, 8)
      .map(([service, revenue]) => ({
        name: service,
        value: revenue,
      }));
  }, [revenueAnalytics?.serviceRevenueDistribution]);

  const getRevenueInteractiveData = useMemo(() => {
    if (overview?.revenueByDay && Object.keys(overview.revenueByDay).length > 0) {
      const entries = Object.entries(overview.revenueByDay);
      
      const revenueMap = new Map(entries.map(([day, revenue]) => [day, revenue]));
      
      const toDate = overview.toDate ? new Date(overview.toDate) : new Date();
      const fromDate = overview.fromDate ? new Date(overview.fromDate) : new Date(toDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const result = [];
      const currentDate = new Date(fromDate);
      
      while (currentDate <= toDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          revenue: revenueMap.get(dateStr) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return result;
    }
    
    if (!revenueAnalytics?.revenueByMonth) {
      return [];
    }
    const entries = Object.entries(revenueAnalytics.revenueByMonth);
    
    if (entries.length === 0) {
      return [];
    }
    
    const result = entries.map(([month, revenue]) => ({
      date: `${month}-01`,
      revenue,
    }));

    return result;
  }, [overview?.revenueByDay, revenueAnalytics?.revenueByMonth]);

  const getServiceRevenuePieData = useMemo(() => {
    if (!revenueAnalytics?.serviceRevenueDistribution) {
      return [];
    }
    const data = Object.entries(revenueAnalytics.serviceRevenueDistribution)
      .slice(0, 5)
      .map(([service, revenue]) => ({
        name: service,
        value: revenue,
      }));
    return data;
  }, [revenueAnalytics?.serviceRevenueDistribution]);

  if (loading) {
    return (
      <AdminLayout breadcrumbTitle="Tổng quan">
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbTitle="Tổng quan">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Doanh thu"
            value={`${(overview?.totalRevenue || 0).toLocaleString('vi-VN')}đ`}
            icon={TrendingUp}
            trend={
              !revenueAnalytics?.revenueGrowth || revenueAnalytics.revenueGrowth === 0
                ? undefined
                : revenueAnalytics.revenueGrowth > 0
                ? 'up'
                : 'down'
            }
            trendValue={revenueAnalytics?.revenueGrowth ? Math.abs(revenueAnalytics.revenueGrowth) : undefined}
            description="So với kỳ trước"
          />
          <StatsCard
            title="Bệnh nhân mới"
            value={overview?.newPatientsThisMonth || 0}
            icon={UserPlus}
            trend={
              !revenueAnalytics?.patientGrowth || revenueAnalytics.patientGrowth === 0
                ? undefined
                : revenueAnalytics.patientGrowth > 0
                ? 'up'
                : 'down'
            }
            trendValue={revenueAnalytics?.patientGrowth ? Math.abs(revenueAnalytics.patientGrowth) : undefined}
            description="Trong tháng này"
          />
          <StatsCard
            title="Lịch hẹn hôm nay"
            value={overview?.todayAppointments || 0}
            icon={Calendar}
            trend={overview?.todayAppointments && overview.todayAppointments > 0 ? 'up' : 'stable'}
            description="Lịch hẹn trong ngày"
          />
          <StatsCard
            title="Tỷ lệ quay lại"
            value={`${(overview?.patientReturnRate || 0).toFixed(1)}%`}
            icon={Activity}
            trend={
              !revenueAnalytics?.returnRateChange || revenueAnalytics.returnRateChange === 0
                ? undefined
                : revenueAnalytics.returnRateChange > 0
                ? 'up'
                : 'down'
            }
            trendValue={revenueAnalytics?.returnRateChange ? Math.abs(revenueAnalytics.returnRateChange) : undefined}
            description="Bệnh nhân tái khám"
          />
        </div>

        <InteractiveBarChart
          title="Xu hướng doanh thu"
          description="Theo dõi doanh thu theo thời gian"
          data={getRevenueInteractiveData}
          dataKeys={[
            { key: "revenue", label: "Doanh thu", color: "hsl(var(--chart-1))" },
          ]}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Charts
            title="Doanh thu theo tháng"
            data={getRevenueByMonthData}
            type="bar"
            dataKey="value"
            chartColor="hsl(var(--chart-1))"
          />
          <PieChartComponent
            title="Phân bổ doanh thu theo dịch vụ"
            description="Top 5 dịch vụ có doanh thu cao nhất"
            data={getServiceRevenuePieData}
            showLegend={true}
            colors={[
              "hsl(var(--chart-1))",
              "hsl(var(--chart-2))",
              "hsl(var(--chart-3))",
              "hsl(var(--chart-4))",
              "hsl(var(--chart-5))",
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Charts
            title="Dịch vụ được sử dụng nhiều nhất"
            data={getTopServicesData}
            type="bar"
            dataKey="value"
            chartColor="hsl(var(--chart-1))"
          />
          <Charts
            title="Doanh thu chi tiết theo dịch vụ"
            data={getServiceRevenueData}
            type="area"
            dataKey="value"
            chartColor="hsl(var(--chart-1))"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-1">
          <div className="grid gap-4 grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Tổng bệnh nhân"
              value={overview?.totalPatients || 0}
              icon={Users}
              description="Đã đăng ký"
            />
            <StatsCard
              title="Tổng bác sĩ"
              value={overview?.totalDoctors || 0}
              icon={Stethoscope}
              description="Đang hoạt động"
            />
            <StatsCard
              title="Đơn dịch vụ"
              value={overview?.totalServiceOrders || 0}
              icon={ShoppingCart}
              trend={
                !revenueAnalytics?.orderGrowth || revenueAnalytics.orderGrowth === 0
                  ? undefined
                  : revenueAnalytics.orderGrowth > 0
                  ? 'up'
                  : 'down'
              }
              trendValue={revenueAnalytics?.orderGrowth ? Math.abs(revenueAnalytics.orderGrowth) : undefined}
              description="Tổng đơn đặt"
            />
            <StatsCard
              title="Quá hạn thanh toán"
              value={`${(overview?.overduePaymentAmount || 0).toLocaleString('vi-VN')}đ`}
              icon={AlertCircle}
              trend={
                !revenueAnalytics?.overdueChange || revenueAnalytics.overdueChange === 0
                  ? undefined
                  : revenueAnalytics.overdueChange > 0
                  ? 'up'
                  : 'down'
              }
              trendValue={revenueAnalytics?.overdueChange ? Math.abs(revenueAnalytics.overdueChange) : undefined}
              description="Cần xử lý"
            />
          </div>
        </div>

        <RecentOrdersTable orders={recentOrders} />
      </div>
    </AdminLayout>
  );
}
