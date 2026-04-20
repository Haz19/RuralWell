import client from './client'
import type { CuestionarioResponse, HistorialResponse } from '../types/cuestionario'

export const responderCuestionario = (respuestas: Record<string, number>) =>
  client
    .post<CuestionarioResponse>('/api/cuestionario/responder', { respuestas })
    .then((r) => r.data)

export const getHistorial = () =>
  client
    .get<HistorialResponse>('/api/cuestionario/historial')
    .then((r) => r.data)