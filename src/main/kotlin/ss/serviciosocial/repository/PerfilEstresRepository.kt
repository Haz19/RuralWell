package ss.serviciosocial.repository

import org.springframework.data.jpa.repository.JpaRepository
import ss.serviciosocial.model.PerfilEstres
import java.util.Optional

interface PerfilEstresRepository : JpaRepository<PerfilEstres, Long> {
    fun findByUsuarioId(usuarioId: Long): Optional<PerfilEstres>
}
