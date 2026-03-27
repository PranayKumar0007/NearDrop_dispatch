import { Routes, Route, Navigate } from 'react-router-dom'
import DriverApp from './pages/driver/DriverApp'
import HubApp from './pages/hub/HubApp'
import DashboardApp from './pages/dashboard/DashboardApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/driver" element={<DriverApp />} />
      <Route path="/hub" element={<HubApp />} />
      <Route path="/dashboard/*" element={<DashboardApp />} />
    </Routes>
  )
}
