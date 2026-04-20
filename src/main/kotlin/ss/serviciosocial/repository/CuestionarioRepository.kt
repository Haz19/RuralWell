package ss.serviciosocial.repository

import org.springframework.data.jpa.repository.JpaRepository
import ss.serviciosocial.model.Cuestionario
import java.util.Optional

interface CuestionarioRepository : JpaRepository<Cuestionario, Long> {
    fun findAllByUsuarioIdOrderByRespondidoEnDesc(usuarioId: Long): List<Cuestionario>
    fun findFirstByUsuarioIdOrderByRespondidoEnDesc(usuarioId: Long): Optional<Cuestionario>
}
