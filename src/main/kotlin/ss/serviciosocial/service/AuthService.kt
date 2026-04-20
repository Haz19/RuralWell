package ss.serviciosocial.service

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import ss.serviciosocial.dto.request.LoginRequest
import ss.serviciosocial.dto.request.RegisterRequest
import ss.serviciosocial.dto.response.AuthResponse
import ss.serviciosocial.model.Usuario
import ss.serviciosocial.repository.UsuarioRepository
import ss.serviciosocial.security.JwtUtil

@Service
class AuthService(
    private val usuarioRepository: UsuarioRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil
) {

    fun register(request: RegisterRequest): AuthResponse {
        if (usuarioRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("El correo ya está registrado")
        }

        val usuario = Usuario(
            nombre = request.nombre,
            email = request.email,
            password = passwordEncoder.encode(request.password)!!,
            campoEstudio = request.campoEstudio
        )

        val saved = usuarioRepository.save(usuario)
        val token = jwtUtil.generateToken(saved.id, saved.email)

        return AuthResponse(token = token, nombre = saved.nombre, email = saved.email)
    }

    fun login(request: LoginRequest): AuthResponse {
        val usuario = usuarioRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("Credenciales incorrectas") }

        require(passwordEncoder.matches(request.password, usuario.password)) { "Credenciales incorrectas" }

        val token = jwtUtil.generateToken(usuario.id, usuario.email)

        return AuthResponse(token = token, nombre = usuario.nombre, email = usuario.email)
    }
}
