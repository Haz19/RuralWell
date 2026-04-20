package ss.serviciosocial.dto.request

data class CuestionarioRequest(
    // preguntaId → valor 1–5
    val respuestas: Map<String, Int>
)
