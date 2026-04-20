# CLAUDE.md — Sembrando

## Estado actual

**Punto en progreso:** `3.2 — Endpoint público para sensor hardware`
**Fecha de inicio:** 13 abril 2026
**Última actualización:** 19 abril 2026

> Cuando termines un punto, cambia su `[ ]` a `[x]` y actualiza "Punto en progreso" al siguiente.
> Claude Code leerá este archivo en cada sesión y sabrá exactamente dónde estás.

---

## Checklist de progreso

### Semana 1 · 13–20 abril

- [x] **1.1** Definir stack y estructura del proyecto
- [ ] **1.2** Mockup básico en Figma (4 pantallas: login, cuestionario, chat, tarjeta)
- [x] **1.3** Diseño de BD y modelos de datos
- [x] **1.4** API de auth + cuestionario (`/register`, `/login`, `/questionnaire`)

### Semana 2 · 21–28 abril

- [x] **2.1** Frontend: login + registro conectado al backend
- [x] **2.2** Frontend: cuestionario de estrés conectado al backend
- [x] **2.3** Integración API OpenAI (proxy en Spring Boot + prompt)
- [x] **2.4** Frontend: módulo de chat con historial y streaming

### Semana 3 · 29 abril – 04 mayo

- [x] **3.1** Tarjeta de color por nivel de estrés (verde/amarillo/rojo, sin QR)
- [ ] **3.2** Endpoint público para sensor hardware (`GET /api/hardware/perfil/{codigo}`) ← *estás aquí*
- [ ] **3.3** Revisión general y fixes → **90% listo para el 04 mayo**

### Semana 4 · 04–13 mayo

- [ ] **4.1** Guion y grabación del video pitch (3 min)
- [ ] **4.2** Pruebas + integración hardware mock
- [ ] **4.3** Edición del video
- [ ] **4.4** Documentación técnica básica (README)
- [ ] **4.5** Subida del video — deadline 13 mayo ⚑

---

## Instrucciones para Claude Code

Cuando el usuario diga que terminó un punto o quiere pasar al siguiente:
1. Marca el punto como completado `[x]` en este archivo
2. Si terminó antes de tiempo, ofrece: recursos para estudiar más sobre lo que acaba de hacer, mejoras opcionales, o la opción de adelantar el siguiente punto
3. Actualiza "Punto en progreso" al nuevo punto
4. Recuerda siempre el deadline del 04 mayo para el 90%

Cuando el usuario llegue a un punto nuevo, explícale:
- Qué se construye en ese punto
- Cuánto tiempo tiene según el plan
- Con qué archivo o clase conviene empezar

---

## ¿Qué es este proyecto?

Sistema de apoyo de bajo costo para estudiantes en el Sur Global, con foco inicial en zonas rurales de México. El objetivo es identificar cuando un estudiante puede estar experimentando estrés y ofrecerle formas de apoyo para manejarlo mejor.

### Dos componentes principales

- **Software (este repo):** Agente de IA que actúa como compañero diario del estudiante. Interactúa mediante check-ins ligeros, conversaciones cortas y apoyo en tareas escolares y retos cotidianos. Entrega cuestionarios basados en literatura de estrés estudiantil, genera recomendaciones personalizadas (ejercicios de respiración, prompts de reflexión, journaling, organización de estudio) y, cuando el nivel de estrés es alto, orienta al estudiante hacia psicólogos voluntarios a través de canales de redes sociales que ya conoce (WhatsApp u otros).

- **Hardware (otro equipo):** Sistema físico autónomo de bajo costo. Lee la tarjeta del estudiante y sugiere material según su perfil de estrés y campo de estudio.

### Modelo de apoyo en capas

1. **IA primero** — identifica estrés y ofrece orientación inmediata con actividades de bajo impacto
2. **Humano cuando se necesita** — si el estrés es `alto` o persistente, el agente sugiere contactar a un psicólogo voluntario vía canal social conocido

### Notas de diseño para el agente (ChatService)

- El system prompt debe posicionar al agente como "compañero diario", no como un chatbot genérico
- Cuando `categoriaEstres = "alto"`, incluir en la respuesta una sugerencia de escalación con el contacto del psicólogo voluntario
- El contexto enviado a OpenAI debe incluir: nombre, campo de estudio, nivel de estrés actual y los últimos 3 cuestionarios (para detectar patrones)
- Las actividades sugeridas deben ser de bajo costo y sin requerir conectividad constante

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Kotlin + Spring Boot 3.2 |
| Base de datos | PostgreSQL |
| Frontend | React + Vite (repo separado) |
| Autenticación | Spring Security + JWT (jjwt 0.12.3) |
| Agente IA | OpenAI API (GPT-4o) vía WebClient |
| QR (tarjeta) | ZXing (Google) |

---

## Arquitectura

```
[React Frontend]
      │  REST/JSON + Bearer token
      ▼
[Spring Boot API — este proyecto]
  ├── POST /api/auth/register
  ├── POST /api/auth/login
  ├── POST /api/cuestionario/responder
  ├── GET  /api/cuestionario/historial
  ├── POST /api/chat
  ├── GET  /api/tarjeta
  ├── GET  /api/perfil
  └── GET  /api/hardware/perfil/{codigo}  ← pública, para el sensor
      │
      ▼
[PostgreSQL]
  ├── usuarios
  ├── perfiles_estres
  └── cuestionarios

[OpenAI API] ← llamado desde ChatService con el perfil del usuario como contexto
```

---

## Modelos de datos

### Usuario
- `id`, `email` (único), `password` (bcrypt), `nombre`
- `campoEstudio` — área de interés del estudiante
- `codigoTarjeta` — UUID único impreso en la tarjeta física para el sensor
- `creadoEn`

### PerfilEstres
- `id`, `usuario` (OneToOne)
- `nivelEstres` (Double 0.0–10.0), `categoriaEstres` ("bajo" / "moderado" / "alto")
- `respuestasJson` (TEXT)
- `actualizadoEn`

### Cuestionario
- `id`, `usuario` (ManyToOne)
- `puntaje` (Int 0–56, escala PSS-14), `nivel` ("bajo" / "moderado" / "alto")
- `respuestas` (TEXT — JSON con claves p1–p14, valores 0–4), `respondidoEn`

### Instrumento: PSS-14 en español (Remor & Carrobles, 2001)
- 14 ítems, escala 0–4 (0=nunca, 4=muy a menudo)
- Ítems directos: 1, 2, 3, 8, 11, 12, 14
- Ítems inversos (4 − valor): 4, 5, 6, 7, 9, 10, 13
- Umbrales: bajo 0–19 · moderado 20–25 · alto 26–56
- `nivelEstres` en PerfilEstres = (puntaje / 56.0) × 10.0
- El frontend envía `{ "p1": 2, "p2": 0, ..., "p14": 3 }`

---

## Flujo principal

1. **Registro** → usuario crea cuenta → recibe JWT
2. **Cuestionario** → responde preguntas (escala 1–5) → sistema calcula nivel y guarda `PerfilEstres`
3. **Chat** → agente OpenAI recibe el perfil como contexto en el system prompt
4. **Tarjeta** → UUID + QR en base64 → la lee el sensor hardware
5. **Hardware** → `GET /api/hardware/perfil/{codigo}` (sin JWT) → devuelve perfil completo

---

## Seguridad

- Rutas públicas (sin JWT): `/api/auth/**`, `/api/hardware/**`
- Rutas protegidas: todo lo demás requiere `Authorization: Bearer <token>`
- El `userId` siempre se extrae del JWT, nunca del body del request
- La API key de OpenAI vive en `application.yml`, nunca se expone al frontend

---

## Configuración (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/serviciosocial
    username: postgres
    password: TU_PASSWORD
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

app:
  jwt:
    secret: "clave-de-al-menos-256-bits-cambiar-en-produccion"
    expiration: 86400000
  openai:
    api-key: "sk-..."
    model: "gpt-4o"
    max-tokens: 1000
  cors:
    allowed-origins: "http://localhost:5173"
```

---

## Convenciones de código

- Controllers solo reciben/retornan DTOs — nunca exponen modelos directamente
- Services contienen toda la lógica de negocio
- `userId` siempre viene del JWT (ver `JwtUtil.extractUserId`)
- Respuestas de error con `ResponseEntity` y mensajes en español
- Comentarios de negocio en español, lógica técnica en inglés

---

## Deadlines

| Hito | Fecha |
|---|---|
| Stack + Mockup Figma | 16 abril |
| Auth + cuestionario funcionando | 20 abril |
| Frontend conectado | 24 abril |
| Chat con OpenAI funcional | 26 abril |
| Tarjeta + endpoint hardware | 01 mayo |
| **90% listo** | **04 mayo** |
| **Video pitch subido** | **13 mayo** |