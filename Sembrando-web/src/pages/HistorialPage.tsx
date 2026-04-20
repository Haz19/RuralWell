import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistorial } from '../api/cuestionario'
import type { CuestionarioResponse } from '../types/cuestionario'
import '../styles/historial.css'

const NIVEL_CONFIG = {
  bajo:     { label: 'Estrés bajo',     color: 'bajo' },
  moderado: { label: 'Estrés moderado', color: 'moderado' },
  alto:     { label: 'Estrés alto',     color: 'alto' },
}

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

export default function HistorialPage() {
  const navigate = useNavigate()
  const [lista, setLista] = useState<CuestionarioResponse[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getHistorial()
      .then((data) => setLista(data.cuestionarios))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="historial-page">
      <header className="historial-header">
        <button className="historial-back" onClick={() => navigate('/dashboard')}>←</button>
        <h1>Mi historial</h1>
      </header>

      <div className="historial-body">
        {cargando && (
          <div className="historial-loading">
            <div className="historial-spinner" />
            <p>Cargando historial...</p>
          </div>
        )}

        {error && (
          <p className="historial-error">No se pudo cargar el historial.</p>
        )}

        {!cargando && !error && lista.length === 0 && (
          <div className="historial-empty">
            <p>Aún no has respondido ningún cuestionario.</p>
            <button className="historial-cta" onClick={() => navigate('/cuestionario')}>
              Hacer el cuestionario →
            </button>
          </div>
        )}

        {!cargando && lista.length > 0 && (
          <>
            <p className="historial-total">{lista.length} evaluación{lista.length !== 1 ? 'es' : ''}</p>
            <div className="historial-lista">
              {lista.map((c) => {
                const config = NIVEL_CONFIG[c.nivel]
                const porcentaje = Math.round((c.puntaje / 56) * 100)
                return (
                  <div key={c.id} className="historial-item">
                    <div className={`historial-badge ${config.color}`} />
                    <div className="historial-info">
                      <span className="historial-nivel">{config.label}</span>
                      <span className="historial-fecha">{formatFecha(c.fecha)}</span>
                    </div>
                    <div className="historial-puntaje">
                      <span className="historial-num">{c.puntaje}</span>
                      <span className="historial-max">/56</span>
                    </div>
                    <div className={`historial-bar-track`}>
                      <div
                        className={`historial-bar-fill ${config.color}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
