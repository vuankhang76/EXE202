import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { Provider } from 'react-redux';
import { store } from './stores/store';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/Sonner';
import { SpeedInsights } from '@vercel/speed-insights/react';

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/authenticate/Login'))
const PatientAuth = lazy(() => import('./pages/authenticate/PatientAuth'))
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'))
const CreateAppointment = lazy(() => import('./pages/patient/CreateAppointment'))
const PaymentPage = lazy(() => import('./pages/patient/PaymentPage'))
const PatientChat = lazy(() => import('./pages/patient/PatientChat'))
const ClinicConversations = lazy(() => import('./pages/ClinicConversations'))
const ClinicChat = lazy(() => import('./pages/ClinicChat'))
const ClinicDetail = lazy(() => import('./pages/ClinicDetail'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const TenantSettings = lazy(() => import('./pages/dashboard/TenantSettings'))
const DoctorProfileEdit = lazy(() => import('./pages/DoctorProfileEdit'))
const Patients = lazy(() => import('./pages/Patients'))   
const Appointments = lazy(() => import('./pages/Appointments'))
const Orders = lazy(() => import('./pages/PaymentTransaction'))
const Consultations = lazy(() => import('./pages/Consultations'))
const Accounts = lazy(() => import('./pages/Accounts'))
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'))
const TenantManagement = lazy(() => import('./pages/TenantManagement'))
const AdminManagement = lazy(() => import('./pages/AdminManagement'))
const NotFound = lazy(() => import('./pages/NotFound'))

function TenantAuthRedirect() {
  const { currentUser, userType } = useAuth();
  if (currentUser && userType === 'tenant') {
    if (currentUser.role === 'SystemAdmin') {
      return <Navigate to="/super-admin" replace />;
    }
    return <Navigate to="/clinic/dashboard" replace />;
  }
  if (currentUser && userType === 'patient') {
    return <Navigate to="/" replace />;
  }
  return <Login />;
}

function HomeRedirect() {
  const { currentUser, userType } = useAuth();
  
  if (currentUser && userType === 'tenant') {
    if (currentUser.role === 'SystemAdmin') {
      return <Navigate to="/super-admin" replace />;
    }
    return <Navigate to="/clinic/dashboard" replace />;
  }
  
  return <Home />;
}

function PatientAuthRedirect() {
  const { currentUser, userType } = useAuth();
  if (currentUser && userType === 'patient') {
    return <Navigate to="/" replace />;
  }
  if (currentUser && userType === 'tenant') {
    return <Navigate to="/clinic/dashboard" replace />;
  }
  return <PatientAuth />;
}

function App() {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <AuthProvider>
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <Toaster />
            <SpeedInsights />
            <Routes>
            <Route path="/" element={<HomeRedirect />} />
            
            <Route path="/clinics/:id" element={<ClinicDetail />} />
            
            <Route path="/tenant/auth" element={<TenantAuthRedirect />} />
            <Route path="/login" element={<PatientAuthRedirect />} />
            
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/appointments" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientDashboard />
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
            <Route path="/patient/conversations" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/profile" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/chat/:conversationId" element={
              <ProtectedRoute allowedUserTypes={['patient']}>
                <PatientChat />
              </ProtectedRoute>
            } />

          <Route path="/clinic/dashboard" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/clinic/settings" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <TenantSettings />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile/edit" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <DoctorProfileEdit />
            </ProtectedRoute>
          } />
          <Route path="/clinic/patients" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <Patients />
            </ProtectedRoute>
          } />
          <Route path="/clinic/appointments" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/clinic/orders" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/clinic/consultations" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <Consultations />
            </ProtectedRoute>
          } />
          <Route path="/clinic/conversations" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <ClinicConversations />
            </ProtectedRoute>
          } />
          <Route path="/clinic/chat/:conversationId" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <ClinicChat />
            </ProtectedRoute>
          } />
          <Route path="/clinic/accounts" element={
            <ProtectedRoute allowedUserTypes={['tenant']} excludeRoles={['SystemAdmin']}>
              <Accounts />
            </ProtectedRoute>
          } />

          <Route path="/super-admin" element={
            <ProtectedRoute allowedUserTypes={['tenant']} allowedRoles={['SystemAdmin']}>
              <SuperAdmin />
            </ProtectedRoute>
          } />

          <Route path="/super-admin/tenants" element={
            <ProtectedRoute allowedUserTypes={['tenant']} allowedRoles={['SystemAdmin']}>
              <TenantManagement />
            </ProtectedRoute>
          } />

          <Route path="/super-admin/admins" element={
            <ProtectedRoute allowedUserTypes={['tenant']} allowedRoles={['SystemAdmin']}>
              <AdminManagement />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
    </LoadingProvider>
    </Provider>
  )
}

export default App
