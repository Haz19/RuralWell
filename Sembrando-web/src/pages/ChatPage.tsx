import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ChatMessage } from '../types/chat'
import '../styles/chat.css'

const STORAGE_KEY = 'chat_history'
const API_BASE = 'http://localhost:8080'

const SALUDO = (nombre: string) =>
  `Hi, ${nombre.split(' ')[0]}! I'm Yólotl, your wellness companion. How are you feeling today?`

const cargarHistorial = (nombre: string): ChatMessage[] => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado) {
      const parsed = JSON.parse(guardado) as ChatMessage[]
      const limpio = parsed.filter(m => m.content !== '')
      if (limpio.length > 0) return limpio
    }
  } catch {
    // historial corrupto — empieza de cero
  }
  return [{ role: 'assistant', content: SALUDO(nombre) }]
}

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [mensajes, setMensajes] = useState<ChatMessage[]>(() =>
    cargarHistorial(user?.nombre ?? 'estudiante')
  )
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!streaming) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes.filter(m => m.content !== '')))
    }
  }, [mensajes, streaming])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, streaming])

  const handleSend = async () => {
    const texto = input.trim()
    if (!texto || streaming) return

    setInput('')
    setError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Agrega el mensaje del usuario y una burbuja vacía del agente
    setMensajes(prev => [
      ...prev,
      { role: 'user', content: texto },
      { role: 'assistant', content: '' },
    ])
    setStreaming(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mensaje: texto }),
      })

      if (!response.ok) throw new Error(`Error ${response.status}`)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let acumulado = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        for (const line of chunk.split('\n')) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const contenido = trimmed.slice(5)
            if (contenido) {
              acumulado += contenido
              setMensajes(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: acumulado }
                return updated
              })
            }
          }
        }
      }
    } catch {
      setError('Could not connect to the agent. Please try again.')
      // Elimina la burbuja vacía del agente si no llegó nada
      setMensajes(prev =>
        prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev
      )
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const ultimoVacio =
    streaming && mensajes[mensajes.length - 1]?.content === ''

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="chat-back" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 4 5 9 11 14"/>
          </svg>
        </button>
        <img src="/chatAvatar.png" className="chat-header-avatar" alt="Yólotl" />
        <div>
          <h1>Yólotl</h1>
          <p>Your wellness companion</p>
        </div>
      </header>

      <div className="chat-messages">
        {mensajes.map((m, i) =>
          m.content ? (
            m.role === 'assistant' ? (
              <div key={i} className="chat-assistant-row">
                <img src="/chatAvatar.png" className="chat-avatar" alt="Yólotl" />
                <div className="chat-bubble assistant">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="chat-bubble user">{m.content}</div>
            )
          ) : null
        )}
        {ultimoVacio && (
          <div className="chat-assistant-row">
            <img src="/chatAvatar.png" className="chat-avatar" alt="Yólotl" />
            <div className="chat-typing">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          </div>
        )}
        {error && <div className="chat-error">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => { e.preventDefault(); handleSend() }}
      >
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type something..."
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={streaming}
        />
        <button className="chat-send" type="submit" disabled={!input.trim() || streaming}>
          ↑
        </button>
      </form>
    </div>
  )
}
