import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserDto } from '@/types/user';

interface AccountStats {
  total: number;
  doctors: number;
  nurses: number;
}

interface AccountFilters {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
}

interface AccountState {
  users: UserDto[];
  stats: AccountStats;
  loading: boolean;
  saving: boolean;
  pageNumber: number;
  totalPages: number;
  filters: AccountFilters;
  appliedFilters: AccountFilters;
  lastUpdated: number | null;
  cacheExpiration: number;
}

const initialFilters: AccountFilters = {
  searchTerm: '',
  roleFilter: 'all',
  statusFilter: 'all',
};

const initialStats: AccountStats = {
  total: 0,
  doctors: 0,
  nurses: 0,
};

const initialState: AccountState = {
  users: [],
  stats: initialStats,
  loading: false,
  saving: false,
  pageNumber: 1,
  totalPages: 1,
  filters: initialFilters,
  appliedFilters: initialFilters,
  lastUpdated: null,
  cacheExpiration: 15 * 60 * 1000, // 15 minutes
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
    },
    setUsers(state, action: PayloadAction<UserDto[]>) {
      state.users = action.payload;
      state.lastUpdated = Date.now();
    },
    setStats(state, action: PayloadAction<AccountStats>) {
      state.stats = action.payload;
    },
    setPageNumber(state, action: PayloadAction<number>) {
      state.pageNumber = action.payload;
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<AccountFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAppliedFilters(state, action: PayloadAction<Partial<AccountFilters>>) {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
    },
    setAccountData(
      state,
      action: PayloadAction<{
        users: UserDto[];
        stats: AccountStats;
        totalPages: number;
      }>
    ) {
      state.users = action.payload.users;
      state.stats = action.payload.stats;
      state.totalPages = action.payload.totalPages;
      state.lastUpdated = Date.now();
    },
    clearAccountData(state) {
      state.users = [];
      state.stats = initialStats;
      state.pageNumber = 1;
      state.totalPages = 1;
      state.lastUpdated = null;
    },
    setCacheExpiration(state, action: PayloadAction<number>) {
      state.cacheExpiration = action.payload;
    },
  },
});

export const {
  setLoading,
  setSaving,
  setUsers,
  setStats,
  setPageNumber,
  setTotalPages,
  setFilters,
  setAppliedFilters,
  setAccountData,
  clearAccountData,
  setCacheExpiration,
} = accountSlice.actions;

export default accountSlice.reducer;

