import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/dashboard/dashboard'))

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
