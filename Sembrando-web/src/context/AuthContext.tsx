import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  perfilCompleto: boolean
  saveAuth: (user: AuthUser) => void
  completarPerfil: () => void
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

  const [perfilCompleto, setPerfilCompleto] = useState<boolean>(
    () => localStorage.getItem('perfilCompleto') === 'true'
  )

  const saveAuth = (u: AuthUser) => {
    localStorage.setItem('token', u.token)
    localStorage.setItem('nombre', u.nombre)
    localStorage.setItem('email', u.email)
    setUser(u)
  }

  const completarPerfil = () => {
    localStorage.setItem('perfilCompleto', 'true')
    setPerfilCompleto(true)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    setPerfilCompleto(false)
  }

  return (
    <AuthContext.Provider value={{ user, perfilCompleto, saveAuth, completarPerfil, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}