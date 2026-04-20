package ss.serviciosocial.service

import org.springframework.stereotype.Service
import ss.serviciosocial.dto.response.PerfilResponse
import ss.serviciosocial.repository.PerfilEstresRepository
import ss.serviciosocial.repository.UsuarioRepository

@Service
class PerfilService(
    private val usuarioRepository: UsuarioRepository,
    private val perfilEstresRepository: PerfilEstresRepository
) {
    fun getPerfil(usuarioId: Long): PerfilResponse {
        val usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow { NoSuchElementException("Usuario no encontrado") }

        val perfil = perfilEstresRepository.findByUsuarioId(usuarioId)
            .orElseThrow { NoSuchElementException("El usuario aún no tiene perfil de estrés") }

        return PerfilResponse(
            nombre = usuario.nombre,
            email = usuario.email,
            campoEstudio = usuario.campoEstudio,
            nivelEstres = perfil.nivelEstres,
            categoriaEstres = perfil.categoriaEstres,
            actualizadoEn = perfil.actualizadoEn
        )
    }
}
