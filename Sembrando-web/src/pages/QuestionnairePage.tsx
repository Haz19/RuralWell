import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { responderCuestionario } from '../api/cuestionario'
import { useAuth } from '../context/AuthContext'
import type { CuestionarioResponse } from '../types/cuestionario'
import '../styles/questionnaire.css'

const PREGUNTAS = [
  'En el último mes, ¿con qué frecuencia te has sentido afectado por algo que ocurrió inesperadamente?',
  'En el último mes, ¿con qué frecuencia te has sentido incapaz de controlar las cosas importantes en tu vida?',
  'En el último mes, ¿con qué frecuencia te has sentido nervioso o estresado?',
  'En el último mes, ¿con qué frecuencia has manejado con éxito los pequeños problemas irritantes de la vida?',
  'En el último mes, ¿con qué frecuencia has sentido que has afrontado efectivamente los cambios importantes en tu vida?',
  'En el último mes, ¿con qué frecuencia has estado seguro sobre tu capacidad para manejar tus problemas personales?',
  'En el último mes, ¿con qué frecuencia has sentido que las cosas van bien?',
  'En el último mes, ¿con qué frecuencia has sentido que no podías afrontar todas las cosas que tenías que hacer?',
  'En el último mes, ¿con qué frecuencia has podido controlar las dificultades de tu vida?',
  'En el último mes, ¿con qué frecuencia has sentido que tenías todo bajo control?',
  'En el último mes, ¿con qué frecuencia has estado enfadado porque las cosas que te han ocurrido estaban fuera de tu control?',
  'En el último mes, ¿con qué frecuencia has pensado sobre las cosas que te faltan por hacer?',
  'En el último mes, ¿con qué frecuencia has podido controlar la forma de pasar el tiempo?',
  'En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulan tanto que no puedes superarlas?',
]

const OPCIONES = [
  { valor: 0, etiqueta: 'Nunca' },
  { valor: 1, etiqueta: 'Casi nunca' },
  { valor: 2, etiqueta: 'De vez en cuando' },
  { valor: 3, etiqueta: 'A menudo' },
  { valor: 4, etiqueta: 'Muy a menudo' },
]

const NIVELES = {
  bajo: {
    titulo: 'Estrés bajo',
    descripcion: 'Tu nivel de estrés es manejable. Sigue con tus hábitos y mantén el equilibrio.',
    color: '#16a34a',
  },
  moderado: {
    titulo: 'Estrés moderado',
    descripcion: 'Estás sintiendo algo de presión. Pequeños cambios en tu rutina pueden ayudarte mucho.',
    color: '#d97706',
  },
  alto: {
    titulo: 'Estrés alto',
    descripcion: 'Tu nivel de estrés es elevado. Estamos aquí para apoyarte — no estás solo.',
    color: '#dc2626',
  },
}

const FUNCIONES = [
  { titulo: 'Compañero de IA', desc: 'Chatea con tu agente personal de bienestar cuando lo necesites' },
  { titulo: 'Seguimiento', desc: 'Revisa tu historial de estrés y detecta patrones a lo largo del tiempo' },
  { titulo: 'Tarjeta de perfil', desc: 'Tu tarjeta digital con QR para acceder a recursos en el sistema físico' },
]

export default function QuestionnairePage() {
  const { user } = useAuth()
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
          setResultado(res)
        } catch {
          setError('No se pudo guardar el cuestionario. Intenta de nuevo.')
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
        <p>Calculando tu perfil de estrés...</p>
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
            Puntaje PSS-14: {resultado.puntaje} / 56
          </div>

          <div className="q-divider" />

          <h2>Esto es lo que puedes hacer aquí</h2>
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
            Comenzar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="q-page">
      <div className="q-progress-bar">
        <div className="q-progress-fill" style={{ width: `${progreso}%` }} />
      </div>

      <div className="q-counter">
        {indice + 1} / {PREGUNTAS.length}
      </div>

      <div className={`q-card ${animando ? 'q-card--saliendo' : 'q-card--entrando'}`}>
        <p className="q-intro">En el último mes...</p>
        <h2 className="q-pregunta">
          {PREGUNTAS[indice].replace('En el último mes, ', '')}
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

      <p className="q-nombre">Hola, {user?.nombre?.split(' ')[0]}</p>
    </div>
  )
}
