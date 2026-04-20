package ss.serviciosocial.dto.response

data class AuthResponse(
    val token: String,
    val nombre: String,
    val email: String
)
