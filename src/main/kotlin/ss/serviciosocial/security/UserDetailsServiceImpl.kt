package ss.serviciosocial.security

import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import ss.serviciosocial.repository.UsuarioRepository

@Service
class UserDetailsServiceImpl(private val usuarioRepository: UsuarioRepository) : UserDetailsService {

    // Usado por Spring Security al autenticar con email + password
    override fun loadUserByUsername(email: String): UserDetails {
        val usuario = usuarioRepository.findByEmail(email)
            .orElseThrow { UsernameNotFoundException("Usuario no encontrado: $email") }

        return User.builder()
            .username(usuario.email)
            .password(usuario.password)
            .roles("USER")
            .build()
    }
}
