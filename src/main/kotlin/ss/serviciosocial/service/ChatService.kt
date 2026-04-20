package ss.serviciosocial.service

import org.springframework.http.MediaType
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import ss.serviciosocial.config.AppProperties
import ss.serviciosocial.dto.request.ChatRequest
import ss.serviciosocial.dto.response.ChatResponse
import ss.serviciosocial.model.Cuestionario
import ss.serviciosocial.model.PerfilEstres
import ss.serviciosocial.repository.CuestionarioRepository
import ss.serviciosocial.repository.PerfilEstresRepository
import ss.serviciosocial.repository.UsuarioRepository
import tools.jackson.databind.ObjectMapper
import org.springframework.core.ParameterizedTypeReference

internal data class StreamDelta(val content: String? = null)
internal data class StreamChoice(val delta: StreamDelta = StreamDelta())
internal data class StreamChunk(val choices: List<StreamChoice> = emptyList())


@Service
class ChatService(
    private val usuarioRepository: UsuarioRepository,
    private val perfilEstresRepository: PerfilEstresRepository,
    private val cuestionarioRepository: CuestionarioRepository,
    private val appProperties: AppProperties,
    private val objectMapper: ObjectMapper
) {
    private val restClient: RestClient by lazy {
        RestClient.create(appProperties.openai.baseUrl)
    }

    private val webClient: WebClient by lazy {
        WebClient.create(appProperties.openai.baseUrl)
    }

    private val promptTemplate: String by lazy {
        javaClass.getResourceAsStream("/prompts/system-prompt.txt")!!
            .bufferedReader()
            .readText()
    }

    fun chat(usuarioId: Long, request: ChatRequest): ChatResponse {
        val (systemPrompt, body) = buildRequestParts(usuarioId, request.mensaje, stream = false)

        data class Msg(val content: String)
        data class Choice(val message: Msg)
        data class OpenAiResponse(val choices: List<Choice>)

        val response = restClient.post()
            .uri("/chat/completions")
            .header("Authorization", "Bearer ${appProperties.openai.apiKey}")
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .body(OpenAiResponse::class.java)
            ?: throw RuntimeException("Sin respuesta de OpenAI")

        return ChatResponse(respuesta = response.choices[0].message.content)
    }

    fun chatStream(usuarioId: Long, request: ChatRequest): Flux<ServerSentEvent<String>> {
        val (_, body) = buildRequestParts(usuarioId, request.mensaje, stream = true)
        val jsonBody = objectMapper.writeValueAsString(body)

        return webClient.post()
            .uri("/chat/completions")
            .header("Authorization", "Bearer ${appProperties.openai.apiKey}")
            .header("Content-Type", "application/json")
            .bodyValue(jsonBody)
            .retrieve()
            .bodyToFlux(object : ParameterizedTypeReference<ServerSentEvent<String>>() {})
            .mapNotNull { event ->
                val data = event.data() ?: return@mapNotNull null
                if (data == "[DONE]") return@mapNotNull null
                try {
                    objectMapper.readValue(data, StreamChunk::class.java)
                        .choices.firstOrNull()?.delta?.content
                } catch (e: Exception) { null }
            }
            .filter { it.isNotEmpty() }
            .map { content -> ServerSentEvent.builder(content).build() }
    }

    private fun buildRequestParts(
        usuarioId: Long,
        mensaje: String,
        stream: Boolean
    ): Pair<String, Map<String, Any>> {
        val usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow { IllegalArgumentException("Usuario no encontrado") }

        val perfil = perfilEstresRepository.findByUsuarioId(usuarioId).orElse(null)
        val ultimosCuestionarios = cuestionarioRepository
            .findAllByUsuarioIdOrderByRespondidoEnDesc(usuarioId)
            .take(3)

        val systemPrompt = buildSystemPrompt(
            nombre = usuario.nombre,
            campoEstudio = usuario.campoEstudio,
            perfil = perfil,
            ultimosCuestionarios = ultimosCuestionarios
        )

        val body: Map<String, Any> = buildMap {
            put("model", appProperties.openai.model)
            put("max_tokens", appProperties.openai.maxTokens)
            put("stream", stream)
            put("messages", listOf(
                mapOf("role" to "system", "content" to systemPrompt),
                mapOf("role" to "user", "content" to mensaje)
            ))
        }

        return Pair(systemPrompt, body)
    }

    private fun buildSystemPrompt(
        nombre: String,
        campoEstudio: String?,
        perfil: PerfilEstres?,
        ultimosCuestionarios: List<Cuestionario>
    ): String {
        val campo = campoEstudio ?: "no especificado"
        val categoria = perfil?.categoriaEstres ?: "sin evaluar"
        val nivel = perfil?.nivelEstres?.let { "%.1f".format(it) } ?: "—"

        val historial = if (ultimosCuestionarios.isEmpty()) {
            "Sin cuestionarios previos."
        } else {
            ultimosCuestionarios.joinToString("\n") { c ->
                "- ${c.respondidoEn.toLocalDate()}: puntaje ${c.puntaje}/56, nivel ${c.nivel}"
            }
        }

        val escalacion = if (categoria == "alto")
            "IMPORTANTE: El estudiante tiene estrés alto. Al final de tu respuesta incluye siempre una sugerencia amable para hablar con un psicólogo voluntario por WhatsApp u otro canal que ya conozca."
        else ""

        val respuestasDetalladas = ultimosCuestionarios.firstOrNull()
            ?.let { enriquecerRespuestas(it.respuestas, it.respondidoEn.toLocalDate().toString()) }
            ?: "Sin cuestionario respondido aún."

        return promptTemplate
            .replace("{nombre}", nombre)
            .replace("{campo}", campo)
            .replace("{nivel}", nivel)
            .replace("{categoria}", categoria)
            .replace("{historial}", historial)
            .replace("{respuestas_detalladas}", respuestasDetalladas)
            .replace("{escalacion}", escalacion)
    }

    @Suppress("UNCHECKED_CAST")
    private fun enriquecerRespuestas(respuestasJson: String?, fecha: String): String {
        if (respuestasJson == null) return "Sin datos."
        return try {
            val mapa = objectMapper.readValue(respuestasJson, Map::class.java) as Map<String, Int>
            val sb = StringBuilder("Fecha: $fecha\n")
            for (i in 1..14) {
                val valor = mapa["p$i"] ?: continue
                val respuesta = PSS14_ETIQUETAS[valor] ?: valor.toString()
                sb.appendLine("  $i (valor $valor — $respuesta): ${PSS14_PREGUNTAS[i - 1]}")
            }
            sb.toString().trimEnd()
        } catch (e: Exception) {
            "No se pudieron parsear las respuestas."
        }
    }
}
