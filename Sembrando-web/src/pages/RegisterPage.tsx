import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { saveAuth } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    campoEstudio: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register({
        ...form,
        campoEstudio: form.campoEstudio || undefined,
      })
      saveAuth(data)
      navigate('/cuestionario')
    } catch (err: any) {
      setError(err.response?.data?.mensaje ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <form onSubmit={handleSubmit}>
          <label>Nombre completo</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <label>Correo electrónico</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <label>Campo de estudio (opcional)</label>
          <input
            type="text"
            placeholder="Ej. Ingeniería, Medicina, Derecho..."
            value={form.campoEstudio}
            onChange={(e) => setForm({ ...form, campoEstudio: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}