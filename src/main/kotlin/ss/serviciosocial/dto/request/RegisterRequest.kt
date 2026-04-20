package ss.serviciosocial.dto.request

data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String,
    val campoEstudio: String? = null
)
