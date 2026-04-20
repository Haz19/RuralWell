package ss.serviciosocial.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "perfiles_estres")
class PerfilEstres(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    var usuario: Usuario,

    // Puntaje normalizado 0.0–10.0
    @Column(name = "nivel_estres", nullable = false)
    var nivelEstres: Double = 0.0,

    // "bajo", "moderado" o "alto"
    @Column(name = "categoria_estres", nullable = false)
    var categoriaEstres: String = "bajo",

    // JSON con las respuestas individuales del último cuestionario
    @Column(name = "respuestas_json", columnDefinition = "TEXT")
    var respuestasJson: String? = null,

    @Column(name = "actualizado_en", nullable = false)
    var actualizadoEn: LocalDateTime = LocalDateTime.now()
)
