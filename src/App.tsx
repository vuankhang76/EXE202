import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/dashboard/dashboard'))
const Patients = lazy(() => import('./pages/patients'))   
const Appointments = lazy(() => import('./pages/appointments'))
const Orders = lazy(() => import('./pages/orders'))
const Consultations = lazy(() => import('./pages/consultations'))
const CMR = lazy(() => import('./pages/CMR'))
const Promotions = lazy(() => import('./pages/promotions'))
const Accounts = lazy(() => import('./pages/accounts'))
const Reports = lazy(() => import('./pages/reports'))
const AdvancedSearch = lazy(() => import('./pages/advancedSearch'))

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/consultations" element={<Consultations />} />
        <Route path="/cmr" element={<CMR />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/advanced-search" element={<AdvancedSearch />} />
      </Routes>
    </Router>
  )
}

export default App
