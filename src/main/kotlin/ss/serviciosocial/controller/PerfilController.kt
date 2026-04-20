package ss.serviciosocial.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ss.serviciosocial.dto.response.PerfilResponse
import ss.serviciosocial.service.PerfilService

@RestController
@RequestMapping("/api/perfil")
class PerfilController(private val perfilService: PerfilService) {

    @GetMapping
    fun getPerfil(): ResponseEntity<PerfilResponse> {
        val usuarioId = SecurityContextHolder.getContext().authentication!!.principal as Long
        return ResponseEntity.ok(perfilService.getPerfil(usuarioId))
    }
}
