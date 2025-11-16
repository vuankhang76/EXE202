import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppointmentDto } from '@/types/appointment';

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

interface AppointmentFilters {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  fromDate: string | undefined; // ISO string instead of Date
  toDate: string | undefined; // ISO string instead of Date
}

interface AppointmentState {
  appointments: AppointmentDto[];
  stats: AppointmentStats;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  filters: AppointmentFilters;
  appliedFilters: AppointmentFilters;
  lastUpdated: number | null;
  cacheExpiration: number;
}

const initialFilters: AppointmentFilters = {
  searchTerm: '',
  statusFilter: 'all',
  typeFilter: 'all',
  fromDate: new Date().toISOString(),
  toDate: new Date().toISOString(),
};

const initialStats: AppointmentStats = {
  total: 0,
  pending: 0,
  confirmed: 0,
  inProgress: 0,
  completed: 0,
  cancelled: 0,
};

const initialState: AppointmentState = {
  appointments: [],
  stats: initialStats,
  loading: false,
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  pageSize: parseInt(localStorage.getItem("appointment_pageSize") ?? "10", 10),
  filters: initialFilters,
  appliedFilters: initialFilters,
  lastUpdated: null,
  cacheExpiration: 10 * 60 * 1000,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAppointments(state, action: PayloadAction<AppointmentDto[]>) {
      state.appointments = action.payload;
      state.lastUpdated = Date.now();
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      localStorage.setItem("appointment_pageSize", action.payload.toString());
    },
    setStats(state, action: PayloadAction<AppointmentStats>) {
      state.stats = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
    setTotalCount(state, action: PayloadAction<number>) {
      state.totalCount = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<AppointmentFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAppliedFilters(state, action: PayloadAction<Partial<AppointmentFilters>>) {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
    },
    setAppointmentData(
      state,
      action: PayloadAction<{
        appointments: AppointmentDto[];
        totalPages: number;
        totalCount: number;
        currentPage: number;
      }>
    ) {
      state.appointments = action.payload.appointments;
      // Don't overwrite stats here - stats should be updated separately via setStats
      state.totalPages = action.payload.totalPages;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.currentPage;
      state.lastUpdated = Date.now();
    },
    clearAppointmentData(state) {
      state.appointments = [];
      state.stats = initialStats;
      state.currentPage = 1;
      state.totalPages = 0;
      state.totalCount = 0;
      state.lastUpdated = null;
    },
    setCacheExpiration(state, action: PayloadAction<number>) {
      state.cacheExpiration = action.payload;
    },
    updateAppointmentStatus(
      state,
      action: PayloadAction<{ appointmentId: number; newStatus: string }>
    ) {
      const { appointmentId, newStatus } = action.payload;
      const appointment = state.appointments.find(
        (apt) => apt.appointmentId === appointmentId
      );
      if (appointment) {
        appointment.status = newStatus;
      }
    },
  },
});

export const {
  setLoading,
  setAppointments,
  setStats,
  setCurrentPage,
  setTotalPages,
  setTotalCount,
  setFilters,
  setAppliedFilters,
  setAppointmentData,
  clearAppointmentData,
  setCacheExpiration,
  setPageSize,
  updateAppointmentStatus,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;


