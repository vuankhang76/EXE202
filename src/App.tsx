import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import { Toaster } from './components/ui/Sonner';

const Login = lazy(() => import('./pages/authenticate/Login'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))   
const Appointments = lazy(() => import('./pages/Appointments'))
const Orders = lazy(() => import('./pages/Orders'))
const Consultations = lazy(() => import('./pages/Consultations'))
const CMR = lazy(() => import('./pages/CMR'))
const Promotions = lazy(() => import('./pages/Promotions'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Reports = lazy(() => import('./pages/Reports'))
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch'))

function LoginRedirect() {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Login />;
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
          <GlobalLoadingOverlay showOnGlobalLoading={true} text="Đang xử lý..." />
          <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/consultations" element={
            <ProtectedRoute>
              <Consultations />
            </ProtectedRoute>
          } />
          <Route path="/cmr" element={
            <ProtectedRoute>
              <CMR />
            </ProtectedRoute>
          } />
          <Route path="/promotions" element={
            <ProtectedRoute>
              <Promotions />
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/advanced-search" element={
            <ProtectedRoute>
              <AdvancedSearch />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  </LoadingProvider>
  )
}

export default App
