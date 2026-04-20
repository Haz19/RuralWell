package ss.serviciosocial.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "usuarios")
class Usuario(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    var email: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false)
    var nombre: String,

    @Column(name = "campo_estudio")
    var campoEstudio: String? = null,

    // UUID único impreso en la tarjeta física para el sensor hardware
    @Column(name = "codigo_tarjeta", unique = true)
    var codigoTarjeta: String? = null,

    @Column(name = "creado_en", nullable = false, updatable = false)
    val creadoEn: LocalDateTime = LocalDateTime.now(),

    @OneToOne(mappedBy = "usuario", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var perfilEstres: PerfilEstres? = null
)
