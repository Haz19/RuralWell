export interface PerfilResponse {
  nombre: string
  email: string
  campoEstudio: string | null
  nivelEstres: number
  categoriaEstres: 'bajo' | 'moderado' | 'alto'
  actualizadoEn: string
}