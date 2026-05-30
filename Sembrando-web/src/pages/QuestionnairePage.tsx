import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { responderCuestionario } from '../api/cuestionario'
import { useAuth } from '../context/AuthContext'
import type { CuestionarioResponse } from '../types/cuestionario'
import '../styles/questionnaire.css'

const PREGUNTAS = [
  'In the last month, how often have you been upset because of something that happened unexpectedly?',
  'In the last month, how often have you felt unable to control the important things in your life?',
  'In the last month, how often have you felt nervous and stressed?',
  'In the last month, how often have you dealt successfully with irritating life hassles?',
  'In the last month, how often have you felt that you were effectively coping with important changes in your life?',
  'In the last month, how often have you felt confident about your ability to handle your personal problems?',
  'In the last month, how often have you felt that things were going your way?',
  'In the last month, how often have you found that you could not cope with all the things you had to do?',
  'In the last month, how often have you been able to control irritations in your life?',
  'In the last month, how often have you felt that you were on top of things?',
  'In the last month, how often have you been angered because of things that were outside of your control?',
  'In the last month, how often have you found yourself thinking about things you have to accomplish?',
  'In the last month, how often have you been able to control the way you spend your time?',
  'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
]

const OPCIONES = [
  { valor: 0, etiqueta: 'Never' },
  { valor: 1, etiqueta: 'Almost never' },
  { valor: 2, etiqueta: 'Sometimes' },
  { valor: 3, etiqueta: 'Fairly often' },
  { valor: 4, etiqueta: 'Very often' },
]

const NIVELES = {
  bajo: {
    titulo: 'Low Stress',
    descripcion: 'Your stress level is manageable. Keep up your good habits and stay balanced.',
    color: '#2E7D59',
  },
  moderado: {
    titulo: 'Moderate Stress',
    descripcion: 'You are feeling some pressure. Small changes in your routine can make a big difference.',
    color: '#F2B705',
  },
  alto: {
    titulo: 'High Stress',
    descripcion: 'Your stress level is elevated. You are not alone — we are here to support you.',
    color: '#E53935',
  },
}

const FUNCIONES = [
  { titulo: 'AI Companion', desc: 'Chat with your personal wellness companion whenever you need' },
  { titulo: 'Tracking and Transparency', desc: 'Check your stress history' },
  { titulo: 'Your Wellness Card', desc: 'Your personal card shows your wellness level and connects you to support resources' },
]

export default function QuestionnairePage() {
  const { user, perfilCompleto, completarPerfil } = useAuth()
  const navigate = useNavigate()

  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, number>>({})
  const [animando, setAnimando] = useState(false)
  const [resultado, setResultado] = useState<CuestionarioResponse | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const progreso = (indice / PREGUNTAS.length) * 100

  const responder = (valor: number) => {
    if (animando) return

    const nuevas = { ...respuestas, [`p${indice + 1}`]: valor }
    setRespuestas(nuevas)
    setAnimando(true)

    setTimeout(async () => {
      if (indice < PREGUNTAS.length - 1) {
        setIndice(indice + 1)
        setAnimando(false)
      } else {
        setEnviando(true)
        try {
          const res = await responderCuestionario(nuevas)
          completarPerfil()
          setResultado(res)
        } catch {
          setError('Could not save the questionnaire. Please try again.')
        } finally {
          setEnviando(false)
          setAnimando(false)
        }
      }
    }, 350)
  }

  if (enviando) {
    return (
      <div className="q-loading">
        <div className="q-spinner" />
        <p>Calculating your stress profile...</p>
      </div>
    )
  }

  if (resultado) {
    const nivel = NIVELES[resultado.nivel]
    return (
      <div className="q-result-page">
        <div className="q-result-card">
          <h1 style={{ color: nivel.color }}>{nivel.titulo}</h1>
          <p className="q-result-desc">{nivel.descripcion}</p>
          <div className="q-score-badge" style={{ borderColor: nivel.color, color: nivel.color }}>
            PSS-14 Score: {resultado.puntaje} / 56
          </div>

          <div className="q-divider" />

          <h2>Here's what you can do</h2>
          <div className="q-features">
            {FUNCIONES.map((f) => (
              <div key={f.titulo} className="q-feature-card">
                <strong>{f.titulo}</strong>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          {error && <p className="error">{error}</p>}

          <button className="q-cta-btn" onClick={() => navigate('/dashboard')}>
            Get Started
          </button>
        </div>
      </div>
    )
  }

  const retroceder = () => {
    if (indice === 0) {
      if (perfilCompleto) navigate('/dashboard')
      // si no tiene perfil, no puede salir — debe completar el cuestionario
    } else {
      setIndice(indice - 1)
    }
  }

  return (
    <div className="q-page">
      <div className="q-progress-bar">
        <div className="q-progress-fill" style={{ width: `${progreso}%` }} />
      </div>

      <div className="q-topbar">
        <button className="q-back-btn" onClick={retroceder} disabled={animando}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 4 5 9 11 14"/>
          </svg>
        </button>
        <div className="q-counter">{indice + 1} / {PREGUNTAS.length}</div>
        <div className="q-back-btn" style={{ visibility: 'hidden' }} />
      </div>

      <div className={`q-card ${animando ? 'q-card--saliendo' : 'q-card--entrando'}`}>
        <p className="q-intro">In the last month...</p>
        <h2 className="q-pregunta">
          {PREGUNTAS[indice].replace('In the last month, ', '')}
        </h2>

        <div className="q-opciones">
          {OPCIONES.map((op) => (
            <button
              key={op.valor}
              className="q-opcion"
              onClick={() => responder(op.valor)}
              disabled={animando}
            >
              {op.etiqueta}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
