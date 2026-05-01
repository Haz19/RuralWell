# RuralWell

Sistema de apoyo al bienestar estudiantil para zonas rurales del Sur Global. Combina un cuestionario de estrés PSS-14, un agente de IA (compañero + tutor académico) y una tarjeta de color por nivel de estrés que puede ser leída por hardware físico de bajo costo.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| JDK | 21 |
| Kotlin | 2.0 |
| Gradle | 8.x (wrapper incluido) |
| Node.js | 20 LTS |
| npm | 10 |
| PostgreSQL | 15 |

---

## Configuración de la base de datos

1. Crea la base de datos:
   ```sql
   CREATE DATABASE serviciosocial;
   ```
2. El usuario por defecto es `postgres` con contraseña `postgres`. Puedes cambiarlo en `src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/serviciosocial
       username: postgres
       password: TU_PASSWORD
   ```
3. Las tablas se crean automáticamente al iniciar el backend (`ddl-auto: update`).

---

## Variables que debes ajustar en `application.yml`

```yaml
app:
  jwt:
    secret: "clave-de-al-menos-256-bits-cambiar-en-produccion"
  openai:
    api-key: "sk-..."   # Tu API key de OpenAI
    model: "gpt-4o-mini"
```

---

## Echar a andar el backend

```bash
# Desde la raíz del proyecto
./gradlew bootRun
```

El servidor queda escuchando en `http://localhost:8080`.

---

## Echar a andar el frontend

```bash
cd Sembrando-web
npm install        # solo la primera vez
npm run dev
```

La app queda en `http://localhost:5173` (o 5174 si el puerto está ocupado).

---

## Estructura del proyecto

```
/                        ← Backend (Spring Boot / Kotlin)
├── src/main/kotlin/     ← Código fuente
│   └── ss/serviciosocial/
│       ├── config/      ← SecurityConfig, AppProperties
│       ├── controller/  ← Auth, Cuestionario, Chat, Tarjeta, Hardware
│       ├── service/     ← Lógica de negocio
│       ├── model/       ← Entidades JPA
│       ├── repository/  ← Spring Data JPA
│       ├── security/    ← JWT (JwtFilter, JwtUtil)
│       └── dto/         ← DTOs de request/response
├── src/main/resources/
│   ├── application.yml
│   └── prompts/
│       └── system-prompt.txt   ← Prompt del agente IA
└── Sembrando-web/              ← Frontend (React + Vite + TypeScript)
    └── src/
        ├── pages/       ← Login, Register, Cuestionario, Dashboard, Chat, Tarjeta, Historial
        ├── services/    ← Llamadas al API
        └── types/       ← Tipos TypeScript
```

---

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro de usuario |
| POST | `/api/auth/login` | No | Login → devuelve JWT |
| POST | `/api/cuestionario/responder` | Sí | Enviar respuestas PSS-14 |
| GET | `/api/cuestionario/historial` | Sí | Historial de cuestionarios |
| POST | `/api/chat` | Sí | Mensaje al agente (síncrono) |
| GET | `/api/chat/stream` | Sí | Mensaje al agente (SSE streaming) |
| GET | `/api/tarjeta` | Sí | Perfil + color de estrés |
| GET | `/api/perfil` | Sí | Datos del usuario autenticado |
| GET | `/api/hardware/perfil/{codigo}` | No | Perfil para sensor físico |
