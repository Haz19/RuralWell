import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPerfil } from '../api/perfil'
import type { PerfilResponse } from '../types/perfil'
import BottomNav from '../components/BottomNav'
import '../styles/dashboard.css'

const NIVEL_CONFIG = {
  bajo:     { label: 'Low stress',      desc: 'Your stress level is manageable. Keep up your habits.',       bg: 'linear-gradient(135deg,#2E7D59,#3da370)' },
  moderado: { label: 'Moderate stress', desc: 'You feel some pressure. Small changes can help.',              bg: 'linear-gradient(135deg,#F2B705,#f5c833)' },
  alto:     { label: 'High stress',     desc: "You're not alone — we're here to support you.",               bg: 'linear-gradient(135deg,#E53935,#ef5350)' },
}

const MOOD_CONFIG = {
  bajo:     { label: 'Good',  tagline: 'Stay balanced, stay strong.',    sub: 'Your wellbeing is in a great place.',      bg: 'linear-gradient(135deg,#2E7D59,#3da370)' },
  moderado: { label: 'Fair',  tagline: 'Every step forward matters.',    sub: 'Find what you can improve today.',         bg: 'linear-gradient(135deg,#F2B705,#f5c833)' },
  alto:     { label: 'Fair',  tagline: 'Taking care of yourself counts.',sub: 'Find what you can improve today.',         bg: 'linear-gradient(135deg,#F2B705,#f5c833)' },
}

const ACADEMIC_CONFIG = {
  bajo:     { label: 'Excellent', tagline: 'Your dedication shows.',           sub: 'Your consistency brings you closer to your goals.', bg: 'linear-gradient(135deg,#00BFB3,#2E7D59)' },
  moderado: { label: 'On track',  tagline: 'Consistency is your strength.',   sub: 'Keep it up — every session counts.',              bg: 'linear-gradient(135deg,#00BFB3,#2E7D59)' },
  alto:     { label: 'On track',  tagline: 'Consistency is your strength.',   sub: 'Keep it up — every session counts.',              bg: 'linear-gradient(135deg,#00BFB3,#2E7D59)' },
}

const ACCIONES = [
  { titulo: 'Talk to the agent', desc: 'Your AI companion is here', ruta: '/chat' },
  { titulo: 'Update assessment', desc: 'Take the PSS-14 questionnaire', ruta: '/cuestionario' },
]

function StressGauge({ nivel }: { nivel: number }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120)
    return () => clearTimeout(t)
  }, [])

  const r = 38
  const circ = 2 * Math.PI * r
  const progress = animated ? Math.min(nivel / 10, 1) : 0
  const offset = circ * (1 - progress)

  return (
    <svg viewBox="0 0 100 100" className="dash-gauge-svg">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="50" y="46" textAnchor="middle" dominantBaseline="middle"
            fontSize="20" fontWeight="700" fill="#fff">
        {nivel.toFixed(1)}
      </text>
      <text x="50" y="62" textAnchor="middle"
            fontSize="9" fill="rgba(255,255,255,0.75)" fontWeight="500">
        of 10
      </text>
    </svg>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)
  const [sinPerfil, setSinPerfil] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getPerfil()
      .then(setPerfil)
      .catch((err) => { if (err.response?.status === 404) setSinPerfil(true) })
      .finally(() => setCargando(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  if (cargando) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your profile...</p>
      </div>
    )
  }

  const cat = (perfil?.categoriaEstres ?? 'bajo') as keyof typeof NIVEL_CONFIG

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <h1>
            <span className="dash-greeting">Hello, </span>
            <span className="dash-name">{user?.nombre?.split(' ')[0]}</span>
          </h1>
          {perfil?.campoEstudio && (
            <span className="dash-campo-tag">{perfil.campoEstudio}</span>
          )}
        </div>
        <button className="dash-logout" onClick={handleLogout}>Sign out</button>
      </header>

      <div className="dash-body">
        <div className="dash-welcome">
          <img src="/chatAvatar.png" alt="Yólotl" className="dash-welcome-avatar" />
          <div className="dash-welcome-text">
            <p className="dash-welcome-name">Yólotl is with you</p>
            <p className="dash-welcome-sub">I'm here to support your wellness and academic journey.</p>
          </div>
        </div>

        {sinPerfil ? (
          <div className="dash-cta-card">
            <h2>Let's get to know you</h2>
            <p>Complete the PSS-14 questionnaire to assess your stress level. It only takes a few minutes.</p>
            <button className="dash-cta-btn" onClick={() => navigate('/cuestionario')}>
              Take the questionnaire →
            </button>
          </div>
        ) : perfil ? (
          <div className="dash-metrics">
            <div className="dash-metric-card" style={{ background: NIVEL_CONFIG[cat].bg }}>
              <p className="dash-metric-title">Your stress level</p>
              <StressGauge nivel={perfil.nivelEstres} />
              <p className="dash-metric-label">{NIVEL_CONFIG[cat].label}</p>
              <p className="dash-metric-desc">{NIVEL_CONFIG[cat].desc}</p>
            </div>
            <div className="dash-metric-card" style={{ background: MOOD_CONFIG[cat].bg }}>
              <p className="dash-metric-title">Your mood</p>
              <p className="dash-metric-label">{MOOD_CONFIG[cat].label}</p>
              <p className="dash-metric-tagline">{MOOD_CONFIG[cat].tagline}</p>
              <p className="dash-metric-desc">{MOOD_CONFIG[cat].sub}</p>
            </div>
            <div className="dash-metric-card" style={{ background: ACADEMIC_CONFIG[cat].bg }}>
              <p className="dash-metric-title">Academic focus</p>
              <p className="dash-metric-label">{ACADEMIC_CONFIG[cat].label}</p>
              <p className="dash-metric-tagline">{ACADEMIC_CONFIG[cat].tagline}</p>
              <p className="dash-metric-desc">{ACADEMIC_CONFIG[cat].sub}</p>
            </div>
          </div>
        ) : null}

        <p className="dash-section-title">Quick actions</p>

        <div className="dash-actions">
          {ACCIONES.map((a) => (
            <button key={a.ruta} className="dash-action-card" onClick={() => navigate(a.ruta)}>
              <strong>{a.titulo}</strong>
              <span>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
