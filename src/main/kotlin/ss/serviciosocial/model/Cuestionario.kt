package ss.serviciosocial.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "cuestionarios")
class Cuestionario(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    var usuario: Usuario,

    // Puntaje PSS-14: 0–56 (ítems 4,5,6,7,9,10,13 invertidos antes de sumar)
    @Column(nullable = false)
    var puntaje: Int = 0,

    // "bajo", "moderado" o "alto"
    @Column(nullable = false)
    var nivel: String = "bajo",

    // JSON con las respuestas individuales (pregunta → valor 1–5)
    @Column(columnDefinition = "TEXT")
    var respuestas: String? = null,

    @Column(name = "respondido_en", nullable = false, updatable = false)
    val respondidoEn: LocalDateTime = LocalDateTime.now()
)
