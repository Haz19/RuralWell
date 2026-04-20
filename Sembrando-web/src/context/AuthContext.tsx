import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  saveAuth: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const email = localStorage.getItem('email')
    return token && nombre && email ? { token, nombre, email } : null
  })

  const saveAuth = (u: AuthUser) => {
    localStorage.setItem('token', u.token)
    localStorage.setItem('nombre', u.nombre)
    localStorage.setItem('email', u.email)
    setUser(u)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}