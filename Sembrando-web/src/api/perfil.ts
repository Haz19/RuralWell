import client from './client'
import type { PerfilResponse } from '../types/perfil'

export const getPerfil = () =>
  client.get<PerfilResponse>('/api/perfil').then((r) => r.data)