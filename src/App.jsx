import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import TrafficLightsPage from './pages/TrafficLightsPage'
import ViolationsPage from './pages/ViolationsPage'
import ViolatorsPage from './pages/ViolatorsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPageReference'
import OperatorOverviewPage from './pages/OperatorOverviewPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adapt_auth') === 'true' || sessionStorage.getItem('adapt_auth') === 'true'
  })

  const handleLogin = (rememberMe) => {
    if (rememberMe) {
      localStorage.setItem('adapt_auth', 'true')
      sessionStorage.removeItem('adapt_auth')
    } else {
      localStorage.setItem('adapt_auth', 'false')
      sessionStorage.setItem('adapt_auth', 'true')
    }
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adapt_auth')
    localStorage.setItem('adapt_auth', 'false')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <LoginPage onLogin={handleLogin} />
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<DashboardLayout onLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<OperatorOverviewPage />} />
          <Route path="/traffic-lights" element={<TrafficLightsPage />} />
          <Route path="/violations" element={<ViolationsPage />} />
          <Route path="/violators" element={<ViolatorsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
