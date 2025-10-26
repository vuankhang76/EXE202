import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashboardOverview, RecentOrder } from '@/types/dashboard';

interface DashboardState {
  overview: DashboardOverview | null;
  recentOrders: RecentOrder[];
  loading: boolean;
  lastUpdated: number | null;
  cacheExpiration: number; // milliseconds
}

const initialState: DashboardState = {
  overview: null,
  recentOrders: [],
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
      }>
    ) {
      state.overview = action.payload.overview;
      state.recentOrders = action.payload.recentOrders;
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
    clearDashboardData(state) {
      state.overview = null;
      state.recentOrders = [];
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
  clearDashboardData,
  setCacheExpiration,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
