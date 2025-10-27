import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import paymentReducer from './paymentSlice';
import patientReducer from './patientSlice';
import accountReducer from './accountSlice';
import appointmentReducer from './appointmentSlice';
import tenantSettingReducer from './tenantSettingSlice';
import homeReducer from './homeSlice';
import doctorProfileReducer from './doctorProfileSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    payment: paymentReducer,
    patient: patientReducer,
    account: accountReducer,
    appointment: appointmentReducer,
    tenantSetting: tenantSettingReducer,
    home: homeReducer,
    doctorProfile: doctorProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
