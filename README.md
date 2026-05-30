# RuralWell

A low-cost student wellness platform for the Global South, with an initial focus on rural Mexico. RuralWell identifies when students may be experiencing stress and provides structured support to help them manage it.

The system combines a validated stress questionnaire (PSS-14), a context-aware AI companion, and a physical student card that can be read by a low-cost hardware sensor.

---

## Architecture

```
[React Frontend]  ──REST/JSON + JWT──►  [Spring Boot API]  ──►  [PostgreSQL]
                                               │
                                               └──────────────►  [OpenAI API]

[Hardware sensor]  ──GET /api/hardware/perfil/{code}──►  [Spring Boot API]
```

### Backend endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Sign in — returns a JWT |
| POST | `/api/cuestionario/responder` | Yes | Submit PSS-14 responses |
| GET | `/api/cuestionario/historial` | Yes | Fetch assessment history |
| POST | `/api/chat/stream` | Yes | Send a message to the AI companion (SSE streaming) |
| GET | `/api/tarjeta` | Yes | Get the student's wellness card data |
| GET | `/api/perfil` | Yes | Get the authenticated user's profile |
| GET | `/api/hardware/perfil/{code}` | No | Public endpoint for the hardware sensor |

---

## Requirements

| Tool | Minimum version |
|------|----------------|
| JDK | 21 |
| Kotlin | 2.0 |
| Gradle | 8.x (wrapper included) |
| Node.js | 20 LTS |
| npm | 10 |
| PostgreSQL | 15 |

---

## Environment variables

Create a `.env` file at the project root (never committed to git):

```env
OPENAI_API_KEY=sk-...
JWT_SECRET=a-random-string-of-at-least-256-bits
DB_PASSWORD=your_postgres_password
```

The backend reads this file automatically on startup. If a variable is not defined, the default value from `application.yml` is used — `DB_PASSWORD` defaults to `postgres` for local development.

---

## Database setup

```sql
CREATE DATABASE serviciosocial;
```

Tables are created automatically by Hibernate on first run (`ddl-auto: update`).

---

## Running the backend

```bash
./gradlew bootRun
```

The API will be available at `http://localhost:8080`.

---

## Running the frontend

```bash
cd Sembrando-web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project structure

```
/                               ← Backend (Spring Boot / Kotlin)
├── src/main/kotlin/ss/serviciosocial/
│   ├── config/                 ← Security, CORS, app properties
│   ├── controller/             ← REST controllers
│   ├── service/                ← Business logic, OpenAI integration
│   ├── model/                  ← JPA entities
│   ├── repository/             ← Spring Data repositories
│   ├── security/               ← JWT filter and utilities
│   └── dto/                    ← Request / response DTOs
├── src/main/resources/
│   ├── application.yml
│   └── prompts/
│       └── system-prompt.txt   ← AI companion system prompt
└── Sembrando-web/              ← Frontend (React + Vite + TypeScript)
    └── src/
        ├── pages/              ← Login, Register, Dashboard, Chat, Card, History
        ├── components/         ← Shared UI components
        ├── styles/             ← CSS modules per page
        ├── api/                ← API client functions
        ├── context/            ← Auth context
        └── types/              ← TypeScript type definitions
```

---

## Stress assessment — PSS-14

The platform uses the **Perceived Stress Scale (PSS-14)** by Cohen, Kamarck & Mermelstein (1983), adapted for students.

- 14 items, scored 0–4 (Never → Very often)
- Items 4, 5, 6, 7, 9, 10, 13 are reverse-scored
- Score ranges: **Low** 0–19 · **Moderate** 20–25 · **High** 26–56

The stress score determines the color of the student's physical card and the tone of the AI companion's responses.

---

## AI companion

The companion is powered by GPT-4o-mini via the OpenAI API. Each request includes:

- The student's name and field of study
- Current stress level and category
- The three most recent PSS-14 results
- Detailed responses from the latest assessment

When stress is classified as **high**, the companion suggests connecting with a volunteer psychologist through a familiar channel (e.g. WhatsApp).

The system prompt is defined in `src/main/resources/prompts/system-prompt.txt` and can be updated without recompiling.