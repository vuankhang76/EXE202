import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MedicalCaseRecordDto } from '@/types/medicalCaseRecord';

interface PatientFilters {
  status: string;
  searchTerm: string;
}

interface PatientState {
  records: MedicalCaseRecordDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  filters: PatientFilters;
  appliedFilters: PatientFilters;
  lastUpdated: number | null;
  cacheExpiration: number;
}

const initialFilters: PatientFilters = {
  status: 'all',
  searchTerm: '',
};

const initialState: PatientState = {
  records: [],
  loading: false,
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  pageSize: parseInt(localStorage.getItem("patient_pageSize") ?? "10", 10),
  filters: initialFilters,
  appliedFilters: initialFilters,
  lastUpdated: null,
  cacheExpiration: 10 * 60 * 1000,
};

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setRecords(state, action: PayloadAction<MedicalCaseRecordDto[]>) {
      state.records = action.payload;
      state.lastUpdated = Date.now();
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      localStorage.setItem("patient_pageSize", action.payload.toString());
    },
    setTotalPages(state, action: PayloadAction<number>) {
      state.totalPages = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<PatientFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAppliedFilters(state, action: PayloadAction<Partial<PatientFilters>>) {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
    },
    setPatientData(
      state,
      action: PayloadAction<{
        records: MedicalCaseRecordDto[];
        totalPages: number;
        totalCount: number;
        currentPage: number;
      }>
    ) {
      state.records = action.payload.records;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.totalCount = action.payload.totalCount ?? state.records.length;
      state.lastUpdated = Date.now();
    },
    clearPatientData(state) {
      state.records = [];
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
  setRecords,
  setCurrentPage,
  setPageSize,
  setTotalPages,
  setFilters,
  setAppliedFilters,
  setPatientData,
  clearPatientData,
  setCacheExpiration,
} = patientSlice.actions;

export default patientSlice.reducer;

