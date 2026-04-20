import client from './client'
import type { ChatApiResponse } from '../types/chat'

export const enviarMensaje = (mensaje: string) =>
  client
    .post<ChatApiResponse>('/api/chat', { mensaje })
    .then((r) => r.data)