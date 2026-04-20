package ss.serviciosocial.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import ss.serviciosocial.dto.request.CuestionarioRequest
import ss.serviciosocial.dto.response.CuestionarioResponse
import ss.serviciosocial.dto.response.HistorialResponse
import ss.serviciosocial.service.CuestionarioService

@RestController
@RequestMapping("/api/cuestionario")
class CuestionarioController(private val cuestionarioService: CuestionarioService) {

    @PostMapping("/responder")
    fun responder(@RequestBody request: CuestionarioRequest): ResponseEntity<CuestionarioResponse> {
        val usuarioId = SecurityContextHolder.getContext().authentication!!.principal as Long
        val response = cuestionarioService.responder(usuarioId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/historial")
    fun historial(): ResponseEntity<HistorialResponse> {
        val usuarioId = SecurityContextHolder.getContext().authentication!!.principal as Long
        return ResponseEntity.ok(cuestionarioService.historial(usuarioId))
    }
}
