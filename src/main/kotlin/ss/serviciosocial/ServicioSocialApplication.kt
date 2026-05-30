package ss.serviciosocial

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import java.io.File

@SpringBootApplication
@ConfigurationPropertiesScan
class ServicioSocialApplication

fun main(args: Array<String>) {
    loadDotEnv()
    runApplication<ServicioSocialApplication>(*args)
}

private fun loadDotEnv() {
    File(".env").takeIf { it.exists() }?.forEachLine { line ->
        val trimmed = line.trim()
        if (trimmed.isBlank() || trimmed.startsWith("#")) return@forEachLine
        val idx = trimmed.indexOf('=')
        if (idx < 0) return@forEachLine
        val key = trimmed.substring(0, idx).trim()
        val value = trimmed.substring(idx + 1).trim().removeSurrounding("\"")
        if (System.getenv(key) == null) System.setProperty(key, value)
    }
}
