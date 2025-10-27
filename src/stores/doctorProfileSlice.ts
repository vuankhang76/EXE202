import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DoctorEditDto, DoctorSelfUpdateDto } from '@/types';

interface DoctorProfileState {
  doctor: DoctorEditDto | null;
  loading: boolean;
  saving: boolean;
  uploadingAvatar: boolean;
  avatarPreview: string | null;
  formData: Partial<DoctorSelfUpdateDto>;
  lastUpdated: number | null;
  cacheExpiration: number;
}

const initialState: DoctorProfileState = {
  doctor: null,
  loading: false,
  saving: false,
  uploadingAvatar: false,
  avatarPreview: null,
  formData: {},
  lastUpdated: null,
  cacheExpiration: 20 * 60 * 1000, // 20 minutes - personal profile doesn't change often
};

const doctorProfileSlice = createSlice({
  name: 'doctorProfile',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSaving(state, action: PayloadAction<boolean>) {
      state.saving = action.payload;
    },
    setUploadingAvatar(state, action: PayloadAction<boolean>) {
      state.uploadingAvatar = action.payload;
    },
    setDoctorProfileData(
      state,
      action: PayloadAction<{
        doctor: DoctorEditDto | null;
        formData: Partial<DoctorSelfUpdateDto>;
      }>
    ) {
      state.doctor = action.payload.doctor;
      state.formData = action.payload.formData;
      state.lastUpdated = Date.now();
    },
    setDoctorData(state, action: PayloadAction<DoctorEditDto | null>) {
      state.doctor = action.payload;
      state.lastUpdated = Date.now();
    },
    setFormData(state, action: PayloadAction<Partial<DoctorSelfUpdateDto>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setAvatarPreview(state, action: PayloadAction<string | null>) {
      state.avatarPreview = action.payload;
    },
    clearDoctorProfileData(state) {
      state.doctor = null;
      state.formData = {};
      state.avatarPreview = null;
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
  setUploadingAvatar,
  setDoctorProfileData,
  setDoctorData,
  setFormData,
  setAvatarPreview,
  clearDoctorProfileData,
  setCacheExpiration,
} = doctorProfileSlice.actions;

export default doctorProfileSlice.reducer;
