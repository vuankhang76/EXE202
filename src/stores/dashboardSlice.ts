import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashboardOverview, RecentOrder, RevenueAnalytics } from '@/types/dashboard';

interface DashboardState {
  overview: DashboardOverview | null;
  recentOrders: RecentOrder[];
  revenueAnalytics: RevenueAnalytics | null;
  loading: boolean;
  lastUpdated: number | null;
  cacheExpiration: number; // milliseconds
}

const initialState: DashboardState = {
  overview: null,
  recentOrders: [],
  revenueAnalytics: null,
  loading: false,
  lastUpdated: null,
  cacheExpiration: 5 * 60 * 1000, // 5 minutes cache
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDashboardData(
      state,
      action: PayloadAction<{
        overview: DashboardOverview | null;
        recentOrders: RecentOrder[];
        revenueAnalytics?: RevenueAnalytics | null;
      }>
    ) {
      state.overview = action.payload.overview;
      state.recentOrders = action.payload.recentOrders;
      if (action.payload.revenueAnalytics !== undefined) {
        state.revenueAnalytics = action.payload.revenueAnalytics;
      }
      state.lastUpdated = Date.now();
    },
    setOverview(state, action: PayloadAction<DashboardOverview | null>) {
      state.overview = action.payload;
      state.lastUpdated = Date.now();
    },
    setRecentOrders(state, action: PayloadAction<RecentOrder[]>) {
      state.recentOrders = action.payload;
      state.lastUpdated = Date.now();
    },
    setRevenueAnalytics(state, action: PayloadAction<RevenueAnalytics | null>) {
      state.revenueAnalytics = action.payload;
      state.lastUpdated = Date.now();
    },
    clearDashboardData(state) {
      state.overview = null;
      state.recentOrders = [];
      state.revenueAnalytics = null;
      state.lastUpdated = null;
    },
    setCacheExpiration(state, action: PayloadAction<number>) {
      state.cacheExpiration = action.payload;
    },
  },
});

export const {
  setLoading,
  setDashboardData,
  setOverview,
  setRecentOrders,
  setRevenueAnalytics,
  clearDashboardData,
  setCacheExpiration,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
