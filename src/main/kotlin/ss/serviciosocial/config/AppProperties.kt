package ss.serviciosocial.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
data class AppProperties(
    val jwt: JwtProperties = JwtProperties(),
    val openai: OpenAiProperties = OpenAiProperties(),
    val cors: CorsProperties = CorsProperties()
) {
    data class JwtProperties(
        val secret: String = "",
        val expiration: Long = 86400000
    )

    data class OpenAiProperties(
        val apiKey: String = "",
        val model: String = "gpt-4o",
        val maxTokens: Int = 1000,
        val baseUrl: String = "https://api.openai.com/v1"
    )

    data class CorsProperties(
        val allowedOrigins: String = "http://localhost:5173"
    )
}
