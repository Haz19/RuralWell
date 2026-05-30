import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPerfil } from '../api/perfil'
import type { PerfilResponse } from '../types/perfil'
import BottomNav from '../components/BottomNav'
import '../styles/tarjeta.css'

const NIVEL_DESC = {
  bajo:     'Your stress level is manageable. Keep up your positive habits.',
  moderado: 'You feel some pressure. Small changes can make a big difference.',
  alto:     "Your level is elevated. Remember you're not alone — we're here to support you.",
}

export default function TarjetaPage() {
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

  if (cargando) {
    return (
      <div className="tarjeta-page">
        <div className="tarjeta-loading">
          <div className="tarjeta-spinner" />
          <p>Loading your card...</p>
        </div>
      </div>
    )
  }

  const categoria = perfil?.categoriaEstres ?? 'sin-perfil'
  const nivel = perfil?.nivelEstres?.toFixed(1) ?? '—'
  const desc = perfil ? NIVEL_DESC[perfil.categoriaEstres] : null

  return (
    <div className="tarjeta-page">
      <header className="tarjeta-header">
        <h1>My card</h1>
      </header>

      <div className="tarjeta-body">
        {sinPerfil ? (
          <>
            <div className="tarjeta-card sin-perfil">
              <div className="tarjeta-avatar-wrap">
                <img src="/tarjetaAvatar.png" alt="Avatar" className="tarjeta-avatar" />
              </div>
              <span className="tarjeta-label">RuralWell · Student Wellness</span>
              <span className="tarjeta-nombre">{perfil?.nombre ?? 'Student'}</span>
              <span className="tarjeta-categoria">Not yet evaluated</span>
            </div>
            <p className="tarjeta-desc">
              Complete the PSS-14 questionnaire to see your stress level reflected here.
            </p>
            <button className="tarjeta-btn" onClick={() => navigate('/cuestionario')}>
              Take the questionnaire
            </button>
          </>
        ) : perfil ? (
          <>
            <div className={`tarjeta-card ${categoria}`}>
              <div className="tarjeta-avatar-wrap">
                <img src="/tarjetaAvatar.png" alt="Avatar" className="tarjeta-avatar" />
              </div>
              <span className="tarjeta-label">RuralWell · Student Wellness</span>
              <span className="tarjeta-nombre">{perfil.nombre}</span>
              {perfil.campoEstudio && (
                <span className="tarjeta-campo">{perfil.campoEstudio}</span>
              )}
              <div className="tarjeta-divider" />
              <div className="tarjeta-nivel-row">
                <span className="tarjeta-nivel-num">{nivel}</span>
                <span className="tarjeta-nivel-max">/10</span>
              </div>
              <span className="tarjeta-categoria">
                {perfil.categoriaEstres.charAt(0).toUpperCase() + perfil.categoriaEstres.slice(1)} stress
              </span>
            </div>
            {desc && <p className="tarjeta-desc">{desc}</p>}
            <button className="tarjeta-btn" onClick={() => navigate('/cuestionario')}>
              Update assessment
            </button>
            <button className="tarjeta-btn tarjeta-btn-print" onClick={() => window.print()}>
              Print / Save as PDF
            </button>
          </>
        ) : null}
      </div>
      <BottomNav />
    </div>
  )
}
