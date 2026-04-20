package ss.serviciosocial.dto.response

import java.time.LocalDateTime

data class ErrorResponse(
    val mensaje: String,
    val timestamp: LocalDateTime = LocalDateTime.now()
)
