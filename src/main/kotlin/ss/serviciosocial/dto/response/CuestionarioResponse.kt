package ss.serviciosocial.dto.response

import java.time.LocalDateTime

data class RespuestaDetalle(
    val id: Int,
    val pregunta: String,
    val valor: Int,
    val respuesta: String
)

data class CuestionarioResponse(
    val id: Long,
    val puntaje: Int,
    val nivel: String,
    val fecha: LocalDateTime,
    val respuestas: List<RespuestaDetalle> = emptyList()
)

data class HistorialResponse(
    val total: Int,
    val cuestionarios: List<CuestionarioResponse>
)
