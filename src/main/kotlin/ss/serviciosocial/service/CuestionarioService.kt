package ss.serviciosocial.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ss.serviciosocial.dto.request.CuestionarioRequest
import ss.serviciosocial.dto.response.CuestionarioResponse
import ss.serviciosocial.dto.response.HistorialResponse
import ss.serviciosocial.dto.response.RespuestaDetalle
import ss.serviciosocial.model.Cuestionario
import ss.serviciosocial.model.PerfilEstres
import ss.serviciosocial.repository.CuestionarioRepository
import ss.serviciosocial.repository.PerfilEstresRepository
import ss.serviciosocial.repository.UsuarioRepository
import tools.jackson.databind.ObjectMapper
import java.time.LocalDateTime

@Service
class CuestionarioService(
    private val cuestionarioRepository: CuestionarioRepository,
    private val perfilEstresRepository: PerfilEstresRepository,
    private val usuarioRepository: UsuarioRepository,
    private val objectMapper: ObjectMapper
) {
    // PSS-14: ítems que se invierten (4 - valor) antes de sumar
    private val ITEMS_INVERSOS = setOf(4, 5, 6, 7, 9, 10, 13)
    private val NUM_PREGUNTAS = 14
    private val PUNTAJE_MAX = 56  // 14 items × 4

    @Transactional
    fun responder(usuarioId: Long, request: CuestionarioRequest): CuestionarioResponse {
        val usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow { IllegalArgumentException("Usuario no encontrado") }

        require(request.respuestas.size == NUM_PREGUNTAS) {
            "El cuestionario PSS-14 requiere exactamente $NUM_PREGUNTAS respuestas"
        }
        require(request.respuestas.values.all { it in 0..4 }) {
            "Cada respuesta debe ser un valor entre 0 y 4"
        }

        val puntaje = calcularPuntajePSS(request.respuestas)
        val nivel = calcularNivel(puntaje)
        val respuestasJson = objectMapper.writeValueAsString(request.respuestas)

        val cuestionario = cuestionarioRepository.save(
            Cuestionario(
                usuario = usuario,
                puntaje = puntaje,
                nivel = nivel,
                respuestas = respuestasJson
            )
        )

        // Crear o actualizar el perfil de estrés del usuario
        val perfil = perfilEstresRepository.findByUsuarioId(usuarioId)
            .orElse(PerfilEstres(usuario = usuario, actualizadoEn = LocalDateTime.now()))

        perfil.nivelEstres = (puntaje.toDouble() / PUNTAJE_MAX) * 10.0
        perfil.categoriaEstres = nivel
        perfil.respuestasJson = respuestasJson
        perfil.actualizadoEn = LocalDateTime.now()
        perfilEstresRepository.save(perfil)

        return cuestionario.toResponse()
    }

    fun historial(usuarioId: Long): HistorialResponse {
        val lista = cuestionarioRepository
            .findAllByUsuarioIdOrderByRespondidoEnDesc(usuarioId)
            .map { it.toResponse() }

        return HistorialResponse(total = lista.size, cuestionarios = lista)
    }

    // Aplica inversión en los ítems correspondientes según la PSS-14
    private fun calcularPuntajePSS(respuestas: Map<String, Int>): Int {
        var total = 0
        for (i in 1..NUM_PREGUNTAS) {
            val valor = respuestas["p$i"]
                ?: throw IllegalArgumentException("Falta la respuesta para la pregunta p$i")
            total += if (i in ITEMS_INVERSOS) (4 - valor) else valor
        }
        return total
    }

    // Umbrales PSS-14: bajo 0–19, moderado 20–25, alto 26–56
    private fun calcularNivel(puntaje: Int): String = when {
        puntaje <= 19 -> "bajo"
        puntaje <= 25 -> "moderado"
        else -> "alto"
    }

    @Suppress("UNCHECKED_CAST")
    private fun Cuestionario.toResponse(): CuestionarioResponse {
        val detalle = try {
            val mapa = objectMapper.readValue(respuestas ?: "{}", Map::class.java) as Map<String, Int>
            (1..14).mapNotNull { i ->
                val valor = mapa["p$i"] ?: return@mapNotNull null
                RespuestaDetalle(
                    id = i,
                    pregunta = PSS14_PREGUNTAS[i - 1],
                    valor = valor,
                    respuesta = PSS14_ETIQUETAS[valor] ?: "$valor"
                )
            }
        } catch (e: Exception) { emptyList() }

        return CuestionarioResponse(
            id = id,
            puntaje = puntaje,
            nivel = nivel,
            fecha = respondidoEn,
            respuestas = detalle
        )
    }
}
