import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  PaymentTransactionDto,
  PaymentStatisticsDto,
} from '@/types/paymentTransaction';

interface PaymentFilters {
  status: string;
  method: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  searchTerm: string;
}

interface PaymentState {
  payments: PaymentTransactionDto[];
  stats: PaymentStatisticsDto | undefined;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  filters: PaymentFilters;
  appliedFilters: PaymentFilters;
  lastUpdated: number | null;
  cacheExpiration: number; // milliseconds
}

const initialFilters: PaymentFilters = {
  status: 'all',
  method: 'all',
  fromDate: undefined,
  toDate: undefined,
  searchTerm: '',
};

const initialState: PaymentState = {
  payments: [],
  stats: undefined,
  loading: false,
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  pageSize: 8,
  filters: initialFilters,
  appliedFilters: initialFilters,
  lastUpdated: null,
  cacheExpiration: 10 * 60 * 1000, // 10 minutes cache
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setPayments(state, action: PayloadAction<PaymentTransactionDto[]>) {
      state.payments = action.payload;
      state.lastUpdated = Date.now();
    },
    setStats(state, action: PayloadAction<PaymentStatisticsDto | undefined>) {
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
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<PaymentFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAppliedFilters(state, action: PayloadAction<Partial<PaymentFilters>>) {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
    },
    applyFilters(state) {
      state.appliedFilters = { ...state.filters };
      state.currentPage = 1;
    },
    resetFilters(state) {
      state.filters = initialFilters;
      state.appliedFilters = initialFilters;
      state.currentPage = 1;
    },
    setPaymentData(
      state,
      action: PayloadAction<{
        payments: PaymentTransactionDto[];
        stats: PaymentStatisticsDto | undefined;
        totalPages: number;
        totalCount: number;
        currentPage: number;
      }>
    ) {
      state.payments = action.payload.payments;
      state.stats = action.payload.stats;
      state.totalPages = action.payload.totalPages;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.currentPage;
      state.lastUpdated = Date.now();
    },
    clearPaymentData(state) {
      state.payments = [];
      state.stats = undefined;
      state.currentPage = 1;
      state.totalPages = 0;
      state.totalCount = 0;
      state.lastUpdated = null;
    },
    setCacheExpiration(state, action: PayloadAction<number>) {
      state.cacheExpiration = action.payload;
    },
  },
});

export const {
  setLoading,
  setPayments,
  setStats,
  setCurrentPage,
  setTotalPages,
  setTotalCount,
  setPageSize,
  setFilters,
  setAppliedFilters,
  applyFilters,
  resetFilters,
  setPaymentData,
  clearPaymentData,
  setCacheExpiration,
} = paymentSlice.actions;

export default paymentSlice.reducer;
