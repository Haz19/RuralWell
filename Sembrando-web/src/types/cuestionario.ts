export interface RespuestaDetalle {
  id: number
  pregunta: string
  valor: number
  respuesta: string
}

export interface CuestionarioResponse {
  id: number
  puntaje: number
  nivel: 'bajo' | 'moderado' | 'alto'
  fecha: string
  respuestas: RespuestaDetalle[]
}

export interface HistorialResponse {
  total: number
  cuestionarios: CuestionarioResponse[]
}
