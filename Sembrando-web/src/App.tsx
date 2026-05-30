import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import QuestionnairePage from './pages/QuestionnairePage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import TarjetaPage from './pages/TarjetaPage'
import HistorialPage from './pages/HistorialPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function RequiresProfile({ children }: { children: ReactNode }) {
  const { user, perfilCompleto } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!perfilCompleto) return <Navigate to="/cuestionario" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/cuestionario"
            element={
              <ProtectedRoute>
                <QuestionnairePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequiresProfile>
                <DashboardPage />
              </RequiresProfile>
            }
          />
          <Route
            path="/chat"
            element={
              <RequiresProfile>
                <ChatPage />
              </RequiresProfile>
            }
          />
          <Route
            path="/tarjeta"
            element={
              <RequiresProfile>
                <TarjetaPage />
              </RequiresProfile>
            }
          />
          <Route
            path="/historial"
            element={
              <RequiresProfile>
                <HistorialPage />
              </RequiresProfile>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}