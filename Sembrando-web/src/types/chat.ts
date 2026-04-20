export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatApiResponse {
  respuesta: string
}