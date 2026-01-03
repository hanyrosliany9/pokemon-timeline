import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/store'
import { useWebSocket } from './hooks/useWebSocket'
import Layout from './components/layout/Layout'
import { ProjectDashboard } from './components/project'
import ExpenseDashboard from './components/expense/ExpenseDashboard'
import SettingsPage from './pages/SettingsPage'
import SecretPage from './pages/SecretPage'
import './App.css'

function App() {
  useWebSocket()
  const { updateResolvedTheme } = useStore()

  useEffect(() => {
    // Initialize theme on app mount
    updateResolvedTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      updateResolvedTheme()
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [updateResolvedTheme])

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          {/* Secret page - no layout, standalone */}
          <Route path="/secret" element={<SecretPage />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<ProjectDashboard />} />
            <Route path="expenses" element={<ExpenseDashboard />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
