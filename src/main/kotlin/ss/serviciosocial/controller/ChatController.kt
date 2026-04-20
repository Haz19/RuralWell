package ss.serviciosocial.controller

import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import ss.serviciosocial.dto.request.ChatRequest
import ss.serviciosocial.dto.response.ChatResponse
import ss.serviciosocial.service.ChatService

@RestController
@RequestMapping("/api/chat")
class ChatController(private val chatService: ChatService) {

    @PostMapping
    fun chat(@RequestBody request: ChatRequest): ResponseEntity<ChatResponse> {
        val usuarioId = SecurityContextHolder.getContext().authentication!!.principal as Long
        return ResponseEntity.ok(chatService.chat(usuarioId, request))
    }

    @PostMapping("/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun chatStream(@RequestBody request: ChatRequest): Flux<ServerSentEvent<String>> {
        val usuarioId = SecurityContextHolder.getContext().authentication!!.principal as Long
        return chatService.chatStream(usuarioId, request)
    }
}
