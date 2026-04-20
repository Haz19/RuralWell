package ss.serviciosocial.dto.response

import java.time.LocalDateTime

data class PerfilResponse(
    val nombre: String,
    val email: String,
    val campoEstudio: String?,
    val nivelEstres: Double,
    val categoriaEstres: String,
    val actualizadoEn: LocalDateTime
)
