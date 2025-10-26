import { useEffect } from 'react';
import AdminLayout from "@/layout/AdminLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import Charts from "@/components/dashboard/Charts";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import dashboardService from "@/services/dashboardService";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Bell,
  TrendingUp,
  UserPlus,
  ShoppingCart,
  AlertCircle
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
  const { overview, recentOrders, lastUpdated, cacheExpiration } = useDashboardData();
  const loading = useDashboardLoading();

  useEffect(() => {
    // Check if we have valid cached data
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      // Use cached data, no need to reload
      return;
    }

    // Load fresh data if cache is invalid or expired
    loadDashboardData();
  }, [lastUpdated, cacheExpiration]);

  const loadDashboardData = async () => {
    dispatch(setLoading(true));
    try {
      // Load overview data
      const overviewResult = await dashboardService.getDashboardOverview();
      const overviewData = overviewResult.success ? overviewResult.data : null;

      // Load recent orders
      const ordersResult = await dashboardService.getRecentOrders(10);
      const ordersData = ordersResult.success ? ordersResult.data : [];

      // Update Redux store with data
      dispatch(setDashboardData({
        overview: overviewData ?? null,
        recentOrders: ordersData ?? [],
      }));

      if (!overviewResult.success || !ordersResult.success) {
        toast.error('Không thể tải đầy đủ dữ liệu dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
      dispatch(clearDashboardData());
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Transform data for charts
  const getAppointmentChartData = () => {
    if (!overview?.consultationsByDay) return [];
    return Object.entries(overview.consultationsByDay).map(([date, count]) => ({
      name: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      value: count,
    }));
  };

  const getTopDiagnosisData = () => {
    if (!overview?.topDiagnosis) return [];
    return Object.entries(overview.topDiagnosis)
      .slice(0, 10)
      .map(([diagnosis, count]) => ({
        name: diagnosis,
        value: count,
      }));
  };

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
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Tổng số bệnh nhân"
            value={overview?.totalPatients || 0}
            icon={Users}
            description="Tổng số bệnh nhân đã đăng ký"
          />
          <StatsCard
            title="Bác sĩ"
            value={overview?.totalDoctors || 0}
            icon={Stethoscope}
            description="Tổng số bác sĩ"
          />
          <StatsCard
            title="Lịch hẹn hôm nay"
            value={overview?.todayAppointments || 0}
            icon={Calendar}
            trend={overview?.todayAppointments && overview.todayAppointments > 0 ? 'up' : 'stable'}
            description="Lịch hẹn trong ngày"
          />
          <StatsCard
            title="Thông báo chưa đọc"
            value={overview?.unreadNotifications || 0}
            icon={Bell}
            trend={overview?.unreadNotifications && overview.unreadNotifications > 0 ? 'down' : 'stable'}
            description="Thông báo cần xem"
          />
        </div>

        {/* Business KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Doanh thu"
            value={`${(overview?.totalRevenue || 0).toLocaleString('vi-VN')}đ`}
            icon={TrendingUp}
            trend="up"
            trendValue={12.5}
            description="So với tháng trước"
          />
          <StatsCard
            title="Bệnh nhân mới"
            value={overview?.newPatientsThisMonth || 0}
            icon={UserPlus}
            trend="up"
            trendValue={8.2}
            description="Trong tháng này"
          />
          <StatsCard
            title="Đơn dịch vụ"
            value={overview?.totalServiceOrders || 0}
            icon={ShoppingCart}
            description="Tổng đơn đặt dịch vụ"
          />
          <StatsCard
            title="Quá hạn thanh toán"
            value={`${(overview?.overduePaymentAmount || 0).toLocaleString('vi-VN')}đ`}
            icon={AlertCircle}
            trend="down"
            description="Cần xử lý"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Charts
            title="Lượt khám theo ngày"
            data={getAppointmentChartData()}
            type="line"
          />
          <Charts
            title="Chẩn đoán phổ biến"
            data={getTopDiagnosisData()}
            type="bar"
          />
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </AdminLayout>
  );
}
