import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/Sonner';

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/authenticate/Login'))
const PatientAuth = lazy(() => import('./pages/authenticate/PatientAuth'))
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'))
const PatientAppointments = lazy(() => import('./pages/patient/Appointments'))
const CreateAppointment = lazy(() => import('./pages/patient/CreateAppointment'))
const PaymentPage = lazy(() => import('./pages/patient/PaymentPage'))
const ClinicDetail = lazy(() => import('./pages/ClinicDetail'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const TenantSettings = lazy(() => import('./pages/dashboard/TenantSettings'))
const DoctorProfileEdit = lazy(() => import('./pages/DoctorProfileEdit'))
const Patients = lazy(() => import('./pages/Patients'))   
const Appointments = lazy(() => import('./pages/Appointments'))
const Orders = lazy(() => import('./pages/PaymentTransaction'))
const Consultations = lazy(() => import('./pages/Consultations'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Reports = lazy(() => import('./pages/Reports'))
const NotFound = lazy(() => import('./pages/NotFound'))

function TenantAuthRedirect() {
  const { currentUser, userType } = useAuth();
  if (currentUser && userType === 'tenant') {
    return <Navigate to="/dashboard" replace />;
  }
  if (currentUser && userType === 'patient') {
    return <Navigate to="/" replace />;
  }
  return <Login />;
}

function HomeRedirect() {
  const { currentUser, userType } = useAuth();
  
  if (currentUser && userType === 'tenant') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Home />;
}

function PatientAuthRedirect() {
  const { currentUser, userType } = useAuth();
  if (currentUser && userType === 'patient') {
    return <Navigate to="/" replace />;
  }
  if (currentUser && userType === 'tenant') {
    return <Navigate to="/dashboard" replace />;
  }
  return <PatientAuth />;
}

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <Toaster />
          <Routes>
          <Route path="/" element={<HomeRedirect />} />
          
          {/* Public Clinic Detail Route */}
          <Route path="/clinics/:id" element={<ClinicDetail />} />
          
          <Route path="/tenant/auth" element={<TenantAuthRedirect />} />
          <Route path="/patient/auth" element={<PatientAuthRedirect />} />
          
          {/* Patient Only Routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedUserTypes={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedUserTypes={['patient']}>
              <PatientAppointments />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments/create" element={
            <ProtectedRoute allowedUserTypes={['patient']}>
              <CreateAppointment />
            </ProtectedRoute>
          } />
          <Route path="/patient/payment" element={
            <ProtectedRoute allowedUserTypes={['patient']}>
              <PaymentPage />
            </ProtectedRoute>
          } />
          
          {/* Tenant Only Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <TenantSettings />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile/edit" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <DoctorProfileEdit />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Patients />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/consultations" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Consultations />
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Accounts />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedUserTypes={['tenant']}>
              <Reports />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </LoadingProvider>
  )
}

export default App
