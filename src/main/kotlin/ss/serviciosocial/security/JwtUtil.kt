package ss.serviciosocial.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import ss.serviciosocial.config.AppProperties
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtUtil(private val appProperties: AppProperties) {

    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(appProperties.jwt.secret.toByteArray())
    }

    fun generateToken(userId: Long, email: String): String {
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + appProperties.jwt.expiration))
            .signWith(key)
            .compact()
    }

    fun extractUserId(token: String): Long = getClaims(token).subject.toLong()

    fun isValid(token: String): Boolean = try {
        getClaims(token)
        true
    } catch (e: Exception) {
        false
    }

    private fun getClaims(token: String): Claims =
        Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
}
