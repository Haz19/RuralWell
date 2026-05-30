import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistorial } from '../api/cuestionario'
import type { CuestionarioResponse } from '../types/cuestionario'
import BottomNav from '../components/BottomNav'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import '../styles/historial.css'

const NIVEL_CONFIG = {
  bajo:     { label: 'Low stress',      color: 'bajo',     hex: '#0D6E52' },
  moderado: { label: 'Moderate stress', color: 'moderado', hex: '#B5600A' },
  alto:     { label: 'High stress',     color: 'alto',     hex: '#A83210' },
}

const VALOR_LABEL: Record<number, string> = {
  0: 'Never', 1: 'Almost never', 2: 'Sometimes', 3: 'Fairly often', 4: 'Very often',
}

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

const formatFechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })

// Tooltip personalizado para la gráfica
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const cfg = NIVEL_CONFIG[d.nivel as keyof typeof NIVEL_CONFIG]
  return (
    <div className="hist-chart-tooltip">
      <p className="hist-chart-tooltip-date">{label}</p>
      <p className="hist-chart-tooltip-score" style={{ color: cfg.hex }}>
        {d.puntaje}<span>/56</span>
      </p>
      <p className="hist-chart-tooltip-nivel" style={{ color: cfg.hex }}>{cfg.label}</p>
    </div>
  )
}

export default function HistorialPage() {
  const navigate = useNavigate()
  const [lista, setLista] = useState<CuestionarioResponse[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [expandido, setExpandido] = useState<number | null>(null)

  useEffect(() => {
    getHistorial()
      .then((data) => setLista(data.cuestionarios))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  // Datos para la gráfica (orden cronológico)
  const chartData = [...lista]
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map((c) => ({ fecha: formatFecha(c.fecha), puntaje: c.puntaje, nivel: c.nivel }))

  return (
    <div className="historial-page">
      <header className="historial-header">
        <h1>My history</h1>
      </header>

      <div className="historial-body">
        {cargando && (
          <div className="historial-loading">
            <div className="historial-spinner" />
            <p>Loading history...</p>
          </div>
        )}

        {error && <p className="historial-error">Could not load history.</p>}

        {!cargando && !error && lista.length === 0 && (
          <div className="historial-empty">
            <p>You haven't completed any assessment yet.</p>
            <button className="historial-cta" onClick={() => navigate('/cuestionario')}>
              Take the questionnaire →
            </button>
          </div>
        )}

        {!cargando && lista.length > 0 && (
          <>
            {/* ── Gráfica ── */}
            <div className="hist-chart-card">
              <p className="hist-chart-title">Stress over time</p>
              <p className="hist-chart-sub">PSS-14 score (0 – 56)</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="#0D6E52" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D6E52" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 11, fill: '#52525B' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 56]}
                    tick={{ fontSize: 11, fill: '#52525B' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={20} stroke="#B5600A" strokeDasharray="4 3" strokeOpacity={0.5}
                    label={{ value: 'Moderate', position: 'insideTopRight', fontSize: 10, fill: '#B5600A' }} />
                  <ReferenceLine y={26} stroke="#A83210" strokeDasharray="4 3" strokeOpacity={0.5}
                    label={{ value: 'High', position: 'insideTopRight', fontSize: 10, fill: '#A83210' }} />
                  <Area
                    type="monotone"
                    dataKey="puntaje"
                    stroke="#0D6E52"
                    strokeWidth={2.5}
                    fill="url(#stressGrad)"
                    dot={{ r: 4, fill: '#0D6E52', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#00A896', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ── Lista de evaluaciones ── */}
            <p className="historial-total">{lista.length} assessment{lista.length !== 1 ? 's' : ''}</p>
            <div className="historial-lista">
              {lista.map((c) => {
                const config = NIVEL_CONFIG[c.nivel]
                const porcentaje = Math.round((c.puntaje / 56) * 100)
                const abierto = expandido === c.id

                return (
                  <div key={c.id} className={`historial-item ${abierto ? 'historial-item--open' : ''}`}>
                    {/* Fila principal */}
                    <div
                      className="historial-row"
                      onClick={() => setExpandido(abierto ? null : c.id)}
                    >
                      <div className={`historial-badge ${config.color}`} />
                      <div className="historial-info">
                        <span className="historial-nivel">{config.label}</span>
                        <span className="historial-fecha">{formatFechaLarga(c.fecha)}</span>
                      </div>
                      <div className="historial-puntaje">
                        <span className="historial-num">{c.puntaje}</span>
                        <span className="historial-max">/56</span>
                      </div>
                      <span className={`historial-chevron ${abierto ? 'historial-chevron--up' : ''}`}>›</span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="historial-bar-track">
                      <div
                        className={`historial-bar-fill ${config.color}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    {/* Detalle expandible */}
                    {abierto && c.respuestas?.length > 0 && (
                      <div className="historial-detalle">
                        {c.respuestas.map((r, i) => (
                          <div key={r.id} className="historial-pregunta">
                            <span className="historial-pregunta-num">{i + 1}</span>
                            <div className="historial-pregunta-body">
                              <p className="historial-pregunta-texto">{r.pregunta}</p>
                              <span
                                className="historial-pregunta-resp"
                                data-valor={r.valor}
                              >
                                {VALOR_LABEL[r.valor] ?? r.respuesta}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
