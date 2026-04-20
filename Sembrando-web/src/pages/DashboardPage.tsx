import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPerfil } from '../api/perfil'
import type { PerfilResponse } from '../types/perfil'
import '../styles/dashboard.css'

const NIVEL_CONFIG = {
  bajo:     { label: 'Estrés bajo',     desc: 'Tu nivel de estrés es manejable. Sigue así.' },
  moderado: { label: 'Estrés moderado', desc: 'Sientes algo de presión. Pequeños hábitos pueden ayudar.' },
  alto:     { label: 'Estrés alto',     desc: 'Tu nivel es elevado. Estamos aquí para apoyarte.' },
}

const ACCIONES = [
  { titulo: 'Hablar con el agente', desc: 'Chatea con tu compañero de IA',    ruta: '/chat' },
  { titulo: 'Cuestionario',          desc: 'Vuelve a evaluar tu nivel',         ruta: '/cuestionario' },
  { titulo: 'Mi historial',          desc: 'Revisa tus resultados anteriores',  ruta: '/historial' },
  { titulo: 'Mi tarjeta',            desc: 'Genera tu tarjeta',          ruta: '/tarjeta' },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)
  const [sinPerfil, setSinPerfil] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getPerfil()
      .then(setPerfil)
      .catch((err) => {
        if (err.response?.status === 404) setSinPerfil(true)
      })
      .finally(() => setCargando(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (cargando) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Cargando tu perfil...</p>
      </div>
    )
  }

  const nivel = perfil ? NIVEL_CONFIG[perfil.categoriaEstres] : null

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <h1>Hola, {user?.nombre?.split(' ')[0]}</h1>
          {perfil?.campoEstudio && <p>{perfil.campoEstudio}</p>}
        </div>
        <button className="dash-logout" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <div className="dash-body">
        {sinPerfil ? (
          <div className="dash-cta-card">
            <h2>Comencemos por conocerte</h2>
            <p>Responde el cuestionario PSS-14 para evaluar tu nivel de estrés. Solo toma unos minutos.</p>
            <button className="dash-cta-btn" onClick={() => navigate('/cuestionario')}>
              Hacer el cuestionario →
            </button>
          </div>
        ) : perfil && nivel ? (
          <div className={`dash-stress-card ${perfil.categoriaEstres}`}>
            <div className="dash-stress-info">
              <h2>Tu nivel de estrés</h2>
              <h3>{nivel.label}</h3>
              <p>{nivel.desc}</p>
            </div>
          </div>
        ) : null}

        <p className="dash-section-title">¿Qué quieres hacer?</p>

        <div className="dash-actions">
          {ACCIONES.map((a) => (
            <button
              key={a.ruta}
              className="dash-action-card"
              onClick={() => navigate(a.ruta)}
            >
              <strong>{a.titulo}</strong>
              <span>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
