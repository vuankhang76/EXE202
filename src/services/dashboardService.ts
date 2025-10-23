import apiUtils from '@/api/axios';
import type { ApiResponse } from '@/models/ApiResponse';
import type { 
  DashboardOverview, 
  DashboardCharts, 
  RevenueAnalytics, 
  RecentOrder,
  DashboardWidget 
} from '@/types/dashboard';

class DashboardService {
  private baseUrl = '/dashboard';

  /**
   * Get dashboard overview data
   */
  async getDashboardOverview(
    fromDate?: Date,
    toDate?: Date
  ): Promise<ApiResponse<DashboardOverview>> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await apiUtils.get<ApiResponse<DashboardOverview>>(
        `${this.baseUrl}/overview${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get dashboard charts data
   */
  async getDashboardCharts(
    chartType: string = 'all',
    fromDate?: Date,
    toDate?: Date,
    groupBy: string = 'day'
  ): Promise<ApiResponse<DashboardCharts>> {
    try {
      const params = new URLSearchParams();
      params.append('chartType', chartType);
      params.append('groupBy', groupBy);
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await apiUtils.get<ApiResponse<DashboardCharts>>(
        `${this.baseUrl}/charts?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard charts:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    fromDate?: Date,
    toDate?: Date
  ): Promise<ApiResponse<RevenueAnalytics>> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());

      const response = await apiUtils.get<ApiResponse<RevenueAnalytics>>(
        `${this.baseUrl}/revenue-analytics${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<ApiResponse<RecentOrder[]>> {
    try {
      const response = await apiUtils.get<ApiResponse<RecentOrder[]>>(
        `${this.baseUrl}/recent-orders?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  }

  /**
   * Get dashboard widgets
   */
  async getDashboardWidgets(): Promise<ApiResponse<DashboardWidget[]>> {
    try {
      const response = await apiUtils.get<ApiResponse<DashboardWidget[]>>(
        `${this.baseUrl}/widgets`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
      throw error;
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
