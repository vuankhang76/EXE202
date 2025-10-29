import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Dashboard hooks
export const useDashboardState = () => useAppSelector((state) => state.dashboard);
export const useDashboardLoading = () =>
  useAppSelector((state) => state.dashboard.loading);
export const useDashboardData = () => ({
  overview: useAppSelector((state) => state.dashboard.overview),
  recentOrders: useAppSelector((state) => state.dashboard.recentOrders),
  lastUpdated: useAppSelector((state) => state.dashboard.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.dashboard.cacheExpiration),
});

// Payment hooks
export const usePaymentState = () => useAppSelector((state) => state.payment);
export const usePaymentLoading = () =>
  useAppSelector((state) => state.payment.loading);
export const usePaymentData = () => ({
  payments: useAppSelector((state) => state.payment.payments),
  stats: useAppSelector((state) => state.payment.stats),
  currentPage: useAppSelector((state) => state.payment.currentPage),
  totalPages: useAppSelector((state) => state.payment.totalPages),
  totalCount: useAppSelector((state) => state.payment.totalCount),
  pageSize: useAppSelector((state) => state.payment.pageSize),
  lastUpdated: useAppSelector((state) => state.payment.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.payment.cacheExpiration),
});
export const usePaymentFilters = () =>
  useAppSelector((state) => state.payment.filters);
export const usePaymentAppliedFilters = () =>
  useAppSelector((state) => state.payment.appliedFilters);

// Patient hooks
export const usePatientState = () => useAppSelector((state) => state.patient);
export const usePatientLoading = () =>
  useAppSelector((state) => state.patient.loading);
export const usePatientData = () => ({
  records: useAppSelector((state) => state.patient.records),
  currentPage: useAppSelector((state) => state.patient.currentPage),
  totalPages: useAppSelector((state) => state.patient.totalPages),
  totalCount: useAppSelector((state) => state.patient.totalCount),
  pageSize: useAppSelector((state) => state.patient.pageSize),
  lastUpdated: useAppSelector((state) => state.patient.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.patient.cacheExpiration),
});
export const usePatientFilters = () =>
  useAppSelector((state) => state.patient.filters);
export const usePatientAppliedFilters = () =>
  useAppSelector((state) => state.patient.appliedFilters);

// Account hooks
export const useAccountState = () => useAppSelector((state) => state.account);
export const useAccountLoading = () =>
  useAppSelector((state) => state.account.loading);
export const useAccountSaving = () =>
  useAppSelector((state) => state.account.saving);
export const useAccountData = () => ({
  users: useAppSelector((state) => state.account.users),
  stats: useAppSelector((state) => state.account.stats),
  pageNumber: useAppSelector((state) => state.account.pageNumber),
  pageSize: useAppSelector((state) => state.account.pageSize),
  totalPages: useAppSelector((state) => state.account.totalPages),
  totalCount: useAppSelector((state) => state.account.totalCount),
  lastUpdated: useAppSelector((state) => state.account.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.account.cacheExpiration),
});
export const useAccountFilters = () =>
  useAppSelector((state) => state.account.filters);
export const useAccountAppliedFilters = () =>
  useAppSelector((state) => state.account.appliedFilters);

// Appointment hooks
export const useAppointmentState = () => useAppSelector((state) => state.appointment);
export const useAppointmentLoading = () =>
  useAppSelector((state) => state.appointment.loading);
export const useAppointmentData = () => ({
  appointments: useAppSelector((state) => state.appointment.appointments),
  stats: useAppSelector((state) => state.appointment.stats),
  currentPage: useAppSelector((state) => state.appointment.currentPage),
  totalPages: useAppSelector((state) => state.appointment.totalPages),
  totalCount: useAppSelector((state) => state.appointment.totalCount),
  pageSize: useAppSelector((state) => state.appointment.pageSize),
  lastUpdated: useAppSelector((state) => state.appointment.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.appointment.cacheExpiration),
});
export const useAppointmentFilters = () =>
  useAppSelector((state) => state.appointment.filters);
export const useAppointmentAppliedFilters = () =>
  useAppSelector((state) => state.appointment.appliedFilters);

// Tenant Setting hooks
export const useTenantSettingState = () => useAppSelector((state) => state.tenantSetting);
export const useTenantSettingLoading = () =>
  useAppSelector((state) => state.tenantSetting.loading);
export const useTenantSettingSaving = () =>
  useAppSelector((state) => state.tenantSetting.saving);
export const useTenantSettingSavingBooking = () =>
  useAppSelector((state) => state.tenantSetting.savingBooking);
export const useTenantSettingUploadingThumbnail = () =>
  useAppSelector((state) => state.tenantSetting.uploadingThumbnail);
export const useTenantSettingUploadingCover = () =>
  useAppSelector((state) => state.tenantSetting.uploadingCover);
export const useTenantSettingData = () => ({
  tenant: useAppSelector((state) => state.tenantSetting.tenant),
  bookingConfig: useAppSelector((state) => state.tenantSetting.bookingConfig),
  formData: useAppSelector((state) => state.tenantSetting.formData),
  thumbnailPreview: useAppSelector((state) => state.tenantSetting.thumbnailPreview),
  coverPreview: useAppSelector((state) => state.tenantSetting.coverPreview),
  activeTab: useAppSelector((state) => state.tenantSetting.activeTab),
  lastUpdated: useAppSelector((state) => state.tenantSetting.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.tenantSetting.cacheExpiration),
});

// Home hooks
export const useHomeState = () => useAppSelector((state) => state.home);
export const useHomeClinicLoading = () =>
  useAppSelector((state) => state.home.clinicsLoading);
export const useHomeDoctorLoading = () =>
  useAppSelector((state) => state.home.doctorsLoading);
export const useHomeData = () => ({
  clinics: useAppSelector((state) => state.home.clinics),
  doctors: useAppSelector((state) => state.home.doctors),
  weekendBookingSettings: useAppSelector((state) => state.home.weekendBookingSettings),
  lastUpdated: useAppSelector((state) => state.home.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.home.cacheExpiration),
});

// Doctor Profile hooks
export const useDoctorProfileState = () => useAppSelector((state) => state.doctorProfile);
export const useDoctorProfileLoading = () =>
  useAppSelector((state) => state.doctorProfile.loading);
export const useDoctorProfileSaving = () =>
  useAppSelector((state) => state.doctorProfile.saving);
export const useDoctorProfileUploadingAvatar = () =>
  useAppSelector((state) => state.doctorProfile.uploadingAvatar);
export const useDoctorProfileData = () => ({
  doctor: useAppSelector((state) => state.doctorProfile.doctor),
  formData: useAppSelector((state) => state.doctorProfile.formData),
  avatarPreview: useAppSelector((state) => state.doctorProfile.avatarPreview),
  lastUpdated: useAppSelector((state) => state.doctorProfile.lastUpdated),
  cacheExpiration: useAppSelector((state) => state.doctorProfile.cacheExpiration),
});

// Utility function to check if cache is valid
export const isCacheValid = (lastUpdated: number | null, cacheExpiration: number): boolean => {
  if (!lastUpdated) return false;
  return Date.now() - lastUpdated < cacheExpiration;
};
