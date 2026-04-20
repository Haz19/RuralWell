import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPerfil } from '../api/perfil'
import type { PerfilResponse } from '../types/perfil'
import '../styles/tarjeta.css'

const NIVEL_DESC = {
  bajo:     'Tu nivel de estrés es manejable. Sigue con tus hábitos positivos.',
  moderado: 'Sientes algo de presión. Pequeños cambios pueden hacer una gran diferencia.',
  alto:     'Tu nivel es elevado. Recuerda que no estás solo/a, estamos aquí para apoyarte.',
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
          <p>Cargando tu tarjeta...</p>
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
        <button className="tarjeta-back" onClick={() => navigate('/dashboard')}>←</button>
        <h1>Mi tarjeta</h1>
      </header>

      <div className="tarjeta-body">
        {sinPerfil ? (
          <>
            <div className={`tarjeta-card sin-perfil`}>
              <span className="tarjeta-label">Sembrando · Bienestar estudiantil</span>
              <span className="tarjeta-nombre">{perfil?.nombre ?? 'Estudiante'}</span>
              <span className="tarjeta-categoria">Sin evaluar</span>
            </div>
            <p className="tarjeta-desc">
              Responde el cuestionario PSS-14 para ver tu nivel de estrés reflejado aquí.
            </p>
            <button className="tarjeta-btn" onClick={() => navigate('/cuestionario')}>
              Hacer el cuestionario
            </button>
          </>
        ) : perfil ? (
          <>
            <div className={`tarjeta-card ${categoria}`}>
              <span className="tarjeta-label">Sembrando · Bienestar estudiantil</span>
              <span className="tarjeta-nombre">{perfil.nombre}</span>
              {perfil.campoEstudio && (
                <span className="tarjeta-campo">{perfil.campoEstudio}</span>
              )}
              <div className="tarjeta-nivel-row">
                <span className="tarjeta-nivel-num">{nivel}</span>
                <span className="tarjeta-nivel-max">/10</span>
              </div>
              <span className="tarjeta-categoria">Estrés {perfil.categoriaEstres}</span>
            </div>
            {desc && <p className="tarjeta-desc">{desc}</p>}
            <button className="tarjeta-btn" onClick={() => navigate('/cuestionario')}>
              Actualizar evaluación
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
