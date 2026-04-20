package ss.serviciosocial.repository

import org.springframework.data.jpa.repository.JpaRepository
import ss.serviciosocial.model.Usuario
import java.util.Optional

interface UsuarioRepository : JpaRepository<Usuario, Long> {
    fun findByEmail(email: String): Optional<Usuario>
    fun existsByEmail(email: String): Boolean
    fun findByCodigoTarjeta(codigoTarjeta: String): Optional<Usuario>
}
