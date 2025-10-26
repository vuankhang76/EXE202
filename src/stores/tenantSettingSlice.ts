import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TenantDto, TenantUpdateDto } from '@/types';
import type { BookingConfig } from '@/services/tenantSettingService';

interface TenantSettingState {
  tenant: TenantDto | null;
  bookingConfig: BookingConfig;
  loading: boolean;
  saving: boolean;
  savingBooking: boolean;
  uploadingThumbnail: boolean;
  uploadingCover: boolean;
  formData: TenantUpdateDto;
  thumbnailPreview: string | null;
  coverPreview: string | null;
  activeTab: string;
  lastUpdated: number | null;
  cacheExpiration: number;
}

const initialBookingConfig: BookingConfig = {
  maxAdvanceBookingDays: 90,
  defaultSlotDurationMinutes: 30,
  minAdvanceBookingHours: 1,
  maxCancellationHours: 24,
  allowWeekendBooking: true,
};

const initialState: TenantSettingState = {
  tenant: null,
  bookingConfig: initialBookingConfig,
  loading: false,
  saving: false,
  savingBooking: false,
  uploadingThumbnail: false,
  uploadingCover: false,
  formData: {},
  thumbnailPreview: null,
  coverPreview: null,
  activeTab: 'clinic',
  lastUpdated: null,
  cacheExpiration: 30 * 60 * 1000, // 30 minutes - longer for settings
};

const tenantSettingSlice = createSlice({
  name: 'tenantSetting',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
    },
    setSavingBooking(state, action: PayloadAction<boolean>) {
      state.savingBooking = action.payload;
    },
    setUploadingThumbnail(state, action: PayloadAction<boolean>) {
      state.uploadingThumbnail = action.payload;
    },
    setUploadingCover(state, action: PayloadAction<boolean>) {
      state.uploadingCover = action.payload;
    },
    setTenant(state, action: PayloadAction<TenantDto | null>) {
      state.tenant = action.payload;
      state.lastUpdated = Date.now();
    },
    setBookingConfig(state, action: PayloadAction<BookingConfig>) {
      state.bookingConfig = action.payload;
      state.lastUpdated = Date.now();
    },
    setFormData(state, action: PayloadAction<Partial<TenantUpdateDto>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setThumbnailPreview(state, action: PayloadAction<string | null>) {
      state.thumbnailPreview = action.payload;
    },
    setCoverPreview(state, action: PayloadAction<string | null>) {
      state.coverPreview = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    setTenantSettingData(
      state,
      action: PayloadAction<{
        tenant: TenantDto | null;
        formData: TenantUpdateDto;
        bookingConfig: BookingConfig;
      }>
    ) {
      state.tenant = action.payload.tenant;
      state.formData = action.payload.formData;
      state.bookingConfig = action.payload.bookingConfig;
      state.lastUpdated = Date.now();
    },
    clearTenantSettingData(state) {
      state.tenant = null;
      state.bookingConfig = initialBookingConfig;
      state.formData = {};
      state.thumbnailPreview = null;
      state.coverPreview = null;
      state.activeTab = 'clinic';
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
  setSavingBooking,
  setUploadingThumbnail,
  setUploadingCover,
  setTenant,
  setBookingConfig,
  setFormData,
  setThumbnailPreview,
  setCoverPreview,
  setActiveTab,
  setTenantSettingData,
  clearTenantSettingData,
  setCacheExpiration,
} = tenantSettingSlice.actions;

export default tenantSettingSlice.reducer;
