import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TenantDto, DoctorDto } from '@/types';

interface HomeState {
  clinics: TenantDto[];
  doctors: DoctorDto[];
  clinicsLoading: boolean;
  doctorsLoading: boolean;
  weekendBookingSettings: Record<number, boolean>;
  lastUpdated: number | null;
  cacheExpiration: number;
}

const initialState: HomeState = {
  clinics: [],
  doctors: [],
  clinicsLoading: false,
  doctorsLoading: false,
  weekendBookingSettings: {},
  lastUpdated: null,
  cacheExpiration: 15 * 60 * 1000, // 15 minutes cache
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setClinicLoading(state, action: PayloadAction<boolean>) {
      state.clinicsLoading = action.payload;
    },
    setDoctorLoading(state, action: PayloadAction<boolean>) {
      state.doctorsLoading = action.payload;
    },
    setHomeData(
      state,
      action: PayloadAction<{
        clinics: TenantDto[];
        doctors: DoctorDto[];
        weekendBookingSettings: Record<number, boolean>;
      }>
    ) {
      state.clinics = action.payload.clinics;
      state.doctors = action.payload.doctors;
      state.weekendBookingSettings = action.payload.weekendBookingSettings;
      state.lastUpdated = Date.now();
    },
    setWeekendBookingSettings(state, action: PayloadAction<Record<number, boolean>>) {
      state.weekendBookingSettings = action.payload;
    },
    clearHomeData(state) {
      state.clinics = [];
      state.doctors = [];
      state.weekendBookingSettings = {};
      state.lastUpdated = null;
    },
    setCacheExpiration(state, action: PayloadAction<number>) {
      state.cacheExpiration = action.payload;
    },
  },
});

export const {
  setClinicLoading,
  setDoctorLoading,
  setHomeData,
  setWeekendBookingSettings,
  clearHomeData,
  setCacheExpiration,
} = homeSlice.actions;

export default homeSlice.reducer;
