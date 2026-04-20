export interface RegisterRequest {
  nombre: string
  email: string
  password: string
  campoEstudio?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  nombre: string
  email: string
}

export interface AuthUser {
  nombre: string
  email: string
  token: string
}